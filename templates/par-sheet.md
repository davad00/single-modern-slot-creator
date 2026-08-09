<!--
TEMPLATE: par-sheet.md — single-modern-slot-creator v1.0.0
Human-readable PAR sheet. It is RENDERED FROM math/reports/par-sheet.json,
which must validate against schemas/par-sheet.schema.json — every number here
must match that file exactly. All statistics are MEASURED simulation results
reported exactly as simulated (honesty rule) — never targets, never massaged.
One PAR sheet per RTP profile. Money in integer minor units; pays as x-bet
(payX100 integers in configs).
-->

# PAR Sheet — {{gameName}} ({{rtpProfileId}})

| Field | Value |
|---|---|
| Game name | {{gameName}} |
| Project slug | {{projectSlug}} |
| Game version | {{gameVersion}} |
| Math version | {{mathVersion}} |
| Config hash | {{configHash}} <!-- sha256:<64 hex>, canonical config hash per CONVENTIONS §5 --> |
| RTP profile | {{rtpProfileId}} |
| Date | {{generatedAt}} |
| Generator | single-modern-slot-creator v1.0.0 |
| Seed policy | {{seedPolicy}} <!-- e.g. "fixed seeds, numpy PCG64, one per worker, listed in §10" --> |

---

## 1. Game identification & math profile

| Property | Value |
|---|---|
| Archetype | {{archetype}} |
| Reels × rows | {{reels}} × {{rows}} |
| Win evaluation | {{winEvaluation}} |
| Target RTP (this profile) | {{targetRtp}} |
| **Measured RTP** | {{measuredRtp}} |
| |measured − target| | {{rtpDeviation}} <!-- gate: within 99% CI half-width AND ≤ 0.003 absolute --> |
| Max win cap (x bet) | {{maxWinXBet}} |
| Min / max bet (minor units) | {{minBetMinor}} / {{maxBetMinor}} |
| Volatility class | {{volatilityClass}} |
| Hit frequency | {{hitFrequency}} |

## 2. Reel strip listings

<!-- One subsection per reel set in config/reel-sets.json (base, feature,
super_feature, ultimate_feature, buy-mode variants...). Strip games: list the
full strip top-to-bottom. Weighted games: replace the listing with the weight
table and say so. -->

### 2.{{n}} Reel set `{{reelSetId}}` ({{reelSetUsage}})

| Position | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| 1 | {{r1p1}} | {{r2p1}} | {{r3p1}} | {{r4p1}} | {{r5p1}} |
| 2 | {{r1p2}} | {{r2p2}} | {{r3p2}} | {{r4p2}} | {{r5p2}} |
| … | … | … | … | … | … |

Strip lengths: {{stripLengths}}

<!-- Duplicate this subsection per reel set. Adjust reel-column count to the grid. -->

## 3. Symbol distribution per reel (base reel set)

<!-- Mirrors par-sheet.json `symbolInventory`: one column per reel, integer
counts (strip occurrences) or integer weights. Totals row must equal strip
lengths / weight sums. -->

| Symbol id | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|---|---|---|---|---|---|
| WILD | {{wildR1}} | {{wildR2}} | {{wildR3}} | {{wildR4}} | {{wildR5}} |
| SCATTER | {{scatR1}} | {{scatR2}} | {{scatR3}} | {{scatR4}} | {{scatR5}} |
| H1 | {{h1R1}} | {{h1R2}} | {{h1R3}} | {{h1R4}} | {{h1R5}} |
| H2 | {{h2R1}} | {{h2R2}} | {{h2R3}} | {{h2R4}} | {{h2R5}} |
| H3 | {{h3R1}} | {{h3R2}} | {{h3R3}} | {{h3R4}} | {{h3R5}} |
| H4 | {{h4R1}} | {{h4R2}} | {{h4R3}} | {{h4R4}} | {{h4R5}} |
| L1 | {{l1R1}} | {{l1R2}} | {{l1R3}} | {{l1R4}} | {{l1R5}} |
| L2 | {{l2R1}} | {{l2R2}} | {{l2R3}} | {{l2R4}} | {{l2R5}} |
| L3 | {{l3R1}} | {{l3R2}} | {{l3R3}} | {{l3R4}} | {{l3R5}} |
| L4 | {{l4R1}} | {{l4R2}} | {{l4R3}} | {{l4R4}} | {{l4R5}} |
| L5 | {{l5R1}} | {{l5R2}} | {{l5R3}} | {{l5R4}} | {{l5R5}} |
| **Total** | {{totR1}} | {{totR2}} | {{totR3}} | {{totR4}} | {{totR5}} |

