# Jurisdiction Policy Matrix — Feature Flags & Default `jurisdictionPolicy` Blocks

```
domain: 17 — jurisdiction × feature-flag matrix (canonical seed for config/jurisdiction-policies.json)
generator: single-modern-slot-creator v1.0.0 (research phase, job synth-ipjuris)
date: 2026-08-08
status: research dossier — engineering defaults, NOT legal conclusions; every
        real-money release requires jurisdiction-specific legal review (CONVENTIONS §9.9)
inputs: research/05-jurisdiction-rules.md (primary; source ids 05:S1–S52),
        research/13-responsible-design-accessibility.md (13:S1–S24),
        research/04-technical-standards-rng-integrity.md (04:S1–S32),
        research/12-market-patterns-ip.md (12:S20, S33–S37)
```

Value legend: **✅ allowed** · **❌ banned / must be off** · **⚠️ conditional**
(condition stated in-cell; ships with a mandatory legal-review flag in
`compliance-review.md`). Source refs `05:S1` = source S1 in dossier 05's register.
`minRoundMs` = enforced floor from spin start to next-spin availability; `null` = no
regulatory floor (game default applies). All ⚠️ cells and every [inferred] value must
appear in the generated game's legal-review checklist.

---

## 1. The matrix

| Jurisdiction | autoplay | quickSpin | turboSpin | slamStop | animationSkip | bonusBuy | enhancedChance | minRoundDurationMs | maxStake | LDW-celebration | netPosition / sessionClock | realityCheck | RTP-display |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GB — UKGC** | ❌ RTS 8/8A, all online gaming since 2025-01-17 [05:S2][05:S4] | ❌ RTS 14E [05:S1] | ❌ RTS 14E [05:S1] | ❌ RTS 14E [05:S1] | ⚠️ banned for base cycle; ✅ inside no-extra-stake bonus (14E carve-out); never below 2.5 s floor [05:S1] | ❌ UKGC 2019/20 enforcement under RTS 3A+14A; no explicit clause, treat as banned [05:S7][05:S52] | ⚠️ live today but sits near RTS 14A; default OFF + legal review [05:S7] | **2500** (RTS 14D; release-and-re-press per cycle; enforced — Stakelogic £122,835) [05:S1][05:S5] | £5/game cycle (25+, since 2025-04-09); £2 (18–24, since 2025-05-21); runtime session override REQUIRED [05:S9][05:S10] | ❌ banned for return ≤ stake (RTS 14F); neutral result display only [05:S1] | ✅ mandatory: net position in account currency (RTS 2E) + elapsed time h/m/s (RTS 13C) [05:S2][05:S11] | player-set frequency, blocking at cycle end, ack required, exit+history links (RTS 13B) [05:S2] | ✅ in game rules (RTS 3A); no statutory floor; displayed RTP must match deployed build [04:S7][04:S31] |
| **DE — GGL (GlüStV 2021)** | ❌ §22a(6) [05:S12] | ❌ [05:S12] | ❌ [05:S12] | ❌ [05:S12] | ⚠️ only within the 5 s average floor [05:S12; inferred] | ❌ in effect: stake caps make ≥100x buys impossible + autoplay ban [05 §2, inferred] | ❌ in effect: stake cap blocks meaningful ante multipliers [05 §13, inferred] | **5000** (§22a(6) "average 5 s"; implement fixed 5000 floor) [05:S12][13:S6] | €1 default (§22a(7)); tiered since 2026-07-01: €3 (21+), €5 (90-day no-harm qualified, monitored); under-21 stays €1; session override REQUIRED [05:S43][05:S44][05:S45] | ⚠️ no explicit rule; suppress by default [inferred-safe] | ⚠️ recommended HUD; 60-min elapsed-time notice w/ express confirmation mandatory (§6h(7)) [13:S6] | fixed-60 notice + **5-min lockout** after confirmation before next spin (§6h(7)/§22a(9)) [13:S6] | ✅ recommended; no floor; tax drives ~94% profiles, each separately certified [05:S12][04:S31] |
| **SE — Spelinspektionen** | ⚠️ allowed; each auto round ≥3 s (LIFS 2018:8/SIFS 2022:3); 2026 draft: ≤60 rounds + immediate stop (pending) [05:S47][05:S48][05:S49] | ❌ in effect (3 s floor) [05:S47] | ❌ in effect (3 s floor) [05:S47] | ⚠️ off by default (no explicit ban; 3 s floor governs) [inferred] | ⚠️ skip only down to 3 s floor [05 §13, inferred] | ⚠️ widely disabled on SE sites; no written ban — default OFF + legal review [05:S16] | ⚠️ default OFF [inferred] | **3000** ("tresekundersregeln", applies to autoplay rounds too) [05:S47][05:S48] | null (player-set mandatory deposit/stake limits; no statutory per-spin cap) [05:S15] | ⚠️ suppress by default [inferred-safe] | ✅ elapsed time displayed continuously, values refreshed each round; net position in reality check (LIFS 2018:2 lineage) [13:S7] | player-set interval showing elapsed time + net position; Spelpaus + 24 h immediate exclusion [13:S7][05:S14] | ✅ recommended [05 §13] |
| **NL — KSA (KOA)** | ❌ conscious choice per spin (art. 3.8 Regeling KOA); enforced 2022/2025 [05:S18][05:S19] | ⚠️ tolerated today; verify — KSA's expansive 2025 autoplay reading suggests conservatism [05 §U3] | ⚠️ verify (same) [05 §U3] | ⚠️ off by default [inferred] | ⚠️ verify [inferred] | ❌ purchased auto-playing bonus batches = autoplay (art. 3.8 Regeling KOA) [05:S20] | ⚠️ default OFF [inferred] | null (none found) [05 §4] | null (cross-operator deposit/loss limits pending 2026; age-21 slots proposal) [05:S19][05:S21] | ⚠️ suppress by default [inferred-safe] | ⚠️ recommended; exact per-game HUD duty unverified (Besluit KOA) [05 §U4] | operator-side duty-of-care prompts [05:S19] | ✅ recommended [05 §13] |
| **DK — Spillemyndigheden** | ✅ [observed — no game-design micro-rules; regulates via SAFE data/certification] [05:S28] | ✅ [observed] | ✅ [observed] | ⚠️ off by default (design stance, dossier 13) | ✅ | ✅ [observed] | ✅ [observed] | null [05 §7] | null (mandatory account-level deposit-limit setting) [05:S28] | ⚠️ suppress by default [inferred-safe] | ⚠️ recommended | platform: mandatory deposit limits, ROFUS self-exclusion [05:S28] | ✅ recommended |
| **ES — DGOJ** | ⚠️ no confirmed ban; verify; must tolerate forced session termination (RD 176/2023) [05 §U5] | ❌ in effect (3 s floor) [05:S22] | ❌ in effect (3 s floor) [05:S22] | ⚠️ off by default [inferred] | ⚠️ skip only to 3 s floor [inferred] | ⚠️ default OFF + legal review [05 §5] | ⚠️ default OFF [inferred] | **3000** (Chambers 2025; pin exact DGOJ resolution clause before ES release) [05:S22][05 §U6] | null (RD 520/2026 deposit limits €700/day etc. are platform-level; mandatory pre-session time+spend config) [05:S23][05:S25] | ⚠️ suppress by default [inferred-safe] | ✅ session timer + session spend mandatory (RD 176/2023 pre-set limits, auto-terminate) [05:S23][05:S24] | fixed-60 forced-read self-assessment + mandatory pre-session limit config; mid-session config change forbidden [05:S23][13:S12] | ✅ recommended [05 §13] |
| **IT — ADM** | ⚠️ verify (no prohibition surfaced) [05 §6] | ✅ [observed] | ✅ [observed] | ⚠️ off by default (design stance) | ✅ | ⚠️ varies by operator; legal review [05 §6] | ⚠️ varies [inferred] | null [05 §6] | null (deposit/wager limits mandatory at registration) [05:S26] | ⚠️ suppress by default [inferred-safe] | ✅ recommended + **20-min inactivity logout with state restore** [05:S26] | periodic mandatory pop-ups + activity statements [05:S26] | ✅ min RTP **0.90** (online fixed-odds incl. slots, verified); display active profile [05:S50] |
| **BE — Gaming Commission** | ⚠️ observed available with controls [05:S31] | ✅ [observed] | ✅ [observed] | ⚠️ off by default | ✅ | ⚠️ verify [05 §8] | ⚠️ verify | null [05 §8] | null (unused statutory online power; €200/wk deposit limit; labs may ask hourly-loss sim at min-cycle speed) [05:S30][05:S31] | ⚠️ suppress by default [inferred-safe] | ✅ recommended | age 21 (since 2024-09-01); **bonuses banned entirely** ⇒ promoHooks OFF; vertical separation [05:S29] | ✅ recommended |
| **MT — MGA (Directive 2 of 2018 v3)** | ✅ with mandatory interval-alert pop-up option on auto-spin [05:S37] | ✅ [observed] | ✅ [observed] | ✅ [observed]; off by default (design stance) | ✅ | ✅ [observed — commercial home turf] [05 §11] | ✅ [observed] | null | null | ⚠️ suppress by default [inferred-safe] | ⚠️ recommended; elapsed time in reality check | player-set, persists until acknowledged; content mandated: time played, wagered, wins/losses, stay-in-control reminder (2023 amendment) [05:S37][05:S38] | ✅ min RTP **0.85** (Art. 22); demo parity mandatory; 6-month history [05:S39][05:S37][04:S20] |
| **CW — CGA (LOK)** | ✅ (no game-design micro-rules; entity-level regulation) [05:S41][05:S42] | ✅ | ✅ | ✅; off by default | ✅ | ✅ | ✅ | null | null | ⚠️ suppress by default [inferred-safe] | ⚠️ recommended | self-exclusion, no credit to players, RNG cert by approved lab [05:S42] | ✅ recommended |
| **CA-ON — AGCO** | ❌ Std 2.16 [05:S32] | ❌ Std 2.19 [05:S32] | ❌ Std 2.19 [05:S32] | ❌ Std 2.19 [05:S32] | ⚠️ banned for base cycle; ✅ no-extra-stake bonus exempt (2.19) [05:S32] | ❌ [observed — not offered on ON casinos; not explicit in standards; legal review] [05:S8][05 §U8] | ⚠️ default OFF [inferred, 05 §13] | **2500** + release-and-depress (Std 2.18) [05:S32] | null | ❌ banned for return ≤ last total wager (Std 2.20) [05:S32] | ✅ mandatory: net position **in CAD, not credits** (2.21) + time tracking (2.22) [05:S32] | limit-setting + 24 h cooling-off on increases, breaks-in-play (2.13/2.23–2.24) [05:S32] | ✅ understandable odds/RTP before wagering (4.05/4.06); no near-miss substitution, demo odds identical (2.15) [05:S32] |
| **US-NJ — DGE** | ✅ [observed] [05:S33] | ✅ | ✅ | ✅; off by default | ✅ | ⚠️ generally not offered in US regulated markets — default OFF + per-state review [05 §10] | ✅ | null | null (auto-pick must pick highest-RTP or unbiased if RTP assumes optimal play) [05:S33] | ⚠️ suppress by default [inferred-safe] | ⚠️ recommended | platform RG page/limits [05 §10] | ✅ min RTP **0.83**; odds cap 100,000,000:1; "malfunction voids all pays"; free-game counters displayed [05:S33] |
| **US-MI — MGCB** | ✅ [observed] | ✅ | ✅ | ✅; off by default | ✅ | ⚠️ default OFF [observed] | ✅ | null | null | ⚠️ suppress by default | per GLI-19 [05:S34][05:S36] | per GLI-19/state (R 432.633 adopts GLI-19 v3.0; lab + board approval per game) [05:S34] | ✅ per GLI-19 §4.7 / RTP disclosure [04:S3] |
| **US-PA — PGCB** | ✅ [observed] | ✅ | ✅ | ✅; off by default | ✅ | ⚠️ default OFF [observed] | ✅ | null | null | ⚠️ suppress by default | ⚠️ recommended | per 58 Pa. Code 810a testing/controls [05:S35] | ✅ per lab standard [04:S3] |
| **SOCIAL / DEMO (no real money)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (virtual currency) | ✅ | null | n/a (no wagers) | ⚠️ suppressed anyway (design stance, CONVENTIONS §9.5 + 13:D1) | ⚠️ recommended (session clock good practice) | off / platform | ⚠️ **demo parity mandatory where reachable from regulated markets**: demo RTP & odds identical to real game (MGA Dir. 2; AGCO 2.15) [05:S37][05:S32]; age-gating recommended |
| **UNKNOWN (shipped default)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **5000** (most restrictive known floor) | most-restrictive ladder (session override required before any real-money bet) | ❌ | ✅ both on | ✅ blocking fixed-60 | ✅ shown |

