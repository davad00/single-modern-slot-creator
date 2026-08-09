import json
from pathlib import Path

GAME = Path("..").resolve()
mf = GAME / "config" / "asset-manifest.json"
m = json.loads(mf.read_text(encoding="utf-8"))
assets = m if isinstance(m, list) else m.get("assets") or m["artifacts"]
rendered = {p.stem for p in (GAME / "assets" / "art" / "symbols").glob("*.png")}
rendered |= {"reel-cabinet", "cell", "cell-win"}
rendered |= {p.stem for p in (GAME / "assets" / "art" / "ui").glob("*.png")}
rendered |= {p.stem for p in (GAME / "assets" / "art" / "winplates").glob("*.png")}
rendered |= {p.stem for p in (GAME / "assets" / "art" / "vfx").glob("*.png")}
n = 0
for a in assets:
    stem = Path(a["file"]).stem
    if stem in rendered:
        a["status"] = "generated"
        a["provenance"]["generator"] = "blender"
        a["provenance"]["prompt"] = "prompts/blender/bp-asset-kit.py"
        a["provenance"]["generatedAt"] = "2026-08-08"
        a["provenance"]["license"] = "procedural Blender render; original work, no third-party IP"
        n += 1
mf.write_text(json.dumps(m, indent=1), encoding="utf-8")
print(f"asset-manifest: {n} assets marked blender-generated of {len(assets)}")
