"""Generate prompts/art-prompts.json — full-field prompt register for every
asset in config/asset-manifest.json (gate G9 coverage rule).

Category templates supply the mechanical fields; SUBJECTS supplies the
creative content per asset. Style anchor / palette lock / negative anchor come
from docs/art-style-bible.md §17 (duplicated here verbatim — the bible is the
source of truth; step-13 lint greps for drift).

    cd games/belladonna-parlour/math
    uv run python ../math-config/generate_art_prompts.py
"""

import json
import sys
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
    "PALETTE LOCK: bg-deep #120D16, bg-mid #241B2F, playfield #1B1512, primary "
    "brass #A98546, secondary walnut #5C4634, action venom-amber #D98E2B "
    "(reserved: interactive elements ONLY), win candle-gold #EFC75E, danger "
    "oxblood #B3402E, text bone-cream #E9E0CB, scatter wax-mulberry #8C2E52, "
    "orb essence #A8C94E, poison green #74A12E, belladonna violet #6C4E91, "
    "moonlight #B9C7D9, tier-feature amber #C98F3D, tier-super verdigris "
    "#4E8A6A, tier-ultimate moon-violet #9B7BC4. Use ONLY these hues plus "
    "neutral shades derived from them; no off-palette colours. Magenta and "
    "hot-pink are banned from all art (keying colour)."
)
NEGATIVE_ANCHOR = (
    "photorealism, watermark, signature, readable text, letters, numerals, "
    "off-palette colours, candy-bright gradients, deity or mascot characters, "
    "child-appealing styling, existing slot-game lookalikes, protected "
    "characters or logos, celebrity likeness, magenta or hot-pink pigment, "
    "soft feathered glow halo, baked drop shadow, border"
)
PROHIBITED = [
    "protected characters/logos", "celebrity likeness",
    "existing slot symbol copies", "living-artist style imitation",
    "readable text of any kind", "child-appealing mascots",
    "candy-gradient trade dress", "deity-portrait composition",
]
CLEANUP_SPRITE = [
    "chroma-key magenta tol 0.12", "despill edge pixels", "defringe 1-2 px",
    "alpha-threshold strays", "QA at 200-400% zoom on light+dark backdrops",
]
CLEANUP_OPAQUE = ["colour-grade to palette lock", "QA seams at layer boundaries"]

