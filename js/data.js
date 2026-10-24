// Content for every section. Status: "real" = experienced or measured, "theory" = in theories, not detected.
window.HD = {};

HD.dimensions = [
  {
    n: 0, short: "Point", name: "The point", coords: "( )", status: "real", statusText: "Directly experienced",
    what: "A location with no length, width or height. You need zero numbers to say where you are, because there is nowhere else to be.",
    physics: "Electrons and quarks behave as points: experiments find no size down to 10⁻¹⁸ m. Everything around you is built from point-like particles.",
    access: "Already inside it. Every particle in your body is point-like.",
    views: ["shape", "machine"],
    machine: { name: "Optical tweezer atom trap", what: "A laser focused to a ~1 µm spot holds one single atom still, the closest thing to a physical 0D object.", where: "Quantum-computing labs (Harvard, Pasqal, QuEra)", measures: "Position and quantum state of one atom", cost: "₹1–3 crore for a full lab" }
  },
  {
    n: 1, short: "Line", name: "The line", coords: "( x )", status: "real", statusText: "Directly experienced",
    what: "One direction: forward and back. A train on a single track lives in 1D.",
    physics: "In carbon nanotubes and nanowires, electrons can only move along one direction. They then behave in new ways (Luttinger liquids).",
    access: "We can force particles into 1D paths with magnets and electric fields.",
    views: ["shape", "machine"],
    machine: { name: "Linear particle accelerator", what: "A straight vacuum pipe with radio-frequency cavities pushes particles along one line to near light speed.", where: "SLAC, California (3.2 km long)", measures: "Particle energy and structure of protons", cost: "Medical linacs ₹10–30 crore" }
  },
  {
    n: 2, short: "Plane", name: "The plane", coords: "( x, y )", status: "real", statusText: "Directly experienced",
    what: "Two directions: a flat sheet. A 2D creature could not imagine 'up'.",
    physics: "Graphene is one atom thick: its electrons truly live in 2D. That gives the quantum Hall effect (Nobel Prizes 1985, 1998, 2010).",
    access: "We build real 2D worlds for electrons in labs every day.",
    views: ["shape", "machine"],
    machine: { name: "Graphene / 2D materials lab", what: "A single sheet of carbon atoms in a honeycomb. Electrons moving in it cannot leave the sheet.", where: "University of Manchester, IISc Bengaluru", measures: "2D electron behaviour, quantum Hall resistance", cost: "₹50 lakh–2 crore" }
  },
  {
    n: 3, short: "Space", name: "Ordinary space", coords: "( x, y, z )", status: "real", statusText: "Our world",
    what: "Three directions: left–right, front–back, up–down. Every place you can walk.",
    physics: "Three is special. Only with three large space dimensions do planets have stable orbits and atoms have stable electron shells (Ehrenfest, 1917). Try the orbit simulator below.",
    access: "We live here and move freely in all three directions.",
    views: ["shape", "machine"],
    machine: { name: "GPS satellite in orbit", what: "A satellite on a stable 3D orbit 20,200 km up. Stable orbits are only possible in three space dimensions.", where: "31 GPS satellites, plus India's NavIC", measures: "Position on Earth to a few metres", cost: "₹1,000+ crore per satellite" }
  },
  {
    n: 4, short: "Time", name: "Spacetime: time as the 4th", coords: "( x, y, z, t )", status: "real", statusText: "Proven · measured",
    what: "Einstein joined space and time into 4D spacetime. To fix an event you need where and when. Separately, maths also allows a 4th space direction; that one has never been found.",
    physics: "Clocks run slower when moving fast or deep in gravity. Optical clocks detect the difference from raising a clock just 33 cm (NIST, 2010).",
    access: "We all move forward in time. Speed and gravity change the rate, so a fast trip skips you into the future. No known way back.",
    views: ["shape", "machine"],
    machine: { name: "Optical lattice atomic clock", what: "Thousands of atoms held in a standing wave of laser light, ticking 430 trillion times a second. It loses less than 1 second in the age of the universe.", where: "NIST & JILA (USA), RIKEN (Japan), NPL India", measures: "Time-dilation from height and speed", cost: "₹5–20 crore" }
  },
  {
    n: 5, short: "Kaluza", name: "The first extra space dimension", coords: "( x, y, z, t, w )", status: "theory", statusText: "Theory · not detected",
    what: "Kaluza (1921) and Klein (1926) added a 5th dimension curled into a tiny circle, and gravity plus electromagnetism fell out of one equation. Modern versions (ADD 1998, Randall–Sundrum 1999) make it larger, up to a fraction of a millimetre.",
    physics: "If gravity leaks into a large 5th dimension, it would get stronger than Newton's law at short distances. Torsion balances find no change down to ~50 µm.",
    access: "Limit (2020): any gravity-only extra dimension is smaller than ~40 µm, thinner than a hair. Ordinary matter cannot enter it at all in these models.",
    views: ["shape", "compact", "brane", "machine"],
    machine: { name: "Eöt-Wash torsion balance", what: "A ring with holes hangs from a thin fibre above a rotating attractor disk. A twist would reveal extra gravity at micrometre distances.", where: "University of Washington, Seattle", measures: "Gravity's 1/r² law down to ~50 µm", cost: "₹2–5 crore; a student version ₹10–50 lakh" }
  },
  {
    n: 6, short: "Calabi", name: "Compact dimensions begin", coords: "( x, y, z, t, w₁, w₂ )", status: "theory", statusText: "Theory · not detected",
    what: "String theory needs 6 extra space dimensions folded into a Calabi–Yau shape at every point of space. The 6th dimension is where that fold first has room to curve both ways.",
    physics: "If ordinary particles could move in extra dimensions, colliders would make heavier copies of them (Kaluza–Klein particles) or see energy vanish into the bulk. The LHC sees neither.",
    access: "Limit: dimensions that ordinary matter can move in must be smaller than ~10⁻¹⁹ m (about 1/10,000 of a proton).",
    views: ["shape", "calabi", "machine"],
    machine: { name: "Large Hadron Collider + CMS detector", what: "A 27 km ring smashes protons at 13.6 TeV. CMS, a 14,000-tonne detector, looks for missing energy and new heavy particles.", where: "CERN, Geneva", measures: "Missing energy, Kaluza–Klein particles, micro black holes", cost: "~₹40,000 crore (built)" }
  },
  {
    n: 7, short: "Waves", name: "Gravity's escape routes", coords: "( … , w₃ )", status: "theory", statusText: "Theory · not detected",
    what: "In 7D models, gravity has three hidden directions to spread into. Gravitational waves would then lose strength faster than light as they travel.",
    physics: "In 2017, gravitational waves and light from the same neutron-star merger (GW170817) arrived with matching strength. Gravity is not leaking into large extra dimensions.",
    access: "Large, flat extra dimensions are ruled out. Only tiny curled ones remain possible.",
    views: ["shape", "calabi", "machine"],
    machine: { name: "Gravitational-wave interferometer", what: "Two 4 km laser arms in an L. A passing gravitational wave stretches one arm by 1/10,000 of a proton width.", where: "LIGO (USA), Virgo (Italy), LIGO-India (Maharashtra, planned)", measures: "Gravitational-wave strength vs distance", cost: "LIGO-India ~₹2,600 crore" }
  },
  {
    n: 8, short: "Cosmos", name: "Imprints on the early universe", coords: "( … , w₄ )", status: "theory", statusText: "Theory · not detected",
    what: "Extra dimensions would have changed how fast the young universe expanded, leaving fingerprints in the oldest light.",
    physics: "Planck measured the cosmic microwave background so precisely that extra energy going into hidden dimensions is tightly limited (N_eff = 2.99 ± 0.17, matching 3 neutrino types).",
    access: "No sign of extra dimensions in the first 380,000 years of the universe.",
    views: ["shape", "calabi", "machine"],
    machine: { name: "Planck CMB space telescope", what: "A satellite with a cooled mirror mapped the 13.8-billion-year-old afterglow of the Big Bang across the whole sky.", where: "ESA, operated 2009–2013", measures: "Early-universe expansion, extra radiation", cost: "~₹6,500 crore" }
  },
  {
    n: 9, short: "Neutron", name: "Quantum tests of gravity", coords: "( … , w₅ )", status: "theory", statusText: "Theory · not detected",
    what: "With 9 space dimensions (superstrings), any extra force at tiny distances would shift quantum energy levels of very slow particles.",
    physics: "Ultracold neutrons bouncing on a mirror sit in quantum states set by Earth's gravity. Their energies match Newton exactly at micrometre scale.",
    access: "No new short-range force found. Another door closes for large dimensions.",
    views: ["shape", "calabi", "machine"],
    machine: { name: "qBounce neutron mirror", what: "Neutrons moving only a few metres per second bounce on a flat mirror. Gravity lets them hover only at specific heights, like rungs of a ladder.", where: "Institut Laue-Langevin, Grenoble", measures: "Quantum energy levels in gravity", cost: "₹5–15 crore (needs a reactor)" }
  },
  {
    n: 10, short: "Strings", name: "Superstring spacetime", coords: "( x, y, z, t, w₁…w₆ )", status: "theory", statusText: "Theory · not detected",
    what: "Superstring theory needs 10 dimensions: 9 of space and 1 of time. Six are curled into a Calabi–Yau shape about 10⁻³⁵ m across, the Planck length.",
    physics: "Probing 10⁻³⁵ m directly needs about 10¹⁶ TeV, a million billion times the LHC. No planned machine comes close.",
    access: "Physically entering would need energies only found in the Big Bang.",
    views: ["shape", "calabi", "machine"],
    machine: { name: "Future Circular Collider (proposed)", what: "A planned 91 km ring under Geneva, reaching 100 TeV, 7× the LHC. It would test whether extra dimensions start at a slightly larger size.", where: "CERN, proposed for the 2040s–2070s", measures: "Heavier KK particles, higher missing-energy reach", cost: "~₹1.5 lakh crore (estimate)" }
  },
  {
    n: 11, short: "M-theory", name: "M-theory", coords: "( x, y, z, t, w₁…w₇ )", status: "theory", statusText: "Theory · not detected",
    what: "Witten (1995) showed the five string theories are parts of one 11D theory: 10 space and 1 time. Our universe could be a membrane (brane) floating in it.",
    physics: "No experiment can reach M-theory's scale. Progress is made with mathematics and supercomputer calculations that check the theory hangs together.",
    access: "Entry is far beyond any known physics. It remains a mathematical world.",
    views: ["shape", "brane", "machine"],
    machine: { name: "Supercomputer cluster", what: "Racks of GPUs run lattice simulations and search the huge space of possible Calabi–Yau shapes for one that matches our particles.", where: "Frontier (USA), PARAM Siddhi-AI (India)", measures: "Mathematical consistency, candidate universes", cost: "₹100–5,000 crore; cloud GPUs from ₹200/hour" }
  }
];

