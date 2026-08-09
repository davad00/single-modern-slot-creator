"""Help-vs-math consistency checker (step-13 rejection rule).

Compares the display bundle (config/) against the frozen runtime bundle
(math-config/): paytable band values, scatter pays, reel strips, tier
parameters, buy prices. Exit 1 with a diff list on any mismatch.

    cd games/belladonna-parlour/math
    uv run python ../math-config/check_display_sync.py
"""

import json
import sys
from pathlib import Path

GAME = Path(__file__).parents[1]
issues: list[str] = []


def load(p):
    return json.load(open(p, encoding="utf-8"))


mc_pay = load(GAME / "math-config" / "paytable.json")
mc_reels = load(GAME / "math-config" / "reel-sets.json")
mc_feat = load(GAME / "math-config" / "features.json")

dc_pay = load(GAME / "config" / "paytable.json")
dc_reels = load(GAME / "config" / "reel-sets.json")
dc_feat = load(GAME / "config" / "features.json")
dc_buys = load(GAME / "config" / "bonus-buys.json")

# --- paytable: display 'entries' (schema shape) vs math linePays bands -------
display_bands: dict[str, dict[str, int]] = {}
entries = dc_pay.get("entries") or dc_pay.get("linePays") or []
if isinstance(entries, dict):
    display_bands = {k: {b: int(v) for b, v in bands.items()} for k, bands in entries.items()}
else:
    for e in entries:
        sym = e.get("symbolId")
        bands = e.get("ofAKindPays") or e.get("bands") or e.get("pays") or {}
        display_bands[sym] = {str(k): int(v) for k, v in bands.items()}

for sym, bands in mc_pay["linePays"].items():
    d = display_bands.get(sym)
    if d is None:
        issues.append(f"paytable: display missing symbol {sym}")
        continue
    for band, val in bands.items():
        if str(band) not in d or int(d[str(band)]) != int(val):
            issues.append(f"paytable {sym} band {band}: math={val} display={d.get(str(band))}")

mc_sc = {str(k): int(v) for k, v in mc_pay["scatterPays"].items()}
dc_sc_raw = dc_pay.get("scatterPays") or {}
if isinstance(dc_sc_raw, list):
    dc_sc = {str(e.get("count") or e.get("scatters")): int(e.get("payX100") or e.get("pay")) for e in dc_sc_raw}
else:
    if not all(str(v).lstrip("-").isdigit() for v in dc_sc_raw.values()):
        # schema object shape, e.g. {symbolId: SCATTER, pays: {...}} — find the numeric map
        for v in dc_sc_raw.values():
            if isinstance(v, dict):
                dc_sc_raw = v
                break
    dc_sc = {str(k): int(v) for k, v in dc_sc_raw.items() if str(v).lstrip("-").isdigit()}
if mc_sc != dc_sc:
    issues.append(f"scatterPays differ: math={mc_sc} display={dc_sc}")

# --- reel strips: exact equality per purpose ---------------------------------
mc_sets = {s["purpose"]: s["strips"] for s in mc_reels["sets"]}
dc_sets = {}
dc_reel_list = dc_reels if isinstance(dc_reels, list) else dc_reels.get("sets", [])
for s in dc_reel_list:
    purpose = s.get("purpose")
    strips = s.get("strips") or (s.get("mode", {}) or {}).get("strips")
    dc_sets[purpose] = strips
for purpose, strips in mc_sets.items():
    d = dc_sets.get(purpose)
    if d is None:
        if purpose == "ante":
            # ante lives in math-config-ante; documented in rules + known-limitations
            print("note: 'ante' set intentionally not in display reel-sets (documented)")
        else:
            issues.append(f"reel-sets: display missing purpose '{purpose}'")
    elif json.dumps(d) != json.dumps(strips):
        issues.append(f"reel-sets: strips differ for '{purpose}'")

# --- tier parameters (authoritative display source: scatter-tiers.json) -------
dc_st = load(GAME / "config" / "scatter-tiers.json")
st_tiers = {t["tierId"]: t.get("entry", {}) for t in dc_st.get("tiers", [])}
for tier in ("feature", "super_feature", "ultimate_feature"):
    m = mc_feat[tier]
    e = st_tiers.get(tier, {})
    if e.get("rounds") != m["rounds"]:
        issues.append(f"scatter-tiers {tier}: rounds display={e.get('rounds')} math={m['rounds']}")
    want = int(m.get("startingBank", 1)) * 100
    if e.get("startingMultiplier100") != want:
        issues.append(f"scatter-tiers {tier}: startingMultiplier100 display={e.get('startingMultiplier100')} math={want}")
# per-tier retrigger caps (3/4/5) live in math features.json + GDD/rules text;
# the scatter-tiers schema carries a single baseline capPerFeature — documented wrinkle.

# --- buy prices (final measured pricing) --------------------------------------
FINAL_PRICES = {"buy_feature": 4210, "buy_super": 9170, "buy_ultimate": 16770}
buys = (
    dc_buys.get("bonusBuys") or dc_buys.get("modes") or dc_buys.get("buys")
    or (dc_buys if isinstance(dc_buys, list) else [])
)
found = {str(b.get("modeId", "")).replace("-", "_"): int(b.get("priceXBet100", -1)) for b in buys}
for mode, price in FINAL_PRICES.items():
    if found.get(mode) != price:
        issues.append(f"bonus-buys {mode}: expected priceXBet100={price} (measured pricing), display={found.get(mode)}")

if issues:
    print("DISPLAY/MATH SYNC ISSUES:")
    for i in issues:
        print(" -", i)
    sys.exit(1)
print("display config matches frozen math bundle (paytable, scatter pays, strips, tiers, buy prices)")
