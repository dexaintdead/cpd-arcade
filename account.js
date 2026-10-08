/* ContentPad Arcade — player accounts, cloud saves and leaderboards (build 2026100801-acct: + Night Drive, time boards).

   Sign in with an email + 6-digit code. Progress then follows the player to any device:
   the Arcade page pulls the cloud save into this device's storage BEFORE the game loads,
   and pushes after every run. The server merges (best of both), so nothing is ever lost
   to a stale device. Signed out — or if the API is not reachable — everything still works
   exactly as before, saved on this device only.

   The games themselves are untouched: this reads and writes the same localStorage keys
   they already use (same origin). */
(function () {
  'use strict';
  var API = window.ARCADE_API || 'https://cpd-api.dex-fe2.workers.dev';
  var TK = 'arcade_token', PK = 'arcade_player';
  // Signing in with ContentPad: the dashboard hands over a one-time code (see redeem below).
  var GO = 'https://app.contentpad.io/arcade-go.html';

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }
  function c2(n) { return Math.round((+n || 0) * 100) / 100; }
  function lsj(k) { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Number(n || 0).toLocaleString(); }
  function fmtTime(ms) { ms = Math.round(ms || 0); var m = Math.floor(ms / 60000), s = (ms % 60000) / 1000; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); }

  // ── what each game keeps on this device ──────────────────────────────────
  var ADAPT = {
    'skyline-dash': {
      read: function () {
        var s = lsj('skyline_levels') || {};
        return { levels: s.levels || {}, endless: s.endless || 0, hints: s.hints || {} };
      },
      empty: function (d) { return !Object.keys(d.levels || {}).length && !d.endless; },
      write: function (d) {
        var cur = lsj('skyline_levels') || {};
        cur.levels = d.levels || {}; cur.endless = d.endless || 0; cur.hints = d.hints || {};
        ls('skyline_levels', JSON.stringify(cur));
        var t = 0; for (var k in cur.levels) t += (cur.levels[k] && cur.levels[k].score) || 0;
        ls('skyline_best', String(t));
      }
    },
    'tre-and-jada': {
      read: function () {
        var save = lsj('tj_save'), json = JSON.stringify(save || null), sync = lsj('arcade_sync_tj');
        // The checkpoint is newest-wins, so it needs a time. A device that has
        // never synced and has no checkpoint has nothing to say (time 0).
        var at = sync ? (json !== sync.json ? Date.now() : (sync.at || 0)) : (save ? Date.now() : 0);
        return { endings: lsj('tj_endings') || {}, save: save || null, save_at: at };
      },
      empty: function (d) { return !Object.keys(d.endings || {}).length && !d.save; },
      write: function (d) {
        ls('tj_endings', JSON.stringify(d.endings || {}));
        if (d.save) ls('tj_save', JSON.stringify(d.save)); else ls('tj_save', null);
        ls('arcade_best_tre-and-jada', String(Object.keys(d.endings || {}).length));
        ls('arcade_sync_tj', JSON.stringify({ json: JSON.stringify(d.save || null), at: d.save_at || 0 }));
      }
    },
    // High Flying (Slapwoods): best score, stages unlocked and medals only ever go up.
    'high-flying': {
      read: function () {
        var s = lsj('hf_save') || {};
        return { best: s.best || 0, unlocked: s.unlocked || 1, medals: s.medals || {} };
      },
      empty: function (d) { return !d.best && (d.unlocked || 1) <= 1; },
      write: function (d) {
        var cur = lsj('hf_save') || {};
        cur.best = Math.max(cur.best || 0, d.best || 0); cur.unlocked = Math.max(cur.unlocked || 1, d.unlocked || 1);
        cur.medals = cur.medals || {}; for (var k in (d.medals || {})) if (d.medals[k]) cur.medals[k] = true;
        ls('hf_save', JSON.stringify(cur)); ls('arcade_best_high-flying', String(cur.best));
        try { window.dispatchEvent(new Event('arcade:sync')); } catch (e) {}
      }
    },
    // Dex Ain't Dead Casino: play-money bankroll in US dollars, kept to the cent. The newest bankroll wins (chips_at); peak, lifetime winnings and rounds only go up.
    'dad-casino': {
      read: function () {
        var b = lsj('dad_casino');
        if (!b) return { chips: null, chips_at: 0, peak: 0, won: 0, net: 0, house: 0, hands: 0, biggest: 0, bonus_at: 0 };
        return { chips: c2(b.chips), chips_at: b.at || 0, peak: c2(b.peak), won: c2(b.won), net: c2(b.net), house: c2(b.house), hands: b.hands || 0, biggest: c2(b.biggest), bonus_at: b.bonus_at || 0 };
      },
      empty: function (d) { return d.chips == null && !d.hands; },
      write: function (d) {
        if (!d || d.chips == null) return;
        var cur = lsj('dad_casino') || {};
        cur.chips = Math.max(0, c2(d.chips)); cur.at = d.chips_at || cur.at || 0; if (d.net != null) cur.net = c2(d.net); if (d.house != null) cur.house = c2(d.house);
        cur.peak = Math.max(cur.peak || 0, d.peak || 0, cur.chips); cur.won = Math.max(cur.won || 0, d.won || 0);
        cur.hands = Math.max(cur.hands || 0, d.hands || 0); cur.biggest = Math.max(cur.biggest || 0, d.biggest || 0);
        cur.bonus_at = Math.max(cur.bonus_at || 0, d.bonus_at || 0);
        ls('dad_casino', JSON.stringify(cur)); ls('arcade_best_dad-casino', String(cur.peak));
        try { window.dispatchEvent(new Event('arcade:sync')); } catch (e) {}
      }
    },
    // YESTERDAYLAND: Night Drive (2026-10-08): the wallet is lifetime earned and spent (both only go up), plus the
    // garage, the drives opened, wins and lap records. The server merges; this adopts the merged save.
    'night-drive': {
      read: function () {
        var s = lsj('nd_save') || {};
        return { cash: s.cash || 0, earned: s.earned != null ? s.earned : (s.cash || 0), spent: s.spent || 0, cash_at: s.cash_at || 0, car: s.car || 'hatch', cars: s.cars || {},
          unlocked: s.unlocked || 1, laps: s.laps || {}, wins: s.wins || 0, races: s.races || 0, podiums: s.podiums || {} };
      },
      empty: function (d) { return !d.earned && !d.races && !Object.keys(d.laps || {}).length; },
      write: function (d) {
        if (!d) return;
        var cur = lsj('nd_save') || {};
        ['cash', 'earned', 'spent', 'cash_at', 'car', 'cars', 'unlocked', 'laps', 'wins', 'races', 'podiums'].forEach(function (k) { if (d[k] != null) cur[k] = d[k]; });
        ls('nd_save', JSON.stringify(cur)); ls('arcade_best_night-drive', String(cur.wins || 0));
        try { window.dispatchEvent(new Event('arcade:sync')); } catch (e) {}
      }
    }
  };

  // ── API ──────────────────────────────────────────────────────────────────
  var state = { player: lsj(PK), token: ls(TK) || '', online: null, listeners: [] };
  function emit() { state.listeners.forEach(function (f) { try { f(state.player); } catch (e) {} }); if (chip || state.online) paintChip(); }
  function setSession(token, player) {
    state.token = token || ''; state.player = player || null;
    ls(TK, token || null); ls(PK, player ? JSON.stringify(player) : null);
    emit();
  }
  function call(method, path, body, opts) {
    var h = { 'Content-Type': 'application/json' };
    if (state.token) h['X-Arcade-Token'] = state.token;
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, (opts && opts.timeout) || 9000);
    return fetch(API + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, keepalive: !!(opts && opts.keepalive), signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        clearTimeout(to);
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401 && state.token && path.indexOf('/arcade/auth/') !== 0) setSession('', null);   // token revoked or expired
          j = j || {}; j._status = r.status;
          // The Arcade module answers in snake_case; anything else at 404 is the API without it (not deployed yet).
          if (r.status === 404 && !/^[a-z_]+$/.test(j.error || '')) j.error = 'offline';
          return j;
        });
      }, function () { clearTimeout(to); return { ok: false, error: 'offline', _status: 0 }; });
  }

  // Is the account service live yet? (Before the worker ships, every call 404s.)
  var onlineP = null;
  function online() {
    if (!onlineP) onlineP = call('GET', '/arcade/leaderboard?game=skyline-dash&limit=1', null, { timeout: 6000 })
      .then(function (j) { state.online = !!j.ok; return state.online; });
    return onlineP;
  }

  function syncGame(game, event, opts) {
    var A = ADAPT[game]; if (!A || !state.token) return Promise.resolve(null);
    var local = A.read();
    return call('POST', '/arcade/save', { game: game, data: local, event: event || '' }, opts).then(function (j) {
      if (j.ok && j.data) A.write(j.data);
      return j.ok ? j : null;
    });
  }
  // Pull + push every game. Games never played on this device or in the cloud are left alone.
  function syncAll() {
    if (!state.token) return Promise.resolve(null);
    return call('GET', '/arcade/saves').then(function (j) {
      if (!j.ok) return null;
      var saves = j.saves || {};
      return Promise.all(Object.keys(ADAPT).map(function (g) {
        var A = ADAPT[g];
        if (!A.empty(A.read())) return syncGame(g);
        if (saves[g] && saves[g].data) A.write(saves[g].data);
        return null;
      })).then(function (r) { emit(); return r; });   // pages repaint bests from the merged saves
    });
  }
  function refreshMe() {
    if (!state.token) return Promise.resolve(null);
    return call('GET', '/arcade/me').then(function (j) { if (j.ok) { state.player = j.player; ls(PK, JSON.stringify(j.player)); emit(); } return j; });
  }

  // ── styles ───────────────────────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent =
    '.acct-chip{display:inline-flex;align-items:center;gap:8px;margin-left:auto;padding:7px 14px;border-radius:999px;font:800 12px Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:rgba(61,107,255,.22);border:1px solid var(--line2);cursor:pointer;white-space:nowrap;max-width:46vw;overflow:hidden;text-overflow:ellipsis}' +
    '.acct-chip:hover{box-shadow:0 0 16px rgba(61,107,255,.45)}.acct-chip i{width:8px;height:8px;border-radius:50%;background:#45e19a;box-shadow:0 0 8px #45e19a;flex:none}' +
    '.acct-chip + .clock{margin-left:14px}' +
    '@media (max-width:520px){.bar .nav{display:none}.acct-chip{font-size:11px;padding:6px 11px}.acct-chip .lg{display:none}}' +
    '#acct{position:fixed;inset:0;z-index:200;display:none;place-items:center;padding:16px;background:rgba(2,3,13,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}#acct.open{display:grid}' +
    '#acct .box{width:100%;max-width:420px;background:linear-gradient(180deg,rgba(22,34,86,.96),rgba(8,12,40,.97));border:1px solid var(--line2);border-radius:20px;padding:24px 22px 20px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 40px rgba(61,107,255,.25);position:relative;max-height:92vh;overflow:auto}' +
    '#acct h3{margin:0 0 6px;font:400 18px Michroma,sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '#acct p{margin:0 0 14px;color:var(--dim);font-size:14px;line-height:1.55}' +
    '#acct label{display:block;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ice);margin:0 0 6px}' +
    '#acct input[type=email],#acct input[type=text]{width:100%;font:600 16px Inter,system-ui,sans-serif;color:#fff;background:rgba(2,6,30,.7);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;margin:0 0 14px;outline:none}' +
    '#acct input:focus{border-color:var(--ice);box-shadow:0 0 0 3px rgba(143,208,255,.18)}' +
    '#acct input.code{font:800 28px/1 Michroma,monospace;letter-spacing:.42em;text-align:center;padding:14px 8px}' +
    '#acct .chk{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--dim);line-height:1.5;margin:0 0 16px;cursor:pointer;text-transform:none;letter-spacing:0;font-weight:500}' +
    '#acct .chk input{width:18px;height:18px;margin:2px 0 0;flex:none;accent-color:#3d6bff}' +
    '#acct .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}#acct .btn{padding:11px 18px;font-size:13px}' +
    '#acct .x{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:rgba(2,6,30,.6);color:#fff;font-size:16px;cursor:pointer}' +
    '#acct .msg{min-height:20px;font-size:13px;margin:-4px 0 12px;color:#ff9fb8}#acct .msg.ok{color:#8ff0bf}' +
    '#acct .fine{font-size:12px;color:var(--mute);margin:14px 0 0;line-height:1.5}' +
    '#acct .link{background:none;border:0;color:var(--ice);font:700 13px Inter,sans-serif;cursor:pointer;padding:6px 0;text-decoration:underline}' +
    '#acct .who{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:12px;border:1px solid var(--line);border-radius:14px;background:rgba(2,6,30,.45)}' +
    '#acct .who b{display:block;font-size:16px}#acct .who small{color:var(--mute);font-size:12.5px;word-break:break-all}' +
    '#acct .av{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font:400 16px Michroma,sans-serif;background:linear-gradient(160deg,#ff4fd8,#3d6bff);flex:none}' +
    '.lb{list-style:none;margin:0;padding:0;display:grid;gap:4px}' +
    '.lb li{display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center;padding:7px 9px;border-radius:10px;font-size:13.5px;background:rgba(2,6,30,.35)}' +
    '.lb li .n{font:400 11px Michroma,sans-serif;color:var(--mute);text-align:center}.lb li:nth-child(1) .n{color:#ffd166}.lb li:nth-child(2) .n{color:#dfe7ff}.lb li:nth-child(3) .n{color:#f0a36b}' +
    '.lb li .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.lb li b{font-family:Michroma,sans-serif;font-size:12px;color:var(--gold)}' +
    '.lb li.you{background:rgba(61,107,255,.28);box-shadow:0 0 0 1px var(--line2) inset}.lb li.gap{background:none;padding:0 9px;color:var(--mute);display:block;text-align:center;font-size:12px}' +
    '.lb-empty{color:var(--mute);font-size:13.5px;padding:6px 0}' +
    '.lb-sel{width:100%;margin:0 0 10px;font:700 13px Inter,sans-serif;color:#fff;background:rgba(2,6,30,.6);border:1px solid var(--line2);border-radius:10px;padding:8px 10px}' +
    '.acct-cta{margin-top:10px;width:100%;justify-content:center}' +
    '#acct .cpd-or{display:flex;align-items:center;gap:10px;margin:16px 0 12px;color:var(--mute);font-size:12px;text-transform:uppercase;letter-spacing:.16em}#acct .cpd-or:before,#acct .cpd-or:after{content:"";flex:1;height:1px;background:var(--line)}' +
    '#acct .cpd-sso{display:flex;justify-content:center;width:100%;text-decoration:none}' +
    '.acct-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,30px);opacity:0;z-index:150;padding:10px 18px;border-radius:999px;font:800 13px Inter,sans-serif;letter-spacing:.04em;background:rgba(8,12,40,.92);border:1px solid var(--line2);color:#fff;transition:.35s;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.5)}.acct-toast.on{opacity:1;transform:translate(-50%,0)}';
  document.head.appendChild(css);

  // ── header chip ──────────────────────────────────────────────────────────
  var chip = null;
  function paintChip() {
    if (!chip) {
      var bar = document.querySelector('.bar .wrap'); if (!bar) return;
      chip = document.createElement('button'); chip.type = 'button'; chip.className = 'acct-chip'; chip.id = 'acctChip';
      chip.addEventListener('click', function () { open(); });
      var clock = bar.querySelector('.clock'); bar.insertBefore(chip, clock || null);
    }
    chip.innerHTML = state.player ? '<i></i>' + esc(state.player.name) : 'Sign in<span class="lg">&nbsp;· save progress</span>';
    chip.title = state.player ? 'Your Arcade account' : 'Sign in to save your progress and get on the leaderboards';
  }

  // ── the sign-in / profile panel ──────────────────────────────────────────
  var M = null, flow = { email: '' }, lastFocus = null;
  function modal() {
    if (M) return M;
    M = document.createElement('div'); M.id = 'acct'; M.setAttribute('role', 'dialog'); M.setAttribute('aria-modal', 'true'); M.setAttribute('aria-labelledby', 'acctH');
    M.innerHTML = '<div class="box"><button class="x" type="button" aria-label="Close">✕</button><div id="acctBody"></div></div>';
    document.body.appendChild(M);
    M.addEventListener('click', function (e) { if (e.target === M || e.target.classList.contains('x')) close(); });
    M.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } e.stopPropagation(); });
    M.addEventListener('keyup', function (e) { e.stopPropagation(); });
    return M;
  }
  function body(html) { modal(); document.getElementById('acctBody').innerHTML = html; var f = M.querySelector('input,button.btn'); if (f) setTimeout(function () { f.focus(); }, 30); }
  function msg(t, ok) { var m = M && M.querySelector('.msg'); if (m) { m.textContent = t || ''; m.className = 'msg' + (ok ? ' ok' : ''); } }
  function busy(btn, on, label) { if (!btn) return; btn.disabled = on; if (label) btn.textContent = label; }
  var ERR = {
    bad_email: 'That email doesn\'t look right.', wait: 'Hang on a few seconds before asking for another code.',
    too_many_today: 'That\'s a lot of codes for one day. Try again tomorrow.', send_failed: 'We couldn\'t send the email. Try again in a minute.',
    email_not_configured: 'Email isn\'t switched on yet. Try again later.',
    bad_code: 'That code isn\'t right.', expired: 'That code has expired. Get a new one.', too_many_tries: 'Too many tries. Get a new code.',
    name_format: 'Use 2–16 letters, numbers, spaces, dots, dashes or underscores, starting with a letter or number.',
    name_not_allowed: 'Pick a different name.', name_taken: 'Someone already has that name.',
    offline: 'Accounts aren\'t online yet. Your progress is still saved on this device.', server_error: 'Something went wrong on our side. Try again.'
  };
  function errText(j) { return ERR[j.error] || ('Something went wrong (' + (j.error || j._status) + ').'); }

  function open() {
    lastFocus = document.activeElement;
    modal().classList.add('open');
    if (state.player) return profile();
    online().then(function (on) {
      if (!on) return body('<h3 id="acctH">Arcade accounts</h3><p>Accounts are switching on shortly. Until then your progress is saved on this device — nothing you play now is lost, it will sync the first time you sign in.</p><div class="row"><button class="btn ghost" type="button" data-x>OK</button></div>');
      stepEmail();
    });
  }
  function close() { if (M) M.classList.remove('open'); try { if (lastFocus) lastFocus.focus(); } catch (e) {} }
  function stepEmail() {
    body('<h3 id="acctH">Save your progress</h3>' +
      '<p>Sign in with your email and your levels, stars, endings and high scores follow you to any device — and you get on the leaderboards. Free. No password: we email you a code.</p>' +
      '<form id="fEmail"><label for="aEmail">Email</label><input id="aEmail" type="email" autocomplete="email" inputmode="email" required value="' + esc(flow.email) + '" placeholder="you@example.com">' +
      '<div class="msg"></div><div class="row"><button class="btn play" type="submit">Email me a code</button></div></form>' +
      '<div class="cpd-or"><span>or</span></div>' +
      '<a class="btn ghost cpd-sso" href="' + esc(GO + '?back=' + encodeURIComponent(location.pathname + location.search)) + '">Continue with ContentPad</a>' +
      '<p class="fine">We use your email to sign you in, and for Arcade news only if you say so on the next step. ContentPad members are signed in with their ContentPad account.</p>');
    document.getElementById('fEmail').addEventListener('submit', function (e) {
      e.preventDefault(); var btn = this.querySelector('button'); flow.email = document.getElementById('aEmail').value.trim();
      busy(btn, true, 'Sending…'); msg('');
      call('POST', '/arcade/auth/start', { email: flow.email }).then(function (j) {
        busy(btn, false, 'Email me a code');
        if (j.ok) stepCode(); else msg(errText(j) + (j.retry_in ? ' (' + j.retry_in + 's)' : ''));
      });
    });
  }
  function stepCode() {
    body('<h3 id="acctH">Check your email</h3><p>We sent a 6-digit code to <b style="color:#fff">' + esc(flow.email) + '</b>. It works for 15 minutes. Can\'t see it? Check spam or promotions.</p>' +
      '<form id="fCode"><label for="aCode">Code</label><input id="aCode" class="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required>' +
      '<div class="msg"></div><div class="row"><button class="btn play" type="submit">Sign in</button><button class="link" type="button" id="aBack">Use a different email</button><button class="link" type="button" id="aAgain">Send a new code</button></div></form>');
    var inp = document.getElementById('aCode');
    inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); if (inp.value.length === 6) document.getElementById('fCode').requestSubmit && document.getElementById('fCode').requestSubmit(); });
    document.getElementById('aBack').addEventListener('click', stepEmail);
    document.getElementById('aAgain').addEventListener('click', function () {
      call('POST', '/arcade/auth/start', { email: flow.email }).then(function (j) { msg(j.ok ? 'New code sent.' : errText(j) + (j.retry_in ? ' (' + j.retry_in + 's)' : ''), j.ok); });
    });
    document.getElementById('fCode').addEventListener('submit', function (e) {
      e.preventDefault(); var btn = this.querySelector('button[type=submit]');
      if (btn.disabled) return;
      busy(btn, true, 'Checking…'); msg('');
      call('POST', '/arcade/auth/verify', { email: flow.email, code: inp.value, source: location.pathname.indexOf('play') !== -1 ? 'arcade-play' : 'arcade-home' }).then(function (j) {
        busy(btn, false, 'Sign in');
        if (!j.ok) { msg(errText(j) + (j.tries_left != null ? ' ' + j.tries_left + ' tries left.' : '')); inp.select(); return; }
        setSession(j.token, j.player);
        flow.consent = j.consent_text;
        var after = j.is_new ? stepWelcome : function () { done('Welcome back, ' + j.player.name + '.'); };
        syncAll().then(after, after);
      });
    });
  }
  function nameForm(title, intro, btnLabel, withOpt) {
    var p = state.player || {};
    body('<h3 id="acctH">' + title + '</h3><p>' + intro + '</p>' +
      '<form id="fName"><label for="aName">Leaderboard name</label><input id="aName" type="text" maxlength="16" autocomplete="nickname" value="' + esc(p.name || '') + '">' +
      (withOpt ? '<label class="chk"><input type="checkbox" id="aOpt"' + (p.opt_in ? ' checked' : '') + '><span>' + esc(flow.consent || 'Email me about new games, episodes and Arcade events from ContentPad. Unsubscribe anytime.') + '</span></label>' : '') +
      '<div class="msg"></div><div class="row"><button class="btn play" type="submit">' + btnLabel + '</button></div></form>');
    return document.getElementById('fName');
  }
  function stepWelcome() {
    var f = nameForm('You\'re in', 'Pick the name the leaderboards will show. Everyone can see it — your email stays private.', 'Save', true);
    f.addEventListener('submit', function (e) { e.preventDefault(); saveProfile(this, function () { done('All set. Your progress now saves to your account.'); }); });
  }
  function saveProfile(form, then) {
    var btn = form.querySelector('button[type=submit]'), name = document.getElementById('aName').value.trim(), opt = document.getElementById('aOpt');
    var patch = {}; if (name && name !== state.player.name) patch.name = name; if (opt) patch.opt_in = !!opt.checked;
    busy(btn, true); msg('');
    call('POST', '/arcade/me', patch).then(function (j) {
      busy(btn, false);
      if (!j.ok) return msg(errText(j));
      state.player = j.player; ls(PK, JSON.stringify(j.player)); emit(); then();
    });
  }
  function done(t) {
    body('<h3 id="acctH">Saved</h3><p>' + esc(t) + '</p><div class="row"><button class="btn play" type="button" data-x>Play</button></div>');
  }
  function profile() {
    var p = state.player;
    body('<h3 id="acctH">Your Arcade account</h3>' +
      '<div class="who"><div class="av">' + esc((p.name || '?').slice(0, 1).toUpperCase()) + '</div><div><b>' + esc(p.name) + '</b><small>' + esc(p.email) + '</small></div></div>' +
      '<p>Your progress saves to this account after every run and loads on any device you sign in on.</p>' +
      '<form id="fName"><label for="aName">Leaderboard name</label><input id="aName" type="text" maxlength="16" value="' + esc(p.name) + '">' +
      '<label class="chk"><input type="checkbox" id="aOpt"' + (p.opt_in ? ' checked' : '') + '><span>' + esc(flow.consent || 'Email me about new games, episodes and Arcade events from ContentPad. Unsubscribe anytime.') + '</span></label>' +
      '<div class="msg"></div><div class="row"><button class="btn play" type="submit">Save</button><button class="btn ghost" type="button" id="aOut">Sign out</button></div></form>' +
      '<p class="fine"><button class="link" type="button" id="aOutAll">Sign out on every device</button></p>');
    document.getElementById('fName').addEventListener('submit', function (e) { e.preventDefault(); saveProfile(this, function () { msg('Saved.', true); }); });
    document.getElementById('aOut').addEventListener('click', function () { setSession('', null); close(); toast('Signed out. Progress stays on this device.'); });
    document.getElementById('aOutAll').addEventListener('click', function () {
      call('POST', '/arcade/auth/signout-all').then(function () { setSession('', null); close(); toast('Signed out everywhere.'); });
    });
  }
  document.addEventListener('click', function (e) { if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-x')) close(); });

  var toastEl = null, toastT = 0;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'acct-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  // ── leaderboard widget ───────────────────────────────────────────────────
  // ArcadeAccount.board(el, game, {board, limit, picker})
  function board(el, game, o) {
    o = o || {}; var cur = o.board || '';
    function paint() {
      el.innerHTML = '<div class="lb-empty">Loading…</div>';
      call('GET', '/arcade/leaderboard?game=' + encodeURIComponent(game) + (cur ? '&board=' + encodeURIComponent(cur) : '') + '&limit=' + (o.limit || 10)).then(function (j) {
        if (!j.ok) { el.innerHTML = '<div class="lb-empty">' + (j.error === 'offline' ? 'Leaderboards are switching on soon.' : 'Couldn\'t load the leaderboard.') + '</div>'; return; }
        cur = j.board;
        var pick = (o.picker && j.boards.length > 1) ? '<select class="lb-sel" aria-label="Leaderboard">' + j.boards.map(function (b) { return '<option value="' + esc(b.id) + '"' + (b.id === cur ? ' selected' : '') + '>' + esc(b.title) + '</option>'; }).join('') + '</select>' : '';
        // time boards (lap records) come back in ms with unit 'time'
        var show = j.unit === 'time' ? fmtTime : function (n) { return (o.prefix || '') + fmt(Math.round(n)); };
        var rows = j.entries.map(function (e) { return '<li class="' + (e.you ? 'you' : '') + '"><span class="n">' + e.rank + '</span><span class="nm">' + esc(e.name) + (e.you ? ' · you' : '') + '</span><b>' + show(e.score) + '</b></li>'; }).join('');
        if (j.you && !j.entries.some(function (e) { return e.you; })) rows += '<li class="gap">· · ·</li><li class="you"><span class="n">' + j.you.rank + '</span><span class="nm">' + esc(state.player ? state.player.name : 'You') + ' · you</span><b>' + show(j.you.score) + '</b></li>';
        el.innerHTML = pick + (rows ? '<ol class="lb">' + rows + '</ol>' : '<div class="lb-empty">No scores yet. Be the first.</div>') +
          (!state.player ? '<button class="btn ghost acct-cta" type="button">Sign in to get on the board</button>' : '');
        var s = el.querySelector('select'); if (s) s.addEventListener('change', function () { cur = s.value; paint(); });
        var c = el.querySelector('.acct-cta'); if (c) c.addEventListener('click', open);
      });
    }
    paint();
    return { refresh: paint };
  }

  window.ArcadeAccount = {
    get player() { return state.player; },
    signedIn: function () { return !!state.token; },
    online: online, open: open, close: close, toast: toast,
    sync: syncGame, syncAll: syncAll, refreshMe: refreshMe, board: board,
    onChange: function (f) { state.listeners.push(f); }
  };

  // The chip only appears once the account service answers, so shipping this page
  // before the API module is live shows nothing half-built.
  // ── arriving from the ContentPad dashboard: #cpd=<one-time code> ─────────
  // The code is taken off the address bar before anything else, so it never
  // lands in history, a bookmark or a shared link. It is single use either way.
  function redeemHandoff() {
    var m = /(?:^#|&)cpd=([a-f0-9]{48})(?:&|$)/.exec(location.hash || '');
    if (!m) return Promise.resolve(false);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
    return call('POST', '/arcade/auth/redeem', { code: m[1] }).then(function (j) {
      if (!j.ok) { if (j.error !== 'offline') toast('That sign-in link has expired. Open the Arcade from ContentPad again, or sign in with your email.'); return false; }
      setSession(j.token, j.player);
      flow.consent = j.consent_text;
      paintChip();
      return syncAll().then(function () {
        if (j.is_new) { lastFocus = document.activeElement; modal().classList.add('open'); stepWelcome(); }
        else toast('Signed in as ' + j.player.name + ' with ContentPad.');
        return true;
      }, function () { return true; });
    });
  }
  function boot() {
    redeemHandoff().then(function (viaCpd) {
      online().then(function (on) { if (on || state.token) paintChip(); });
      if (state.token && !viaCpd) refreshMe();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
