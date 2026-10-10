/* Oak Hill Farm v2 — screens: title, Farm Map, day cards, home/pause, end of day, album + friendship, shop, settings, main loop */
(function () {
'use strict';
var O = window.OHF, $ = O.$, F = O.FARM, clamp = O.clamp;
var UI = O.UI = {};
var S = UI.S = { mode: 'load', level: null, def: null, tasks: null, mini: null, miniGame: null, pend: null, mapSeason: O.SAVE.lastSeason || 'fall', free: null };

/* ---------------- the three mini books, as story levels ---------------- */
O.BOOKS = {
  seek: { n: 1, title: 'Peekaboo, George!', pages: [
    'Peekaboo! Little George the Highland calf wants to play hide-and-seek.',
    'Ready or not, here we come! Listen for his giggle. The closer you get, the warmer it feels.',
    "There you are, George! Everybody gave him a great big hug. Now it's George's turn to count!"] },
  roll: { n: 2, title: 'The Great Pumpkin Roll', pages: [
    'It was fall at Oak Hill Farm. Gaby and Boots found the biggest pumpkin at the farm stand.',
    'Uh-oh! The big pumpkin started rolling down the hill! Help Boots chase it. Jump over the hay bales and the bunnies!',
    'At the bottom of the hill, Boots put out one big, fluffy hoof. STOP! He caught it! Gaby gave Boots a kiss.'] },
  wake: { n: 3, title: 'Rodney Oversleeps', pages: [
    'Every morning, Rodney the show rooster crows to wake up Oak Hill Farm. But one morning, Rodney was fast asleep. Zzzzz...',
    'Help the farm wake him up! Watch who makes a sound, then make the same sounds in the same order.',
    'COCK-A-DOODLE-DOO! Good morning, Oak Hill Farm!'] }
};
O.BOOKS.seek.cover = O.BOOKS.roll.cover = O.BOOKS.wake.cover = null;
['seek', 'roll', 'wake'].forEach(function (k) { O.BOOKS[k].cover = 'ohf/books/src/c' + O.BOOKS[k].n + '.jpg?v=1'; });

/* ---------------- canvas ---------------- */
var cv = $('g'), cx = cv.getContext('2d'), DPR = 1, VW = 0, VH = 0;
O.cx = cx; F.setCtx(cx);
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); VW = innerWidth; VH = innerHeight; cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  O.BASEZOOM = clamp(Math.min(VW / 1450, VH / 880), VW < VH ? 0.5 : 0.4, 1.1); if (F.PL.length < 2) O.ZOOM = O.BASEZOOM;
  var cl = $('clip'); if (cl && !cl.dataset.user) cl.classList.toggle('compact', VW < 640 || VH < 480);
  if ($('mapS').classList.contains('show')) paintMap();
  if (S.mini && S.mini.resize) S.mini.resize(VW, VH);
}
UI.size = function () { return { VW: VW, VH: VH, DPR: DPR }; };
addEventListener('resize', resize);

/* ---------------- toasts ---------------- */
O.toast = function (msg, img, ms) {
  var t = $('toast'); while (t.children.length > 1) t.removeChild(t.firstChild);
  var d = document.createElement('div'); if (img) { var i = document.createElement('img'); i.src = img; i.alt = ''; d.appendChild(i); }
  var s = document.createElement('span'); s.textContent = msg; d.appendChild(s); t.appendChild(d); setTimeout(function () { d.remove(); }, ms || 3200);
};

/* ---------------- screens ---------------- */
var SCREENS = ['friendS', 'helpS', 'setS', 'shopS', 'albumS', 'homeS', 'kidS', 'pauseS', 'endS', 'dayS', 'colorS', 'mapS', 'title'];
function show(id) { $(id).classList.add('show'); usingPadFocus(); }
function hide(id) { $(id).classList.remove('show'); setTimeout(paintFocus, 20); }
function hideAll() { SCREENS.forEach(function (id) { $(id).classList.remove('show'); }); $('back').style.display = 'none'; }
UI.show = show; UI.hide = hide; UI.hideAll = hideAll;
function visibleScreen() { for (var i = 0; i < SCREENS.length; i++) if ($(SCREENS[i]).classList.contains('show')) return $(SCREENS[i]); return null; }
UI.visibleScreen = visibleScreen;
function setMode(m) { S.mode = m; document.body.dataset.mode = m; }
UI.setMode = setMode;

