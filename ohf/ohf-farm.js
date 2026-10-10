/* Oak Hill Farm v2 — the farm: world, farmhands, truck, animals, chores, seasons, render */
(function () {
'use strict';
var O = window.OHF, $ = O.$, clamp = O.clamp, rnd = O.rnd, pick = O.pick, dist = O.dist;
var F = O.FARM = {};

/* ---------------- world layout ---------------- */
var WW = 3200, WH = 2300; F.WW = WW; F.WH = WH;
var PENS = F.PENS = {
  horses: { x: 150, y: 170, w: 780, h: 540, gate: 'r', g: 560, name: 'Horse paddock' },
  ponies: { x: 150, y: 830, w: 780, h: 470, gate: 'r', g: 1180, name: 'Pony corral' },
  donkeys: { x: 150, y: 1420, w: 780, h: 520, gate: 'r', g: 1560, name: 'Donkey & mule paddock' },
  cows: { x: 2270, y: 170, w: 780, h: 600, gate: 'l', g: 600, name: 'Highland pasture' },
  alpacas: { x: 2270, y: 890, w: 780, h: 470, gate: 'l', g: 1240, name: 'Alpaca pen' },
  chickens: { x: 2270, y: 1480, w: 780, h: 470, gate: 'l', g: 1600, name: 'Chicken Dome' },
  goats: { x: 1710, y: 1400, w: 470, h: 430, gate: 't', g: 1830, name: 'Goat yard' },
  sheep: { x: 1020, y: 1400, w: 470, h: 430, gate: 't', g: 1370, name: 'Sheep meadow' },
  bunnies: { x: 1930, y: 1010, w: 250, h: 220, gate: 't', g: 2120, name: 'Bunny hutch' }
};
var GATE = 150, YARD = { x: 1080, y: 760, w: 1100, h: 560 };
var BASE_STATIONS = [
  { id: 'hayloft', x: 1330, y: 560, item: 'hay', label: 'Hay stack', spr: 'haystack', sh: 150 },
  { id: 'shed', x: 1120, y: 790, item: 'grain', label: 'Feed shed', spr: 'shed', sh: 190 },
  { id: 'pump', x: 2080, y: 760, item: 'water', label: 'Water pump', spr: 'pump', sh: 96 },
  { id: 'garden', x: 1180, y: 1170, item: 'carrot', label: 'Carrot garden', spr: 'garden', sh: 110 },
  { id: 'brush', x: 1870, y: 620, item: 'brush', label: 'Grooming brush', spr: null },
  { id: 'rake', x: 1990, y: 640, item: 'rake', label: 'Rake', spr: 'wheelbarrow', sh: 66 },
  { id: 'stand', x: 1330, y: 2040, item: 'apple', label: 'Farm Stand', spr: 'stand', sh: 200 },
  { id: 'market', x: 1895, y: 2040, item: null, label: 'Farm Market · decorations', spr: 'coffee', sh: 220 }
];
var SEASON_STATIONS = {
  winter: [{ id: 'blankets', x: 2170, y: 630, item: 'blanket', label: 'Blanket rack', spr: null }],
  spring: [{ id: 'seeds', x: 1330, y: 1180, item: 'seeds', label: 'Seed crate', spr: null }],
  summer: [{ id: 'seeds', x: 1330, y: 1180, item: 'seeds', label: 'Seed crate', spr: null }, { id: 'hose', x: 2170, y: 770, item: 'hose', label: 'Garden hose', spr: null },
    { id: 'melon', x: 1150, y: 2060, item: 'melon', label: 'Watermelon cooler', spr: null }, { id: 'flowers', x: 920, y: 2070, item: 'bouquet', label: 'Flower field', spr: 'flowerbed', sh: 110 }]
};
var TROUGHS = F.TROUGHS = { horses: [880, 420], ponies: [880, 1000], donkeys: [880, 1760], cows: [2330, 420], alpacas: [2330, 1060], goats: [2120, 1480], sheep: [1090, 1480] };
var FEEDERS = F.FEEDERS = { horses: [880, 300], cows: [2340, 280], alpacas: [2340, 960], donkeys: [880, 1500] };
var DOMEFEED = F.DOMEFEED = [2350, 1720];
var PLOTS_XY = [[1060, 1262], [1150, 1262], [1240, 1262], [1060, 1336], [1150, 1336], [1240, 1336]];
var SNOWMAN = [1760, 1250];
var SOLIDS = [[1410, 450, 380, 150], [1250, 500, 160, 70], [1035, 720, 170, 70], [2055, 725, 50, 35], [1090, 1120, 180, 60], [1225, 1985, 215, 60], [1770, 1985, 250, 60], [2565, 1600, 270, 110], [1985, 1060, 150, 40], [1095, 1440, 60, 30]];
var PROPS = [['barn', 1600, 600, 370], ['dome', 2700, 1710, 270], ['oak', 1130, 1470, 330], ['hutch', 2060, 1090, 110], ['spool', 1820, 1560, 64], ['spool', 2030, 1640, 70], ['spool', 1900, 1740, 58]];
F.DECOR = [
  { id: 'pumpkins', name: 'Pumpkin patch', cost: 6, spots: [[1500, 690, 64], [1720, 700, 58], [1450, 1990, 60]] },
  { id: 'mums', name: 'Fall mums', cost: 5, spots: [[1480, 620, 72], [1735, 630, 72]] },
  { id: 'sunflower', name: 'Sunflowers', cost: 5, spots: [[1010, 1210, 120], [1420, 1225, 110]] },
  { id: 'bunting', name: 'Barn bunting', cost: 10, img: 'barn', spots: [] },
  { id: 'lights', name: 'Twinkle lights', cost: 8, img: 'i_heart', spots: [] },
  { id: 'flowerbed2', name: 'Flower patch', cost: 7, img: 'flowerbed', spots: [[2190, 1340, 80], [1480, 1330, 70]] },
  { id: 'haystack', name: 'Hay bale stack', cost: 8, spots: [[2190, 1220, 110]] },
  { id: 'wheelbarrow2', name: 'Wheelbarrow', cost: 4, img: 'wheelbarrow', spots: [[1700, 1300, 56]] }
];
// decorations belong to a season (bought again each season, so every festival day has something to buy)
var DECOR_SEASONS = { pumpkins: ['fall'], mums: ['fall'], sunflower: ['fall', 'summer'], bunting: ['fall', 'winter', 'spring', 'summer'], lights: ['winter', 'spring', 'summer'], flowerbed2: ['spring', 'summer'], haystack: ['fall', 'winter', 'spring', 'summer'], wheelbarrow2: ['fall', 'winter', 'spring', 'summer'] };
F.decorFor = function (season) { return F.DECOR.filter(function (d) { return (DECOR_SEASONS[d.id] || []).indexOf(season) >= 0; }); };
F.hasDecor = function (id, season) { season = season || G.season; return !!(O.SAVE.decor[season + ':' + id] || (season === 'fall' && O.SAVE.decor[id] === 1)); };
F.buyDecor = function (id, season) { O.SAVE.decor[(season || G.season) + ':' + id] = 1; O.save(); };
F.drawPortrait = function (c, id, x, y, h, accId) { var o = cx; cx = c; var an = { id: id, a: O.BY[id], accOverride: accId }; drawImg(id, x, y, h, 1); drawAcc(an, x, y, h, 1); cx = o; };
var HIDE_SPOTS = [[1425, 552], [1010, 792], [2160, 1255], [1300, 1158], [1462, 2032], [1752, 2034], [2540, 1702], [1990, 1092], [1062, 1462], [1700, 598], [2065, 762]];

/* ---------------- state ---------------- */
var G = F.G = { t: 0, dayT: 0, tasks: [], eggs: [], snow: [], messes: [], parts: [], floats: [], bed: [], driver: -1, followers: [], ended: false, hint: null, waterOK: {}, feederN: {}, frozen: {}, season: 'fall', level: null, mode: 'day', snowmanN: 0 };
F.PL = [];
var TR = F.TR = { x: 1600, y: 1060, vx: 0, vy: 0, face: 1, bob: 0 };
var ANIM = F.ANIM = [];
var STATIONS = F.STATIONS = [];
var FENCE = [];
F.CAM = { x: 1600, y: 900 }; var CAM = F.CAM;
function mkPlayer(i, kid) { return { i: i, x: 1600 + (i ? 80 : 0), y: 820, vx: 0, vy: 0, face: 1, walk: 0, kid: kid, hold: null, holdN: 0, holdProg: 0, target: null }; }

function penInner(p, m) { m = m || 46; return { x: p.x + m, y: p.y + m + 20, w: p.w - 2 * m, h: p.h - 2 * m - 20 }; }
function inPen(x, y) { for (var k in PENS) { var p = PENS[k]; if (x > p.x - 30 && x < p.x + p.w + 30 && y > p.y - 30 && y < p.y + p.h + 30) return true; } return false; }
function buildFences() {
  FENCE = [];
  Object.keys(PENS).forEach(function (k) {
    var p = PENS[k];
    function seg(x1, y1, x2, y2, side) {
      var horiz = y1 === y2, len = horiz ? x2 - x1 : y2 - y1;
      for (var s = 0; s < len; s += 60) {
        var e = Math.min(len, s + 60), ax = horiz ? x1 + s : x1, ay = horiz ? y1 : y1 + s, bx = horiz ? x1 + e : x1, by = horiz ? y1 : y1 + e;
        if (side === p.gate) { var mid = horiz ? (ax + bx) / 2 : (ay + by) / 2; if (Math.abs(mid - p.g) < GATE / 2) continue; }
        FENCE.push({ ax: ax, ay: ay, bx: bx, by: by, horiz: horiz, y: Math.max(ay, by) });
      }
    }
    seg(p.x, p.y, p.x + p.w, p.y, 't'); seg(p.x, p.y + p.h, p.x + p.w, p.y + p.h, 'b'); seg(p.x, p.y, p.x, p.y + p.h, 'l'); seg(p.x + p.w, p.y, p.x + p.w, p.y + p.h, 'r');
  });
}
function blockedAt(x, y, r, who) {
  if (x < r + 20 || y < r + 60 || x > WW - r - 20 || y > WH - r - 20) return true;
  for (var i = 0; i < SOLIDS.length; i++) { var s = SOLIDS[i]; if (x > s[0] - r && x < s[0] + s[2] + r && y > s[1] - r * 0.5 && y < s[1] + s[3] + r * 0.5) return true; }
  for (i = 0; i < FENCE.length; i++) { var f = FENCE[i]; if (f.horiz) { if (x > f.ax - r * 0.6 && x < f.bx + r * 0.6 && Math.abs(y - f.ay) < r * 0.55) return true; } else { if (y > f.ay - r * 0.5 && y < f.by + r * 0.5 && Math.abs(x - f.ax) < r * 0.6) return true; } }
  if (who !== 'truck' && Math.abs(x - TR.x) < 120 && y > TR.y - 34 && y < TR.y + 14) return true;
  if (who === 'truck') { for (var k in PENS) { var p = PENS[k]; if (x > p.x - 60 && x < p.x + p.w + 60 && y > p.y - 10 && y < p.y + p.h + 40) return true; } }
  return false;
}
F.blockedAt = blockedAt;
function moveBody(b, dx, dy, r, who) {
  if (!blockedAt(b.x + dx, b.y, r, who)) b.x += dx; else if (who === 'truck') b.vx *= -0.3;
  if (!blockedAt(b.x, b.y + dy, r, who)) b.y += dy; else if (who === 'truck') b.vy *= -0.3;
}
function areaOf(an) {
  var a = an.a; if (an.out) return { x: 1100, y: 620, w: 1060, h: 720 };
  if (a.pen === 'yard') return { x: YARD.x + 60, y: YARD.y + 80, w: YARD.w - 120, h: YARD.h - 140 };
  if (a.id === 'bunnies') return { x: 1990, y: 1150, w: 150, h: 60 };
  return penInner(PENS[a.pen]);
}
function spawnAnimals() {
  ANIM.length = 0;
  O.CAST.forEach(function (c) {
    var a = O.BY[c[0]];
    if (a.id === 'chicks' && !(G.season === 'spring' || G.season === 'summer')) return;
    var r = a.pen === 'yard' ? { x: YARD.x + 60, y: YARD.y + 80, w: YARD.w - 120, h: YARD.h - 140 } : penInner(PENS[a.pen]);
    var x = rnd(r.x, r.x + r.w), y = rnd(r.y, r.y + r.h);
    if (a.id === 'bunnies') { x = 2060; y = 1190; }
    ANIM.push({ id: a.id, a: a, x: x, y: y, tx: x, ty: y, face: Math.random() < 0.5 ? -1 : 1, wait: rnd(0, 3), walk: 0, jump: 0, happy: 0, shake: 0, brush: 0, wet: 0, talk: 0, talkT: '', out: false, follow: null, home: true, hidden: false });
  });
}
function animal(id) { for (var i = 0; i < ANIM.length; i++) if (ANIM[i].id === id) return ANIM[i]; return null; }
F.animal = animal;

/* ---------------- seasons: ground patterns + ambient fx ---------------- */
var grassPat = null, dirtPat = null, patSeason = '';
function makePatterns(season, cx) {
  var S = O.SEASONS[season]; patSeason = season;
  var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d');
  g.fillStyle = S.grass[0]; g.fillRect(0, 0, 256, 256);
  for (var i = 0; i < 26; i++) { g.fillStyle = i % 2 ? S.grass[1] : S.grass[2]; g.beginPath(); g.ellipse(rnd(0, 256), rnd(0, 256), rnd(18, 46), rnd(10, 24), rnd(0, 3), 0, 7); g.fill(); }
  g.strokeStyle = S.grass[3]; g.lineWidth = 2; g.lineCap = 'round';
  var blades = season === 'winter' ? 30 : 140;
  for (i = 0; i < blades; i++) { var x = rnd(0, 256), y = rnd(0, 256); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-3, 3), y - rnd(5, 10)); g.stroke(); }
  if (season === 'winter') { for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(rnd(0, 256), rnd(0, 256), rnd(1, 2.5), 0, 7); g.fill(); } }
  var fl = S.flowers; for (i = 0; i < (season === 'spring' ? 12 : 7) && fl.length; i++) { var fx = rnd(8, 248), fy = rnd(8, 248); g.fillStyle = pick(fl); for (var p = 0; p < 5; p++) { g.beginPath(); g.arc(fx + Math.cos(p * 1.256) * 3, fy + Math.sin(p * 1.256) * 3, 2.4, 0, 7); g.fill(); } g.fillStyle = '#f6b72b'; g.beginPath(); g.arc(fx, fy, 1.8, 0, 7); g.fill(); }
  grassPat = cx.createPattern(c, 'repeat');
  var d = document.createElement('canvas'); d.width = d.height = 128; g = d.getContext('2d'); g.fillStyle = S.dirt; g.fillRect(0, 0, 128, 128);
  for (i = 0; i < 60; i++) { g.fillStyle = i % 3 ? 'rgba(150,120,80,.3)' : 'rgba(255,240,210,.5)'; g.beginPath(); g.ellipse(rnd(0, 128), rnd(0, 128), rnd(2, 6), rnd(1.5, 4), 0, 0, 7); g.fill(); }
  dirtPat = cx.createPattern(d, 'repeat');
  AMB = [];
}
var AMB = [];
function ambient(dt, VW, VH) {
  var fx = O.SEASONS[G.season].fx, want = fx === 'snow' ? 90 : fx === 'butterflies' ? 7 : 26;
  while (AMB.length < want) AMB.push({ x: rnd(0, VW), y: rnd(-VH, VH), s: rnd(0.6, 1.4), r: rnd(0, 6), c: pick(fx === 'leaves' ? ['#e8743a', '#d9502e', '#f2b134', '#b9542c'] : fx === 'petals' ? ['#ffc2dd', '#fff', '#ffd9ec'] : ['#ffd65a', '#ff8ec7', '#8fd3ff', '#fff']), ph: rnd(0, 6) });
  AMB.forEach(function (p) {
    if (fx === 'butterflies') { p.ph += dt * 9; p.x += Math.cos(p.r) * 40 * dt; p.y += Math.sin(p.r) * 30 * dt + Math.sin(p.ph * 0.3) * 0.6; p.r += rnd(-1, 1) * dt; if (p.x < -20 || p.x > VW + 20 || p.y < -20 || p.y > VH + 20) { p.x = rnd(0, VW); p.y = rnd(0, VH); } return; }
    var sp = fx === 'snow' ? 50 : 38; p.y += sp * p.s * dt; p.x += Math.sin(p.ph += dt * 1.5) * 20 * dt + (fx === 'snow' ? 6 : 14) * dt; p.r += dt * 2;
    if (p.y > VH + 10) { p.y = -10; p.x = rnd(0, VW); }
  });
}
function drawAmbient(cx) {
  var fx = O.SEASONS[G.season].fx;
  AMB.forEach(function (p) {
    cx.save(); cx.translate(p.x, p.y);
    if (fx === 'snow') { cx.fillStyle = 'rgba(255,255,255,.9)'; cx.beginPath(); cx.arc(0, 0, 2.2 * p.s + 1, 0, 7); cx.fill(); }
    else if (fx === 'butterflies') { var f = Math.abs(Math.sin(p.ph)); cx.fillStyle = p.c; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(-5 * f, 0, 6 * f + 1, 5, 0, 0, 7); cx.ellipse(5 * f, 0, 6 * f + 1, 5, 0, 0, 7); cx.fill(); cx.stroke(); }
    else { cx.rotate(p.r); cx.globalAlpha = 0.85; cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, fx === 'petals' ? 4 : 6, fx === 'petals' ? 2.5 : 3.5, 0, 0, 7); cx.fill(); }
    cx.restore();
  });
}

