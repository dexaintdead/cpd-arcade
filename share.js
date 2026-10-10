/* share.js — share-your-score cards, build 2026-10-10c.
   play.html calls ArcadeShare.open({ game, title, label, score, prefix, accent, name }).
   1. Draws a 1080x1350 card on a canvas (the game's own screenshot, the score, the player).
   2. Asks the API for a signed link (link.contentpad.io/arcade/s/<slug>): chat apps and
      socials show the score in the link preview, and a click lands on the game tagged
      utm_source=share, utm_campaign=score_<slug>, so HQ → Marketing can count it.
   3. Share (the picture + the link where the phone allows it), Save image, Copy link.
   Logs share:<slug> once per card. No native dialogs; Esc / backdrop / ✕ close it. */
(function () {
  'use strict';
  if (window.ArcadeShare) return;
  var API = window.ARCADE_API || 'https://cpd-api.dex-fe2.workers.dev';
  // Same-origin pictures only, so the canvas can be saved. Anything else gets the gradient.
  var ART = {
    'pregame-yearbook': '/pp/cover-yearbook.jpg'
  };
  var SHOTS = { 'pregame-leaked': 1, 'oak-hill-farm': 1, 'night-drive': 1, 'toy-tokyo-catcher': 1, 'high-flying': 1, 'nightmare-on-46th': 1, 'skyline-dash': 1 };
  var CSS =
    '#asc{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(3,4,12,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}' +
    '#asc.show{display:flex}' +
    '#asc .bx{position:relative;width:100%;max-width:420px;max-height:calc(100vh - 32px);overflow:auto;background:#0b0d22;border:1px solid rgba(94,224,255,.3);border-radius:18px;padding:18px;color:#eef1fb;font:400 14px/1.45 Inter,system-ui,-apple-system,sans-serif;box-sizing:border-box}' +
    '#asc .k{font:700 11px/1 Menlo,Consolas,monospace;letter-spacing:.2em;color:#5ee0ff;text-transform:uppercase;margin:4px 0 12px}' +
    '#asc canvas{display:block;width:100%;height:auto;border-radius:12px;background:#02030d}' +
    '#asc .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}' +
    '#asc .row button{flex:1 1 30%;min-width:0;border:1px solid rgba(201,214,255,.25);background:rgba(255,255,255,.04);color:#fff;border-radius:999px;padding:12px 10px;font:800 12px Inter,system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;white-space:nowrap}' +
    '#asc .row button.go{background:linear-gradient(135deg,#2e7cf6,#9333ea);border-color:transparent}' +
    '#asc .row button[disabled]{opacity:.55;cursor:wait}' +
    '#asc .x{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(201,214,255,.2);background:transparent;color:#c9d6ff;font-size:15px;cursor:pointer}' +
    '#asc .m{min-height:18px;margin-top:10px;font-size:12.5px;color:#a3abc8;word-break:break-all}';

  var root, cv, msg, cur = null, link = null, logged = {};
  function build() {
    if (root) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'asc';
    root.innerHTML = '<div class="bx" role="dialog" aria-modal="true" aria-label="Share your score">' +
      '<button class="x" type="button" data-asc="close" aria-label="Close">\u2715</button>' +
      '<div class="k">Share your score</div><canvas width="1080" height="1350" aria-label="Score card"></canvas>' +
      '<div class="row"><button class="go" type="button" data-asc="share">Share</button><button type="button" data-asc="save">Save image</button><button type="button" data-asc="copy">Copy link</button></div>' +
      '<div class="m" role="status"></div></div>';
    document.body.appendChild(root);
    cv = root.querySelector('canvas'); msg = root.querySelector('.m');
    root.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-asc]') : null;
      if (e.target === root || (a && a.getAttribute('data-asc') === 'close')) return close();
      if (!a) return;
      var k = a.getAttribute('data-asc');
      if (k === 'share') doShare(a); else if (k === 'save') doSave(); else if (k === 'copy') doCopy();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('show')) close(); });
  }
  function close() { root.classList.remove('show'); }

  function img(src) {
    return new Promise(function (res) {
      if (!src) return res(null);
      var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src;
    });
  }
  function fit(ctx, text, max, size, weight, family) {
    var s = size;
    do { ctx.font = weight + ' ' + s + 'px ' + family; s -= 2; } while (ctx.measureText(text).width > max && s > 20);
    return s + 2;
  }
  function wrap(ctx, text, max) {
    var words = String(text).split(' '), lines = [], line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }
  async function draw(o) {
    var c = cv.getContext('2d'), W = 1080, H = 1350, ac = o.accent || '#5ee0ff';
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
    c.fillStyle = '#02030d'; c.fillRect(0, 0, W, H);
    var src = ART[o.game] || (SHOTS[o.game] ? '/shots/og-' + o.game + '.jpg' : '');
    var pic = await img(src);
    var top = 760;
    if (pic) {
      var r = Math.max(W / pic.width, top / pic.height), w = pic.width * r, h = pic.height * r;
      c.drawImage(pic, (W - w) / 2, (top - h) / 2, w, h);
    } else {
      var g0 = c.createLinearGradient(0, 0, W, top); g0.addColorStop(0, ac); g0.addColorStop(1, '#1b1450');
      c.fillStyle = g0; c.fillRect(0, 0, W, top);
    }
    var g = c.createLinearGradient(0, top - 380, 0, top); g.addColorStop(0, 'rgba(2,3,13,0)'); g.addColorStop(1, 'rgba(2,3,13,1)');
    c.fillStyle = g; c.fillRect(0, top - 380, W, 381);
    c.fillStyle = ac; c.fillRect(0, 0, W, 10);
    // header
    c.font = '800 30px Michroma, Inter, system-ui, sans-serif'; var w1 = c.measureText('CONTENTPAD').width;
    c.font = '700 22px Menlo, Consolas, monospace'; var w2 = c.measureText('ARCADE').width;
    c.fillStyle = 'rgba(2,3,13,.62)'; c.fillRect(48, 48, w1 + w2 + 62, 64);
    c.textBaseline = 'middle';
    c.fillStyle = '#fff'; c.font = '800 30px Michroma, Inter, system-ui, sans-serif'; c.fillText('CONTENTPAD', 70, 81);
    c.fillStyle = ac; c.font = '700 22px Menlo, Consolas, monospace'; c.fillText('ARCADE', 70 + w1 + 14, 82);
    c.textBaseline = 'alphabetic';
    // title
    c.fillStyle = '#ffffff'; c.font = '900 64px Inter, system-ui, sans-serif';
    var lines = wrap(c, o.title, W - 120), y = top + 40;
    lines.forEach(function (l) { c.fillText(l, 60, y); y += 72; });
    // label + score
    y += 34;
    c.fillStyle = ac; c.font = '700 30px Menlo, Consolas, monospace'; c.fillText(String(o.label || 'Score').toUpperCase(), 60, y);
    y += 20;
    var sc = (o.prefix || '') + Number(o.score).toLocaleString('en-US');
    var fs = fit(c, sc, W - 120, 190, '900', 'Inter, system-ui, sans-serif');
    var base = y + fs * 0.78;
    c.fillStyle = '#ffffff'; c.font = '900 ' + fs + 'px Inter, system-ui, sans-serif'; c.fillText(sc, 56, base);
    y = base + 86;
    c.fillStyle = '#c9cfe8'; c.font = '700 40px Inter, system-ui, sans-serif';
    c.fillText(o.name ? o.name + ' \u00b7 can you beat it?' : 'Can you beat it?', 60, Math.min(y, H - 130));
    // footer
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(60, H - 96, W - 120, 2);
    c.fillStyle = '#a3abc8'; c.font = '700 30px Menlo, Consolas, monospace'; c.fillText('arcade.contentpad.io', 60, H - 46);
    c.fillStyle = ac; c.textAlign = 'right'; c.fillText('FREE \u00b7 PLAY NOW', W - 60, H - 46); c.textAlign = 'left';
  }
  function blob() { return new Promise(function (res) { try { cv.toBlob(function (b) { res(b); }, 'image/png'); } catch (e) { res(null); } }); }
  async function getLink() {
    if (link) return link;
    try {
      var r = await fetch(API + '/arcade/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: cur.game, score: cur.score, name: cur.name || '' }) });
      var j = await r.json().catch(function () { return {}; });
      if (r.ok && j.ok && j.url) link = j.url;
    } catch (e) {}
    if (!link) link = location.origin + '/play.html?g=' + cur.game + '&utm_source=share&utm_medium=scorecard&utm_campaign=score_' + cur.game;
    if (!logged[cur.game + ':' + cur.score]) { logged[cur.game + ':' + cur.score] = 1; try { if (window.ArcadeTrack) window.ArcadeTrack.send('share:' + cur.game); } catch (e) {} }
    return link;
  }
  function text() { return (cur.name ? cur.name + ' \u2014 ' : '') + (cur.label || 'Score') + ': ' + (cur.prefix || '') + Number(cur.score).toLocaleString('en-US') + ' in ' + cur.title + '. Can you beat it?'; }
  async function doShare(btn) {
    btn.disabled = true; msg.textContent = '';
    try {
      var u = await getLink(), b = await blob();
      var f = b ? new File([b], cur.game + '-score.png', { type: 'image/png' }) : null;
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: cur.title, text: text() + ' ' + u });
      else if (navigator.share) await navigator.share({ title: cur.title, text: text(), url: u });
      else { await copy(u); msg.textContent = 'Link copied. Paste it anywhere, and save the image to post it too.'; }
    } catch (e) { if (!(e && e.name === 'AbortError')) msg.textContent = 'Could not open sharing here. Use Save image or Copy link.'; }
    btn.disabled = false;
  }
  async function doSave() {
    var b = await blob();
    if (!b) { msg.textContent = 'This browser could not make the picture.'; return; }
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = cur.game + '-score.png';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    getLink();
    msg.textContent = 'Saved. Post it with your link so friends land on the game.';
  }
  function copy(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {} ta.remove(); return Promise.resolve();
  }
  async function doCopy() { var u = await getLink(); try { await copy(text() + ' ' + u); msg.textContent = 'Copied: ' + u; } catch (e) { msg.textContent = u; } }

  window.ArcadeShare = {
    open: function (o) {
      build();
      var same = cur && cur.game === o.game && cur.score === o.score && cur.name === o.name;
      cur = o; if (!same) link = null;
      msg.textContent = '';
      root.classList.add('show');
      draw(o);
    }
  };
})();
