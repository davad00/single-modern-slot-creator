# Modern Slot Archetypes

Generator: single-modern-slot-creator v1.0.0 · research job research-01 · date 2026-08-08 ·
scope: win evaluation, symbol generation, math complexity, volatility, mobile layout,
animation/state-machine needs, feature combos, implementation risks, certification,
enumeration-vs-simulation practicality, for the 22 archetypes in prompt.txt §1.

Tag legend: [mandatory] = regulatory/standards requirement · [recommended] = strong industry
norm the skill should default to · [observed] = documented market practice · [inferred] =
reasoned from verified facts but not directly sourced.

## Findings

### 1. Grid, reel-strip, and symbol-generation fundamentals

- Grid-size norms [observed]: 3×3 (classic), 5×3 (legacy video default), 5×4 (modern video
  default), 6×4 (ways games), 6×5 (scatter-pays default — Sweet Bonanza, Duck Hunters,
  Money Train respins), 7×7 / 6×7 / 8×8 (cluster grids — Reactoonz-class), 2–7 rows per reel
  ×6 reels (Megaways-class variable height), 4×4 quads ×4 boards (multi-board), expanding
  up to 5×9 (PopWins-class) or 8×8 merged (Megaquads). [S6][S13][S14][S18][S20][S21]
- Reel-strip length norms [observed]: video-slot strips typically run 30–100 positions per
  reel; 32 or 64 stops are common for RNG/math convenience (powers of 2); strips may differ
  per reel; classic mechanical baseline was ~22–32 stops with virtual-reel weighting
  (Telnaes-style) [S23][S24]. Strip length is tuned UP as wilds, stacks, and prize sizes
  increase, to hold target RTP and hit rate [S23]. In video slots, weighting is achieved by
  symbol frequency ON the strip (each stop equally likely), not by weighted stop maps, which
  are a mechanical-reel technique [S23].
- Symbol generation models [observed]:
  1. **Strip-stop model** — RNG picks one stop index per reel on a cyclic strip; the window
     of `rows` symbols is read off. Deterministic, enumerable, the PAR-sheet standard.
     Used by lines, ways, adjacent-pays, most hold-and-respin base games. [S10][S22][S24]
  2. **Independent-cell / weighted-tile model** — each cell (or each falling tile in a
     cascade refill) drawn independently from a weighted distribution, sometimes with
     context rules (no immediate duplicates, cluster seeding). Used by cluster, scatter-pays,
     grid games; makes exact enumeration much harder once cascades chain. [S13][S21]
  3. **Two-stage model** — stage 1 draws structure (reel heights for Megaways, Gigablox
     block sizes, Splitz split counts, active boards), stage 2 draws symbols conditioned on
     structure. Enumeration must sum over all structures. [S6][S18][S19]
  4. **Pre-simulated outcome pool** — the Stake Engine model: outcomes are simulated
     offline into "books" + a lookup table (columns: simulation id, weight, payout), then an
     optimizer re-weights entries to hit target RTP/volatility; the RGS draws a weighted
     book at spin time [S10][S11]. This converts ANY archetype into an enumerable discrete
     distribution — an important practicality lever the skill should know about.
- Occupancy/space note [inferred]: a 5×3 game with 64-stop strips has 64^5 ≈ 1.07×10^9
  stop combinations — fully enumerable by machine in minutes; a 6×5 independent-cell
  scatter-pays game with 10 symbol types has 10^30 raw grids before cascades — enumerable
  only analytically per-component, in practice simulated. [S10][S22]

### 2. Win-evaluation algorithms and combinatorics

#### 2.1 Lines (fixed and multi-payline)

```
for each payline p (list of one row index per reel):
    seq = [grid[reel][p[reel]] for reel in 0..R-1]
    for each candidate symbol s in {seq[0] resolved through WILD}:
        n = length of maximal prefix where seq[i] == s or seq[i] == WILD
        payCandidates += pay(s, n)
    linePay = max(payCandidates, pay(WILD, wildPrefixLen))   # best-of rule
totalWin = Σ linePays  (+ scatter pays evaluated separately, position-free)
```
- Complexity O(L·R) per spin; trivially exact. Wild ambiguity (wild-led lines) is resolved
  by paying the HIGHEST of all valid interpretations, never both [recommended; standard
  practice, S24 PAR-sheet walkthroughs]. Combinatorics: P(exact n of symbol s on line) =
  Π_{i<n} p_i(s∪WILD) × (1 − p_n(s∪WILD)), summed over lines; per-reel probabilities come
  straight off strip counts, so full PAR-sheet enumeration is standard. [S22][S24]
- Line-count norms [observed]: 1–5 (classic), 9/10/20/25 (5×3), 40/50 (5×4), 243+ ways
  replaces lines beyond that. 10–25 lines dominate the fixed-line segment. [S22][S24]
- **Both-ways / win-both-ways variant** (Starburst): evaluate every line left→right AND
  right→left; pay only the higher direction per line, not both [observed, S25]. Effectively
  doubles winning configurations and raises hit frequency, so per-combination pays must be
  cut roughly in half versus one-way to hold RTP [inferred from S25 math].

#### 2.2 Ways / all-ways (243, 1024, adjacent-pays)

```
for each paying symbol s:
    counts[i] = number of cells on reel i showing s or WILD
    n = length of maximal prefix with counts[i] > 0     # from leftmost reel
    if n >= minMatch(s): win += pay(s, n) × Π_{i<n} counts[i]
# wild-as-own-symbol: also evaluate WILD as s; pay max(s-interpretation, WILD-interpretation)
```
- Ways count = Π rows_i: 5×3 → 243; 5×4 → 1024; 6×4 → 4096; 6×5 → 15,625; Megaways 6×(2..7)
  → up to 7^6 = 117,649 [S6]. "Ways" is a per-spin multiplicity of one win, NOT independent
  bets; the count itself has no RTP meaning [S6][S22].
- Multi-instance multiplication (multiple copies of s on one reel multiply the win) is the
  defining property; IGT brands it MultiWay Xtra and applies it in both directions on
  Siberian Storm Dual Play [S27].
- Exact math: P-model is a product over reels of per-reel count distributions; enumeration
  over strip stops remains exact and practical for FIXED heights. [S22]
- **Adjacent-pays** [observed]: same product rule but the run may START on any reel, not
  only reel 1 (any n adjacent reels). Implement by scanning all maximal runs of non-empty
  counts; combinatorics adds a run-position sum — still exactly enumerable. [S27]
