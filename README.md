# Higher Dimensions Lab

An interactive research lab for dimensions **0 to 11**. For every dimension it shows the geometry in 3D, the real machine scientists use to probe it, and the physics that decides whether a human could ever go inside.

**Live site:** https://ramakrishnadandu.github.io/HigherDimesions/

## What's inside

| Section | What it does |
|---|---|
| **Dimension explorer** | 0D–11D. Each dimension has a rotating 3D shape (point → line → square → cube → tesseract → up to the 11-cube), plus extra views: curled-up dimension, Calabi–Yau fold, brane world. |
| **12 machine models** | Optical tweezer (0D), linear accelerator (1D), graphene (2D), GPS satellite (3D), optical atomic clock (4D), Eöt-Wash torsion balance (5D), LHC + CMS (6D), LIGO (7D), Planck satellite (8D), qBounce neutron mirror (9D), Future Circular Collider (10D), supercomputer (11D). |
| **Why we can't go inside** | Four physical reasons, plus an orbit simulator showing planets are only stable in 3 space dimensions. |
| **Research platform** | Clickable 3D block diagram: theory library, geometry engine, physics engine, open data, tabletop lab, evidence engine, AI assistant, dashboard. Each block lists what it needs and when it counts as working. |
| **Calculators** | Hypercube / hypersphere (any n), extra-dimension size (ADD model), time dilation incl. GPS clock check, short-range gravity. |
| **Entry engine** | Set the dimension size and traveller mass. It computes the energy per particle (ħc/R) and the total energy for a whole body, then marks each of 5 subsystems as buildable, open problem or blocked. |
| **Stage-gate roadmap** | 7 stages from "geometry foundation" to "entry engine feasibility", each with resources, cost (₹), time and gate criteria. Progress is saved in your browser. |

Shareable links open a specific view, for example `#d6-machine` or `#d5-compact`.

## Key formulas

- n-cube parts: `C(n,k) · 2^(n−k)`
- n-ball volume: `V_n(r) = π^(n/2) r^n / Γ(n/2 + 1)`
- Gravity in d space dimensions: `F ∝ 1/r^(d−1)`
- Lorentz factor: `γ = 1/√(1 − v²/c²)`
- ADD extra dimensions: `M_Pl² = M_D^(n+2) · R^n`
- Energy to move in a compact dimension: `E = ħc / R`

## Honest status (2026)

Time (the 4th dimension of spacetime) is proven and measured every day. Extra space dimensions (5th–11th) appear in theories but have **not** been detected. Gravity-only extra dimensions must be smaller than ~40 µm, and dimensions ordinary matter can move in must be smaller than ~10⁻¹⁹ m. No known machine can carry matter into one.

## Run locally

Any static server works:

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

1. Push to `main`.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/HigherDimesions/` within a minute or two.

## Built with

Plain HTML, CSS and JavaScript · [Three.js r128](https://threejs.org/) from CDN · no build step.

## Sources

Kaluza (1921), Klein (1926); Arkani-Hamed, Dimopoulos & Dvali (1998); Randall & Sundrum (1999); Witten (1995); Lee et al., PRL 124 (2020) torsion-balance test; CMS & ATLAS missing-energy searches; Pardo et al. (2018) GW170817 test; Planck 2018 results; Chou et al., Science (2010); Ehrenfest (1917); Particle Data Group review "Extra Dimensions".
