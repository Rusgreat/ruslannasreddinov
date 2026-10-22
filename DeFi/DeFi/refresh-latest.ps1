# Pull pool state from Monday 00:00 UTC through now and rebuild pools-data.js.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Numerics
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root 'Pools APRs'
$outPath = Join-Path $root 'pools-data.js'
$q128 = [System.Numerics.BigInteger]::Pow(2, 128)
$two256 = [System.Numerics.BigInteger]::Pow(2, 256)
$position = 10000.0
$year = 365.0

function Read-ByMarker([string]$marker) {
  foreach ($f in Get-ChildItem -LiteralPath $src -Filter *.html) {
    $text = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
    if ($text.Contains($marker)) { return $text }
  }
  throw "Missing export $marker"
}
function Cell([string]$td) {
  if ($td -match 'softmerge-inner[^>]*>([^<]*)') { return $Matches[1].Trim() }
  if ($td -match '>([^<]*)</td>') { return $Matches[1].Trim() }
  return ''
}
function Num([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return 0.0 }
  $t = $s -replace '\s','' -replace [char]0x00A0,'' -replace ',','.'
  return [double]$t
}
function RowCells([string]$row) {
  $out = @()
  foreach ($td in [regex]::Matches($row, '(?s)<td[^>]*>.*?</td>')) { $out += (Cell $td.Value) }
  return ,$out
}
function SubMod($a, $b) {
  $d = $a - $b
  if ($d -lt [System.Numerics.BigInteger]::Zero) { $d += $script:two256 }
  return $d
}
function Word([string]$hex, [int]$i) {
  return [System.Numerics.BigInteger]::Parse(('0' + $hex.Substring(2 + $i * 64, 64)), 'AllowHexSpecifier')
}
function Signed24($w) {
  $mod = [System.Numerics.BigInteger]16777216
  $v = [System.Numerics.BigInteger]::Remainder($w, $mod)
  if ($v -lt [System.Numerics.BigInteger]::Zero) { $v += $mod }
  if ($v -ge 8388608) { $v -= $mod }
  return [int]$v
}
function TickCall([int]$tick) {
  $bi = [System.Numerics.BigInteger]$tick
  if ($bi -lt [System.Numerics.BigInteger]::Zero) { $bi += $script:two256 }
  $hex = $bi.ToString('x')
  if ($hex.Length -gt 64) { $hex = $hex.Substring($hex.Length - 64) }
  return '0xf30dba93' + $hex.PadLeft(64, '0')
}
function Rpc($urls, $method, $paramsJson) {
  $body = '{"jsonrpc":"2.0","id":1,"method":"' + $method + '","params":' + $paramsJson + '}'
  $err = ''
  for ($try = 0; $try -lt 8; $try++) {
    foreach ($u in $urls) {
      try {
        $r = Invoke-RestMethod -Uri $u -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 40
        if ($r.error) {
          $err = $u + ' ' + [string]$r.error.message
          if ($err -match '429|Too Many|rate|historical|Unknown state|unsupported block|not available') { continue }
          throw $err
        }
        Start-Sleep -Milliseconds 200
        return $r.result
      } catch {
        $err = $u + ' ' + $_.Exception.Message
        if ($err -notmatch '429|Too Many|timed out|timeout|Unable to connect|connection|400|502|503|504') { throw $err }
      }
    }
    Start-Sleep -Seconds (4 + $try * 3)
  }
  throw $err
}
function CallAt($urls, $to, $data, $block) {
  $tag = if ($block -eq 'latest') { 'latest' } else { '0x' + ([System.Numerics.BigInteger]$block).ToString('x') }
  $params = '[{"to":"' + $to + '","data":"' + $data + '"},"' + $tag + '"]'
  return Rpc $urls 'eth_call' $params
}
function HumanPrice($sqrt, $dec0, $dec1, $vol0) {
  $sq = [double]($sqrt * $sqrt)
  $den = [double]([System.Numerics.BigInteger]::Pow(2, 192))
  $raw = $sq / $den
  if ($vol0) { return $raw * [math]::Pow(10, ($dec0 - $dec1)) }
  return [math]::Pow(10, ($dec1 - $dec0)) / $raw
}
function InsideGrowth($urls, $pool, $block, $lo, $hi, $slip) {
  $slot = CallAt $urls $pool '0x3850c7bd' $block
  $tick = Signed24 (Word $slot 1)
  $sqrt = Word $slot 0
  $g0 = Word (CallAt $urls $pool '0xf3058399' $block) 0
  $g1 = Word (CallAt $urls $pool '0x46141319' $block) 0
  $lower = CallAt $urls $pool (TickCall $lo) $block
  $upper = CallAt $urls $pool (TickCall $hi) $block
  $fee0i = $(if ($slip) { 3 } else { 2 })
  $fee1i = $fee0i + 1
  $lo0 = Word $lower $fee0i; $lo1 = Word $lower $fee1i
  $up0 = Word $upper $fee0i; $up1 = Word $upper $fee1i
  if ($tick -ge $lo) { $b0 = $lo0; $b1 = $lo1 } else { $b0 = SubMod $g0 $lo0; $b1 = SubMod $g1 $lo1 }
  if ($tick -lt $hi) { $a0 = $up0; $a1 = $up1 } else { $a0 = SubMod $g0 $up0; $a1 = SubMod $g1 $up1 }
  $i0 = SubMod (SubMod $g0 $b0) $a0
  $i1 = SubMod (SubMod $g1 $b1) $a1
  $reward = $null
  if ($slip) {
    $stored = Word (CallAt $urls $pool '0x57806ada' $block) 0
    $rate = Word (CallAt $urls $pool '0x7b0a47ee' $block) 0
    $reserve = Word (CallAt $urls $pool '0xcab64bcd' $block) 0
    $staked = Word (CallAt $urls $pool '0x3ab04b20' $block) 0
    $updated = Word (CallAt $urls $pool '0xd0b06f5d' $block) 0
    $blk = Rpc $urls 'eth_getBlockByNumber' ('["0x' + ([System.Numerics.BigInteger]$block).ToString('x') + '",false]')
    $ts = [System.Numerics.BigInteger]::Parse(('0' + $blk.timestamp.Substring(2)), 'AllowHexSpecifier')
    $global = $stored
    if ($ts -gt $updated -and $reserve -gt [System.Numerics.BigInteger]::Zero -and $staked -gt [System.Numerics.BigInteger]::Zero) {
      $rewardAmt = $rate * ($ts - $updated)
      if ($rewardAmt -gt $reserve) { $rewardAmt = $reserve }
      $global = $stored + (($rewardAmt * $script:q128) / $staked)
    }
    $orL = Word $lower 5; $orU = Word $upper 5
    if ($tick -ge $lo) { $rb = $orL } else { $rb = SubMod $global $orL }
    if ($tick -lt $hi) { $ra = $orU } else { $ra = SubMod $global $orU }
    $reward = SubMod (SubMod $global $rb) $ra
  }
  return @{ i0 = $i0; i1 = $i1; reward = $reward; sqrt = $sqrt; tick = $tick }
}

