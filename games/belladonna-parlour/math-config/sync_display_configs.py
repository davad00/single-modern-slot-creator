"""Sync display config/ files to the FROZEN math-config bundle (step-13 help-vs-math rule).

Fixes applied (recorded in docs/decision-log.md):
- paytable.json: full 8/10/12 band structure under the v1.0.1 schema widening
  (evaluationMode scatter_pays); values copied verbatim from math-config.
- game-config.json: winEvaluation.mode = scatter_pays.
- bonus-buys.json: prices/RTPs frozen from battery-v3 forced-entry EVs
  (40.42x / 88.01x / 161.01x at ~0.96 buy RTP).
Then re-validates the three files against their schemas.
"""

import json
from pathlib import Path

from jsonschema import Draft202012Validator as V

GAME = Path(__file__).parents[1]
ROOT = GAME.parents[1]
CFG = GAME / "config"
MC = GAME / "math-config"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def save(p, obj):
    Path(p).write_text(json.dumps(obj, indent=1), encoding="utf-8")


def validate(instance_path, schema_name):
    schema = load(ROOT / "schemas" / schema_name)
    V(schema).validate(load(instance_path))
    print(f"valid: {instance_path.name} vs {schema_name}")


# ---- paytable ----
mc_pay = load(MC / "paytable.json")
display = load(CFG / "paytable.json")
entries = [
    {"symbolId": sym, "ofAKindPays": bands}
    for sym, bands in mc_pay["linePays"].items()
]
new_pay = {
    "evaluationMode": "scatter_pays",
    "directionRule": "any_adjacent",
    "entries": entries,
    "scatterPays": {"symbolId": "SCATTER", "pays": mc_pay["scatterPays"]},
    "wildSubstitutionNote": (
        "No WILD symbol exists in this archetype. Pays are anywhere-count bands: "
        "a symbol count pays the highest listed threshold <= count (8-9 / 10-11 / 12+). "
        "Values are verbatim from math-config/paytable.json (single source of truth)."
    ),
}
save(CFG / "paytable.json", new_pay)
validate(CFG / "paytable.json", "paytable.schema.json")

# ---- game-config ----
gc = load(CFG / "game-config.json")
gc["winEvaluation"] = {"mode": "scatter_pays"}
save(CFG / "game-config.json", gc)
validate(CFG / "game-config.json", "game-config.schema.json")

# ---- bonus buys (battery-v3 frozen EVs) ----
bb = load(CFG / "bonus-buys.json")
frozen = {
    "buy-feature": (4210, 0.9601, "42.10x", "40.42x measured EV, reports/tier-feature.json seed 521"),
    "buy-super": (9170, 0.9598, "91.70x", "88.01x measured EV, reports/tier-super.json seed 522"),
    "buy-ultimate": (16770, 0.9601, "167.70x", "161.01x measured EV, reports/tier-ultimate.json seed 523"),
}
for mode in bb["bonusBuys"]:
    price, rtp, price_txt, prov = frozen[mode["modeId"]]
    mode["priceXBet100"] = price
    mode["rtp"] = rtp
    txt = mode["uiDisclosure"].get("disclosureText", "")
    import re

    txt = re.sub(r"\d+\.\d\dx total bet", f"{price_txt} total bet", txt)
    mode["uiDisclosure"]["disclosureText"] = txt
save(CFG / "bonus-buys.json", bb)
validate(CFG / "bonus-buys.json", "bonus-buy.schema.json")
print("display configs synced to frozen math bundle")
