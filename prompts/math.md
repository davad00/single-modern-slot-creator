# Step 5+6 — Math model, simulation & three-tier scatter bonus design

## Role

`agents/mathematician.md`. You produce ALL math artifacts for the selected concept
(step 3) and mechanics (step 4). CONVENTIONS.md §4–§5 binds every number you write.
Money is integer minor units; pays are `payX100` integers; `winMinor = betMinor *
payX100 // 100` (floor) — identical in Python and TypeScript. Step/feature
multipliers fold into the SAME single floor division (`betMinor * payX100 *
multiplier // 100`; never floor-then-multiply — CONVENTIONS §5). Report every measured
number exactly as simulated. Never massage, never present a target as a result.

## Gate

**G5** (math) + **G6** (tier materiality). Both checklists at the bottom must pass
before steps 7–12 may consume your outputs. Max 3 fix-and-re-run attempts per gate,
then record the failure honestly and stop.

## Objective

Produce the seven schema-valid math configs, a specialized `math/` package, exact
theoretical checks where the archetype allows, correctly-sized simulations per tier
and per bonus-buy mode, a PAR sheet with real measured numbers, and a full
reproducibility record.

## Read first

1. `CONVENTIONS.md` §4 (identifiers), §5 (money/math/versioning), §9 (design rules), §11 (defaults)
2. `research/03-slot-math-and-simulation.md` — §6 formulas, §8 methods, §10 sizing table, §Design implications
3. `math/README.md` + `math/src/slot_math/` (modules you will specialize)
4. `schemas/`: `symbol`, `paytable`, `reel-set`, `scatter-tiers`, `feature`, `math-model`, `bonus-buy`, `simulation-report`, `par-sheet` (all `.schema.json`)
5. `templates/par-sheet.md`; step-3/4 outputs (GDD concept, mechanics spec)

## Procedure

Sections are numbered; SKILL.md step 6 points at **§6** of this file.

### 1. Set up the game math package

- Copy the skill `math/` template to `games/<slug>/math/` (exclude `.venv`,
  `__pycache__`; keep `uv.lock`). Run `uv sync` then `uv run pytest -q` there —
  the template suite must be green BEFORE you specialize anything.
- Fix `mathVersion` (semver, starts `1.0.0`) and record it everywhere it appears.

### 2. `config/symbols.json`

Array; every element validates against `schemas/symbol.schema.json`. Use ONLY
canonical ids (§4.2): `WILD`, `SCATTER`, `H1..H4` (H1 highest), `L1..L5`, `FX1..`
for feature-exclusive, `MULT/CASH/COLLECT/MYSTERY/JP_*/BLANK` as the mechanics
require. Themed names go in `displayName` only. Set `substitutes`,
`appearsOnReels`, `featureOnly` truthfully — the evaluator reads them.

### 3. `config/paytable.json`

Validates against `schemas/paytable.schema.json`. All pays x-bet with ≤ 2 decimals
stored as integer `payX100` (2.5x → 250). `evaluationMode`/`directionRule` must
match the step-4 archetype. Pays monotone in match length and in tier rank
(H1 ≥ H2 ≥ … ≥ L5 at equal length). Include scatter pays if the design has them.

### 4. `config/reel-sets.json`

Array of `schemas/reel-set.schema.json` entries. Mandatory set list:

| setId (pattern) | purpose |
|---|---|
| `base-<profile>` | `base` — one per RTP profile |
| `feature-strips` | `feature` |
| `super-feature-strips` | `super_feature` |
| `ultimate-feature-strips` | `ultimate_feature` |
| `buy-entry-<tier>` | `bonus_buy_entry` — one per bought tier |

Pick `strips` or `weightedTable` per reel set to match the archetype. Tune ONLY
ordinary-symbol counts between RTP profiles; keep WILD/SCATTER/JP counts frozen
(the Lobstermania versioning technique, research/03 §1). NO near-miss adjacency
weighting — anticipation is presentation-only (CONVENTIONS §9.5).

### 5. `config/scatter-tiers.json`, `config/math-model.json`, `config/bonus-buys.json`

- `scatter-tiers.json`: start from the mandated default block —
  `countingRule: "initial-grid"`, `countCascadedScatters: false`,
  `countCopiedScatters: false`, 3→`feature`, 4→`super_feature`,
  5+→`ultimate_feature`, `fiveOrMoreUsesUltimateTier: true` — change it only if the
  brief explicitly overrides, and log the override in `docs/decision-log.md`.
  Define retrigger rules WITH a hard cap and anticipation behavior.
- `math-model.json`: targetRtp (default 0.9600), rtpTolerance, volatilityClass,
  targetHitFrequency, per-channel `contributions` (base + scatterPay + feature +
  super_feature + ultimate_feature (+ jackpot) MUST sum to targetRtp ±0.0005),
  featureTriggerProb (default band 1/150–1/250), retrigger/cascade caps with
  termination proof, maxWin cap (default 10,000x) + `max_win_termination`
  behavior, and the simulationPolicy from §8 below.
