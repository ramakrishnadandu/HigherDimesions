// Calculators, orbit simulator, entry-engine evaluation and stage-gate roadmap.
(function () {
  const $ = id => document.getElementById(id);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // ---------- physical constants ----------
  const K = {
    hbarc_eVm: 1.97327e-7,      // ħc in eV·m
    eV: 1.602177e-19,           // J
    mp: 1.67262e-27,            // proton mass, kg
    G: 6.674e-11, c: 2.99792458e8,
    GM: 3.986004e14, RE: 6.371e6,
    Mpl: 2.435e18,              // reduced Planck mass, GeV
    GeVinv_m: 1.97327e-16,      // 1 GeV⁻¹ in metres
    lhc_eV: 13.6e12,
    worldYear_J: 6.2e20,        // world primary energy per year (~620 EJ)
    sunSec_J: 3.828e26,         // solar luminosity, J/s
    gravLimit_m: 4.0e-5,        // largest gravity-only extra dim allowed (torsion balances, ~2020)
    smLimit_m: 1.4e-19,         // largest extra dim open to ordinary matter (LHC, 1/R > ~1.4 TeV)
    human_m: 1.8
  };

  // ---------- formatting ----------
  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const sup = s => String(s).split("").map(ch => SUP[ch] || ch).join("");
  function sci(x, d) {
    if (!isFinite(x)) return "∞";
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e < 6) return x.toLocaleString("en-IN", { maximumFractionDigits: d == null ? 3 : d });
    const m = x / Math.pow(10, e);
    return `${m.toFixed(d == null ? 2 : d)}×10${sup(e)}`;
  }
  function len(m) {
    const u = [[9.461e15, "light-years"], [1e3, "km"], [1, "m"], [1e-3, "mm"], [1e-6, "µm"], [1e-9, "nm"], [1e-15, "fm"]];
    for (const [f, n] of u) if (m >= f) return `${sci(m / f, 3)} ${n}`;
    return `${sci(m, 2)} m`;
  }
  function energy(eV) {
    const u = [[1e12, "TeV"], [1e9, "GeV"], [1e6, "MeV"], [1e3, "keV"], [1, "eV"], [1e-3, "meV"]];
    if (eV >= 1e15) return `${sci(eV / 1e12, 2)} TeV`;
    for (const [f, n] of u) if (eV >= f) return `${sci(eV / f, 3)} ${n}`;
    return `${sci(eV, 2)} eV`;
  }
  const kv = (items) => items.map(([k, v, small, hl]) => `<div${hl ? ' class="hl"' : ""}><dt>${k}</dt><dd>${v}${small ? `<small>${small}</small>` : ""}</dd></div>`).join("");

  // ---------- canvas helper ----------
  function ctx2d(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const g = canvas.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    g.font = `12px ${css("--f-mono")}`;
    return { g, w, h };
  }
  const P = () => ({ fg: css("--fg"), muted: css("--muted"), line: css("--line"), cyan: css("--cyan"), gold: css("--gold"), rose: css("--rose"), ok: css("--ok") });

  // log-scale axis helper for charts
  function logAxis(g, x0, x1, y, lo, hi, step, color, labeler) {
    g.strokeStyle = color; g.fillStyle = color; g.textAlign = "center";
    for (let e = Math.ceil(lo); e <= hi; e += step) {
      const x = x0 + (e - lo) / (hi - lo) * (x1 - x0);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 4); g.stroke();
      g.fillText(labeler ? labeler(e) : "10" + sup(e), x, y + 16);
    }
  }

  // ---------- tabs ----------
  document.querySelectorAll(".calc-tabs button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".calc-tabs button").forEach(x => x.classList.toggle("on", x === b));
    document.querySelectorAll(".calc[data-panel]").forEach(p => p.hidden = p.dataset.panel !== b.dataset.calc);
    redrawAll();
  }));

  // ---------- 1. Hypercube & hypersphere ----------
  const Vn = n => { let v = [1, 2]; for (let k = 2; k <= n; k++) v[k] = v[k - 2] * 2 * Math.PI / k; return v[n]; };
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const faceName = ["Corners (0D)", "Edges (1D)", "Squares (2D)", "Cubes (3D)", "Tesseracts (4D)", "5-cubes", "6-cubes", "7-cubes", "8-cubes", "9-cubes", "10-cubes", "11-cubes"];
  function geo() {
    const n = +$("geoN").value, r = Math.max(1e-9, +$("geoR").value || 1);
    $("geoNVal").textContent = n;
    const vol = Vn(n) * Math.pow(r, n), surf = n === 0 ? 0 : n * Vn(n) * Math.pow(r, n - 1), ratio = Vn(n) / Math.pow(2, n);
    const orbit = n === 3 ? "Stable orbits ✓" : n < 3 ? "No true orbits" : "Orbits unstable ✗";
    $("geoOut").innerHTML = kv([
      ["Corners", (2 ** n).toLocaleString("en-IN"), "2ⁿ", true],
      ["Edges", (n * 2 ** Math.max(0, n - 1)).toLocaleString("en-IN"), "n · 2ⁿ⁻¹"],
      ["Boundary cells", n === 0 ? "0" : (2 * n).toLocaleString("en-IN"), `(${Math.max(0, n - 1)}D faces) 2n`],
      [`Ball volume (r = ${r})`, sci(vol, 4), `units${sup(n)}`, true],
      ["Ball surface", sci(surf, 4), `units${sup(Math.max(0, n - 1))}`],
      ["Ball fills cube", `${sci(ratio * 100, 3)}%`, "most of a high-D cube is corners"],
      ["Gravity falls as", n <= 1 ? "constant" : `1/r${sup(n - 1)}`, orbit]
    ]);
    let rows = `<tr><th>Part</th><th>Count C(n,k)·2ⁿ⁻ᵏ</th></tr>`;
    for (let k = 0; k <= n; k++) rows += `<tr><td>${faceName[k]}</td><td>${(binom(n, k) * 2 ** (n - k)).toLocaleString("en-IN")}</td></tr>`;
    $("geoTable").innerHTML = rows;
    drawBall(n);
  }
  function drawBall(sel) {
    const c = $("ballChart"); if (!c.offsetParent) return;
    const { g, w, h } = ctx2d(c), p = P(), L = 44, R = 14, Tp = 22, B = 30, max = 6;
    const bw = (w - L - R) / 12;
    g.strokeStyle = p.line; g.fillStyle = p.muted; g.textAlign = "right";
    for (let y = 0; y <= max; y += 2) { const yy = Tp + (h - Tp - B) * (1 - y / max); g.beginPath(); g.moveTo(L, yy); g.lineTo(w - R, yy); g.stroke(); g.fillText(y, L - 8, yy + 4); }
    for (let n = 0; n <= 11; n++) {
      const v = Vn(n), bh = (h - Tp - B) * v / max, x = L + n * bw + bw * 0.18;
      g.fillStyle = n === sel ? p.gold : p.cyan; g.globalAlpha = n === sel ? 1 : 0.45;
      g.fillRect(x, h - B - bh, bw * 0.64, bh); g.globalAlpha = 1;
      g.fillStyle = n === sel ? p.gold : p.muted; g.textAlign = "center"; g.fillText(n + "D", x + bw * 0.32, h - B + 16);
      if (n === sel) g.fillText(v.toFixed(2), x + bw * 0.32, h - B - bh - 6);
    }
    g.textAlign = "left"; g.fillStyle = p.muted; g.fillText("Volume of a ball of radius 1 — peaks at 5D, then shrinks toward 0", L, 14);
  }
  ["geoN", "geoR"].forEach(id => $(id).addEventListener("input", geo));

  // ---------- 2. Extra-dimension size (ADD) ----------
  function add() {
    const n = +$("addN").value, MD = Math.pow(10, +$("addM").value); // TeV
    $("addNVal").textContent = n; $("addMVal").textContent = `${MD < 10 ? MD.toFixed(1) : Math.round(MD)} TeV`;
    const logR = (2 * Math.log10(K.Mpl) - (n + 2) * Math.log10(MD * 1e3)) / n + Math.log10(K.GeVinv_m);
    const R = Math.pow(10, logR), dm = K.hbarc_eVm / R;
    $("addOut").innerHTML = kv([
      ["Size of each extra dimension R", len(R), `${sci(R, 2)} m`, true],
      ["KK graviton spacing", energy(dm), "mass gap between gravity 'copies'"],
      ["Gravity changes below", len(R), `force grows like 1/r${sup(n + 2)}`],
      ["Your body vs R", R >= K.human_m ? "Body fits" : `${sci(K.human_m / R, 1)}× bigger`, "human height 1.8 m"]
    ]);
    let cls, msg;
    if (n === 1) { cls = "bad"; msg = `<b>Excluded.</b> One extra dimension this large (${len(R)}) would change gravity across the solar system. Planets' orbits rule it out.`; }
    else if (R > K.gravLimit_m) { cls = "bad"; msg = `<b>Excluded.</b> R = ${len(R)} is larger than 40 µm. Torsion balances would already see gravity getting stronger.`; }
    else if (MD < 5) { cls = "mid"; msg = `<b>Disfavoured.</b> LHC missing-energy searches put M<sub>D</sub> above roughly 5–11 TeV, depending on n.`; }
    else { cls = "good"; msg = `<b>Still allowed.</b> R = ${len(R)} passes current tests. But in this model only gravity moves in the extra dimension, so matter, and a human, still cannot enter.`; }
    $("addVerdict").className = "verdict " + cls; $("addVerdict").innerHTML = msg;
    drawScale(R);
  }
  function drawScale(R) {
    const c = $("scaleChart"); if (!c.offsetParent) return;
    const { g, w, h } = ctx2d(c), p = P(), lo = -36, hi = 14, x0 = 20, x1 = w - 20, y = h * 0.52;
    const X = m => x0 + (Math.log10(m) - lo) / (hi - lo) * (x1 - x0);
    g.fillStyle = p.rose; g.globalAlpha = 0.14; g.fillRect(X(K.gravLimit_m), y - 18, x1 - X(K.gravLimit_m), 36); g.globalAlpha = 1;
    g.strokeStyle = p.muted; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    logAxis(g, x0, x1, y + 22, lo, hi, w < 500 ? 10 : 5, p.muted, e => "10" + sup(e) + " m");
    const marks = [[1.6e-35, "Planck length"], [1.4e-19, "LHC reach"], [8.4e-16, "proton"], [1e-10, "atom"], [4e-5, "gravity tested"], [1.8, "human"], [1.27e7, "Earth"], [1.5e11, "Earth–Sun"]];
    g.textAlign = "center";
    marks.forEach(([m, t], i) => { const x = X(m); g.fillStyle = p.muted; g.fillRect(x - 1, y - 6, 2, 12); g.fillText(t, x, i % 2 ? y - 26 : y - 12); });
    const xr = Math.min(x1, Math.max(x0, X(R)));
    g.fillStyle = p.gold; g.beginPath(); g.arc(xr, y, 7, 0, 7); g.fill();
    g.font = `600 13px ${css("--f-mono")}`; g.fillText("R", xr, y + 44);
    g.font = `11px ${css("--f-mono")}`; g.fillStyle = p.rose; g.textAlign = "right"; g.fillText("excluded for gravity-only dimensions", x1, y + 62 > h ? h - 4 : y + 62);
  }
  ["addN", "addM"].forEach(id => $(id).addEventListener("input", add));

  // ---------- 3. Time travel ----------
  function timeCalc() {
    const v = Math.min(0.99999, +$("tV").value), tau = Math.max(0, +$("tTau").value || 0), h = Math.max(0, +$("tH").value || 0);
    $("tVVal").textContent = `${v.toFixed(v > 0.999 ? 5 : 3)} c`;
    const gam = 1 / Math.sqrt(1 - v * v), te = gam * tau;
    const gr = K.GM / (K.c * K.c) * (1 / K.RE - 1 / (K.RE + h));
    const vorb = Math.sqrt(K.GM / (K.RE + h)), kin = -(vorb * vorb) / (2 * K.c * K.c);
    const usDay = x => x * 86400 * 1e6;
    $("timeOut").innerHTML = kv([
      ["Lorentz factor γ", gam.toFixed(4), "", true],
      ["Years passed on Earth", te.toFixed(2), `while ${tau} pass on the ship`],
      ["Jump into the future", `${(te - tau).toFixed(2)} yr`, "one-way only", true],
      ["Turn-around distance", `${(v * te / 2).toFixed(2)} ly`, "out-and-back trip"],
      ["Gravity: clock at height h", `${usDay(gr) >= 0 ? "+" : ""}${usDay(gr).toFixed(2)} µs/day`, "runs faster than on the ground"],
      ["Orbit speed effect", `${usDay(kin).toFixed(2)} µs/day`, `if orbiting at ${sci(vorb / 1000, 2)} km/s`],
      ["Net for an orbiting clock", `${usDay(gr + kin) >= 0 ? "+" : ""}${usDay(gr + kin).toFixed(2)} µs/day`, h > 1.9e7 && h < 2.1e7 ? "GPS value ≈ +38 µs/day ✓" : "GPS height = 20,200 km"]
    ]);
    drawTime(v);
  }
  function drawTime(sel) {
    const c = $("timeChart"); if (!c.offsetParent) return;
    const { g, w, h } = ctx2d(c), p = P(), L = 40, R = 14, Tp = 18, B = 28, ymax = 25;
    const X = v => L + v * (w - L - R), Y = gm => Tp + (h - Tp - B) * (1 - (gm - 1) / (ymax - 1));
    g.strokeStyle = p.line; g.fillStyle = p.muted;
    [1, 5, 10, 15, 20, 25].forEach(gm => { g.beginPath(); g.moveTo(L, Y(gm)); g.lineTo(w - R, Y(gm)); g.stroke(); g.textAlign = "right"; g.fillText(gm, L - 6, Y(gm) + 4); });
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(v => { g.textAlign = "center"; g.fillText(v + "c", X(v), h - 8); });
    g.strokeStyle = p.cyan; g.lineWidth = 2.5; g.beginPath();
    for (let v = 0; v < 0.9992; v += 0.001) { const gm = 1 / Math.sqrt(1 - v * v); if (gm > ymax) break; v === 0 ? g.moveTo(X(v), Y(gm)) : g.lineTo(X(v), Y(gm)); }
    g.stroke(); g.lineWidth = 1;
    const gs = 1 / Math.sqrt(1 - sel * sel);
    g.fillStyle = p.gold; g.beginPath(); g.arc(X(sel), Y(Math.min(gs, ymax)), 6, 0, 7); g.fill();
    g.textAlign = "left"; g.fillStyle = p.muted; g.fillText("γ (Earth years per ship year)", L, 12);
  }
  ["tV", "tTau", "tH"].forEach(id => $(id).addEventListener("input", timeCalc));

  // ---------- 4. Short-range gravity ----------
  function grav() {
    const R = Math.pow(10, +$("gR").value), n = +$("gN").value, r = Math.pow(10, +$("gr").value);
    $("gRVal").textContent = len(R); $("gNVal").textContent = n; $("grVal").textContent = len(r);
    const Fn = K.G * 1e-6 / (r * r), enh = r < R ? Math.pow(R / r, n) : 1;
    $("gravOut").innerHTML = kv([
      ["Newton force (two 1 g masses)", `${sci(Fn, 3)} N`, "F = Gm₁m₂/r²"],
      ["With extra dimensions", `${sci(Fn * enh, 3)} N`, r < R ? `r < R, so gravity leaks less` : "r > R: no change", true],
      ["Gravity boost", `${sci(enh, 3)}×`, enh > 1 ? `grows like 1/r${sup(n + 2)} below R` : "identical to Newton"],
      ["Experiment status", R > K.gravLimit_m ? "Excluded" : "Allowed", R > K.gravLimit_m ? "torsion balances see no boost above ~40 µm" : `test needs r below ${len(R)}`, true]
    ]);
    drawGrav(R, n, r);
  }
  function drawGrav(R, n, r) {
    const c = $("gravChart"); if (!c.offsetParent) return;
    const { g, w, h } = ctx2d(c), p = P(), L = 50, Rt = 14, Tp = 20, B = 30, lo = -7, hi = -2;
    const F = (x, ex) => Math.log10(K.G * 1e-6 / (x * x) * (ex && x < R ? Math.pow(R / x, n) : 1));
    const fmin = F(Math.pow(10, hi), false), fmax = Math.max(F(Math.pow(10, lo), true), F(Math.pow(10, lo), false));
    const X = e => L + (e - lo) / (hi - lo) * (w - L - Rt), Y = f => Tp + (h - Tp - B) * (1 - (f - fmin) / (fmax - fmin));
    g.fillStyle = p.ok; g.globalAlpha = 0.1; g.fillRect(X(Math.log10(5e-5)), Tp, w - Rt - X(Math.log10(5e-5)), h - Tp - B); g.globalAlpha = 1;
    g.fillStyle = p.muted; g.textAlign = "left"; g.fillText("tested: matches Newton", X(Math.log10(5e-5)) + 6, Tp + 14);
    logAxis(g, L, w - Rt, h - B + 4, lo, hi, 1, p.muted, e => "10" + sup(e) + " m");
    const curve = (ex, col, dash) => { g.strokeStyle = col; g.lineWidth = 2.5; g.setLineDash(dash || []); g.beginPath(); for (let e = lo; e <= hi + 1e-9; e += 0.02) { const y = Y(F(Math.pow(10, e), ex)); e === lo ? g.moveTo(X(e), y) : g.lineTo(X(e), y); } g.stroke(); g.setLineDash([]); g.lineWidth = 1; };
    curve(true, p.gold); curve(false, p.cyan, [6, 5]);
    const xr = X(Math.log10(R)); g.strokeStyle = p.rose; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(xr, Tp); g.lineTo(xr, h - B); g.stroke(); g.setLineDash([]);
    g.fillStyle = p.rose; g.textAlign = "center"; g.fillText("R", xr, Tp - 6);
    const xe = Math.log10(r); g.fillStyle = p.fg; g.beginPath(); g.arc(X(xe), Y(F(r, true)), 5, 0, 7); g.fill();
    g.textAlign = "left"; g.fillStyle = p.cyan; g.fillText("— — Newton", L + 6, h - B - 24); g.fillStyle = p.gold; g.fillText("—— with extra dims", L + 6, h - B - 10);
  }
  ["gR", "gN", "gr"].forEach(id => $(id).addEventListener("input", grav));

  // ---------- 5. Entry engine ----------
  let smMode = "all";
  document.querySelectorAll("#eSM button").forEach(b => b.addEventListener("click", () => {
    smMode = b.dataset.sm; document.querySelectorAll("#eSM button").forEach(x => x.classList.toggle("on", x === b)); engine();
  }));
  function engine() {
    const R = Math.pow(10, +$("eR").value), m = Math.max(1, +$("eM").value || 70);
    $("eRVal").textContent = len(R);
    const Ep = K.hbarc_eVm / R, N = m / K.mp, EJ = N * Ep * K.eV;
    const years = EJ / K.worldYear_J, sunS = EJ / K.sunSec_J;
    const thermal = Ep < 0.025;
    $("engineOut").innerHTML = kv([
      ["Energy per particle", energy(Ep), "E = ħc / R", true],
      ["Particles in body", sci(N, 2), "protons + neutrons"],
      ["Total entry energy", `${sci(EJ, 2)} J`, years >= 1 ? `${sci(years, 2)} years of all world energy` : `${sci(years * 365.25, 2)} days of world energy`, true],
      ["Sun's output needed", sunS >= 1 ? `${sci(sunS, 2)} s` : `${sci(sunS * 1000, 2)} ms`, "Sun emits 3.8×10²⁶ J/s"],
      ["Per-particle vs LHC", `${sci(Ep / K.lhc_eV, 2)}×`, "LHC = 13.6 TeV per collision"],
      ["Body vs dimension", R >= 2 ? "Body fits" : `${sci(K.human_m / R, 1)}× bigger`, thermal ? "atoms would already drift into it at room temperature" : "you could only circle it, not stand in it"]
    ]);

    const st = [], notes = [];
    // 1 sensor
    if (smMode === "grav") {
      if (R > K.gravLimit_m) { st.push("bad"); notes.push("Excluded: torsion balances find no extra gravity above 40 µm."); }
      else if (R >= 1e-6) { st.push("ok"); notes.push("Testable: next-generation torsion balances and micro-cantilevers reach here."); }
      else { st.push("mid"); notes.push("Below tabletop reach: gravity is too weak to measure at this size."); }
    } else {
      if (R > K.smLimit_m) { st.push("bad"); notes.push("Excluded: the LHC would already have produced Kaluza–Klein particles."); }
      else if (R >= K.smLimit_m / 7) { st.push("mid"); notes.push("Testable by the proposed 100 TeV Future Circular Collider."); }
      else { st.push("mid"); notes.push("Beyond any planned collider."); }
    }
    // 2 energy
    if (EJ < 3.15e16) { st.push("ok"); notes.push(`${sci(EJ, 2)} J: less than one large power plant running for a year.`); }
    else if (EJ < K.worldYear_J) { st.push("mid"); notes.push(`${sci(years * 365.25, 2)} days of the whole world's energy.`); }
    else { st.push("bad"); notes.push(`${sci(years, 2)} years of all world energy, delivered at once.`); }
    // 3 momentum injector
    if (Ep <= 1e3) { st.push("ok"); notes.push(`${energy(Ep)} per particle: ordinary lab electronics.`); }
    else if (Ep <= K.lhc_eV) { st.push("mid"); notes.push(`${energy(Ep)} per particle, but for ${sci(N, 1)} particles at once. No accelerator does this.`); }
    else { st.push("bad"); notes.push(`${energy(Ep)} per particle is beyond the LHC.`); }
    // 4 brane exit
    if (smMode === "grav") { st.push("bad"); notes.push("No known mechanism: in brane models, atoms are bound to our 3D membrane."); }
    else if (R <= K.smLimit_m) { st.push("mid"); notes.push("Matter could move in it, but only as short-lived quantum excitations, not as a whole body."); }
    else { st.push("bad"); notes.push("A matter-accessible dimension this big is ruled out by experiment."); }
    // 5 crew capsule
    if (R >= 2 && smMode === "all" && R <= K.smLimit_m) { st.push("mid"); notes.push("Body fits. Survival unknown."); }
    else if (R >= 2) { st.push("bad"); notes.push("Body would fit, but such a large dimension is already excluded."); }
    else { st.push("bad"); notes.push(`Your body is ${sci(K.human_m / R, 1)}× larger than the dimension.`); }

    const names = ["Dimension sensor", "Energy source", "Momentum injector", "Brane exit", "Crew capsule"];
    const word = { ok: "Buildable", mid: "Open problem", bad: "Blocked" }, pill = { ok: "ok", mid: "theory", bad: "blocked" };
    $("subsystems").innerHTML = names.map((nm, i) => `<li class="${st[i]}"><div class="sh"><strong>${i + 1} · ${nm}</strong><span class="pill ${pill[st[i]]}">${word[st[i]]}</span></div><p>${notes[i]}</p></li>`).join("");
    if (HD.engineModel) HD.engineModel.setStatus(st);
  }
  ["eR", "eM"].forEach(id => $(id).addEventListener("input", engine));

  // ---------- Orbit simulator ----------
  const oc = $("orbitCanvas");
  let od = 3, sim = null;
  function resetOrbit() {
    const kick = +$("orbitKick").value / 100;
    $("orbitKickVal").textContent = Math.round(kick * 100) + "%";
    sim = { x: 1, y: 0, vx: 0, vy: 1 + kick, trail: [], t: 0, orbits: 0, lastA: 0, state: "run", turns: 0 };
    if (HD.reduceMotion) { for (let i = 0; i < 400 && sim.state === "run"; i++) stepOrbit(); }
  }
  function acc(x, y) { const r = Math.hypot(x, y), f = 1 / Math.pow(r, od - 1); return [-f * x / r, -f * y / r]; }
  function stepOrbit() {
    const dt = 0.004;
    for (let i = 0; i < 12; i++) {
      let [ax, ay] = acc(sim.x, sim.y);
      sim.vx += ax * dt / 2; sim.vy += ay * dt / 2; sim.x += sim.vx * dt; sim.y += sim.vy * dt;
      [ax, ay] = acc(sim.x, sim.y); sim.vx += ax * dt / 2; sim.vy += ay * dt / 2;
      const a = Math.atan2(sim.y, sim.x); if (sim.lastA < 0 && a >= 0 && sim.y >= 0) sim.turns++; sim.lastA = a;
      const r = Math.hypot(sim.x, sim.y);
      if (r < 0.06) { sim.state = "crash"; break; }
      if (r > 4.5) { sim.state = "escape"; break; }
    }
    sim.trail.push([sim.x, sim.y]); if (sim.trail.length > 1600) sim.trail.shift();
  }
  function drawOrbit() {
    const { g, w, h } = ctx2d(oc), p = P(), s = Math.min(w, h) * 0.3, cx = w / 2, cy = h / 2;
    g.strokeStyle = p.line; g.setLineDash([3, 5]); g.beginPath(); g.arc(cx, cy, s, 0, 7); g.stroke(); g.setLineDash([]);
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, 26); grd.addColorStop(0, p.gold); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.fill();
    g.strokeStyle = p.cyan; g.lineWidth = 1.6; g.beginPath();
    sim.trail.forEach(([x, y], i) => { const X = cx + x * s, Y = cy - y * s; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); g.lineWidth = 1;
    if (sim.state === "run") { g.fillStyle = p.fg; g.beginPath(); g.arc(cx + sim.x * s, cy - sim.y * s, 5, 0, 7); g.fill(); }
    g.fillStyle = p.muted; g.textAlign = "left"; g.fillText(`${od} space dimensions · F ∝ 1/r${sup(od - 1)}`, 14, 22);
    const v = $("orbitVerdict");
    if (sim.state === "crash") { v.className = "verdict bad"; v.innerHTML = `<b>Unstable.</b> The planet spiralled into the star after ${sim.turns} orbit${sim.turns === 1 ? "" : "s"}. With ${od} space dimensions, no solar system or atom could last.`; }
    else if (sim.state === "escape") { v.className = "verdict bad"; v.innerHTML = `<b>Unstable.</b> The planet flew off into space after ${sim.turns} orbit${sim.turns === 1 ? "" : "s"}.`; }
    else if (od === 3) { v.className = "verdict good"; v.innerHTML = `<b>Stable.</b> The orbit closes into an ellipse and repeats forever. Only 3 space dimensions do this, which is why planets and atoms exist.`; }
    else if (od === 2) { v.className = "verdict mid"; v.innerHTML = `<b>Bounded, never closes.</b> In 2D gravity falls as 1/r: the planet traces a rosette and never escapes, even with a huge push.`; }
    else { v.className = "verdict mid"; v.innerHTML = `<b>Watch it drift…</b> In ${od}D even a tiny push grows.`; }
  }
  function orbitLoop() { if (sim.state === "run" && !HD.reduceMotion) stepOrbit(); drawOrbit(); requestAnimationFrame(orbitLoop); }
  document.querySelectorAll("#orbitDims button").forEach(b => b.addEventListener("click", () => { od = +b.dataset.d; document.querySelectorAll("#orbitDims button").forEach(x => x.classList.toggle("on", x === b)); resetOrbit(); }));
  $("orbitKick").addEventListener("input", resetOrbit);
  $("orbitReset").addEventListener("click", resetOrbit);
  resetOrbit(); orbitLoop();

  // ---------- Roadmap ----------
  const KEY = "hd-roadmap-v1";
  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { done = {}; }
  const wordW = { ok: "ok", mid: "theory", bad: "blocked" };
  function renderStages() {
    let total = 0, ticked = 0, unlocked = true;
    $("stages").innerHTML = HD.stages.map((s, i) => {
      const allDone = s.criteria.every((_, j) => done[`${i}.${j}`]);
      const locked = !unlocked;
      const html = `<div class="stage${locked ? " locked" : ""}">
        <div><div class="num">${String(i + 1).padStart(2, "0")}</div><div class="lockstate">${locked ? "Locked" : allDone ? "Gate passed" : "In progress"}</div></div>
        <div class="body"><h3>${s.title}</h3><p>${s.text}</p>
          <dl class="res"><dt>Resources</dt><dd>${s.res}</dd><dt>Cost</dt><dd>${s.cost}</dd><dt>Time</dt><dd>${s.time}</dd></dl></div>
        <div class="crit"><h4 class="eyebrow">Gate criteria</h4>
          ${s.criteria.map((c, j) => { total++; if (done[`${i}.${j}`]) ticked++; return `<label><input type="checkbox" id="crit-${i}-${j}" data-k="${i}.${j}" ${done[`${i}.${j}`] ? "checked" : ""} ${locked ? "disabled" : ""}>${c}</label>`; }).join("")}
          <div class="world"><span class="pill ${wordW[s.world[0]]}">World 2026</span><span>${s.world[1]}</span></div>
        </div></div>`;
      if (!allDone) unlocked = false;
      return html;
    }).join("");
    $("meterFill").style.width = (ticked / total * 100) + "%";
    $("meterText").textContent = `${ticked} of ${total} criteria met`;
    $("stages").querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => {
      done[inp.dataset.k] = inp.checked;
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      renderStages();
    }));
  }
  renderStages();

  function redrawAll() { geo(); add(); timeCalc(); grav(); }
  redrawAll(); engine();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redrawAll, 150); });
  if (document.fonts) document.fonts.ready.then(redrawAll);
})();
