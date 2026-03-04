/* ═══════════════════════════════════════════════════════════════
   THREE.JS — floating particle field + rotating wireframe shapes
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 50;

  /* ── Particles ──────────────────────────────────────────── */
  const PARTICLE_COUNT = 1800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);

  const cGreen = new THREE.Color('#00ff88');
  const cCyan  = new THREE.Color('#00e5ff');

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - .5) * 140;
    positions[i * 3 + 1] = (Math.random() - .5) * 140;
    positions[i * 3 + 2] = (Math.random() - .5) * 80;

    const c = Math.random() > .5 ? cGreen : cCyan;
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: .22,
    vertexColors: true,
    transparent: true,
    opacity: .6,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Wireframe Torus ────────────────────────────────────── */
  const torusGeo = new THREE.TorusGeometry(14, 4.5, 18, 60);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    wireframe: true,
    transparent: true,
    opacity: .12,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(22, -5, -10);
  scene.add(torus);

  /* ── Wireframe Icosahedron ──────────────────────────────── */
  const icoGeo = new THREE.IcosahedronGeometry(8, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: .1,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-28, 10, -15);
  scene.add(ico);

  /* ── Grid plane ─────────────────────────────────────────── */
  const gridHelper = new THREE.GridHelper(160, 40, 0x00ff88, 0x001a0a);
  gridHelper.position.y = -30;
  gridHelper.material.opacity = .1;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  /* ── Mouse parallax ─────────────────────────────────────── */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
  });

  /* ── Resize ─────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Animation loop ─────────────────────────────────────── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += .005;

    particles.rotation.y = t * .06;
    particles.rotation.x = t * .02;

    torus.rotation.x += .003;
    torus.rotation.y += .005;

    ico.rotation.x += .004;
    ico.rotation.z += .003;

    // gentle mouse parallax
    camera.position.x += (mouseX * 4 - camera.position.x) * .03;
    camera.position.y += (-mouseY * 3 - camera.position.y) * .03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();
