<!-- Structure follows templates/par-sheet.md; every value below is MEASURED from the
     frozen simulation battery or exactly computed from the config bundle. Nothing is a
     target unless explicitly labelled "design target". -->

# PAR Sheet — Belladonna's Parlour (rtp-96)

| Field | Value |
|---|---|
| Game name | Belladonna's Parlour |
| Project slug | belladonna-parlour |
| Game version | 0.1.0 · Math version 0.1.0 |
| Math profile | rtp-96 (only profile built this run — A4) |
| Final bundle configHash | `sha256:c3a6de0fadd9f56e9773c190aa69b55834dba77117881750aaa01a2fbb731441` |
| Date | 2026-08-08 |
| Generator | single-modern-slot-creator v1.0.0 |
| Seed policy | numpy PCG64; per-worker seeds via SeedSequence(seed).spawn(workers) |

> **Scope disclaimer (dev-grade evidence, A10/K3).** Natural-play evidence is a 3,000,000-round
> run (95% CI ±0.0077 at measured σ 6.81) plus 30,000 forced entries per tier and 400,000
> ante-mode rounds (final calibration: 500,000). Release-grade sizing (±0.1% at 99% ⇒ ~10⁹-round class at this σ) and
> rare-event max-win estimation were NOT executed on this hardware and are
> REQUIRED-BEFORE-CERT. Numbers are reported exactly as measured with their intervals.

> **Hash provenance note.** The main battery (dev + 3 forced-tier runs) executed at bundle
> hash `sha256:906cff0c…b80a05`. The final bundle (`c3a6de0f…31441`) differs ONLY in the
> `ante` reel set (ante calibration after the battery) — verified by strip-level diff: the
> base/feature/super_feature/ultimate_feature strips those runs used are byte-identical.
> The ante report carries the final hash.

## 1. Game identification & math profile

| Property | Value |
|---|---|
| Archetype | `scatter_pays` 6×5 pays-anywhere (bands 8-9 / 10-11 / 12+) + cascades (cap 20/spin) |
| Mechanics | `cascades` (primary), `summed_orb_multiplier` (MULT essence orbs; persistent bank in features), `multiplier_doubler` (FX1, ultimate only), tier hierarchy 3/4/5+ |
| Target RTP | 0.9600 |
| **Measured RTP (3M natural rounds)** | **0.9651 ± 0.0077 (95% CI)** — |Δ| = 0.0051 ≤ dev gate 0.01 → **PASS** |
| Hit frequency | 0.2849 |
| Volatility | σ = 6.81 per-spin x-bet (variance 46.4) → class **medium-high** at dev size |
| Max win cap | 10,000× bet (enforced; see §8) |
| Bets | min 10 / default 100 / max 10,000 minor units |
| Avg cascades per round | 0.640 |
| Retrigger rate (share of features retriggering) | 0.078 |

## 2. RTP decomposition (measured, sums exactly to total)

| Win source | Contribution | Share of RTP |
|---|---|---|
| Base game (incl. base orb multipliers) | 0.61659 | 63.9% |
| Scatter (seal) pays | 0.01838 | 1.9% |
| `feature` — The Tasting | 0.28866 | 29.9% |
| `super_feature` — The Distillery | 0.03910 | 4.1% |
| `ultimate_feature` — The Night Garden | 0.00240 | 0.2% |
| **Total** | **0.96513** | 100% |

## 3. Tier table (natural play, 3M rounds)

| Tier | Triggers n | Frequency | Avg pay | Median | p99 | Max seen | Avg rounds | Retrig rate |
|---|---|---|---|---|---|---|---|---|
| feature | 22,727 | 1 in 132 | 38.1× | 21.3× | 235× | 758× | 10.4 | 0.075 |
| super_feature | 1,421 | 1 in 2,111 | 82.5× | 50.7× | 474× | 1,050× | 12.7 | 0.120 |
| ultimate_feature | 50 | 1 in 60,000 | 143.9× | 119.3× | 463× | 547× | 12.6 | 0.12 |

Exact trigger probabilities (Poisson-binomial over per-reel scatter densities, closed-form):
P(3) = 7.58×10⁻³ (1/132) · P(4) = 4.16×10⁻⁴ (1/2,403) · P(5+) = 1.33×10⁻⁵ (1/75,155).
Measured frequencies agree within sampling error. Natural rarity is steep by construction
(independent per-reel draws — tuning-log note 1); the ultimate tier is marquee-rare with
bonus-buy access where permitted.

