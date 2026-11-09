// Інтерактив вітрини: поява блоків, лічильники, історія-«траса»,
// хотспоти дизайну, конфігуратор лівреї та анімація діаграми 240°.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- Лічильники ---------- */
  function format(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function count(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    if (reduce) return;
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

  /* ---------- Поява блоків ----------
     Сама анімація — у CSS (scroll-driven або transition). Тут лише ставимо
     .is-visible: від нього залежать лічильники, тахометр і діаграма 240°. */
  var watched = document.querySelectorAll('.reveal, .firing-visual, .stagger');

  function show(el) {
    if (el.classList.contains('is-visible')) return;
    el.classList.add('is-visible');
    el.querySelectorAll('[data-count]').forEach(count);
  }

  if (!('IntersectionObserver' in window)) {
    watched.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    watched.forEach(function (el) { io.observe(el); });

    // Запасна перевірка: блоки, вже прокручені вище екрана, теж показуємо.
    var last = 0;
    var check = function () {
      var now = Date.now();
      if (now - last < 100) return;
      last = now;
      var h = window.innerHeight;
      watched.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        if (el.getBoundingClientRect().top < h - 40) { show(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    setTimeout(check, 300);
  }

  /* ---------- Історія: горизонтальна траса ---------- */
  var laps = document.querySelector('.laps');
  if (laps) {
    var nav = document.querySelector('.laps-nav');
    var progress = document.querySelector('.laps-progress');
    var bar = progress && progress.querySelector('i');
    var prev = nav && nav.querySelector('[data-dir="-1"]');
    var next = nav && nav.querySelector('[data-dir="1"]');
    if (nav) nav.hidden = false;
    if (progress) progress.hidden = false;

    var updateLaps = function () {
      var max = laps.scrollWidth - laps.clientWidth;
      var p = max > 0 ? laps.scrollLeft / max : 1;
      var visible = max > 0 ? laps.clientWidth / laps.scrollWidth : 1;
      if (bar) bar.style.setProperty('--p', (visible + (1 - visible) * p).toFixed(3));
      if (prev) prev.disabled = laps.scrollLeft <= 2;
      if (next) next.disabled = laps.scrollLeft >= max - 2;
    };
    if (nav) {
      nav.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-dir]');
        if (!btn) return;
        var card = laps.querySelector('.lap');
        var step = card ? card.getBoundingClientRect().width + 20 : laps.clientWidth * .8;
        laps.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
      });
    }
    laps.addEventListener('scroll', updateLaps, { passive: true });
    window.addEventListener('resize', updateLaps);
    updateLaps();
  }

  /* ---------- Дизайн: хотспоти ↔ список ---------- */
  var spots = document.querySelectorAll('.hotspot');
  function activate(id) {
    spots.forEach(function (s) { s.classList.toggle('is-active', s.dataset.target === id); });
    document.querySelectorAll('.feature-list li').forEach(function (li) {
      li.classList.toggle('is-active', li.id === id);
    });
  }
  spots.forEach(function (s) {
    s.addEventListener('click', function () { activate(s.dataset.target); });
    s.addEventListener('focus', function () { activate(s.dataset.target); });
    s.addEventListener('mouseenter', function () { activate(s.dataset.target); });
  });
  document.querySelectorAll('.feature-list li').forEach(function (li) {
    li.addEventListener('mouseenter', function () { activate(li.id); });
  });

  /* ---------- Кольори: вкладки поколінь ---------- */
  var tablist = document.querySelector('.tabs[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tablist.hidden = false;
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }

  /* ---------- Кольори: конфігуратор лівреї ---------- */
  var stageTank = document.querySelector('[data-stage-tank]');
  if (stageTank) {
    var fields = {
      name: document.querySelector('[data-stage-name]'),
      year: document.querySelector('[data-stage-year]'),
      model: document.querySelector('[data-stage-model]'),
      desc: document.querySelector('[data-stage-desc]')
    };
    var swatches = document.querySelectorAll('.sw[data-livery]');
    var selectSwatch = function (sw) {
        swatches.forEach(function (o) { o.setAttribute('aria-pressed', String(o === sw)); });
        var name = sw.querySelector('.sw-name').textContent;
        stageTank.className = 'tank ' + sw.dataset.livery;
        stageTank.setAttribute('aria-label', 'Схема фарбування ' + name);
        fields.name.textContent = name;
        fields.year.textContent = sw.dataset.year;
        fields.model.textContent = sw.dataset.model;
        fields.desc.textContent = sw.dataset.desc;
    };
    // Сцена стартує з лівреї, обраної в шапці (червона або синя)
    var siteSwatch = function () {
      var cls = root.getAttribute('data-livery') === 'blue' ? 't-legend-blue' : 't-legend-red';
      return document.querySelector('.sw[data-livery="' + cls + '"]');
    };
    if (siteSwatch()) selectSwatch(siteSwatch());
    // Перемикач у шапці: прибрати акцент конфігуратора й показати відповідний бак
    document.addEventListener('liverychange', function () {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-ink');
      if (siteSwatch()) selectSwatch(siteSwatch());
    });
    swatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        swatches.forEach(function (o) { o.setAttribute('aria-pressed', String(o === sw)); });
        var name = sw.querySelector('.sw-name').textContent;
        stageTank.className = 'tank ' + sw.dataset.livery;
        stageTank.setAttribute('aria-label', 'Схема фарбування ' + name);
        fields.name.textContent = name;
        fields.year.textContent = sw.dataset.year;
        fields.model.textContent = sw.dataset.model;
        fields.desc.textContent = sw.dataset.desc;
        // Акцент усього сайту підлаштовується під обрану ліврею
        root.style.setProperty('--accent', sw.dataset.accent);
        root.style.setProperty('--accent-ink', sw.dataset.ink);
      });
    });
  }
})();