- **Variable-ways** (Megaways-class): stage-1 draw of per-reel height h_i (2–7, plus an
  extra horizontal tracker reel feeding symbols to reels 2–5), then ways evaluation as
  above. RTP = Σ over height vectors P(h) × RTP(h) — 6^... (7-2+1)^6 = 46,656 height
  combinations × per-height enumeration; exact math is possible but heavy, and with
  cascades essentially everyone simulates [S6][S22]. "Megaways" itself is a Big Time Gaming
  patented + trademarked mechanic (BTG owned by Evolution since 2021), licensed to studios
  (Pragmatic, Blueprint, Red Tiger, Relax etc.) — the skill must NOT use the name or clone
  the exact engine [mandatory — IP; S6].

#### 2.3 Cluster-pays

```
for each paying symbol s:
    mask = cells where grid == s or grid == WILD
    components = connected_components(mask, 4-connectivity)   # flood fill / union-find
    for c in components where |c| >= minCluster (typically 5):
        win += pay(s, clamp(|c|, table))     # size-banded paytable, e.g. 5,6,7,8,9+,15+,25+
# a WILD cell may belong to one cluster per symbol type (evaluated per-symbol, so it can
# count for several different symbols' clusters simultaneously) [observed norm]
```
- 4-connectivity (orthogonal adjacency) is the near-universal rule [S20][S21]. Flood-fill /
  BFS per symbol is O(cells) and sufficient on slot-sized grids; union-find two-pass CCL is
  the scalable alternative [S21].
- Min cluster 5 on 5×5–7×7 grids; pay bands rise steeply with size (curved, not linear) so
  a max-size cluster of a premium anchors the max win [observed, S20].
- Combinatorics: cluster-size distributions on random grids are a site-percolation problem
  with no closed form on finite grids — exact math requires transfer-matrix enumeration per
  column (feasible for ≤5 rows [inferred]) or, in practice, simulation [S13][S22].
- Almost always paired with cascades; NetEnt (Aloha! Cluster Pays), Play'n GO (Reactoonz
  7×7), Pragmatic (Sugar Rush) are the canonical implementations [S20][S21].

#### 2.4 Scatter-pays / pay-anywhere

```
for each paying symbol s:
    k = count of s anywhere on grid (+ WILD if the game has wilds; Sweet Bonanza has none)
    if k >= threshold (8 on 6×5=30 cells): win += pay(s, band(k))   # bands 8-9, 10-11, 12+
```
- Threshold norm: 8+ of a kind on a 6×5 (30-cell) grid, pay bands 8–9 / 10–11 / 12–30;
  Sweet Bonanza pays lows 0.25–10x and premiums 1.5–50x per band and ships in four RTP
  builds (96.51 / 95.49 / 94.50 / 85.02%) [S28]. Money Train 4 uses scatter-pays with
  fixed per-symbol fill pays 0.4x–1,000x [S29].
- Combinatorics: with independent weighted cells, k ~ Binomial(30, p_s) per symbol —
  P(k≥8) = Σ_{k=8}^{30} C(30,k) p^k (1−p)^{30−k}; with reel strips it is a product of
  per-reel count PGFs (polynomial multiplication — exact and cheap) [inferred, standard
  probability]. The chained-cascade + accumulating-multiplier layer is what pushes real
  titles to simulation [S22][S30].
- No positional logic at all → cheapest evaluation of the four families; also the reason it
  pairs so well with tumbles (any refill can complete a count) [S28][S30].

#### 2.5 Hold-and-respin / cash-on-reels

- Trigger: ≥6 coin/cash symbols (typical on 5×3: 6 of 15 cells) locks them, awards 3
  respins; each new coin locks and RESETS the counter to 3; ends at 0 respins or full grid;
  full grid usually awards a grand jackpot [S15][S16]. Money-Cart-class bonuses add
  collector/payer/persistent modifier symbols and row unlocking (6×4 → 6×8) [S29].
- Evaluation is a sum of locked cash values × multipliers at round end, plus fixed jackpots
  for fill/special symbols — arithmetic, not pattern matching.
- Math: the respin phase is a Markov chain on state (set of locked cells or just count,
  respins left); with per-cell independent landing probabilities the chain is exactly
  solvable (state space ≤ cells × 3) [inferred; standard absorbing-Markov analysis]. Value
  distribution ON the coins adds a convolution layer; persistent collectors/payers make the
  value process path-dependent, which is when studios simulate [S29][S22].
- Market status: the single most widespread bonus mechanic globally — at least 3 of the top
  10 slots in AU / Tier-1 / Tier-2 / LATAM / Africa lists carry Hold & Win as primary or
  secondary feature; the mechanic is 15+ years old and still dominant in 2025 [S15][S16].

### 3. The 22 archetypes — master table

Evaluation family, symbol generation, math complexity (1=trivial..5=extreme), typical
volatility posture, and the enumeration/simulation verdict. Details and the remaining
attributes per group follow in §4. All rows [observed] unless noted.

