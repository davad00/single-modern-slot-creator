"""Deterministic generator for the Kilnspire runtime math-config bundle.

Emits the 7 JSON files the slot_math template engine loads (see
math/src/slot_math/config.py for the authoritative runtime format):

    game-config.json  symbols.json  paytable.json  reel-sets.json
    scatter-tiers.json  features.json  math-model.json

The DISPLAY configs under ../config/ follow the richer schemas in
<skill>/schemas/; this bundle is the flattened runtime mapping documented
in ../README.md. Strips are built from exact per-reel symbol counts
(the same counts published in docs/par-sheet.md) and interleaved with a
seeded RNG so the bundle is reproducible bit-for-bit.

Run:  uv run python generate_math_config.py   (from this directory)
"""

from __future__ import annotations

import json
import random
from pathlib import Path

OUT = Path(__file__).parent
STRIP_SEED = 77  # strip-interleave seed; part of the math version

GAME = {
    "gameId": "kilnspire",
    "gameName": "Kilnspire",
    "projectSlug": "kilnspire",
    "gameVersion": "1.0.0",
    "mathVersion": "1.0.0",
    "grid": {"columns": 5, "rows": 4},
    "evaluation": "ways",
    "maxWinXBet": 10000,
    "betMinorDefault": 100,
}

# payX100 per way (ways pays are per way; CONVENTIONS §5 integer rule)
PAYTABLE = {
    "linePays": {
        "H1": {"3": 45, "4": 135, "5": 440},
        "H2": {"3": 38, "4": 92, "5": 270},
        "H3": {"3": 27, "4": 74, "5": 178},
        "H4": {"3": 18, "4": 55, "5": 142},
        "L1": {"3": 8, "4": 28, "5": 75},
        "L2": {"3": 8, "4": 21, "5": 55},
        "L3": {"3": 6, "4": 19, "5": 45},
        "L4": {"4": 15, "5": 38},
        "L5": {"4": 12, "5": 28},
    },
    # scatter pays are on total bet
    "scatterPays": {"3": 300, "4": 1500, "5": 10000},
}

SYMBOLS = [
    {"id": "WILD", "kind": "wild", "tierRank": 1},
    {"id": "SCATTER", "kind": "scatter", "tierRank": 2},
    {"id": "H1", "kind": "premium", "tierRank": 3},
    {"id": "H2", "kind": "premium", "tierRank": 4},
    {"id": "H3", "kind": "premium", "tierRank": 5},
    {"id": "H4", "kind": "premium", "tierRank": 6},
    {"id": "L1", "kind": "low", "tierRank": 7},
    {"id": "L2", "kind": "low", "tierRank": 8},
    {"id": "L3", "kind": "low", "tierRank": 9},
    {"id": "L4", "kind": "low", "tierRank": 10},
    {"id": "L5", "kind": "low", "tierRank": 11},
]

# Exact per-reel symbol counts per reel set (strip length 48 everywhere).
# Order: [reel1, reel2, reel3, reel4, reel5]
COUNTS = {
    "base": [
        {"SCATTER": 1, "H1": 2, "H2": 3, "H3": 3, "H4": 4, "L1": 6, "L2": 6, "L3": 6, "L4": 6, "L5": 6},
        {"WILD": 1, "SCATTER": 1, "H1": 2, "H2": 3, "H3": 3, "H4": 4, "L1": 6, "L2": 6, "L3": 6, "L4": 6, "L5": 5},
        {"WILD": 1, "SCATTER": 1, "H1": 3, "H2": 3, "H3": 3, "H4": 4, "L1": 6, "L2": 6, "L3": 6, "L4": 5, "L5": 5},
        {"WILD": 1, "SCATTER": 1, "H1": 2, "H2": 3, "H3": 3, "H4": 4, "L1": 6, "L2": 6, "L3": 6, "L4": 6, "L5": 5},
        {"SCATTER": 1, "H1": 2, "H2": 3, "H3": 3, "H4": 4, "L1": 6, "L2": 6, "L3": 6, "L4": 6, "L5": 6},
    ],
    "feature": [
        {"WILD": 1, "SCATTER": 1, "H1": 3, "H2": 4, "H3": 4, "H4": 4, "L1": 5, "L2": 5, "L3": 5, "L4": 5, "L5": 5},
        {"WILD": 2, "SCATTER": 1, "H1": 3, "H2": 4, "H3": 4, "H4": 4, "L1": 5, "L2": 5, "L3": 5, "L4": 5, "L5": 5},
        {"WILD": 2, "SCATTER": 1, "H1": 3, "H2": 4, "H3": 4, "H4": 4, "L1": 5, "L2": 5, "L3": 5, "L4": 5, "L5": 5},
        {"WILD": 2, "SCATTER": 1, "H1": 3, "H2": 4, "H3": 4, "H4": 4, "L1": 5, "L2": 5, "L3": 5, "L4": 5, "L5": 5},
        {"WILD": 1, "SCATTER": 1, "H1": 3, "H2": 4, "H3": 4, "H4": 4, "L1": 5, "L2": 5, "L3": 5, "L4": 5, "L5": 5},
    ],
    "super_feature": [
        {"WILD": 2, "SCATTER": 1, "H1": 4, "H2": 5, "H3": 5, "H4": 4, "L1": 4, "L2": 4, "L3": 4, "L4": 4, "L5": 4},
        {"WILD": 3, "SCATTER": 1, "H1": 4, "H2": 5, "H3": 5, "H4": 4, "L1": 4, "L2": 4, "L3": 4, "L4": 4, "L5": 4},
        {"WILD": 3, "SCATTER": 1, "H1": 4, "H2": 5, "H3": 5, "H4": 4, "L1": 4, "L2": 4, "L3": 4, "L4": 4, "L5": 4},
        {"WILD": 3, "SCATTER": 1, "H1": 4, "H2": 5, "H3": 5, "H4": 4, "L1": 4, "L2": 4, "L3": 4, "L4": 4, "L5": 4},
        {"WILD": 2, "SCATTER": 1, "H1": 4, "H2": 5, "H3": 5, "H4": 4, "L1": 4, "L2": 4, "L3": 4, "L4": 4, "L5": 4},
    ],
    "ultimate_feature": [
        {"WILD": 4, "SCATTER": 1, "H1": 5, "H2": 6, "H3": 5, "H4": 5, "L1": 3, "L2": 3, "L3": 3, "L4": 3, "L5": 3},
        {"WILD": 5, "SCATTER": 1, "H1": 5, "H2": 6, "H3": 5, "H4": 5, "L1": 3, "L2": 3, "L3": 3, "L4": 3, "L5": 3},
        {"WILD": 5, "SCATTER": 1, "H1": 5, "H2": 6, "H3": 5, "H4": 5, "L1": 3, "L2": 3, "L3": 3, "L4": 3, "L5": 3},
        {"WILD": 5, "SCATTER": 1, "H1": 5, "H2": 6, "H3": 5, "H4": 5, "L1": 3, "L2": 3, "L3": 3, "L4": 3, "L5": 3},
        {"WILD": 4, "SCATTER": 1, "H1": 5, "H2": 6, "H3": 5, "H4": 5, "L1": 3, "L2": 3, "L3": 3, "L4": 3, "L5": 3},
    ],
}

