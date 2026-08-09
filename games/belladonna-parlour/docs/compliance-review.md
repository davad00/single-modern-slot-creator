# Compliance Review — Belladonna's Parlour (game-specific)

Game: Belladonna's Parlour · slug belladonna-parlour · game 0.1.0 · math 0.1.0 · 2026-08-08
Generator: single-modern-slot-creator v1.0.0. Template: templates/compliance-review.md.
**This is an internal engineering review, not legal advice and not a certification.**

## 1. Integrity architecture

| Area | Status |
|---|---|
| RNG boundary | Production outcomes exclusively from RGS (adapter interface only in this package). Dev sources (PCG64 sims; scenario bank) are DEV-flagged, refuse production, and are excluded from any real-money path. |
| Server authority | Client is a pure renderer of committed manifests; validation refuses malformed rounds; equivalence suite proves presentation cannot alter results (G12). |
| Recovery | Committed-manifest + resumePointer replay; never re-randomizes or re-settles (tested). Mid-cascade/mid-feature/mid-prisming state serialized in steps (ext.multiplierBank). |
| History/replay | Manifest architecture supports committed-round replay; operator-side history UI is an integration item. |
| Config versioning | gameVersion/mathVersion semver + sha256 bundle hashes embedded in every report and manifest; hash provenance chain documented in PAR sheet. |
| Fixed math | No adaptive RTP, no compensation, no player-behaviour inputs anywhere in the outcome path. Single RTP profile (rtp-96) built; profiles are static bundles. |
| Win presentation | LDW rule unconditional: return ≤ stake ⇒ small-tier neutral presentation only (encoded in animation/audio configs + client winPresentation tests). No fake wins, no engineered near-misses (anticipation is committed-outcome-gated only). |

## 2. Jurisdiction gating (config/jurisdiction-policies.json — schema-valid)

| Policy | Key values |
|---|---|
| restricted-default (UNKNOWN ⇒ applied) | autoplay/quick/turbo/skip/buy/ante ALL off · minRoundDuration 5000ms · RTP + max-win + history display on · net-position + session clock on |
| mt-generic | permissive baseline; buys+ante on with disclosures; no min duration |
| gb | 2500ms floor · autoplay/turbo/quick/slam OFF · buys OFF · LDW suppression (unconditional anyway) · net position + clock on |
| de | 5000ms · autoplay/turbo OFF · buys OFF (review) · stake caps operator-side |
| se | 3000ms · autoplay allowed with limits · buys per operator review |

Spin timing is a policy-driven clamp in spin-presentation handling, not a constant.
Ante (×1.20) and buys are mutually exclusive in UI and individually gateable.

## 3. Game-specific compliance items

| Item | Disposition |
|---|---|
| **Advertised max win vs GLI-11 1-in-50M hittability (K7)** | **OPEN — release blocker if 10,000× is advertised.** Options documented (PAR §8): tail redesign / lower advertised figure with published odds / lab guidance on liability-cap language. |
| Tier disclosure | Per-tier frequencies, EVs and buy RTPs measured and disclosed (PAR §5–§7); rules text must carry retrigger caps (3/4/5) and counting rule. |
| Bonus-buy pricing | Decimal EV-derived prices with per-mode RTP disclosure (0.9598–0.9601); confirmationRequired in UI config. |
| Ante disclosure | ×1.20 stake, effective RTP 0.9698 (dev-size CI ±1.9pp) disclosed in rules; +0.47pp vs base within enhanced-mode norm. |
| Theme / minor appeal | Adult poison-noir framing; style bible bans mascots/juvenile styling (negative anchors); K4 mitigation applied at art-prompt level. |
| Trademark/trade-dress | Blocklist lint clean (game-facing); generic internal mechanic ids; trade-dress distance requirements enforced in style bible; "Belladonna's Parlour" trademark search = pre-release legal item (K1). |
| Clean-room math | No competitor strips/weights/paytables consulted or recorded anywhere (register + logs affirm). |
| Accessibility | WCAG 2.2 AA targets in ui-specification (44px, 4.5:1, colour-independence, reduced-motion for every event, ≤3 flashes/s, screen-reader sub-DOM spec). Real-AT verification = MANUAL-REQUIRED. |
| Volatility labelling | Measured σ 6.81 (medium-high band); marketing label must follow measured index (PAR §1). |

## 4. Required external steps before ANY real-money release (none performed)

1. Jurisdiction-specific legal review (incl. K1 trademark search, K7 advertised-award language).
2. Independent mathematical verification (release-grade sim sizing + rare-event max-win odds).
3. External security review (RGS integration, signature scheme, transport).
4. Laboratory certification per target market (GLI-19-class) — expect math re-derivation;
   submission package = PAR sheet + reports + termination proofs + recovery matrix +
   equivalence evidence (all in this repo).
5. Operator/aggregator acceptance testing incl. real-device matrix.

**Certification status: NOT CERTIFIED. Certification-ready candidate only.**
