/* Vercel Web Analytics for the static site.
   The measurement script is served by Vercel at /_vercel/insights/script.js
   after Web Analytics is enabled. No npm packages are required.
   Local pages do not load the script and do not send events. */
(function () {
  'use strict';

  function isLocalHost() {
    var protocol = location.protocol;
    var host = String(location.hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
    return protocol === 'file:' ||
      host === '' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.slice(-6) === '.local';
  }

  var local = isLocalHost();
  var onceKeys = Object.create(null);

  function trackEvent(name, data, onceKey) {
    if (local) return;
    if (typeof name !== 'string' || !/^[a-z0-9_]{1,64}$/.test(name)) return;
    if (onceKey) {
      if (onceKeys[onceKey]) return;
      onceKeys[onceKey] = true;
    }

    var payload = { name: name };
    if (data && typeof data === 'object') {
      var allowed = { page: 1, table: 1, reason: 1, place: 1, control: 1, value: 1, sort: 1 };
      var clean = {};
      var count = 0;
      for (var key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        if (!allowed[key] || count >= 2) continue;
        var value = data[key];
        if (typeof value !== 'string') continue;
        if (!value || value.length > 40 || /@/.test(value) || /0x[a-f0-9]{8,}/i.test(value)) continue;
        clean[key] = value;
        count++;
      }
      if (count) payload.data = clean;
    }

    if (window.va) window.va('event', payload);
  }

  window.trackEvent = trackEvent;

  document.addEventListener('click', function (event) {
    var node = event.target;
    var link = node && node.closest ? node.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (!/t\.me\/|telegram\.me\//i.test(href)) return;

    var place = 'page';
    if (link.classList.contains('nav-exchange')) place = 'exchange';
    else if (link.closest('.mobile-menu')) place = 'mobile';
    else if (link.closest('nav')) place = 'nav';
    else if (link.closest('.hero')) place = 'hero';
    else if (link.closest('#contact') || link.classList.contains('contact-link')) place = 'contact';

    var consult = /t\.me\/ruslan_nasreddinov(?:[/?#]|$)/i.test(href);
    trackEvent(consult ? 'consultation_cta_click' : 'telegram_click', { place: place });
  });

  if (local) return;

  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  window.va('beforeSend', function (event) {
    if (isLocalHost()) return null;
    return event;
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();