## 4. Tier isolation (forced-entry, 30,000 entries per tier, seeds 521-523)

| Tier | E[round win] | Median | p99 | p99.9 | Cap hits |
|---|---|---|---|---|---|
| feature | 40.42× | 23.6× | 240× | 445× | 0 |
| super_feature | 88.01× | 57.2× | 474× | 874× | 0 |
| ultimate_feature | 161.01× | 100.4× | 992× | 2,006× | 0 |

Material tier separation (G6): rounds 10/12/12 · starting bank ×1/×3/×5 · orb frequency
E≈1.15/0.87/0.87 per drop · orb-table means 5.7/7.0/8.0 · FX1 doubler ultimate-only ·
separate reel sets (super/ultimate drop L5, premium counts +2) · exclusive environment,
music and prisming VFX per tier. EV ordering 40× < 88× < 161× confirms structural
difference, not spin-count scaling.

## 5. Symbol distribution per reel set (counts per strip; full strips in math-config/reel-sets.json)

### base
| Reel | Len | H1 | H2 | H3 | H4 | L1 | L2 | L3 | L4 | L5 | SCATTER | MULT | FX1 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1-5 | 116 | 5 | 6 | 7 | 8 | 17 | 17 | 17 | 17 | 18 | 2 | 2 | 0 |
| 6 | 115 | 5 | 6 | 7 | 8 | 17 | 17 | 17 | 17 | 18 | 1 | 2 | 0 |

### feature (The Tasting)
| Reel | Len | H1..H4 | L1..L5 | SCATTER | MULT | FX1 |
|---|---|---|---|---|---|---|
| 1,3,5 | 119 | 5/6/7/8 | 17/17/17/17/18 | 2 | 5 | 0 |
| 2,4 | 118 | 5/6/7/8 | 17/17/17/17/18 | 2 | 4 | 0 |
| 6 | 117 | 5/6/7/8 | 17/17/17/17/18 | 1 | 4 | 0 |

### super_feature (The Distillery) — L5 removed, premiums +2
| Reel | Len | H1 | H2 | H3 | H4 | L1-L4 | L5 | SCATTER | MULT | FX1 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-5 | 103 | 7 | 8 | 9 | 10 | 16 each | 0 | 2 | 3 | 0 |
| 6 | 102 | 7 | 8 | 9 | 10 | 16 each | 0 | 1 | 3 | 0 |

### ultimate_feature (The Night Garden) — as super + FX1 on reels 1 & 4, upgraded orb table
| Reel | Len | premiums | lows | SCATTER | MULT | FX1 |
|---|---|---|---|---|---|---|
| 1,4 | 104 | 7/8/9/10 | 16×4 | 2 | 3 | 1 |
| 2,3,5 | 103 | 7/8/9/10 | 16×4 | 2 | 3 | 0 |
| 6 | 102 | 7/8/9/10 | 16×4 | 1 | 3 | 0 |

### ante (The Patron's Ante) — scatter +, orbs + (final counts per frozen bundle)
See math-config/reel-sets.json `ante` set; scatter vector [3,2,2,2,2,2], orb calibration §7.

## 6. Paytable (payX100 of total bet; identical in math-config and display config — help-vs-math rule)

| Symbol | 8-9 | 10-11 | 12+ |
|---|---|---|---|
| H1 Belladonna Philtre | 3.20× | 10.00× | 26.00× |
| H2 Serpent's Emerald | 2.60× | 6.50× | 16.00× |
| H3 Widow's Amber | 2.00× | 4.50× | 10.00× |
| H4 Moth-Wing Tonic | 1.30× | 3.20× | 8.00× |
| L1 Mandrake Root | 0.52× | 1.30× | 4.00× |
| L2 Nightcap Mushrooms | 0.42× | 1.00× | 3.20× |
| L3 Black Lotus Pod | 0.34× | 0.80× | 2.60× |
| L4 Wax Seal & Twine | 0.27× | 0.64× | 2.00× |
| L5 Dried Foxglove Sprig | 0.21× | 0.50× | 1.60× |
| SCATTER (pays any) | 3: 2.00× · 4: 6.00× | 5: 20.00× | 6: 100.00× |

