# Executive Summary — Research Dossier for the single-modern-slot-creator Skill

- Generator: single-modern-slot-creator v1.0.0 · dossier 00 · synthesized 2026-08-08 from dossiers 01–13
- Purpose: the one-file orientation for any agent (or human) consuming this research set. Every claim below is
  sourced and tagged in the underlying dossier; this file cites dossiers, not raw URLs.
- Nothing here is legal advice. Every real-money release requires jurisdiction-specific legal review,
  independent math verification, and laboratory certification (see 04, 05).

---

## 1. State of modern slot design, 2024–2026 — what "top-tier" means now

**The dominant mechanical package** of the current era is scatter-pays-anywhere on a 6×5 grid + tumbling
cascades + accumulating free-spin multipliers (Sweet Bonanza / Gates-class), with hold-and-respin
(lock coins, 3 respins resetting on land, 4-tier fixed jackpots, grand on grid fill) the most widely deployed
bonus mechanic across every global region. Cluster 7×7 + cascade + meter, and variable-height ways + cascade,
round out the top-performer distribution (see 01-slot-archetypes.md §6, 02-mechanics-and-features.md).

**Top-tier titles in 2024–2026 share a recognizable profile** (see 12-market-patterns-ip.md §3):
- RTP ~96.0–96.5% default, shipped alongside certified down-tiers (94/92/90) that operators select per market.
- Hit frequency 20–33% mainstream; extreme-volatility outliers dip below 10%.
- Natural feature trigger ~1/150–1/400 spins; 100x total bet is the industry bonus-buy anchor, tiered menus
  running 60x–2,000x, buy RTP typically ≥ base by ≤0.5pp.
- Max win is a marketing number: 10,000x is table stakes, streamer-facing titles ship 25,000–50,000x,
  and the record-chase tier runs to 500,000x. Published max-win odds (1-in-tens-of-millions) are now expected.
- Multiple *materially distinct* bonus modes per game (Hacksaw-style), each with its own volatility, buy price
  and disclosed per-mode RTP — not one bonus scaled by spin count.
- Streaming (Kick/Twitch clip culture) shapes design: spectacular bonus-entry, tier-upgrade, and max-win
  moments are the three most-shared clips and get the largest animation/audio budget (12 §5).

**Presentation state of the art** (08-ui-ux-conventions.md, 09-motion-vfx.md): portrait-first mobile authoring
(not shrunk desktop), full-scene diegetic worlds over framed reels, 3–5 parallax background layers, reactive
lighting per game state, character-on-stage reactions, per-tier world transformation (background + music +
lighting swap, not just a banner), escalating win-tier celebrations with fixed-duration count-ups, and
anticipation sequences driven strictly by the committed outcome. Normal spin presentation is ~2.0–3.5 s;
everything is built as a policy-gated deterministic timeline because the strictest jurisdictions regulate
presentation speed directly.

**Technically**, the modern client is a pure renderer of a server-committed outcome manifest — the client never
draws a random number — delivered as a PixiJS-class HTML5 app with 8–15 MB initial payloads, lazy-loaded
feature bundles, and 60 fps on mid-tier phones (06-frontend-tech.md, 07-rgs-architecture.md).

## 2. The non-negotiables — with the concrete numbers

**Math integrity** (03, 04):
- Theoretical RTP floor: GLI-11 requires ≥75% (base game, at all times including lowest bet level); real floors
  are higher per jurisdiction — Malta 85%, NJ 83%, Italy 90% online. Commercial norm 94–97%.
- Advertised top award must be hittable ≥ once in 50,000,000 games (GLI-11), including feature-entry odds when
  the top award sits inside a feature; GLI-12 adds 1-in-100M for advertised progressives. Gamble features must
  return exactly 100%.
- No adaptive/compensated math, ever: no per-player RTP, no pity timers, no streak-breakers (UKGC RTS 7A,
  GLI-19 §4.6). No post-outcome substitution or engineered near-misses — once the RNG picks an outcome, no
  secondary decision may alter what is shown (GLI-11 §4.3.1(b); AGCO 2.15).
