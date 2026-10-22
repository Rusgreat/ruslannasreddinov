# Pull Revert positions for the liquidity-tab pools and write positions-data.js
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$outPath = Join-Path $root 'positions-data.js'

$pools = @(
  @{ id='uni-eth-weth-usdc-30'; asset='ETH'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='ETH/USDC 0.30%'; address='0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'; dec0=6; dec1=18; vol0=$false },
  @{ id='uni-eth-weth-usdc-5'; asset='ETH'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='ETH/USDC 0.05%'; address='0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'; dec0=6; dec1=18; vol0=$false },
  @{ id='uni-eth-weth-usdt-30'; asset='ETH'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='ETH/USDT 0.30%'; address='0x4e68ccd3e89f51c3074ca5072bbac773960dfa36'; dec0=18; dec1=6; vol0=$true },
  @{ id='uni-eth-weth-usdt-5'; asset='ETH'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='ETH/USDT 0.05%'; address='0x11b815efb8f581194ae79006d24e0d814b7697f6'; dec0=18; dec1=6; vol0=$true },
  @{ id='uni-base-weth-usdc-5'; asset='ETH'; chain='Base'; network='base'; platform='Uniswap'; name='ETH/USDC 0.05%'; address='0xd0b53d9277642d899df5c87a3966a349a798f224'; dec0=18; dec1=6; vol0=$true },
  @{ id='uni-base-weth-usdc-30'; asset='ETH'; chain='Base'; network='base'; platform='Uniswap'; name='ETH/USDC 0.30%'; address='0x6c561b446416e1a00e8e93e221854d6ea4171372'; dec0=18; dec1=6; vol0=$true },
  @{ id='uni-arb-weth-usdc-5'; asset='ETH'; chain='Arbitrum'; network='arbitrum'; platform='Uniswap'; name='ETH/USDC 0.05%'; address='0xc6962004f452be9203591991d15f6b388e09e8d0'; dec0=18; dec1=6; vol0=$true },
  @{ id='uni-arb-weth-usdc-30'; asset='ETH'; chain='Arbitrum'; network='arbitrum'; platform='Uniswap'; name='ETH/USDC 0.30%'; address='0xc473e2aee3441bf9240be85eb122abb059a3b57c'; dec0=18; dec1=6; vol0=$true },
  @{ id='aero-weth-usdc-cl100'; asset='ETH'; chain='Base'; network='base'; platform='Aerodrome'; name='ETH/USDC CL100'; address='0xb2cc224c1c9fee385f8ad6a55b4d94e92359dc59'; dec0=18; dec1=6; vol0=$true },
  @{ id='velo-weth-usdc-cl100'; asset='ETH'; chain='Optimism'; network='optimism'; platform='Velodrome'; name='ETH/USDC CL100'; address='0x478946bcd4a5a22b316470f5486fafb928c0ba25'; dec0=6; dec1=18; vol0=$false },
  @{ id='uni-eth-wbtc-usdc-30'; asset='BTC'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='WBTC/USDC 0.30%'; address='0x99ac8ca7087fa4a2a1fb6357269965a2014abc35'; dec0=8; dec1=6; vol0=$true },
  @{ id='uni-eth-wbtc-usdc-5'; asset='BTC'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='WBTC/USDC 0.05%'; address='0x9a772018fbd77fcd2d25657e5c547baff3fd7d16'; dec0=8; dec1=6; vol0=$true },
  @{ id='uni-eth-wbtc-usdt-5'; asset='BTC'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='WBTC/USDT 0.05%'; address='0x56534741cd8b152df6d48adf7ac51f75169a83b2'; dec0=8; dec1=6; vol0=$true },
  @{ id='uni-eth-wbtc-usdt-30'; asset='BTC'; chain='Ethereum'; network='mainnet'; platform='Uniswap'; name='WBTC/USDT 0.30%'; address='0x9db9e0e53058c89e5b94e29621a205198648425b'; dec0=8; dec1=6; vol0=$true },
  @{ id='uni-base-cbbtc-usdc-5'; asset='BTC'; chain='Base'; network='base'; platform='Uniswap'; name='cbBTC/USDC 0.05%'; address='0xfbb6eed8e7aa03b138556eedaf5d271a5e1e43ef'; dec0=6; dec1=8; vol0=$false },
  @{ id='uni-base-cbbtc-usdc-30'; asset='BTC'; chain='Base'; network='base'; platform='Uniswap'; name='cbBTC/USDC 0.30%'; address='0xec558e484cc9f2210714e345298fdc53b253c27d'; dec0=6; dec1=8; vol0=$false },
  @{ id='uni-arb-wbtc-usdc-5'; asset='BTC'; chain='Arbitrum'; network='arbitrum'; platform='Uniswap'; name='WBTC/USDC 0.05%'; address='0x0e4831319a50228b9e450861297ab92dee15b44f'; dec0=8; dec1=6; vol0=$true },
  @{ id='uni-arb-wbtc-usdc-30'; asset='BTC'; chain='Arbitrum'; network='arbitrum'; platform='Uniswap'; name='WBTC/USDC 0.30%'; address='0x6985cb98ce393fce8d6272127f39013f61e36166'; dec0=8; dec1=6; vol0=$true },
  @{ id='aero-cbbtc-usdc-cl100'; asset='BTC'; chain='Base'; network='base'; platform='Aerodrome'; name='cbBTC/USDC CL100'; address='0x4e962bb3889bf030368f56810a9c96b83cb3e778'; dec0=6; dec1=8; vol0=$false }
)