Cross-cutting rules that ride on the matrix (from 05:D2, 13:D1–D5):

- **LDW default**: `ldwCelebrationSuppressed: true` in EVERY policy — mandatory in
  GB/ON, harmless and research-aligned elsewhere (Dixon/Harrigan LDW studies, 13 §1.1).
- **Skip semantics**: one boolean is insufficient — `quickSpin`, `turboSpin`,
  `animationSkip` (base game) and `bonusPresentationSkip` (no-extra-stake bonus) are
  four independent flags; UK/ON carve-outs allow only the last where min-round floors
  apply [05:S1][05:S32].
- **Start-control debounce**: `requireStartRelease: true` wherever
  `minimumRoundDurationMs != null` (RTS 14D / AGCO 2.18 wording).
- **maxStake is session data**: GB age tiers and DE qualification tiers mean the bet
  ladder must be filtered at runtime by an RGS/operator-supplied `maxStakeMinor`; a
  static in-game ladder fails GB/DE [05 §1, §2].
- **Bonus-buy pricing gate**: in any policy with `maxStakeMinor != null`, validate
  `betMinor × priceX100 / 100 ≤ maxStakeMinor` — emit a validation ERROR, not a clamp
  (effectively disables buys in GB/DE even if a flag were flipped) [05:D2.6].