$poolsHtml = Read-ByMarker 'id="4R1"'
$pools = @{}
foreach ($m in [regex]::Matches($poolsHtml, '(?s)<tr>\s*<th id="4R(\d+)".*?</tr>')) {
  if ([int]$m.Groups[1].Value -lt 1) { continue }
  $c = RowCells $m.Value
  if ($c.Count -lt 23) { continue }
  if ($c[0] -notmatch '^[a-z0-9-]+$') { continue }
  $pools[$c[0]] = [ordered]@{
    id = $c[0]; platform = $c[3]; chain = $c[4]; name = $c[5]; address = $c[7].ToLower()
    dec0 = [int](Num $c[10]); dec1 = [int](Num $c[11]); vol0 = ($c[12].Length -gt 4)
    L = [System.Numerics.BigInteger][math]::Round((Num $c[22]))
  }
}

$dataHtml = Read-ByMarker 'id="3C0"'
$ticks = @{}
foreach ($m in [regex]::Matches($dataHtml, '(?s)<tr>\s*<th id="3R\d+".*?</tr>')) {
  $c = RowCells $m.Value
  if ($c.Count -lt 9) { continue }
  if ($c[3] -notmatch '^[a-z0-9-]+$') { continue }
  $ticks[$c[3]] = @{ lo = [int](Num $c[7]); hi = [int](Num $c[8]) }
}

$weeklyHtml = Read-ByMarker 'id="2R3"'
$header = [regex]::Match($weeklyHtml, '(?s)<th id="2R2".*?</tr>')
$ids = @()
foreach ($td in [regex]::Matches($header.Value, '(?s)<td[^>]*>.*?</td>')) {
  $cell = Cell $td.Value
  if ($cell -match '^[a-z0-9-]+$') { $ids += $cell }
}
$hist = @{}; foreach ($id in $ids) { $hist[$id] = 0.0 }
foreach ($m in [regex]::Matches($weeklyHtml, '(?s)<tr>\s*<th id="2R(\d+)".*?</tr>')) {
  if ([int]$m.Groups[1].Value -lt 3) { continue }
  $c = RowCells $m.Value
  if ($c[0] -notmatch '^\d{2}\.\d{2}\.\d{4}$') { continue }
  $vals = @()
  for ($i = 1; $i -lt $c.Count; $i++) { if (-not [string]::IsNullOrWhiteSpace($c[$i])) { $vals += (Num $c[$i]) } }
  if ($vals.Count -ne $ids.Count) { throw "weekly width $($vals.Count)" }
  for ($i = 0; $i -lt $ids.Count; $i++) { $hist[$ids[$i]] += $vals[$i] }
}

