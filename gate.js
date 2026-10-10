/* ContentPad Arcade — game switches (2026-10-07).
   Arcade HQ can set any game to:
     live    listed and playable (the default)
     hidden  not listed in the Arcade, but its links still work
     off     not listed and not playable: this page sends the visitor to unavailable.html
   The switch lives in the API (GET /arcade/catalog answers only the games that are
   not live). This file is loaded first in every game page, every brand landing page,
   play.html and the Arcade home.

   On a game or landing page:  <script src="gate.js?v=1" data-game="<slug>"></script>
   On play.html:               <script src="gate.js?v=1" data-game-param="g"></script>
   On the Arcade home:         <script src="gate.js?v=1"></script>  then ArcadeStatus.ready

   The last answer is remembered on the device, so a game that is off stays off even
   if the API is briefly unreachable. With no answer at all (first visit, API down),
   games stay playable: an outage should never take the whole Arcade down. */
(function () {
  'use strict';
  var API = window.ARCADE_API || 'https://cpd-api.dex-fe2.workers.dev';
  var KEY = 'arcade_states_v1', FRESH = 10 * 60 * 1000, WAIT = 2500;
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { cached = null; }
  var states = (cached && cached.games) || {};

  function state(slug) { var s = states[slug]; return s === 'off' || s === 'hidden' ? s : 'live'; }

  var me = document.currentScript;
  var slug = '';
  if (me) {
    slug = me.getAttribute('data-game') || '';
    var param = me.getAttribute('data-game-param');
    if (!slug && param) { try { slug = new URLSearchParams(location.search).get(param) || ''; } catch (e) {} }
    slug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  function block() {
    var to = '/unavailable.html?g=' + encodeURIComponent(slug);
    if (location.pathname === '/unavailable.html') return;
    try { location.replace(to); } catch (e) { location.href = to; }
  }

  // A page for one game: decide before it is seen.
  var veil = null;
  if (slug) {
    if (state(slug) === 'off') { block(); }
    else if (!cached || Date.now() - (cached.at || 0) > FRESH) {
      // No recent answer on this device: keep the page out of sight until the API answers.
      veil = document.createElement('style');
      veil.textContent = 'html{visibility:hidden!important}';
      (document.head || document.documentElement).appendChild(veil);
    }
  }
  function unveil() { if (veil && veil.parentNode) veil.parentNode.removeChild(veil); veil = null; }

  var ready = new Promise(function (resolve) {
    var done = false;
    function finish() { if (done) return; done = true; resolve(states); }
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); finish(); }, WAIT);
    fetch(API + '/arcade/catalog', { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ok && d.games && typeof d.games === 'object') {
          states = d.games;
          try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), games: states })); } catch (e) {}
        }
      })
      .catch(function () {})
      .then(function () { clearTimeout(timer); finish(); });
  });

  ready.then(function () {
    if (slug && state(slug) === 'off') { block(); return; }
    unveil();
  });

  window.ArcadeStatus = {
    ready: ready,
    state: state,
    listed: function (slug) { return state(slug) === 'live'; },
    playable: function (slug) { return state(slug) !== 'off'; }
  };
})();

/* ── Arcade analytics + "make a game with us" (2026-10-10b) ─────────────────────
   gate.js is already the first script on every Arcade page, so this is the one
   place that can instrument all of them without touching each file.
   · Top-level pages load ContentPad's own beacon (link.contentpad.io/px.js): page
     views with referrer and UTM tags. No cookies, nothing stored on the device.
   · Game events go to the same endpoint as event 'game', tool "<action>:<slug>":
       open:<slug>  play.html opened a game          (top window, data-game-param)
       play:<slug>  first real input inside a game   (a framed game page, once per load)
       over:<slug>  the game posted {arcade:'over'} to the page hosting it
       out:<host>   an outbound link was clicked (brand sites, shops, mailto)
   · A "Make a game with us" mailto link opens an in-page form (collab.js) that
     files the enquiry into Fact Finder and Pipeline; without JS the mailto still works.
   Everything is wrapped: tracking must never be the reason a game breaks. */
