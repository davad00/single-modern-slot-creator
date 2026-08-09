# Frontend Technology for HTML5 Slots (Renderers, Animation, Audio, Assets, Performance, Tooling)

- Generator: single-modern-slot-creator v1.0.0 — research dossier 06
- Author: research-06 (senior iGaming frontend research)
- Date: 2026-08-08
- Scope: prompt.txt lines 1452–1598 (Technology Stack & Architecture + Rendering and Performance), with emphasis on PixiJS v8, animation-runtime licensing (Spine/Rive/GSAP), texture/audio formats, budgets, low-end strategy, mobile browser quirks, context-loss recovery, and Bun tooling.
- Tag legend: **[mandatory]** = hard requirement (legal/licensing/platform-enforced or CONVENTIONS-locked) · **[recommended]** = strong industry default with source support · **[observed]** = documented fact about a product/market · **[inferred]** = my synthesis, reasoning stated.

---

## Findings

### 1. Renderer comparison (PixiJS · Phaser · Three.js · WebGL2 · WebGPU · Canvas fallback)

#### 1.1 PixiJS v8 — the default renderer

- [observed] Current version as of June 2026: **PixiJS v8.19.0** (v8.18.0/v8.19.0 released ~June 12, 2026). Notable recent features: experimental HTML-in-canvas textures (`pixi.js/html-source`), Graphics→SVG export, sprite mask channels, `FillPattern` textureSpace modes (behavior change), and 25 bundled AI-agent skills under `node_modules/pixi.js/skills/` [S1].
- [observed] **v8.16.0 (Feb 2026) added an experimental Canvas 2D renderer** as automatic fallback when neither WebGPU nor WebGL is available — covers sprites, graphics, text, basic filters, but not every GPU-renderer feature (e.g. some blend modes/filters) [S2]. Renderer preference can be given as an ordered array, e.g. `['webgl', 'canvas']` [S1].
- [observed] v8 architecture is **WebGPU-first with a fully supported WebGL(2) backend sharing one pipeline**; renderer init is async (`await Application.init(...)`) — a breaking change vs v7 [S3][S44].
- [observed] The PixiJS team is explicit that **WebGPU does not automatically beat WebGL** — PixiJS is typically CPU-bound (batching), but WebGPU wins in scenes with many batch breaks (filters, masks, blend modes — all common in slots) [S3]. Recent WebGPU work includes a `transient` texture flag that lets the WebGPU backend discard MSAA buffers after a render pass, "cutting memory bandwidth on mobile GPUs" [S1].
- [observed] v8 point releases fixed context-loss crash paths (lost contexts no longer crash shader-compilation logging; GCSystem unloads resources before nulling hash entries) — evidence the engine actively maintains context-loss robustness [S1][S3].
- [observed] PixiJS passed **500,000 weekly npm downloads** (June 2026) — healthy ecosystem signal [S1].
- [recommended] **Pin `pixi.js` to `^8.16` minimum** so the canvas fallback and GC/context-loss fixes are available; treat 8.19.x as the current target. Verify the exact latest 8.x at generation time (`bun pm view pixi.js version` equivalent: `bun x npm view pixi.js version` is npm-CLI — instead check https://pixijs.com/blog or the lockfile).

#### 1.2 Phaser

- [observed] Phaser is a batteries-included game framework (physics, input, audio, scenes, loader) at ~1.2 MB vs PixiJS ~450 KB (≈150 KB gzipped core); PixiJS is roughly 2× faster for pure rendering and 3× smaller [S44].
- [observed] Industry comparisons note PixiJS's filter/mask/blend-mode system and lean size are "why it's popular in the casino/slot industry"; slots don't need physics or complex scene management, so Phaser's extra weight buys little [S44][S45].
- [inferred] For a server-authoritative slot (client = pure presenter of an outcome manifest), Phaser's gameplay systems are dead weight and its audio/loader abstractions fight a custom deterministic timeline. PixiJS remains the correct default; Phaser is acceptable only if a team explicitly wants its scene/loader conventions.

#### 1.3 Three.js

- [observed] Three.js `WebGPURenderer` became production-viable around r171 and by **r184 (March 2026)** ships TSL (Three Shading Language) as the first-class shading API, transpiling to WGSL (WebGPU) or GLSL (WebGL2 fallback). `ShaderMaterial`/`onBeforeCompile` are NOT supported under WebGPURenderer — node materials only. Official docs still call the renderer's status improving-but-experimental in places [S41].
- [recommended] Per CONVENTIONS §8: **Three.js only with explicit justification** (true 3D value — e.g. 3D hero object, parallax depth scenes). Even then, prefer pre-rendering 3D to sprite sheets in Blender over shipping a runtime 3D engine: deterministic, lighter, and avoids double-renderer memory cost. [inferred — standard slot-studio practice; slots overwhelmingly render pre-baked 3D as 2D sprites.]

#### 1.4 WebGL2 / WebGPU / Canvas — support matrix (mid-2026)

- [observed] **WebGL2 is universal baseline**: all evergreen browsers incl. iOS Safari (since Safari 15, 2021). It is the correct default backend [S33][S34].
- [observed] **WebGPU now ships by default in Chrome (113+, 2023), Edge, Firefox (141+ on Windows, July 2025), and Safari 26 (macOS/iOS/iPadOS/visionOS, September 15, 2025)**. caniuse global support ≈ 82–83% (late 2025); ~95% of users on evergreen versions. Remaining gaps: Linux (partial/rollout), older iOS (< 26), older Android/driver blocklists [S33][S34][S35].
- [recommended] Slot default: **WebGL2 primary, WebGPU opt-in** (`preference` config), Canvas 2D as last-resort static fallback (PixiJS ≥ 8.16 gives this free). Rationale: WebGL2 has a decade of driver hardening; WebGPU adds a second QA matrix for marginal gains in a batched 2D scene; regulated-market device coverage (old Androids in kiosks/venues, iOS 16–25 installed base) still needs WebGL2. Re-evaluate WebGPU-default in 2027 when iOS 26+ penetration is high. [inferred from S33–S35 + S3 performance guidance]
- [recommended] Canvas 2D fallback policy: render a functional but simplified experience (no particles/filters, static symbols) OR show a "device not supported" screen with graceful messaging — never a blank canvas. Gate via PixiJS auto-detection; log the chosen backend into the validation report.

### 2. Animation runtimes & licensing (Spine 4.x · Rive · GSAP · custom timeline)

#### 2.1 Spine (Esoteric Software) — editor + runtime licensing

- [mandatory, licensing] **A valid Spine *editor* license is required to integrate the Spine Runtimes** into software or create derivative works containing them. For an SDK/toolkit/library used by others to build apps containing the runtimes, **each downstream user needs their own editor license**. Runtime license last updated **April 5, 2025** [S12][S13].
- [observed] Editor pricing (official purchase page, fetched 2026-08): **Essential $69** (discounted from $99, perpetual, no meshes/IK export limits), **Professional $379** (discounted from $449, perpetual, per named user), **Enterprise $2,499 base + $379/user, annual** (mandatory for entities with > $500,000 USD annual revenue/funding), Education $850–$2,900/yr non-commercial [S11].
- [mandatory, licensing] After an Enterprise license lapses, previously shipped products may continue to be distributed, but **new integration work requires an active license** [S11][S12].
- [observed] Runtime version matching: **spine-pixi-v8 major.minor must match the Spine Editor major.minor used for export** (current npm: `@esotericsoftware/spine-pixi-v8` **4.3.x**, actively published 2026; officially supported by Esoteric in collaboration with the PixiJS team; renders via WebGL, WebGPU, or Canvas — Canvas lacks tint-black/blend modes). Older `@esotericsoftware/spine-pixi` and community `pixi-spine` packages are deprecated [S14][S15].
- [recommended] Skill policy: **treat Spine as optional/bring-your-own-license.** Generated slots must not hard-depend on Spine; default symbol/character animation should use sprite-sheet flipbooks + programmatic tweens (see 2.4). If the user confirms they hold a Spine license, emit spine-pixi-v8 integration with editor-version pinning. Never bundle Spine runtimes in the skill package itself (that would make every skill user require an editor license) [derived from S13 SDK clause — this is the legally significant trap].

#### 2.2 Rive

- [observed] **Rive runtimes are MIT-licensed open source** (rive-app/rive-runtime, web/JS runtimes included); free for commercial use, no runtime fees ever [S18][S16].
- [observed] Editor pricing (announced Oct 2025): **Free** (build in editor, incl. fonts/audio), **Cadet $9/mo annual** ($17 monthly, unlimited exports), **Voyager $32/mo**, **Enterprise $120/mo**. Paying is required to *ship/export* production work; exports keep working forever [S16][S17].
- [inferred] Rive suits vector UI flourishes and interactive state-machine animations (buttons, meters, character idles) at tiny file sizes, but the slot industry's asset pipelines (raster atlases, spine skeletons, particles) don't center on it. Rive's own renderer draws to its canvas/context — compositing inside a PixiJS scene requires the rive-canvas → texture bridge, an extra moving part. Keep as **optional enhancement, not default**.

#### 2.3 GSAP — now genuinely free

- [observed] **Webflow acquired GSAP in October 2024; with GSAP 3.13 (April 2025) the entire library including all formerly paid Club plugins (SplitText, MorphSVG, DrawSVG, ScrollTrigger, ScrollSmoother, Inertia) became 100% free, including commercial use**, under the GSAP Standard License. No Webflow account needed [S8][S9][S10].
- [mandatory, licensing] The one restriction: you may not use GSAP to build **no-code visual animation tools that compete with Webflow**. A slot game is not that; commercial slot use is clearly permitted [S9].
- [inferred] So licensing is no longer a reason to avoid GSAP. The reason to still avoid it as the core spin timeline: **determinism and replay**. GSAP is wall-clock driven; a slot needs a timeline that (a) is driven by the game's own ticker so turbo/skip/seek produce identical end states, (b) can seek instantly to a `resumePointer` for recovery, and (c) is testable headlessly. GSAP *can* be driven manually (`ticker.lagSmoothing`, `globalTimeline.time()`), but a small purpose-built tween/timeline engine (~300 lines: easing table + timeline with labels/seek/complete-callbacks) removes a 70 KB+ dependency and any ambiguity. CONVENTIONS §8 already mandates this ("GSAP-style easing implemented in our own deterministic timeline engine").

#### 2.4 Custom deterministic timeline engine (the default animation core)

- [recommended] Requirements the skill should encode: fixed-timestep-agnostic tween core advanced by `ticker.deltaMS`; standard easing set (Penner functions incl. back/elastic/bounce for reel bounce); timeline with labels, nested sequences, `seek(t)`/`finish()` (jump-to-end with all side effects applied); every animation event from `animation-events.json` maps to one timeline factory; **skip/turbo = `finish()` on the active timeline, never a different code path** (guarantees CONVENTIONS §9.2 mode-equivalence). [inferred — direct consequence of CONVENTIONS §7/§9; no external source needed]
- [recommended] Reel spin itself should be a state-driven scroller (constant velocity → deceleration curve → settle bounce) rather than tweened per-symbol; symbols recycle through an object pool as they scroll (see §6.2).

### 3. Audio: Web Audio API, howler, formats, unlock, lifecycle

#### 3.1 Library choice

- [observed] **howler.js is effectively unmaintained** (last release 2.2.3/2.2.4 era; Snyk classifies "Inactive", no npm release in 12+ months; open issues accumulating through 2025) yet still ~800k weekly downloads and still MDN-recommended as a pragmatic all-rounder [S38].
- [recommended] For a slot, write a **thin in-house AudioManager directly on Web Audio API** (~400 lines): `AudioContext` + master/music/sfx `GainNode` buses, buffer cache, loop-point support (`AudioBufferSourceNode.loop{Start,End}`), ducking (music bus gain automation on big-win), polyphony caps per event id, and **silent-safe operation when files are missing** (CONVENTIONS §8 requires this). This avoids an inactive dependency and gives exact control over the unlock/interrupted lifecycle below. howler remains an acceptable fallback if the team insists on a library. [inferred from S38 + CONVENTIONS]

#### 3.2 Autoplay/unlock — [mandatory, platform-enforced]

- [observed] All mobile browsers (iOS Safari strictest) block audible playback until a user gesture; `AudioContext` starts `suspended` and must be `resume()`d inside a genuine gesture handler (`touchstart`/`touchend`/`mousedown`/`keydown`/`click`) [S27][S28].
- [observed] **iOS extra state: `interrupted`** — backgrounding/screen-off can move the context to `interrupted`; attach `onstatechange` and `resume()` without a gesture when returning (it was previously authorized) [S28].
- [observed] Android Chrome quirk: `context.state` can report `running` while playback still requires a gesture — treat state as advisory, always route first playback through a gesture [S27].
- [recommended] Slot pattern: the ubiquitous **"tap to enter" splash doubles as the audio unlock** (and first-interaction requirement in several jurisdictions). Unlock sequence inside that handler: create/resume context, play a zero-gain buffer, start preloaded music muted then fade in. Never rely on autoplay; assume Low Power Mode blocks even muted video [S27].

#### 3.3 Formats & compression

- [observed] Codec efficiency: **Opus** transparent ≈ 96 kbps where MP3 needs ≈ 192 kbps (files ~½ MP3 size); best-in-class latency (5–66 ms). **AAC** in .m4a/.mp4 is the safest Apple-friendly compressed format. Safari 11–18.3 only decoded Opus inside **CAF** containers; Ogg/WebM-Opus works from Safari/iOS 18.4+ (early 2025) [S36][S37].
- [recommended] Slot default (2026): ship **dual-encode: `.webm` (Opus, ~96 kbps music / 64–96 kbps SFX) + `.m4a` (AAC-LC, 128 kbps)**; pick per `canPlayType`/decode test at load. MP3 fallback unnecessary for evergreen-browser targets. Web Audio `decodeAudioData` handles both. Budget: full audio set (music loops ×4 states + ~30 SFX) ≤ 4–6 MB, lazy-load feature music [S36][S37, budgets inferred from §5 bundle math].
- [recommended] Music loops must be gapless: encode with known loop points, use `loopStart`/`loopEnd` on the buffer source (compressed formats add encoder padding — trim via loop points, not file edges). [inferred — standard practice; Opus/AAC priming samples are well documented]

### 4. Texture formats & atlas tooling

#### 4.1 KTX2 / Basis Universal (GPU-compressed)

- [observed] PNG/JPEG/WebP/AVIF all decode to **raw RGBA in VRAM**: a 2048×2048 texture = 16 MB GPU memory regardless of file size. KTX2/Basis transcodes to GPU-native blocks (BC7/S3TC desktop, ASTC/ETC2 mobile) and **stays compressed in VRAM: typically 4–8× less texture memory** plus faster uploads [S19][S4].
- [observed] Codec choice: **UASTC** = high quality (≈BC7, fine for normal maps/hero art), larger files (Zstd-supercompressed, ~1–2× JPEG); **ETC1S** = smaller, lower quality — good for bulk symbols/backgrounds. Mixing both per-asset-class is normal [S19].
- [observed] PixiJS v8 has first-class loaders: `import 'pixi.js/ktx2'` (and `'pixi.js/basis'`, `'pixi.js/dds'`) registered **before any `Assets.load`**; manifests can list `bg.ktx2` with `bg.webp`/`bg.png` fallbacks and Pixi picks by device support. AssetPack can emit compressed-texture variants at build time [S4][S5][S45]. three.js equivalent: `KTX2Loader` + WASM transcoder [S20].
- [recommended] Slot policy: **KTX2 is the lever for iOS Safari memory ceilings** (see §5.3) — use it for the big static layers (backgrounds, frames, feature scenery: ETC1S) where alpha gradients are forgiving; keep **symbols/UI as WebP/PNG-atlases** because block compression visibly degrades crisp glyph edges and thin outlines at slot symbol sizes. Transcoder WASM (~200 KB) loads lazily. [inferred synthesis of S4/S19 + slot art characteristics]

#### 4.2 WebP / AVIF (file-transport formats)

- [observed] **WebP: ~95% global support, Baseline-stable everywhere; AVIF: ~94%, Baseline 2024** (Chrome 85+, Firefox 93+, Safari 16.1/16.4+, Edge 121+ — Edge 118–120 broken; iOS < 16 unsupported). WebP decodes marginally faster; AVIF ~20–50% smaller and holds fine texture detail better at aggressive quality [S43].
- [observed] WebP cuts ~25–30% vs JPEG; AVIF ~50% vs JPEG [S42][S43].
- [recommended] Default transport format for all atlases and stills: **WebP (quality 82–90 for symbols/UI, 75–82 for backgrounds)**, PNG kept as source-of-truth in `assets/art/` (CONVENTIONS §3). Offer AVIF variant generation as an AssetPack compression option where build time allows; always keep PNG fallback entries in the manifest for the canvas-fallback path. Remember: this saves download only, not VRAM [S43][S19].

#### 4.3 Atlas strategy & tooling

- [observed] **PixiJS AssetPack 1.0+** is the canonical pipeline: `texturePacker` pipe (sharp-based, Pixi spritesheet JSON, options: padding, `maximumTextureSize` e.g. 4096, multi-resolution `{default:1, low:0.5}`), `texturePackerCompress` + `compress` (webp/avif) pipes, `mipmap` resolution variants, `cacheBust` hashing, and `manifest` pipe emitting the `Assets.init({manifest})` bundles via `{m}` folder tags. Known gaps reported by users: spine-atlas edge cases, bitmap-font quirks, no sound sprites [S5][S6][S7].
- [recommended] Atlas layout for a slot: **bundle-per-load-phase** = `preload` (logo, progress bar, splash ≤ 300 KB), `base-game` (symbols ×2 resolutions, reel frame, HUD), `feature`, `super_feature`, `ultimate_feature`, `bigwin` — each an AssetPack `{m}` bundle so `Assets.backgroundLoadBundle()` streams feature bundles during base play. Max atlas page 2048×2048 on the low profile / 4096×4096 default (older mobile GPUs cap at 4096) [S5, sizing inferred from device caps].
- [observed] Commercial alternative: CodeAndWeb TexturePacker (paid desktop tool) remains widely used and exports Pixi format; AssetPack removes the manual step and is free/scriptable — prefer AssetPack in generated projects [S5][S7]. [inferred preference]

### 5. Budgets: bundle size, load time, memory, frame time

#### 5.1 Bundle-size & load-time targets

- [observed] Platform benchmarks: CrazyGames requires **first playable download ≤ 50 MB (≤ 20 MB for mobile placement), time-to-gameplay ≤ 20 s**; Poki asks **initial download < 8 MB**. Real-world casino measurements: lobby ~12 MB; opening a modern video slot downloads **8–15 MB**; casino UX guidance wants slot launch < 3 s on 4G, and 2026 mobile-slot architecture analyses push boot < 2.5 s (median session only 4–6 min) [S21][S22][S42].
- [recommended] Skill budgets to encode (device-profiles.json defaults):
  - **Code bundle (JS, gzipped): ≤ 1.5 MB** total; pixi.js core ~150 KB gz leaves ample room. [inferred from S44 + typical slot client code sizes]
  - **Preload phase (to first paint of splash/progress): ≤ 500 KB.**
  - **Base-game playable (first spin available): ≤ 8 MB** transferred (aligns with Poki's 8 MB and the observed 8–15 MB commercial norm — sit at the good end).
  - **Total all-features: ≤ 25 MB** transferred; feature/bigwin bundles lazy-loaded in background.
  - **Time targets: ≤ 3 s to splash, ≤ 10 s to first spin on 4G (≈5 Mbps effective); ≤ 20 s hard ceiling** [S21][S42].
- [recommended] Loading UX: deterministic progress bar over bundle bytes, splash art in preload bundle, "tap to continue" gate doubling as audio unlock (§3.2).

#### 5.2 Frame-time budget

- [recommended] **60 fps target = 16.7 ms/frame; keep game work ≤ 10 ms** on the mid-tier reference device, leaving headroom for browser compositing/GC. Low-tier profile may target 30 fps (33 ms) with reduced effects instead of dropping frames erratically. Draw-call guidance for low-end: **≤ 100–200 draw calls/frame**; a well-batched Pixi slot scene should sit under 30 [S48][S40, thresholds observed in optimization guides + inferred].
- [recommended] Instrument a rolling FPS meter in dev builds; auto-degrade (particles off → filters off → DPR down) if sustained fps < 45 for > 3 s (ties to §7 tiers).

#### 5.3 Memory budgets — iOS Safari is the binding constraint

- [observed] iOS Safari enforces a **hard total-canvas-memory cap** — historically reported at **224 MB (iOS 12) and 256 MB** in developer-forum error messages ("Total canvas memory use exceeds the maximum limit"); exceeding it kills canvases/WebGL. Page RAM overall is also capped (order ~1–1.5 GB before tab kill, device-dependent). Additional 2024–2025 regression: **iOS 18.2–18.4 spuriously loses WebGL contexts** ("WebGL context lost") on iPhone SE/XR/11-class and iPad 8/9 devices even without abnormal memory use — recovery handling (§8) is therefore not optional [S23].
- [observed] A WebKit bug makes **resizing an on-screen WebGL canvas leak memory on iOS** (Bugzilla #219780) — avoid continuous canvas resizes; debounce orientation/resize to a single reallocation [S24].
- [recommended] Budgets to encode: **GPU texture memory ≤ 128 MB on the default profile, ≤ 96 MB on low-tier** (counted as decoded RGBA unless KTX2; a 4096² RGBA atlas = 64 MB — hence ≤ 2 such pages ever resident, prefer 2048² pages ≈ 16 MB each); **JS heap ≤ 256 MB**; single canvas only (never spawn secondary WebGL canvases); destroy feature-bundle textures on exit (`Assets.unloadBundle`) [S23][S19, numbers inferred as safe margins under the observed ~256 MB canvas cap and iOS tab-kill behavior].
- [recommended] Use Pixi's `texture.destroy(true)` / GCSystem and verify with `renderer.texture.managedTextures` in a debug overlay; leak tests are a validation-report item.

### 6. Rendering performance techniques

#### 6.1 Texture-atlas strategy — see §4.3.

#### 6.2 Object pooling & GC mitigation

- [recommended] Pool: reel symbol sprites (grid size + 2 rows overflow per reel), win-line/frame graphics, particles, floating win texts, coin sprites. Pre-allocate at load; `visible=false` instead of add/remove where possible; never allocate in the ticker path (no closures/array literals/string concat per frame — reuse `Point`s and event objects). Rationale: GC pauses of 5–20 ms are the classic cause of stutter during long autoplay sessions; slots run for hours. [inferred — universally documented HTML5-game practice, reinforced by optimization guides S42/S48]
- [recommended] Text: use BitmapText for win counters (updates every frame during count-up; `Text` re-rasterizes canvas per change — a known GC/upload hotspot).

#### 6.3 Particle limits & shader-quality levels

- [recommended] Particle caps per device tier (encode in `device-profiles.json`): **high ≤ 500 concurrent, mid ≤ 200, low ≤ 50, canvas-fallback 0**; use `ParticleContainer` (v8: note blend-mode inheritance change in 8.19 [S1]). Filters (displacement, glow, blur) are batch-breakers — cap concurrent filtered display objects: high ≤ 4, mid ≤ 2, low = 0 (replace with pre-baked glow sprites). [inferred — Pixi filter costs documented S3/S44; specific caps are design defaults for the skill]
- [recommended] Shader-quality levels map to the same tiers: full-featured fragment effects (heat shimmer, god rays) → simplified single-pass → static sprite substitutes. Every `animation-events.json` entry already requires a `lowPerformance` variant (CONVENTIONS §9.8) — these tiers are its backend.

#### 6.4 Lazy loading & caching

- [recommended] `Assets.backgroundLoadBundle(['feature','bigwin'])` immediately after first spin becomes available; feature entry awaits its bundle with a themed transition covering any residual wait. HTTP caching: immutable hashed filenames (AssetPack `cacheBust`) + long-lived `Cache-Control`; a Service Worker cache is optional but valuable for repeat sessions (casino players relaunch often; observed repeat-session traffic < 4 MB/30 min once cached [S42][S21]). Don't use a SW to bypass operator CDN rules without a config flag. [inferred]

### 7. Low-end device strategy & browser compatibility

- [observed] **pmndrs/detect-gpu** classifies GPUs into tiers 0–3 from benchmark data (tier 0 = blocklisted/no WebGL/< 15 fps → non-WebGL fallback; tier 1 ≥ 15, tier 2 ≥ 30, tier 3 ≥ 60 fps), fetching benchmark tables from a CDN (must handle CSP/offline failure with a conservative default) [S39].
- [observed] PlayCanvas guidance: rendering at full `devicePixelRatio` (often ≥ 3 on cheap high-res phones) is fill-rate-poison on low/mid GPUs; **clamp DPR** and/or derive it from a startup benchmark or GPU-name lookup [S40].
- [recommended] Skill default detection ladder (runs once, cached in sessionStorage): (1) renderer backend actually obtained (webgpu/webgl/canvas); (2) detect-gpu tier if fetchable, else `navigator.hardwareConcurrency`/`deviceMemory` heuristics; (3) first-100-frames fps sample → confirm/downgrade. Map to profiles: **high** (DPR ≤ 2 clamp wait — DPR min(native, 3), all effects), **mid** (DPR ≤ 2, reduced particles/filters), **low** (DPR ≤ 1.5, 30 fps, no filters, 0.5× "low" atlas resolution from AssetPack), **fallback** (canvas renderer, static presentation) [S39][S40][S5].
- [recommended] Reference device matrix for QA: 2 low-tier Android (e.g. 2–3 GB RAM class), 2 mid Android, 1 high Android, 2 iOS (oldest supported + current); feature-detect, never UA-sniff for capabilities (one team reported +42% stable installs switching to feature detection) [S48].
- [recommended] Browser floor to declare in docs: **iOS/Safari 16+, Chrome/Edge/Firefox last-2-years, Android WebView/Chrome 100+** — anything below gets the canvas/unsupported path. AVIF requires iOS 16+ anyway [S43]. [inferred floor consistent with format support]

### 8. WebGL context-loss recovery — [mandatory, robustness]

- [observed] Canonical Khronos/MDN pattern: listen for `webglcontextlost` on the canvas and **call `event.preventDefault()`** (otherwise the context never comes back), cancel the rAF loop; on `webglcontextrestored`, **recreate every GPU resource** (textures, buffers, shaders, framebuffers — all handles invalid, no state persists) and resume. Test with the `WEBGL_lose_context` extension (`loseContext()`/`restoreContext()`) [S25][S26].
- [observed] Loss triggers: GPU reset/driver update, too many contexts (browsers cap ~8–16, evict LRU), memory pressure — likelihood rises near GPU memory limits (another reason for §5.3 budgets); and the iOS 18.2–18.4 regression loses contexts spuriously [S25][S23].
- [observed] PixiJS v8 handles device/context loss internally to a large degree (recent releases hardened it [S1]); three.js WebGLRenderer likewise handles the events, but app-level assets still need re-upload hooks [S26].
- [recommended] Slot-specific policy to encode: context loss during a round must **never lose money state** — presentation layer re-initializes, then seeks the deterministic timeline to the outcome manifest's `resumePointer` (same machinery as reconnect recovery, CONVENTIONS §7). Show a brief "restoring…" veil; if restore doesn't arrive within 10 s, offer reload (manifest re-fetch makes reload safe). Add a dev/QA hotkey that triggers `WEBGL_lose_context.loseContext()` and an automated test asserting balance/win integrity across a mid-spin loss. [inferred — direct composition of S25/S26 with the server-authoritative contract]

### 9. Mobile browser lifecycle quirks

- [observed] **Background throttling**: rAF stops entirely in hidden tabs; `setTimeout`/`setInterval` throttled to ~1/s (and as low as 1/min after ~5 idle minutes); tabs playing audio are exempt; Workers/OffscreenCanvas rAF keep ticking [S29][S47].
- [recommended] Slot policy: on `visibilitychange → hidden`: pause ticker, suspend AudioContext (also releases the audio-session exemption politely), record wall time; on visible: **reset delta-time before resuming** (else a rAF loop "jumps"), resume/`resume()` audio (handle iOS `interrupted`, §3.2), and if a round was mid-presentation, fast-forward presentation via `finish()` — settlement is server-side, so nothing financial can drift [S29][S28]. Autoplay counters continue only per jurisdiction policy (some regs require visible play — jurisdiction dossier's call; expose a flag).
- [observed] Also handle: `pagehide`/`bfcache` restore (Safari resumes JS without reload — revalidate session), orientation change (single debounced resize, §5.3 leak), and `resize` storms from URL-bar show/hide on mobile (use `visualViewport` and debounce ≥ 250 ms) [S24][S29]. [last point inferred from standard practice]

### 10. Tooling: TypeScript + Bun; Bun vs Vite

- [observed] **Bun 1.3 (released October 10, 2025)** made Bun a full-stack toolkit: zero-config frontend dev server with HMR and browser-console-to-terminal in `Bun.serve()`, bundler that can build frontend+backend in one pass, built-in test runner with VS Code integration, `bun install --analyze`, unified SQL/Redis clients. 1.3.x patches added `--pass-with-no-tests`, `--only-failures`, 2× faster builds on symlink-heavy macOS projects. Anthropic acquired Bun in December 2025; it remains MIT open source [S30][S31].
- [observed] Bun-vs-Vite consensus (2026): Vite still has the deeper HMR maturity and framework/plugin ecosystem (and Vite 8 moved builds to Rolldown); Bun's bundler is excellent for server/CLI/simple-frontend cases and projects without complex plugin chains. Common pattern: Bun for installs/scripts/tests + Vite for dev server/build [S32].
- [recommended] For the generated slot client — a **single-page, no-framework, TypeScript+PixiJS app with no exotic plugins** — Bun alone is sufficient and keeps the toolchain to one binary: `bun install`, `bun run dev` (Bun.serve dev server or `bun build --watch` + static server), `bun test` (unit: timeline determinism, win-tier mapping, manifest parsing), `bun run typecheck` (`tsc --noEmit`), `bun run build` (`Bun.build` with minify, hashed assets, target browser). Vite is the documented escape hatch if a team later adds React HUD tooling or needs a Vite-only plugin — but the skill's default templates must not require it. AssetPack runs as a separate `bun run assets` script (it's a Node-API library; verify it runs under Bun at template-authoring time — it uses sharp, which works under Bun's Node compat) [S30][S32][S5]. [last sentence: compatibility claim [inferred] — flagged for template CI verification]
- [mandatory, CONVENTIONS §8] Never emit npm/yarn/pnpm commands in generated output; Python side is uv-only.

### 11. Game-state/integration items (frontend-facing summary; deep treatment in the integration dossier)

- [mandatory, CONVENTIONS §7/§9] The client is a **pure renderer of the server's outcome manifest**: dev-mode deterministic round provider (xoshiro128**, recorded seed) behind the same `RoundProvider` interface as the production RGS adapter; round IDs + idempotent round requests; outcome replay = feed a stored manifest through the presentation layer headlessly (also the basis of the mode-equivalence test); interruption recovery = re-fetch committed manifest + seek to `resumePointer` (shared with context-loss recovery §8 and lifecycle §9); feature-state persistence lives server-side, client only caches for presentation; max-win termination is a manifest step type the presentation must handle (celebration + round end); wallet/balance only ever displayed from server-provided `balanceAfterMinor`; audit hooks = structured client event log (round lifecycle, errors, recovery events) behind an injectable sink. These are architecture-locked by CONVENTIONS; no external sourcing needed.

---

## Source register

| id | name | type | pub/rev date | jurisdiction | URL | supports-what |
|----|------|------|--------------|--------------|-----|---------------|
| S1 | PixiJS blog — June 2026 update (v8.18/8.19) | vendor-docs | 2026-06-12 | global | https://pixijs.com/blog/june-2026 | current Pixi version, WebGPU transient textures, canvas fixes, 500k downloads |
| S2 | PixiJS blog — v8.16.0 | vendor-docs | 2026-02 | global | https://pixijs.com/blog/8.16.0 | experimental Canvas renderer fallback |
| S3 | PixiJS GitHub releases + v8 launch/migration posts | vendor-docs/repo | 2024–2026 | global | https://github.com/pixijs/pixijs/releases | WebGPU-first architecture, async init, perf guidance, context-loss fixes |
| S4 | PixiJS guide — Compressed Textures | vendor-docs | 2025 (v8 docs) | global | https://pixijs.com/8.x/guides/components/assets/compressed-textures | ktx2/basis loader registration, manifest fallbacks |
| S5 | PixiJS AssetPack — TexturePacker pipe docs | vendor-docs | 2024–2025 | global | https://pixijs.io/assetpack/docs/guide/pipes/texture-packer/ | atlas options, resolutions, max texture size, compress pipes |
| S6 | PixiJS AssetPack — Manifest pipe docs | vendor-docs | 2024–2025 | global | https://pixijs.io/assetpack/docs/guide/pipes/manifest/ | {m} bundle tags, manifest generation |
| S7 | PixiJS blog — AssetPack 1.0.0 release | vendor-docs | 2024 | global | https://pixijs.com/blog/assetpack-1.0.0 | AssetPack capabilities/status |
| S8 | Webflow blog — "GSAP becomes free" | vendor-docs | 2025-04 | global | https://webflow.com/blog/gsap-becomes-free | GSAP 3.13 free incl. Club plugins |
| S9 | GSAP Standard License | vendor-docs (license) | 2025 | global | https://gsap.com/community/standard-license/ | commercial use permitted; no-code-competitor restriction |
| S10 | CSS-Tricks — GSAP now completely free | industry-press | 2025-04 | global | https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ | independent confirmation of license change |
| S11 | Esoteric Software — Spine purchase page (fetched 2026-08) | vendor-docs | 2026 | global | https://esotericsoftware.com/spine-purchase | tier pricing $69/$379/$2,499+$379/user, $500k threshold, perpetual-vs-annual |
| S12 | Spine Editor License Agreement | vendor-docs (license) | 2025 | global | https://esotericsoftware.com/spine-editor-license | editor license required for runtime integration; SDK per-user clause |
| S13 | Spine Runtimes License Agreement | vendor-docs (license) | 2025-04-05 | global | https://esotericsoftware.com/spine-runtimes-license | runtime redistribution terms |
| S14 | npm — @esotericsoftware/spine-pixi-v8 | repo | 2026 (4.3.x) | global | https://www.npmjs.com/package/@esotericsoftware/spine-pixi-v8 | current runtime version, editor major.minor matching |
| S15 | Esoteric blog — spine-pixi-v8 released | vendor-docs | 2024 | global | https://en.esotericsoftware.com/blog/spine-pixi-v8-runtime-released | official Pixi-team collaboration, WebGPU support, canvas limits |
| S16 | Rive pricing page | vendor-docs | 2025–2026 | global | https://rive.app/pricing | Free/Cadet $9/Voyager $32/Enterprise $120 tiers |
| S17 | Rive blog — New pricing | vendor-docs | 2025-10 | global | https://rive.app/blog/new-pricing | pay-at-export model, no runtime fees |
| S18 | rive-app/rive-runtime LICENSE | repo (license) | current | global | https://github.com/rive-app/rive-runtime/blob/main/LICENSE | runtimes MIT |
| S19 | Don McCurdy — Choosing texture formats for WebGL/WebGPU | blog (expert) | 2024-02-11 | global | https://www.donmccurdy.com/2024/02/11/web-texture-formats/ | VRAM math (2048² = 16 MB), ETC1S vs UASTC, 4–8× savings |
| S20 | three.js KTX2Loader docs/examples | vendor-docs | current | global | https://threejs.org/docs (KTX2Loader) | three.js transcoding path |
| S21 | CrazyGames technical requirements | industry (platform) | current 2025–2026 | global | https://docs.crazygames.com/requirements/technical/ | ≤50/20 MB first download, ≤20 s to gameplay |
| S22 | Bountyboard — submitting HTML5 games to web platforms | blog | 2025 | global | https://www.bountyboard.gg/blog/how-to-submit-an-html5-game-to-web-platforms | Poki < 8 MB initial download norm |
| S23 | Apple Developer Forums threads 112218 / 687866 / 778735 | vendor-forum | 2018–2025 | global (iOS) | https://developer.apple.com/forums/thread/778735 | 224/256 MB canvas caps; iOS 18.2–18.4 WebGL context-lost regression |
| S24 | WebKit Bugzilla #219780 | repo (bugtracker) | open | global (iOS) | https://bugs.webkit.org/show_bug.cgi?id=219780 | iOS WebGL canvas-resize memory leak |
| S25 | Khronos WebGL wiki — HandlingContextLost | standard | current | global | https://wikis.khronos.org/webgl/HandlingContextLost | canonical loss/restore pattern |
| S26 | MDN — WEBGL_lose_context, webglcontextrestored | vendor-docs | current | global | https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext | testing extension, resource recreation |
| S27 | MDN — Autoplay guide + Web Audio best practices | vendor-docs | current | global | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | gesture requirement, Android quirks, Low Power Mode |
| S28 | Matt Montag — Unlock Web Audio in Safari iOS/macOS | blog (expert) | maintained | global (iOS) | https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos | unlock pattern, iOS `interrupted` state |
| S29 | MDN — Page Visibility API | vendor-docs | current | global | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API | visibilitychange pause/resume pattern |
| S30 | Bun blog — Bun 1.3 | vendor-docs | 2025-10-10 | global | https://bun.com/blog/bun-v1.3 | 1.3 dev server, bundler, test runner features |
| S31 | heise online — Bun 1.3 full-stack runtime | industry-press | 2025-10 | global | https://www.heise.de/en/news/Web-Development-Bun-1-3-Becomes-Full-Stack-JavaScript-Runtime-10759717.html | independent 1.3 coverage |
| S32 | PkgPulse — Bun vs Vite 2026 guide | blog | 2026 | global | https://www.pkgpulse.com/guides/bun-vs-vite-2026 | HMR/plugin-ecosystem tradeoffs, hybrid pattern, Vite 8 Rolldown |
| S33 | caniuse — WebGPU | standard (support data) | live, checked 2026-08 | global | https://caniuse.com/webgpu | ~82–83% global WebGPU support |
| S34 | web.dev — WebGPU supported in major browsers | vendor-docs (Google) | 2025-11 | global | https://web.dev/blog/webgpu-supported-major-browsers | all-major-browser milestone, Firefox 141, timeline |
| S35 | App Developer Magazine / Wikipedia — WebGPU in iOS 26 | industry-press | 2025-09 | global (iOS) | https://appdevelopermagazine.com/webgpu-in-ios-26/ | Safari 26 / iOS 26 (2025-09-15) ships WebGPU on Metal |
| S36 | MDN — Web audio codec guide | vendor-docs | current | global | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs | Opus/AAC/MP3 efficiency & latency numbers |
| S37 | Supadark — Which audio codec for the web (2026) | blog | 2026 | global | https://supadark.com/notes/which-codec-to-choose-for-my-website-s-audio-content | Safari Opus-in-CAF until 18.4 caveat |
| S38 | goldfire/howler.js repo + Snyk advisor | repo/security-analysis | checked 2026-08 | global | https://github.com/goldfire/howler.js | howler inactive-maintenance status, download stats |
| S39 | pmndrs/detect-gpu | repo | maintained | global | https://github.com/pmndrs/detect-gpu | GPU tier 0–3 classification thresholds |
| S40 | PlayCanvas — Device Pixel Ratio optimization | vendor-docs | current | global | https://developer.playcanvas.com/user-manual/optimization/runtime-devicepixelratio/ | DPR clamping rationale on low-tier mobile |
| S41 | three.js manual — WebGPURenderer; r184 releases | vendor-docs/repo | 2026 | global | https://threejs.org/manual/en/webgpurenderer.html | WebGPURenderer/TSL status, ShaderMaterial unsupported |
| S42 | Gamixlabs — Optimizing HTML5 slot game performance | blog (industry) | 2024–2025 | global | https://gamixlabs.com/blog/optimizing-performance-in-html5-slot-games-for-mobile-and-web/ | slot-specific optimization techniques, WebP/AVIF gains |
| S43 | rumvision / caniuse — WebP vs AVIF support | blog + support data | 2025 | global | https://www.rumvision.com/blog/modern-image-formats-webp-avif-browser-support/ | WebP ~95% / AVIF ~94%, Safari 16.4+, Edge 121+, decode-speed tradeoffs |
| S44 | GeneralistProgrammer — Phaser vs PixiJS (2025/2026) | blog | 2025–2026 | global | https://generalistprogrammer.com/comparisons/phaser-vs-pixijs | size/perf comparison, casino-industry usage note |
| S45 | pixijs discussion #10222 + Sparcks/pixi-basis-ktx2 | repo | 2024–2025 | global | https://github.com/pixijs/pixijs/discussions/10222 | KTX2 in v8 practicalities |
| S46 | Prathaminstitute / tenngrand — casino lobby & mobile slot load analyses | industry-press | 2025–2026 | AU/global | https://tenngrand.com/technical-efficiency-mobile-slot-software-adapting-to-short-player-sessions/ | 8–15 MB per-slot download, <2.5–3 s targets, 4–6 min sessions |
| S47 | Pontis Technology — setInterval throttling; MDN rAF docs | blog + vendor-docs | 2024–2025 | global | https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/ | background-tab timer/rAF throttling specifics |
| S48 | Playgama / IDC Games — HTML5 mobile optimization & low-end guides | blog (industry) | 2025 | global | https://playgama.com/blog/general/optimizing-html5-games-for-mobile-a-complete-porting-guide/ | quality-tier case studies, 100–200 draw-call guidance, device matrix |

Note: some URLs above were reached via search-result summaries ([S21][S22][S23][S37][S46][S48]); their headline numbers are quoted as reported by those sources. The two pages fetched in full and verified directly are S1 (PixiJS June 2026) and S11 (Spine purchase).

---

## Uncertainties & legal-review items

1. **Spine SDK clause vs this skill** — [legal review] The skill *template* must not ship Spine runtimes: the runtime license requires each user of an SDK/toolkit containing them to hold an editor license [S12][S13]. My mitigation (opt-in integration emitted only for license-holding users, with the runtime pulled from npm at the user's own install step) should be reviewed by counsel — specifically whether generating integration *code* (without redistributing the runtime) is safely outside "integration of the Spine Runtimes."
2. **GSAP Standard License edge** — free-for-commercial is confirmed [S8][S9], but the license's "no competing no-code animation tools" clause has untested breadth. Our skill generates code, not a visual animation builder; risk assessed low, but a slot-*editor* product built on this skill's output should re-check.
3. **iOS canvas-memory cap exact value in 2026** — forum evidence spans 224 MB (iOS 12) to 256 MB (recent errors) [S23]; Apple publishes no official number and it may vary by device RAM. Budgets in §5.3 assume ≤ 256 MB with margin. [inferred] Needs on-device verification in the validation phase (memory stress test in the client template).
4. **iOS 18.2–18.4 WebGL context-lost regression status** — unresolved in the forum threads found [S23]; whether iOS 18.5+/26 fixed it is unverified. Treat spurious context loss on iOS as a live hazard regardless.
5. **AssetPack under Bun** — AssetPack depends on sharp (native module). Bun's Node-API compat is good but this specific pipeline was not verified here. [inferred] Template CI must run `bun run assets` before this is asserted; fallback is running AssetPack via a pinned Node in CI only.
6. **Poki 8 MB figure** — sourced via an aggregator blog [S22], not Poki's own docs (their developer docs are login-gated portions). Number is consistent with widely cited guidance but tag it [observed, secondary].
7. **detect-gpu benchmark CDN** — regulated operator CSPs frequently block third-party fetches; the tier table must be self-hostable (detect-gpu supports overriding `benchmarksURL`). Verify at template time.
8. **Bun.serve dev-server HMR ergonomics for a Pixi (non-framework) app** — documented [S30] but less battle-tested than Vite [S32]; template should keep a `bun build --watch` + livereload fallback path.
9. **Load-time sources** — the "<3 s on 4G" and "8–15 MB per slot" figures come from casino-adjacent analytics blogs [S46], not a standards body; treat as market norms, not compliance thresholds. Jurisdictional minimum-round-duration rules (other dossier) are the only regulator-adjacent timing constraints here.
10. **Rive plan gating details** (which features land in Cadet vs Voyager as of Aug 2026) shift often; re-check rive.app/pricing if a generated project opts into Rive.

---

## Design implications for the Skill

Concrete rules for downstream authoring agents (client-template, prompts/code-integration.md, schemas/device-profiles):

### Stack defaults (lock these)
1. **Renderer: `pixi.js` ^8.19 (min 8.16)**, init `await Application.init({ preference: ['webgl', 'webgpu-optin?'] })` → default order **WebGL2 first**, WebGPU behind a `renderer.webgpu=true` config flag, automatic Canvas fallback (Pixi ≥8.16) rendering a static reduced experience. Log resolved backend to the audit sink.
2. **No GSAP/Spine/Rive/howler runtime dependencies in the default template.** Animation = in-house deterministic timeline engine (Penner easings; `seek`/`finish`; driven by Pixi ticker deltaMS). Audio = in-house Web Audio manager (buses: master/music/sfx; ducking; polyphony caps; loopStart/loopEnd; silent-safe when files missing). Spine integration is an opt-in generator branch that (a) asks/records that the user holds a Spine editor license, (b) pins `@esotericsoftware/spine-pixi-v8` major.minor to the user's editor version, (c) never vendors runtime code into the skill package.
3. **Bun-only toolchain**: `bun install` / `bun run dev` / `bun test` / `bun run typecheck` (tsc --noEmit) / `bun run build` (Bun.build, minified, hashed) / `bun run assets` (AssetPack). TypeScript strict. Vite documented only as an escape hatch, never required.
4. **Three.js: prohibited by default**; permitted only with a written justification in decision-log.md, and prefer Blender-prebaked sprite sequences (prompts/blender/*.py) over runtime 3D.

### Asset pipeline rules
5. AssetPack pipeline with bundles `preload | base-game | feature | super_feature | ultimate_feature | bigwin` (folder `{m}` tags); resolutions `{default: 1, low: 0.5}`; `maximumTextureSize: 4096` (2048 for low profile); WebP compression (q85 symbols/UI, q78 backgrounds); cache-busting hashes; manifest consumed via `Assets.init({ manifest })`.
6. **Transport formats**: WebP everywhere (PNG source-of-truth kept in `assets/art/`), optional AVIF variants, PNG manifest fallbacks for the canvas path. **KTX2/Basis (ETC1S) for large opaque background/scenery layers** when base-game VRAM estimate exceeds 96 MB; register `import 'pixi.js/ktx2'` before first load; symbols/UI stay WebP (block compression blurs crisp edges).
7. **Audio**: dual-encode `.webm` (Opus 96 kbps music / 64–96 kbps SFX) + `.m4a` (AAC-LC 128 kbps); select by decode capability; total audio ≤ 6 MB; feature-state music lazy-loaded; gapless loops via buffer `loopStart/loopEnd` (values recorded in `audio-events.json`).

### Budgets (encode in device-profiles.json + validation gates)
8. Transfer budgets: preload ≤ 0.5 MB · first-spin-available ≤ 8 MB · total ≤ 25 MB · JS (gz) ≤ 1.5 MB. Time gates on simulated 4G (5 Mbps, 100 ms RTT): splash ≤ 3 s, playable ≤ 10 s, hard fail > 20 s. Validation report must include an asset-size table per bundle vs budget.
9. Runtime budgets: 60 fps target with ≤ 10 ms game work (30 fps allowed on `low`); draw calls ≤ 100 (warn) / 200 (fail); **VRAM (decoded) ≤ 128 MB default / 96 MB low**; JS heap ≤ 256 MB; exactly ONE WebGL canvas; debounced single resize on orientation change (iOS resize-leak, WebKit #219780); `Assets.unloadBundle` on feature exit.
10. Particle caps: high 500 / mid 200 / low 50 / canvas 0 (ParticleContainer). Concurrent filtered objects: high 4 / mid 2 / low 0 (pre-baked glow sprites instead). Every animation event carries `reducedMotion` + `lowPerformance` variants (already CONVENTIONS §9.8) that map onto these tiers.
11. Pooling mandatory for: reel symbols (rows+2 per reel), particles, win labels, line/frame graphics, coins. No allocations in ticker paths; BitmapText for count-ups. A dev overlay shows fps, drawCalls, managed texture bytes, pool stats.

### Device tiering & compatibility
12. Startup detection ladder (cached per session): backend obtained → detect-gpu tier (self-hosted benchmark JSON; conservative default on fetch failure) → hardwareConcurrency/deviceMemory heuristic → 100-frame fps confirmation; auto-downgrade at sustained < 45 fps. Profiles: high (DPR ≤ 3), mid (DPR ≤ 2), low (DPR ≤ 1.5, 30 fps, 0.5× atlases), fallback (canvas/static).
13. Declared browser floor: iOS/Safari 16+, evergreen Chrome/Edge/Firefox (≤ 2 y), Android Chrome/WebView 100+. Feature-detect, never UA-gate capabilities.

### Robustness (mandatory client behaviors)
14. **Context loss**: canvas `webglcontextlost` → `preventDefault()`, stop ticker, veil UI; `webglcontextrestored` → let Pixi restore, re-upload app-level resources, then seek presentation to the outcome manifest `resumePointer`. Money state never lives in GPU/presentation objects. QA hotkey uses `WEBGL_lose_context`; automated test asserts identical settlement across a mid-spin loss. Expect spurious losses on iOS 18.x.
15. **Lifecycle**: `visibilitychange hidden` → pause ticker, suspend audio; visible → delta reset, audio `resume()` incl. iOS `interrupted` handling, fast-forward interrupted presentation via `finish()`. Handle `pagehide`/bfcache restore by revalidating round state with the server.
16. **Audio unlock**: mandatory "tap to enter" splash performs AudioContext creation/resume + zero-gain prime inside the gesture handler; game must be fully playable muted.
17. **Mode equivalence** (CONVENTIONS §9.2) is enforced structurally: turbo/skip call `timeline.finish()`; an automated test replays one manifest in all presentation modes and asserts identical `balanceAfterMinor`/`totalWinMinor`.

### Documentation obligations
18. Generated `docs/known-limitations.md` must state: canvas-fallback feature gaps, iOS memory-cap assumptions, iOS 18.x context-loss hazard, Opus-on-old-Safari fallback behavior, and that Spine/Rive integrations (if any) carry the user's own license obligations with links to S11–S13/S16–S18.
