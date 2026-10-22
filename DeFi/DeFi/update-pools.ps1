# Rebuilds pools-data.js from the Google Sheets HTML export in "Pools APRs".
# Run after the sheet export is updated (intended: every Monday):
#   powershell -ExecutionPolicy Bypass -File "DeFi\update-pools.ps1"

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root 'Pools APRs'
$outPath = Join-Path $root 'pools-data.js'

function Read-ByMarker([string]$marker) {
  foreach ($f in Get-ChildItem -LiteralPath $src -Filter *.html) {
    $text = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
    if ($text.Contains($marker)) { return $text }
  }
  throw "No HTML export contains marker $marker"
}

function Get-CellText([string]$td) {
  if ($td -match 'softmerge-inner[^>]*>([^<]*)') { return $Matches[1].Trim() }
  if ($td -match '>([^<]*)</td>') { return $Matches[1].Trim() }
  return ''
}

function Parse-RuNumber([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $null }
  $t = $s -replace '\s', '' -replace [char]0x00A0, '' -replace ',', '.'
  return [double]$t
}

$poolsHtml = Read-ByMarker 'id="4R1"'
$poolRows = [regex]::Matches($poolsHtml, '(?s)<tr>\s*<th id="4R(\d+)".*?</tr>')
$pools = @{}
foreach ($m in $poolRows) {
  $idx = [int]$m.Groups[1].Value
  if ($idx -lt 1) { continue }
  $tds = [regex]::Matches($m.Value, '(?s)<td[^>]*>.*?</td>')
  if ($tds.Count -lt 6) { continue }
  $id = Get-CellText $tds[0].Value
  if ($id -notmatch '^[a-z0-9-]+$') { continue }
  $pools[$id] = [ordered]@{
    id = $id
    group = Get-CellText $tds[2].Value
    platform = Get-CellText $tds[3].Value
    chain = Get-CellText $tds[4].Value
    name = Get-CellText $tds[5].Value
  }
}

$weeklyHtml = Read-ByMarker 'id="2R3"'
$header = [regex]::Match($weeklyHtml, '(?s)<th id="2R2".*?</tr>')
$headerTds = [regex]::Matches($header.Value, '(?s)<td[^>]*>.*?</td>')
$ids = @()
for ($i = 1; $i -lt $headerTds.Count; $i++) {
  $cell = Get-CellText $headerTds[$i].Value
  if ($cell -match '^[a-z0-9-]+$') { $ids += $cell }
}

$weeks = @()
$rowMatches = [regex]::Matches($weeklyHtml, '(?s)<tr>\s*<th id="2R(\d+)".*?</tr>')
foreach ($m in $rowMatches) {
  $idx = [int]$m.Groups[1].Value
  if ($idx -lt 3) { continue }
  $tds = [regex]::Matches($m.Value, '(?s)<td[^>]*>.*?</td>')
  $date = Get-CellText $tds[0].Value
  if ($date -notmatch '^\d{2}\.\d{2}\.\d{4}$') { continue }
  $values = @()
  for ($i = 1; $i -lt $tds.Count; $i++) {
    $cell = Get-CellText $tds[$i].Value
    if ([string]::IsNullOrWhiteSpace($cell)) { continue }
    $values += (Parse-RuNumber $cell)
  }
  if ($values.Count -ne $ids.Count) { throw ("Week {0}: {1} values, {2} pools" -f $date, $values.Count, $ids.Count) }
  $earned = [ordered]@{}
  for ($i = 0; $i -lt $ids.Count; $i++) { $earned[$ids[$i]] = $values[$i] }
  $weeks += [ordered]@{ start = $date; earned = $earned }
}
if ($weeks.Count -eq 0) { throw 'No weekly rows parsed' }

$position = 10000.0
$yearDays = 365.0
$open = [datetime]::ParseExact('01.01.2026', 'dd.MM.yyyy', [Globalization.CultureInfo]::InvariantCulture)

