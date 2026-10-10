/* Oak Hill Farm v2 — bonus games and story levels: Egg Catch, King of the Spools, Peter's Feather Match, Alpaca Spa,
   The Great Pumpkin Roll, Rodney Oversleeps. Each one: start(diff, api, season) / update(dt, inp) / render(cx, VW, VH, DPR) / pointer(type, x, y) / stop(). */
(function () {
'use strict';
var O = window.OHF, F = O.FARM, clamp = O.clamp, rnd = O.rnd, pick = O.pick;
var M = O.MINI = {};

/* ---------------- shared toolkit ---------------- */
var SKY = { fall: ['#a9dcf7', '#fdf0d3'], winter: ['#cfe7f8', '#ffffff'], spring: ['#b2e2ff', '#f1fff0'], summer: ['#7fcdfb', '#e9f9ff'] };
function spr(c, k, x, y, h, flip, sq, rot) { F.drawImg(c, k, x, y, h, flip, sq, rot); }
function ratio(k) { var im = O.IMG[k]; return im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1; }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function txt(c, s, x, y, size, col, align, w) { c.font = (w || 700) + ' ' + size + 'px Fredoka'; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, size * 0.18); c.strokeStyle = 'rgba(74,46,26,.9)'; c.strokeText(s, x, y); c.fillStyle = col || '#fff'; c.fillText(s, x, y); c.textBaseline = 'alphabetic'; }
function sky(c, season, W, H, groundY) {
  var g = c.createLinearGradient(0, 0, 0, groundY), s = SKY[season] || SKY.fall; g.addColorStop(0, s[0]); g.addColorStop(1, s[1]); c.fillStyle = g; c.fillRect(0, 0, W, groundY + 2);
  c.fillStyle = O.SEASONS[season].grass[0]; c.fillRect(0, groundY, W, H - groundY);
  c.fillStyle = 'rgba(255,255,255,.75)'; [[0.15, 0.12, 1], [0.6, 0.08, 1.3], [0.85, 0.2, 0.9]].forEach(function (q) { var x = q[0] * W, y = q[1] * groundY + 20, r = 26 * q[2]; c.beginPath(); c.arc(x, y, r, 0, 7); c.arc(x + r, y + 6, r * 0.8, 0, 7); c.arc(x - r, y + 8, r * 0.7, 0, 7); c.fill(); });
}
function Parts() { this.a = []; }
Parts.prototype.heart = function (x, y, n, s) { for (var i = 0; i < (n || 5); i++) this.a.push({ k: 'h', x: x + rnd(-20, 20), y: y, vx: rnd(-50, 50), vy: rnd(-160, -80), life: 1.1, s: (s || 1) * rnd(16, 26) }); };
Parts.prototype.spark = function (x, y, n, col, s) { for (var i = 0; i < (n || 8); i++) this.a.push({ k: 's', x: x + rnd(-24, 24), y: y + rnd(-20, 10), vx: rnd(-80, 80), vy: rnd(-120, -20), life: 0.7, s: (s || 1) * rnd(5, 10), c: col || pick(['#fff6a8', '#ffffff', '#ffd1f0', '#b8f0ff']) }); };
Parts.prototype.yolk = function (x, y) { this.a.push({ k: 'y', x: x, y: y, vx: 0, vy: 0, life: 1.2, s: 1, g: 0 }); };
Parts.prototype.text = function (x, y, t, col, size) { this.a.push({ k: 't', x: x, y: y, vx: 0, vy: -50, life: 0.9, t: t, c: col || '#fff', s: size || 26, g: 0 }); };
Parts.prototype.update = function (dt) { this.a = this.a.filter(function (p) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g === 0 ? 0 : 200) * dt; return p.life > 0; }); };
Parts.prototype.draw = function (c) {
  this.a.forEach(function (p) {
    c.globalAlpha = Math.min(1, p.life * 2);
    if (p.k === 'h') spr(c, 'i_heart', p.x, p.y, p.s);
    else if (p.k === 's') { c.fillStyle = p.c; c.beginPath(); for (var i = 0; i < 8; i++) { var r = i % 2 ? p.s * 0.4 : p.s, a = i * Math.PI / 4; c.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); } c.fill(); }
    else if (p.k === 'y') { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(p.x, p.y, 26, 9, 0, 0, 7); c.fill(); c.fillStyle = '#ffc531'; c.beginPath(); c.ellipse(p.x + 3, p.y - 1, 9, 6, 0, 0, 7); c.fill(); }
    else if (p.k === 't') txt(c, p.t, p.x, p.y, p.s, p.c);
    c.globalAlpha = 1;
  });
};
// "Ready?" → "Go!" before each game
function Ready() { this.t = 0; }
Ready.prototype.update = function (dt) { var was = this.t; this.t += dt; if (was < 0.9 && this.t >= 0.9) O.SFX.chime(); return this.t >= 1.4; };
Ready.prototype.draw = function (c, W, H) { if (this.t >= 1.4) return; var go = this.t >= 0.9, s = go ? 1 + (this.t - 0.9) * 0.6 : 1; c.globalAlpha = go ? Math.max(0, 1 - (this.t - 0.9) * 2) : 1; txt(c, go ? 'Go!' : 'Ready?', W / 2, H * 0.45, 64 * s, '#ffd65a'); c.globalAlpha = 1; };
function stars3(v, a3, a2) { return v >= a3 ? 3 : v >= a2 ? 2 : 1; }
var DIR = { left: ['ArrowLeft', 'a'], right: ['ArrowRight', 'd'], up: ['ArrowUp', 'w'], down: ['ArrowDown', 's'] };
function navPress(d) { return O.pressed(DIR[d]) || O.gpPress(d, 0) || O.gpPress(d, 1); }

/* =====================================================================
   🥚 EGG CATCH — the special chickens lay, you catch with the basket
   ===================================================================== */
