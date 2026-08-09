<!-- RENDERED from measured simulation reports by render_par_sheet.py -->
<!-- Structure follows templates/par-sheet.md; every value is measured or exactly computed. -->

# PAR Sheet — Kilnspire (rtp-96)

| Field | Value |
|---|---|
| Game name | Kilnspire |
| Project slug | kilnspire |
| Game version | 1.0.0 |
| Math version | 1.0.0 |
| Config hash (runtime math-config bundle) | `sha256:38e29ea70528228ebd3f168bcf1df34f5aa6b977591c4ed55b713bf71b8c3531` |
| Config hash (display config/ bundle) | `sha256:07dd4c06376d22cc22bbb24708e1715c4297a544a9dea7533962681a670b2484` |
| RTP profile | rtp-96 |
| Date | 2026-08-08T06:09:37.724709+00:00 |
| Generator | single-modern-slot-creator v1.0.0 (worked example) |
| Seed policy | numpy PCG64, per-worker seeds derived from root seed via SeedSequence.spawn; all seeds listed in §10 |

> **Scope disclaimer (illustrative example).** These are DEV-SIZE simulations
> (300,000 natural rounds; 30,000 forced entries per tier), far below the
> release sizing rule of prompts/math.md §8 (n ≥ (z·σ/ε)² ≈ 83M rounds at the
> measured σ for RTP ±0.1% at 95%). Numbers are reported exactly as measured
> with their dev-size confidence intervals; nothing here is release evidence.

## 1. Game identification & math profile

| Property | Value |
|---|---|
| Archetype | 5x4 ways (1,024 ways) with base-game cascades |
| Reels x rows | 5 x 4 |
| Win evaluation | left-to-right ways; pays per way; wilds substitute (never for SCATTER) |
| Target RTP (this profile) | 0.9600 |
| **Measured RTP** | **0.9631** |
| abs(measured − target) | 0.0031 (dev gate ±0.01: PASS) |
| Max win cap (x bet) | 10,000 |
| Min / max bet (minor units) | 10 / 10000 |
| Volatility class | high (design target); measured per-round σ 4.65 x-bet at dev size — see §7 caveat |
| Hit frequency | 0.5998 (59.98%) |

## 2. Reel strip listings

Full strips exactly as simulated (source: math-config/reel-sets.json, built
deterministically by generate_math_config.py, strip seed 77). The display
bundle config/reel-sets.json carries identical strips plus three
bonus_buy_entry presentation sets not used by the math engine.

### 2.1 Reel set `base-strips` (base)

| Position | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| 1 | L2 | L1 | L2 | L5 | L5 |
| 2 | L1 | L2 | H1 | L1 | L2 |
| 3 | L4 | L1 | L5 | H1 | L4 |
| 4 | L2 | L3 | L1 | L2 | L1 |
| 5 | H2 | H3 | H2 | L1 | L3 |
| 6 | L1 | L1 | L3 | WILD | L4 |
| 7 | L4 | H2 | L4 | H2 | L5 |
| 8 | L5 | L3 | L3 | H3 | L3 |
| 9 | H3 | L5 | L2 | SCATTER | H4 |
| 10 | L2 | H2 | H4 | H2 | L4 |
| 11 | H4 | L1 | L2 | L5 | H2 |
| 12 | H1 | L4 | L1 | H4 | L3 |
| 13 | L5 | L2 | L5 | L3 | H3 |
| 14 | L1 | L5 | L1 | L1 | L5 |
| 15 | L3 | H4 | H3 | L3 | L3 |
| 16 | L4 | H2 | L2 | L2 | L4 |
| 17 | L3 | L4 | H1 | L4 | L1 |
| 18 | L5 | L1 | L4 | L1 | L3 |
| 19 | H2 | L3 | L5 | L4 | L5 |
| 20 | L5 | L5 | H4 | L3 | H4 |
| 21 | H4 | L2 | L4 | L1 | L1 |
| 22 | L2 | H4 | L5 | H4 | H2 |
| 23 | H1 | L3 | L1 | H3 | L3 |
| 24 | L5 | L2 | H4 | L5 | L5 |
| 25 | H3 | L5 | L4 | L4 | SCATTER |
| 26 | H2 | L3 | L2 | L5 | L2 |
| 27 | L4 | SCATTER | L5 | L4 | L4 |
| 28 | H4 | WILD | L3 | H1 | L2 |
| 29 | L3 | H4 | WILD | L2 | L1 |
| 30 | L2 | L4 | H1 | L3 | H4 |
| 31 | L3 | H4 | L3 | L4 | H3 |
| 32 | SCATTER | H3 | H3 | L5 | L2 |
| 33 | L4 | L4 | L1 | L1 | L1 |
| 34 | H4 | L3 | H4 | L2 | L2 |
| 35 | L1 | H1 | L4 | H4 | L4 |
| 36 | L4 | L1 | L1 | L2 | H2 |
| 37 | L3 | L5 | H3 | L4 | L2 |
| 38 | H3 | L2 | H2 | L3 | H4 |
| 39 | L5 | H1 | L3 | H3 | L1 |
| 40 | L1 | L4 | L2 | L3 | H1 |
| 41 | L3 | L2 | H2 | L2 | H3 |
| 42 | L2 | H3 | SCATTER | H2 | L5 |
| 43 | L1 | L4 | L3 | H4 | H1 |