- **Multi-instance**: `multiInstanceBlocked: true` for GB (RTS 14C) and ON (2.17);
  default true everywhere (harm-reduction stance, 13 §10).
- **Forced session termination**: ES (RD 176/2023) and IT (20-min inactivity logout +
  state restore) require accepting an external `session_end` at any time — maps to
  `reconnecting`/`recovering` states (CONVENTIONS §4.4) [05:D2.9].

---

## 2. Recommended default `jurisdictionPolicy` blocks per market tier

Shape notes: money in integer minor units (CONVENTIONS §5); `null` = no regulatory
constraint (game/operator config governs); `"session-override"` = value MUST be
supplied per session by the RGS/operator and the in-game ladder filtered to it.
`realityCheck.mode` ∈ `player-set-blocking | fixed-interval-blocking | operator-side |
off`. These blocks seed `config/jurisdiction-policies.json` and must validate against
`schemas/jurisdiction-policy.schema.json`. Every `legalReviewFlags[]` entry must be
carried verbatim into the generated game's `compliance-review.md`.

### Tier: UK (`gb-ukgc`)

```json
{
  "policyId": "gb-ukgc",
  "marketTier": "uk",
  "autoplayEnabled": false,
  "quickSpinEnabled": false,
  "turboSpinEnabled": false,
  "slamStopEnabled": false,
  "animationSkipEnabled": false,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": false,
  "minimumRoundDurationMs": 2500,
  "requireStartRelease": true,
  "maxStake": {
    "mode": "session-override",
    "defaultMinor": 500,
    "currency": "GBP",
    "byAgeBand": [
      { "minAge": 18, "maxAge": 24, "stakeMinor": 200 },
      { "minAge": 25, "maxAge": null, "stakeMinor": 500 }
    ]
  },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": true },
  "realityCheck": { "mode": "player-set-blocking", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": ["elapsedTime"], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "showMaxWinOdds": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": false,
  "legalReviewFlags": [
    "enhanced-chance/ante-bet sits near RTS 14A — confirm before enabling",
    "post-commit win-count-up skip conservative reading of RTS 14E (13 §U2)",
    "re-fetch current RTS PDF at build time (12 Jan 2026 wording update)"
  ]
}
```