(function () {
  var E = M.eggs = { intro: 'The special chickens are laying eggs! Catch them in your basket before they hit the ground.', how: 'Move with the arrow keys, WASD or a controller. Golden eggs are worth 3!', howTouch: 'Drag your finger to move the basket. Golden eggs are worth 3!' };
  var st, api;
  E.state = function () { return st; };
  var HENS = ['boca', 'aretha', 'betty', 'funny'];
  E.start = function (diff, a, season) {
    api = a; var hens = diff > 1 ? HENS.concat(['rodney']) : HENS;
    st = { diff: diff, season: season, t: 40, score: 0, caught: 0, missed: 0, x: 0.5, eggs: [], hens: hens.map(function (id, i) { return { id: id, u: (i + 0.5) / hens.length, jump: 0, lay: rnd(0.4, 2) }; }), spawn: 0.6, parts: new Parts(), ready: new Ready(), drag: null, done: false, walk: 0, face: 1 };
    api.hud('🥚 0 · 0:40');
  };
  function layout() { var s = api.size(), W = s.VW, H = s.VH, k = Math.min(W / 900, H / 640); return { W: W, H: H, k: k, roostY: H * 0.30, groundY: H * 0.86, bw: 120 * k }; }
  E.update = function (dt, inp) {
    var L = layout(); st.parts.update(dt);
    if (!st.ready.update(dt)) return;
    if (st.done) return;
    var sp = 0.95 + (st.diff - 1) * 0.25, mv = inp.x;
    if (st.drag != null) { var tx = clamp(st.drag / L.W, 0.06, 0.94); st.x += (tx - st.x) * Math.min(1, dt * 14); st.walk += dt * 10; st.face = tx > st.x ? 1 : -1; }
    else if (Math.abs(mv) > 0.15) { st.x = clamp(st.x + mv * dt * sp, 0.06, 0.94); st.walk += dt * 10; st.face = mv > 0 ? 1 : -1; } else st.walk = 0;
    st.t -= dt;
    // hens take turns laying
    st.spawn -= dt; var every = st.diff > 1 ? 0.68 : 0.95;
    if (st.spawn <= 0) { st.spawn = every * rnd(0.75, 1.25); var h = pick(st.hens); h.jump = 1; O.voice(h.id); st.eggs.push({ x: h.u, y: L.roostY - 10 * L.k, vy: 0, gold: Math.random() < 0.08, wob: rnd(0, 6) }); }
    st.hens.forEach(function (h) { h.jump = Math.max(0, h.jump - dt * 2.5); });
    var g = (st.diff > 1 ? 520 : 400) * L.k, bx = st.x * L.W, by = L.groundY - 70 * L.k;
    st.eggs = st.eggs.filter(function (e) {
      e.vy += g * dt; e.vy = Math.min(e.vy, (st.diff > 1 ? 560 : 430) * L.k); e.y += e.vy * dt; e.wob += dt * 6;
      var ex = e.x * L.W;
      if (e.y > by - 24 * L.k && e.y < by + 18 * L.k && Math.abs(ex - bx) < L.bw * 0.52) {
        var pts = e.gold ? 3 : 1; st.score += pts; st.caught++; O.SFX[e.gold ? 'coin' : 'pop'](); st.parts.text(ex, by - 50 * L.k, '+' + pts, e.gold ? '#ffd65a' : '#fff', 30 * L.k + 8); if (e.gold) st.parts.spark(ex, by - 30 * L.k, 12, '#ffe066'); return false;
      }
      if (e.y > L.groundY) { st.missed++; O.SFX.crack(); st.parts.yolk(ex, L.groundY - 4); return false; }
      return true;
    });
    api.hud('🥚 ' + st.score + ' · 0:' + ('0' + Math.max(0, Math.ceil(st.t))).slice(-2));
    if (st.t <= 0) {
      st.done = true; var a3 = st.diff > 1 ? 40 : 30, a2 = st.diff > 1 ? 22 : 16, s = stars3(st.score, a3, a2);
      O.SFX.done(); st.hens.forEach(function (h) { h.jump = 1; }); st.parts.heart(bx, by - 60, 10);
      setTimeout(function () { api.end({ stars: s, score: st.score, text: 'You caught ' + st.caught + ' eggs for ' + st.score + ' points!', need: 'Get ' + a3 + ' points for 3 stars.', hearts: st.hens.map(function (h) { return h.id; }) }); }, 1200);
    }
  };
  E.pointer = function (type, x) { if (type === 'down' || (type === 'move' && st.drag != null)) st.drag = x; if (type === 'up' || type === 'cancel') st.drag = null; };
  E.render = function (c, W, H, DPR) {
    var L = layout(); c.setTransform(DPR, 0, 0, DPR, 0, 0); sky(c, st.season, W, H, L.groundY);
    // the Chicken Dome behind, the roost bar
    c.globalAlpha = 0.55; spr(c, 'dome', W * 0.5, L.groundY - 10, 300 * L.k); c.globalAlpha = 1;
    c.fillStyle = '#8a5a30'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 4; rr(c, W * 0.03, L.roostY - 4, W * 0.94, 16 * L.k, 8); c.fill(); c.stroke();
    [0.04, 0.96].forEach(function (u) { c.fillRect(u * W - 7, L.roostY, 14, L.groundY - L.roostY); c.strokeRect(u * W - 7, L.roostY, 14, L.groundY - L.roostY); });
    st.hens.forEach(function (h) { var hy = L.roostY - Math.sin(h.jump * Math.PI) * 20 * L.k; spr(c, h.id, h.u * W, hy, (h.id === 'rodney' ? 92 : 80) * L.k, h.u > 0.5 ? -1 : 1, h.jump * 0.08); });
    st.eggs.forEach(function (e) { spr(c, 'i_egg', e.x * W, e.y + 16 * L.k, 36 * L.k, 1, 0, Math.sin(e.wob) * 0.25); if (e.gold) { c.fillStyle = 'rgba(255,214,90,.75)'; c.beginPath(); c.ellipse(e.x * W, e.y, 12 * L.k, 15 * L.k, 0, 0, 7); c.fill(); c.strokeStyle = '#c08a12'; c.lineWidth = 2; c.stroke(); } });
    var bx = st.x * W, bob = st.walk ? Math.abs(Math.sin(st.walk)) * -5 : 0;
    spr(c, O.SAVE.kid === 'boy' ? 'kid_boy' : 'kid_girl', bx - st.face * 20 * L.k, L.groundY + bob, 150 * L.k, st.face);
    spr(c, 'i_basket', bx, L.groundY - 34 * L.k + bob, 86 * L.k);
    st.parts.draw(c); st.ready.draw(c, W, H);
  };
  E.stop = function () {};
})();

/* =====================================================================
   🧵 KING OF THE SPOOLS — Kiwi hops spool to spool
   ===================================================================== */
