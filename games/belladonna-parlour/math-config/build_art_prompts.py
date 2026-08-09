"""Assemble prompts/art-prompts.json from config/asset-manifest.json + the style bible
anchors (docs/art-style-bible.md §17). Deterministic, schema-shaped, full field register
per prompt — replaces the stalled worker's bulk generation with programmatic assembly.

    cd games/belladonna-parlour/math
    uv run python ../math-config/build_art_prompts.py
"""

import json
from pathlib import Path

GAME = Path(__file__).parents[1]

STYLE_ANCHOR = (
    "STYLE ANCHOR [belladonna-parlour v0.1.0]: Belladonna's Parlour, a candle-lit "
    "Victorian apothecary where a celebrated perfumer distils forbidden essences "
    "after midnight. Mood: elegant menace, hushed, opulent, unhurried, adult. "
    "Shape language: blown-glass volumes over Victorian brass filigree and tall "
    "apothecary-cabinet geometry. Materials: poison glass, tarnished brass, dark "
    "walnut. Lighting: warm candle key from lower-left; cold moonlight rim from "
    "upper-right. Camera: symbols orthographic front-on; environments share a "
    "horizon at 44% height. Painterly 2.5D game art, crisp edges, muted jewel "
    "tones, no photorealism."
)
PALETTE_LOCK = (
    "PALETTE LOCK: bg-deep #120D16, bg-mid #241B2F, playfield #1B1512, primary brass #A98546, "
    "secondary walnut #5C4634, action venom-amber #D98E2B (reserved: interactive elements ONLY), "
    "win candle-gold #EFC75E, danger oxblood #B3402E, text bone-cream #E9E0CB, scatter "
    "wax-mulberry #8C2E52, orb essence #A8C94E, poison green #74A12E, belladonna violet #6C4E91, "
    "moonlight #B9C7D9, tier-feature amber #C98F3D, tier-super verdigris #4E8A6A, tier-ultimate "
    "moon-violet #9B7BC4. Use ONLY these hues plus neutral shades derived from them; no "
    "off-palette colours. Magenta and hot-pink are banned from all art (keying colour)."
)
NEGATIVE_BASE = (
    "photorealism, watermark, signature, readable text, text artifacts, off-palette colours, "
    "existing slot-game lookalikes, protected characters or logos, celebrity likeness, magenta "
    "or hot-pink pigment, soft feathered glow halo, drop shadow, border, candy colours, "
    "confectionery, cartoon mascot, child-appealing style, anthropomorphic bottles or plants"
)
PROHIBITED = [
    "protected characters/logos", "celebrity likeness", "existing slot symbol copies",
    "living-artist style imitation", "readable text", "child-appealing styling",
]
CLEANUP_SPRITE = [
    "chroma-key magenta tol 0.12", "despill edge pixels", "defringe 1-2 px",
    "alpha-threshold strays", "QA at 120px on playfield #1B1512 and on light backdrop",
]
CLEANUP_OPAQUE = ["level-check vs palette lock", "edge-crop check", "band QA at target layer depth"]

