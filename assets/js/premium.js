/* Premium interactions — progressive enhancement, safe to fail.
   navbar state, reading progress, ⌘K palette, terminal, split-text, tilt, magnetic. */
(function () {
  'use strict';

  var nav = document.querySelector('.navbar.fixed-top');
  var prog = document.querySelector('.p-progress');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Navbar solid-on-scroll + reading progress --- */
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* --- Command palette (⌘K / Ctrl+K) — functional, runs even reduced-motion --- */
  (function () {
    var root = document.getElementById('cmdk');
    if (!root) return;
    var input = root.querySelector('.p-cmdk-input');
    var list = root.querySelector('.p-cmdk-list');
    function go(hash) { close(); var el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    function ext(url) { close(); window.open(url, '_blank', 'noopener'); }
    function theme() { var cb = document.getElementById('theme-mode'); if (cb) cb.click(); close(); }
    var commands = [
      { i: '#', label: 'Início', hint: 'home', run: function () { go('#inicio'); } },
      { i: '#', label: 'Competências', hint: 'skills', run: function () { go('#servicos'); } },
      { i: '#', label: 'Trabalhos', hint: 'work', run: function () { go('#trabalhos'); } },
      { i: '#', label: 'Acerca', hint: 'about', run: function () { go('#acerca'); } },
      { i: '↗', label: 'Contactar no WhatsApp', hint: 'whatsapp', run: function () { ext('https://wa.me/+258841357516'); } },
      { i: '↗', label: 'Enviar email', hint: 'mail', run: function () { close(); location.href = 'mailto:aderitodebarros@gmail.com'; } },
      { i: '↗', label: 'GitHub', hint: 'github', run: function () { ext('https://github.com/aderitodebarros'); } },
      { i: '↗', label: 'LinkedIn', hint: 'linkedin', run: function () { ext('https://www.linkedin.com/in/ad%C3%A9rito-de-barros-798bb2229/'); } },
      { i: '◐', label: 'Alternar tema claro / escuro', hint: 'theme', run: theme }
    ];
    var filtered = commands.slice(), sel = 0;
    function render() {
      list.innerHTML = '';
      if (!filtered.length) { list.innerHTML = '<li class="p-cmdk-empty">Sem resultados.</li>'; return; }
      filtered.forEach(function (c, idx) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', idx === sel ? 'true' : 'false');
        li.innerHTML = '<span class="i"></span><span class="lbl"></span><span class="hint"></span>';
        li.children[0].textContent = c.i;
        li.children[1].textContent = c.label;
        li.children[2].textContent = c.hint;
        li.addEventListener('click', c.run);
        li.addEventListener('mousemove', function () { if (sel !== idx) { sel = idx; mark(); } });
        list.appendChild(li);
      });
    }
    function mark() { Array.prototype.forEach.call(list.children, function (li, idx) { li.setAttribute('aria-selected', idx === sel ? 'true' : 'false'); }); }
    function filt(q) { q = q.trim().toLowerCase(); filtered = q ? commands.filter(function (c) { return (c.label + ' ' + c.hint).toLowerCase().indexOf(q) >= 0; }) : commands.slice(); sel = 0; render(); }
    function openP() { root.hidden = false; input.value = ''; filt(''); setTimeout(function () { input.focus(); }, 30); }
    function close() { root.hidden = true; }
    function ensure() { var li = list.children[sel]; if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' }); }
    input.addEventListener('input', function () { filt(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); mark(); ensure(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); ensure(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filtered[sel]) filtered[sel].run(); }
      else if (e.key === 'Escape') { close(); }
    });
    root.querySelector('.p-cmdk-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); root.hidden ? openP() : close(); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cmdk-open]'), function (b) { b.addEventListener('click', openP); });
    render();
  })();

  /* --- Terminal (whoami) --- */
  (function () {
    var out = document.getElementById('termOut');
    if (!out) return;
    var seq = [
      { c: 'pr', x: '$ ' }, { c: '', x: 'whoami\n' },
      { c: 'ou', x: 'Adérito De Barros — Full-Stack Developer\n' },
      { c: 'pr', x: '$ ' }, { c: '', x: 'cat stack.txt\n' },
      { c: 'ou', x: 'Laravel · Vue.js · MySQL · M-Pesa · Git\n' },
      { c: 'pr', x: '$ ' }
    ];
    function span(c, txt) { var s = document.createElement('span'); if (c) s.className = c; s.textContent = txt; out.appendChild(s); }
    if (reduce) { seq.forEach(function (l) { span(l.c, l.x); }); return; }
    var li = 0, ci = 0, cur = null;
    function step() {
      if (li >= seq.length) return;
      var l = seq[li];
      if (ci === 0) { cur = document.createElement('span'); if (l.c) cur.className = l.c; out.appendChild(cur); }
      cur.textContent += l.x.charAt(ci++);
      if (ci >= l.x.length) { li++; ci = 0; setTimeout(step, l.c === 'ou' ? 430 : 110); }
      else { setTimeout(step, l.c === '' ? 60 : 9); }
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); setTimeout(step, 250); } });
    }, { threshold: .4 });
    io.observe(out.closest('.p-term') || out);
  })();

  if (reduce) return; // remaining effects are motion

  /* --- Split-text reveal on the hero headline --- */
  (function () {
    var h1 = document.querySelector('#inicio h1');
    if (!h1) return;
    var frag = document.createDocumentFragment(), i = 0;
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (chunk === '') return;
          if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'p-word'; w.textContent = chunk;
          w.style.animationDelay = (0.12 + i * 0.06) + 's'; i++; frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        var w = document.createElement('span'); w.className = 'p-word';
        w.style.animationDelay = (0.12 + i * 0.06) + 's'; i++;
        w.appendChild(node.cloneNode(true)); frag.appendChild(w);
      }
    });
    h1.textContent = ''; h1.appendChild(frag); h1.classList.add('p-split');
  })();

  /* --- 3D tilt --- */
  function addTilt(el, max) {
    var rect = null;
    el.addEventListener('mouseenter', function () { rect = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', function (e) {
      if (!rect) rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = 'rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; rect = null; });
  }
  var mockup = document.querySelector('#inicio .p-browser');
  if (mockup) addTilt(mockup, 5);
  Array.prototype.forEach.call(document.querySelectorAll('.p-project .p-figure'), function (el) { addTilt(el, 6); });

  /* --- Magnetic buttons --- */
  Array.prototype.forEach.call(document.querySelectorAll('.btn-lg'), function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });
})();