(function () {
  var K = M.spools = { intro: 'Kiwi wants to be Queen of the Spools! Help her hop from spool to spool and grab the apples.', how: 'Press Space, Enter, Up or (A) to jump. Press again in the air for a double jump!', howTouch: 'Tap anywhere to jump. Tap again in the air for a double jump!' };
  var st, api, GY = 520;
  K.state = function () { return st; };
  K.start = function (diff, a, season) {
    api = a; var n = diff > 1 ? 26 : 18, sp = [], x = 120, apples = [];
    // each platform is a stack of whole spools; Kiwi stands on the top face
    function plat(x, w, h) { var s = { x: x, w: w, H: w }; s.step = s.H * 0.78; s.n = Math.max(1, Math.round((h - s.H * 0.8) / s.step) + 1); s.top = GY - (s.n - 1) * s.step - s.H * 0.8; return s; }
    sp.push(plat(x, 200, 120));
    for (var i = 1; i < n; i++) {
      var gap = diff > 1 ? rnd(120, 200) : rnd(90, 160), w = rnd(110, 170), h = rnd(90, diff > 1 ? 280 : 210);
      var prev = sp[sp.length - 1]; x = prev.x + prev.w / 2 + gap + w / 2; var s = plat(x, w, h); sp.push(s);
      if (Math.random() < 0.75) apples.push({ x: x + rnd(-w * 0.2, w * 0.2), y: s.top - rnd(70, 150), got: false });
      if (Math.random() < 0.4) apples.push({ x: prev.x + prev.w / 2 + gap / 2, y: Math.min(prev.top, s.top) - 130, got: false });
    }
    var last = sp[sp.length - 1], fin = plat(last.x + last.w / 2 + 140 + 110, 220, 150); fin.fin = true; sp.push(fin);
    st = { diff: diff, season: season, sp: sp, apples: apples, total: apples.length, got: 0, falls: 0, k: { x: 120, y: sp[0].top, vy: 0, on: true, jumps: 0, coyote: 0, buf: 0, sq: 0, last: 0 }, cam: 0, t: 0, parts: new Parts(), ready: new Ready(), done: false, oops: 0, speed: diff > 1 ? 270 : 235, win: 0 };
    api.hud('🍎 0/' + st.total);
  };
  function scale() { var s = api.size(), k = Math.min(s.VH / 600, s.VW / 760); return { W: s.VW, H: s.VH, k: k, vw: s.VW / k, oy: s.VH - 600 * k }; }
  K.pointer = function (type) { if (type === 'down') st.k.buf = 0.15; };
  K.update = function (dt, inp) {
    st.parts.update(dt); if (!st.ready.update(dt)) return;
    var k = st.k, S0 = scale(); st.cam += ((k.x - S0.vw * 0.3) - st.cam) * Math.min(1, dt * 6);
    if (st.win) { st.win += dt; k.sq = Math.sin(st.win * 10) * 0.05; if (st.win > 2.4 && !st.done) { st.done = true; var s = st.got >= st.total * 0.8 && st.falls <= 1 ? 3 : st.got >= st.total * 0.5 ? 2 : 1; api.end({ stars: s, score: st.got, t: st.t, text: 'Kiwi is Queen of the Spools! You got ' + st.got + ' of ' + st.total + ' apples' + (st.falls ? ' and fell ' + st.falls + (st.falls === 1 ? ' time.' : ' times.') : ' without falling once!'), need: 'Grab most of the apples and don\'t fall more than once for 3 stars.', hearts: ['kiwi', 'armani', 'speckles'] }); } return; }
    if (st.oops > 0) { st.oops -= dt; if (st.oops <= 0) { var back = st.sp[k.last]; k.x = back.x; k.y = back.top; k.vy = 0; k.on = true; k.jumps = 0; } return; }
    st.t += dt;
    if (inp.act || O.pressed(['ArrowUp', 'w']) || O.gpPress('up', 0)) k.buf = 0.15;
    k.buf -= dt; k.coyote -= dt;
    if (k.buf > 0 && (k.on || k.coyote > 0 || k.jumps < 2)) { var dbl = !(k.on || k.coyote > 0); k.vy = dbl ? -640 : -760; k.on = false; k.coyote = 0; k.jumps = dbl ? 2 : 1; k.buf = 0; k.sq = -0.12; O.SFX.jump(); if (dbl) st.parts.spark(k.x - 10, k.y, 6, '#fff'); }
    k.x += st.speed * dt; k.vy += 1800 * dt; var ny = k.y + k.vy * dt, landed = false;
    st.sp.forEach(function (s, i) {
      if (Math.abs(k.x - s.x) < s.w * 0.46 && k.vy >= 0 && k.y <= s.top + 4 && ny >= s.top) { ny = s.top; k.vy = 0; landed = true; if (!k.on) { k.sq = 0.12; O.SFX.drop(); } k.jumps = 0; k.last = i; if (s.fin) { st.win = 0.01; O.SFX.done(); O.voice('kiwi'); st.parts.heart(k.x, k.y - 80, 14); st.parts.spark(k.x, k.y - 120, 20, '#ffe066'); } }
    });
    if (k.on && !landed) k.coyote = 0.1;
    k.on = landed; k.y = ny; k.sq += (0 - k.sq) * Math.min(1, dt * 10);
    st.apples.forEach(function (a) { if (!a.got && Math.abs(a.x - k.x) < 44 && Math.abs(a.y - (k.y - 40)) < 54) { a.got = true; st.got++; O.SFX.coin(); st.parts.text(a.x, a.y - 30, '+1', '#ffd65a'); st.parts.spark(a.x, a.y, 8, '#ff8a6a'); } });
    if (k.y > GY + 20) { st.falls++; st.oops = 0.9; O.SFX.bonk(); O.voice('kiwi'); st.parts.text(k.x, GY - 60, 'Boing! Try again!', '#fff', 30); k.y = GY + 20; }
    var S = scale(); st.cam += ((k.x - S.vw * 0.3) - st.cam) * Math.min(1, dt * 6);
    api.hud('🍎 ' + st.got + '/' + st.total);
  };
  K.render = function (c, W, H, DPR) {
    var S = scale(); c.setTransform(DPR, 0, 0, DPR, 0, 0); sky(c, st.season, W, H, S.oy + GY * S.k);
    c.setTransform(DPR * S.k, 0, 0, DPR * S.k, 0, DPR * S.oy);
    // far fence + barn parallax
    var px = -(st.cam * 0.3) % 900; for (var b = -1; b < S.vw / 900 + 2; b++) { c.globalAlpha = 0.5; spr(c, O.SEASONS[st.season].barn, px + b * 900 + 300, GY - 20, 220); spr(c, O.SEASONS[st.season].oak, px + b * 900 + 700, GY - 10, 240); c.globalAlpha = 1; }
    c.save(); c.translate(-st.cam, 0);
    c.strokeStyle = '#7a4f2a'; c.lineWidth = 6; var f0 = Math.floor(st.cam / 120) * 120; for (var fx = f0; fx < st.cam + S.vw + 120; fx += 120) { c.beginPath(); c.moveTo(fx, GY - 50); c.lineTo(fx + 120, GY - 50); c.moveTo(fx, GY - 28); c.lineTo(fx + 120, GY - 28); c.stroke(); c.fillStyle = '#8a5a30'; c.fillRect(fx - 5, GY - 62, 10, 62); }
    st.sp.forEach(function (s) {
      if (s.x + s.w < st.cam - 50 || s.x - s.w > st.cam + S.vw + 50) return;
      for (var i = 0; i < s.n; i++) spr(c, 'spool', s.x, GY + 4 - i * s.step, s.H, 1, 0);
      if (s.fin) { c.fillStyle = '#8a5a30'; c.fillRect(s.x - 4, s.top - 160, 8, 160); c.fillStyle = '#ffd65a'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(s.x + 4, s.top - 160); c.lineTo(s.x + 80, s.top - 140); c.lineTo(s.x + 4, s.top - 118); c.closePath(); c.fill(); c.stroke(); spr(c, 'acc_crown', s.x + 34, s.top - 128, 30); }
    });
    st.apples.forEach(function (a) { if (!a.got) spr(c, 'i_apple', a.x, a.y + 18 + Math.sin(st.t * 4 + a.x) * 4, 40); });
    var k = st.k; if (st.oops <= 0 || Math.floor(st.oops * 10) % 2) { c.fillStyle = 'rgba(40,60,20,.2)'; spr(c, 'kiwi', k.x, k.y + 2, 92, 1, k.sq + (k.on ? Math.sin(st.t * 20) * 0.02 : 0)); if (st.win) spr(c, 'acc_crown', k.x + 22, k.y - 80, 34); }
    c.restore();
    c.save(); c.translate(-st.cam, 0); st.parts.draw(c); c.restore();
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    // progress bar
    var last = st.sp[st.sp.length - 1].x, pr = clamp(st.k.x / last, 0, 1), bw = Math.min(260, W * 0.4);
    c.fillStyle = 'rgba(255,255,255,.6)'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 3; rr(c, W / 2 - bw / 2, H - 30, bw, 14, 7); c.fill(); c.stroke(); spr(c, 'kiwi', W / 2 - bw / 2 + bw * pr, H - 22, 30);
    st.ready.draw(c, W, H);
  };
  K.stop = function () {};
})();

/* =====================================================================
   🪶 PETER'S FEATHER MATCH — memory cards with peacock-feather backs
   ===================================================================== */
