---
name: single-modern-slot-creator
description: >
  Designs, calculates, asset-generates, implements, simulates, tests, and packages
  ONE complete, original, production-prototype modern online slot game per
  invocation (math model + PAR sheet + simulation suite, three-tier scatter bonus
  hierarchy, immersive PixiJS client, art via image-gen MCP + Blender, adaptive
  audio spec, jurisdiction gating, QA package). Use when the user asks to create,
  generate, design, or build a slot game / slot machine. NOT for casino platforms,
  lobbies, payments, accounts, or multi-game portfolios.
---

# single-modern-slot-creator v1.0.0

One invocation → one complete original slot game project under `games/<slug>/`.
You are the **orchestrator** (role charter: `agents/skill-orchestrator.md`).
Read `CONVENTIONS.md` FIRST and enforce it in every artifact. The research
foundation for all decisions lives in `research/` (start with
`research/00-executive-summary.md`; consult domain files as each step needs them).

**Scope guard:** if the request is actually a casino company, lobby, platform,
payment/account system, or "several games", stop and tell the user this skill
produces exactly one self-contained slot per run, designed for later RGS/operator
integration.

## Inputs

Accept any of: a structured brief (validate against
`schemas/skill-input.schema.json`), a freeform description, or nothing. Normalize
to the input schema; `"AUTO"` fields are yours to decide. Missing info → choose a
sensible default, log it in `docs/assumption-log.md`, and continue — do not stall
on clarifying questions. Record: normalized input, assumption log, constraint
list, risk register, projectSlug, artifact manifest skeleton, definition of done.

## Execution model

Run the 14 steps below in order. Steps marked ∥ may run as parallel subagents
(use the Agent/Workflow tools if available in your harness; otherwise execute
sequentially yourself). Each step has: a prompt file to follow, inputs, outputs,
and a **gate** — do not proceed while a gate fails; fix and re-run (max 3
attempts, then record the failure in `docs/validation-report.md` and stop
honestly). Every artifact lands in the generated-game layout defined in
CONVENTIONS §3. Update `artifact-manifest.json` as files are produced.

| # | Step | Prompt | Role charter |
|---|------|--------|--------------|
| 1 | Intake & normalization | (this file) | skill-orchestrator |
| 2 | Focused research | `prompts/research.md` | strategist |
| 3 | Concept & theme (3 candidates → 1) | `prompts/concept.md` | strategist |
| 4 | Archetype & mechanics selection | `prompts/mechanics.md` | strategist |
| 5 | Math model & simulation | `prompts/math.md` | mathematician |
| 6 | Three-tier scatter bonus design | `prompts/math.md` §6 + `prompts/mechanics.md` §5 | mathematician |
| 7 | Immersive UI/UX spec | `prompts/ui-ux.md` | creative-director |
| 8 | Motion, animation & VFX spec | `prompts/animation-vfx.md` | creative-director |
| 9 | Art generation (image-gen MCP + Blender) ∥ | `prompts/art-generation.md` | creative-director |
| 10 | Audio spec & prompts ∥ | `prompts/audio-generation.md` | creative-director |
| 11 | Code integration (client + state machine) | `prompts/code-integration.md` | mathematician + orchestrator |
| 12 | Spin-speed / skip / autoplay integration | `prompts/code-integration.md` §7 | orchestrator |
| 13 | Simulation, QA & validation | `prompts/validation.md` | compliance-qa |
| 14 | Final packaging | (this file, §Packaging) | orchestrator |

Steps 7–10 depend on 3–6 but are independent of each other → parallelize.
Step 11 needs 5–8 outputs. Step 13 needs everything.

## Step gates (summary — full checklists live in each prompt file)

- **G2 research:** dossier has ≥ 8 sources with dates; IP-risk list present;
  patterns-not-to-copy list present (seed from `research/16-ip-risk-register.md`).
- **G3 concept:** exactly 3 candidates scored on the rubric in
  `prompts/concept.md`; exactly 1 selected; theme is original and adult-appropriate.
- **G4 mechanics:** 1 archetype + 1 primary mechanic + ≤ 3 supporting mechanics;
  every mechanic has purpose/trigger/state/math/recovery/tests defined; no
  trademarked mechanic names (check `research/16-ip-risk-register.md`).
- **G5 math:** all `config/*.json` validate against `schemas/` (spin-presentation,
  autoplay and device-profiles have no standalone schema — the client
  configLoader validates them structurally); simulator runs;
  |simRTP − target| within CONVENTIONS §5 tolerance; base + feature + super +
  ultimate + scatter-pay RTP contributions sum to total ±0.0005; max win reachable
  and capped; PAR sheet complete (`templates/par-sheet.md`); separate sim results
  per tier and per bonus-buy mode; reproducibility block recorded.
