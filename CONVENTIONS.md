# CONVENTIONS — single-modern-slot-creator (v1.0.0)

Canonical contract for every file in this skill package and every artifact a skill
execution generates. All authoring agents MUST follow this document. When another
document conflicts with this one, this one wins; fix the other document.

## 1. Skill identity

```yaml
name: single-modern-slot-creator
id: single-modern-slot-creator
version: 1.0.0
scope: single-slot-only
```

One invocation = exactly ONE complete, original slot game. Explicitly out of scope:
casino company, lobby, multi-game platform, player accounts, KYC/AML, payments,
affiliates, operator back office, multiple finished games per run.

## 2. Repository layout (this skill package)

```
slots-skill/                      # repo root == the skill package
├── SKILL.md                      # skill entry point (Claude Code skill frontmatter)
├── README.md
├── CONVENTIONS.md                # this file
├── prompt.txt                    # original mission brief (do not edit)
├── research/                     # source-backed dossier (00–17)
├── agents/                       # role system prompts (5 files)
│   ├── strategist.md
│   ├── mathematician.md
│   ├── creative-director.md
│   ├── compliance-qa.md
│   └── skill-orchestrator.md
├── prompts/                      # step prompts consumed during execution (10 files)
│   ├── research.md  concept.md  mechanics.md  math.md  ui-ux.md
│   ├── animation-vfx.md  art-generation.md  audio-generation.md
│   └── code-integration.md  validation.md
├── schemas/                      # JSON Schema draft 2020-12 (18 files, see §6)
├── templates/                    # document templates (8 files)
│   ├── game-design-document.md  par-sheet.md  art-style-bible.md
│   ├── motion-specification.md  audio-specification.md  compliance-review.md
│   ├── validation-report.md  artifact-manifest.json
├── math/                         # uv-managed Python simulation package TEMPLATE
├── client-template/              # bun + TypeScript + PixiJS client TEMPLATE
└── examples/example-single-slot/ # worked example artifacts (illustrative; may be
                                  # absent in a given build — see README "Known gaps")
```

## 3. Generated game layout (per skill execution)

A skill run creates `games/<projectSlug>/` inside the host project (or the path the
user requests):

```
games/<slug>/
├── README.md
├── artifact-manifest.json        # validates against schemas/asset-manifest… see §6
├── docs/
│   ├── game-design-document.md  par-sheet.md  art-style-bible.md
│   ├── motion-specification.md  audio-specification.md
│   ├── compliance-review.md  validation-report.md
│   ├── assumption-log.md  decision-log.md  risk-register.md
│   ├── source-register.md  known-limitations.md
├── config/                       # every file below MUST validate against its schema (†)
│   ├── game-config.json  symbols.json  paytable.json  reel-sets.json
│   ├── scatter-tiers.json  features.json  bonus-buys.json
│   ├── spin-presentation.json  autoplay.json  jurisdiction-policies.json
│   ├── state-machine.json  animation-events.json  audio-events.json
│   ├── asset-manifest.json  device-profiles.json
│   │   # († spin-presentation, autoplay and device-profiles have no standalone
│   │   #    schema in §6: they are structurally validated by the client
│   │   #    configLoader and covered as blocks in skill-output.schema.json)
├── math/                         # specialized copy of skill math/ template
│   └── reports/                  # simulation-report.json + par sheet outputs
├── client/                       # specialized copy of client-template/
├── assets/
│   ├── art/                      # generated images (png source of truth)
│   ├── atlas/                    # packed atlases + .json
│   └── audio/                    # generated/placeholder audio
└── prompts/
    ├── art-prompts.json          # every image prompt, schema-validated
    ├── audio-prompts.json
    └── blender/                  # *.py scripts runnable headless
```

## 4. Canonical identifiers

### 4.1 Feature tiers (NEVER rename internally; public names are themed)

| scatters | internal id       | default public label |
|----------|-------------------|----------------------|
| 3        | `feature`         | themed name          |
| 4        | `super_feature`   | themed name          |
| 5+       | `ultimate_feature`| themed name          |

### 4.2 Symbol ids — pattern `^[A-Z][A-Z0-9_]{0,15}$`

`WILD`, `SCATTER`, premiums `H1..H4` (H1 = highest), lows `L1..L5`,
feature-exclusive `FX1..`, multiplier `MULT`, cash `CASH`, collector `COLLECT`,
mystery `MYSTERY`, jackpot `JP_MINI|JP_MINOR|JP_MAJOR|JP_GRAND`, blank `BLANK`
(hold-and-respin grids only).

### 4.3 Event ids — dot notation, lowercase

- Animation: `anim.<context>.<name>` — e.g. `anim.reel.spin_start`, `anim.reel.stop`,
  `anim.symbol.land`, `anim.scatter.land`, `anim.scatter.anticipation`,
  `anim.win.countup`, `anim.win.big`, `anim.cascade.remove`, `anim.cascade.refill`,
  `anim.feature.enter`, `anim.super_feature.enter`, `anim.ultimate_feature.enter`,
  `anim.feature.retrigger`, `anim.feature.summary`, `anim.maxwin.reached`.