(function () {
  var P = M.feathers = { intro: 'Peter the Peacock hid his friends behind his feathers! Flip two cards to find a match.', how: 'Use the arrow keys or a controller to pick a card, then Space or (A) to flip it. Or just click!', howTouch: 'Tap a feather to flip it over. Find all the matching pairs!' };
  var st, api;
  P.state = function () { return st; };
  P.start = function (diff, a, season) {
    api = a; var pairs = diff > 1 ? 8 : 6, pool = O.shuffle(O.CAST.map(function (c) { return c[0]; }).filter(function (id) { return id !== 'peter' && id !== 'chicks'; })).slice(0, pairs);
    var cards = O.shuffle(pool.concat(pool)).map(function (id) { return { id: id, up: 0, flip: 0, done: false, pop: 0 }; });
    st = { diff: diff, season: season, pairs: pairs, cards: cards, cols: diff > 1 ? 4 : 4, sel: [], moves: 0, found: 0, cur: 0, wait: 0, t: 0, parts: new Parts(), ready: new Ready(), done: false, peter: 0 };
    api.hud('Pairs 0/' + pairs);
  };
  function layout() {
    var s = api.size(), W = s.VW, H = s.VH, n = st.cards.length, top = 70, bot = 20, availW = W - 40, availH = H - top - bot;
    var cols = W > H ? (n === 16 ? 8 : 6) : 4; if (n === 16 && W > H && W < 900) cols = 8; if (W <= H) cols = 4;
    var rows = Math.ceil(n / cols), gap = 10, cw = Math.min((availW - gap * (cols - 1)) / cols, ((availH - gap * (rows - 1)) / rows) * 0.78), ch = cw / 0.78;
    var gw = cols * cw + (cols - 1) * gap, gh = rows * ch + (rows - 1) * gap, x0 = (W - gw) / 2, y0 = top + (availH - gh) / 2;
    return { W: W, H: H, cols: cols, rows: rows, cw: cw, ch: ch, gap: gap, x0: x0, y0: y0 };
  }
  function cardAt(L, i) { var c = i % L.cols, r = Math.floor(i / L.cols); return { x: L.x0 + c * (L.cw + L.gap), y: L.y0 + r * (L.ch + L.gap) }; }
  function flip(i) {
    var cd = st.cards[i]; if (!cd || cd.done || cd.up || st.wait > 0 || st.sel.length >= 2 || st.done) return;
    cd.up = 1; O.SFX.flip(); st.sel.push(i);
    if (st.sel.length === 2) {
      st.moves++; var a = st.cards[st.sel[0]], b = st.cards[st.sel[1]];
      if (a.id === b.id) { a.done = b.done = true; a.pop = b.pop = 1; st.found++; O.voice(a.id); O.SFX.chime(); var L = layout(), p = cardAt(L, st.sel[1]); st.parts.heart(p.x + L.cw / 2, p.y + L.ch / 2, 6); st.parts.text(p.x + L.cw / 2, p.y, O.BY[a.id].name + '!', '#fff', 24); st.sel = []; st.peter = 1;
        if (st.found === st.pairs) { st.done = true; O.SFX.done(); O.voice('peter'); var s = st.moves <= st.pairs + 3 ? 3 : st.moves <= st.pairs * 2 + 2 ? 2 : 1;
          setTimeout(function () { api.end({ stars: s, score: st.moves, t: st.t, text: 'You found all ' + st.pairs + ' pairs in ' + st.moves + ' tries!', need: 'Find them all in ' + (st.pairs + 3) + ' tries or fewer for 3 stars.', hearts: ['peter'].concat(st.cards.filter(function (c, i) { return i % 2 === 0; }).map(function (c) { return c.id; }).slice(0, 4)) }); }, 1300); } }
      else st.wait = 0.95;
    }
  }
  P.update = function (dt) {
    st.parts.update(dt); if (!st.ready.update(dt)) return; if (!st.done) st.t += dt;
    st.peter = Math.max(0, st.peter - dt * 1.5);
    st.cards.forEach(function (c) { c.flip += ((c.up || c.done ? 1 : 0) - c.flip) * Math.min(1, dt * 12); c.pop = Math.max(0, c.pop - dt * 2); });
    if (st.wait > 0) { st.wait -= dt; if (st.wait <= 0) { st.sel.forEach(function (i) { st.cards[i].up = 0; }); st.sel = []; } }
    var L = layout(), n = st.cards.length;
    if (navPress('right')) { st.cur = (st.cur + 1) % n; st.kb = 1; } if (navPress('left')) { st.cur = (st.cur - 1 + n) % n; st.kb = 1; }
    if (navPress('down')) { st.cur = (st.cur + L.cols) % n; st.kb = 1; } if (navPress('up')) { st.cur = (st.cur - L.cols + n) % n; st.kb = 1; }
    if (O.pressed([' ', 'Enter', 'e', 'j']) || O.gpPress('a', 0)) { st.kb = 1; flip(st.cur); }
    api.hud('Pairs ' + st.found + '/' + st.pairs + ' · tries ' + st.moves);
  };
  P.pointer = function (type, x, y) { if (type !== 'down') return; st.kb = 0; var L = layout(); for (var i = 0; i < st.cards.length; i++) { var p = cardAt(L, i); if (x > p.x && x < p.x + L.cw && y > p.y && y < p.y + L.ch) { st.cur = i; flip(i); return; } } };
  P.render = function (c, W, H, DPR) {
    var L = layout(); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1f6f7a'); g.addColorStop(1, '#2f9a7e'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // a big peacock-tail fan in the background
    c.save(); c.translate(W / 2, H + 40); for (var i = 0; i < 15; i++) { c.save(); c.rotate(-Math.PI / 2 + (i - 7) * 0.2); c.globalAlpha = 0.13; spr(c, 'i_feather', 0, -H * 0.25, H * 0.75); c.restore(); } c.restore(); c.globalAlpha = 1;
    spr(c, 'peter', W - 70, H - 8 - Math.sin(st.peter * Math.PI) * 18, Math.min(150, H * 0.22), -1);
    st.cards.forEach(function (cd, i) {
      var p = cardAt(L, i), f = cd.flip, sx = Math.abs(Math.cos(f * Math.PI)), face = f > 0.5, cxm = p.x + L.cw / 2, s = 1 + cd.pop * 0.08;
      c.save(); c.translate(cxm, p.y + L.ch / 2); c.scale(Math.max(0.04, sx) * s, s);
      c.fillStyle = face ? (cd.done ? '#fff3c4' : '#fffdf6') : '#1d5f69'; c.strokeStyle = cd.done ? '#c08a12' : '#4a2e1a'; c.lineWidth = 4; rr(c, -L.cw / 2, -L.ch / 2, L.cw, L.ch, 12); c.fill(); c.stroke();
      if (face) { spr(c, cd.id, 0, L.ch * 0.36, L.ch * 0.66); c.font = '600 ' + clamp(L.cw * 0.12, 11, 17) + 'px Fredoka'; c.fillStyle = '#4a2e1a'; c.textAlign = 'center'; c.fillText(O.BY[cd.id].name.replace('Funny Lookin Chicken', 'Funny Lookin'), 0, L.ch * 0.45); }
      else { c.save(); rr(c, -L.cw / 2 + 5, -L.ch / 2 + 5, L.cw - 10, L.ch - 10, 9); c.clip(); c.fillStyle = '#2a7f86'; c.fillRect(-L.cw / 2, -L.ch / 2, L.cw, L.ch); spr(c, 'i_feather', 0, L.ch * 0.42, L.ch * 0.86, 1, 0, 0.18); c.restore(); }
      c.restore();
      if (st.kb && i === st.cur && !st.done) { c.strokeStyle = '#ffd65a'; c.lineWidth = 5; rr(c, p.x - 5, p.y - 5, L.cw + 10, L.ch + 10, 15); c.stroke(); }
    });
    st.parts.draw(c); st.ready.draw(c, W, H);
  };
  P.stop = function () {};
})();

