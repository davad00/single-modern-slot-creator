# Modern Mechanics & Feature Systems (incl. the 3/4/5-Scatter Bonus-Tier Hierarchy)

Dossier 02 for skill `single-modern-slot-creator v1.0.0` · generated 2026-08-08 by research job `research-02`.
Covers prompt.txt §2 (lines 361–551) and §3 (lines 553–767). Claims are tagged
`[mandatory]` (regulatory/standards requirement), `[recommended]` (strong industry norm),
`[observed]` (documented market practice), `[inferred]` (analyst judgment, reason given).
Source refs `[S#]` resolve in the Source register.

---

## Findings

### 0. Cross-cutting rules that bound every mechanic

- **No post-outcome substitution / no forced near-miss.** After the RNG selects an outcome, the game must not make a variable secondary decision that affects the result shown (GLI-11 software requirements; the standard's own example: a loser must not be swapped for a "near-miss loser") [mandatory, US/GLI jurisdictions] [S1][S2]. UKGC RTS 7C mirrors this for remote play ("no misleading design, including false near-miss substitution") [mandatory, GB] [S5]. Scatter-anticipation presentation is legal ONLY as honest presentation of an already-determined outcome — anticipation may play whenever ≥2 scatters have already stopped and the remaining reels genuinely still contain scatter stops; it must never be weighted into losing outcomes.
- **No adaptive/compensated math.** Theoretical return must not adapt to play history; RNG outputs must be used in order received without adaptive discarding (GLI-19; UKGC RTS 7A/7B) [mandatory] [S3][S5]. This forbids "pity timers", streak-breakers, and player-personalised RTP for every mechanic below.
- **Minimum theoretical RTP.** GLI-11 requires ≥ 75% theoretical payout over game lifetime including bonus games [mandatory, GLI jurisdictions] [S2]; most commercial online slots sit 94–97% [observed] [S12][S15].
- **RTP/rules frozen while live.** UKGC RTS 7D: no rule/RTP/odds changes while a game is live without notice [mandatory, GB] [S5]. Encode as versioned, hash-locked math (matches CONVENTIONS §5).
- **Interrupted-game recovery.** GLI-19 v3.0 §4.16: platform must present an incomplete game for completion on reconnection; if no player input is required it must display the final RNG-determined outcome and settle; the incomplete game must be resolved before a new instance of the same game starts [mandatory] [S3]. UKGC RTS 10A/10B: results stand once the outcome is generated; stateful games (multi-stage bonuses, collection meters, sticky symbols, jackpot values) must be restored to last known state [mandatory, GB] [S5][S6]. ⇒ every mechanic with persistence needs serialisable state and a deterministic resume point (matches the outcome-manifest `resumePointer` design).
- **GB presentation constraints that shape mechanics** [mandatory, GB] [S5][S7]: autoplay banned (RTS 8A); ≥2.5 s per slot cycle, cycle ends only when all staked/won money is lost or delivered (RTS 14D — note: a 30-tumble cascade sequence is ONE cycle, so cascades are unaffected, but the *next spin* cannot start early); turbo/quick-spin/slam-stop banned (RTS 14E; explicit exception for bonus/feature games with no additional stake — feature fast-forward inside free spins is permissible); wins ≤ stake must not be celebrated (RTS 14F, "losses disguised as wins"); current game state (collected tokens/symbols, active features) must be displayed as play progresses (RTS 3B — directly relevant to collection meters and persistent symbols); net session position and elapsed time displayed (RTS 2E/13).
- **Bonus buy is jurisdiction-gated.** Feature buys are unavailable in GB — caught by RTS 14A wording against encouraging stake increases; providers strip the buy from UK builds (Dog House, Money Train 2, San Quentin all ship UK variants without buys) [mandatory, GB] [S8][S35]. Ontario also restricts buys; most other markets allow them [observed]. ⇒ buys must be a feature flag, never load-bearing for the math model.

### 1. Wild mechanics

| Mechanic | Trigger / state transition | Math, RTP & volatility pattern | Notes (presentation · recovery · cost) |
|---|---|---|---|
| Standard wild | Lands as a reel-strip symbol; substitutes for all pay symbols (never scatter/bonus) | Weight on strips directly sets substitution EV; the additive-vs-multiplicative question doesn't arise. Neutral-to-mild volatility lift | Cheapest to build/certify. `anim.symbol.land` + subtle idle. [observed] [S26][S36] |
| Stacked wilds | 2–4 consecutive wilds printed on the strip; whole/partial stack lands in view | Big line-hit covariance across lines ⇒ raises volatility strongly for same RTP; balance by reducing stack count or premium weights [observed] [S36] | Stack landing = one anticipation moment; low perf cost |
| Expanding wild | On land (or on win participation), grows to cover full reel | Equivalent to a "wild reel" hit; concentrate RTP into fewer, larger events. Sequencing rule needed: expand BEFORE or AFTER evaluation (declare in rules) [observed] [S36] | Expansion tween + reveal SFX; must re-evaluate wins post-expansion in the engine as a distinct step |
| Sticky wild | Lands, then locks in place for N spins or for feature duration (3–5 respins typical; commonly feature-only) [observed] [S36] | Each additional sticky position compounds hit-rate of subsequent spins ("snowball"); the dominant volatility driver in features like Dead or Alive's High Noon Saloon (DoA2: 96.8% RTP, 111,111x max) [observed] [S36] | Persistent state ⇒ MUST survive reconnect (RTS 10B) [mandatory] [S5]. Locked-frame VFX; per-spin re-render trivial |
| Walking wild | Sticky wild that shifts one column per spin until it exits the grid (ELK Wild Toro pattern) | Guarantees a bounded number of extra evaluated spins per wild (reel-count worth); math ≈ sticky wild with fixed lifetime; medium-high volatility [observed] [S36] | Movement animation between spins; state = position + direction; needs recovery of both |
| Shifting wild | As walking, but direction/pattern varies (down, diagonal, random) | Same bounded-lifetime analysis; presentation-differentiated [observed] [S36] | Declare movement rule in paytable to satisfy rules-completeness (RTS 3A) [mandatory, GB] [S5] |
| Random wilds | RNG modifier sprays 2–8 wilds onto a non-winning or any grid (Reactoonz "Instability" drops 4–8 wilds on dead spins) [observed] [S29] | Pure RTP top-up knob; smooths dead-spin experience; slightly reduces volatility if biased to dead spins. Must be RNG-scripted in the outcome, not client-decided [mandatory] [S1][S3] | Needs its own event (`anim.wild.random_drop`); medium VFX cost |
| Wild reel | Entire reel is wild (weighted strip entry or modifier award) | Large ways-multiplication on adjacent reels; cap simultaneous wild reels to protect max-win envelope [inferred — direct consequence of ways math] | Cheap: one stretched sprite + shader glow |
| Multiplier wild | Wild carries 2x–5x (or up to 150x in extreme designs, Starburst XXXtreme, 96.26% RTP, 200,000x cap) [observed] [S36] | THE key declaration: multiple multiplier wilds on one line combine **additively** (2x+3x=5x) or **multiplicatively** (2x×3x=6x). Multiplicative is the extreme-tail engine (DoA2 wilds multiply together); additive is far easier to balance and communicate [observed] [S26][S36][S11] | PAR sheet complexity jumps; per-line combination rule must be printed in rules |
| Transforming wild | A symbol/wild converts into another wild type on event (e.g., xSplit turning symbols to doubled symbols; scatter→super-scatter interactions in Nolimit designs) [observed] [S20][S21] | Modeled as conditional symbol replacement in the engine's step list; each transform is an outcome-manifest step | One transform VFX per type; test matrix grows per transform pair |
| Collected wild | Wilds gathered into a meter, then released (all at once or as feature-start state) | Moves RTP from immediate to deferred; meter progress must be displayed (RTS 3B) and restored (RTS 10B) [mandatory, GB] [S5] | Meter HUD element; certification wants meter math documented |
| Feature-only wild | Exists only on feature reel strips (e.g., sticky wilds only in free spins) | Cleanest way to differentiate feature math: separate strips with extra wilds is standard practice [observed] [S27][S36] | Zero base-game cost; requires separate strip audit in cert |

### 2. Symbol mechanics

| Mechanic | Trigger / behaviour | Math/volatility pattern | Notes |
|---|---|---|---|
| Stacked symbols | Printed consecutively on strips (premiums 2–4 deep) | Raises line-hit covariance ⇒ volatility up, hit-frequency down at equal RTP [observed] [S26] | Standard; no extra cert burden |
| Oversized symbols | 2×2 / 3×3 blocks occupy multiple positions (common in Megaways-likes and hold-features) | Equivalent to correlated stacks across reels; strongly volatile | Needs grid-occupancy model + partial-visibility rendering |
| Split symbols | Symbol counts as 2+ (Nolimit xSplit: splits all symbols in the row/reel, doubling counts; splits can compound with xWays to make 4) [observed] [S20][S21] | Multiplies ways; extreme tail growth; "xSplit"/"xWays" are Nolimit trademarks — reimplement behaviour, never the names [mandatory — IP] [S20][S21] | Doubling badge on symbol; readability on mobile needs a count chip ≥ 24 px |
| Mystery symbol | Covered symbol; all instances reveal as the SAME random symbol at stop | Reveal distribution is a weight table; shifts RTP toward correlated hits; mid-high volatility | One reveal animation; reveal weights in PAR sheet |
| Symbol upgrade | Low symbols promoted to a higher tier (round-scoped or feature-scoped) | Equivalent to a temporary paytable/strip swap; document as separate evaluation context | Cheap VFX (flash + swap) |
| Symbol transformation | X→Y conversion by modifier (Reactoonz "Alteration") [observed] [S29] | Conditional replacement step; keep transform sets small or the test matrix explodes | One VFX per transform family |
| Symbol removal | Modifier deletes a symbol class (Reactoonz "Demolition" wipes low symbols) [observed] [S29] | In cluster/cascade games acts as a refill re-roll biased to wins | Pair with cascade removal animation |
| Symbol duplication | Copies of a chosen symbol added to grid/strips | Same math family as upgrades; declare whether copied SCATTERS count (default: no — see §7) | |
| Symbol collection | Counting landed symbols toward a meter (Reactoonz Quantum meter: 1 point/removed symbol, 25/level, 5 levels, 125 ⇒ Gargantoon 3×3 wild that splits 3×3→two 2×2→nine 1×1) [observed] [S29] | Meter is deterministic given outcomes ⇒ no extra RNG cert, but state display (RTS 3B) and recovery (RTS 10) are mandatory in GB [mandatory] [S5]. Scope must be declared: per-spin-sequence (Reactoonz) vs per-session (persistent) — persistent meters raise cert scrutiny and cross-session recovery burden [observed/inferred] | Meter HUD + per-level jingles |
| Locked symbols | Held in place across respins (hold-and-win core) | See §5 hold-and-respin | Persistent state ⇒ recovery-critical |
| Persistent symbols | Survive across feature spins with behaviour each spin (Money Train "Persistent" collectors/payers; FitH3 Persistent Dwarf/Dynamite) [observed] [S22][S23] | The strongest volatility lever in respin features; cap their count per round to bound liability [inferred — liability math] | Distinct visual halo; must serialise remaining-lifetime |
| Premium-symbol enhancement | Feature strips increase premium frequency / remove lows | Standard tier-differentiation tool for super/ultimate tiers [observed] [S22] | Audited as separate strips |
| Cash symbols | Land with printed x-bet value (coins 1x–10x typical in hold-features; scatter-values up to 10x in Money Train 4 trigger) [observed] [S12][S14][S23] | Value distribution is an explicit weight table; contributes linearly to RTP; easy to simulate | Value text must be Bitmap-Text-rendered and ≥ 4.5:1 contrast [recommended — a11y + S30] |
| Collector symbol | On land, sums all visible cash values (BGaming "collector"; Money Train payer/collector taxonomy) [observed] [S12][S23] | Creates quadratic interactions with cash symbols ⇒ dominant tail driver in hold-features; simulate, don't hand-derive [recommended] | Sweep animation from each coin to collector |
| Booster symbol | Increments other symbols' values or the round multiplier | Additive escalation; bound by round caps | |
| Jackpot symbols | `JP_MINI…JP_GRAND` award fixed x-bet prizes (typical scale Mini 25x / Minor 50x / Major 150x / Grand 5,000x, Playson Energy Joker; Grand often = fill-the-grid award) [observed] [S14] | Fixed jackpots are just paytable entries; PROGRESSIVE jackpots pull in GLI-12 (see §5) | Four-tier lockup display is the industry-legible pattern |

### 3. Reel & grid mechanics

| Mechanic | Behaviour & real-world reference | Math/cert/perf notes |
|---|---|---|
| Cascades / symbol drops | Winning symbols removed, survivors fall, new symbols refill; repeats until no new win; entire sequence = one game cycle (one RTS 14D cycle) [observed/mandatory-GB] [S9][S10][S11][S5] | Refill can be strip-continuation or independent-draw — declare which; independent-draw is easier to simulate. Cascades raise volatility ("streaky": most spins 0–1 cascades, rare 5+ chains) [observed] [S11]. Engine MUST prove termination (finite symbol pool or cap; CONVENTIONS rule 4). Pragmatic states "no limit to the number of tumbles" — they rely on probabilistic termination; our skill mandates a hard cap (e.g., 50) with a documented "cap reached ⇒ settle" step [observed + inferred rationale] [S10] |
| Reel/row expansion | Rows unlock during a feature (Money Train 4 grows 6×4→6×8 by filling rows; FitH3 opens 2/3/4 rows by trigger tier) [observed] [S22][S23] | Expansion = new evaluation context per size; each size needs its own ways/line table in the PAR sheet. Strong "visible progression" driver |
| Variable reel heights / dynamic grid | Per-spin random 2–7 symbols per reel, up to 7⁶ = 117,649 ways — this is BTG's **patented, licensed Megaways** mechanic (debut Dragon Born 2015; licensed per-title/GGR royalty, terms confidential; Blueprint first licensee 2018, Pragmatic 2019; BTG acquired by Evolution 2021 ~€450M) [observed + IP-mandatory] [S24][S25][S34n] | Randomised reel heights as such are a math pattern; the NAME "Megaways" and the specific patented implementation are off-limits without licence — skill must generate original variable-height math and never use the mark [mandatory — IP] [S24][S25] |
| Locked reels | 1+ reels held identical/frozen for respins | Synced-reels math = correlated columns; volatility up | |
| Reel respins / position respins | Re-spin of specific reels/positions, often after near-complete outcomes | Each respin is an outcome-manifest step of type `respin`; never client-initiated randomness [mandatory] [S1][S3] |
| Symbol nudging | Partially visible symbol nudges fully into view; Nolimit xNudge: stacked wild nudges to full view, +1 multiplier per nudge step [observed] [S20][S21] | Nudge decision must be outcome-determined (no "skill stop"); multiplier-per-nudge is an elegant additive escalator |
| Gravity changes / portals / multi-board / cross-board transfer | Exotic topology: symbols fall sideways, teleport between zones, or two grids interact (e.g., dual-grid designs where wilds copy across boards) | Rare because comprehension cost is high; mobile readability suffers below ~44 px cells [inferred — a11y math]. If used, restrict to the ultimate tier as an exclusive environment. Each topology = bespoke evaluation code = highest test/cert complexity in this family [inferred] |
| Grid unlocks | Persistent or feature-scoped opening of new cells (FitH3 xHole bombs open positions) [observed] [S20][S22] | Cell-mask is part of round state; recovery must restore the mask [mandatory-GB] [S5] |

### 4. Multiplier mechanics

Combination law is the single most consequential declaration; print it in the rules and encode it in one shared function used by both simulator and client [recommended].

- **Global (round) multiplier**: one value applies to all wins in scope. Progressive-during-feature versions (Gates of Olympus free spins: multiplier orbs' values are **summed into a running total that persists for the whole feature**) concentrate RTP in the feature tail [observed] [S9][S10].
- **Cascade-step multiplier ladders**: canonical additive step-ups — Gonzo's Quest avalanche 1x/2x/3x/5x base, 3x/6x/9x/15x in free falls; generic ladder 1→2→3→5→(10) with reset on sequence end [observed] [S11]. Most commercial ladders are additive step tables, not compounding — easier to balance and communicate [observed] [S11][S26].
- **Per-symbol multipliers**: orbs with printed values (Gates of Olympus 2x–500x anywhere on grid; applied as the SUM of all visible orbs to the tumble-sequence win, i.e., additive collection, multiplicative application) [observed] [S9][S10].
- **Per-position multipliers**: cells accumulate a multiplier where wins occurred (cluster-game staple); position map is round state ⇒ recovery-relevant.
- **Per-reel / wild multipliers**: see multiplier wilds (§1); declare additive vs multiplicative per line. Wanted Dead or a Wild's VS-wilds: 2x–100x each, **added together** when multiple contribute [observed] [S28].
- **Additive vs multiplicative**: additive (3x+2x=5x) bounds tails ~linearly; multiplicative (3x×2x=6x) grows tails geometrically and is reserved for extreme-volatility designs (Nolimit, DoA2) at the cost of much harder PAR-sheet math and max-win-cap policing [observed] [S26][S36][S20].
- **Persistent feature multipliers**: carry across feature spins (xNudge wilds keep their multiplier while sticky; Gates FS total never resets during the feature) [observed] [S9][S20].
- **Collected multipliers**: banked to a meter, applied at feature start or on collect events.
- **Resetting base-game multipliers**: ladder resets on a dead spin or at spin end; cheap excitement, minimal RTP shift [observed] [S11].
- Volatility ordering (same RTP budget): resetting-base < cascade ladder < per-symbol summed < persistent feature < multiplicative wild stacking [inferred — from tail-mass reasoning consistent with S11/S26/S36].

### 5. Bonus mechanics

- **Free spins**: dominant bonus form. Trigger 3+ scatters (5×3/5×4 games) or 4+ (6×5 scatter-pays; Gates of Olympus awards 15 spins at 4+) [observed] [S4s][S9]. Spins play at the triggering bet [observed] [S4s]. Feature typically uses its own strips (more wilds/premiums) [observed] [S27].
- **Enhanced free spins**: paid-tier or higher-scatter variants with guaranteed floors (Sweet Bonanza 2500 "Super Free Spins" with minimum 20x multiplier) [observed] [S19].
- **Hold-and-respin**: trigger commonly 6+ coin symbols; 3 respins; every new lock resets counter to 3; ends at counter 0 or full grid; all values + jackpots pay at end [observed] [S12][S13][S14]. Grid-fill often awards the Grand (e.g., 5,000x for 15/15) [observed] [S14]. RTP concentrates into the feature; base "may feel limited" [observed] [S12].
- **Pick bonuses / prize wheels**: outcome must be predetermined server-side; picks reveal, never decide, in most implementations — if picks genuinely matter, GLI-19 single-player-input recovery rules apply (return player to pre-interruption state) [mandatory] [S3].
- **Feature/modifier selection**: player chooses volatility flavour (Immortal Romance-style: choose 10/15/20/25 spins with inversely scaled multipliers) — all options must sim to ~equal RTP [observed + recommended] [S4s].
- **Random modifiers ("base-game events")**: RNG-scripted top-ups (random wilds, symbol upgrades). Guaranteed modifiers: deterministic per tier (FitH3 6-scatter tier guarantees a Persistent Dwarf) [observed] [S22].
- **Branching / multi-stage bonuses**: distinct phases (Wanted Dead or a Wild's Dead Man's Hand: collection respins phase then showdown spins with accumulated multiplier applied) [observed] [S28]. Each stage = state-machine states + separate sim stats.
- **Feature upgrades**: in-feature promotion to a higher tier (upgrade meters); internally: transition `feature_active → feature_upgrade step → super_feature_active` semantics.
- **Retriggers**: add spins to the current round; accumulated state (sticky wilds, multipliers) carries over [observed] [S27]. Norms: +5 spins per 3 extra scatters (Gates) [S9][S10]; caps commonly ~5–10 retriggers or a total-spins cap; Big Bass Bonanza caps at 3 retriggers of +10 with escalating 10x multiplier; some games are uncapped (Cat Wilde: Doom of Dead) [observed] [S27]. Caps exist to bound single-activation exposure — a structural liability safeguard, always printed in the paytable [observed/recommended] [S27].
- **Collection meters**: display continuously (RTS 3B) and restore on recovery (RTS 10B) [mandatory-GB] [S5].
- **Maximum-win events**: on reaching the cap, terminate the round, pay the cap, skip remaining presentation (`max_win_termination` step). Market caps: mainstream 5,000x–10,000x (Gates 5,000x; Ze Zeus 10,000x); frontier 100,000x+; published record 500,000x (Nolimit Tombstone Slaughter, Jan 2025; cap probability ≈ 1 in 189M; first hit 2025-03-09) [observed] [S34]. Max-win termination behaviour must be in rules and simulated [recommended] [S34].
- **Bonus buys**: see §8.
- **Enhanced-chance / ante-bet**: see §8.
- **Fixed jackpots**: paytable entries (Mini 25x/Minor 50x/Major 150x/Grand 5,000x scale) [observed] [S14] — no GLI-12 burden.
- **Progressive-jackpot adapters**: pull in GLI-12 (v2.1 of 2011-09-06 still widely adopted, e.g., Massachusetts; v3.0 published 2026-01) [mandatory where progressive] [S31][S33]: seed (base) amount rules (GLI-12 §2.5.12: seed must keep total payout above minimum-percentage requirement), meters ≥99.99% accurate in NV-RAM, accurate contribution processing, ordered multi-trigger resolution; linked games must give equal hit probability per wager increment (58 Pa. Code §461a.12 pattern); must-hit-by = RNG preselects award point within [floor, ceiling] [observed/mandatory] [S31][S32][S33]. UKGC RTS 9A/9B: jackpot rules must state seed, ceiling, combined/split RTP, simultaneous-trigger policy [mandatory-GB] [S5]. Recommendation: the skill's default game uses FIXED jackpots only; progressives are an adapter interface stub [inferred — scope control].

### 6. The 3/4/5-scatter bonus-tier hierarchy — how real studios differentiate

Two dominant industry patterns [observed]:

1. **Same feature, scaled entry** (most common): more scatters ⇒ more spins and/or an instant scatter pay, same state machine. Textbook 3→10, 4→15, 5→20 spins [S4s]; scatter pays alongside (Book of Dead: 3 scatters = 2x + 10 FS, 4 = 20x + 10 FS; DoA: 3 = 4x + 12 FS) [S4s]; Gates Super Scatter instant pays 4=3x, 5=5x, 6=100x [S9][S10].
2. **Materially different tiers** (what our skill mandates): scatter count changes the *structure*:
   - Fire in the Hole 3 [S22]: 3 scatters ⇒ 2 rows open + 3 respins; 4 ⇒ 3 rows; 5 ⇒ 4 rows; 6 ⇒ 4 rows + guaranteed Persistent Dwarf. More rows ⇒ more coin positions and enhancer exposure ⇒ genuinely different EV and distribution per tier.
   - Fire in the Hole xBomb [S15][S16]: buy tiers 100x/200x/400x for guaranteed 3/4/5 scatters; **RTP equal across tiers, volatility rises with tier** — a clean, certifiable pattern.
   - Hacksaw Wanted Dead or a Wild [S28]: three *different bonuses* (not one bonus scaled): sticky-wild spins (80x buy, 96.27% RTP, medium vol), expanding VS-wild duel spins with additive 2x–100x multipliers (200x, 96.33%, very high vol), and a two-phase collection feature (400x, 96.43%, high vol) — per-tier RTP rises slightly with price.
   - Money Train 4 [S23]: counter-example — 3/4/5 scatters enter the SAME hold-feature, extra scatters only add seed value (each trigger scatter reveals up to 10x); differentiation is earned in-round via row unlocks (6×4→6×8).
   - Sweet Bonanza 2500 tiered buys [S19]: 100x standard FS / 500x Super FS (min 20x multiplier floor) / 1,000x Super FS 2 — tier = guaranteed floor state, a "more favorable multiplier distribution" implementation.

   Levers observed across these titles for making a higher tier "clearly stronger": more rounds; higher starting multiplier; larger/opened grid; guaranteed persistent modifier; multiplier floors; richer strips/weights; extra instant pay. All map 1:1 onto the enhancement lists in prompt.txt §3 [observed] [S19][S22][S23][S28].
   Implementation styles observed: separate reel sets per tier (strip swap), same state machine with tier config (FitH3 rows), or entirely separate state machines per tier (Hacksaw). Buy menus expose tiers at separate price points [observed] [S15][S22][S28].

### 7. Scatter counting rules under cascades

- In Pragmatic tumble games, scatters are not part of win combinations, so they **remain on the grid during cascades**, and scatters landing on later tumbles **accumulate toward the trigger threshold within the same spin** [observed] [S9][S10][S11]. This is a deliberate design choice, not a universal rule.
- Retrigger counting: extra scatters during free spins award +5 spins per 3 scatters (Gates) [observed] [S9][S10].
- 6+ scatters commonly map to the top tier plus an extra award (FitH3 6-scatter guarantee; Gates Super Scatter 6 = 100x instant) [observed] [S9][S22].
- Copied/transformed scatters: Nolimit's xSplit explicitly upgrades a scatter to a "Super Scatter" rather than duplicating it — duplication of scatters is generally avoided because it makes trigger frequency depend on modifier math [observed + inferred rationale] [S20].
- The skill's default (`countingRule: "initial-grid"`, cascaded/copied scatters don't count) is the CONSERVATIVE end of observed practice: it decouples trigger frequency from cascade math, making the trigger probability derivable from strip weights alone — simplest to certify [inferred — simulation-complexity argument]. Enabling `countCascadedScatters` (Pragmatic style) requires trigger frequency to be measured by simulation, not closed form [inferred].
- Scatter reel placement: 5-reel games commonly restrict scatters to reels 1/3/5 or all reels ≤1 per reel; 6×5 pay-anywhere games allow scatters anywhere [observed] [S4s][S9]. ≤1 scatter per reel column keeps anticipation staging legible [recommended].
- Scatters usually pay independently of lines only in some designs (Book of Dead 3+ scatter pay) and usually do NOT substitute as wilds [observed] [S4s].

### 8. Bonus buy, enhanced-chance and ante-bet norms

- **Buy price points**: 75x–200x typical for a standard free-spins buy; 100x is the de-facto anchor (Pragmatic standardised 100x; Money Train 2 100x; Fruit Party 2 100x) [observed] [S15][S16][S18]. Tiered menus: 60x–4,000x (FitH3 60/200/500/4,000) [S22]; 80/200/400 (Wanted) [S28]; 100/500/1,000 (Bonanza 2500) [S19]; 100/500 (MT4 standard/persistent) [S23].
- **Buy RTP deltas**: three observed patterns — (a) buy RTP slightly ABOVE base (≈96.5% vs 96.1% pattern; compensates lost base-game value) [S15][S16]; (b) near-identical (Big Catch Bass Fishing 95.01% base vs 95.05% buy) [S17]; (c) identical across tiers with volatility rising by tier (FitH xBomb) [S15]. Deltas are typically ≤ ~0.4 pp and must be disclosed in the game rules [observed] [S15][S16][S28].
- **Buy price ≈ inverse trigger rate**: a 100x buy roughly matches a 1-in-100–1-in-200 natural trigger cost; price each tier ≈ (naturalTriggerOdds × tier share) adjusted so buy RTP lands on target [observed pattern + inferred formula] [S16][S17].
- **Ante-bet norms**: classic Pragmatic ante = +25% stake (1.25x) for ~2× trigger chance; activating ante disables the buy and vice-versa [observed] [S18]. Variants range wider: 2x stake for 7× chance (Book of Monsters), 2.5x for ~8× chance and 12x for ~10× chance + multiplier floor (Bonanza 2500) [observed] [S18][S19]. Mechanically: ante swaps in an alternative reel set with more scatters — ante mode therefore needs its own certified strips and sim run [observed/inferred] [S18].
- **Retrigger norms under buys**: bought bonuses use the same retrigger rules as natural triggers [observed] [S15][S28].
- **Jurisdiction**: buys stripped in GB (and demo builds there too); the ante remains available in GB and is sometimes positioned as the substitute [observed] [S8][S35].

### 9. Per-mechanic engineering dimensions (cross-cutting guide)

For the 13 explanation dimensions demanded by prompt.txt §2, family-level guidance the authoring agents should apply per selected mechanic:

- **Trigger condition / state transition**: every mechanic must be expressible as outcome-manifest steps (`initial_result | cascade | respin | feature_round | feature_trigger | feature_retrigger | feature_upgrade | jackpot_award | max_win_termination`); anything that can't be serialised as steps is out of scope [inferred — architecture constraint, CONVENTIONS §7].
- **Math impact / RTP contribution**: allocate an explicit RTP budget line per mechanic in the PAR sheet. Reference splits [observed/inferred]: line-pay-only game ≈ 100% base; classic FS game ≈ 65–80% base / 20–35% feature; bonus-heavy hold-and-win or high-volatility cascade games can carry 40–70%+ of RTP in features (some titles are documented at 70%+ top-loaded) [observed] [S16][S12].
- **Volatility impact**: rank added mechanics on the ladder in §4; combining two "extreme" levers (multiplicative wilds + persistent multipliers) multiplies tail mass and forces either a low hit-rate or a hard cap review [inferred].
- **Presentation/animation/audio**: each mechanic needs land/activate/resolve events (`anim.*`, `sfx.*` per CONVENTIONS §4.3), a reduced-motion variant, and win-tier gating so no celebration fires for win ≤ stake in GB (RTS 14F) [mandatory-GB] [S5].
- **Recovery**: any mechanic with cross-spin state (sticky/walking wilds, meters, locks, opened rows, persistent multipliers, respin counters) MUST serialise into round state and restore on `recovering` (GLI-19 §4.16, RTS 10) [mandatory] [S3][S5].
- **Mobile readability**: symbol value chips, multiplier badges, meters legible at 1/5–1/6 screen-width columns in portrait; ≥ 4.5:1 contrast; avoid >6×6 grids with per-cell text on phones [recommended — a11y norms + S12 (hold-features "optimised for mobile: readable coin values, simple loop")].
- **Performance**: PixiJS v8: spritesheet-batch everything (16-texture batch limit), ParticleContainer for coin/spark bursts (~1M particles vs ~200k sprites at 60 fps on M3-class), BitmapText for counters, minimize masks (reel masks are the expensive unavoidable one), object-pool symbols, texture GC with staggered destroys [observed — vendor docs] [S30][S37]. Cost ranking: standard wilds/stacks (trivial) < cascades (refill pooling) < expanding/oversized (re-layout) < particle-heavy modifiers < multi-board topologies [inferred].
- **Testing/certification complexity** (ascending) [inferred, grounded in S1–S3 audit scope]: strip-weight-only mechanics (stacked/standard wilds) < per-symbol value tables (cash/multiplier symbols) < cascade systems (termination proof + sequence sim) < persistent-state features (recovery matrix) < player-choice bonuses (input-state recovery) < progressives (GLI-12 adds controller/meter audits).

### 10. Worked example — the 13 required dimensions applied to the two highest-complexity families

**Free spins (scatter-triggered), fully worked** [synthesis of S4s/S9/S10/S27; tags inline]:
- *Trigger condition*: N scatters on the initial paid-spin grid (default counting rule §7); tier by count 3/4/5+ [observed] [S4s].
- *State transition*: `outcome_committed → presenting_initial_result → feature_pending → feature_entry → feature_active (loop: feature_round steps) → [feature_retrigger]* → feature_summary → round_complete`. The full feature is contained in one round's outcome manifest; it is ONE game cycle for RTS 14D purposes [mandatory-GB] [S5].
- *Mathematical impact*: EV(feature) = triggerProb × E[spins incl. retriggers] × E[win per feature spin on feature strips]. Feature strips are a separate certified artifact [observed] [S27].
- *Volatility impact*: raises variance vs paying the same EV as line pays; variance scales with feature rarity × feature payout spread; a 1/200 trigger paying avg 60x is far more volatile than 1/50 paying 15x at equal RTP [inferred — standard variance decomposition].
- *RTP contribution*: 20–35% of total in classic designs; report separately per tier [observed/inferred] [S16].
- *Presentation*: entry transition (1.5–3 s), environment swap, spins-remaining + accumulated-win HUD (state display satisfies RTS 3B) [mandatory-GB] [S5].
- *Animation*: `anim.feature.enter/retrigger/summary`; scatter-land escalation per scatter count; countup on summary.
- *Audio*: `music.feature` stem swap; retrigger stinger; summary fanfare scaled by win tier (never celebrate ≤ stake, RTS 14F) [mandatory-GB] [S5].
- *Recovery*: resume mid-feature at exact spin index with accumulated state (spins left, multiplier, sticky map) [mandatory] [S3][S6].
- *Mobile readability*: HUD chips ≥ 44 px touch targets; spins-left counter top-center convention [recommended].
- *Performance*: environment swap = texture-atlas swap (preload during entry animation to avoid hitching) [recommended] [S30][S37].
- *Testing*: per-tier sim blocks; retrigger-cap boundary tests; recovery matrix at every feature step type.
- *Certification complexity*: moderate — extra reel strips + tier math; the recovery matrix is the main audit surface [inferred grounded in S1/S3].

**Hold-and-respin, fully worked** [S12][S13][S14][S23]:
- *Trigger*: 6+ `CASH` symbols on one paid spin (base) or via tier entry (our super/ultimate variants may seed extra starting coins).
- *State transition*: coins lock; grid switches to `BLANK`-background respin mode; counter starts at 3; any new lock resets to 3; end at 0 or full grid; sum all values (+jackpots); grid-fill awards `JP_GRAND`.
- *Math*: terminating Markov chain — state = (locked set, counter); absorption guaranteed since locks are monotone and grid is finite. E[total] driven by per-cell landing probability of coin symbols on respin strips and the value distribution (1x–10x commonplace) [observed] [S12][S14].
- *Volatility*: high; collectors/boosters/persistent payers create the tail; cap persistent-symbol count to bound liability [observed/inferred] [S23].
- *RTP contribution*: hold-features typically carry the majority of feature RTP in games built around them; base game intentionally lean [observed] [S12].
- *Presentation/animation*: lock thunk + value pop per coin; counter reset flash; per-jackpot lockup sequence; `anim.feature.summary` totals.
- *Audio*: heartbeat loop that intensifies as counter drops; distinct jingle per jackpot tier.
- *Recovery*: state = locked map with values + counter + active modifiers; trivially serialisable; must restore exactly [mandatory] [S3][S5].
- *Mobile*: coin value text is the readability bottleneck — BitmapText, ≥ 24 px, high-contrast plate behind the number [recommended] [S12][S30].
- *Performance*: cheap — mostly static grid + occasional lock VFX; the summary coin-shower is the only particle-heavy moment [inferred] [S30].
- *Testing*: absorption proof; counter-reset edge cases (lock on last respin); full-grid + cap interaction; jackpot-award ordering.
- *Certification*: moderate-high if jackpot symbols are present (award-order and meter rules attract scrutiny; fixed tiers keep it out of GLI-12 scope) [inferred] [S31].

### 11. Default tier parameter sheet (encodes prompt.txt §3's required definitions)

Values are the skill's AUTO defaults; the math agent must re-derive payout stats by simulation and overwrite the placeholder columns marked ⌀ before release.

| Parameter | `feature` (3 scatters) | `super_feature` (4) | `ultimate_feature` (5+) |
|---|---|---|---|
| Free spins awarded | 10 | 12 | 15 |
| Starting multiplier | 1x | 1x, ladder persists across spins | 3x global, persists & collects |
| Active modifier | cascade ladder (per-spin) | + guaranteed random-wild event / 3 spins | + sticky wilds persist; exclusive `FX1` collector |
| Reel strips / weights | feature strips (wild ×1.5) | separate strips (premium ×1.3, one low removed) | separate strips + exclusive symbol |
| Retrigger rule | +5 spins per 3 scatters | same | same |
| Max retriggers | 3 | 4 | 5 |
| Trigger frequency (natural) | ~1/220 spins | ~1/1,200 | ~1/6,000–1/10,000 |
| RTP contribution | 0.24 | 0.07 | 0.03 |
| Avg / median payout (x bet) | ⌀ sim (target ~35 / ~18) | ⌀ sim (~90 / ~45) | ⌀ sim (~300 / ~140) |
| Payout percentiles | p50/p90/p99/p99.9 from sim | same | same + tail distribution table |
| Max payout | ≤ max-win cap | ≤ cap | = cap reachable; `max_win_termination` defined |
| Avg duration | ~25 s | ~35 s | ~55 s |
| Entry animation | `anim.feature.enter` 2.0 s | `anim.super_feature.enter` 2.5 s, distinct VFX | `anim.ultimate_feature.enter` 3.0 s, exclusive VFX |
| Environment | recolored base scene | new background variant | exclusive environment |
| HUD | spins left + total win | + modifier tracker | + multiplier collector meter |
| Audio state | `music.feature` | `music.super_feature` | `music.ultimate_feature` (exclusive adaptive stems) |
| Exit summary | total win + spins used | + modifier stats | + max-win sequence if cap hit |
| Recovery | resume at spin index + ladder state | + modifier schedule state | + sticky map, collector meter, global mult |
| Bonus-buy price (where legal) | 100x | 250x | 500x |
| Max exposure | n/a | n/a | cap × 1 round; document liability |

This satisfies every "must define" bullet of prompt.txt §3 with a concrete, overridable default, and the tier-separation pattern matches the strongest observed market practice (FitH3 structural tiers [S22]; Hacksaw distinct-bonus tiers [S28]; Bonanza-2500 floor-state tiers [S19]).

---

## Source register

| id | name | type | pub/revision date | jurisdiction | URL | supports |
|---|---|---|---|---|---|---|
| S1 | GLI-11 Gaming Devices in Casinos v3.0 | standard | 2016-09-22 | multi (GLI-adopting) | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | outcome integrity, no secondary decision, game recall |
| S2 | GLI-11 v2.0/v2.1 (ch.3 software) + rule-diff docs | standard | 2007–2011 | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v2-0-Standard-FINAL.pdf ; http://digdia.com/slots/GLI-11%20v2.1%20Gaming%20Devices%20in%20Casinos%20Chapter%203.pdf | near-miss prohibition wording, 75% min RTP, free-games rules history |
| S3 | GLI-19 Interactive Gaming Systems v3.0 | standard | revised 2020-07-17 (PDF hosted at a 2024-06 upload path; v3.0 current as of 2026-08) | multi (online) | https://gaminglabs.com/wp-content/uploads/2024/06/GLI-19-Interactive-Gaming-Systems-v3.0.pdf | §4.16 incomplete games, RNG/adaptive prohibitions |
| S4 | GLI-12 Progressive Jackpots v2.1 / v3.0 | standard | 2011-09-06 / 2026-01 | multi | https://gaminglabs.com/wp-content/uploads/2026/01/GLI-12-v3-0-FINAL.pdf | seed rules §2.5.12, meter accuracy, multi-trigger ordering |
| S4s | Slots feature/paytable explainers (SlotsOnlineCanada; win.gg; covers.com; pokerlistings) | industry-press | 2023–2026 | global | https://www.slotsonlinecanada.com/symbols-bonus-features/ ; https://win.gg/scatter-mechanic-online-slots/ | 3/4/5→10/15/20 convention, scatter pays, Book of Dead / DoA numbers |
| S5 | UKGC Remote Technical Standards (explorer summary of RTS 2,3,7,8,9,10,13,14) | regulator (summarised) | RTS current rev. (2021 update in force) | GB | https://gamingcompliance.io/ukgc/remote-technical-standards/ | 2.5 s cycle 14D, turbo ban 14E (+bonus exception), LDW 14F, autoplay 8A, state display 3B, jackpot rules 9A/B, interruptions 10, RNG 7A–E |
| S6 | UKGC RTS 10 Interrupted gambling (official page) | regulator | current | GB | https://www.gamblingcommission.gov.uk/report/young-people-and-gambling-2022/rts-10-interrupted-gambling | interruption fairness, state restoration |
| S7 | SBC News — UKGC bans autoplay & quickspin | industry-press | 2021-02-02 | GB | https://sbcnews.co.uk/igaming/2021/02/02/ukgc-bans-online-slots-autoplay-and-quickspin-features/ | Oct 2021 rule set, McArthur quotes |
| S8 | Casino Professor — Bonus buy slots UK | industry-press | 2024–2026 | GB | https://casino-professor.com/en/casino-guides/bonus-buy-slots-uk/ | buy ban mechanism via RTS 14a wording, UK builds strip buys |
| S9 | Pragmatic Play — Gates of Olympus Super Scatter (official game page) | vendor-docs | 2025 release | global | https://www.pragmaticplay.com/en/games/gates-of-olympus-super-scatter/ | tumble rules, scatter pays 4/5/6, FS awards |
| S10 | MSport help — Gates of Olympus 1000 game guide (operator copy of official rules) | vendor-docs (operator) | 2025 | global | https://msportsupport.zendesk.com/hc/en-us/articles/39774921309335 | unlimited tumbles, 15 FS at 4+, +5 per 3 retrigger, orb 2x–500x summing |
| S11 | Slingo guides — tumble mechanics / multiplier features; slotrandomizer cascading explainer | industry-press | 2025–2026 | global | https://www.slingo.com/blog/guides/understanding-tumble-mechanics-in-gates-of-olympus-1000/ ; https://slotrandomizer.com/blog/cascading-wins-explained/ | cascade volatility profile, ladder progressions, Gonzo's 1/2/3/5 & 3/6/9/15 |
| S12 | BGaming — Hold & Win slot mechanics explained | vendor-docs | 2026-08-03 | global | https://bgaming.com/articles/hold-win-slot-mechanics-explained | 3-respin reset, end conditions, RTP 94–97%, mobile-first notes |
| S13 | 1spin4win — What are hold and win slots | vendor-docs | 2024–2025 | global | https://www.1spin4win.com/blog/what-are-hold-and-win-slots | trigger norms (6+ coins), tier structure |
| S14 | LeoVegas hold & win roundup (Playson Energy Joker values) | industry-press | 2025 | global | https://www.leovegas.com/en-ca/blog/online-casino/slots-themes/hold-and-win-slots | coin 1x–10x, Mini 25x/Minor 50x/Major 150x/Grand 5,000x |
| S15 | Bigwinboard — bonus buy slots database + FitH xBomb data | industry-press | continuously updated, 2024–2026 | global | https://www.bigwinboard.com/bonus-buy-slots/ | buy price norms, FitH xBomb 100/200/400 equal-RTP tiers, Money Train 2 / Fruit Party 2 examples |
| S16 | iGaming Wheel — bonus buy math guide | industry-press | 2025 | global | https://igamingwheel.com/guides/bonus-buy-guide | buy-vs-base RTP pattern (96.5 vs 96.1), price↔trigger-odds equivalence, top-loaded RTP |
| S17 | Wizard of Vegas forum — value of buying bonus (Big Catch Bass Fishing) | academic/forum (math community) | 2023–2024 | global | https://wizardofvegas.com/forum/gambling/slots/39411-how-to-determine-the-value-of-buying-bonus-game/ | 95.01% base vs 95.05% buy datapoint |
| S18 | Casino Hipster — Pragmatic ante bet explained; JPU ante breakdown | industry-press | 2025 | global | https://casinohipster.com/blog/pragmatic-play-the-ante-bet-bet-multiplier-variant-explained/ | 1.25x ante ⇒ ~2x trigger, ante disables buy, Book of Monsters 2x⇒7x |
| S19 | Bigwinboard — Sweet Bonanza 2500 review | industry-press | 2025 | global | https://www.bigwinboard.com/sweet-bonanza-2500-pragmatic-play-slot-review/ | tiered buys 100/500/1000, ante variants 2.5x/12x, 20x multiplier floor |
| S20 | Hideous Slots — Nolimit City mechanics explained | industry-press | 2024–2025 | global | https://hideousslots.com/news/nolimit-city-symbols-explained/ | xWays/xNudge/xSplit/xBomb behaviour, scatter→super-scatter |
| S21 | FruitySlots — Nolimit xMechanics guide | industry-press | 2025 | global | https://fruityslots.com/slots/mechanics/x-mechanics/ | mechanic timeline (2018–2021), trademark/licensing status |
| S22 | Hideous Slots + FruitySlots + Bigwinboard — Fire in the Hole 3 reviews | industry-press | 2024–2025 | global | https://hideousslots.com/slot-review/fire-in-the-hole-3/ | 3/4/5/6-scatter row tiers, 60/200/500/4000 buys, 70,000x cap, persistent symbols |
| S23 | FruitySlots / MrQ / Hideous Slots — Money Train 4 reviews | industry-press | 2024 | global | https://fruityslots.com/slots/reviews/money-train-4/ | 96.10% RTP, 150,000x cap, 6×4→6×8, scatter seed values ≤10x, 100x/500x buys |
| S24 | Big Time Gaming official news — Megaways licences (Gauselmann/Merkur/Blueprint) | vendor-docs | 2018–2023 | global | https://www.bigtimegaming.com/news/big-time-gaming-licenses-megaways-to-gauselmann-merkur-blueprint | Megaways as patented licensed mechanic, Megapays/Megaclusters add-ons |
| S25 | CasinoBeats — Jelly gains Megaways licence; Bigwinboard Blueprint deal | industry-press | 2023-02-07 / 2018 | global | https://casinobeats.com/2023/02/07/jelly-megaways-licence-must/ | licensing model (per-title/GGR royalty, confidential), licensee list, Evolution acquisition |
| S26 | SlotGameDesign.com — Going Wild: slot math tutorial 2 | blog (practitioner math) | 2019-02-09 | global | https://slotgamedesign.com/2019/02/09/going-wild-symbols-slot-math-tutorial-2/ | additive vs multiplicative wild line math, PAR complexity |
| S27 | VegasSlotsOnline — retriggering; retrigger-cap explainers | industry-press | 2024–2026 | global | https://www.vegasslotsonline.com/features/retriggering/ | retrigger accumulation rules, 5–10 cap norm, Big Bass 3-retrigger example, feature-strip scatter weighting |
| S28 | Galaxy of Slots / Racing Post / FruitySlots — Wanted Dead or a Wild reviews | industry-press | 2024–2025 | global | https://galaxyofslots.com/wanted-dead-or-a-wild | 80x/200x/400x buys with 96.27/96.33/96.43% tier RTPs vs 96.38% base, 12,500x cap, per-tier volatility |
| S29 | Galaxy of Slots / Casinos.com — Reactoonz reviews | industry-press | 2024–2026 | global | https://galaxyofslots.com/reactoonz | quantum meter 25/level, 4 features, Gargantoon split chain, 96.51% / 4,570x, Instability |
| S30 | PixiJS official — Performance Tips + ParticleContainer v8 blog | vendor-docs | 2024–2025 (v8) | n/a | https://pixijs.com/8.x/guides/concepts/performance-tips ; https://pixijs.com/blog/particlecontainer-v8 | batching, 1M-particle benchmark, BitmapText, masks |
| S31 | Wizards.us — validating a progressive jackpot system | blog (practitioner) | 2024–2025 | multi | https://wizards.us/blog/progressive-jackpot-system/ | contribution-rate math-model & audit-trail practice |
| S32 | Know Your Slots — must-hit-by progressives overview | blog (practitioner) | 2020–2024 | US | https://www.knowyourslots.com/must-hit-by-progressives-an-overview/ | MHB RNG-selected award point |
| S33 | 58 Pa. Code §461a.12 Progressive slot machines (via Cornell LII) | regulator | current | US-PA | https://www.law.cornell.edu/regulations/pennsylvania/58-Pa-Code-SS-461a-12 | equal probability across linked machines, meter rollback limits |
| S34 | OnlyiGaming / Spinaspin / iGamingToday — max-win records & 2025 trend pieces | industry-press | 2025–2026 | global | https://onlyigaming.com/news/top-10-slots-highest-max-win-multipliers-2026 | 5–10k mainstream norm, 500,000x record + 1-in-189M probability, record list |
| S35 | Slots Temple — bonus buy ban explainer | industry-press | 2024–2026 | GB | https://www.slotstemple.com/news-and-blog/bonus-buy-ban-everything-you-need-to-know/ | UK buy removal incl. demos |
| S36 | Wild-mechanics guides (Borgata; WorstCasino sticky-wilds; LuckyTiger; DesignEntrepreneurshipWorkshop) | industry-press | 2024–2026 | global | https://www.borgataonline.com/en/blog/how-expanding-wilds-and-sticky-wilds-work-in-slot-games/ ; https://worstcasino.com/slots/sticky-wilds/ | wild taxonomy, 3–5 respin norm, DoA2/Starburst XXXtreme numbers, Wild Toro |
| S37 | Gamixlabs — optimizing HTML5 slot performance | vendor-docs (studio) | 2024–2025 | n/a | https://gamixlabs.com/blog/optimizing-performance-in-html5-slot-games-for-mobile-and-web/ | draw-call reduction, pooling, adaptive quality for slots |

Notes: S5 is an editorial restatement of the RTS — verify exact wording against the Gambling Commission's published RTS before legal reliance. GLI PDFs (S1–S4) are primary and freely downloadable from gaminglabs.com.

---

## Uncertainties & legal-review items

1. **UKGC bonus-buy ban date/mechanism** — LARGELY RESOLVED (2026-08 follow-up): the ban rests on the Commission's January 2020 enforcement position under RTS 3A + 14A (warning after finding six operators offering feature buy-ins priced up to £3,000; all removed the feature; no consultation was held because the UKGC treated buys as a breach of existing standards). No 2026 formalisation exists — the "June 2026" claim in low-authority press was not substantiated; the actual 2026 RTS changes concern wagering-requirement caps (10×, from 2026-01-19) and RTS 12B financial limits (2026-06-30). Legal review should still confirm current LCCP/RTS wording before shipping GB jurisdiction copy. [S8][S35]; cross-ref research/05 S51–S52.
2. **RTS summaries are secondary** — RTS section texts here come from a compliance explorer (S5), not the regulator's verbatim PDF. Verify RTS 14E's bonus-game exception wording and RTS 3B's state-display scope directly.
3. **"GLI-11 v3.1" does not appear to exist** — latest confirmed public version is v3.0 (2016). If a client contract cites 3.1, treat as an error to resolve. [S1]
4. **Retrigger-cap "regulatory" claims** — the claim that UK design rules cap free-spin rounds (~100 per activation) comes from low-authority press; no RTS citation found. Treat caps as [recommended] liability engineering, not [mandatory], pending legal review. [S27]
5. **Megaways patent scope** — the trademark is clearly licensed; the exact patent claim boundaries around "random symbol count per reel" as a math pattern (vs the branded implementation) are not public. Our variable-height default stays off unless IP review clears the specific design. [S24][S25] [inferred]
6. **RTP-split norms (base vs feature)** are aggregated from reviewer data and one practitioner guide, not from certified PAR sheets; the 65–80%/20–35% split is [inferred] scaffolding — final numbers must come from our own simulation.
7. **Ante-bet trigger multipliers** (2x for 1.25x) are per-title and vendor-stated; no certification document verifies the "2x" figure publicly. [S18]
8. **Nolimit tier-equal-RTP claim** (FitH xBomb 100/200/400 same RTP) is from a reviewer database, not Nolimit's published rules; verify per generated game with our own sim anyway. [S15]
9. **BGaming article date (2026-08-03)** post-dates training data and was fetched live; content is consistent with earlier sources. [S12]
10. **Scatter-counting under cascades**: Pragmatic's official rules describe scatters persisting through tumbles; whether ALL their titles count mid-tumble scatters toward triggers (vs. only display them) is not explicitly documented — tagged [observed] on Gates-family only. [S9][S10]

---

## Design implications for the Skill

Concrete defaults and rules downstream authoring agents must encode. Everything here is consistent with CONVENTIONS.md §4/§5/§9 and prompt.txt §2–3.

### D1. Mechanic selection policy
- Select 1 wild mechanic + 1 grid/symbol mechanic + 1 multiplier system + the mandatory 3-tier scatter bonus as the default "modern" loadout. Hard cap: ≤ 2 "extreme-volatility" levers (multiplicative wild stacking, persistent feature multipliers, uncapped collectors) per game; combining more forces max-win-cap re-review.
- Every chosen mechanic gets a PAR-sheet RTP budget line and a one-line purpose statement in the GDD (enforces prompt.txt "no mechanics for feature count").
- Never use trademarked mechanic names: Megaways, Megaclusters, Megapays (BTG/Evolution), xWays/xNudge/xSplit/xBomb/xPays (Nolimit), Tumble/Avalanche as brand terms are fine to describe generically as "cascades". Generated docs must use our neutral vocabulary (`cascade`, `nudge_wild`, `split_symbol`, `exploding_wild`, `variable_reel_heights`).

### D2. Default numeric anchors (AUTO mode)
- Grid 5×4, 20 lines or ways; RTP target 0.9600; max win 10,000x (mainstream envelope: 5,000–10,000x; do not exceed 20,000x without explicit brief); hit rate 25–33%.
- `feature` natural trigger 1/180 spins (range 1/150–1/250); tier split given a trigger ≈ 82% / 15% / 3% for 3/4/5+ scatters (calibrate by strip weights so that `ultimate_feature` lands ~1/6,000–1/10,000 spins) [inferred defaults consistent with observed scatter-weight patterns].
- RTP decomposition default: base game 0.62, `feature` 0.24, `super_feature` 0.07, `ultimate_feature` 0.03 (sums to 0.96); adjust via simulation, keep each tier's contribution separately reported (CONVENTIONS rule 3).
- Cascade cap: 50 cascades/spin hard stop with `max_win_termination`-style settle step; document expected max observed ≈ 12–15 in sim.
- Retriggers: +5 spins per 3 scatters landed during any feature tier; cap total added spins at 3 retriggers (feature), 4 (super), 5 (ultimate); print caps in rules.
- Multiplier defaults: cascade ladder 1x→2x→3x→5x (base) and 2x→4x→6x→10x (features), additive steps, reset per spin in base, persistent within feature spins for super/ultimate tiers only.

### D3. Mandatory tier differentiation template (materially different, per prompt §3)
- `feature` (3 scatters): 10 free spins; cascade ladder persistent within each spin only; standard feature strips (wild weight ×1.5 vs base).
- `super_feature` (4 scatters): 12 free spins; SEPARATE reel set (premium weight ×1.3, one low symbol removed); ladder persists across all spins; one guaranteed random-wild event per 3 spins. Declared implementation: separate reel set + modified config, same state machine (`super_feature_entry/active` states).
- `ultimate_feature` (5+ scatters): 15 free spins; separate reel set AND exclusive symbol (`FX1` persistent multiplier collector); starting global multiplier 3x; sticky wilds persist for the feature; exclusive environment/music (`music.ultimate_feature`); distinct max-win sequence. 6+ scatters: same tier + instant scatter pay (6 = 20x bet) — mirrors observed 6-scatter bonuses.
- Each tier MUST have separate simulation output blocks: trigger frequency, RTP contribution, average/median payout, p50/p90/p99/p99.9 percentiles, max payout, average duration (spins and seconds), retrigger stats. (Directly satisfies prompt.txt §3 definitional lists.)
- Insufficient-differentiation linter: validation fails if two tiers differ only in spin count and/or theming fields.

### D4. Scatter counting (defaults + options)
- Ship the prompt-mandated default verbatim: `{"countingRule":"initial-grid","countCascadedScatters":false,"countCopiedScatters":false,"featureBonusScatters":3,"superFeatureScatters":4,"ultimateFeatureScatters":5,"fiveOrMoreUsesUltimateTier":true}`. (Skill-INPUT vocabulary — `schemas/skill-input.schema.json`; in `config/scatter-tiers.json` the same defaults are expressed via the `tiers[]` shape of `schemas/scatter-tiers.schema.json`: tierId + scattersRequired 3/4/5.)
- Additional schema fields with defaults: `scattersPayIndependently: false`, `scatterSubstitutesAsWild: false`, `scattersPersistDuringCascades: true` (visual persistence even when not counted), `scatterReels: "all"` with `maxPerReel: 1` for 5-reel line games / unrestricted for pay-anywhere, `sixPlusInstantPayX100: 2000`, `retriggerScatters: {count: 3, spinsAwarded: 5}`, `buyTriggerGeneration: "weighted-natural"` (buys draw from the natural conditional distribution of triggering grids, so bought and natural bonuses are statistically identical given the tier), `anticipation: {minScattersLanded: 2, onlyIfPossible: true}` (anticipation may only play when the outcome actually still contains potential scatters — never seeded into predetermined losses; near-miss rule S1/S5).
- If a brief enables `countCascadedScatters`, force trigger-frequency estimation by simulation and add a note in the par sheet that closed-form trigger math is invalid.

### D5. Bonus buy & ante defaults
- Buy menu (flag-gated by jurisdiction, default OFF for GB/unknown): `feature` 100x; `super_feature` 250x; `ultimate_feature` 500x. Buy RTP = game RTP ± ≤ 0.2 pp, equal across tiers (Nolimit pattern — cleanest to certify); volatility rises by tier; disclose per-tier buy RTP in rules.
- Price sanity rule: tierPrice ≈ (1 / conditionalTriggerRate) × baseRTP-adjustment; validation warns if implied buy RTP deviates > 0.5 pp from target.
- Ante mode (mutually exclusive with buy, Pragmatic pattern): cost 1.25x total bet; effect: swap to ante reel set with ~2× scatter weight ⇒ ~2× trigger frequency; ante reel set is a first-class certified artifact with its own sim block.
- Bought bonuses use identical retrigger rules and caps as natural triggers.

### D6. State machine & recovery obligations per mechanic
- Any mechanic with cross-spin state (sticky/walking wilds, locks, meters, opened rows/cells, persistent multipliers, respin counters, jackpot lockups) must write its full state into every outcome-manifest step it touches, so `recovering` can seek to `resumePointer` with zero re-derivation.
- Recovery acceptance test (generate per game): kill/reload at every step type × every feature tier; final balance must equal uninterrupted playthrough (GLI-19 §4.16 / RTS 10 conformance evidence for the validation report).
- Hold-and-respin (if selected): trigger 6+ `CASH` symbols; 3 respins, reset to 3 on any new lock; end at 0 respins or full grid; `BLANK` symbols only on hold grids; grid-fill pays `JP_GRAND`; jackpot scale default Mini 25x / Minor 50x / Major 150x / Grand 2,000x (kept below max-win cap; Playson-style 5,000x Grand only if cap ≥ 10,000x).

### D7. Presentation/audio/perf encoding rules
- Every mechanic registers its event triple (land/activate/resolve) in `animation-events.json` + `audio-events.json` with reducedMotion and lowPerformance variants (CONVENTIONS §9.7–8).
- Win-celebration gate: no `anim.win.*`/`sfx` celebration above `small` tier when win ≤ stake (RTS 14F; also CONVENTIONS rule 5) — implemented in the win-tier resolver, not per-animation.
- Cycle timing: spin start→next-spin-available ≥ 2.5 s in GB profile; cascades/features run inside the cycle; turbo/skip allowed only within no-extra-stake features and disabled entirely in GB profile (RTS 14D/E).
- Perf budget: all symbols + multiplier chips on ≤ 3 texture atlases; coin/particle bursts via ParticleContainer; counters via BitmapText; one mask per reel window; target 60 fps on mid-tier Android; device-profiles.json downgrades particle counts and disables ambient loops first.
- Mobile readability: value-bearing symbols (cash, multiplier orbs) render value at ≥ 24 px equivalent, contrast ≥ 4.5:1; grids > 6 columns require a portrait-specific layout review flag.

### D8. Testing & certification checklist hooks (per mechanic, into validation-report template)
- Strip-weight audit table (per reel set: base / feature / super / ultimate / ante).
- Termination proofs: cascade cap, retrigger cap, respin-reset bound (max locks = grid size ⇒ finite), walking-wild lifetime = reel count.
- No-adaptive test: identical seeds ⇒ identical outcomes regardless of history/session; presentation-mode equivalence (CONVENTIONS rule 2).
- Anticipation honesty test: anticipation events appear ONLY on outcomes where remaining reels contain live scatter possibilities.
- Max-win test: force cap-reaching manifests; verify `max_win_termination` settles exactly at cap and skips residual presentation.
- Buy/natural equivalence: distribution test that bought tier outcomes match natural conditional distributions.
- Recovery matrix as in D6.
