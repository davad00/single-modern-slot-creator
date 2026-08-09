# Step 13 — Simulation, QA & validation

## Role

`agents/compliance-qa.md`. You execute the full test matrix against everything
steps 2–12 produced, check every rejection rule, and write
`docs/validation-report.md` from `templates/validation-report.md`. HONESTY RULES
bind absolutely: report results exactly as measured; a failing row stays FAIL;
checks you cannot run are SKIPPED or MANUAL-REQUIRED with the reason — never
faked, never silently omitted.

## Gate

**G13.** The report itself — complete and honest — is the gate artifact. A
package full of FAILs with an accurate report can pass G13's *process*; a single
massaged number fails everything.

## Objective

Run all 28 test families, map all 10 rejection rules to concrete checks, fill the
validation report with real evidence, write `docs/compliance-review.md`, and
produce the certification-readiness checklist (never claiming certification).

## Read first

1. `CONVENTIONS.md` §5 (tolerance gate), §9 (design rules)
2. `templates/validation-report.md`, `templates/compliance-review.md`
3. `prompts/math.md` §8 (sim sizing), `prompts/code-integration.md` §7 (modes/autoplay)
4. `math/reports/*.json`, `config/*.json`, `games/<slug>/client/tests/`
5. `research/17-jurisdiction-policy-matrix.md`, `research/16-ip-risk-register.md`

## Procedure

### 1. Preflight

Confirm every prior-step artifact exists (CONVENTIONS §3 layout). Missing
artifact = its gate row is FAIL with "artifact missing" evidence; do not
recreate other roles' work — report it.

### 2. Test matrix — every family, with its execution method

Run client commands in `games/<slug>/client/`, math commands in
`games/<slug>/math/`. `<skill>` = skill-package root. Record for every family:
exact command, pass/fail/skip counts, evidence path.

| # | Family (prompt.txt §Step 13) | How to execute in this stack |
|---|---|---|
| 1 | Unit tests | `bun test` — full client suite green |
| 2 | Math tests | `uv run pytest -q` — full math suite green |
| 3 | Paytable tests | `uv run pytest -q tests/test_evaluator.py` + assert `config/paytable.json` pays monotone (H1≥…≥L5, longer≥shorter) via a pytest check |
| 4 | Reel-strip tests | `uv run pytest -q tests/test_reels.py` — strip lengths, symbol inventory vs PAR sheet counts |
| 5 | Weight-table tests | same file — weights positive integers, totals match exact probabilities in PAR sheet |
| 6 | RTP simulations | verify `math/reports/release-*.json` exist at the §math.md-§8 computed n, fresh seeds; re-run dev-size cross-check: `uv run python -m slot_math.simulate --config ../config --rounds 1000000 --seed 9901 --workers 8 --bet 100 --out reports/qa-crosscheck.json` |
| 7 | Feature-frequency tests | from release report: each tier's "1 in N" inside the band declared in `config/math-model.json` |
| 8 | Retrigger tests | report retrigger stats ≤ configured cap; `uv run pytest -q tests/test_tiers.py` |
| 9 | Maximum-win tests | report max payout ≤ cap; `max_win_termination` step present in a capped round; P(max win) reported with method |
| 10 | Property-based tests | `uv run pytest -q tests/test_property.py` (integer-money invariants, no negative wins, cascade termination) |
| 11 | State-machine tests | `bun test stateMachine` — every legal transition covered, illegal rejected |
| 12 | Outcome-schema tests | `bun run scripts/export-wire-manifests.ts .build/wire-manifests` then validate all against `<skill>/schemas/outcome-manifest.schema.json` (uv+jsonschema one-liner from code-integration.md §5) |
| 13 | Animation-skip tests | `bun test motionPlayer timeline` — skipTo never alters manifest values |
| 14 | Turbo-mode equivalence tests | `bun test equivalence` — normal/quick/turbo/skip/recovered identical results |
| 15 | Autoplay tests | `bun test autoplay` — every stop condition from code-integration.md §7 asserted |
| 16 | Rapid-input tests | `bun test inputGuard` — every input class from code-integration.md §7 |
| 17 | Refresh tests | `bun test recovery` (mid-presentation interrupt → resume) + MANUAL-REQUIRED: browser F5 mid-spin in `bun run dev` |
| 18 | Reconnection tests | `bun test recovery` network-drop path + MANUAL-REQUIRED: devtools offline toggle |
| 19 | Feature-recovery tests | `bun test recovery` — interrupt inside each tier's `*_active` state, identical settlement |
| 20 | Browser tests | MANUAL-REQUIRED: `bun run dev`, load in installed Chrome/Firefox/Safari. NEVER use playwright headless-chrome-shell |
| 21 | Mobile tests | MANUAL-REQUIRED: real device or browser device-emulation; touch targets ≥ 44px |
| 22 | Orientation-change tests | MANUAL-REQUIRED: rotate during spin/feature; state and layout survive |
| 23 | Accessibility tests | automatable part: assert reduced-motion variant exists for every `config/animation-events.json` event (script check); MANUAL-REQUIRED: contrast ≥ 4.5:1, no colour-only info, flash ≤ 3/s |
| 24 | Localization tests | automatable: no hardcoded player-facing strings outside the strings table (grep check); MANUAL-REQUIRED: pseudo-locale render |
| 25 | Visual-regression tests | MANUAL-REQUIRED unless a non-headless-chrome-shell harness exists; otherwise record baseline screenshots manually |
| 26 | Performance tests | `bun run build` succeeds; record bundle size vs device-profiles budget; MANUAL-REQUIRED: 60fps spot-check on mid-tier device |
| 27 | Memory tests | MANUAL-REQUIRED: devtools heap snapshots across 100 spins — no unbounded growth |
| 28 | Long-session stability | automatable proxy: `bun test` timeline/autoplay long-run cases (1000+ simulated rounds); MANUAL-REQUIRED: 30-min real session |