/* =====================================================================
   🫧 ALPACA SPA — a four-lane rhythm game at 112 BPM
   ===================================================================== */
(function () {
  var A = M.spa = { intro: 'It\'s spa day for Gaby, Bianca, Amina and Tracey! Pop the bubbles to the beat to make them fluffy.', how: 'Press a key when a bubble reaches the ring: 1 2 3 4, A S D F, or ← ↓ ↑ →. On a controller: the d-pad.', howTouch: 'Tap an alpaca\'s lane when its bubble reaches the ring!' };
  var st, api, IDS = ['gaby', 'bianca', 'amina', 'tracey'], COLS = ['#ff9ec4', '#9fd6ff', '#c9a7ff', '#ffd65a'];
  A.state = function () { return st; };
  var KEYS = [['1', 'a', 'ArrowLeft'], ['2', 's', 'ArrowDown'], ['3', 'd', 'ArrowUp'], ['4', 'f', 'ArrowRight']], PAD = ['left', 'down', 'up', 'right'], PAD2 = ['x', 'a', 'b', 'y'];
  var BPM = 112, BEAT = 60 / BPM, LEAD = 1.9;   // seconds a bubble takes to fall
  var MEL = [523, 587, 659, 784, 880, 784, 659, 587];
  A.start = function (diff, a, season) {
    api = a; var notes = [], bars = 22;   // a 4-beat count-in, then the bubbles start
    for (var b = 0; b < bars; b++) for (var q = 0; q < 4; q++) {
      var t = (b * 4 + q) * BEAT, lvl = (b + 1) / bars, r = Math.random(); if (b === bars - 1 && q > 0) continue;
      if (q === 0 || q === 2 || r < (diff > 1 ? 0.45 : 0.18) + lvl * 0.2) notes.push({ t: t, lane: (Math.random() * 4) | 0, hit: 0 });
      if (diff > 1 && lvl > 0.4 && Math.random() < 0.2) notes.push({ t: t + BEAT / 2, lane: (Math.random() * 4) | 0, hit: 0 });
    }
    notes.sort(function (x, y) { return x.t - y.t; });
    st = { diff: diff, season: season, notes: notes, song: -LEAD - 0.6, beatN: -9, pts: 0, max: notes.length * 2, combo: 0, best: 0, lane: [0, 0, 0, 0], jump: [0, 0, 0, 0], fluff: [0, 0, 0, 0], judge: [], parts: new Parts(), done: false, end: (bars * 4 + 1) * BEAT };
    O.musicHold = true; if (O.music) O.music.pause();
    api.hud('Fluff 0%');
  };
  function layout() { var s = api.size(), W = s.VW, H = s.VH, lw = Math.min(W / 4, 220), x0 = W / 2 - lw * 2, ringY = H * 0.68, top = 64; return { W: W, H: H, lw: lw, x0: x0, ringY: ringY, top: top, k: Math.min(W / 900, H / 640) }; }
  function laneX(L, i) { return L.x0 + L.lw * (i + 0.5); }
  function press(i) {
    if (st.done) return; st.lane[i] = 0.15; var L = layout(), best = null, bd = 1e9;
    st.notes.forEach(function (n) { if (n.hit || n.lane !== i) return; var d = Math.abs(n.t - st.song); if (d < bd) { bd = d; best = n; } });
    if (best && bd < 0.2) {
      var good = bd < 0.09 ? 2 : 1; best.hit = good; st.pts += good; st.combo++; st.best = Math.max(st.best, st.combo); st.jump[i] = 1; st.fluff[i] = Math.min(1, st.fluff[i] + 0.06);
      O.SFX.note(i + (good === 2 ? 1 : 0)); O.SFX.brush(); st.parts.spark(laneX(L, i), L.ringY, good === 2 ? 12 : 6, COLS[i]);
      st.judge.push({ i: i, t: good === 2 ? 'Perfect!' : 'Good!', life: 0.6 }); if (st.combo % 10 === 0) { O.voice(IDS[i]); st.parts.heart(laneX(L, i), L.ringY - 40, 4); }
    } else { st.combo = 0; }
  }
  A.pointer = function (type, x) { if (type !== 'down') return; var L = layout(), i = Math.floor((x - L.x0) / L.lw); if (i >= 0 && i < 4) press(i); };
  A.update = function (dt) {
    var L = layout(); st.parts.update(dt);
    st.song += dt;
    // our own beat: a soft kick on every beat, a shaker on the off-beat, a little tune every bar
    var bn = Math.floor(st.song / BEAT); if (bn !== st.beatN && st.song < st.end) {
      st.beatN = bn; if (bn >= -4) { O.tone({ f: 120, f2: 55, t: 0.16, type: 'sine', v: 0.22 }); O.noise({ f: 7000, t: 0.04, v: 0.04, q: 0.6, ft: 'highpass', at: BEAT / 2 });
        if (bn >= 0 && bn % 2 === 0) O.tone({ f: MEL[(bn / 2) % 8] / 2, t: BEAT * 1.6, type: 'triangle', v: 0.06 }); }
      if (bn < 0 && bn >= -4) st.parts.text(L.W / 2, L.H * 0.4, String(-bn), '#fff', 56);
    }
    for (var i = 0; i < 4; i++) {
      st.lane[i] = Math.max(0, st.lane[i] - dt); st.jump[i] = Math.max(0, st.jump[i] - dt * 3);
      if (O.pressed(KEYS[i]) || O.gpPress(PAD[i], 0) || O.gpPress(PAD2[i], 0)) press(i);
    }
    st.notes.forEach(function (n) { if (!n.hit && st.song - n.t > 0.2) { n.hit = -1; st.combo = 0; } });
    st.judge = st.judge.filter(function (j) { j.life -= dt; return j.life > 0; });
    api.hud('Fluff ' + Math.round(100 * st.pts / st.max) + '%' + (st.combo > 2 ? ' · combo ' + st.combo : ''));
    if (!st.done && st.song > st.end + 0.8) {
      st.done = true; var pct = st.pts / st.max, s = stars3(pct, 0.75, 0.45); O.musicHold = false; O.audio(); O.SFX.done(); IDS.forEach(function (id, i) { st.jump[i] = 1; O.voice(id); });
      var perfect = st.notes.filter(function (n) { return n.hit === 2; }).length;
      setTimeout(function () { api.end({ stars: s, score: Math.round(pct * 100), text: 'The alpacas are ' + Math.round(pct * 100) + '% fluffy! ' + perfect + ' perfect bubbles, best combo ' + st.best + '.', need: 'Get 75% fluffy for 3 stars.', hearts: IDS.slice() }); }, 1000);
    }
  };
  A.render = function (c, W, H, DPR) {
    var L = layout(); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffe3f1'); g.addColorStop(1, '#e3f4ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var i = 0; i < 4; i++) {
      var x = L.x0 + L.lw * i; c.fillStyle = i % 2 ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.25)'; c.fillRect(x, L.top, L.lw, H - L.top);
      c.fillStyle = COLS[i]; c.globalAlpha = 0.25 + st.lane[i] * 3; c.fillRect(x, L.top, L.lw, L.ringY - L.top); c.globalAlpha = 1;
      var rx = laneX(L, i), rs = Math.min(L.lw * 0.3, H * 0.085); c.strokeStyle = '#4a2e1a'; c.lineWidth = 5; c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(rx, L.ringY, rs, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = COLS[i]; c.lineWidth = 3; c.beginPath(); c.arc(rx, L.ringY, rs - 6, 0, 7); c.stroke();
      var kl = document.body.classList.contains('touch') ? '' : String(i + 1); if (kl) txt(c, kl, rx, L.ringY, 22, '#fff');
      var ah = Math.min(L.lw * 1.25, H - L.ringY + 30), fl = st.fluff[i];
      spr(c, IDS[i], rx, H - 4 - Math.sin(st.jump[i] * Math.PI) * 24, ah * (1 + fl * 0.12), i < 2 ? 1 : -1, -fl * 0.05);
    }
    st.notes.forEach(function (n) {
      if (n.hit > 0) return; var y = L.ringY - (n.t - st.song) / LEAD * (L.ringY - L.top); if (y < L.top - 40 || y > H) return;
      var x = laneX(L, n.lane), r = Math.min(L.lw * 0.26, H * 0.072); c.globalAlpha = n.hit < 0 ? 0.35 : 1;
      var bg = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.6, 'rgba(255,255,255,.55)'); bg.addColorStop(1, COLS[n.lane]); c.fillStyle = bg;
      c.strokeStyle = '#4a2e1a'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); spr(c, 'i_brush', x, y + r * 0.55, r * 1.1); c.globalAlpha = 1;
    });
    st.judge.forEach(function (j) { c.globalAlpha = Math.min(1, j.life * 3); txt(c, j.t, laneX(L, j.i), L.ringY - L.lw * 0.45 - (0.6 - j.life) * 40, 24, j.t === 'Perfect!' ? '#ffd65a' : '#fff'); c.globalAlpha = 1; });
    st.parts.draw(c);
  };
  A.stop = function () { O.musicHold = false; O.audio(); };
})();

