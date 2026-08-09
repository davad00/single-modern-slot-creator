<!-- Condensed from templates/game-design-document.md for the worked example.
A real skill run fills every template section in full; this version keeps the
template's section numbering and carries only the content needed to read the
example's config/math artifacts in context. -->

# Game Design Document — Kilnspire (condensed example edition)

| Field | Value |
|---|---|
| Game name / slug | Kilnspire / `kilnspire` |
| gameVersion / mathVersion | 1.0.0 / 1.0.0 |
| configHash (display bundle) | see `config/game-config.json` (`sha256:07dd4c06…`) |
| Date / Generator | 2026-08-08 / single-modern-slot-creator v1.0.0 |

## 1. Overview & player fantasy

Kilnspire is a 5×4, 1,024-ways cascade slot set inside a colossal volcanic
glassworks. The player stokes the great kiln: every spin blows molten glass
into symbols, wins shatter into cascades, and Kiln Sigil scatters kindle a
three-tier bonus ladder — **Kindled Spins → Roaring Kiln → Starfire Crown** —
in which the forge itself burns hotter (more premiums, more wilds, bigger
fixed multipliers). Target market: mobile-portrait-first, high-volatility
audience; original theme, no licensed IP, adult-neutral craft fantasy.

## 2. Theme & narrative

Deep in a volcanic rift, the last great glassworks turns raw fire into
star-glass. No characters (brief: charactersAllowed false); the forge is the
protagonist. Restrictions honored: no gore, no religious iconography, nothing
aimed at minors, no readable text in art.

## 3. Archetype & grid

5 reels × 4 rows, left-to-right **ways** evaluation (1,024 ways), pays per way,
plus **base-game cascades**. Cascades and ways were chosen together
deliberately: after a cascade refill, adjacency re-evaluation is natural for
ways (no payline positions to re-map), every refill can form fresh runs, and
the pairing is a proven top-performer bundle (research/00 §1,
research/14 archetype×mechanic matrix). Stops are uniform on physical strips
(reel-sets.json); no near-miss adjacency weighting (CONVENTIONS §9.5).

## 4. Symbol set

| Id | Themed name | Notes |
|---|---|---|
| WILD | Molten Core | substitutes for all paying symbols, never SCATTER; reels 2–4 in base, all reels in tiers |
| SCATTER | Kiln Sigil | pays on total bet + triggers tiers; exactly 1 per base strip per reel |
| H1–H4 | Star-Glass Orb, Glasswright's Gauntlet, Crucible of Embers, Blowpipe & Shears | premiums |
| L1–L5 | Cobalt/Amber/Viridian/Rose/Smoke Beads | lows; L4/L5 pay from 4-of-a-kind only |

## 5. Paytable

Authoritative: `config/paytable.json` (payX100 per way; floor rule
`winMinor = betMinor·payX100 // 100`). Monotone in length and tier rank
(H1 ≥ H2 ≥ … ≥ L5 at equal length; L4/L5 have no 3-oak by design — documented
exception that keeps the hit rate honest instead of LDW-flooded). Full table
with x-bet values: docs/par-sheet.md §4.

## 6. Mechanics

### 6.1 Cascading wins (primary)
Winning positions shatter; survivors fall; refills come from the strip above
the stop (deterministic, seed-driven). Cascade win multiplier progression
**1x → 2x → 3x → 5x** (mult100 100/200/300/500), the 5x repeating for deeper
cascades; hard cap 8 cascades per spin (proven termination). Cascaded scatters
never count toward triggers (initial-grid rule).

### 6.2 Ways-to-win (supporting)
1,024 ways, left-to-right, pays per way; wilds multiply ways counts.

