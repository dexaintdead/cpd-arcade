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