# assetId -> (subject, composition, paletteRole, animLayers, extraNegative)
S = {
    "img.symbol.h1": ("Teardrop amethyst bottle 'Belladonna Philtre': a silver belladonna blossom suspended in violet liquid, ornate brass collar and tiny chain", "single centered emblem filling ~82% of canvas, weight biased slightly low for landing squash", "belladonna violet #6C4E91 body, brass #A98546 collar, moonlight rim", ["base bottle", "inner blossom (separate emissive layer for win pulse)"], "perfume advert look"),
    "img.symbol.h2": ("Coiled-serpent emerald flask 'Serpent's Emerald': green glass coiled like a serpent, a venom drop forming at the fang-shaped spout", "centered emblem ~80%, coil spiral leading eye to the drop", "poison green #74A12E glass, brass base", ["flask", "venom drop (win-state drip layer)"], "realistic snake, scales close-up"),
    "img.symbol.h3": ("Hexagonal amber tincture jar 'Widow's Amber': a beetle silhouette sealed inside amber liquid, black lace band at the neck", "centered emblem ~78%, strong hexagonal silhouette", "tier-feature amber #C98F3D, walnut lid", ["jar", "inner beetle (parallax micro-layer)"], "insect horror, photoreal beetle"),
    "img.symbol.h4": ("Teal phial 'Moth-Wing Tonic': slender phial with two iridescent moth wings suspended, cork pinned like a specimen", "centered emblem ~76%, vertical slender silhouette", "moonlight #B9C7D9 + verdigris #4E8A6A accents", ["phial", "wings (flutter layer)"], "butterfly cartoon"),
    "img.symbol.l1": ("Mandrake root bundle tied with twine, faintly humanoid root shape", "centered ~72%, chunky organic silhouette", "walnut #5C4634 + bone-cream ties", ["single sprite"], "screaming mandrake face, fantasy meme"),
    "img.symbol.l2": ("Trio of dried nightcap mushrooms strung on a cord", "centered ~72%, three-lobed silhouette", "bg-mid purple-browns + bone-cream cord", ["single sprite"], "cute mushroom faces"),
    "img.symbol.l3": ("Black lotus seed pod, cracked open showing dark seeds", "centered ~70%, round pod silhouette", "bg-deep + poison green sheen", ["single sprite"], "lotus flower bloom"),
    "img.symbol.l4": ("Mulberry wax seal with abstract flourish sigil on folded parchment corner and twine", "centered ~70%, disc silhouette", "wax-mulberry #8C2E52 + bone-cream parchment", ["single sprite"], "letters, monograms, legible sigils"),
    "img.symbol.l5": ("Dried foxglove sprig pressed flat, three bell blossoms", "centered ~70%, sprig silhouette", "belladonna violet muted + walnut stem", ["single sprite"], "fresh flowers, bright bouquet"),
    "img.symbol.scatter": ("The Parlour Seal: round brass-and-wax medallion, belladonna flower sigil inlay, cooling channels etched in the rim", "centered medallion ~80%, strong radial symmetry (rotates during anticipation)", "wax-mulberry #8C2E52 disc + brass #A98546 sigil; candle-gold reserved for landed state", ["medallion", "sigil glow (anticipation layer)"], "zodiac signs, runes from known fiction, religious symbols"),
    "img.symbol.mult": ("Essence Orb: a luminous chartreuse droplet sealed in a small glass sphere held by a three-point brass cradle, clear plate area below for the engine-rendered value", "centered orb ~76%, plate zone lower 25% kept visually calm", "orb essence #A8C94E core, brass cradle", ["orb", "core glow (value-tier pulse layer)", "cradle"], "planet, eyeball, lens flare"),
    "img.symbol.mult.plate": ("Small rectangular brass value plate with rolled edges and rivets, empty center for engine-rendered numerals", "horizontal plate filling ~90%, perfectly symmetric, EMPTY center", "brass #A98546 + walnut backing", ["single sprite"], "any digits or lettering"),
    "img.symbol.fx1": ("The Prisming Vial: a crystal prism-cut vial splitting a moonbeam into a soft in-palette spectrum fan", "centered ~80%, prism fan upward-right, vertical crystal silhouette", "moon-violet #9B7BC4 + moonlight #B9C7D9; spectrum stays within palette hues", ["vial", "spectrum fan (prisming burst layer)"], "rainbow flag saturation, disco ball"),
    "img.env.base.layer0": ("Deep parlour interior: floor-to-ceiling apothecary cabinets fading into shadow, tall leaded window with midnight rain, distant counter candles", "full-bleed opaque backdrop, horizon 44%, calm value masses, lowest detail; central third quiet for the cabinet frame", "bg-deep #120D16 dominant, bg-mid forms, candle accents <=8%", ["opaque layer"], "people, faces, machinery"),
    "img.env.base.layer1": ("Mid-distance counter band: brass scales, bottle clusters, ledger and quill, mortar and pestle along a walnut counter", "horizontal band middle 55%, edges fade to transparent, central third low-detail", "walnut + brass, candle-gold accents <=12%", ["transparent band layer"], "readable ledger text"),
    "img.env.base.layer2": ("Near shelf props: hanging dried herb bundles and two brass lamps entering from top corners only", "content confined to top 25% and outer 15% edges, center fully transparent", "walnut silhouettes + moonlight rims", ["transparent near layer"], "centered objects"),
    "img.env.base.layer3": ("Foreground vignette: velvet curtain edge left, cabinet corner right, soft depth blur", "outer 12% each side only, center 76% fully transparent, asymmetric left-heavy", "bg-deep silhouettes, oxblood velvet hint", ["transparent foreground layer"], "objects inside central 76%"),
    "img.env.feature.layer0": ("The Tasting back parlour: intimate velvet-draped room, round tasting table, many candles, curtain rail behind", "full-bleed opaque, horizon 44%, warmer key than base, tier-feature amber grade", "tier-feature amber #C98F3D grade over walnut", ["opaque layer"], "people, faces"),
    "img.env.feature.layer1": ("Tasting table band: poured tasting cups, decanters, dripping candle cluster", "horizontal band middle 50%, edge fade, low-detail center", "amber + brass, candle-gold accents", ["transparent band layer"], "hands"),
    "img.env.feature.layer2": ("Foreground velvet curtain edges parted left and right", "outer 14% each side, center transparent", "oxblood + walnut silhouettes", ["transparent foreground layer"], "centered objects"),
    "img.env.super_feature.layer0": ("The Distillery cellar: copper stills and coiled pipes under vaulted stone, green glass carboys glowing, steam wisps", "full-bleed opaque, horizon 44%, verdigris grade, dramatic pools of light", "tier-super verdigris #4E8A6A + copper-brass", ["opaque layer"], "industrial factory look"),
    "img.env.super_feature.layer1": ("Mid band of still-pipes, pressure dials and dripping condensers", "horizontal band middle 55%, edge fade, central third calm", "verdigris + brass, poison-green glow accents", ["transparent band layer"], "readable gauge numerals"),
    "img.env.super_feature.layer2": ("Foreground barrel silhouette left, pipe column right, steam curl top corners", "outer 15% edges + top 20%, center transparent", "bg-deep silhouettes + verdigris rims", ["transparent foreground layer"], "centered steam"),
    "img.env.ultimate_feature.layer0": ("The Night Garden conservatory: moonlit glass-and-iron roof, blooming belladonna beds, mist over a reflecting pool", "full-bleed opaque, horizon 44%, coldest palette, moon shafts through glass", "moon-violet #9B7BC4 + moonlight #B9C7D9 over bg-deep", ["opaque layer"], "daylight, sun"),
    "img.env.ultimate_feature.layer1": ("Band of hanging crystal prisms on brass chains catching moonlight", "horizontal band upper-middle 40%, edge fade, prisms spaced rhythmically", "moonlight + moon-violet, tiny in-palette spectra", ["transparent band layer"], "chandeliers, rainbows"),
    "img.env.ultimate_feature.layer2": ("Mid band of belladonna vines and night blooms climbing iron ribs", "horizontal band middle 45%, central third calm", "belladonna violet + poison green foliage", ["transparent band layer"], "roses, generic flowers"),
    "img.env.ultimate_feature.layer3": ("Foreground conservatory glazing bars and leaf clusters at edges, dew on glass", "outer 12% edges + top 15%, center transparent", "iron-walnut silhouettes + moonlight rims", ["transparent foreground layer"], "center content"),
    "img.frame.reel": ("The apothecary cabinet face: 6x5 arrangement of open display niches in dark walnut with brass edging, subtle candle underglow along the inner sills", "hollow rectangular cabinet; inner opening exactly 6:5 fully transparent; frame thickness ~7% per side", "walnut #5C4634 structure, brass #A98546 edging, playfield #1B1512 sills", ["cabinet frame", "sill glow strip (win-state layer)"], "ornate baroque gold frame, jewels"),
    "img.frame.cell": ("A single empty cabinet niche: shallow walnut recess with brass corner pins", "full-bleed single cell, subtle inner shadow, perfectly tileable", "playfield #1B1512 + walnut edges", ["single sprite"], "strong vignette"),
    "img.frame.cell_win": ("The same niche lit by candle-gold underglow from the sill", "identical geometry to the base cell, glow contained inside", "candle-gold #EFC75E glow over playfield", ["single sprite"], "different geometry from base cell"),
    "img.ui.hud_vial": ("The Master Vial HUD element: tall graduated glass vessel in a brass stand, luminous essence fill visible, graduation marks as ticks (no numerals)", "vertical element ~85% height, fill area clearly separable, tick marks abstract", "orb essence #A8C94E fill, brass stand, bone-cream ticks", ["vessel", "fill (engine-scaled layer)", "glow"], "numerals on graduations"),
    "img.ui.hud_dial": ("Distillery pressure dial: brass gauge with abstract tick arc and verdigris needle (no numerals)", "circular dial centered ~88%, needle at 8 o'clock", "brass + verdigris needle", ["dial face", "needle (rotating layer)"], "readable numbers"),
    "img.ui.hud_prismrail": ("Prism rail: horizontal brass rail holding five small crystal prisms, sockets clearly separable", "horizontal strip, five evenly spaced sockets, ends finialed", "brass rail + moon-violet prisms", ["rail", "per-prism lit variants"], "text"),
    "img.ui.btn_spin.normal": ("Circular brass bellows-stopper button with a swirl-of-essence glyph embossed on a venom-amber glass face", "perfect circle ~88%, concentric detail only (survives rotation), no text", "action venom-amber #D98E2B face (reserved hue), brass rim", ["button base", "glyph (state overlay)"], "letters, arrows"),
    "img.ui.btn_stop": ("Square wax-stamp button: mulberry wax face with abstract stop-sigil, brass frame", "rounded square ~84%, bold single glyph", "wax-mulberry face, brass frame", ["single sprite"], "octagon traffic sign"),
    "img.ui.btn_autoplay": ("Brass hourglass button: small hourglass emblem on walnut roundel", "circle ~84%, hourglass centered", "brass + walnut", ["single sprite"], "clock faces with numbers"),
    "img.ui.btn_bet": ("Balance-scale button: tiny brass scale with two weights on walnut roundel", "circle ~84%", "brass + walnut", ["single sprite"], "currency symbols"),
    "img.ui.btn_buy": ("Ornate brass key button on oxblood roundel (unlocks the chambers)", "circle ~84%, key diagonal", "brass key, oxblood field", ["single sprite"], "padlocks with keyholes reading as security icons"),
    "img.ui.btn_ante": ("Raised goblet button: small lifted tasting-goblet emblem on verdigris roundel", "circle ~84%", "brass goblet, verdigris field", ["single sprite"], "wine branding"),
    "img.ui.btn_settings": ("Mortar-and-pestle button on walnut roundel", "circle ~84%", "bone-cream mortar, walnut field", ["single sprite"], "gear icons"),
    "img.ui.ind_spinmode": ("Spin-mode indicator: three candles of increasing lean/flame (calm, brisk, racing)", "horizontal strip, three clearly separable candle states", "candle-gold flames, brass holders", ["three state variants in one sheet"], "text labels"),
    "img.ui.panel_hud": ("HUD tray: low walnut tray with brass inlay line, subtle parchment inset zones for engine text", "horizontal panel, calm surfaces, clear inset zones", "walnut + brass line, parchment insets", ["9-slice safe"], "baked labels"),
    "img.ui.panel_overlay": ("Overlay panel: parchment ledger page mounted on walnut board with brass corners", "vertical panel, generous empty parchment field", "parchment bone-cream + walnut + brass", ["9-slice safe"], "handwriting, text"),
    "img.winplate.big": ("BIG win plate: blown-glass ribbon flourish over a brass bar, ember-like candle sparks — abstract celebratory shapes only, empty lower zone for the engine numeral", "horizontal 2:1 plate, flourish centered, lower third calm and empty", "candle-gold + amber, brass bar", ["plate", "spark layer"], "words, letters, coins"),
    "img.winplate.mega": ("MEGA win plate: doubled glass ribbons with poured-essence arcs, denser sparks", "as big-plate with taller flourish, lower third empty", "candle-gold + poison green arcs", ["plate", "spark layer"], "words"),
    "img.winplate.epic": ("EPIC win plate: triple ribbon vortex with prism glints, richest of the set", "vertical energy, still leaves lower third empty", "candle-gold + moon-violet glints", ["plate", "spark layer"], "words"),
    "img.winplate.max": ("MAX WIN plate: the Master Vial overflowing, essence flooding over brass, house lights blazing", "vial centerpiece, radial overflow, lower third empty", "full warm palette, essence + candle-gold dominant", ["plate", "overflow layer"], "words"),
    "img.ui.buymenu": ("The Chamber Doors buy screen: three arched doors side by side — velvet parlour door (amber), iron cellar door (verdigris), glass conservatory door (moon-violet), each with an empty brass price plaque", "three equal vertical door panels, plaques empty for engine text, calm header zone", "tier hues per door over bg-deep", ["three door panels separable"], "text on plaques"),
    "img.meta.splash": ("Splash: the parlour shopfront at midnight in the rain — glowing mullioned window full of bottles, brass sign bracket with an EMPTY hanging sign, wet cobbles reflecting candlelight; calm dark upper third reserved for the logo", "16:9, vertical thirds, key elements in central 50% (safe portrait crop), sign deliberately blank", "bg-deep night + candle-gold window + moonlight rain", ["opaque"], "any signage text, people"),
    "img.meta.icon": ("Game icon: the H1 amethyst Belladonna Philtre emblem tight-cropped on bg-deep rounded square", "single bottle filling ~85%, instantly readable at 64px", "belladonna violet + brass on bg-deep", ["opaque"], "text"),
    "img.meta.thumbnail": ("Thumbnail: master vial and three potion bottles arranged on the parlour counter, candle-lit, upper-left quiet zone for logo overlay", "16:9, subjects right-of-center, quiet upper-left", "full palette, warm key", ["opaque"], "text"),
    "img.vfx.shard": ("Glass shard sprite sheet: 8 distinct poison-glass shards in a 4x2 grid, crisp edges, faint inner glow", "8 cells, each shard centered in its cell, generous spacing", "mixed glass hues per palette, subtle essence glow", ["8-cell sheet"], "overlapping shards"),
    "img.vfx.essence": ("Essence stream blob: a single luminous chartreuse liquid streak with tapered tail, additive-blend friendly", "single element centered, soft core hard silhouette", "orb essence #A8C94E", ["single sprite"], "smoke, fire"),
    "img.vfx.prism": ("Prism caustic star: crossed light caustic with tiny in-palette spectral fringes", "single element centered ~80%", "moonlight + moon-violet fringes", ["single sprite"], "lens flare rings"),
    "img.vfx.mote": ("Dust mote / candle spark: tiny soft glowing dot with faint tail", "single small element centered", "candle-gold", ["single sprite"], "bokeh discs"),
    "img.vfx.petal": ("Belladonna petal: single dark violet petal, slight curl", "single element centered ~70%", "belladonna violet, moonlight rim", ["single sprite"], "cherry blossom"),
}