Strip lengths: 43 / 43 / 43 / 43 / 43

### 2.2 Reel set `feature-strips` (feature)

| Position | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| 1 | WILD | WILD | L3 | L1 | H1 |
| 2 | L5 | L5 | L2 | L5 | L3 |
| 3 | H2 | SCATTER | L1 | H1 | L5 |
| 4 | H3 | L2 | L2 | L5 | H2 |
| 5 | H4 | L1 | L4 | H3 | H3 |
| 6 | H1 | H2 | L5 | L1 | L5 |
| 7 | SCATTER | L3 | H4 | WILD | L4 |
| 8 | H3 | L2 | L4 | L4 | L3 |
| 9 | L4 | H3 | L5 | L2 | L5 |
| 10 | H1 | L4 | H3 | H1 | L1 |
| 11 | L5 | L5 | L2 | L1 | H3 |
| 12 | L3 | H2 | H4 | H2 | L1 |
| 13 | H2 | L5 | H2 | L3 | L4 |
| 14 | L4 | H2 | L1 | L4 | H3 |
| 15 | H2 | H3 | L4 | L1 | H1 |
| 16 | L4 | H4 | H1 | H4 | L2 |
| 17 | L5 | L4 | L3 | L5 | H3 |
| 18 | L1 | H1 | WILD | L3 | L4 |
| 19 | H4 | L3 | H3 | H2 | H2 |
| 20 | L2 | L1 | L2 | H4 | L3 |
| 21 | L1 | H4 | H2 | L4 | H2 |
| 22 | L2 | L4 | H3 | L1 | L2 |
| 23 | H1 | L5 | H1 | L3 | L5 |
| 24 | L2 | H4 | L5 | WILD | H2 |
| 25 | L5 | L2 | SCATTER | H2 | L4 |
| 26 | H2 | H1 | H3 | L3 | H4 |
| 27 | L2 | L2 | H4 | L2 | WILD |
| 28 | L1 | L4 | L3 | H2 | L3 |
| 29 | L4 | L3 | L1 | H3 | L2 |
| 30 | L1 | H3 | L3 | L5 | L1 |
| 31 | H3 | L1 | WILD | L2 | L2 |
| 32 | L3 | L3 | H1 | H3 | H4 |
| 33 | L2 | L1 | L4 | L5 | L4 |
| 34 | L3 | L2 | L3 | SCATTER | H1 |
| 35 | H3 | L5 | L5 | H4 | SCATTER |
| 36 | H4 | WILD | H2 | L4 | H4 |
| 37 | L3 | H3 | L4 | L2 | L5 |
| 38 | L5 | L1 | L1 | L3 | L2 |
| 39 | L1 | H4 | H2 | H3 | L3 |
| 40 | L3 | H1 | L5 | H1 | L1 |
| 41 | L4 | L4 | H4 | L4 | H4 |
| 42 | H4 | L3 | L2 | L2 | L1 |
| 43 | - | H2 | L1 | H4 | - |

Strip lengths: 42 / 43 / 43 / 43 / 42