/* =====================================================================
   🎃 THE GREAT PUMPKIN ROLL — story runner with Boots
   ===================================================================== */
(function () {
  var R = M.roll = { intro: '', how: 'Press Space, Enter, Up or (A) to jump over hay bales and bunnies. Grab the apples!', howTouch: 'Tap anywhere to jump over the hay bales and bunnies. Grab the apples!' };
  var st, api, GY = 500, LEN = 13000;
  R.state = function () { return st; };
  var CHECK = [
    { x: 3200, txt: 'Peter the Peacock and the donkeys, Charlotte and Penelope, chased after it!', who: ['peter', 'charlotte', 'penelope'] },
    { x: 7200, txt: 'Kiwi the goat jumped right over it. Boing!', who: ['kiwi'] },
    { x: 10600, txt: 'Gaby the alpaca came running too. Almost there, Boots!', who: ['gaby'] }
  ];
  R.start = function (diff, a, season) {
    api = a; var obs = [], apples = [], x = 1100;
    while (x < LEN - 900) { var kind = Math.random() < 0.55 ? 'haystack' : 'bunnies'; obs.push({ x: x, kind: kind, hit: false, w: kind === 'haystack' ? 90 : 70 }); if (Math.random() < 0.7) apples.push({ x: x + rnd(-40, 40), y: GY - rnd(170, 230), got: false }); apples.push({ x: x + rnd(230, 330), y: GY - 60, got: false }); x += rnd(560, 820) / (diff > 1 ? 1.15 : 1); }
    st = { season: season, obs: obs, apples: apples, total: apples.length, got: 0, bumps: 0, b: { x: 0, y: GY, vy: 0, on: true, run: 0, slow: 0, sq: 0, buf: 0 }, pk: { x: 520, rot: 0 }, friends: [], banner: null, ci: 0, cam: 0, t: 0, speed: 330, parts: new Parts(), ready: new Ready(), win: 0, done: false };
    api.hud('🍎 0/' + st.total);
  };
  function sc() { var s = api.size(), k = Math.min(s.VH / 600, s.VW / 760); return { W: s.VW, H: s.VH, k: k, vw: s.VW / k, oy: s.VH - 600 * k }; }
  R.pointer = function (type) { if (type === 'down') st.b.buf = 0.15; };
  R.update = function (dt, inp) {
    st.parts.update(dt); if (st.banner) { st.banner.life -= dt; if (st.banner.life <= 0) st.banner = null; }
    if (!st.ready.update(dt)) return;
    var b = st.b, S0 = sc(); st.cam += ((b.x - S0.vw * 0.25) - st.cam) * Math.min(1, dt * 8);
    if (st.win) { st.win += dt; if (st.win > 1.2 && !st.kissed) { st.kissed = 1; O.voice('gaby'); st.parts.heart(b.x + 40, b.y - 160, 12, 1.3); O.SFX.levelup(); } if (st.win > 3.2 && !st.done) { st.done = true; var s = st.bumps <= 1 && st.got >= st.total * 0.65 ? 3 : st.bumps <= 4 ? 2 : 1; api.end({ stars: s, score: st.got, t: st.t, text: 'Boots caught the Great Pumpkin! You got ' + st.got + ' of ' + st.total + ' apples' + (st.bumps ? ' with ' + st.bumps + (st.bumps === 1 ? ' bump.' : ' bumps.') : ' and never bumped into anything!'), need: 'Jump over almost everything and grab lots of apples for 3 stars.', hearts: ['boots', 'gaby', 'peter', 'charlotte', 'penelope', 'kiwi'] }); } return; }
    st.t += dt;
    if (inp.act || O.pressed(['ArrowUp', 'w']) || O.gpPress('up', 0)) b.buf = 0.15; b.buf -= dt;
    if (b.buf > 0 && b.on) { b.vy = -860; b.on = false; b.buf = 0; b.sq = -0.1; O.SFX.jump(); }
    b.slow = Math.max(0, b.slow - dt); var spd = st.speed * (b.slow > 0 ? 0.45 : 1);
    b.x += spd * dt; b.run += dt * (b.slow ? 6 : 14); b.vy += 2100 * dt; b.y += b.vy * dt; if (b.y >= GY) { if (!b.on) { b.sq = 0.1; O.SFX.drop(); } b.y = GY; b.vy = 0; b.on = true; } b.sq += (0 - b.sq) * Math.min(1, dt * 10);
    // the pumpkin stays just ahead (it gets away a little when Boots bumps something)
    var want = Math.min(LEN, b.x + (b.slow ? 560 : 430)); st.pk.x += (want - st.pk.x) * Math.min(1, dt * 1.5); st.pk.rot += dt * 6;
    st.obs.forEach(function (o) { if (!o.hit && Math.abs(o.x - (b.x + 30)) < o.w * 0.5 + 30 && b.y > GY - (o.kind === 'haystack' ? 80 : 50)) { o.hit = true; st.bumps++; b.slow = 1.0; O.SFX.bonk(); O.voice('boots'); st.parts.text(b.x, GY - 170, 'Oops!', '#fff', 30); if (o.kind === 'bunnies') O.voice('bunnies'); } });
    st.apples.forEach(function (a) { if (!a.got && Math.abs(a.x - (b.x + 30)) < 60 && Math.abs(a.y - (b.y - 80)) < 80) { a.got = true; st.got++; O.SFX.coin(); st.parts.text(a.x, a.y - 30, '+1', '#ffd65a'); } });
    var C = CHECK[st.ci]; if (C && b.x > C.x) { st.ci++; st.banner = { txt: C.txt, life: 4.5 }; O.say(C.txt); C.who.forEach(function (id, i) { st.friends.push({ id: id, off: 170 + st.friends.length * 95, run: rnd(0, 6) }); O.voice(id); }); O.SFX.chime(); }
    if (b.x >= LEN - 470) { st.win = 0.01; O.SFX.done(); st.banner = { txt: 'STOP! Boots caught it with one big, fluffy hoof!', life: 3.2 }; O.say('Stop! Boots caught it!'); st.parts.spark(st.pk.x, GY - 80, 24, '#ffb347'); }
    var S = sc(); st.cam += ((b.x - S.vw * 0.25) - st.cam) * Math.min(1, dt * 8);
    api.hud('🍎 ' + st.got + '/' + st.total);
  };
  R.render = function (c, W, H, DPR) {
    var S = sc(), k = S.k, im = O.IMG.bg_hill; c.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (im && im.naturalWidth) { var ih = H, iw = ih * im.naturalWidth / im.naturalHeight, off = -((st.cam * k * 0.25) % (iw * 2)); for (var i = -1; i < W / iw + 2; i++) { var x = off + i * iw; c.save(); if (((i % 2) + 2) % 2) { c.translate(x + iw, 0); c.scale(-1, 1); c.drawImage(im, 0, 0, iw, ih); } else c.drawImage(im, x, 0, iw, ih); c.restore(); } }
    else sky(c, st.season, W, H, S.oy + GY * k);
    c.setTransform(DPR * k, 0, 0, DPR * k, 0, DPR * S.oy); c.save(); c.translate(-st.cam, 0);
    c.fillStyle = '#c99c62'; c.fillRect(st.cam - 10, GY - 6, S.vw + 20, 600 - GY + 6); c.fillStyle = '#6fb24e'; c.fillRect(st.cam - 10, GY + 34, S.vw + 20, 600);
    c.fillStyle = 'rgba(120,80,40,.35)'; var d0 = Math.floor(st.cam / 70) * 70; for (var dx = d0; dx < st.cam + S.vw + 70; dx += 70) { c.beginPath(); c.ellipse(dx, GY + 12, 10, 3, 0, 0, 7); c.fill(); }
    st.obs.forEach(function (o) { if (o.x < st.cam - 200 || o.x > st.cam + S.vw + 200) return; if (o.kind === 'haystack') spr(c, 'haystack', o.x, GY + 4, 92); else spr(c, 'bunnies', o.x, GY + 4, 62, o.hit ? 1 : -1, 0); });
    st.apples.forEach(function (a) { if (!a.got && a.x > st.cam - 80 && a.x < st.cam + S.vw + 80) spr(c, 'i_apple', a.x, a.y + 18 + Math.sin(st.t * 4 + a.x) * 4, 42); });
    // finish: the farm truck waiting at the bottom of the hill
    spr(c, 'truck', LEN + 140, GY + 4, 150, -1);
    if (!st.win) spr(c, 'pumpkin_big', st.pk.x, GY + 6, 96, 1, 0, st.pk.rot);
    else spr(c, 'pumpkin_big', st.b.x + 120, GY + 6, 96, 1, 0, 0);
    st.friends.forEach(function (f) { f.run += 0.2; var fx = st.b.x - f.off, bob = Math.abs(Math.sin(f.run)) * -6; spr(c, f.id, fx, GY + 2 + bob, O.BY[f.id].h * 0.85, 1); });
    var b = st.b, bob2 = b.on ? Math.abs(Math.sin(b.run)) * -6 : 0, fl = b.slow > 0 && Math.floor(b.slow * 10) % 2;
    if (!fl) spr(c, 'boots', b.x, b.y + 2 + bob2, 150, 1, b.sq);
    if (st.win > 0.6) { var gx = st.b.x + 260 - Math.min(1, (st.win - 0.6)) * 150; spr(c, 'gaby', gx, GY + 2, 120, -1); }
    st.parts.draw(c); c.restore();
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (st.banner) { var bw = Math.min(W - 30, 720), lines = wrapLines(c, st.banner.txt, bw - 30, 20); c.globalAlpha = Math.min(1, st.banner.life * 2); c.fillStyle = '#fffdf6'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 4; rr(c, W / 2 - bw / 2, 66, bw, 22 + lines.length * 26, 16); c.fill(); c.stroke(); c.fillStyle = '#4a2e1a'; c.font = '600 20px Fredoka'; c.textAlign = 'center'; lines.forEach(function (l, i) { c.fillText(l, W / 2, 92 + i * 26); }); c.globalAlpha = 1; }
    var pr = clamp(st.b.x / LEN, 0, 1), pw = Math.min(260, W * 0.4); c.fillStyle = 'rgba(255,255,255,.6)'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 3; rr(c, W / 2 - pw / 2, H - 30, pw, 14, 7); c.fill(); c.stroke(); spr(c, 'boots', W / 2 - pw / 2 + pw * pr, H - 20, 34); spr(c, 'pumpkin_big', W / 2 + pw / 2, H - 18, 26);
    st.ready.draw(c, W, H);
  };
  function wrapLines(c, s, maxw, size) { c.font = '600 ' + size + 'px Fredoka'; var w = s.split(' '), out = [], cur = ''; w.forEach(function (x) { var t = cur ? cur + ' ' + x : x; if (c.measureText(t).width > maxw && cur) { out.push(cur); cur = x; } else cur = t; }); if (cur) out.push(cur); return out; }
  R.stop = function () {};
})();

