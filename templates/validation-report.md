<!--
TEMPLATE: validation-report.md — single-modern-slot-creator v1.0.0
Written by the compliance-qa role at step 13 and finalized at step 14.
HONESTY RULES: report every result exactly as measured. A failed check stays
FAIL — never massage numbers, never delete a failing row. If a gate still
fails after 3 fix attempts, complete the FAILED-GATE section (§5) and mark the
whole package FAILED-GATE. Statuses: PASS / FAIL / SKIPPED (+ reason) /
NOT-RUN (+ reason). Evidence = command output, report path, or test file ref.
-->

# Validation Report — {{gameName}}

| Field | Value |
|---|---|
| Game name | {{gameName}} |
| Project slug | {{projectSlug}} |
| Game version | {{gameVersion}} |
| Math version | {{mathVersion}} |
| Config hash | {{configHash}} |
| Date | {{dateIso}} |
| Generator | single-modern-slot-creator v1.0.0 |
| **Overall verdict** | {{overallVerdict}} <!-- ALL-GATES-PASS / FAILED-GATE / PASS-WITH-SKIPS --> |

---

## 1. Gate results (G2–G14)

<!-- One row per gate, matching SKILL.md §Step gates. Attempts = fix-and-re-run
count (max 3 before recording failure and stopping honestly). -->

| Gate | Scope | Status | Attempts | Evidence | Notes |
|---|---|---|---|---|---|
| G2 | Research: ≥ 8 dated sources; IP-risk list; patterns-not-to-copy list | {{g2Status}} | {{g2Attempts}} | {{g2Evidence}} | {{g2Notes}} |
| G3 | Concept: exactly 3 scored candidates → 1 selected; original, adult-appropriate theme | {{g3Status}} | {{g3Attempts}} | {{g3Evidence}} | {{g3Notes}} |
| G4 | Mechanics: 1 archetype + 1 primary + ≤ 3 supporting; full field set per mechanic; no trademarked names | {{g4Status}} | {{g4Attempts}} | {{g4Evidence}} | {{g4Notes}} |
| G5 | Math: configs schema-valid; sim runs; RTP within tolerance; contributions sum ±0.0005; max win reachable & capped; PAR sheet complete; per-tier + per-buy sims; reproducibility block | {{g5Status}} | {{g5Attempts}} | {{g5Evidence}} | {{g5Notes}} |
| G6 | Tiers materially different in math AND presentation | {{g6Status}} | {{g6Attempts}} | {{g6Evidence}} | {{g6Notes}} |
| G7 | UI: all screens/states × portrait/landscape/tablet/desktop/ultrawide; HUD completeness; 10 component states per control | {{g7Status}} | {{g7Attempts}} | {{g7Evidence}} | {{g7Notes}} |
| G8 | Motion: animation-events.json valid; full field set per event; triggers map to real states; skip cannot alter outcomes | {{g8Status}} | {{g8Attempts}} | {{g8Evidence}} | {{g8Notes}} |
| G9 | Art: prompts cover full asset manifest; full prompt field set; MCP generation attempted when available; provenance per asset | {{g9Status}} | {{g9Attempts}} | {{g9Evidence}} | {{g9Notes}} |
| G10 | Audio: audio-events.json valid; every animation audioEvent exists; music covers base + all three tiers | {{g10Status}} | {{g10Attempts}} | {{g10Evidence}} | {{g10Notes}} |
| G11 | Code: bun install + typecheck + test green; seeded dev-only round provider; RGS adapter compiles; recovery replays to correct step | {{g11Status}} | {{g11Attempts}} | {{g11Evidence}} | {{g11Notes}} |
| G12 | Modes: equivalence across normal/quick/turbo/skipped/recovered; all autoplay stop conditions; rapid-input protection | {{g12Status}} | {{g12Attempts}} | {{g12Evidence}} | {{g12Notes}} |
| G13 | QA: full test matrix executed; rejection rules checked; this report written with honest per-item pass/fail | {{g13Status}} | {{g13Attempts}} | {{g13Evidence}} | {{g13Notes}} |
| G14 | Packaging: every deliverable exists; manifest lists every file + sha256; known limitations + certification-readiness checklist | {{g14Status}} | {{g14Attempts}} | {{g14Evidence}} | {{g14Notes}} |