# per-category defaults: composition, camera, perspective, lighting, silhouette, negSpace, anim layers
CAT = {
    "symbol": dict(
        composition="Single centered emblem filling ~78-84% of canvas, self-contained in an implied rounded-square, visual weight biased slightly low for landing squash",
        cameraAngle="straight-on front view, 0 tilt",
        perspective="orthographic, zero foreshortening (all symbols share this camera)",
        lighting="candle key lower-left, moonlight rim upper-right per style anchor",
        silhouette="unique outline readable as solid black shape at 120px; no two symbols share a dominant silhouette family (style bible §7)",
        negSpace=">=10% clear margin all sides (win-frame glow + squash never clip)",
        anim=["base emblem", "emissive accent layer (win-state pulse)"],
    ),
    "background": dict(
        composition="Full-bleed environment band; horizon at 44% height; large calm value masses, lowest detail in the central grid third",
        cameraAngle="eye-level wide shot",
        perspective="single vanishing point; horizon 44% (identical across all environment layers)",
        lighting="candle pools as warm accents in bg-deep field; moonlight through leaded glass upper-right",
        silhouette="n/a (environment)",
        negSpace="central third low-frequency so the 6x5 cabinet reads",
        anim=["single parallax plate"],
    ),
    "feature_env": dict(
        composition="Environment band for its parallax depth; content density per layer index (0 = calmest); central third low-detail; top/bottom fade for stacking",
        cameraAngle="eye-level wide shot",
        perspective="single vanishing point; horizon 44%",
        lighting="tier accent tint on the rim per style bible §12 (feature amber / super verdigris / ultimate moon-violet)",
        silhouette="n/a (environment)",
        negSpace="central third low-frequency",
        anim=["single parallax plate"],
    ),
    "foreground": dict(
        composition="Near-field elements confined to the outer 16-20% side edges; center >=60% fully transparent; asymmetric balance",
        cameraAngle="eye-level, elements cropped by frame edges",
        perspective="consistent with 44% horizon",
        lighting="silhouetted against warmer mid layers; moonlight rim on top edges",
        silhouette="strong dark shapes; never overlap the cabinet",
        negSpace="center >=60% empty",
        anim=["single parallax plate (fastest scroll)"],
    ),
    "frame": dict(
        composition="Structural element exactly as purpose describes; inner openings fully transparent; ornament never intrudes into cells",
        cameraAngle="straight-on front view",
        perspective="orthographic",
        lighting="candle key lower-left; faint inner under-glow the engine brightens on wins",
        silhouette="clean rectilinear cabinet lines with brass filigree corners",
        negSpace="inner openings 100% clear",
        anim=["base plate", "glow accent layer"],
    ),
    "ui": dict(
        composition="Single control/panel centered with 6-8% margin; concentric or symmetric detail that survives states and rotation; NO baked text",
        cameraAngle="straight-on",
        perspective="orthographic, subtle top-light bevel implying relief",
        lighting="style-anchor key; specular ring upper-left; NO baked drop shadow (engine adds elevation)",
        silhouette="reads at 44px touch-target size",
        negSpace="6-8% margin",
        anim=["base plate", "state accent layer"],
    ),
    "vfx": dict(
        composition="Texture/sheet exactly as purpose describes; elements evenly spaced on transparent ground; no baked motion blur",
        cameraAngle="n/a (texture)",
        perspective="n/a",
        lighting="self-lit per element; palette-locked emissive hues",
        silhouette="each element crisp at 32-128px",
        negSpace="cell padding >=8% within sheets",
        anim=["particle texture (engine animates)"],
    ),
    "splash": dict(
        composition="Vertical thirds; key subject inside central 50% (portrait-crop safe); calm dark upper third reserved for the localized logo overlay; no baked title",
        cameraAngle="low hero angle, 8-12 degrees up",
        perspective="single vanishing point, monumental parlour scale",
        lighting="most dramatic of the package: candle floods lower half, moonlight shafts upper half",
        silhouette="n/a",
        negSpace="upper third calm",
        anim=["single plate"],
    ),
    "icon": dict(
        composition="Single instantly-readable motif filling ~85%; works at 64px",
        cameraAngle="straight-on", perspective="orthographic",
        lighting="high-contrast candle key", silhouette="reads at 64px",
        negSpace="8% margin", anim=["single plate"],
    ),
    "thumbnail": dict(
        composition="Hero motif left-weighted, calm right side for lobby text overlays; no baked text",
        cameraAngle="straight-on hero shot", perspective="slight dramatic tilt allowed",
        lighting="candle key + strong rim", silhouette="n/a",
        negSpace="right 30% calm", anim=["single plate"],
    ),
}

# targeted per-asset augmentations (subject detail beyond manifest purpose, aspect overrides)
EXTRA = {
    "img.symbol.mult": dict(materials="luminous chartreuse essence droplet in a tiny stoppered orb-vial, brass collar", palette="orb #A8C94E dominant, brass #A98546 collar"),
    "img.symbol.mult.plate": dict(materials="engraved brass value plate, empty center for engine-rendered numerals", palette="brass #A98546 + text bone-cream #E9E0CB frame only"),
    "img.symbol.scatter": dict(materials="wax seal in mulberry with the parlour's black-flower sigil, pressed paper edge", palette="scatter #8C2E52 dominant"),
    "img.symbol.fx1": dict(materials="clear vial with sharp triangular prism stopper refracting moon-violet light", palette="tier-ultimate #9B7BC4 + moonlight #B9C7D9; the set's only angular-apex silhouette"),
    "img.ui.btn_spin.normal": dict(palette="action venom-amber #D98E2B face (RESERVED interactive hue), brass rim"),
    "img.winplate.max": dict(palette="win candle-gold #EFC75E flooded with tier-ultimate #9B7BC4 caustics; overflowing-vial motif"),
    "img.vfx.shard": dict(composition_override="4x4 grid of 16 distinct glass-shard shapes on transparent ground, each cell 256px"),
}

