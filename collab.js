/* collab.js — "Make a game with us", build 2026-10-10b.
   Opened by gate.js when someone clicks a "Make a game with ContentPad" mailto link
   anywhere in the Arcade. One enquiry lands in Fact Finder (Inbound) AND Pipeline as a
   prospecting deal, Dex gets a bell + email, and the sender gets an acknowledgement.
   Self-contained: its own styles, no native dialogs, Esc / backdrop / ✕ close it. */
(function () {
  'use strict';
  if (window.ArcadeCollab) return;
  var API = window.ARCADE_API || 'https://cpd-api.dex-fe2.workers.dev';
  var CSS =
    '#acb{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(3,4,12,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
    '#acb.show{display:flex}' +
    '#acb .bx{position:relative;width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow:auto;background:linear-gradient(160deg,#121636,#0b0d22);border:1px solid rgba(94,224,255,.32);border-radius:18px;padding:26px 24px 22px;color:#eef1fb;font:400 15px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 30px 80px -20px rgba(46,124,246,.55)}' +
    '#acb .k{font:700 11px/1 Menlo,Consolas,monospace;letter-spacing:.2em;color:#5ee0ff;text-transform:uppercase}' +
    '#acb h2{font:800 26px/1.15 Michroma,Inter,system-ui,sans-serif;margin:10px 0 6px;color:#fff;letter-spacing:.01em}' +
    '#acb p.sub{color:#a3abc8;margin:0 0 16px;font-size:14px}' +
    '#acb .g{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#acb .full{grid-column:1/-1}' +
    '@media (max-width:520px){#acb .g{grid-template-columns:1fr}#acb .bx{padding:22px 16px 18px}}' +
    '#acb label{display:flex;flex-direction:column;gap:5px;font:700 10px/1.2 Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:#a3abc8}' +
    '#acb input,#acb select,#acb textarea{width:100%;box-sizing:border-box;background:rgba(5,6,17,.6);border:1px solid rgba(201,214,255,.18);border-radius:10px;color:#fff;padding:11px 12px;font:500 15px Inter,system-ui,sans-serif;letter-spacing:0;text-transform:none}' +
    '#acb input:focus,#acb select:focus,#acb textarea:focus{outline:none;border-color:#5ee0ff;box-shadow:0 0 0 3px rgba(94,224,255,.15)}' +
    '#acb textarea{min-height:92px;resize:vertical}' +
    '#acb .row{display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap}' +
    '#acb .go{background:linear-gradient(135deg,#2e7cf6,#9333ea);color:#fff;border:0;border-radius:999px;padding:13px 22px;font:700 12px Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}' +
    '#acb .go[disabled]{opacity:.6;cursor:wait}' +
    '#acb .x{position:absolute;right:12px;top:12px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(201,214,255,.2);background:transparent;color:#c9d6ff;font-size:16px;cursor:pointer}' +
    '#acb .msg{font-size:13px;color:#f0a0a0;min-height:18px}' +
    '#acb .ok{display:none;text-align:center;padding:20px 4px 6px}' +
    '#acb .ok b{display:block;font:800 22px Michroma,Inter,sans-serif;color:#fff;margin-bottom:8px}' +
    '#acb .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '#acb .fine{font-size:11px;color:#6b7395;margin-top:12px}';

  var HTML =
    '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="acb-h">' +
      '<button class="x" type="button" data-acb="close" aria-label="Close">✕</button>' +
      '<form id="acb-f" novalidate>' +
        '<div class="k">ContentPad Arcade</div>' +
        '<h2 id="acb-h">Your brand, playable.</h2>' +
        '<p class="sub">We design and build original games for brands, venues and artists, then put them in front of players here and everywhere you share them. Tell us about yours.</p>' +
        '<div class="g">' +
          '<label>Name<input name="name" autocomplete="name" required maxlength="120"></label>' +
          '<label>Email<input name="email" type="email" autocomplete="email" required maxlength="160"></label>' +
          '<label>Brand or company<input name="company" autocomplete="organization" maxlength="140"></label>' +
          '<label>Website<input name="website" inputmode="url" placeholder="yourbrand.com" maxlength="200"></label>' +
          '<label class="full">What should the game do for you?<textarea name="idea" maxlength="2000" placeholder="Launch a drop, fill a venue, sell a product, grow a list… and what it should feel like."></textarea></label>' +
          '<label>Timeline<select name="timeline"><option value="">Choose one</option><option>As soon as possible</option><option>In the next month</option><option>1–3 months</option><option>Just exploring</option></select></label>' +
          '<label>Budget<select name="budget"><option value="">Choose one</option><option>Under $5k</option><option>$5k–$15k</option><option>$15k–$50k</option><option>$50k+</option><option>Not sure yet</option></select></label>' +
          '<label>Phone (optional)<input name="phone" type="tel" autocomplete="tel" maxlength="40"></label>' +
        '</div>' +
        '<div class="hp" aria-hidden="true"><label>Leave empty<input name="_hp" tabindex="-1" autocomplete="off"></label></div>' +
        '<div class="row"><button class="go" type="submit">Send it</button><span class="msg" id="acb-m" role="status"></span></div>' +
        '<div class="fine">Goes straight to Dex at ContentPad. We will only use it to reply to you.</div>' +
      '</form>' +
      '<div class="ok" id="acb-ok"><b>Got it.</b>Dex will come back to you personally — check your inbox for a confirmation.<div class="row" style="justify-content:center"><button class="go" type="button" data-acb="close">Back to the games</button></div></div>' +
    '</div>';

  var root = null, last = null, page = '';
  function build() {
    if (root) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'acb'; root.innerHTML = HTML; document.body.appendChild(root);
    root.addEventListener('click', function (e) { if (e.target === root || e.target.closest('[data-acb="close"]')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('show')) close(); });
    root.querySelector('#acb-f').addEventListener('submit', submit);
  }
  function close() { root.classList.remove('show'); try { if (last && last.focus) last.focus(); } catch (e) {} }
  function open(o) {
    build(); page = (o && o.page) || location.pathname; last = document.activeElement;
    root.querySelector('#acb-f').style.display = ''; root.querySelector('#acb-ok').style.display = 'none';
    root.querySelector('#acb-m').textContent = '';
    root.classList.add('show');
    setTimeout(function () { try { root.querySelector('input[name="name"]').focus(); } catch (e) {} }, 30);
  }
  async function submit(e) {
    e.preventDefault();
    var f = e.target, m = root.querySelector('#acb-m'), b = f.querySelector('.go');
    var v = {}; ['name', 'email', 'company', 'website', 'idea', 'timeline', 'budget', 'phone', '_hp'].forEach(function (k) { v[k] = (f.elements[k] && f.elements[k].value || '').trim(); });
    if (v.name.length < 2) { m.textContent = 'Your name, please.'; f.elements.name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { m.textContent = 'That email does not look right.'; f.elements.email.focus(); return; }
    v.page = page; b.disabled = true; m.textContent = 'Sending…';
    try {
      var r = await fetch(API + '/arcade/collab', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) });
      var j = await r.json().catch(function () { return {}; });
      if (!r.ok || !j.ok) { m.textContent = j.message || 'That did not go through. Email support@contentpad.io instead.'; b.disabled = false; return; }
      try { if (window.ArcadeTrack) window.ArcadeTrack.send('lead:collab'); } catch (x) {}
      f.reset(); f.style.display = 'none'; root.querySelector('#acb-ok').style.display = 'block'; b.disabled = false;
    } catch (x) { m.textContent = 'Could not reach us. Email support@contentpad.io instead.'; b.disabled = false; }
  }
  window.ArcadeCollab = { open: open };
})();
