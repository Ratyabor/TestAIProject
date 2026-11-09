// Підключається в <head>, щоб тема застосувалась до відмальовки (без «спалаху»).
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  root.classList.add('js'); // елементи .reveal ховаються лише коли JS працює

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  // Темна «паддок»-тема — за замовчуванням; світла лише за явним вибором.
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.setAttribute('aria-checked', String(dark));
      btn.setAttribute('aria-label', dark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
    }
  }

  apply(saved() || 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    apply(root.getAttribute('data-theme'));
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  });
})();
