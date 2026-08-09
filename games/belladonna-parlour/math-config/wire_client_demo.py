"""Wire the client dev server to Belladonna's Parlour for manual testing.

Builds client/public/config/*.json in the CLIENT loader shape (configLoader.ts)
from the frozen math bundle, and stages the scenario bank under public/.
Outcomes in the demo come from ScenarioBankProvider (Python-engine manifests) —
the client-side lines/paytable fields exist only for HUD display + idle grid.
"""

import json
import shutil
from pathlib import Path

GAME = Path(__file__).parents[1]
PUB = GAME / "client" / "public"

mc = json.loads((GAME / "math-config" / "game-config.json").read_text(encoding="utf-8"))
pay = json.loads((GAME / "math-config" / "paytable.json").read_text(encoding="utf-8"))
reels = json.loads((GAME / "math-config" / "reel-sets.json").read_text(encoding="utf-8"))
feats = json.loads((GAME / "math-config" / "features.json").read_text(encoding="utf-8"))

symbols = [{"id": s} for s in
           ["SCATTER", "MULT", "FX1", "H1", "H2", "H3", "H4", "L1", "L2", "L3", "L4", "L5"]]

# HUD paytable display: the 8/10/12 anywhere bands as {symbolId, count, payX100} rows
paytable_rows = [
    {"symbolId": sym, "count": int(band), "payX100": int(v)}
    for sym, bands in pay["linePays"].items()
    for band, v in bands.items()
]

reel_sets = [
    {"context": s["purpose"], "strips": s["strips"]}
    for s in reels["sets"]
    if s["purpose"] in ("base", "feature", "super_feature", "ultimate_feature")
]

client_cfg = {
    "projectSlug": "belladonna-parlour",
    "gameVersion": "0.1.0",
    "mathVersion": "0.1.0",
    "currency": "EUR",
    "columns": 6,
    "rows": 5,
    # DEV DEMO: the scenario bank serves betMinor=100 only (known-limitations
    # #10) — pin the stake so every spin replays a valid committed round
    "minBetMinor": 100,
    "maxBetMinor": 100,
    "maxWinXBet": 10000,
    "rtpTarget": 0.9651,  # measured (PAR sheet); displayed in HUD
    # nominal line for the line-oriented template validator; outcomes come from
    # the injected ScenarioBankProvider, never from client-side line evaluation
    "lines": [[0, 0, 0, 0, 0, 0]],
    "symbols": symbols,
    "paytable": paytable_rows,
    "reelSets": reel_sets,
    "scatterTiers": [
        {"tierId": "feature", "scatters": 3, "roundsAwarded": int(feats["feature"]["rounds"]),
         "multiplier": int(feats["feature"]["startingBank"]), "retriggerCap": int(feats["feature"]["retriggerCap"])},
        {"tierId": "super_feature", "scatters": 4, "roundsAwarded": int(feats["super_feature"]["rounds"]),
         "multiplier": int(feats["super_feature"]["startingBank"]), "retriggerCap": int(feats["super_feature"]["retriggerCap"])},
        {"tierId": "ultimate_feature", "scatters": 5, "roundsAwarded": int(feats["ultimate_feature"]["rounds"]),
         "multiplier": int(feats["ultimate_feature"]["startingBank"]), "retriggerCap": int(feats["ultimate_feature"]["retriggerCap"])},
    ],
    "cascades": {"enabled": True, "maxSteps": 20},
}

policy = {
    "jurisdictionId": "DEV-DEMO",
    "autoplayAllowed": True,
    "autoplayMaxRounds": 100,
    "quickSpinAllowed": True,
    "turboSpinAllowed": True,
    "slamStopAllowed": True,
    "bonusBuyAllowed": True,
    "minRoundDurationMs": 0,
    "rtpDisplayRequired": True,
    "realityCheckIntervalMs": None,
}

(PUB / "config").mkdir(parents=True, exist_ok=True)
(PUB / "scenarios").mkdir(parents=True, exist_ok=True)
(PUB / "config" / "game-config.json").write_text(json.dumps(client_cfg, indent=1), encoding="utf-8")
(PUB / "config" / "jurisdiction-policies.json").write_text(json.dumps(policy, indent=1), encoding="utf-8")
sp = GAME / "config" / "spin-presentation.json"
if sp.exists():
    shutil.copy2(sp, PUB / "config" / "spin-presentation.json")
shutil.copy2(GAME / "client" / "scenarios" / "dev-bank.json", PUB / "scenarios" / "dev-bank.json")
print("client demo wired: public/config/*.json + public/scenarios/dev-bank.json")
