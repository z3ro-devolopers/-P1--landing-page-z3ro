/* ═══════════════════════════════════════════════════════════════
   SKILLS — render cards into #skills-grid
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const skills = [
    { name: 'JavaScript / TS', level: 92 },
    { name: 'Python',          level: 88 },
    { name: 'Rust',            level: 74 },
    { name: 'Go',              level: 80 },
    { name: 'Linux / Shell',   level: 90 },
    { name: 'Docker / K8s',    level: 78 },
    { name: 'WebGL / Three.js',level: 70 },
    { name: 'Security / CTF',  level: 65 },
  ];

  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  skills.forEach(s => {
    const card = document.createElement('div');
    card.className = 'skill-card reveal';

    const nameRow = document.createElement('div');
    nameRow.className = 'skill-name';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = s.name;

    const pctSpan = document.createElement('span');
    pctSpan.className = 'skill-pct';
    pctSpan.textContent = s.level + '%';

    nameRow.appendChild(nameSpan);
    nameRow.appendChild(pctSpan);

    const barBg = document.createElement('div');
    barBg.className = 'skill-bar-bg';

    const barFill = document.createElement('div');
    barFill.className = 'skill-bar-fill';
    barFill.dataset.level = s.level;

    barBg.appendChild(barFill);
    card.appendChild(nameRow);
    card.appendChild(barBg);
    grid.appendChild(card);
  });
})();
