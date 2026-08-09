"""Step-13 mechanical validation sweep for Belladonna's Parlour.

Checks: (1) schema validation of every config with a schema; (2) strict parse of
schema-gap JSONs; (3) research/16 blocklist lint over game-facing text; (4) cross-file
consistency (animation->audio ids, canonical states, display-vs-math paytable, ante 1.20).
Prints a PASS/FAIL table; exit 1 on any FAIL. Fixes are NOT applied here (report-only).
"""

import json
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator as V

GAME = Path(__file__).parents[1]
ROOT = GAME.parents[1]
CFG = GAME / "config"
results: list[tuple[str, str, str]] = []  # (check, PASS/FAIL/WARN, detail)


def check(name, ok, detail=""):
    results.append((name, "PASS" if ok else "FAIL", detail))


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


# 1) schema validation
SCHEMA_MAP = {
    "game-config.json": "game-config.schema.json",
    "symbols.json": "symbol.schema.json",
    "paytable.json": "paytable.schema.json",
    "reel-sets.json": "reel-set.schema.json",
    "scatter-tiers.json": "scatter-tiers.schema.json",
    "features.json": "feature.schema.json",
    "bonus-buys.json": "bonus-buy.schema.json",
    "state-machine.json": "state-machine.schema.json",
    "jurisdiction-policies.json": "jurisdiction-policy.schema.json",
    "animation-events.json": "animation-event.schema.json",
    "audio-events.json": "audio-event.schema.json",
    "asset-manifest.json": "asset-manifest.schema.json",
}
for cfg_name, schema_name in SCHEMA_MAP.items():
    try:
        schema = load(ROOT / "schemas" / schema_name)
        inst = load(CFG / cfg_name)
        # collection-vs-item schemas: validate per-item when schema describes one object
        if isinstance(inst, list) and schema.get("type") == "object" and "properties" in schema:
            for i, item in enumerate(inst):
                V(schema).validate(item)
        elif (
            isinstance(inst, dict)
            and schema.get("type") == "object"
            and not (set(inst.keys()) & set(schema.get("properties", {}).keys()))
        ):
            # wrapper object holding an array (e.g. {"events": [...]}) vs item schema
            arr = next((v for v in inst.values() if isinstance(v, list)), None)
            if arr is not None and "properties" in schema and "events" not in schema.get("properties", {}):
                for item in arr:
                    V(schema).validate(item)
            else:
                V(schema).validate(inst)
        else:
            V(schema).validate(inst)
        check(f"schema {cfg_name}", True)
    except Exception as e:  # noqa: BLE001
        check(f"schema {cfg_name}", False, str(e)[:160])

# 2) strict parse of schema-gap files + prompts + bank
for rel in [
    "config/spin-presentation.json", "config/autoplay.json", "config/device-profiles.json",
    "prompts/art-prompts.json", "prompts/audio-prompts.json", "client/scenarios/dev-bank.json",
]:
    try:
        load(GAME / rel)
        check(f"parse {rel}", True)
    except Exception as e:  # noqa: BLE001
        check(f"parse {rel}", False, str(e)[:120])

# 3) blocklist lint over game-facing text
BLOCK = [
    "megaways", "megaclusters", "megapays", "megaquads", "megadozer", "megascatter",
    "xways", "xnudge", "xsplit", "xbomb", "xpays", "x-iter", "xiter",
    "gigablox", "splitz", "multimax", "gigarise", "doublemax", "tophit",
    "infinity reels", "infinireels", "cluster pays", "popwins",
    "lightning link", "dragon link", "dream drop", "push bet", "duelreels",
    "super scatter", "openrgs", "pragmatic play", "hacksaw", "nolimit city",
    "push gaming", "relax gaming", "elk studios", "play'n go", "playngo", "netent",
    "big time gaming", "yggdrasil", "reelplay", "avatarux", "aristocrat", "novomatic",
    "print studios", "gates of olympus", "sweet bonanza", "big bass", "money train",
    "wanted dead or a wild", "book of dead", "book of ra", "starburst", "bonanza",
    "san quentin", "jammin jars", "pirots", "iron bank", "white rabbit", "chaos crew",
    "le cowboy", "sugar rush", "lil devil", "snake arena",
]
GAME_FACING = (
    list(CFG.glob("*.json"))
    + list((GAME / "prompts").rglob("*.*"))
    + list((GAME / "client" / "src").rglob("*.ts"))
    + [GAME / "docs" / d for d in (
        "ui-specification.md", "motion-specification.md", "audio-specification.md",
        "art-style-bible.md", "par-sheet.md",
    )]
)
hits = []
for f in GAME_FACING:
    if not f.is_file():
        continue
    text = f.read_text(encoding="utf-8", errors="replace").lower()
    for term in BLOCK:
        for m in re.finditer(re.escape(term), text):
            ctx = text[max(0, m.start() - 60): m.end() + 60]
            # nominative research/reference context is allowed
            if any(k in ctx for k in ("reference only", "research/", "trade-dress", "distance from",
                                       "incumbent", "not to copy", "market pattern", "-class", "blocklist")):
                continue
            hits.append(f"{f.name}: '{term}'")
