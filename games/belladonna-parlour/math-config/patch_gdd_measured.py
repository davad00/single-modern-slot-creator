"""Overwrite the GDD's `⌀ sim` / target cells with FROZEN measured values (step 5-6 close).
Exact-string replacements only; any miss is reported and fails the run (no silent drift)."""

from pathlib import Path

GDD = Path(__file__).parents[1] / "docs" / "game-design-document.md"
text = GDD.read_text(encoding="utf-8")

REPL = [
    # header
    ("| Config hash | (pending — set after config/ freeze, step 5) |",
     "| Config hash | math `sha256:c3a6de0fadd9f56e9773c190aa69b55834dba77117881750aaa01a2fbb731441` · display `sha256:8f38ce34a29052bf03359e0283accbd892b91c157b2affcf95dd185dab0c4956` |"),
    # §8 feature
    ("| Free spins / feature rounds | 8 |", "| Free spins / feature rounds | 10 |"),
    ("| Trigger frequency (natural) | target ≈ 1 in 180–220 · measured ⌀ sim |",
     "| Trigger frequency (natural) | measured 1 in 132 (n=22,727 @3M; analytic 1 in 132) |"),
    ("| RTP contribution | target ≈ 0.20 · measured ⌀ sim |",
     "| RTP contribution | measured 0.2887 |"),
    # §9 super
    ("| Free spins / feature rounds | 10 |\n| Starting multiplier | P0 = ×2 (vial arrives half-charged) |",
     "| Free spins / feature rounds | 12 |\n| Starting multiplier | P0 = ×3 (vial arrives charged) |"),
    ("| Trigger frequency (natural) | target ≈ 1 in 1,200–1,800 · measured ⌀ sim |",
     "| Trigger frequency (natural) | measured 1 in 2,111 (n=1,421 @3M; analytic 1 in 2,403) |"),
    ("| RTP contribution | target ≈ 0.10 · measured ⌀ sim |",
     "| RTP contribution | measured 0.0391 |"),
    # §10 ultimate
    ("| Free spins / feature rounds | 12 |\n| Starting multiplier | P0 = ×3 |",
     "| Free spins / feature rounds | 12 |\n| Starting multiplier | P0 = ×5 |"),
    ("| Natural trigger probability | ⌀ sim (target band 1e-4 – 1.6e-4 per round) |",
     "| Natural trigger probability | 1.573e-5 analytic (measured 1 in 60,000 at n=50 — steep natural ladder accepted, tuning-log note 1) |"),
    ("| Trigger frequency (natural) | target ≈ 1 in 6,000–10,000 · measured ⌀ sim |",
     "| Trigger frequency (natural) | measured 1 in 60,000 (superseded early target; decision-log step 5-6) |"),
    ("| RTP contribution | target ≈ 0.06 · measured ⌀ sim |",
     "| RTP contribution | measured 0.0024 |"),
    # §13 buys + ante
    ("| buy_feature | feature | target 100 (validate ±0.2pp) | ⌀ sim | math/reports/buy-feature.json | bonusBuyEnabled |",
     "| buy_feature | feature | **42.10** (frozen from EV 40.42×) | 0.9601 | math/reports/tier-feature.json | bonusBuyEnabled |"),
    ("| buy_super | super_feature | target 350 (validate) | ⌀ sim | math/reports/buy-super.json | bonusBuyEnabled |",
     "| buy_super | super_feature | **91.70** (EV 88.01×) | 0.9598 | math/reports/tier-super.json | bonusBuyEnabled |"),
    ("| buy_ultimate | ultimate_feature | target 900 (validate) | ⌀ sim | math/reports/buy-ultimate.json | bonusBuyEnabled |",
     "| buy_ultimate | ultimate_feature | **167.70** (EV 161.01×) | 0.9601 | math/reports/tier-ultimate.json | bonusBuyEnabled |"),
    ("Cost multiplier 1.25x, modified trigger odds ⌀ sim (target ≈ ×1.6 feature\nfrequency), RTP ⌀ sim (target within ±0.3pp of base), gated by `enhancedChanceEnabled`.",
     "Cost multiplier **×1.20** (final; 1.25 superseded during calibration), measured trigger ×1.55 (1 in 85), measured effective RTP **0.9698 ± 0.019** (+0.47pp vs base, within the ≤ +0.5pp norm), gated by `enhancedChanceEnabled`."),
    # §15 math summary
    ("| Base game | target 0.560 | incl. cascade wins and base orb multipliers |",
     "| Base game | **0.6166 measured** | incl. cascade wins and base orb multipliers |"),
    ("| `feature` | target 0.200 | ⌀ sim |", "| `feature` | **0.2887 measured** | 1 in 132, avg 38.1× |"),
    ("| `super_feature` | target 0.100 | ⌀ sim |", "| `super_feature` | **0.0391 measured** | 1 in 2,111, avg 82.5× |"),
    ("| `ultimate_feature` | target 0.060 | ⌀ sim |", "| `ultimate_feature` | **0.0024 measured** | 1 in 60,000, avg 143.9× |"),
    ("| Scatter pay | target 0.040 | independent seal pays |",
     "| Scatter pay | **0.0184 measured** | independent seal pays |"),
    ("| **Total** | **target 0.9600** | tolerance per A10 dev gate |",
     "| **Total** | **0.9651 measured** (95% CI ±0.0077, 3M rounds) | dev gate PASS: Δ 0.0051 ≤ 0.01 |"),
    ("| Volatility class / index | target high→very-high / σ ⌀ sim (expect 9–14) |",
     "| Volatility class / index | measured σ 6.81 (medium-high per skill bands; design label very-high superseded) |"),
    ("| Hit frequency | target 0.25–0.30 · measured ⌀ sim |",
     "| Hit frequency | measured 0.2849 |"),
]

applied = already = 0
missed = []
for old, new in REPL:
    if old in text:
        text = text.replace(old, new, 1)
        applied += 1
    elif new in text:
        already += 1  # an earlier sync already applied this value
    else:
        missed.append(old[:70])
GDD.write_text(text, encoding="utf-8")
print(f"GDD patch: {applied} applied, {already} already in place, {len(missed)} missed")
if missed:
    print("MISSED ANCHORS (fix manually):")
    for m in missed:
        print(" -", ascii(m))
    raise SystemExit(1)