/* ---------------- chores ---------------- */
function taskNeed(t) { if (t.ids) return t.ids.length; return t.n || 1; }
function taskDone(t) { return t.have >= taskNeed(t); }
F.taskDone = taskDone; F.taskNeed = taskNeed;
function nm(ids) { var a = ids.map(function (i) { return O.BY[i].name; }); return a.length <= 2 ? a.join(' & ') : a.slice(0, -1).join(', ') + ' & ' + a[a.length - 1]; }
F.taskLabel = function (t) {
  switch (t.type) {
    case 'pet': return 'Pet ' + nm(t.ids);
    case 'feed': return t.item === 'blanket' ? 'Give ' + nm(t.ids) + (t.ids.length > 1 ? ' blankets' : ' a blanket') : t.item ? ('Give ' + nm(t.ids) + ' ' + O.ITEMS[t.item].name) : ('Feed ' + nm(t.ids));
    case 'brush': return 'Brush ' + nm(t.ids);
    case 'cool': return 'Cool off ' + nm(t.ids) + ' with the hose';
    case 'water': return 'Water for the ' + PENS[t.pen].name.toLowerCase();
    case 'ice': return 'Break the ice: ' + PENS[t.pen].name.toLowerCase();
    case 'feeder': return 'Fill the ' + PENS[t.pen].name.toLowerCase() + ' feeder with hay';
    case 'eggs': return 'Collect ' + t.n + ' eggs at the Chicken Dome';
    case 'sell': return 'Sell ' + t.n + ' eggs at the Farm Stand';
    case 'domefeed': return 'Feed the chickens at the Dome';
    case 'roundup': return 'Bring ' + nm(t.ids) + ' home';
    case 'rake': return 'Rake up ' + t.n + ' messes';
    case 'decor': return 'Buy ' + t.n + ' decorations';
    case 'plant': return 'Plant seeds in ' + t.n + ' garden plots';
    case 'wplot': return 'Water ' + t.n + ' garden plots';
    case 'harvest': return 'Pick ' + t.n + ' vegetables from the garden';
    case 'snowman': return 'Bring ' + t.n + ' snowballs to build a snowman';
    case 'pick': return 'Pick ' + t.n + ' flower bouquets';
    case 'sellf': return 'Sell ' + t.n + ' bouquets at the Farm Stand';
  } return t.type;
};
F.taskIcon = function (t) {
  switch (t.type) {
    case 'pet': return O.src(t.ids.length === 1 ? t.ids[0] : 'i_heart'); case 'feed': return t.ids.length === 1 ? O.src(t.ids[0]) : O.src(t.item ? O.ITEMS[t.item].img : 'i_hay');
    case 'brush': return O.src('i_brush'); case 'cool': return O.src('i_hose'); case 'water': return O.src('i_water'); case 'ice': return O.src('trough'); case 'feeder': return O.src('i_hay');
    case 'eggs': return O.src('i_egg'); case 'sell': return O.src('i_basket'); case 'domefeed': return O.src('i_grain'); case 'roundup': return O.src(t.ids[0]); case 'rake': return O.src('i_rake');
    case 'decor': return O.src('pumpkins'); case 'plant': return O.src('i_seeds'); case 'wplot': return O.src('crop_sprout'); case 'harvest': return O.src('crop_carrot'); case 'snowman': return O.src('snowman');
    case 'pick': return O.src('i_bouquet'); case 'sellf': return O.src('i_bouquet');
  }
};
function markId(t, id) { if (!t.ids || t.ids.indexOf(id) < 0 || t.got[id]) return false; t.got[id] = 1; return true; }
function progress(type, match, amount) {
  var any = false;
  G.tasks.forEach(function (t) { if (t.type !== type || taskDone(t)) return; if (match(t)) { any = true; t.have = Math.min(taskNeed(t), t.have + (amount || 1)); if (taskDone(t)) { O.SFX.done(); O.toast('✅ ' + F.taskLabel(t), F.taskIcon(t)); } } });
  if (any) { F.renderTasks(); checkEnd(); }
  return any;
}
F.progress = progress;
function checkEnd() { if (G.ended || G.mode !== 'day') return; for (var i = 0; i < G.tasks.length; i++) if (!taskDone(G.tasks[i])) return; G.ended = true; setTimeout(function () { O.UI.endDay(); }, 1200); }
F.parTime = function () { var u = 0; G.tasks.forEach(function (t) { u += taskNeed(t); }); return 50 + u * 22; };
var lastNext = '';
F.renderTasks = function () {
  var ul = $('tasks'); ul.innerHTML = ''; var d = 0, nextSet = false, nextLabel = '';
  if (G.mode === 'seek') {
    var li = document.createElement('li'); li.className = 'next'; li.innerHTML = '<span class="ck"></span><img src="' + O.src('george') + '" alt=""><span class="t"></span><span class="n">' + G.seek.round + '/' + G.seek.rounds + '</span>';
    li.querySelector('.t').textContent = G.seek.found ? 'You found him!' : 'Find George! He is hiding somewhere on the farm.'; ul.appendChild(li);
    $('dayname').textContent = 'Peekaboo, George!'; $('clipn').textContent = G.seek.round - 1 + '/' + G.seek.rounds; return;
  }
  G.tasks.forEach(function (t) {
    var li = document.createElement('li'), need = taskNeed(t);
    if (taskDone(t)) { li.className = 'done'; d++; } else if (!nextSet) { li.className = 'next'; nextSet = true; nextLabel = F.taskLabel(t); }
    li.innerHTML = '<span class="ck">' + (taskDone(t) ? '✓' : '') + '</span><img src="' + F.taskIcon(t) + '" alt=""><span class="t"></span>' + (need > 1 ? '<span class="n">' + Math.min(t.have, need) + '/' + need + '</span>' : '');
    li.querySelector('.t').textContent = F.taskLabel(t);
    li.addEventListener('click', function () { O.say(F.taskLabel(t)); });
    ul.appendChild(li);
  });
  $('dayname').textContent = O.SEASONS[G.season].emoji + ' ' + (G.level && G.level.type === 'day' ? 'Day ' + G.level.n + ' · ' : '') + G.def.name; $('clipn').textContent = d + '/' + G.tasks.length;
  if (nextLabel && nextLabel !== lastNext && G.t > 1) O.say((d ? 'Next: ' : '') + nextLabel + '.', false);
  lastNext = nextLabel;
};

