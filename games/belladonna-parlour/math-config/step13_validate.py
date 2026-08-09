"""Step-13 validation sweep (gate G13): blocklist lint, schema validation,
cross-reference checks. Exit 1 with an issue list on failure.

    cd games/belladonna-parlour/math
    uv run --with jsonschema python ../math-config/step13_validate.py
"""

import json
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

GAME = Path(__file__).parents[1]
SKILL = GAME.parents[1]
issues: list[str] = []
notes: list[str] = []

# ---------------------------------------------------------------- 1. IP lint
BLOCKLIST = [
    "megaways", "megaclusters", "megapays", "megaquads", "megadozer", "megascatter",
    "xways", "xnudge", "xsplit", "xbomb", "xpays", "x-iter", "xiter",
    "gigablox", "splitz", "multimax", "gigarise", "doublemax", "tophit",
    "infinity reels", "infinireels", "cluster pays", "popwins",
    "lightning link", "dragon link", "dream drop", "push bet", "duelreels",
    "super scatter", "openrgs", "pragmatic play", "hacksaw", "nolimit city",
    "push gaming", "relax gaming", "elk studios", "play'n go", "playngo",
    "netent", "big time gaming", "yggdrasil", "reelplay", "avatarux",
    "aristocrat", "novomatic", "print studios", "gates of olympus",
    "sweet bonanza", "big bass", "money train", "wanted dead or a wild",
    "book of dead", "book of ra", "starburst", "bonanza", "san quentin",
    "mental", "tombstone", "razor returns", "razor ways", "jammin jars",
    "pirots", "iron bank", "white rabbit", "chaos crew", "le cowboy",
    "sugar rush", "lil devil", "snake arena",
]
# reference-context files where nominative use is sanctioned (research/matrix quoting)
REFERENCE_OK = {
    "docs/research-addendum.md", "docs/risk-register.md", "docs/source-register.md",
    "docs/decision-log.md", "docs/tuning-log.md", "docs/known-limitations.md",
    "docs/game-design-document.md",  # market references in concept matrix / §1 only
}
GAME_FACING_GLOBS = ["config/**/*.json", "prompts/**/*.json", "client/src/**/*.ts",
                     "client/public/**/*", "docs/par-sheet.md", "docs/art-style-bible.md",
                     "docs/ui-specification.md", "docs/motion-specification.md",
                     "docs/audio-specification.md"]
# word boundaries: 'mental' must not match 'instrumental'/'ornamental' etc.
pat = re.compile(
    "|".join(rf"\b{re.escape(b)}\b" for b in BLOCKLIST), re.IGNORECASE
)
for g in GAME_FACING_GLOBS:
    for f in GAME.glob(g):
        if not f.is_file() or f.suffix in (".png", ".webp", ".lock"):
            continue
        rel = f.relative_to(GAME).as_posix()
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for m in pat.finditer(text):
            line = text[: m.start()].count("\n") + 1
            issues.append(f"IP-LINT {rel}:{line}: blocked term '{m.group(0)}'")

# ------------------------------------------------- 2. schema validation
SCHEMA_MAP = {
    "config/game-config.json": "game-config",
    "config/symbols.json": "symbol",
    "config/paytable.json": "paytable",
    "config/reel-sets.json": "reel-set",
    "config/scatter-tiers.json": "scatter-tiers",
    "config/features.json": "feature",
    "config/bonus-buys.json": "bonus-buy",
    "config/state-machine.json": "state-machine",
    "config/jurisdiction-policies.json": "jurisdiction-policy",
    "config/animation-events.json": "animation-event",
    "config/audio-events.json": "audio-event",
    "config/asset-manifest.json": "asset-manifest",
}


def validate_instance(schema: dict, instance, label: str):
    v = Draft202012Validator(schema)
    errs = sorted(v.iter_errors(instance), key=lambda e: e.json_path)
    for e in errs[:5]:
        issues.append(f"SCHEMA {label}: {e.json_path}: {e.message[:140]}")
    return not errs


