/* Pregame Papers — shared kit for the Arcade's Pregame Papers games (build 2026100901-pp).
   Screens, menu navigation (keyboard, controller, parent-forwarded keys), sounds, confetti, the 21+ gate,
   Arcade messaging and image saving. Each game calls PP.init({game:'<slug>'}) and registers screens.
   Screens are <section class="scr" id="..."> elements; buttons/inputs with [data-nav] are reachable by
   arrows / d-pad. PP.on(screenId, {a,b,x,y,start,left,right,up,down}) overrides keys on that screen
   (return true to swallow). Requires gamepad.js (ArcadePad) for controllers. */
(function () {
  'use strict';
  var PP = window.PP = {};
  var GAME = '', cur = null, handlers = {}, backs = {};
  PP.EMBED = (function () { try { return window.top !== window; } catch (e) { return true; } })();

  PP.$ = function (s, r) { return (r || document).querySelector(s); };
  PP.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  PP.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  PP.pick = function (a) { return a[(Math.random() * a.length) | 0]; };
  PP.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  PP.ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  PP.post = function (type, extra) { try { if (window.parent !== window) window.parent.postMessage(Object.assign({ arcade: type, game: GAME }, extra || {}), '*'); } catch (e) {} };

  /* ---------- screens ---------- */
  PP.show = function (id, focusSel) {
    PP.$$('.scr').forEach(function (s) { s.classList.toggle('on', s.id === id); });
    cur = id;
    var el = PP.$('#' + id);
    if (el) el.scrollTop = 0;
    setTimeout(function () {
      var f = focusSel ? PP.$(focusSel, el) : (PP.$('[data-autofocus]', el) || PP.$('[data-nav]:not([disabled])', el));
      if (f && !(f.tagName === 'INPUT' && PP.TOUCH)) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
    }, 30);
    if (PP.onShow) PP.onShow(id);
  };
  PP.current = function () { return cur; };
  PP.on = function (id, h) { handlers[id] = h; };
  PP.back = function (id, fn) { backs[id] = fn; };

  /* ---------- navigation ---------- */
  function navEls() {
    var el = PP.$('#' + cur); if (!el) return [];
    var ov = PP.$('.ov.on'); if (ov) el = ov;
    return PP.$$('[data-nav]', el).filter(function (b) { return !b.disabled && b.offsetParent !== null; });
  }
  function move(dir) {
    var els = navEls(); if (!els.length) return;
    var a = document.activeElement;
    if (els.indexOf(a) < 0) { els[0].focus(); return; }
    var r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2, best = null, bd = 1e9;
    els.forEach(function (b) {
      if (b === a) return;
      var q = b.getBoundingClientRect(), bx = q.left + q.width / 2, by = q.top + q.height / 2, dx = bx - ax, dy = by - ay;
      var ok = dir === 'left' ? dx < -4 : dir === 'right' ? dx > 4 : dir === 'up' ? dy < -4 : dy > 4;
      if (!ok) return;
      var main = (dir === 'left' || dir === 'right') ? Math.abs(dx) : Math.abs(dy), side = (dir === 'left' || dir === 'right') ? Math.abs(dy) : Math.abs(dx);
      var d = main + side * 2.2;
      if (d < bd) { bd = d; best = b; }
    });
    if (!best && (dir === 'down' || dir === 'right')) { var i = els.indexOf(a); best = els[(i + 1) % els.length]; }
    if (!best && (dir === 'up' || dir === 'left')) { var j = els.indexOf(a); best = els[(j - 1 + els.length) % els.length]; }
    if (best) { best.focus(); try { best.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} PP.sfx('tick'); }
  }
  function act(key) {
    var h = handlers[cur] || {};
    if (h[key] && h[key]() === true) return true;
    var ov = PP.$('.ov.on');
    if (key === 'b') {
      if (ov) { var c = PP.$('[data-close]', ov); if (c) c.click(); return true; }
      if (backs[cur]) { backs[cur](); PP.sfx('back'); return true; }
      return false;
    }
    if (key === 'a') { var a = document.activeElement; if (a && a.hasAttribute && a.hasAttribute('data-nav') && a.tagName !== 'INPUT' && a.tagName !== 'TEXTAREA') { a.click(); return true; } return !!(h.a && h.a()); }
    if (key === 'up' || key === 'down' || key === 'left' || key === 'right') { move(key); return true; }
    return false;
  }
  PP.act = act;
  function keyName(k) {
    return { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'a', ' ': 'a', Escape: 'b', Backspace: 'bk' }[k] || null;
  }
  function onKey(key, e) {
    unlock();
    var a = document.activeElement, typing = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
    var n = keyName(key);
    if (key === 'm' || key === 'M') { if (!typing) { PP.mute(!PP.muted); return true; } }
    if (typing) {
      if (key === 'Enter') { var h = handlers[cur] || {}; if (h.enter && h.enter() === true) return true; return false; }
      if (key === 'Escape') { a.blur(); return act('b'); }
      if (key === 'ArrowUp' || key === 'ArrowDown') return act(n);
      return false;
    }
    if (key === 'p' || key === 'P') return act('start');
    if (key === 'x' || key === 'X' || key === 'r' || key === 'R') return act('x');
    if (key === 'y' || key === 'Y') return act('y');
    if (n === 'bk') return false;
    if (n) {
      if ((n === 'a') && a && a.tagName === 'BUTTON' && key === ' ') { /* let the browser click */ }
      return act(n);
    }
    return false;
  }
  document.addEventListener('keydown', function (e) {
    if (e.repeat && (e.key === 'Enter' || e.key === ' ')) return;
    if (onKey(e.key, e)) e.preventDefault();
  });
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var d = e.data || {};
    if (d.arcade === 'key' && d.type === 'keydown' && !d.repeat) onKey(d.key);
  });

  /* controller */
  var gpPrev = {};
  function gpLoop() {
    requestAnimationFrame(gpLoop);
    if (!window.ArcadePad) return;
    var p = ArcadePad.first(); if (!p) return;
    var r = ArcadePad.read(p); if (!r) return;
    ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'start', 'select', 'lb', 'rb'].forEach(function (k) {
      if (r[k] && !gpPrev[k]) { unlock(); var a = document.activeElement; if ((k === 'a' || k === 'b') && a && a.tagName === 'INPUT' && k === 'a') { var h = handlers[cur] || {}; if (h.enter) h.enter(); } else act(k === 'select' ? 'y' : k); }
      if (PP.gpHold) PP.gpHold(k, r[k]);
    });
    if (PP.gpRaw) PP.gpRaw(r);
    gpPrev = r;
  }
  requestAnimationFrame(gpLoop);

  /* ---------- sound ---------- */
  var AC = null; PP.muted = PP.ls('pp_mute') === '1';
  function unlock() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); }
  PP.unlock = unlock;
  document.addEventListener('pointerdown', unlock, { passive: true });
  function tone(f, t0, dur, type, vol, f2) {
    if (!AC || PP.muted) return;
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t0, dur, vol) {
    if (!AC || PP.muted) return;
    var n = AC.createBuffer(1, AC.sampleRate * dur, AC.sampleRate), d = n.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800;
    s.buffer = n; g.gain.value = vol || 0.15; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(AC.currentTime + t0);
  }
  PP.sfx = function (k) {
    switch (k) {
      case 'tick': tone(880, 0, 0.04, 'square', 0.03); break;
      case 'pop': tone(520, 0, 0.09, 'sine', 0.16, 980); break;
      case 'send': tone(700, 0, 0.07, 'sine', 0.12, 1400); break;
      case 'type': tone(1200, 0, 0.03, 'triangle', 0.03); break;
      case 'ding': tone(1320, 0, 0.18, 'sine', 0.12); tone(1760, 0.08, 0.25, 'sine', 0.1); break;
      case 'back': tone(500, 0, 0.08, 'sine', 0.08, 300); break;
      case 'buzz': tone(140, 0, 0.35, 'sawtooth', 0.09, 90); break;
      case 'drum': for (var i = 0; i < 10; i++) noise(i * 0.06, 0.05, 0.08 + i * 0.01); break;
      case 'count': tone(660, 0, 0.12, 'square', 0.07); break;
      case 'go': tone(990, 0, 0.35, 'square', 0.09); tone(1320, 0, 0.35, 'square', 0.05); break;
      case 'shutter': noise(0, 0.08, 0.3); noise(0.09, 0.06, 0.2); break;
      case 'star': [988, 1319, 1568, 1976].forEach(function (f, i) { tone(f, i * 0.07, 0.22, 'triangle', 0.1); }); break;
      case 'win': [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.3, 'triangle', 0.12); }); break;
    }
  };
  PP.mute = function (m) { PP.muted = !!m; PP.ls('pp_mute', m ? '1' : '0'); PP.$$('[data-mute]').forEach(function (b) { b.textContent = m ? '🔇' : '🔊'; }); if (m && window.speechSynthesis) speechSynthesis.cancel(); };

  /* ---------- confetti ---------- */
  PP.confetti = function (n) {
    var c = document.createElement('canvas'); c.className = 'confetti';
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99';
    document.body.appendChild(c);
    var x = c.getContext('2d'), W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio, P = [];
    var cols = ['#C6FF3D', '#E321C9', '#FFD84D', '#7DE2F5', '#ffffff', '#ff5a5a'];
    for (var i = 0; i < (n || 160); i++) P.push({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 26 - 6, r: Math.random() * 6.28, s: (6 + Math.random() * 10) * devicePixelRatio, c: PP.pick(cols) });
    var t = 0;
    (function f() {
      t++; x.clearRect(0, 0, W, H);
      P.forEach(function (p) { p.vy += 0.7; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (t < 150) requestAnimationFrame(f); else c.remove();
    })();
  };

  /* ---------- toast ---------- */
  PP.toast = function (msg, ms) {
    var t = PP.$('#ppToast'); if (!t) { t = document.createElement('div'); t.id = 'ppToast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'on'; clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, ms || 2200);
  };

  /* ---------- saving an image ----------
     Inside the Arcade player the frame may not allow downloads, so we always show the picture too
     (long-press / right-click to save) and offer a Download button. */
  PP.saveImage = function (canvas, name) {
    var url = canvas.toDataURL('image/png');
    var ov = PP.$('#ppShot');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'ppShot'; ov.className = 'ov';
      ov.innerHTML = '<div class="ovbox"><img alt="Your screenshot"><p class="hint">Long-press or right-click the picture to save it, or:</p><div class="row"><a class="btn pri" data-nav download>⬇ Download</a><button class="btn" data-nav data-close>Close</button></div></div>';
      document.body.appendChild(ov);
      PP.$('[data-close]', ov).onclick = function () { ov.classList.remove('on'); };
    }
    PP.$('img', ov).src = url;
    var a = PP.$('a[download]', ov); a.href = url; a.setAttribute('download', name || 'pregame-papers.png');
    ov.classList.add('on'); PP.sfx('shutter');
    setTimeout(function () { a.focus(); }, 40);
  };

  /* ---------- 21+ gate ---------- */
  PP.ageGate = function (done) {
    if (sessionStorage.getItem('pp_21') === '1') { done(); return; }
    PP.show('gate');
    PP.$('#gYes').onclick = function () { try { sessionStorage.setItem('pp_21', '1'); } catch (e) {} PP.sfx('ding'); done(); };
    PP.$('#gNo').onclick = function () { PP.quit(); };
  };
  PP.quit = function () {
    if (PP.EMBED) PP.post('exit'); else location.href = '/';
  };

  PP.TOUCH = ('ontouchstart' in window) && matchMedia('(pointer:coarse)').matches;
  PP.init = function (o) {
    GAME = o.game;
    if (PP.TOUCH) document.documentElement.classList.add('touch');
    PP.$$('[data-quit]').forEach(function (b) { b.textContent = PP.EMBED ? '✕ Quit to Arcade' : '← Arcade'; b.onclick = PP.quit; });
    PP.$$('[data-mute]').forEach(function (b) { b.textContent = PP.muted ? '🔇' : '🔊'; b.onclick = function () { PP.mute(!PP.muted); }; });
  };

  /* players list (shared by both games, remembered on this device) */
  PP.loadPlayers = function () { try { var p = JSON.parse(PP.ls('pp_players') || '[]'); return Array.isArray(p) ? p.filter(function (s) { return typeof s === 'string'; }).slice(0, 12) : []; } catch (e) { return []; } };
  PP.savePlayers = function (p) { PP.ls('pp_players', JSON.stringify(p.slice(0, 12))); };
  PP.bump = function (slug) { var k = 'arcade_best_' + slug, n = (+PP.ls(k) || 0) + 1; PP.ls(k, String(n)); return n; };
})();