/* ---------------- crops ---------------- */
function crops() { if (!O.SAVE.crops) O.SAVE.crops = PLOTS_XY.map(function (p, i) { return { s: 0, w: 0, type: i % 2 ? 'pumpkin' : 'carrot' }; }); return O.SAVE.crops; }
function growCrops() { crops().forEach(function (c) { if (c.s > 0 && c.s < 3 && c.w) { c.s++; c.w = 0; } }); O.save(); }
F.crops = crops;

/* ---------------- start a level ---------------- */
F.start = function (level, def, tasks, opts) {
  opts = opts || {};
  G.level = level; G.season = level ? level.season : (opts.season || 'fall'); G.mode = opts.mode || 'day';
  G.def = def || { name: 'Farm', intro: '' }; G.tasks = tasks || (def && def.tasks ? def.tasks() : []);
  G.dayT = 0; G.t = 0; G.ended = false; G.bed = []; G.driver = -1; G.followers = []; G.hint = null; G.waterOK = {}; G.feederN = {}; G.frozen = {}; G.eggs = []; G.snow = []; G.messes = []; G.parts = []; G.floats = []; G.snowmanN = 0;
  lastNext = '';
  O.engineOn(false);
  var twoP = O.SAVE.players === 2 && !document.body.classList.contains('touch');
  F.PL.length = 0; F.PL.push(mkPlayer(0, O.SAVE.kid || 'girl')); if (twoP) F.PL.push(mkPlayer(1, (O.SAVE.kid || 'girl') === 'girl' ? 'boy' : 'girl'));
  TR.x = 1600; TR.y = 1060; TR.vx = TR.vy = 0;
  STATIONS.length = 0; BASE_STATIONS.concat(SEASON_STATIONS[G.season] || []).forEach(function (s) { STATIONS.push(s); });
  F.SB = {}; STATIONS.forEach(function (s) { F.SB[s.id] = s; });
  if (patSeason !== G.season) makePatterns(G.season, O.cx);
  spawnAnimals();
  if (G.mode === 'day') {
    growCrops();
    if (G.season === 'winter') Object.keys(TROUGHS).forEach(function (k) { G.frozen[k] = 1; });
    G.tasks.forEach(function (t) {
      if (t.type === 'eggs') { var r = penInner(PENS.chickens, 60); for (var i = 0; i < t.n + 2; i++) { var ex, ey, tries = 0; do { ex = rnd(r.x, r.x + r.w); ey = rnd(r.y, r.y + r.h); } while (blockedAt(ex, ey, 30) && ++tries < 40); G.eggs.push({ x: ex, y: ey, bob: rnd(0, 6) }); } }
      if (t.type === 'rake') { for (var j = 0; j < t.n; j++) { var mx, my, tr2 = 0; do { var ang = rnd(0, 6.28), rr = rnd(160, 440); mx = clamp(1600 + Math.cos(ang) * rr * 1.3, 1120, 2160); my = clamp(700 + Math.abs(Math.sin(ang)) * rr, 680, 1320); } while ((blockedAt(mx, my, 34) || inPen(mx, my) || nearPlot(mx, my)) && ++tr2 < 60); G.messes.push({ x: mx, y: my, clean: 0 }); } }
      if (t.type === 'snowman') { for (var q = 0; q < t.n + 1; q++) { var sx, sy, tq = 0; do { sx = rnd(1150, 2150); sy = rnd(700, 1320); } while ((blockedAt(sx, sy, 34) || inPen(sx, sy) || dist(sx, sy, SNOWMAN[0], SNOWMAN[1]) < 200) && ++tq < 60); G.snow.push({ x: sx, y: sy }); } }
      if (t.type === 'roundup') { t.ids.forEach(function (id, i) { var an = animal(id); an.out = true; an.home = false; var spots = [[1350, 1000], [2150, 880], [1900, 1320], [1250, 1330], [2050, 560]]; var s = spots[(i + Math.floor(Math.random() * 5)) % spots.length]; an.x = s[0] + rnd(-40, 40); an.y = s[1] + rnd(-30, 30); an.tx = an.x; an.ty = an.y; }); }
      if (t.type === 'harvest') { var ready = crops().filter(function (c) { return c.s === 3; }).length; crops().forEach(function (c) { if (ready < t.n && c.s !== 3) { c.s = 3; ready++; G.grewOvernight = 1; } }); }
      if (t.type === 'plant') { var empty = crops().filter(function (c) { return c.s === 0; }).length; crops().forEach(function (c) { if (empty < t.n && c.s === 3) { c.s = 0; empty++; } }); }
    });
    if (G.def.farPeter) { var pe = animal('peter'); if (pe) { var far = pick([[1150, 1300], [2150, 830], [2150, 1300]]); pe.x = far[0]; pe.y = far[1]; pe.tx = pe.x; pe.ty = pe.y; pe.wait = 30; } }
    G.tasks.forEach(function (t) { if (t.type === 'ice') G.frozen[t.pen] = 1; });
  }
  if (G.mode === 'seek') {
    var spots = HIDE_SPOTS.slice(); if (G.season === 'summer') spots.push([1005, 2062]);
    G.seek = { rounds: opts.diff === 2 ? 4 : 3, round: 1, found: false, spots: O.shuffle(spots), giggleT: 2, noHint: 0, pop: 0 };
    var geo = animal('george'); geo.hidden = true; placeGeorge();
  }
  F.renderTasks(); updateCarry();
  O.post('start');
  if (G.mode === 'day') {
    setTimeout(function () { var r = animal('rodney'); if (r) { r.talk = 2.2; r.talkT = 'Cock-a-doodle-doo!'; r.jump = 1; } O.voice('rodney'); }, 500);
    if (G.grewOvernight) { G.grewOvernight = 0; setTimeout(function () { O.toast('🌱 The garden grew while you were away!', O.src('crop_carrot'), 3500); }, 2500); }
    O.toast(G.def.tip ? '💡 ' + G.def.tip : 'Check your clipboard!', null, 6000);
    O.say(G.def.intro + (G.def.tip ? ' ' + G.def.tip : ''));
  }
};
function nearPlot(x, y) { for (var i = 0; i < PLOTS_XY.length; i++) if (dist(x, y, PLOTS_XY[i][0], PLOTS_XY[i][1]) < 80) return true; return false; }
function placeGeorge() {
  var geo = animal('george'), s = G.seek.spots[(G.seek.round - 1) % G.seek.spots.length];
  geo.x = s[0]; geo.y = s[1]; geo.tx = s[0]; geo.ty = s[1]; geo.wait = 1e9; geo.face = s[0] > 1600 ? -1 : 1; G.seek.found = false; G.seek.t0 = G.dayT; G.seek.noHint = 0;
}

