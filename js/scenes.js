// Shared 3D building blocks: viewer, glow sprites, labels, n-cube projector, compact / Calabi-Yau / brane views, hero, platform.
(function () {
  const T = THREE;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  HD.reduceMotion = reduceMotion;
  HD.col = { cyan: 0x52d6e6, gold: 0xf3b84e, rose: 0xf0708e, ok: 0x4fd08f, fg: 0xe9edf8, muted: 0x8f99bd, line: 0x24305a, ink: 0x070a14 };

  // cyan -> gold -> rose
  HD.ramp = function (t) {
    const a = new T.Color(HD.col.cyan), b = new T.Color(HD.col.gold), c = new T.Color(HD.col.rose);
    return t < 0.5 ? a.lerp(b, t * 2) : b.clone().lerp(c, (t - 0.5) * 2);
  };

  let glowTex = null;
  HD.glowTexture = function () {
    if (glowTex) return glowTex;
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.25, "rgba(255,255,255,0.75)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    glowTex = new T.CanvasTexture(c);
    return glowTex;
  };

  HD.glowMaterial = (color, size) => new T.PointsMaterial({ color, size, map: HD.glowTexture(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true });

  HD.glowPoint = function (color, size, pos) {
    const g = new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(pos || [0, 0, 0], 3));
    return new T.Points(g, HD.glowMaterial(color, size));
  };

  HD.label = function (text, color, opts) {
    opts = opts || {};
    const fs = opts.size || 44, pad = 18;
    const c = document.createElement("canvas"), g = c.getContext("2d");
    g.font = `800 ${fs}px "Big Shoulders Display", "Arial Narrow", sans-serif`;
    const w = Math.ceil(g.measureText(upper(text)).width) + pad * 2, h = fs + pad * 1.4;
    c.width = w; c.height = h;
    g.font = `800 ${fs}px "Big Shoulders Display", "Arial Narrow", sans-serif`;
    if (opts.bg !== false) {
      g.fillStyle = "rgba(7,10,20,0.78)"; g.strokeStyle = opts.border || "rgba(36,48,90,1)"; g.lineWidth = 3;
      roundRect(g, 1.5, 1.5, w - 3, h - 3, 10); g.fill(); g.stroke();
    }
    g.fillStyle = color || "#e9edf8"; g.textBaseline = "middle"; g.textAlign = "center";
    g.fillText(upper(text), w / 2, h / 2 + 2);
    const tex = new T.CanvasTexture(c); tex.minFilter = T.LinearFilter;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: opts.depthTest !== false }));
    const k = opts.scale || 0.5; // world-space height of the label
    s.scale.set(k * w / h, k, 1);
    return s;
  };
  // keep µ as µ: String.toUpperCase turns it into Greek capital Mu, which reads as "M"
  const upper = t => t.toUpperCase().replace(/Μ/g, "µ");
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  HD.stars = function (count, radius) {
    const p = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = radius * (0.6 + Math.random() * 0.4), s = Math.sqrt(1 - u * u);
      p.push(r * s * Math.cos(th), r * u, r * s * Math.sin(th));
    }
    const g = new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(p, 3));
    return new T.Points(g, new T.PointsMaterial({ color: 0x9fb0e0, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false }));
  };

  // ---------- Viewer: one renderer per canvas, renders only while on screen ----------
  HD.Viewer = function (canvas, opts) {
    opts = opts || {};
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(opts.fov || 40, 1.4, 0.05, 400);
    camera.position.set(...(opts.cam || [6, 4, 8]));
    const controls = new T.OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.enableZoom = false; controls.enablePan = false;
    controls.autoRotate = !reduceMotion && opts.autoRotate !== false; controls.autoRotateSpeed = opts.spin || 0.6;
    controls.target.set(...(opts.target || [0, 0, 0]));

    scene.add(new T.AmbientLight(0x8090c0, 0.55));
    const key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(5, 8, 6); scene.add(key);
    const rim1 = new T.PointLight(HD.col.cyan, 0.9, 40); rim1.position.set(-8, 3, -4); scene.add(rim1);
    const rim2 = new T.PointLight(HD.col.gold, 0.7, 40); rim2.position.set(8, -2, 5); scene.add(rim2);
    if (opts.stars !== false) scene.add(HD.stars(500, 60));

    let content = null, visible = true, t0 = performance.now();
    const v = { scene, camera, renderer, controls, canvas };
    v.set = function (c) {
      if (content) { scene.remove(content.group); dispose(content.group); }
      content = c; if (c) scene.add(c.group);
      if (c && c.cam) { camera.position.set(...c.cam); controls.target.set(...(c.target || [0, 0, 0])); controls.update(); }
    };
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      }
    }
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(canvas);
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) return;
      resize();
      const t = reduceMotion ? 0 : (now - t0) / 1000;
      if (content && content.update) content.update(t, v);
      if (opts.onFrame) opts.onFrame(t);
      controls.update();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    return v;
  };

  function dispose(o) {
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) (Array.isArray(n.material) ? n.material : [n.material]).forEach(m => { if (m.map && m.map !== glowTex) m.map.dispose(); m.dispose(); });
    });
  }

  // ---------- n-cube projected to 3D ----------
  HD.NCube = function (n, opts) {
    opts = opts || {};
    const group = new T.Group();
    if (n === 0) {
      const p = HD.glowPoint(HD.col.gold, 1.4); group.add(p);
      const halo = HD.glowPoint(HD.col.cyan, 3.2); halo.material.opacity = 0.35; group.add(halo);
      return { group, update: t => { const s = 1 + 0.12 * Math.sin(t * 2.4); halo.scale.setScalar(s); } };
    }
    const V = 1 << n, verts = [];
    for (let i = 0; i < V; i++) { const v = []; for (let k = 0; k < n; k++) v.push(i & (1 << k) ? 1 : -1); verts.push(v); }
    const edges = [];
    for (let i = 0; i < V; i++) for (let b = 0; b < n; b++) { const j = i ^ (1 << b); if (i < j) edges.push([i, j, b]); }

    // linear projection directions for axes beyond the 3rd
    const dirs = [];
    const m = Math.max(0, n - 3);
    for (let j = 0; j < m; j++) {
      const y = m === 1 ? 0.45 : 1 - (j / (m - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), th = j * 2.39996 + 0.7;
      dirs.push([r * Math.cos(th) * 0.9, y * 0.9, r * Math.sin(th) * 0.9]);
    }
    const scale = opts.scale || (n <= 3 ? 1.5 : n === 4 ? 1.25 : 2.0 / Math.sqrt(n));

    const pos = new Float32Array(edges.length * 6), col = new Float32Array(edges.length * 6);
    edges.forEach((e, i) => { const c = HD.ramp(n === 1 ? 0 : e[2] / (n - 1)); col.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6); });
    const lg = new T.BufferGeometry();
    lg.setAttribute("position", new T.BufferAttribute(pos, 3));
    lg.setAttribute("color", new T.BufferAttribute(col, 3));
    const lines = new T.LineSegments(lg, new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: n > 7 ? 0.42 : n > 5 ? 0.6 : 0.9, blending: T.AdditiveBlending, depthWrite: false }));
    group.add(lines);
    const vp = new Float32Array(V * 3);
    const pg = new T.BufferGeometry().setAttribute("position", new T.BufferAttribute(vp, 3));
    const pts = new T.Points(pg, HD.glowMaterial(HD.col.fg, n > 7 ? 0.14 : n > 5 ? 0.2 : 0.32)); group.add(pts);

    const out = new Float32Array(V * 3), tmp = new Float64Array(n);
    function update(t) {
      for (let i = 0; i < V; i++) {
        for (let k = 0; k < n; k++) tmp[k] = verts[i][k];
        // rotate each extra axis against one of the first three
        for (let k = 3; k < n; k++) {
          const a = t * (0.32 + 0.05 * k) + k, c = Math.cos(a), s = Math.sin(a), p = (k - 3) % 3;
          const x = tmp[p], w = tmp[k]; tmp[p] = x * c - w * s; tmp[k] = x * s + w * c;
        }
        if (n >= 2 && n <= 3) { const a = t * 0.25, c = Math.cos(a), s = Math.sin(a), x = tmp[0], y = tmp[1]; tmp[0] = x * c - y * s; tmp[1] = x * s + y * c; }
        let X = tmp[0], Y = n > 1 ? tmp[1] : 0, Z = n > 2 ? tmp[2] : 0;
        if (n === 4) { const f = 2.4 / (2.4 - tmp[3] * 0.95); X *= f; Y *= f; Z *= f; }
        else for (let k = 3; k < n; k++) { X += dirs[k - 3][0] * tmp[k]; Y += dirs[k - 3][1] * tmp[k]; Z += dirs[k - 3][2] * tmp[k]; }
        out[i * 3] = X * scale; out[i * 3 + 1] = Y * scale; out[i * 3 + 2] = Z * scale;
      }
      edges.forEach((e, i) => { pos.set(out.subarray(e[0] * 3, e[0] * 3 + 3), i * 6); pos.set(out.subarray(e[1] * 3, e[1] * 3 + 3), i * 6 + 3); });
      vp.set(out);
      lg.attributes.position.needsUpdate = true; pg.attributes.position.needsUpdate = true;
      lg.computeBoundingSphere(); pg.computeBoundingSphere();
    }
    update(0);
    return { group, update, vertices: V, edges: edges.length };
  };

  // ---------- compact dimension: a tiny circle at every point ----------
  HD.Compact = function () {
    const group = new T.Group();
    const gridMat = new T.LineBasicMaterial({ color: HD.col.line, transparent: true, opacity: 0.9 });
    const gp = [];
    const N = 4, S = 1.1;
    for (let a = -N; a <= N; a++) for (let b = -N; b <= N; b++) {
      gp.push(a * S, -2, b * S, a * S, 2, b * S);
    }
    for (let y = -2; y <= 2; y += 1) for (let a = -N; a <= N; a++) {
      gp.push(-N * S, y, a * S, N * S, y, a * S); gp.push(a * S, y, -N * S, a * S, y, N * S);
    }
    group.add(new T.LineSegments(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(gp, 3)), gridMat));
    const ringGeo = new T.TorusGeometry(0.16, 0.022, 8, 32);
    const ringMat = new T.MeshStandardMaterial({ color: HD.col.gold, emissive: HD.col.gold, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.4 });
    const rings = new T.InstancedMesh(ringGeo, ringMat, (2 * N + 1) * (2 * N + 1) * 5);
    const dummy = new T.Object3D(); let idx = 0;
    for (let a = -N; a <= N; a++) for (let y = -2; y <= 2; y++) for (let b = -N; b <= N; b++) {
      dummy.position.set(a * S, y, b * S); dummy.rotation.set(0.6, 0.4 + a * 0.1, 0); dummy.updateMatrix(); rings.setMatrixAt(idx++, dummy.matrix);
    }
    group.add(rings);
    // magnified ring with an "ant" walking around it
    const big = new T.Mesh(new T.TorusGeometry(1.2, 0.05, 16, 96), new T.MeshStandardMaterial({ color: HD.col.cyan, emissive: HD.col.cyan, emissiveIntensity: 0.6 }));
    big.position.set(0, 3.6, 0); big.rotation.x = 0.5; group.add(big);
    const ant = HD.glowPoint(HD.col.fg, 0.7); big.add(ant);
    const zoomLine = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.15, 0), new T.Vector3(0, 2.4, 0)]), new T.LineDashedMaterial({ color: HD.col.cyan, dashSize: 0.1, gapSize: 0.08 }));
    zoomLine.computeLineDistances(); group.add(zoomLine);
    const lab = HD.label("radius R ≈ hidden", "#52d6e6", { scale: 0.45 }); lab.position.set(2.2, 3.6, 0); group.add(lab);
    return { group, cam: [7, 5, 9], target: [0, 1, 0], update: t => {
      ant.position.set(Math.cos(t * 1.4) * 1.2, Math.sin(t * 1.4) * 1.2, 0);
      group.rotation.y = t * 0.05;
    } };
  };

  // ---------- Calabi-Yau slice (Hanson's quintic, z1^5 + z2^5 = 1) ----------
  HD.CalabiYau = function () {
    const group = new T.Group(), n = 5, seg = 26, alpha = Math.PI / 4;
    const P = [], C = [], I = [];
    const cpow = (re, im, p) => { const r = Math.pow(Math.hypot(re, im), p), th = Math.atan2(im, re) * p; return [r * Math.cos(th), r * Math.sin(th)]; };
    const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    let base = 0;
    for (let k1 = 0; k1 < n; k1++) for (let k2 = 0; k2 < n; k2++) {
      const e1 = [Math.cos(2 * Math.PI * k1 / n), Math.sin(2 * Math.PI * k1 / n)], e2 = [Math.cos(2 * Math.PI * k2 / n), Math.sin(2 * Math.PI * k2 / n)];
      const c = HD.ramp(((k1 * n + k2) % 7) / 6);
      for (let i = 0; i <= seg; i++) for (let j = 0; j <= seg; j++) {
        const a = -1 + 2 * i / seg, b = (Math.PI / 2) * j / seg;
        const ch = [Math.cosh(a) * Math.cos(b), Math.sinh(a) * Math.sin(b)], sh = [Math.sinh(a) * Math.cos(b), Math.cosh(a) * Math.sin(b)];
        const z1 = cmul(e1, cpow(ch[0], ch[1], 2 / n)), z2 = cmul(e2, cpow(sh[0], sh[1], 2 / n));
        P.push(z1[0] * 1.7, z2[0] * 1.7, (Math.cos(alpha) * z1[1] + Math.sin(alpha) * z2[1]) * 1.7);
        C.push(c.r, c.g, c.b);
      }
      for (let i = 0; i < seg; i++) for (let j = 0; j < seg; j++) {
        const q = base + i * (seg + 1) + j;
        I.push(q, q + seg + 1, q + 1, q + 1, q + seg + 1, q + seg + 2);
      }
      base += (seg + 1) * (seg + 1);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("color", new T.Float32BufferAttribute(C, 3));
    g.setIndex(I); g.computeVertexNormals();
    const mesh = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, side: T.DoubleSide, metalness: 0.35, roughness: 0.32, transparent: true, opacity: 0.92 }));
    const wire = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.05 }));
    group.add(mesh, wire);
    return { group, cam: [5, 3, 6], update: t => { group.rotation.y = t * 0.15; group.rotation.x = Math.sin(t * 0.2) * 0.3; } };
  };

  // ---------- Brane world ----------
  HD.Brane = function () {
    const group = new T.Group();
    const mk = (y, color, op) => {
      const geo = new T.PlaneGeometry(9, 9, 48, 48); geo.rotateX(-Math.PI / 2);
      const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15, transparent: true, opacity: op, side: T.DoubleSide, metalness: 0.2, roughness: 0.6, depthWrite: false }));
      const w = new T.Mesh(geo, new T.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: op * 0.5 }));
      m.position.y = w.position.y = y; group.add(m, w); return geo;
    };
    const ours = mk(0, HD.col.cyan, 0.32), hidden = mk(3.2, HD.col.rose, 0.16);
    const base = ours.attributes.position.array.slice();
    const box = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(9, 4.6, 9)), new T.LineBasicMaterial({ color: HD.col.line }));
    box.position.y = 1.6; group.add(box);
    const lab1 = HD.label("our 3D brane", "#52d6e6", { scale: 0.5 }); lab1.position.set(-3.2, 0.5, 4.2); group.add(lab1);
    const lab2 = HD.label("hidden brane", "#f0708e", { scale: 0.5 }); lab2.position.set(-3.2, 3.7, 4.2); group.add(lab2);
    const lab3 = HD.label("bulk: extra dimension", "#f3b84e", { scale: 0.45 }); lab3.position.set(4.6, 1.6, 0); group.add(lab3);

    const M = 60, mp = new Float32Array(M * 3), md = [];
    for (let i = 0; i < M; i++) md.push([Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 6.28, 0.3 + Math.random() * 0.5]);
    const matter = new T.Points(new T.BufferGeometry().setAttribute("position", new T.BufferAttribute(mp, 3)), HD.glowMaterial(HD.col.cyan, 0.32)); group.add(matter);
    const G = 14, gpz = new Float32Array(G * 3), gd = [];
    for (let i = 0; i < G; i++) gd.push([Math.random() * 7 - 3.5, Math.random() * 7 - 3.5, Math.random() * 4]);
    const grav = new T.Points(new T.BufferGeometry().setAttribute("position", new T.BufferAttribute(gpz, 3)), HD.glowMaterial(HD.col.gold, 0.45)); group.add(grav);

    const wave = (x, z, t) => 0.12 * Math.sin(x * 0.9 + t * 1.2) * Math.cos(z * 0.7 + t * 0.8);
    return { group, cam: [8, 5, 9], target: [0, 1.4, 0], update: t => {
      const a = ours.attributes.position.array;
      for (let i = 0; i < a.length; i += 3) a[i + 1] = wave(base[i], base[i + 2], t);
      ours.attributes.position.needsUpdate = true;
      md.forEach((d, i) => {
        const x = Math.max(-4.4, Math.min(4.4, d[0] + Math.cos(d[2] + t * d[3]) * 0.8)), z = Math.max(-4.4, Math.min(4.4, d[1] + Math.sin(d[2] + t * d[3]) * 0.8));
        mp[i * 3] = x; mp[i * 3 + 1] = wave(x, z, t) + 0.05; mp[i * 3 + 2] = z;
      });
      matter.geometry.attributes.position.needsUpdate = true;
      gd.forEach((d, i) => { const p = ((t * 0.5 + d[2]) % 4) / 4; gpz[i * 3] = d[0]; gpz[i * 3 + 1] = p * 3.2; gpz[i * 3 + 2] = d[1]; });
      grav.geometry.attributes.position.needsUpdate = true;
    } };
  };

  // ---------- Hero ----------
  HD.initHero = function () {
    const canvas = document.getElementById("heroCanvas");
    const viewer = HD.Viewer(canvas, { cam: [0, 1.2, 8.5], spin: 0.9 });
    const btns = [...document.querySelectorAll(".hero-dims button")];
    let n = 4, manual = false, last = 0;
    function show(k) {
      n = k; const c = HD.NCube(n, { scale: n <= 3 ? 1.5 : n === 4 ? 1.3 : 2.1 / Math.sqrt(n) });
      viewer.set(c);
      document.getElementById("hsN").textContent = n + "D";
      document.getElementById("hsV").textContent = c.vertices.toLocaleString("en-IN");
      document.getElementById("hsE").textContent = c.edges.toLocaleString("en-IN");
      btns.forEach(b => b.classList.toggle("on", +b.dataset.n === n));
    }
    btns.forEach(b => b.addEventListener("click", () => { manual = true; show(+b.dataset.n); }));
    show(4);
    if (!reduceMotion) setInterval(() => { if (!manual) show(n >= 11 ? 3 : n + 1); }, 4500);
  };

  // ---------- Platform block diagram ----------
  HD.initPlatform = function (onSelect) {
    const canvas = document.getElementById("platformCanvas");
    const viewer = HD.Viewer(canvas, { cam: [0, 11, 13], target: [0, 0, 1.5], spin: 0.35, stars: false });
    const group = new T.Group(), meshes = {}, pulses = [];
    const floor = new T.GridHelper(22, 22, HD.col.line, HD.col.line); floor.position.y = -0.75; floor.material.transparent = true; floor.material.opacity = 0.5; group.add(floor);
    HD.blocks.forEach(b => {
      const s = b.size || 1;
      const geo = new T.BoxGeometry(2.6 * s, 1.3 * s, 2 * s);
      const mat = new T.MeshStandardMaterial({ color: b.color, metalness: 0.25, roughness: 0.45, emissive: b.color, emissiveIntensity: 0.08, transparent: true, opacity: 0.9 });
      const m = new T.Mesh(geo, mat); m.position.set(...b.pos); m.userData.id = b.id;
      const edges = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
      m.add(edges);
      const lab = HD.label(b.name, "#e9edf8", { scale: 0.55, depthTest: false }); lab.position.set(0, 1.2 * s, 0); m.add(lab);
      group.add(m); meshes[b.id] = m;
    });
    HD.links.forEach(([a, b]) => {
      const A = meshes[a].position, B = meshes[b].position;
      const mid = A.clone().add(B).multiplyScalar(0.5); mid.y += 1.2;
      const curve = new T.QuadraticBezierCurve3(A.clone(), mid, B.clone());
      const tube = new T.Mesh(new T.TubeGeometry(curve, 40, 0.035, 6, false), new T.MeshBasicMaterial({ color: HD.col.muted, transparent: true, opacity: 0.55 }));
      group.add(tube);
      const p = HD.glowPoint(HD.col.cyan, 0.55); group.add(p);
      pulses.push({ curve, p, off: Math.random() });
    });
    let selected = null;
    function select(id) {
      selected = id;
      Object.values(meshes).forEach(m => { m.material.emissiveIntensity = m.userData.id === id ? 0.55 : 0.08; m.scale.setScalar(m.userData.id === id ? 1.08 : 1); });
      onSelect(id);
    }
    const ray = new T.Raycaster(), mouse = new T.Vector2();
    let downAt = null;
    canvas.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; });
    canvas.addEventListener("pointerup", e => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
      const r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, viewer.camera);
      const hit = ray.intersectObjects(Object.values(meshes), false)[0];
      if (hit) select(hit.object.userData.id);
    });
    viewer.set({ group, update: t => pulses.forEach(q => q.p.position.copy(q.curve.getPoint((t * 0.25 + q.off) % 1))) });
    return { select };
  };
})();
