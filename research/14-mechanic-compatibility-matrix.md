# Mechanic Compatibility Matrix

Generator: single-modern-slot-creator v1.0.0 · build job synth-matrix · date 2026-08-08 ·
scope: practical archetype × mechanic compatibility for concept-time validation, proven
market bundles, and per-combo complexity/certification impact scoring.

Derived from research/01-slot-archetypes.md (§2–§5, §7), research/02-mechanics-and-features.md
(§1–§8, D1–D8), and research/03-slot-math-and-simulation.md (§8–§10 math-method implications).
Source tags `[S#-01]` / `[S#-02]` resolve in the source registers of dossiers 01 and 02.
All studio/game names below are **market references only** — never copy names, art,
paytables, strips, or trademarked mechanic names (CONVENTIONS §9.10; research/12 IP register).

How to use this file: the concept agent MUST check every proposed archetype+mechanic pair
against §1 and reject any AVOID pairing at concept time (per 01 §5 and D1 of dossier 02).
The strategist uses §2 to pick a coherent bundle; the orchestrator uses §3 to budget the run.

---

## 1. Archetype × mechanic-family matrix

Rows = the 22 archetypes of 01 §3 (same numbering). Columns = the 8 major mechanic
families. Cell values:

- **GOOD** — proven pairing; default-safe; the combination has shipped at scale.
- **OK** — workable with care; carries a design or certification caveat (see column notes
  in §1.1 and the per-row remarks).
- **AVOID** — rejected at concept time; every AVOID has a numbered footnote `⁽ⁿ⁾` in §1.2.

"Wilds" covers the §1-of-02 taxonomy (standard/stacked/expanding/sticky/walking/multiplier/
collected). "Bonus tiers" = the mandatory 3/4/5-scatter `feature`/`super_feature`/
`ultimate_feature` hierarchy (CONVENTIONS §4.1). "Jackpots" = fixed 4-tier by default;
progressive only via hooks (01 §4.7).

| # | Archetype | Wilds | Cascades | Multipliers | Hold&Respin | Collection | Expanding grid | Bonus tiers | Jackpots |
|---|-----------|-------|----------|-------------|-------------|------------|----------------|-------------|----------|
| 1 | 3-reel classic | GOOD | AVOID⁽¹⁾ | OK | GOOD | OK | AVOID⁽²⁾ | OK | GOOD |
| 2 | 5-reel video (lines) | GOOD | GOOD | GOOD | GOOD | GOOD | OK | GOOD | GOOD |
| 3 | Fixed-payline | GOOD | GOOD | GOOD | GOOD | OK | OK | GOOD | GOOD |
| 4 | Multi-payline | GOOD | GOOD | GOOD | GOOD | GOOD | OK | GOOD | GOOD |
| 5 | Fixed ways (243/1024) | GOOD | GOOD | GOOD | GOOD | GOOD | GOOD | GOOD | GOOD |
| 6 | All-ways / both-ways | GOOD | OK | OK | GOOD | GOOD | OK | GOOD | GOOD |
| 7 | Adjacent-pays | GOOD | GOOD | GOOD | GOOD | GOOD | OK | GOOD | GOOD |
| 8 | Variable-reel-height ways | GOOD | GOOD | GOOD | OK | GOOD | OK | GOOD | OK |
| 9 | Variable-ways (grow-on-win) | OK | GOOD | GOOD | AVOID⁽³⁾ | OK | GOOD | GOOD | OK |
| 10 | Cluster-pays | GOOD | GOOD | GOOD | OK | GOOD | GOOD | GOOD | GOOD |
| 11 | Grid slots (7×7-class) | GOOD | GOOD | GOOD | OK | GOOD | OK | GOOD | GOOD |
| 12 | Cascading/tumbling (as identity) | OK | GOOD | GOOD | OK | GOOD | OK | GOOD | OK |
| 13 | Expanding-grid | OK | GOOD | GOOD | GOOD | GOOD | GOOD | GOOD | OK |
| 14 | Hold-and-respin (as base) | AVOID⁽⁴⁾ | AVOID⁽⁵⁾ | OK | GOOD | GOOD | GOOD | OK | GOOD |
| 15 | Cash-on-reels | OK | OK | GOOD | GOOD | GOOD | OK | OK | GOOD |
| 16 | Multi-board | GOOD | OK | GOOD | OK | OK | AVOID⁽⁶⁾ | OK | OK |
| 17 | Dual-grid (shared reel) | GOOD | OK | OK | OK | OK | AVOID⁽⁷⁾ | OK | OK |
| 18 | Multi-reel-set (switching) | GOOD | GOOD | GOOD | GOOD | GOOD | OK | GOOD | GOOD |
| 19 | Collection/progression | GOOD | GOOD | GOOD | OK | GOOD | OK | GOOD | OK |
| 20 | Fixed-jackpot | GOOD | OK | GOOD | GOOD | GOOD | OK | GOOD | GOOD |
| 21 | Progressive-compatible | GOOD | OK | OK | GOOD | OK | OK | OK | GOOD |
| 22 | Hybrid (composed) | inherits strictest cell of every composed base row — see §1.3 | | | | | | | |