### Tier: Germany (`de-ggl`)

```json
{
  "policyId": "de-ggl",
  "marketTier": "de",
  "autoplayEnabled": false,
  "quickSpinEnabled": false,
  "turboSpinEnabled": false,
  "slamStopEnabled": false,
  "animationSkipEnabled": false,
  "bonusPresentationSkipEnabled": false,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": false,
  "minimumRoundDurationMs": 5000,
  "requireStartRelease": true,
  "maxStake": {
    "mode": "session-override",
    "defaultMinor": 100,
    "currency": "EUR",
    "byAgeBand": [
      { "minAge": 18, "maxAge": 20, "stakeMinor": 100 },
      { "minAge": 21, "maxAge": null, "stakeMinor": 300 }
    ],
    "qualifiedUpliftMinor": 500,
    "qualifiedUpliftNote": "€5 only for 90-day no-harm-qualified, operator-monitored players (GGL, since 2026-07-01); RGS supplies per session"
  },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": true },
  "realityCheck": { "mode": "fixed-interval-blocking", "fixedIntervalMin": 60, "postAckLockoutMin": 5, "contentFields": ["elapsedTime"], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "showMaxWinOdds": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": false,
  "jackpotsAllowed": false,
  "legalReviewFlags": [
    "no jackpots on virtual slots (§22a) — jackpot tiers must be excluded from DE builds",
    "5 s rule is statutory 'average' — fixed 5000 floor is the safe implementation",
    "confirm GGL qualification criteria from primary FAQ before DE release; monitor end-2026 GlüStV evaluation (reversal risk)",
    "RTP profile ~0.94 typical due to 5.3% stake tax — certify the DE profile separately"
  ]
}
```

