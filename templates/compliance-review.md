<!--
TEMPLATE: compliance-review.md — single-modern-slot-creator v1.0.0
Game-specific compliance review written by the compliance-qa role. Describe how
THIS game implements each topic, with pointers to configs/code/tests as
evidence. This document records engineering posture only — it contains NO legal
conclusions. Research current requirements per target jurisdiction rather than
relying on outdated assumptions; cite sources in docs/source-register.md.
Every external review in §14 stays NOT-YET-DONE until real evidence exists.
-->

# Compliance Review — {{gameName}}

| Field | Value |
|---|---|
| Game name | {{gameName}} |
| Project slug | {{projectSlug}} |
| Game version | {{gameVersion}} |
| Math version | {{mathVersion}} |
| Config hash | {{configHash}} |
| Date | {{dateIso}} |
| Generator | single-modern-slot-creator v1.0.0 |
| Standards researched | {{standardsResearched}} <!-- e.g. GLI-19, jurisdiction technical standards, with dates and sources --> |

---

## 1. RNG boundary & outcome integrity

<!-- Cover: RNG requirements, seed & entropy integrity, outcome independence.
State precisely where randomness lives and prove the client has none for
real-money results. -->

| Topic | This game | Evidence |
|---|---|---|
| Production RNG location | RGS only — client receives committed outcome manifests | {{rngBoundaryEvidence}} |
| Client-side RNG usage | dev round provider ONLY (seeded xoshiro128**, flagged dev-only); cosmetic VFX jitter never affects outcomes | {{clientRngEvidence}} |
| Dev/sim RNG | Python `numpy.random.Generator(PCG64(seed))`; seeds recorded in simulation provenance | {{simRngEvidence}} |
| Seed & entropy integrity (production) | delegated to RGS; documented expectation: {{seedEntropyExpectation}} | {{seedEntropyEvidence}} |
| Outcome independence | each round independent; no player-adaptive RTP, no behavioural odds, no forced near-miss weighting, no fake wins | {{independenceEvidence}} |
| `Math.random()` for outcomes | forbidden and lint/test-enforced | {{mathRandomCheck}} |

## 2. Server authority & bet/payout integrity

<!-- Cover: bet validation, payout verification, no client influence on results. -->

| Topic | This game | Evidence |
|---|---|---|
| Server-authoritative results | client is a pure renderer of the outcome manifest; cannot determine, predict, or alter results | {{serverAuthorityEvidence}} |
| Bet validation | wagerMinor validated against configured bet levels ({{betLevels}}); invalid bets rejected before round_requested | {{betValidationEvidence}} |
| Payout verification | winMinor = (betMinor × payX100) // 100 integer rule identical in math model, simulator, client display | {{payoutVerificationEvidence}} |
| Money representation | integer minor units end-to-end; no binary floats in settlement | {{minorUnitsEvidence}} |
| Manifest integrity | signature field over manifest bytes (detached JWS / HMAC placeholder in dev) | {{signatureEvidence}} |

## 3. Recovery & interrupted-game handling

| Topic | This game | Evidence |
|---|---|---|
| Game-state recovery | re-fetch committed manifest + resumePointer (stepId); presentation seeks to that step instantly | {{recoveryDesignEvidence}} |
| Replacement results | recovery NEVER generates a new result (rejection rule; tested) | {{recoveryNoReplacementEvidence}} |
| Interrupted-game handling | states `reconnecting` → `recovering`; unsettled rounds resume before new play is allowed | {{interruptedEvidence}} |
| Interruption coverage tested | base game / cascades / all three tiers / max-win termination | {{interruptionTestsEvidence}} |

## 4. Game history & replay

| Topic | This game | Evidence |
|---|---|---|
| Round history record | roundId, wagerMinor, totalWinMinor, balanceAfterMinor, full manifest, gameVersion, mathVersion, configHash | {{historyRecordEvidence}} |
| Replay capability | committed manifest is replayable step-by-step for support/dispute review | {{replayEvidence}} |
| History display to player | gated by `showGameHistory` policy flag | {{historyDisplayEvidence}} |
| Data & audit retention | {{auditRetentionApproach}} <!-- what the game exposes; retention itself is operator/RGS responsibility --> | {{auditEvidence}} |

## 5. Configuration versioning & RTP profiles

| Topic | This game | Evidence |
|---|---|---|
| Versioning | gameVersion {{gameVersion}}, mathVersion {{mathVersion}}, configHash {{configHash}} recorded on every round and report | {{versioningEvidence}} |
| Selectable RTP profiles | {{rtpProfilesList}} <!-- e.g. 0.9600 default; 0.9400/0.9200 optional --> — one PAR sheet + simulation per profile | {{rtpProfilesEvidence}} |
| RTP display | gated by `showRtp`; displayed value matches the active profile's measured RTP and the help screen | {{rtpDisplayEvidence}} |
| Max-win display | gated by `showMaximumWin`; cap {{maxWinXBet}}x shown consistently in help and marketing surfaces | {{maxWinDisplayEvidence}} |