/* menus work with arrows / WASD / a controller */
var focusIdx = 0, usingPad = false;
function focusables(sc) { return [].slice.call(sc.querySelectorAll('button,.kid,.card,.stop,input')).filter(function (b) { return b.offsetParent !== null && !b.disabled; }); }
function usingPadFocus() { focusIdx = 0; setTimeout(paintFocus, 20); }
function paintFocus() {
  document.querySelectorAll('.focus').forEach(function (e) { e.classList.remove('focus'); });
  var sc = visibleScreen(); if (!sc || !usingPad) return; var f = focusables(sc); if (!f.length) return;
  focusIdx = (focusIdx + f.length) % f.length; f[focusIdx].classList.add('focus'); try { f[focusIdx].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
}
function menuNav(sc) {
  var f = focusables(sc), dir = 0;
  if (O.pressed(['ArrowRight', 'ArrowDown', 'd', 's']) || O.anyPadPress('right') || O.anyPadPress('down')) dir = 1;
  if (O.pressed(['ArrowLeft', 'ArrowUp', 'a', 'w']) || O.anyPadPress('left') || O.anyPadPress('up')) dir = -1;
  if (dir && f.length) { if (!usingPad) { usingPad = true; var cur = f.indexOf(sc.querySelector('.stop.cur')); focusIdx = cur >= 0 ? cur : 0; } else focusIdx += dir; paintFocus(); O.SFX.pop(); }
  if (O.pressed([' ', 'Enter']) || O.anyPadPress('a')) {
    var el = usingPad ? f[(focusIdx + f.length) % f.length] : null;
    if (!el) el = sc.querySelector('[data-go]') || sc.querySelector('.btn.green') || sc.querySelector('.stop.cur') || sc.querySelector('.btn');
    if (el) { if (el.tagName === 'INPUT') el.focus(); else el.click(); } setTimeout(paintFocus, 30);
  }
  if ((O.anyPadPress('b') || O.pressed(['Escape', 'Backspace']))) { var x = sc.querySelector('[data-back]'); if (x) x.click(); }
}
addEventListener('mousemove', function () { if (usingPad) { usingPad = false; paintFocus(); } });
function btn(label, cls, fn, attrs) { var b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.type = 'button'; b.textContent = label; if (attrs) for (var k in attrs) b.setAttribute(k, attrs[k]); b.addEventListener('click', function () { O.audio(); fn(); }); return b; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmt(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2); }
function starRow(n, max) { var h = ''; for (var i = 0; i < (max || 3); i++) h += '<span class="' + (i < n ? '' : 'off') + '">⭐</span>'; return h; }
UI.fmt = fmt; UI.esc = esc;

/* ---------------- touch ---------------- */
var JOY = { on: false, x: 0, y: 0 }; UI.JOY = JOY;
var stickEl = $('stick'), stickId = null, sx0 = 0, sy0 = 0;
addEventListener('pointerdown', function (e) {
  O.audio();
  if (e.pointerType !== 'touch' || S.mode !== 'farm' || visibleScreen()) return;
  if (e.target.closest && e.target.closest('button,#act,#truckb,#clip,.scr,#stats')) return;
  if (e.clientX > VW * 0.62) return;
  stickId = e.pointerId; sx0 = e.clientX; sy0 = e.clientY; stickEl.style.left = sx0 + 'px'; stickEl.style.top = sy0 + 'px'; stickEl.style.display = 'block'; JOY.on = true; JOY.x = JOY.y = 0;
}, { passive: true });
addEventListener('pointermove', function (e) { if (e.pointerId !== stickId) return; var dx = e.clientX - sx0, dy = e.clientY - sy0, m = Math.sqrt(dx * dx + dy * dy), R = 50; if (m > R) { dx *= R / m; dy *= R / m; } JOY.x = dx / R; JOY.y = dy / R; stickEl.firstChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }, { passive: true });
function endStick(e) { if (e.pointerId !== stickId) return; stickId = null; JOY.on = false; JOY.x = JOY.y = 0; stickEl.style.display = 'none'; stickEl.firstChild.style.transform = ''; }
addEventListener('pointerup', endStick); addEventListener('pointercancel', endStick);
var actEl = $('act');
actEl.addEventListener('pointerdown', function (e) { e.preventDefault(); O.audio(); O.TOUCHACT = true; O.PRESS.__act = 1; actEl.classList.add('on'); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { actEl.addEventListener(ev, function () { O.TOUCHACT = false; actEl.classList.remove('on'); }); });
$('truckb').addEventListener('pointerdown', function (e) { e.preventDefault(); O.audio(); O.PRESS.__truck = 1; });
function markTouch() { if (!document.body.classList.contains('touch')) { document.body.classList.add('touch'); } }
addEventListener('touchstart', markTouch, { passive: true });
if (matchMedia && matchMedia('(pointer:coarse)').matches) markTouch();
// minis get raw pointer events on the canvas
['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function (ev) {
  cv.addEventListener(ev, function (e) { if (S.mode !== 'mini' || !S.mini || visibleScreen() || !S.mini.pointer) return; if (ev === 'pointerdown') { O.audio(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} } S.mini.pointer(ev.replace('pointer', ''), e.clientX, e.clientY, e.pointerId); });
});

/* ---------------- coins / stars ---------------- */
UI.updateCoins = function () { var c = O.SAVE.coins; $('coins').textContent = c; $('mapCoins').textContent = c; $('mapStars').textContent = O.totalStars(); };

/* ---------------- title ---------------- */
function stopMini() { if (S.mini && S.mini.stop) S.mini.stop(); S.mini = null; }
UI.stopMini = stopMini;
function toTitle() {
  O.engineOn(false); O.stopTalk(); stopMini(); setMode('title'); hideAll(); show('title'); if (!O.EMBED) $('back').style.display = 'block';
  $('tPlay').textContent = O.totalStars() ? '▶ Farm Map' : '▶ Play';
}
UI.toTitle = toTitle;
$('tPlay').addEventListener('click', function () { O.audio(); if (!O.SAVE.kid) { openKid(function () { toMap(); }); return; } toMap(); });
$('tColor').addEventListener('click', function () { O.audio(); O.COLOR.open(); });
$('tAlbum').addEventListener('click', function () { O.audio(); openAlbum(); });
$('tSet').addEventListener('click', function () { O.audio(); openSettings(); });

/* ---------------- kid select ---------------- */
var kidThen = null;
function openKid(then) { kidThen = then || null; document.querySelectorAll('.kid').forEach(function (k) { k.classList.toggle('sel', k.dataset.k === (O.SAVE.kid || 'girl')); }); show('kidS'); }
document.querySelectorAll('.kid').forEach(function (k) { k.addEventListener('click', function () { document.querySelectorAll('.kid').forEach(function (o) { o.classList.remove('sel'); }); k.classList.add('sel'); O.SFX.pop(); }); });
$('kidOk').addEventListener('click', function () { var s = document.querySelector('.kid.sel'); O.SAVE.kid = s ? s.dataset.k : 'girl'; O.save(); hide('kidS'); if (kidThen) { var f = kidThen; kidThen = null; f(); } });

/* ---------------- Farm Map ---------------- */
// stop positions (percent of the map area): landscape snakes left→right across the open field, portrait zig-zags upward
var PATH_L = [[22, 82], [38, 80], [54, 82], [70, 79], [80, 62], [64, 58], [47, 60], [30, 56], [30, 37], [50, 34], [70, 36]];
var PATH_P = [[28, 90], [54, 85], [76, 77], [54, 69], [28, 62], [44, 53], [72, 46], [52, 37], [26, 30], [48, 21], [74, 14]];
function toMap(season) {
  O.engineOn(false); O.stopTalk(); stopMini(); S.free = null; setMode('map'); hideAll();
  if (season) S.mapSeason = season; if (!O.seasonUnlocked(S.mapSeason)) S.mapSeason = 'fall';
  show('mapS'); paintMap(); UI.updateCoins();
  if (!O.SAVE.seenIntro.map) { O.SAVE.seenIntro.map = 1; O.save(); O.say('This is the Farm Map! Tap a stop to play.'); }
}
UI.toMap = toMap;
function curLevel(season) { var L = O.LEVELS[season]; for (var i = 0; i < L.length; i++) if (O.isUnlocked(L[i]) && !O.SAVE.stars[L[i].id]) return L[i]; return null; }
function paintMap() {
  var s = S.mapSeason, SE = O.SEASONS[s], L = O.LEVELS[s];
  $('mapS').style.backgroundImage = 'url(' + O.src('map_' + s) + ')';
  var tabs = $('mapTabs'); tabs.innerHTML = '';
  O.SEASON_ORDER.forEach(function (k) {
    var un = O.seasonUnlocked(k), b = document.createElement('button'); b.type = 'button'; b.className = 'tab' + (k === s ? ' sel' : '') + (un ? '' : ' lock');
    var got = O.LEVELS[k].reduce(function (a, l) { return a + (O.SAVE.stars[l.id] || 0); }, 0);
    b.innerHTML = '<span>' + (un ? O.SEASONS[k].emoji : '🔒') + '</span> ' + O.SEASONS[k].name + (un ? ' <small>' + got + '/33⭐</small>' : '');
    b.addEventListener('click', function () { O.audio(); if (!un) { O.SFX.no(); var prev = O.SEASON_ORDER[O.SEASON_ORDER.indexOf(k) - 1]; O.toast('🔒 Finish ' + O.SEASONS[prev].name + ' Day 8 to open ' + O.SEASONS[k].name + '!'); O.say('Finish ' + O.SEASONS[prev].name + ' day 8 to open ' + O.SEASONS[k].name + '!'); return; } S.mapSeason = k; O.SAVE.lastSeason = k; O.save(); O.SFX.pop(); paintMap(); });
    tabs.appendChild(b);
  });
  var W = $('mapW'), r = W.getBoundingClientRect(), portrait = r.height > r.width * 1.05, P = portrait ? PATH_P : PATH_L;
  var svg = $('mapPath'), pts = P.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
  svg.innerHTML = '<polyline points="' + pts + '" fill="none" stroke="rgba(74,46,26,.55)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
    '<polyline points="' + pts + '" fill="none" stroke="#fff8e8" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round" vector-effect="non-scaling-stroke"/>';
  var box = $('mapStops'); box.innerHTML = ''; var cur = curLevel(s);
  L.forEach(function (lv, i) {
    var un = O.isUnlocked(lv), st = O.SAVE.stars[lv.id] || 0, b = document.createElement('button'); b.type = 'button';
    b.className = 'stop ' + lv.type + (un ? '' : ' lock') + (cur === lv ? ' cur' : '') + (st ? ' done' : '');
    b.style.left = P[i][0] + '%'; b.style.top = P[i][1] + '%';
    var face = !un ? '🔒' : lv.type === 'day' ? '<b>' + lv.n + '</b>' : '<img src="' + O.src(O.MINI_ICON[lv.game]) + '" alt="">';
    b.innerHTML = face + '<span class="st">' + (un ? starRow(st).replace(/⭐/g, '★') : '') + '</span><span class="nm"></span>';
    b.querySelector('.nm').textContent = (lv.type === 'day' ? 'Day ' + lv.n + ': ' : lv.type === 'story' ? '📖 ' : '🎮 ') + O.levelName(lv);
    b.title = b.querySelector('.nm').textContent;
    b.addEventListener('click', function () { O.audio(); if (!un) { O.SFX.no(); O.toast('🔒 Finish the stop before this one first!'); return; } openCard(lv); });
    box.appendChild(b);
  });
  if (cur) { var ci = L.indexOf(cur), k = document.createElement('img'); k.className = 'mapkid'; k.src = O.src(O.SAVE.kid === 'boy' ? 'kid_boy' : 'kid_girl'); k.alt = ''; k.style.left = P[ci][0] + '%'; k.style.top = P[ci][1] + '%'; box.appendChild(k); }
  var done8 = !!O.SAVE.stars[s + '-8'];
  $('mapFree').style.display = done8 ? '' : 'none';
  var got = L.reduce(function (a, l) { return a + (O.SAVE.stars[l.id] || 0); }, 0);
  $('mapInfo').textContent = SE.emoji + ' ' + SE.name + ' at Oak Hill Farm · ' + got + ' of 33 stars' + (done8 ? '' : ' · finish Day 8 to open the next season');
  UI.updateCoins();
}
UI.paintMap = paintMap;
$('mapHome').addEventListener('click', function () { O.audio(); toTitle(); });
$('mapAlbum').addEventListener('click', function () { O.audio(); openAlbum(); });
$('mapColor').addEventListener('click', function () { O.audio(); O.COLOR.open(); });
$('mapSet').addEventListener('click', function () { O.audio(); openSettings(); });
$('mapFree').addEventListener('click', function () { O.audio(); openFree(S.mapSeason); });

/* ---------------- level cards ---------------- */
function bestLine(lv) { var st = O.SAVE.stars[lv.id] || 0, b = O.SAVE.best[lv.id]; return st ? '<p class="best">Your best: <span class="stars sm">' + starRow(st) + '</span>' + (b && b.t ? ' · ' + fmt(b.t) : '') + (b && b.score ? ' · ' + b.score + ' points' : '') + '</p>' : ''; }
function prepTasks(season, tasks) {
  // a festival day asks for decorations; if this season's are all bought already, count them
  tasks.forEach(function (t) { if (t.type !== 'decor') return; var left = F.decorFor(season).filter(function (d) { return !F.hasDecor(d.id, season); }).length; if (left < t.n) t.have = t.n - left; });
  return tasks;
}
function openCard(lv) {
  S.pend = { level: lv }; var b = $('dayBody'), SE = O.SEASONS[lv.season];
  if (lv.type === 'day') {
    var def = O.DAYS[lv.season][lv.n - 1], tasks = prepTasks(lv.season, def.tasks()); S.pend.def = def; S.pend.tasks = tasks;
    b.innerHTML = '<div class="kicker">' + SE.emoji + ' ' + SE.name + ' · Day ' + lv.n + ' of 8</div><h2></h2><p class="intro"></p><div class="tasks"></div>' + bestLine(lv);
    b.querySelector('h2').textContent = def.name; b.querySelector('.intro').textContent = def.intro;
    var tw = b.querySelector('.tasks'); tasks.forEach(function (t) { var d = document.createElement('div'); d.innerHTML = '<img src="' + F.taskIcon(t) + '" alt=""><span></span>'; d.querySelector('span').textContent = F.taskLabel(t); tw.appendChild(d); });
    O.say(SE.name + ', day ' + lv.n + '. ' + def.name + '!');
  } else {
    var M = O.MINI[lv.game], book = lv.type === 'story' ? O.BOOKS[lv.game] : null;
    b.innerHTML = '<div class="kicker">' + SE.emoji + ' ' + SE.name + ' · ' + (book ? '📖 Story level' : '🎮 Bonus game') + (lv.diff > 1 ? ' · Level 2' : '') + '</div>' +
      (book ? '<img class="cover" src="' + book.cover + '" alt="">' : '<img class="icon" src="' + O.src(O.MINI_ICON[lv.game]) + '" alt="">') + '<h2></h2><p class="intro"></p><p class="how"></p>' + bestLine(lv);
    b.querySelector('h2').textContent = O.MINI_NAMES[lv.game]; b.querySelector('.intro').textContent = book ? book.pages[0] : (M && M.intro) || '';
    var how = lv.game === 'seek' ? 'Walk around the farm and listen for George\'s giggle. The meter at the top gets hotter when you are close. Find him ' + (lv.diff > 1 ? 4 : 3) + ' times!' : (M && (document.body.classList.contains('touch') ? M.howTouch || M.how : M.how)) || '';
    b.querySelector('.how').textContent = how;
    O.say((book ? book.pages[0] + ' ' : (M && M.intro ? M.intro + ' ' : '')) + how);
  }
  $('dayGo').textContent = lv.type === 'story' ? '📖 Start the story ▶' : 'Let\'s go! ▶';
  show('dayS');
}
UI.openCard = openCard;
function openFree(season) {
  var def = O.randomDay(season), tasks = prepTasks(season, def.tasks()); S.pend = { level: null, free: season, def: def, tasks: tasks };
  var b = $('dayBody'); b.innerHTML = '<div class="kicker">' + O.SEASONS[season].emoji + ' Free Play</div><h2></h2><p class="intro"></p><div class="tasks"></div><p class="best">Free Play days earn coins and friendship hearts.</p>';
  b.querySelector('h2').textContent = def.name; b.querySelector('.intro').textContent = def.intro;
  var tw = b.querySelector('.tasks'); tasks.forEach(function (t) { var d = document.createElement('div'); d.innerHTML = '<img src="' + F.taskIcon(t) + '" alt=""><span></span>'; d.querySelector('span').textContent = F.taskLabel(t); tw.appendChild(d); });
  $('dayGo').textContent = 'Let\'s go! ▶'; show('dayS');
}
$('dayGo').addEventListener('click', function () { O.audio(); startPending(); });
$('dayMap').addEventListener('click', function () { O.audio(); O.stopTalk(); hide('dayS'); if (S.mode !== 'map') toMap(S.pend && S.pend.level ? S.pend.level.season : S.mapSeason); });
function startPending() {
  var P = S.pend; if (!P) return; hideAll(); O.stopTalk(); stopMini(); $('toast').innerHTML = '';
  var lv = P.level; S.level = lv; S.free = P.free || null;
  O.ZOOM = O.BASEZOOM;
  if (!lv) { setMode('farm'); document.body.classList.remove('seek'); F.start(null, P.def, P.tasks, { season: P.free }); return; }
  O.SAVE.lastSeason = lv.season; S.mapSeason = lv.season; O.save();
  if (lv.type === 'day') { setMode('farm'); document.body.classList.remove('seek'); F.start(lv, P.def, P.tasks); return; }
  if (lv.game === 'seek') { setMode('farm'); document.body.classList.add('seek'); F.start(lv, { name: 'Peekaboo, George!', intro: '' }, [], { mode: 'seek', diff: lv.diff }); O.say(O.BOOKS.seek.pages[1]); return; }
  startMini(lv);
}
UI.startPending = startPending;
function startMini(lv) {
  var M = O.MINI[lv.game]; if (!M) { O.toast('That game is still being built!'); toMap(lv.season); return; }
  document.body.classList.remove('seek'); setMode('mini'); S.mini = M; S.miniGame = lv.game; $('mname').textContent = O.MINI_NAMES[lv.game]; $('mscore').textContent = '';
  M.start(lv.diff || 1, MAPI, lv.season); O.post('start');
}
var MAPI = UI.MAPI = {
  end: function (res) { UI.endMini(res); },
  hud: function (txt) { $('mscore').textContent = txt; },
  size: function () { return { VW: VW, VH: VH, DPR: DPR }; },
  drawImg: function (c, k, x, y, h, flip, sq, rot) { F.drawImg(c, k, x, y, h, flip, sq, rot); }
};

/* ---------------- end of a level ---------------- */
function recordStars(lv, stars, best) {
  if (!lv) return false;
  var prev = O.SAVE.stars[lv.id] || 0, first = !prev; if (stars > prev) O.SAVE.stars[lv.id] = stars;
  var b = O.SAVE.best[lv.id] || {}; if (best.t && (!b.t || best.t < b.t)) b.t = Math.round(best.t); if (best.score && (!b.score || best.score > b.score)) b.score = best.score; O.SAVE.best[lv.id] = b;
  var s = lv.season, newly = null;
  if (lv.type === 'day' && lv.n === 8) { O.giveSticker(s); var nx = O.SEASON_ORDER[O.SEASON_ORDER.indexOf(s) + 1]; if (nx && first) newly = nx; }
  if (O.LEVELS[s].every(function (l) { return O.SAVE.stars[l.id] === 3; })) O.giveSticker('superstar');
  O.save(); return newly;
}
function nextOf(lv) {
  if (!lv) return null; var L = O.LEVELS[lv.season], i = L.indexOf(lv);
  if (i < L.length - 1) return L[i + 1];
  var nx = O.SEASON_ORDER[O.SEASON_ORDER.indexOf(lv.season) + 1]; return nx ? O.LEVELS[nx][0] : null;
}
function showEnd(html, opts) {
  opts = opts || {}; var lv = S.level; ['pauseS', 'homeS', 'albumS', 'friendS', 'shopS', 'helpS', 'setS'].forEach(function (id) { $(id).classList.remove('show'); });
  $('endBody').innerHTML = html;
  var row = $('endBtns'); row.innerHTML = '';
  var nx = S.free ? 'free' : nextOf(lv);
  if (nx === 'free') row.appendChild(btn('🎲 Another day ▶', 'green', function () { hide('endS'); openFree(S.free); }, { 'data-go': '1' }));
  else if (nx && O.isUnlocked(nx)) row.appendChild(btn((nx.season !== lv.season ? O.SEASONS[nx.season].emoji + ' On to ' + O.SEASONS[nx.season].name : 'Next stop') + ' ▶', 'green', function () { hide('endS'); openCard(nx); }, { 'data-go': '1' }));
  if (opts.color) row.appendChild(btn('🖍️ Color this story', 'alt', function () { O.COLOR.open(opts.color); }));
  if (lv) row.appendChild(btn('↺ Play again', 'alt', function () { hide('endS'); openCard(lv); }));
  row.appendChild(btn('🗺️ Farm Map', 'alt', function () { toMap(lv ? (nx && nx !== 'free' && O.isUnlocked(nx) ? nx.season : lv.season) : S.free); }, { 'data-back': '1' }));
  O.post('over', { score: O.totalStars() });
  show('endS');
}
UI.endDay = function () {
  var G = F.G, t = G.dayT, par = F.parTime(), stars = t <= par ? 3 : t <= par * 1.6 ? 2 : 1, lv = S.level, def = G.def;
  var coins = 5 + stars * 2; O.SAVE.coins += coins; O.save(); UI.updateCoins(); O.engineOn(false);
  var newly = lv ? recordStars(lv, stars, { t: t }) : null;
  var fest = def.fest, met = Object.keys(O.SAVE.met).length;
  var head = fest ? '🎉 ' + def.name + '!' : lv ? (O.SEASONS[lv.season].emoji + ' Day ' + lv.n + ' done!') : 'Free Play day done!';
  var html = '<h2>' + esc(head) + '</h2><div class="stars">' + starRow(stars) + '</div>' +
    '<p>All the chores finished in <b>' + fmt(t) + '</b>. You earned <b>' + coins + ' 🪙</b>.</p>' +
    (stars < 3 && lv ? '<p class="small">Finish in under ' + fmt(par) + ' for 3 stars.</p>' : '') +
    (newly ? '<p class="unlock">' + O.SEASONS[newly].emoji + ' <b>' + O.SEASONS[newly].name + '</b> is open on the Farm Map!</p>' : '') +
    '<p class="small">Farm Friends met: <b>' + met + ' / ' + O.CAST.length + '</b> · Total stars: <b>' + O.totalStars() + '</b></p>';
  for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { O.SFX.star(i); }, 300 + i * 260); })(i);
  if (fest || newly) F.confetti(160);
  O.say(head.replace(/^[^A-Za-z]+/, '') + ' You got ' + stars + (stars === 1 ? ' star!' : ' stars!') + (newly ? ' ' + O.SEASONS[newly].name + ' is open on the farm map!' : ''));
  showEnd(html);
};
UI.endStory = function (game, time) {
  var lv = S.level, rounds = F.G.seek ? F.G.seek.rounds : 3, par = rounds * 24, stars = time <= par ? 3 : time <= par * 1.8 ? 2 : 1;
  var coins = 4 + stars * 2; O.SAVE.coins += coins; O.save(); UI.updateCoins();
  recordStars(lv, stars, { t: time }); endStoryScreen('seek', stars, '<p>You found George ' + rounds + ' times in <b>' + fmt(time) + '</b>. You earned <b>' + coins + ' 🪙</b>.</p>' + (stars < 3 ? '<p class="small">Find him in under ' + fmt(par) + ' for 3 stars.</p>' : ''));
};
function endStoryScreen(game, stars, body) {
  var book = O.BOOKS[game];
  var html = '<img class="cover" src="' + book.cover + '" alt=""><h2>' + esc(book.title) + '</h2><div class="stars">' + starRow(stars) + '</div><p class="story"></p>' + body + '<p class="small">The End! Color this story in the Oak Hill Farm mini coloring book, or right here in Coloring.</p>';
  for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { O.SFX.star(i); }, 300 + i * 260); })(i);
  showEnd(html, { color: 'mini_b' + book.n + 'p6' });
  $('endBody').querySelector('.story').textContent = book.pages[2];
  O.say(book.pages[2] + ' The end!');
}
UI.endMini = function (res) {
  var lv = S.level, stars = clamp(res.stars | 0, 1, 3), coins = 3 + stars * 2; O.SAVE.coins += coins;
  if (res.hearts) res.hearts.forEach(function (id) { O.SAVE.hearts[id] = (O.SAVE.hearts[id] || 0) + 1; if (!O.SAVE.met[id]) O.SAVE.met[id] = Date.now(); });
  O.save(); UI.updateCoins(); recordStars(lv, stars, { score: res.score || 0, t: res.t || 0 });
  var body = '<p>' + esc(res.text || '') + ' You earned <b>' + coins + ' 🪙</b>.</p>' + (stars < 3 && res.need ? '<p class="small">' + esc(res.need) + '</p>' : '');
  if (lv.type === 'story') { endStoryScreen(lv.game, stars, body); return; }
  for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { O.SFX.star(i); }, 300 + i * 260); })(i);
  showEnd('<img class="icon" src="' + O.src(O.MINI_ICON[lv.game]) + '" alt=""><h2>' + esc(O.MINI_NAMES[lv.game]) + '</h2><div class="stars">' + starRow(stars) + '</div>' + body);
  O.say((res.say || res.text || '') + ' You got ' + stars + (stars === 1 ? ' star!' : ' stars!'));
};