| # | Archetype | Win evaluation | Symbol gen | Math cx | Typical volatility | Exact enum practical? | Sim normally required? |
|---|-----------|----------------|-----------|---------|--------------------|----------------------|------------------------|
| 1 | 3-reel classic | 1–5 lines | strip-stop | 1 | low–med (or very high w/ jackpot top prize) | Yes — trivial | No (verification only) |
| 2 | 5-reel video | 9–50 lines or 243+ ways | strip-stop | 2 | med | Yes | Recommended cross-check |
| 3 | Fixed-payline | lines §2.1 | strip-stop | 1–2 | low–med | Yes | No |
| 4 | Multi-payline (selectable/many) | lines §2.1 ×L | strip-stop | 2 | med | Yes | No |
| 5 | Fixed ways-to-win (243/1024) | ways §2.2 | strip-stop | 2 | med | Yes | Recommended |
| 6 | All-ways (win both ways incl.) | ways both directions | strip-stop | 2–3 | low–med (high hit freq) | Yes | Recommended |
| 7 | Adjacent-pays | any-start runs §2.2 | strip-stop | 2–3 | low–med | Yes | Recommended |
| 8 | Variable-reel-height (Megaways-class) | ways over drawn heights | two-stage | 4 | high–very high | Possible, heavy | Yes |
| 9 | Variable-ways (PopWins/Splitz-class) | ways over EXPANDING heights | two-stage + growth loop | 4–5 | high | No (growth is path-dependent) | Yes |
| 10 | Cluster-pays | CCL §2.3 | independent-cell | 3–4 | med–high | Only via transfer-matrix; rarely done | Yes |
| 11 | Grid slots (7×7-class) | cluster or scatter on big grid | independent-cell | 3–4 | med–high | No | Yes |
| 12 | Cascading/tumbling | any family, looped | refill draws | +1 to base | raises vol of base | Only for 1–2 cascade depth analytically | Yes |
| 13 | Expanding-grid | cluster/ways + growth rule | two-stage + growth | 4–5 | high | No | Yes |
| 14 | Hold-and-respin | locked-cash accumulation | strip-stop + Markov respins | 3 | med–high | Yes (Markov) if values simple | Yes when modifiers persistent |
| 15 | Cash-on-reels | cash values summed on trigger | value-weighted tiles | 2–3 | med | Yes (convolutions) | Recommended |
| 16 | Multi-board | same eval ×N boards | strip-stop ×N | 3 | med–high | Yes (independence) until boards merge | Yes if merging/shared state |
| 17 | Dual-grid (shared reel) | ways across 2 grids + shared reel | strip-stop, shared column | 3 | med | Yes | Recommended |
| 18 | Multi-reel-set (switching sets) | base family per set | per-set strips | 2–3 | varies by set | Yes (weighted mix over sets) | Recommended |
| 19 | Collection/progression | base family + persistent meters | base + meter state | 4 | med–high; RTP moves with state | No (long-run state) | Yes — long-run sim [mandatory for cert, S1] |
| 20 | Fixed-jackpot | base + fixed top awards | base | +0.5 | high tail | Yes | No extra |
| 21 | Progressive-compatible | base + contribution & trigger | base + external meter | 3–4 | extreme tail | Base yes; jackpot via GLI-12 analysis | Yes for trigger freq [S3] |
| 22 | Hybrid (compatible combos) | composed families | composed | 4–5 | usually high | Almost never | Yes |

### 4. Archetype detail — remaining attributes by group

The 12 required attributes: eval and symbol-gen are in §2–3; math complexity, volatility,
enum/sim verdicts in §3. Below: mobile layout, animation, state machine, feature combos,
risks, certification, per group — every archetype named.

#### 4.1 Line-family: 3-reel classic · 5-reel video · fixed-payline · multi-payline (1–4)

- Mobile [recommended]: 3×3 and 5×3 fit portrait easily; reels stack in the upper 60% of a
  portrait screen with spin/bet controls in the thumb zone; portrait-first is the 2025
  default and assets must be authored for vertical, not shrunk landscape [S31][S32].
- Animation: spin-start, per-reel stop with settle/bounce, win-line trace (draw the line
  polyline + symbol pulse), win count-up, anticipation slow-down on the last reel when 2
  scatters are lit. Minimal set — the cheapest archetype to animate [inferred; consistent
  with S33 FSM catalogs].
- State machine: idle → spin → stop(reel i) → evaluate → present wins → (feature?) → idle.
  Line games need no cascade/growth sub-states; matches CONVENTIONS §4.4 with the
  presenting_cascades state unused [S33].
- Common combos: wilds (static/expanding), scatter free spins, gamble/double-up (note
  GLI-11 requires gamble features to return exactly 100% [mandatory, S2]), fixed jackpots.
- Risks: wild-led line ambiguity (pay best, not both); LDW celebration on multi-line games
  (win < stake must present at ≤ `small` tier — UKGC RTS bans celebrating returns ≤ stake
  [mandatory UK, S7][S8][S9]); off-by-one on cyclic strip windows.
- Certification: simplest path; labs reproduce the PAR sheet exactly, so the math package
  must ship strips + paytable + line definitions and an exact-enumeration RTP that the lab
  can re-derive [mandatory, S2][S22].

#### 4.2 Ways-family: fixed ways · all-ways/both-ways · adjacent-pays (5–7)

- Mobile: same as 4.1; 6-reel ways games get cramped in portrait below ~360 px width —
  keep symbol art readable at ≤ 56 px cells [inferred from S31 sizing guidance].
- Animation: as 4.1 but win presentation highlights symbol SETS (all participating cells)
  rather than a line trace; show "ways won" counter. Both-ways games should visually
  indicate direction only when it disambiguates [inferred].
- State machine: identical to 4.1.
- Combos: multiplier wilds (multiplies stack multiplicatively across reels — cap it),
  stacked/mega symbols, free spins with symbol removal.
- Risks: double-counting wild interpretations (§2.2 max rule); ways×multiplier explosion
  breaking max-win cap — enforce `max_win_termination` [CONVENTIONS §9.4]; performance is
  a non-issue (evaluation is O(symbols×reels)).
- Certification: exact enumeration expected by labs for fixed-height ways; both-ways games
  must document the pay-once-per-line/higher-direction rule in game rules [mandatory
  disclosure norm, S2][S25].

#### 4.3 Variable-structure: variable-reel-height · variable-ways · expanding-grid (8, 9, 13)

- Mobile: variable heights need a viewport that rescales rows per reel per spin — reserve
  vertical head-room; expanding grids (PopWins to 5×9) must shrink cell size as rows grow;
  portrait handles growth better than landscape [observed S19; inferred sizing].
- Animation: reel-height reveal at spin start (Megaways-class), symbol pop/replace
  (PopWins: winners "pop" into 2 new symbols, reel grows) [S19], grid-merge transitions
  (Megaquads: two boards visually fuse) [S26]. Needs dynamic mask/layout animation, not
  just sprite swaps — the priciest presentation family.
- State machine: adds structure_draw before symbol reveal, and a grow/re-evaluate loop akin
  to cascades; recovery must restore CURRENT structure (heights/rows), not just symbols
  [inferred; consistent with S33 recovery guidance].
- Combos: nearly always cascades + progressive win multiplier; free spins with unlimited
  multiplier; max-ways buy.
- Risks: state-space explosion in testing (46k+ height vectors); RTP sensitivity to the
  height-draw distribution (a mis-weighted height table shifts RTP by whole points
  [inferred]); IP — Megaways name/engine is licensed BTG property, PopWins/Gigablox/Splitz
  are branded partner mechanics: reimplement the CONCEPT (random reel heights, grow-on-win,
  block symbols, split symbols) under original names only [mandatory IP, S6][S19].
- Certification: labs will demand simulation reports with convergence CIs at ≥10^8–10^9
  rounds release-grade [observed commercial practice, S22]; document max-win proof and
  cascade/growth termination bound [mandatory, GLI-11 no-unbounded-award principle S2].

#### 4.4 Cluster/grid/cascade: cluster-pays · grid slots · cascading (10, 11, 12)