(function () {
  'use strict';
  try {
    var EP = 'https://link.contentpad.io/px';
    var me = document.currentScript || null;
    var slug = '', param = '';
    if (me) {
      slug = me.getAttribute('data-game') || '';
      param = me.getAttribute('data-game-param') || '';
      if (!slug && param) { try { slug = new URLSearchParams(location.search).get(param) || ''; } catch (e) {} }
      slug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    }
    var top = true;
    try { top = window.top === window; } catch (e) { top = false; }

    var send = function (t) {
      try {
        var body = JSON.stringify({ e: 'game', h: location.hostname, p: location.pathname, t: String(t).slice(0, 60) });
        if (navigator.sendBeacon) navigator.sendBeacon(EP, new Blob([body], { type: 'text/plain' }));
        else fetch(EP, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' });
      } catch (e) {}
    };
    window.ArcadeTrack = { send: send };

    if (top) {
      // Page views, once per top-level page (px.js guards itself too).
      if (!document.querySelector('script[src*="link.contentpad.io/px.js"]')) {
        var px = document.createElement('script'); px.src = 'https://link.contentpad.io/px.js'; px.defer = true;
        (document.head || document.documentElement).appendChild(px);
      }
      if (param && slug) send('open:' + slug);
      // A game finished inside this page (play.html or a brand page).
      var seen = {};
      window.addEventListener('message', function (e) {
        try {
          if (e.origin !== location.origin) return;
          var d = e.data || {};
          if (d.arcade !== 'over' || typeof d.game !== 'string') return;
          var g = d.game.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
          var now = Date.now();
          if (!g || (seen[g] && now - seen[g] < 3000)) return; // one game-over, however many times it is posted
          seen[g] = now;
          send('over:' + g);
        } catch (x) {}
      });
    } else if (slug && !param) {
      // A game running inside a host page: count a play on the first real input.
      var played = false;
      var once = function () {
        if (played) return; played = true;
        send('play:' + slug);
        ['keydown', 'pointerdown', 'touchstart'].forEach(function (t) { window.removeEventListener(t, once, true); });
        clearInterval(pad);
      };
      ['keydown', 'pointerdown', 'touchstart'].forEach(function (t) { window.addEventListener(t, once, true); });
      // Keys forwarded from play.html arrive as messages, and a controller fires no DOM event.
      window.addEventListener('message', function (e) { try { if (e.data && e.data.arcade === 'key' && e.data.type === 'keydown') once(); } catch (x) {} });
      var pad = setInterval(function () {
        try {
          var ps = navigator.getGamepads ? navigator.getGamepads() : [];
          for (var i = 0; i < ps.length; i++) { var p = ps[i]; if (p && p.buttons && p.buttons.some(function (b) { return b && b.pressed; })) { once(); return; } }
        } catch (x) {}
      }, 400);
      setTimeout(function () { clearInterval(pad); }, 10 * 60 * 1000);
    }

    // Outbound clicks (and the collab form), from any Arcade page or game.
    document.addEventListener('click', function (e) {
      try {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (/^mailto:/i.test(href)) {
          if (top && /make%20a%20game|make a game/i.test(href) && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            var open = function () { if (window.ArcadeCollab) window.ArcadeCollab.open({ page: location.pathname }); else location.href = href; };
            if (window.ArcadeCollab) { open(); return; }
            var s = document.createElement('script'); s.src = '/collab.js?v=1';
            s.onload = open; s.onerror = function () { location.href = href; };
            document.head.appendChild(s);
            return;
          }
          send('out:mailto'); return;
        }
        var u = new URL(href, location.href);
        if (!/^https?:$/.test(u.protocol) || u.hostname === location.hostname) return;
        send('out:' + u.hostname.replace(/^www\./, ''));
      } catch (x) {}
    }, true);
  } catch (e) {}
})();
