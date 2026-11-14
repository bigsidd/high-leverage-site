/* Phone header: one row with a Menu button; the nav opens below it. Desktop shows the nav and never sees the button. */
(function () {
  var b = document.querySelector('.bar .menu'); if (!b) return;
  b.addEventListener('click', function () { var o = b.closest('.bar').classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
})();
