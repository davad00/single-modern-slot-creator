# Known Limitations — Kilnspire worked example

| Field | Value |
|---|---|
| Game / slug | Kilnspire / `kilnspire` |
| Versions | gameVersion 1.0.0 · mathVersion 1.0.0 |
| Date / Generator | 2026-08-08 / single-modern-slot-creator v1.0.0 (worked example) |

**This folder is an ILLUSTRATIVE example of one skill run's artifact shapes.**
All numbers in it are real (schema-valid configs, genuinely simulated
statistics), but the run is deliberately smaller than a production skill
execution. Specific, honest gaps:

1. **Dev-size simulations only.** 300,000 natural rounds + 3 × 30,000 forced
   tier entries. Release sizing per prompts/math.md §8 requires
   n ≥ (z·σ/ε)² ≈ 83M rounds at the measured σ = 4.65 (RTP ±0.1% @95%), larger
   at the 99% gate, plus fresh verification seeds not used during tuning.
   The measured RTP 0.9631 carries a ±0.0166 95% CI at this size.
2. **Max-win reachability not proven.** 0 cap hits in 390k simulated rounds
   (largest observed round: 6,983.9x of the 10,000x cap). The G5 requirement
   "P(max win) > 0 computed" needs the rare-event decomposition (exact entry
   probability × stratified conditional payout) that a real run performs.
3. **Volatility class unconfirmed.** Design target "high"; measured dev-size
   per-round σ 4.65 x-bet sits at the medium-high/high boundary. The class
   claim rests on the tier tail and needs a release-size tail measurement.
4. **No client build.** `client/` (bun + TypeScript + PixiJS, dev round
   provider, RGS adapter, equivalence tests) is not part of this example. The
   engine-shape sample round is provided instead (sample-outcome-manifest.json).
5. **No generated images or audio in this folder.** Art/audio exist as fully
   fielded prompts (prompts/) and prompt-only asset-manifest entries; the
   Blender turntable script is provided but was not executed here (no MCP or
   Blender guarantees in the build environment).
6. **Schema gaps (by design of the skill package).** spin-presentation.json,
   autoplay.json and device-profiles.json have no dedicated schemas; they are
   CONVENTIONS-conformant JSON, checked for well-formedness only. No new
   schemas were invented.
7. **Runtime vs display config split.** The template math engine reads the
   flattened bundle in `math-config/` (documented mapping in ../README.md).
   A real run specializes `games/<slug>/math/` to read the display configs
   directly, and emits the outcome-manifest schema shape without the
   post-processing documented in make_sample_manifest.py (feature steps nested,
   no stepWinMinor). The two bundles have different configHashes — both are
   recorded in the PAR sheet.
8. **Forced-tier reports are DEV diagnostics.** Their gross values (up to
   1080x) legitimately exceed the simulation-report schema's fraction bound of
   10, per the simulator's documented design; only dev-sim.json is claimed
   schema-valid. A specialized simulator with a real --buy-mode flag would emit
   schema-valid bonus_buy reports (RTP ≈ 0.96, inside bounds).
9. **Feature rounds do not cascade** (design + template-engine behavior).
   Documented in the GDD; not a bug, but a difference from Gates-class
   cascade-in-bonus games.
10. **No bonus-buy simulator flag.** Buy-mode RTPs were derived from the
    forced-tier sims, valid here only because every forcedEntryDistribution is
    degenerate ({3}, {4}, {5}). Mixed distributions require the --buy-mode
    implementation described in prompts/math.md §8.
11. **Skipped run artifacts.** A full run also produces: assumption/decision
    logs, risk register, source register, art style bible, motion/audio specs,
    compliance review, validation report, artifact-manifest.json with per-file
    sha256, alternative RTP profiles, and the release-size simulation suite.
    Their shapes are defined by templates/ and are out of scope for this
    example.
12. **Certification honesty.** Nothing here is certified or certifiable as-is:
    real-money release requires legal review per jurisdiction, independent
    math verification, laboratory certification, and operator UAT
    (CONVENTIONS §9.9).
