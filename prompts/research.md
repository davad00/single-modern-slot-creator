# Step 2 — Focused Research

Role: `agents/strategist.md` · Gate: **G2** (SKILL.md: "dossier has ≥ 8 sources with
dates; IP-risk list present; patterns-not-to-copy list present (seed from
`research/16-ip-risk-register.md`)")

## Objective

Produce the run-focused research package for ONE slot game: a niche-specific research
addendum grounded in the skill's bundled dossier, a dated source register, a
competitor-pattern matrix for the chosen theme/mechanic niche, an originality review,
an IP-risk list, design opportunities, and a patterns-not-to-copy list. Research only
what THIS game needs — the bundled `research/` dossier is the baseline; do not
re-research what it already answers.

## Read first

1. `CONVENTIONS.md` — entire file; enforce §4 identifiers, §9 design rules, §11 defaults.
2. Step-1 outputs: the normalized brief (valid against `schemas/skill-input.schema.json`),
   `games/<slug>/docs/assumption-log.md`, constraint list, `projectSlug`.
3. `research/00-executive-summary.md` — orientation and dossier map.
4. `research/01-slot-archetypes.md` §3–§6 and `research/02-mechanics-and-features.md` —
   archetype/mechanic baseline for whatever direction the brief implies.
5. `research/12-market-patterns-ip.md` — studio patterns, math norms, theme trends.
6. `research/14-mechanic-compatibility-matrix.md` — proven bundles (§2) you will position
   against.
7. `research/16-ip-risk-register.md` — canonical IP register incl. the §3.2 lint
   blocklist. If missing, fall back to `research/12-market-patterns-ip.md` §6–§7 and
   note the fallback in `docs/decision-log.md`.
8. If the brief names jurisdictions: `research/05-jurisdiction-rules.md` and
   `research/17-jurisdiction-policy-matrix.md`.

## Procedure

1. **Scope the niche.** From the normalized brief, write down: theme direction(s) under
   consideration, candidate archetype family/families, target market posture (mainstream /
   streamer-facing / casual), and any named jurisdictions. If the brief is AUTO, scope to
   the recommendation order in `research/14-mechanic-compatibility-matrix.md` §2 (C1–C4)
   plus one theme cluster from `research/12-market-patterns-ip.md` §4. Log every choice as
   an assumption in `docs/assumption-log.md`.
2. **Split dossier-reuse from run-time research.** The dossier is authoritative baseline
   for: archetype math and evaluation algorithms (research/01), mechanic behaviour and
   tier norms (research/02), market math norms and IP register (research/12, /16),
   compatibility verdicts (research/14). Do NOT re-verify these. Run-time research
   (WebSearch/WebFetch) is required ONLY for:
   a. the selected theme/mechanic niche — comparable titles released in the last
      12 months, their public aggregate stats, and presentation patterns;
   b. any dossier claim that is load-bearing for THIS game and is dated more than
      12 months before today (dossier files carry generation dates in their headers);
   c. anything the brief names that the dossier does not cover (a specific theme,
      market, or mechanic niche).
3. **Handle missing web tools.** If WebSearch/WebFetch are unavailable, proceed on the
   dossier alone: the dossier's own source registers supply the dated sources; record the
   limitation in `docs/assumption-log.md` and in `docs/known-limitations.md`.
4. **Build the competitor-pattern matrix.** Pick 5–10 comparable titles in the chosen
   niche (from run-time research plus `research/12` §2–§3). One row per title with ONLY
   aggregate public stats: studio, year, grid/archetype, primary mechanic family
   (generic vocabulary only), RTP, volatility label, hit frequency, max win, bonus-buy
   price if public, and the presentation pattern it exemplifies. NEVER record or seek
   competitor reel strips, symbol weights, or exact paytables — clean-room rule,
   `research/16` §4.2 (Aristocrat v. L&W precedent).
5. **Write the originality review.** For each pattern the game is likely to use, state:
   what the market convention is, which parts are generic (safe to use under original
   names), and what THIS game must do differently to be distinct (trade-dress distance
   from the named studio identities in `research/16` §6.4). Conclude with 3–5 explicit
   differentiation requirements the concept step must satisfy.
6. **Seed the IP-risk list.** Copy from `research/16` §3 every register row whose
   mechanic family the niche could plausibly use, keeping the risk level, safe generic
   alternative, and legal-review flag columns. Always include: the §3.2 lint blocklist
   verbatim, the BTG variable-height US-patent auto-flag, and the add-a-reel
   trade-dress flag. Add any NEW protected names discovered during run-time research
   (default rule: any capitalised mechanic brand from another studio is presumed
   trademarked).
7. **List design opportunities.** ≥ 3 concrete, sourced gaps in the niche (mechanic
   combinations unexploited per `research/14` §2, theme × archetype pairings with no
   strong incumbent, presentation ideas from adjacent genres). Each opportunity cites a
   source-register entry or dossier section.
8. **List patterns-not-to-copy.** Concrete, checkable items: blocked names (from §3.2),
   named trade dress to keep distance from, exact-math cloning ban, franchise theming
   to avoid, plus anything niche-specific found at run time. This list is a direct
   input to the concept step and to the step-13 lint.
9. **Fill the source register.** ≥ 8 sources, each with: id, title, publisher, type,
   publication/revision date, URL (or dossier path for reused dossier sources), access
   date, and the exact claim(s) it supports. Reused dossier sources are cited as
   `research/<file> <source-id>` with the dossier's date. At least 2 sources must be
   run-time (current) when web tools are available. Never invent sources.
10. **Log the step.** One dated `docs/decision-log.md` entry: niche chosen, what was
    reused vs re-verified, key findings, and the differentiation requirements handed to
    step 3. Update `games/<slug>/artifact-manifest.json` with every file written.

## Outputs

All under `games/<slug>/` (CONVENTIONS §3):

- `docs/research-addendum.md` — the run's research dossier section, with a CONVENTIONS
  §10 metadata block and these headings: `## Niche & scope`, `## Competitor-pattern
  matrix`, `## Originality review`, `## Design opportunities`,
  `## Patterns not to copy`, `## Jurisdiction notes` (if applicable).
- `docs/source-register.md` — the ≥ 8-entry dated register (step 9 columns).
- `docs/risk-register.md` — IP-risk entries seeded per step 6 (append; do not overwrite
  orchestrator entries), each with likelihood/impact/mitigation/owner.
- `docs/assumption-log.md` — appended entries from steps 1 and 3.
- `docs/decision-log.md` — appended step-2 entry.
- `artifact-manifest.json` — updated (validates against
  `schemas/asset-manifest.schema.json`; start from `templates/artifact-manifest.json`).

## Gate checklist — G2 (all must pass before step 3)

- [ ] `docs/source-register.md` exists and has **≥ 8 sources, every one carrying a
      publication/revision date and an access date**. FAIL if any entry lacks a date or
      cannot be traced to a real dossier source or fetched URL.
- [ ] **IP-risk list present** in `docs/risk-register.md`: contains the §3.2 blocklist
      verbatim, at least every `research/16` §3 row relevant to the niche, and the two
      auto-flags (BTG US patent; add-a-reel trade dress). FAIL if the register was not
      seeded from `research/16-ip-risk-register.md` (or its documented fallback).
- [ ] **Patterns-not-to-copy list present** in `docs/research-addendum.md`, non-empty,
      and every item is concrete enough to grep or visually check at step 13.
- [ ] Competitor-pattern matrix has 5–10 rows, aggregate stats only — FAIL if any row
      contains reel-strip, symbol-weight, or per-symbol paytable data.
- [ ] Originality review ends with 3–5 explicit differentiation requirements.
- [ ] ≥ 3 sourced design opportunities.
- [ ] Every load-bearing claim older than 12 months was either re-verified at run time
      or explicitly accepted with a dated note in `docs/assumption-log.md`.
- [ ] All outputs are lint-clean against the §3.2 blocklist outside of clearly marked
      research/reference context (nominative use in the matrix is allowed; game-facing
      suggestions are not).

## Failure handling

- A failed checklist item: fix the artifact and re-run the checklist. Maximum 3
  attempts for the gate as a whole; after the third failure, record FAILED-GATE G2 with
  the failing items and evidence in `docs/validation-report.md` (start it from
  `templates/validation-report.md` if it does not exist yet) and stop the run honestly
  (SKILL.md execution model).
- Fewer than 8 usable dated sources and no web tools: exhaust the dossier source
  registers first (they contain far more than 8 dated sources); only fail if even those
  cannot support the niche.
- Never patch a failure by weakening a claim, inventing a source, or deleting a risk
  entry — fix the work or report the failure (SKILL.md honesty rules).
- If run-time research contradicts the dossier, prefer the newer primary source, record
  the conflict in `docs/research-addendum.md`, and flag the dossier file for
  maintenance in `docs/known-limitations.md`.