Orb value tables (value → weight) per context in math-config/features.json: base mean 3.26,
feature mean ≈5.7, super ≈7.0, ultimate ≈8.0 (min value 5). Persistent bank cap ×512.

## 7. Bonus buys & ante (jurisdiction-gated)

| Mode | Entry | Price (× bet) | Buy RTP (= forced EV ÷ price) | Evidence |
|---|---|---|---|---|
| buy_feature | 3 seals | 42.10× (payX100 4210) | 40.42/42.10 = **0.9601** | reports/tier-feature.json (30k) |
| buy_super | 4 seals | 91.70× (9170) | 88.01/91.70 = **0.9598** | reports/tier-super.json (30k) |
| buy_ultimate | 5-6 seals (natural 5:6 ratio) | 167.70× (16770) | 161.01/167.70 = **0.9601** | reports/tier-ultimate.json (30k) |
| Patron's Ante | **stake ×1.20**, scatter freq ≈×1.55 (1 in 85) | raw return 1.1638 ± 0.0227 per 1× stake | **effective RTP 0.9698** (+0.47pp vs base — within the ≤ +0.5pp enhanced-mode norm; disclosed in rules) | 500k rounds, seed 526 |

Buy prices are decimal x-bet derived from measured EVs at ~96% buy RTP parity (tuning-log
note 3; ±1 integer price ≈ ±1-2pp buy RTP). Forced-entry rounds include seal pays and base
residuals — the full bought-round distribution.

## 8. Maximum win analysis

| Property | Value |
|---|---|
| Cap | 10,000× bet; engine settles EXACTLY at cap via `max_win_termination` (unit-proven) |
| Cap hits observed | 0 in 3M natural + 90k forced-tier rounds |
| Largest observed win | 1,050× (natural super_feature); 2,006× = ultimate p99.9 (forced) |
| Cap odds estimate | **unresolved at dev size** — tail extrapolation puts P(cap) ≪ 1/50,000,000 |
| Compliance flag (K7, OPEN) | An ADVERTISED "max win 10,000×" fails GLI-11's 1-in-50M hittability rule on this evidence. Pre-release: redesign tail, advertise a demonstrably hittable figure, or obtain lab guidance on liability-cap vs advertised-award language. Rare-event (importance-sampling) estimation required (research/03). |

## 9. Payout distribution (natural play, x-bet)

| p50 | p75 | p90 | p95 | p99 | p99.9 |
|---|---|---|---|---|---|
| 0.00 | 0.34 | 1.60 | 3.63 | 15.06 | 93.2 |

## 10. Reproducibility (per CONVENTIONS §5; full blocks embedded in every report JSON)

| Run | Command (from games/belladonna-parlour/math) | Seed | Rounds | Duration |
|---|---|---|---|---|
| dev natural | `uv run python -m slot_math.simulate --config ..\math-config --rounds 3000000 --seed 5252 --workers 3 --bet 100 --out reports\dev-sim.json` | 5252 → workers [3225935856, 4236761833, 1756426065] | 3,000,000 | 241s |
| tier feature | same, `--rounds 30000 --seed 521 --forced-scatters 3` | 521 | 30,000 | — |
| tier super | `--seed 522 --forced-scatters 4` | 522 | 30,000 | — |
| tier ultimate | `--seed 523 --forced-scatters 5` | 523 | 30,000 | — |
| ante | `uv run python -m slot_math.simulate --config ..\math-config-ante --rounds 500000 --seed 526 --workers 3 --bet 100 --out reports\ante-sim.json` | 526 | 500,000 | ante bundle `sha256:5b3318a9…12b863` |

Engine: slot_math 1.0.0 + game module `scatter_round.py` (46 tests green incl. goldens,
determinism, tier caps, max-win exactness, hypothesis invariants). Config bundles are fully
regenerable from `math-config/generate_math_config.py` (fixed layout seed 20260808).
Release-grade sizing rule: n ≥ (z·σ/ε)² = (2.576×6.81/0.001)² ≈ 3.1×10⁸ rounds per profile
for ±0.1% at 99% — REQUIRED-BEFORE-CERT, not executed here.

---

**Sign-off:** This PAR sheet describes a certification-ready **candidate**.
_Independent mathematical verification is REQUIRED before any real-money release._