function Round2([double]$n) { return [math]::Round($n, 2, [MidpointRounding]::AwayFromZero) }

$order = @{
  ETH = @(
    'uni-eth-weth-usdc-30','uni-eth-weth-usdc-5','uni-eth-weth-usdt-30','uni-eth-weth-usdt-5',
    'uni-base-weth-usdc-5','uni-base-weth-usdc-30',
    'uni-arb-weth-usdc-5','uni-arb-weth-usdc-30',
    'aero-weth-usdc-cl100','aero-weth-usdc-cl100-u','velo-weth-usdc-cl100'
  )
  BTC = @(
    'uni-eth-wbtc-usdc-30','uni-eth-wbtc-usdc-5','uni-eth-wbtc-usdt-5','uni-eth-wbtc-usdt-30',
    'uni-base-cbbtc-usdc-5','uni-base-cbbtc-usdc-30',
    'uni-arb-wbtc-usdc-5','uni-arb-wbtc-usdc-30',
    'aero-cbbtc-usdc-cl100','aero-cbbtc-usdc-cl100-u'
  )
}

$builtGroups = @()
foreach ($key in @('ETH','BTC')) {
  $rows = @()
  foreach ($id in $order[$key]) {
    if (-not $pools.Contains($id)) { throw "Unknown pool $id" }
    $sum = 0.0
    $last = $null
    foreach ($w in $weeks) {
      $value = [double]$w.earned[$id]
      $sum += $value
      $startDt = [datetime]::ParseExact($w.start, 'dd.MM.yyyy', [Globalization.CultureInfo]::InvariantCulture)
      $endDt = $startDt.AddDays(6)
      $days = [int]($endDt - $open).TotalDays + 1
      $last = [ordered]@{
        weekApr = Round2 ($value / $position * $yearDays / 7.0 * 100.0)
        ytdApr = Round2 ($sum / $position * $yearDays / $days * 100.0)
        earned = Round2 $value
        days = $days
        end = $endDt.ToString('dd.MM.yyyy')
      }
    }
    $meta = $pools[$id]
    $badge = $null
    if ($id -like 'aero-*-cl100' -and $id -notlike '*-u') { $badge = 'AERO' }
    if ($id -like 'velo-*') { $badge = 'VELO' }
    $rows += [ordered]@{
      id = $id
      platform = $meta.platform
      chain = $meta.chain
      name = $meta.name
      badge = $badge
      weekApr = $last.weekApr
      ytdApr = $last.ytdApr
      earnedWeek = $last.earned
      days = $last.days
    }
  }
  $startDt = [datetime]::ParseExact($weeks[-1].start, 'dd.MM.yyyy', [Globalization.CultureInfo]::InvariantCulture)
  $endDt = $startDt.AddDays(6)
  $builtGroups += [ordered]@{
    key = $key
    weekFrom = $startDt.ToString('dd.MM')
    weekTo = $endDt.ToString('dd.MM')
    weekFromFull = $weeks[-1].start
    weekToFull = $endDt.ToString('dd.MM.yyyy')
    rows = $rows
  }
}

$payload = [ordered]@{
  updated = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  positionUsd = 10000
  opened = '01.01.2026'
  weeks = $weeks.Count
  groups = $builtGroups
}

$json = $payload | ConvertTo-Json -Depth 6 -Compress
$js = "window.POOLS_DATA = $json;`n"
$utf8 = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText($outPath, $js, $utf8)

Write-Output "Wrote $outPath"
Write-Output ("Weeks: {0}, pools: {1}, latest {2}" -f $weeks.Count, $pools.Count, $weeks[-1].start)
foreach ($g in $builtGroups) {
  Write-Output ("--- {0} {1}-{2} ---" -f $g.key, $g.weekFrom, $g.weekTo)
  foreach ($r in $g.rows) {
    Write-Output ("{0} | {1} | {2} | {3} | {4}" -f $r.platform, $r.chain, $r.name, $r.weekApr, $r.ytdApr)
  }
}