- Mobile: 7×7 in portrait wants near-square cells ~44–52 px on a 390 px-wide viewport —
  fine; 8×8 is the practical ceiling for readability [inferred from S31/S32 touch-target
  guidance ≥44 px].
- Animation: win-cell highlight → remove (burst) → gravity collapse (per-column tween) →
  refill drop-in → re-evaluate loop; charge meters (Reactoonz-style quantum meter). The
  cascade loop must be time-boxed and skippable to honor presentation-mode equivalence
  [CONVENTIONS §9.2].
- State machine: presenting_wins → presenting_cascades ↔ evaluate loop with an explicit
  cascade counter and hard cap [mandatory: proven termination, CONVENTIONS §9.4]; each
  cascade is a `cascade` step in the outcome manifest.
- Combos: cascade multiplier ladder (+1x per cascade), symbol-collection meters, wild
  spawning on cluster centroid, free spins retaining the ladder.
- Risks: refill RNG must come from the committed outcome (server manifests list every
  refill — the client NEVER draws symbols) [mandatory, server-authoritative S33][S34];
  cluster/wild multi-membership rules must be specified or labs will flag ambiguity;
  cascade cap forgotten → unbounded liability.
- Certification: simulation-only math accepted by labs when accompanied by convergence
  evidence; deterministic replay (same seed → same cascade chain) is required for lab
  verification [observed, S22][S34 determinism note].

#### 4.5 Respins/cash: hold-and-respin · cash-on-reels (14, 15)

- Mobile: base grid unchanged; respin phase benefits from dimming non-locked cells;
  jackpot rail (MINI/MINOR/MAJOR/GRAND) along the top in portrait [observed norm, S15][S16].
- Animation: coin lock-in thunk, respin counter reset flash, per-coin value pop, collector
  sweep animations (Money-Cart-class: collector pulls values along visible paths) [S29];
  grand-fill celebration. Needs per-cell persistent value labels — text rendering budget.
- State machine: distinct respin sub-machine: respin_active(remaining, lockedSet) with
  reset-on-land transition; maps to `respin` steps in the manifest; recovery mid-respin
  must restore lockedSet + remaining count exactly [inferred from S33 recovery pattern].
- Combos: trigger from base coins; fixed jackpot on full grid; persistent modifiers
  (collector/payer/adjacent/persistent variants, arms-dealer/upgrader meta-modifiers)
  [S29]; bonus-buy at ~100x (regular) / ~500x (persistent-heavy) [observed pricing, S29].
- Risks: value-table drift (coin value distribution dominates RTP — tiny weight errors
  compound across resets); reset-counter exploits if trigger counting is done client-side
  (never); persistent-modifier interactions creating >max-win paths — cap and terminate.
- Certification: Markov analysis OR simulation both accepted; jackpot-on-fill frequencies
  must satisfy the GLI-11 rule that the highest advertised award occurs statistically at
  least once in 50,000,000 games [mandatory, S2].

#### 4.6 Multi-structure: multi-board · dual-grid · multi-reel-set (16, 17, 18)

- Mobile: four 4×4 boards tile 2×2 in portrait acceptably; dual-grid stacks vertically
  (Siberian Storm Dual Play's two diamonds + shared 10-high center reel) [S27]; keep total
  cell count ≤ ~64 for readability [inferred].
- Animation: synchronized multi-board spins; board-merge transitions (Megaquads rainbow
  wild fusing boards into 4×8, then 8×8 = 16,777,216 ways) [S26]; shared-reel emphasis.
- State machine: per-board evaluation fan-in; merged-board state flag; multi-reel-set games
  (different strips per mode/feature) just swap the active reel-set id — CONVENTIONS
  reel-sets.json already models this.
- Combos: per-symbol persistent multipliers (Megaquads), board-count purchase (Quattro
  spins sets independently at extra cost) [S26], shared free-spin triggers across boards
  (scatters on one board trigger both [S27]).
- Risks: independence assumptions — if boards are truly independent, total variance adds
  and math is a convolution (easy); the moment boards SHARE a reel or merge, joint
  enumeration is needed [inferred]; bet-splitting display (150 coins over 2 boards) must
  be crystal-clear to avoid stake-misrepresentation complaints [observed, S27].
- Certification: each board/reel-set's strips documented; merged-mode RTP separately
  reported (CONVENTIONS §9.3 tier-separation analog applies).

#### 4.7 Meta-math: collection/progression · fixed-jackpot · progressive-compatible (19, 20, 21)

- Mobile: persistent meters must survive to the HUD without covering reels; jackpot
  tickers top-center [observed norm].
- Animation: meter fill ticks, tier-up fanfares, jackpot-wheel or pick bonus for award.
- State machine: persistent per-player-or-per-game state OUTSIDE the round loop; the
  outcome manifest still owns any award (`jackpot_award` step); reconnection must re-sync
  meter state from server [mandatory server-authoritative].
- Collection/progression specifics: RTP is state-dependent (near-full meter plays are
  worth more), so labs require LONG-RUN simulated RTP including meter states, and some
  jurisdictions restrict persistent-state games or require disclosure that RTP varies with
  state [observed; jurisdiction-specific — legal review item]. No player-adaptive math is
  ever allowed [mandatory, CONVENTIONS §9.5; GLI determinism S34].
- Fixed-jackpot: just a very skewed paytable entry; obey the 1-in-50M advertised-top-award
  rule [mandatory, S2]; tail dominates variance — quote max-win odds in the par sheet.
- Progressive-compatible: contribution rate typically 1–3% standalone, up to 8–9% for
  wide-area pools [observed, S36]; displayed base RTP must exclude or clearly split the
  progressive contribution (96% advertised with 2% contribution → 94% base) [S36]; GLI-12
  v3.0 requires 99.99% meter accuracy, non-volatile meters, ceiling/overflow-pool handling,
  and secure controller access [mandatory, S3]; seed liability sits with whoever funds the
  reset (operator for local, provider for networked) [observed, S36]. In absence of another
  floor, GLI-12 applies GLI-11's 75% minimum to the combined game [mandatory, S3].
- This skill's scope note: single-game only — design the HOOKS (contribution field, meter
  API, jackpot_award step) but ship fixed jackpots by default [inferred from CONVENTIONS
  scope].

#### 4.8 Hybrids (22)

- 2024–2026's top grossers are nearly all hybrids: scatter-pays + tumble + accumulating
  free-spin multiplier (Sweet Bonanza-class, Gates-class); hold-and-respin + scatter-pays
  base (Money Train-class); cluster + cascade + meter (Reactoonz-class); variable-ways +
  cascade + unlimited multiplier (Bonanza-class) [S14][S15][S16][S28][S29][S30].