/* ---------------- home / pause ---------------- */
function inLevel() { return S.mode === 'farm' || S.mode === 'mini'; }
$('bHome').addEventListener('click', function () { O.audio(); if (!inLevel() || visibleScreen()) return; O.engineOn(false); show('homeS'); O.say('Go back to the farm map?'); });
$('hMap').addEventListener('click', function () { O.audio(); hide('homeS'); toMap(S.level ? S.level.season : S.free || S.mapSeason); });
$('hStay').addEventListener('click', function () { O.audio(); hide('homeS'); if (F.G.driver >= 0 && S.mode === 'farm') O.engineOn(true); });
function pause(on) {
  if (on) {
    if (!inLevel() || visibleScreen()) return; O.engineOn(false);
    var G = F.G;
    $('pauseInfo').textContent = S.mode === 'mini' ? O.MINI_NAMES[S.miniGame] : G.mode === 'seek' ? 'Peekaboo, George! · round ' + G.seek.round + ' of ' + G.seek.rounds : (S.level ? O.SEASONS[S.level.season].name + ' · Day ' + S.level.n + ' · ' : '') + G.def.name + ' · ' + G.tasks.filter(F.taskDone).length + '/' + G.tasks.length + ' chores done';
    $('pQuit').textContent = O.EMBED ? '← Quit to the Arcade' : '← Back to the Arcade'; $('pAlbum').style.display = S.mode === 'farm' ? '' : 'none';
    show('pauseS');
  } else { hide('pauseS'); if (F.G.driver >= 0 && S.mode === 'farm') O.engineOn(true); }
}
UI.pause = pause;
$('bPause').addEventListener('click', function () { O.audio(); pause(true); });
$('pResume').addEventListener('click', function () { pause(false); });
$('pRestart').addEventListener('click', function () { hide('pauseS'); if (S.level) openCard(S.level); else if (S.free) openFree(S.free); });
$('pMap').addEventListener('click', function () { hide('pauseS'); toMap(S.level ? S.level.season : S.free || S.mapSeason); });
$('pTitle').addEventListener('click', function () { hide('pauseS'); toTitle(); });
$('pQuit').addEventListener('click', function () { if (O.EMBED) O.post('exit'); else location.href = '/'; });
$('pHelp').addEventListener('click', function () { show('helpS'); });
$('pSet').addEventListener('click', function () { openSettings(); });
$('helpX').addEventListener('click', function () { hide('helpS'); });

