# Slot Mathematics: PAR Sheets, RTP Decomposition, Volatility, Simulation & Reproducibility

Research dossier 03 · single-modern-slot-creator v1.0.0 · compiled 2026-08-08 ·
covers prompt.txt §4 "Mathematical Framework" (lines 769–924) in full.
Claim tags: [mandatory] = regulatory/certification requirement, [recommended] = strong
industry/lab practice, [observed] = documented market practice, [inferred] = our
derivation/judgment (reason stated). Source refs [S1]…[S26] resolve in the register.

## Findings

### 1. PAR sheets — structure and contents

- A PAR sheet ("Paytable and Reel Strips" / "Probability Accounting Report") is the
  manufacturer's confidential math design document for one game: it specifies exactly
  how the game reaches its expected payback ("par") [observed] [S1][S25].
- The best public primary evidence is Harrigan & Dixon (2009), who obtained real IGT
  PAR sheets (Lucky Larry's Lobstermania, Money Storm, Double Diamond Deluxe, The
  Phantom of the Opera) via Ontario freedom-of-information requests and reproduced
  their structure [observed] [S1][S2]. Verified field list from the paper's Table 1
  commentary (PDF text extracted and checked):
  1. **Min/max wager** per spin (denominations × lines).
  2. **Symbols per reel** — for mechanical reels this counts the *virtual* reels;
     multiplying per-reel counts gives total combinations. Lobstermania: reels of
     47, 46, 48, 50, 50 symbols → 259,440,000 combinations [S1].
  3. **Payback %** (theoretical RTP) — the major distinguishing characteristic
     between approved versions of the same game; Lobstermania versions ranged
     85.0%–96.2% while looking identical to the player [S1].
  4. **Hit frequency** (per line) — 4.9% (85% Lobstermania) to 16.7% (Money Storm);
     hit frequency stays nearly constant across RTP versions of the same game
     (Money Storm ≈16.6% in all versions) [observed] [S1].
  5. **Plays per jackpot** (mean spins per top award, max-bet qualified).
  6. **Jackpot amount** (top prize; may be non-linear in credits bet — Phantom pays
     1,000/2,000/5,000 credits for 1/2/3-credit wagers) [S1].
  7. **Plays per bonus** (mean spins per feature entry).
  8. **VI — volatility index** with the confidence-interval table (see §3) [S1].
  Plus: full reel-strip listings, per-symbol per-reel occurrence counts, prize/pay
  tables, win-type breakdowns (line/scatter/bonus contribution), and for mechanical
  reels the virtual→physical stop mapping [S1][S2].
- 23 versions of the same games were approved with different paybacks; the different
  paybacks are achieved by changing counts of ordinary symbols on the strips while
  keeping strip length and all special-symbol counts (wild, scatter, bonus) constant —
  e.g. low-pay "SF" symbol 10-3-10-7-8 occurrences at 85.0% vs 5-5-6-8-7 at 96.2%,
  while WS/LO/LT stayed 2-2-1-4-2 / 2-5-6-0-0 / 2-2-2-2-2 [observed] [S1]. This is
  the canonical technique for building **alternative RTP profiles** without touching
  feature frequency or presentation.
- A historical Bally-style PAR sheet reference: reel strips expanded to 32 positions
  by duplicating physical positions, targeting ≈85% payback, designed so that at 90%
  confidence and 10,000,000 plays the machine is within half a point of par
  [observed] [S25].
- Modern certification labs require a PAR-sheet-equivalent "math document" in the
  technical submission package: every winning combination with exact pays, all
  feature calculations, wild-substitution and scatter rules, trigger conditions, and
  RTP broken down by contribution from each feature [mandatory — GLI/iTech submission
  practice] [S20][S21][S6].

### 2. Theoretical RTP and its decomposition

