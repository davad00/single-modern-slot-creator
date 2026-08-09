# example-single-slot — Kilnspire

Worked example of the artifact shapes **one run** of the
`single-modern-slot-creator` skill produces, for an original demo game
designed for this example: **Kilnspire**, a 5×4 / 1,024-ways cascade slot set
in a molten-glassworks forge, with the mandatory three-tier scatter hierarchy
(3 Sigils → `feature` "Kindled Spins", 4 → `super_feature` "Roaring Kiln",
5+ → `ultimate_feature` "Starfire Crown"), target RTP 0.96, high volatility,
10,000x max win.

**Illustrative, but real:** every config validates against the schemas in
`../../schemas/`, and every statistic was genuinely simulated with the actual
math template engine (`../../math/`). Nothing is invented — and nothing here
is release evidence (see `docs/known-limitations.md`).

## Headline measured math (dev-size runs)

| Stat | Value |
|---|---|
| RTP | **0.9631** ± 0.0166 (300k rounds, seed 4242) vs target 0.9600 |
| Split | base 0.8016 · scatter pay 0.0256 · feature 0.0934 · super 0.0358 · ultimate 0.0067 |
| Hit frequency | 0.600 |
| Tier values (isolated 30k sims) | gross 17.02x < 116.26x < 1,080.39x (non-overlapping CIs) |
| Buy modes | 17.75x/0.9589 · 121x/0.9608 · 1,125x/0.9603 |

## How each file maps to the skill pipeline (SKILL.md steps)

| Pipeline step | Artifact here |
|---|---|
| 1 Intake & normalization | `example-brief.json` (validates against `schemas/skill-input.schema.json`) |
| 3 Concept & theme | GDD §1–§2 (`docs/game-design-document.md`) |
| 4 Archetype & mechanics | GDD §3–§7; `config/game-config.json`, `config/symbols.json` |
| 5 Math model & simulation | `config/paytable.json`, `config/reel-sets.json`, `math-config/` (runtime bundle), `reports/*.json`, `docs/par-sheet.md`, `docs/tuning-log.md` |
| 6 Three-tier bonus design | `config/scatter-tiers.json`, `config/features.json`, `config/bonus-buys.json` |
| 7 UI/UX spec | condensed into GDD §16; `config/spin-presentation.json`, `config/autoplay.json`, `config/device-profiles.json` |
| 8 Motion & VFX | `config/animation-events.json` (27 events, full CONVENTIONS §9.8 field set) |
| 9 Art generation | `config/asset-manifest.json` (64 prompt-only entries), `prompts/art-prompts.json` (12 fully-fielded prompts), `prompts/blender/hero-symbol-turntable.py` |
| 10 Audio | `config/audio-events.json` (28 events), `prompts/audio-prompts.json` |
| 11 Code integration | `config/state-machine.json` (23 canonical states) + `sample-outcome-manifest.json` (engine-produced super_feature round, validates against `outcome-manifest.schema.json`) |
| 12 Spin modes / autoplay | `config/spin-presentation.json`, `config/autoplay.json`, `config/jurisdiction-policies.json` |
| 13 Validation | `validate_all.py` (all schema checks; run it yourself — see below) |

## What a real run adds that this example does not

- `client/` — buildable bun + TypeScript + PixiJS client with dev round
  provider, RGS adapter, and presentation-equivalence tests (G11/G12).
- Generated art/audio under `assets/` (here everything is `prompt-only`).
- Release-size simulations (~83M+ rounds at the measured σ), rare-event
  max-win analysis, alternative RTP profiles.
- The full doc set: assumption/decision logs, risk register, style bible,
  motion/audio specs, compliance review, validation report,
  `artifact-manifest.json` with per-file sha256.

## Reproduce everything

From the skill's `math/` directory (uv-managed; template tests must be green):

```bash
uv run pytest -q                                                   # 33 passed
uv run python ../examples/example-single-slot/math-config/generate_math_config.py
uv run python -m slot_math.simulate --config ../examples/example-single-slot/math-config \
  --rounds 300000 --seed 4242 --workers 8 --bet 100 \
  --out ../examples/example-single-slot/reports/dev-sim.json
# forced-tier isolated sims: seeds 4303/4304/4305, --forced-scatters 3|4|5, 30000 rounds each
uv run python ../examples/example-single-slot/make_sample_manifest.py
uv run python ../examples/example-single-slot/build_display_config.py
uv run python ../examples/example-single-slot/render_par_sheet.py
uv run --with jsonschema python ../examples/example-single-slot/validate_all.py   # 0 failures
```

## Runtime (`math-config/`) vs display (`config/`) bundles

The math template engine consumes a flattened fixture format
(`math/tests/fixtures/default-config` is authoritative); the display bundle
follows the richer public schemas. Mapping:

| Runtime (`math-config/`) | Display (`config/`) | Notes |
|---|---|---|
| `game-config.json` (grid, evaluation, maxWinXBet) | `game-config.json` | display adds bet ladder, rtpProfiles, configFileRefs, configHash |
| `paytable.json` `linePays` map | `paytable.json` `entries[]` | same payX100 values; "linePays" is the engine's key name even for ways |
| `reel-sets.json` `{sets:[{purpose,strips}]}` | `reel-sets.json` array of schema objects | identical strips; display adds 3 `bonus_buy_entry` presentation sets the engine never reads |
| `scatter-tiers.json` flat fields | `scatter-tiers.json` with `tiers[]` | same counts/retrigger caps |
| `features.json` `{tier:{rounds,startingMult100,reelSet}}` | `features.json` schema objects | modifiers in the display file describe the strip deltas that realize them |
| `math-model.json` (cascades, cap, target) | (a real run also emits a schema-valid `config/math-model.json`; omitted here) | |

The two bundles hash differently: the runtime configHash appears in the
simulation reports and sample manifest; the display configHash in
`config/game-config.json`. **Display configHash bootstrap rule:** computed per
CONVENTIONS §5 over all `config/*.json` (alphabetical, canonical JSON) with
`game-config.json`'s own `configHash` field set to the `sha256:000…0`
placeholder, then written in (`build_display_config.py`).

`sample-outcome-manifest.json` was produced by the actual engine via the
DEV-ONLY forced-scatter hook and post-processed to the schema shape
(documented in `make_sample_manifest.py`): feature steps nested under
`feature.steps`, engine-convenience fields dropped. A real run's specialized
engine emits the schema shape directly.