Mark every MANUAL-REQUIRED item honestly in the report — a manual item without
recorded human evidence is NOT-RUN, never PASS.

### 3. Rejection matrix — rules verbatim, each mapped to a check

Reject the game when (verbatim from the mission brief) — run every check:

| Rejection rule (verbatim) | Concrete check |
|---|---|
| "RTP is outside tolerance." | release report: `abs(measuredRtp − targetRtp)` ≤ min(99% CI half-width, 0.003) |
| "Feature contributions do not sum correctly." | report contributions sum to total ±0.0005 (script over `perTier`) |
| "The maximum win exceeds the configured cap." | max simulated payout ≤ `math-model.json` cap; capped rounds carry `max_win_termination` |
| "A feature can enter an infinite state." | retrigger cap + cascade cap present in configs; `uv run pytest tests/test_property.py` termination proofs pass; state machine has no presentation cycle without exit guard (inspect `config/state-machine.json` transitions) |
| "Client presentation changes the final result." | `bun test equivalence` green |
| "Recovery generates a replacement result." | `bun test recovery` — resumed round settles from the ORIGINAL manifest (assert same roundId + totalWinMinor) |
| "A rule in the help screen differs from the math." | inspection: diff help/paytable screen content against `config/paytable.json`, `config/scatter-tiers.json`, `config/features.json`, displayed RTP vs active profile — record each compared value |
| "A configured animation references an invalid state." | script: every trigger state in `config/animation-events.json` and every `presentationMap` key ∈ the 23 canonical states (uv one-liner over the two files) |
| "A bonus-buy mode lacks independent analysis." | one schema-valid `math/reports/buy-*.json` exists per mode in `config/bonus-buys.json`, with own RTP + CI |
| "A JSON artifact fails schema validation." | re-run ALL schema one-liners (math.md §7, code-integration.md §4–§5, plus animation-event, audio-event, asset-manifest, game-config, skill-input/output where instantiated) — every file OK |

Any rejection rule firing ⇒ overall verdict FAILED-GATE (after the owning step's
3 fix attempts). Record which rule fired and the evidence.

### 4. Fill `docs/validation-report.md`

Start from `templates/validation-report.md`. Complete: metadata block (real
configHash), §1 gate table G2–G14 with attempts + evidence, §2 one subsection per
test category with exact command and counts, §3 rejection-rule checklist, §4
known limitations & skipped checks (every MANUAL-REQUIRED / SKIPPED item with
reason), §5 FAILED-GATE section when applicable, §6 certification-readiness
statement. No `{{placeholder}}` may remain.

### 5. Compliance review

Fill `docs/compliance-review.md` from `templates/compliance-review.md`:
engineering posture only, NO legal conclusions. Cross-check every claimed gate
against `config/jurisdiction-policies.json`: autoplay, quick/turbo, slam stop,
bonus buy, min round duration, RTP display, reality checks — each row cites the
config value + the enforcing test. UNKNOWN jurisdiction ⇒ most-restrictive
default (assert the client test for it passed). External reviews in §14 of the
template stay NOT-YET-DONE.

### 6. Certification-readiness checklist (never claim certification)

Append to the validation report: outputs are **certification-ready candidates**.
Checklist (all unchecked by definition at this step): [ ] legal review per
target jurisdiction; [ ] independent math verification; [ ] accredited lab
certification (game + RGS + RNG); [ ] operator UAT; [ ] responsible-gaming
config per market; [ ] real RGS integration replacing the dev provider.
Wording that claims or implies completed certification = G13 FAIL.

## Outputs

`docs/validation-report.md` (complete, honest), `docs/compliance-review.md`,
`math/reports/qa-crosscheck.json`, rejection-matrix evidence recorded, updated
`artifact-manifest.json` entries.

## Gate checklist

**G13:**
- [ ] All 28 families executed or explicitly SKIPPED/MANUAL-REQUIRED with reason
      — zero silent omissions.
- [ ] All 10 rejection rules checked with recorded evidence; none firing (or
      FAILED-GATE declared).
- [ ] `bun test` and `uv run pytest -q` both green, outputs captured.
- [ ] All schema one-liners print OK.
- [ ] `docs/validation-report.md` complete — no placeholders, honest statuses,
      overall verdict set (ALL-GATES-PASS / PASS-WITH-SKIPS / FAILED-GATE).
- [ ] Compliance review complete with jurisdiction cross-check.
- [ ] Certification-readiness checklist present; no certification claim anywhere.

## Failure handling

- A failing test belongs to its owning step (math → step 5/6, client → 11/12):
  hand back with the failing command output; that step gets max 3 fix attempts,
  then the failure is recorded and the package ships marked FAILED-GATE.
- Never edit tests, schemas, or reports to convert FAIL to PASS. Never delete a
  failing row. Never substitute a smaller simulation because the sized one is
  slow — run it, or mark the row honestly and explain.
- If tooling is unavailable (no device, no browser), the row is MANUAL-REQUIRED
  or SKIPPED + reason — the report stays truthful about what was NOT verified.