## 2. Test category results

<!-- One subsection per category. Record the exact command, counts, and status.
Categories that need a device/browser farm that is unavailable are SKIPPED with
reason — never silently omitted. -->

### 2.1 Unit tests (client)

| Item | Value |
|---|---|
| Command | `bun test` (in `games/{{projectSlug}}/client/`) |
| Passed / failed / skipped | {{unitPassed}} / {{unitFailed}} / {{unitSkipped}} |
| Status | {{unitStatus}} |
| Notes | {{unitNotes}} |

### 2.2 Math / simulation tests

| Item | Value |
|---|---|
| Command | `uv run pytest` + `uv run python -m slot_math.simulate {{simArgs}}` |
| Passed / failed / skipped | {{mathPassed}} / {{mathFailed}} / {{mathSkipped}} |
| RTP result vs tolerance | {{mathRtpResult}} |
| Contribution-sum check (±0.0005) | {{mathSumCheck}} |
| Status | {{mathStatus}} |
| Notes | {{mathNotes}} |

### 2.3 Schema validation

<!-- Every config/*.json + artifact-manifest.json + prompts/*.json against schemas/. -->

| File | Schema | Status |
|---|---|---|
| config/game-config.json | game-config.schema.json | {{svGameConfig}} |
| config/symbols.json | symbol.schema.json | {{svSymbols}} |
| config/paytable.json | paytable.schema.json | {{svPaytable}} |
| config/reel-sets.json | reel-set.schema.json | {{svReelSets}} |
| config/scatter-tiers.json | scatter-tiers.schema.json | {{svScatterTiers}} |
| config/features.json | feature.schema.json | {{svFeatures}} |
| config/bonus-buys.json | bonus-buy.schema.json | {{svBonusBuys}} |
| config/spin-presentation.json | {{svSpinPresSchema}} | {{svSpinPres}} |
| config/autoplay.json | {{svAutoplaySchema}} | {{svAutoplay}} |
| config/jurisdiction-policies.json | jurisdiction-policy.schema.json | {{svJurisdiction}} |
| config/state-machine.json | state-machine.schema.json | {{svStateMachine}} |
| config/animation-events.json | animation-event.schema.json | {{svAnimEvents}} |
| config/audio-events.json | audio-event.schema.json | {{svAudioEvents}} |
| config/asset-manifest.json | asset-manifest.schema.json | {{svAssetManifest}} |
| config/device-profiles.json | {{svDeviceProfilesSchema}} | {{svDeviceProfiles}} |
| math/reports/simulation-report.json | simulation-report.schema.json | {{svSimReport}} |
| math/reports/par-sheet.json | par-sheet.schema.json | {{svParSheet}} |
| artifact-manifest.json | asset-manifest/skill-output conventions (§6) | {{svArtifactManifest}} |

Overall schema-validation status: {{schemaOverallStatus}}

### 2.4 State-machine tests

| Item | Value |
|---|---|
| All 23 canonical states present, none renamed | {{smStatesCheck}} |
| No unreachable states / no dead-end non-terminal states | {{smReachability}} |
| Every animation trigger maps to a real state | {{smAnimTriggers}} |
| No infinite loops (retrigger caps, cascade caps proven) | {{smLoopCheck}} |
| Status | {{smStatus}} |

### 2.5 Equivalence tests (presentation modes)

| Item | Value |
|---|---|
| Manifest corpus size | {{eqCorpusSize}} <!-- number of distinct outcome manifests replayed --> |
| Modes compared | normal / quick / turbo / skipped / recovered |
| Result | {{eqResult}} <!-- identical final balance & win in every mode: yes/no --> |
| Status | {{eqStatus}} |

### 2.6 Autoplay tests

| Stop condition | Tested | Result |
|---|---|---|
| Spin-count limit | {{apSpinCount}} | {{apSpinCountResult}} |
| Loss limit | {{apLossLimit}} | {{apLossLimitResult}} |
| Single-win limit | {{apWinLimit}} | {{apWinLimitResult}} |
| Balance threshold stop | {{apBalance}} | {{apBalanceResult}} |
| Stop on feature trigger | {{apFeatureStop}} | {{apFeatureStopResult}} |
| Jurisdiction flag disables autoplay | {{apJurisdiction}} | {{apJurisdictionResult}} |
| {{apExtraCondition}} | {{apExtra}} | {{apExtraResult}} |

Status: {{autoplayStatus}}

### 2.7 Rapid-input protection tests

| Item | Value |
|---|---|
| Spam spin / slam-stop / buy-button mashing cannot double-spend or desync | {{riDoubleSpend}} |
| Input locked during blocksInput events | {{riBlocksInput}} |
| Status | {{riStatus}} |

### 2.8 Recovery tests

| Scenario | Result |
|---|---|
| Disconnect mid base-game presentation | {{recBaseGame}} |
| Disconnect mid cascade | {{recCascade}} |
| Disconnect mid `feature` | {{recFeature}} |
| Disconnect mid `super_feature` | {{recSuperFeature}} |
| Disconnect mid `ultimate_feature` | {{recUltimateFeature}} |
| Disconnect during max-win termination | {{recMaxWin}} |
| Recovery never generates a replacement result | {{recNoReplacement}} |
| Resume seeks to resumePointer instantly | {{recResumePointer}} |

Status: {{recoveryStatus}}

### 2.9 Browser matrix

| Browser | Version | Result |
|---|---|---|
| Chromium | {{brChromiumVer}} | {{brChromium}} |
| Firefox | {{brFirefoxVer}} | {{brFirefox}} |
| Safari / WebKit | {{brSafariVer}} | {{brSafari}} |
| Edge | {{brEdgeVer}} | {{brEdge}} |

Status: {{browserStatus}} <!-- NOTE: never use playwright headless-chrome-shell -->

### 2.10 Mobile tests

| Device / profile | Orientation | Result |
|---|---|---|
| {{mobDevice1}} | portrait + landscape | {{mobDevice1Result}} |
| {{mobDevice2}} | portrait + landscape | {{mobDevice2Result}} |

Status: {{mobileStatus}}

### 2.11 Accessibility tests

| Check | Result |
|---|---|
| Reduced-motion variant fires for every animation event | {{a11yReducedMotion}} |
| No information by colour alone | {{a11yColour}} |
| Touch targets ≥ 44px | {{a11yTouch}} |
| Flash rate ≤ 3/s | {{a11yFlash}} |
| HUD text contrast ≥ 4.5:1 | {{a11yContrast}} |

Status: {{a11yStatus}}

### 2.12 Visual tests

| Item | Value |
|---|---|
| Method | {{visMethod}} <!-- screenshot compare / manual review checklist --> |
| Scenes covered | {{visScenes}} |
| Status | {{visStatus}} |

### 2.13 Performance tests

| Metric | Target | Measured | Result |
|---|---|---|---|
| FPS (base game, mid-tier device profile) | {{perfFpsTarget}} | {{perfFpsMeasured}} | {{perfFpsResult}} |
| FPS (heaviest tier presentation) | {{perfFpsFeatureTarget}} | {{perfFpsFeatureMeasured}} | {{perfFpsFeatureResult}} |
| Load time to `ready` | {{perfLoadTarget}} | {{perfLoadMeasured}} | {{perfLoadResult}} |
| Bundle size | {{perfBundleTarget}} | {{perfBundleMeasured}} | {{perfBundleResult}} |

Status: {{perfStatus}}

### 2.14 Memory tests

| Metric | Target | Measured | Result |
|---|---|---|---|
| Heap after 1000 spins | {{memHeapTarget}} | {{memHeapMeasured}} | {{memHeapResult}} |
| Leak check (growth per 100 rounds) | {{memLeakTarget}} | {{memLeakMeasured}} | {{memLeakResult}} |
| Texture memory within device profile budget | {{memTextureTarget}} | {{memTextureMeasured}} | {{memTextureResult}} |

Status: {{memStatus}}

### 2.15 Long-session tests

| Item | Value |
|---|---|
| Session length simulated | {{lsLength}} <!-- e.g. 4h autoplay soak / N thousand rounds --> |
| Errors / desyncs / stalls observed | {{lsErrors}} |
| Balance ledger consistent throughout | {{lsLedger}} |
| Status | {{lsStatus}} |

## 3. Rejection-rule checklist

<!-- The game is REJECTED if ANY row below is violated (prompt.txt rejection
rules). "Violated?" must be an honest no/YES with evidence either way. -->

| # | Rejection rule | Violated? | Evidence |
|---|---|---|---|
| 1 | RTP is outside tolerance | {{rr1}} | {{rr1Evidence}} |
| 2 | Feature contributions do not sum correctly (±0.0005) | {{rr2}} | {{rr2Evidence}} |
| 3 | Maximum win exceeds the configured cap | {{rr3}} | {{rr3Evidence}} |
| 4 | A feature can enter an infinite state | {{rr4}} | {{rr4Evidence}} |
| 5 | Client presentation changes the final result | {{rr5}} | {{rr5Evidence}} |
| 6 | Recovery generates a replacement result | {{rr6}} | {{rr6Evidence}} |
| 7 | A rule in the help screen differs from the math | {{rr7}} | {{rr7Evidence}} |
| 8 | A configured animation references an invalid state | {{rr8}} | {{rr8Evidence}} |
| 9 | A bonus-buy mode lacks independent analysis | {{rr9}} | {{rr9Evidence}} |
| 10 | A JSON artifact fails schema validation | {{rr10}} | {{rr10Evidence}} |

Rejection verdict: {{rejectionVerdict}} <!-- NOT-REJECTED / REJECTED (rules #…) -->

## 4. Known limitations & skipped checks

<!-- Every SKIPPED or NOT-RUN item above, restated with reason and impact.
Mirror into docs/known-limitations.md and artifact-manifest knownLimitations. -->

| # | Limitation / skipped check | Reason | Impact | Follow-up |
|---|---|---|---|---|
| 1 | {{lim1}} | {{lim1Reason}} | {{lim1Impact}} | {{lim1FollowUp}} |

## 5. FAILED-GATE section

<!-- COMPLETE THIS SECTION ONLY IF a gate failed after 3 fix attempts (else
write "No failed gates." and leave the table with its header row). The package
ships marked FAILED-GATE with full evidence — never hide the failure. -->

{{failedGateStatement}} <!-- "No failed gates." OR a summary of what failed -->

| Gate | What failed | Attempts made (what was tried) | Final error / measurement | Suspected root cause | Recommended next action |
|---|---|---|---|---|---|
| {{fgGate}} | {{fgWhat}} | {{fgAttempts}} | {{fgFinalError}} | {{fgRootCause}} | {{fgNextAction}} |

## 6. Certification-readiness statement

<!-- Keep verbatim; fill only the verdict line. -->

Verdict: {{certReadinessVerdict}} <!-- e.g. "certification-ready candidate" or "NOT ready — see §5" -->

> This package is at most a certification-ready **candidate**. Nothing in this
> report constitutes certification. Real-money release still requires:
> jurisdiction-specific legal review, independent mathematical verification,
> external security review, laboratory or regulator certification where
> applicable, and operator/aggregator acceptance testing — all tracked in
> docs/compliance-review.md.
