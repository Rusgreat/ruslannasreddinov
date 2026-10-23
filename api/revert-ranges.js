var pools = [
  { id: 'uni-eth-weth-usdc-30', asset: 'ETH', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'ETH/USDC 0.30%', address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8', dec0: 6, dec1: 18, vol0: false },
  { id: 'uni-eth-weth-usdc-5', asset: 'ETH', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'ETH/USDC 0.05%', address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', dec0: 6, dec1: 18, vol0: false },
  { id: 'uni-eth-weth-usdt-30', asset: 'ETH', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'ETH/USDT 0.30%', address: '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', dec0: 18, dec1: 6, vol0: true },
  { id: 'uni-eth-weth-usdt-5', asset: 'ETH', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'ETH/USDT 0.05%', address: '0x11b815efb8f581194ae79006d24e0d814b7697f6', dec0: 18, dec1: 6, vol0: true },
  { id: 'uni-base-weth-usdc-5', asset: 'ETH', chain: 'Base', network: 'base', platform: 'Uniswap', name: 'ETH/USDC 0.05%', address: '0xd0b53d9277642d899df5c87a3966a349a798f224', dec0: 18, dec1: 6, vol0: true },
  { id: 'uni-base-weth-usdc-30', asset: 'ETH', chain: 'Base', network: 'base', platform: 'Uniswap', name: 'ETH/USDC 0.30%', address: '0x6c561b446416e1a00e8e93e221854d6ea4171372', dec0: 18, dec1: 6, vol0: true },
  { id: 'uni-arb-weth-usdc-5', asset: 'ETH', chain: 'Arbitrum', network: 'arbitrum', platform: 'Uniswap', name: 'ETH/USDC 0.05%', address: '0xc6962004f452be9203591991d15f6b388e09e8d0', dec0: 18, dec1: 6, vol0: true },
  { id: 'uni-arb-weth-usdc-30', asset: 'ETH', chain: 'Arbitrum', network: 'arbitrum', platform: 'Uniswap', name: 'ETH/USDC 0.30%', address: '0xc473e2aee3441bf9240be85eb122abb059a3b57c', dec0: 18, dec1: 6, vol0: true },
  { id: 'aero-weth-usdc-cl100', asset: 'ETH', chain: 'Base', network: 'base', platform: 'Aerodrome', name: 'ETH/USDC CL100', address: '0xb2cc224c1c9fee385f8ad6a55b4d94e92359dc59', dec0: 18, dec1: 6, vol0: true },
  { id: 'velo-weth-usdc-cl100', asset: 'ETH', chain: 'Optimism', network: 'optimism', platform: 'Velodrome', name: 'ETH/USDC CL100', address: '0x478946bcd4a5a22b316470f5486fafb928c0ba25', dec0: 6, dec1: 18, vol0: false },
  { id: 'uni-eth-wbtc-usdc-30', asset: 'BTC', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'WBTC/USDC 0.30%', address: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35', dec0: 8, dec1: 6, vol0: true },
  { id: 'uni-eth-wbtc-usdc-5', asset: 'BTC', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'WBTC/USDC 0.05%', address: '0x9a772018fbd77fcd2d25657e5c547baff3fd7d16', dec0: 8, dec1: 6, vol0: true },
  { id: 'uni-eth-wbtc-usdt-5', asset: 'BTC', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'WBTC/USDT 0.05%', address: '0x56534741cd8b152df6d48adf7ac51f75169a83b2', dec0: 8, dec1: 6, vol0: true },
  { id: 'uni-eth-wbtc-usdt-30', asset: 'BTC', chain: 'Ethereum', network: 'mainnet', platform: 'Uniswap', name: 'WBTC/USDT 0.30%', address: '0x9db9e0e53058c89e5b94e29621a205198648425b', dec0: 8, dec1: 6, vol0: true },
  { id: 'uni-base-cbbtc-usdc-5', asset: 'BTC', chain: 'Base', network: 'base', platform: 'Uniswap', name: 'cbBTC/USDC 0.05%', address: '0xfbb6eed8e7aa03b138556eedaf5d271a5e1e43ef', dec0: 6, dec1: 8, vol0: false },
  { id: 'uni-base-cbbtc-usdc-30', asset: 'BTC', chain: 'Base', network: 'base', platform: 'Uniswap', name: 'cbBTC/USDC 0.30%', address: '0xec558e484cc9f2210714e345298fdc53b253c27d', dec0: 6, dec1: 8, vol0: false },
  { id: 'uni-arb-wbtc-usdc-5', asset: 'BTC', chain: 'Arbitrum', network: 'arbitrum', platform: 'Uniswap', name: 'WBTC/USDC 0.05%', address: '0x0e4831319a50228b9e450861297ab92dee15b44f', dec0: 8, dec1: 6, vol0: true },
  { id: 'uni-arb-wbtc-usdc-30', asset: 'BTC', chain: 'Arbitrum', network: 'arbitrum', platform: 'Uniswap', name: 'WBTC/USDC 0.30%', address: '0x6985cb98ce393fce8d6272127f39013f61e36166', dec0: 8, dec1: 6, vol0: true },
  { id: 'aero-cbbtc-usdc-cl100', asset: 'BTC', chain: 'Base', network: 'base', platform: 'Aerodrome', name: 'cbBTC/USDC CL100', address: '0x4e962bb3889bf030368f56810a9c96b83cb3e778', dec0: 6, dec1: 8, vol0: false }
];

var links = {
  uniswapv3: 'uniswap-position',
  uniswapv4: 'uniswapv4-position',
  aerodrome: 'aerodrome-position',
  aerodromev2: 'aerodromev2-position',
  aerodromev3: 'aerodromev3-position',
  velodrome: 'velodrome-position',
  pancakeswapv3: 'pancake-position'
};

function priceAtTick(tick, dec0, dec1, vol0) {
  var ln = tick * Math.log(1.0001);
  if (ln > 80) ln = 80;
  if (ln < -80) ln = -80;
  var raw = Math.exp(ln);
  if (!(raw > 0) || raw === Infinity) return 0;
  if (vol0) return raw * Math.pow(10, dec0 - dec1);
  return Math.pow(10, dec1 - dec0) / raw;
}

function num(v) {
  if (v == null || v === '') return null;
  var n = Number(v);
  return n === n ? n : null;
}

function round(n, digits) {
  var m = Math.pow(10, digits);
  return Math.round(n * m) / m;
}

function fetchJson(url, ms) {
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, ms);
  return fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } }).then(function (r) {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }).finally(function () { clearTimeout(timer); });
}

