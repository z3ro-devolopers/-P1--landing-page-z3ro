/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE ENHANCEMENTS
   - Active nav link on scroll
   - Mobile hamburger menu
   - Scroll-to-top button
   - Scroll-progress bar
   - Project card mouse-tracking glow
   - Cursor sparkle trail
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ── Active nav highlight ──────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  function setActiveLink() {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ── Hamburger menu ────────────────────────────────────── */
  const toggle   = document.getElementById('nav-toggle');
  const navMenu  = document.getElementById('nav-menu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      navMenu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Scroll-to-top button ──────────────────────────────── */
  const scrollTopBtn = document.getElementById('scroll-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Scroll-progress bar ───────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ── Project card mouse-tracking glow ─────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });

  /* ── Cursor sparkle trail ──────────────────────────────── */
  const COLORS = ['#00ff88', '#00e5ff', '#ffffff'];
  const SPARKLE_THROTTLE_MS = 40;
  const SPARKLE_MAX = 20;

  let lastSparkle = 0;
  let sparklePool = [];

  function getSparkle() {
    const recycled = sparklePool.find(d => !d.parentNode);
    if (recycled) return recycled;
    if (sparklePool.length < SPARKLE_MAX) {
      const el = document.createElement('div');
      el.className = 'sparkle';
      sparklePool.push(el);
      return el;
    }
    return null;
  }

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastSparkle < SPARKLE_THROTTLE_MS) return;
    lastSparkle = now;

    const dot = getSparkle();
    if (!dot) return;

    dot.style.cssText = `
      left: ${e.clientX}px;
      top:  ${e.clientY}px;
      background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
      width:  ${4 + Math.random() * 4}px;
      height: ${4 + Math.random() * 4}px;
      animation: none;
    `;
    document.body.appendChild(dot);

    // Trigger reflow then re-enable animation
    void dot.offsetWidth;
    dot.style.animation = '';

    setTimeout(() => dot.remove(), 500);
  });

})();