/* ---------------- album + friendship ---------------- */
var albumTab = 'friends';
function openAlbum(tab) {
  if (S.mode === 'farm') O.engineOn(false); albumTab = tab || albumTab;
  $('albumTabs').querySelectorAll('button').forEach(function (b) { b.classList.toggle('sel', b.dataset.t === albumTab); });
  var g = $('albumG'); g.innerHTML = ''; var n = 0;
  if (albumTab === 'friends') {
    O.CAST.forEach(function (c) {
      var id = c[0], met = !!O.SAVE.met[id], lv = O.friendLv(id); if (met) n++;
      var d = document.createElement('div'); d.className = 'card' + (met ? '' : ' lock') + (lv >= 5 ? ' gold' : ''); d.tabIndex = 0;
      d.innerHTML = '<img src="' + O.src(id) + '" alt=""><span class="nm"></span><span class="hearts">' + (met ? heartRow(lv) : '') + '</span>';
      d.querySelector('.nm').textContent = met ? c[1] : '???'; d.addEventListener('click', function () { O.audio(); openFriend(id); }); g.appendChild(d);
    });
    $('albumN').textContent = n + ' / ' + O.CAST.length; $('albumTip').textContent = 'Pet, feed, brush or play with an animal to fill your hearts. More hearts, more surprises!';
  } else {
    O.STICKERS.forEach(function (st) {
      var got = !!O.SAVE.stickers[st.id]; if (got) n++;
      var d = document.createElement('div'); d.className = 'card sticker' + (got ? '' : ' lock'); d.tabIndex = 0;
      d.innerHTML = (st.img ? '<img src="' + O.src(st.img) + '" alt="">' : '<div class="emo">' + st.emoji + '</div>') + '<span class="nm"></span><span class="how"></span>';
      d.querySelector('.nm').textContent = st.name; d.querySelector('.how').textContent = st.how; d.addEventListener('click', function () { O.say(st.name + '. ' + st.how); }); g.appendChild(d);
    });
    $('albumN').textContent = n + ' / ' + O.STICKERS.length; $('albumTip').textContent = 'Earn stickers by finishing seasons, making friends and coloring. Secret codes are hiding in the Oak Hill Farm coloring books and at the farm!';
  }
  show('albumS');
}
UI.openAlbum = openAlbum;
$('albumTabs').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { O.audio(); O.SFX.pop(); openAlbum(b.dataset.t); }); });
$('albumX').addEventListener('click', function () { hide('albumS'); if (F.G.driver >= 0 && S.mode === 'farm' && !visibleScreen()) O.engineOn(true); });
function heartRow(lv) { var h = ''; for (var i = 0; i < 5; i++) h += i < lv ? '♥' : '♡'; return h; }
function portrait(id, H, acc) {
  var c = document.createElement('canvas'), im = O.IMG[id], r = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1, W = Math.round(H * r * 1.15 + 20), HH = Math.round(H * 1.18);
  c.width = W * 2; c.height = HH * 2; c.style.width = W + 'px'; c.style.height = HH + 'px'; var g = c.getContext('2d'); g.scale(2, 2);
  F.drawPortrait(g, id, W / 2, HH - 6, H, acc === undefined ? O.SAVE.acc[id] : acc); return c;
}
function openFriend(id) {
  var a = O.BY[id], met = !!O.SAVE.met[id], lv = O.friendLv(id), h = O.SAVE.hearts[id] || 0, b = $('friendBody'); b.innerHTML = '';
  if (!met) {
    b.innerHTML = '<img src="' + O.src(id) + '" alt="" style="filter:brightness(0) opacity(.3);height:min(30vh,220px)"><h2>???</h2><p>You haven\'t met this friend yet. Pet, feed or brush them to find out who they are!</p>';
    b.appendChild(btn('Back', '', function () { hide('friendS'); }, { 'data-back': '1' })); show('friendS'); return;
  }
  var wrap = document.createElement('div'); wrap.className = 'pframe' + (lv >= 5 ? ' gold' : ''); wrap.appendChild(portrait(id, Math.min(230, innerHeight * 0.28))); b.appendChild(wrap);
  var info = document.createElement('div');
  var nextNeed = lv < 5 ? O.HEART_LV[lv] - h : 0;
  info.innerHTML = '<h2></h2><p class="role"></p><div class="hearts big">' + heartRow(lv) + '</div><p class="small lvl"></p><p class="fact"></p>' +
    (lv >= 2 ? '<p class="fav"><img src="' + O.src(O.ITEMS[a.fav].img) + '" alt=""> Favorite treat: <b></b></p>' : '<p class="small lockline">♥ Level 2: learn ' + esc(a.name) + '\'s favorite treat</p>') +
    (lv >= 4 ? '<p class="secret"></p>' : lv >= 2 ? '<p class="small lockline">♥ Level 4: hear a secret</p>' : '') +
    (lv >= 5 ? '<p class="bff">💛 Best friends forever! 💛</p>' : '');
  info.querySelector('h2').textContent = a.name; info.querySelector('.role').textContent = a.role; info.querySelector('.fact').textContent = a.fact;
  info.querySelector('.lvl').textContent = 'Friendship level ' + lv + ' of 5 · ' + h + ' hearts' + (lv < 5 ? ' · ' + nextNeed + ' more to level ' + (lv + 1) : '');
  if (lv >= 2) info.querySelector('.fav b').textContent = O.ITEMS[a.fav].name;
  if (lv >= 4) info.querySelector('.secret').textContent = '🤫 ' + a.secret;
  b.appendChild(info);
  if (lv >= 3) {
    var row = document.createElement('div'); row.className = 'accs'; var gold = O.SAVE.stickers.horseshoe || O.SAVE.stickers.visitor;
    var cur = O.SAVE.acc[id] || '';
    [{ id: '', name: 'None' }].concat(O.ACCS).forEach(function (ac) {
      var lock = ac.secret && !gold, d = document.createElement('button'); d.type = 'button'; d.className = 'acc' + (cur === ac.id ? ' sel' : '') + (lock ? ' lock' : '');
      d.innerHTML = ac.img ? '<img src="' + O.src(ac.img) + '" alt="">' : '<span>✖</span>'; d.title = lock ? 'Find a secret code to unlock the golden crown!' : ac.name;
      d.addEventListener('click', function () { O.audio(); if (lock) { O.SFX.no(); O.toast('🔑 Find a secret code to unlock the golden crown!'); return; } if (ac.id) O.SAVE.acc[id] = ac.id; else delete O.SAVE.acc[id]; O.save(); O.SFX.pop(); O.voice(id); openFriend(id); });
      row.appendChild(d);
    });
    var lab = document.createElement('p'); lab.className = 'small'; lab.textContent = 'Dress up ' + a.name + ':'; b.appendChild(lab); b.appendChild(row);
  } else { var l3 = document.createElement('p'); l3.className = 'small lockline'; l3.textContent = '♥ Level 3: dress up ' + a.name + ' with bows, hats and more'; b.appendChild(l3); }
  var br = document.createElement('div');
  br.appendChild(btn('🔊 Say hi', 'alt', function () { O.voice(id); }));
  br.appendChild(btn('Back', '', function () { hide('friendS'); openAlbum('friends'); }, { 'data-back': '1' }));
  b.appendChild(br); show('friendS'); O.voice(id);
}
UI.openFriend = openFriend;