- Certification-grade evidence: exact enumeration where feasible (fixed grid, strip-stop, ≤~10^10 combos);
  otherwise simulation with CI reporting. Release-grade sizing is a formula, not a constant: pinning RTP to
  ±0.1% at 99% confidence needs ~166M rounds at σ=5, ~664M at σ=10 (never default to 1M — that is a smoke
  test). Gate: |simRTP − target| ≤ min(99% CI half-width, 0.003). Full reproducibility record (seeds, config
  hash, lockfile hash, exact command) per run (03 §10–11).
- Provable termination for every loop: cascade cap, retrigger cap, multiplier cap, and a `max_win_termination`
  step that settles exactly at cap.

**Server authority** (07, 04):
- All outcome computation happens on the RGS; the client renders an ordered event/step manifest. Anything not
  in the manifest cannot be shown. Presentation modes (quick/turbo/skip) change *when* things render, never
  *what* — same manifest ⇒ identical final balance in every mode (the testable equivalence invariant).
- Wallet boundary: debit at bet, credit at settlement, integer minor units only, idempotent transaction IDs
  (duplicates return the original result, never re-apply), rollback by reference with tombstones, wins and
  rollbacks accepted after session expiry. Incomplete rounds must be resolved before a new round starts;
  recovery = re-fetch committed manifest + seek to `resumePointer`, never re-randomize, never re-debit.
- Production RNG: certified CSPRNG-class generator, server-side, background-cycled, seeded from real entropy;
  rejection sampling (never bare modulo — measured bias ≤ 1 in 50M per 25 CFR 547.14); outputs used immediately
  in order. Dev RNGs (xoshiro128** client, PCG64 sims) are flagged DEV/SIM-ONLY everywhere.
- Software identity: every certifiable artifact carries gameVersion + mathVersion + sha256 configHash
  (GLI-19 §2.3.2: ≥128-bit digest verified ≤ every 24 h); any change to RNG/scaling/rules/paytable = external
  retest.

**Jurisdiction gates** (05, 09, 13) — the numbers that shape the engine:
- GB (UKGC RTS): ≥2.5 s per slot cycle with release-and-re-press start; turbo/quick-spin/slam-stop banned;
  autoplay banned; no celebration of returns ≤ stake (LDW ban, RTS 14F); net position + elapsed session time
  always displayed; bonus buy prohibited in effect (RTS 3A+14A enforcement position); stakes capped £5/spin
  (25+) and £2 (18–24) since 2025. Enforcement is real (Stakelogic fined £122,835 for 1.97 s spins).
- Ontario (AGCO): near-verbatim UK mirror — 2.5 s, autoplay/turbo bans, LDW ban, net position in CAD.
- Germany (GlüStV): 5 s average round, autoplay banned, no jackpots on virtual slots, tiered stakes
  €1/€3/€5 since 2026-07-01, forced 5-minute break after each 60 minutes of play.
- Sweden: 3 s minimum round (applies to autoplay rounds, which remain legal); Netherlands: autoplay AND
  bonus buy banned; Spain: 3 s + mandatory pre-session time/spend configuration + 60-min forced reality check;
  Malta: permissive baseline, RTP ≥85%, rules ≤1 click away; US states: feature-permissive, floors per state.
- Hard rule for the skill: UNKNOWN jurisdiction ⇒ most-restrictive defaults (no autoplay/turbo/quick/skip/buy,
  5,000 ms floor, LDW ban, blocking reality check, HUD displays on). Bonus buy is a feature flag, never
  load-bearing for the math.

**Responsible design** (13):
- LDW rule as a hard gate in code, not content: any return ≤ stake gets loss-class presentation only — one
  neutral result sound, no win jingle family, no count-up celebration. Research basis: LDW arousal is
  physiologically indistinguishable from wins; celebratory sound alone causes win-frequency overestimation.
- No illusion-of-control affordances (stop buttons framed as skill), no "due/overdue/almost!" copy, no
  loss-chasing prompts, no unachievable displays.
- Accessibility floor: WCAG 2.2 AA (EAA in force since 2025-06); the skill builds to ≥44 px touch targets,
  ≥4.5:1 HUD text contrast, no colour-only information (silhouette-distinct symbols), ≤3 flashes/second with
  zero saturated-red flashing, reduced-motion variant for every animation event, keyboard + screen-reader
  sub-DOM for the canvas.