for rel, schema_name in SCHEMA_MAP.items():
    fp = GAME / rel
    sp = SKILL / "schemas" / f"{schema_name}.schema.json"
    if not fp.exists():
        issues.append(f"SCHEMA missing config file {rel}")
        continue
    schema = json.load(open(sp, encoding="utf-8"))
    inst = json.load(open(fp, encoding="utf-8"))
    # collection-vs-item schemas: if schema describes an object with an items
    # array wrapper, validate whole; if it describes a single item and the
    # instance is a wrapper/list, validate each element.
    ok = validate_instance(schema, inst, rel)
    if not ok and isinstance(inst, dict):
        for key in ("events", "features", "bonusBuys", "assets", "symbols", "policies", "sets", "tiers"):
            if key in inst and isinstance(inst[key], list):
                issues[:] = [i for i in issues if not i.startswith(f"SCHEMA {rel}")]
                all_ok = all(validate_instance(schema, item, f"{rel}[{n}]") for n, item in enumerate(inst[key]))
                if all_ok:
                    notes.append(f"{rel}: validated per-item against {schema_name} (collection wrapper)")
                break
    elif not ok and isinstance(inst, list):
        issues[:] = [i for i in issues if not i.startswith(f"SCHEMA {rel}")]
        for n, item in enumerate(inst):
            validate_instance(schema, item, f"{rel}[{n}]")

# structurally-validated configs (no standalone schema — CONVENTIONS §3 †)
for rel in ("config/spin-presentation.json", "config/autoplay.json", "config/device-profiles.json"):
    fp = GAME / rel
    if not fp.exists():
        issues.append(f"CONFIG missing {rel}")
    else:
        try:
            json.load(open(fp, encoding="utf-8"))
            notes.append(f"{rel}: strict-JSON parse ok (client-loader validated)")
        except Exception as e:
            issues.append(f"CONFIG {rel}: parse error {e}")

# ------------------------------------------------- 3. cross-references
anim = json.load(open(GAME / "config" / "animation-events.json", encoding="utf-8"))
audio = json.load(open(GAME / "config" / "audio-events.json", encoding="utf-8"))
anim_list = anim.get("events", anim if isinstance(anim, list) else [])
audio_list = audio.get("events", audio if isinstance(audio, list) else [])
audio_ids = {e.get("eventId") for e in audio_list}
CANON_STATES = {
    "boot", "loading", "ready", "round_requested", "outcome_received", "outcome_committed",
    "presenting_initial_result", "presenting_wins", "presenting_cascades", "feature_pending",
    "feature_entry", "feature_active", "super_feature_entry", "super_feature_active",
    "ultimate_feature_entry", "ultimate_feature_active", "feature_retrigger", "maximum_win",
    "feature_summary", "round_complete", "reconnecting", "recovering", "error",
}
for e in anim_list:
    aid = e.get("audioEvent")
    if aid and aid not in audio_ids:
        issues.append(f"XREF animation '{e.get('eventId')}': audioEvent '{aid}' not in audio-events.json")
    for key in ("reducedMotionTimelineId", "lowPerformanceTimelineId", "skippable", "durationMs"):
        if key not in e:
            issues.append(f"XREF animation '{e.get('eventId')}': missing {key}")
sm = json.load(open(GAME / "config" / "state-machine.json", encoding="utf-8"))
states = set(sm.get("states", []))
if states != CANON_STATES:
    issues.append(f"XREF state-machine states != canonical 23 (missing {CANON_STATES - states}, extra {states - CANON_STATES})")

# music states cover base + all tiers (G10)
for m in ("music.base", "music.feature", "music.super_feature", "music.ultimate_feature"):
    if m not in audio_ids:
        issues.append(f"XREF audio: required music state '{m}' missing")

# art prompt coverage (G9)
manifest = json.load(open(GAME / "config" / "asset-manifest.json", encoding="utf-8"))
assets = manifest if isinstance(manifest, list) else manifest["assets"]
prompts = json.load(open(GAME / "prompts" / "art-prompts.json", encoding="utf-8"))
prompt_ids = {p["assetId"] for p in prompts.get("prompts", [])}
for a in assets:
    if a["assetId"] not in prompt_ids:
        issues.append(f"G9 asset '{a['assetId']}' has no prompt in art-prompts.json")

# ------------------------------------------------- report
print(f"step-13 sweep: {len(anim_list)} animation events, {len(audio_list)} audio events, "
      f"{len(assets)} assets, {len(prompt_ids)} prompts")
for n in notes:
    print("note:", n)
if issues:
    print(f"\n{len(issues)} ISSUE(S):")
    for i in issues:
        print(" -", i)
    sys.exit(1)
print("\nALL CHECKS PASS")