CATEGORY = {
    "symbol": dict(cameraAngle="straight-on front view, 0 tilt", perspective="orthographic, zero foreshortening (all symbols share this camera)",
                   silhouette="unique outline readable as a solid black shape at 120 px; no other symbol shares this silhouette class",
                   readability="reads in <0.5 s at 120x120 px on the playfield colour; max 3 focal details; min stroke 2 px at 120 px",
                   negativeSpace=">=10% transparent margin on all sides (win-frame glow + landing squash never clip)"),
    "background": dict(cameraAngle="eye-level wide shot", perspective="single vanishing point, horizon at 44% height (identical across ALL environment layers)",
                       silhouette="n/a (environment)", readability="value structure readable at 25% scale", negativeSpace="per composition field"),
    "feature_env": dict(cameraAngle="eye-level wide shot", perspective="single vanishing point, horizon at 44% height",
                        silhouette="n/a (environment)", readability="value structure readable at 25% scale", negativeSpace="per composition field"),
    "foreground": dict(cameraAngle="eye-level, elements cropped by frame edges", perspective="consistent with the 44% horizon",
                       silhouette="edge silhouettes only", readability="never competes with the grid", negativeSpace="center transparency per composition"),
    "frame": dict(cameraAngle="straight-on front view", perspective="orthographic",
                  silhouette="structural", readability="inner opening boundaries crisp at 100%", negativeSpace="inner opening fully transparent"),
    "ui": dict(cameraAngle="straight-on", perspective="orthographic, subtle 2 px top-light bevel",
               silhouette="glyph readable as solid shape at 44 px", readability="reads at 44x44 px touch size; zero text baked",
               negativeSpace=">=6% transparent margin"),
    "vfx": dict(cameraAngle="straight-on", perspective="flat",
                silhouette="single-element silhouette, additive-blend friendly", readability="reads at 32 px", negativeSpace="generous transparent surround"),
    "splash": dict(cameraAngle="low hero angle", perspective="single vanishing point",
                   silhouette="n/a", readability="key elements inside central 50% (portrait crop safe)", negativeSpace="logo zone kept calm"),
    "icon": dict(cameraAngle="straight-on", perspective="orthographic", silhouette="reads at 64 px", readability="reads at 64 px", negativeSpace="8% margin"),
    "thumbnail": dict(cameraAngle="three-quarter still-life", perspective="shallow", silhouette="n/a", readability="reads at 25% scale", negativeSpace="quiet logo zone upper-left"),
}