### 2.3 Reel set `super-feature-strips` (super_feature)

| Position | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| 1 | H4 | L1 | H4 | H3 | L2 |
| 2 | WILD | H3 | WILD | L3 | H1 |
| 3 | H2 | H4 | SCATTER | L2 | L2 |
| 4 | L1 | L3 | L2 | L3 | H2 |
| 5 | L5 | L4 | H4 | L5 | L5 |
| 6 | H3 | H2 | L3 | H3 | L4 |
| 7 | L1 | L5 | L4 | H2 | L3 |
| 8 | H3 | L3 | H3 | L1 | H1 |
| 9 | L5 | H1 | L1 | SCATTER | L2 |
| 10 | H4 | WILD | L2 | H3 | L1 |
| 11 | H2 | L5 | H4 | H1 | L4 |
| 12 | L5 | WILD | L4 | WILD | L3 |
| 13 | L2 | L2 | H4 | H3 | H2 |
| 14 | L4 | H2 | H3 | L5 | L5 |
| 15 | WILD | L1 | H2 | H1 | H1 |
| 16 | L3 | L2 | L4 | L1 | WILD |
| 17 | L2 | L5 | H2 | L4 | H4 |
| 18 | L1 | H3 | L2 | WILD | L2 |
| 19 | H3 | L3 | L5 | H4 | H3 |
| 20 | H2 | L4 | H2 | H2 | L3 |
| 21 | L4 | H2 | L5 | L3 | L5 |
| 22 | L5 | L4 | WILD | L1 | H3 |
| 23 | H1 | L2 | L1 | L3 | H2 |
| 24 | SCATTER | H4 | L4 | L1 | H3 |
| 25 | L4 | H3 | H3 | L4 | L1 |
| 26 | L3 | L3 | L5 | H4 | L4 |
| 27 | H1 | WILD | H1 | H2 | H2 |
| 28 | H2 | L1 | L3 | L2 | H3 |
| 29 | H3 | L4 | H3 | H2 | H2 |
| 30 | L2 | H1 | L3 | WILD | WILD |
| 31 | H4 | SCATTER | H1 | L2 | L3 |
| 32 | H1 | L1 | L3 | H2 | H4 |
| 33 | L2 | H2 | L1 | H4 | L1 |
| 34 | H4 | H3 | H1 | L4 | H3 |
| 35 | H1 | L2 | H2 | H3 | L4 |
| 36 | H2 | H3 | H1 | L4 | H4 |
| 37 | L3 | L5 | L2 | L2 | SCATTER |
| 38 | L4 | H4 | L1 | L5 | H1 |
| 39 | H3 | H1 | L5 | H1 | H4 |
| 40 | L3 | H4 | WILD | H4 | L5 |
| 41 | L1 | H1 | H3 | H1 | L1 |
| 42 | - | H2 | H2 | L5 | - |

Strip lengths: 41 / 42 / 42 / 42 / 41

### 2.4 Reel set `ultimate-feature-strips` (ultimate_feature)