HD.viewNames = { shape: "Geometry", compact: "Curled-up form", calabi: "Calabi–Yau fold", brane: "Brane world", machine: "Machine" };
HD.viewCaptions = {
  shape: n => n <= 3 ? `${n}D shape · ${Math.pow(2, n)} corners` : `${n}-cube projected into 3D · ${Math.pow(2, n)} corners · ${n * Math.pow(2, n - 1)} edges · edge colour = axis`,
  compact: () => "Every point of space hides a tiny circle (radius R). Ants could walk around it; we are too big to notice.",
  calabi: () => "A slice of a Calabi–Yau shape: in string theory, six dimensions fold like this at every point.",
  brane: () => "Our 3D universe as a membrane. Matter (cyan) is stuck on it; gravitons (gold) leak into the bulk.",
  machine: d => `${d.machine.name} · ${d.machine.where}`
};

HD.blocks = [
  { id: "theory", name: "Theory library", pos: [-6, 0, -2.5], color: 0xf3b84e,
    does: "Holds the models we test: Kaluza–Klein, ADD large extra dimensions, Randall–Sundrum, universal extra dimensions, string compactifications.",
    needs: ["arXiv papers and the PDG review 'Extra Dimensions'", "Markdown + LaTeX notes in this GitHub repo", "₹0"],
    done: "Each model has one equation for a measurable prediction and the latest experimental limit quoted with a source." },
  { id: "geometry", name: "Geometry engine", pos: [-2, 0, -2.5], color: 0x52d6e6,
    does: "Builds n-dimensional objects (hypercubes, hyperspheres, Calabi–Yau slices), rotates them in any plane and projects them to 3D.",
    needs: ["JavaScript + Three.js (this site)", "Python + NumPy for batch work", "₹0, any laptop"],
    done: "Vertex, edge and face counts match C(n,k)·2ⁿ⁻ᵏ for n ≤ 11; n-ball volumes match π^(n/2)/Γ(n/2+1)." },
  { id: "physics", name: "Physics engine", pos: [2, 0, -2.5], color: 0x52d6e6,
    does: "Turns a model into numbers: size of extra dimensions, Kaluza–Klein masses, modified gravity, signal expected in each experiment.",
    needs: ["Python, SciPy, Jupyter", "Optional GPU (Colab free tier or ₹200/hour cloud)", "₹0–50,000"],
    done: "Reproduces at least one published limit curve (e.g. Eöt-Wash 2020) within its error bars." },
  { id: "data", name: "Open data", pos: [6, 0, -2.5], color: 0x8f99bd,
    does: "Pulls real measurements: CERN Open Data (CMS events), GWOSC (LIGO waves), Planck Legacy Archive, PDG tables.",
    needs: ["opendata.cern.ch, gwosc.org, pla.esac.esa.int", "Cloud storage ₹2,000–10,000/month", "Docker for CMS software"],
    done: "One full dataset downloaded, checksummed and re-analysed with a published result reproduced." },
  { id: "lab", name: "Tabletop lab", pos: [-4, 0, 2.5], color: 0xf0708e,
    does: "A real experiment once a prediction is in reach: torsion balance, micro-cantilever force sensor or laser interferometer.",
    needs: ["Vacuum chamber, vibration isolation, autocollimator", "University partner lab", "₹10 lakh–1 crore"],
    done: "Sensitivity proven with a known force; systematic error budget written; result replicated by a second team." },
  { id: "evidence", name: "Evidence engine", pos: [0, 0.6, 2.5], color: 0xf3b84e, size: 1.35,
    does: "Compares predictions with measurements, computes significance (σ) and decides if a stage gate passes. The heart of the platform.",
    needs: ["Statistics: likelihoods, blind analysis, look-elsewhere correction", "Python (pyhf, iminuit)", "₹0"],
    done: "A discovery claim needs 5σ (1 in 3.5 million chance of being noise) and two independent confirmations." },
  { id: "ai", name: "AI research assistant", pos: [4, 0, 2.5], color: 0x52d6e6,
    does: "Reads papers, drafts calculations, spots errors and suggests tests. It never counts as evidence on its own.",
    needs: ["Claude or similar LLM via API", "Retrieval over the theory library", "₹2,000–15,000/month"],
    done: "Every AI-produced number is re-derived in the physics engine before it is used." },
  { id: "dash", name: "Dashboard", pos: [0, 0, 6], color: 0x8f99bd,
    does: "This website: shows every model, limit, calculator and stage gate in one public place on GitHub Pages.",
    needs: ["GitHub repo + Pages", "₹0"],
    done: "Public URL live; each number links to its source; roadmap shows current stage." }
];
HD.links = [["theory", "physics"], ["geometry", "physics"], ["physics", "evidence"], ["data", "evidence"], ["lab", "evidence"], ["ai", "physics"], ["ai", "theory"], ["evidence", "dash"]];