- Audio: `music.<state>` (`music.base`, `music.feature`, `music.super_feature`,
  `music.ultimate_feature`), `sfx.<context>.<name>`, `amb.<name>`, `ui.<name>`.
- Haptics: `haptic.light | haptic.medium | haptic.heavy`.
- Win tiers: `small`, `medium`, `big`, `mega`, `epic`, `max` with default thresholds
  (win/totalBet): small < 5, medium ≥ 5, big ≥ 15, mega ≥ 40, epic ≥ 80,
  max = maximumWinXBet reached. Configurable in `spin-presentation.json`.

### 4.4 Game state machine — exact state set

```
boot, loading, ready, round_requested, outcome_received, outcome_committed,
presenting_initial_result, presenting_wins, presenting_cascades, feature_pending,
feature_entry, feature_active, super_feature_entry, super_feature_active,
ultimate_feature_entry, ultimate_feature_active, feature_retrigger, maximum_win,
feature_summary, round_complete, reconnecting, recovering, error
```

Authoritative round states (server-owned): `round_requested → outcome_received →
outcome_committed → … → round_complete`. Everything `presenting_*`, `*_entry`,
`feature_summary` is client presentation. UI-only states (menus, paytable) are NOT
in this machine; they are overlays that never block settlement.

## 5. Money, math, versioning

- All money in **integer minor units**; JSON fields suffixed `Minor`
  (`wagerMinor`, `totalWinMinor`, `balanceAfterMinor`). Never binary floats for
  settlement.
- Paytable pays are x-bet with ≤ 2 decimals, stored as **integer hundredths of a
  bet** in `payX100` (e.g. 2.5x → 250). `winMinor = (betMinor * payX100) // 100`
  (floor). The math model and simulator MUST use the identical integer rule.
  Step/feature multipliers are folded in BEFORE the single floor division
  (`winMinor = (betMinor * payX100 * multiplier) // 100`; with x100 fixed-point
  multipliers, `// 10000`). Never floor first and multiply after — that loses
  minor units and desynchronises model and client.
- Multiplier values are integers unless a mechanic requires halves (then x100
  fixed-point in `mult100`).
- `gameVersion`, `mathVersion`: semver strings. `configHash`:
  `"sha256:" + sha256(canonical JSON)` where canonical = UTF-8, sorted keys,
  no insignificant whitespace, applied to the concatenation of all `config/*.json`
  in filename alphabetical order.
- RTP expressed as fraction (0.9600). Tolerance gate: |simRTP − targetRTP| within
  the 99% CI half-width AND ≤ 0.003 absolute at release-level simulation size.
- RNG: production outcomes come ONLY from the RGS. Dev/sim RNG: Python
  `numpy.random.Generator(PCG64(seed))`; TypeScript dev round provider uses
  xoshiro128** with recorded seed. Every simulation report records: gameVersion,
  mathVersion, configHash, simCodeVersion, lockfile hash, seed(s), rounds, workers,
  exact command.

## 6. JSON Schemas (draft 2020-12)

`$id` = `https://schemas.single-slot-creator.local/<file>` ·
`$schema` = `https://json-schema.org/draft/2020-12/schema` · all schemas set
`additionalProperties: false` at object roots unless extension is explicit.

Files in `schemas/`:

```
skill-input.schema.json        skill-output.schema.json
game-config.schema.json        symbol.schema.json
paytable.schema.json           reel-set.schema.json
math-model.schema.json         par-sheet.schema.json
scatter-tiers.schema.json      feature.schema.json
bonus-buy.schema.json          state-machine.schema.json
outcome-manifest.schema.json   animation-event.schema.json
audio-event.schema.json        asset-manifest.schema.json
jurisdiction-policy.schema.json simulation-report.schema.json
```

Shared `$defs` conventions: `minorUnits` = integer ≥ 0; `tierId` = enum
[feature, super_feature, ultimate_feature]; `symbolId`, `eventId` patterns per §4;
`semver` pattern `^\d+\.\d+\.\d+$`; `sha256` pattern `^sha256:[0-9a-f]{64}$`.

## 7. Outcome manifest (server-authoritative contract)

Round = ordered `steps[]`; each step has `stepId` (`step-<n>`), `type`
(`initial_result | cascade | respin | feature_round | feature_trigger |
feature_retrigger | feature_upgrade | jackpot_award | max_win_termination |
settlement`), `grid` (columns-major `string[][]` of symbol ids), `wins[]`,
`scatterCount`, `multiplier`, `events[]` (presentation hint ids). The client is a
pure renderer of this manifest: skipping/turbo NEVER changes any value in it.
Recovery = re-fetch committed manifest + `resumePointer` (stepId), seek
presentation to that step instantly. Signature field covers the manifest bytes
minus `signature` itself (detached JWS or HMAC placeholder in dev).

