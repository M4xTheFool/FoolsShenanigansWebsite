
(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  function current() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label() { button.textContent = current() === 'dark' ? 'Light theme' : 'Dark theme'; }
  button.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('lotm-theme', next); } catch (e) {}  // the website's other pages follow
    label();
  });
  label();
  // The relationship web: resting on someone shows only their connections.
  document.querySelectorAll('svg.web').forEach(function (svg) {
    var edges = svg.querySelectorAll('.edge');
    svg.querySelectorAll('.node').forEach(function (node) {
      var i = node.getAttribute('data-i');
      node.addEventListener('mouseenter', function () {
        svg.classList.add('focus');
        node.classList.add('on');
        edges.forEach(function (e) {
          var a = e.getAttribute('data-a'), b = e.getAttribute('data-b');
          if (a !== i && b !== i) return;
          e.classList.add('on');
          var other = svg.querySelector('.node[data-i="' + (a === i ? b : a) + '"]');
          if (other) other.classList.add('on');
        });
      });
      node.addEventListener('mouseleave', function () {
        svg.classList.remove('focus');
        svg.querySelectorAll('.on').forEach(function (e) { e.classList.remove('on'); });
      });
    });
  });
})();

(function () {
  var find = document.getElementById('find');
  if (!find) return;
  function plain(text) {
    text = (text || '').toLowerCase();
    return text.normalize ? text.normalize('NFD').replace(/[̀-ͯ]/g, '') : text;
  }
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  cards.forEach(function (card) { card.words = plain(card.getAttribute('data-search') + ' ' + card.textContent); });
  var groups = document.querySelectorAll('.group');
  var features = document.querySelector('.features');
  var none = document.getElementById('none');
  var chips = document.querySelectorAll('.chip');
  var shown = 'all';
  function update() {
    var words = plain(find.value).split(/\s+/).filter(function (w) { return w; });
    var any = false;
    cards.forEach(function (card) {
      var match = (shown === 'all' || card.getAttribute('data-group') === shown) &&
        words.every(function (w) { return card.words.indexOf(w) >= 0; });
      card.hidden = !match;
      any = any || match;
    });
    groups.forEach(function (group) {
      var all = group.querySelectorAll('.card').length, found = group.querySelectorAll('.card:not([hidden])').length;
      group.hidden = found === 0;
      group.querySelector('.count').textContent = found === all ? all : found + ' of ' + all;
    });
    if (features) features.hidden = words.length > 0 || shown !== 'all';
    none.hidden = any;
    none.textContent = words.length ? 'Nothing matches “' + find.value.trim() + '”.' : 'Nothing here.';
    try {
      var url = find.value.trim() ? '?q=' + encodeURIComponent(find.value.trim()) : location.pathname;
      history.replaceState(null, '', url + location.hash);
    } catch (e) {}
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      shown = chip.getAttribute('data-group');
      chips.forEach(function (c) { c.classList.toggle('on', c === chip); });
      update();
    });
  });
  find.addEventListener('input', update);
  find.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { find.value = ''; update(); }
    if (e.key === 'Enter') {
      var first = document.querySelector('.card:not([hidden])');
      if (first && find.value.trim()) location.href = first.getAttribute('href');
    }
  });
  var q = null;
  try { q = new URLSearchParams(location.search).get('q'); } catch (e) {}
  if (q) { find.value = q; update(); }
})();