## 6. Tier disclosure & help-screen consistency

| Topic | This game | Evidence |
|---|---|---|
| Tier disclosure | help screen discloses 3/4/5+ scatter tiers, their public names, and internal materially-different behaviour | {{tierDisclosureEvidence}} |
| Trigger odds / frequency disclosure | {{tierOddsDisclosure}} <!-- what is disclosed, per jurisdiction expectations --> | {{tierOddsEvidence}} |
| Help vs math consistency | every help-screen rule matches configs/math (rejection rule #7; tested) | {{helpConsistencyEvidence}} |

## 7. Autoplay matrix

<!-- How autoplay behaves under each policy. Add one column/row per additional
target jurisdiction policy as needed. -->

| Capability | default-demo policy | most-restrictive policy | {{extraPolicyId}} |
|---|---|---|---|
| Autoplay available | {{apDefault}} | disabled | {{apExtra}} |
| Mandatory spin-count limit | {{apCountDefault}} | n/a (disabled) | {{apCountExtra}} |
| Loss limit required before start | {{apLossDefault}} | n/a | {{apLossExtra}} |
| Single-win stop | {{apWinDefault}} | n/a | {{apWinExtra}} |
| Stop on feature trigger | {{apFeatDefault}} | n/a | {{apFeatExtra}} |
| Player can cancel at any time | yes | n/a | {{apCancelExtra}} |

## 8. Spin-speed matrix

| Capability | default-demo policy | most-restrictive policy | {{extraPolicyId}} |
|---|---|---|---|
| Quick spin | {{qsDefault}} | disabled | {{qsExtra}} |
| Turbo spin | {{tsDefault}} | disabled | {{tsExtra}} |
| Slam stop / animation skip | {{ssDefault}} | disabled | {{ssExtra}} |
| Minimum round duration (ms) | {{mrdDefault}} | {{mrdRestrictive}} | {{mrdExtra}} |
| Outcome equivalence across speeds | proven by G12 equivalence tests in every policy | same | same |

## 9. Bonus buy & enhanced chance gating

| Topic | This game | Evidence |
|---|---|---|
| Bonus-buy modes | {{buyModesList}} | {{buyModesEvidence}} |
| Gating | `bonusBuyEnabled` per policy; hidden entirely when disabled (not merely greyed out): {{buyHiddenBehaviour}} | {{buyGatingEvidence}} |
| Enhanced chance | {{enhancedChanceSummary}}; gated by `enhancedChanceEnabled` | {{enhancedGatingEvidence}} |
| Independent analysis per buy mode | separate simulation + RTP per mode (rejection rule #9) | {{buyAnalysisEvidence}} |

## 10. Win presentation & LDW handling

| Topic | This game | Evidence |
|---|---|---|
| LDW (win < stake) handling | never celebrated above `small` tier presentation; {{ldwPresentation}} | {{ldwEvidence}} |
| Win-tier thresholds | small < 5x, medium ≥ 5x, big ≥ 15x, mega ≥ 40x, epic ≥ 80x, max = cap ({{winTierOverrides}}) | {{winTierEvidence}} |
| No fake wins / forced near-misses | math is fixed and versioned; anticipation is presentation-only and does not change odds | {{noFakeWinsEvidence}} |

## 11. Responsible gaming & reality-check hooks

| Topic | This game | Evidence |
|---|---|---|
| Reality-check hook | client exposes {{realityCheckHook}} <!-- e.g. onRealityCheck(intervalMs) pause+dialog API for operator wrapper --> | {{realityCheckEvidence}} |
| Session info exposure | elapsed time, total wagered/won available to operator shell | {{sessionInfoEvidence}} |
| Clock display | {{clockDisplay}} | {{clockEvidence}} |
| Operator pause/suspend | game can be paused between rounds by the wrapper without losing state | {{pauseEvidence}} |

## 12. Accessibility

| Requirement | This game | Evidence |
|---|---|---|
| Reduced-motion variant for every animation event | {{a11yReducedMotion}} | {{a11yReducedMotionEvidence}} |
| No information by colour alone | {{a11yColour}} | {{a11yColourEvidence}} |
| Touch targets ≥ 44px | {{a11yTouch}} | {{a11yTouchEvidence}} |
| Flash rate ≤ 3/s | {{a11yFlash}} | {{a11yFlashEvidence}} |
| HUD text contrast ≥ 4.5:1 | {{a11yContrast}} | {{a11yContrastEvidence}} |
| Additional expectations researched | {{a11yExtra}} | {{a11yExtraEvidence}} |

## 13. Per-jurisdiction policy table

<!-- One row per TARGET jurisdiction/policy. Values are engineering
configuration examples ONLY and must not be treated as legal conclusions —
each row requires jurisdiction-specific legal review (§14). UNKNOWN
jurisdiction always resolves to the most restrictive policy. -->

| Policy id | Jurisdiction target | Autoplay | Quick | Turbo | Skip | Bonus buy | Enhanced chance | Min round (ms) | Show RTP | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| default-demo | demo/social only | {{ddAutoplay}} | {{ddQuick}} | {{ddTurbo}} | {{ddSkip}} | {{ddBuy}} | {{ddEnhanced}} | {{ddMinRound}} | {{ddShowRtp}} | {{ddNotes}} |
| most-restrictive | UNKNOWN fallback | false | false | false | false | false | false | {{mrMinRound}} | true | safe default per CONVENTIONS §9.6 |
| {{policy3Id}} | {{policy3Jurisdiction}} | {{p3Autoplay}} | {{p3Quick}} | {{p3Turbo}} | {{p3Skip}} | {{p3Buy}} | {{p3Enhanced}} | {{p3MinRound}} | {{p3ShowRtp}} | {{p3Notes}} |

### 13.1 Policy JSON snippets

<!-- One snippet per row above; must match config/jurisdiction-policies.json
exactly and validate against schemas/jurisdiction-policy.schema.json. -->

```json
{
  "jurisdictionPolicy": {
    "policyId": "default-demo",
    "autoplayEnabled": true,
    "quickSpinEnabled": true,
    "turboSpinEnabled": true,
    "animationSkipEnabled": true,
    "bonusBuyEnabled": true,
    "enhancedChanceEnabled": true,
    "minimumRoundDurationMs": null,
    "showRtp": true,
    "showMaximumWin": true,
    "showGameHistory": true
  }
}
```

```json
{
  "jurisdictionPolicy": {
    "policyId": "most-restrictive",
    "autoplayEnabled": false,
    "quickSpinEnabled": false,
    "turboSpinEnabled": false,
    "animationSkipEnabled": false,
    "bonusBuyEnabled": false,
    "enhancedChanceEnabled": false,
    "minimumRoundDurationMs": {{mrMinRoundMs}},
    "showRtp": true,
    "showMaximumWin": true,
    "showGameHistory": true
  }
}
```

<!-- Add one snippet per additional target policy. These values are
configuration examples only — not legal conclusions. -->

## 14. REQUIRED external reviews (release blockers)

<!-- ALL default to NOT-YET-DONE. Update a row ONLY when real, referenced
evidence exists (report id, certificate number, signed acceptance). While any
row is NOT-YET-DONE, this game MUST NOT be released for real money and MUST
NOT be described as certified. -->

| # | External review | Status | Evidence reference | Date |
|---|---|---|---|---|
| 1 | Jurisdiction-specific legal review | NOT-YET-DONE | — | — |
| 2 | Independent mathematical verification / math certification | NOT-YET-DONE | — | — |
| 3 | External security review | NOT-YET-DONE | — | — |
| 4 | Laboratory / regulator certification (e.g. GLI-19-scope interactive standards, per jurisdiction) | NOT-YET-DONE | — | — |
| 5 | Operator / aggregator acceptance testing (UAT) | NOT-YET-DONE | — | — |

## 15. Laboratory submission expectations

<!-- What the package already provides toward a lab submission, and what the
submitting operator must add. -->

| Item | Provided by this package | Gap / owner |
|---|---|---|
| PAR sheet + machine-readable math report | {{labParSheet}} | {{labParSheetGap}} |
| Source & config versioning (configHash, semver) | {{labVersioning}} | {{labVersioningGap}} |
| Simulation reproducibility block (seeds, rounds, command, lockfile hash) | {{labRepro}} | {{labReproGap}} |
| State-machine & recovery documentation | {{labRecoveryDocs}} | {{labRecoveryGap}} |
| RNG documentation | dev/sim RNG documented; production RNG is RGS scope | RGS operator |
| Help-screen / rules text | {{labHelp}} | {{labHelpGap}} |
| {{labExtraItem}} | {{labExtraProvided}} | {{labExtraGap}} |

## 16. Open compliance risks

| # | Risk | Severity | Mitigation / follow-up |
|---|---|---|---|
| 1 | {{compRisk1}} | {{compRisk1Severity}} | {{compRisk1Mitigation}} |

---

<!-- Honesty footer — keep verbatim. -->
> This review is an internal engineering assessment produced by
> single-modern-slot-creator v1.0.0. It contains **no legal conclusions** and
> is **not certification evidence**. The game may not be labelled certified
> unless actual certification evidence exists, and every item in §14 must be
> completed before any real-money release.
