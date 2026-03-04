/* ═══════════════════════════════════════════════════════════════
   TYPING EFFECT
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const phrases = [
    'Full-Stack Developer',
    'Systems Engineer',
    'Security Enthusiast',
    'Open-Source Hacker',
  ];
  const el = document.getElementById('typed-role');
  if (!el) return;

  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }

  tick();
})();