function PriceAtTick([int]$tick, [int]$dec0, [int]$dec1, [bool]$vol0) {
  $ln = [double]$tick * [math]::Log(1.0001)
  if ($ln -gt 80) { $ln = 80 }
  if ($ln -lt -80) { $ln = -80 }
  $raw = [math]::Exp($ln)
  if ($raw -le 0) { return 0 }
  if ($vol0) { return $raw * [math]::Pow(10, ($dec0 - $dec1)) }
  return [math]::Pow(10, ($dec1 - $dec0)) / $raw
}
function Num($v) {
  if ($null -eq $v) { return $null }
  $s = [string]$v
  if ([string]::IsNullOrWhiteSpace($s)) { return $null }
  $n = 0.0
  if ([double]::TryParse($s, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$n)) { return $n }
  return $null
}
function Get-Positions($pool, $extra) {
  $url = 'https://api.revert.finance/v1/positions?limit=80&no-withdrawals=true&pool=' + $pool.address + '&network=' + $pool.network + '&' + $extra
  $r = Invoke-RestMethod -Uri $url -TimeoutSec 50
  Start-Sleep -Milliseconds 200
  if (-not $r.data) { return @() }
  return @($r.data)
}

$llama = Invoke-RestMethod 'https://coins.llama.fi/prices/current/coingecko:ethereum,coingecko:bitcoin'
$spotEth = [double]$llama.coins.'coingecko:ethereum'.price
$spotBtc = [double]$llama.coins.'coingecko:bitcoin'.price
Write-Output ("spot ETH {0:N2} BTC {1:N2}" -f $spotEth, $spotBtc)