| Position | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| 1 | L4 | WILD | H1 | L3 | L1 |
| 2 | H4 | H3 | H2 | WILD | WILD |
| 3 | H2 | L3 | L5 | H1 | L5 |
| 4 | H4 | L1 | H1 | H2 | H1 |
| 5 | H1 | H3 | H3 | L2 | WILD |
| 6 | H3 | H1 | L2 | H4 | L3 |
| 7 | L2 | H4 | H1 | L1 | H3 |
| 8 | L5 | H2 | L2 | L5 | H4 |
| 9 | L4 | L2 | L5 | L3 | L3 |
| 10 | WILD | L3 | H2 | H2 | H4 |
| 11 | L3 | L4 | L1 | L5 | H3 |
| 12 | WILD | H4 | H2 | H1 | WILD |
| 13 | L5 | L3 | WILD | H4 | H1 |
| 14 | L3 | H2 | H4 | H1 | SCATTER |
| 15 | H4 | L1 | WILD | L2 | H4 |
| 16 | H3 | L4 | H1 | H3 | H2 |
| 17 | L1 | H4 | L4 | H1 | L1 |
| 18 | L2 | WILD | L3 | L4 | L5 |
| 19 | H1 | L5 | SCATTER | L1 | H1 |
| 20 | SCATTER | L1 | H4 | H2 | L4 |
| 21 | H2 | WILD | H3 | L3 | H2 |
| 22 | L3 | H2 | L4 | H4 | H1 |
| 23 | H3 | L5 | WILD | H2 | H4 |
| 24 | L4 | H1 | H3 | H3 | L2 |
| 25 | L5 | H2 | H4 | SCATTER | L4 |
| 26 | H3 | L2 | L5 | L2 | L5 |
| 27 | L2 | H2 | L2 | WILD | L4 |
| 28 | WILD | SCATTER | WILD | L4 | H2 |
| 29 | H1 | H4 | H1 | H4 | H3 |
| 30 | H2 | H3 | L3 | H3 | WILD |
| 31 | H1 | H4 | H2 | H1 | H2 |
| 32 | H4 | H1 | L3 | WILD | L1 |
| 33 | L1 | H2 | H3 | H3 | H1 |
| 34 | H3 | WILD | L4 | L4 | L2 |
| 35 | L1 | H3 | H2 | WILD | H3 |
| 36 | H2 | L5 | H4 | H3 | L3 |
| 37 | WILD | H1 | H2 | H2 | H2 |
| 38 | H2 | H3 | L1 | L1 | L2 |
| 39 | H4 | L4 | H4 | H4 | H2 |
| 40 | H2 | WILD | L1 | WILD | H3 |
| 41 | H1 | H1 | H3 | L5 | H4 |
| 42 | - | L2 | WILD | H2 | - |

Strip lengths: 41 / 42 / 42 / 42 / 41

## 3. Symbol distribution per reel

### 3.1 `base-strips` (base)

| Symbol id | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| WILD | 0 | 1 | 1 | 1 | 0 |
| SCATTER | 1 | 1 | 1 | 1 | 1 |
| H1 | 2 | 2 | 3 | 2 | 2 |
| H2 | 3 | 3 | 3 | 3 | 3 |
| H3 | 3 | 3 | 3 | 3 | 3 |
| H4 | 4 | 4 | 4 | 4 | 4 |
| L1 | 6 | 6 | 6 | 6 | 6 |
| L2 | 6 | 6 | 6 | 6 | 6 |
| L3 | 6 | 6 | 6 | 6 | 6 |
| L4 | 6 | 6 | 5 | 6 | 6 |
| L5 | 6 | 5 | 5 | 5 | 6 |
| **Total** | 43 | 43 | 43 | 43 | 43 |

### 3.2 `feature-strips` (feature)

| Symbol id | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| WILD | 1 | 2 | 2 | 2 | 1 |
| SCATTER | 1 | 1 | 1 | 1 | 1 |
| H1 | 3 | 3 | 3 | 3 | 3 |
| H2 | 4 | 4 | 4 | 4 | 4 |
| H3 | 4 | 4 | 4 | 4 | 4 |
| H4 | 4 | 4 | 4 | 4 | 4 |
| L1 | 5 | 5 | 5 | 5 | 5 |
| L2 | 5 | 5 | 5 | 5 | 5 |
| L3 | 5 | 5 | 5 | 5 | 5 |
| L4 | 5 | 5 | 5 | 5 | 5 |
| L5 | 5 | 5 | 5 | 5 | 5 |
| **Total** | 42 | 43 | 43 | 43 | 42 |

### 3.3 `super-feature-strips` (super_feature)

| Symbol id | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| WILD | 2 | 3 | 3 | 3 | 2 |
| SCATTER | 1 | 1 | 1 | 1 | 1 |
| H1 | 4 | 4 | 4 | 4 | 4 |
| H2 | 5 | 5 | 5 | 5 | 5 |
| H3 | 5 | 5 | 5 | 5 | 5 |
| H4 | 4 | 4 | 4 | 4 | 4 |
| L1 | 4 | 4 | 4 | 4 | 4 |
| L2 | 4 | 4 | 4 | 4 | 4 |
| L3 | 4 | 4 | 4 | 4 | 4 |
| L4 | 4 | 4 | 4 | 4 | 4 |
| L5 | 4 | 4 | 4 | 4 | 4 |
| **Total** | 41 | 42 | 42 | 42 | 41 |