### Tier: Nordic/Benelux strict (`se-nl-dk-strict`) — most-restrictive union of SE/NL/DK

```json
{
  "policyId": "se-nl-dk-strict",
  "marketTier": "nordic-benelux",
  "autoplayEnabled": false,
  "quickSpinEnabled": false,
  "turboSpinEnabled": false,
  "slamStopEnabled": false,
  "animationSkipEnabled": false,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": false,
  "minimumRoundDurationMs": 3000,
  "requireStartRelease": true,
  "maxStake": { "mode": "player-set-limits", "defaultMinor": null, "currency": "EUR" },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": true },
  "realityCheck": { "mode": "player-set-blocking", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": ["elapsedTime", "netPosition"], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "showMaxWinOdds": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": false,
  "legalReviewFlags": [
    "SE delta: autoplay IS allowed (each round >= 3000 ms; 2026 draft caps at 60 rounds) — a dedicated se-spel policy may enable autoplayEnabled with roundCap 60",
    "NL delta: no statutory round-duration floor found; 3000 ms here is the SE floor applied as union — an nl-ksa policy may set null after verifying turbo/quick with a Dutch lab (KSA 2025 expansive autoplay reading)",
    "DK delta: DK has no game-design micro-rules — a dk-spil policy may relax quick/turbo/bonusBuy after operator sign-off",
    "SE bonus buy: widely disabled, no written ban; NL bonus buy: banned (art. 3.8 Regeling KOA) — union keeps it off",
    "SE promo: single lifetime welcome bonus per licensee — promoHooks off"
  ]
}
```

### Tier: Malta / generic-.com (`mt-generic-com`)

```json
{
  "policyId": "mt-generic-com",
  "marketTier": "mt-com",
  "autoplayEnabled": true,
  "autoplay": { "maxRounds": 100, "requireLossLimit": true, "requireSingleWinLimit": false, "intervalAlertPopup": true, "visibleStop": true, "stopOnFeature": true },
  "quickSpinEnabled": true,
  "turboSpinEnabled": true,
  "slamStopEnabled": false,
  "animationSkipEnabled": true,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": true,
  "enhancedChanceEnabled": true,
  "minimumRoundDurationMs": null,
  "requireStartRelease": false,
  "maxStake": { "mode": "operator-config", "defaultMinor": null, "currency": "EUR" },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": false },
  "realityCheck": { "mode": "player-set-blocking", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": ["elapsedTime", "amountWagered", "winsLosses", "stayInControlReminder"], "offersExitAndHistory": true, "persistUntilAck": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": 0.85, "demoParityRequired": true, "showMaxWinOdds": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": true,
  "legalReviewFlags": [
    "MGA reality-check CONTENT is mandated (Directive 2 v3, deadline 2024-01-12) and under 2025-26 enforcement attention — do not trim contentFields",
    "slamStop kept off as design stance (illusion-of-control research, dossier 13) though MGA permits it",
    "6-month player history access is a platform duty the game must not obstruct"
  ]
}
```

