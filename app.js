/* ContentPad Arcade as an app (2026-10-05).
   Phones can't hide the browser's address bar from a web page — iPhone Safari has no
   full-screen API for pages at all. What they can do is run a site saved to the Home
   Screen as an app, full screen, with no browser bars. manifest.webmanifest and the
   apple-mobile-web-app tags make the Arcade one of those; this script tells people
   how, once, and offers the one-tap install where the browser supports it (Android,
   desktop Chrome/Edge). Nothing shows when the Arcade is already running as an app. */
(function () {
  var standalone = (window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)) || navigator.standalone === true;
  if (standalone) { document.documentElement.classList.add('as-app'); return; }

  var KEY = 'arcade_app_hint_v1';
  function seen() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  var ua = navigator.userAgent || '';
  var iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null;

  var css = '#appHint{position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483600;' +
    'width:min(560px,calc(100vw - 24px));display:flex;align-items:center;gap:14px;padding:14px 14px 14px 16px;border-radius:18px;' +
    'background:rgba(6,8,24,.92);border:1px solid rgba(201,214,255,.28);color:#eef1fb;box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 30px -10px rgba(94,224,255,.5);' +
    '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);font:500 14px/1.45 Inter,system-ui,sans-serif}' +
    '#appHint img{width:46px;height:46px;border-radius:11px;flex:none}' +
    '#appHint b{display:block;font-weight:800;font-size:14.5px;margin-bottom:2px}' +
    '#appHint .k{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid rgba(255,255,255,.4);border-radius:5px;font-size:12px;vertical-align:-4px;margin:0 2px}' +
    '#appHint .go{flex:none;font:800 13px Inter,system-ui,sans-serif;color:#07080f;background:linear-gradient(180deg,#fff,#d9deea 55%,#b9c1d6);border:0;border-radius:999px;padding:10px 14px;cursor:pointer}' +
    '#appHint .x{flex:none;background:none;border:0;color:#a3abc8;font-size:22px;line-height:1;cursor:pointer;padding:4px 6px}';

  function show(html, install) {
    if (document.getElementById('appHint')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'appHint'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Play full screen');
    d.innerHTML = '<img src="/apple-touch-icon.png" alt=""><div style="flex:1;min-width:0">' + html + '</div>' +
      (install ? '<button class="go" type="button">Install</button>' : '') +
      '<button class="x" type="button" aria-label="Dismiss">×</button>';
    document.body.appendChild(d);
    d.querySelector('.x').addEventListener('click', function () { remember(); d.remove(); });
    var go = d.querySelector('.go');
    if (go) go.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { remember(); d.remove(); deferred = null; });
    });
  }

  // Android / desktop Chrome & Edge: the browser offers a real install button.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    if (seen()) return;
    show('<b>Play full screen</b>Install the Arcade and the games open like an app, with no browser bars.', true);
  });

  // iPhone / iPad Safari: there is no button a page can press, so say where it is.
  if (iOS && !seen()) {
    setTimeout(function () {
      show('<b>Play full screen</b>Tap <span class="k">⬆︎</span> Share, then <b style="display:inline">Add to Home Screen</b>. The Arcade opens like an app, with no address bar.');
    }, 1800);
  }
})();