- Everything in §5's compatibility matrix applies; the binding constraints are: one
  positional-evaluation family at a time, one growth mechanic at a time, capped
  multiplier stacking, and a provable termination bound.
- Certification: simulation-only, largest sample sizes, feature-tier separation
  [CONVENTIONS §9.3]; labs increasingly ask for per-feature RTP decomposition [observed,
  S22 commercial-lab practice].

### 5. Mechanic compatibility matrix

Rows = base evaluation archetype; columns = add-on mechanic. ✔ = proven combination,
◐ = workable with care (noted), ✘ = avoid.

| Base \ Add-on | Cascade | Hold-respin bonus | Cash-on-reels | Progressive/fixed JP | Collection meter | Multiplier ladder | Expanding grid/rows | Multi-board | Both-ways | Bonus buy |
|---|---|---|---|---|---|---|---|---|---|---|
| Lines (3-reel) | ✘ (fights retro feel) | ✔ | ✔ | ✔ | ◐ | ✘ | ✘ | ◐ | ◐ | ◐ |
| Lines (5-reel) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ◐ (lines must be redefined per height) | ✔ | ✔ | ✔ |
| Fixed ways | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ (ways recount naturally) | ✔ | ✔ | ✔ |
| Variable-height ways | ✔ (canonical) | ◐ (structure freeze during respins) | ◐ | ◐ | ✔ | ✔ (canonical) | ✔ | ◐ (testing cost) | ✘ (double complexity, no upside) | ✔ |
| Cluster | ✔ (canonical) | ◐ (convert to grid-coin respins) | ◐ | ✔ | ✔ (canonical) | ✔ | ✔ | ✘ (two grids of clusters unreadable) | n/a | ✔ |
| Scatter-pays | ✔ (canonical) | ✔ (Money-Train pattern) | ✔ | ✔ | ✔ | ✔ (accumulating — canonical) | ◐ | ◐ | n/a | ✔ |
| Hold-respin (as base) | ✘ (respins ARE the loop) | n/a | ✔ (canonical) | ✔ (canonical: grand on fill) | ✔ | ◐ | ✔ (row unlock — canonical) | ◐ | n/a | ✔ |

Hard avoid rules [inferred from the above + CONVENTIONS §9]:
1. Never two positional families simultaneously on one grid (lines + cluster on the same
   spin confuses evaluation, players, and labs). Sequential (base lines → cluster bonus) is
   fine.
2. Never combine two grid-growth mechanics (expanding rows + merging boards).
3. Never uncapped multiplier × uncapped ways × cascades — at least two of the three must be
   capped to keep max-win provable.
4. Both-ways adds nothing to ways/scatter games (already position-free); restrict it to
   line/fixed-ways games.
5. Bonus buy must be gated by jurisdiction-policies.json (banned in UK) [mandatory UK,
   S7-adjacent; legal review].

### 6. What dominates 2024–2026 and why

- Scatter-pays + tumble + accumulating multipliers was THE dominant mechanical package of
  2025 releases (Sweet Bonanza Super Scatter, Sweet Rush Bonanza ×128 persistent, Duck
  Hunters 6×5 scatter with position multipliers to 8192x) — it pays anywhere, chains
  visibly, and concentrates RTP in a snowballing free-spin fantasy [observed, S14][S28].
- Hold & Win remains the most widely deployed mechanic across global markets (≥3 of top 10
  in every major region per GameBeat), because rules are legible in one spin and jackpot
  tiers attach naturally [observed, S15][S16].
- Max-win arms race: 10,000x is table stakes; flagship titles ship 21,100x (Sweet Bonanza),
  25,200x (Megaquads), 30,000x (Duck Hunters), 50,000x (Super Scatter), 99,999x (Mental 2),
  150,000x (Money Train 4) [observed, S14][S26][S28][S29].
- RTP norms: 94–97% online, with 96.0–96.5% the flagship default and multiple lower RTP
  builds (down to 85%) offered to operators [observed, S28][S37]; hit frequency 20–35%
  typical, <20% for high-vol, 30%+ casual [observed, S37][S38]; high-vol games put only
  30–50% of RTP in the base game [observed, S38].
- Volatility labeling: no industry-standard scale — Pragmatic 1–5, Nolimit 1–10(+12);
  quantitative practice is per-spin standard deviation / volatility index [observed, S38].
- Portrait-first mobile is the default authoring target; one-handed play, thumb-zone
  controls, purpose-built vertical assets [observed, S31][S32].
- UK-specific design constraints that shape archetype choice: ≥2.5 s spin cycle, no turbo/
  slam-stop, no autoplay, no celebration of returns ≤ stake, net-position + session-time
  display — effective 31 Oct 2021, extended to all casino games 17 Jan 2025 [mandatory UK,
  S5][S7][S9-adjacent Wiggin]. Cascade-heavy games must fit their whole presentation loop
  inside these pacing rules [inferred].

### 7. Enumeration vs simulation — practical decision rule

- Exact enumeration is practical and expected when: fixed grid, strip-stop generation, ≤
  ~10^10 stop combinations, features expressible as closed-form or small Markov chains
  (line/ways/adjacent games, simple respins, fixed jackpots) [observed, S22][S24].
  Full-cycle enumeration exactly matches the PAR spreadsheet and gets jackpot tail
  frequencies right, which simulation cannot do cheaply [S22].
- Simulation is required when: cascades of unbounded depth, independent-cell refills,
  path-dependent multipliers/meters, variable structure (heights, growth, merges),
  persistent modifiers [observed, S22][S10]. Commercial verification practice: 10^8–10^9+
  rounds with 95/99% CI convergence reporting [observed, S22]; CONVENTIONS' gate (|simRTP −
  target| ≤ 99% CI half-width AND ≤ 0.003) is consistent with this.
- Hybrid best practice [recommended]: enumerate every closed-form component (base line/ways
  pays, trigger probabilities via per-reel PGFs, respin Markov chains), simulate the
  composed game, and reconcile — component enumeration catches config bugs simulation hides.
- The Stake Engine pattern (simulate → book library → weighted lookup table → optimizer
  re-weights to hit exact RTP) is a third path: it makes ANY mechanic's deployed
  distribution exactly known post-hoc, at the cost of a finite outcome pool [observed,
  S10][S11]. Good inspiration for our simulator's report format (lookup table = simulation
  id, weight, payout).

## Source register