### 1.1 Column-level caveats behind the OK cells

- **Wilds**: in cascade/cluster archetypes (rows 9–12), wild refill rules and cluster
  multi-membership must be declared explicitly or labs flag ambiguity [01 §4.4]. In
  cash-on-reels (15), wilds only act in the pay-symbol layer, never on cash values.
- **Cascades**: on both-ways (6) cascades double the re-evaluation directions per refill —
  cap and profile presentation time against the GB ≥2.5 s cycle [02 §0]. On multi-board (16)
  cascades run ×N boards — perf-budget and pacing review. On progressive-compatible (21)
  cascades force trigger-frequency estimation by simulation, inflating the GLI-12 evidence
  package [03 §8].
- **Multipliers**: hard rule 3 of 01 §5 — never uncapped multiplier × uncapped ways ×
  cascades; at least two of the three capped. Both-ways (6) already ~doubles hit frequency,
  so multiplier budgets halve. Declare additive vs multiplicative once, in one shared
  function [02 §4].
- **Hold&Respin (as add-on bonus)**: variable-structure archetypes (8, 9) must freeze
  structure during the respin phase; cluster/grid (10, 11) should convert to grid-coin
  respins rather than lock pay symbols [01 §5].
- **Collection**: meters must be displayed continuously (RTS 3B) and restored on recovery
  (RTS 10B); per-session persistence raises certification scrutiny — prefer per-round or
  per-feature scope [02 §2]. On progressive-compatible (21) persistent meters + external
  jackpot meters double the state-audit surface.
- **Expanding grid**: obeys the one-growth-mechanic rule (01 §5 rule 2) and the mobile
  ceiling — ≤ 8 columns, ≤ 9 expanded rows, cells ≥ 44 px at 390 px viewport [01 impl. §10].
  On line archetypes (2–4) every grid size needs its own line/ways table in the PAR sheet
  [02 §3].
- **Bonus tiers**: mandatory in every generated game; on 3-reel classic (1) and
  hold-and-respin-base (14) tiers differentiate by entry seeding (extra starting coins,
  opened rows) rather than free-spin counts — still must pass the insufficient-
  differentiation linter [02 D3].
- **Jackpots**: fixed tiers are paytable entries (no GLI-12); the advertised-top-award
  1-in-50M rule applies wherever the grand is the advertised max [01 §4.7]. OK cells on
  rows 8, 9, 12, 13 reflect simulation-only tail evidence: proving grand frequency under
  variable structure needs rare-event methods or lookup-table exactness [03 §8].

### 1.2 Footnotes — every AVOID explained

