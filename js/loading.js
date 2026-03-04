/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN — terminal boot sequence
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const BOOT_LINES = [
    { delay: 0,    text: '<span class="t-prompt">z3ro@dev:~$ </span>./boot --init' },
    { delay: 300,  text: '<span class="t-ok">[  OK  ]</span> Loading kernel modules...' },
    { delay: 600,  text: '<span class="t-ok">[  OK  ]</span> Mounting filesystems...' },
    { delay: 900,  text: '<span class="t-ok">[  OK  ]</span> Starting network services...' },
    { delay: 1200, text: '<span class="t-warn">[ WARN ]</span> Coffee level: critical — injecting caffeine...' },
    { delay: 1600, text: '<span class="t-ok">[  OK  ]</span> Initialising WebGL renderer...' },
    { delay: 2000, text: '<span class="t-ok">[  OK  ]</span> System ready. Welcome, visitor.' },
  ];

  const loader   = document.getElementById('loader');
  const tbody    = document.querySelector('.loader-terminal-body');
  const fill     = document.querySelector('.loader-progress-fill');
  const pctLabel = document.querySelector('.loader-pct');

  if (!loader) return;

  // Animate boot lines + progress bar
  BOOT_LINES.forEach((item, i) => {
    setTimeout(() => {
      const line = document.createElement('span');
      line.className = 'loader-line';
      line.innerHTML = item.text;
      tbody.appendChild(line);
      tbody.scrollTop = tbody.scrollHeight;

      const pct = Math.round(((i + 1) / BOOT_LINES.length) * 100);
      fill.style.width = pct + '%';
      if (pctLabel) pctLabel.textContent = pct + '%';
    }, item.delay);
  });

  // Dismiss loader after all lines + small buffer
  const total = BOOT_LINES[BOOT_LINES.length - 1].delay + 600;
  setTimeout(() => {
    loader.classList.add('hidden');
  }, total);
})();
