"""Belladonna's Parlour — math-config generator.

Builds the runtime config bundle(s) the slot_math engine loads:
  math-config/       (activeReelSet=base)
  math-config-ante/  (activeReelSet=ante; stake x1.25 handled at analysis time)

Strips: length 120 per reel, 6 reels, window 5. SCATTER max 1 visible per reel
(spacing >= 5). All layout randomness uses a FIXED seed so the bundle is fully
reproducible; composition (counts) is what matters for math.

Run:  uv run python generate_math_config.py     (from this directory)
It prints the exact Poisson-binomial scatter-tier probabilities per reel set.

Tuning knobs live in PARAMS below; docs/tuning-log.md records every iteration.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
L = 120  # strip length
REELS = 6
ROWS = 5

PARAMS = {
    # per-reel pay-symbol counts; strip length per reel = SUM of all counts
    # (composition IS the density — no padding, tune counts directly)
    "pay_counts": {
        "base":     {"H1": 5, "H2": 6, "H3": 7, "H4": 8, "L1": 17, "L2": 17, "L3": 17, "L4": 17, "L5": 18},
        "feature":  {"H1": 5, "H2": 6, "H3": 7, "H4": 8, "L1": 17, "L2": 17, "L3": 17, "L4": 17, "L5": 18},
        "super_feature": {"H1": 7, "H2": 8, "H3": 9, "H4": 10, "L1": 16, "L2": 16, "L3": 16, "L4": 16, "L5": 0},
        "ultimate_feature": {"H1": 7, "H2": 8, "H3": 9, "H4": 10, "L1": 16, "L2": 16, "L3": 16, "L4": 16, "L5": 0},
        "ante":     {"H1": 5, "H2": 6, "H3": 7, "H4": 8, "L1": 17, "L2": 17, "L3": 17, "L4": 17, "L5": 18},
    },
    # per-reel SCATTER counts (vector over 6 reels)
    "scatter_counts": {
        "base":     [2, 2, 2, 2, 2, 1],
        "feature":  [2, 2, 2, 2, 2, 1],   # retrigger source
        "super_feature": [2, 2, 2, 2, 2, 1],
        "ultimate_feature": [2, 2, 2, 2, 2, 1],
        "ante":     [3, 2, 2, 2, 2, 2],
    },
    # per-reel MULT (essence orb) counts
    "orb_counts": {
        "base":     [2, 2, 2, 2, 2, 2],
        "feature":  [5, 4, 5, 4, 5, 4],
        "super_feature": [3, 3, 3, 3, 3, 3],
        "ultimate_feature": [3, 3, 3, 3, 3, 3],
        "ante":     [3, 2, 3, 2, 3, 2],
    },
    # per-reel FX1 counts (ultimate only)
    "fx1_counts": {"ultimate_feature": [1, 0, 0, 1, 0, 0]},
    # pay bands: symbol -> {min-count: payX100}
    "paytable": {
        "H1": {"8": 320, "10": 1000, "12": 2600},
        "H2": {"8": 260, "10": 650, "12": 1600},
        "H3": {"8": 200, "10": 450, "12": 1000},
        "H4": {"8": 130, "10": 320, "12": 800},
        "L1": {"8": 52, "10": 130, "12": 400},
        "L2": {"8": 42, "10": 100, "12": 320},
        "L3": {"8": 34, "10": 80, "12": 260},
        "L4": {"8": 27, "10": 64, "12": 200},
        "L5": {"8": 21, "10": 50, "12": 160},
    },
    "scatterPays": {"3": 200, "4": 600, "5": 2000, "6": 10000},
    # orb value tables (value -> weight); integers only, values are plain multipliers
    "orbTables": {
        "base": {"2": 220, "3": 60, "4": 34, "5": 20, "6": 12, "8": 8, "10": 5,
                 "12": 3.5, "15": 2.5, "20": 1.5, "25": 1, "50": 0.3, "100": 0.08},
        "feature": {"2": 66, "3": 55, "4": 45, "5": 38, "6": 30, "8": 22, "10": 16,
                    "12": 11, "15": 8, "20": 5, "25": 3.5, "50": 1.4, "100": 0.45},
        "super_feature": {"3": 60, "4": 50, "5": 40, "6": 32, "8": 24, "10": 18,
                           "12": 12, "15": 9, "20": 6, "25": 4, "50": 1.8, "100": 0.6},
        "ultimate_feature": {"5": 80, "6": 40, "8": 24, "10": 16, "12": 11,
                              "15": 7, "20": 4.5, "25": 3, "50": 1.2, "100": 0.4},
    },
    "tiers": {
        "feature":          {"rounds": 10, "startingBank": 1, "retriggerCap": 3},
        "super_feature":    {"rounds": 12, "startingBank": 3, "retriggerCap": 4},
        "ultimate_feature": {"rounds": 12, "startingBank": 5, "retriggerCap": 5, "doubler": True},
    },
    "multiplierCap": 512,
    "maxWinXBet": 10000,
    "targetRtp": 0.96,
    "rtpTolerance": 0.01,  # DEV gate (A10); release gate is CONVENTIONS §5
}


def build_strip(reel: int, set_name: str, rng: np.random.Generator) -> list[str]:
    pay = {s: c for s, c in PARAMS["pay_counts"][set_name].items() if c > 0}
    sc = PARAMS["scatter_counts"][set_name][reel]
    orb = PARAMS["orb_counts"][set_name][reel]
    fx1 = PARAMS["fx1_counts"].get(set_name, [0] * REELS)[reel]

    length = sum(pay.values()) + sc + orb + fx1  # composition defines the strip
    strip: list[str | None] = [None] * length
    for i in range(sc):
        idx = (round(i * length / sc) + 7 * reel) % length
        while strip[idx] is not None:
            idx = (idx + 1) % length
        strip[idx] = "SCATTER"
    for i in range(orb):
        idx = (round(i * length / orb) + 7 * reel + 11) % length
        while strip[idx] is not None:
            idx = (idx + 1) % length
        strip[idx] = "MULT"
    for i in range(fx1):
        idx = (round(i * length / fx1) + 7 * reel + 29) % length
        while strip[idx] is not None:
            idx = (idx + 1) % length
        strip[idx] = "FX1"

    fillers = [s for s, cnt in pay.items() for _ in range(cnt)]
    rng.shuffle(fillers)
    it = iter(fillers)
    for i in range(length):
        if strip[i] is None:
            strip[i] = next(it)
    # verify scatter spacing >= ROWS (max 1 visible per reel)
    sc_idx = [i for i, s in enumerate(strip) if s == "SCATTER"]
    for a, b in zip(sc_idx, sc_idx[1:] + [sc_idx[0] + length] if sc_idx else []):
        if b - a < ROWS:
            raise ValueError(f"{set_name} reel {reel}: scatter spacing {b-a} < {ROWS}")
    return strip  # type: ignore[return-value]


def poisson_binomial(ps: list[float]) -> dict[int, float]:
    dist = {0: 1.0}
    for p in ps:
        nxt: dict[int, float] = {}
        for k, q in dist.items():
            nxt[k] = nxt.get(k, 0.0) + q * (1 - p)
            nxt[k + 1] = nxt.get(k + 1, 0.0) + q * p
        dist = nxt
    return dist


def reel_length(set_name: str, reel: int) -> int:
    pay = sum(c for c in PARAMS["pay_counts"][set_name].values() if c > 0)
    return (
        pay
        + PARAMS["scatter_counts"][set_name][reel]
        + PARAMS["orb_counts"][set_name][reel]
        + PARAMS["fx1_counts"].get(set_name, [0] * REELS)[reel]
    )


def tier_probabilities(set_name: str) -> dict:
    ps = [
        ROWS * c / reel_length(set_name, r)
        for r, c in enumerate(PARAMS["scatter_counts"][set_name])
    ]
    dist = poisson_binomial(ps)
    p3 = dist.get(3, 0.0)
    p4 = dist.get(4, 0.0)
    p5p = sum(v for k, v in dist.items() if k >= 5)
    return {
        "P(feature)=P(3)": p3, "1in3": 1 / p3 if p3 else None,
        "P(super)=P(4)": p4, "1in4": 1 / p4 if p4 else None,
        "P(ultimate)=P(5+)": p5p, "1in5": 1 / p5p if p5p else None,
    }


def write_bundle(out_dir: Path, active_reel_set: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(20260808)  # layout seed — reproducible bundles

    game_config = {
        "gameId": "belladonna-parlour",
        "gameName": "Belladonna's Parlour",
        "projectSlug": "belladonna-parlour",
        "gameVersion": "0.1.0",
        "mathVersion": "0.1.0",
        "grid": {"columns": REELS, "rows": ROWS},
        "evaluation": "scatter_pays",
        "maxWinXBet": PARAMS["maxWinXBet"],
        "betMinorDefault": 100,
        "activeReelSet": active_reel_set,
    }
    symbols = [
        {"id": "SCATTER", "kind": "scatter", "tierRank": 0},
        {"id": "MULT", "kind": "multiplier", "tierRank": 0},
        {"id": "FX1", "kind": "feature_exclusive", "tierRank": 0},
        {"id": "H1", "kind": "premium", "tierRank": 1},
        {"id": "H2", "kind": "premium", "tierRank": 2},
        {"id": "H3", "kind": "premium", "tierRank": 3},
        {"id": "H4", "kind": "premium", "tierRank": 4},
        {"id": "L1", "kind": "low", "tierRank": 5},
        {"id": "L2", "kind": "low", "tierRank": 6},
        {"id": "L3", "kind": "low", "tierRank": 7},
        {"id": "L4", "kind": "low", "tierRank": 8},
        {"id": "L5", "kind": "low", "tierRank": 9},
    ]
    paytable = {"linePays": PARAMS["paytable"], "scatterPays": PARAMS["scatterPays"]}
    reel_sets = {
        "sets": [
            {
                "setId": name,
                "purpose": name,
                "strips": [build_strip(r, name, rng) for r in range(REELS)],
            }
            for name in ("base", "feature", "super_feature", "ultimate_feature", "ante")
        ]
    }
    scatter_tiers = {
        "countingRule": "initial-grid",
        "countCascadedScatters": False,
        "countCopiedScatters": False,
        "tiers": [
            {"tierId": "feature", "scattersRequired": 3, "publicName": "The Tasting",
             "entry": {"rounds": 10, "startingMultiplier100": 100, "modifiers": ["essence_banking"]}},
            {"tierId": "super_feature", "scattersRequired": 4, "publicName": "The Distillery",
             "entry": {"rounds": 12, "startingMultiplier100": 300, "modifiers": ["essence_banking", "enriched_reels"]}},
            {"tierId": "ultimate_feature", "scattersRequired": 5, "publicName": "The Night Garden",
             "entry": {"rounds": 12, "startingMultiplier100": 500, "modifiers": ["essence_banking", "upgraded_orbs", "multiplier_doubler"]}},
        ],
        "fiveOrMoreUsesUltimateTier": True,
        "retrigger": {"allowed": True, "scattersRequired": 3, "roundsAwarded": 5, "capPerFeature": 3},
        "anticipation": {"enabled": True, "triggersAtScatters": 2},
    }
    features = {
        **{
            tier: {**cfg, "reelSet": tier}
            for tier, cfg in PARAMS["tiers"].items()
        },
        "orbTables": PARAMS["orbTables"],
        "multiplierCap": PARAMS["multiplierCap"],
    }
    math_model = {
        "profileId": "rtp-96",
        "targetRtp": PARAMS["targetRtp"],
        "rtpTolerance": PARAMS["rtpTolerance"],
        "volatilityClass": "medium-high",  # measured: per-spin sigma 6.8 at dev size
        "cascades": {"enabled": True, "capPerSpin": 20, "multiplierProgression": []},
        "maxWin": {"xBet": PARAMS["maxWinXBet"], "terminationPolicy": "end_round"},
    }

    for name, obj in [
        ("game-config.json", game_config), ("symbols.json", symbols),
        ("paytable.json", paytable), ("reel-sets.json", reel_sets),
        ("scatter-tiers.json", scatter_tiers), ("features.json", features),
        ("math-model.json", math_model),
    ]:
        (out_dir / name).write_text(json.dumps(obj, indent=1), encoding="utf-8")


def main() -> None:
    write_bundle(HERE, "base")
    write_bundle(HERE.parent / "math-config-ante", "ante")
    print("bundles written: math-config/ (base), math-config-ante/ (ante)")
    for s in ("base", "ante"):
        print(f"\n[{s}] scatter-tier probabilities (initial grid, exact):")
        for k, v in tier_probabilities(s).items():
            print(f"  {k}: {v:.6g}" if isinstance(v, float) else f"  {k}: {v}")
    e_orbs = {
        s: round(sum(ROWS * c / reel_length(s, r) for r, c in enumerate(PARAMS["orb_counts"][s])), 3)
        for s in PARAMS["orb_counts"]
    }
    print(f"\nE[orbs per initial drop]: {e_orbs}")


if __name__ == "__main__":
    main()
