# Step 4 — Archetype & Mechanics Selection

Role: `agents/strategist.md` · Gate: **G4** (SKILL.md: "1 archetype + 1 primary
mechanic + ≤ 3 supporting mechanics; every mechanic has purpose/trigger/state/math/
recovery/tests defined; no trademarked mechanic names (check
`research/16-ip-risk-register.md`)")

## Objective

Lock the mechanical package of the selected concept: exactly 1 primary slot archetype,
exactly 1 primary mechanic, and at most 2–3 supporting mechanics — each fully specified
across the ten definition dimensions, checked against the compatibility matrix,
screened for trademarks, and mapped onto the config files the mathematician (step 5)
will build. Note: SKILL.md step 6 re-enters this file at Procedure step 5 (the tier
hierarchy) together with `prompts/math.md`.

## Read first

1. `CONVENTIONS.md` §4 (identifiers, state machine), §5 (money/math), §7 (outcome
   manifest), §9 (design rules), §11 (defaults).
2. `docs/game-design-document.md` §1–§2 — the selected concept from step 3, including
   its proposed archetype, primary mechanic, supporting mechanics, and tier concepts.
3. `docs/research-addendum.md` (patterns-not-to-copy, differentiation requirements) and
   `docs/risk-register.md` (IP entries).
4. `research/14-mechanic-compatibility-matrix.md` — §1 matrix + footnotes, §2 proven
   bundles, §3 complexity scores. This file is the compatibility authority.
5. `research/01-slot-archetypes.md` §2 (evaluation algorithms), §5 (hard avoid rules),
   Design implications §1–§11.
6. `research/02-mechanics-and-features.md` §1–§8 (mechanic catalogue), §9 (engineering
   dimensions), D1–D6 (defaults).
7. `research/16-ip-risk-register.md` §3 (register + §3.2 blocklist), §3.1 (default rule).
8. Schemas your decisions must fit without translation loss:
   `schemas/feature.schema.json`, `schemas/scatter-tiers.schema.json`,
   `schemas/symbol.schema.json`, `schemas/reel-set.schema.json`,
   `schemas/state-machine.schema.json`, `schemas/outcome-manifest.schema.json`,
   `schemas/bonus-buy.schema.json`.

## Procedure

1. **Fix the selection.** Confirm or minimally adjust the step-3 winner's package:
   exactly 1 primary archetype (one of the 22 in `research/01` §3), exactly 1 primary
   mechanic, and 2–3 supporting mechanics maximum. A 4th supporting mechanic is allowed
   ONLY with a written justification in `docs/decision-log.md` covering: why the design
   fails without it, which rejection rule it skirts and why it survives, and the added
   complexity budget per `research/14` §3 scoring rules. The mandatory three-tier
   scatter hierarchy (CONVENTIONS §4.1) is not counted as a supporting mechanic.
2. **Run the compatibility analysis.** Build one table: rows = every
   archetype+mechanic and mechanic+mechanic pairing in the package; verdict column
   quoting the `research/14` §1 cell (GOOD/OK/AVOID with footnote id). Any AVOID ⇒
   replace the mechanic and redo. Then assess the package as a whole on all ten
   dimensions, one row each, each with a 1–5 score and a one-line justification citing
   `research/14` §3 or `research/01`/`research/02`:
   theme fit · mathematical fit (enumerability, target RTP/max-win reachability) ·
   volatility impact (per the §4-of-02 lever ladder; ≤ 2 extreme-volatility levers) ·
   mobile readability (≤ 8 columns, cells ≥ 44 px at 390 px, value text ≥ 24 px) ·
   UI complexity · animation complexity · state-machine complexity (extra states,
   loops, termination proofs) · simulation complexity (`research/14` §3 Math score;
   Overall ≥ 4 mandates release-grade sim sizing; Overall 5 requires an explicit brief)
   · performance cost (atlas/particle/text budgets, `research/02` D7) ·
   certification impact (recovery matrix size, tier evidence, `research/02` §9).
3. **Apply the rejection rules** to every mechanic in the package, verbatim from
   prompt.txt (step 4):

   > Reject mechanics that:
   > - Duplicate another mechanic's purpose.
   > - Create unreadable visual states.
   > - Produce excessive feature complexity.
   > - Make the maximum liability unclear.
   > - Create unbounded feature loops.
   > - Make mobile performance impractical.
   > - Cannot be represented by the outcome manifest.

   Record a pass/fail line per rule per mechanic. "Cannot be represented by the outcome
   manifest" means: expressible as ordered steps of the types in CONVENTIONS §7 /
   `schemas/outcome-manifest.schema.json` (`initial_result | cascade | respin |
   feature_round | feature_trigger | feature_retrigger | feature_upgrade |
   jackpot_award | max_win_termination | settlement`) with all cross-spin state
   serialized in the steps. A mechanic failing any rule is replaced or dropped; a
   justified exception is allowed only for "excessive feature complexity" via the
   step-1 written-justification path.
4. **Specify every selected mechanic.** For EACH mechanic (primary first, then
   supporting), fill a GDD §6 subsection (`templates/game-design-document.md` §6 table)
   defining ALL of:
   - **Purpose** — the player emotion/problem it serves, one line; must be unique in
     the package (rejection rule 1).
   - **Trigger** — exact condition and where its probability comes from (strip weights,
     cell weights, tier entry).
   - **Input state** — the canonical state(s) (CONVENTIONS §4.4 set only) in which it
     can fire, plus any required round state (meters, locked sets, ladders).
   - **Output state** — the state(s) it transitions to and every round-state field it
     writes; record both in the GDD "States involved" row as `input → output`.
   - **Math behavior** — RTP-contribution budget line, weights/values involved, caps
     (cascade/retrigger/multiplier), and whether it is enumerable or sim-only
     (`research/01` §7 decision rule).
   - **Visual behavior** — the `anim.<context>.<name>` events it needs (CONVENTIONS
     §4.3), including reducedMotion and lowPerformance variants.
   - **Audio behavior** — the `music.*` / `sfx.*` / `ui.*` events it needs; win-tier
     gating (never celebrate win ≤ stake above `small`).
   - **Interruption behavior** — what skip/quick/turbo do to its presentation; must
     change timing only, never values (CONVENTIONS §9.2).
   - **Recovery behavior** — exactly what is restored from the committed manifest +
     `resumePointer` mid-mechanic (GLI-19 §4.16 / RTS 10 pattern, `research/02` D6).
   - **Test cases** — ≥ 3 deterministic tests: trigger boundary, cap/termination
     boundary, and recovery mid-mechanic; more for stateful mechanics.
5. **Design the three-tier scatter hierarchy** (re-entered by SKILL.md step 6). Using
   `research/02` §6/§11 and D3 as the pattern library, define `feature` (3 scatters),
   `super_feature` (4), `ultimate_feature` (5+) so each tier is MATERIALLY different in
   structure (rounds, strips, modifiers, exclusive content) — spin-count-plus-theming
   deltas fail G6 later. Fill GDD §7 (scatter counting rules; default CONVENTIONS §11:
   `countingRule: initial-grid`, cascaded/copied scatters do not count), and the
   structural rows of GDD §8–§11 (leave measured math cells as `⌀ sim` for step 5–6 to
   overwrite). Every tier field must map onto `schemas/scatter-tiers.schema.json` and
   `schemas/feature.schema.json` (tierId enum `feature|super_feature|ultimate_feature`).
6. **Run the trademark screen.** Grep (case-insensitive) every step-4 output against
   `research/16` §3.2. For each mechanic, record in the decision log: the market
   pattern it derives from, the protected name(s) it must NOT use, and the original
   generic internal id chosen (e.g. `hold_respin`, `variable_height_ways`,
   `split_symbol`, `stepping_wild_multiplier`) plus the themed public name. Apply
   `research/16` §3.1: any capitalised third-party mechanic brand is presumed
   trademarked. Raise the two auto-flags in `docs/risk-register.md` when applicable:
   6-reel variable symbols-per-reel ⇒ "BTG US patent — legal review required for US
   distribution"; add-a-reel presentation ⇒ Infinity-Reels trade-dress review.
7. **Write the config touch map.** One table (in GDD §6, after the mechanic
   subsections): rows = every selected mechanic + each tier; columns = the
   `config/*.json` files it touches and what it contributes to each. Cover at least:
   `config/game-config.json` (`schemas/game-config.schema.json`), `config/symbols.json`
   (`schemas/symbol.schema.json`), `config/paytable.json`
   (`schemas/paytable.schema.json`), `config/reel-sets.json`
   (`schemas/reel-set.schema.json`), `config/scatter-tiers.json`, `config/features.json`,
   `config/bonus-buys.json` (`schemas/bonus-buy.schema.json`),
   `config/state-machine.json` (`schemas/state-machine.schema.json`),
   `config/animation-events.json`, `config/audio-events.json`,
   `config/spin-presentation.json`. Do NOT write files under `config/` — that is the
   mathematician's and later steps' territory (strategist charter); the touch map is
   their build order.
8. **Log and hand off.** Dated `docs/decision-log.md` entry: the locked package,
   compatibility verdicts, rejection-rule results, name mappings, and any justified
   exception. Append new risks to `docs/risk-register.md`. Update
   `artifact-manifest.json`. The GDD mechanics section must be complete enough that the
   mathematician can build `config/` and the math model without asking questions.

## Outputs

All under `games/<slug>/` (CONVENTIONS §3):

- `docs/game-design-document.md` — §3 (archetype & grid), §4 (symbol set with
  CONVENTIONS §4.2 ids), §6 (one full subsection per mechanic + the config touch map),
  §7 (scatter counting rules), structural rows of §8–§11 (tiers + retriggers); math
  cells marked `⌀ sim` where step 5–6 must supply measured values.
- `docs/decision-log.md` — appended step-4 entry (package, verdicts, rejection-rule
  table, name-mapping table, exceptions).
- `docs/risk-register.md` — appended mechanic-specific IP/patent/trade-dress and
  certification risks.
- `artifact-manifest.json` — updated.

## Gate checklist — G4 (all must pass before step 5)

- [ ] **Exactly 1 archetype + exactly 1 primary mechanic + ≤ 3 supporting mechanics**;
      any 4th supporting mechanic carries the full written justification of Procedure
      step 1 — FAIL otherwise.
- [ ] **Every mechanic defines all ten dimensions** (purpose, trigger, input state,
      output state, math, visual, audio, interruption, recovery, test cases) — FAIL on
      any empty or "TBD" cell; `⌀ sim` is legal only in measured-math cells.
- [ ] **No trademarked mechanic names**: case-insensitive grep of all step-4 outputs
      against `research/16` §3.2 returns zero hits in game-facing text; every mechanic
      has a generic internal id and a name-mapping decision-log entry — FAIL on any hit
      or missing mapping.
- [ ] Compatibility analysis covers every pairing (no AVOID cells) and all ten
      assessment dimensions with citations.
- [ ] All seven rejection rules evaluated per mechanic with recorded pass/fail; no
      unresolved fail.
- [ ] Every mechanic's steps are representable in
      `schemas/outcome-manifest.schema.json` step types, and every loop has a declared
      cap (cascade cap, retrigger caps per tier, multiplier cap) — no unbounded
      liability.
- [ ] Tier hierarchy: three tiers structurally different (pre-check for G6); GDD §7–§11
      structural rows filled; fields map onto `schemas/scatter-tiers.schema.json` and
      `schemas/feature.schema.json` without translation loss.
- [ ] Input/output states use ONLY the canonical CONVENTIONS §4.4 state set; symbol ids
      match `schemas/symbol.schema.json` pattern `^[A-Z][A-Z0-9_]{0,15}$`.
- [ ] Config touch map present and covers every mechanic and tier; no files written
      under `config/`.

## Failure handling

- Fix-and-recheck per failing item; maximum 3 attempts for the gate, then record
  FAILED-GATE G4 with evidence in `docs/validation-report.md` (from
  `templates/validation-report.md`) and stop honestly.
- An AVOID pairing or rejection-rule failure: swap the offending mechanic for the
  nearest GOOD/OK alternative from `research/14` §2's bundles and re-run steps 2–4 for
  the replacement; if the selected CONCEPT depends on the rejected mechanic, return to
  step 3 with a note rather than forcing it through.
- Package infeasible for the brief's RTP/max-win/volatility targets (math-fit score 1):
  do not weaken the targets silently — either restructure the package or escalate to
  the orchestrator with the specific infeasibility.
- Trademark-screen hit on a name already woven into the theme: rename the mechanic's
  public label; the internal generic id never changes.
- Never resolve a failure by deleting a test case, dropping a cap, or relabeling a
  supporting mechanic as "presentation only" — fix the design or report the failure
  (SKILL.md honesty rules).