SCATTER_TIERS = {
    "countingRule": "initial-grid",
    "countCascadedScatters": False,
    "countCopiedScatters": False,
    "featureBonusScatters": 3,
    "superFeatureScatters": 4,
    "ultimateFeatureScatters": 5,
    "fiveOrMoreUsesUltimateTier": True,
    "retrigger": {
        "allowed": True,
        "scattersRequired": 3,
        "roundsAwarded": 4,
        "capPerFeature": 3,
    },
}

FEATURES = {
    "feature": {"rounds": 8, "startingMult100": 200, "reelSet": "feature"},
    "super_feature": {"rounds": 10, "startingMult100": 400, "reelSet": "super_feature"},
    "ultimate_feature": {"rounds": 12, "startingMult100": 800, "reelSet": "ultimate_feature"},
}

MATH_MODEL = {
    "profileId": "rtp-96",
    "targetRtp": 0.96,
    "rtpTolerance": 0.01,
    "volatilityClass": "high",
    "cascades": {
        "enabled": True,
        "capPerSpin": 8,
        "multiplierProgression": [100, 200, 300, 500],
    },
    "maxWin": {"xBet": 10000, "terminationPolicy": "end_round"},
}


def build_strip(counts: dict[str, int], rng: random.Random) -> list[str]:
    """Seeded shuffle with an adjacency fix-up: no two identical symbols
    adjacent (including the wrap-around pair), so a 4-row window never shows
    a doubled special from a single strip position run."""
    bag = [s for s, n in counts.items() for _ in range(n)]
    rng.shuffle(bag)
    n = len(bag)
    for _ in range(200):
        clash = next((i for i in range(n) if bag[i] == bag[(i + 1) % n]), None)
        if clash is None:
            return bag
        j = rng.randrange(n)
        bag[clash], bag[j] = bag[j], bag[clash]
    raise RuntimeError("could not resolve strip adjacency")


def main() -> None:
    rng = random.Random(STRIP_SEED)
    sets = []
    for purpose in ("base", "feature", "super_feature", "ultimate_feature"):
        strips = [build_strip(c, rng) for c in COUNTS[purpose]]
        for i, (strip, c) in enumerate(zip(strips, COUNTS[purpose])):
            assert len(strip) == sum(c.values()), (purpose, i)
            for sym, cnt in c.items():
                assert strip.count(sym) == cnt, (purpose, i, sym)
        sets.append({"setId": purpose.replace("_", "-") + "-strips", "purpose": purpose, "strips": strips})

    files = {
        "game-config.json": GAME,
        "symbols.json": SYMBOLS,
        "paytable.json": PAYTABLE,
        "reel-sets.json": {"sets": sets},
        "scatter-tiers.json": SCATTER_TIERS,
        "features.json": FEATURES,
        "math-model.json": MATH_MODEL,
    }
    for name, data in files.items():
        (OUT / name).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {name}")


if __name__ == "__main__":
    main()