- `bonus-buys.json`: one mode per purchasable tier. Price in `priceXBet100`
  (default ≈ 100x `feature` → 10000; scale higher tiers). Each mode declares its
  own `rtp` and a `forcedEntryDistribution` that matches the NATURAL conditional
  trigger distribution for that scatter count — or documents why it differs.
  Never reuse the 3-scatter entry distribution for a 4/5-scatter buy.

### 6. Three-tier scatter bonus design (step 6) — `config/features.json`

Exactly three entries (`feature`, `super_feature`, `ultimate_feature`) validating
against `schemas/feature.schema.json`. For EACH tier define: trigger, rounds,
starting multiplier, modifier set with parameters, progression, retrigger rule +
cap, max-win behavior, reel-set/weight override, entry/exit events, recovery
contract, exit summary.

**Tier materiality test (G6).** Tiers must differ in numbers, not adjectives.
Document in `math-model.json` and prove by isolated simulation (§8) ALL of:

1. **Rounds**: strictly increasing (e.g. 8 / 12 / 16) — necessary, NOT sufficient.
2. **Mechanics delta**: each higher tier has ≥ 1 modifier absent below it, or a
   structurally upgraded parameter (e.g. multipliers become sticky, collector
   persists), AND `super_feature`/`ultimate_feature` use distinct reel sets or
   weight overrides (measurable premium/wild weight delta, e.g. ≥ +25% premium
   density vs the tier below — state your actual numbers).
3. **Measured separation**: from the per-tier isolated sims,
   `E[pay | feature] < E[pay | super_feature] < E[pay | ultimate_feature]` with
   non-overlapping 95% CIs, and average exit multiplier strictly increasing.
   Record the three conditional means and their CIs in the PAR sheet.

Equal tiers, or tiers differing only in title/spin count/skin = **FAIL G6**.

### 7. Schema-validate every config

Run from `games/<slug>/` (`<skill>` = absolute skill-package root). One uv
one-liner per file — array-shaped configs validate per element:

```bash
uv run --with jsonschema python -c "import json,jsonschema; s=json.load(open(r'<skill>/schemas/symbol.schema.json')); d=json.load(open('config/symbols.json')); [jsonschema.validate(i,s) for i in d]; print('symbols.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/paytable.json')), json.load(open(r'<skill>/schemas/paytable.schema.json'))); print('paytable.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; s=json.load(open(r'<skill>/schemas/reel-set.schema.json')); d=json.load(open('config/reel-sets.json')); [jsonschema.validate(i,s) for i in d]; print('reel-sets.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/scatter-tiers.json')), json.load(open(r'<skill>/schemas/scatter-tiers.schema.json'))); print('scatter-tiers.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/features.json')), json.load(open(r'<skill>/schemas/feature.schema.json'))); print('features.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/math-model.json')), json.load(open(r'<skill>/schemas/math-model.schema.json'))); print('math-model.json OK')"
uv run --with jsonschema python -c "import json,jsonschema; jsonschema.validate(json.load(open('config/bonus-buys.json')), json.load(open(r'<skill>/schemas/bonus-buy.schema.json'))); print('bonus-buys.json OK')"
```

Expected output: seven `… OK` lines. Any `ValidationError` traceback = fix the
config (never the schema) and re-run.

### 8. Specialize the engine, theoretical checks, simulate

- Point `games/<slug>/math/` at the game's `config/` bundle; extend
  `evaluator.py`/`features.py`/`cascades.py` for game-specific mechanics; keep
  `money.py` untouched. `uv run pytest -q` must stay green after every change.
- **Exact first**: for line/ways games with independent stops, compute exact base
  RTP via `slot_math.enumerate_lines.theoretical_base_rtp` (collapse per-reel
  symbol counts). Feature states with memory → absorbing Markov chains. Only what
  is intractable falls to Monte Carlo. Record method per channel (`exact | chain |
  MC`) in the PAR sheet.