/* ---------------- interaction ---------------- */
function holdingFood(p) { return p.hold && !O.ITEMS[p.hold].tool && ['water', 'eggs', 'seeds', 'bouquet', 'snow', 'pumpkin'].indexOf(p.hold) < 0; }
function animalWants(an) {
  for (var i = 0; i < G.tasks.length; i++) {
    var t = G.tasks[i]; if (taskDone(t)) continue;
    if (t.type === 'roundup' && t.ids.indexOf(an.id) >= 0 && !an.home && !an.follow) return 'lead';
    if (t.ids && t.ids.indexOf(an.id) >= 0 && !t.got[an.id]) {
      if (t.type === 'feed') return t.item || O.KINDS[an.a.kind].eats[0];
      if (t.type === 'pet') return 'pet'; if (t.type === 'brush') return 'brush'; if (t.type === 'cool') return 'hose';
    }
  }
  return null;
}
F.animalWants = animalWants;
function plotAt(x, y, r) { var c = crops(); for (var i = 0; i < PLOTS_XY.length; i++) if (dist(x, y, PLOTS_XY[i][0], PLOTS_XY[i][1] + 6) < r) return i; return -1; }
function findTarget(p) {
  var best = null, bd = 1e9, inT = G.driver === p.i, px = inT ? TR.x : p.x, py = inT ? TR.y : p.y;
  function consider(o, d, pri) { var s = d - pri; if (s < bd) { bd = s; best = o; } }
  var R = inT ? 170 : 105;
  if (inT) { STATIONS.forEach(function (s) { if (!s.item || O.ITEMS[s.item].tool) return; var d = dist(px, py, s.x, s.y); if (d < R + 40) consider({ k: 'station', s: s }, d, 0); }); return best; }
  if (G.mode === 'seek') return null;
  ANIM.forEach(function (an) {
    if (an.hidden) return;
    var d = dist(px, py, an.x, an.y); if (d < R + an.a.h * 0.25) {
      var w = animalWants(an), pri = 0;
      if (w && (w === 'pet' || w === 'lead' || (w === 'brush' && p.hold === 'brush') || (w === 'hose' && p.hold === 'hose') || (p.hold && w === p.hold))) pri = 80;
      else if (holdingFood(p) && O.canGive(an.a.kind, p.hold)) pri = 50; else if (p.hold === 'blanket' && O.canGive(an.a.kind, 'blanket')) pri = 50; else if (p.hold === 'brush' || p.hold === 'hose') pri = 30;
      consider({ k: 'animal', an: an }, d, pri);
    }
  });
  STATIONS.forEach(function (s) { var d = dist(px, py, s.x, s.y + 10); if (d < R + 30) consider({ k: 'station', s: s }, d, s.id === 'stand' && (p.hold === 'eggs' || p.hold === 'bouquet' || p.hold === 'pumpkin') ? 90 : 10); });
  Object.keys(TROUGHS).forEach(function (pn) { var q = TROUGHS[pn], d = dist(px, py, q[0], q[1]); if (d < R + 20 && (p.hold === 'water' || G.frozen[pn])) consider({ k: 'trough', pen: pn }, d, 70); });
  Object.keys(FEEDERS).forEach(function (pn) { var q = FEEDERS[pn], d = dist(px, py, q[0], q[1]); if (d < R + 20 && p.hold === 'hay') consider({ k: 'feeder', pen: pn }, d, 75); });
  var dd = dist(px, py, DOMEFEED[0], DOMEFEED[1]); if (dd < R + 20 && p.hold === 'grain') consider({ k: 'domefeed' }, dd, 75);
  G.messes.forEach(function (m) { if (m.clean >= 1) return; var d = dist(px, py, m.x, m.y); if (d < R && p.hold === 'rake') consider({ k: 'mess', m: m }, d, 80); });
  var pi = plotAt(px, py, R - 20); if (pi >= 0) { var c = crops()[pi]; if ((c.s === 0 && p.hold === 'seeds') || (c.s > 0 && c.s < 3 && !c.w && p.hold === 'water') || (c.s === 3 && !p.hold)) consider({ k: 'plot', i: pi }, dist(px, py, PLOTS_XY[pi][0], PLOTS_XY[pi][1]), 85); }
  var ds = dist(px, py, SNOWMAN[0], SNOWMAN[1]); if (ds < R + 30 && p.hold === 'snow') consider({ k: 'snowman' }, ds, 85);
  var dt = dist(px, py, TR.x, TR.y); if (dt < R + 90 && G.driver < 0) consider({ k: 'truck' }, dt, (p.hold && G.bed.length < 4) || (!p.hold && G.bed.length) ? 20 : -30);
  return best;
}
F.findTarget = findTarget;
function actIcon(p, t) {
  if (!t) return p.hold ? O.src(O.ITEMS[p.hold].img) : O.src('i_heart');
  if (t.k === 'station') return t.s.item ? (t.s.id === 'stand' && p.hold === 'eggs' ? O.src('i_basket') : O.src(O.ITEMS[t.s.item].img)) : O.src('pumpkins');
  if (t.k === 'animal') { if (p.hold === 'brush') return O.src('i_brush'); if (p.hold === 'hose') return O.src('i_hose'); if (holdingFood(p) || p.hold === 'blanket') return O.src(O.ITEMS[p.hold].img); return O.src('i_heart'); }
  if (t.k === 'trough') return O.src(G.frozen[t.pen] ? 'trough' : 'i_water'); if (t.k === 'feeder') return O.src('i_hay'); if (t.k === 'domefeed') return O.src('i_grain'); if (t.k === 'mess') return O.src('i_rake'); if (t.k === 'truck') return O.src('truck');
  if (t.k === 'plot') return O.src(p.hold === 'seeds' ? 'i_seeds' : p.hold === 'water' ? 'i_water' : 'crop_carrot'); if (t.k === 'snowman') return O.src('snowman');
}
function setHold(p, item, n) { p.hold = item; p.holdN = n || 0; updateCarry(); }
F.setHold = setHold;
function updateCarry() {
  [0, 1].forEach(function (i) {
    var c = $('carry' + i), p = F.PL[i]; if (!c) return;
    if (p && p.hold) { c.style.display = 'flex'; c.querySelector('img').src = O.src(O.ITEMS[p.hold].img); c.querySelector('b').textContent = O.ITEMS[p.hold].count ? p.holdN : ''; c.title = 'Player ' + (i + 1); } else c.style.display = 'none';
  });
}
function meet(an) {
  if (!O.SAVE.met[an.id]) { O.SAVE.met[an.id] = Date.now(); O.save(); O.toast('📖 New Farm Friend: ' + an.a.name + '!', O.src(an.id), 3500); O.SFX.chime(); var all = O.CAST.every(function (c) { return O.SAVE.met[c[0]]; }); if (all) O.giveSticker('allfriends'); }
}
function addHearts(an, n) {
  var before = O.friendLv(an.id); O.SAVE.hearts[an.id] = (O.SAVE.hearts[an.id] || 0) + n; var after = O.friendLv(an.id); O.save();
  if (after > before && before > 0) {
    var msg = ['', '', 'now knows your name! Favorite treat: ' + O.ITEMS[an.a.fav].name, 'can wear accessories now! Open the album to dress up.', 'told you a secret! Check the album.', 'is your BEST FRIEND!'][after];
    setTimeout(function () { O.toast('💛 ' + an.a.name + ' ' + msg, O.src(an.id), 4200); O.SFX.levelup(); O.say(an.a.name + ' ' + msg.split('!')[0] + '!', false); }, 900);
    if (after === 5) { O.giveSticker('bestfriend'); O.SAVE.coins += 10; O.save(); O.UI.updateCoins(); }
  }
}
F.addHearts = addHearts;
function say(an, txt, t) { an.talk = t || 1.8; an.talkT = txt; }
function hearts(x, y, n) { for (var i = 0; i < (n || 6); i++) G.parts.push({ k: 'heart', x: x + rnd(-30, 30), y: y, vx: rnd(-40, 40), vy: rnd(-140, -70), life: 1.3, s: rnd(16, 26) }); }
function sparkle(x, y, n, col) { for (var i = 0; i < (n || 8); i++) G.parts.push({ k: 'spark', x: x + rnd(-40, 40), y: y + rnd(-40, 10), vx: rnd(-30, 30), vy: rnd(-60, -10), life: 0.8, s: rnd(5, 10), c: col || pick(['#fff6a8', '#ffffff', '#ffd1f0', '#b8f0ff']) }); }
function drops(x, y) { for (var i = 0; i < 6; i++) G.parts.push({ k: 'drop', x: x + rnd(-30, 30), y: y + rnd(-40, 0), vx: rnd(-60, 60), vy: rnd(-120, -40), life: 0.6, s: rnd(3, 5) }); }
function straw(x, y) { for (var i = 0; i < 10; i++) G.parts.push({ k: 'straw', x: x, y: y, vx: rnd(-160, 160), vy: rnd(-200, -60), life: 0.7, s: rnd(6, 12), r: rnd(0, 3) }); }
function icebits(x, y) { for (var i = 0; i < 12; i++) G.parts.push({ k: 'ice', x: x, y: y, vx: rnd(-180, 180), vy: rnd(-220, -60), life: 0.7, s: rnd(4, 8), r: rnd(0, 3) }); }
function floatText(x, y, txt, col) { G.floats.push({ x: x, y: y, txt: txt, c: col || '#fff', life: 1.4 }); }
F.confetti = function (n) { var VW = innerWidth, VH = innerHeight, Z = O.ZOOM; for (var i = 0; i < n; i++) G.parts.push({ k: 'conf', x: CAM.x + rnd(-VW / Z / 2, VW / Z / 2), y: CAM.y - VH / Z / 2 - rnd(0, 200), vx: rnd(-60, 60), vy: rnd(80, 220), life: 4, s: rnd(6, 11), r: rnd(0, 6), c: pick(['#e8473a', '#ffd65a', '#4f9a3e', '#2a8fd6', '#ff8ec7', '#fff']) }); };
var THANKS = ['Yum!', 'Thank you!', 'Mmm!', 'So good!', 'Yay!', 'My favorite!'];
function doAction(p, t) {
  if (!t) return;
  var inT = G.driver === p.i;
  if (t.k === 'station') {
    var s = t.s;
    if (s.id === 'stand' && !inT && (p.hold === 'eggs' || p.hold === 'bouquet' || p.hold === 'pumpkin')) {
      var n = p.hold === 'eggs' ? p.holdN : 1, each = p.hold === 'eggs' ? 2 : p.hold === 'bouquet' ? 3 : 4, what = p.hold;
      O.SAVE.coins += n * each; O.save(); O.UI.updateCoins(); O.SFX.coin(); floatText(s.x, s.y - 200, '+' + (n * each) + ' 🪙', '#ffe066');
      if (what === 'eggs') progress('sell', function () { return true; }, n); if (what === 'bouquet') progress('sellf', function () { return true; }, 1);
      setHold(p, null); O.toast('Sold! +' + (n * each) + ' 🪙', O.src(what === 'eggs' ? 'i_basket' : O.ITEMS[what].img)); return;
    }
    if (s.id === 'market') { if (inT) { O.toast('Hop out of the truck to shop!'); return; } O.UI.openShop(); return; }
    if (inT) { if (G.bed.length >= 4) { O.toast('The truck bed is full!', O.src('truck')); O.SFX.no(); return; } G.bed.push(s.item); O.SFX.pop(); floatText(TR.x, TR.y - 130, '+' + O.ITEMS[s.item].name); return; }
    if (p.hold === 'eggs') { O.toast('Sell your eggs at the Farm Stand first!', O.src('i_basket')); O.SFX.no(); return; }
    if (s.item === 'bouquet') progress('pick', function () { return true; });
    setHold(p, s.item); O.SFX.pop(); floatText(p.x, p.y - 120, 'Got ' + O.ITEMS[s.item].name + '!');
    return;
  }
  if (t.k === 'truck') {
    if (p.hold && G.bed.length < 4 && !O.ITEMS[p.hold].tool) { if (O.ITEMS[p.hold].count) { O.toast('That rides in your hands, not the truck bed!'); return; } G.bed.push(p.hold); setHold(p, null); O.SFX.drop(); return; }
    if (!p.hold && G.bed.length) { setHold(p, G.bed.pop()); O.SFX.pop(); return; }
    enterTruck(p); return;
  }
  if (t.k === 'trough') {
    if (G.frozen[t.pen]) return; // breaking ice is a hold action
    if (p.hold !== 'water') return;
    G.waterOK[t.pen] = 1; setHold(p, null); O.SFX.splash(); sparkle(TROUGHS[t.pen][0], TROUGHS[t.pen][1] - 20, 10); progress('water', function (x) { return x.pen === t.pen; });
    ANIM.forEach(function (an) { if (an.a.pen === t.pen && !an.out) { an.happy = 2; an.jump = 0.6; } }); var any = ANIM.filter(function (an) { return an.a.pen === t.pen; })[0]; if (any) O.voice(any.id); return;
  }
  if (t.k === 'feeder') {
    G.feederN[t.pen] = (G.feederN[t.pen] || 0) + 1; setHold(p, null); O.SFX.drop(); straw(FEEDERS[t.pen][0], FEEDERS[t.pen][1] - 20); progress('feeder', function (x) { return x.pen === t.pen; });
    ANIM.forEach(function (an) { if (an.a.pen === t.pen) { an.tx = FEEDERS[t.pen][0] + (t.pen === 'cows' || t.pen === 'alpacas' ? rnd(60, 180) : rnd(-180, -60)); an.ty = FEEDERS[t.pen][1] + rnd(-30, 120); an.wait = 0; an.happy = 2; addHearts(an, 1); } });
    var f = ANIM.filter(function (an) { return an.a.pen === t.pen; })[0]; if (f) O.voice(f.id); return;
  }
  if (t.k === 'domefeed') { setHold(p, null); O.SFX.drop(); straw(DOMEFEED[0], DOMEFEED[1] - 10); progress('domefeed', function () { return true; }); ANIM.forEach(function (an) { if (an.a.pen === 'chickens') { an.tx = DOMEFEED[0] + rnd(40, 200); an.ty = DOMEFEED[1] + rnd(-60, 80); an.wait = 0; an.happy = 3; meet(an); addHearts(an, 1); } }); O.voice('boca'); return; }
  if (t.k === 'plot') {
    var c = crops()[t.i], P = PLOTS_XY[t.i];
    if (c.s === 0 && p.hold === 'seeds') { c.s = 1; c.w = 0; c.type = Math.random() < 0.5 ? 'carrot' : 'pumpkin'; O.save(); setHold(p, null); O.SFX.pop(); straw(P[0], P[1]); progress('plant', function () { return true; }); floatText(P[0], P[1] - 60, 'Planted!'); return; }
    if (c.s > 0 && c.s < 3 && p.hold === 'water') { c.w = 1; O.save(); setHold(p, null); O.SFX.splash(); drops(P[0], P[1] - 20); progress('wplot', function () { return true; }); floatText(P[0], P[1] - 60, 'It will grow tomorrow!'); return; }
    if (c.s === 3 && !p.hold) { var item = c.type === 'pumpkin' ? 'pumpkin' : 'carrot'; c.s = 0; c.w = 0; O.save(); setHold(p, item); O.SFX.chime(); sparkle(P[0], P[1] - 30, 10); progress('harvest', function () { return true; }); floatText(P[0], P[1] - 60, item === 'pumpkin' ? 'A pumpkin! Sell it at the stand.' : 'Fresh carrots!'); return; }
    return;
  }
  if (t.k === 'snowman') {
    var cnt = p.holdN || 1; setHold(p, null); G.snowmanN += cnt; O.SFX.pop(); sparkle(SNOWMAN[0], SNOWMAN[1] - 60, 12, '#fff'); progress('snowman', function () { return true; }, cnt);
    if (G.snowmanN >= 3) { O.SAVE.snowman = 1; O.save(); O.toast('⛄ You built a snowman!', O.src('snowman')); O.SFX.done(); }
    return;
  }
  if (t.k === 'animal') {
    var an = t.an, kind = O.KINDS[an.a.kind], w = animalWants(an);
    if (w === 'lead') { an.follow = p; G.followers.push(an); say(an, 'Okay, okay!'); O.voice(an.id); meet(an); O.toast(an.a.name + ' is following you! Lead them to the goat yard.', O.src(an.id)); return; }
    if (p.hold === 'brush' || p.hold === 'hose') return; // hold actions, handled in update
    if (holdingFood(p) || p.hold === 'blanket') {
      if (!O.canGive(an.a.kind, p.hold)) { an.shake = 0.6; O.SFX.no(); say(an, 'No thanks!'); if (p.hold === 'blanket') O.toast('Blankets are for the horses, ponies, donkeys and cows.', O.src('i_blanket')); else O.toast(an.a.name + ' would rather have ' + kind.eats.filter(function (e) { return e !== 'melon' || G.season === 'summer'; }).map(function (e) { return O.ITEMS[e].name; }).join(' or ') + '.', O.src(O.ITEMS[kind.eats[0]].img)); return; }
      var food = p.hold; setHold(p, null); an.happy = 3; an.jump = 1; hearts(an.x, an.y - an.a.h); O.voice(an.id);
      if (food === 'blanket') { an.blanket = 1; say(an, 'So cozy!'); } else say(an, food === an.a.fav ? 'MY FAVORITE!' : pick(THANKS));
      meet(an); addHearts(an, food === an.a.fav ? 3 : 1);
      progress('feed', function (x) { return (x.item === food || !x.item || (x.item !== 'blanket' && food !== 'blanket' && O.canGive(an.a.kind, food))) && markId(x, an.id); });
      return;
    }
    if (p.hold === 'water') { O.toast('Pour the water in the trough!', O.src('trough')); return; }
    an.happy = 2; an.jump = 0.7; hearts(an.x, an.y - an.a.h, 4); O.voice(an.id); say(an, pick(['Hi friend!', '♥', 'Hehe!', 'Hello!'])); meet(an); addHearts(an, 1);
    progress('pet', function (x) { return markId(x, an.id); });
    return;
  }
}
F.doAction = doAction;
function enterTruck(p) {
  if (G.driver >= 0) { O.toast('Somebody is already driving!'); return; }
  if (G.followers.some(function (a) { return a.follow === p; })) { O.toast('Lead the goats home first. They can\'t ride in the truck!'); O.SFX.no(); return; }
  G.driver = p.i; O.SFX.door(); setTimeout(O.SFX.honk, 180); O.engineOn(true);
}
function exitTruck(p) {
  var spots = [[0, 64], [0, -56], [0, 110], [TR.face * -150, 20], [TR.face * 150, 20]];
  for (var i = 0; i < spots.length; i++) { var x = TR.x + spots[i][0], y = TR.y + spots[i][1]; var d = G.driver; G.driver = -1; if (!blockedAt(x, y, 22)) { p.x = x; p.y = y; O.SFX.door(); O.engineOn(false); return; } G.driver = d; }
  O.toast('No room to hop out here!');
}
F.enterTruck = enterTruck; F.exitTruck = exitTruck;

