# Step 9 — Art Generation (image-gen MCP + Blender)

Role: `agents/creative-director.md` · Gate: **G9** (SKILL.md: "`prompts/art-prompts.json`
covers every entry in `config/asset-manifest.json`; each prompt carries the full field
set from `prompts/art-generation.md`; generation attempted via MCP tools when available;
every generated magenta-key asset post-processed through `tools/sprite-forge` (its
`pipeline-meta.json` kept as QC evidence); provenance recorded per asset")

## Objective

Turn the approved concept (step 3), mechanics (step 4), UI spec (step 7), and motion
spec (step 8) into: a completed art style bible, a complete `config/asset-manifest.json`,
one fully-specified prompt object per asset in `prompts/art-prompts.json`, generated art
under `assets/art/` when the imagegen MCP tools are present, Blender recipes mirrored as
headless scripts under `prompts/blender/`, and post-processed, atlas-planned, provenance-
tracked deliverables. Everything visual the client renders traces back to this step.

## Read first

1. `CONVENTIONS.md` §2–§3 (layouts), §4 (ids), §8 (tool bindings — binding), §9.7/§9.10
   (accessibility, originality), §10 (naming).
2. `templates/art-style-bible.md` — you will fill EVERY section; §17 defines the anchor
   strings this file requires, §19 the prompt field checklist.
3. `research/10-art-pipeline.md` — the authority for every technique below (silhouette
   gates, magenta keying, Blender recipes, atlasing, compression, provenance/legal).
4. `research/16-ip-risk-register.md` §3 — prohibited references; seed every prompt's
   `prohibitedContent`.
5. `schemas/asset-manifest.schema.json` — `config/asset-manifest.json` must validate.
6. `docs/game-design-document.md` §1–§4 (theme, symbol set), the UI spec from step 7
   (screens, controls, states), and `docs/motion-specification.md` (which assets need
   animation layers, sprite sheets, or normal maps).
7. `tools/sprite-forge/NOTICE.md` (the deterministic post-processor this step uses)
   and, before authoring any multi-frame sheet prompt,
   `tools/sprite-forge/references/prompt-rules.md` + `references/modes.md` — grid
   shape, containment, and centering rules that make sheets machine-splittable.

## Procedure

### 1. Style bible first — nothing generates before it exists

Fill `docs/art-style-bible.md` from `templates/art-style-bible.md`, every section, no
`{{placeholder}}` left. Then lock the three anchor strings (template §17):

- **STYLE ANCHOR** — one reusable string of **40–80 words** that is prepended VERBATIM
  to every image prompt in this game. It must lock, in this order: theme sentence,
  mood keywords, shape language, the 2–3 named materials, the global lighting rule
  (key direction + rim colour), camera rule (symbols orthographic front-on;
  environments' stated horizon), and rendering finish (e.g. "painterly 2.5D game art,
  crisp edges, no photorealism"). Version it: `STYLE ANCHOR [<slug> v<gameVersion>]: …`.
- **PALETTE LOCK** — the §6.1 role tokens with exact hex values
  (`bg-deep #0B1D2A, playfield #12303F, win #F2C14E, …`), appended to every prompt
  after the anchor, closing with "Use ONLY these hues plus neutral shades derived from
  them; no off-palette colours." Ban magenta/hot-pink from all sprite palettes here —
  it is the keying colour (research/10 §4.3).
- **NEGATIVE-PROMPT BASE** — the default `negativePrompt` every asset extends:
  `photorealism, watermark, signature, readable text, text artifacts, off-palette
  colours, existing slot-game lookalikes, protected characters or logos, celebrity
  likeness, magenta or hot-pink pigment, soft feathered glow halo, drop shadow, border`.

### 2. Asset manifest — enumerate EVERYTHING before prompting anything

Write `config/asset-manifest.json` (validate against `schemas/asset-manifest.schema.json`;
ids `img.*` per CONVENTIONS §10; every entry starts `status: "prompt-only"`). Required
inventory — adjust counts to the GDD but never below this floor:

| Group | Entries |
|---|---|
| Symbols | H1–H4 premiums (4) · L1–L4/L5 lows (4–5) · WILD · SCATTER · every feature-exclusive/mechanic symbol the GDD uses (FX*, MULT, CASH, COLLECT, MYSTERY, JP_*) — one `img.symbol.<id>` each, plus separate win-state layers where the motion spec demands them |
| Environments | 4 environments — base, `feature`, `super_feature`, `ultimate_feature` — EACH as **3–5 parallax layers** (`img.env.<tier>.layer<0..n>`: deep sky → mid → near → foreground occluder), alpha-edged except the deepest layer |
| Playfield | reel frame (`img.frame.reel`) · grid cell backing + highlight variants (`img.frame.cell`, `img.frame.cell_win`) |
| UI kit | spin button (all 10 states from step 7) · bet/menu/autoplay/turbo/sound/settings buttons · spin-mode indicators · HUD panels (9-slice) · paytable elements · feature HUD variants per tier |
| VFX | particle textures (3–5 families, grayscale-for-tint) · glows · trails · explosion/impact sheets · coin |
| Win presentation | win-tier typography plates for big/mega/epic/max (art plates only if the display font cannot carry it — prefer font + in-engine treatment, then mark the plates optional) |
| Marketing/meta | feature-buy screen art · game icon (1:1) · thumbnail (16:9) · splash/loading screen (+ portrait variant) |
| Characters | animation parts (head/torso/limbs/props per motion spec) — only if the GDD has characters |

Assign every entry its `atlasGroup` now (see step 6) and its `deviceVariants` plan.

### 3. Author one prompt object per asset — `prompts/art-prompts.json`

Structure: `{ "styleAnchor": "…", "paletteLock": "…", "negativeBase": "…",
"prompts": [ … ] }`. Every prompt object carries ALL 24 fields (template §19; mission
brief lines 1754–1802): `assetId`, `category`, `purpose`, `subject`, `composition`,
`cameraAngle`, `perspective`, `lighting`, `materials`, `paletteRole`,
`silhouetteRequirement`, `mobileReadabilityRequirement`, `negativeSpace`,
`transparency` (`magenta-key | api-alpha | opaque`), `resolution`, `aspectRatio`,
`animationLayerRequirements`, `consistencyReference`, `negativePrompt`,
`prohibitedContent`, `manualCleanup`, `exportFormat`, `fileName`, `provenance`.
The final rendered prompt string sent to the tool is always
`styleAnchor + subject/composition block + paletteLock + format constraints`.
An empty or "TBD" field fails G9. Three fully-worked examples to copy the register from
(illustrative theme "brass-and-jade deep-sea leviathan" — swap subjects for your game):

```json
{
  "assetId": "img.symbol.h1",
  "category": "symbol",
  "purpose": "H1 highest-paying premium symbol; base and all feature reel sets; master consistency reference for the whole set",
  "subject": "Ornate brass diving-helmet crowned with carved jade leviathan fins, single glowing porthole eye",
  "composition": "Single centered emblem filling ~82% of canvas, self-contained inside an implied rounded-square, weight biased slightly low for landing squash",
  "cameraAngle": "straight-on front view, 0 tilt",
  "perspective": "orthographic, zero foreshortening (all symbols identical camera)",
  "lighting": "key from upper-left at 35 degrees, warm; teal rim light from lower-right per style bible section 4",
  "materials": "aged brass with chipped verdigris, carved jade inlay, thick beveled edges",
  "paletteRole": "primary #C98A2D + secondary #1D7A6B on transparent; porthole uses win #F2C14E",
  "silhouetteRequirement": "unique helmet-with-fins outline, identifiable as solid black shape at 120 px; no other symbol shares a domed silhouette",
  "mobileReadabilityRequirement": "reads in <0.5 s at 120x120 px on playfield colour; max 3 focal details; min stroke 2 px at 120 px",
  "negativeSpace": ">=10% transparent margin on all sides so win-frame glow and squash never clip",
  "transparency": "magenta-key",
  "resolution": "1024x1024",
  "aspectRatio": "1:1",
  "animationLayerRequirements": ["base emblem", "porthole glow (separate emissive layer for win-state pulse)"],
  "consistencyReference": "hero asset — generated FIRST, wave 1; all later prompts reference img.symbol.h1",
  "negativePrompt": "<negativeBase> + human face, fish photograph",
  "prohibitedContent": ["protected characters/logos", "celebrity likeness", "existing slot symbol copies", "living-artist style", "readable text"],
  "manualCleanup": ["chroma-key magenta tol 0.12", "despill edge pixels", "defringe 1-2 px", "alpha-threshold strays", "QA on light+dark at 200-400% zoom"],
  "exportFormat": "png (source of truth) -> atlas base",
  "fileName": "symbol-h1.png",
  "provenance": { "generator": "imagegen-mcp", "model": "<record at generation>", "seed": "<record>", "generatedAt": "<record>", "license": "generated in-run; original work, no third-party IP" }
}
```

```json
{
  "assetId": "img.env.base.layer2",
  "category": "background",
  "purpose": "Base-game environment, mid-distance parallax layer (2 of 4): ruined brass observatory silhouettes",
  "subject": "Row of collapsed brass observatory domes and kelp-wrapped pillars in mid-distance haze, no floor, top and bottom fading to transparent",
  "composition": "Horizontal band occupying middle 55% of frame; strong left-right rhythm; central third kept low-detail because the reel frame overlays it",
  "cameraAngle": "eye-level wide shot",
  "perspective": "single vanishing point, horizon at 40% height (identical across ALL environment layers)",
  "lighting": "volumetric teal god-rays from upper-left, matching symbol key direction; values 15% darker than layer3 for depth separation",
  "materials": "silted brass, jade coral crusts, suspended particulate haze",
  "paletteRole": "bg-mid #143C4A dominant, primary #C98A2D accents <=10% area",
  "silhouetteRequirement": "layer reads as one clean value-band silhouette so parallax motion stays legible",
  "mobileReadabilityRequirement": "no detail that competes with symbols; contrast vs playfield stays below symbol contrast floor",
  "negativeSpace": "top 20% and bottom 15% fully transparent for layer blending",
  "transparency": "magenta-key",
  "resolution": "2048x1024",
  "aspectRatio": "2:1",
  "animationLayerRequirements": ["single flat layer; engine drives parallax at 0.5x camera factor"],
  "consistencyReference": "img.symbol.h1 (palette/lighting) + img.env.base.layer1 (horizon line)",
  "negativePrompt": "<negativeBase> + fish close-ups, focal characters, high-frequency texture in central third",
  "prohibitedContent": ["as base list"],
  "manualCleanup": ["key + despill + defringe", "verify edge fade to alpha 0", "band-value check against layers 1/3"],
  "exportFormat": "png -> webp (standalone, not atlased)",
  "fileName": "env-base-layer2.png",
  "provenance": { "generator": "imagegen-mcp", "model": "<record>", "seed": "<record>", "generatedAt": "<record>", "license": "generated in-run; original work" }
}
```

```json
{
  "assetId": "img.ui.btn_spin.normal",
  "category": "ui",
  "purpose": "Primary spin button, normal state (1 of 10 states per prompts/ui-ux.md); the most-touched control in the game",
  "subject": "Circular brass ship-telegraph dial button with jade ring inset and embossed anchor-glyph arrow, NO text",
  "composition": "Perfect circle centered, 6% transparent margin; glyph occupies central 45%; concentric detail only (survives rotation for the loading state)",
  "cameraAngle": "straight-on",
  "perspective": "orthographic, subtle 2px top-light bevel implying convexity",
  "lighting": "style-bible key; specular ring highlight upper-left; NO baked drop shadow (engine adds elevation)",
  "materials": "polished brass rim, deep jade enamel face (ui-chrome finish per style bible section 3)",
  "paletteRole": "action #E4572E face — reserved hue, appears on NO non-interactive art; primary #C98A2D rim",
  "silhouetteRequirement": "circle with anchor-glyph cutout distinct from every other control at 44 px",
  "mobileReadabilityRequirement": "legible at 44 px minimum; ships at >=88 px touch size; glyph stroke >=3 px at 88 px",
  "negativeSpace": "6% margin; glyph area must accept an in-engine icon swap (turbo/stop variants)",
  "transparency": "magenta-key",
  "resolution": "512x512",
  "aspectRatio": "1:1",
  "animationLayerRequirements": ["face", "rim (separate so pressed state can offset face -4 px)", "glow ring (emissive, off in normal state)"],
  "consistencyReference": "img.symbol.h1 via edit_image source_images; other 9 states derived from THIS file, never regenerated fresh",
  "negativePrompt": "<negativeBase> + text, letters, numbers, glassy iOS gloss",
  "prohibitedContent": ["as base list"],
  "manualCleanup": ["key + despill + defringe", "verify perfect-circle alpha", "9-slice N/A (circular); record insets null in manifest"],
  "exportFormat": "png -> atlas ui",
  "fileName": "ui-btn-spin-normal.png",
  "provenance": { "generator": "imagegen-mcp", "model": "<record>", "seed": "<record>", "generatedAt": "<record>", "license": "generated in-run; original work" }
}
```

### 4. Generate via the imagegen MCP tools

Availability check first. If `mcp__imagegen__*` tools are ABSENT: stop after step 3,
set every manifest entry `status: "prompt-only"`, note the tool absence in
`docs/validation-report.md`, and skip to step 5 (scripts are still written). Otherwise:

1. **Hero first.** `mcp__imagegen__generate_image` for `img.symbol.h1`. Iterate until
   it embodies the style bible; re-lock PALETTE hex values from the approved hero.
2. **Waves, one batched call each.** Batch ALL prompts of a wave into ONE
   `mcp__imagegen__generate_images` call (never sequential single calls):
   wave ② symbols (premiums, WILD, SCATTER, lows, mechanic symbols) → **consistency
   check** (place beside hero at grid scale; off-palette hue / lighting mismatch /
   shape break ⇒ regenerate the offender via `edit_image` before proceeding) →
   wave ③ environments (all 4 × parallax layers) + reel frame + cells → check →
   wave ④ UI kit + VFX + typography plates + icon/thumbnail/splash + feature-buy.
3. **Per-prompt options:** `transparent: true` for every sprite/cutout (symbols, UI,
   VFX, frame, non-deepest parallax layers) — this renders on **flat magenta** because
   the backing model cannot emit true alpha; the keying/cleanup in step 6 is therefore
   MANDATORY, not optional. Pass each asset's `aspectRatio`; `output_path` under
   `assets/art/raw/`.
4. **Derivatives via `edit_image`.** Style-consistent siblings (H2–H4 from H1, the 9
   remaining button states from the normal state, tier HUD variants, portrait splash)
   use `mcp__imagegen__edit_image` with the approved parent in `source_images` and a
   delta instruction — never a fresh text-only generation.
5. **Animated sheets (win-state symbol loops, VFX explosion/impact/coin sheets,
   character parts)** are generated as ONE multi-row grid per action family, per
   `tools/sprite-forge/references/prompt-rules.md`: 4 frames → 2x2, 6 → 2x3,
   8 → 2x4, 9 → 3x3 (never a raw 1xN strip for anything with a body/subject);
   solid `#FF00FF` background; subject centered in every cell inside the central
   ~65% safe area, consistent scale, nothing crossing cell edges. For drift-prone
   grids, pre-generate a geometry guide (`make_layout_guide.py`) or — for a symbol
   whose still already passed QC — an anchor sheet (`make_anchor_layout.py` from the
   approved still) and pass it via `edit_image` `source_images` with instructions to
   change only the poses and never reproduce guide boxes. If the client needs a
   strip or atlas, assemble it AFTER per-frame QC — never generate it raw.
6. Record actual model/seed/date into each prompt's `provenance` and the manifest
   entry (`status: "generated"`), including failed/retried generations.

### 5. Blender pipeline (3D where it beats 2D)

Use 3D when: (a) a hero symbol needs a **turntable spin animation** (win state);
(b) coins/gems need real specular behaviour across frames; (c) parallax depth layers
can come from ONE modeled scene with camera shift (guaranteed coherent perspective);
(d) symbols need **normal-map bakes** for in-engine Pixi lighting. Stay 2D for flat
lows, UI, and single-view art. Recipes (full parameters in `research/10` §5):

- **(a) Stylized symbol** — model + Eevee, orthographic camera, Film→Transparent,
  render 2048² then Lanczos-downscale to 1024² (cheap AA); shared light rig matching
  the style-bible key across ALL symbol renders.
- **(b) Turntable sprite sheet** — parent to rotating empty, 24–36 frames of yaw
  (10–15°/step), PNG frames → montage into a sheet + JSON frame map. Blender frames
  carry true alpha (no keying needed), but run the assembled sheet through the
  sprite-forge processor anyway for alignment/QC metadata and the `animation.gif`
  review artifact — same evidence trail as generated sheets.
- **(c) Parallax layers** — one scene, per-collection renders (or Cryptomatte masks),
  camera X-shift per layer export for correct parallax offsets.
- **(d) Normal + emission passes** — Cycles tangent-space bake (swizzle note: flip a
  channel if in-engine lighting inverts) + Emission pass as a separate glow layer;
  export `<name>_n.png` packed with identical atlas layout.

Execution rules: if `mcp__blender__*` is connected, drive it with
`mcp__blender__execute_blender_code` in SMALL IDEMPOTENT chunks (each re-runnable:
check-then-create by name, never blind-append), verifying visually after each stage via
`mcp__blender__get_screenshot_of_area_as_image` (VIEW_3D) or
`mcp__blender__render_thumbnail_to_path`. Whether or not MCP is connected, ALWAYS
mirror every recipe as a standalone parametric script in `prompts/blender/<purpose>.py`
(`turntable_symbol.py`, `bake_normals.py`, `emission_pass.py`, `parallax_layers.py`)
runnable via `blender --background <file.blend> --python <script.py> -- <args>`
(args read after `--`; note in each script's docstring that argument ORDER matters).

### 6. Post-processing, packing, export, provenance

1. **Alpha keying + sheet processing (every `transparency: magenta-key` asset):**
   run the vendored deterministic processor — NEVER ad-hoc keying code:

   ```bash
   # single still (symbols, UI, frame, parallax layers)
   uv run --project <skill-root>/tools/sprite-forge \
     python <skill-root>/tools/sprite-forge/generate2dsprite.py process \
     --input assets/art/raw/<file>.png \
     --target asset --mode single --rows 1 --cols 1 \
     --output-dir assets/art/processed/<assetId>/ \
     --cell-size <resolution> --component-mode all --strict-qc

   # animated sheet (VFX, win-state loops) — rows/cols match the generated grid;
   # valid --target: asset|creature|npc|player; VFX use --target asset with
   # --mode fx|impact|explode|projectile
   … --target asset --mode <action> --rows 2 --cols 2 --component-mode all \
     --shared-scale --strict-qc
   ```

   It performs the full chain (chroma-key `#FF00FF` → despill → defringe →
   component filtering → trim/scale/align) and emits per-frame PNGs,
   `sheet-transparent.png`, `animation.gif` (sheets), and `pipeline-meta.json` —
   keep that meta file next to the asset as G9 QC evidence. Then QA visually
   against light AND dark backdrops at 200–400% zoom; reject any sheet whose QC
   reports edge-touched, clamped, or empty frames (regenerate the raw sheet rather
   than loosening thresholds). Use `--component-mode largest` when detached
   specks must be dropped; keep `all` for multi-part FX. Set `status: "cleaned"`.
2. **Atlas packing:** free-tex-packer-core via a bun script (`bun x`); padding 2,
   extrude 1, allowRotation + detectIdentical + trim on; power-of-two, ≤ 2048².
   Partition by load phase so features lazy-load — `atlasGroup` values:
   `preload` (loading screen + minimal UI), `base` (symbols + frame + base UI),
   `feature` / `super-feature` / `ultimate-feature` (tier-exclusive art),
   `celebrations` (big-win plates + VFX). Backgrounds/splash stay standalone
   (`atlasGroup: null`). Store 9-slice insets in the manifest (the free packer does
   not emit them). Set `status: "atlased"`.
3. **Export matrix:** PNG stays the archival source of truth in `assets/art/`
   (CONVENTIONS §3). Ship: WebP (AVIF optionally, where the build tool supports it)
   for full-screen singles (backgrounds, splash — download-size tools only); note in
   the manifest that KTX2 (ETC1S bulk sprites / UASTC hero+UI+normals) is the GPU-
   memory upgrade path the client's Pixi manifest variant arrays support — emit
   variants if tooling is available, else record it in `docs/known-limitations.md`.
4. **Device-profile variants:** author @2x masters; emit @1x and @0.5x atlas variants
   mapped to `config/device-profiles.json` profiles in each entry's `deviceVariants`.
5. **Provenance (per asset, in the manifest — required for G14 and IP review):**
   generator (`imagegen-mcp | blender | manual | external`), full prompt or script
   pointer, seed/model when exposed, `generatedAt` ISO timestamp, source files,
   license note, plus every post-process step in `manualCleanup`. Final assets:
   `status: "final"`.

## Outputs

All under `games/<slug>/`:

- `docs/art-style-bible.md` — complete, anchors locked (§17).
- `config/asset-manifest.json` — full inventory, schema-valid, statuses honest.
- `prompts/art-prompts.json` — one 24-field prompt object per manifest image asset.
- `prompts/blender/*.py` — the four standalone headless scripts (always, even MCP-less).
- `assets/art/` (+ `assets/art/raw/`, `assets/art/processed/<assetId>/` with each
  asset's sprite-forge outputs incl. `pipeline-meta.json`), `assets/atlas/` —
  whatever was actually generated/keyed/packed; nothing fabricated.
- `artifact-manifest.json` — updated; `docs/validation-report.md` noted if prompt-only.

## Gate checklist — G9 (all must pass before step 11 consumes art)

- [ ] Style bible complete; STYLE ANCHOR is 40–80 words and appears VERBATIM at the
      head of every rendered prompt; PALETTE LOCK carries exact hex tokens; magenta
      banned from sprite palettes — FAIL on any prompt missing the anchors.
- [ ] `config/asset-manifest.json` validates and covers every group in Procedure
      step 2's table (4 premiums, 4–5 lows, WILD, SCATTER, all mechanic symbols, 4
      environments × 3–5 layers each, frame, cells, full UI kit, VFX, win typography,
      feature-buy, icon, thumbnail, splash).
- [ ] `prompts/art-prompts.json` has EXACTLY one prompt object per manifest image
      entry; every object carries all 24 fields, none empty/TBD.
- [ ] Every sprite prompt: `transparency: magenta-key` (or `api-alpha`), keying steps
      in `manualCleanup`, ≥ 6% negative-space margin, silhouette + 120 px readability
      requirements stated.
- [ ] Generation attempted via ONE batched `generate_images` call per wave when tools
      present; derivatives used `edit_image` with `source_images`; tools absent ⇒ all
      statuses `prompt-only` AND the validation report says so.
- [ ] All four Blender scripts exist in `prompts/blender/` and document the
      `blender --background --python … -- args` invocation, regardless of MCP state.
- [ ] Every generated magenta-key asset was processed through `tools/sprite-forge`
      (`pipeline-meta.json` present beside the cleaned asset); every animated sheet
      has zero edge-touched/clamped/empty frames in its QC summary and an
      `animation.gif` review artifact.
- [ ] Every generated file has provenance (generator, prompt, seed/model when exposed,
      date, license, cleanup steps) and an honest `status`; every `atlasGroup` maps to
      the lazy-load partition scheme.
- [ ] Zero prohibited content: no protected characters/logos/likenesses, no living-
      artist styles, no existing-slot copies, no readable text baked into images, no
      magenta pigment in sprite art.

## Failure handling

- Fix-and-recheck per failing item; max 3 attempts, then record FAILED-GATE G9 with
  evidence in `docs/validation-report.md` and stop honestly.
- Style drift in a wave: correct via `edit_image` against the hero with an explicit
  delta instruction; if two correction rounds fail, regenerate the wave with a
  tightened STYLE ANCHOR (bump its version suffix, log in `docs/decision-log.md`).
- Keying failures (halos, magenta rim): re-run the sprite-forge processor with wider
  tolerance (`--threshold` / `--edge-threshold` up, `--edge-clean-depth` deeper);
  persistent failures ⇒ regenerate with "crisp hard edges, no glow, no drop shadow"
  reinforced, or route through the `rembg` fallback; never ship a haloed sprite.
- Sheet QC failures (edge-touched, clamped, or empty frames; scale drift across
  frames): regenerate the raw sheet with tightened containment language or a layout
  guide/anchor sheet — do not hide generation drift with per-frame rescaling or by
  loosening QC thresholds.
- A symbol failing the 120 px / silhouette test goes back through the derivative
  workflow with explicit simplification instructions — never shipped failing.
- imagegen tools erroring mid-wave: keep successful assets, mark the rest
  `prompt-only`, report the partial wave honestly — do not fake statuses.
- Blender MCP disconnected mid-recipe: fall back to the standalone script path and
  note it; the scripts are the durable deliverable, MCP execution is the convenience.