$rpc = @{
  Ethereum = @('https://eth.drpc.org')
  Base = @('https://base.drpc.org')
  Arbitrum = @(
    'https://arbitrum-one.public.blastapi.io',
    'https://rpc.swiftnodes.io/rpc/arbitrum',
    'https://arbitrum-one-public.nodies.app',
    'https://rpc-arbitrum.blockmachine.io'
  )
  Optimism = @(
    'https://optimism.drpc.org',
    'https://mainnet.optimism.io',
    'https://optimism.gateway.tenderly.co'
  )
}
$llama = @{ Ethereum = 'ethereum'; Base = 'base'; Arbitrum = 'arbitrum'; Optimism = 'optimism' }
$startTs = [DateTimeOffset]::new(2026,10,19,0,0,0,[TimeSpan]::Zero).ToUnixTimeSeconds()
$endTs = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$openTs = [DateTimeOffset]::new(2026,1,1,0,0,0,[TimeSpan]::Zero).ToUnixTimeSeconds()
$blocks = @{}
$endTs = 0L
foreach ($chain in $rpc.Keys) {
  $sb = Invoke-RestMethod "https://coins.llama.fi/block/$($llama[$chain])/$startTs"
  $hex = Rpc $rpc[$chain] 'eth_blockNumber' '[]'
  $end = [int64]([System.Numerics.BigInteger]::Parse(('0' + $hex.Substring(2)), 'AllowHexSpecifier'))
  $blk = Rpc $rpc[$chain] 'eth_getBlockByNumber' ('["0x' + $end.ToString('x') + '",false]')
  $ts = [int64]([System.Numerics.BigInteger]::Parse(('0' + $blk.timestamp.Substring(2)), 'AllowHexSpecifier'))
  if ($endTs -eq 0 -or $ts -lt $endTs) { $endTs = $ts }
  $blocks[$chain] = @{ start = [int64]$sb.height; end = $end; ts = $ts }
  Write-Output ("{0} blocks {1} -> {2}" -f $chain, $blocks[$chain].start, $blocks[$chain].end)
}
$price = Invoke-RestMethod "https://coins.llama.fi/prices/current/base:0x940181a94A35A4569E4529A3CDfB74e38FD98631,optimism:0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db"
$aeroPx = [double]$price.coins.'base:0x940181a94A35A4569E4529A3CDfB74e38FD98631'.price
$veloPx = [double]$price.coins.'optimism:0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db'.price
Write-Output ("AERO {0}  VELO {1}" -f $aeroPx, $veloPx)

$cache = @{}
function Snapshot($meta, $block) {
  $key = $meta.chain + '|' + $meta.address + '|' + $block
  if ($script:cache.Contains($key)) { return $script:cache[$key] }
  $slip = $meta.platform -ne 'Uniswap'
  $tk = $script:ticks[$meta.id]
  $snap = InsideGrowth $script:rpc[$meta.chain] $meta.address $block $tk.lo $tk.hi $slip
  $script:cache[$key] = $snap
  return $snap
}
function Earned($meta, $blockStart, $blockEnd, $rewardPx) {
  $a = Snapshot $meta $blockStart
  $b = Snapshot $meta $blockEnd
  $priceUsd = HumanPrice $b.sqrt $meta.dec0 $meta.dec1 $meta.vol0
  $stake = ($meta.id -like 'aero-*-cl100' -and $meta.id -notlike '*-u') -or ($meta.id -like 'velo-*')
  if ($stake) {
    $d = SubMod $b.reward $a.reward
    $tokens = [double](($meta.L * $d) / $script:q128) / 1e18
    return @{ usd = $tokens * $rewardPx; px = $priceUsd; tokens = $tokens }
  }
  $d0 = SubMod $b.i0 $a.i0
  $d1 = SubMod $b.i1 $a.i1
  $t0 = [double](($meta.L * $d0) / $script:q128) / [math]::Pow(10, $meta.dec0)
  $t1 = [double](($meta.L * $d1) / $script:q128) / [math]::Pow(10, $meta.dec1)
  $p0 = $(if ($meta.vol0) { $priceUsd } else { 1.0 })
  $p1 = $(if ($meta.vol0) { 1.0 } else { $priceUsd })
  return @{ usd = ($t0 * $p0) + ($t1 * $p1); px = $priceUsd; tokens = 0 }
}

