/* The record page: ledger, single-rail timeline, paper book and raw feed, all from sample.js. */
(function () {
  var D = window.SAMPLE, $ = function (s) { return document.getElementById(s); };
  function el(t, cls, txt) { var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var END = D.week.end;
  var key = function (e) { return e.ts.length === 10 ? e.ts + 'T12:00:00Z' : e.ts; };
  var EV = D.events.filter(function (e) { return key(e) <= END; });
  var ROWS = D.rows.filter(function (r) { return r.committed_at <= END; });
  var rowOf = function (id) { return ROWS.filter(function (r) { return r.id === id; })[0]; };
  function etDate(ts) { // calendar date in New York for a UTC timestamp
    if (ts.length === 10) return ts;
    var t = new Date(ts), y = t.getUTCFullYear(), dstStart = Date.UTC(2026, 2, 8, 7), dstEnd = Date.UTC(2026, 10, 1, 6);
    var off = (y === 2026 && t >= dstStart && t < dstEnd) ? 4 : 5;
    return new Date(t - off * 3600000).toISOString().slice(0, 10);
  }
  var status = function (r) { return r.outcome ? 'Closed · ' + r.outcome : 'Open'; };
  var long = function (iso) { return PX.fmtDate(iso) + ', ' + iso.slice(0, 4); };

  // progress
  function progress(on) {
    var closed = on ? ROWS.filter(function (r) { return r.outcome; }) : [];
    $('n-closed').textContent = closed.length;
    $('n-month').textContent = 'Month ' + (on ? D.monthsElapsed : 0) + ' of 6.';
    $('meter').style.width = closed.length + '%';
    $('n-win').textContent = closed.filter(function (r) { return r.outcome === 'win'; }).length;
    $('n-loss').textContent = closed.filter(function (r) { return r.outcome === 'loss'; }).length;
    $('n-open').textContent = on ? ROWS.length - closed.length : 0;
    $('n-tray').textContent = on ? EV.filter(function (e) { return e.type === 'chain.dropped'; }).length : 0;
  }

  // ticks: 56 days ending on the sample Sunday
  function ticks(on) {
    var box = $('ticks'), days = [], pub = {}, ran = {}, n = 0;
    box.textContent = '';
    for (var k = 55; k >= 0; k--) days.push(D.add(D.week.sunday, -k));
    if (on) EV.forEach(function (e) { var d = etDate(e.ts); if (e.type === 'row.published' || e.type === 'row.closed') pub[d] = 1; else ran[d] = 1; });
    days.forEach(function (d) { var i = el('i'); if (pub[d]) { i.className = 'p'; n++; } else if (ran[d]) i.className = 'a'; box.appendChild(i); });
    $('t0').textContent = on ? PX.fmtDate(days[0]) : '8 weeks ago';
    $('t1').textContent = on ? PX.fmtDate(days[55]) : 'Today';
    box.setAttribute('aria-label', on ? 'Per-day activity from ' + PX.fmtDate(days[0]) + ' to ' + PX.fmtDate(days[55]) + '. ' + n + ' days with a call published or closed; ' + Object.keys(ran).filter(function (d) { return d >= days[0] && !pub[d]; }).length + ' days the desk ran without publishing.' : 'Per-day activity for the last 8 weeks. Nothing recorded yet.');
  }

  // ledger
  function ledger(on) {
    var tb = $('tb'); tb.textContent = '';
    if (!on || !ROWS.length) {
      var tr = el('tr'), td = el('td', 'empty', '0 calls. The first row appears only after Sidd stamps a committee decision. The model never publishes.');
      td.colSpan = 4; tr.appendChild(td); tb.appendChild(tr); return;
    }
    ROWS.slice().reverse().forEach(function (r) {
      var tr = el('tr'), th = el('th'), b = el('button', 'id', r.id), did = 'seal-' + r.id;
      th.scope = 'row'; b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', did);
      b.setAttribute('aria-label', r.id + ', show when it was sealed');
      th.appendChild(b); tr.appendChild(th);
      var call = el('td'); call.appendChild(el('b', '', r.ticker + ' ' + r.direction)); call.appendChild(el('span', 'sub', r.confidence_bucket + ' confidence')); tr.appendChild(call);
      var hz = el('td'); hz.appendChild(el('span', '', r.months + ' months')); hz.appendChild(el('span', 'sub', 'to ' + PX.fmtDate(r.horizon_end) + ', ' + r.horizon_end.slice(0, 4))); tr.appendChild(hz);
      tr.appendChild(el('td', 'res', status(r)));
      var dr = el('tr', 'sealed'), dc = el('td'); dr.id = did; dr.hidden = true; dc.colSpan = 4;
      dc.appendChild(el('h3', '', 'Sealed before the outcome'));
      var dl = el('dl');
      [['Approved', r.approved_at.replace('T', ' ').replace(':00Z', ' UTC') + ' (approval.stamped)'],
       ['Committed', r.committed_at.replace('T', ' ').replace(':00Z', ' UTC') + ' (row.published)'],
       ['Horizon end', r.horizon_end + ', ' + r.months + ' months'],
       ['Outcome', r.outcome ? 'Closed at horizon ' + r.closed_at.replace('T', ' ').replace(':00Z', ' UTC') + '. ' + (r.outcome === 'win' ? 'Win.' : 'Loss.') : 'Not known yet. It closes at the ' + PX.fmtDate(r.horizon_end) + ' close.'],
       ['Chain', r.chain.join(', ')],
       ['Commit', r.sha + ' (placeholder)']].forEach(function (p) { dl.appendChild(el('dt', '', p[0])); dl.appendChild(el('dd', '', p[1])); });
      dc.appendChild(dl);
      dc.appendChild(el('p', 'xs muted', 'On the real ledger this links to the commit and its timestamp proof. In this preview there is nothing to verify.'));
      dr.appendChild(dc);
      b.addEventListener('click', function () { var o = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', String(!o)); dr.hidden = o; });
      tb.appendChild(tr); tb.appendChild(dr);
    });
  }

  // timeline
  var FOLD = { 'anomaly.flagged': 1, 'row.scored': 1, 'thesis.checked': 1 };
  var STAGE = { note: 'the note', risk: 'the risk desk', committee: 'the committee', sidd: 'Sidd' };
  function text(e, n) {
    var r = e.ref && rowOf(e.ref);
    switch (e.type) {
      case 'anomaly.flagged': return n + (n > 1 ? ' anomalies' : ' anomaly') + ' flagged by threshold. Count only.';
      case 'row.scored': return 'Scorer ran ' + n + (n > 1 ? ' nights' : ' night') + '. Scores regenerate; rows never change.';
      case 'thesis.checked': return n + ' open ' + (n > 1 ? 'calls' : 'call') + ' re-checked against the thesis. Count only.';
      case 'note.drafted': return 'Analyst note on a flag, covering market-sentinel. No ticker.';
      case 'note.decided': return 'Sidd marked the week’s notes dig-in or skip. Not a stamp.';
      case 'memo.drafted': return 'Memo drafted from a script screen, covering value-scout.';
      case 'memo.forwarded': return 'A script handed the memo to the risk desk.';
      case 'risk.reviewed': return 'Pass, with a dissent attached.';
      case 'decision.made': return 'Committee decided to publish: ' + rowOf(e._row).months + ' months, ' + rowOf(e._row).confidence_bucket + ' confidence.';
      case 'approval.stamped': return 'Sidd stamped ' + r.id + '.';
      case 'row.published': return r.id + ' ' + r.ticker + ', ' + r.direction + ', ' + r.months + ' months, ' + r.confidence_bucket + ' confidence.';
      case 'chain.dropped': return 'A chain stopped at ' + (STAGE[e.stage] || e.stage) + '. Stage and date only. No ticker, now or later.';
      case 'row.closed': return r.id + ' ' + r.ticker + ' closed at its horizon. ' + (r.outcome === 'win' ? 'Win.' : 'Loss.');
      case 'digest.sent': return 'Weekly digest sent. Ticker-less events released in one batch.';
      case 'week.quiet': return 'Quiet week. Nothing reached the committee.';
      case 'agent.hired': return 'A role was hired.';
    }
    return '';
  }
  function tag(e) {
    var r = e.ref && rowOf(e.ref);
    if (e.type === 'row.published') return ['Call', 't-call'];
    if (e.type === 'approval.stamped') return ['Stamp', 't-stamp'];
    if (e.type === 'chain.dropped') return [e.stage === 'risk' ? 'Veto' : 'Declined', 't-drop'];
    if (e.type === 'row.closed') return r.outcome === 'win' ? ['Win', 't-win'] : ['Loss', 't-loss'];
    return null;
  }
  function timeline() {
    var box = $('weeks'); box.textContent = '';
    // tie each decision.made to its row through the row's chain
    ROWS.forEach(function (r) { EV.forEach(function (e) { if (r.chain.indexOf(e.id) >= 0) Object.defineProperty(e, '_row', { value: r.id, configurable: true }); }); });
    var weeks = {};
    EV.forEach(function (e) {
      var d = etDate(e.ts), dow = new Date(d + 'T12:00:00Z').getUTCDay(), sun = D.add(d, (7 - dow) % 7);
      (weeks[sun] = weeks[sun] || []).push(e);
    });
    Object.keys(weeks).sort().reverse().forEach(function (sun) {
      var li = el('li', 'wk'), h = el('h3', '', 'Week ending Sunday ' + long(sun)), ol = el('ol', 'rail');
      var list = weeks[sun].slice().reverse(), seen = {};
      list.forEach(function (e) {
        if (FOLD[e.type]) { if (seen[e.type]) { seen[e.type].n++; seen[e.type].first = e; return; } }
        var item = { e: e, n: 1, first: e }; if (FOLD[e.type]) seen[e.type] = item;
        item.li = el('li'); ol.appendChild(item.li); item.render = function () {
          var x = item.e, t = el('time'), body = el('div'), tg = tag(x), p = el('p', tg ? 'big' : '');
          t.setAttribute('datetime', x.ts);
          t.textContent = item.n > 1 ? PX.fmtDate(item.first.ts) + ' to ' + PX.fmtDate(x.ts) : PX.fmtDate(x.ts, true) + (x.ts.length === 10 ? ' · date only' : '');
          if (tg) p.appendChild(el('span', 'tag ' + tg[1], tg[0]));
          p.appendChild(el('code', '', x.type + (item.n > 1 ? ' ×' + item.n : '')));
          p.appendChild(document.createTextNode(text(x, item.n)));
          body.appendChild(p);
          body.appendChild(el('p', 'who', x.actor + (x.role && x.role !== x.actor ? ' as ' + x.role : '') + (x.stage ? ' · stage ' + x.stage : '') + ' · ' + (item.n > 1 ? item.n + ' events' : x.id) + ' · ' + x.sha));
          item.li.appendChild(t); item.li.appendChild(body);
        };
        item.li._item = item;
      });
      [].forEach.call(ol.children, function (c) { c._item.render(); });
      li.appendChild(h); li.appendChild(ol); box.appendChild(li);
    });
  }

  function book() {
    var tb = $('bk'), total = D.book.start; tb.textContent = '';
    ROWS.slice().reverse().forEach(function (r) {
      var tr = el('tr'), th = el('th', 'mono', r.id); th.scope = 'row'; tr.appendChild(th);
      tr.appendChild(el('td', '', r.direction === 'outperform' ? r.ticker + ' against SPY' : 'SPY against ' + r.ticker));
      tr.appendChild(el('td', 'n', '$10,000'));
      tr.appendChild(el('td', 'n', r.book == null ? 'not yet' : PX.money(r.book)));
      tr.appendChild(el('td', 'res', r.book == null ? 'Enters at the next close' : r.outcome ? 'Closed · ' + r.outcome : 'Open, marked'));
      if (r.book != null) total += r.book;
      tb.appendChild(tr);
    });
    $('bk-total').textContent = '$' + total.toLocaleString('en-US');
    var f = D.fills;
    $('fills').textContent = 'Broker paper fills: ' + f.mirrored + ' calls mirrored, ' + f.queued + ' queued for the next open, ' + f.notMirrored + ' underperform calls not mirrored. Paper P&L ' + PX.money(f.pl) + ' (sample).';
  }

  function feed() {
    $('jsonl').textContent = EV.filter(function (e) { return key(e) >= D.week.start; }).map(function (e) { return JSON.stringify(e); }).join('\n');
  }

  PX.onState(function (s) {
    var on = s === 'sample';
    progress(on); ticks(on); ledger(on);
    if (on) { timeline(); book(); feed(); }
  });
  PX.start();
})();