<!-- Add rows for FX/MULT/CASH/JP_*/BLANK symbols as used; add per-feature-set
distribution tables if strips differ per tier (they should — gate G6). -->

## 4. Paytable

<!-- Must equal config/paytable.json (payX100 / 100) and the GDD table.
winMinor = (betMinor * payX100) // 100 (floor). -->

| Symbol id | 3-of-a-kind (x bet) | 4-of-a-kind (x bet) | 5-of-a-kind (x bet) |
|---|---|---|---|
| H1 | {{h1Pay3}} | {{h1Pay4}} | {{h1Pay5}} |
| H2 | {{h2Pay3}} | {{h2Pay4}} | {{h2Pay5}} |
| H3 | {{h3Pay3}} | {{h3Pay4}} | {{h3Pay5}} |
| H4 | {{h4Pay3}} | {{h4Pay4}} | {{h4Pay5}} |
| L1 | {{l1Pay3}} | {{l1Pay4}} | {{l1Pay5}} |
| L2 | {{l2Pay3}} | {{l2Pay4}} | {{l2Pay5}} |
| L3 | {{l3Pay3}} | {{l3Pay4}} | {{l3Pay5}} |
| L4 | {{l4Pay3}} | {{l4Pay4}} | {{l4Pay5}} |
| L5 | {{l5Pay3}} | {{l5Pay4}} | {{l5Pay5}} |
| SCATTER | {{scatterPay3}} | {{scatterPay4}} | {{scatterPay5}} |

## 5. RTP contributions per tier

<!-- Mirrors par-sheet.json `rtpContributions`. Gate G5: base + feature +
super_feature + ultimate_feature + scatterPay (+ jackpot) = total ±0.0005. -->

| Win source | Measured RTP contribution | Share of total |
|---|---|---|
| Base game | {{rtpBase}} | {{rtpBaseShare}} |
| `feature` (3 scatters) | {{rtpFeature}} | {{rtpFeatureShare}} |
| `super_feature` (4 scatters) | {{rtpSuperFeature}} | {{rtpSuperFeatureShare}} |
| `ultimate_feature` (5+ scatters) | {{rtpUltimateFeature}} | {{rtpUltimateFeatureShare}} |
| Scatter pay | {{rtpScatterPay}} | {{rtpScatterPayShare}} |
| Jackpot <!-- omit row if no jackpots --> | {{rtpJackpot}} | {{rtpJackpotShare}} |
| **Total** | {{rtpTotal}} | 100% |

Contribution sum check: {{rtpSumCheck}} <!-- state the sum and |sum − total| -->

### 5.1 Bonus-buy modes (independent analysis per mode — rejection rule)

| Buy mode | Tier | Price (x bet) | Measured buy RTP | Rounds simulated | Report |
|---|---|---|---|---|---|
| {{buyMode1Id}} | feature | {{buyMode1Price}} | {{buyMode1Rtp}} | {{buyMode1Rounds}} | {{buyMode1Report}} |
| {{buyMode2Id}} | super_feature | {{buyMode2Price}} | {{buyMode2Rtp}} | {{buyMode2Rounds}} | {{buyMode2Report}} |
| {{buyMode3Id}} | ultimate_feature | {{buyMode3Price}} | {{buyMode3Rtp}} | {{buyMode3Rounds}} | {{buyMode3Report}} |

## 6. Hit & feature frequency

<!-- Mirrors `hitFrequency` and `featureFrequencies` (1-in-N rounds). -->

| Event | Measured frequency |
|---|---|
| Any win (hit frequency) | {{hitFrequency}} ({{hitFrequencyPct}}) |
| `feature` trigger (natural) | 1 in {{featureFreqN}} rounds |
| `super_feature` trigger (natural) | 1 in {{superFeatureFreqN}} rounds |
| `ultimate_feature` trigger (natural) | 1 in {{ultimateFeatureFreqN}} rounds |
| Any tier trigger (natural) | 1 in {{anyFeatureFreqN}} rounds |
| Retrigger (within `feature`) | {{featureRetriggerFreq}} |
| Retrigger (within `super_feature`) | {{superRetriggerFreq}} |
| Retrigger (within `ultimate_feature`) | {{ultimateRetriggerFreq}} |

### 6.1 Per-tier payout statistics

