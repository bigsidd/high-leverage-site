/* Labeled sample data for the design preview. Not a ledger, never read from one.
   XMPL and SMPL are placeholder tickers. Event shape and types follow design/07 events.v1:
   {v, id, ts, type, actor, role, sha, stage?, ref?}. role is null for actions no roster role owns (stamp, publish, scorer, digest).
   chain.dropped carries a date only, role null, and stage = where the chain stopped. */
(function () {
  var DST_START = Date.UTC(2026, 2, 8), DST_END = Date.UTC(2026, 10, 1); // US DST 2026
  function utc(d, hh, mm) { // ET wall clock to ISO UTC
    var p = d.split('-').map(Number), t = Date.UTC(p[0], p[1] - 1, p[2]);
    var off = t >= DST_START && t < DST_END ? 4 : 5;
    return new Date(t + ((hh + off) * 60 + mm) * 60000).toISOString().replace('.000', '');
  }
  function add(d, n) { var t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }

  // One committee decision a week at most; one Sidd stamp per published call, on Sunday.
  var ROWS = [
    { id: 'POL-1', ticker: 'XMPL', direction: 'outperform', months: 3, horizon_end: '2026-10-05', confidence_bucket: 'medium', week: '2026-07-05', outcome: 'win', book: 640 },
    { id: 'POL-2', ticker: 'SMPL', direction: 'underperform', months: 3, horizon_end: '2026-10-19', confidence_bucket: 'low', week: '2026-07-19', outcome: 'loss', book: -410 },
    { id: 'POL-3', ticker: 'XMPL', direction: 'outperform', months: 3, horizon_end: '2026-11-02', confidence_bucket: 'medium', week: '2026-08-02', outcome: 'loss', book: -880 },
    { id: 'POL-4', ticker: 'SMPL', direction: 'outperform', months: 6, horizon_end: '2027-02-23', confidence_bucket: 'high', week: '2026-08-23', outcome: null, book: 120 },
    { id: 'POL-5', ticker: 'XMPL', direction: 'underperform', months: 12, horizon_end: '2027-09-27', confidence_bucket: 'low', week: '2026-09-27', outcome: null, book: -60 },
    { id: 'POL-6', ticker: 'SMPL', direction: 'outperform', months: 3, horizon_end: '2027-02-08', confidence_bucket: 'medium', week: '2026-11-08', outcome: null, book: null }
  ];
  // Week plan keyed by Sunday. drop = [stage, date the chain stopped].
  var PLAN = {
    '2026-07-12': ['risk', '2026-07-11'], '2026-08-09': ['committee', '2026-08-08'],
    '2026-08-30': ['risk', '2026-08-29'], '2026-09-13': ['risk', '2026-09-12'],
    '2026-10-04': ['committee', '2026-10-03'], '2026-10-18': ['risk', '2026-10-17'],
    '2026-11-08': ['risk', '2026-11-05']
  };
  var FIRST = '2026-07-05', LAST = '2026-11-08';

  var ev = [], seq = 0;
  function push(ts, type, actor, role, rel, ref, stage) {
    var e = { v: 1, id: '', ts: ts, type: type, actor: actor, role: role, sha: '' };
    if (stage) e.stage = stage;
    if (ref) e.ref = ref;
    Object.defineProperty(e, '_k', { value: [ts.length === 10 ? ts + 'T12:00:00Z' : ts, seq++, rel] });
    ev.push(e); return e;
  }
  var wi = 0;
  for (var S = FIRST; S <= LAST; S = add(S, 7), wi++) {
    var batch = 'sun:' + S, noted = false;
    for (var di = 0; di < 7; di++) {
      var d = add(S, di - 6), dow = di; // 0 Mon … 6 Sun
      if (d.slice(8) === '01') { // monthly thesis check, count only
        ROWS.forEach(function (r) { if (r.week < d && r.horizon_end >= d) push(utc(d, 10, 0), 'thesis.checked', 'research-analyst', 'thesis-tracker', batch); });
      }
      if (dow > 4) continue;
      var n = [2, 0, 1, 0, 1][(di + wi) % 5];
      for (var k = 0; k < n; k++) push(utc(d, 17, 30), 'anomaly.flagged', 'script', 'market-sentinel', batch);
      if (n && !noted) { noted = true; push(utc(d, 17, 41), 'note.drafted', 'research-analyst', 'market-sentinel', batch); }
      var night = 'score:' + d, any = false;
      ROWS.forEach(function (r) {
        if (r.week < d) any = true;
        if (r.horizon_end === d) { r.closed_at = utc(d, 22, 0); push(r.closed_at, 'row.closed', 'script', null, night, r.id); }
      });
      if (any) push(utc(d, 22, 0), 'row.scored', 'script', null, night);
    }
    var sat = add(S, -1), row = ROWS.filter(function (r) { return r.week === S; })[0], drop = PLAN[S];
    if (drop) push(drop[1], 'chain.dropped', 'script', null, batch, null, drop[0]);
    push(utc(S, 18, 0), 'digest.sent', 'script', null, batch);
    if (!row && !drop) push(utc(S, 18, 0), 'week.quiet', 'script', null, batch);
    if (noted) push(utc(S, 18, 8), 'note.decided', 'sidd', null, batch);
    if (row) {
      var rel = 'pub:' + row.id;
      row.chain = [
        push(utc(sat, 10, 4), 'memo.drafted', 'research-analyst', 'value-scout', rel),
        push(utc(sat, 10, 5), 'memo.forwarded', 'script', 'value-scout', rel),
        push(utc(sat, 10, 21), 'risk.reviewed', 'risk-officer', 'risk-officer', rel),
        push(utc(sat, 10, 40), 'decision.made', 'investment-committee', 'investment-committee', rel),
        push(utc(S, 18, 14), 'approval.stamped', 'sidd', null, rel, row.id),
        push(utc(S, 18, 15), 'row.published', 'script', null, rel, row.id)
      ];
      row.approved_at = row.chain[4].ts; row.committed_at = row.chain[5].ts;
    }
  }
  ev.sort(function (a, b) { return a._k[0] < b._k[0] ? -1 : a._k[0] > b._k[0] ? 1 : a._k[1] - b._k[1]; });
  var shas = {};
  function sha(key) { // deterministic placeholder commit hash, one per release batch
    if (!shas[key]) { var h = 2166136261; for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16; shas[key] = ('0000000' + (h >>> 0).toString(16)).slice(-7); }
    return shas[key];
  }
  ev.forEach(function (e, i) { e.id = 'E-' + (i + 1); e.sha = sha(e._k[2]); });
  ROWS.forEach(function (r) { r.chain = r.chain.map(function (e) { return e.id; }); r.sha = sha('pub:' + r.id); });

  window.SAMPLE = {
    rows: ROWS, events: ev, utc: utc, add: add,
    week: { start: utc('2026-11-02', 0, 0), end: utc('2026-11-08', 23, 59), sunday: '2026-11-08', label: 'Nov 2 to Nov 8, 2026' },
    firstRow: '2026-07-05',
    monthsElapsed: 4, // Jul 5 to Nov 8
    book: { start: 100000, perCall: 10000 },
    // design/07 "Never published": the paper account shows only as this aggregate line.
    fills: { mirrored: 3, queued: 1, notMirrored: 2, pl: 860 }
  };
})();
