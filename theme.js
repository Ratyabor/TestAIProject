// Підключається в <head>, щоб тема й лівреї застосувались до відмальовки (без «спалаху»).
// Тема: dark | light (html[data-theme]). Лівреї: red | blue (html[data-livery]).
(function () {
  var root = document.documentElement;
  root.classList.add('js'); // елементи .reveal ховаються лише коли JS працює

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // Темна «паддок»-тема — за замовчуванням; світла лише за явним вибором.
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.setAttribute('aria-checked', String(dark));
      btn.setAttribute('aria-label', dark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
    }
  }

  // Legend Red — за замовчуванням; Legend Blue — за вибором.
  function applyLivery(livery) {
    root.setAttribute('data-livery', livery);
    document.querySelectorAll('[data-set-livery]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-livery') === livery));
    });
  }

  applyTheme(load('theme') === 'light' ? 'light' : 'dark');
  applyLivery(load('livery') === 'blue' ? 'blue' : 'red');

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(root.getAttribute('data-theme'));
    applyLivery(root.getAttribute('data-livery'));

    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        save('theme', next);
      });
    }

    document.querySelectorAll('[data-set-livery]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-set-livery');
        if (next === root.getAttribute('data-livery')) return;
        applyLivery(next);
        save('livery', next);
        // main.js скидає конфігуратор на відповідну лівреї
        document.dispatchEvent(new CustomEvent('liverychange', { detail: next }));
      });
    });
  });
})();
