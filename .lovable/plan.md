## Goal
Transform Dark Field Tech Labs into a sitewide Interstellar-inspired experience with photoreal React Three Fiber 3D on every page, matching the cinematic tone of the reference trailer (Gargantua, Endurance, Ranger, wormhole, water/ice planets, cornfield/dust, tesseract).

## Architecture

### New shared 3D system (`src/components/three/`)
- `SceneCanvas.tsx` — shared R3F `<Canvas>` wrapper with tone mapping (ACES), postprocessing (Bloom + Vignette + ChromaticAberration + FilmGrain via `@react-three/postprocessing`), suspense fallback, DPR clamp, adaptive perf, IntersectionObserver auto-pause when offscreen.
- `Gargantua.tsx` — full shader accretion disk (Kip Thorne look): warped disk (front + lensed top/bottom arcs via torus), event horizon sphere, Einstein ring, doppler brightening, fbm turbulence. (Upgrade current one.)
- `Endurance.tsx` — 12-module ring, central hub, docking spine, spokes, thruster glow, slow spin.
- `Ranger.tsx` — smaller shuttle, delta wings, engine trail.
- `Earth.tsx` — photoreal Earth (existing), plus optional moon.
- `Wormhole.tsx` — spherical distortion shader (refraction into starfield cubemap) for CTA/transition sections.
- `MillerPlanet.tsx` — ocean planet with giant wave silhouette + reflective water shader.
- `MannPlanet.tsx` — icy cloud-shrouded planet.
- `Tesseract.tsx` — nested wireframe hypercube with time-shifted grid lines (careers/research).
- `Cornfield.tsx` — instanced corn stalks + dust particles + drone shot camera (contact/footer).
- `Starfield.tsx` — GPU instanced starfield with parallax (replace CSS one).

### Per-page scene mapping
- `/` (home): Earth hero → Endurance flyby → Gargantua section (existing sections keep, upgraded).
- `/technologies`: Wormhole background behind grid.
- `/technologies/$slug`: Gargantua low-opacity backdrop.
- `/services`: Endurance ring rotating slowly behind content.
- `/research`: Tesseract wireframe backdrop.
- `/careers`, `/careers/$slug`: Cornfield + dust particles backdrop (Cooper's farm vibe).
- `/contact`: Wormhole with Ranger approaching.
- `/apply`, `/auth`: Subtle starfield + distant Gargantua.
- `__root.tsx`: Global starfield layer + film grain overlay so every route feels cinematic.

### Site shell changes
- `SiteShell.tsx`: replace CSS `Starfield` with new R3F `Starfield` fixed behind all content; add a per-page `backdrop` prop that renders a route-specific scene at `fixed inset-0 -z-10` behind content.
- Body already black; keep white typography, add subtle Hans Zimmer–style cinematic vignette overlay.

## Technical details

### Dependencies to add
- `@react-three/postprocessing` (bloom, vignette, chromatic aberration, noise)
- `three-stdlib` (already via drei) for `Lensflare`, `EffectComposer` types
- `maath` for smooth random distributions on starfield/dust

### Performance (Maximum realism, per user choice)
- DPR: `[1, 2]`, `gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}`
- Bloom intensity 0.6, luminanceThreshold 0.4 (Interstellar-style disk glow).
- `AdaptiveDpr` + `AdaptiveEvents` from drei.
- Scenes offscreen: `frameloop="demand"` when IntersectionObserver reports not visible.
- Mobile fallback still runs 3D (user chose max realism) but with reduced particle counts (branch on `useMobile`).

### Shaders
- Gargantua: reuse/upgrade existing GLSL — add gravitational lensing halo, add photon sphere ring, add relativistic beaming asymmetry so left side (approaching) is brighter than right.
- Wormhole: cubemap sample with radial UV distortion `uv += normalize(uv - 0.5) * sin(len*10 - t) * 0.05`.
- Water planet: normal-mapped ocean + fresnel + specular sun highlight.

### SEO / a11y
- All Canvases get `aria-hidden="true"` and `role="presentation"`.
- Wrap in `<Suspense fallback={<StaticFallback />}>` so SSR/prerender doesn't crash.
- Lazy-load heavy scenes with `React.lazy` + dynamic import; scene modules marked `"use client"` equivalent by only rendering after mount (`typeof window !== 'undefined'` guard) to avoid SSR three.js issues.

## Deliverables
- ~10 new component files under `src/components/three/`
- Updates to `SiteShell.tsx`, `__root.tsx`, and all 8 route files to add per-page scenes
- Upgraded `SpaceScene.tsx` (Gargantua + Endurance) with shader improvements
- Package add: `@react-three/postprocessing`, `maath`
- Global film-grain + vignette overlay CSS in `styles.css`

## Notes
Reference: https://www.youtube.com/watch?v=zSWdZVtXT7E (Interstellar trailer). Aiming for the visual language: deep black, warm amber accents (existing `--ember`), realistic space physics, slow contemplative motion, cinematic depth of field feel via bloom + vignette.

This is a large multi-file build. I'll implement it in one pass, batching file writes in parallel.