| id | name | type | pub/rev date | jurisdiction | URL | supports |
|----|------|------|--------------|--------------|-----|----------|
| S1 | GLI Standards index (current versions) | standard | retrieved 2026-08 | multi (US-origin, widely adopted) | https://gaminglabs.com/gli-standards/ | GLI-11 v3.0, GLI-12 v3.0, GLI-19 v3.0 current versions |
| S2 | GLI-11 Gaming Devices in Casinos v2.0 (full text; v3.0 principles continuous) | standard | 2007/updated (v3.0 2016) | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v2-0-Standard-FINAL.pdf | 75% min theoretical RTP, 1-in-50M top-award odds, 100% gamble return |
| S3 | GLI-12 Standards for Progressive Jackpots v3.0 | standard | 2026-01 (posted) | multi | https://gaminglabs.com/wp-content/uploads/2026/01/GLI-12-v3-0-FINAL.pdf | progressive meter accuracy 99.99%, ceiling/overflow, controller security, 75% floor fallback |
| S4 | GLI-11 v1.3→v2.0 rule diffs | standard | 2018 (posted) | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v1-3-v2-0-Rule-Diffs.pdf | base-game-only clarification of 75% rule |
| S5 | UKGC: package of changes making online games safer by design | regulator | 2021-02-02 | UK | https://www.gamblingcommission.gov.uk/news/article/gambling-commission-announces-package-of-changes-which-make-online-games | 2.5 s spin, autoplay/turbo/slam bans, LDW ban, net-position display, 31 Oct 2021 |
| S6 | Gamingsoft: BTG Megaways mechanics for operators | industry-press | 2026-05 | global | https://www.gamingsoft.com/blog/2026/05/big-time-gaming-casino-games/ | Megaways 2–7 heights, 117,649 ways, patent/licensing, Evolution ownership |
| S7 | SBC News: UKGC bans autoplay and quickspin | industry-press | 2021-02-02 | UK | https://sbcnews.co.uk/igaming/2021/02/02/ukgc-bans-online-slots-autoplay-and-quickspin-features/ | ban scope and quotes |
| S8 | Cambridge BPP: celebratory sound effects & LDW compliance | academic | 2021 | UK | https://www.cambridge.org/core/journals/behavioural-public-policy/article/cue-the-sad-trombone-uk-gambling-regulations-have-not-prevented-the-misuse-of-celebratory-sound-effects-in-online-slots/5EDC0F428BC06371179A8636250BA204 | RTS-14F LDW rule, observed non-compliance |
| S9 | iGB: Betfred owner fined for LDW/RTS breaches | industry-press | 2022 | UK | https://igamingbusiness.com/legal-compliance/betfred-owner-fined-online-slot-breach/ | enforcement precedent (£240k) |
| S10 | StakeEngine/math-sdk (GitHub) | repo | active 2024–2026 | n/a | https://github.com/StakeEngine/math-sdk | simulation-first math, books/lookup tables, Rust optimizer, ~10^10 combo infeasibility rationale |
| S11 | Stake math-sdk docs: game structure | vendor-docs | retrieved 2026-08 | n/a | https://stakeengine.github.io/math-sdk/math_docs/overview_section/game_struct/ | run_spin entrypoint, lines/ways/cluster/scatter executables, lookup table format, weight=1 then optimize |
| S12 | Wiggin LLP: remote game design changes 17 Jan 2025 | legal | 2024/2025 | UK | https://www.wiggin.co.uk/insight/remote-game-design-changes-taking-effect-17-january-2025/ | extension of slot rules to all casino games, 5 s non-slot minimum |
| S13 | win.gg: cascading slots explained | industry-press | 2023–2025 | global | https://win.gg/what-is-cascading-slot/ | cascade loop, RNG certification of refills |
| S14 | Casino Life Magazine: Top 5 slot games 2025 | industry-press | 2025 | global | https://www.casinolifemagazine.com/blog/top-5-slot-games-2025-spins-systems-and-surprises | 2025 scatter-pays+tumble dominance, Duck Hunters/Money Train 4/Mental 2 specifics |
| S15 | GameBeat: Why Hold & Win is still most popular, 2025 | vendor-blog | 2025 | global | https://gamebeat.studio/page82325356.html | ≥3-in-top-10 per region, 15-yr endurance |
| S16 | BGaming: Hold & Win mechanics explained | vendor-blog | 2024–2025 | global | https://bgaming.com/articles/hold-win-slot-mechanics-explained | lock+3-respin reset mechanics |
| S17 | McLuck: Megaways guide | industry-press | 2025 | US sweepstakes | https://blog.mcluck.com/guides/slots/game-mechanics/megaways/ | 7^6 math, extra tracker reel |
| S18 | casinos.com: Cluster pays explained | industry-press | 2025 | global | https://www.casinos.com/slots/cluster-pays | 5+ adjacency rule, size-banded pays |
| S19 | AvatarUX PopWins official mechanic page | vendor-docs | retrieved 2026-08 | global | https://avatarux.com/game-mechanics/popwins/ | pop-and-grow rule, 486→33,614 ways, 5×9 growth |
| S20 | BetMGM: cluster pays system | industry-press | 2024 | US | https://casino.betmgm.com/en/blog/all-you-need-to-know-about-cluster-pays-system/ | cluster rules, wild membership |
| S21 | Medium/TDS: connected-component labeling from scratch | blog | 2020 | n/a | https://medium.com/data-science/implementing-a-connected-component-labeling-algorithm-from-scratch-94e1636554f | BFS/two-pass CCL algorithms for cluster detection |
| S22 | Wizard of Vegas: simulating RTP vs exact algorithm (practitioner thread) | forum/practitioner | 2014–2015, evergreen | n/a | https://wizardofvegas.com/forum/gambling/slots/19069-casino-slots-design-pros-and-cons-simulating-rtp-and-wincombinations-vs-exact-algorithm/ | full-cycle enumeration vs sim tradeoffs, jackpot tail accuracy |
| S23 | Know Your Slots: reel strips & virtual reel mapping | blog | 2019–2023 | US | https://www.knowyourslots.com/slot-vocabulary-reel-strips/ | strip definitions, weighting via frequency, 30–100 stop norms (with USPTO 9230401) |
| S24 | Wizard of Vegas: Atkins Diet slot deconstruction | practitioner | evergreen | n/a | https://wizardofvegas.com/forum/questions-and-answers/gambling/25894-deconstructing-the-atkins-diet-slot-machine/ | full PAR-sheet build for a 5-line game |
| S25 | star-burst.co.uk Starburst technical review | fan/technical | 2025–2026 | UK | https://star-burst.co.uk/ | both-ways higher-direction-only rule, 10 lines ≈ 20 configs |
| S26 | CasinoHipster: how Megaquads works | industry-press | 2021–2026 | global | https://casinohipster.com/blog/how-does-a-megaquads-slot-work/ | 4×(4×4) boards, merge to 8×8 = 16,777,216 ways, Quattro comparison |
| S27 | Gambling.com: Siberian Storm Dual Play review | industry-press | retrieved 2026-08 | global | https://www.gambling.com/games/free-slots/siberian-storm-dual-play | dual-grid shared 10-high reel, 1,440/2,880 ways, MultiWay Xtra, per-board stake |
| S28 | HideousSlots: Sweet Bonanza Super Scatter review | industry-press | 2025 | global | https://hideousslots.com/slot-review/sweet-bonanza-super-scatter/ | 8+ anywhere bands, 4 RTP builds, 50,000x, no wilds |
| S29 | Bigwinboard: Money Train 4 review | industry-press | 2023–2024 | global | https://www.bigwinboard.com/money-train-4-relax-gaming-slot-review/ | collector/payer/persistent taxonomy, row unlock 6×4→6×8, 100x/500x buys, 150,000x |
| S30 | ChaseTheScatter: guide to scatter pays | blog | 2025 | global | https://chasethescatter.com/gambling-guides/guide-to-scatter-pays/ | scatter-pays vs cluster distinction, Sweet Bonanza lineage |
| S31 | GammaStack: optimizing slot games for mobile | vendor-blog | 2024–2025 | global | https://www.gammastack.com/blog/best-practices-for-optimizing-slot-games-for-mobile-devices/ | responsive layout, icon sizing |
| S32 | OnlineGamblingExperts: mobile-first slot UX 2025 | industry-press | 2025 | global | https://www.onlinegamblingexperts.com/mobile-first-slot-game-ux-innovations/ | portrait default, one-handed mode, haptics |
| S33 | slotplate (schmooky.dev): FSM slot client boilerplate | repo/docs | 2024–2026 | n/a | https://slotplate.schmooky.dev/ | FSM phases, server-owns-math client-renders pattern, bonus sub-FSMs, recovery |
| S34 | Tangram Games: core architecture of slot games | vendor-blog | 2024–2025 | global | https://www.tangramgames.co.uk/blog/core-architecture-of-slot-games-rng-game-logic-and-mathematical-models/ | determinism requirement, math/presentation separation |
| S35 | Yggdrasil Gigablox reviews (casino.band; allslotsonline Giganimals) | industry-press | 2024–2026 | global | https://casino.band/slots/yggdrasil-gaming | Gigablox 2×2–6×6 blocks decompose to 1×1 for pays |
| S36 | Track360: jackpot slots progressive & must-drop economics | industry-press | 2026 | global | https://track360.io/blog/jackpot-slots-progressive-must-drop-operator-guide-2026 | 1–3% standalone / 8–9% WAN contribution, seed liability, RTP split |
| S37 | Raijin Studio: slot game math explained | vendor-blog | 2024–2025 | global | https://raijinnstudio.com/blog/slot-game-math-explained-rtp-volatility-hit-frequency | hit-freq design targets (30%+/20–25%/<20%), VI 16–30 note |
| S38 | PokerNews + VegasSlotsOnline volatility guides | industry-press | 2024–2026 | global | https://www.pokernews.com/casino/slots/understanding-slots-volatility.htm | volatility = SD of pay distribution, base-game 30–50% RTP share in high-vol, provider scales |
| S39 | MDPI Mathematics: Efficient Monte Carlo methods for slot jackpot | academic | 2023 | n/a | https://www.mdpi.com/2227-7390/11/2/266 | quasi-MC (Sobol/Halton/LHS) variance reduction for jackpot math |
| S40 | EJAW: top new slot games 2025 / trends | industry-press | 2025 | global | https://ejaw.net/global-trends-top-new-slot-games-2025/ | sequels/engine variants, sticky multipliers, 1×5-to-huge-grid experimentation |

