/* Original pixel sprites (drawn for this preview) and the shared page state.
   Palette letters map to tokens: k text, f surface, s bg, p line, m muted, b ink, l loss, w win, y warn. */
(function () {
  var S = {
    analyst: ['...kkkk...', '..kkkkkk..', '.kkffffkk.', '.kffffffk.', '.kfkffkfk.', '.kffffffk.', '..kffffk..', '...kffk...', '.bbbbbbbb.', 'bbbbbbbbbb', 'bbbbbbbbbb'],
    risk: ['...kkkk...', '..kkkkkk..', '.kkkkkkkk.', '.kffffffk.', '.kmmffmmk.', '.kffffffk.', '..kffffk..', '...kffk...', '.mmmllmmm.', 'mmmmllmmmm', 'mmmmmmmmmm'],
    committee: ['..kkkkk...', '.kkkkkkk..', '.kkffffkk.', '.kffffffk.', '.kfkffkfk.', '.kffffffk.', '..kfkkfk..', '...kffk...', '.kkkfbkkk.', 'kkkkbbkkkk', 'kkkkbbkkkk'],
    desk: ['kkkkkkkkkkkkkkkkkkkkkkkk', 'kppppppppppppppppppppppk', 'kppppppppppppppppppppppk', 'kkkkkkkkkkkkkkkkkkkkkkkk', '.kk..................kk.', '.kk..................kk.'],
    monitor: ['kkkkkkkk', 'kssssssk', 'ksbbsssk', 'kssbbbsk', 'kkkkkkkk', '...kk...', '..kkkk..'],
    monitorOff: ['kkkkkkkk', 'kmmmmmmk', 'kmmmmmmk', 'kmmmmmmk', 'kkkkkkkk', '...kk...', '..kkkk..'],
    chair: ['.kkkkkk.', 'kmmmmmmk', 'kmmmmmmk', 'kmmmmmmk', 'kkkkkkkk'],
    bigChair: ['..kkkkkk..', '.kmmmmmmk.', 'kmmmmmmmmk', 'kmmmmmmmmk', 'kmmmmmmmmk', 'kmmmmmmmmk', 'kkkkkkkkkk'],
    table: ['....kkkkkkkkkkkkkkkk....', '..kkppppppppppppppppkk..', 'kkppppppppppppppppppppkk', '..kkppppppppppppppppkk..', '....kkkkkkkkkkkkkkkk....', '......kk........kk......', '......kk........kk......'],
    rack: ['kkkkkkkkkkkkkk', 'kmmmmmmmmmmmmk', 'kmkkkkkkkkkkmk', 'kmkbssssssskmk', 'kmkkkkkkkkkkmk', 'kmkbssssssskmk', 'kmkkkkkkkkkkmk', 'kmkwssssssskmk', 'kmkkkkkkkkkkmk', 'kmmmmmmmmmmmmk', 'kkkkkkkkkkkkkk', '.kk........kk.'],
    scorer: ['kkkkkkkkkkkkkk', 'kmmmmmmmmmmmmk', 'kmssssssssssmk', 'kmsssssssbssmk', 'kmssssbsssbsmk', 'kmsbssbssbbsmk', 'kmsbbsbbsbbsmk', 'kmssssssssssmk', 'kmmmmmmmmmmmmk', 'kmmmmmmmmmwmmk', 'kkkkkkkkkkkkkk', '.kk........kk.'],
    printer: ['...kkkkkkkk...', '...kssssssk...', '...ksbbbbsk...', '...kssssssk...', 'kkkkkkkkkkkkkk', 'kmmmmmmmmmmmmk', 'kmmmmmmmmmbmmk', 'kmkkkkkkkkkkmk', 'kmmmmmmmmmmmmk', 'kkkkkkkkkkkkkk', '.kk........kk.'],
    publish: ['kkkkkkkkkkkkkk', 'kmmmmmmmmmmmmk', 'kmssssssssssmk', 'kmsbbbbbbbbsmk', 'kmssssssssssmk', 'kmmmmmmmmmmmmk', 'kmkkkkkkkkkkmk', 'kmmmmmmmmmmmmk', 'kmmmmmmmmmbbmk', 'kkkkkkkkkkkkkk', '.kk........kk.'],
    stampHandle: ['...kkkk...', '...kbbk...', '...kbbk...', '...kbbk...', '.kkkkkkkk.'],
    stampBase: ['.kbbbbbbk.', 'kkkkkkkkkk'],
    tray: ['k..........k', 'kl........lk', 'kllllllllllk', 'kkkkkkkkkkkk'],
    plant: ['.w..w.', 'ww.ww.', '.wwww.', '..ww..', '.kkkk.', '.kppk.', '.kkkk.'],
    paper: ['kkkkkkk', 'ksssssk', 'ksbbbsk', 'ksssssk', 'ksbbssk', 'kkkkkkk']
  };
  function paths(rows, x0, y0) {
    var by = {}, out = '';
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length;) {
        var c = r[x]; if (c === '.') { x++; continue; }
        var e = x; while (e < r.length && r[e] === c) e++;
        (by[c] = by[c] || []).push('M' + (x0 + x) + ' ' + (y0 + y) + 'h' + (e - x) + 'v1h-' + (e - x) + 'z');
        x = e;
      }
    });
    for (var c in by) out += '<path class="' + c + '" d="' + by[c].join('') + '"/>';
    return out;
  }
  // A scene: [w, h, [[sprite, x, y, groupClass?], ...]]
  var SCENES = {
    analyst: [28, 18, [['analyst', 5, 0, 'idle'], ['monitor', 17, 4], ['desk', 2, 11]]],
    risk: [28, 18, [['risk', 5, 0, 'idle'], ['paper', 17, 5], ['desk', 2, 11]]],
    committee: [28, 18, [['committee', 9, 0, 'idle'], ['table', 2, 11]]],
    hiring: [28, 18, [['chair', 6, 6], ['monitorOff', 15, 4], ['desk', 2, 11]]],
    pm: [28, 18, [['chair', 6, 6], ['desk', 2, 11]]],
    sidd: [40, 18, [['plant', 0, 11], ['bigChair', 9, 3], ['stampHandle', 26, 1, 'press'], ['stampBase', 26, 6], ['tray', 22, 7], ['desk', 7, 11]]],
    data: [14, 12, [['rack', 0, 0]]],
    scorer: [14, 12, [['scorer', 0, 0]]],
    digest: [14, 11, [['printer', 0, 0]]],
    publish: [14, 11, [['publish', 0, 0]]],
    stamp: [12, 7, [['stampHandle', 1, 0, 'press'], ['stampBase', 1, 5]]],
    tray: [12, 6, [['tray', 0, 2]]],
    ledger: [12, 9, [['paper', 0, 0], ['paper', 5, 3]]]
  };
  function scene(name, scale) {
    var sc = SCENES[name], w = sc[0], h = sc[1], body = '';
    sc[2].forEach(function (p) {
      var inner = paths(S[p[0]], p[1], p[2]);
      body += p[3] ? '<g class="' + p[3] + '">' + inner + '</g>' : inner;
    });
    return '<svg class="px" viewBox="0 0 ' + w + ' ' + h + '" width="' + w * scale + '" height="' + h * scale + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  document.querySelectorAll('[data-scene]').forEach(function (el) {
    el.innerHTML = scene(el.dataset.scene, +(el.dataset.scale || 3));
  });

  // Shared preview state: day 0 or the labeled sample week. Remembered per tab only.
  var KEY = 'polaris-preview-state';
  function getState() { try { return sessionStorage.getItem(KEY) || 'day0'; } catch (e) { return 'day0'; } }
  function setState(s) { try { sessionStorage.setItem(KEY, s); } catch (e) {} }
  var listeners = [];
  function apply(s, initial) {
    document.documentElement.dataset.state = s;
    document.querySelectorAll('[data-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === s)); });
    listeners.forEach(function (f) { f(s, initial); });
  }
  document.querySelectorAll('[data-set]').forEach(function (b) {
    b.addEventListener('click', function () { setState(b.dataset.set); apply(b.dataset.set, false); });
  });
  window.PX = {
    scene: scene, paths: paths, sprites: S,
    onState: function (f) { listeners.push(f); },
    start: function () { apply(getState(), true); },
    fmtDate: function (iso, withTime) {
      var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var d = iso.slice(0, 10).split('-'), out = M[+d[1] - 1] + ' ' + (+d[2]);
      if (withTime && iso.length > 10) out += ' · ' + iso.slice(11, 16) + ' UTC';
      return out;
    },
    money: function (n) { return (n < 0 ? '−' : n > 0 ? '+' : '') + '$' + Math.abs(n).toLocaleString('en-US'); }
  };
})();
