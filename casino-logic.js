/* Dex Ain't Dead Casino — the rules, kept pure so they can be tested on their own.
   Every function takes its random source as an argument; the game passes a crypto-backed one. */
(function (root) {
  'use strict';
  var C = {};

  // ── cards ──
  C.SUITS = ['S', 'H', 'D', 'C'];
  C.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  C.shoe = function (decks, rnd) {
    var s = [];
    for (var d = 0; d < decks; d++) C.SUITS.forEach(function (su) { C.RANKS.forEach(function (r) { s.push({ r: r, s: su }); }); });
    for (var i = s.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = s[i]; s[i] = s[j]; s[j] = t; }
    return s;
  };

  // ── blackjack ──
  C.bjValue = function (cards) {
    var t = 0, aces = 0;
    cards.forEach(function (c) { if (c.r === 'A') { aces++; t += 11; } else if (c.r === 'K' || c.r === 'Q' || c.r === 'J') t += 10; else t += +c.r; });
    while (t > 21 && aces) { t -= 10; aces--; }
    return { total: t, soft: aces > 0 };
  };
  C.isBJ = function (cards) { return cards.length === 2 && C.bjValue(cards).total === 21; };
  C.bjRank = function (c) { return c.r === 'K' || c.r === 'Q' || c.r === 'J' ? '10' : c.r; };
  // dealer stands on all 17s
  C.dealerHits = function (cards) { return C.bjValue(cards).total < 17; };
  // what a finished player hand gets back (stake included), against the dealer's finished hand
  C.bjSettle = function (hand, dealer, bet, fromSplit) {
    var p = C.bjValue(hand).total, d = C.bjValue(dealer).total, pbj = !fromSplit && C.isBJ(hand), dbj = C.isBJ(dealer);
    if (p > 21) return { out: 0, res: 'bust' };
    if (pbj && dbj) return { out: bet, res: 'push' };
    if (pbj) return { out: bet + bet * 1.5, res: 'blackjack' };
    if (dbj) return { out: 0, res: 'lose' };
    if (d > 21) return { out: bet * 2, res: 'win' };
    if (p > d) return { out: bet * 2, res: 'win' };
    if (p === d) return { out: bet, res: 'push' };
    return { out: 0, res: 'lose' };
  };

  // ── baccarat ──
  C.bacPoint = function (c) { return c.r === 'A' ? 1 : (c.r === '10' || c.r === 'J' || c.r === 'Q' || c.r === 'K') ? 0 : +c.r; };
  C.bacTotal = function (cards) { return cards.reduce(function (t, c) { return t + C.bacPoint(c); }, 0) % 10; };
  // deal a full coup from a draw function; returns the hands and the winner
  C.bacCoup = function (draw) {
    var P = [draw(), ], B = [draw()]; P.push(draw()); B.push(draw());
    var pt = C.bacTotal(P), bt = C.bacTotal(B), p3 = null;
    if (pt < 8 && bt < 8) {
      if (pt <= 5) { p3 = draw(); P.push(p3); }
      bt = C.bacTotal(B);
      var bDraws;
      if (!p3) bDraws = bt <= 5;
      else {
        var v = C.bacPoint(p3);
        bDraws = bt <= 2 || (bt === 3 && v !== 8) || (bt === 4 && v >= 2 && v <= 7) || (bt === 5 && v >= 4 && v <= 7) || (bt === 6 && (v === 6 || v === 7));
      }
      if (bDraws) B.push(draw());
    }
    pt = C.bacTotal(P); bt = C.bacTotal(B);
    return { P: P, B: B, pt: pt, bt: bt, win: pt > bt ? 'player' : bt > pt ? 'banker' : 'tie', natural: (P.length === 2 && B.length === 2) && (pt >= 8 || bt >= 8) };
  };
  // stake back + winnings for each spot
  C.bacSettle = function (win, bets) {
    var out = { player: 0, banker: 0, tie: 0 };
    if (win === 'player') out.player = bets.player * 2;
    if (win === 'banker') out.banker = bets.banker * 1.95;
    if (win === 'tie') { out.tie = bets.tie * 9; out.player = bets.player; out.banker = bets.banker; }
    return out;
  };

  // ── roulette (European, single zero) ──
  C.WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  C.REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  C.colorOf = function (n) { return n === 0 ? 'green' : C.REDS.indexOf(n) !== -1 ? 'red' : 'black'; };
  // does bet id win on number n, and at what odds (x:1)
  C.rouBet = function (id, n) {
    var m;
    if ((m = /^n(\d+)$/.exec(id))) return +m[1] === n ? 35 : -1;
    if (n === 0) return -1;
    switch (id) {
      case 'red': return C.colorOf(n) === 'red' ? 1 : -1;
      case 'black': return C.colorOf(n) === 'black' ? 1 : -1;
      case 'odd': return n % 2 ? 1 : -1;
      case 'even': return n % 2 ? -1 : 1;
      case 'low': return n <= 18 ? 1 : -1;
      case 'high': return n >= 19 ? 1 : -1;
      case 'd1': return n <= 12 ? 2 : -1;
      case 'd2': return n >= 13 && n <= 24 ? 2 : -1;
      case 'd3': return n >= 25 ? 2 : -1;
      case 'c1': return n % 3 === 1 ? 2 : -1;
      case 'c2': return n % 3 === 2 ? 2 : -1;
      case 'c3': return n % 3 === 0 ? 2 : -1;
    }
    return -1;
  };

  // ── craps ──
  C.TRUE_ODDS = { 4: 2, 10: 2, 5: 1.5, 9: 1.5, 6: 1.2, 8: 1.2 };
  // resolve one roll. state: {point}. bets: {pass, dont, odds, field, any7, anycraps}. returns new point, payouts (stake incl.) and what stays on the table
  C.crapsRoll = function (point, bets, d1, d2) {
    var t = d1 + d2, pay = {}, keep = {}, msg = '', np = point;
    function win(k, x) { pay[k] = bets[k] + bets[k] * x; }
    function push(k) { pay[k] = bets[k]; }
    // one-roll bets
    if (bets.field) { if (t === 2 || t === 12) win('field', 2); else if ([3, 4, 9, 10, 11].indexOf(t) !== -1) win('field', 1); }
    if (bets.any7 && t === 7) win('any7', 4);
    if (bets.anycraps && (t === 2 || t === 3 || t === 12)) win('anycraps', 7);
    if (!point) {
      if (t === 7 || t === 11) { if (bets.pass) win('pass', 1); msg = t === 7 ? 'seven' : 'yo11'; }
      else if (t === 2 || t === 3 || t === 12) { if (bets.dont) { if (t === 12) push('dont'); else win('dont', 1); } msg = 'craps'; }
      else { np = t; keep.pass = bets.pass; keep.dont = bets.dont; msg = 'point'; }
    } else {
      if (t === point) { if (bets.pass) win('pass', 1); if (bets.odds) win('odds', C.TRUE_ODDS[point]); np = 0; msg = 'pointmade'; }
      else if (t === 7) { if (bets.dont) win('dont', 1); np = 0; msg = 'sevenout'; }
      else { keep.pass = bets.pass; keep.dont = bets.dont; keep.odds = bets.odds; msg = ''; }
    }
    Object.keys(pay).forEach(function (k) { if (!pay[k]) delete pay[k]; });
    Object.keys(keep).forEach(function (k) { if (!keep[k]) delete keep[k]; });
    return { total: t, point: np, pay: pay, keep: keep, msg: msg };
  };

  // ── slots: 5 reels × 3 rows, 10 lines. return to player ≈ 96 %, about 30 % of spins win something, free spins ≈ 1 in 87 (simulated, logic.test.js) ──
  C.SLOT_PAY = { W: [0, 0, 75, 300, 1000], MIC: [0, 0, 40, 150, 500], CHAIN: [0, 0, 30, 100, 300], SHADES: [0, 0, 25, 80, 250], BUBBLY: [0, 0, 20, 60, 200], CHIPS: [0, 0, 15, 40, 125], DICE: [0, 0, 12, 35, 100], A: [0, 0, 10, 25, 60], K: [0, 0, 8, 20, 50], Q: [0, 0, 7, 16, 40], J: [0, 0, 6, 12, 35] };   // index = symbols on the line − 1
  C.SLOT_WEIGHTS = { W: 4, V: 4, MIC: 2, CHAIN: 2, SHADES: 3, BUBBLY: 3, CHIPS: 4, DICE: 4, A: 6, K: 7, Q: 8, J: 9 };
  C.SLOT_LINES = [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 1, 0, 1, 0]];
  C.FREE_SPINS = 10; C.SCATTER_PAY = 3; C.FREE_MULT = 2;
  C.buildStrips = function () { C.STRIPS = [0, 1, 2, 3, 4].map(function (r) {   // the vinyl scatter lives on reels 1, 3 and 5 only
    var s = []; Object.keys(C.SLOT_WEIGHTS).forEach(function (k) { var n = k === 'V' ? (r % 2 === 0 ? C.SLOT_WEIGHTS.V : 0) : C.SLOT_WEIGHTS[k]; for (var i = 0; i < n; i++) s.push(k); });
    // spread the symbols so the strip reads well as it spins
    var out = [], bins = {}; s.forEach(function (k) { (bins[k] = bins[k] || []).push(k); });
    var keys = Object.keys(bins); while (out.length < s.length) keys.forEach(function (k) { if (bins[k].length) out.push(bins[k].pop()); });
    return out;
  }); };
  C.buildStrips();
  C.slotSpin = function (rnd) { return C.STRIPS.map(function (S) { var p = Math.floor(rnd() * S.length); return { stop: p, rows: [0, 1, 2].map(function (i) { return S[(p + i) % S.length]; }) }; }); };
  // grid[reel][row]; returns line wins (in line-bet units) and scatter count
  C.slotEval = function (grid) {
    var wins = [];
    C.SLOT_LINES.forEach(function (L, li) {
      var s = L.map(function (row, r) { return grid[r][row]; }), base = null, n = 0, wn = 0, i;
      for (i = 0; i < 5; i++) { var x = s[i]; if (x === 'V') break; if (x === 'W') { n++; continue; } if (!base) { base = x; n++; continue; } if (x === base) n++; else break; }
      for (i = 0; i < 5 && s[i] === 'W'; i++) wn++;
      var a = base && n ? (C.SLOT_PAY[base][n - 1] || 0) : 0, b = wn ? (C.SLOT_PAY.W[wn - 1] || 0) : 0;
      if (a || b) wins.push(a >= b ? { line: li, sym: base, n: n, x: a } : { line: li, sym: 'W', n: wn, x: b });
    });
    var sc = 0; grid.forEach(function (col) { col.forEach(function (x) { if (x === 'V') sc++; }); });
    return { wins: wins, x: wins.reduce(function (t, w) { return t + w.x; }, 0), scatters: sc };
  };

  root.CasinoLogic = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