### 6.3 Tiered free spins (supporting)
Three materially distinct tiers (§8–§10). Feature rounds are straight spins on
tier-specific strips under a fixed tier multiplier — **no cascades inside
features** (deliberate: the tier multiplier replaces the cascade ladder as the
escalation device, and it keeps the engine's per-tier isolation measurable).

## 7. Scatter counting rules

`initial-grid` counting; cascaded and copied scatters do NOT count; 3 → feature,
4 → super_feature, 5+ → ultimate_feature (`fiveOrMoreUsesUltimateTier` true —
with one Sigil per base strip per reel, exactly 5 is the only 5+ count).
Anticipation arms at 2 visible Sigils (presentation only).

## 8. Feature Bonus — 3 scatters (`feature`, "Kindled Spins")

8 rounds at fixed **2x**, on `feature-strips` (premiums ~36% of positions vs
~27% base; wilds 1–2 per strip vs 0–1). Measured (30k isolated entries, seed
4303): tier pay mean **13.74x**, median 10.96x, p99 53.5x; gross entry value
17.02x ± 0.12.

## 9. Super Feature Bonus — 4 scatters (`super_feature`, "Roaring Kiln")

10 rounds at fixed **4x**, on `super-feature-strips` (premiums ~43%; wilds 2–3
per strip — the "bellows wild lift" absent in Kindled Spins). Measured (seed
4304): tier pay mean **101.04x**, median 84.6x, p99 340.3x; gross 116.26x ± 0.77.

## 10. Ultimate Feature Bonus — 5+ scatters (`ultimate_feature`, "Starfire Crown")

12 rounds at fixed **8x**, on `ultimate-feature-strips` (premiums ~50%; wilds
4–5 per strip — the "molten wild surge" unique to this tier). Measured (seed
4305): tier pay mean **980.20x**, median 886.1x, p99 2,623.5x, max observed
6,983.9x; gross 1,080.39x ± 5.61.

**G6 materiality:** rounds 8<10<12, multipliers 2x<4x<8x, wild density
~1.5x<~3x<~5x base, premium share strictly increasing, and measured means
separated by non-overlapping 95% CIs spanning two orders of magnitude.

## 11. Retriggers

3+ Sigils landing in one feature round award +4 rounds; hard cap 3 retriggers
per feature instance (liability bound). Measured retrigger rates: 5.7% / 7.4% /
8.8% of instances (feature/super/ultimate isolated sims).

## 12. Maximum win

10,000x total bet, enforced in engine and math by the `max_win_termination`
step (win clamped exactly to cap, remaining rounds forfeited). Not observed at
dev sim sizes (largest round 6,983.9x); release-scale rare-event analysis is an
open item (docs/known-limitations.md).

## 13. Bonus buy & enhanced chance

Three buy modes (config/bonus-buys.json), priced so measured mode RTP ≈ 0.96:
17.75x → Kindled (RTP 0.9589), 121x → Roaring (0.9608), 1125x → Starfire
(0.9603). Entry distributions are the exact natural conditionals (degenerate:
{3}, {4}, {5}). Jurisdiction-gated; disabled under gb-ukgc, de-ggl and the
UNKNOWN default. Enhanced chance: not built (brief: false).

## 14. Spin modes & autoplay

Normal/quick/turbo presentation modes + tap-skip, all policy-gated
(config/spin-presentation.json, config/jurisdiction-policies.json), all
provably outcome-neutral (same manifest ⇒ same balance). Autoplay
(config/autoplay.json): 10–100 rounds, mandatory loss limit, stops on feature
trigger/max win/reality check, excluded from builds where banned.

## 15. Math summary (measured, dev size — full detail in docs/par-sheet.md)

| Stat | Value |
|---|---|
| Measured RTP (300k, seed 4242) | **0.9631** (±0.0166 @95%) vs target 0.9600 |
| Contribution split | base 0.8016 + scatter pay 0.0256 + feature 0.0934 + super 0.0358 + ultimate 0.0067 |
| Hit frequency | 0.600 (ways+cascade shape; decision logged — §11-default 25–33% traded for per-way pay realism) |
| Feature frequencies | 1/150 natural (exact P(3+)=1/151); 1/2,944 exact for 4; 1/150,800 exact for 5 |
| Volatility | σ 4.65 x-bet/round at dev size; tail carried by 8x ultimate tier |
| Max win | 10,000x cap, termination step enforced |

## 16–18. UI / Motion / Audio summaries

Portrait-first HUD (balance/bet/win always visible), 10-state spin button,
≥44px touch targets, 4.5:1 HUD contrast. 27 animation events
(config/animation-events.json) each with duration/easing/skip/blocksInput/
reducedMotion/lowPerformance/recovery; 28 audio events
(config/audio-events.json) with loop points, priority, ducking, polyphony;
adaptive music base→feature→super→ultimate; LDW results get the neutral
preset only. Art direction: prompts/art-prompts.json (style anchor + palette
lock + 12 fully-fielded prompts).

## 19. State machine

23 canonical states (CONVENTIONS §4.4) in config/state-machine.json: 55
transitions, 20 guards (all evaluated against the committed manifest), 10
entry/exit actions, per-state recovery rules (recovery = re-fetch committed
manifest + seek to resumePointer; never re-randomize), invalid transitions →
`recover`.

## 20. Round sequence (client ↔ RGS)

ready → round_requested (debit) → outcome_received → outcome_committed
(persist resumePointer) → presenting_* / feature_* (pure rendering of steps[])
→ round_complete (credit). Dev round provider (seeded, DEV-ONLY) produces the
same manifest shape — see sample-outcome-manifest.json.

## 21. Jurisdiction gating

config/jurisdiction-policies.json ships mt-generic-com, gb-ukgc, de-ggl plus
the mandatory most-restrictive UNKNOWN default (everything off, 5000 ms floor,
EUR 1.00 stake cap). Values seeded from research/17-jurisdiction-policy-matrix.md;
engineering flags only, never legal conclusions.

## 22. Accessibility

Reduced-motion timeline variant for every animation event; no information by
colour alone (WILD/SCATTER carry unique silhouettes); flash rate ≤ 3/s;
reduced-sensory audio behavior per event; ≥44px touch targets; 4.5:1 HUD text
contrast.

## 23. Assumptions (would live in docs/assumption-log.md in a real run)

- Hit frequency ~0.60 accepted for the ways+cascade shape (brief said AUTO).
- Feature rounds intentionally do not cascade (engine + design choice).
- Buy prices set to measured-value/0.96 rather than the 100x anchor, because
  tier values (17x/116x/1080x gross) are what the math produced; logged as the
  §11-default deviation.
- EUR minor units everywhere; demo currency mapping is an operator concern.

## 24. Open risks

See docs/known-limitations.md — dev-size sims, unproven max-win reachability
at scale, no client build in this example, volatility class pending
release-size tail measurement.