Note on S25/S30-class sources: affiliate/fan sites; used only for mechanic descriptions
corroborated across ≥2 independent results, never for regulatory claims.

## Uncertainties & legal-review items

1. GLI-11 v3.0 clause persistence — SUBSTANTIALLY CONFIRMED (2026-08 follow-up): the
   75% floor and 1-in-50M advertised-top-award rules persist across v2.0/v2.1/v3.0
   (v3.0 carries the corresponding "Game Payout Percentages, Odds, and Non-Cash Awards"
   section), and GLI-12 v3.0 (2026-01) still cross-references GLI-11's 75% floor.
   Verified nuances worth encoding: the 75% floor applies to the BASE game (excluding
   progressives/bonusing systems/merchandise), must be met at all times, including when
   playing continuously at the lowest bet level of a non-linear paytable; the 1-in-50M
   rule exempts unadvertised aggregate prizes and free-game repeats of the top win, but
   INCLUDES the bonus-entry odds when the top award sits inside a feature; GLI-12 v3.0
   separately requires 1-in-100M odds for explicitly advertised progressive jackpots
   unless actual odds are displayed in artwork [S1][S2][S4]. Residual: quote exact v3.0
   clause numbers from the PDF when drafting a compliance document.
2. Exact RTS section numbers: LDW = RTS 14F is supported by the Cambridge paper [S8]; the
   2.5 s spin-speed and autoplay provisions live in RTS 14E/8/13 but the UKGC news page
   does not number them [S5] — pull the current RTS PDF for section-precise citations.
3. "Megaways patent" status/expiry and the exact scope of BTG's protection (patent vs
   trademark vs engine license) is widely asserted [S6] but the patent number and claims
   were not independently verified — IP counsel item before shipping any variable-height
   game commercially.
4. Sugar Rush grid is reported as both 6×7 and 7×7 across sources; per-title figures in
   §6 (max wins, RTPs) are review-site figures, not provider-primary — treat as ±.
5. Hit-frequency and VI numeric ranges [S37][S38] vary by source and there is NO
   industry-standard volatility index scale; our skill should define its own measured
   metric (per-spin SD) and label bands explicitly.
6. Collection/progression persistent-state legality varies by jurisdiction (some regs
   restrict games whose expected value depends on prior play); flagged for the
   jurisdiction-policy research file — [legal review].
7. Progressive contribution norms [S36] are operator-side economics from industry press;
   a real progressive integration needs GLI-12 + jurisdictional filing review.
8. 2026-dated aggregator sources (Gamingsoft, geeky-gambler etc.) are low-authority;
   used only where corroborated by the mechanic's owner (BTG/AvatarUX/Yggdrasil pages).

