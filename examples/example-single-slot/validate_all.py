"""Schema validation for every Kilnspire example artifact that has a schema.

Run:  uv run --with jsonschema python validate_all.py   (from this directory)

Array-shaped configs (symbols, reel-sets) validate per element, matching
prompts/math.md section 7. Files with no dedicated schema (spin-presentation,
autoplay, device-profiles) are listed as SCHEMA-GAP and only checked for JSON
well-formedness. Forced-tier simulation reports are DEV diagnostics whose
rtp/contribution values legitimately exceed the simulation-report schema's
fraction bound of 10 (see math/src/slot_math/simulate.py docstring); they are
checked for JSON well-formedness only.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import jsonschema

HERE = Path(__file__).parent
SCHEMAS = HERE.parent.parent / "schemas"


def load(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))


def main() -> int:
    checks: list[tuple[str, str, str]] = []  # (file, schema, mode)
    per_element = {"symbols.json": "symbol", "reel-sets.json": "reel-set"}
    whole = {
        "game-config.json": "game-config",
        "paytable.json": "paytable",
        "scatter-tiers.json": "scatter-tiers",
        "features.json": "feature",
        "bonus-buys.json": "bonus-buy",
        "jurisdiction-policies.json": "jurisdiction-policy",
        "state-machine.json": "state-machine",
        "animation-events.json": "animation-event",
        "audio-events.json": "audio-event",
        "asset-manifest.json": "asset-manifest",
    }
    schema_gap = ["spin-presentation.json", "autoplay.json", "device-profiles.json"]

    failures = 0

    def ok(msg):
        print("OK   ", msg)

    def fail(msg, err):
        nonlocal failures
        failures += 1
        print("FAIL ", msg, "->", str(err).splitlines()[0])

    for fname, sname in whole.items():
        schema = load(SCHEMAS / f"{sname}.schema.json")
        try:
            jsonschema.validate(load(HERE / "config" / fname), schema)
            ok(f"config/{fname} vs {sname}.schema.json")
        except Exception as e:
            fail(f"config/{fname}", e)

    for fname, sname in per_element.items():
        schema = load(SCHEMAS / f"{sname}.schema.json")
        try:
            data = load(HERE / "config" / fname)
            for item in data:
                jsonschema.validate(item, schema)
            ok(f"config/{fname} vs {sname}.schema.json (per element, {len(data)} items)")
        except Exception as e:
            fail(f"config/{fname}", e)

    for fname in schema_gap:
        try:
            load(HERE / "config" / fname)
            ok(f"config/{fname} well-formed JSON (SCHEMA-GAP: no dedicated schema exists)")
        except Exception as e:
            fail(f"config/{fname}", e)

    try:
        jsonschema.validate(load(HERE / "example-brief.json"), load(SCHEMAS / "skill-input.schema.json"))
        ok("example-brief.json vs skill-input.schema.json")
    except Exception as e:
        fail("example-brief.json", e)

    try:
        jsonschema.validate(load(HERE / "sample-outcome-manifest.json"), load(SCHEMAS / "outcome-manifest.schema.json"))
        ok("sample-outcome-manifest.json vs outcome-manifest.schema.json")
    except Exception as e:
        fail("sample-outcome-manifest.json", e)

    try:
        jsonschema.validate(load(HERE / "reports" / "dev-sim.json"), load(SCHEMAS / "simulation-report.schema.json"))
        ok("reports/dev-sim.json vs simulation-report.schema.json")
    except Exception as e:
        fail("reports/dev-sim.json", e)

    for fname in ("tier-feature.json", "tier-super-feature.json", "tier-ultimate-feature.json"):
        try:
            load(HERE / "reports" / fname)
            ok(f"reports/{fname} well-formed JSON (forced-tier DEV diagnostic; exempt from fraction bounds by design)")
        except Exception as e:
            fail(f"reports/{fname}", e)

    print(f"\n{failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