$seen = @{}
$rows = New-Object System.Collections.Generic.List[object]
foreach ($pool in $pools) {
  $spot = $(if ($pool.asset -eq 'ETH') { $spotEth } else { $spotBtc })
  $batch = @()
  try {
    $batch += Get-Positions $pool 'in-range=true&sort=underlying_value&desc=true&underlying-value-from=5000'
    $batch += Get-Positions $pool 'in-range=true&sort=fee_apr&desc=true&underlying-value-from=5000'
    $batch += Get-Positions $pool 'sort=underlying_value&desc=true&underlying-value-from=20000'
  } catch {
    Write-Output ("FAIL {0} {1}" -f $pool.id, $_.Exception.Message)
    continue
  }
  $vol0 = [bool]$pool.vol0
  $inRange = @($batch | Where-Object { $_.in_range -eq $true })
  if ($inRange.Count -ge 4) {
    $hit = 0
    foreach ($p in $inRange) {
      $a = PriceAtTick ([int]$p.tick_lower) $pool.dec0 $pool.dec1 $vol0
      $b = PriceAtTick ([int]$p.tick_upper) $pool.dec0 $pool.dec1 $vol0
      $lo = [math]::Min($a, $b); $hi = [math]::Max($a, $b)
      if ($spot -ge $lo -and $spot -le $hi) { $hit++ }
    }
    if ($hit * 2 -lt $inRange.Count) { $vol0 = -not $vol0 }
  }
  $added = 0
  foreach ($p in $batch) {
    $key = $pool.network + '|' + [string]$p.exchange + '|' + [string]$p.nft_id
    if ($seen.ContainsKey($key)) { continue }
    $value = Num $p.underlying_value
    if ($null -eq $value -or $value -lt 5000 -or $value -gt 500000000) { continue }
    $a = PriceAtTick ([int]$p.tick_lower) $pool.dec0 $pool.dec1 $vol0
    $b = PriceAtTick ([int]$p.tick_upper) $pool.dec0 $pool.dec1 $vol0
    $lo = [math]::Min($a, $b); $hi = [math]::Max($a, $b)
    if ($lo -le 0 -or $hi -le 0 -or [double]::IsInfinity($lo) -or [double]::IsInfinity($hi)) { continue }
    $full = ($lo -lt ($spot * 0.05) -and $hi -gt ($spot * 20)) -or (($hi / $lo) -gt 30)
    $width = $null
    if (-not $full -and ($lo + $hi) -gt 0) { $width = (($hi - $lo) / (($hi + $lo) / 2.0)) * 100.0 }
    $fee = $null
    if ($p.performance -and $p.performance.hodl) { $fee = Num $p.performance.hodl.fee_apr }
    $owner = ([string]$p.real_owner).ToLower()
    $ex = [string]$p.exchange
    $path = switch ($ex) {
      'uniswapv3' { 'uniswap-position' }
      'uniswapv4' { 'uniswapv4-position' }
      'aerodrome' { 'aerodrome-position' }
      'aerodromev2' { 'aerodromev2-position' }
      'aerodromev3' { 'aerodromev3-position' }
      'velodrome' { 'velodrome-position' }
      'pancakeswapv3' { 'pancake-position' }
      default { $null }
    }
    $revert = $null
    if ($path) { $revert = 'https://revert.finance/#/' + $path + '/' + $pool.network + '/' + [string]$p.nft_id }
    $debank = $null
    if ($owner -match '^0x[0-9a-f]{40}$') { $debank = 'https://debank.com/profile/' + $owner }
    $seen[$key] = $true
    $rows.Add([ordered]@{
      key = $key
      poolId = $pool.id
      asset = $pool.asset
      chain = $pool.chain
      network = $pool.network
      platform = $pool.platform
      exchange = $ex
      pair = $pool.name
      feeTier = [int]$p.fee_tier
      lower = [math]::Round($lo, 2)
      upper = [math]::Round($hi, 2)
      width = $(if ($null -eq $width) { $null } else { [math]::Round($width, 1) })
      fullRange = [bool]$full
      value = [math]::Round($value, 2)
      feeApr = $(if ($null -eq $fee) { $null } else { [math]::Round($fee, 2) })
      ageDays = [math]::Round((Num $p.age), 3)
      inRange = [bool]($p.in_range -eq $true)
      nft = [string]$p.nft_id
      owner = $owner
      revertUrl = $revert
      debankUrl = $debank
    }) | Out-Null
    $added++
  }
  Write-Output ("{0} positions {1}" -f $pool.id, $added)
}

$poolMeta = @()
foreach ($pool in $pools) {
  $poolMeta += [pscustomobject]@{ id=$pool.id; asset=$pool.asset; chain=$pool.chain; platform=$pool.platform; name=$pool.name; address=$pool.address }
}
$payload = [pscustomobject]@{
  updated = [DateTimeOffset]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
  spot = [pscustomobject]@{ ETH = [math]::Round($spotEth, 2); BTC = [math]::Round($spotBtc, 2) }
  source = 'https://api.revert.finance/v1/positions'
  minValue = 5000
  pools = $poolMeta
  positions = $rows.ToArray()
}
$json = $payload | ConvertTo-Json -Depth 5 -Compress
[IO.File]::WriteAllText($outPath, "window.REVERT_RANGES = $json;`n", (New-Object System.Text.UTF8Encoding $false))
Write-Output ("wrote {0} positions" -f $rows.Count)
