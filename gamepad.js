/* ContentPad Arcade — one controller reader for every game (v1, 4 Oct 2026).
   Browsers report controllers in two ways:
   · mapping "standard" — Xbox, PlayStation, Switch Pro, and 8BitDo in X-input or Switch mode.
     Buttons by POSITION: 0 bottom, 1 right, 2 left, 3 top, 4 LB, 5 RB, 6 LT, 7 RT, 8 select, 9 start, 12–15 d-pad.
   · mapping "" — raw DirectInput, e.g. 8BitDo in D-input / Android mode on a Mac. The d-pad arrives as a
     "hat" axis and the face buttons are numbered differently. We translate those to the same positions.
   ArcadePad.read(gp) → { up, down, left, right, a (bottom), b (right), x (left), y (top), lb, rb, lt, rt,
                          select, start, any, lx, ly }
   ArcadePad.pads()   → connected controllers, phantom entries dropped, first-used first.
   A small "Controller connected" toast shows when one is plugged in or wakes up. */
(function () {
  'use strict';
  if (window.ArcadePad) return;
  var DEAD = 0.5;
  // 8BitDo (vendor 2dc8) and Nintendo-layout pads in DirectInput: B bottom, A right, Y left, X top
  var DINPUT_8BITDO = { a: 0, b: 1, x: 4, y: 3, lb: 6, rb: 7, lt: 8, rt: 9, select: 10, start: 11 };
  // other DirectInput pads (Logitech / generic): 1 bottom, 2 right, 0 left, 3 top
  var DINPUT_GENERIC = { a: 1, b: 2, x: 0, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9 };
  var STANDARD = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, select: 8, start: 9 };

  function btn(gp, i) { var b = gp.buttons[i]; return !!(b && (b.pressed || b.value > 0.5)); }
  function hat(gp) {
    // Chrome/Firefox put a DirectInput d-pad on axis 9; neutral reads ~1.29, the eight directions spread over -1…1
    var v = gp.axes[9];
    if (v == null || Math.abs(v) > 1.05) return null;
    var d = Math.round((v + 1) * 3.5) % 8;           // 0 up, 1 up-right, 2 right … 7 up-left
    return { up: d === 7 || d === 0 || d === 1, right: d >= 1 && d <= 3, down: d >= 3 && d <= 5, left: d >= 5 && d <= 7 };
  }
  function read(gp) {
    if (!gp) return null;
    var std = gp.mapping === 'standard';
    var map = std ? STANDARD : (/8bitdo|2dc8|057e|pro controller|nintendo|switch/i.test(gp.id) ? DINPUT_8BITDO : DINPUT_GENERIC);
    var lx = gp.axes[0] || 0, ly = gp.axes[1] || 0;
    var o = { lx: lx, ly: ly };
    for (var k in map) o[k] = btn(gp, map[k]);
    var h = std ? { up: btn(gp, 12), down: btn(gp, 13), left: btn(gp, 14), right: btn(gp, 15) } : (hat(gp) || {});
    o.up = !!h.up || ly < -DEAD; o.down = !!h.down || ly > DEAD; o.left = !!h.left || lx < -DEAD; o.right = !!h.right || lx > DEAD;
    o.any = gp.buttons.some(function (b) { return b && (b.pressed || b.value > 0.5); });
    return o;
  }
  var order = [];   // pad indexes in the order they were first used
  function pads() {
    var list = navigator.getGamepads ? navigator.getGamepads() : [], out = [];
    for (var i = 0; i < list.length; i++) {
      var gp = list[i];
      if (!gp || gp.connected === false || !gp.buttons || gp.buttons.length < 4) continue;   // phantom / motion-only entries
      if (order.indexOf(gp.index) === -1 && gp.buttons.some(function (b) { return b && b.pressed; })) order.push(gp.index);
      out.push(gp);
    }
    out.sort(function (a, b) { var ia = order.indexOf(a.index), ib = order.indexOf(b.index); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.index - b.index; });
    return out;
  }
  function first() { var p = pads(); return p[0] || null; }

  // a quiet toast so players know the controller was seen
  function toast(msg) {
    try {
      var t = document.createElement('div');
      t.textContent = msg; t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));transform:translate(-50%,-8px);z-index:2147483000;padding:9px 16px;border-radius:999px;background:rgba(10,8,14,.88);color:#fff;font:600 13px/1.2 Inter,system-ui,sans-serif;letter-spacing:.02em;border:1px solid rgba(255,255,255,.22);box-shadow:0 8px 30px rgba(0,0,0,.45);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none';
      (document.body || document.documentElement).appendChild(t);
      requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
      setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2600);
    } catch (e) {}
  }
  function nameOf(gp) {
    var id = gp.id || '';
    if (/8bitdo|2dc8/i.test(id)) return '8BitDo controller';
    if (/xbox|xinput|045e/i.test(id)) return 'Xbox controller';
    if (/dualsense|dualshock|054c|wireless controller/i.test(id)) return 'PlayStation controller';
    if (/pro controller|057e|joy-con/i.test(id)) return 'Switch controller';
    return 'Controller';
  }
  // inside an embedded game, the parent page already announced it
  var embedded = false; try { embedded = window.top !== window; } catch (e) { embedded = true; }
  window.addEventListener('gamepadconnected', function (e) { if (!embedded && e.gamepad && e.gamepad.buttons.length >= 4) toast('🎮 ' + nameOf(e.gamepad) + ' connected'); });

  window.ArcadePad = { read: read, pads: pads, first: first, name: nameOf, toast: toast };
})();
