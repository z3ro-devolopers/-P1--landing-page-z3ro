/* ═══════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — scroll-reveal + skill bars
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      const bar = el.querySelector('.skill-bar-fill');
      if (bar) bar.style.width = bar.dataset.level + '%';

      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  // Observe existing + dynamically added .reveal elements
  function observeAll() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Skills are injected by skills.js — wait a tick before observing
  setTimeout(observeAll, 0);
})();