## 3. Recommended default technical stack — and why

(Full rationale in 06-frontend-tech.md, 07-rgs-architecture.md, 03 §11.)

- **Client: TypeScript + PixiJS ^8.19 (min 8.16), WebGL2-first**, WebGPU behind an opt-in flag, automatic
  Canvas-2D fallback. PixiJS is the de-facto casino renderer: ~3× smaller and ~2× faster than Phaser for pure
  rendering, and a slot needs no physics or scene framework. WebGL2 is the universal, driver-hardened baseline;
  WebGPU adds a QA matrix for marginal 2D gains. Three.js prohibited by default (pre-render 3D in Blender).
- **Toolchain: Bun only** — install, dev server, test, typecheck, build in one binary; a no-framework Pixi SPA
  needs no Vite plugin chain (Vite documented as escape hatch). Python math side is uv-only.
- **Animation: in-house deterministic timeline engine** (~300 lines: Penner easings, labels, seek/finish),
  driven by the Pixi ticker, no setTimeout anywhere. Not GSAP (wall-clock driven; determinism, seek-to-
  resumePointer recovery, and headless testing demand ownership), not Spine by default (its runtime requires
  every downstream user to hold a paid editor license — a legal trap for a generator skill; opt-in only).
- **Audio: thin in-house Web Audio manager** — bus graph (music/amb/sfx/ui → master → limiter), sample-accurate
  loop points, ducking ramps, polyphony caps, silent-safe when assets are missing. howler.js is effectively
  unmaintained. Dual-encode WebM-Opus + AAC/MP3 fallback; loops never rely on MP3 file looping.
