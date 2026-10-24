/* =====================================================================
   FX — слой анимаций. Не изменяет логику сайта: только добавляет
   декоративные элементы и эффекты поверх существующей страницы.
   ===================================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var isSmall = function () { return window.innerWidth < 700; };

  /* ---------- Детерминированный ГСЧ (раскладка всегда красивая) ---------- */
  var seed = 20251;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function rr(a, b) { return a + rnd() * (b - a); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

  /* ---------- Спрайт иконок ---------- */
  function coinBase(inner) {
    return '<circle cx="32" cy="32" r="30" fill="url(#fxGold)" stroke="#8f7433" stroke-width="2"/>' +
      '<circle cx="32" cy="32" r="24" fill="none" stroke="#fff4cf" stroke-opacity=".6" stroke-width="1.5"/>' + inner;
  }
  function glyph(ch, size, y) {
    return '<text x="32" y="' + y + '" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-size="' + size + '" font-weight="700" fill="#6b5016">' + ch + '</text>';
  }
  var SYMBOLS = {
    'i-usd': coinBase(glyph('$', 32, 43)),
    'i-eur': coinBase(glyph('€', 30, 42)),
    'i-btc': coinBase(glyph('B', 28, 41) +
      '<rect x="27" y="14.5" width="2.2" height="6" fill="#6b5016"/><rect x="33" y="14.5" width="2.2" height="6" fill="#6b5016"/>' +
      '<rect x="27" y="43.5" width="2.2" height="6" fill="#6b5016"/><rect x="33" y="43.5" width="2.2" height="6" fill="#6b5016"/>'),
    'i-eth': coinBase('<polygon points="32,12 45,33 32,40 19,33" fill="#6b5016" fill-opacity=".9"/>' +
      '<polygon points="32,43 45,35.5 32,52 19,35.5" fill="#6b5016" fill-opacity=".65"/>'),
    'i-bill': '<rect x="3" y="15" width="58" height="34" rx="5" fill="#d5e8d9" stroke="#4f8062" stroke-width="2"/>' +
      '<rect x="8.5" y="20" width="47" height="24" rx="3" fill="none" stroke="#4f8062" stroke-opacity=".5" stroke-width="1.2"/>' +
      '<circle cx="32" cy="32" r="8.5" fill="#9fc8ac" stroke="#4f8062" stroke-width="1.6"/>' +
      '<text x="32" y="36.6" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#2f5a40">$</text>' +
      '<circle cx="13" cy="32" r="2" fill="#4f8062"/><circle cx="51" cy="32" r="2" fill="#4f8062"/>',
    'i-stack': '<g stroke="#8f7433" stroke-width="1.6">' +
      '<path d="M10 44v6c0 3.3 9.8 6 22 6s22-2.7 22-6v-6z" fill="#b99a4f"/><ellipse cx="32" cy="44" rx="22" ry="6" fill="url(#fxGold)"/>' +
      '<path d="M10 32v6c0 3.3 9.8 6 22 6s22-2.7 22-6v-6z" fill="#b99a4f"/><ellipse cx="32" cy="32" rx="22" ry="6" fill="url(#fxGold)"/>' +
      '<path d="M10 20v6c0 3.3 9.8 6 22 6s22-2.7 22-6v-6z" fill="#b99a4f"/><ellipse cx="32" cy="20" rx="22" ry="6" fill="url(#fxGold)"/></g>',
    'i-gem': '<path d="M16 10h32l12 16-28 30L4 26z" fill="#cfe0f5" stroke="#2a4070" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M4 26h56M24 10l-6 16 14 30M40 10l6 16-14 30" fill="none" stroke="#2a4070" stroke-width="1.5" stroke-linejoin="round"/>',
    'i-bag': '<path d="M24 10l-4-6h24l-4 6c10 6 16 16 14 28-1.500 9-9 16-22 16S11.500 47 10 38c-2-12 4-22 14-28z" fill="url(#fxGold)" stroke="#8f7433" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M24 10h16" stroke="#8f7433" stroke-width="2.4" stroke-linecap="round"/>' + glyph('$', 24, 45),
    'i-star': '<path d="M32 2c2.700 16 13 26.700 30 30-17 3.300-27.300 14-30 30-2.700-16-13-26.700-30-30C19 28.700 29.300 18 32 2z" fill="#f6e7b8"/>'
  };
  var SPRITE = '<svg class="fx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<linearGradient id="fxGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7b8"/><stop offset=".5" stop-color="#d4b872"/><stop offset="1" stop-color="#a98a43"/></linearGradient>' +
    '<linearGradient id="fxLineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c4a96b" stop-opacity=".12"/><stop offset=".6" stop-color="#c4a96b" stop-opacity=".85"/><stop offset="1" stop-color="#a98a43"/></linearGradient>' +
    '<linearGradient id="fxAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4a96b" stop-opacity=".22"/><stop offset="1" stop-color="#c4a96b" stop-opacity="0"/></linearGradient>' +
    Object.keys(SYMBOLS).map(function (k) { return '<symbol id="' + k + '" viewBox="0 0 64 64">' + SYMBOLS[k] + '</symbol>'; }).join('') +
    '</defs></svg>';
  document.body.insertAdjacentHTML('afterbegin', SPRITE);

  function sym(id) { return '<svg aria-hidden="true" focusable="false"><use href="#' + id + '" width="100%" height="100%"/></svg>'; }

  /* Линейные иконки (для бейджей карточек) */
  var STROKES = {
    chart: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>',
    wallet: '<path d="M4 7a2 2 0 0 1 2-2h11v3"/><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M16 14h2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>',
    pie: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l7 5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18"/><path d="M12 3c-3 3-3 15 0 18"/>',
    bank: '<path d="M3 9l9-5 9 5z"/><path d="M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18"/>',
    bars: '<path d="M5 20V11M10 20V5M15 20v-8M20 20V8"/><path d="M3 20h18"/>',
    hex: '<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9z"/><circle cx="12" cy="12" r="2.500"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.200"/>',
    gem: '<path d="M6 4h12l4 6-10 11L2 10z"/><path d="M2 10h20M9 4l-2 6 5 11M15 4l2 6-5 11"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.500h8M8 12.500h5"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>'
  };
  function stroke(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      STROKES[name].replace(/<(path|circle|rect|polyline|line|polygon)\b/g, '<$1 pathLength="100"') + '</svg>';
  }

  var COINS = ['i-usd', 'i-eur', 'i-btc', 'i-eth', 'i-stack', 'i-bill', 'i-gem', 'i-bag'];
  var COIN_ONLY = ['i-usd', 'i-eur', 'i-btc', 'i-eth'];

  /* ---------- Слои ---------- */
  var layers = [];
  function makeLayer(host, cls) {
    host.classList.add('fx-host');
    var el = document.createElement('div');
    el.className = 'fx-layer fx-paused ' + (cls || '');
    el.setAttribute('aria-hidden', 'true');
    host.insertBefore(el, host.firstChild);
    var L = { el: el, host: host, visible: false, floats: [], mouse: cls && cls.indexOf('fx-hero') > -1 };
    layers.push(L);
    return L;
  }
  function sizeLayer(L) { L.el.style.setProperty('--h', (L.el.offsetHeight + 200) + 'px'); }

  function addFloat(L, icon, x, y, s, o, depth, opt) {
    opt = opt || {};
    var d = document.createElement('div');
    d.className = 'fx-float' + (opt.far ? ' far' : '') + (opt.hideM ? ' hide-m' : '') + (opt.flip ? ' flip' : '');
    d.setAttribute('data-depth', depth);
    var st = d.style;
    st.setProperty('--x', x + '%'); st.setProperty('--y', y + '%');
    st.setProperty('--s', s + 'px'); st.setProperty('--o', o);
    st.setProperty('--t', rr(6, 10).toFixed(1) + 's');
    st.setProperty('--dl', (-rr(0, 8)).toFixed(1) + 's');
    st.setProperty('--dx', rr(-14, 14).toFixed(0) + 'px');
    st.setProperty('--dy', rr(-26, -12).toFixed(0) + 'px');
    st.setProperty('--r0', rr(-14, -3).toFixed(0) + 'deg');
    st.setProperty('--r1', rr(3, 14).toFixed(0) + 'deg');
    st.setProperty('--pd', (opt.pd || rr(0, .8)).toFixed(2) + 's');
    st.setProperty('--ft', rr(4, 7).toFixed(1) + 's');
    st.setProperty('--fd', (-rr(0, 4)).toFixed(1) + 's');
    d.innerHTML = sym(icon);
    L.el.appendChild(d);
    L.floats.push({ el: d, depth: depth, tx: 0, ty: 0 });
  }
  function addRise(L, icon, x, s, t, dl, o) {
    var d = document.createElement('div');
    d.className = 'fx-rise';
    d.style.cssText = '--x:' + x + '%;--s:' + s + 'px;--t:' + t + 's;--dl:' + dl + 's;--o:' + o + ';--dx:' + rr(-60, 60).toFixed(0) + 'px;--rot:' + rr(-240, 240).toFixed(0) + 'deg;--sw:' + rr(2.5, 4.5).toFixed(1) + 's;--ft:' + rr(3, 6).toFixed(1) + 's';
    d.innerHTML = sym(icon);
    L.el.appendChild(d);
  }
  function addFall(L, icon, x, s, t, dl, o) {
    var d = document.createElement('div');
    d.className = 'fx-fall';
    d.style.cssText = '--x:' + x + '%;--s:' + s + 'px;--t:' + t + 's;--dl:' + dl + 's;--o:' + o + ';--dx:' + rr(-80, 80).toFixed(0) + 'px;--rot:' + rr(-420, 420).toFixed(0) + 'deg;--sw:' + rr(2.5, 4.5).toFixed(1) + 's;--ft:' + rr(2.5, 5).toFixed(1) + 's';
    d.innerHTML = sym(icon);
    L.el.appendChild(d);
  }
  function addTwinkle(L, x, y, s, t, dl, o) {
    var d = document.createElement('div');
    d.className = 'fx-twinkle';
    d.style.cssText = '--x:' + x + '%;--y:' + y + '%;--s:' + s + 'px;--t:' + t + 's;--dl:' + dl + 's;--o:' + o;
    d.innerHTML = sym('i-star');
    L.el.appendChild(d);
  }
  function edges(L, n, opt) {
    opt = opt || {};
    for (var i = 0; i < n; i++) {
      var left = i % 2 === 0;
      var x = left ? rr(.8, 5.5) : rr(91.5, 96.5);
      var y = (i + .5) * (92 / n) + rr(-3, 3);
      addFloat(L, pick(opt.icons || COINS), x.toFixed(1), y.toFixed(1), Math.round(rr(30, 54)), opt.o || .45, rr(.4, 1.5).toFixed(2), { hideM: true, far: rnd() > .7, flip: rnd() > .4 });
    }
  }

  var secs = $$('main > section');
  var heroSec = secs[0];

  /* ================= HERO ================= */
  var heroL = makeLayer(heroSec, 'fx-hero');
  var gb = document.createElement('div'); gb.className = 'fx-gridbg'; heroL.el.appendChild(gb);
  var chartHolder = document.createElement('div'); chartHolder.className = 'fx-chartwrap'; heroL.el.appendChild(chartHolder);
  function buildChart() {
    var W = chartHolder.offsetWidth || 1200, H = chartHolder.offsetHeight || 500;
    var saved = seed; seed = 777;
    var n = 26, pts = [], i, x, y;
    for (i = 0; i <= n; i++) {
      x = i * W / n;
      y = H * .82 - (i / n) * H * .55 + (rnd() - .5) * H * .2 + Math.sin(i * .7) * H * .05;
      y = Math.max(H * .12, Math.min(H * .92, y));
      pts.push([x, y]);
    }
    seed = saved;
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    var grid = '';
    for (i = 1; i < 5; i++) grid += '<line class="grid" x1="0" x2="' + W + '" y1="' + (H * i / 5).toFixed(1) + '" y2="' + (H * i / 5).toFixed(1) + '"/>';
    chartHolder.innerHTML = '<svg class="fx-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + grid +
      '<path class="area" d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + ' Z"/><path class="line" pathLength="1000" d="' + d + '"/></svg>';
  }
  buildChart();

  var heroFloats = [
    ['i-btc', 3, 12, 56, .92, 1.4], ['i-usd', 44, 6, 38, .85, .8], ['i-bill', 89, 9, 74, .88, 1.1],
    ['i-eur', 48, 86, 46, .85, 1.0], ['i-gem', 93, 55, 42, .85, .7], ['i-stack', 1.5, 77, 56, .9, 1.3],
    ['i-eth', 51, 38, 34, .8, .6], ['i-bag', 84, 85, 52, .88, 1.0], ['i-usd', 21, 90, 30, .6, .5, 1],
    ['i-bill', 69, 3, 48, .65, .6, 1], ['i-btc', 62, 93, 28, .6, .5, 1]
  ];
  heroFloats.forEach(function (f, i) {
    addFloat(heroL, f[0], f[1], f[2], f[3], f[4], f[5], { far: !!f[6], flip: f[0] !== 'i-bill' && f[0] !== 'i-gem', hideM: i > 6, pd: .3 + i * .12 });
  });
  for (var hi = 0; hi < 7; hi++) addRise(heroL, pick(COIN_ONLY), rr(3, 96).toFixed(0), Math.round(rr(14, 24)), rr(12, 20).toFixed(1), -rr(0, 18).toFixed(1), .55);
  for (var ht = 0; ht < 9; ht++) addTwinkle(heroL, rr(2, 98).toFixed(0), rr(6, 92).toFixed(0), Math.round(rr(10, 20)), rr(2.6, 4.4).toFixed(1), -rr(0, 4).toFixed(1), .85);

  /* ================= Секции контента ================= */
  var why = secs[1];
  var services = $('#services'), recog = $('.recognition-section'), expat = $('.expat-section'), about = $('#about'),
    outcome = $('.outcome-section'), lecture = $('.lecture-section'), formats = $('#formats'),
    testi = $('.testimonials-section'), articles = $('#articles'), cta = $('.final-cta');

  [[why, 6], [services, 4], [recog, 4], [about, 5], [outcome, 5], [lecture, 4], [formats, 5], [articles, 4]].forEach(function (p) {
    if (!p[0]) return;
    var L = makeLayer(p[0]);
    edges(L, p[1], { o: .42 });
    for (var k = 0; k < 3; k++) addTwinkle(L, rr(4, 96).toFixed(0), rr(8, 92).toFixed(0), Math.round(rr(9, 16)), rr(3, 5).toFixed(1), -rr(0, 4).toFixed(1), .55);
  });

  /* Expat — тёмный блок: сеть международных переводов */
  if (expat) {
    var EL = makeLayer(expat, 'fx-dark');
    var g = document.createElement('div'); g.className = 'fx-gridbg'; EL.el.appendChild(g);
    var nodes = [[110, 400], [270, 210], [470, 330], [660, 170], [850, 300], [1030, 160], [1080, 440], [400, 500], [760, 480]];
    var arcs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [2, 7], [7, 8], [8, 6], [1, 3], [0, 7]];
    var svg = '<svg class="fx-net" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>';
    var arcD = arcs.map(function (a, i) {
      var p = nodes[a[0]], q = nodes[a[1]], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - 60 - (i % 3) * 20;
      return 'M' + p[0] + ' ' + p[1] + ' Q' + mx + ' ' + my + ' ' + q[0] + ' ' + q[1];
    });
    arcD.forEach(function (d, i) { svg += '<path id="fxArc' + i + '" d="' + d + '"/>'; });
    svg += '</defs>';
    arcD.forEach(function (d, i) { svg += '<path class="arc" style="animation-delay:' + (-i * .3) + 's" d="' + d + '"/>'; });
    nodes.forEach(function (n, i) {
      svg += '<circle class="ping" cx="' + n[0] + '" cy="' + n[1] + '" r="4"><animate attributeName="r" values="4;22" dur="3.2s" begin="' + (-i * .5) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="3.2s" begin="' + (-i * .5) + 's" repeatCount="indefinite"/></circle>';
      svg += '<circle class="node" cx="' + n[0] + '" cy="' + n[1] + '" r="4"/>';
    });
    arcD.forEach(function (d, i) {
      svg += '<circle class="pkt" r="3.2"><animateMotion dur="' + (4 + (i % 4)) + 's" begin="' + (-i * .9) + 's" repeatCount="indefinite"><mpath href="#fxArc' + i + '"/></animateMotion></circle>';
    });
    svg += '</svg>';
    EL.el.insertAdjacentHTML('beforeend', svg);
    for (var e = 0; e < 12; e++) addRise(EL, pick(COIN_ONLY.concat(['i-stack', 'i-bill'])), rr(2, 97).toFixed(0), Math.round(rr(18, 34)), rr(11, 19).toFixed(1), -rr(0, 18).toFixed(1), .75);
    for (var et = 0; et < 10; et++) addTwinkle(EL, rr(2, 98).toFixed(0), rr(6, 94).toFixed(0), Math.round(rr(10, 18)), rr(2.6, 4.4).toFixed(1), -rr(0, 4).toFixed(1), .85);
  }

  /* Отзывы — тёмный блок */
  if (testi) {
    var TL = makeLayer(testi, 'fx-dark');
    var tg = document.createElement('div'); tg.className = 'fx-gridbg'; TL.el.appendChild(tg);
    for (var t1 = 0; t1 < 9; t1++) addRise(TL, pick(COIN_ONLY), rr(2, 97).toFixed(0), Math.round(rr(16, 30)), rr(12, 20).toFixed(1), -rr(0, 18).toFixed(1), .7);
    for (var t2 = 0; t2 < 14; t2++) addTwinkle(TL, rr(2, 98).toFixed(0), rr(6, 94).toFixed(0), Math.round(rr(10, 20)), rr(2.4, 4.4).toFixed(1), -rr(0, 4).toFixed(1), .9);
    edges(TL, 4, { o: .7, icons: ['i-usd', 'i-btc', 'i-eur', 'i-stack'] });
  }

  /* Финальный блок — денежный дождь */
  if (cta) {
    var CL = makeLayer(cta);
    for (var c1 = 0; c1 < 16; c1++) addFall(CL, pick(['i-usd', 'i-eur', 'i-btc', 'i-eth', 'i-bill', 'i-bill', 'i-stack']), rr(2, 96).toFixed(0), Math.round(rr(22, 42)), rr(10, 17).toFixed(1), -rr(0, 16).toFixed(1), .6);
    for (var c2 = 0; c2 < 6; c2++) addTwinkle(CL, rr(4, 96).toFixed(0), rr(8, 90).toFixed(0), Math.round(rr(10, 16)), rr(3, 5).toFixed(1), -rr(0, 4).toFixed(1), .6);
  }

  layers.forEach(sizeLayer);

  /* ---------- Пауза слоёв вне экрана ---------- */
  var layerObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var L = layers.filter(function (l) { return l.el === en.target; })[0];
      if (!L) return;
      L.visible = en.isIntersecting;
      en.target.classList.toggle('fx-paused', !en.isIntersecting);
    });
  }, { rootMargin: '80px 0px' });
  layers.forEach(function (L) { layerObs.observe(L.el); });

  /* ================= Бегущая строка ================= */
  var tk = [['i-stack', 'Interactive Brokers'], ['i-stack', 'ETF'], ['i-btc', 'BTC'], ['i-eth', 'ETH'], ['i-gem', 'DeFi'], ['i-bill', 'USDT'],
    ['i-bag', 'S&P 500'], ['i-usd', 'USD'], ['i-eur', 'EUR'], ['i-bill', 'USDC'], ['i-stack', 'MSCI World'], ['i-gem', 'Cold Wallet'], ['i-bag', 'Stablecoins']];
  var tkHtml = tk.map(function (it) { return '<span class="fx-tk">' + sym(it[0]) + it[1] + '</span><span class="fx-tk-sep"></span>'; }).join('');
  var ticker = document.createElement('div');
  ticker.className = 'fx-ticker'; ticker.setAttribute('aria-hidden', 'true');
  ticker.innerHTML = '<div class="fx-ticker-track">' + tkHtml + tkHtml + '</div>';
  heroSec.insertAdjacentElement('afterend', ticker);

  /* ================= Иконки в карточках ================= */
  function addBadge(card, name, i) {
    var b = document.createElement('div');
    b.className = 'fx-badge fx-draw'; b.style.setProperty('--dl', (-i * .7) + 's');
    b.innerHTML = stroke(name);
    card.insertBefore(b, card.firstChild);
    drawObs.observe(b);
  }
  function addIco(card, html, cls) {
    var d = document.createElement('div');
    d.className = 'fx-ico ' + cls; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = html;
    card.appendChild(d);
    if (/fx-draw/.test(cls)) drawObs.observe(d);
    return d;
  }
  var drawObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('on'); drawObs.unobserve(en.target); }
    });
  }, { threshold: .4 });

  $$('.why-card').forEach(function (c, i) { addBadge(c, ['target', 'gem', 'shield', 'pie', 'key'][i % 5], i); });
  $$('.service-card').forEach(function (c, i) {
    if (i === 0) addIco(c, stroke('chart'), 'fx-draw');
    if (i === 1) addIco(c, sym('i-btc'), 'spin');
    if (i === 2) addIco(c, stroke('hex'), 'fx-draw tilt');
    if (i === 3) addIco(c, stroke('wallet') + '<span class="dropcoin">' + sym('i-usd') + '</span>', 'fx-draw');
  });
  $$('.format-card').forEach(function (c, i) { addIco(c, stroke(['chat', 'bars', 'route'][i % 3]), 'fx-draw bob'); });
  var artIcons = { 'Крипто': ['i-btc', 'spin'], 'DeFi': ['hex'], 'Инвестиции': ['chart'], 'Брокеры': ['bank'], 'Анализ': ['bars'] };
  $$('.article-card').forEach(function (c) {
    var tag = ($('.article-tag', c) || {}).textContent || '';
    var m = artIcons[tag.trim()] || ['pie'];
    if (m[0].indexOf('i-') === 0) addIco(c, sym(m[0]), 'spin'); else addIco(c, stroke(m[0]), 'fx-draw bob');
  });
  $$('.recognition-item').forEach(function (li, i) {
    var s = document.createElement('span'); s.className = 'fx-rc'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = sym(COIN_ONLY[i % 4]); li.appendChild(s);
  });
  $$('.lecture-principle').forEach(function (p) {
    var s = document.createElement('span'); s.className = 'fx-sweep'; s.setAttribute('aria-hidden', 'true'); p.appendChild(s);
  });

  /* ================= Поток «Что вы получаете» ================= */
  var flow = $('.outcome-flow');
  if (flow) {
    var wrap = flow.parentElement;
    wrap.style.position = 'relative';
    $$('.flow-connector', flow).forEach(function (c, i) { c.style.animationDelay = (.3 + i * .35) + 's'; });
    var trav = document.createElement('div');
    trav.className = 'fx-traveler'; trav.setAttribute('aria-hidden', 'true'); trav.innerHTML = sym('i-usd');
    wrap.appendChild(trav);
    var placeTraveler = function () {
      var dots = $$('.flow-step-dot', flow); if (dots.length < 2) return;
      var w = wrap.getBoundingClientRect(), a = dots[0].getBoundingClientRect(), b = dots[dots.length - 1].getBoundingClientRect();
      trav.style.left = (a.left - w.left + a.width / 2) + 'px';
      trav.style.top = (a.top - w.top + a.height / 2) + 'px';
      trav.style.setProperty('--tr', (b.top - a.top) + 'px');
    };
    placeTraveler();
    window.addEventListener('load', placeTraveler);
    if (window.ResizeObserver) new ResizeObserver(placeTraveler).observe(wrap);
  }

  /* ================= Футер: катящаяся монета ================= */
  var foot = $('footer');
  if (foot) { var rl = document.createElement('div'); rl.className = 'fx-roll'; rl.setAttribute('aria-hidden', 'true'); rl.innerHTML = sym('i-usd'); foot.appendChild(rl); }

  /* ================= Орбита монет вокруг фото ================= */
  var heroPhoto = $('.hero-photo');
  var orbit = null, orbitItems = [];
  if (heroPhoto) {
    orbit = document.createElement('div'); orbit.className = 'fx-orbit'; orbit.setAttribute('aria-hidden', 'true');
    [['i-btc', 0, 1], ['i-usd', 1.57, .9], ['i-eur', 3.14, .95], ['i-eth', 4.71, .85]].forEach(function (o) {
      var d = document.createElement('div'); d.className = 'oc'; d.innerHTML = sym(o[0]);
      d.firstChild.style.animationDelay = (-o[1] * 1.3) + 's';
      orbit.appendChild(d); orbitItems.push({ el: d, ph: o[1], k: o[2], z: 0 });
    });
    heroPhoto.appendChild(orbit);
  }

  /* ================= Счётчики ================= */
  function countUp(el, delay) {
    var m = /^(\d+)(\D*)$/.exec(el.textContent.trim());
    if (!m) return;
    var target = parseInt(m[1], 10), suffix = m[2], dur = 1700;
    el.textContent = '0' + suffix;
    setTimeout(function () {
      var t0 = null;
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, delay || 0);
  }
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      countObs.unobserve(en.target);
      countUp(en.target, 150);
    });
  }, { threshold: .6 });
  $$('.stat-num').forEach(function (n) { countObs.observe(n); });
  var ps = $('.photo-stat-num'); if (ps) countObs.observe(ps);

  /* ================= Прогресс прокрутки ================= */
  var prog = document.createElement('div');
  prog.className = 'fx-progress'; prog.setAttribute('aria-hidden', 'true');
  prog.innerHTML = '<div class="fx-progress-bar"></div><div class="fx-progress-coin">' + sym('i-usd') + '</div>';
  document.body.appendChild(prog);
  var progBar = prog.firstChild, progCoin = prog.lastChild, nav = $('nav');

  /* ================= Частицы: искры курсора и взрыв монет ================= */
  var lastSpark = 0, lx = -99, ly = -99;
  function spark(x, y) {
    var s = document.createElement('div'); s.className = 'fx-spark';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--tx', rr(-22, 22).toFixed(0) + 'px'); s.style.setProperty('--ty', rr(14, 42).toFixed(0) + 'px');
    var sz = rr(7, 13); s.style.width = s.style.height = sz.toFixed(0) + 'px';
    s.innerHTML = sym(rnd() > .35 ? 'i-star' : pick(COIN_ONLY));
    s.addEventListener('animationend', function () { s.remove(); });
    document.body.appendChild(s);
  }
  function burst(x, y, n, mult) {
    for (var i = 0; i < n; i++) {
      var el = document.createElement('div'); el.className = 'fx-burst';
      var sz = rr(14, 28); el.style.width = el.style.height = sz.toFixed(0) + 'px';
      el.innerHTML = sym(rnd() > .2 ? pick(COINS) : 'i-star');
      document.body.appendChild(el);
      var a = -Math.PI / 2 + (rnd() - .5) * Math.PI * 1.3, sp = (90 + rnd() * 150) * mult;
      var vx = Math.cos(a) * sp, vy = Math.sin(a) * sp, rot = rr(-540, 540);
      var anim = el.animate([
        { transform: 'translate(' + (x - sz / 2) + 'px,' + (y - sz / 2) + 'px) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (x - sz / 2 + vx * .6) + 'px,' + (y - sz / 2 + vy * .75) + 'px) scale(1) rotate(' + (rot / 2) + 'deg)', opacity: 1, offset: .42 },
        { transform: 'translate(' + (x - sz / 2 + vx) + 'px,' + (y - sz / 2 + vy + 260) + 'px) scale(.8) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 950 + rnd() * 600, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
      anim.onfinish = (function (e) { return function () { e.remove(); }; })(el);
    }
  }
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('.btn-primary,.btn-secondary,.nav-cta,.contact-link,.nav-exchange,.article-card,.hero-tag,.service-card,.format-card,.nav-logo');
    if (t) burst(e.clientX, e.clientY, t.matches('.btn-primary,.nav-cta') ? 14 : 8, 1);
  }, { passive: true });

  /* ================= Наклон карточек и «магнитные» кнопки ================= */
  var tilts = new Map(), mags = new Map();
  if (fine) {
    $$('.why-card,.service-card,.format-card,.article-card,.stat-box,.testimonial-card').forEach(function (c) {
      c.classList.add('fx-tilt');
      var max = c.classList.contains('stat-box') ? 5 : 7;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
        c.classList.add('fx-hot');
        var st = tilts.get(c) || { cx: 0, cy: 0 }; st.tx = px * max * 2; st.ty = -py * max * 2; tilts.set(c, st);
      });
      c.addEventListener('pointerleave', function () {
        c.classList.remove('fx-hot');
        var st = tilts.get(c); if (st) { st.tx = 0; st.ty = 0; }
      });
    });
    $$('.btn-primary,.btn-secondary,.nav-cta').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        var st = mags.get(b) || { cx: 0, cy: 0 }; st.tx = px * 10; st.ty = py * 6; mags.set(b, st);
      });
      b.addEventListener('pointerleave', function () { var st = mags.get(b); if (st) { st.tx = 0; st.ty = 0; } });
    });
  }

  /* ================= Мышь и прокрутка ================= */
  var mouseX = 0, mouseY = 0, scrollDirty = true, mouseDirty = false;
  window.addEventListener('pointermove', function (e) {
    mouseX = e.clientX / window.innerWidth - .5; mouseY = e.clientY / window.innerHeight - .5; mouseDirty = true;
    if (fine && e.pointerType === 'mouse') {
      var now = performance.now();
      if (now - lastSpark > 55 && Math.hypot(e.clientX - lx, e.clientY - ly) > 14) {
        var tg = e.target;
        if (!(tg && tg.closest && tg.closest('input,textarea,select'))) { spark(e.clientX, e.clientY); lastSpark = now; lx = e.clientX; ly = e.clientY; }
      }
    }
  }, { passive: true });
  window.addEventListener('scroll', function () { scrollDirty = true; }, { passive: true });
  var resizeT;
  window.addEventListener('resize', function () {
    scrollDirty = true;
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { layers.forEach(sizeLayer); buildChart(); }, 250);
  });

  /* ================= Главный цикл ================= */
  var orbitDims = { w: 0, h: 0, frame: 0 };
  function loop(ts) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    var vh = window.innerHeight, sy = window.scrollY;

    /* прогресс + шапка */
    if (scrollDirty) {
      var max = document.documentElement.scrollHeight - vh, p = max > 0 ? Math.min(1, Math.max(0, sy / max)) : 0;
      progBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      progCoin.style.transform = 'translateX(' + (p * (window.innerWidth - 14)).toFixed(1) + 'px)';
      if (nav) nav.classList.toggle('fx-scrolled', sy > 8);
    }

    /* параллакс плавающих иконок */
    if (scrollDirty || mouseDirty) {
      layers.forEach(function (L) {
        if (!L.visible || !L.floats.length) return;
        var r = L.el.getBoundingClientRect(), off = r.top + r.height / 2 - vh / 2;
        L.floats.forEach(function (f) {
          var d = parseFloat(f.depth);
          var x = L.mouse ? -mouseX * 36 * d : 0;
          var y = -off * .07 * d + (L.mouse ? -mouseY * 24 * d : 0);
          var key = x.toFixed(1) + ',' + y.toFixed(1);
          if (f.key !== key) { f.key = key; f.el.style.translate = key.replace(',', 'px ') + 'px'; }
        });
      });
      scrollDirty = false; mouseDirty = false;
    }

    /* орбита монет */
    if (orbit && heroL.visible) {
      if (!(orbitDims.frame++ % 30)) {
        var hr = heroPhoto.getBoundingClientRect();
        orbitDims.w = heroPhoto.offsetWidth; orbitDims.h = heroPhoto.offsetHeight;
        orbitDims.room = Math.min(hr.left + hr.width / 2, window.innerWidth - (hr.left + hr.width / 2)) - 28;
      }
      var w = orbitDims.w, h = orbitDims.h;
      var ax = Math.max(40, Math.min(w * .62, orbitDims.room)), ay = h * .58, a0 = ts * .00034;
      orbitItems.forEach(function (o) {
        var ang = a0 + o.ph, x = w / 2 + Math.cos(ang) * ax, y = h / 2 + Math.sin(ang) * ay;
        var depth = (Math.sin(ang) + 1) / 2;          // 0 — сзади (сверху), 1 — спереди (снизу)
        var sc = (.72 + depth * .5) * o.k;
        o.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
        var z = depth > .5 ? 3 : -1;
        if (o.z !== z) { o.z = z; o.el.style.zIndex = z; }
        o.el.style.opacity = (.55 + depth * .45).toFixed(2);
      });
    }

    /* пружины наклона/магнита */
    tilts.forEach(function (st, el) {
      st.cx += (st.tx - st.cx) * .14; st.cy += (st.ty - st.cy) * .14;
      var ang = Math.hypot(st.cx, st.cy);
      if (ang < .02 && !st.tx && !st.ty) { el.style.rotate = ''; tilts.delete(el); return; }
      el.style.rotate = (st.cy / ang).toFixed(3) + ' ' + (st.cx / ang).toFixed(3) + ' 0 ' + ang.toFixed(2) + 'deg';
    });
    mags.forEach(function (st, el) {
      st.cx += (st.tx - st.cx) * .2; st.cy += (st.ty - st.cy) * .2;
      if (Math.abs(st.cx) < .02 && Math.abs(st.cy) < .02 && !st.tx && !st.ty) { el.style.translate = ''; mags.delete(el); return; }
      el.style.translate = st.cx.toFixed(2) + 'px ' + st.cy.toFixed(2) + 'px';
    });
  }
  requestAnimationFrame(loop);
})();