### 3.4 `ultimate-feature-strips` (ultimate_feature)

| Symbol id | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| WILD | 4 | 5 | 5 | 5 | 4 |
| SCATTER | 1 | 1 | 1 | 1 | 1 |
| H1 | 5 | 5 | 5 | 5 | 5 |
| H2 | 6 | 6 | 6 | 6 | 6 |
| H3 | 5 | 5 | 5 | 5 | 5 |
| H4 | 5 | 5 | 5 | 5 | 5 |
| L1 | 3 | 3 | 3 | 3 | 3 |
| L2 | 3 | 3 | 3 | 3 | 3 |
| L3 | 3 | 3 | 3 | 3 | 3 |
| L4 | 3 | 3 | 3 | 3 | 3 |
| L5 | 3 | 3 | 3 | 3 | 3 |
| **Total** | 41 | 42 | 42 | 42 | 41 |

## 4. Paytable (payX100 per way; x-bet shown)

| Symbol id | 3-of-a-kind | 4-of-a-kind | 5-of-a-kind |
|---|---|---|---|
| H1 | 0.45x (45) | 1.35x (135) | 4.40x (440) |
| H2 | 0.38x (38) | 0.92x (92) | 2.70x (270) |
| H3 | 0.27x (27) | 0.74x (74) | 1.78x (178) |
| H4 | 0.18x (18) | 0.55x (55) | 1.42x (142) |
| L1 | 0.08x (8) | 0.28x (28) | 0.75x (75) |
| L2 | 0.08x (8) | 0.21x (21) | 0.55x (55) |
| L3 | 0.06x (6) | 0.19x (19) | 0.45x (45) |
| L4 | — | 0.15x (15) | 0.38x (38) |
| L5 | — | 0.12x (12) | 0.28x (28) |
| SCATTER (pays on total bet) | 3x (300) | 15x (1500) | 100x (10000) |

winMinor = (betMinor × payX100) // 100, floor — identical in engine and simulator.

## 5. RTP contributions per tier (dev sim, 300,000 rounds)

| Win source | Measured RTP contribution | Share of total |
|---|---|---|
| Base game (ways + cascades) | 0.80162 | 83.23% |
| `feature` — Kindled Spins (3 scatters) | 0.09340 | 9.70% |
| `super_feature` — Roaring Kiln (4 scatters) | 0.03584 | 3.72% |
| `ultimate_feature` — Starfire Crown (5 scatters) | 0.00667 | 0.69% |
| Scatter pay | 0.02561 | 2.66% |
| **Total** | **0.96313** | 100% |

Contribution sum check: sum = 0.963134, measured RTP = 0.963134, |sum − rtp| = 0.00e+00 (base is the exact residual by construction; gate ±0.0005 PASS).

Note: at 300k rounds the ultimate tier has only 2 natural triggers — its natural contribution is very noisy; the isolated 30k-entry sim in §6.1 is the reliable per-tier measurement.

### 5.1 Bonus-buy modes (per-mode measured RTP)

The template simulator has no --buy-mode flag (a real run adds it while
specializing simulate.py). Because every buy mode's forcedEntryDistribution
is a single scatter count (base strips carry one SCATTER per reel, so the
natural conditional distributions are degenerate: exactly 3, 4 or 5), the
forced-scatter runs ARE the buy-mode measurements: buy RTP = mean gross round
value (entry-spin ways wins + scatter pay + tier pay) / price.

| Buy mode | Tier | Price (x bet) | Mean gross value (x bet, 95% CI) | Measured buy RTP | Entries | Report |
|---|---|---|---|---|---|---|
| buy-kindled-spins | feature | 17.75x | 17.02 ± 0.12 | **0.9589** | 30,000 | reports/tier-feature.json |
| buy-roaring-kiln | super_feature | 121.00x | 116.26 ± 0.77 | **0.9608** | 30,000 | reports/tier-super-feature.json |
| buy-starfire-crown | ultimate_feature | 1125.00x | 1080.39 ± 5.61 | **0.9603** | 30,000 | reports/tier-ultimate-feature.json |

## 6. Hit & feature frequency (dev sim)