/* =====================================================================
   🐓 RODNEY OVERSLEEPS — a copy-the-sounds game to wake him up
   ===================================================================== */
(function () {
  var W0 = M.wake = { intro: '', how: 'Watch and listen! Then press the friends in the same order: keys 1 to 5, or arrows and Space. Or click them.', howTouch: 'Watch and listen! Then tap the friends in the same order.' };
  var st, api, IDS = ['charlotte', 'penelope', 'lola', 'mo', 'peter'], COLS = ['#ff9ec4', '#9fd6ff', '#ffd65a', '#b7e88f', '#c9a7ff'];
  W0.state = function () { return st; };
  W0.start = function (diff, a, season) {
    api = a; var rounds = diff > 1 ? 7 : 5, seq = []; for (var i = 0; i < rounds + 1; i++) seq.push((Math.random() * 5) | 0);
    for (var j = 1; j < seq.length; j++) if (seq[j] === seq[j - 1] && Math.random() < 0.6) seq[j] = (seq[j] + 1 + ((Math.random() * 4) | 0)) % 5;
    st = { season: season, rounds: rounds, round: 1, seq: seq, phase: 'show', i: 0, t: -1.2, inp: 0, glow: [0, 0, 0, 0, 0], jump: [0, 0, 0, 0, 0], cur: 2, kb: 0, oops: 0, wake: 0, z: 0, parts: new Parts(), ready: new Ready(), done: false, msg: '' };
    api.hud('Round 1/' + rounds);
  };
  function len() { return st.round + 1; }
  function layout() { var s = api.size(), W = s.VW, H = s.VH, n = 5, slot = Math.min(W / n, 220), x0 = W / 2 - slot * n / 2, gy = H * 0.94, ah = Math.min(slot * 1.1, H * 0.3); return { W: W, H: H, slot: slot, x0: x0, gy: gy, ah: ah, k: Math.min(W / 900, H / 640) }; }
  function sound(i) { st.glow[i] = 0.5; st.jump[i] = 1; O.voice(IDS[i]); O.SFX.note(i); }
  function tap(i) {
    if (st.phase !== 'you' || st.done) return; sound(i);
    var L = layout();
    if (st.seq[st.inp] === i) { st.inp++; st.parts.spark(L.x0 + L.slot * (i + 0.5), L.gy - L.ah, 6, COLS[i]);
      if (st.inp >= len()) { st.phase = 'yay'; st.t = 0; st.wake = st.round / st.rounds; O.SFX.chime(); st.msg = pick(['Great job!', 'You got it!', 'Wow!', 'Super!']); } }
    else { st.oops++; st.phase = 'oops'; st.t = 0; O.SFX.no(); st.msg = 'Oops! Listen again…'; O.say('Oops! Listen again.'); }
  }
  W0.pointer = function (type, x, y) { if (type !== 'down') return; st.kb = 0; var L = layout(), i = Math.floor((x - L.x0) / L.slot); if (i >= 0 && i < 5 && y > L.gy - L.ah * 1.3) tap(i); };
  W0.update = function (dt) {
    st.parts.update(dt); if (!st.ready.update(dt)) return;
    for (var i = 0; i < 5; i++) { st.glow[i] = Math.max(0, st.glow[i] - dt); st.jump[i] = Math.max(0, st.jump[i] - dt * 2.5); }
    st.z += dt; st.t += dt;
    if (st.phase === 'show') {
      var step = 0.85, k = Math.floor(st.t / step);
      if (st.t >= 0 && k >= st.i && st.i < len()) { sound(st.seq[st.i]); st.i++; }
      if (st.t > len() * step + 0.2) { st.phase = 'you'; st.inp = 0; st.msg = 'Your turn!'; O.SFX.pop(); }
    } else if (st.phase === 'you') {
      for (var j = 0; j < 5; j++) if (O.pressed([String(j + 1)])) { st.kb = 0; tap(j); }
      if (O.pressed(['ArrowRight', 'd']) || O.gpPress('right', 0)) { st.cur = (st.cur + 1) % 5; st.kb = 1; }
      if (O.pressed(['ArrowLeft', 'a']) || O.gpPress('left', 0)) { st.cur = (st.cur + 4) % 5; st.kb = 1; }
      if (O.pressed([' ', 'Enter', 'e', 'j']) || O.gpPress('a', 0)) { st.kb = 1; tap(st.cur); }
    } else if (st.phase === 'oops') { if (st.t > 1.3) { st.phase = 'show'; st.i = 0; st.t = -0.3; st.msg = ''; } }
    else if (st.phase === 'yay') {
      if (st.t > 1.1) {
        if (st.round >= st.rounds) { st.phase = 'awake'; st.t = 0; O.voice('rodney'); O.kindVoice('rooster', 1); st.msg = 'COCK-A-DOODLE-DOO!'; O.SFX.done(); var L = layout(); st.parts.heart(L.W / 2, L.H * 0.3, 14, 1.3); }
        else { st.round++; st.phase = 'show'; st.i = 0; st.t = -0.5; st.msg = ''; api.hud('Round ' + st.round + '/' + st.rounds); }
      }
    } else if (st.phase === 'awake' && st.t > 2.6 && !st.done) {
      st.done = true; var s = st.oops <= 1 ? 3 : st.oops <= 3 ? 2 : 1;
      api.end({ stars: s, score: st.rounds, text: 'Rodney is awake! You copied all ' + st.rounds + ' rounds' + (st.oops ? ' with ' + st.oops + (st.oops === 1 ? ' oops.' : ' oopses.') : ' without a single mistake!'), need: 'Make one mistake or fewer for 3 stars.', hearts: ['rodney'].concat(IDS) });
    }
  };
  W0.render = function (c, W, H, DPR) {
    var L = layout(); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    var dawn = st.wake, g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, dawn > 0.99 || st.phase === 'awake' ? '#8fd3ff' : 'rgb(' + Math.round(40 + 160 * dawn) + ',' + Math.round(50 + 150 * dawn) + ',' + Math.round(110 + 120 * dawn) + ')'); g.addColorStop(1, '#ffd9a8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    var sunY = H * (0.72 - dawn * 0.4); c.fillStyle = '#ffd65a'; c.beginPath(); c.arc(W * 0.82, sunY, 46 * L.k + 20, 0, 7); c.fill();
    c.fillStyle = O.SEASONS[st.season].grass[0]; c.fillRect(0, H * 0.62, W, H);
    // Rodney on top of the Chicken Dome
    var dy = H * 0.62, dh = Math.min(H * 0.3, 250); spr(c, 'dome', W / 2, dy, dh); var rh = Math.min(H * 0.16, 120) * (st.phase === 'awake' ? 1.15 : 1), ry = dy - dh * 0.86;
    var awake = st.phase === 'awake', sq = awake ? Math.sin(st.t * 12) * 0.06 : Math.sin(st.z * 2) * 0.04;
    spr(c, 'rodney', W / 2, ry - (awake ? Math.abs(Math.sin(st.t * 6)) * 20 : 0), rh, 1, sq, awake ? 0 : 0.18);
    if (!awake) { c.globalAlpha = 0.85; for (var z = 0; z < 3; z++) { var p = (st.z * 0.5 + z / 3) % 1; txt(c, 'Z', W / 2 + 40 + p * 60, ry - rh * 0.8 - p * 80, (18 + p * 22) * (1 - dawn * 0.6), '#fff'); } c.globalAlpha = 1; }
    if (st.msg) txt(c, st.msg, W / 2, 122, Math.min(40, W * 0.07), st.phase === 'oops' ? '#ffd1d1' : '#ffd65a');
    for (var i = 0; i < 5; i++) {
      var x = L.x0 + L.slot * (i + 0.5), gl = st.glow[i];
      c.fillStyle = COLS[i]; c.globalAlpha = 0.35 + gl * 1.3; c.strokeStyle = '#4a2e1a'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, L.gy - 4, L.slot * 0.42, L.slot * 0.14, 0, 0, 7); c.fill(); c.globalAlpha = 1; c.stroke();
      spr(c, IDS[i], x, L.gy - Math.sin(st.jump[i] * Math.PI) * 26, L.ah * (IDS[i] === 'mo' ? 0.8 : 1), i < 2 ? 1 : -1, gl * 0.1);
      if (!document.body.classList.contains('touch')) txt(c, String(i + 1), x, L.gy + 18 - L.slot * 0.05, 18, '#fff');
      if (st.kb && i === st.cur && st.phase === 'you') { c.strokeStyle = '#2a8fd6'; c.lineWidth = 5; c.beginPath(); c.ellipse(x, L.gy - 4, L.slot * 0.46, L.slot * 0.17, 0, 0, 7); c.stroke(); }
    }
    // round dots
    for (var r = 0; r < st.rounds; r++) { c.fillStyle = r < st.round - (st.phase === 'yay' || st.phase === 'awake' ? 0 : 1) ? '#ffd65a' : 'rgba(255,255,255,.5)'; c.strokeStyle = '#4a2e1a'; c.lineWidth = 2; c.beginPath(); c.arc(W / 2 + (r - (st.rounds - 1) / 2) * 24, 78, 8, 0, 7); c.fill(); c.stroke(); }
    st.parts.draw(c); st.ready.draw(c, W, H);
  };
  W0.stop = function () {};
})();
})();