## 8. Tooling bindings (hard requirements)

- **TypeScript/JS: Bun only.** `bun install`, `bun run dev`, `bun test`,
  `bun run typecheck`, `bun run build`. Never npm/yarn/pnpm in generated output.
- **Python: uv only.** `uv sync`, `uv run pytest`, `uv run python -m
  slot_math.simulate …`. Never bare pip/python.
- **Renderer default: PixiJS v8** (WebGL2 default, WebGPU where available,
  canvas fallback note). Three.js only with explicit justification. GSAP-style
  easing implemented in our own deterministic timeline engine (no runtime dep on
  GSAP required).
- **Image generation:** prefer MCP tools when present —
  `mcp__imagegen__generate_images` (ALWAYS batch multiple assets into ONE call),
  `mcp__imagegen__generate_image`, `mcp__imagegen__edit_image`. Sprites/cutouts:
  `transparent: true` (magenta key) + documented keying/cleanup step. If the tools
  are absent, still write `prompts/art-prompts.json` and stop after prompts with a
  clear note in the validation report.
- **Blender:** if the Blender MCP server is connected (`mcp__blender__*`), use
  `execute_blender_code` / background-mode variants for 3D hero assets,
  turntable sprite-sheet renders, depth/parallax layers, and normal-map bakes;
  ALWAYS also save the equivalent standalone script under `prompts/blender/*.py`
  runnable via `blender --background --python <file>`. If not connected, emit the
  scripts only.
- **Audio:** always emit `prompts/audio-prompts.json` (works with ElevenLabs
  SFX / Stable Audio-class tools); client ships a silent-safe audio manager so the
  game runs with missing audio files.

## 9. Non-negotiable design rules (encode everywhere relevant)

1. Server-authoritative: the client can never determine, predict, or alter a
   real-money result. Dev round provider is dev/test only and clearly flagged.
2. Presentation modes (normal/quick/turbo/skip/autoplay) alter presentation ONLY.
   Equivalence test: same manifest ⇒ same final balance/win in every mode.
3. Tiers `feature` / `super_feature` / `ultimate_feature` must be materially
   different in math AND presentation; each has separate simulation results.
4. No unbounded liability: max win cap enforced in math + engine
   (`max_win_termination` step); no infinite loops (retrigger caps, cascade caps
   with proven termination).
5. Fixed, versioned math: no player-adaptive RTP, no behavioural odds, no fake
   wins, no forced near-miss weighting, LDW (win < stake) never celebrated above
   `small` tier presentation.
6. Jurisdiction gates: autoplay, quick/turbo, slam stop, bonus buy,
   enhanced-chance, min round duration, RTP display are all feature-flagged via
   `jurisdiction-policies.json`; UNKNOWN jurisdiction ⇒ most restrictive default.
7. Accessibility: reduced-motion variant for every animation event; no
   information conveyed by colour alone; ≥ 44px touch targets; flash rate ≤ 3/s;
   text contrast ≥ 4.5:1 in HUD.
8. Every animation event defines: duration, easing, skippable, skipTo,
   blocksInput, audioEvent, reducedMotion + lowPerformance variants, recovery
   policy. Every audio event defines loop points, priority, ducking, polyphony.
9. Certification honesty: outputs are "certification-ready candidates"; never
   claim certification. Real-money release checklist requires legal review,
   independent math verification, lab certification, operator UAT.
10. Originality: market patterns from named studios are references only — never
    copy names, art, characters, exact paytables/strips, or trademarked mechanic
    names (see research/16-ip-risk-register.md; e.g. "Megaways" is licensed).

## 10. Naming & style

- Files/dirs: kebab-case. TS: camelCase vars, PascalCase types. Python:
  snake_case. JSON keys: camelCase. Schema filenames: `<thing>.schema.json`.
- IDs in configs: `projectSlug` pattern `^[a-z][a-z0-9-]{2,40}$`; `roundId`
  `^rnd_[A-Za-z0-9_-]{6,}$`; asset ids `^(img|atlas|audio|anim|font)\.[a-z0-9_.-]+$`.
- Docs: Markdown with `#`-headers, tables for enumerable facts, Mermaid for state
  and sequence diagrams.
- Every generated doc starts with a metadata block: game name, slug, versions,
  configHash, date, generator (`single-modern-slot-creator v1.0.0`).

## 11. Default game shape (used when brief says AUTO; research-tunable)

5 reels × 4 rows, 20 fixed lines OR ways/cluster per concept; target RTP 0.9600
(profiles 0.94 / 0.92 optional); high volatility; max win 10,000x; hit frequency
~25–33%; `feature` trigger ~1/150–1/250 naturally; bonus-buy price ≈ 100x
(`feature`), scaled for higher tiers; min bet 0.10, max bet 100.00 (minor units
10 / 10000); default `countingRule: initial-grid`, cascaded/copied scatters do
not count; retriggers allowed with cap.
