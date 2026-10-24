// Wires the explorer, platform panel and engine viewer to the DOM.
(function () {
  const $ = id => document.getElementById(id);
  const statusClass = { real: "real", theory: "theory" };

  if (!window.THREE) {
    document.querySelectorAll("canvas").forEach(c => { if (c.id !== "orbitCanvas" && !c.classList.contains("chart")) c.replaceWith(Object.assign(document.createElement("p"), { className: "verdict bad", textContent: "3D view needs WebGL and the Three.js library. Check your connection and reload." })); });
    return;
  }

  HD.initHero();

  // ---------- Explorer ----------
  const viewer = HD.Viewer($("explorerCanvas"), { cam: [5, 3.5, 7] });
  const rail = $("dimRail"), tabs = $("viewTabs"), card = $("dimCard"), caption = $("viewCaption");
  let cur = HD.dimensions[4], view = "shape";

  HD.dimensions.forEach(d => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab"); b.dataset.n = d.n;
    b.innerHTML = `<span class="n">${d.n}D</span><span class="s">${d.short}</span><span class="dot" style="background:var(${d.status === "real" ? "--cyan" : "--gold"})"></span>`;
    b.addEventListener("click", () => { selectDim(d.n); history.replaceState(null, "", `#d${d.n}`); });
    rail.appendChild(b);
  });

  function selectDim(n) {
    cur = HD.dimensions[n]; view = "shape";
    [...rail.children].forEach(b => b.setAttribute("aria-selected", +b.dataset.n === n));
    tabs.innerHTML = "";
    cur.views.forEach(v => {
      const b = document.createElement("button");
      b.setAttribute("role", "tab"); b.dataset.v = v; b.textContent = HD.viewNames[v];
      b.addEventListener("click", () => { showView(v); history.replaceState(null, "", `#d${cur.n}-${v}`); });
      tabs.appendChild(b);
    });
    const m = cur.machine;
    card.innerHTML = `
      <div class="title"><span class="big-n">${cur.n}D</span><div><h3>${cur.name}</h3><div class="coords">${cur.coords}</div></div></div>
      <div><span class="pill ${statusClass[cur.status]}">${cur.statusText}</span></div>
      <div class="blk"><h4>What it is</h4><p>${cur.what}</p></div>
      <div class="blk"><h4>What physics shows</h4><p>${cur.physics}</p></div>
      <div class="blk"><h4>Can we go inside?</h4><p>${cur.access}</p></div>
      <div class="machine">
        <h4>Machine that probes it</h4>
        <div class="mname">${m.name}</div>
        <p>${m.what}</p>
        <dl class="spec"><dt>Where</dt><dd>${m.where}</dd><dt>Measures</dt><dd>${m.measures}</dd><dt>Cost</dt><dd>${m.cost}</dd></dl>
        <button class="btn small" type="button" id="seeMachine">Show machine in 3D</button>
      </div>`;
    $("seeMachine").addEventListener("click", () => showView("machine"));
    showView("shape");
  }

  function showView(v) {
    view = v;
    [...tabs.children].forEach(b => b.setAttribute("aria-selected", b.dataset.v === v));
    let c;
    if (v === "shape") { c = HD.NCube(cur.n); c.cam = cur.n <= 1 ? [0, 1.5, 6] : [5, 3.5, 7]; }
    else if (v === "compact") c = HD.Compact();
    else if (v === "calabi") c = HD.CalabiYau();
    else if (v === "brane") c = HD.Brane();
    else c = HD.machine(cur.n);
    viewer.set(c);
    caption.textContent = HD.viewCaptions[v](v === "machine" ? cur : cur.n);
  }
  // shareable links: #d6 or #d6-machine
  const m = location.hash.match(/^#d(\d{1,2})(?:-(\w+))?$/);
  if (m && HD.dimensions[+m[1]]) {
    selectDim(+m[1]);
    if (m[2] && cur.views.includes(m[2])) showView(m[2]);
    requestAnimationFrame(() => document.getElementById("explorer").scrollIntoView());
  } else selectDim(4);

  // ---------- Platform ----------
  const list = $("blockList"), info = $("blockInfo");
  const platform = HD.initPlatform(id => {
    const b = HD.blocks.find(x => x.id === id);
    [...list.children].forEach(x => x.setAttribute("aria-selected", x.dataset.id === id));
    info.innerHTML = `<h3>${b.name}</h3><p>${b.does}</p>
      <div class="blk"><h4 class="eyebrow">Needs</h4><ul>${b.needs.map(x => `<li>${x}</li>`).join("")}</ul></div>
      <div class="verdict good"><b>Working when:</b> ${b.done}</div>`;
  });
  HD.blocks.forEach(b => {
    const btn = document.createElement("button");
    btn.setAttribute("role", "tab"); btn.dataset.id = b.id; btn.textContent = b.name;
    btn.addEventListener("click", () => platform.select(b.id));
    list.appendChild(btn);
  });
  platform.select("evidence");

  // ---------- Engine viewer ----------
  const ev = HD.Viewer($("engineCanvas"), { cam: [0, 4.5, 13], spin: 0.25 });
  HD.engineModel = HD.Engine();
  ev.set(HD.engineModel);
})();