- **Sizing policy (never assume 1M is enough):**
  - Dev/smoke: `--rounds 1000000` minimum per mode; expected noise ±z·σ/1000 —
    annotate it, and gate NOTHING on a dev run except gross errors.
  - Release: run a 1M pilot to measure σ (per-round return in x-bet units), then
    **n ≥ (z·σ/ε)²** with ε = 0.001 and z = 1.959964 (RTP ±0.1% at 95%); e.g.
    σ=5 → 96M, σ=10 → 384M rounds. Additionally: the rarest MC-simulated tier must
    accumulate ≥ 10⁴ conditional entries, and the CONVENTIONS §5 gate is judged
    at the 99% CI — see the sizing table in research/03 §10. Compute n per mode
    per RTP profile, using that mode's σ in units of its own wager.
  - **Isolated sims** — one report each, per tier and per buy mode. Run from
    `games/<slug>/math/` (the uv project root):

    ```bash
    uv run python -m slot_math.simulate --config ../config --rounds <n> --seed 4242 --workers 8 --bet 100 --out reports/release-base.json
    uv run python -m slot_math.simulate --config ../config --rounds <n_tier> --seed 4301 --workers 8 --bet 100 --forced-scatters 3 --out reports/tier-feature.json
    uv run python -m slot_math.simulate --config ../config --rounds <n_tier> --seed 4302 --workers 8 --bet 100 --forced-scatters 4 --out reports/tier-super-feature.json
    uv run python -m slot_math.simulate --config ../config --rounds <n_tier> --seed 4303 --workers 8 --bet 100 --forced-scatters 5 --out reports/tier-ultimate-feature.json
    uv run python -m slot_math.simulate --config ../config --rounds <n_buy> --seed 4310 --workers 8 --bet 100 --buy-mode <modeId> --out reports/buy-<modeId>.json
    ```

    The template CLI has `--forced-scatters` and `--profile` (RTP profiles) but no
    buy-mode flag — ADD `--buy-mode <modeId>` while specializing `simulate.py`:
    it forces entry from that mode's `forcedEntryDistribution` and computes
    `RTP_buy = E[total pay] / (betMinor * priceXBet100 / 100)` (the buy price is
    the wager). One report per mode in `config/bonus-buys.json`.

  - **Rare events** (ultimate tier, max win): never crude MC when p < 1e-5.
    Decompose: P(entry) exactly (enumerable from strips/weights) × conditional
    payout by stratified/forced simulation (`--forced-scatters 5`), reweight by the
    exact entry probability. Report every rare p WITH its estimation method and CI.
  - Verification sims use FRESH seeds, never the seeds you tuned with.
- Every report must validate against `schemas/simulation-report.schema.json`
  (same one-liner pattern as §7).

### 9. PAR sheet + reproducibility

- Build `math/reports/par-sheet.json` (validates against
  `schemas/par-sheet.schema.json`) from release-level results, then render
  `docs/par-sheet.md` from `templates/par-sheet.md` — real measured numbers only:
  RTP decomposition summing to total, σ/variance/VI (label the z), P(X>0) AND
  P(X≥stake), tier frequencies as "1 in N", retrigger/cascade stats, payout
  quantiles (P50/P90/P99/P99.9 + median of paying rounds), max win + P(max win)
  per mode + max liability, full strip listings/weight tables, LDW rate.
- Reproducibility block (CONVENTIONS §5 — mandatory in every report and the PAR
  sheet): gameVersion, mathVersion, configHash (`sha256:` over canonical
  concatenated configs), simCodeVersion, `uv.lock` hash, root seed +
  `SeedSequence.spawn(workers)` policy, per-mode round counts, worker count,
  exact command line. Never change the BitGenerator within a mathVersion.

## Outputs

`config/`: symbols.json, paytable.json, reel-sets.json, scatter-tiers.json,
features.json, math-model.json, bonus-buys.json (all schema-valid).
`games/<slug>/math/` specialized, `uv run pytest` green.
`math/reports/`: release-base.json, tier-{feature,super-feature,ultimate-feature}.json,
buy-<tier>.json per mode, par-sheet.json. `docs/par-sheet.md`.

## Gate checklist

**G5** — run each check; expected outcome stated:

- [ ] §7 block prints seven `OK` lines (all math configs schema-valid).
- [ ] `uv run pytest -q` in `games/<slug>/math/` → all pass, exit 0.
- [ ] Release base sim ran at the §8-computed n; report's
      `|results.measuredRtp − math-model.targetRtp|` ≤ min(99% CI half-width, 0.003).
- [ ] Contribution sum: base + scatterPay + feature + super + ultimate (+ jackpot)
      = measured total RTP within ±0.0005 (read from release report `perTier`).
- [ ] Max win reachable (≥ 1 capped round observed or exact P(max) > 0 computed)
      AND no simulated round exceeds the cap (report max payout ≤ cap).
- [ ] Separate reports exist per tier (3) and per bonus-buy mode (all modes),
      each schema-valid.
- [ ] `docs/par-sheet.md` complete per template — no `{{placeholders}}` remain.
- [ ] Reproducibility block present in every report (all 9 fields).

**G6** — from the three tier reports:

- [ ] Conditional mean payouts strictly increase with non-overlapping 95% CIs.
- [ ] Average exit multiplier strictly increases.
- [ ] Each higher tier shows the documented mechanics delta (modifier/reel-set
      diff exists in features.json + reel-sets.json, not just labels).
- [ ] Rounds/multiplier/modifier numbers in features.json are pairwise distinct.

## Failure handling

- Config fails schema → fix config, re-run §7. RTP off target → retune ordinary
  symbol counts only (specials frozen), re-simulate with fresh seeds. Tiers not
  separated → change math (weights/modifiers/multipliers), never just labels.
- Max 3 attempts per failing check. Still failing → write the measured evidence
  into `docs/validation-report.md`, mark the gate FAILED-GATE, stop. Never
  proceed to steps 7+ on a failed G5/G6, and never adjust a reported number to
  pass — the honest failure is the deliverable.
