# Known Limitations — Belladonna's Parlour

Game: Belladonna's Parlour · slug belladonna-parlour · game 0.1.0 · math 0.1.0 · 2026-08-08
Generator: single-modern-slot-creator v1.0.0. Honest record; every item is deliberate and
disclosed, none is silent.

## Math & simulation

1. **Dev-grade simulation sizing (A10, risk K3).** Evidence base: 3M-round natural dev run
   (95% CI ≈ ±0.008 at σ≈6.8) + 30k forced entries per tier + 400k ante rounds. The
   release-grade rule for this volatility (CONVENTIONS §5 / prompts/math.md §8:
   n ≥ (z·σ/ε)², ±0.1% at 99% ⇒ ~2×10⁹-round class) was NOT executed on this 4-core dev
   machine. REQUIRED-BEFORE-CERT; exact commands documented in the PAR sheet.
2. **Dev RTP gate is ±0.01, not the release ±0.003.** Point estimates at dev size carry
   ±0.8pp CIs; the PAR sheet reports measured values with their intervals, nothing tighter.
3. **Natural tier rarity is steep** (≈1/133, ≈1/2100, ≈1/70k measured): a mathematically
   honest property of independent per-reel scatter draws (tuning-log note 1). The
   ultimate tier is marquee-rare; access is primarily via bonus buy where permitted.
4. **Max-win cap odds vs GLI-11 advertised-award rule (risk K7 — OPEN COMPLIANCE ITEM).**
   No 10,000x cap hits were observed in any run (including 30k forced ultimate entries;
   ultimate p99.9 ≈ 2,150x). The cap is mechanically enforced and proven by unit tests,
   but the measured tail implies cap odds far rarer than 1-in-50,000,000 — an ADVERTISED
   "max win 10,000x" claim would fail GLI-11's hittability rule as-is. Before release:
   either (a) redesign the tail (hotter ultimate distribution), (b) advertise a lower,
   demonstrably hittable figure with published odds, or (c) obtain lab/regulator guidance
   on cap-as-liability-bound vs advertised-award language. Rare-event estimation of the
   true cap odds requires release-grade tooling (importance sampling per research/03).
5. **Bonus-buy prices are decimal x-bet values** derived from measured forced-entry EVs at
   ~96% buy RTP (not the 100x industry anchor — our feature is frequent-and-moderate).
   Prices/RTPs are finalized from the frozen battery in the PAR sheet; ±1 integer price
   steps move buy RTP by ~1-2pp, hence the decimals.
6. **Ante mode RTP** is tuned to ≈ base ±0.5pp at dev size; the residual gap carries the
   same dev-size uncertainty as (2) and is disclosed in the rules text.

## Client & presentation

7. **Dev outcome source is a scenario bank** (260 pre-generated manifests at betMinor=100,
   embedded configHash). It is deterministic, validated, and DEV-ONLY: real-stake variation
   and live outcome generation require the production RGS integration (adapter interface
   ships; no server is included by design — CONVENTIONS §1 scope).
8. **Presentation is placeholder-rendered.** The client runs (195 tests green) with
   rectangle/text placeholder sprites; themed rendering awaits generated assets. The
   master-vial HUD, orb value plates and tier environments are specified
   (ui-specification.md, animation-events.json) but not yet art-dressed.
9. **Art is prompt-only at packaging time** (risk K6): the imagegen MCP backend was down
   throughout this run (probed repeatedly; last probe at packaging). The full prompt
   register (prompts/art-prompts.json) and two Blender scripts are ready; generation is a
   re-run of documented commands. Audio likewise ships as specification + generation
   prompts; the client is silent-safe.
10. **Scenario-bank stake limitation:** the bank serves betMinor=100 only (the multiplier
    delta-entry adaptation is exact only at that stake). Other stakes are exercised via
    unit tests of the money rule, not via bank manifests.

## Compliance

11. Outputs are a certification-ready **candidate**: no legal review, no independent math
    verification, no lab certification, no operator UAT has occurred. The compliance
    review lists every REQUIRED external step. Jurisdiction policies ship with a
    most-restrictive UNKNOWN default (CONVENTIONS §9.6).
12. RTP profiles: only rtp-96 is built and simulated. 0.94/0.92 profiles are declared but
    NOT built (A4) — each requires its own tuning + battery + certification evidence.
