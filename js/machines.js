// 3D models of the real instrument that probes each dimension, plus the entry-engine concept.
(function () {
  const T = THREE, C = HD.col;
  const metal = (color, o) => new T.MeshStandardMaterial(Object.assign({ color, metalness: 0.6, roughness: 0.32 }, o || {}));
  const glow = (color, k) => new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k || 0.8, metalness: 0.1, roughness: 0.5 });
  const glass = (op) => new T.MeshStandardMaterial({ color: 0x9fc8ff, transparent: true, opacity: op || 0.1, metalness: 0, roughness: 0.05, depthWrite: false, side: T.DoubleSide });
  const lineMat = (color, op) => new T.LineBasicMaterial({ color, transparent: true, opacity: op == null ? 1 : op });
  const edges = (geo, color, op) => new T.LineSegments(new T.EdgesGeometry(geo), lineMat(color, op == null ? 0.5 : op));
  const lab = (g, text, color, pos, scale) => { const s = HD.label(text, color, { scale: scale || 0.42 }); s.position.set(...pos); g.add(s); return s; };
  const points = (n, color, size) => { const arr = new Float32Array(n * 3); const p = new T.Points(new T.BufferGeometry().setAttribute("position", new T.BufferAttribute(arr, 3)), HD.glowMaterial(color, size)); p.arr = arr; return p; };

  const M = {};

  // 0D — optical tweezer
  M[0] = function () {
    const g = new T.Group();
    const cellGeo = new T.BoxGeometry(4, 3, 3);
    g.add(new T.Mesh(cellGeo, glass(0.08)), edges(cellGeo, C.cyan, 0.4));
    const beamMat = new T.MeshBasicMaterial({ color: C.rose, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending });
    const up = new T.Mesh(new T.ConeGeometry(0.8, 2.6, 48, 1, true), beamMat); up.rotation.x = Math.PI; up.position.y = 1.3;
    const dn = new T.Mesh(new T.ConeGeometry(0.8, 2.6, 48, 1, true), beamMat); dn.position.y = -1.3;
    g.add(up, dn);
    const lens = new T.Mesh(new T.SphereGeometry(1, 48, 16), glass(0.35)); lens.scale.set(1.1, 0.14, 1.1); lens.position.y = 2.8; g.add(lens);
    const ring = new T.Mesh(new T.TorusGeometry(1.12, 0.06, 12, 64), metal(0x9aa3c0)); ring.rotation.x = Math.PI / 2; ring.position.y = 2.8; g.add(ring);
    const atom = HD.glowPoint(C.gold, 0.9); g.add(atom);
    const halo = HD.glowPoint(C.gold, 2.2); halo.material.opacity = 0.3; g.add(halo);
    lab(g, "single atom", "#f3b84e", [1.5, 0.3, 0]); lab(g, "laser focus ≈ 1 µm", "#f0708e", [-1.9, -1.4, 0]); lab(g, "objective lens", "#e9edf8", [0, 3.4, 0]);
    return { group: g, cam: [5, 2.5, 6], update: t => { atom.position.set(Math.sin(t * 9) * 0.02, Math.cos(t * 7) * 0.02, 0); halo.scale.setScalar(1 + 0.15 * Math.sin(t * 3)); } };
  };

  // 1D — linear accelerator
  M[1] = function () {
    const g = new T.Group();
    const tube = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 13, 32, 1, true), glass(0.2)); tube.rotation.z = Math.PI / 2; g.add(tube);
    for (let i = -5; i <= 5; i++) {
      const cav = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.55, 40), metal(0xc98a4b, { roughness: 0.28 })); cav.rotation.z = Math.PI / 2; cav.position.x = i * 1.15; g.add(cav);
      const leg = new T.Mesh(new T.BoxGeometry(0.12, 1.1, 0.12), metal(0x4a5578)); leg.position.set(i * 1.15, -1.05, 0); g.add(leg);
    }
    const rail = new T.Mesh(new T.BoxGeometry(13.2, 0.12, 0.8), metal(0x2a3355)); rail.position.y = -1.6; g.add(rail);
    const bunch = points(5, C.cyan, 0.55); g.add(bunch);
    lab(g, "RF cavity", "#f3b84e", [-4.6, 1.0, 0]); lab(g, "particle bunch → near light speed", "#52d6e6", [1.5, 1.0, 0]); lab(g, "one direction only", "#e9edf8", [0, -2.2, 0]);
    return { group: g, cam: [0, 3.5, 10], update: t => { for (let i = 0; i < 5; i++) { const x = ((t * 3.5 + i * 2.6) % 13) - 6.5; bunch.arr.set([x, 0, 0], i * 3); } bunch.geometry.attributes.position.needsUpdate = true; } };
  };

  // 2D — graphene sheet
  M[2] = function () {
    const g = new T.Group(), a = 0.42, atoms = [], bonds = [];
    for (let i = -8; i <= 8; i++) for (let j = -6; j <= 6; j++) {
      const x = i * a * Math.sqrt(3) + (j % 2 ? a * Math.sqrt(3) / 2 : 0), z = j * a * 1.5;
      atoms.push([x, 0, z], [x, 0, z + a]);
      bonds.push(x, 0, z, x, 0, z + a);
      bonds.push(x, 0, z + a, x + a * Math.sqrt(3) / 2, 0, z + 1.5 * a);
      bonds.push(x, 0, z + a, x - a * Math.sqrt(3) / 2, 0, z + 1.5 * a);
    }
    const inst = new T.InstancedMesh(new T.SphereGeometry(0.09, 12, 8), metal(0xb9c2dd, { metalness: 0.3 }), atoms.length);
    const d = new T.Object3D(); atoms.forEach((p, i) => { d.position.set(...p); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); });
    g.add(inst, new T.LineSegments(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(bonds, 3)), lineMat(0x6c7aa8, 0.8)));
    const el = points(24, C.cyan, 0.45), ed = []; for (let i = 0; i < 24; i++) ed.push([Math.random() * 10 - 5, Math.random() * 8 - 4, Math.random() * 6.28]);
    g.add(el);
    lab(g, "graphene: 1 atom thick", "#e9edf8", [0, 1.1, -4.5]); lab(g, "electrons cannot leave the sheet", "#52d6e6", [0, 0.6, 5]);
    return { group: g, cam: [5, 6, 8], update: t => { ed.forEach((e, i) => { const x = ((e[0] + Math.cos(e[2]) * t * 0.8 + 5) % 10 + 10) % 10 - 5, z = ((e[1] + Math.sin(e[2]) * t * 0.8 + 4) % 8 + 8) % 8 - 4; el.arr.set([x, 0.05, z], i * 3); }); el.geometry.attributes.position.needsUpdate = true; } };
  };

  // 3D — GPS satellite on a stable orbit
  M[3] = function () {
    const g = new T.Group();
    const earth = new T.Mesh(new T.SphereGeometry(1.6, 64, 32), new T.MeshStandardMaterial({ color: 0x1c4fa0, emissive: 0x0a1a40, roughness: 0.7, metalness: 0.1 }));
    const grid = new T.Mesh(new T.SphereGeometry(1.62, 24, 12), new T.MeshBasicMaterial({ color: C.cyan, wireframe: true, transparent: true, opacity: 0.12 }));
    const atmo = new T.Mesh(new T.SphereGeometry(1.75, 48, 24), new T.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.07, side: T.BackSide }));
    g.add(earth, grid, atmo);
    const orbit = new T.Group(); orbit.rotation.x = 0.96; g.add(orbit);
    const R = 4.2, op = []; for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; op.push(Math.cos(a) * R, 0, Math.sin(a) * R); }
    orbit.add(new T.Line(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(op, 3)), lineMat(C.gold, 0.6)));
    const sat = new T.Group();
    sat.add(new T.Mesh(new T.BoxGeometry(0.3, 0.3, 0.3), metal(0xd8c48a)));
    const panelMat = metal(0x2b5bd7, { metalness: 0.8, roughness: 0.2, emissive: 0x0b1f55 });
    const p1 = new T.Mesh(new T.BoxGeometry(1.0, 0.02, 0.32), panelMat); p1.position.x = 0.7; const p2 = p1.clone(); p2.position.x = -0.7;
    sat.add(p1, p2); orbit.add(sat);
    const sig = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), new T.LineDashedMaterial({ color: C.cyan, dashSize: 0.12, gapSize: 0.08 })); g.add(sig);
    lab(g, "orbit 20,200 km", "#f3b84e", [0, 3.4, 0]);
    const tmp = new T.Vector3();
    return { group: g, cam: [7, 4, 8], update: t => {
      const a = t * 0.35; sat.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); sat.rotation.y = -a;
      earth.rotation.y = t * 0.1; grid.rotation.y = t * 0.1;
      sat.getWorldPosition(tmp); const s = tmp.clone().normalize().multiplyScalar(1.62);
      sig.geometry.setFromPoints([tmp, s]); sig.computeLineDistances();
    } };
  };

  // 4D — optical lattice clock
  M[4] = function () {
    const g = new T.Group();
    const ch = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 6, 48, 1, true), glass(0.12)); ch.rotation.z = Math.PI / 2; g.add(ch);
    [-3, 3].forEach(x => { const f = new T.Mesh(new T.TorusGeometry(1.5, 0.12, 16, 64), metal(0xa9b2cf)); f.rotation.y = Math.PI / 2; f.position.x = x; g.add(f); });
    [-1.5, 0, 1.5].forEach(x => { const w = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 0.25, 32), metal(0x8892b3)); w.position.set(x, 1.55, 0); g.add(w); });
    const beam = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 9, 16), new T.MeshBasicMaterial({ color: C.rose, transparent: true, opacity: 0.8, blending: T.AdditiveBlending })); beam.rotation.z = Math.PI / 2; g.add(beam);
    const N = 34, at = points(N, C.gold, 0.32); g.add(at);
    const tick = new T.Mesh(new T.TorusGeometry(1.0, 0.03, 8, 64), new T.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.6 })); tick.rotation.y = Math.PI / 2; g.add(tick);
    lab(g, "atoms in a standing wave of light", "#f3b84e", [0, -2.1, 0]); lab(g, "laser: 429 THz", "#f0708e", [4.4, 0.5, 0]); lab(g, "1 s error in 15 billion years", "#52d6e6", [0, 2.5, 0]);
    return { group: g, cam: [3, 3, 9], update: t => {
      for (let i = 0; i < N; i++) { const x = -2.6 + i * (5.2 / (N - 1)); at.arr.set([x, Math.sin(t * 6 + i) * 0.03, Math.cos(t * 5 + i * 1.3) * 0.03], i * 3); }
      at.geometry.attributes.position.needsUpdate = true;
      const p = (t * 0.8) % 1; tick.position.x = -2.8 + p * 5.6; tick.material.opacity = 0.6 * (1 - p);
    } };
  };

  // 5D — Eöt-Wash torsion balance
  M[5] = function () {
    const g = new T.Group();
    const canGeo = new T.CylinderGeometry(2.2, 2.2, 6.4, 48, 1, true);
    const can = new T.Mesh(canGeo, glass(0.08)); can.position.y = 0.6; g.add(can);
    const cap = new T.Mesh(new T.CylinderGeometry(2.3, 2.3, 0.25, 48), metal(0x9aa3c0)); cap.position.y = 3.8; g.add(cap);
    const fibre = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 3.7, 0), new T.Vector3(0, 0.4, 0)]), lineMat(0xffffff, 0.9)); g.add(fibre);
    const disk = (y, color) => {
      const d = new T.Group(); d.position.y = y;
      d.add(new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 0.12, 64), metal(color, { roughness: 0.2 })));
      for (let i = 0; i < 21; i++) { const a = i / 21 * Math.PI * 2; const h = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.14, 16), new T.MeshBasicMaterial({ color: 0x05070f })); h.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15); d.add(h); }
      g.add(d); return d;
    };
    const pend = disk(0.3, 0xd9b45a), attr = disk(-0.05, 0x8a95b8);
    const mirror = new T.Mesh(new T.BoxGeometry(0.5, 0.4, 0.05), metal(0xffffff, { metalness: 1, roughness: 0.05 })); mirror.position.set(0, 0.62, 1.2); pend.add(mirror); mirror.position.y = 0.3;
    const beam = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.6, 1.2), new T.Vector3(0, 0.6, 4)]), lineMat(C.rose, 0.9)); g.add(beam);
    const box = new T.Mesh(new T.BoxGeometry(0.7, 0.5, 0.9), metal(0x3a4670)); box.position.set(0, 0.6, 4.3); g.add(box);
    lab(g, "tungsten fibre", "#e9edf8", [1.4, 2.6, 0]); lab(g, "pendulum ring, 21 holes", "#f3b84e", [-2.6, 0.9, 0]); lab(g, "rotating attractor", "#8f99bd", [-2.6, -0.5, 0]); lab(g, "autocollimator reads twist", "#f0708e", [0, 1.4, 4.3]); lab(g, "tests gravity at 50 µm", "#52d6e6", [0, -1.6, 0]);
    return { group: g, cam: [7, 3, 7], target: [0, 0.6, 0], update: t => { attr.rotation.y = t * 0.4; pend.rotation.y = Math.sin(t * 1.1) * 0.04; } };
  };

  // 6D — LHC + CMS detector
  M[6] = function () {
    const g = new T.Group(), R = 5;
    const ring = new T.Mesh(new T.TorusGeometry(R, 0.09, 12, 200), metal(0x6f7ea8)); ring.rotation.x = Math.PI / 2; g.add(ring);
    const det = new T.Group(); det.position.set(R, 0, 0); g.add(det);
    [[0.35, C.cyan], [0.75, C.gold], [1.15, 0xc98a4b], [1.6, C.rose]].forEach(([r, c], i) => {
      const m = new T.Mesh(new T.CylinderGeometry(r, r, 2.6 - i * 0.1, 48, 1, true, 0, Math.PI * 1.55), new T.MeshStandardMaterial({ color: c, metalness: 0.4, roughness: 0.45, side: T.DoubleSide, emissive: c, emissiveIntensity: 0.12 }));
      m.rotation.x = Math.PI / 2; det.add(m);
    });
    const burst = new T.Group(); det.add(burst);
    const rays = []; for (let i = 0; i < 26; i++) { const dir = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, (Math.random() - 0.5) * 0.6).normalize(); rays.push(new T.Vector3(), dir.multiplyScalar(1.4 + Math.random() * 0.8)); }
    const rayMesh = new T.LineSegments(new T.BufferGeometry().setFromPoints(rays), lineMat(C.gold, 1)); burst.add(rayMesh);
    const miss = new T.ArrowHelper(new T.Vector3(0.3, 1, 0).normalize(), new T.Vector3(), 2.4, C.rose, 0.3, 0.18); burst.add(miss);
    const beams = points(8, C.cyan, 0.5); g.add(beams);
    lab(g, "27 km ring", "#8f99bd", [-R, 0.7, 0]); lab(g, "CMS detector", "#f3b84e", [R, 2.3, 0]); lab(g, "missing energy → extra dimension?", "#f0708e", [R + 0.4, -2.2, 0], 0.38);
    return { group: g, cam: [11, 5, 7], target: [2.5, 0, 0], update: t => {
      for (let i = 0; i < 8; i++) { const dirn = i < 4 ? 1 : -1, a = dirn * t * 0.9 + i * 1.57; beams.arr.set([Math.cos(a) * R, 0, Math.sin(a) * R], i * 3); }
      beams.geometry.attributes.position.needsUpdate = true;
      const p = (t * 0.6) % 1; burst.scale.setScalar(0.2 + p); rayMesh.material.opacity = 1 - p; burst.visible = p < 0.9;
    } };
  };

  // 7D — LIGO interferometer
  M[7] = function () {
    const g = new T.Group(), L = 6;
    const ground = new T.GridHelper(18, 18, C.line, C.line); ground.position.y = -0.4; g.add(ground);
    const arm = (axis) => { const m = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, L, 24), metal(0xb8bfd6)); if (axis === "x") { m.rotation.z = Math.PI / 2; m.position.x = L / 2; } else { m.rotation.x = Math.PI / 2; m.position.z = L / 2; } g.add(m); return m; };
    const ax = arm("x"), az = arm("z");
    const hub = new T.Mesh(new T.BoxGeometry(1.2, 0.8, 1.2), metal(0xe3e6f0, { metalness: 0.2 })); g.add(hub);
    const ex = new T.Mesh(new T.BoxGeometry(0.8, 0.6, 0.8), metal(0xe3e6f0, { metalness: 0.2 })); ex.position.x = L; const ez = ex.clone(); ez.position.set(0, 0, L); g.add(ex, ez);
    const pulses = points(6, C.rose, 0.5); g.add(pulses);
    const waves = []; for (let i = 0; i < 4; i++) { const w = new T.Mesh(new T.RingGeometry(0.98, 1, 96), new T.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.5, side: T.DoubleSide })); w.rotation.x = -Math.PI / 2; w.position.y = -0.38; g.add(w); waves.push(w); }
    lab(g, "4 km arm", "#e9edf8", [L / 2, 0.8, 0]); lab(g, "4 km arm", "#e9edf8", [0, 0.8, L / 2]); lab(g, "gravitational wave", "#f3b84e", [-3, 0.6, -3]); lab(g, "no leak into extra dimensions (GW170817)", "#52d6e6", [L / 2, 2.2, L / 2], 0.38);
    return { group: g, cam: [10, 7, 10], target: [2.5, 0, 2.5], update: t => {
      const s = 1 + 0.03 * Math.sin(t * 6); ax.scale.y = s; ax.position.x = L / 2 * s; ex.position.x = L * s; az.scale.y = 2 - s; az.position.z = L / 2 * (2 - s); ez.position.z = L * (2 - s);
      for (let i = 0; i < 6; i++) { const p = ((t * 0.9 + i / 3) % 1) * L; pulses.arr.set(i < 3 ? [p * s, 0, 0] : [0, 0, p * (2 - s)], i * 3); }
      pulses.geometry.attributes.position.needsUpdate = true;
      waves.forEach((w, i) => { const p = ((t * 0.25 + i / 4) % 1); w.scale.setScalar(1 + p * 11); w.material.opacity = 0.5 * (1 - p); w.position.x = -4; w.position.z = -4; });
    } };
  };

  // 8D — Planck CMB satellite
  M[8] = function () {
    const g = new T.Group();
    const c = document.createElement("canvas"); c.width = 512; c.height = 256; const x = c.getContext("2d");
    for (let i = 0; i < 2600; i++) { const v = Math.random(); x.fillStyle = v > 0.5 ? `rgba(240,112,142,${0.15 + Math.random() * 0.3})` : `rgba(82,214,230,${0.15 + Math.random() * 0.3})`; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 9, 0, 7); x.fill(); }
    const sky = new T.Mesh(new T.SphereGeometry(30, 48, 24), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), side: T.BackSide, transparent: true, opacity: 0.28 })); g.add(sky);
    const sat = new T.Group(); g.add(sat);
    const shield = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, 0.1, 6), metal(0x2b5bd7, { emissive: 0x0b1f55 })); shield.position.y = -1.2; sat.add(shield);
    const baff = new T.Mesh(new T.CylinderGeometry(1.4, 1.9, 0.9, 6, 1, true), metal(0xd8dbe6, { side: T.DoubleSide, metalness: 0.3 })); baff.position.y = -0.7; sat.add(baff);
    [0, 0.45, 0.9].forEach((y, i) => { const v = new T.Mesh(new T.CylinderGeometry(1.3 - i * 0.12, 1.3 - i * 0.12, 0.05, 6), metal(0xe9d8a0)); v.position.y = -0.25 + y; sat.add(v); });
    const dish = new T.Mesh(new T.SphereGeometry(1.4, 48, 16, 0, Math.PI * 2, 0, 0.7), metal(0xe8eaf2, { side: T.DoubleSide, metalness: 0.9, roughness: 0.12 })); dish.position.set(0.3, 1.6, 0); dish.rotation.z = 2.1; sat.add(dish);
    const horn = new T.Mesh(new T.ConeGeometry(0.2, 0.6, 24), metal(0xc98a4b)); horn.position.set(-0.4, 1.2, 0); horn.rotation.z = -0.9; sat.add(horn);
    lab(g, "Planck: oldest light in the universe", "#e9edf8", [0, 2.9, 0]); lab(g, "cooled to 0.1 K", "#52d6e6", [2.6, 1.8, 0]); lab(g, "sunshield", "#8f99bd", [2.8, -1.3, 0]);
    return { group: g, cam: [6, 2, 7], target: [0, 0.4, 0], update: t => { sat.rotation.y = t * 0.3; sky.rotation.y = -t * 0.02; } };
  };

  // 9D — qBounce neutron mirror
  M[9] = function () {
    const g = new T.Group(), H = [1, 1.75, 2.36];
    const mir = new T.Mesh(new T.BoxGeometry(9, 0.4, 3), metal(0xc9d3ee, { metalness: 0.35, roughness: 0.15, emissive: 0x1a2550 })); mir.position.y = -0.2; g.add(mir);
    const abs = new T.Mesh(new T.BoxGeometry(5, 0.3, 3), metal(0x3a2f4a, { roughness: 0.8, metalness: 0.1 })); abs.position.set(1.5, 3.1, 0); g.add(abs);
    H.forEach((h, i) => {
      const l = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-4.5, h, -1.5), new T.Vector3(4.5, h, -1.5)]), new T.LineDashedMaterial({ color: C.gold, dashSize: 0.15, gapSize: 0.1 }));
      l.computeLineDistances(); g.add(l); lab(g, `n = ${i + 1}`, "#f3b84e", [-5.1, h, -1.5], 0.36);
    });
    const N = 3, nn = points(N, C.cyan, 0.5); g.add(nn);
    lab(g, "neutron mirror", "#e9edf8", [0, -0.9, 1.6]); lab(g, "absorber", "#8f99bd", [1.5, 3.7, 0]); lab(g, "lowest level ≈ 14 µm high", "#52d6e6", [0, 4.4, 0]);
    return { group: g, cam: [2, 3, 10], target: [0, 1.4, 0], update: t => {
      for (let i = 0; i < N; i++) {
        const x = ((t * 1.2 + i * 3) % 9) - 4.5, period = 0.8 * Math.sqrt(H[i]), ph = ((t + i * 0.3) % period) / period, y = H[i] * 4 * ph * (1 - ph);
        nn.arr.set([x, y + 0.05, i - 1], i * 3);
      }
      nn.geometry.attributes.position.needsUpdate = true;
    } };
  };

  // 10D — Future Circular Collider vs LHC
  M[10] = function () {
    const g = new T.Group();
    const disk = new T.Mesh(new T.CircleGeometry(12, 96), new T.MeshStandardMaterial({ color: 0x0f1630, roughness: 1 })); disk.rotation.x = -Math.PI / 2; disk.position.y = -0.2; g.add(disk);
    g.add(new T.GridHelper(24, 24, C.line, C.line));
    const ring = (r, c) => { const m = new T.Mesh(new T.TorusGeometry(r, 0.12, 12, 256), glow(c, 0.5)); m.rotation.x = Math.PI / 2; g.add(m); return m; };
    ring(2.7, C.cyan); ring(9.1, C.gold);
    const b = points(12, 0xffffff, 0.6); g.add(b);
    lab(g, "LHC 27 km · 13.6 TeV", "#52d6e6", [0, 1, 2.7]); lab(g, "FCC 91 km · 100 TeV (proposed)", "#f3b84e", [0, 1, 9.1], 0.55); lab(g, "Geneva", "#8f99bd", [-1.5, 0.4, -1.2], 0.34);
    return { group: g, cam: [0, 14, 15], update: t => {
      for (let i = 0; i < 12; i++) { const r = i < 4 ? 2.7 : 9.1, a = t * (i < 4 ? 1.2 : 0.45) * (i % 2 ? 1 : -1) + i; b.arr.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3); }
      b.geometry.attributes.position.needsUpdate = true;
    } };
  };

  // 11D — supercomputer cluster
  M[11] = function () {
    const g = new T.Group();
    g.add(new T.GridHelper(16, 16, C.line, C.line));
    const leds = [], cols = [];
    for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) {
      const x = -4.2 + k * 1.4, z = -2.4 + r * 2.4;
      const rack = new T.Mesh(new T.BoxGeometry(1.1, 2.6, 1.2), metal(0x1b2244, { metalness: 0.5, roughness: 0.5 })); rack.position.set(x, 1.3, z); g.add(rack);
      const outline = edges(rack.geometry, C.line, 0.9); outline.position.copy(rack.position); g.add(outline);
      for (let s = 0; s < 10; s++) { leds.push(x - 0.35 + Math.random() * 0.7, 0.3 + s * 0.22, z + 0.61); cols.push(0, 0, 0); }
    }
    const lg = new T.BufferGeometry(); lg.setAttribute("position", new T.Float32BufferAttribute(leds, 3)); lg.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    const lm = HD.glowMaterial(0xffffff, 0.16); lm.vertexColors = true;
    const ledPts = new T.Points(lg, lm); g.add(ledPts);
    const tray = new T.Mesh(new T.BoxGeometry(10, 0.08, 0.5), metal(0x4a5578)); [-2.4, 0, 2.4].forEach(z => { const m = tray.clone(); m.position.set(0, 2.85, z); g.add(m); });
    lab(g, "searching 473 million Calabi–Yau shapes", "#f3b84e", [0, 3.7, 0], 0.48); lab(g, "GPU racks", "#8f99bd", [5.4, 1.3, 0]);
    const palette = [HD.ramp(0), HD.ramp(0.5), new T.Color(C.ok)];
    let next = 0;
    return { group: g, cam: [7, 5, 9], target: [0, 1.3, 0], update: t => {
      if (t < next) return; next = t + 0.12;
      const a = lg.attributes.color.array;
      for (let i = 0; i < a.length; i += 3) { const on = Math.random() > 0.35, c = palette[(Math.random() * 3) | 0]; a[i] = on ? c.r : 0.05; a[i + 1] = on ? c.g : 0.05; a[i + 2] = on ? c.b : 0.08; }
      lg.attributes.color.needsUpdate = true;
    } };
  };

  // pull every machine camera back a little so labels stay in frame
  HD.machine = n => {
    const o = M[n](), t = o.target || [0, 0, 0];
    if (o.cam) o.cam = o.cam.map((v, i) => t[i] + (v - t[i]) * 1.25);
    return o;
  };

  // ---------- Entry-engine concept: five subsystems on a beamline ----------
  HD.Engine = function () {
    const g = new T.Group(), mods = [];
    const base = new T.Mesh(new T.BoxGeometry(15, 0.25, 3.2), metal(0x1b2244)); base.position.y = -1.3; g.add(base);
    const pipe = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 13.5, 16), metal(0x8f99bd)); pipe.rotation.z = Math.PI / 2; g.add(pipe);
    const make = (x, mesh, name) => { mesh.position.x = x; g.add(mesh); const l = HD.label(name, "#e9edf8", { scale: 0.42 }); l.position.set(x, 2.1, 0); g.add(l); mods.push(mesh); };
    const det = new T.Mesh(new T.TorusGeometry(0.9, 0.25, 16, 48), metal(0xffffff)); det.rotation.y = Math.PI / 2; make(-6, det, "1 · dimension sensor");
    const core = new T.Mesh(new T.SphereGeometry(0.9, 48, 24), metal(0xffffff)); make(-3, core, "2 · energy source");
    const acc = new T.Mesh(new T.TorusGeometry(0.9, 0.12, 12, 64), metal(0xffffff)); acc.rotation.x = Math.PI / 2; make(0, acc, "3 · momentum injector");
    const exit = new T.Mesh(new T.IcosahedronGeometry(1, 1), new T.MeshStandardMaterial({ color: 0xffffff, wireframe: true })); make(3, exit, "4 · brane exit");
    const cap = new T.Group(); const body = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 1.4, 32), metal(0xffffff)); body.rotation.z = Math.PI / 2;
    const e1 = new T.Mesh(new T.SphereGeometry(0.7, 32, 16), metal(0xffffff)); e1.position.x = 0.7; const e2 = e1.clone(); e2.position.x = -0.7; cap.add(body, e1, e2); make(6, cap, "5 · crew capsule");
    const flow = points(10, C.cyan, 0.45); g.add(flow);
    const mats = mods.map(m => { const list = []; m.traverse(o => { if (o.material) list.push(o.material); }); return list; });
    return {
      group: g, cam: [0, 4.5, 13],
      setStatus(st) {
        const map = { ok: C.ok, mid: C.gold, bad: C.rose };
        st.forEach((s, i) => mats[i].forEach(m => { m.color.set(map[s]); if (m.emissive) { m.emissive.set(map[s]); m.emissiveIntensity = s === "bad" ? 0.12 : 0.35; } }));
      },
      update: t => {
        core.scale.setScalar(1 + 0.05 * Math.sin(t * 3)); acc.rotation.z = t; exit.rotation.y = t * 0.5; exit.rotation.x = t * 0.3; det.rotation.x = t * 0.6;
        for (let i = 0; i < 10; i++) flow.arr.set([((t * 2 + i * 1.35) % 13.5) - 6.75, 0, 0], i * 3);
        flow.geometry.attributes.position.needsUpdate = true;
      }
    };
  };
})();