1. **3-reel classic × cascades** — cascade refills break the archetype's mental model
   (one strip window per spin) and its retro pacing identity; 01 §5 marks this pairing ✘
   ("fights retro feel"). A cascading 3×3 stops reading as a classic and loses the
   segment's audience without gaining the cascade segment's depth.
2. **3-reel classic × expanding grid** — the fixed 3×3 (or 3×1-line) shape *is* the
   archetype; growth converts it into a grid/expanding game with worse math headroom than
   starting from archetype 13. Also collides with the classic's 1–5 line paytable, which
   has no defined evaluation on added rows.
3. **Variable-ways grow-on-win × hold-and-respin** — grow-on-win reel heights are
   path-dependent within the spin [01 §3 row 9]; a lock-and-respin phase requires a frozen
   cell topology for the locked set. Freezing mid-growth either discards accumulated
   structure (bad UX, disputed recoveries) or forces a combined growth × lock state machine
   whose recovery matrix and termination proof explode [02 §9]. Run the respin bonus on a
   separate fixed-shape grid if the brief insists.
4. **Hold-and-respin base × wilds** — hold grids contain `CASH`/`BLANK` (+ jackpot)
   symbols only (CONVENTIONS §4.2); there is no pay-symbol substitution for a wild to
   perform, so a wild is dead weight and confuses the rules document. Put wilds in the
   *triggering base game* layer instead — that pairing is GOOD (see row of the base
   archetype used).
5. **Hold-and-respin base × cascades** — the respin counter *is* the game loop
   (lock → reset-to-3 → absorb); adding a removal/refill loop creates two interleaved
   loops, two termination proofs, and pacing that can't fit the GB cycle rules. 01 §5
   marks it ✘ ("respins ARE the loop").
6. **Multi-board × expanding grid** — board merging is already this archetype's growth
   mechanic; adding row/reel expansion violates hard rule 2 of 01 §5 ("never combine two
   grid-growth mechanics"). Joint enumeration of merged AND expanded states is intractable
   and the 2×2-tiled portrait layout has no headroom below the 44 px cell floor.
7. **Dual-grid × expanding grid** — the shared center reel fixes the two grids' relative
   geometry; growing either grid breaks the shared-column mapping and pushes total cell
   count past the ~64-cell readability ceiling [01 §4.6]. No shipped precedent found in
   dossiers 01/02.

### 1.3 Hybrid row (archetype 22)

A hybrid's cell for any mechanic = the **strictest** value among all composed base rows,
plus the four binding constraints of 01 §4.8: one positional-evaluation family at a time
(sequential base→bonus handoff is fine), one growth mechanic, capped multiplier stacking
(≤ 2 extreme-volatility levers total per 02 D1), and a provable termination bound. Any
AVOID inherited from a component is a concept-time rejection.

---

## 2. Proven combos — coherent archetype+mechanic bundles

12 bundles the skill can generate with confidence. Market references prove the *pattern*;
math figures are review-site/vendor figures from dossiers 01/02 (treat as ±, re-derive by
simulation). Volatility labels use the skill's measured bands (per-spin SD of payX: low <3,
med 3–8, high 8–15, very high >15) [01 impl. §7]; hit-freq and max-win are the referenced
titles' published order of magnitude.