### Tier: Ontario (`ca-on-agco`)

```json
{
  "policyId": "ca-on-agco",
  "marketTier": "ontario",
  "autoplayEnabled": false,
  "quickSpinEnabled": false,
  "turboSpinEnabled": false,
  "slamStopEnabled": false,
  "animationSkipEnabled": false,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": false,
  "minimumRoundDurationMs": 2500,
  "requireStartRelease": true,
  "maxStake": { "mode": "operator-config", "defaultMinor": null, "currency": "CAD" },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": true },
  "realityCheck": { "mode": "operator-side", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": ["elapsedTime"], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "showOddsPerPrize": true, "showMaxWinOdds": true, "demoParityRequired": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": false,
  "forbiddenCopyPatterns": ["due", "overdue", "ready to hit", "hot streak", "almost"],
  "legalReviewFlags": [
    "bonus-buy ban is industry-observed, not explicit in AGCO standards (05 §U8) — confirm with AGCO guidance/Ontario lab",
    "net position must render in CAD, never credits (Std 2.21)",
    "per-game specs must document odds per prize + operator advantage (4.05/4.06) — feed from par sheet"
  ]
}
```

### Tier: US regulated (`us-nj-mi-pa`)

```json
{
  "policyId": "us-nj-mi-pa",
  "marketTier": "us-regulated",
  "autoplayEnabled": true,
  "autoplay": { "maxRounds": 100, "requireLossLimit": true, "requireSingleWinLimit": false, "intervalAlertPopup": false, "visibleStop": true, "stopOnFeature": true },
  "quickSpinEnabled": true,
  "turboSpinEnabled": true,
  "slamStopEnabled": false,
  "animationSkipEnabled": true,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": true,
  "minimumRoundDurationMs": null,
  "requireStartRelease": false,
  "maxStake": { "mode": "operator-config", "defaultMinor": null, "currency": "USD" },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": false },
  "realityCheck": { "mode": "operator-side", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": [], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": 0.83, "showMaxWinOdds": true, "malfunctionVoidsAllPays": true, "freeGameCounterVisible": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": true,
  "legalReviewFlags": [
    "bonus buy generally not offered in US regulated markets — per-state review before enabling",
    "NJ: min RTP 0.83, advertised-win odds cap 100,000,000:1, auto-pick must be highest-RTP or unbiased (N.J.A.C. 13:69E-1.28A)",
    "MI: GLI-19 v3.0 binding via R 432.633 — lab evaluation + written board approval per game",
    "PA: 58 Pa. Code 810a lab testing; pull each state's current submission checklist fresh",
    "6-reel variable-symbols-per-reel games: BTG US patent flag (research/16 §3.2) applies to this tier"
  ]
}
```

### Tier: Social / demo (`social-demo`)

```json
{
  "policyId": "social-demo",
  "marketTier": "social-demo",
  "realMoney": false,
  "autoplayEnabled": true,
  "autoplay": { "maxRounds": 100, "requireLossLimit": false, "requireSingleWinLimit": false, "intervalAlertPopup": false, "visibleStop": true, "stopOnFeature": true },
  "quickSpinEnabled": true,
  "turboSpinEnabled": true,
  "slamStopEnabled": true,
  "animationSkipEnabled": true,
  "bonusPresentationSkipEnabled": true,
  "bonusBuyEnabled": true,
  "enhancedChanceEnabled": true,
  "minimumRoundDurationMs": null,
  "requireStartRelease": false,
  "maxStake": { "mode": "operator-config", "defaultMinor": null, "currency": "FUN" },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": false },
  "realityCheck": { "mode": "off", "fixedIntervalMin": null, "postAckLockoutMin": 0, "contentFields": [], "offersExitAndHistory": false },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "demoParityRequired": true, "showMaxWinOdds": true },
  "multiInstanceBlocked": false,
  "promoHooksEnabled": true,
  "legalReviewFlags": [
    "demo parity is MANDATORY where the demo is reachable from MGA/Ontario contexts (MGA Dir. 2; AGCO 2.15): identical math build, identical odds — never a 'lucky' demo",
    "ldwCelebrationSuppressed stays true as a design stance (CONVENTIONS §9.5, dossier 13 D1) even though no regulator binds the demo",
    "age-gating and 'no real-money winnings' disclosure recommended; social-casino consumer-law exposure (loot-box adjacent) is an operator counsel item"
  ]
}
```