/* ---------------- shop (Farm Market) ---------------- */
UI.openShop = function () {
  O.engineOn(false); var season = F.G.season, g = $('shopG'); g.innerHTML = ''; $('shopCoins').textContent = O.SAVE.coins;
  $('shopH').textContent = O.SEASONS[season].emoji + ' Farm Market · ' + O.SEASONS[season].name + ' decorations';
  F.decorFor(season).forEach(function (d) {
    var own = F.hasDecor(d.id, season), div = document.createElement('div'); div.className = 'card' + (own ? ' own' : ''); div.tabIndex = 0;
    div.innerHTML = '<img src="' + O.src(d.img || d.id) + '" alt=""><span class="nm"></span><span class="cost">' + (own ? '✓ On the farm' : d.cost + ' 🪙') + '</span>';
    div.querySelector('.nm').textContent = d.name;
    div.addEventListener('click', function () {
      O.audio(); if (own) return;
      if (O.SAVE.coins < d.cost) { O.SFX.no(); O.toast('You need ' + d.cost + ' 🪙. Sell eggs and finish chores to earn more!'); return; }
      O.SAVE.coins -= d.cost; F.buyDecor(d.id, season); UI.updateCoins(); O.SFX.coin(); F.progress('decor', function () { return true; }); UI.openShop();
    });
    g.appendChild(div);
  });
  show('shopS');
};
$('shopX').addEventListener('click', function () { hide('shopS'); });

