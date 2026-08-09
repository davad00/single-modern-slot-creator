"""One-way sync: overwrite the value-bearing parts of the display bundle
(config/) from the frozen runtime bundle (math-config/), preserving the
display files' schema structure. Run after any math regeneration.

    cd games/belladonna-parlour/math
    uv run python ../math-config/sync_display.py
"""

import json
from pathlib import Path

GAME = Path(__file__).parents[1]


def load(p):
    return json.load(open(p, encoding="utf-8"))


def save(p, obj):
    p.write_text(json.dumps(obj, indent=1), encoding="utf-8")


mc_reels = load(GAME / "math-config" / "reel-sets.json")
mc_sets = {s["purpose"]: s["strips"] for s in mc_reels["sets"]}

dc_path = GAME / "config" / "reel-sets.json"
dc = load(dc_path)
dc_list = dc if isinstance(dc, list) else dc.get("sets", [])
# drop any ante workaround entry (schema purpose enum lacks 'ante'; a duplicate
# purpose='base' set is a strip-resolution hazard — ante lives in math-config-ante)
before = len(dc_list)
dc_list = [s for s in dc_list if s.get("setId") != "ante" and s.get("purpose") != "ante"]
seen_purposes: set[str] = set()
deduped = []
for s in dc_list:
    if s.get("purpose") in seen_purposes:
        print(f"dropping duplicate purpose entry setId={s.get('setId')}")
        continue
    seen_purposes.add(s.get("purpose"))
    deduped.append(s)
dc_list = deduped
if isinstance(dc, list):
    dc = dc_list
else:
    dc["sets"] = dc_list
if len(dc_list) != before:
    print(f"reel-sets: removed {before - len(dc_list)} ante/duplicate entrie(s)")
synced = []
for s in dc_list:
    purpose = s.get("purpose")
    if purpose in mc_sets:
        if "strips" in s:
            s["strips"] = mc_sets[purpose]
        elif isinstance(s.get("mode"), dict) and "strips" in s["mode"]:
            s["mode"]["strips"] = mc_sets[purpose]
        else:
            s["strips"] = mc_sets[purpose]
        synced.append(purpose)
save(dc_path, dc)
print(f"reel-sets: synced strips for {synced}")
missing = set(mc_sets) - set(synced)
if missing:
    print(f"note: purposes not represented in display bundle: {sorted(missing)} "
          "(ante lives in math-config-ante; documented in rules text + known-limitations)")

# scatter-tiers: rounds + starting multipliers must match features.json
mc_feat = load(GAME / "math-config" / "features.json")
st_path = GAME / "config" / "scatter-tiers.json"
st = load(st_path)
changed = False
for t in st.get("tiers", []):
    tier = t["tierId"]
    m = mc_feat[tier]
    entry = t.get("entry", {})
    if entry.get("rounds") != m["rounds"]:
        entry["rounds"] = m["rounds"]
        changed = True
    want_mult = int(m.get("startingBank", 1)) * 100
    if entry.get("startingMultiplier100") != want_mult:
        entry["startingMultiplier100"] = want_mult
        changed = True
save(st_path, st)
print(f"scatter-tiers: {'updated' if changed else 'already in sync'}")