- **RTP = E[total payout per round] / wager**, expressed as a fraction (0.9600)
  [mandatory: labs verify theoretical RTP by evaluating or simulating every possible
  combination] [S6]. GLI-11 requires each game to theoretically pay ≥ 75% over the
  base game's expected lifetime (v2.0 §4.4; progressives/bonusing systems excluded
  from the floor calc); paytables below the jurisdictional minimum are impermissible
  [mandatory, US tribal/casino jurisdictions adopting GLI-11] [S3][S4]. Jurisdiction
  floors differ: Nevada 75%, New Jersey 83% [mandatory, per jurisdiction] [S3 context].
  Confirmed persisting into GLI-11 v3.0 ("Game Payout Percentages, Odds, and Non-Cash
  Awards" section; GLI-12 v3.0 still falls back to it): the floor must be met **at all
  times**, including continuous play at the LOWEST bet level of a non-linear paytable —
  a min-bet-qualified RTP below the floor makes the paytable impermissible even if
  max-bet RTP passes [mandatory] [S3][S4][S5]. The companion 1-in-50M advertised-top-
  award rule includes bonus-entry odds when the top award sits inside a feature and
  exempts unadvertised aggregates / free-game repeats; GLI-12 v3.0 adds 1-in-100M for
  explicitly advertised progressive jackpots unless actual odds are displayed
  [mandatory] [S4][S5]. ⇒ the PAR sheet must report per-bet-level RTP for any
  non-linear paytable, and max-win odds including feature-entry probability.
- Total RTP decomposes additively over disjoint win channels
  [recommended — this is how real PAR sheets and lab reports present it] [S1][S6]:
  `RTP_total = RTP_base_lines + RTP_scatter + RTP_feature + RTP_super_feature
  + RTP_ultimate_feature + RTP_jackpot(+ RTP_other)` where each
  **Feature RTP contribution = P(trigger per paid round) × E[feature payout | triggered] / wager**.
- Verified real-game decomposition data points: Money Storm's "Free Storm Scatter
  Bonus" contributes **24.39% of the payback percentage** and 6.25% of all wins;
  Lobstermania's Lobster Buoy Bonus is initiated on 1.01% of winning hits and its
  wins are 7.61% of winning hits and **21.63% of total win amount**; in one
  Lobstermania version scatter wins are 25.7% of all wins [observed] [S1]. Modern
  high-volatility feature-driven games shift far more weight into features (often
  50–70% of total RTP in free-spins-centric games) [inferred — consistent with
  published hit-rate/max-win data for Nolimit/Pragmatic-class games [S18], but exact
  splits are not published].
- **Jackpot contribution**: for fixed jackpots, `RTP_jp = Σ_tier P(tier hit) ×
  jackpot_pay / wager`; for progressives, base seed and increment percentages are
  accounted separately (GLI-12 governs; GLI-12 v3.0 published Jan-2026; in absence of
  a jurisdiction minimum, GLI-11's 75% applies to the combination) [mandatory]
  [S5][S3].
- **Alternative RTP profiles**: standard online practice is 3–4 certified profiles
  per game, e.g. Nolimit City Land of the Free at 96.08 / 94.05 / 92.01 / 87.07%,
  operator-selectable; the in-game rules screen shows the active RTP [observed]
  [S18]. Each profile is a separate math configuration requiring separate simulation
  evidence [mandatory — labs certify per configuration] [S20][S21].
- **Bonus-buy RTP** is certified per buy mode and is usually within ±0.1–0.5 pp of
  the base RTP; commonly *slightly higher* (e.g. ~96.5% buy vs ~96.1% base) because
  the buy forfeits base-game value, but some studios price a premium (lower buy RTP)
  — both directions exist in the market [observed] [S19]. Buy prices cluster at
  50x–200x with 100x the modal `feature` price; tiered entries exist (San Quentin:
  100x / 400x / 2,000x for 3/4/5-scatter entry) [observed] [S19][S18].
- **Enhanced-chance RTP** (e.g. "Ante Bet" ×1.25 stake for ~2× feature frequency) is
  a distinct wager configuration with its own RTP: `RTP_ante = E[payout]/(1.25 ×
  base wager)`; it must be simulated and reported as its own mode [recommended;
  labs treat it as a separate paytable] [S19][S21][inferred for the formula — it is
  arithmetic, not a sourced claim].

### 3. Volatility, variance, standard deviation, volatility index

- Per-spin return X in x-bet units. **Variance = E[X²] − (E[X])²**,
  **SD σ = √Variance** [mandatory concept; PA GCB codifies the computation:
  "aggregate variance is the sum of the probability of every winning combination
  multiplied by the square of the corresponding payout"; SD is the square root after
  subtracting the squared mean] [S7]. Compute in exact arithmetic from the outcome
  distribution wherever enumerable; include feature outcomes in X (total round
  return), not just base-game line pays — assuming line/spin independence when it
  does not hold understates σ and narrows CIs incorrectly [recommended] [S15-adjacent
  multi-line study [S22]].
- **Volatility Index VI = z × σ**. Harrigan & Dixon's IGT PAR sheets use z = 1.65
  (90% two-tail); their worked example (92.5% Double Diamond Deluxe, 3-credit $0.75
  wager): σ = 6.349285 → **VI = 10.476** [observed] [S1]. Pennsylvania Technical
  Standard §461b.1 mandates z = 1.96 (95%) [mandatory, PA] [S7]. Industry forums
  confirm both 1.645 and 1.96 conventions coexist [observed] [S9]. The concept
  traces to Wilson, *Slot Tech Magazine*, Dec-2003 [S23].
- **Confidence band on observed payback after n plays**:
  `payback ± VI / √n` (equivalently RTP ± z·σ/√n) [S1][S9]. Harrigan & Dixon's
  worked bands for the game above: n=1,000 → 59.45%–125.71%; n=100,000 →
  89.27%–95.90%; n=10,000,000 → 92.25%–92.92% [observed] [S1].
- Variance of the *total* return over n independent rounds: `Var(Σ X_i) = n·σ²`;
  variance of the *mean* (observed RTP) = σ²/n; SD of observed RTP = σ/√n
  [mandatory math]. For cascading/feature games rounds remain i.i.d. (each paid
  round is one draw of the full round distribution), so the same formulas apply to
  round-level returns [inferred — standard probability; the round is the i.i.d.
  unit, not the cascade step].
- Marketing labels (low/med/high volatility, star ratings) have **no standard
  mapping** from σ; manufacturers assign them arbitrarily [observed] [S9]. Useful
  internal anchors: classic low-vol steppers σ ≈ 2–8 (Double Diamond Deluxe 6.35
  [S1]); modern high-vol online titles with 10,000x+ caps typically σ ≈ 8–20
  [inferred — from published max-win/hit-rate structures; studios do not publish σ].

### 4. Frequencies: hit, paying-spin, feature, retrigger, cascade

- **Hit frequency = P(total round payout > 0)**. Distinguish per-line hit frequency
  (PAR-sheet tradition: 4.9%–16.7% per line in [S1]) from **paying-spin frequency**
  (per round, any win — the number modern studios publish). Modern published
  paying-spin frequencies: Nolimit Flight Mode 20.17%, Supersized 19.66%, Seamen
  20.2% [observed] [S18]. Note LDW: a "paying" spin may return less than stake;
  report `P(win > 0)` and `P(win ≥ stake)` separately [recommended — LDW research
  line from Harrigan/Dixon [S1]; CONVENTIONS rule 5 already caps LDW presentation].
- **Feature trigger frequency = 1 / P(feature trigger per paid round)** (report as
  "1 in N spins"). Published modern values: 1 in 209 (Flight Mode), 1 in 217
  (Supersized), 1 in 263 (Seamen), 1 in 26 for a frequent bonus mode (Casino Win
  Spin) [observed] [S18]. Skill default 1/150–1/250 (CONVENTIONS §11) sits inside
  the observed market band.
- Intermediate win-tier frequencies are also published by transparent studios:
  P(win > 100x) ≈ 1 in 859 (Casino Win Spin), 1 in 1,156 (Supersized) [observed]
  [S18].
- **Retrigger frequency**: P(retrigger per feature) and mean retriggers per feature;
  compute from the feature-state model (absorbing Markov chain over remaining-spins
  states, see §8) or simulation; must be capped for bounded liability
  [mandatory per CONVENTIONS rule 4; method [recommended] [S17]].
- **Cascade frequency / average cascades per spin**: model the cascade as an
  absorbing chain (state = cascade depth and any multiplier level; absorb at "no new
  win"); `E[cascades per round] = Σ_k P(≥k cascades)`. One documented cluster-cascade
  game reports mean cascade depth ≈ 2.3 on paying spins with 6+ cascade chains on
  ~4% of paying spins; engines commonly hard-cap at ~15 consecutive cascades though
  7–8 is a practical max in play [observed, low-authority web sources — verify per
  game] [S24b]. Cascades reveal what the round already contains: they change the
  *shape* (variance) not the RTP identity — RTP still = E[total round pay]/wager
  [observed/[inferred] — arithmetic] [S24b].

### 5. Payout distribution, tail risk, maximum win

- **Average payout** = RTP × wager. **Median payout is typically 0**: 85.7% of all
  spins pay zero on Double Diamond Deluxe [observed] [S1][S22]; a modern 20–33%
  hit-rate game has median 0 and a heavily right-skewed distribution. Therefore also
  report median *of paying rounds* and distribution quantiles (P50/P90/P99/P99.9 of
  round return) [recommended] [inferred — standard practice in lab-grade sim reports;
  Stake SDK's segmented lookup tables serve the same purpose [S13]].
- **Tail risk**: characterize with exceedance probabilities P(X ≥ 100x), P(X ≥
  1,000x), P(X ≥ max_win) and the tail's RTP share. In discrete-outcome
  architectures these are exact sums over the outcome table [S13].
- **Maximum win & its probability** — modern published figures (Nolimit City game
  pages publish these): Kill Em All 11,916x at ≈ 1 in 350,000 spins; Supersized
  12,345x at ≈ 1 in 520,000; San Quentin 150,000x; Fire in the Hole 3 70,000x;
  Tombstone-family 500,000x at 1 in 12.8M; an extreme 1-in-130M case exists
  [observed] [S18]. Typical portfolio range for max-win probability: 1e-5 to 1e-8
  per spin. A 10,000x cap (skill default) with P(max) in the 1e-6–1e-7 band is
  mid-market [inferred from the above].
- **Maximum liability** per round = max bet × max-win multiplier (+ any concurrent
  jackpot). With max bet 100.00 and 10,000x cap: 1,000,000.00 per round; the
  `max_win_termination` step enforces the cap in engine and math identically
  [mandatory per CONVENTIONS rule 4; liability arithmetic [inferred]].

### 6. Exact formulas (canonical set)

All in x-bet units, per paid round; p_i = probability of outcome i, x_i = its pay.

- RTP: `RTP = Σ p_i·x_i = E[X]` (fraction of wager).
- Hit frequency: `HF = P(X > 0) = Σ_{x_i>0} p_i`.
- Variance: `σ² = Σ p_i·x_i² − (Σ p_i·x_i)²`; SD: `σ = √σ²`.
- Volatility index: `VI = z·σ` (z = 1.645 for 90%, 1.96 for 95% [S1][S7][S9]).
- Observed-RTP CI after n rounds: `RTP_obs ∈ RTP ± z·σ/√n` [S1][S9].
- Feature trigger frequency: `F = 1 / P(trigger)` rounds per trigger.
- Feature RTP contribution: `P(trigger) × E[pay | trigger] / wager` [S1][S6].
- Retrigger-adjusted mean feature length with per-spin retrigger prob r adding k
  spins, capped at C total: solve absorbing chain; uncapped closed form
  `E[spins] = s₀/(1 − r·k/s₀)`-style geometric approximations are acceptable only
  as sanity checks, not for certification math [inferred; exact chain preferred
  [S17]].
- Bernoulli event (feature, max win) estimated from simulation:
  `p̂ ± z·√(p̂(1−p̂)/n)`; relative half-width `≈ z/√(n·p)` for small p.
- Required rounds to pin RTP to half-width ε at confidence z:
  **`n = (z·σ/ε)²`** — see the sizing table in §10.

### 7. Reel-strip and weighted-table construction

- **Physical-style reel strips**: ordered symbol list per reel; uniform random stop.
  Wizard of Odds' Atkins Diet reference design: 5 reels × 32 stops, uniform 1–32
  stop selection, 32⁵ = 33,554,432 outcomes, strips authored to hit 97.0% exactly,
  per-line hit frequency 5.45% [observed — designed as a public teaching example]
  [S8]. Power-of-two strip lengths were historically chosen for RNG bit-slicing
  convenience; irrelevant with modern RNGs [observed] [S8 forum].
- **Virtual reel strips** (Telnaes patent lineage): physical reel has ~22 stops; a
  longer virtual strip (Double Diamond Deluxe 72, Phantom 256 stops) is drawn
  uniformly and a **weighted mapping** takes each virtual stop to a physical stop —
  e.g. virtual stops 1–3 → physical stop 1 (blank), virtual stop 4 → physical stop 2
  ("7"), virtual stops 5–9 → physical stop 3 [observed, verified from S1 PDF]
  [S1][S24]. Virtual reels exist to decouple displayed geometry from probability;
  **video/online slots don't need them** — the logical strip itself can be any
  length with any symbol multiplicity [observed] [S1][S24].
- **Near-miss clustering caution**: on those mechanical PAR sheets, heavy virtual
  weights sit on blanks adjacent to top symbols (virtual stops 22–26 → blank
  physical 7 next to the Double Diamond symbol at 27) producing engineered
  near-misses [observed] [S1]. Many modern jurisdictions prohibit outcome-dependent
  near-miss engineering, and CONVENTIONS rule 5 forbids it for this skill: symbol
  adjacency weighting must serve math only, with anticipation delivered by
  presentation, not by biased strips [mandatory for this skill; regulatory status
  varies by jurisdiction — flag for legal review].
- **Weighted symbol tables / weighted lookup tables**: draw prize or symbol from a
  finite weighted table with replacement. Real example: Lobstermania's Lobster Buoy
  Bonus prize table where prize 12 has weight 10 of total 322 (P = 10/322)
  [observed, verified] [S1]. This is the general-purpose primitive for bonus wheels,
  instant prizes, multiplier draws, mystery transforms and cascade refills.
- **Independent reel stops**: default model — one uniform (or weighted) independent
  draw per reel; total combinations = Π strip lengths [S1][S8]. Correlated-reel
  tricks (synced reels, colossal reels) need explicit joint modelling.
- **Dependent feature states**: features whose per-spin distribution depends on
  accumulated state (collected symbols, upgraded multipliers, remaining spins) are
  Markov chains; industry moved from pure enumeration/simulation to Markov modelling
  as the preferred exact method for feature math [observed/academic] [S17].
- **Cluster grids**: hit probability = probability of ≥k-connected component of one
  symbol on the W×H grid; no closed form in general — model via combinatorial
  analysis for small grids, else simulation; grid shape/adjacency rule changes mean
  cluster size [observed] [S24b]. Exactness is recoverable by moving to a
  discrete-outcome table (enumerate simulated outcomes into a weighted lookup, §9)
  [S13].
- **Cascade replacement tables**: two canonical fill rules — (a) strip-continuation
  (symbols above slide down, strip continues from the same stop; preserves strip
  statistics conditioned on removal) and (b) fresh weighted draw per emptied cell
  from a (possibly cascade-specific) replacement table. Rule (b) with per-depth
  tables is the tunable one: later-cascade tables can trim premium density to keep
  chain EV bounded, and a proven-terminating cap (≤15 observed; skill default lower)
  bounds the chain [observed for cap [S24b]; table mechanics [inferred — standard
  implementation; Stake SDK example games implement fresh-draw variants [S13]]].
- **Feature-specific reel strips & weights**: features routinely use their own
  strips (scatter-free during free spins unless retriggers allowed; enriched wilds;
  feature-exclusive FX symbols). Every strip variant is a separate config artifact
  contributing to config hash and must appear in the PAR sheet [recommended]
  [S1][S13][S21].
- **Hold-and-respin states**: grid of BLANK-heavy independent weighted cells; state
  = set of locked cells + respins remaining (reset on land). Finite absorbing chain
  ⇒ exact E[pay] computable per entry configuration; enumerate entry configurations
  from trigger distribution [recommended] [S17][inferred — standard method].
- **Persistent progression states**: anything persisting across rounds (collection
  meters, XP-style unlocks) makes rounds non-i.i.d.; RTP must be computed over the
  stationary distribution of the meter chain or over a full cycle, and regulators
  treat persistent-state RTP with suspicion — document the cycle math explicitly
  [recommended] [S17][inferred — GLI-11 lifetime-RTP framing [S3]].
- **Bonus-buy entry distributions**: the buy must enter the feature with the same
  *conditional* trigger-state distribution as natural triggers (scatter positions,
  entry multipliers), or with an explicitly documented different one that is
  simulated separately; never silently reuse the 3-scatter entry distribution for a
  4/5-scatter buy [recommended] [S13 (separate modes per buy)][S19].

### 8. Computation methods — when to use which

- **Exact enumeration**: nested loops over all stop combinations (Atkins Diet:
  32⁵ = 33.5M outcomes tallied exactly [S8]). Feasible for line/ways games with
  independent stops up to ~10⁹–10¹⁰ combos (Stake docs cite 100⁵ = 10¹⁰ as the
  impracticality threshold for real-time enumeration [S13]). GLI itself "evaluates
  or simulates every possible combination" and writes simulators when combination
  counts are very large [mandatory-adjacent: labs prefer exact math where feasible]
  [S6]. Enumerate per-reel symbol *counts* (multinomial collapse), not raw stops,
  to cut state space by orders of magnitude [inferred — standard technique].
- **Analytical decomposition**: split RTP into channels (§2) and solve features as
  absorbing Markov chains (retriggers, cascades, hold-and-respin, progressions);
  some legislations require exact RTP parameters, which chain methods deliver where
  enumeration can't [observed/academic] [S17]. Use exact rational/integer arithmetic
  (Python `fractions`, integer payX100 per CONVENTIONS §5) for the enumerable core.
- **Monte Carlo simulation**: required whenever grids/cascades/clusters make exact
  math intractable and as an independent cross-check of exact math [mandatory —
  labs run large-scale sims and compare to theory] [S20][S21][S6]. Never assume 1M
  spins suffices: 1M is a development smoke-test size only (see §10 sizing).
- **Discrete-outcome (lookup-table) architecture**: pre-generate a large outcome set
  offline; ship `(id, weight, payoutMultiplier)` lookup tables + per-id event
  "books"; runtime RNG only selects a weighted row. RTP and the whole payout
  distribution then become **exact by construction** (weighted sums over the table),
  moving all statistical uncertainty to the authoring stage. This is the Stake
  Engine model: CSV lookup + `books_<mode>.jsonl`, per-mode tables (base, bonus),
  `lookUpTableIdToCriteria_<mode>.csv` segmenting 0-wins/feature/max-win outcomes,
  and a PAR-sheet generator over the segmented tables [observed, verified from docs]
  [S13]. Recommended ≥100k outcomes per mode for distribution smoothness [observed]
  [S13].
- **Rare-event methods** for max-win/ultimate-tier probabilities:
  - Crude MC fails for small p: nearly all samples miss the event; required n for
    ±50% relative error at 95% is n ≈ 15.4/p (p = 1e-7 ⇒ n ≈ 1.5×10⁸ minimum, and
    that's only ±50%) [inferred — Bernoulli CI arithmetic; failure mode per rare-event
    literature [S16]].
  - **Importance sampling**: sample from a tilted measure where the rare event is
    common, reweight by likelihood ratio; orders-of-magnitude variance reduction;
    exponential change of measure is the classical construction [recommended]
    [S16]. Slot-practical tilts: force/enrich scatter or premium weights, or
    condition on feature entry and reweight by exact P(entry) (which is enumerable).
  - **Stratified sampling**: partition rounds by enumerable strata (scatter count /
    feature tier / entry state), sample each stratum separately, combine with exact
    stratum probabilities; allocate n_s ∝ stratum SD (Neyman allocation)
    [recommended] [S16]. This matches the tier structure (feature / super_feature /
    ultimate_feature) exactly: simulate each tier conditionally, weight by exact
    trigger probabilities.
  - **Conditional decomposition beats generic methods**: exploit problem structure
    (Glasserman's principle) — compute P(entry) exactly, simulate only conditional
    feature payouts [recommended] [S16].
  - **Quasi-Monte Carlo** (Sobol/Halton, Latin hypercube) demonstrated significant
    efficiency gains for multidimensional jackpot modelling [academic] [S15].
  - **Forcing**: deliberately inject forced max-win/feature outcomes during outcome
    generation, then let weight optimization rebalance selection probabilities
    (Stake SDK's `force_record_<mode>.json` mechanism; their example deliberately
    over-generates to 163.2% raw RTP then optimizes weights down to the 97% target)
    [observed, verified] [S13].

### 9. Hitting target RTP — optimization approaches and validation gates

- **Manual/iterative weight tuning** is the historical baseline: adjust ordinary
  symbol counts on strips, keep special symbols fixed, re-evaluate (exactly or by
  sim), repeat — precisely the pattern visible across Lobstermania's 85→96.2%
  versions [observed] [S1].
- **Genetic algorithms**: Balabanov, Zankinski & Shumanov (Springer LNCS) encode the
  reel layout as an integer vector, fitness = |target RTP − achieved RTP| (RTP from
  MC per candidate), population 17, max 213 generations, convergence ≈ generation
  51, targets 80–98% [academic] [S10].
- **Discrete Differential Evolution**: faster convergence than GA (important since
  each fitness eval is an expensive MC run); multi-objective via linear
  scalarization — published weights: 1 (symbol diversity), 100 (target RTP), 10
  (prize equalization); output is directly a 5×63 integer strip matrix [academic]
  [S11].
- **Variable Neighborhood Search** (Kamanas et al., Math. Problems in Eng., 2021):
  first VNS for the RTP problem; notes fresh designs start from wildly off targets
  (e.g. 630% initial RTP) and metaheuristics walk them in [academic] [S12].
- **Linear programming on outcome weights**: in the discrete-outcome architecture,
  RTP = Σ w_i·x_i / Σ w_i is linear in weights after normalization, so target RTP,
  hit-rate, tier frequencies and tail-share constraints are all linear ⇒ LP/convex
  feasibility solves the *weight* problem exactly (this is why Stake ships a
  `convex-optimizer` repo alongside the Rust GA) [observed for the tooling [S13];
  [inferred] for the LP formulation — direct arithmetic]. Reserve
  metaheuristics for the *discrete strip layout* problem; use LP/analytic scaling
  for weighted tables.
- **Validation gates after any optimization** [recommended, synthesized from
  S6/S13/S20/S21]:
  1. Re-run full-size verification sim with fresh seeds (never the tuning seeds —
     tuning on the same random stream overfits the noise [inferred]).
  2. |simRTP − targetRTP| within 99% CI half-width AND ≤ 0.003 absolute
     (CONVENTIONS §5 gate) — consistent with lab tolerance practice [S20][S21].
  3. Per-channel decomposition sums to total RTP within rounding (exact identity
     check).
  4. Hit-rate / feature-frequency / max-win-probability each within declared bands.
  5. No degenerate weights (e.g. optimizer zeroing entire outcome classes —
     enforce minimum weights / diversity constraints as in [S11]).
  6. Multi-run stability: reported third-party heuristic — no single 1M-spin run
     deviating > 2% from documented RTP and mean of three 1M runs within 0.5%
     [observed, low-authority [S21b] — treat as smoke gate, not release gate].

### 10. Simulation sizing — CI half-width vs n (do NOT default to 1M)

Required rounds `n = (z·σ/ε)²` for half-width ε on RTP (per mode, per profile).
Computed exactly (z 95% = 1.959964, z 99% = 2.575829):

| σ (x-bet) | ±0.5% @95% | ±0.1% @95% | ±0.1% @99% | ±0.05% @99% |
|-----------|-----------:|-----------:|-----------:|------------:|
| 3         |     1.38M  |     34.6M  |     59.7M  |      239M   |
| 5         |     3.84M  |     96.0M  |      166M  |      664M   |
| 8         |     9.83M  |      246M  |      425M  |     1.70B   |
| 10        |     15.4M  |      384M  |      664M  |     2.65B   |
| 12        |     22.1M  |      553M  |      955M  |     3.82B   |
| 15        |     34.6M  |      864M  |     1.49B  |     5.97B   |

[mandatory arithmetic; the ±0.1% @95% column for σ = 5–15 answers the checklist item
directly: **96M – 864M rounds**.] Anchors: commercial sim farms advertise 10-billion-
spin capacity with 95%/99% CI reporting [observed] [S21]; studios typically run
10M–100M before submission [observed] [S21b]; iTech verifies the record count gives
"sufficient statistical power" [mandatory-adjacent] [S20].

- **Event-frequency sizing** (Bernoulli p, relative half-width ρ at 95%):
  `n ≈ 3.84·(1−p)/(p·ρ²)`. Feature at p = 1/200 to ±2% relative → n ≈ 1.9M.
  Max win at p = 1e-6 to ±20% relative → n ≈ 9.6×10⁷; at p = 1e-7 → 9.6×10⁸ ⇒ use
  exact lookup-table computation or importance sampling instead of crude MC
  [recommended] [S16][S13].
- **Scale the plan by**: feature/super/ultimate rarity (rarest tier must accumulate
  enough conditional samples: ≥10⁴ ultimate-tier entries [inferred — gives ~2%
  relative SE on the conditional mean for typical conditional σ/μ ≈ 2]); volatility
  (table above); max-win probability (rare-event methods); number of RTP profiles ×
  bonus-buy/ante modes (full plan per mode per profile); target CI (regulatory gate).
- **Per-mode note**: bonus-buy modes have much smaller conditional σ in units of
  their 100x price (σ_buy/price typically 1–3), so pinning buy-RTP to ±0.1% needs
  correspondingly fewer *buy* rounds than base rounds — compute per mode with the
  same formula, using that mode's σ in units of its wager [inferred — same
  arithmetic applied per mode].
- Development-level: 1M rounds/mode is a smoke test only (detects gross errors ~±1%
  at σ=5). Release-level: use the table; e.g. skill default high-vol (σ≈10, target
  ±0.1% @99%) ⇒ ~700M base rounds or a discrete-outcome exact computation [inferred
  from table].

### 11. Reproducibility: seeds, RNGs, config hashing

- **Dev/sim RNG (Python)**: `numpy.random.Generator(PCG64(seed))` is NumPy's
  recommended general-purpose generator; statistically high quality and fast
  [recommended] [S14]. Known caveat: in *massively* parallel use (millions of
  streams, large draws) PCG64 has a birthday-collision statistical weakness; NumPy's
  fix is **PCG64DXSM**, the designated future default; with thousands of streams the
  risk is negligible [observed, NumPy docs] [S14]. Skill sims use ≤ dozens of
  workers ⇒ PCG64 fine; prefer PCG64DXSM when worker counts are large.
- **Parallel stream policy**: use `SeedSequence(root_seed).spawn(n_workers)` — the
  NumPy-preferred method for provably independent child streams; avoid ad-hoc
  seed+i schemes; `.jumped()` is acceptable but you must never reuse a jumped
  region; Philox/SFC64 give assured independence via keys/counters if ever needed
  [recommended] [S14].
- **TypeScript dev round provider**: xoshiro128** (per CONVENTIONS §5); the
  xoshiro256**/++ family is jumpable, high-quality, and is Rust `rand`'s endorsed
  SmallRng; note cross-language streams are NOT comparable — switching generators
  breaks seed-level reproducibility of prior results, so never change the
  BitGenerator within a mathVersion [observed] [S14b].
- **Production RNG is out of scope for math sims**: real-money outcomes come only
  from the RGS's certified CSPRNG (GLI-11 has RNG chapters; RNG certification is
  mandatory in regulated markets) [mandatory] [S3][S20]. In the discrete-outcome
  model, the RGS draws the weighted lookup row [S13].
- **Reproducibility record** — every simulation report must contain (all eight are
  the prompt's checklist; CONVENTIONS §5 already binds them): gameVersion,
  mathVersion, configHash (`sha256:` over canonical concatenated config JSON),
  simCodeVersion, dependency lockfile hash (`uv.lock`), root seed + spawn policy,
  round count per mode, worker count, exact command line
  (`uv run python -m slot_math.simulate --seed …`) [mandatory for this skill].
  Rationale anchor: labs certify a specific tested version; any math change
  invalidates the report [mandatory] [S20].
- Determinism rules: fixed worker→SeedSequence mapping; results must be independent
  of worker scheduling (accumulate per-worker sufficient statistics — n, Σx, Σx²,
  event counters, payout histogram — and merge; never depend on interleaving order)
  [inferred — standard reproducible-parallel-sim practice, consistent with [S14]].

## Source register

| id  | name | type | pub/rev date | jurisdiction | URL | supports |
|-----|------|------|--------------|--------------|-----|----------|
| S1  | Harrigan & Dixon, "PAR Sheets, probabilities, and slot machine play", J. Gambling Issues 23 | academic | 2009-06 | Ontario/CA | https://cdspress.ca/wp-content/uploads/2022/08/Kevin-A.-Harrigan-Mike-Dixon-.pdf (PDF text-verified locally) | PAR sheet fields, VI=1.65σ, CI bands, virtual reel mapping, RTP-version technique, bonus contributions |
| S2  | Harrigan, "The Design of Slot Machine Games" (NH Gambling Commission presentation) | academic | 2010 | US-NH | https://stoppredatorygambling.org/wp-content/uploads/2012/12/Harrigan-presentation-to-the-2010-NH-Gambling-Commission.pdf | PAR sheet structure corroboration |
| S3  | GLI-11 Standards for Gaming Devices in Casinos v2.0 | standard | 2016-09 | multi (GLI-adopting) | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v2-0-Standard-FINAL.pdf | 75% floor, §4.4, RNG chapters, last-10-plays memory |
| S4  | GLI-11 v2.1 ch.3 excerpt | standard | ~2018 | multi | http://digdia.com/slots/GLI-11%20v2.1%20Gaming%20Devices%20in%20Casinos%20Chapter%203.pdf | paytable impermissible below min RTP |
| S5  | GLI-12 Progressive Jackpots v3.0 | standard | 2026-01 | multi | https://gaminglabs.com/wp-content/uploads/2026/01/GLI-12-v3-0-FINAL.pdf | progressive RTP floor fallback to GLI-11 75% |
| S6  | GLI "Game Mathematics / RTP Analysis" service page | vendor-docs | current 2026 | multi | https://gaminglabs.com/services/igaming/game-mathematics-percentage-return-to-player-rtp-analysis/ | labs evaluate/simulate every combination; simulators for huge spaces |
| S7  | PA Gaming Control Board Technical Standard §461b.1 | regulator | current | US-PA | https://pgcb.pa.gov/files/technical_standards/Technical_Standards_Section_461b1.pdf | codified variance/SD calc; VI = 1.96σ (95%) |
| S8  | Wizard of Odds, "Deconstructing the Atkins Diet Slot Machine" (+ WoV threads) | blog (expert) | 2008, maintained | n/a | https://wizardofodds.com/games/slots/atkins-diet/ | exact enumeration 32⁵, 97% authored RTP, 5.45% line hit freq |
| S9  | Wizard of Vegas forum: VI definition threads | blog/forum | 2011–2023 | n/a | https://wizardofvegas.com/forum/questions-and-answers/math/23680-the-significance-of-volatility-index/ | VI conventions 1.645/1.96; CI method |
| S10 | Balabanov, Zankinski, Shumanov, "Slot Machines RTP Optimization with Genetic Algorithms" | academic | 2015 | n/a | https://link.springer.com/chapter/10.1007/978-3-319-15585-2_6 | GA encoding, fitness, pop 17, conv ~51 gens |
| S11 | Balabanov et al., "Slot Machine RTP Optimization and Symbols Wins Equalization with Discrete Differential Evolution" | academic | 2016 | n/a | https://www.researchgate.net/publication/300209679 | DDE, linear scalarization weights 1/100/10, 5×63 strip matrix |
| S12 | Kamanas et al., "Slot Machine RTP Optimization Using VNS", Math. Probl. Eng. | academic | 2021 | n/a | https://onlinelibrary.wiley.com/doi/10.1155/2021/8784065 | VNS; 630% initial-RTP anecdote; multicriteria future work |
| S13 | Stake Engine Math SDK docs + repo | vendor-docs/repo | 2024–2026 (active) | n/a | https://stakeengine.github.io/math-sdk/ · https://github.com/StakeEngine/math-sdk | lookup-table architecture, (id,weight,payout) format, modes, 100k+/mode, Rust optimizer, forcing, PAR sheet generation |
| S14 | NumPy random docs: performance, parallel, PCG64/upgrading | vendor-docs | NumPy 1.25–2.5 (2023–2026) | n/a | https://numpy.org/doc/stable/reference/random/upgrading-pcg64.html · /parallel.html | PCG64/DXSM guidance, SeedSequence.spawn, jumped caveats |
| S14b| EcoEpi sick-bees MR !88 (Xoshiro256++ vs PCG64) + Numerics.NET RNG guide | repo/vendor-docs | 2023–2025 | n/a | https://git.ufz.de/ecoepi/sick-bees/-/merge_requests/88 | xoshiro tradeoffs; generator switch breaks reproducibility |
| S15 | "Efficient Monte Carlo Methods for Multidimensional Modeling of Slot Machines Jackpot", MDPI Mathematics 11(2):266 | academic | 2023-01 | n/a | https://www.mdpi.com/2227-7390/11/2/266 | QMC (Sobol/Halton/LHS) gains for jackpot modelling |
| S16 | Sigman, Columbia IEOR 4703 notes on IS; Owen, "Monte Carlo" ch.8; arXiv 1508.05047 rare-event survey | academic | 2007–2015 | n/a | http://www.columbia.edu/~ks20/4703-Sigman/4703-07-Notes-IS.pdf · https://artowen.su.domains/mc/Ch-var-basic.pdf | IS/stratification theory, Neyman allocation, exploit-structure principle |
| S17 | "Markov chain applications in the slot machine industry", OR Insight 21(1) | academic | 2008 | n/a | https://link.springer.com/content/pdf/10.1057/ori.2008.53.pdf | industry shift to exact Markov modelling of features |
| S18 | Nolimit City official game pages (Supersized, Kill Em All, Flight Mode, Seamen, Fire in the Hole 3, San Quentin) + CasinoWizard max-win explainer | vendor-docs/industry-press | 2023–2026 | n/a | https://nolimitcity.com/games/supersized etc. | published hit freqs (19.66–20.2%), feature freqs (1/209–1/263), max-win probabilities (1/350k–1/130M), multi-RTP profiles 96/94/92/87 |
| S19 | Bigwinboard bonus-buy index; CasinoGrounds top bonus-buy RTP; iGamingWheel buy-math guide | industry-press | 2024–2026 | n/a | https://www.bigwinboard.com/bonus-buy-slots/ | buy prices 50–200x, tiered buys, buy RTP deltas ±0.1–0.5pp, UK buy ban |
| S20 | iTech Labs RTP audit certificate + methodology pages | test-lab | current 2026 | multi | https://itechlabs.com/certificates/besoftware/BeSoftware_RTP_audit_certificate.pdf | log-based RTP audit, statistical-power check, theory-vs-actual comparison, per-version certification |
| S21 | GamixLabs simulation farm page + certification workflow blog | vendor-docs | 2025–2026 | n/a | https://gamixlabs.com/simulation.html | 10B-spin farms, 95/99% CI reporting, submission package incl. PAR sheet |
| S21b| Wizards.us / gamblingkenya cert-report articles | industry-press | 2025–2026 | n/a | https://wizards.us/blog/casino-game-testing/ | 10M–100M pre-submission sims; 1M-run 2%/0.5% smoke heuristics (low authority) |
| S22 | UNLV Gaming Research & Review Journal (Double Diamond Deluxe par sheet analysis; Lucas & Brandmier 2005; Singh et al. 2012) + UNLV CGR Occasional Papers | academic | 2005–2015 | US-NV | https://oasis.library.unlv.edu/grrj/ | 85.7% zero-pay spins; par-change field studies; variance dominates session outcomes |
| S23 | Wilson, J., "Slot machine volatility index", Slot Tech Magazine | industry-press | 2003-12 | n/a | (print; cited in S1) | origin of VI convention |
| S24 | easy.vegas "How slot machines work" / KnowYourSlots PAR sheet article | blog | maintained 2024+ | n/a | https://easy.vegas/games/slots/how-they-work · https://www.knowyourslots.com/the-par-sheet-a-look-under-the-hood-of-a-slot-machine-game/ | Telnaes virtual-reel lineage, video slots don't need virtual reels, PAR confidentiality |
| S24b| Cascading-reels mechanics explainers (SlotRandomizer, Sarasota/AdvantagePoint, consultoresvargas grid-model) | blog | 2025–2026 | n/a | https://slotrandomizer.com/blog/cascading-wins-explained/ | cascade caps ~15, avg depth ~2.3 anecdote, cluster-grid geometry effects (LOW authority — corroborate before relying) |
| S25 | Various PAR sheet explainers citing Bally-era design targets | blog | 2019–2024 | n/a | https://www.knowyourslots.com/the-par-sheet-a-look-under-the-hood-of-a-slot-machine-game/ | "±0.5pt at 90% conf over 10M plays" design-target anecdote |
| S26 | Raw-Fun-Gaming/stake-engine-math (community fork) | repo | 2025–2026 | n/a | https://github.com/Raw-Fun-Gaming/stake-engine-math | PAR sheet export, sim validation, JSON/Excel stats additions |

## Uncertainties & legal-review items

1. **GLI-11 current version**: v3.0 (released 2016-09-21) is the latest confirmed; a
   v2.1 chapter excerpt also circulates; no 2024–2026 GLI-11 revision found. The 75%
   floor and 1-in-50M rules are confirmed to persist into v3.0 (see §2 additions;
   GLI-12 v3.0 of Jan-2026 cross-references the GLI-11 floor). Verify the exact
   GLI-11 version demanded by each target jurisdiction, and quote exact v3.0 clause
   numbers from the PDF, before submission.
2. **Cascade statistics** (avg depth 2.3, cap 15) come from low-authority explainer
   sites [S24b]; treat as plausible anecdotes, not design constraints. Our own
   simulator must produce these stats per game rather than assuming them.
3. **Bonus-buy RTP direction** (higher vs lower than base) is genuinely mixed in the
   market; the "usually +0.1–0.2pp" claim is aggregator-sourced [S19]. Decide per
   game and document; legal note: bonus buys are banned in the UK and restricted
   elsewhere — jurisdiction-policy file must gate them (overlaps dossier 05/07 scope).
4. **Near-miss / clustering legality**: engineered near-miss weighting is documented
   in historical mechanical PAR sheets [S1] but its regulatory permissibility today
   varies (e.g. Nevada's post-Universal-Distributing stance); this skill forbids it
   outright (CONVENTIONS §9.5) — legal review only needed if a client ever asks for
   it (answer should remain no).
5. **Persistent-state RTP**: no public regulatory text found this pass that
   specifies how lifetime RTP must be computed for cross-round persistence;
   [inferred] treatment (stationary/cycle analysis) needs lab confirmation for any
   game using persistence.
6. **PA §461b.1 details**: the "square of the lowest payout percentage" phrasing in
   the aggregated snippet reads oddly (likely "the payout percentage" i.e. mean);
   read the primary PDF before quoting the PA formula verbatim in generated docs.
7. **σ ranges for modern high-vol titles** (8–20) are [inferred]; studios do not
   publish per-spin SD. Our generated PAR sheets will publish it, which exceeds
   market disclosure norms (good), but competitor-comparison claims must stay
   qualitative.
8. **Third-party "2%/0.5% of three 1M runs" gate** [S21b] is not a lab standard;
   do not present it as one. The binding gate is the CI-based one in CONVENTIONS §5.

## Design implications for the Skill

**PAR sheet template (templates/par-sheet.md + schemas/par-sheet.schema.json) must contain, minimum:**
metadata block (game/slug/gameVersion/mathVersion/configHash/date/generator);
per-profile: target & computed RTP (fraction, 4 dp) with method (exact | hybrid |
MC ± CI); RTP decomposition table (base lines, scatter, feature, super_feature,
ultimate_feature, jackpot, bonus-buy modes, ante mode — must sum to total);
σ, variance, VI at both z=1.645 and z=1.96 (label the z); hit frequency P(X>0) AND
P(X≥stake); feature/super/ultimate frequencies as "1 in N"; retrigger stats;
cascade distribution (P(≥k) for k=1..cap, mean cascades/round); payout distribution
quantiles (P50/P90/P99/P99.9 of round return, median of paying rounds); max win,
P(max win) per mode, max liability; per-reel strip listings + per-symbol occurrence
counts per reel per reel-set; every weighted table with weights, totals, exact
probabilities; reproducibility record (all 8 fields, §11).

**Math-engine defaults:**
- Represent every draw as either (a) strips with independent stops or (b) weighted
  tables `(entry, weight)` with integer weights. All probabilities exact rationals;
  pays in payX100 integers; RTP computed as exact fraction where the model permits.
- Exact-first policy: line/ways games with independent reels → full enumeration via
  per-reel count vectors (feasible ≤ ~10¹⁰ raw combos; collapse first). Features
  with state → absorbing Markov chains. Cluster/cascade grids → hybrid: exact entry
  probabilities × conditional MC, or full discrete-outcome table.
- Discrete-outcome mode (recommended for cascades/clusters): generate ≥ 100k
  outcomes per mode (base, each buy tier, ante), store `(id, weight, payX100)` +
  outcome books; then RTP/σ/quantiles/max-win P are exact sums; weight-tune via
  LP/convex program (RTP and all frequency constraints are linear in weights);
  include forced max-win and forced ultimate-tier outcomes so tails exist in the
  table before optimization.
- Strip-layout tuning (when not using discrete-outcome mode): iterative hill-climb /
  GA over ordinary-symbol counts ONLY — wild/scatter/jackpot counts frozen (mirrors
  the real Lobstermania versioning technique). Multi-objective scalarization
  starting weights: RTP 100, hit-rate 10, symbol diversity 1.
- Validation gates (hard): |simRTP − target| ≤ min(99% CI half-width, 0.003);
  decomposition-sum identity; each tier frequency within declared band; verification
  sims use fresh seeds ≠ tuning seeds; per-mode gates for every profile × buy × ante.

**Simulation sizing policy (encode as a function, not a constant):**
`n_release(mode) = max( (2.5758·σ_mode/0.001)², 10_000/p_rarest_MC_tier, 100e6 if mode==base else 0 )`
— i.e. rounds to pin that mode's RTP to ±0.1% at 99% (σ=5→166M, σ=10→664M,
σ=15→1.49B), AND enough rounds that the rarest tier whose stats come from MC
accumulates ≥ 10⁴ conditional samples, AND a 100M floor for the base mode. Dev tier: 1M/mode (smoke only; annotate expected noise
±z·σ/1000). Max-win probability: never estimate by crude MC when p < 1e-5 — use
exact table sums or stratified/conditional estimation with exact trigger
probabilities; report p with its estimation method.

**Frequencies/defaults consistent with market observations:** paying-spin frequency
20–33% (skill default band confirmed in-market at ~20% for high-vol titles);
`feature` 1/150–1/250; P(win>100x) target band 1/800–1/1,500 for high-vol; max-win
probability target band 1e-6–1e-7 per spin for a 10,000x cap; publish "1 in N"
max-win odds in the game info (Nolimit-style transparency, increasingly expected).

**Reproducibility (hard rules):** root seed → `SeedSequence.spawn(workers)`;
PCG64 (PCG64DXSM if workers > 64) [S14]; per-worker sufficient statistics merged
order-independently; simulation-report.json includes gameVersion, mathVersion,
configHash (sha256 canonical concat), simCodeVersion, uv.lock hash, root seed +
spawn policy, per-mode round counts, worker count, exact command; TS dev provider
xoshiro128** with recorded seed; never change BitGenerator within a mathVersion;
document that the discrete-outcome tables (if used) are themselves versioned
artifacts covered by configHash.

**Forbidden (restate in mathematician agent prompt):** no near-miss/clustering
weight bias, no adaptive RTP, no fake wins; median payout is 0 and must be reported
honestly; LDW stats (P(0 < win < stake)) reported in the PAR sheet.