/* ---------------- settings + secret codes ---------------- */
function openSettings() { paintSettings(); $('codeMsg').textContent = ''; $('codeIn').value = ''; show('setS'); }
UI.openSettings = openSettings;
function paintSettings() {
  $('sSound').textContent = O.soundOn ? '🔊 Sound: On' : '🔇 Sound: Off';
  $('sTalk').textContent = O.SAVE.narrate ? '🗣️ Read aloud: On' : '🤫 Read aloud: Off';
  var touch = document.body.classList.contains('touch');
  $('sPlayers').textContent = O.SAVE.players === 2 ? '👥 2 players' : '🧑 1 player'; $('sPlayers').style.display = touch ? 'none' : '';
  $('sPlayersTip').style.display = touch ? 'none' : ''; $('sPlayersTip').textContent = O.SAVE.players === 2 ? 'Player 1: WASD + Space, F for the truck. Player 2: arrow keys + Enter, / for the truck. Or plug in two controllers!' : 'Turn on 2 players to farm together on one keyboard or two controllers.';
}
$('sSound').addEventListener('click', function () { O.audio(); O.setSound(!O.soundOn); paintSettings(); });
$('sTalk').addEventListener('click', function () { O.audio(); O.SAVE.narrate = O.SAVE.narrate ? 0 : 1; O.save(); paintSettings(); if (O.SAVE.narrate) O.say('I will read things out loud for you!'); else O.stopTalk(); });
$('sPlayers').addEventListener('click', function () { O.audio(); O.SAVE.players = O.SAVE.players === 2 ? 1 : 2; O.save(); O.SFX.pop(); paintSettings(); if (S.mode === 'farm') O.toast('Players change on the next day you start.'); });
$('sKid').addEventListener('click', function () { O.audio(); openKid(null); });
$('sHelp').addEventListener('click', function () { O.audio(); show('helpS'); });
$('setX').addEventListener('click', function () { hide('setS'); if (S.mode === 'map') paintMap(); });
function tryCode() {
  var raw = ($('codeIn').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''), msg = $('codeMsg'); if (!raw) return;
  var C = O.CODES[raw];
  if (!C) { O.SFX.no(); msg.textContent = 'Hmm, that\'s not a secret code. Keep looking!'; return; }
  if (O.SAVE.codes[raw]) { msg.textContent = 'You already used that code. Nice!'; return; }
  O.SAVE.codes[raw] = Date.now(); O.SAVE.coins += C.coins; O.save(); UI.updateCoins(); O.giveSticker(C.sticker);
  msg.textContent = '🎉 ' + C.msg + ' +' + C.coins + ' 🪙, a golden sticker, and the golden crown for your best friends!'; O.SFX.done(); O.say(C.msg); $('codeIn').value = ''; $('codeIn').blur();
}
$('codeGo').addEventListener('click', function () { O.audio(); tryCode(); });
$('codeIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tryCode(); } if (e.key === 'Escape') $('codeIn').blur(); });

/* ---------------- clipboard ---------------- */
$('cliph').addEventListener('click', function () { var c = $('clip'); c.dataset.user = 1; if (c.classList.contains('compact')) c.classList.remove('compact'); else if (c.classList.contains('min')) c.classList.remove('min'); else c.classList.add(VW < 640 || VH < 480 ? 'compact' : 'min'); });
$('bAlbum').addEventListener('click', function () { O.audio(); if (S.mode === 'farm' && !visibleScreen()) openAlbum(); });

/* ---------------- loop ---------------- */
var lastT = performance.now();
function tick(dt) {
  O.pollPads();
  if (O.pressed(['m'])) { O.setSound(!O.soundOn); if ($('setS').classList.contains('show')) paintSettings(); }
  var sc = visibleScreen();
  if (S.mode === 'color') { if (!(O.COLOR.tick && O.COLOR.tick(dt)) && sc) menuNav(sc); return; }
  if (inLevel()) {
    if (!sc) {
      if (O.pressed(['Escape', 'p']) || O.anyPadPress('start')) { pause(true); return; }
      if (S.mode === 'farm' && (O.pressed(['l']) || O.anyPadPress('y'))) { openAlbum(); return; }
      if (O.pressed(['h']) ) { $('bHome').click(); return; }
      if (S.mode === 'farm') F.update(dt, JOY);
      else if (S.mini) S.mini.update(dt, O.controls(0, false, null));
    } else {
      if (sc.id === 'pauseS' && (O.pressed(['p']) || O.anyPadPress('start'))) { pause(false); return; }
      menuNav(sc);
    }
    return;
  }
  if (sc) menuNav(sc);
}
function frame(now) {
  var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  try { tick(dt); if (S.mode === 'farm') F.render(VW, VH, DPR); else if (S.mode === 'mini' && S.mini) S.mini.render(cx, VW, VH, DPR); } catch (e) { console.error(e); }
  O.PRESS = {};
  requestAnimationFrame(frame);
}
function boot() {
  F.init(cx); resize(); UI.updateCoins(); O.setSound(O.soundOn);
  $('load').style.display = 'none';
  var q = /[?&]color=1/.test(location.search); toTitle(); if (q) O.COLOR.open();
  requestAnimationFrame(frame);
}
UI.boot = function () { resize(); O.loadAll(function (p) { $('lbar').style.width = Math.round(p * 100) + '%'; }, boot); };
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { if (O.music) O.music.pause(); O.stopTalk(); pause(true); }
  else if (O.soundOn && O.music && S.mode !== 'load' && !O.musicHold) { var p = O.music.play(); if (p && p.catch) p.catch(function () {}); }
});
// another tab (or the Arcade signing in) changed the save: adopt it when not mid-level
addEventListener('storage', function (e) { if (e.key !== 'ohf_save' || inLevel()) return; O.reloadSave(); UI.updateCoins(); if (S.mode === 'map') paintMap(); });
addEventListener('arcade:sync', function () { if (inLevel()) return; O.reloadSave(); UI.updateCoins(); if (S.mode === 'map') paintMap(); });

/* test hooks */
window.__ohf = { O: O, F: F, UI: UI, S: S, G: F.G, startLevel: function (id) { var lv = O.levelById(id); openCard(lv); startPending(); }, free: function (s) { openFree(s); startPending(); } };
})();