function getPositions(pool, extra) {
  var url = 'https://api.revert.finance/v1/positions?limit=80&no-withdrawals=true&pool=' + pool.address + '&network=' + pool.network + '&' + extra;
  return fetchJson(url, 20000).then(function (body) {
    return body && body.data ? body.data : [];
  }).catch(function () { return []; });
}

async function mapLimit(items, limit, fn) {
  var index = 0;
  var out = new Array(items.length);
  async function worker() {
    while (index < items.length) {
      var current = index++;
      out[current] = await fn(items[current]);
    }
  }
  var workers = [];
  var n = Math.min(limit, items.length);
  for (var i = 0; i < n; i++) workers.push(worker());
  await Promise.all(workers);
  return out;
}

async function build() {
  var llama = await fetchJson('https://coins.llama.fi/prices/current/coingecko:ethereum,coingecko:bitcoin', 15000);
  var spotEth = Number(llama.coins['coingecko:ethereum'].price);
  var spotBtc = Number(llama.coins['coingecko:bitcoin'].price);
  var rows = [];
  var seen = {};

  await mapLimit(pools, 3, async function (pool) {
    var spot = pool.asset === 'ETH' ? spotEth : spotBtc;
    var batches = await Promise.all([
      getPositions(pool, 'in-range=true&sort=underlying_value&desc=true&underlying-value-from=5000'),
      getPositions(pool, 'in-range=true&sort=fee_apr&desc=true&underlying-value-from=5000'),
      getPositions(pool, 'sort=underlying_value&desc=true&underlying-value-from=20000')
    ]);
    var batch = batches[0].concat(batches[1], batches[2]);
    if (!batch.length) return;
    var vol0 = pool.vol0;
    var inRange = batch.filter(function (p) { return p.in_range === true; });
    if (inRange.length >= 4) {
      var hit = 0;
      inRange.forEach(function (p) {
        var a = priceAtTick(Number(p.tick_lower), pool.dec0, pool.dec1, vol0);
        var b = priceAtTick(Number(p.tick_upper), pool.dec0, pool.dec1, vol0);
        var lo = Math.min(a, b);
        var hi = Math.max(a, b);
        if (spot >= lo && spot <= hi) hit++;
      });
      if (hit * 2 < inRange.length) vol0 = !vol0;
    }
    batch.forEach(function (p) {
      var key = pool.network + '|' + String(p.exchange) + '|' + String(p.nft_id);
      if (seen[key]) return;
      var value = num(p.underlying_value);
      if (value == null || value < 5000 || value > 500000000) return;
      var a = priceAtTick(Number(p.tick_lower), pool.dec0, pool.dec1, vol0);
      var b = priceAtTick(Number(p.tick_upper), pool.dec0, pool.dec1, vol0);
      var lo = Math.min(a, b);
      var hi = Math.max(a, b);
      if (!(lo > 0) || !(hi > 0) || lo === Infinity || hi === Infinity) return;
      var full = (lo < spot * 0.05 && hi > spot * 20) || (hi / lo > 30);
      var width = (!full && (lo + hi) > 0) ? ((hi - lo) / ((hi + lo) / 2)) * 100 : null;
      var fee = p.performance && p.performance.hodl ? num(p.performance.hodl.fee_apr) : null;
      var owner = String(p.real_owner || '').toLowerCase();
      var ex = String(p.exchange || '');
      var path = links[ex] || null;
      var age = num(p.age);
      seen[key] = true;
      rows.push({
        key: key,
        poolId: pool.id,
        asset: pool.asset,
        chain: pool.chain,
        network: pool.network,
        platform: pool.platform,
        exchange: ex,
        pair: pool.name,
        feeTier: Number(p.fee_tier),
        lower: round(lo, 2),
        upper: round(hi, 2),
        width: width == null ? null : round(width, 1),
        fullRange: !!full,
        value: round(value, 2),
        feeApr: fee == null ? null : round(fee, 2),
        ageDays: age == null ? null : round(age, 3),
        inRange: p.in_range === true,
        nft: String(p.nft_id),
        owner: owner,
        revertUrl: path ? ('https://revert.finance/#/' + path + '/' + pool.network + '/' + String(p.nft_id)) : null,
        debankUrl: /^0x[0-9a-f]{40}$/.test(owner) ? ('https://debank.com/profile/' + owner) : null
      });
    });
  });

  if (rows.length < 100) throw new Error('too few positions: ' + rows.length);
  return {
    updated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    spot: { ETH: round(spotEth, 2), BTC: round(spotBtc, 2) },
    source: 'https://api.revert.finance/v1/positions',
    minValue: 5000,
    pools: pools.map(function (pool) {
      return { id: pool.id, asset: pool.asset, chain: pool.chain, platform: pool.platform, name: pool.name, address: pool.address };
    }),
    positions: rows
  };
}

module.exports = async function (req, res) {
  try {
    var payload = await build();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).send(JSON.stringify(payload));
  } catch (err) {
    console.error(err && err.message ? err.message : err);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.status(500).json({ error: 'revert refresh failed' });
  }
};