check("blocklist lint (game-facing)", not hits, "; ".join(hits[:6]))

# 4) cross-file consistency
anim = load(CFG / "animation-events.json")
anim_events = anim if isinstance(anim, list) else next(v for v in anim.values() if isinstance(v, list))
audio = load(CFG / "audio-events.json")
audio_events = audio if isinstance(audio, list) else next(v for v in audio.values() if isinstance(v, list))
audio_ids = {e["eventId"] for e in audio_events}
missing_audio = sorted(
    {
        str(e.get("audioEvent"))
        for e in anim_events
        if e.get("audioEvent") not in (None, "") and e.get("audioEvent") not in audio_ids
    }
)
check("anim->audio id resolution", not missing_audio, ", ".join(missing_audio[:8]))

CANON = {
    "boot", "loading", "ready", "round_requested", "outcome_received", "outcome_committed",
    "presenting_initial_result", "presenting_wins", "presenting_cascades", "feature_pending",
    "feature_entry", "feature_active", "super_feature_entry", "super_feature_active",
    "ultimate_feature_entry", "ultimate_feature_active", "feature_retrigger", "maximum_win",
    "feature_summary", "round_complete", "reconnecting", "recovering", "error",
}
sm = load(CFG / "state-machine.json")
sm_states = set(sm["states"] if isinstance(sm.get("states"), list) else sm["stateMachine"]["states"])
check("state machine = canonical 23", sm_states == CANON,
      f"extra={sorted(sm_states - CANON)[:4]} missing={sorted(CANON - sm_states)[:4]}")

mc_pay = load(GAME / "math-config" / "paytable.json")
disp_pay = load(CFG / "paytable.json")
disp_map = {e["symbolId"]: e["ofAKindPays"] for e in disp_pay["entries"]}
same = all(disp_map.get(sym) == bands for sym, bands in mc_pay["linePays"].items())
sc_same = disp_pay.get("scatterPays", {}).get("pays") == mc_pay["scatterPays"]
check("display paytable == math paytable", same and sc_same)

text_all = "".join(
    (GAME / "docs" / d).read_text(encoding="utf-8", errors="replace")
    for d in ("ui-specification.md",)
    if (GAME / "docs" / d).is_file()
) + (CFG / "spin-presentation.json").read_text(encoding="utf-8", errors="replace") \
  + (CFG / "game-config.json").read_text(encoding="utf-8", errors="replace")
stale_ante = "1.25" in text_all and "1.20" not in text_all
check("ante x1.20 propagated (no stale 1.25-only files)", not stale_ante,
      "found 1.25 without 1.20 in ui/spin/game configs" if stale_ante else "")

buys = load(CFG / "bonus-buys.json")["bonusBuys"]
prices = {b["modeId"]: b["priceXBet100"] for b in buys}
check("buy prices frozen (4210/9170/16770)",
      prices == {"buy-feature": 4210, "buy-super": 9170, "buy-ultimate": 16770}, str(prices))

# report
width = max(len(r[0]) for r in results)
fails = 0
for name, status, detail in results:
    print(f"{name.ljust(width)}  {status}  {detail}")
    if status == "FAIL":
        fails += 1
print(f"\n{len(results)} checks, {fails} FAIL")
sys.exit(1 if fails else 0)
