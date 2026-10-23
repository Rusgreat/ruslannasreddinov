/* Google Analytics 4. One counter for every public page.
   Paste the measurement ID from https://analytics.google.com
   It looks like G-1A2BCD3EFG. Leave it empty until then: nothing is sent. */
(function () {
  var id = '';
  if (!/^G-[A-Z0-9]+$/.test(id)) return;

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('set', 'allow_google_signals', false);
  gtag('set', 'allow_ad_personalization_signals', false);
  gtag('config', id, { send_page_view: true });
})();