$cacheFile = Join-Path $root 'refresh-cache.json'
$saved = @{}
if (Test-Path -LiteralPath $cacheFile) {
  $prev = Get-Content -LiteralPath $cacheFile -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($p in $prev.PSObject.Properties) { $saved[$p.Name] = [double]$p.Value }
}
$fresh = @{}
foreach ($id in $pools.Keys) {
  $meta = $pools[$id]
  if ($saved.Contains($id)) {
    $fresh[$id] = [double]$saved[$id]
    Write-Output ("cache {0}  {1:N2} USD" -f $id, $fresh[$id])
    continue
  }
  Write-Output ("fetch {0}" -f $id)
  $px = $(if ($meta.platform -eq 'Velodrome') { $veloPx } else { $aeroPx })
  $b = $blocks[$meta.chain]
  $got = Earned $meta $b.start $b.end $px
  $fresh[$id] = $got.usd
  $saved[$id] = $got.usd
  [IO.File]::WriteAllText($cacheFile, ($saved | ConvertTo-Json -Compress), (New-Object System.Text.UTF8Encoding $false))
  Write-Output ("{0}  {1:N2} USD  px={2:N2}" -f $id, $got.usd, $got.px)
}

$periodDays = ($endTs - $startTs) / 86400.0
$ytdDays = ($endTs - $openTs) / 86400.0
function Round2([double]$n) { return [math]::Round($n, 2, [MidpointRounding]::AwayFromZero) }
$order = @{
  ETH = @('uni-eth-weth-usdc-30','uni-eth-weth-usdc-5','uni-eth-weth-usdt-30','uni-eth-weth-usdt-5','uni-base-weth-usdc-5','uni-base-weth-usdc-30','uni-arb-weth-usdc-5','uni-arb-weth-usdc-30','aero-weth-usdc-cl100','aero-weth-usdc-cl100-u','velo-weth-usdc-cl100')
  BTC = @('uni-eth-wbtc-usdc-30','uni-eth-wbtc-usdc-5','uni-eth-wbtc-usdt-5','uni-eth-wbtc-usdt-30','uni-base-cbbtc-usdc-5','uni-base-cbbtc-usdc-30','uni-arb-wbtc-usdc-5','uni-arb-wbtc-usdc-30','aero-cbbtc-usdc-cl100','aero-cbbtc-usdc-cl100-u')
}
$startDt = [DateTimeOffset]::FromUnixTimeSeconds($startTs).UtcDateTime
$endDt = [DateTimeOffset]::FromUnixTimeSeconds($endTs).UtcDateTime
$groups = @()
foreach ($key in @('ETH','BTC')) {
  $rows = @()
  foreach ($id in $order[$key]) {
    $meta = $pools[$id]
    $earned = [double]$fresh[$id]
    $total = [double]$hist[$id] + $earned
    $badge = $null
    if ($id -like 'aero-*-cl100' -and $id -notlike '*-u') { $badge = 'AERO' }
    if ($id -like 'velo-*') { $badge = 'VELO' }
    $rows += [ordered]@{
      id = $id; platform = $meta.platform; chain = $meta.chain; name = $meta.name; badge = $badge
      weekApr = Round2 ($earned / $position * $year / $periodDays * 100.0)
      ytdApr = Round2 ($total / $position * $year / $ytdDays * 100.0)
      earnedWeek = Round2 $earned
      days = [math]::Round($ytdDays, 2)
    }
  }
  $groups += [ordered]@{
    key = $key
    weekFrom = $startDt.ToString('dd.MM')
    weekTo = $endDt.ToString('dd.MM')
    weekFromFull = $startDt.ToString('dd.MM.yyyy')
    weekToFull = $endDt.ToString('dd.MM.yyyy HH:mm') + ' UTC'
    partial = $true
    periodDays = [math]::Round($periodDays, 2)
    rows = $rows
  }
}
$payload = [ordered]@{
  updated = [DateTimeOffset]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
  positionUsd = 10000
  opened = '01.01.2026'
  weeks = 43
  groups = $groups
}
$json = $payload | ConvertTo-Json -Depth 6 -Compress
[IO.File]::WriteAllText($outPath, "window.POOLS_DATA = $json;`n", (New-Object System.Text.UTF8Encoding $false))
if (Test-Path -LiteralPath $cacheFile) { Remove-Item -LiteralPath $cacheFile -Force }
Write-Output "Wrote $outPath"
Write-Output ("window {0:N2} days, ytd {1:N2} days" -f $periodDays, $ytdDays)
