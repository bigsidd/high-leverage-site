/* The homepage office: one pixel building, drawn in code from original sprites.
   Two kinds of motion, kept apart on purpose:
   - Set dressing (ambient): server lights, a monitor flicker, coffee steam, the sky turning to night,
     and one shared idle loop with staggered frames. It never stands for desk activity.
   - Replay: memo cards travel desk to desk, the stamp presses, a card drops in the No tray.
     Every replay effect maps to one events.v1 type, and the active room gets an ink frame.
   One Pause control stops both. Reduced motion stops both and turns the replay into a stepped list. */
(function () {
  var D = window.SAMPLE, P = window.PX, S = P.sprites;
  var $ = function (s) { return document.querySelector(s); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)'), WIDE = matchMedia('(min-width: 37.5rem)');
  var H = 64;

  function R(x, y, w, h, c, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + c + '"' + (extra || '') + '/>'; }
  function spr(name, x, y, cls, style) { var g = P.paths(S[name], x, y); return cls ? '<g class="' + cls + '"' + (style ? ' style="' + style + '"' : '') + '>' + g + '</g>' : g; }
  function recolor(name, from, to) { return S[name].map(function (r) { return r.split(from).join(to); }); }
  S.recept = recolor('analyst', 'b', 'y');
  S.sidd = ['...kkkk...', '..kkkkkk..', '.kkkkkkkk.', '.kffffffk.', '.kfkffkfk.', '.kffffffk.', '..kfkkfk..', '...kffk...', '.bbbffbbb.', 'bbbbffbbbb', 'bbbbffbbbb'];
  S.visitor = ['..kkkk..', '.kkkkkk.', '.kffffk.', '.kkffkk.', '.kffffk.', '..kffk..', '.mmmmmm.', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', 'f.mmmm.f', '.kkkkkk.', '.kk..kk.', '.kk..kk.', '.kk..kk.', '.kk..kk.', 'kkk..kkk'];
  S.miniDesk = ['kkkkkkkkkkkkkk', 'kppppppppppppk', 'kkkkkkkkkkkkkk', '.k..........k.', '.k..........k.'];
  S.miniChair = ['.kkkk.', 'kmmmmk', 'kmmmmk', 'kkkkkk'];
  S.miniMon = ['kkkkkk', 'kmmmmk', 'kmmmmk', 'kkkkkk', '..kk..'];
  S.mug = ['kkk.', 'kfkk', 'kfk.', 'kkk.'];
  S.memo = ['kkkkkk', 'kffffk', 'kfbbfk', 'kffffk', 'kkkkkk'];

  // Windows with a skyline. Night is a stepped overlay (opacity 0 or 1), never a gradient.
  function windows(x, y, w, h, seed) {
    var s = R(x - 1, y - 1, w + 2, h + 2, 'k') + R(x, y, w, h, 'sky') + R(x, y, w, h, 'skyn night amb');
    for (var bx = x, i = seed; bx < x + w; i++) {
      var bw = 3 + (i * 7) % 5, bh = 4 + (i * 13) % 12, ww = Math.min(bw, x + w - bx);
      s += R(bx, y + h - bh, ww, bh, 'city');
      for (var yy = y + h - bh + 1; yy < y + h - 1; yy += 2) for (var xx = bx + 1; xx < bx + ww - 1; xx += 2) if ((xx * 3 + yy * 5 + i) % 4 === 0) s += R(xx, yy, 1, 1, 'lit night amb');
      bx += bw + 1;
    }
    for (var mx = x + 12; mx < x + w; mx += 12) s += R(mx, y, 1, h, 'k');
    return s;
  }
  function shell(W, win, wall) { return R(0, 0, W, 2, 'k') + R(0, 2, W, 46, wall || 'wall') + R(0, 48, W, 16, 'flr') + R(0, 48, W, 1, 'p') + (win ? windows(win[0], win[1], win[2], win[3], win[4]) : ''); }
  function F(s) { return '<g transform="translate(0 5)">' + s + '</g>'; }
  function lamp(x) { return R(x, 2, 1, 6, 'k') + R(x - 3, 8, 7, 2, 'k') + R(x - 2, 10, 5, 1, 'y'); }
  var idleN = 0;
  function idle(name, x, y) { return spr(name, x, y, 'idle amb', 'animation-delay:-' + (idleN++ * 700) + 'ms'); }

  // Rooms. spots = where replay cards land, in room coordinates.
  var ROOMS = {
    machines: { w: 64, plate: 'Machine room', draw: function () {
      var s = shell(64, null, 'wall2') + R(4, 8, 56, 2, 'k') + R(6, 10, 1, 1, 'y') + R(30, 10, 1, 1, 'y') + R(56, 10, 1, 1, 'y');
      for (var i = 0; i < 4; i++) {
        var x = 4 + i * 15;
        s += '<g id="rack' + i + '" transform="translate(0 5)">' + R(x, 17, 12, 31, 'k') + R(x + 1, 18, 10, 29, 'm');
        for (var j = 0; j < 6; j++) s += R(x + 2, 20 + j * 4, 8, 2, 'k') + R(x + 8, 20 + j * 4, 1, 1, 'blink amb b', ' style="animation-delay:-' + ((i * 6 + j) * 370) + 'ms"');
        s += R(x - 1, 16, 14, 33, 'hl') + '</g>';
      }
      return s;
    }, spots: { rack0: [7, 17], rack1: [22, 17], rack2: [37, 17], rack3: [52, 17] } },
    lobby: { w: 64, plate: 'Lobby', draw: function () {
      return shell(64, [24, 8, 36, 20, 3]) + R(5, 12, 14, 10, 'k') + R(6, 13, 12, 8, 'b') + R(8, 15, 4, 4, 'y') + lamp(14) + F(
        idle('recept', 10, 30) + R(4, 40, 28, 8, 'o') + R(4, 40, 28, 1, 'k') +
        R(48, 33, 9, 15, 'k') + R(49, 34, 7, 6, 'm') + R(51, 41, 3, 3, 'f') + R(55, 35, 1, 1, 'y') +
        '<g class="idle amb" style="animation-delay:-1900ms">' + P.paths(S.visitor, 36, 30) + '</g>' +
        '<g class="sip amb">' + R(43, 39, 2, 2, 'f') + R(43, 38, 2, 1, 'k') + '</g>');
    }, spots: {} },
    analyst: { w: 56, plate: 'research-analyst', swap: true, draw: function () {
      return shell(56, [4, 8, 48, 20, 7]) + lamp(28) + F(idle('analyst', 18, 32) + spr('monitor', 30, 36) + spr('monitor', 7, 36) +
        '<g class="flick amb">' + R(31, 37, 6, 3, 'scr') + '</g>' + spr('desk', 5, 43) + spr('desk', 15, 43) + spr('mug', 25, 39) +
        '<g class="steam amb">' + R(26, 36, 1, 1, 'm') + R(27, 34, 1, 1, 'm') + '</g>');
    }, spots: { desk: [32, 43] } },
    risk: { w: 56, plate: 'risk-officer', draw: function () {
      return shell(56, [4, 8, 48, 20, 11]) + lamp(28) + F(idle('risk', 18, 32) + spr('paper', 30, 37) + spr('paper', 32, 35) + R(38, 33, 1, 10, 'k') + R(36, 32, 5, 2, 'y') + spr('desk', 15, 43));
    }, spots: { desk: [22, 43] } },
    hiring: { w: 96, plate: 'Open desks', draw: function () {
      var s = shell(96, [4, 8, 88, 20, 17]);
      for (var i = 0; i < 6; i++) {
        var x = 2 + i * 16, pm = i === 5;
        s += R(x + 6, 2, 1, 10, 'k') + R(x + 2, 12, 9, 5, 'k') + R(x + 3, 13, 7, 3, pm ? 'l' : 'y');
        var d = spr('miniChair', x + 4, 40) + (pm ? '' : spr('miniMon', x + 7, 39)) + spr('miniDesk', x, 44);
        if (pm) for (var t = 0; t < 14; t++) { d += R(x + t, 38 + Math.floor(t * 10 / 14), 1, 2, t % 4 < 2 ? 'l' : 'y') + R(x + t, 47 - Math.floor(t * 10 / 14), 1, 2, t % 4 < 2 ? 'l' : 'y'); }
        s += F(d);
      }
      return s;
    }, spots: {} },
    committee: { w: 96, plate: 'investment-committee', draw: function () {
      return shell(96, [4, 8, 26, 20, 23]) + windows(66, 8, 26, 20, 29) +
        R(36, 9, 24, 15, 'k') + R(37, 10, 22, 13, 'scr') + R(40, 18, 2, 4, 'b') + R(44, 15, 2, 7, 'b') + R(48, 17, 2, 5, 'b') + R(52, 13, 2, 9, 'b') +
        F(spr('chair', 22, 40) + spr('chair', 66, 40) + idle('committee', 43, 31) + spr('table', 36, 42)) +
        R(0, 2, 2, 46, 'g') + R(94, 2, 2, 46, 'g') + R(2, 2, 1, 46, 'gl') + R(93, 2, 1, 46, 'gl');
    }, spots: { table: [45, 43] } },
    sidd: { w: 112, plate: 'Sidd', draw: function () {
      return shell(112, [6, 5, 102, 28, 37]) + R(0, 2, 2, 46, 'g') + R(2, 2, 1, 46, 'gl') +
        R(20, 56, 60, 3, 'l') + F(spr('bigChair', 44, 31) + R(48, 38, 2, 4, 'k') +
        '<g id="siddp" class="gone">' + idle('sidd', 44, 31) + '</g>' +
        R(28, 42, 44, 2, 'k') + R(29, 44, 42, 4, 'o') + R(30, 48, 2, 4, 'k') + R(68, 48, 2, 4, 'k') +
        spr('tray', 30, 38) + '<g class="press">' + spr('stampHandle', 60, 35) + '</g>' + spr('stampBase', 60, 40) +
        R(80, 41, 14, 3, 'k') + R(81, 44, 12, 3, 'm') + R(79, 39, 2, 9, 'k') + R(93, 39, 2, 9, 'k') + R(80, 47, 1, 2, 'k') + R(93, 47, 1, 2, 'k') +
        spr('plant', 100, 41));
    }, spots: { desk: [52, 42], tray: [33, 41] } }
  };
  // Layouts: two floors on wider screens, a five-floor building on phones. Rows read top to bottom.
  var LAYOUTS = {
    wide: [['machines', 'committee', 'sidd'], ['lobby', 'analyst', 'risk', 'hiring']],
    tall: [['sidd', 'pad16'], ['committee', 'pad32'], ['analyst', 'risk', 'pad16'], ['hiring', 'pad32'], ['machines', 'lobby']]
  };
  ROOMS.pad16 = { w: 16, pad: true, draw: function () { return shell(16) + spr('plant', 5, 41); } };
  ROOMS.pad32 = { w: 32, pad: true, draw: function () { return shell(32, [4, 8, 24, 20, 41]) + spr('plant', 20, 41); } };

  var INFO = {
    machines: ['Machine room', 'Scripts, drawn as machines because they are not people. From left: the data pull (trading days, 17:30 ET), the scorer (22:00 ET), the Sunday digest, and publish, which commits a call only after the stamp.', 'committee.html#h-mach', 'What each machine does'],
    lobby: ['Lobby', 'Set dressing. The receptionist and the visitor are building people. They are not on the desk and they are not agents. The desk has three model seats, and you can count them upstairs.', 'desk.html', 'How the desk works'],
    analyst: ['Analyst desk', 'A model seat. Writes notes on flagged anomalies, the weekly memo and monthly thesis checks. While open roles stay unhired, its nameplate shows which one it is covering.', 'committee.html#h-seats', 'Meet the analyst'],
    risk: ['Risk desk', 'A model seat, independent of the analyst. Writes the dissent on every memo and can veto, which sends the chain to the No tray with no ticker, now or later.', 'committee.html#h-seats', 'Meet the risk officer'],
    hiring: ['Open desks', 'Five roles without a model seat yet: market-sentinel, value-scout, thesis-tracker, report-writer and macro-economist. Scripts and the analyst cover them today. Hire bar: two clean runs, 20 to 30 evals at 100%, and an ADR. The taped-off desk is portfolio-manager, banned on the public side.', 'committee.html#h-open', 'The bar to hire'],
    committee: ['Committee room', 'A model seat behind glass, at a table built for more. Decides publish or not, a 3, 6 or 12 month horizon, and a confidence bucket. It never sees a memo without the dissent.', 'committee.html#h-seats', 'Meet the committee'],
    sidd: ['Sidd’s office', 'The one human. One stamp per call, in the Sunday digest. Nothing publishes without it. The chair is empty except on Sundays. The tray on the desk is the No tray.', 'record.html', 'See every stamp and veto']
  };

  var wrap = $('#scene'), card = $('#card'), layout = null, boxes = {}, Wt = 0, Ht = 0;
  function build() {
    var key = WIDE.matches ? 'wide' : 'tall'; if (key === layout) return; layout = key;
    var rows = LAYOUTS[key], svg = '', y = 0; boxes = {}; idleN = 0;
    Wt = 0; rows.forEach(function (r) { var w = 0; r.forEach(function (n) { w += ROOMS[n].w; }); Wt = Math.max(Wt, w); });
    rows.forEach(function (r) {
      var x = 0;
      r.forEach(function (n) { var m = ROOMS[n]; svg += '<g transform="translate(' + x + ' ' + y + ')">' + m.draw() + '</g>'; if (!m.pad) boxes[n] = [x, y, m.w, H]; x += m.w; });
      y += H;
    });
    Ht = y + 2; svg += R(0, y, Wt, 2, 'k');
    svg += '<g id="memo" class="card gone">' + P.paths(S.memo, 0, 0) + '<rect x="1" y="1" width="2" height="2" class="l slip gone"/><rect x="3" y="2" width="2" height="2" class="b inked gone"/></g>';
    svg += '<g id="drop" class="card gone">' + R(0, 0, 6, 5, 'k') + R(1, 1, 4, 3, 'm') + '</g>';
    wrap.querySelector('.art').innerHTML = '<svg class="px office" viewBox="0 0 ' + Wt + ' ' + Ht + '" aria-hidden="true" focusable="false">' + svg + '</svg>';
    var hot = wrap.querySelector('.hot'); wrap.appendChild(card); hot.textContent = '';
    Object.keys(INFO).forEach(function (n) {
      var b = boxes[n], btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'room'; btn.dataset.room = n;
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'card');
      btn.style.left = (b[0] / Wt * 100) + '%'; btn.style.top = (b[1] / Ht * 100) + '%';
      btn.style.width = (b[2] / Wt * 100) + '%'; btn.style.height = (b[3] / Ht * 100) + '%';
      var pl = document.createElement('span'); pl.className = 'plate'; pl.textContent = ROOMS[n].plate;
      var now = document.createElement('span'); now.className = 'nowtag'; now.hidden = true; now.textContent = 'Now';
      btn.appendChild(pl); btn.appendChild(now);
      btn.setAttribute('aria-label', INFO[n][0] + '. Show what happens here.');
      hot.appendChild(btn);
    });
    // DOM order follows the reading order of the drawing: rows top to bottom, left to right
    var order = []; rows.forEach(function (r) { r.forEach(function (n) { if (INFO[n]) order.push(n); }); });
    order.forEach(function (n) { hot.appendChild(hot.querySelector('[data-room="' + n + '"]')); });
    closeCard(false); paintState();
  }

  // Info cards: tap, click, Enter or Space pins one; hover and keyboard focus preview it. Esc closes.
  var openRoom = null, pinned = false, hoverT = 0;
  function openCard(n, pin) {
    var b = boxes[n], info = INFO[n]; openRoom = n; pinned = pin;
    var btn = wrap.querySelector('.room[data-room="' + n + '"]'); if (btn && btn.nextSibling !== card) btn.after(card); // card follows its room in tab order
    card.querySelector('h3').textContent = info[0];
    card.querySelector('p').textContent = info[1];
    var a = card.querySelector('a'); a.href = info[2]; a.textContent = info[3];
    card.hidden = false;
    // always below its room, so the card's link comes after the room in both tab order and reading order
    card.style.top = ((b[1] + b[3]) / Ht * 100) + '%'; card.style.bottom = 'auto';
    var cw = card.offsetWidth, ww = wrap.offsetWidth, left = b[0] / Wt * ww;
    card.style.left = Math.max(0, Math.min(left, ww - cw)) + 'px';
    wrap.querySelectorAll('.room').forEach(function (r) { r.setAttribute('aria-expanded', String(r.dataset.room === n)); });
  }
  function closeCard(refocus) {
    var was = openRoom; openRoom = null; pinned = false; card.hidden = true;
    wrap.querySelectorAll('.room').forEach(function (r) { r.setAttribute('aria-expanded', 'false'); });
    if (refocus && was) { var b = wrap.querySelector('[data-room="' + was + '"]'); if (b) b.focus(); }
  }
  wrap.addEventListener('click', function (e) {
    var b = e.target.closest('.room'); if (!b) return;
    if (openRoom === b.dataset.room && pinned) closeCard(false); else openCard(b.dataset.room, true);
  });
  wrap.addEventListener('focusin', function (e) { var b = e.target.closest('.room'); if (b && b.dataset.room !== openRoom) openCard(b.dataset.room, false); });
  wrap.addEventListener('focusout', function (e) { if (!pinned && !wrap.contains(e.relatedTarget)) closeCard(false); });
  wrap.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || pinned) return; var b = e.target.closest('.room');
    clearTimeout(hoverT); if (b) hoverT = setTimeout(function () { openCard(b.dataset.room, false); }, 250);
  });
  wrap.addEventListener('pointerleave', function () { clearTimeout(hoverT); if (!pinned && !wrap.contains(document.activeElement)) closeCard(false); });
  card.querySelector('.x').addEventListener('click', function () { closeCard(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openRoom) closeCard(true); });

  // ---------- replay ----------
  var W = D.week, k0 = function (e) { return e.ts.length === 10 ? e.ts + 'T12:00:00Z' : e.ts; };
  var inWeek = function (e) { return k0(e) >= W.start && k0(e) <= W.end; };
  var before = D.events.filter(function (e) { return k0(e) < W.start; });
  var count = function (t) { return before.filter(function (e) { return e.type === t; }).length; };
  var rowOf = function (id) { return D.rows.filter(function (r) { return r.id === id; })[0]; };
  var steps = [];
  D.events.filter(inWeek).forEach(function (e) {
    if (e.type === 'row.scored') return;
    var l = steps[steps.length - 1];
    if (l && l.type === e.type && e.type === 'anomaly.flagged' && l.ts.slice(0, 10) === e.ts.slice(0, 10)) { l.n++; return; }
    steps.push({ ts: e.ts, type: e.type, actor: e.actor, role: e.role, stage: e.stage, ref: e.ref, n: 1 });
  });
  // type -> [room lit, card action]
  var FX = {
    'anomaly.flagged': ['machines', 'rack0'], 'row.closed': ['machines', 'rack1'], 'digest.sent': ['sidd', 'rack2'],
    'note.drafted': ['analyst', 'note'], 'memo.drafted': ['analyst', 'memo@analyst.desk'], 'memo.forwarded': ['risk', 'memo@risk.desk'],
    'risk.reviewed': ['risk', 'slip'], 'decision.made': ['committee', 'memo@committee.table'], 'note.decided': ['sidd', ''],
    'approval.stamped': ['sidd', 'stamp'], 'row.published': ['machines', 'publish'], 'chain.dropped': ['sidd', 'drop'],
    'thesis.checked': ['analyst', ''], 'week.quiet': ['sidd', '']
  };
  var STAGE = { note: 'the note', risk: 'the risk desk (a veto)', committee: 'the committee (declined)', sidd: 'Sidd' };
  function say(s) {
    var r = s.ref && rowOf(s.ref);
    switch (s.type) {
      case 'anomaly.flagged': return 'The data machine flags ' + s.n + (s.n > 1 ? ' anomalies' : ' anomaly') + ' by threshold. Only the count is logged.';
      case 'note.drafted': return 'The analyst, covering market-sentinel, drafts a note on a flag. No ticker leaves the desk.';
      case 'memo.drafted': return 'The analyst, now covering value-scout, drafts the week’s memo.';
      case 'memo.forwarded': return 'A script carries the memo to the risk desk. No Sidd step here.';
      case 'risk.reviewed': return 'The risk officer passes it and pins a dissent to it.';
      case 'decision.made': return 'The memo and its dissent go to the committee room. Decision: publish.';
      case 'chain.dropped': return 'Another chain stopped at ' + (STAGE[s.stage] || s.stage) + '. It drops into the No tray. Stage and date only, no ticker, now or later.';
      case 'row.closed': return 'The scorer closes ' + r.id + ' ' + r.ticker + ' at its horizon: ' + r.outcome + ', at full size.';
      case 'digest.sent': return 'Sunday. The digest goes out and Sidd is in.';
      case 'note.decided': return 'Sidd marks the week’s notes dig-in or skip. That is a decision, not a stamp.';
      case 'approval.stamped': return 'Sidd stamps ' + r.id + '. The one stamp this call gets.';
      case 'row.published': return 'The publish machine commits ' + r.id + ': ' + r.ticker + ', ' + r.direction + ', ' + r.months + ' months, ' + r.confidence_bucket + ' confidence. ' + r.ticker + ' is public from this moment.';
      case 'thesis.checked': return 'Open calls re-checked against their thesis. Count only.';
      case 'week.quiet': return 'A quiet week. Nothing reached the committee.';
    }
    return '';
  }
  function when(s) {
    var d = new Date(k0(s)), day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
    return day + ' ' + P.fmtDate(s.ts, true) + (s.ts.length === 10 ? ' (date only)' : '');
  }

  var narr = $('#narr'), pp = $('#pp'), nx = $('#nx'), list = $('#steps');
  var mode = 'day0', i = -1, playing = false, tm = 0, motionOn = !RM.matches;
  var st = {}; // scene state, re-applied after a relayout
  function fresh() { st = { lit: null, act: null, memo: null, slip: false, inked: false, drop: false, sidd: false, plate: null, stamps: mode === 'sample' ? count('approval.stamped') : 0, tray: mode === 'sample' ? count('chain.dropped') : 0 }; }
  function place(id, spot) {
    var g = document.getElementById(id); if (!g) return;
    if (!spot) { g.classList.add('gone'); return; }
    var p = spot.split('@')[1] || spot, room = p.split('.')[0], s = ROOMS[room].spots[p.split('.')[1]], b = boxes[room];
    g.classList.remove('gone'); g.style.transform = 'translate(' + (b[0] + s[0]) + 'px,' + (b[1] + s[1]) + 'px)';
  }
  function paintState() {
    wrap.querySelectorAll('.room').forEach(function (b) {
      var on = b.dataset.room === st.lit; b.classList.toggle('on', on); b.querySelector('.nowtag').hidden = !on;
      if (ROOMS[b.dataset.room].swap) b.querySelector('.plate').textContent = st.plate || ROOMS[b.dataset.room].plate;
    });
    for (var r = 0; r < 4; r++) { var g = document.getElementById('rack' + r); if (g) g.classList.toggle('flash', st.act === 'rack' + r); }
    place('memo', st.memo); place('drop', st.drop ? 'sidd.tray' : null);
    var m = document.getElementById('memo');
    if (m) { m.querySelector('.slip').classList.toggle('gone', !st.slip); m.querySelector('.inked').classList.toggle('gone', !st.inked); }
    var sp = document.getElementById('siddp'); if (sp) sp.classList.toggle('gone', !st.sidd);
    $('#tally').textContent = mode === 'sample' ? 'Stamps so far: ' + st.stamps + '. In the No tray: ' + st.tray + '.' : 'Stamps so far: 0. In the No tray: 0.';
  }
  function kick(sel, c) { var e = wrap.querySelector(sel); if (!e) return; e.classList.remove(c); void e.getBBox(); e.classList.add(c); }
  function go(k) {
    i = k; var s = steps[k], fx = FX[s.type] || [null, ''], a = fx[1];
    st.lit = fx[0]; st.act = a; st.plate = fx[0] === 'analyst' ? s.role : null;
    if (s.type === 'digest.sent' || s.type === 'note.decided' || s.type === 'approval.stamped') st.sidd = true;
    if (a === 'note') { st.memo = 'analyst.desk'; st.slip = false; st.inked = false; }
    if (a.indexOf('memo@') === 0) { st.memo = a.slice(5); if (s.type === 'memo.drafted') { st.slip = false; st.inked = false; } }
    if (a === 'slip') st.slip = true;
    if (a === 'stamp') { st.memo = 'sidd.desk'; st.inked = true; st.stamps++; kick('.press', 'hit'); }
    if (a === 'publish') { st.memo = 'machines.rack3'; st.act = 'rack3'; }
    if (a === 'drop') { st.drop = true; st.tray++; kick('#drop', 'fall'); }
    if (s.type === 'thesis.checked' || s.type === 'row.closed' || s.type === 'anomaly.flagged') { if (st.memo === 'analyst.desk' && !st.slip) st.memo = null; }
    paintState();
    narr.textContent = '';
    var w = document.createElement('span'); w.className = 'when';
    w.textContent = 'Step ' + (k + 1) + ' of ' + steps.length + ' · ' + when(s) + ' · ' + s.type + '. ';
    narr.appendChild(w); narr.appendChild(document.createTextNode(say(s)));
    [].forEach.call(list.children, function (li, j) { if (j === k) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    ui();
  }
  steps.forEach(function (s) {
    var li = document.createElement('li'), c = document.createElement('code');
    c.textContent = s.type; li.appendChild(document.createTextNode(when(s) + ' · ')); li.appendChild(c);
    li.appendChild(document.createTextNode(' ' + say(s))); list.appendChild(li);
  });
  function dur() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-step')) || 1600; }
  function tick() {
    clearTimeout(tm); if (!playing) return;
    if (i >= steps.length - 1) { playing = false; ui(); return; }
    tm = setTimeout(function () { go(i + 1); tick(); }, i < 0 ? 0 : dur() * 1.6);
  }
  function ui() {
    var s = mode === 'sample', rm = RM.matches, end = i >= steps.length - 1;
    document.documentElement.classList.toggle('still', !motionOn || rm);
    pp.hidden = rm;
    pp.textContent = (motionOn && (playing || !s)) ? 'Pause' : 'Play';
    if (s && end && !playing) pp.textContent = 'Replay';
    pp.setAttribute('aria-label', pp.textContent === 'Pause' ? 'Pause all motion' : pp.textContent === 'Replay' ? 'Replay the sample week' : 'Play');
    nx.hidden = !s; nx.disabled = end;
    $('#rmnote').hidden = !rm;
    var det = $('#stepsbox'); det.hidden = !s;
  }
  function setMode(m, initial) {
    mode = m; clearTimeout(tm); playing = false; i = -1; fresh(); paintState();
    if (m === 'sample') {
      $('#stepsbox').open = RM.matches;
      if (RM.matches) go(0);
      else if (initial) narr.textContent = 'Sample week, ' + W.label + '. ' + steps.length + ' logged events. Press Play to replay them.';
      else { motionOn = true; playing = true; narr.textContent = 'Replaying the sample week, ' + W.label + '.'; tick(); }
    } else {
      narr.textContent = 'Day 0. The desk is idle: 0 calls published, 0 stamps, 0 in the No tray. The lights and the sky are set dressing. Choose Sample week to replay a labeled sample.';
    }
    ui();
  }
  pp.addEventListener('click', function () {
    if (mode === 'sample') {
      if (playing) { playing = false; motionOn = false; clearTimeout(tm); }
      else { if (i >= steps.length - 1) { fresh(); i = -1; } motionOn = true; playing = true; tick(); }
    } else motionOn = !motionOn;
    ui();
  });
  nx.addEventListener('click', function () { playing = false; clearTimeout(tm); if (i < steps.length - 1) go(i + 1); ui(); });
  RM.addEventListener && RM.addEventListener('change', function () { setMode(mode, true); });
  WIDE.addEventListener && WIDE.addEventListener('change', build);
  fresh();
  build();
  P.onState(setMode);
  P.start();
})();
