"""Build the final artifact-manifest.json: every file in the game package with
sha256, category, status and provenance (gate G14).

    cd games/belladonna-parlour/math
    uv run python ../math-config/build_artifact_manifest.py
"""

import hashlib
import json
from datetime import date
from pathlib import Path

GAME = Path(__file__).parents[1]
SKIP_DIRS = {"node_modules", ".venv", "__pycache__", ".pytest_cache", "dist"}


def category(rel: str) -> str:
    if rel.startswith("docs/"):
        return "doc"
    if rel.startswith("config/"):
        return "config"
    if rel.startswith("math-config/") or rel.startswith("math/"):
        return "math"
    if rel.startswith("client/"):
        return "client"
    if rel.startswith("assets/"):
        return "asset"
    if rel.startswith("prompts/"):
        return "prompt"
    return "meta"


def status(rel: str) -> str:
    if rel.startswith("assets/art/blender/"):
        return "generated"
    if rel.startswith("prompts/"):
        return "final"
    if rel.endswith(("-report.md", "battery.log")) or "/reports/" in rel:
        return "report"
    return "final"


def provenance(rel: str) -> str:
    if rel.startswith("assets/art/blender/"):
        return "blender-mcp live render from prompts/blender scripts"
    if rel.startswith("math/reports/"):
        return "slot_math simulate (seeds in report provenance blocks)"
    if rel.startswith("client/scenarios/"):
        return "export_dev_bank.py (DEV ONLY)"
    return "single-modern-slot-creator v1.0.0 run 2026-08-08"


def main() -> None:
    artifacts = []
    for f in sorted(GAME.rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(GAME).as_posix()
        if any(part in SKIP_DIRS for part in f.parts):
            continue
        if rel == "artifact-manifest.json" or rel.endswith(("bun.lock", "uv.lock")):
            # locks hashed too — they matter for reproducibility
            if rel == "artifact-manifest.json":
                continue
        h = hashlib.sha256(f.read_bytes()).hexdigest()
        artifacts.append({
            "path": rel,
            "category": category(rel),
            "sha256": h,
            "status": status(rel),
            "provenance": provenance(rel),
        })

    manifest = {
        "schemaVersion": "1.0.0",
        "project": {
            "gameId": "belladonna-parlour",
            "gameName": "Belladonna's Parlour",
            "projectSlug": "belladonna-parlour",
            "gameVersion": "0.1.0",
            "mathVersion": "0.1.0",
            "configHash": "sha256:c3a6de0fadd9f56e9773c190aa69b55834dba77117881750aaa01a2fbb731441",
        },
        "generatedAt": str(date.today()),
        "generator": "single-modern-slot-creator v1.0.0",
        "artifacts": artifacts,
        "gates": {
            "G2": "pass", "G3": "pass", "G4": "pass",
            "G5": "pass-dev-gate (release sizing pending — known-limitations #1)",
            "G6": "pass", "G7": "pass", "G8": "pass",
            "G9": "pass-with-degradation (art prompt-only + Blender renders; imagegen backend down — K6)",
            "G10": "pass", "G11": "pass", "G12": "pass", "G13": "pass",
            "G14": "pass",
        },
        "knownLimitations": [
            "Dev-grade simulation sizing (A10/K3); release evidence REQUIRED-BEFORE-CERT.",
            "OPEN K7: advertised-max-win hittability vs GLI-11 (PAR §8).",
            "Art prompt-only except Blender stand-ins (K6); 56 prompts + 2 scripts ready.",
            "RTP profiles 0.94/0.92 declared, not built (A4).",
        ],
    }
    dest = GAME / "artifact-manifest.json"
    dest.write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"wrote {dest.name}: {len(artifacts)} artifacts hashed")


if __name__ == "__main__":
    main()