| Tier | Avg payout (x bet) | Median (x bet) | p90 | p95 | p99 | Max observed (x bet) |
|---|---|---|---|---|---|---|
| feature | {{featureAvg}} | {{featureMedian}} | {{featureP90}} | {{featureP95}} | {{featureP99}} | {{featureMaxObs}} |
| super_feature | {{superAvg}} | {{superMedian}} | {{superP90}} | {{superP95}} | {{superP99}} | {{superMaxObs}} |
| ultimate_feature | {{ultimateAvg}} | {{ultimateMedian}} | {{ultimateP90}} | {{ultimateP95}} | {{ultimateP99}} | {{ultimateMaxObs}} |

## 7. Volatility & payout percentiles

<!-- Mirrors `volatility` and `payoutPercentiles` (per-round win in x-bet
units; 0 = losing round). -->

| Stat | Value |
|---|---|
| Volatility index | {{volatilityIndex}} |
| Standard deviation (x-bet per round) | {{volatilityStdDev}} |
| Volatility class | {{volatilityClass}} <!-- low / medium / medium-high / high / very-high --> |

| Percentile | Per-round win (x bet) |
|---|---|
| p50 (median) | {{p50}} |
| p75 | {{p75}} |
| p90 | {{p90}} |
| p95 | {{p95}} |
| p99 | {{p99}} |
| p99.9 | {{p999}} |

## 8. Maximum win analysis

| Property | Value |
|---|---|
| Configured cap (x bet) | {{maxWinXBet}} |
| Cap reachable | {{maxWinReachable}} <!-- must be yes, with evidence --> |
| Measured / estimated per-round probability of cap | {{maxWinProbability}} <!-- must be > 0 --> |
| Estimation method | {{maxWinMethod}} <!-- plain Monte Carlo count / rare-event analysis --> |
| Times cap hit in simulation | {{maxWinHits}} in {{simRounds}} rounds |
| Path(s) to cap | {{maxWinPaths}} <!-- which tier/mechanic combinations reach it --> |
| Termination behaviour | max_win_termination step; remaining rounds {{maxWinRemaining}} |
| Maximum exposure per round (minor units at max bet) | {{maxExposureMinor}} |

## 9. Confidence intervals

<!-- Mirrors `confidenceIntervals`. The RTP tolerance gate compares
|simRTP − targetRTP| against rtpHalfWidth. -->

| Measurement | Confidence level | Half-width |
|---|---|---|
| RTP | {{ciLevel}} | {{rtpHalfWidth}} |
| Hit frequency | {{ciLevel}} | {{hitFreqHalfWidth}} |
| Max-win probability | {{ciLevel}} | {{maxWinProbHalfWidth}} |

Gate check: |{{measuredRtp}} − {{targetRtp}}| = {{rtpDeviation}} vs half-width {{rtpHalfWidth}} and absolute limit 0.003 → {{rtpGateResult}}

## 10. Simulation provenance

<!-- Mirrors `simulationProvenance` — full reproducibility block per
CONVENTIONS §5. Enough to re-run the EXACT simulation. -->

| Field | Value |
|---|---|
| gameVersion | {{provGameVersion}} |
| mathVersion | {{provMathVersion}} |
| configHash | {{provConfigHash}} |
| simCodeVersion | {{provSimCodeVersion}} |
| lockfileHash | {{provLockfileHash}} <!-- sha256 of uv.lock --> |
| Seeds (numpy PCG64, one per worker) | {{provSeeds}} |
| Total rounds | {{provRounds}} <!-- dev minimum 1e6; release sizes larger --> |
| Workers | {{provWorkers}} |
| Exact command | `{{provCommand}}` <!-- e.g. uv run python -m slot_math.simulate --profile rtp-96 --rounds 100000000 --seed ... --> |

## 11. Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Math model author | {{signoffMathAuthor}} | {{signoffMathDate}} | {{signoffMathStatus}} |
| Skill compliance-QA pass | {{signoffQa}} | {{signoffQaDate}} | {{signoffQaStatus}} |
| **Independent mathematical verification** | {{signoffIndependent}} | {{signoffIndependentDate}} | NOT-YET-DONE |

> **REQUIRED BEFORE RELEASE:** this PAR sheet has NOT been independently
> verified. Independent mathematical verification by a qualified third party is
> REQUIRED before any real-money release, in addition to laboratory
> certification where applicable. All figures above are internal simulation
> measurements reported exactly as measured; nothing in this document
> constitutes certification evidence.