/* ---------------- update ---------------- */
F.update = function (dt, touch) {
  G.t += dt; G.dayT += dt;
  var twoP = F.PL.length > 1;
  F.PL.forEach(function (p) {
    var c = O.controls(p.i, twoP, touch), inT = G.driver === p.i;
    if (inT) {
      var sp = 520; TR.vx += (c.x * sp - TR.vx) * Math.min(1, dt * 3.2); TR.vy += (c.y * sp * 0.8 - TR.vy) * Math.min(1, dt * 3.2);
      moveBody(TR, TR.vx * dt, TR.vy * dt, 40, 'truck'); if (Math.abs(TR.vx) > 20) TR.face = TR.vx > 0 ? 1 : -1; TR.bob += dt * Math.hypot(TR.vx, TR.vy) * 0.05; O.engineRev(Math.hypot(TR.vx, TR.vy));
      p.x = TR.x; p.y = TR.y;
      if (c.truck) exitTruck(p);
    } else {
      var spd = 255; p.vx = c.x * spd; p.vy = c.y * spd; moveBody(p, p.vx * dt, p.vy * dt, 22, 'kid'); if (Math.abs(p.vx) > 10) p.face = p.vx > 0 ? 1 : -1; if (c.m > 0.1) p.walk += dt * 10; else p.walk = 0;
      if (c.truck) { if (dist(p.x, p.y, TR.x, TR.y) < 220) enterTruck(p); else O.toast('Walk over to the blue truck to hop in!', O.src('truck')); }
    }
    var tgt = findTarget(p); p.target = tgt;
    if (p.i === 0) { $('actimg').src = actIcon(p, tgt); $('truckb').classList.toggle('show', G.driver === 0 || dist(p.x, p.y, TR.x, TR.y) < 240); }
    var holdKind = tgt && !inT && ((tgt.k === 'animal' && (p.hold === 'brush' || p.hold === 'hose')) || tgt.k === 'mess' || (tgt.k === 'trough' && G.frozen[tgt.pen]));
    if (c.act && !holdKind) { doAction(p, tgt); if (!tgt && p.hold && !inT && G.mode === 'day') O.toast('Bring ' + O.ITEMS[p.hold].name + ' to a friend who needs ' + (O.ITEMS[p.hold].tool ? 'it' : 'them') + '!', O.src(O.ITEMS[p.hold].img), 2200); }
    if (c.held && holdKind) {
      p.holdProg += dt / 1.2;
      if (tgt.k === 'animal') {
        var an = tgt.an, hose = p.hold === 'hose'; if (hose) an.wet = 0.3; else an.brush = 0.2;
        if (Math.random() < dt * 14) { if (hose) { drops(an.x, an.y - an.a.h * 0.6); O.SFX.spray(); } else { sparkle(an.x, an.y - an.a.h * 0.5, 2); O.SFX.brush(); } }
        if (p.holdProg >= 1) { p.holdProg = 0; an.happy = 3; an.jump = 1; hearts(an.x, an.y - an.a.h, 6); O.voice(an.id); say(an, hose ? 'Ahhh, cool!' : 'So fluffy!'); meet(an); addHearts(an, 1); progress(hose ? 'cool' : 'brush', function (x) { return markId(x, an.id); }); }
      } else if (tgt.k === 'mess') { var ms = tgt.m; ms.clean = p.holdProg; if (Math.random() < dt * 8) { O.SFX.rake(); straw(ms.x, ms.y); } if (p.holdProg >= 1) { ms.clean = 1; p.holdProg = 0; sparkle(ms.x, ms.y - 10, 12); O.SFX.chime(); progress('rake', function () { return true; }); } }
      else { var tq = TROUGHS[tgt.pen]; if (Math.random() < dt * 8) { O.SFX.crack(); icebits(tq[0], tq[1] - 20); } if (p.holdProg >= 1) { p.holdProg = 0; G.frozen[tgt.pen] = 0; G.waterOK[tgt.pen] = 1; O.SFX.splash(); sparkle(tq[0], tq[1] - 20, 12, '#cfefff'); progress('ice', function (x) { return x.pen === tgt.pen; }); ANIM.forEach(function (a) { if (a.a.pen === tgt.pen) { a.happy = 2; a.jump = 0.6; } }); } }
    } else if (!c.held) p.holdProg = Math.max(0, p.holdProg - dt * 0.5);
    // walk-over pickups
    if (!inT) {
      G.eggs.forEach(function (e) { if (e.got || dist(p.x, p.y, e.x, e.y) >= 46) return; if (p.hold && p.hold !== 'eggs') { if (!e.warn) { e.warn = 1; O.toast('Your hands are full! Put down the ' + O.ITEMS[p.hold].name + ' to carry the egg basket.', O.src('i_egg')); } return; } e.got = 1; setHold(p, 'eggs', (p.hold === 'eggs' ? p.holdN : 0) + 1); O.SFX.pop(); floatText(e.x, e.y - 40, '🥚 ' + p.holdN); progress('eggs', function () { return true; }); });
      G.snow.forEach(function (s) { if (s.got || dist(p.x, p.y, s.x, s.y) >= 50) return; if (p.hold && p.hold !== 'snow') { if (!s.warn) { s.warn = 1; O.toast('Your hands are full!'); } return; } s.got = 1; setHold(p, 'snow', (p.hold === 'snow' ? p.holdN : 0) + 1); O.SFX.pop(); floatText(s.x, s.y - 40, '❄️ ' + p.holdN); });
    }
  });
  ANIM.forEach(function (an) { updateAnimal(an, dt); });
  G.followers = G.followers.filter(function (an) {
    var gp = PENS.goats; if (an.x > gp.x + 20 && an.x < gp.x + gp.w - 20 && an.y > gp.y + 30 && an.y < gp.y + gp.h - 20) { an.follow = null; an.out = false; an.home = true; an.happy = 3; an.jump = 1; hearts(an.x, an.y - 80); O.voice(an.id); say(an, 'Home sweet home!'); addHearts(an, 1); progress('roundup', function (x) { return markId(x, an.id); }); return false; }
    return true;
  });
  if (G.mode === 'seek') updateSeek(dt);
  // camera
  var VW = innerWidth, VH = innerHeight, Z = O.ZOOM, fx, fy;
  if (twoP) { var a = F.PL[0], b = F.PL[1]; fx = (a.x + b.x) / 2; fy = (a.y + b.y) / 2 - 40; var need = Math.min(VW / (Math.abs(a.x - b.x) + 520), VH / (Math.abs(a.y - b.y) + 420)); Z = O.ZOOM = Math.max(0.3, Math.min(O.BASEZOOM, need)); }
  else { var p0 = F.PL[0]; fx = p0.x; fy = p0.y - 40; }
  CAM.x += (fx - CAM.x) * Math.min(1, dt * 5); CAM.y += (fy - CAM.y) * Math.min(1, dt * 5);
  var hw = VW / Z / 2, hh = VH / Z / 2; CAM.x = clamp(CAM.x, Math.min(hw, WW / 2), Math.max(WW - hw, WW / 2)); CAM.y = clamp(CAM.y, Math.min(hh, WH / 2), Math.max(WH - hh, WH / 2));
  G.parts = G.parts.filter(function (q) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.k === 'straw' || q.k === 'conf' || q.k === 'ice' || q.k === 'drop') { q.vy += (q.k === 'conf' ? 20 : 500) * dt; q.r = (q.r || 0) + dt * 6; } else q.vy += 40 * dt; return q.life > 0; });
  G.floats = G.floats.filter(function (f) { f.life -= dt; f.y -= 40 * dt; return f.life > 0; });
  if (G.mode === 'day') { var par = F.parTime(); $('suni').style.left = Math.min(100, 100 * G.dayT / (par * 1.6)) + '%'; }
  if (Math.random() < dt * 0.12) { var r = pick(ANIM); if (!r.hidden && dist(r.x, r.y, F.PL[0].x, F.PL[0].y) < 500) { r.jump = 0.5; O.voice(r.id); } }
  ambient(dt, VW, VH);
  computeHint();
};
function updateAnimal(an, dt) {
  an.jump = Math.max(0, an.jump - dt * 1.8); an.happy = Math.max(0, an.happy - dt); an.shake = Math.max(0, an.shake - dt); an.brush = Math.max(0, an.brush - dt); an.wet = Math.max(0, an.wet - dt); an.talk = Math.max(0, an.talk - dt);
  if (an.hidden) return;
  if (an.follow) { var L = an.follow, tx = L.x - L.face * (50 + G.followers.indexOf(an) * 55), ty = L.y + 12; var d = dist(an.x, an.y, tx, ty); if (d > 20) { var s = Math.min(d * 3, 300); an.x += (tx - an.x) / d * s * dt; an.y += (ty - an.y) / d * s * dt; an.walk += dt * 12; an.face = tx > an.x ? 1 : -1; } else an.walk = 0; return; }
  var r = areaOf(an), w = animalWants(an), P0 = nearestPlayer(an.x, an.y);
  if (w && w !== 'lead' && P0 && dist(an.x, an.y, P0.x, P0.y) < 420 && an.wait <= 0) { an.tx = clamp(P0.x, r.x, r.x + r.w); an.ty = clamp(P0.y, r.y, r.y + r.h); an.wait = 0.6; }
  if (an.out && !an.follow) { if (an.wait <= 0 && dist(an.x, an.y, an.tx, an.ty) < 10) { an.tx = clamp(an.x + rnd(-200, 200), 1100, 2150); an.ty = clamp(an.y + rnd(-150, 150), 620, 1340); an.wait = rnd(0.5, 2); } }
  an.wait -= dt;
  var dx = an.tx - an.x, dy = an.ty - an.y, d2 = Math.sqrt(dx * dx + dy * dy);
  if (d2 > 6 && an.wait <= 0.0001 + (w ? 0.6 : 0)) { var sp = (an.a.kind === 'hen' || an.a.kind === 'bunny' || an.a.kind === 'chick') ? 70 : an.out ? 120 : 55; an.x += dx / d2 * sp * dt; an.y += dy / d2 * sp * dt; an.walk += dt * 8; if (Math.abs(dx) > 3) an.face = dx > 0 ? 1 : -1; }
  else { an.walk = 0; if (an.wait <= 0) { an.tx = rnd(r.x, r.x + r.w); an.ty = rnd(r.y, r.y + r.h); an.wait = rnd(1.5, 5); } }
  if (!an.out) { an.x = clamp(an.x, r.x, r.x + r.w); an.y = clamp(an.y, r.y, r.y + r.h); }
}
function nearestPlayer(x, y) { var b = null, bd = 1e9; F.PL.forEach(function (p) { if (G.driver === p.i) return; var d = dist(x, y, p.x, p.y); if (d < bd) { bd = d; b = p; } }); return b; }
function updateSeek(dt) {
  var S = G.seek, geo = animal('george'); if (S.found) { S.pop -= dt; if (S.pop <= 0) { if (S.round >= S.rounds) { G.ended = true; O.UI.endStory('seek', G.dayT); return; } S.round++; geo.hidden = true; placeGeorge(); F.renderTasks(); O.say('Round ' + S.round + '! Find George again!'); } return; }
  var p = nearestPlayer(geo.x, geo.y) || F.PL[0], d = dist(p.x, p.y, geo.x, geo.y);
  S.giggleT -= dt; if (S.giggleT <= 0) { S.giggleT = 3.2; if (O.AC && d < 1400) { O.SFX.giggle(); } }
  var heat = clamp(1 - d / 1300, 0, 1); $('heat').style.width = Math.round(heat * 100) + '%'; $('heatT').textContent = heat > 0.85 ? 'So hot! 🔥' : heat > 0.6 ? 'Warmer!' : heat > 0.35 ? 'Getting warm…' : 'Cold ❄️';
  geo.hidden = d > 420;   // he peeks out when you get close
  if (d < 115) { S.found = true; S.pop = 2.2; geo.hidden = false; geo.jump = 1; geo.happy = 3; hearts(geo.x, geo.y - 80, 10); O.voice('george'); say(geo, 'Peekaboo!', 2.2); O.SFX.done(); meet(geo); addHearts(geo, 1); O.say('Peekaboo! You found George!'); F.renderTasks(); }
}
function computeHint() {
  G.hint = null; var p = F.PL[0], px = p.x, py = p.y, hold = p.hold;
  if (G.mode === 'seek') { var S = G.seek; if (!S.found && G.dayT - S.t0 > 35) { var g = animal('george'); G.hint = [g.x, g.y - 120]; } return; }
  var t = null; for (var i = 0; i < G.tasks.length; i++) if (!taskDone(G.tasks[i])) { t = G.tasks[i]; break; } if (!t) return;
  function station(item) { var s = STATIONS.filter(function (s) { return s.item === item; })[0]; return s ? [s.x, s.y - (s.sh || 80) - 20] : null; }
  function nearestAn(ids) { var b = null, bd = 1e9; ids.forEach(function (id) { if (t.got[id]) return; var a = animal(id); if (!a) return; var d = dist(px, py, a.x, a.y); if (d < bd) { bd = d; b = a; } }); return b; }
  var need = null, goal = null, inT = G.driver === 0;
  switch (t.type) {
    case 'pet': var a = nearestAn(t.ids); if (a) goal = [a.x, a.y - a.a.h - 30]; break;
    case 'feed': var a2 = nearestAn(t.ids); if (!a2) break; var want = t.item || O.KINDS[a2.a.kind].eats[0]; if (hold && (hold === want || (!t.item && O.canGive(a2.a.kind, hold)))) goal = [a2.x, a2.y - a2.a.h - 30]; else if (G.bed.indexOf(want) >= 0) goal = [TR.x, TR.y - 140]; else need = want; break;
    case 'brush': case 'cool': var a3 = nearestAn(t.ids); if (!a3) break; var tool = t.type === 'cool' ? 'hose' : 'brush'; if (hold === tool) goal = [a3.x, a3.y - a3.a.h - 30]; else need = tool; break;
    case 'water': if (hold === 'water') goal = [TROUGHS[t.pen][0], TROUGHS[t.pen][1] - 70]; else need = 'water'; break;
    case 'ice': goal = [TROUGHS[t.pen][0], TROUGHS[t.pen][1] - 70]; break;
    case 'feeder': if (hold === 'hay' || (inT && G.bed.indexOf('hay') >= 0)) goal = [FEEDERS[t.pen][0], FEEDERS[t.pen][1] - 80]; else if (!inT && G.bed.indexOf('hay') >= 0) goal = [TR.x, TR.y - 140]; else need = 'hay'; break;
    case 'domefeed': if (hold === 'grain') goal = [DOMEFEED[0], DOMEFEED[1] - 60]; else need = 'grain'; break;
    case 'eggs': var e = G.eggs.filter(function (e) { return !e.got; }).sort(function (a, b) { return dist(px, py, a.x, a.y) - dist(px, py, b.x, b.y); })[0]; if (e) goal = [e.x, e.y - 50]; break;
    case 'sell': if (hold === 'eggs') goal = [F.SB.stand.x, F.SB.stand.y - 230]; else { var e2 = G.eggs.filter(function (e) { return !e.got; })[0]; if (e2) goal = [e2.x, e2.y - 50]; } break;
    case 'roundup': if (G.followers.length) goal = [PENS.goats.x + PENS.goats.w / 2, PENS.goats.y + 60]; else { var a4 = null, bd = 1e9; t.ids.forEach(function (id) { var x = animal(id); if (x.home) return; var d = dist(px, py, x.x, x.y); if (d < bd) { bd = d; a4 = x; } }); if (a4) goal = [a4.x, a4.y - a4.a.h - 30]; } break;
    case 'rake': if (hold !== 'rake') need = 'rake'; else { var m = G.messes.filter(function (m) { return m.clean < 1; }).sort(function (a, b) { return dist(px, py, a.x, a.y) - dist(px, py, b.x, b.y); })[0]; if (m) goal = [m.x, m.y - 50]; } break;
    case 'decor': goal = [F.SB.market.x, F.SB.market.y - 250]; break;
    case 'plant': if (hold === 'seeds') { var ei = crops().map(function (c, i) { return c.s === 0 ? i : -1; }).filter(function (i) { return i >= 0; })[0]; if (ei !== undefined) goal = [PLOTS_XY[ei][0], PLOTS_XY[ei][1] - 50]; } else need = 'seeds'; break;
    case 'wplot': if (hold === 'water') { var wi = crops().map(function (c, i) { return c.s > 0 && c.s < 3 && !c.w ? i : -1; }).filter(function (i) { return i >= 0; })[0]; if (wi !== undefined) goal = [PLOTS_XY[wi][0], PLOTS_XY[wi][1] - 50]; } else need = 'water'; break;
    case 'harvest': var ri = crops().map(function (c, i) { return c.s === 3 ? i : -1; }).filter(function (i) { return i >= 0; })[0]; if (hold) goal = null; if (ri !== undefined && !hold) goal = [PLOTS_XY[ri][0], PLOTS_XY[ri][1] - 50]; break;
    case 'snowman': if (hold === 'snow') goal = [SNOWMAN[0], SNOWMAN[1] - 100]; else { var sn = G.snow.filter(function (s) { return !s.got; }).sort(function (a, b) { return dist(px, py, a.x, a.y) - dist(px, py, b.x, b.y); })[0]; if (sn) goal = [sn.x, sn.y - 50]; } break;
    case 'pick': need = 'bouquet'; if (hold === 'bouquet') need = null; break;
    case 'sellf': if (hold === 'bouquet') goal = [F.SB.stand.x, F.SB.stand.y - 230]; else need = 'bouquet'; break;
  }
  if (need) { if (hold === need) return; var st = station(need); if (st) goal = st; }
  G.hint = goal;
}

