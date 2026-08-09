# Step 3 — Concept & Theme

Role: `agents/strategist.md` · Gate: **G3** (SKILL.md: "exactly 3 candidates scored on
the rubric in `prompts/concept.md`; exactly 1 selected; theme is original and
adult-appropriate")

## Objective

Generate EXACTLY 3 concise, original concept candidates, score them on the transparent
rubric below, select EXACTLY 1, and lock the game's identity: final title, backup
title, tagline, theme, narrative, visual identity, audio identity, core game loop, and
differentiation statement. Rejected concepts are recorded for audit and NOT developed
further.

## Read first

1. `CONVENTIONS.md` §4 (identifiers), §9 (design rules, esp. 9.5/9.7/9.10), §11 (defaults).
2. Step-2 outputs: `docs/research-addendum.md` (esp. differentiation requirements and
   patterns-not-to-copy), `docs/source-register.md`, `docs/risk-register.md` (IP list).
3. Normalized brief + `docs/assumption-log.md` — grid, RTP target, max win, volatility,
   jurisdiction constraints the concepts must respect.
4. `research/12-market-patterns-ip.md` §4 (theme trends) and §5 (streamability).
5. `research/14-mechanic-compatibility-matrix.md` §1–§2 — candidates may only propose
   archetype+mechanic pairs that are GOOD or OK; AVOID pairs are rejected at concept time.
6. `research/16-ip-risk-register.md` §3.2 — the blocked-name lint list.
7. `templates/game-design-document.md` — the skeleton you will start filling.

## Procedure

1. **Draft exactly 3 candidates.** Each candidate is ≤ 1 page and defines ALL of:
   - Working title (original; lint-clean against `research/16` §3.2).
   - Theme (setting, era, palette direction).
   - Narrative (2–4 sentences; how the world escalates across the three bonus tiers).
   - Player fantasy (one sentence: who the player gets to be).
   - Visual style (one of the `research/12` §4 directions — 2.5D painterly /
     cartoon-exaggerated bold-silhouette / dark gritty desaturated 2D — plus what makes
     it distinct).
   - Primary slot archetype (from the 22 in `research/01-slot-archetypes.md` §3).
   - Primary mechanic (generic vocabulary only).
   - Supporting mechanics (≤ 3, named generically).
   - Three bonus-tier concepts — one line each for `feature` / `super_feature` /
     `ultimate_feature`, materially different in structure, not just spin count
     (pre-check for G6).
   - Differentiating identity (one sentence: why this is not any incumbent title).
2. **Force diversity.** The 3 candidates must differ in at least theme cluster AND in
   archetype or primary mechanic. Reject and redraft any candidate that violates a
   `research/14` §1 AVOID cell, an IP-risk entry, a patterns-not-to-copy item, or the
   adult-audience gate (no child characters, no juvenile IP pastiche, candy themes read
   as adult confectionery-fantasy — `research/12` §4).
3. **Score every candidate on the rubric.** Score each criterion 1–5 against the anchor
   descriptions, multiply by the weight, and sum (max 500). Score independently per
   candidate and justify every cell in one line — no unexplained numbers.

   | Criterion | Weight | 1 (worst) | 3 | 5 (best) |
   |---|---|---|---|---|
   | Theme originality | 15 | clone of an incumbent theme/trade dress | familiar cluster, fresh angle | no strong incumbent; distinct world |
   | Mechanic coherence | 20 | mechanics fight each other or the theme | workable but one mechanic is bolted on | archetype, mechanics, theme and tiers reinforce one fantasy |
   | Math feasibility | 15 | no credible path to target RTP/max win/volatility | feasible with heavy simulation risk (research/14 §3 Overall ≥ 5) | fits a proven research/14 §2 bundle; Overall ≤ 4 |
   | Mobile readability | 15 | > 8 columns, per-cell text, or cells < 44 px | readable with careful layout work | ≤ 6×5-class grid, silhouette-distinct symbols, thumb-zone clean |
   | Animation potential | 10 | static; no clip-worthy moments | solid spin loop, weak tier moments | spectacular bonus-entry / tier-upgrade / max-win moments (research/12 §5) |
   | Compliance risk (inverted) | 10 | triggers legal-review flags or minor-appeal risk | minor jurisdiction friction, all gateable | fully flag-gateable; no register hits; 5 = LOWEST risk |
   | Production effort (inverted) | 10 | bespoke topology/eval code everywhere | one expensive system, rest standard | composes from template systems; 5 = LOWEST effort |
   | Market fit | 5 | niche is saturated or dead | viable secondary niche | matches a 2024–26 top-performer pattern with an open gap |

   For the two inverted criteria the anchors already invert the scale: a score of 5
   always contributes the most points and always means "lowest risk" / "lowest effort".
4. **Select exactly 1 winner.** Highest weighted total wins. Break ties with (in order):
   Mechanic coherence score, Math feasibility score, then the step-2 differentiation
   requirements coverage. Record the full matrix and the tie-break path. If the top two
   scores are within 5 points, add one paragraph explaining why the winner is still the
   right pick.
5. **Do not develop rejected concepts further.** Record each rejected candidate only as:
   its 1-page definition, its scoring row, and one rejection sentence. No art notes, no
   math sketches, no naming iterations for losers.
6. **Lock the selected identity.** For the winner produce: final title, backup title
   (both lint-clean; screen both against `research/16` §3.2 and note that a real
   trademark search is a pre-release legal item), tagline, theme, narrative, player
   fantasy, visual identity (style direction + palette + 3 reference adjectives), audio
   identity (musical direction + how `music.base/feature/super_feature/
   ultimate_feature` escalate), core game loop (one paragraph: spin → evaluate →
   cascade/feature → settle), and differentiation statement.
7. **Start the GDD skeleton.** Copy `templates/game-design-document.md` to
   `docs/game-design-document.md`. Fill the metadata block (name, `projectSlug`,
   versions, date, generator; `configHash` stays a placeholder until configs exist),
   §1 Overview & player fantasy, and §2 Theme & narrative (including the originality
   statement). Insert the full concept scoring matrix and the three candidate summaries
   into §1 under a `### Concept selection` subsection. Leave later sections as
   placeholders for steps 4–6.
8. **Log the decision.** One dated `docs/decision-log.md` entry: the 3 candidates, the
   matrix totals, the selection reasoning, tie-breaks used, and the working-title →
   generic-mechanic-id mapping for every mechanic named (per `research/16` §3.1). Update
   `artifact-manifest.json`.

## Outputs

All under `games/<slug>/` (CONVENTIONS §3):

- `docs/game-design-document.md` — skeleton from `templates/game-design-document.md`
  with metadata, §1, §2, and the `### Concept selection` subsection (3 candidate
  summaries + full rubric matrix + selection reasoning + final title, backup title,
  tagline, audio identity, core game loop, differentiation statement).
- `docs/decision-log.md` — appended step-3 entry (candidates, scores, reasoning,
  name-mapping table).
- `docs/assumption-log.md` — appended entries for any brief field the concept resolved
  from AUTO.
- `docs/risk-register.md` — appended entries for any concept-specific risk (e.g. theme
  adjacent to a protected franchise, mechanic near a patent flag).
- `artifact-manifest.json` — updated.

## Gate checklist — G3 (all must pass before step 4)

- [ ] **Exactly 3 candidates** exist, each defining every field in Procedure step 1 —
      FAIL on 2 or 4+, or on any missing field.
- [ ] **All 3 scored on the full rubric above**: 8 criteria × 3 candidates, every cell
      1–5 with a one-line justification, weighted totals computed correctly (spot-check
      the arithmetic).
- [ ] **Exactly 1 selected**, with recorded reasoning and tie-break path; the selection
      follows the matrix or explains the deviation (deviating from the top score
      without a written jurisdiction/IP cause is a FAIL).
- [ ] **Theme is original**: no patterns-not-to-copy item violated; originality
      statement present in GDD §2; case-insensitive grep of all step-3 outputs against
      `research/16` §3.2 returns zero hits in game-facing text.
- [ ] **Theme is adult-appropriate**: no child characters, no juvenile-IP pastiche, no
      "strong appeal to minors" styling; confirmed in the originality statement.
- [ ] Rejected candidates carry no development beyond definition + score + one
      rejection sentence.
- [ ] Winner's archetype+mechanic pairs are all GOOD/OK in `research/14` §1; the three
      tier concepts are structurally different from each other.
- [ ] Final title AND backup title are lint-clean; tagline present; audio identity and
      core game loop written; GDD skeleton exists at the CONVENTIONS §3 path.
- [ ] The selected concept respects the normalized brief (grid, RTP target, max win,
      volatility per `schemas/skill-input.schema.json` fields) or logs an assumption.

## Failure handling

- Fix-and-recheck per failing item; maximum 3 attempts for the gate, then record
  FAILED-GATE G3 with evidence in `docs/validation-report.md` (from
  `templates/validation-report.md`) and stop honestly.
- Candidates not meaningfully distinct, or scoring not decisive (all totals within
  5 points): redraft the weakest candidate(s) from a different theme cluster or
  archetype — do not massage scores to force separation.
- Any blocked name or trade-dress echo found in a title/theme: rename or re-theme, then
  re-run the lint; never ship a "close enough" variant of a protected name.
- If NO candidate can satisfy the brief's constraints (e.g. brief demands an AVOID
  pairing), stop and report the conflict to the orchestrator with the specific
  `research/14` citation rather than selecting a non-compliant winner.