- **G6 tiers:** `feature`/`super_feature`/`ultimate_feature` are materially
  different (math AND presentation); changing only title/spin-count fails the gate.
- **G7 UI:** every screen/state in `prompts/ui-ux.md` §Layouts specified for
  portrait, landscape, tablet, desktop, ultrawide; HUD always shows balance, total
  bet, win, spin state; every control has all 10 component states.
- **G8 motion:** `config/animation-events.json` validates; every event has
  duration/easing/skippable/skipTo/blocksInput/audioEvent/reducedMotion/lowPerf/
  recovery; every event's trigger maps to a real state-machine state; skip rules
  cannot alter outcomes.
- **G9 art:** `prompts/art-prompts.json` covers every entry in
  `config/asset-manifest.json`; each prompt carries the full field set from
  `prompts/art-generation.md`; generation attempted via MCP tools when available;
  every generated magenta-key asset post-processed through `tools/sprite-forge`
  (its `pipeline-meta.json` kept as QC evidence); provenance recorded per asset.
- **G10 audio:** `config/audio-events.json` validates; every animation event's
  `audioEvent` exists; music states cover base + all three tiers.
- **G11 code:** `bun install && bun run typecheck && bun test` pass in
  `games/<slug>/client/`; dev round provider is deterministic (seeded) and
  clearly dev-only; RGS adapter interface compiles; recovery replays a committed
  manifest to the correct step.
- **G12 modes:** equivalence test proves normal/quick/turbo/skipped/recovered
  presentations of the same manifest yield identical final results; autoplay has
  all stop conditions from `prompts/code-integration.md` §7; rapid-input
  protection tests pass.
- **G13 QA:** full test matrix in `prompts/validation.md` executed; rejection
  rules checked (RTP tolerance, tier sums, max-win cap, no infinite states, no
  client-side result influence, help-vs-math consistency, schema validity);
  `docs/validation-report.md` written with honest pass/fail per item.
- **G14 packaging:** every deliverable in §Packaging exists;
  `artifact-manifest.json` lists every file with sha256; known limitations and
  certification-readiness checklist written (never claim certification).

## Tool usage

- **TypeScript:** Bun only (`bun install`, `bun run dev`, `bun test`,
  `bun run typecheck`, `bun run build`). **Python:** uv only (`uv sync`,
  `uv run pytest`, `uv run python -m slot_math.simulate`).
- **Images:** batch everything through `mcp__imagegen__generate_images` (one call,
  many prompts); single refinements via `generate_image`/`edit_image`;
  `transparent: true` for sprites (magenta key). Tools absent → emit
  `prompts/art-prompts.json` only and note it in the validation report.
- **Sprite post-processing:** key/despill/defringe every magenta-key asset and
  extract/QC every animation sheet with the vendored processor in
  `tools/sprite-forge/` (uv-run; see `tools/sprite-forge/NOTICE.md` and
  `prompts/art-generation.md` §6) — never ad-hoc cleanup code.
- **Blender:** if `mcp__blender__*` tools are connected, use them for 3D hero
  symbols, turntable sprite sheets, parallax depth layers, normal-map bakes
  (details in `prompts/art-generation.md` §Blender); always ALSO write the
  standalone scripts to `prompts/blender/*.py`. Not connected → scripts only.
- **Never**: npm/yarn/pnpm, docker, headless-chrome-shell Playwright, floating
  point for money, `Math.random()` for outcomes.

## Templates

Start every doc from its template: `templates/game-design-document.md`,
`templates/par-sheet.md`, `templates/art-style-bible.md`,
`templates/motion-specification.md`, `templates/audio-specification.md`,
`templates/compliance-review.md`, `templates/validation-report.md`,
`templates/artifact-manifest.json`. Start the math package from `math/` and the
client from `client-template/` (copy, then specialize; keep their tests green).

## Packaging (step 14 deliverables)

`games/<slug>/` must contain: README; docs/ (GDD, PAR sheet, style bible, motion
spec, audio spec, compliance review, validation report, assumption/decision logs,
risk register, source register, known limitations); config/ (all 15 JSON files,
schema-valid); math/ (package + reports/); client/ (buildable, tests green);
assets/ (whatever was actually generated); prompts/ (art-prompts.json,
audio-prompts.json, blender/); artifact-manifest.json (every file + sha256 +
provenance). Finish by reporting to the user: what was built, headline math
(RTP split, volatility, hit freq, tier frequencies, max win), what was generated
vs. prompt-only, gate results, and the certification-readiness caveats.

## Honesty rules

Report simulation numbers exactly as measured. If a gate fails after 3 attempts,
ship the package marked FAILED-GATE with the evidence — never massage numbers,
never claim certification, never present the dev round provider as a real RGS.
