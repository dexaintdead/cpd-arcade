/* Oak Hill Farm v2 — Coloring mode: every page of the Oak Hill Farm coloring book and the three mini story books.
   Tap a space to fill it (the black lines are the walls), or draw with the crayon. Pages remember what you did
   (a short list of fills and strokes per page, in localStorage 'ohf_color_<page>'), so nothing big is stored. */
(function () {
'use strict';
var O = window.OHF, $ = O.$;
var C = O.COLOR = {};
var MAIN = [["main_ph3_two_horses", "Boots and Nugget, Best Friends"], ["main_p01_goats_spools", "King of the Spools"], ["main_ph2_calf_fence", "Peekaboo, Highland Calf!"], ["main_p02_alpaca", "Fluffy Alpaca"], ["main_p06_hen_chicks", "Mama Hen and Her Chicks"], ["main_ph1_horse_alpaca_kiss", "Boots Gives Gaby a Kiss"], ["main_p05_bunnies", "Bunny Snack Time"], ["main_p11_feeding_goat", "Feeding Time!"], ["main_p03_highland_calf", "Shaggy Little Calf"], ["main_p07_rooster", "Good Morning, Rooster!"], ["main_p00_horses_fence", "Boots and Nugget Say Hello!"], ["main_p13_alpaca_pair", "Alpaca Hugs"], ["main_p10_farm_stand", "The Fall Farm Stand"], ["main_p15_goat_leap", "Jumping Baby Goat"], ["main_p08_sheep_dome", "Sheep in the Pasture"], ["main_p17_highland_mom", "Highland Mom and Baby"], ["main_p09_peacock", "Peter the Peacock"], ["main_p20_chickens_feed", "Peck, Peck, Peck!"], ["main_ph4_horse_alpacas", "Boots Visits the Alpacas"], ["main_p18_bunny_garden", "The Giant Carrot"], ["main_p14_horse_trough", "Silly Boots!"], ["main_p22_goat_face", "Say Cheese, Goat!"], ["main_p12_pumpkin_patch", "Pumpkin Patch"], ["main_p04_pony", "Prancing Pony"], ["main_p21_sheep_tree", "Nap Under the Oak Tree"], ["main_p19_pony_portrait", "Pretty Pony"], ["main_p16_barn_peek", "Who Lives in the Barn?"], ["main_p23_group", "All the Farm Friends!"]];
var BOOKS = [['Peekaboo, George!', 1], ['The Great Pumpkin Roll', 2], ['Rodney Oversleeps', 3]];
var PAGES = {}, SECTIONS = [{ name: '📒 The Oak Hill Farm Coloring Book', keys: [] }];
MAIN.forEach(function (m) { PAGES[m[0]] = m[1]; SECTIONS[0].keys.push(m[0]); });
BOOKS.forEach(function (b) { var s = { name: '📖 ' + b[0], keys: [] }; for (var p = 1; p <= 6; p++) { var k = 'mini_b' + b[1] + 'p' + p; PAGES[k] = b[0] + ' · page ' + p; s.keys.push(k); } SECTIONS.push(s); });
C.PAGES = PAGES;
var CRAYONS = ['#e8473a', '#ff8a3c', '#ffd65a', '#fff3a0', '#8fd16a', '#3f9a3e', '#7cc6f0', '#2a6fd6', '#8e5bd6', '#ff8ec7', '#ffc9a0', '#d9b37c', '#8a5a30', '#9aa3ad', '#2b2b2b', '#ffffff'];
var SIZES = [6, 14, 28];
function pageSrc(k) { return 'ohf/color/' + k + '.png?v=1'; }
function load(k) { try { return JSON.parse(O.ls('ohf_color_' + k) || '[]') || []; } catch (e) { return []; } }
function store(k, ops) { try { if (ops.length) O.ls('ohf_color_' + k, JSON.stringify(ops)); else O.ls('ohf_color_' + k, null); } catch (e) { O.toast('This device is out of room to save coloring.'); } }

var from = 'title', E = null;   // E = the open page
C.open = function (key) {
  from = O.UI.S.mode === 'color' ? from : O.UI.S.mode; O.engineOn(false); O.stopTalk();
  O.UI.hideAll(); O.UI.setMode('color'); $('colorEd').classList.remove('show');
  if (key && PAGES[key]) { openPage(key); return; }
  gallery();
};
function gallery() {
  var g = $('cgal'); g.innerHTML = '';
  SECTIONS.forEach(function (s) {
    var h = document.createElement('div'); h.className = 'chead'; h.textContent = s.name; g.appendChild(h);
    var grid = document.createElement('div'); grid.className = 'cgrid';
    s.keys.forEach(function (k) {
      var did = load(k).length > 0, d = document.createElement('div'); d.className = 'card' + (did ? ' did' : ''); d.tabIndex = 0;
      d.innerHTML = '<img loading="lazy" src="' + pageSrc(k) + '" alt=""><span class="nm"></span>'; d.querySelector('.nm').textContent = (did ? '🎨 ' : '') + PAGES[k];
      d.addEventListener('click', function () { O.audio(); O.SFX.pop(); openPage(k); }); grid.appendChild(d);
    });
    g.appendChild(grid);
  });
  O.UI.show('colorS');
}
$('colorX').addEventListener('click', function () { O.audio(); O.UI.hide('colorS'); if (from === 'title') O.UI.toTitle(); else O.UI.toMap(); });

/* ---------------- the editor ---------------- */
var cv = $('ccv'), ctx = cv.getContext('2d'), col = document.createElement('canvas'), cc = col.getContext('2d');
var tool = 'fill', color = CRAYONS[0], size = 1, drawing = null;
function openPage(k) {
  O.UI.hide('colorS'); $('colorEd').classList.add('show'); $('cTitle').textContent = '🖍️ ' + PAGES[k];
  var im = new Image(); E = { key: k, img: im, ops: load(k), ready: false };
  im.onload = function () {
    if (!E || E.img !== im) return;
    var w = im.naturalWidth, h = im.naturalHeight; cv.width = col.width = w; cv.height = col.height = h;
    var t = document.createElement('canvas'); t.width = w; t.height = h; var tc = t.getContext('2d'); tc.drawImage(im, 0, 0);
    var d = tc.getImageData(0, 0, w, h).data, wall = new Uint8Array(w * h);
    for (var i = 0, j = 0; i < wall.length; i++, j += 4) wall[i] = (d[j + 3] > 128 && d[j] + d[j + 1] + d[j + 2] < 400) ? 1 : 0;
    E.w = w; E.h = h; E.wall = wall; E.mark = new Uint32Array(w * h); E.gen = 0; E.ready = true;
    replay(); fit();
  };
  im.src = pageSrc(k);
  paintTools();
  O.say('Pick a color, then tap a space to fill it in!');
}
C.openPage = openPage;
function fit() {
  if (!E || !E.ready) return; var wr = $('cwrap').getBoundingClientRect(), s = Math.min((wr.width - 20) / E.w, (wr.height - 20) / E.h);
  cv.style.width = Math.max(50, Math.floor(E.w * s)) + 'px'; cv.style.height = Math.max(50, Math.floor(E.h * s)) + 'px';
}
addEventListener('resize', function () { if ($('colorEd').classList.contains('show')) fit(); });
function compose() {
  if (!E || !E.ready) return; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, E.w, E.h); ctx.drawImage(col, 0, 0);
  ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(E.img, 0, 0); ctx.globalCompositeOperation = 'source-over';
}
function hexRGB(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// flood fill over everything that isn't a black line
function fillAt(x, y, hex, data) {
  var w = E.w, h = E.h, wall = E.wall; x = x | 0; y = y | 0;
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  if (wall[y * w + x]) { // tapped right on a line: use the closest open spot
    var best = -1, bd = 99; for (var dy = -6; dy <= 6; dy++) for (var dx = -6; dx <= 6; dx++) { var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || wall[yy * w + xx]) continue; var d2 = dx * dx + dy * dy; if (d2 < bd) { bd = d2; best = yy * w + xx; } }
    if (best < 0) return false; x = best % w; y = (best / w) | 0;
  }
  var g = ++E.gen, mark = E.mark, rgb = hexRGB(hex), stack = [y * w + x], px = data.data;
  while (stack.length) {
    var p = stack.pop(); if (mark[p] === g) continue; var py = (p / w) | 0, lx = p - py * w, rx = lx, row = py * w;
    while (lx > 0 && !wall[row + lx - 1] && mark[row + lx - 1] !== g) lx--;
    while (rx < w - 1 && !wall[row + rx + 1] && mark[row + rx + 1] !== g) rx++;
    var upOpen = false, dnOpen = false;
    for (var i = lx; i <= rx; i++) {
      var q = row + i; mark[q] = g; var o = q * 4; px[o] = rgb[0]; px[o + 1] = rgb[1]; px[o + 2] = rgb[2]; px[o + 3] = 255;
      if (py > 0) { var u = q - w; if (!wall[u] && mark[u] !== g) { if (!upOpen) { stack.push(u); upOpen = true; } } else upOpen = false; }
      if (py < h - 1) { var dn = q + w; if (!wall[dn] && mark[dn] !== g) { if (!dnOpen) { stack.push(dn); dnOpen = true; } } else dnOpen = false; }
    }
  }
  return true;
}
function stroke(op) {
  var p = op.p; cc.save(); cc.lineCap = cc.lineJoin = 'round'; cc.lineWidth = op.s; cc.strokeStyle = op.c; cc.fillStyle = op.c;
  if (op.e) cc.globalCompositeOperation = 'destination-out';
  cc.beginPath(); cc.moveTo(p[0], p[1]); if (p.length === 2) { cc.arc(p[0], p[1], op.s / 2, 0, 7); cc.fill(); } else { for (var i = 2; i < p.length; i += 2) cc.lineTo(p[i], p[i + 1]); cc.stroke(); }
  cc.restore();
}
function applyOps(ops) {
  var data = null;
  ops.forEach(function (op) {
    if (op.f) { if (!data) data = cc.getImageData(0, 0, E.w, E.h); fillAt(op.f[0], op.f[1], op.f[2], data); }
    else { if (data) { cc.putImageData(data, 0, 0); data = null; } stroke(op); }
  });
  if (data) cc.putImageData(data, 0, 0);
}
function replay() { cc.clearRect(0, 0, E.w, E.h); applyOps(E.ops); compose(); }
function pt(e) { var r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * E.w), Math.round((e.clientY - r.top) / r.height * E.h)]; }
function did() { store(E.key, E.ops); if (!O.SAVE.stickers.artist) O.giveSticker('artist'); }
cv.addEventListener('pointerdown', function (e) {
  if (!E || !E.ready) return; O.audio(); e.preventDefault(); var p = pt(e);
  if (tool === 'fill') { var op = { f: [p[0], p[1], color] }; applyOps([op]); compose(); E.ops.push(op); O.SFX.pop(); did(); return; }
  try { cv.setPointerCapture(e.pointerId); } catch (x) {}
  drawing = { id: e.pointerId, op: { c: color, s: SIZES[size] * E.w / 1000, e: tool === 'erase' ? 1 : 0, p: [p[0], p[1]] } }; stroke(drawing.op); compose();
});
cv.addEventListener('pointermove', function (e) {
  if (!drawing || e.pointerId !== drawing.id) return; var p = pt(e), a = drawing.op.p, lx = a[a.length - 2], ly = a[a.length - 1];
  if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < 3) return;
  cc.save(); cc.lineCap = 'round'; cc.lineWidth = drawing.op.s; cc.strokeStyle = drawing.op.c; if (drawing.op.e) cc.globalCompositeOperation = 'destination-out'; cc.beginPath(); cc.moveTo(lx, ly); cc.lineTo(p[0], p[1]); cc.stroke(); cc.restore();
  a.push(p[0], p[1]); if (a.length > 4000) { endDraw(); } compose(); if (Math.random() < 0.15) O.SFX.brush();
});
function endDraw() { if (!drawing) return; E.ops.push(drawing.op); drawing = null; did(); }
['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function (e) { if (drawing && e.pointerId === drawing.id) endDraw(); }); });

/* ---------------- tools ---------------- */
var pal = $('cpal');
CRAYONS.forEach(function (h, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (i === 0 ? ' sel' : ''); b.style.background = h; b.title = 'Color ' + (i + 1); b.addEventListener('click', function () { color = h; if (tool === 'erase') tool = 'draw'; O.SFX.pop(); paintTools(); }); pal.appendChild(b); });
var sz = document.createElement('div'); sz.className = 'csize'; SIZES.forEach(function (s, i) { var b = document.createElement('button'); b.type = 'button'; b.title = ['Thin', 'Medium', 'Thick'][i] + ' crayon'; b.innerHTML = '<i style="width:' + (4 + i * 5) + 'px;height:' + (4 + i * 5) + 'px"></i>'; b.addEventListener('click', function () { size = i; if (tool === 'fill') tool = 'draw'; O.SFX.pop(); paintTools(); }); sz.appendChild(b); }); pal.appendChild(sz);
function paintTools() {
  [].forEach.call(pal.querySelectorAll('.sw'), function (b, i) { b.classList.toggle('sel', CRAYONS[i] === color); });
  [].forEach.call(sz.children, function (b, i) { b.classList.toggle('sel', i === size && tool !== 'fill'); });
  $('cFill').classList.toggle('sel', tool === 'fill'); $('cDraw').classList.toggle('sel', tool === 'draw'); $('cErase').classList.toggle('sel', tool === 'erase');
  cv.style.cursor = tool === 'fill' ? 'cell' : 'crosshair';
}
$('cFill').addEventListener('click', function () { tool = 'fill'; O.SFX.pop(); paintTools(); });
$('cDraw').addEventListener('click', function () { tool = 'draw'; O.SFX.pop(); paintTools(); });
$('cErase').addEventListener('click', function () { tool = 'erase'; O.SFX.pop(); paintTools(); });
$('cUndo').addEventListener('click', function () { if (!E || !E.ops.length) return; E.ops.pop(); store(E.key, E.ops); replay(); O.SFX.drop(); });
var clearArm = 0;
$('cClear').addEventListener('click', function () { if (!E) return; if (Date.now() - clearArm > 2500) { clearArm = Date.now(); O.toast('Tap 🗑️ again to start this page over.'); return; } clearArm = 0; E.ops = []; store(E.key, E.ops); replay(); O.SFX.drop(); });
$('cBack').addEventListener('click', function () { O.audio(); closeEd(); });
function closeEd() { $('colorEd').classList.remove('show'); E = null; gallery(); }
function picture(cb) {
  // the finished picture with a little Oak Hill Farm caption underneath
  var pad = Math.round(E.w * 0.06), out = document.createElement('canvas'); out.width = E.w; out.height = E.h + pad; var o = out.getContext('2d');
  o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height); o.drawImage(cv, 0, 0);
  o.fillStyle = '#4a2e1a'; o.font = '600 ' + Math.round(pad * 0.42) + 'px Fredoka, sans-serif'; o.textAlign = 'center'; o.fillText(PAGES[E.key] + ' · Oak Hill Farm · Holmdel, NJ', E.w / 2, E.h + pad * 0.62);
  cb(out);
}
$('cSave').addEventListener('click', function () {
  if (!E || !E.ready) return; O.audio();
  picture(function (out) {
    out.toBlob(function (b) {
      if (!b) return; var a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = 'oak-hill-farm-' + E.key.replace(/^main_|^mini_/, '').replace(/_/g, '-') + '.png';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 4000); O.SFX.chime(); O.toast('💾 Saved your picture!');
    }, 'image/png');
  });
});
$('cPrint').addEventListener('click', function () {
  if (!E || !E.ready) return; O.audio();
  picture(function (out) {
    var url = out.toDataURL('image/png');
    if (O.EMBED) { O.post('print', { img: url, title: PAGES[E.key] }); return; }
    var pa = $('printArea'); pa.innerHTML = ''; var im = new Image(); im.onload = function () { window.print(); }; im.src = url; pa.appendChild(im);
  });
});
// Escape / controller (B) goes back; the editor itself is for fingers and mice
C.tick = function () {
  if (!$('colorEd').classList.contains('show')) return false;
  if (O.pressed(['Escape', 'Backspace']) || O.anyPadPress('b')) closeEd();
  if (O.pressed(['z']) && (O.K.Control || O.K.Meta)) $('cUndo').click();
  return true;
};
})();