### Fallback: `unknown-most-restrictive` (the SHIPPED default — CONVENTIONS §9.6)

```json
{
  "policyId": "unknown-most-restrictive",
  "marketTier": "unknown",
  "autoplayEnabled": false,
  "quickSpinEnabled": false,
  "turboSpinEnabled": false,
  "slamStopEnabled": false,
  "animationSkipEnabled": false,
  "bonusPresentationSkipEnabled": false,
  "bonusBuyEnabled": false,
  "enhancedChanceEnabled": false,
  "minimumRoundDurationMs": 5000,
  "requireStartRelease": true,
  "maxStake": { "mode": "session-override", "defaultMinor": 100, "currency": null },
  "ldwCelebrationSuppressed": true,
  "hud": { "netPositionVisible": true, "sessionClockVisible": true, "displayCurrencyNotCredits": true },
  "realityCheck": { "mode": "fixed-interval-blocking", "fixedIntervalMin": 60, "postAckLockoutMin": 0, "contentFields": ["elapsedTime", "netPosition"], "offersExitAndHistory": true },
  "rtpDisplay": { "showRtp": true, "minimumRtp": null, "showMaxWinOdds": true },
  "multiInstanceBlocked": true,
  "promoHooksEnabled": false,
  "jackpotsAllowed": false,
  "legalReviewFlags": [
    "UNKNOWN jurisdiction — every feature at most-restrictive union; do not relax any flag without naming a policyId and completing legal review"
  ]
}
```

---

## 3. Engineering notes for schema & client (bind these when generating configs)

1. `schemas/jurisdiction-policy.schema.json` must model: the four independent skip
   flags, `maxStake.mode` enum (`session-override | player-set-limits |
   operator-config`), `byAgeBand[]`, `realityCheck.mode` enum, `postAckLockoutMin`
   (DE 5-min break), `legalReviewFlags[]` (non-empty required when any ⚠️ value used),
   `jackpotsAllowed` (DE false), `forbiddenCopyPatterns[]`, `realMoney` (social tier).
2. Autoplay, where a policy disables it, is **excluded from the build**, not hidden —
   KSA has enforced against discoverable autoplay-like behaviour (05:D2.5).
3. Win-tier gate: `ldwCelebrationSuppressed` routes any step with
   `totalWinMinor <= wagerMinor` to the neutral result preset — no `anim.win.*`,
   no `sfx.win.*` (13:D1; validator asserts).
4. The spin gate is `max(presentationTime, minimumRoundDurationMs)` from
   `round_requested`; queued input during the window is discarded, not buffered
   (05:D2.1–2, 13:D7).
5. Presentation-mode equivalence test (same manifest ⇒ same final balance in every
   mode) is both the CONVENTIONS §9.2 invariant and the RTS 14E / GLI-19 §4.6
   compliance evidence — ship it as an automated test (04 §20).
6. `compliance-review.md` for each generated game prints this matrix filtered to the
   target policyIds and carries every `legalReviewFlags[]` entry plus the 15
   uncertainty items from research/05 verbatim where relevant (05:D2.15).

## 4. Uncertainties inherited (do not silently resolve)

- SE 2026 draft (60-round autoplay cap, idle logout) pending — re-check before SE
  release [05:S49; 13:U3].
- NL turbo/quick tolerance unverified against KSA's expansive reading [05 §U3];
  NL per-game HUD duties unverified [05 §U4].
- ES 3 s clause and autoplay status need the primary DGOJ resolution [05 §U5–U6].
- ON bonus-buy prohibition is observed-only [05 §U8].
- GB enhanced-chance and post-commit-skip conservative readings [05 §U10; 13:U2].
- DE tier reversal risk (NRW opposition; end-2026 GlüStV evaluation) [05 §U12].
- BE constitutional challenge outcome; CW regime currency [05 §U13–U14].
- US state checklists change quietly — pull fresh at submission [05 §U15].

— end of dossier —