## Design implications for the Skill

Defaults and hard rules downstream authoring agents should encode:

1. **Archetype menu**: offer exactly the 22 archetypes of §3; implement each as
   composition of: evaluation family (lines | ways | adjacent | cluster | scatter) ×
   structure (fixed | variable-height | expanding | multi-board | dual-grid) × loop
   (none | cascade | respin) × meta (jackpot | collection | progressive-hook). Reject
   compositions marked ✘ in §5 at concept time.
2. **Default shapes** (confirms CONVENTIONS §11, adds specifics):
   - lines: 5×3 or 5×4, 20 lines, left-to-right, best-of wild rule.
   - ways: 5×4 (1024) or 6×4 (4096); multi-instance multiplication on.
   - cluster: 7×7, min cluster 5, 4-connectivity, pay bands 5/6/7/8-9/10-14/15-19/20+,
     always with cascades.
   - scatter-pays: 6×5, threshold 8, bands 8-9/10-11/12+, cascades + accumulating
     free-spin multiplier (the 2025-dominant package — good market-fit default).
   - hold-and-respin bonus: 6 triggers on 5×3–5×4 (=coin density ~1/2.5 cells), 3 respins
     reset-on-land, 4-tier jackpots, grand on full grid.
3. **Reel strips**: 30–100 stops; generate 48–64 stop strips per reel by default (power-
   of-2 friendly, room for stacks); strips may differ per reel; longer strips when adding
   wilds/stacked premiums; store as reel-sets.json with per-mode sets.
4. **Win-eval implementations** (math + client must share semantics):
   - lines: O(L·R) prefix scan, §2.1 pseudocode, pay best interpretation per line.
   - ways: per-symbol per-reel count product, §2.2, max(symbol, wild) rule; adjacent-pays
     = any-start maximal runs; both-ways = evaluate reversed grid, pay higher direction
     only, and only for line/fixed-ways games.
   - cluster: flood-fill 4-connectivity per symbol with wilds shared across symbol types.
   - scatter-pays: whole-grid counts vs thresholds; compute trigger/pay probabilities
     analytically via per-reel polynomial (PGF) products for the initial grid.
5. **Enumeration/simulation policy**: enumerate exactly when (fixed grid ∧ strip-stop ∧
   no cascades ∧ features closed-form); otherwise simulate ≥10^8 rounds release-grade
   (10^6 for iteration), report 95/99% CIs, and ALWAYS cross-check simulated base-grid
   component probabilities against the analytic PGF values. Respin phases: solve as
   absorbing Markov chain when coin values are i.i.d.; simulate when persistent
   collectors/payers exist.
6. **Caps** (make max win provable): cascade cap 20 per step-chain [inferred safe bound],
   retrigger cap, multiplier cap, and `max_win_termination` at maxWinXBet (default
   10,000x; up to 50,000x only with explicit volatility justification — market range is
   10k–150k [S14][S26][S28][S29]).
7. **Volatility targets**: define measured volatility = per-spin SD of payX; label low
   (<3), medium (3–8), high (8–15), very high (>15) [inferred bands anchored to S38];
   hit-frequency defaults: casual 30%+, balanced 22–28%, high-vol 15–20%; high-vol
   base-game RTP share 30–50%, balanced 55–70%.
8. **RTP builds**: primary 0.9600 plus optional 0.94/0.92 profiles (CONVENTIONS §11
   confirmed by market practice of multi-RTP builds [S28]); never below jurisdictional
   floors — GLI-11 75% absolute floor, many jurisdictions higher (NJ 83%) [S2]; never
   player-adaptive.
9. **Jackpots**: default 4 fixed tiers (JP_MINI/MINOR/MAJOR/GRAND) awarded only inside
   hold-and-respin or trigger events; check advertised-top-award frequency ≥ 1-in-50M
   games rule at math time [S2]; progressive = hooks only (contribution field, external
   meter interface, jackpot_award step), disabled by default; if enabled: contribution
   1.5% default, seed documented, GLI-12 meter-accuracy requirements listed in the
   compliance review [S3][S36].
10. **Mobile**: portrait-first layouts for every archetype; cell size ≥44 px at 390 px
    viewport width → grid width ≤ 8 columns hard limit; expanding archetypes must define
    max expanded rows (≤9) and auto-shrink; controls in bottom thumb zone; one-handed
    reachability [S31][S32] (+ CONVENTIONS accessibility rules).
11. **Animation/state**: archetype determines required extra states — cascades add the
    presenting_cascades loop with counter; respins add respin sub-state with lockedSet;
    variable structure adds structure reveal and requires recovery to restore structure,
    lockedSet, meters, and multiplier ladder exactly from the manifest resumePointer
    [S33]. Every archetype's cascade/growth/respin loop must be skippable without
    changing settlement (presentation-mode equivalence test).
12. **UK-style pacing compliance flags** (jurisdiction-gated, most-restrictive default):
    ≥2.5 s spin cycle including cascade presentation floor, no turbo/slam/autoplay, no
    celebration when totalWin ≤ stake (`small` tier silent-cap), net-position + session
    timer in HUD [S5][S7][S12]. These change presentation budgets: cascade chains must
    compress gracefully, so design cascade animations with a compressed variant from day 1.
13. **IP hygiene**: implement concepts, not brands — banned names include Megaways,
    PopWins, Gigablox, Splitz, MultiWay Xtra, Hold & Win (as branding), Megaquads,
    Money Train symbols/theme; use internal generic ids (variable_height_ways,
    grow_on_win, mega_blocks, split_symbols, multi_instance_ways, hold_respin) [S6][S19]
    [S26]; cross-ref research/12-market-patterns-ip.md (§6–§7 IP risk register).
14. **Market-fit guidance for concept agent**: default recommendation order for a 2026
    release = (a) scatter-pays 6×5 + tumble + accumulating multiplier, (b) hold-and-respin
    with 4-tier jackpots over a lines/ways base, (c) cluster 7×7 + cascade + meter,
    (d) variable-height ways + cascade + unlimited-with-cap multiplier — matching the
    2024–2026 top-performer distribution [S14][S15][S28][S29].
15. **Lab-readiness artifacts per archetype**: strips + paytable + line/ways/cluster
    definitions, analytic PAR sheet where enumerable, simulation report (rounds, seeds,
    CIs, per-feature RTP decomposition, max-win odds), termination proofs for
    cascade/respin loops, and the presentation-equivalence test result — all listed in
    validation-report.md [S2][S22] (+ CONVENTIONS §5, §9.9 honesty rule).
