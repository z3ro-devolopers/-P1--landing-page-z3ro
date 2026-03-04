/* ═══════════════════════════════════════════════════════════════
   HACKER 3D BACKGROUND — monochrome node-network + grid
   Scene:
     1. Infinite perspective grid floor (B&W)
     2. Floating node cloud with connecting edges (neural-net look)
     3. Large rotating wireframe sphere (the "core")
     4. Mouse parallax camera tilt
     5. Click shockwave — ripples outward through nodes
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 8, 60);
  camera.lookAt(0, 0, 0);

  /* ── 1. Perspective grid floor ──────────────────────────── */
  const gridMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: .045,
  });

  const GRID_SIZE   = 200;
  const GRID_DIV    = 30;
  const GRID_STEP   = GRID_SIZE / GRID_DIV;
  const gridLines   = new THREE.Group();

  for (let i = 0; i <= GRID_DIV; i++) {
    const x = -GRID_SIZE / 2 + i * GRID_STEP;
    const gx = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, -GRID_SIZE / 2),
      new THREE.Vector3(x, 0,  GRID_SIZE / 2),
    ]);
    gridLines.add(new THREE.Line(gx, gridMat));

    const z = -GRID_SIZE / 2 + i * GRID_STEP;
    const gz = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-GRID_SIZE / 2, 0, z),
      new THREE.Vector3( GRID_SIZE / 2, 0, z),
    ]);
    gridLines.add(new THREE.Line(gz, gridMat));
  }

  gridLines.position.y = -22;
  scene.add(gridLines);

  /* ── 2. Node cloud ──────────────────────────────────────── */
  const NODE_COUNT          = 120;
  const LINK_DIST           = 14;    // max distance to draw an edge
  const SPREAD              = 55;
  const DAMPING_FACTOR      = 0.985; // velocity decay per frame
  const RIPPLE_WIDTH        = 3;     // radial thickness of the ripple wavefront
  const RIPPLE_STRENGTH     = 0.6;   // impulse magnitude at the wavefront
  const EDGE_OPACITY_FACTOR = 0.35;  // edge alpha scale (closer = brighter)

  // Node positions (stable, slight random drift)
  const nodePos = [];
  const nodeVel = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodePos.push(new THREE.Vector3(
      (Math.random() - .5) * SPREAD,
      (Math.random() - .5) * SPREAD * .65,
      (Math.random() - .5) * SPREAD,
    ));
    nodeVel.push(new THREE.Vector3(
      (Math.random() - .5) * .008,
      (Math.random() - .5) * .006,
      (Math.random() - .5) * .008,
    ));
  }

  // Nodes as Points
  const nodePosArr = new Float32Array(NODE_COUNT * 3);
  nodePos.forEach((p, i) => {
    nodePosArr[i * 3]     = p.x;
    nodePosArr[i * 3 + 1] = p.y;
    nodePosArr[i * 3 + 2] = p.z;
  });

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePosArr, 3));

  const nodeMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: .35,
    transparent: true,
    opacity: .55,
    sizeAttenuation: true,
  });

  const nodeCloud = new THREE.Points(nodeGeo, nodeMat);
  scene.add(nodeCloud);

  // Edges between nodes
  const MAX_LINES    = NODE_COUNT * NODE_COUNT;
  const edgePosArr   = new Float32Array(MAX_LINES * 6);  // 2 vertices × 3 floats
  const edgeColorArr = new Float32Array(MAX_LINES * 6);

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePosArr, 3).setUsage(THREE.DynamicDrawUsage));
  edgeGeo.setAttribute('color',    new THREE.BufferAttribute(edgeColorArr, 3).setUsage(THREE.DynamicDrawUsage));

  const edgeMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

  const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edgeMesh);

  /* ── 3. Wireframe sphere (the "core") ────────────────────── */
  const sphereGeo = new THREE.IcosahedronGeometry(12, 3);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: .045,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(0, 0, -20);
  scene.add(sphere);

  // Inner smaller sphere for depth
  const sphereInGeo = new THREE.IcosahedronGeometry(6, 2);
  const sphereInMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: .07,
  });
  const sphereIn = new THREE.Mesh(sphereInGeo, sphereInMat);
  sphereIn.position.set(0, 0, -20);
  scene.add(sphereIn);

  /* ── 4. Shockwave ripple on click ───────────────────────── */
  // We store a list of active ripples: { origin, t }
  const ripples = [];
  const RIPPLE_SPEED  = 18;
  const RIPPLE_RADIUS = 30;

  canvas.parentElement.addEventListener('click', e => {
    // Convert click to 3D ray, pick a point on a plane z=0
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth)  * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    ripples.push({ origin: target.clone(), t: 0 });
  });

  /* ── 5. Mouse parallax ───────────────────────────────────── */
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

  /* ── Helpers ─────────────────────────────────────────────── */
  const _tmp = new THREE.Vector3();

  function distSq(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /* ── Animation loop ─────────────────────────────────────── */
  let lineCount = 0;

  function animate() {
    requestAnimationFrame(animate);

    /* Move nodes (slow drift, wrap bounds) */
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = nodePos[i];
      const v = nodeVel[i];

      // Apply ripple impulse
      for (const rip of ripples) {
        _tmp.subVectors(p, rip.origin);
        const d = _tmp.length();
        const front = rip.t * RIPPLE_SPEED;
        if (Math.abs(d - front) < RIPPLE_WIDTH) {
          const strength = RIPPLE_STRENGTH * (1 - front / RIPPLE_RADIUS);
          _tmp.normalize().multiplyScalar(strength);
          v.add(_tmp);
        }
      }

      // Dampen velocity
      v.multiplyScalar(DAMPING_FACTOR);

      p.add(v);

      // Soft boundary bounce
      const H = SPREAD / 2;
      if (p.x >  H || p.x < -H) { v.x *= -1; p.x = Math.max(-H, Math.min(H, p.x)); }
      if (p.y >  H * .65 || p.y < -H * .65) { v.y *= -1; p.y = Math.max(-H * .65, Math.min(H * .65, p.y)); }
      if (p.z >  H || p.z < -H) { v.z *= -1; p.z = Math.max(-H, Math.min(H, p.z)); }

      nodePosArr[i * 3]     = p.x;
      nodePosArr[i * 3 + 1] = p.y;
      nodePosArr[i * 3 + 2] = p.z;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    // Age out ripples
    for (let r = ripples.length - 1; r >= 0; r--) {
      ripples[r].t += 1;
      if (ripples[r].t * RIPPLE_SPEED > RIPPLE_RADIUS * 1.3) ripples.splice(r, 1);
    }

    /* Rebuild edges */
    lineCount = 0;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const d2 = distSq(nodePos[i], nodePos[j]);
        if (d2 > LINK_DIST_SQ) continue;

        const alpha = 1 - Math.sqrt(d2) / LINK_DIST;
        const base  = lineCount * 6;

        edgePosArr[base]     = nodePos[i].x;
        edgePosArr[base + 1] = nodePos[i].y;
        edgePosArr[base + 2] = nodePos[i].z;
        edgePosArr[base + 3] = nodePos[j].x;
        edgePosArr[base + 4] = nodePos[j].y;
        edgePosArr[base + 5] = nodePos[j].z;

        // White colour, fades with distance
        const c = alpha * EDGE_OPACITY_FACTOR;
        edgeColorArr[base]     = c; edgeColorArr[base + 1] = c; edgeColorArr[base + 2] = c;
        edgeColorArr[base + 3] = c; edgeColorArr[base + 4] = c; edgeColorArr[base + 5] = c;

        lineCount++;
      }
    }

    edgeGeo.setDrawRange(0, lineCount * 2);
    edgeGeo.attributes.position.needsUpdate = true;
    edgeGeo.attributes.color.needsUpdate    = true;

    /* Rotate core sphere */
    sphere.rotation.x   += .0008;
    sphere.rotation.y   += .0015;
    sphereIn.rotation.x -= .001;
    sphereIn.rotation.z += .0012;

    /* Slow grid scroll — creates the "moving through cyberspace" feel */
    gridLines.position.z = (gridLines.position.z + .04) % GRID_STEP;

    /* Mouse parallax */
    camera.position.x += (mouseX * 6  - camera.position.x) * .025;
    camera.position.y += (-mouseY * 4 + 8 - camera.position.y) * .025;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
