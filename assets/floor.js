/* High Leverage Research: the office floor, drawn as one isometric open plan (office v2).
   Original art, generated as SVG from floor coordinates (1 unit is about half a metre).
   window.FLOOR.build(el) draws it; window.FLOOR.anchors maps each station to scene px for labels and the camera.
   Three seated people stand for the three model seats; the fourth is Sidd, the human portfolio manager. */
(function () {
  var S = 18, C = 0.8660254, W = 44, D = 23.4, MZ = 6.2, MD = 9, H = 12.4; // two storeys: a mezzanine (y 0..MD) over a double-height floor

  function P(x, y, z) { return [(x - y) * C * S, (x + y) * 0.5 * S - (z || 0) * S]; }
  var ZB = 0; // the storey being drawn: 0 for the trading floor, MZ for the mezzanine
  function Q(x, y, z) { return P(x, y, (z || 0) + ZB); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function pts(a) { return a.map(function (p) { var q = Q(p[0], p[1], p[2]); return f1(q[0]) + ',' + f1(q[1]); }).join(' '); }
  function poly(a, fill, ex) { return '<polygon points="' + pts(a) + '" fill="' + fill + '"' + (ex || '') + '/>'; }
  function hex(c) { c = c.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join(''); }
  function dk(c, t) { return mix(c, '#1a1410', t); }
  var rnd; void (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(7);

  var items = [], L0 = 0; // L0 is the draw layer: under the mezzanine, the mezzanine, then the open floor in front
  function add(k, s) { items.push({ k: L0 + k, s: s }); }

  // box: three visible faces. Light comes through the window wall, so the +x face is the darkest.
  function box(x, y, z, w, d, h, top, o) {
    o = o || {};
    var L = o.left || dk(top, 0.14), R = o.right || dk(top, 0.27);
    var s = poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], L) +
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], R) +
      poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top);
    return s;
  }
  function shadow(x, y, r, op) {
    var p = Q(x, y, 0);
    return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="' + f1(r * S * 1.22) + '" ry="' + f1(r * S * 0.71) + '" fill="#3a2a18" opacity="' + (op || 0.16) + '"/>';
  }
  // text laid on a wall plane. face 'y' = a plane of constant y (reads down-right), 'x' = constant x (reads up-right)
  function planeText(face, x, y, z, txt, size, fill, font, weight, anchor, len) {
    var p = Q(x, y, z), m = face === 'y' ? [C, 0.5] : [C, -0.5];
    return '<text transform="matrix(' + m[0] + ',' + m[1] + ',0,1,' + f1(p[0]) + ',' + f1(p[1]) + ')" font-family="' + font + '" font-size="' + size + '" font-weight="' + (weight || 600) + '" fill="' + fill + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + (len ? ' textLength="' + f1(len * S) + '" lengthAdjust="spacingAndGlyphs"' : '') + '>' + txt + '</text>';
  }

  // ---------- palette ----------
  var K = {
    floor: '#E9E1D3', floorLine: '#DDD3C2', slab: '#B7AB97', wall: '#F1ECE3', wallTrim: '#D9D0C1',
    desk: '#F6F3EC', deskOak: '#CDAA7D', walnut: '#7A5638', chair: '#2E3138', chairSeat: '#3A3E47',
    glass: '#D6E8EE', frame: '#4A4F58', ink: '#1F3A5F', loss: '#A3361F', win: '#2F6B3A', paper: '#FBF9F4',
    skin1: '#C68B63', skin2: '#8D5A3C', skin3: '#E2B08E', hair1: '#231C18', hair2: '#4A3226', hair3: '#6B6B6B',
    plant: '#5E7F4E', plantDk: '#46653A', pot: '#C9BBA6', screen: '#BFD8E6', rack: '#2A2E36', led: '#79E0CF',
    sun: '#FFE2A8', tab: '#E8D5A8',
    slabL: '#A99C86', slabR: '#8F826D', wallBack: '#E7E0D3', cap: '#3F3A33', capSide: '#57514A', leg: '#C9C2B5',
    zSrv: '#D6D4CE', zCom: '#CFC3B0', zSidd: '#C9B79C', zLobby: '#DCD2C1', brand: '#2B2925', brandRule: '#9C8F7A',
    // morning sky over a cool city; dark mode swaps in a night sky and lets the lit windows carry the scene
    plate: '#3D7BE0', visor: '#BFD6FF', modelBody: '#2E3542', benchBody: '#C8C2B8', benchHead: '#D6D1C9', benchLine: '#8A8479',
    night: 0, glassOp: 0.26,
    mezz: '#D2BFA3', mezzLine: '#C4B092', mezzFront: '#3F3A33', mezzSide: '#2F2B26', under: '#3a2a18', rug: '#D9CDB9', rugEdge: '#C8BBA4',
    slat: '#5B3F2B', slatLine: '#4A3222', brass: '#E3C27E', recordWall: '#2E3036', slot: '#4A4D55', book: ['#7A3B2E', '#2B3A55', '#5E6F63', '#C9A45C', '#8A6A4A', '#4A4F58', '#B9785A'],
    sofa: '#56636B', sofaDk: '#434E55',
    sky: ['#B9C9D6', '#C4CFD6', '#CCD5DA', '#D6DAD9', '#DCDDD9', '#E6E2D8'],
    cityTop: ['#A6B1BD', '#C3CAD1'], cityL: ['#7E8B9B', '#AEB8C3'], cityR: ['#6D7A8B', '#A2ADB9'], lit: 0.05, litC: '#FFE9B8', shaft: 0.12, glow: '#9FE3D8'
  };
  var KD = {
    floor: '#3A352E', floorLine: '#443E36', slab: '#1E1B18', wall: '#38332D', wallTrim: '#2F2B26', desk: '#4A453E',
    slabL: '#1E1B18', slabR: '#171512', wallBack: '#332E28', cap: '#151311', capSide: '#100F0D', leg: '#3A362F',
    zSrv: '#24282A', zCom: '#332C25', zSidd: '#3A3026', zLobby: '#302B25', brand: '#E9E1D3', brandRule: '#6B6152', paper: '#E9E3D6',
    night: 1, glassOp: 0.07, modelBody: '#3A4456', benchBody: '#4A463F', benchHead: '#57534C', benchLine: '#8F887C',
    mezz: '#3A322A', mezzLine: '#433A31', mezzFront: '#151311', mezzSide: '#100F0D', under: '#000000', rug: '#332E28', rugEdge: '#3D372F',
    slat: '#3A2A1E', slatLine: '#2C1F16', recordWall: '#1F2126', slot: '#3A3D44', sofa: '#3E474D', sofaDk: '#30383D',
    sky: ['#121726', '#141A2B', '#1B2236', '#21273D', '#252B42', '#30344B'],
    cityTop: ['#2F3448', '#3A3E52'], cityL: ['#20243A', '#2B2F44'], cityR: ['#1A1D30', '#262A3E'], lit: 0.45, litC: '#FFD27A', shaft: 0, glow: '#4FB8AA'
  };
  var KL = {};
  KD.plate = '#4C8BEF'; KD.visor = '#CFE0FF';
  for (var kk in KD) KL[kk] = K[kk];
  function theme(dark) { var src = dark ? KD : KL; for (var k in src) K[k] = src[k]; }

  // ---------- pieces ----------
  function plant(x, y, h, kind, pot) { // kind: 'bush' | 'snake' | 'fig'
    h = h || 2.2; kind = kind || 'bush';
    var s = shadow(x + 0.35, y + 0.35, 0.55) + box(x, y, 0, 0.7, 0.7, 0.8, pot || K.pot), leaves = '', i;
    if (kind === 'snake') {
      var b = Q(x + 0.35, y + 0.35, 0.8);
      for (i = 0; i < 6; i++) {
        var dx = (i - 2.5) * S * 0.11, tall = S * h * (0.7 + ((i * 37) % 10) / 30), lean = (i - 2.5) * S * 0.05;
        leaves += '<path d="M' + f1(b[0] + dx - S * 0.07) + ',' + f1(b[1]) + ' Q' + f1(b[0] + dx + lean) + ',' + f1(b[1] - tall * 0.6) + ' ' + f1(b[0] + dx + lean * 2) + ',' + f1(b[1] - tall) + ' Q' + f1(b[0] + dx + lean + S * 0.1) + ',' + f1(b[1] - tall * 0.6) + ' ' + f1(b[0] + dx + S * 0.07) + ',' + f1(b[1]) + 'z" fill="' + (i % 2 ? K.plant : K.plantDk) + '"/>';
      }
    } else if (kind === 'fig') {
      var st = Q(x + 0.35, y + 0.35, 0.8), tp = Q(x + 0.35, y + 0.35, 0.8 + h * 0.75);
      leaves += '<rect x="' + f1(st[0] - 1.2) + '" y="' + f1(tp[1]) + '" width="2.4" height="' + f1(st[1] - tp[1]) + '" fill="#6B4E36"/>';
      [[0, 0, 0.75], [-0.42, 0.25, 0.55], [0.45, 0.2, 0.55], [0.05, -0.45, 0.55]].forEach(function (c, j) {
        leaves += '<circle cx="' + f1(tp[0] + c[0] * S) + '" cy="' + f1(tp[1] + c[1] * S) + '" r="' + f1(c[2] * S) + '" fill="' + (j % 2 ? K.plantDk : K.plant) + '"/>';
      });
    } else {
      var c = Q(x + 0.35, y + 0.35, 0.8 + h * 0.55);
      for (i = 0; i < 7; i++) {
        var a = i / 7 * Math.PI * 2, r = S * (0.55 + (i % 3) * 0.12), ex = c[0] + Math.cos(a) * r * 0.55, ey = c[1] + Math.sin(a) * r * 0.45;
        leaves += '<ellipse cx="' + f1(ex) + '" cy="' + f1(ey - (i % 2) * S * 0.3) + '" rx="' + f1(S * 0.42) + '" ry="' + f1(S * 0.62) + '" transform="rotate(' + Math.round(a * 57.3 + 90) + ' ' + f1(ex) + ' ' + f1(ey) + ')" fill="' + (i % 2 ? K.plant : K.plantDk) + '"/>';
      }
    }
    add(x + y + 1, s + '<g>' + leaves + '</g>');
  }
  function chair(x, y, face, o) { // face: direction the sitter looks: '-y', '+y', '-x', '+x'
    o = o || {};
    var col = o.col || K.chair, s = shadow(x, y, 0.6, 0.14);
    var p = Q(x, y, 0);
    s += '<rect x="' + f1(p[0] - 1.2) + '" y="' + f1(p[1] - S * 0.95) + '" width="2.4" height="' + f1(S * 0.95) + '" fill="#555a63"/>';
    s += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="' + f1(S * 0.55) + '" ry="' + f1(S * 0.3) + '" fill="#3b3f47"/>';
    s += box(x - 0.45, y - 0.45, 0.95, 0.9, 0.9, 0.22, o.seat || K.chairSeat);
    var bh = o.tall ? 1.9 : o.low ? 0.55 : 1.25;
    if (face === '+y') s += box(x - 0.45, y - 0.6, 1.1, 0.9, 0.18, bh, col);
    if (face === '-y') s += box(x - 0.45, y + 0.42, 1.1, 0.9, 0.18, bh, col);
    if (face === '-x') s += box(x + 0.42, y - 0.45, 1.1, 0.18, 0.9, bh, col);
    if (face === '+x') s += box(x - 0.6, y - 0.45, 1.1, 0.18, 0.9, bh, col);
    return s;
  }
  function monitor(x, y, z, face) { // screen faces +y or +x
    var s = face === '+y' ? glow(x + 0.65, y + 0.9, z - 0.05, 1.1, false) : glow(x + 0.9, y + 0.65, z - 0.05, 1.1, false);
    if (face === '+y') {
      s += box(x + 0.55, y + 0.1, z, 0.12, 0.12, 0.35, '#3a3f47');
      s += box(x, y, z + 0.35, 1.3, 0.1, 0.78, '#2c3037');
      s += poly([[x + 0.06, y + 0.105, z + 0.41], [x + 1.24, y + 0.105, z + 0.41], [x + 1.24, y + 0.105, z + 1.07], [x + 0.06, y + 0.105, z + 1.07]], K.screen);
      s += poly([[x + 0.2, y + 0.106, z + 0.85], [x + 0.9, y + 0.106, z + 0.85], [x + 0.9, y + 0.106, z + 0.92], [x + 0.2, y + 0.106, z + 0.92]], '#8FB2C8');
      s += poly([[x + 0.2, y + 0.106, z + 0.66], [x + 1.05, y + 0.106, z + 0.66], [x + 1.05, y + 0.106, z + 0.72], [x + 0.2, y + 0.106, z + 0.72]], '#8FB2C8');
    } else {
      s += box(x + 0.1, y + 0.55, z, 0.12, 0.12, 0.35, '#3a3f47');
      s += box(x, y, z + 0.35, 0.1, 1.3, 0.78, '#2c3037');
      s += poly([[x + 0.105, y + 0.06, z + 0.41], [x + 0.105, y + 1.24, z + 0.41], [x + 0.105, y + 1.24, z + 1.07], [x + 0.105, y + 0.06, z + 1.07]], K.screen);
      s += poly([[x + 0.106, y + 0.25, z + 0.85], [x + 0.106, y + 1.0, z + 0.85], [x + 0.106, y + 1.0, z + 0.92], [x + 0.106, y + 0.25, z + 0.92]], '#8FB2C8');
    }
    return s;
  }
  // a seated figure. o.kind: 'human' (Sidd, the only person on the floor), 'model' (a voting model seat: a flat signal-blue
  // face plate and its seat number), or 'bench' (an unbuilt seat: ghosted and outlined, no vote). o.reach: desk points the hands rest on.
  var ARM = {}; // Sidd's stamping arm, so the replay can move his hand to the stamp
  function armPath(sh, e) { var el = [sh[0] * 0.55 + e[0] * 0.45, Math.max(sh[1], e[1]) + S * 0.22]; return [el, 'M' + f1(sh[0]) + ',' + f1(sh[1]) + ' L' + f1(el[0]) + ',' + f1(el[1]) + ' L' + f1(e[0]) + ',' + f1(e[1])]; }
  function personSeated(x, y, view, o) { // view: 'back' or 'front'
    var kind = o.kind || 'human', model = kind === 'model', bench = kind === 'bench';
    var shirt = model ? K.modelBody : bench ? K.benchBody : o.shirt, skin = model ? K.plate : bench ? K.benchHead : o.skin;
    var line = bench ? ' stroke="' + K.benchLine + '" stroke-width="1" stroke-dasharray="2 1.6"' : '';
    var k = 1.15, p = Q(x, y, 1.15), cx = p[0], by = p[1], tw = S * 0.98 * k, th = S * 1.18 * k, s = '', arms = '';
    var hr = S * 0.34 * 1.1, hx = cx + (o.lean || 0), hy = by - th - hr * 1.05;
    var sl = dk(shirt, 0.16), hand = model ? K.plate : skin;
    s += shadow(x, y, 0.55, 0.12);
    if (view === 'back') { // legs: knees forward under the desk, shins showing beneath the seat
      var fd = o.face === '-x' ? [-1, 0] : [0, -1], pd = [-fd[1], fd[0]], trou = model ? dk(K.modelBody, 0.25) : bench ? K.benchBody : '#2C2F35';
      [-0.2, 0.2].forEach(function (sd) {
        var kx = x + fd[0] * 0.6 + pd[0] * sd, ky = y + fd[1] * 0.6 + pd[1] * sd, a1 = Q(kx, ky, 0.9), a2 = Q(kx + fd[0] * 0.08, ky + fd[1] * 0.08, 0.08);
        s += '<line x1="' + f1(a1[0]) + '" y1="' + f1(a1[1]) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '" stroke="' + trou + '" stroke-width="' + f1(S * 0.2) + '" stroke-linecap="round"' + (bench ? ' opacity="0.8"' : '') + '/>';
        s += '<ellipse cx="' + f1(a2[0] + (fd[0] ? -2 : 2)) + '" cy="' + f1(a2[1]) + '" rx="' + f1(S * 0.16) + '" ry="' + f1(S * 0.08) + '" fill="' + (bench ? K.benchLine : '#1E1F22') + '"/>';
      });
    }
    (o.reach || []).forEach(function (t, i) {
      var sh = [cx + (i ? 1 : -1) * tw * 0.36, by - th * 0.72], e = Q(t[0], t[1], t[2]), ap = armPath(sh, e);
      var id = o.arm && i === 0 ? ' id="fl-arm"' : '', hid = o.arm && i === 0 ? ' id="fl-hand"' : '';
      if (id) { ARM.sh = sh; ARM.rest = e; }
      arms += '<path' + id + ' d="' + ap[1] + '" fill="none" stroke="' + sl + '" stroke-width="' + f1(S * 0.24) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      arms += '<ellipse' + hid + (model && !o.arm ? ' class="ih"' : '') + ' cx="' + f1(e[0]) + '" cy="' + f1(e[1]) + '" rx="' + f1(S * 0.15) + '" ry="' + f1(S * 0.11) + '" fill="' + hand + '"/>';
    });
    if (view === 'back') s += arms;
    s += '<path d="M' + f1(cx - tw / 2) + ',' + f1(by) + ' v' + f1(-th * 0.72) + ' q0,' + f1(-th * 0.28) + ' ' + f1(tw * 0.28) + ',' + f1(-th * 0.28) + ' h' + f1(tw * 0.44) + ' q' + f1(tw * 0.28) + ',0 ' + f1(tw * 0.28) + ',' + f1(th * 0.28) + ' v' + f1(th * 0.72) + 'z" fill="' + shirt + '"' + line + (model && K.night ? ' stroke="' + K.plate + '" stroke-width="1" stroke-opacity="0.6"' : '') + '/>';
    if (o.collar && !bench && !model) s += '<path d="M' + f1(cx - S * 0.18) + ',' + f1(by - th) + ' l' + f1(S * 0.18) + ',' + f1(S * 0.38) + ' l' + f1(S * 0.18) + ',' + f1(-S * 0.38) + 'z" fill="' + o.collar + '"/>';
    if (model && o.seat) s += '<text x="' + f1(cx) + '" y="' + f1(by - th * 0.36) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="700" fill="' + K.visor + '" stroke="#141820" stroke-width="0.5" paint-order="stroke">' + o.seat + '</text>';
    if (!model) s += '<rect x="' + f1(cx - S * 0.12) + '" y="' + f1(hy + hr * 0.6) + '" width="' + f1(S * 0.24) + '" height="' + f1(S * 0.3) + '" fill="' + dk(skin, 0.15) + '"/>';
    s += '<circle' + (bench ? ' class="hd"' : '') + ' cx="' + f1(hx) + '" cy="' + f1(hy) + '" r="' + f1(hr) + '" fill="' + skin + '"' + line + '/>';
    if (!model && !bench && view === 'front') { // the one face on the floor
      var ink = dk(skin, 0.55);
      s += '<circle cx="' + f1(hx - hr * 0.36) + '" cy="' + f1(hy + hr * 0.12) + '" r="' + f1(hr * 0.1) + '" fill="' + ink + '"/><circle cx="' + f1(hx + hr * 0.36) + '" cy="' + f1(hy + hr * 0.12) + '" r="' + f1(hr * 0.1) + '" fill="' + ink + '"/>';
    }
    if (model) { // the face plate: a visor slot when it faces us, a seam when it doesn't
      if (view === 'front') s += '<path d="M' + f1(hx - hr * 0.65) + ',' + f1(hy - hr * 0.05) + ' q' + f1(hr * 0.65) + ',' + f1(hr * 0.3) + ' ' + f1(hr * 1.3) + ',0" fill="none" stroke="' + K.visor + '" stroke-width="' + f1(hr * 0.22) + '" stroke-linecap="round"/>';
      else s += '<path d="M' + f1(hx - hr * 0.7) + ',' + f1(hy + hr * 0.1) + ' q' + f1(hr * 0.7) + ',' + f1(hr * 0.35) + ' ' + f1(hr * 1.4) + ',0" fill="none" stroke="' + dk(K.plate, 0.25) + '" stroke-width="1"/>';
    } else if (!bench) {
      if (view === 'back') s += '<circle cx="' + f1(hx) + '" cy="' + f1(hy - S * 0.03) + '" r="' + f1(hr * 1.04) + '" fill="' + o.hair + '"/>';
      else s += '<path d="M' + f1(hx - hr * 1.05) + ',' + f1(hy + S * 0.02) + ' a' + f1(hr * 1.05) + ',' + f1(hr * 1.05) + ' 0 0 1 ' + f1(hr * 2.1) + ',0 q' + f1(-hr * 0.9) + ',' + f1(-hr * 0.5) + ' ' + f1(-hr * 1.8) + ',' + f1(-hr * 0.15) + 'z" fill="' + o.hair + '"/>';
    }
    if (o.ring) s += '<circle id="' + o.ring + '" cx="' + f1(hx) + '" cy="' + f1(hy) + '" r="' + f1(hr * 1.75) + '" fill="none" stroke="' + K.plate + '" stroke-width="2" opacity="0"/>';
    if (view !== 'back') s += arms;
    return s;
  }
  function personStanding(x, y, o) {
    var p = Q(x, y, 0), cx = p[0], fy = p[1], s = shadow(x, y, 0.5, 0.18);
    var legH = S * 1.7, th = S * 1.35, tw = S * 0.95;
    s += '<rect x="' + f1(cx - tw * 0.36) + '" y="' + f1(fy - legH) + '" width="' + f1(tw * 0.32) + '" height="' + f1(legH) + '" rx="2" fill="' + o.legs + '"/>';
    s += '<rect x="' + f1(cx + tw * 0.04) + '" y="' + f1(fy - legH) + '" width="' + f1(tw * 0.32) + '" height="' + f1(legH) + '" rx="2" fill="' + dk(o.legs, 0.12) + '"/>';
    s += '<path d="M' + f1(cx - tw / 2) + ',' + f1(fy - legH + 2) + ' v' + f1(-th * 0.75) + ' q0,' + f1(-th * 0.25) + ' ' + f1(tw * 0.3) + ',' + f1(-th * 0.25) + ' h' + f1(tw * 0.4) + ' q' + f1(tw * 0.3) + ',0 ' + f1(tw * 0.3) + ',' + f1(th * 0.25) + ' v' + f1(th * 0.75) + 'z" fill="' + o.shirt + '"/>';
    var hy = fy - legH - th - S * 0.32;
    s += '<circle cx="' + f1(cx) + '" cy="' + f1(hy) + '" r="' + f1(S * 0.34) + '" fill="' + o.skin + '"/>';
    s += '<path d="M' + f1(cx - S * 0.36) + ',' + f1(hy + S * 0.04) + ' a' + f1(S * 0.36) + ',' + f1(S * 0.36) + ' 0 0 1 ' + f1(S * 0.72) + ',0 q' + f1(-S * 0.32) + ',' + f1(-S * 0.16) + ' ' + f1(-S * 0.64) + ',' + f1(-S * 0.04) + 'z" fill="' + o.hair + '"/>';
    if (o.bag) s += '<rect x="' + f1(cx + tw * 0.42) + '" y="' + f1(fy - legH - th * 0.1) + '" width="' + f1(S * 0.55) + '" height="' + f1(S * 0.7) + '" rx="2" fill="' + o.bag + '"/>';
    return s;
  }
  function glassWall(axis, a0, a1, at, h, o) { // axis 'x': wall along x at y=at. 'y': along y at x=at
    o = o || {};
    var s = '', q = function (u, z) { return axis === 'x' ? [u, at, z] : [at, u, z]; };
    var doorA = o.door ? o.door[0] : null, doorB = o.door ? o.door[1] : null;
    s += poly([q(a0, 0), q(a1, 0), q(a1, h), q(a0, h)], o.tint || K.glass, ' opacity="' + K.glassOp + '"');
    // one or two glints per wall, placed at random so the rooms don't share a rhythm
    var n = 1 + (rnd() < 0.5 ? 1 : 0);
    for (var g = 0; g < n; g++) { var u = a0 + 0.5 + rnd() * (a1 - a0 - 2.2), wd = 0.25 + rnd() * 0.3; s += poly([q(u, 0.5), q(u + wd, 0.5), q(u + wd + 1.0, h - 0.6), q(u + 1.0, h - 0.6)], '#ffffff', ' opacity="0.10"'); }
    var thin = o.rail ? ' vector-effect="non-scaling-stroke"' : '';
    var line = function (A, B, w, c) { var p1 = Q.apply(null, A), p2 = Q.apply(null, B); return '<line x1="' + f1(p1[0]) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0]) + '" y2="' + f1(p2[1]) + '" stroke="' + (c || K.frame) + '" stroke-width="' + (o.rail ? Math.min(w, 1.25) : w) + '" stroke-linecap="round"' + thin + '/>'; };
    s += line(q(a0, h), q(a1, h), 2.2) + line(q(a0, 0.02), q(a1, 0.02), 1.6);
    for (var m = a0; m <= a1 + 0.01; m += o.step || 2.4) {
      var mm = Math.min(m, a1);
      if (doorA !== null && mm > doorA && mm < doorB) continue;
      s += line(q(mm, 0), q(mm, h), 1.2, '#6b7079');
    }
    if (o.door) { s += line(q(doorA, 0), q(doorA, h), 1.6) + line(q(doorB, 0), q(doorB, h), 1.6); }
    s += line(q(a0, h), q(a1, h), 0.8, '#ffffff');
    return s;
  }

  function labelText(face, x, y, z, txt, size, fill) { return planeText(face, x, y, z, txt, size, fill, 'IBM Plex Mono, monospace', 600); }
  function sofa(x, y, len, face, col) { // footprint x..x+1.1, y..y+len; face '+x' or '-x' is where the sitter looks
    var dkc = dk(col, 0.12), s = shadow(x + 0.55, y + len / 2, len * 0.45, 0.1);
    var armA = box(x - 0.35, y - 0.3, 0, 1.8, 0.3, 0.95, dkc), armB = box(x - 0.35, y + len, 0, 1.8, 0.3, 0.95, dkc);
    var seat = box(x + (face === '+x' ? 0 : -0.35), y, 0, 1.45, len, 0.62, col);
    var back = box(face === '+x' ? x - 0.35 : x + 1.1, y, 0, 0.35, len, 1.35, dkc);
    return s + armA + (face === '+x' ? back + seat : seat + back) + armB;
  }
  function stool(x, y) { var p = Q(x, y, 0); return shadow(x, y, 0.4, 0.12) + '<rect x="' + f1(p[0] - 1.1) + '" y="' + f1(p[1] - S * 1.15) + '" width="2.2" height="' + f1(S * 1.15) + '" fill="#555a63"/>' + box(x - 0.35, y - 0.35, 1.15, 0.7, 0.7, 0.14, '#6B4E36'); }
  function monitorBack(x, y, z) { return box(x + 0.55, y - 0.1, z, 0.12, 0.12, 0.35, '#3a3f47') + box(x, y, z + 0.35, 1.3, 0.12, 0.78, '#2c3037', { left: '#353a42' }); }
  // books on a shelf face: face 'x' = the +x face at x=at, 'y' = the +y face at y=at
  function books(face, at, u0, u1, zs) {
    var s = '';
    zs.forEach(function (z0) {
      for (var u = u0; u < u1 - 0.15;) {
        var w = 0.1 + rnd() * 0.1, h = 0.5 + rnd() * 0.22, c = K.book[Math.floor(rnd() * K.book.length)];
        if (rnd() < 0.1) { u += 0.3; continue; }
        s += face === 'x' ? poly([[at, u, z0], [at, u + w, z0], [at, u + w, z0 + h], [at, u, z0 + h]], c) : poly([[u, at, z0], [u + w, at, z0], [u + w, at, z0 + h], [u, at, z0 + h]], c);
        u += w + 0.02;
      }
    });
    return s;
  }

  // ambient occlusion: a strip along the foot of a wall, dark at the wall and clear 0.7 units out. dir is the unit step into the room.
  var aoN = 0;
  function ao(a, b, dir, z) {
    var id = 'fl-ao' + (aoN++), p0 = Q(a[0], a[1], z), p1 = Q(a[0] + dir[0] * 0.7, a[1] + dir[1] * 0.7, z);
    var wdx = Q(b[0], b[1], z)[0] - p0[0], wdy = Q(b[0], b[1], z)[1] - p0[1], L = Math.hypot(wdx, wdy), nx = -wdy / L, ny = wdx / L, d = (p1[0] - p0[0]) * nx + (p1[1] - p0[1]) * ny;
    AOD += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f1(p0[0]) + '" y1="' + f1(p0[1]) + '" x2="' + f1(p0[0] + nx * d) + '" y2="' + f1(p0[1] + ny * d) + '"><stop offset="0" stop-color="#000" stop-opacity="' + (K.night ? 0.3 : 0.13) + '"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>';
    return poly([[a[0], a[1], z], [b[0], b[1], z], [b[0] + dir[0] * 0.7, b[1] + dir[1] * 0.7, z], [a[0] + dir[0] * 0.7, a[1] + dir[1] * 0.7, z]], 'url(#' + id + ')');
  }
  var AOD = '';
  function glow(x, y, z, r, warm, op) { // a pool of light, only after dark
    if (!K.night) return '';
    var p = Q(x, y, z); return '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="' + f1(r * S * 1.22) + '" ry="' + f1(r * S * 0.71) + '" fill="url(#' + (warm ? 'fl-warm' : 'fl-cool') + ')" opacity="' + (op || 1) + '"/>';
  }

  // ---------- the build ----------
  var slots = {}, centers = {}, trayTop = 1.6;
  var SP = {}; // where the memo card sits at each station, in floor units
  function build(el, dark, opt) {
    opt = opt || {};
    items = []; theme(!!dark); ZB = 0; L0 = 0; AOD = ''; aoN = 0;
    rnd = (function (sd) { return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })(7);
    var defs = '', back = '', floor = '';
    // the window wall runs both storeys: back wall y=0, x 7..44
    var WX0 = 7, Z0 = 0.55, Z1 = H - 0.5;
    defs += '<clipPath id="fl-win"><polygon points="' + pts([[WX0, 0, Z0], [W, 0, Z0], [W, 0, Z1], [WX0, 0, Z1]]) + '"/></clipPath>';
    defs += '<radialGradient id="fl-warm"><stop offset="0" stop-color="#FFCF7A" stop-opacity="0.5"/><stop offset="1" stop-color="#FFCF7A" stop-opacity="0"/></radialGradient><radialGradient id="fl-cool"><stop offset="0" stop-color="#8EC5FF" stop-opacity="0.38"/><stop offset="1" stop-color="#8EC5FF" stop-opacity="0"/></radialGradient>';
    defs += '<clipPath id="fl-gf"><polygon points="' + pts([[0, MD, 0], [W, MD, 0], [W, D, 0], [0, D, 0]]) + '"/></clipPath>';
    defs += '<clipPath id="fl-mz"><polygon points="' + pts([[0, 0, MZ], [W, 0, MZ], [W, MD, MZ], [0, MD, MZ]]) + '"/></clipPath>';

    // ---------- sky and city ----------
    var city = '';
    K.sky.forEach(function (c, i) {
      var t0 = Z1 + 0.6 - i * 1.9, t1 = t0 - 1.9 - (i === K.sky.length - 1 ? 6 : 0);
      city += poly([[WX0 - 4, 0, t0], [W + 4, 0, t0], [W + 4, 0, t1], [WX0 - 4, 0, t1]], c);
    });
    var bl = [];
    for (var by = -60; by <= -7; by += 3.2) {
      for (var u = -2; u < 52; u += 2.2 + rnd() * 3.4) {
        var bx = by + u, w = 1.6 + rnd() * 2.6, d = 1.6 + rnd() * 2.6;
        var tall = rnd() < 0.1, q = tall ? 3.6 + rnd() * 2.0 : 1.2 + rnd() * 1.8;
        bl.push({ x: bx, y: by + rnd() * 1.2, w: w, d: d, top: by + q + MZ + 0.4 });
      }
    }
    bl.sort(function (m, n) { return (m.x + m.y) - (n.x + n.y); });
    bl.forEach(function (B) {
      var far = Math.min(1, Math.max(0, (-B.y - 7) / 53));
      var band = Math.min(2, Math.floor(far * 3)), haze = band * 0.22, sk = K.sky[K.sky.length - 2]; // three depth layers, each a step closer to the sky
      var top = mix(mix(K.cityTop[0], K.cityTop[1], band / 2), sk, haze), L = mix(mix(K.cityL[0], K.cityL[1], band / 2), sk, haze), R = mix(mix(K.cityR[0], K.cityR[1], band / 2), sk, haze);
      city += box(B.x, B.y, B.top - 40, B.w, B.d, 40, top, { left: L, right: R });
      if (far < 0.75) {
        for (var wz = B.top - 0.5; wz > B.top - 6; wz -= 0.55) for (var wu = 0.3; wu < B.w - 0.3; wu += 0.5) {
          if (rnd() < K.lit) city += poly([[B.x + wu, B.y + B.d + 0.01, wz], [B.x + wu + 0.22, B.y + B.d + 0.01, wz], [B.x + wu + 0.22, B.y + B.d + 0.01, wz - 0.28], [B.x + wu, B.y + B.d + 0.01, wz - 0.28]], K.litC, ' opacity="' + (0.95 - far * 0.6) + '"');
        }
      }
    });
    back += '<g clip-path="url(#fl-win)">' + city + '</g>';

    // ---------- shell ----------
    back += poly([[0, D, -0.9], [W, D, -0.9], [W, D, 0], [0, D, 0]], K.slabL) + poly([[W, -0.5, -0.9], [W, D, -0.9], [W, D, 0], [W, -0.5, 0]], K.slabR);
    back += poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], K.floor);
    for (var fy = 1.1; fy < D; fy += 1.1) floor += '<line x1="' + f1(P(0, fy)[0]) + '" y1="' + f1(P(0, fy)[1]) + '" x2="' + f1(P(W, fy)[0]) + '" y2="' + f1(P(W, fy)[1]) + '" stroke="' + K.floorLine + '" stroke-width="0.8"/>';
    back += poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], K.wall) + poly([[0, 0, 0], [0, D, 0], [0, D, 0.35], [0, 0, 0.35]], K.wallTrim);
    back += poly([[0, 0, 0], [WX0, 0, 0], [WX0, 0, H], [0, 0, H]], K.wallBack);
    back += poly([[WX0, 0, 0], [W, 0, 0], [W, 0, Z0], [WX0, 0, Z0]], K.wallTrim) + poly([[WX0, 0, Z1], [W, 0, Z1], [W, 0, H], [WX0, 0, H]], K.wallTrim);
    for (var mx = WX0; mx <= W + 0.01; mx += 2.3125) {
      var p1 = P(mx, 0, Z0), p2 = P(mx, 0, Z1);
      back += '<line x1="' + f1(p1[0]) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0]) + '" y2="' + f1(p2[1]) + '" stroke="#3D424B" stroke-width="2.4"/>';
    }
    [Z0, MZ + 3.3].forEach(function (tz) { var a1 = P(WX0, 0, tz), a2 = P(W, 0, tz); back += '<line x1="' + f1(a1[0]) + '" y1="' + f1(a1[1]) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '" stroke="#3D424B" stroke-width="' + (tz === Z0 ? 2.4 : 1.4) + '"/>'; });
    back += poly([[-0.4, -0.4, H], [W, -0.4, H], [W, 0, H], [0, 0, H]], K.cap) + poly([[-0.4, -0.4, H], [0, 0, H], [0, D, H], [-0.4, D, H]], K.cap);
    back += poly([[-0.4, D, 0], [0, D, 0], [0, D, H], [-0.4, D, H]], K.capSide) + poly([[W, -0.4, Z0 - 0.55], [W, 0, Z0 - 0.55], [W, 0, H], [W, -0.4, H]], K.capSide);

    // ---------- the record: one grid in wall units; each card fills 90% of its slot, and one empty row waits for what comes next ----------
    var RY0 = 9.9, RY1 = 18.1, SW = 2.5, SH = 1.62, GW = 0.35, GH = 0.3, RT = 9.7; // slot size, gaps, top of row 1 (z)
    var lw = poly([[0.02, RY0 - 0.4, RT - 3 * SH - 2 * GH - 0.45], [0.02, RY1 + 0.4, RT - 3 * SH - 2 * GH - 0.45], [0.02, RY1 + 0.4, RT + 1.35], [0.02, RY0 - 0.4, RT + 1.35]], K.recordWall);
    lw += planeText('x', 0.04, RY1, RT + 0.55, 'THE RECORD', 10, '#E9E1D3', 'IBM Plex Mono, monospace', 600);
    var cards = [['POL-1', 'WIN', K.win], ['POL-2', 'LOSS', K.loss], ['POL-3', 'LOSS', K.loss], ['POL-4', 'OPEN', '#5C574F'], ['POL-5', 'OPEN', '#5C574F'], ['POL-6', 'OPEN', '#5C574F']];
    function card(id, res, col, y0, zt, suffix, hide) { // y0..y0+w along the wall, zt is the top; one group per card so the replay can pin or close it
      var w = SW * 0.9, h = SH * 0.9, g = '<g id="fl-c-' + id + (suffix || '') + '"' + (hide ? ' opacity="0"' : '') + '>';
      g += poly([[0.04, y0, zt - h], [0.04, y0 + w, zt - h], [0.04, y0 + w, zt], [0.04, y0, zt]], K.paper);
      g += poly([[0.05, y0, zt - 0.22], [0.05, y0 + w, zt - 0.22], [0.05, y0 + w, zt], [0.05, y0, zt]], col);
      g += poly([[0.055, y0 + w - 0.75, zt - 0.22], [0.055, y0 + w - 0.2, zt - 0.22], [0.055, y0 + w - 0.2, zt - 0.4], [0.055, y0 + w - 0.75, zt - 0.4]], K.tab); // the dissent tab, inside the card
      g += labelText('x', 0.06, y0 + w - 0.15, zt - 0.62, id, 8, '#1C1B19');
      g += labelText('x', 0.06, y0 + w - 0.15, zt - 1.05, res, 8, col);
      return g + '</g>';
    }
    for (var ci = 0; ci < 9; ci++) {
      var col = ci % 3, row = Math.floor(ci / 3), y0 = RY1 - (col + 1) * SW - col * GW + SW * 0.05, zt = RT - row * (SH + GH) - SH * 0.05, c = cards[ci];
      if (!c) { lw += poly([[0.04, y0, zt - SH * 0.9], [0.04, y0 + SW * 0.9, zt - SH * 0.9], [0.04, y0 + SW * 0.9, zt], [0.04, y0, zt]], 'none', ' stroke="' + K.slot + '" stroke-width="1" stroke-dasharray="3 3"'); continue; }
      var cy = y0 + SW * 0.45, cz = zt - SH * 0.45;
      slots[c[0]] = [0.3, cy, cz]; centers[c[0]] = P(0.04, cy, cz);
      lw += card(c[0], c[1], c[2], y0, zt);
      if (c[0] === 'POL-3') lw += card(c[0], 'OPEN', '#5C574F', y0, zt, '-pre', true); // before its horizon close
    }
    if (K.night) { var rw = P(0.05, (RY0 + RY1) / 2, RT - 1.2); back += lw + '<ellipse cx="' + f1(rw[0]) + '" cy="' + f1(rw[1]) + '" rx="' + f1(S * 5.5) + '" ry="' + f1(S * 4) + '" fill="url(#fl-warm)" opacity="0.55"/>'; } else back += lw;

    // ---------- the logo wall: walnut slats, double height, behind reception ----------
    var LY0 = 18.9, LY1 = D, lg = poly([[0.02, LY0, 0], [0.02, LY1, 0], [0.02, LY1, H], [0.02, LY0, H]], K.slat);
    for (var sy = LY0 + 0.3; sy < LY1; sy += 0.32) { var s1 = P(0.03, sy, 0), s2 = P(0.03, sy, H); lg += '<line x1="' + f1(s1[0]) + '" y1="' + f1(s1[1]) + '" x2="' + f1(s2[0]) + '" y2="' + f1(s2[1]) + '" stroke="' + K.slatLine + '" stroke-width="1"/>'; }
    // the mark: a beam on an off-centre fulcrum, the same glyph as the header and favicon (24-unit box mapped onto the wall)
    var LC = 21.15, LV = 8.9, LW = 3.0;
    function wp(u, v) { var q = P(0.05, LC - u, v); return f1(q[0]) + ',' + f1(q[1]); }
    function g24(X, Y) { return wp((X - 12) / 24 * LW, LV - (Y - 12) / 24 * LW); }
    var bx = 21.5 - 2.5, byy = 6.4 - 12.6, bl = Math.hypot(bx, byy), nx = -byy / bl * 1.15, ny = bx / bl * 1.15; // beam 2.3 units thick
    lg += '<polygon points="' + [g24(2.5 + nx, 12.6 + ny), g24(21.5 + nx, 6.4 + ny), g24(21.5 - nx, 6.4 - ny), g24(2.5 - nx, 12.6 - ny)].join(' ') + '" fill="' + K.brass + '"/>';
    lg += '<polygon points="' + [g24(8, 11.2), g24(4, 19), g24(12, 19)].join(' ') + '" fill="' + K.brass + '"/>';
    lg += planeText('x', 0.05, LC, 6.45, 'HIGH LEVERAGE', 14, K.brass, 'Newsreader, Georgia, serif', 600, 'middle', 4.1);
    lg += planeText('x', 0.05, LC, 5.6, 'RESEARCH', 8, K.brass, 'IBM Plex Mono, monospace', 600, 'middle', 2.2);
    back += lg;

    // ---------- floor zones ----------
    floor += poly([[0, 0, 0], [W, 0, 0], [W, MD, 0], [0, MD, 0]], K.under, ' opacity="0.12"'); // the floor under the mezzanine sits in its shade
    floor += poly([[11.6, 10.0, 0], [30.4, 10.0, 0], [30.4, 18.2, 0], [11.6, 18.2, 0]], K.rug, ' stroke="' + K.rugEdge + '" stroke-width="2"');
    floor += poly([[0.6, 19.2, 0], [9.0, 19.2, 0], [9.0, 23.0, 0], [0.6, 23.0, 0]], K.zLobby);
    // late sun through the upper windows, falling past the mezzanine edge onto the floor
    var gsun = '';
    for (var gx = WX0; gx < W - 0.1; gx += 2.3125) { var ga = gx + 0.25, gb = gx + 2.05, u1 = 10.2, u2 = 17.5; gsun += poly([[ga - 0.42 * u1 + 4, u1, 0], [gb - 0.42 * u1 + 4, u1, 0], [gb - 0.42 * u2 + 4, u2, 0], [ga - 0.42 * u2 + 4, u2, 0]], K.sun); }
    if (K.shaft) floor += '<g clip-path="url(#fl-gf)" opacity="' + (K.shaft * 1.6) + '">' + gsun + '</g>';
    floor += ao([0, MD], [0, D], [1, 0], 0) + ao([0, 0], [0, MD], [1, 0], 0);
    floor += poly([[33.2, 15.4, 0], [42.6, 15.4, 0], [42.6, 21.2, 0], [33.2, 21.2, 0]], K.rug, ' stroke="' + K.rugEdge + '" stroke-width="2"');

    // ================= under the mezzanine (drawn first; the slab covers what it should) =================
    L0 = 0;
    // the server room: scripts run here
    floor += poly([[0.3, 4.6, 0], [7.4, 4.6, 0], [7.4, 8.6, 0], [0.3, 8.6, 0]], K.glow, ' opacity="0.16"');
    for (var r = 0; r < 4; r++) {
      var rx = 0.6 + r * 1.65, rk = box(rx, 5.4, 0, 1.4, 1.2, 3.9, K.rack, { left: '#30353e', right: '#23272e' });
      for (var lz = 0.5; lz < 3.6; lz += 0.36) for (var lx = 0.15; lx < 1.2; lx += 0.28) if ((r * 5 + lz * 10 + lx * 17) % 3 < 2.1) rk += poly([[rx + lx, 6.605, lz], [rx + lx + 0.12, 6.605, lz], [rx + lx + 0.12, 6.605, lz + 0.08], [rx + lx, 6.605, lz + 0.08]], (lz * 10 + lx * 10) % 4 < 1 ? '#FFC36B' : K.led);
      add(rx + 6, rk);
    }
    add(16.4, glassWall('x', 0, 7.6, 8.6, MZ - 0.45, { tint: '#BFE6E0', door: [5.6, 7.0] }));
    add(16.5, glassWall('y', 3.5, 8.6, 7.6, MZ - 0.45, { tint: '#BFE6E0' }));
    // a walnut credenza along the back, and the coffee bar
    add(9 + 8, box(9.5, 7.3, 0, 17, 1.0, 1.1, K.walnut, { left: '#5f412a', right: '#513623' }) + box(11, 7.45, 1.1, 1.4, 0.6, 0.5, '#C9BBA6') + box(16.5, 7.4, 1.1, 0.5, 0.8, 0.9, '#2E3138') + box(22, 7.45, 1.1, 2.0, 0.6, 0.25, K.paper));
    plant(13.5, 7.5, 1.6, 'snake', '#B9785A'); plant(25.4, 7.4, 1.8, 'bush');
    var bar = box(35, 6.9, 0, 5.2, 1.4, 1.55, '#B89A74', { left: '#9E8160', right: '#8A6F51' }) + box(34.9, 6.8, 1.55, 5.4, 1.6, 0.1, '#ECE7DE', { left: '#d6cfc3', right: '#c9c1b4' });
    bar += box(35.4, 6.95, 1.65, 0.85, 0.75, 0.95, '#2E3138') + box(35.55, 7.7, 1.85, 0.5, 0.06, 0.3, '#8F949C');
    bar += box(36.7, 7.3, 1.65, 0.22, 0.22, 0.24, '#FBF9F4') + box(37.1, 7.6, 1.65, 0.22, 0.22, 0.24, '#FBF9F4') + box(38.4, 7.1, 1.65, 1.0, 0.7, 0.08, '#C9BBA6');
    bar += box(38.6, 7.2, 1.73, 0.18, 0.18, 0.2, '#C98A5A') + box(38.95, 7.35, 1.73, 0.18, 0.18, 0.2, '#D9B36A');
    add(37.6 + 7.6, bar);
    plant(42.4, 6.8, 2.2, 'fig', '#B9785A');

    // ================= the mezzanine =================
    L0 = 1000;
    add(-1, box(0, 0, MZ - 0.45, W, MD, 0.45, K.mezz, { left: K.mezzFront, right: K.mezzSide }));
    var mzf = '';
    for (var my = 0.9; my < MD; my += 0.9) { var m1 = P(0, my, MZ), m2 = P(W, my, MZ); mzf += '<line x1="' + f1(m1[0]) + '" y1="' + f1(m1[1]) + '" x2="' + f1(m2[0]) + '" y2="' + f1(m2[1]) + '" stroke="' + K.mezzLine + '" stroke-width="0.8"/>'; }
    ZB = MZ;
    mzf += poly([[13.2, 0.8, 0], [25, 0.8, 0], [25, 8, 0], [13.2, 8, 0]], K.zCom) + poly([[33.2, 0, 0], [W, 0, 0], [W, 8.6, 0], [33.2, 8.6, 0]], K.zSidd);
    var shafts = '';
    for (var sx = WX0; sx < W - 0.1; sx += 2.3125) { var xa = sx + 0.15, xb = sx + 2.16, t1 = 1.0, t2 = (Z1 - MZ) / 0.55; shafts += poly([[xa - 0.42 * t1, t1, 0], [xb - 0.42 * t1, t1, 0], [xb - 0.42 * t2, t2, 0], [xa - 0.42 * t2, t2, 0]], K.sun); }
    if (K.shaft) mzf += '<g clip-path="url(#fl-mz)" opacity="' + K.shaft + '">' + shafts + '</g>';
    mzf += ao([0, 0], [W, 0], [0, 1], 0) + ao([0, 0], [0, MD], [1, 0], 0);
    add(-0.5, mzf);

    // the library: the rulebooks every seat is held to
    add(0.6 + 4.7, box(0, 0.9, 0, 0.6, 7.6, 4.2, K.walnut, { left: '#5f412a', right: '#4a3220' }) + books('x', 0.61, 1.1, 8.3, [0.3, 1.25, 2.2, 3.15]) +
      [1.15, 2.1, 3.05].map(function (z) { return poly([[0.6, 0.9, z], [0.6, 8.5, z], [0.62, 8.5, z + 0.08], [0.62, 0.9, z + 0.08]], '#4a3220'); }).join(''));
    add(3.8, box(0.8, 0, 0, 6.0, 0.6, 4.2, K.walnut, { left: '#4a3220', right: '#5f412a' }) + books('y', 0.61, 1.0, 6.6, [0.3, 1.25, 2.2, 3.15]));
    add(3 + 4.5, sofa(2.4, 3.8, 1.3, '+x', K.sofa)); add(7.2 + 4.5, sofa(7.0, 3.8, 1.3, '-x', K.sofa));
    add(5.6 + 4.4, box(4.6, 3.9, 0, 1.2, 1.1, 0.7, K.walnut, { left: '#5f412a', right: '#513623' }) + box(4.9, 4.1, 0.7, 0.6, 0.45, 0.08, K.paper));

    // the committee room
    add(19 + 4.2 - 0.6, chair(16.6, 2.4, '+y') + chair(19.1, 2.2, '+y') + chair(21.6, 2.4, '+y'));
    add(19 + 4.2, shadow(19, 4.4, 2.6, 0.08) + box(15, 3.2, 1.3, 8, 2.4, 0.16, K.walnut, { left: '#5f412a', right: '#513623' }) + box(16, 3.9, 0, 0.3, 1.0, 1.3, '#3a3f47') + box(21.7, 3.9, 0, 0.3, 1.0, 1.3, '#3a3f47'));
    add(19 + 4.2 + 0.1, personSeated(19.1, 2.05, 'front', { kind: 'model', seat: 'M3', ring: 'fl-m3-ring', reach: [[18.75, 3.55, 1.47], [19.45, 3.55, 1.47]] }));
    add(19 + 4.3, poly([[17.6, 4.1, 1.47], [18.6, 4.1, 1.47], [18.6, 4.8, 1.47], [17.6, 4.8, 1.47]], K.paper) + poly([[20.2, 4.0, 1.47], [20.9, 4.0, 1.47], [20.9, 4.6, 1.47], [20.2, 4.6, 1.47]], '#E6DFD0'));
    add(19 + 7.0, chair(16.6, 6.2, '-y') + chair(19.1, 6.4, '-y') + chair(21.6, 6.2, '-y'));
    add(25 + 8, glassWall('x', 13.2, 25, 8, 4.6, { door: [13.6, 15.2] }));
    add(13.2 + 0.5, glassWall('y', 0, 8, 13.2, 4.6));
    add(25 + 8 + 0.01, glassWall('y', 0, 8, 25, 4.6));

    // Sidd's corner office
    add(39 + 1.8, chair(39.2, 1.9, '+y', { tall: true, col: '#3B2B22', seat: '#4A372C' }));
    add(39 + 4.05, personSeated(39.2, 1.95, 'front', { arm: true, shirt: '#2B3A55', collar: '#F3EFE6', skin: K.skin1, hair: K.hair1, reach: [[38.8, 3.15, 1.49], [39.65, 3.15, 1.49]] }));
    add(39 + 4, box(36.8, 3, 0, 4.8, 2.1, 1.48, K.walnut, { left: '#5f412a', right: '#513623' }));
    var desk = '<g id="fl-memo-sidd">' + box(37.7, 3.35, 1.48, 1.2, 1.0, 0.03, K.paper) + '</g>';
    desk += '<g id="fl-stamp">' + box(38.95, 3.45, 1.48, 0.36, 0.36, 0.2, '#2E3138') + box(39.05, 3.55, 1.68, 0.16, 0.16, 0.3, '#2E3138') + box(38.98, 3.48, 1.98, 0.3, 0.3, 0.1, K.ink) + '</g>';
    desk += box(37.05, 4.6, 1.48, 0.08, 0.08, 0.75, '#2E3138') + box(36.92, 4.47, 2.2, 0.34, 0.34, 0.16, '#2E3138');
    add(39 + 4.1, desk);
    add(39 + 4.13, glow(39.6, 3.9, 1.49, 2.6, true, 0.9));
    add(39 + 4.12, poly([[40.2, 3.05, 1.49], [41.6, 3.05, 1.49], [41.6, 4.4, 1.49], [40.2, 4.4, 1.49]], '#FFE2A8', ' opacity="0.22"'));
    add(37.5 + 6.6, chair(37.6, 6.4, '-y', { col: '#6A5848', seat: '#7A6655' }) + chair(40.6, 6.4, '-y', { col: '#6A5848', seat: '#7A6655' }));
    plant(42.9, 7.4, 2.6, 'snake', '#B9785A');
    add(33.2 + 0.5, glassWall('y', 0, 8.6, 33.2, 4.6, { door: [6.8, 8.2] }));
    add(W + 8.6 + 0.5, '<g id="fl-sglass">' + glassWall('x', 33.2, W, 8.6, 4.6) + '</g>');
    // the gallery between the rooms, where the stair lands
    plant(26.2, 6.9, 2.2, 'fig'); plant(29.6, 1.0, 2.6, 'snake', '#B9785A');
    // glass balustrade along the edge, open where the stair arrives
    add(MD + W + 2, '<g id="fl-rail">' + glassWall('x', 0, 31.4, MD - 0.05, 1.15, { step: 2.2, rail: true }) + glassWall('x', 33.4, W, MD - 0.05, 1.15, { step: 2.2, rail: true }) + '</g>');
    ZB = 0;

    // ================= the open floor in front =================
    L0 = 2000;
    // the stair: risers to the mezzanine edge, with a glass rail on the open side
    var N = 12, run = 7 / N, rise = MZ / N, stair = '';
    for (var st = 0; st < N; st++) stair += box(31.4, MD + st * run, 0, 2.0, run, MZ - st * rise, '#CDAA7D', { left: '#B89A74', right: '#6B4E36' });
    var g1 = P(33.42, MD, MZ + 1.15), g2 = P(33.42, MD + 7, 1.15), g3 = P(33.42, MD + 7, 0.1), g4 = P(33.42, MD, MZ);
    stair += '<polygon points="' + [g1, g2, g3, g4].map(function (g) { return f1(g[0]) + ',' + f1(g[1]); }).join(' ') + '" fill="' + K.glass + '" opacity="0.3"/><line x1="' + f1(g1[0]) + '" y1="' + f1(g1[1]) + '" x2="' + f1(g2[0]) + '" y2="' + f1(g2[1]) + '" stroke="' + K.frame + '" stroke-width="2"/>';
    add(33.4 + MD + 3.5, stair);

    // the desk pod: six seats in two rows, the analyst's among them; the risk desk sits at its head
    var PX = [12.4, 16.7, 21.0];
    var far = [{ shirt: '#4E5D6C', skin: K.skin2, hair: K.hair1 }, { shirt: '#6B4F3A', skin: K.skin3, hair: K.hair2 }, { shirt: '#2F4A3E', skin: K.skin1, hair: K.hair3 }];
    var near = [{ shirt: '#5B4A6B', skin: K.skin3, hair: K.hair1 }, { shirt: '#8A7A5A', skin: K.skin2, hair: K.hair2 }, { shirt: K.ink, skin: K.skin1, hair: K.hair1 }];
    PX.forEach(function (x, i) {
      var o = far[i], cx = x + 2.05;
      // far row: they face the room, so the monitors show their backs
      add(cx + 11.05, chair(cx, 11.05, '+y'));
      add(cx + 12.0, shadow(cx, 12.8, 2, 0.1) + box(x, 11.9, 1.36, 4.1, 1.9, 0.1, K.desk) + box(x + 0.2, 12.05, 0, 0.18, 1.6, 1.36, K.leg) + box(x + 3.72, 12.05, 0, 0.18, 1.6, 1.36, K.leg));
      add(cx + 12.1, personSeated(cx, 11.2, 'front', { kind: 'bench', reach: [[cx - 0.35, 12.25, 1.47], [cx + 0.4, 12.25, 1.47]] }));
      add(cx + 12.9, monitorBack(x + 0.6, 12.9, 1.46) + monitorBack(x + 2.2, 12.9, 1.46) + box(x + 1.4, 12.2, 1.46, 1.3, 0.4, 0.04, '#d9d3c7'));
      // near row: backs to us, screens toward the room
      var n = near[i], analyst = i === 2, ds = shadow(cx, 14.9, 2, 0.1) + box(x, 14.0, 1.36, 4.1, 1.9, 0.1, K.desk) + box(x + 0.2, 14.15, 0, 0.18, 1.6, 1.36, K.leg) + box(x + 3.72, 14.15, 0, 0.18, 1.6, 1.36, K.leg) +
        monitor(x + 0.6, 14.2, 1.46, '+y') + monitor(x + 2.2, 14.2, 1.46, '+y') + box(x + 1.4, 15.1, 1.46, 1.3, 0.45, 0.04, '#d9d3c7');
      if (analyst) ds += box(x + 3.0, 14.4, 1.46, 0.9, 1.1, 0.16, K.paper, { left: '#d8d1c3', right: '#cbc3b4' }) + box(x + 3.05, 14.45, 1.62, 0.9, 1.1, 0.03, '#F2ECE0');
      add(cx + 15.0, ds);
      add(cx + 17.0, chair(cx, 16.6, '-y', { low: true }) + personSeated(cx, 16.45, 'back', { kind: analyst ? 'model' : 'bench', seat: 'M1', reach: [[cx - 0.35, 15.6, 1.47], [cx + 0.4, 15.6, 1.47]] }));
    });
    SP.analyst = [22.9, 14.95, 1.5];
    // the risk desk
    var RX = 26.0;
    add(RX + 1.2 + 13.6, shadow(RX + 1, 13.8, 2, 0.1) + box(RX, 11.8, 1.36, 2.1, 4.0, 0.1, K.desk) + box(RX + 0.2, 12.0, 0, 1.7, 0.18, 1.36, K.leg) + box(RX + 0.2, 15.4, 0, 1.7, 0.18, 1.36, K.leg) + monitor(RX + 0.2, 12.3, 1.46, '+x') + monitor(RX + 0.2, 13.9, 1.46, '+x'));
    // the No tray: one sheet per earlier dropped idea, so its height is the record of noes
    var tray = box(RX + 0.6, 14.5, 1.46, 1.15, 1.0, 0.12, '#CFC3AE', { left: '#bfb39e', right: '#ab9f8a' });
    for (var v = 0; v < (opt.vetoes || 0); v++) tray += box(RX + 0.68, 14.58, 1.58 + v * 0.045, 0.99, 0.84, 0.035, v % 2 ? K.paper : '#EFE9DD', { left: '#d9d2c4', right: '#cbc3b4' });
    tray += '<g id="fl-veto-new" opacity="0">' + box(RX + 0.68, 14.58, 1.58 + (opt.vetoes || 0) * 0.045, 0.99, 0.84, 0.035, K.paper, { left: '#d9d2c4', right: '#cbc3b4' }) + '</g>';
    tray += labelText('y', RX + 0.7, 15.51, 1.48, 'NO', 7, K.loss);
    trayTop = 1.58 + ((opt.vetoes || 0) + 1) * 0.045;
    add(RX + 1.2 + 15.0 + 0.4, tray);
    add(RX + 1.2 + 13.7, '<g id="fl-memo-risk">' + box(RX + 1.0, 13.0, 1.46, 0.9, 1.2, 0.03, K.paper) + poly([[RX + 1.02, 13.08, 1.5], [RX + 1.8, 13.08, 1.5], [RX + 1.8, 13.2, 1.5], [RX + 1.02, 13.2, 1.5]], K.ink) + '</g>' + poly([[RX + 1.5, 13.75, 1.51], [RX + 1.6, 13.75, 1.51], [RX + 1.95, 14.3, 1.51], [RX + 1.85, 14.3, 1.51]], K.loss));
    add(RX + 3.0 + 14, chair(RX + 3.2, 13.9, '-x', { low: true }) + personSeated(RX + 3.15, 13.9, 'back', { kind: 'model', seat: 'M2', face: '-x', reach: [[RX + 1.85, 13.45, 1.47], [RX + 1.85, 14.3, 1.47]] }));
    SP.risk = [RX + 1.35, 13.55, 1.5]; SP.tray = [RX + 1.18, 15.0];
    SP.committee = [18.1, 4.45, MZ + 1.48]; SP.sidd = [38.3, 3.85, MZ + 1.5]; SP.stamp = [39.13, 3.63, MZ + 1.48];

    // stools at the bar
    add(37 + 9.4, stool(36.2, 9.5) + stool(37.9, 9.5) + stool(39.6, 9.5));
    // the lounge: two sofas that face each other across a low table
    add(34.3 + 18.3, sofa(34.3, 16.5, 3.6, '+x', K.sofa));
    add(37.6 + 18.3, box(37.0, 17.2, 0, 1.6, 2.2, 0.55, K.walnut, { left: '#5f412a', right: '#513623' }) + box(37.3, 17.5, 0.55, 0.7, 0.5, 0.05, K.paper) + box(37.6, 18.4, 0.55, 0.25, 0.25, 0.3, '#C98A5A'));
    add(40.4 + 18.3, sofa(40.1, 16.5, 3.6, '-x', K.sofa));
    plant(43.0, 22.2, 2.6, 'fig'); plant(32.6, 21.6, 2.2, 'bush'); plant(10.2, 10.2, 2.4, 'snake', '#B9785A');

    // the lobby: reception in front of the logo wall
    add(3.6 + 21.1, box(3.0, 19.6, 0, 1.2, 3.0, 2.3, '#CDAA7D', { left: '#b28f63', right: '#9a7a52' }) + box(2.9, 19.5, 2.3, 1.4, 3.2, 0.12, '#EFE9DD') + box(3.2, 20.4, 2.42, 0.8, 1.0, 0.05, '#2E3138'));
    plant(0.5, 22.3, 2.8, 'fig');

    items.sort(function (m, n) { return m.k - n.k; });
    var body = items.map(function (i) { return i.s; }).join('');

    var minX = P(0, D, 0)[0] - 30, maxX = P(W, 0, 0)[0] + 30, minY = P(0, 0, H)[1] - 30, maxY = P(W, D, -0.9)[1] + 30;
    var vb = [minX, minY, maxX - minX, maxY - minY].map(f1);
    el.innerHTML = '<svg class="floor" xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="fl-t"><title id="fl-t">The office, on two floors. Downstairs: the logo wall and reception, the double-height wall of every call, the desk pod where the analyst and five more seats work, the risk desk at its head, the server room and a lounge. Upstairs on the mezzanine: the glass committee room, a library of rulebooks, and Sidd\'s corner office, where he signs as portfolio manager.</title><defs>' + defs + AOD + '</defs>' + back + floor + body + '<g id="fl-fx"></g></svg>';
    return { vb: vb };
  }

  function A(x, y, z) { var p = P(x, y, z); return [f1(p[0]), f1(p[1])]; }
  window.FLOOR = {
    build: build, P: P, S: S, arm: ARM, slots: slots, centers: centers, spots: SP, K: K, trayTop: function () { return trayTop; },
    anchors: {
      analyst: A(23.05, 16.45, 3.35), risk: A(29.15, 13.9, 3.35), committee: A(19.1, 2.05, MZ + 3.35),
      sidd: A(39.2, 1.95, MZ + 3.4), record: A(0, 14.0, 12.0), bench: A(14.45, 12.6, 4.4),
      scripts: A(3.8, 8.6, 3.4)
    }
  };
})();