| # | Bundle (archetype + mechanics) | Market proof (reference only) | Typical math profile |
|---|-------------------------------|-------------------------------|----------------------|
| C1 | Scatter-pays 6×5 + cascades + per-symbol summed multiplier persisting in free spins + 4/5/6-scatter tiers | Pragmatic Sweet Bonanza / Gates of Olympus family [S28-01][S9-02] | very high vol · hit ~25–30% · max 5,000–50,000x · RTP 96.5 flagship, multi-build |
| C2 | Lines 5×3 base + hold&respin bonus + cash symbols + 4-tier fixed jackpots (grand on fill) | Playson Energy Joker; BGaming Hold&Win class [S14-02][S12-02] | med–high vol · hit ~25–33% · max 2,000–5,000x · feature carries most RTP |
| C3 | Cluster 7×7 + cascades + symbol-collection meter releasing a mega-wild | Play'n GO Reactoonz [S29-02] | high vol · hit ~20–25% · max ~4,570x · RTP 96.5 |
| C4 | Variable-height ways + cascades + capped accumulating free-spin multiplier | BTG Bonanza pattern (licensed engine — concept only) [S6-01] | very high vol · hit ~20–25% · max 10,000–26,000x |
| C5 | Scatter-pays base + hold&respin bonus with collector/payer/persistent modifiers + row unlock | Relax Money Train 4 [S29-01][S23-02] | very high vol (extreme tail) · hit ~20% · max 150,000x (skill cap: 10,000x default) |
| C6 | Lines 5×3 + sticky-wild free spins (feature-only wilds, multiplicative when stacked) | NetEnt Dead or Alive 2 [S36-02] | very high vol · hit <20% · max ~111,111x (cap per brief) · RTP 96.8 |
| C7 | Both-ways lines 5×3 + multiplier wild reels + wild-triggered respins, no scatter bonus | NetEnt Starburst / Starburst XXXtreme [S25-01][S36-02] | low–med vol · hit ~25–35% · max 500x (200,000x in XXXtreme variant) — casual-market fit |
| C8 | Lines 5×3 + expanding-wild-symbol free spins (symbol chosen at feature entry) | Play'n GO Book of Dead lineage [S4s-02] | high vol · hit ~20–25% · max ~5,000x · RTP ~96.2 |
| C9 | Ways/adjacent base + cascades + additive step multiplier ladder (1/2/3/5; ×3 in feature) | NetEnt Gonzo's Quest avalanche pattern [S11-02] | med vol · hit ~25–30% · max ~2,500x — the gentlest cascade package |
| C10 | Expanding-grid coin respins + tiered scatter entry (3/4/5/6 ⇒ 2/3/4/4 rows + guarantee) + collection enhancers | Nolimit Fire in the Hole 3 [S22-02] | very high vol · hit <20% · max ~70,000x · equal-RTP buy tiers, vol rises by tier |
| C11 | Grow-on-win variable ways + cascade-coupled multiplier + free spins retaining grown reels | AvatarUX PopWins class (branded mechanic — concept only) [S19-01] | high vol · hit ~20–25% · max ~10,000–20,000x |
| C12 | Three materially-different bonus tiers as distinct state machines (sticky-wild spins / dueling multiplier wilds / two-phase collection) over a lines base | Hacksaw Wanted Dead or a Wild [S28-02] | very high vol · hit ~20% · max 12,500x · per-tier RTP 96.27/96.33/96.43 — the tier-differentiation gold standard |

Recommendation order for a 2026 AUTO brief: C1, C2, C3, C4 — matching the 2024–2026
top-performer distribution [01 impl. §14]. C7/C9 are the low-volatility/casual fallbacks;
C5/C10/C12 only for explicit high-complexity briefs.

---

## 3. Complexity / certification impact per combo

Sub-scores 1 (trivial) – 5 (extreme) on the four cost axes; **Overall** = certification-
weighted judgment, not an average (math and recovery dominate lab effort [02 §9]).

- **Math** — enumerability, simulation size, rare-event/tail evidence burden [03 §8–§10].
- **State machine** — extra states, loops, termination proofs, tier separation.
- **Animation** — presentation systems beyond the base spin loop (incl. reduced-motion +
  GB pacing variants).
- **Recovery** — cross-spin state to serialize/restore; size of the kill/reload test matrix.