manifest = json.loads((GAME / "config" / "asset-manifest.json").read_text(encoding="utf-8"))
assets = manifest if isinstance(manifest, list) else manifest.get("assets") or manifest["artifacts"]

prompts = []
for a in assets:
    cat = a["category"]
    d = CAT.get(cat, CAT["ui"])
    ex = EXTRA.get(a["assetId"], {})
    res = a.get("resolution") or {"w": 1024, "h": 1024}
    w, h = res["w"], res["h"]
    from math import gcd

    g = gcd(w, h)
    aspect = f"{w // g}:{h // g}"
    tier_hint = ""
    for tier, hexv in (("feature", "#C98F3D"), ("super_feature", "#4E8A6A"), ("ultimate_feature", "#9B7BC4")):
        if f".{tier}." in a["assetId"] or f"-{tier.replace('_','-')}-" in a["file"]:
            tier_hint = f" Tier accent: {tier} {hexv}."
    prompts.append(
        {
            "assetId": a["assetId"],
            "category": cat,
            "purpose": a["purpose"],
            "subject": a["purpose"] + (" — " + ex["materials"] if "materials" in ex else ""),
            "composition": ex.get("composition_override", d["composition"]),
            "cameraAngle": d["cameraAngle"],
            "perspective": d["perspective"],
            "lighting": d["lighting"] + tier_hint,
            "materials": ex.get("materials", "poison glass, tarnished brass, dark walnut per style anchor"),
            "paletteRole": ex.get("palette", "palette lock hues appropriate to the subject; interactive venom-amber #D98E2B FORBIDDEN unless this is an interactive control"),
            "silhouetteRequirement": d["silhouette"],
            "mobileReadabilityRequirement": "reads in <0.5s at 120x120px on playfield #1B1512; max 3 focal details; min stroke 2px at 120px" if cat == "symbol" else "n/a at asset level; layout spec governs",
            "negativeSpace": d["negSpace"],
            "transparency": "magenta-key" if a.get("transparent") else "opaque",
            "resolution": f"{w}x{h}",
            "aspectRatio": aspect,
            "animationLayerRequirements": d["anim"],
            "consistencyReference": "img.symbol.h1 (hero — generate FIRST, then edit-image derivatives per style bible §18)" if a["assetId"] != "img.symbol.h1" else "HERO ASSET — master consistency reference for the whole set",
            "negativePrompt": "<negativeBase>" + (", numerals, letters" if "plate" in a["assetId"] or "winplate" in a["assetId"] or cat in ("splash", "thumbnail") else ""),
            "prohibitedContent": PROHIBITED,
            "manualCleanup": CLEANUP_SPRITE if a.get("transparent") else CLEANUP_OPAQUE,
            "exportFormat": "png (source of truth) -> WebP transport / atlas per pipeline",
            "fileName": a["file"],
            "provenance": {
                "generator": "imagegen-mcp",
                "model": "<record at generation>",
                "seed": "<record>",
                "generatedAt": "<record>",
                "license": "generated in-run; original work, no third-party IP",
            },
        }
    )

out = {
    "gameId": "belladonna-parlour",
    "generator": "single-modern-slot-creator v1.0.0 (programmatic assembly — build_art_prompts.py)",
    "styleAnchor": STYLE_ANCHOR,
    "paletteLock": PALETTE_LOCK,
    "negativeBase": NEGATIVE_BASE,
    "generationNotes": [
        "Prepend styleAnchor + paletteLock to every rendered prompt; expand <negativeBase>.",
        "Wave order per style bible §18: hero img.symbol.h1 first -> symbols -> environments -> frame/UI -> vfx/meta.",
        "Batch each wave through ONE mcp__imagegen__generate_images call; transparent:true for magenta-key sprites.",
        "Sprites: post-process per manualCleanup; record model/seed/date into config/asset-manifest.json provenance.",
    ],
    "prompts": prompts,
}
dest = GAME / "prompts" / "art-prompts.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, indent=1), encoding="utf-8")
print(f"wrote {dest} with {len(prompts)} prompt objects (assets in manifest: {len(assets)})")
missing = [a["assetId"] for a in assets] != [p["assetId"] for p in prompts]
print("coverage: 1:1 with manifest" if not missing else "COVERAGE MISMATCH")