/* ---------------- render ---------------- */
var cx = null;
F.setCtx = function (c) { cx = c; };
function drawImg(k, x, y, h, flip, sq, rot) { var im = O.IMG[k]; if (!im || !im.complete || !im.naturalWidth) return; var w = h * im.naturalWidth / im.naturalHeight; sq = sq || 0; cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot); cx.scale((flip < 0 ? -1 : 1) * (1 + sq * 0.5), 1 - sq); cx.drawImage(im, -w / 2, -h, w, h); cx.restore(); }
F.drawImg = function (c, k, x, y, h, flip, sq, rot) { var o = cx; cx = c; drawImg(k, x, y, h, flip, sq, rot); cx = o; };
function shadow(x, y, w) { cx.fillStyle = G.season === 'winter' ? 'rgba(90,120,160,.2)' : 'rgba(40,60,20,.22)'; cx.beginPath(); cx.ellipse(x, y, w, w * 0.28, 0, 0, 7); cx.fill(); }
function roundRect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
function bubble(x, y, icon, s) {
  s = s || 1; var b = Math.sin(G.t * 5) * 4; cx.save(); cx.translate(x, y + b); cx.scale(s, s);
  cx.fillStyle = '#fffdf6'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 4; roundRect(-30, -62, 60, 54, 16); cx.fill(); cx.stroke();
  cx.beginPath(); cx.moveTo(-8, -10); cx.lineTo(0, 2); cx.lineTo(8, -10); cx.closePath(); cx.fill(); cx.stroke(); cx.fillRect(-10, -14, 20, 6);
  if (icon === 'pet') drawImg('i_heart', 0, -14, 40); else if (icon === 'lead') { cx.font = '700 30px Fredoka'; cx.textAlign = 'center'; cx.fillStyle = '#4a2e1a'; cx.fillText('🏠', 0, -22); } else drawImg(O.ITEMS[icon] ? O.ITEMS[icon].img : icon, 0, -14, 40);
  cx.restore();
}
function label(x, y, txt, col, size) { cx.font = '600 ' + (size || 20) + 'px Fredoka'; cx.textAlign = 'center'; cx.lineJoin = 'round'; cx.lineWidth = 5; cx.strokeStyle = 'rgba(74,46,26,.85)'; cx.strokeText(txt, x, y); cx.fillStyle = col || '#fff'; cx.fillText(txt, x, y); }
function speech(x, y, txt) { cx.font = '600 19px Fredoka'; var w = cx.measureText(txt).width + 22; cx.fillStyle = '#fff'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; roundRect(x - w / 2, y - 38, w, 32, 14); cx.fill(); cx.stroke(); cx.fillStyle = '#4a2e1a'; cx.textAlign = 'center'; cx.fillText(txt, x, y - 15); }
function drawGround() {
  var S = O.SEASONS[G.season];
  cx.fillStyle = grassPat || S.grass[0]; cx.fillRect(0, 0, WW, WH);
  cx.fillStyle = G.season === 'winter' ? '#9aa3ad' : '#8a8f96'; cx.fillRect(0, WH - 140, WW, 140); cx.fillStyle = '#6f747b'; cx.fillRect(0, WH - 140, WW, 10); cx.fillStyle = '#ffd65a'; for (var x = 20; x < WW; x += 120) cx.fillRect(x, WH - 74, 64, 8);
  cx.fillStyle = dirtPat || S.dirt; cx.strokeStyle = dirtPat || S.dirt; cx.lineCap = 'round'; cx.lineJoin = 'round';
  cx.lineWidth = 120; cx.beginPath(); cx.moveTo(1600, 640); cx.lineTo(1600, WH - 140); cx.stroke();
  cx.lineWidth = 90; cx.beginPath(); cx.moveTo(960, 560); cx.lineTo(1250, 640); cx.lineTo(1960, 640); cx.lineTo(2240, 600); cx.stroke();
  cx.beginPath(); cx.moveTo(960, 1180); cx.lineTo(1600, 1100); cx.lineTo(2240, 1240); cx.stroke();
  cx.beginPath(); cx.moveTo(960, 1560); cx.lineTo(1250, 1360); cx.stroke(); cx.beginPath(); cx.moveTo(2240, 1600); cx.lineTo(1950, 1360); cx.stroke();
  cx.beginPath(); cx.ellipse(1600, 700, 330, 120, 0, 0, 7); cx.fill();
  Object.keys(PENS).forEach(function (k) { var p = PENS[k]; cx.fillStyle = k === 'chickens' ? (G.season === 'winter' ? 'rgba(240,230,200,.5)' : 'rgba(230,200,120,.55)') : S.pen; roundRect(p.x, p.y, p.w, p.h, 8); cx.fill(); });
  cx.fillStyle = S.pond; cx.strokeStyle = G.season === 'winter' ? '#8fbcd6' : '#3f8fbf'; cx.lineWidth = 6; cx.beginPath(); cx.ellipse(2500, 2010, 170, 62, 0, 0, 7); cx.fill(); cx.stroke();
  cx.fillStyle = 'rgba(255,255,255,.5)'; cx.beginPath(); cx.ellipse(2450, 1995, 60, 10, 0, 0, 7); cx.fill();
  if (G.season === 'winter') { cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(2400, 1990); cx.lineTo(2460, 2020); cx.lineTo(2520, 2000); cx.moveTo(2470, 2020); cx.lineTo(2500, 2045); cx.stroke(); }
  // garden plots
  if (G.season !== 'winter' || crops().some(function (c) { return c.s; })) PLOTS_XY.forEach(function (P, i) { var c = crops()[i]; cx.fillStyle = c.w ? '#4a321f' : '#6b4a2e'; cx.strokeStyle = '#3d2a17'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(P[0], P[1], 36, 16, 0, 0, 7); cx.fill(); cx.stroke(); if (c.s === 1) { cx.fillStyle = '#e8c27a'; for (var j = 0; j < 5; j++) { cx.beginPath(); cx.arc(P[0] - 14 + j * 7, P[1] - 2 + (j % 2) * 4, 2.2, 0, 7); cx.fill(); } } });
  if (G.season === 'winter' && (O.SAVE.snowman || G.snowmanN)) { /* drawn as a sprite */ }
}
function drawFence(f) {
  cx.strokeStyle = '#7a4f2a'; cx.lineCap = 'round';
  cx.lineWidth = 7; cx.beginPath(); cx.moveTo(f.ax, f.ay - 34); cx.lineTo(f.bx, f.by - 34); cx.moveTo(f.ax + 0.01, f.ay - 14); cx.lineTo(f.bx, f.by - 14); cx.stroke();
  if (f.horiz) { cx.strokeStyle = '#a8754a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(f.ax, f.ay - 36); cx.lineTo(f.bx, f.by - 36); cx.stroke(); }
  cx.fillStyle = '#8a5a30'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 2.5; cx.fillRect(f.ax - 5, f.ay - 46, 10, 48); cx.strokeRect(f.ax - 5, f.ay - 46, 10, 48);
  if (G.season === 'winter') { cx.fillStyle = '#fff'; cx.fillRect(f.ax - 6, f.ay - 50, 12, 6); }
}
function drawAcc(an, x, y, h, flip) {
  var accId = an.accOverride !== undefined ? an.accOverride : O.SAVE.acc[an.id]; if (!accId) return; var acc = O.ACCS.filter(function (a) { return a.id === accId; })[0]; if (!acc) return;
  var im = O.IMG[an.id], A = O.ANCHOR[an.id]; if (!im || !A) return; var w = h * im.naturalWidth / im.naturalHeight;
  var ax = (A.hx - 0.5) * w * (flip < 0 ? -1 : 1), ay = -h + A.hy * h, size = clamp(an.a.h * 0.3, 20, 44) * h / an.a.h;
  if (acc.at === 'neck') { ax -= (flip < 0 ? -1 : 1) * w * 0.08; ay += h * 0.3; size *= 1.15; }
  drawImg(acc.img, x + ax, y + ay + (acc.at === 'head' ? size * 0.55 : size * 0.5), size, flip);
}
F.render = function (VW, VH, DPR) {
  var Z = O.ZOOM;
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = O.SEASONS[G.season].grass[0]; cx.fillRect(0, 0, VW, VH);
  cx.setTransform(DPR * Z, 0, 0, DPR * Z, DPR * (VW / 2 - CAM.x * Z), DPR * (VH / 2 - CAM.y * Z));
  drawGround();
  G.messes.forEach(function (m) { if (m.clean >= 1) return; cx.globalAlpha = 1 - m.clean * 0.8; drawImg('i_mess', m.x, m.y + 14, 40 * (1 - m.clean * 0.4)); cx.globalAlpha = 1; });
  G.eggs.forEach(function (e) { if (!e.got) drawImg('i_egg', e.x, e.y + 6, 36 + Math.sin(G.t * 3 + e.bob) * 2); });
  G.snow.forEach(function (s) { if (s.got) return; cx.fillStyle = '#fff'; cx.strokeStyle = '#9fc3dd'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(s.x, s.y, 30, 14, 0, 0, 7); cx.fill(); cx.stroke(); cx.beginPath(); cx.arc(s.x - 6, s.y - 12, 13, 0, 7); cx.fill(); cx.stroke(); });
  var L = [], S = O.SEASONS[G.season];
  FENCE.forEach(function (f) { L.push({ y: f.y, f: f }); });
  PROPS.forEach(function (p) { L.push({ y: p[2], p: p }); });
  STATIONS.forEach(function (s) { L.push({ y: s.y, s: s }); });
  Object.keys(TROUGHS).forEach(function (k) { L.push({ y: TROUGHS[k][1], tr: k }); });
  Object.keys(FEEDERS).forEach(function (k) { L.push({ y: FEEDERS[k][1], fd: k }); });
  L.push({ y: DOMEFEED[1], dfe: 1 });
  PLOTS_XY.forEach(function (P, i) { var c = crops()[i]; if (c.s >= 2) L.push({ y: P[1] + 8, crop: i }); });
  if (G.season === 'winter' && (O.SAVE.snowman || G.snowmanN)) L.push({ y: SNOWMAN[1], snowman: 1 });
  F.DECOR.forEach(function (d) { if (!F.hasDecor(d.id)) return; d.spots.forEach(function (s) { L.push({ y: s[1], dec: [d.img || d.id, s[0], s[1], s[2]] }); }); });
  ANIM.forEach(function (a) { if (!a.hidden) L.push({ y: a.y, an: a }); });
  L.push({ y: TR.y, truck: 1 });
  F.PL.forEach(function (p) { if (G.driver !== p.i) L.push({ y: p.y, kid: p }); });
  L.sort(function (a, b) { return a.y - b.y; });
  L.forEach(function (o) {
    if (o.f) drawFence(o.f);
    else if (o.p) { var key = o.p[0] === 'barn' ? S.barn : o.p[0] === 'oak' ? S.oak : o.p[0]; shadow(o.p[1], o.p[2], o.p[3] * 0.4); drawImg(key, o.p[1], o.p[2], o.p[3]); }
    else if (o.s) drawStation(o.s);
    else if (o.tr) { var t = TROUGHS[o.tr]; drawImg('trough', t[0], t[1], 50); if (G.frozen[o.tr]) { cx.fillStyle = 'rgba(220,240,255,.92)'; cx.strokeStyle = '#8fbcd6'; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(t[0], t[1] - 34, 32, 10, 0, 0, 7); cx.fill(); cx.stroke(); cx.beginPath(); cx.moveTo(t[0] - 18, t[1] - 36); cx.lineTo(t[0] - 4, t[1] - 31); cx.lineTo(t[0] + 12, t[1] - 38); cx.stroke(); } }
    else if (o.fd) { var f = FEEDERS[o.fd]; drawImg('bench', f[0], f[1], 66); var n = G.feederN[o.fd] || 0; for (var i = 0; i < Math.min(n, 3); i++) drawImg('i_hay', f[0] - 30 + i * 30, f[1] - 38, 30); }
    else if (o.dfe) { cx.fillStyle = '#c98b4a'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; roundRect(DOMEFEED[0] - 40, DOMEFEED[1] - 26, 80, 26, 8); cx.fill(); cx.stroke(); drawImg('i_grain', DOMEFEED[0], DOMEFEED[1] - 14, 34); }
    else if (o.crop !== undefined) { var c = crops()[o.crop], P = PLOTS_XY[o.crop]; drawImg(c.s === 2 ? 'crop_sprout' : c.type === 'pumpkin' ? 'crop_pumpkin' : 'crop_carrot', P[0], P[1] + 10, c.s === 2 ? 44 : 62 + Math.sin(G.t * 3 + o.crop) * 2); }
    else if (o.snowman) { var stage = O.SAVE.snowman ? 3 : G.snowmanN; shadow(SNOWMAN[0], SNOWMAN[1], 40); if (stage >= 3) drawImg('snowman', SNOWMAN[0], SNOWMAN[1], 150); else { cx.fillStyle = '#fff'; cx.strokeStyle = '#9fc3dd'; cx.lineWidth = 3; for (var k = 0; k < stage; k++) { cx.beginPath(); cx.arc(SNOWMAN[0], SNOWMAN[1] - 26 - k * 40, 30 - k * 6, 0, 7); cx.fill(); cx.stroke(); } } }
    else if (o.dec) { shadow(o.dec[1], o.dec[2], o.dec[3] * 0.35); drawImg(o.dec[0], o.dec[1], o.dec[2], o.dec[3]); }
    else if (o.an) drawAnimal(o.an);
    else if (o.truck) drawTruck();
    else if (o.kid) drawKid(o.kid);
  });
  if (!G.season || G.season !== 'winter') { if (G.season === 'winter' && (O.SAVE.snowman || G.snowmanN)) {} }
  if (G.mode === 'day' && !(O.SAVE.snowman || G.snowmanN) && G.tasks.some(function (t) { return t.type === 'snowman'; })) { cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.setLineDash([8, 8]); cx.lineWidth = 4; cx.beginPath(); cx.ellipse(SNOWMAN[0], SNOWMAN[1], 50, 18, 0, 0, 7); cx.stroke(); cx.setLineDash([]); label(SNOWMAN[0], SNOWMAN[1] - 30, 'Snowman spot', '#fff'); }
  if (F.hasDecor('bunting')) drawBunting();
  if (F.hasDecor('lights')) drawLights();
  G.parts.forEach(function (p) {
    cx.globalAlpha = Math.min(1, p.life * 2);
    if (p.k === 'heart') drawImg('i_heart', p.x, p.y, p.s);
    else if (p.k === 'spark') { cx.fillStyle = p.c; cx.beginPath(); for (var i = 0; i < 8; i++) { var r = i % 2 ? p.s * 0.4 : p.s, a = i * Math.PI / 4; cx.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); } cx.fill(); }
    else if (p.k === 'straw') { cx.strokeStyle = '#e6c25a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x + Math.cos(p.r) * p.s, p.y + Math.sin(p.r) * p.s); cx.stroke(); }
    else if (p.k === 'ice') { cx.fillStyle = '#e6f6ff'; cx.strokeStyle = '#8fbcd6'; cx.lineWidth = 1.5; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.beginPath(); cx.moveTo(-p.s, 0); cx.lineTo(0, -p.s * 0.7); cx.lineTo(p.s, 0); cx.lineTo(0, p.s * 0.7); cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); }
    else if (p.k === 'drop') { cx.fillStyle = '#7cc8ff'; cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 7); cx.fill(); }
    else if (p.k === 'conf') { cx.fillStyle = p.c; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); }
    cx.globalAlpha = 1;
  });
  G.floats.forEach(function (f) { cx.globalAlpha = Math.min(1, f.life * 1.5); label(f.x, f.y, f.txt, f.c); cx.globalAlpha = 1; });
  F.PL.forEach(function (p) { drawTarget(p); });
  // ambient season fx (screen space)
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); drawAmbient(cx);
  if (G.hint) drawHint(G.hint[0], G.hint[1], VW, VH, DPR);
};
function drawStation(s) {
  if (s.spr) { shadow(s.x, s.y, s.sh * 0.35); drawImg(s.spr, s.x, s.y, s.sh); }
  if (s.id === 'brush' || s.id === 'blankets' || s.id === 'hose') { cx.fillStyle = '#8a5a30'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; cx.fillRect(s.x - 6, s.y - 110, 12, 112); cx.strokeRect(s.x - 6, s.y - 110, 12, 112); cx.fillRect(s.x - 26, s.y - 110, 52, 10); cx.strokeRect(s.x - 26, s.y - 110, 52, 10); var held = F.PL.some(function (p) { return p.hold === s.item; }); if (!held || s.id === 'blankets') drawImg(O.ITEMS[s.item].img, s.x, s.y - 40, s.id === 'blankets' ? 58 : 52); }
  if (s.id === 'rake' && !F.PL.some(function (p) { return p.hold === 'rake'; })) drawImg('i_rake', s.x - 6, s.y - 20, 92, 1, 0, -0.35);
  if (s.id === 'stand') drawImg('i_apple', s.x + 70, s.y - 6, 40);
  if (s.id === 'seeds' || s.id === 'melon') { cx.fillStyle = s.id === 'melon' ? '#3d8fd6' : '#b98a52'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; roundRect(s.x - 34, s.y - 40, 68, 42, 8); cx.fill(); cx.stroke(); if (s.id === 'melon') { cx.fillStyle = '#fff'; cx.fillRect(s.x - 34, s.y - 44, 68, 8); cx.strokeRect(s.x - 34, s.y - 44, 68, 8); } drawImg(O.ITEMS[s.item].img, s.x, s.y - 34, 46); }
  var near = F.PL.some(function (p) { return G.driver === p.i ? dist(TR.x, TR.y, s.x, s.y) < 300 : dist(p.x, p.y, s.x, s.y) < 260; });
  if (near) label(s.x, s.y - (s.sh || 110) - 14, s.item ? s.label + ' · ' + O.ITEMS[s.item].name : s.label, '#ffe9a8');
}
function drawTarget(p) {
  var t = p.target; if (!t) return; var tx, ty;
  if (t.k === 'animal') { tx = t.an.x; ty = t.an.y; } else if (t.k === 'station') { tx = t.s.x; ty = t.s.y; } else if (t.k === 'trough') { tx = TROUGHS[t.pen][0]; ty = TROUGHS[t.pen][1]; } else if (t.k === 'feeder') { tx = FEEDERS[t.pen][0]; ty = FEEDERS[t.pen][1]; } else if (t.k === 'domefeed') { tx = DOMEFEED[0]; ty = DOMEFEED[1]; } else if (t.k === 'mess') { tx = t.m.x; ty = t.m.y; } else if (t.k === 'truck') { tx = TR.x; ty = TR.y; } else if (t.k === 'plot') { tx = PLOTS_XY[t.i][0]; ty = PLOTS_XY[t.i][1]; } else if (t.k === 'snowman') { tx = SNOWMAN[0]; ty = SNOWMAN[1]; }
  cx.strokeStyle = p.i ? 'rgba(160,220,255,.95)' : 'rgba(255,255,255,.9)'; cx.lineWidth = 4; cx.setLineDash([10, 8]); cx.lineDashOffset = -G.t * 30; cx.beginPath(); cx.ellipse(tx, ty + 4, 58, 18, 0, 0, 7); cx.stroke(); cx.setLineDash([]);
  if (p.holdProg > 0 && (t.k === 'animal' || t.k === 'mess' || t.k === 'trough')) { var hx = tx, hy = ty - (t.k === 'animal' ? t.an.a.h + 40 : 70); cx.lineWidth = 9; cx.strokeStyle = 'rgba(74,46,26,.5)'; cx.beginPath(); cx.arc(hx, hy, 24, 0, 7); cx.stroke(); cx.strokeStyle = '#8fd16a'; cx.beginPath(); cx.arc(hx, hy, 24, -Math.PI / 2, -Math.PI / 2 + p.holdProg * Math.PI * 2); cx.stroke(); }
}
function drawHint(x, y, VW, VH, DPR) {
  var Z = O.ZOOM, sx = (x - CAM.x) * Z + VW / 2, sy = (y - CAM.y) * Z + VH / 2, m = 60;
  var on = sx > 24 && sx < VW - 24 && sy > 30 && sy < VH - 24;
  if (on) { var b = Math.abs(Math.sin(G.t * 4)) * 16 * Z; cx.save(); cx.translate(sx, sy - b); cx.scale(Math.max(0.6, Z), Math.max(0.6, Z)); cx.fillStyle = '#ffd65a'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(-20, -40); cx.lineTo(20, -40); cx.lineTo(20, -14); cx.lineTo(34, -14); cx.lineTo(0, 18); cx.lineTo(-34, -14); cx.lineTo(-20, -14); cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); return; }
  var dx = sx - VW / 2, dy = sy - VH / 2, a = Math.atan2(dy, dx);
  var ex = clamp(sx, m, VW - m), ey = clamp(sy, m + 50, VH - m - (document.body.classList.contains('touch') ? 90 : 0));
  var cr = $('clip').getBoundingClientRect(); if (ex < cr.right + 30 && ey < cr.bottom + 30) { if (Math.abs(dx) > Math.abs(dy)) ey = cr.bottom + 40; else ex = cr.right + 40; }
  cx.save(); cx.translate(ex, ey); cx.rotate(a); var pulse = 1 + Math.sin(G.t * 6) * 0.08; cx.scale(pulse, pulse); cx.fillStyle = '#ffd65a'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(26, 0); cx.lineTo(-14, -22); cx.lineTo(-6, 0); cx.lineTo(-14, 22); cx.closePath(); cx.fill(); cx.stroke(); cx.restore();
}
function drawAnimal(an) {
  var a = an.a, h = a.h, bob = an.walk ? Math.abs(Math.sin(an.walk)) * -5 : Math.sin(G.t * 2 + an.x) * 1.2, jy = an.jump > 0 ? -Math.sin(an.jump * Math.PI) * 28 : 0, sq = an.walk ? Math.sin(an.walk * 2) * 0.03 : 0;
  var shk = an.shake > 0 ? Math.sin(an.shake * 40) * 6 : 0;
  shadow(an.x, an.y, h * 0.32 * (a.kind === 'peacock' ? 1.1 : 1));
  var flip = a.id === 'peter' ? 1 : an.face;
  drawImg(a.id, an.x + shk, an.y + bob + jy, h, flip, sq + (an.brush > 0 ? Math.sin(G.t * 30) * 0.03 : 0));
  if (an.blanket) { var w = h * 0.55; cx.save(); cx.globalAlpha = 0.92; cx.fillStyle = '#c0392b'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; roundRect(an.x - w / 2 + shk, an.y + bob + jy - h * 0.62, w, h * 0.26, 8); cx.fill(); cx.stroke(); cx.strokeStyle = 'rgba(30,110,60,.9)'; cx.lineWidth = 4; for (var i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(an.x - w / 2 + i * w / 4 + shk, an.y + bob + jy - h * 0.62); cx.lineTo(an.x - w / 2 + i * w / 4 + shk, an.y + bob + jy - h * 0.36); cx.stroke(); } cx.restore(); }
  drawAcc(an, an.x + shk, an.y + bob + jy, h, flip);
  if (an.wet > 0) { cx.fillStyle = 'rgba(124,200,255,.8)'; for (var j = 0; j < 4; j++) { cx.beginPath(); cx.arc(an.x + rnd(-h * 0.3, h * 0.3), an.y - rnd(0, h), 3, 0, 7); cx.fill(); } }
  var w2 = G.mode === 'day' ? animalWants(an) : null;
  var near = F.PL.some(function (p) { return dist(an.x, an.y, G.driver === p.i ? TR.x : p.x, G.driver === p.i ? TR.y : p.y) < 230; });
  if (an.talk > 0) speech(an.x, an.y - h - 12 + jy, an.talkT);
  else if (w2) bubble(an.x, an.y - h - 6 + jy, w2, 0.95);
  if ((near || w2) && an.talk <= 0) { var lv = O.friendLv(a.id); label(an.x, an.y + 26, a.name + (lv ? ' ' + '♥'.repeat(lv) : ''), O.SAVE.met[a.id] ? '#fff' : '#e8f6ff'); }
}
function drawKid(p) {
  var k = p.kid === 'boy' ? 'kid_boy' : 'kid_girl', bob = p.walk ? Math.abs(Math.sin(p.walk)) * -6 : 0, tilt = p.walk ? Math.sin(p.walk) * 0.06 : 0;
  shadow(p.x, p.y, 26); drawImg(k, p.x, p.y + bob, 104, p.face, 0, tilt);
  if (G.season === 'winter') { cx.fillStyle = '#c0392b'; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 2; roundRect(p.x - 16, p.y + bob - 70, 32, 9, 4); cx.fill(); cx.stroke(); }
  if (F.PL.length > 1) label(p.x, p.y + 24, 'P' + (p.i + 1), p.i ? '#bfe6ff' : '#ffe9a8', 16);
  if (p.hold) { var hx = p.x + p.face * 30, hy = p.y - 62 + bob; drawImg(O.ITEMS[p.hold].img, hx, hy, p.hold === 'rake' ? 78 : p.hold === 'snow' ? 34 : 44); if (O.ITEMS[p.hold].count) label(hx + 22, hy - 34, '×' + p.holdN, '#fff'); }
}
function drawTruck() {
  var by = Math.sin(TR.bob) * 2.5; shadow(TR.x, TR.y, 120); drawImg('truck', TR.x, TR.y + by, 118, TR.face);
  if (G.season === 'winter') { cx.fillStyle = 'rgba(255,255,255,.95)'; roundRect(TR.x + TR.face * 10 - 34, TR.y + by - 118, 68, 10, 5); cx.fill(); }
  var bedX = TR.x - TR.face * 62; G.bed.forEach(function (it, i) { drawImg(O.ITEMS[it].img, bedX + (i - 1.5) * 24 * TR.face, TR.y - 54 + by - (i % 2) * 6, 40); });
  if (G.driver >= 0) { var p = F.PL[G.driver], k = p.kid === 'boy' ? 'kid_boy' : 'kid_girl'; cx.save(); cx.beginPath(); cx.rect(TR.x + TR.face * 8 - 40, TR.y - 112 + by, 80, 46); cx.clip(); drawImg(k, TR.x + TR.face * 28, TR.y - 40 + by, 86, TR.face); cx.restore(); }
  if (G.driver < 0 && F.PL.some(function (p) { return dist(p.x, p.y, TR.x, TR.y) < 240; })) label(TR.x, TR.y - 134, 'Farm truck' + (G.bed.length ? ' · ' + G.bed.length + '/4' : ''), '#bfe6ff');
}
function drawBunting() { var x0 = 1440, x1 = 1760, y = 380, cols = ['#e8473a', '#ffd65a', '#4f9a3e', '#2a8fd6', '#ff8ec7']; cx.strokeStyle = '#4a2e1a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(x0, y); cx.quadraticCurveTo(1600, y + 60, x1, y); cx.stroke(); for (var i = 0; i < 9; i++) { var t = (i + 0.5) / 9, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 30; cx.fillStyle = cols[i % 5]; cx.beginPath(); cx.moveTo(x - 14, yy); cx.lineTo(x + 14, yy); cx.lineTo(x, yy + 28); cx.closePath(); cx.fill(); cx.stroke(); } }
function drawLights() { var x0 = 1420, x1 = 1780, y = 470; cx.strokeStyle = '#2d4a2d'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(x0, y); cx.quadraticCurveTo(1600, y + 40, x1, y); cx.stroke(); for (var i = 0; i < 14; i++) { var t = (i + 0.5) / 14, x = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 20 + 6, on = (Math.floor(G.t * 3) + i) % 3; cx.fillStyle = ['#ffe066', '#ff6b6b', '#7cd4ff'][on]; cx.shadowColor = cx.fillStyle; cx.shadowBlur = 10; cx.beginPath(); cx.arc(x, yy, 5, 0, 7); cx.fill(); } cx.shadowBlur = 0; }

/* ---------------- init ---------------- */
F.init = function (c) { cx = c; buildFences(); makePatterns('fall', c); crops(); };
F.HIDE_SPOTS = HIDE_SPOTS; F.PLOTS_XY = PLOTS_XY; F.SNOWMAN = SNOWMAN;
})();
