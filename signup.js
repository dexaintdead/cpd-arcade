/* signup.js — brand sign-up lists on Arcade brand pages, build 2026-10-10b.
   Renders into <section data-arcade-signup="<brand>" data-accent="#hex" data-accent2="#hex"
   data-title="…" data-text="…"></section>. Each brand has its own lead form, so every
   sign-up lands in Fact Finder tagged with the brand and the game — a count a brand
   partner can be shown. Explicit, unticked consent box; nothing is sent without it. */
(function () {
  'use strict';
  var API = window.ARCADE_API || 'https://cpd-api.dex-fe2.workers.dev';
  var BRANDS = {
    'toy-tokyo': { name: 'Toy Tokyo', title: 'Get the next drop first', text: 'New capsules, new games and Gacha World events from Toy Tokyo and the ContentPad Arcade, in your inbox.', btn: 'Keep me posted' },
    'pregame-papers': { name: 'Pregame Papers', title: 'Get the next game first', text: 'New Pregame Papers party games — printable and playable — the day they drop.', btn: 'Send me the next one' }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var css = document.createElement('style');
  css.textContent =
    '.asu{max-width:960px;margin:48px auto;padding:0 16px;box-sizing:border-box}' +
    '.asu .in{border-radius:20px;padding:28px 26px;border:2px solid var(--asu-a);background:rgba(0,0,0,.35);display:grid;grid-template-columns:1.1fr 1fr;gap:22px;align-items:center}' +
    '@media (max-width:720px){.asu .in{grid-template-columns:1fr;padding:22px 18px}}' +
    '.asu h2{margin:0 0 8px;font-size:clamp(22px,3.4vw,32px);line-height:1.08;color:#fff}' +
    '.asu p{margin:0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.5}' +
    '.asu form{display:flex;flex-direction:column;gap:10px}' +
    '.asu .rw{display:flex;gap:8px;flex-wrap:wrap}' +
    '.asu input[type=email]{flex:1 1 200px;min-width:0;box-sizing:border-box;border-radius:999px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.45);color:#fff;padding:13px 16px;font:600 15px system-ui,-apple-system,sans-serif}' +
    '.asu input[type=email]:focus{outline:none;border-color:var(--asu-a)}' +
    '.asu button{border:0;border-radius:999px;padding:13px 20px;font:800 14px system-ui,-apple-system,sans-serif;letter-spacing:.02em;cursor:pointer;background:var(--asu-a);color:#0b0b12;white-space:nowrap}' +
    '.asu button[disabled]{opacity:.6;cursor:wait}' +
    '.asu label.c{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.4;color:rgba(255,255,255,.7);cursor:pointer}' +
    '.asu label.c input{margin-top:2px;accent-color:var(--asu-a);width:16px;height:16px;flex:0 0 auto}' +
    '.asu .m{font-size:13px;min-height:18px;color:var(--asu-b)}' +
    '.asu .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}';
  document.head.appendChild(css);

  function mount(el) {
    var key = el.getAttribute('data-arcade-signup'), b = BRANDS[key];
    if (!b || el.__asu) return; el.__asu = 1;
    var a = el.getAttribute('data-accent') || '#5ee0ff', a2 = el.getAttribute('data-accent2') || '#ffffff';
    var consent = 'Email me news, drops and new games from ' + b.name + ' and the ContentPad Arcade. Unsubscribe any time.';
    el.className = (el.className ? el.className + ' ' : '') + 'asu';
    el.style.setProperty('--asu-a', a); el.style.setProperty('--asu-b', a2);
    el.setAttribute('aria-label', b.name + ' sign-up');
    el.innerHTML =
      '<div class="in"><div><h2>' + esc(el.getAttribute('data-title') || b.title) + '</h2><p>' + esc(el.getAttribute('data-text') || b.text) + '</p></div>' +
      '<form novalidate><div class="rw"><input type="email" name="email" placeholder="you@email.com" autocomplete="email" required aria-label="Email" maxlength="160">' +
      '<button type="submit">' + esc(b.btn) + '</button></div>' +
      '<label class="c"><input type="checkbox" name="consent"> <span>' + esc(consent) + '</span></label>' +
      '<div class="hp" aria-hidden="true"><input name="_hp" tabindex="-1" autocomplete="off"></div>' +
      '<div class="m" role="status"></div></form></div>';
    var f = el.querySelector('form'), m = el.querySelector('.m'), btn = el.querySelector('button');
    f.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = f.elements.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { m.textContent = 'That email does not look right.'; f.elements.email.focus(); return; }
      if (!f.elements.consent.checked) { m.textContent = 'Tick the box so we can email you.'; return; }
      btn.disabled = true; m.textContent = 'Adding you…';
      try {
        var r = await fetch(API + '/arcade/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand: key, email: email, consent: true, consent_text: consent, page: location.pathname, _hp: f.elements._hp.value }) });
        var j = await r.json().catch(function () { return {}; });
        if (!r.ok || !j.ok) { m.textContent = j.message || 'That did not go through. Try again in a moment.'; btn.disabled = false; return; }
        try { if (window.ArcadeTrack) window.ArcadeTrack.send('lead:' + key); } catch (x) {}
        f.innerHTML = '<p style="font-weight:800;color:#fff;font-size:17px">You’re on the list. ✨</p><p>Watch your inbox for the next one.</p>';
      } catch (x) { m.textContent = 'Could not reach us. Try again in a moment.'; btn.disabled = false; }
    });
  }
  function run() { [].forEach.call(document.querySelectorAll('[data-arcade-signup]'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
