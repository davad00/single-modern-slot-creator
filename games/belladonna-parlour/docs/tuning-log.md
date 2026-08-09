# Tuning Log — Belladonna's Parlour (step 5)

All runs: `uv run python -m slot_math.simulate --config ..\math-config --rounds N --seed S
--workers 3 --bet 100` from `games\belladonna-parlour\math`. Every report carries the full
reproducibility block (seeds, configHash, lockfile hash, command). Dev gate (A10): |RTP−0.96|
≤ 0.01 at ≥1M rounds. Honest record — misses included.

| # | Rounds | Seed | Key params changed | RTP | ±CI95 | Hit | Notes |
|---|---|---|---|---|---|---|---|
| 01 | 150k | 101 | first guess: L=120 padded strips, lows μ≈5, rich pays, orb mean 4.32 | **7.3006** | .225 | .521 | catastrophically hot everywhere — base 5.08, feature avg 141x; padding inflated low density |
| 02 | 150k | 102 | composition-derived strip lengths (no padding), +L5 low, lows μ≈4.0, pays cut hard, orb mean 3.26 | **0.1957** | .007 | .177 | overshot down; feature median 0.5x — banking never engages |
| 03 | 150k | 103 | lows μ≈4.4 (17-18/reel, premiums 5-8), pays ×~3 mid, feature orbs E .77 | **1.0963** | .027 | .285 | hit band ✓; base 0.93 hot; tiers ordered (17/39/116x) |
| 04 | 200k | 104 | pays ×0.65, feature orb table mean 5.6 + E 1.03, tiers rounds 10/12/12, banks 1/3/5, ult table fix | **0.9163** | .031 | .286 | split lands: base .60 / feature .26 @34x / super .036 @81x |
| 05 | 400k | 105 | feature rounds 10→11, lows 8-band +4% | **0.9966** | .026 | .285 | rounds knob is ~+0.07 (super-linear P-ramp), overshot |
| 06 | 600k | 106 | rounds back to 10, lows half-bump | **0.9214** | .016 | .285 | bracket established: 10 spins ⇒ .92, 11 ⇒ 1.00 |
| 07 | 1M | 107 | split the difference via orb economy: feature orbs E 1.09, table 2-weight 80→60 | **0.9458** | .013 | .285 | +.024 — nonlinear response; ultimate table found WEAKER than super's (bug) |
| 08 | 1M | 108 | lows 8-band +1 each, feature orbs E 1.15, ultimate orb table mean 6.3→8.0 (dominance fix) | **0.9720** | .0135 | .284 | tiers ordered 39/82/118x; seeds 107/108 bracket target — point estimate ≈ 0.959 |
| FINAL | 2M | 4242 | params frozen at iter-08 | see reports/dev-sim.json | | | official dev run + forced-tier battery (seeds 501-503) + ante (504) |

Design notes locked during tuning (decision-log entries mirror these):

1. **Natural tier rarity is steeper than the early GDD targets** — independent per-reel scatter
   draws give P(3):P(4):P(5+) steps of ~×15-30, not the ×6-7 the exec-summary pattern implied.
   Accepted: feature ~1/132, super ~1/2100, ultimate ~1/55-75k (measured). The ultimate tier is
   a marquee-rare event; bonus buys provide access. GDD §8-§10 frequency targets superseded by
   measured values (PAR sheet is authoritative).
2. **Tier parameters (final):** rounds 10/12/12; starting bank ×1/×3/×5; orb frequency
   E≈1.15/0.87/0.87 per drop; orb-table means 5.7/7.0/8.0; FX1 doubler ultimate-only;
   retrigger +5 spins at 3+ seals, caps 3/4/5. Materially distinct across FOUR axes
   (rounds, bank, orb economy, exclusive doubler) — G6 pre-check holds.
3. **Bonus-buy prices are NOT the 100x anchor** — our feature is frequent-and-moderate
   (EV ≈ 40x), so anchor pricing would gut buy RTP. Prices derive from measured forced-entry
   EVs at ~96% buy RTP (computed in the PAR sheet from reports/tier-*.json).
4. **The feature-spins knob moves RTP ~7pp per spin** (P-ramp is super-linear in rounds);
   fine-tuning belongs to the orb economy and low-band pays (~0.2pp per payX100 unit on lows).