- **Assets: PixiJS AssetPack pipeline** — bundles per load phase (preload/base/feature tiers/bigwin), WebP
  transport (PNG archival source), KTX2/Basis for large scenery when VRAM demands (a 2048² texture is 16 MB
  RGBA in VRAM regardless of file format), multi-resolution variants. Budgets: first spin ≤8 MB, total ≤25 MB,
  JS ≤1.5 MB gz, VRAM ≤128 MB (iOS Safari's ~256 MB canvas cap is the binding constraint), 60 fps with ≤10 ms
  game work on mid-tier phones.
- **Math engine: uv-managed Python** — exact rational arithmetic for the enumerable core (per-reel count
  vectors, PGF products), absorbing Markov chains for stateful features, NumPy PCG64 + SeedSequence.spawn for
  simulation, optional discrete-outcome (books + weighted lookup table) mode that makes RTP exact by
  construction and weight-tunable by linear programming — the Stake Engine pattern (03 §8–9).
- **Integration contract** (07): `OutcomeProvider` interface with exactly two implementations — a seeded,
  scenario-forcing dev provider (compiled out of production) and an RGS adapter skeleton speaking the
  seamless-wallet pattern (authenticate/play/event/endRound; idempotent transactions; error-code normalization).
  Precomputed full-round manifests by default: simpler settlement, trivial replay/recovery, and the
  presentation-equivalence test falls out by construction.

## 4. Recommended default game shape for a first-rate original slot

(Synthesis of 01 §6/Design implications, 02 D2–D3, 12 Design implications; all values overridable per brief.)

- **Grid & evaluation**: 6×5 scatter-pays-anywhere (threshold 8+, bands 8-9/10-11/12+) + cascades + accumulating
  free-spin multiplier — the proven 2025-dominant package with the broadest market fit. Strong alternates the
  concept agent may pick: 5×4/20-line or 1024-ways with hold-and-respin bonus; cluster 7×7 + cascade + meter.
  Compositions marked incompatible in the 01 §5 matrix are rejected at concept time (never two positional
  families at once; never two grid-growth mechanics; cap at least two of multiplier/ways/cascade).
- **Math profile**: target RTP 0.9600 (optional certified 0.94/0.92 profiles); hit frequency 22–30%;
  measured volatility labelled from per-spin SD (high ≈ 8–15); base/feature RTP split ≈ 0.62/0.34 documented
  per channel and summing exactly.
- **Max win: 10,000x** — the correct mainstream anchor, max-win probability in the 1e-6–1e-7 per-spin band,
  odds published. A `streamer_high` 25,000–50,000x preset exists but only with a proven tail; never exceed
  50,000x by default.
- **Feature hierarchy (mandatory, materially different tiers)** — 3/4/5+ scatters:
  - `feature` (3, ~1/180 spins): 10 free spins, cascade multiplier ladder, feature strips (wilds ×1.5).
  - `super_feature` (4, ~1/1,200): 12 spins, separate reel set (premiums ×1.3, one low removed), ladder
    persists across spins, guaranteed random-wild events.
  - `ultimate_feature` (5+, ~1/6,000–1/10,000): 15 spins, exclusive symbol + persistent multiplier collector,
    3x starting global multiplier, sticky wilds, exclusive environment and music. 6+ scatters adds an instant
    pay. A differentiation linter fails tiers that differ only in spin count and theming.
  - Retriggers +5 spins per 3 scatters, capped 3/4/5 by tier; caps printed in the rules.
- **Buys & modifiers** (jurisdiction-gated, off for GB/NL/UNKNOWN): buy menu 100x/250x/500x with buy RTP within
  ±0.2pp of base and bought outcomes drawn from natural conditional distributions; ante-bet 1.25x for ~2×
  trigger frequency as the mutually-exclusive alternative, with its own certified reel set.
- **Jackpots**: 4 fixed tiers (JP_MINI…JP_GRAND) inside hold-respin/trigger events only; progressives are
  interface hooks, disabled by default.
- **Presentation shape**: portrait-first full-scene world; win tiers small/medium/big/mega/epic/max at
  <5/≥5/≥15/≥40/≥80/cap ×bet; ~2.2 s normal spin; anticipation only when the committed outcome still permits
  the trigger; every animation event carries reducedMotion + lowPerformance variants and skip semantics that
  never change settlement.
- **Art & audio**: 9–14 silhouette-distinct symbols authored at 512², style-bible-anchored AI generation with
  mandatory human paintover and full provenance records; four horizontal music states (base/feature/super/
  ultimate) with beat-quantized transitions, −16 LUFS session target, ≤−1 dBTP (10, 11).

## 5. Key risks and mitigations

- **IP — trademarked mechanic names and trade dress** (12 §6). Megaways, xWays/xNudge/xSplit/xBomb, Gigablox,
  Splitz, Infinity Reels, Cluster Pays (as brand), Lightning Link, Dream Drop, PopWins, Super Scatter etc. are
  protected names; the *concepts* are broadly free. Mitigation: a case-insensitive lint blocklist over every
  generated artifact; generic internal vocabulary (`variable_height_ways`, `hold_respin`, `split_symbol`);
  no imitation of a rival's distinctive look. Residual: BTG holds a US patent around its variable-reel-height
  mechanic — auto-flag any 6-reel 2–7 game for US legal review.
- **IP — trade secrets in math** (12 §7). Aristocrat v. Light & Wonder settled at $127.5M over copied math
  models: reel strips, weights and par sheets are enforceable trade secrets even without patents. Mitigation:
  clean-room math only; similarity to competitors allowed solely at aggregate-stat level (RTP/vol/hit/max win).
- **IP — AI-generated art copyrightability** (10 §8). Purely AI output is not copyrightable in the US; prompts
  alone don't establish authorship. Mitigation: mandatory human paintover/recomposition steps, per-asset
  provenance records (tool, model, seed, post-work, license snapshot), EU AI Act Art. 50 marking from
  2026-08-02, and no Suno/Udio audio pending litigation (11 §6).
- **Certification** (04 §9). Labs re-derive the math: expect ~2–4 months, one remediation loop (+4–6 weeks),
  re-test on any fairness-affecting change. Common failure causes: advertised-vs-actual RTP mismatch, adaptive
  behaviour, naive modulo scaling, missing recovery handling. Mitigation: PAR sheet + simulation report +
  termination proofs + recovery matrix + presentation-equivalence evidence emitted from every run; outputs are
  labelled "certification-ready candidates", never "certified" (the honesty rule).
- **Jurisdictional drift** (05). Rules moved materially in 2025–26 (GB stake caps, DE tiered stakes, SE
  autoplay-cap draft, ES deposit tracking). Mitigation: all gates live in `jurisdiction-policies.json`, spin
  timing is a policy-driven clamp not a constant, and every dossier carries a legal-review item list that the
  compliance template reproduces verbatim.
- **Performance & platform hazards** (06). iOS Safari's ~256 MB canvas-memory cap, the iOS 18.2–18.4 spurious
  WebGL-context-loss regression, audio unlock quirks (touchend not touchstart), and background-tab throttling.
  Mitigation: VRAM budgets + KTX2, mandatory context-loss recovery that seeks the committed manifest (money
  state never lives in GPU objects), single debounced canvas resize, lifecycle suspend/resume rules, and
  device-tier auto-degradation (particles → filters → DPR).
- **Reputational** (12, 13). RTP-downgrade controversy, streamer credibility problems, and "appeal to minors"
  advertising risk around candy/cartoon themes. Mitigation: active-RTP display in-game, no deceptive
  presentation ever, adult framing gates in the art pipeline.

## 6. Dossier map — which file covers what

| File | Covers |
|---|---|
| 01-slot-archetypes.md | The 22 archetypes: win-evaluation algorithms (lines/ways/cluster/scatter/respins), symbol-generation models, math complexity, enumeration-vs-simulation verdicts, compatibility matrix, default shapes |
| 02-mechanics-and-features.md | Wild/symbol/reel/multiplier/bonus mechanic catalogue with math + cert notes; the 3/4/5-scatter tier hierarchy; scatter counting rules; bonus-buy/ante norms; default tier parameter sheet |
| 03-slot-math-and-simulation.md | PAR sheets, RTP decomposition, volatility/VI, exact formulas, reel-strip construction, Markov/enumeration/Monte-Carlo methods, RTP optimization, simulation sizing tables, reproducibility rules |
| 04-technical-standards-rng-integrity.md | GLI-11/19 in depth, RNG requirements (seeding, cycling, scaling, test batteries), recovery/history/versioning duties, lab submission package and timeline, jurisdiction-policy seeds |
| 05-jurisdiction-rules.md | Per-jurisdiction game-design rules (GB, DE, SE, NL, ES, IT, DK, BE, ON, US states, MT, CW): spin timing, autoplay, buys, stakes, LDW, HUD, reality checks; the feature-flag table and named constants |
| 06-frontend-tech.md | Renderer comparison, PixiJS v8 specifics, animation/audio library licensing (Spine/Rive/GSAP), texture and audio formats, budgets, device tiering, context-loss recovery, Bun tooling |
| 07-rgs-architecture.md | Server-authoritative round lifecycle, outcome manifests, idempotency/rollback, signatures and config hashes, recovery/replay, seamless-wallet contract, dev-mode forcing, scope guardrails |
| 08-ui-ux-conventions.md | HUD anatomy, layout systems (portrait/landscape/desktop), control state machines, paytable/rules presentation, feature-buy UI, settings menu, loading/audio unlock, safe areas, accessibility gates |
| 09-motion-vfx.md | Regulatory timing envelope, reel-physics numbers, anticipation, win tiers/count-ups, quick/turbo/skip semantics, autoplay behaviors, deterministic timeline engine, photosensitivity budgets |
| 10-art-pipeline.md | AI-first art workflow, style bible contents, symbol readability rules, prompt engineering per model, transparency/keying, Blender 3D-to-2D, rigging, atlasing/compression, provenance and prohibited content |
| 11-audio-pipeline.md | Adaptive music architecture, loudness/ducking numbers, Web Audio implementation, formats/loops, the complete audio-event catalogue, AI audio tools and licensing, LDW audio rules |
| 12-market-patterns-ip.md | Studio-by-studio patterns, hit-game math norms, theme/art trends, streaming influence, the trademark/patent/trade-secret risk register and the never-emit name blocklist |
| 13-responsible-design-accessibility.md | Dark-pattern prohibitions with academic evidence, reality checks and session displays per jurisdiction, autoplay policy, spin-mode envelope, WCAG 2.2/photosensitivity/reduced-motion/CVD rules, validation hooks |

Cross-cutting reading order for a new agent: 00 (this file) → 01+02 (what to build) → 03 (how to prove the
math) → 04+05+13 (what the law demands) → 07 (how it runs) → 06+08+09 (how it looks and feels) → 10+11 (how
assets get made) → 12 (what to never copy).

— end of executive summary —