| Event | Measured frequency |
|---|---|
| Any win (hit frequency) | 0.5998 (59.98%) |
| `feature` trigger (natural) | 1 in 150 rounds (1994 triggers) |
| `super_feature` trigger (natural) | 1 in 3000 rounds (100 triggers) |
| `ultimate_feature` trigger (natural) | 1 in 150000 rounds (2 triggers) |
| Any tier trigger (natural) | 1 in 143 rounds |
| Avg cascades per round | 0.955 |
| Retrigger rate within `feature` (isolated sim) | 5.67% of instances |
| Retrigger rate within `super_feature` (isolated sim) | 7.38% of instances |
| Retrigger rate within `ultimate_feature` (isolated sim) | 8.77% of instances |

Natural `ultimate_feature` frequency at 300k rounds (2 observations) is a point estimate only. Exact per-reel scatter probability (1 SCATTER per strip, 4-row window) gives P(5 scatters) = (4/43)·(4/44)·(4/43)·(4/44)·(4/43) = 6.63e-6 ≈ 1 in 150,800 — consistent with the observation.

### 6.1 Per-tier payout statistics (isolated forced-entry sims, 30,000 entries each; tier pay only, excluding entry-spin wins)

| Tier | Avg pay (x bet) | Median | p99 | Max observed | Avg rounds (incl. retriggers) | Retrigger rate |
|---|---|---|---|---|---|---|
| feature | 13.74 | 10.96 | 53.52 | 181.02 | 8.24 | 5.67% |
| super_feature | 101.04 | 84.64 | 340.25 | 696.96 | 10.31 | 7.38% |
| ultimate_feature | 980.20 | 886.08 | 2623.53 | 6983.92 | 12.37 | 8.77% |

**Tier materiality (G6 evidence at dev size):** mean gross round values 17.02±0.12 < 116.26±0.77 < 1080.39±5.61 (x bet, 95% CIs non-overlapping by wide margins); fixed tier multipliers 2x < 4x < 8x; rounds 8 < 10 < 12; wild strip counts ~1-2 < 2-3 < 4-5 per reel; premium share ~36% < ~43% < ~50% of strip positions.

## 7. Volatility & payout percentiles (dev sim)

| Stat | Value |
|---|---|
| Volatility index (this studio: per-round σ in x-bet) | 4.65 |
| Standard deviation (x-bet per round) | 4.6484 |
| Variance | 21.6075 |
| Volatility class | design target high; the measured dev-size σ sits at the medium-high/high boundary. σ is dominated by the frequent low-pay base; the class rests on the tier tail (8x-multiplier ultimate averaging ~980x). A release-size run must confirm the tail before any class is published. |

| Percentile (per-round win, x bet; 0 = losing round) | Value |
|---|---|
| p50 | 0.16 |
| p75 | 0.84 |
| p90 | 2.18 |
| p95 | 3.76 |
| p99 | 12.22 |
| p99.9 | 35.36 |
| median of PAYING rounds (aux replay) | 0.61 |

P(X>0) = 0.5971 and P(X ≥ stake) = 0.2164; LDW rate
(0 < win < stake) = 0.3807 of all rounds = 0.6376 of paying rounds.
(Auxiliary replay: 50,000 rounds, seed 555001, same engine/config —
the simulator reports do not carry these three statistics.) LDW results are
presented with the neutral preset, never celebrated (CONVENTIONS 9.5).

## 8. Maximum win analysis

| Property | Value |
|---|---|
| Configured cap (x bet) | 10,000 |
| Cap hits in all sims | 0 in 390,000 simulated rounds (300k natural + 3 × 30k forced) |
| Largest observed round | 6983.92x (forced ultimate_feature run) |
| Measured per-round P(cap) | 0 observed; 95% upper bound P(cap given ultimate entry) < 1.0e-4 (0/30,000 rule-of-three) |
| Estimation method | NOT PERFORMED at example scale — release runs require the rare-event decomposition of prompts/math.md §8 (exact entry probability × stratified conditional payout) |
| Reachability argument | a retriggered ultimate_feature (up to 24 rounds at 8x on wild-dense strips) observed 69.8% of cap at only 30k entries; termination at cap is enforced by the engine's max_win_termination step (unit-tested in the template suite) |
| Termination behaviour | max_win_termination step; win clamped exactly to 10,000x; remaining rounds forfeited |
| Maximum exposure per round (minor units at max bet) | 10000 × 10000 = 100,000,000 (EUR 1,000,000.00) |

