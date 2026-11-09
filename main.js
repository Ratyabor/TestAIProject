// Анімації вітрини: поява блоків під час прокручування, відлік цифр, паралакс фону.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  var counters = document.querySelectorAll('[data-count]');

  function format(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function count(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = null;
    var duration = 1200;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  // Без IntersectionObserver або при зменшеній анімації — показуємо все одразу.
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // ---------- Поява блоків ----------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { io.observe(el); });

  // Запасна перевірка без IntersectionObserver: спрацьовує на scroll/resize,
  // щоб контент гарантовано з'явився навіть якщо браузер затримує колбеки.
  function show(el) {
    if (el.classList.contains('is-visible')) return;
    el.classList.add('is-visible');
    el.querySelectorAll('[data-count]').forEach(count);
    io.unobserve(el);
  }
  var last = 0;
  function check() {
    var now = Date.now();
    if (now - last < 100) return;
    last = now;
    var h = window.innerHeight;
    reveals.forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      var r = el.getBoundingClientRect();
      if (r.top < h - 40) show(el); // і в межах екрана, і ті, що вже прокручені вище
    });
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  setTimeout(check, 300);

  // Лічильники поза .reveal
  counters.forEach(function (el) {
    if (el.closest('.reveal')) return;
    var o = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { count(el); o.disconnect(); }
    });
    o.observe(el);
  });

  // ---------- Паралакс фігур ----------
  var shapes = document.querySelectorAll('.bg-shapes [data-speed]');
  var ticking = false;

  function update() {
    var y = window.scrollY;
    shapes.forEach(function (s) {
      var speed = parseFloat(s.getAttribute('data-speed'));
      var rot = s.hasAttribute('data-rotate')
        ? parseFloat(s.getAttribute('data-rotate')) + y * 0.04
        : null;
      s.style.transform = 'translate3d(0,' + (y * speed).toFixed(1) + 'px,0)' +
        (rot !== null ? ' rotate(' + rot.toFixed(1) + 'deg)' : '');
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();
