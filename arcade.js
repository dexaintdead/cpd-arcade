/* ContentPad Arcade — shared chrome: system clock, light dust, boot screen, menu blips. */
(function () {
  'use strict';
  var clock = document.getElementById('clock');
  function tick() { if (!clock) return; var d = new Date(); clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0'); }
  tick(); setInterval(tick, 1000);

  /* drifting light dust */
  var c = document.getElementById('dust');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (c && !reduce) {
    var x = c.getContext('2d'), P = [], W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 70; i++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, s: Math.random() * 0.012 + 0.003, a: Math.random() * Math.PI * 2 });
    (function loop(t) {
      x.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y -= p.s * 0.06; if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        var tw = 0.45 + 0.55 * Math.sin(t / 900 + p.a);
        x.beginPath(); x.arc(p.x * W + Math.sin(t / 3000 + p.a) * 12, p.y * H, p.r, 0, 6.283);
        x.fillStyle = 'rgba(150,190,255,' + (0.25 + tw * 0.5) + ')'; x.shadowColor = '#5b8cff'; x.shadowBlur = 8; x.fill();
      });
      requestAnimationFrame(loop);
    })(0);
  }

  /* boot screen: once per browser session */
  var boot = document.getElementById('boot');
  if (boot) {
    var seen = false; try { seen = sessionStorage.getItem('arcade_boot') === '1'; } catch (e) {}
    if (seen || reduce) boot.remove();
    else {
      var done = function () { boot.classList.add('out'); try { sessionStorage.setItem('arcade_boot', '1'); } catch (e) {} setTimeout(function () { boot.remove(); }, 800); };
      boot.addEventListener('click', done); addEventListener('keydown', function k() { removeEventListener('keydown', k); done(); });
      setTimeout(done, 2800);
    }
  }

  /* soft menu blips (only after the visitor has interacted) */
  var ac = null;
  window.arcadeBlip = function (f) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(f || 880, t); o.frequency.exponentialRampToValueAtTime((f || 880) * 1.5, t + 0.08);
      g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.2);
    } catch (e) {}
  };
})();