**Honest gap:** the G5 requirement "max win reachable with P(max) > 0 computed"
is NOT satisfied by these dev-size runs; a real skill run must close it with a
dedicated rare-event simulation. Recorded in docs/known-limitations.md.

## 9. Confidence intervals (95%, dev sim)

| Measurement | Confidence level | Half-width |
|---|---|---|
| RTP | 95% | ±0.0166 |
| Hit frequency | 95% | ±0.0018 |
| Max-win probability | — | not measurable at this size (0 observations) |

Gate check: |0.9631 − 0.9600| = 0.0031 vs example tolerance 0.01 → **PASS**.
At release level the CONVENTIONS §5 gate (99% CI half-width AND ≤ 0.003 absolute)
applies instead; the dev 95% half-width ±0.0166 shows why release sizing needs ~83M+ rounds.

## 10. Simulation provenance (reproducibility block)

| Field | dev-sim.json | tier-feature.json | tier-super-feature.json | tier-ultimate-feature.json |
|---|---|---|---|---|
| gameVersion | 1.0.0 | 1.0.0 | 1.0.0 | 1.0.0 |
| mathVersion | 1.0.0 | 1.0.0 | 1.0.0 | 1.0.0 |
| configHash | `…55b713bf71b8c3531` | `…55b713bf71b8c3531` | `…55b713bf71b8c3531` | `…55b713bf71b8c3531` |
| simCodeVersion | 1.0.0 | 1.0.0 | 1.0.0 | 1.0.0 |
| lockfileHash (uv.lock) | `…ba27959ff083f3da0` | `…ba27959ff083f3da0` | `…ba27959ff083f3da0` | `…ba27959ff083f3da0` |
| root seed | 4242 | 4303 | 4304 | 4305 |
| rounds | 300,000 | 30,000 | 30,000 | 30,000 |
| workers | 8 | 8 | 8 | 8 |

Per-worker seeds (SeedSequence.spawn of the root seed, worker order) are in each
report's provenance.seeds. Full config hashes: runtime bundle
`sha256:38e29ea70528228ebd3f168bcf1df34f5aa6b977591c4ed55b713bf71b8c3531` (identical across all four reports); RNG numpy PCG64.

Exact commands (run from the skill's math/ directory):

```
uv run python -m slot_math.simulate --config ../examples/example-single-slot/math-config --rounds 300000 --seed 4242 --workers 8 --bet 100 --out ../examples/example-single-slot/reports/dev-sim.json
uv run python -m slot_math.simulate --config ../examples/example-single-slot/math-config --rounds 30000 --seed 4303 --workers 8 --bet 100 --forced-scatters 3 --out ../examples/example-single-slot/reports/tier-feature.json
uv run python -m slot_math.simulate --config ../examples/example-single-slot/math-config --rounds 30000 --seed 4304 --workers 8 --bet 100 --forced-scatters 4 --out ../examples/example-single-slot/reports/tier-super-feature.json
uv run python -m slot_math.simulate --config ../examples/example-single-slot/math-config --rounds 30000 --seed 4305 --workers 8 --bet 100 --forced-scatters 5 --out ../examples/example-single-slot/reports/tier-ultimate-feature.json
# auxiliary LDW replay: render_par_sheet.py, 50,000 rounds, seed 555001, bet 100
```

## 11. Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Math model author | single-modern-slot-creator (worked example, detached job "example") | 2026-08-08 | dev-size measurements complete |
| Skill compliance-QA pass | NOT RUN (out of scope for the worked example) | — | NOT-YET-DONE |
| **Independent mathematical verification** | — | — | NOT-YET-DONE |

> **REQUIRED BEFORE RELEASE:** this PAR sheet has NOT been independently
> verified. Independent mathematical verification by a qualified third party is
> REQUIRED before any real-money release, in addition to laboratory
> certification where applicable. All figures above are internal simulation
> measurements reported exactly as measured; nothing in this document
> constitutes certification evidence.