HD.stages = [
  { title: "Geometry foundation", text: "Model 0D–11D mathematically and visualise it.", time: "2–4 weeks", cost: "₹0", res: "Laptop, Python, JavaScript, Three.js",
    criteria: ["n-cube counts match C(n,k)·2ⁿ⁻ᵏ for n = 0…11", "n-ball volumes match the Γ-function formula", "Interactive 3D projections published on GitHub Pages"],
    world: ["ok", "Done: this website is stage 1"] },
  { title: "Pick a testable model", text: "Choose one theory and write down what it predicts that can be measured.", time: "1–3 months", cost: "₹0", res: "arXiv, PDG review, a physics mentor",
    criteria: ["Model named (ADD, Randall–Sundrum or UED)", "One prediction written as an equation with numbers", "Current experimental limit quoted with source"],
    world: ["ok", "Many models are well studied"] },
  { title: "Simulate predictions", text: "Code the model and compute what each experiment should see.", time: "1–3 months", cost: "₹0–50,000", res: "Python, Jupyter, optional GPU",
    criteria: ["Code reproduces one published limit curve", "Uncertainties propagated through every result", "Code and notebooks public in the repo"],
    world: ["ok", "Standard practice in the field"] },
  { title: "Analyse open data", text: "Run your pipeline on real CERN, LIGO or Planck data.", time: "2–6 months", cost: "₹5,000–50,000 cloud", res: "CERN Open Data, GWOSC, Planck archive",
    criteria: ["One published analysis reproduced from raw open data", "Blind analysis: cuts fixed before looking at signal region", "Results reviewed by an outside physicist"],
    world: ["mid", "Open data searches done; no signal found"] },
  { title: "Tabletop experiment", text: "Build or join an experiment that measures gravity below 50 µm.", time: "1–3 years", cost: "₹10 lakh–1 crore", res: "University lab, vacuum system, torsion fibre or micro-cantilever",
    criteria: ["Instrument calibrated with a known force", "Systematic error budget below expected signal", "Measurement replicated by a second team"],
    world: ["mid", "Eöt-Wash reached ~50 µm; gravity still exactly 1/r²"] },
  { title: "Detect an extra dimension", text: "The gate everything else waits on: a confirmed signal.", time: "Unknown", cost: "Global collaborations", res: "LHC, future colliders, precision gravity, GW detectors",
    criteria: ["Signal at 5σ significance", "Confirmed by two independent experiments", "Different methods agree on the dimension's size"],
    world: ["bad", "Not met: no extra dimension detected as of 2026"] },
  { title: "Entry engine feasibility", text: "Only now ask whether matter, and then a human, could move into it.", time: "Unknown", cost: "Unknown", res: "New physics required",
    criteria: ["Dimension large enough for a body (> 2 m) and open to ordinary matter", "A known mechanism to move atoms off our brane", "Energy needed below what civilisation can supply", "Survivable for a living body"],
    world: ["bad", "Blocked: matter-accessible dimensions must be < 10⁻¹⁹ m"] }
];