def main() -> None:
    manifest = json.load(open(GAME / "config" / "asset-manifest.json", encoding="utf-8"))
    assets = manifest if isinstance(manifest, list) else manifest["assets"]
    missing = [a["assetId"] for a in assets if a["assetId"] not in S]
    if missing:
        print("SUBJECTS missing for:", missing)
        sys.exit(1)

    prompts = []
    for a in assets:
        aid = a["assetId"]
        subj, comp, palette_role, layers, extra_neg = S[aid]
        cat = a["category"] if a["category"] in CATEGORY else (
            "ui" if a["category"] in ("icon",) else "background")
        c = CATEGORY.get(a["category"], CATEGORY["ui"])
        transparent = bool(a.get("transparent"))
        prompts.append({
            "assetId": aid,
            "assetCategory": a["category"],
            "purpose": a.get("purpose", subj[:80]),
            "subject": subj,
            "composition": comp,
            "cameraAngle": c["cameraAngle"],
            "perspective": c["perspective"],
            "lighting": "warm candle key lower-left, cold moonlight rim upper-right (style anchor); tier grade per palette role",
            "materials": "poison glass / tarnished brass / dark walnut family per subject",
            "paletteRole": palette_role,
            "silhouetteRequirement": c["silhouette"],
            "mobileReadabilityRequirement": c["readability"],
            "negativeSpace": c["negativeSpace"],
            "transparency": "magenta-key" if transparent else "opaque",
            "resolution": f"{a['resolution']['w']}x{a['resolution']['h']}",
            "aspectRatio": f"{a['resolution']['w']}:{a['resolution']['h']}",
            "animationLayerRequirements": layers,
            "consistencyReference": ("hero asset — generate FIRST" if aid == "img.symbol.h1"
                                      else "derive style from img.symbol.h1 via edit-image with the hero as source"),
            "negativePrompt": f"<negativeAnchor> + {extra_neg}",
            "prohibitedContent": PROHIBITED,
            "manualCleanup": CLEANUP_SPRITE if transparent else CLEANUP_OPAQUE,
            "exportFormat": "png (source of truth) -> WebP transport -> atlas per atlasGroup",
            "fileName": a["file"],
            "provenance": {
                "generator": "imagegen-mcp",
                "model": "<record at generation>",
                "seed": "<record>",
                "generatedAt": "<record>",
                "license": "generated in-run; original work, no third-party IP",
            },
        })

    out = {
        "gameId": "belladonna-parlour",
        "styleAnchor": STYLE_ANCHOR,
        "paletteLock": PALETTE_LOCK,
        "negativeAnchor": NEGATIVE_ANCHOR,
        "renderRule": "final prompt = styleAnchor + ' SUBJECT: '+subject + ' COMPOSITION: '+composition + camera/lighting/materials/palette fields + ' AVOID: '+negativeAnchor+extra; sprites use transparent:true (magenta key)",
        "generationWaves": [
            "wave 1: img.symbol.h1 (hero) -> human QA",
            "wave 2: remaining symbols (consistency ref = hero)",
            "wave 3: environments per tier", "wave 4: frame + UI kit",
            "wave 5: winplates, buy menu, meta, VFX",
        ],
        "prompts": prompts,
    }
    dest = GAME / "prompts" / "art-prompts.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=1), encoding="utf-8")
    print(f"wrote {dest} with {len(prompts)} prompts covering {len(assets)} assets")


if __name__ == "__main__":
    main()