| # | Bundle | Math | State machine | Animation | Recovery | Overall | Dominant cost driver |
|---|--------|-----:|--------------:|----------:|---------:|--------:|----------------------|
| C1 | Scatter+cascade+summed mult | 4 | 3 | 3 | 3 | **4** | sim-only math (cascade chains + persistent feature multiplier); tier decomposition |
| C2 | Lines + hold&respin + jackpots | 2 | 3 | 3 | 3 | **3** | respin Markov chain is exact; jackpot award ordering + mid-respin recovery |
| C3 | Cluster + cascade + meter | 4 | 4 | 4 | 4 | **4** | percolation math is sim-only; meter display/restore obligations (RTS 3B/10B) |
| C4 | Variable-height + cascade + mult | 5 | 4 | 4 | 4 | **5** | 46k+ structure states × cascades; structure must be restored on recovery; IP review |
| C5 | Scatter base + persistent-modifier respins | 5 | 5 | 4 | 5 | **5** | path-dependent collectors/payers: largest sim + largest recovery matrix in the set |
| C6 | Lines + sticky-wild FS | 2 | 2 | 2 | 3 | **2** | snowball math is a small conditional chain; sticky map must survive reconnect |
| C7 | Both-ways + mult-wild respins | 2 | 2 | 2 | 2 | **2** | exact enumeration end-to-end; only the both-ways pay-once rule needs documenting |
| C8 | Lines + expanding-wild FS | 1 | 2 | 2 | 2 | **2** | fully enumerable; one expansion-order rule to declare; cheapest "modern-feeling" combo |
| C9 | Ways + cascade + additive ladder | 3 | 3 | 3 | 2 | **3** | cascade termination cap + ladder state; ladder is additive so PAR stays tractable |
| C10 | Expanding respins + tiered entry + enhancers | 4 | 5 | 4 | 5 | **5** | per-tier grid sizes = separate evaluation contexts; cell-mask + enhancer recovery |
| C11 | Grow-on-win + cascade mult | 4 | 4 | 4 | 4 | **4** | path-dependent growth is sim-only; dynamic layout animation; grown-state recovery |
| C12 | Three distinct bonus state machines | 4 | 5 | 4 | 4 | **4** | three separate sim blocks + three recovery matrices; per-tier RTP equalization gate |

Scoring rules the orchestrator should apply when a brief deviates from these bundles:

1. Start from the nearest bundle's sub-scores; +1 Math if any mechanic makes closed-form
   trigger math invalid (`countCascadedScatters`, persistent modifiers, variable structure)
   [02 D4; 03 §8]; +1 Recovery per additional cross-spin state family (sticky map, meter,
   cell mask, locked set, ladder) [02 D6].
2. Overall ≥ 4 mandates: release-grade simulation sizing from the 03 §10 table (σ≈10 →
   ~700M rounds at ±0.1% @99%) or discrete-outcome exact computation; per-tier conditional
   sampling ≥ 10⁴ ultimate-tier entries; rare-event method for max-win odds.
3. Overall 5 combos should not be attempted in AUTO mode — require an explicit brief
   acknowledging the build/verification budget, and cap at ONE Overall-5 lever per game
   (mirrors D1's ≤ 2 extreme-volatility levers rule).

---

## Uncertainties

1. Per-title math figures in §2 are review-site/vendor numbers inherited from dossiers
   01/02 (flagged ± there); they anchor the *pattern*, not the generated game's targets.
2. C4 and C11 sit behind the unresolved variable-height/grow-on-win patent-scope question
   (01 uncertainty 3; 02 uncertainty 5) — IP review before any commercial use; skill
   output must use neutral ids (`variable_height_ways`, `grow_on_win`).
3. The AVOID set is the conservative closure of 01 §5's ✘ cells plus rule-derived
   rejections (footnotes 3, 6, 7 rest on the one-growth-mechanic rule and readability
   floors, not on observed market failures). A future dossier may downgrade 3/6/7 to OK
   if a shipped counter-example with clean certification evidence is found.
4. Sub-scores in §3 are analyst judgment [inferred] grounded in the certification-
   complexity ladder of 02 §9; they are budgeting heuristics, not lab quotes.
