/* A still crop of the homepage office, drawn by the same scene code (floor.js), at the top of each inner page.
   Decorative: no animation, no pointer events. One per page: FLOOR.build uses fixed ids inside the svg. */
(function () {
  var host = document.querySelector('[data-vignette]');
  if (!host || !window.FLOOR) return;
  var F = window.FLOOR, a = F.anchors;
  // [centre anchors, half-width in scene px]; height follows the box aspect ratio.
  var CROPS = {
    desk: { at: ['analyst', 'risk', 'bench'], w: 640, dx: -10, dy: 20 },
    committee: { at: ['committee', 'sidd'], w: 760, dx: 0, dy: 40 },
    record: { at: ['record'], w: 580, dx: 30, dy: 40 }
  };
  var c = CROPS[host.getAttribute('data-vignette')];
  if (!c) return;
  host.setAttribute('aria-hidden', 'true');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function draw() {
    F.build(host, mq.matches, { vetoes: 3 });
    var svg = host.querySelector('svg'); if (!svg) return;
    svg.removeAttribute('role'); svg.removeAttribute('aria-labelledby');
    var t = svg.querySelector('title'); if (t) t.remove();
    svg.setAttribute('focusable', 'false');
    var cx = 0, cy = 0;
    c.at.forEach(function (k) { cx += a[k][0]; cy += a[k][1]; });
    cx = cx / c.at.length + c.dx; cy = cy / c.at.length + c.dy;
    var r = host.clientWidth && host.clientHeight ? host.clientHeight / host.clientWidth : 0.75;
    var w = c.w, h = w * r;
    svg.setAttribute('viewBox', [cx - w / 2, cy - h / 2, w, h].map(function (n) { return n.toFixed(1); }).join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  }
  draw();
  if (mq.addEventListener) mq.addEventListener('change', draw); else if (mq.addListener) mq.addListener(draw);
  var last = host.clientWidth;
  window.addEventListener('resize', function () { if (host.clientWidth !== last) { last = host.clientWidth; draw(); } });
})();
