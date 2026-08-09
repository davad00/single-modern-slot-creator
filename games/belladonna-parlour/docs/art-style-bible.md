# Art Style Bible — Belladonna's Parlour

| Field | Value |
|---|---|
| Game name | Belladonna's Parlour |
| Project slug | belladonna-parlour |
| Game version | 0.1.0 |
| Math version | 0.1.0 |
| Config hash | (pending — set after config/ freeze, step 5; see game-design-document.md) |
| Date | 2026-08-08 |
| Generator | single-modern-slot-creator v1.0.0 |

---

## 1. Theme, narrative & mood

- **Theme (one sentence):** A candle-lit Victorian apothecary parlour after midnight, where the celebrated perfumer Madame Belladonna distils forbidden essences for her trusted client-accomplice.
- **Narrative:** By day Madame Belladonna is perfumer to high society; after midnight she unlocks the back room and takes appointments of a different kind. The player is her favoured client — welcomed past the shopfront into rooms nobody else sees. Bottles shatter in cascades across a 6×5 apothecary cabinet; essences distil into the master vial on the counter. Three seals open **The Tasting** (the back parlour, where she pours and the vial starts collecting); four seals descend to **The Distillery** (the copper-lit cellar where the house's real work happens; the vial arrives half-charged); five seals open **The Night Garden** (the moonlit conservatory where belladonna blooms and hanging prisms double what the vial holds). Madame Belladonna herself is never fully seen: gloved hands, a silhouette behind frosted glass, a voice.
- **Mood keywords (7):** elegant menace, hushed, opulent, unhurried, adult, secretive, poison-noir.
- **Emotional arc of a session:** brew → shatter → distil → transgress. Calm candle-lit base play with frequent small chain-reactions; committed-outcome anticipation as seals land; rare theatrical descents into ever-deeper chambers where the vial's multiplier climbs; resolution as the chamber seals its doors and the parlour returns.
- **Originality statement:** Original world, characters and names throughout; no franchise references, no copied art, characters or sounds; mechanics carry generic internal ids (`scatter_pays`, `cascades`, `summed_orb_multiplier`, `multiplier_doubler`) with original themed public names. Binding trade-dress distance requirements (docs/research-addendum.md, differentiation requirements 2–3): dark jewel poison palette and Victorian brass — never candy-bright gradients; no deity- or mascot-portrait-beside-the-reels composition; no anthropomorphic potion mascots. Adult framing throughout: no child characters, no juvenile pastiche, no confectionery cues.

## 2. Shape language

- **Primary shapes:** blown-glass volumes — teardrops, bulbs, alembic curves — rising from square-shouldered apothecary-cabinet geometry (tall rectangles, pigeonhole grids).
- **Secondary/accent shapes:** Victorian brass filigree scrollwork, thin oval label plates, wax-seal discs with ribbon tails, faceted prism triangles (ultimate tier only).
- **Forbidden shapes:** puffy rounded candy forms, bubble letters, cartoon stars, anthropomorphic faces on bottles or plants, chunky "toy" proportions, neon geometric abstraction.
- **Corner/edge treatment:** crisp hard glass edges with a single specular line; brass parts get a worn 2 px bevel with verdigris in the recesses; UI plates use a soft 8 px radius with a thin brass fillet; wood shows chamfered, hand-worn arrises.
- **Symbol frame convention:** every symbol is self-contained inside an implied rounded-square boundary with ≥ 10% transparent padding; bottles stand upright on an implied shelf line at ~12% from canvas bottom (visual weight biased low for landing squash).

## 3. Material language

| Surface class | Material | Finish / wear | Used on |
|---|---|---|---|
| Hero / premium | poison glass (deep-hued translucent glass with luminous liquid contents) | polished, one crisp specular line, faint internal glow from the liquid | H1–H4, FX1, MULT, master vial, tier portals |
| Standard | tarnished brass | satin with verdigris in recesses, chipped edge bevels | reel cabinet, filigree, fittings, HUD chrome, seal backings |
| Low / utility | dark walnut, dried botanicals, wax & parchment | matte, hand-worn, waxy sheen on seals | L1–L4, cabinet shelving, background filler |
| UI chrome | walnut panel + brass fillet + bone-cream engraving | matte wood, satin brass line, engraved (not printed) labels | HUD panels, buttons, overlays |
| VFX / energy | luminous essence (chartreuse fluid light), glass shards, prism light | hard-edged shards; liquid light with crisp meniscus, no soft feathered bloom | particles, streams, caustics, glows |

## 4. Lighting

- **Key light:** warm candle key from **lower-left**, ~30° above horizontal, colour of beeswax flame (≈ #E8B36A cast), soft-hard (candle at 1–2 m).
- **Fill / ambient:** very low walnut-brown ambience (#241B2F-tinted shadow), rooms fall to near-black at frame edges.
- **Rim / accent:** cold moonlight rim `moon #B9C7D9` from **upper-right** (leaded-glass windows / conservatory roof); tier accents may tint the rim (±10% hue) inside their own chamber.
- **Global rule:** candle key lower-left + cold moonlight rim upper-right on EVERY asset, symbols and environments alike, so all composites match; the key never moves, the rim never warms.
- **Emissive policy:** only liquid contents of vessels, the essence orb, prism refraction and win-state pulses may emit; max emissive area 20% of any symbol; emissive layers are exported separately so the engine drives the pulse.

## 5. Camera & perspective

- **Symbol camera:** orthographic front-on, 0° tilt, zero foreshortening — identical for ALL 12 grid-area sprites so the cabinet reads flat.
- **Environment camera:** eye-level wide (≈ 28 mm equivalent), single vanishing point, **horizon at 44% of frame height — identical across every environment layer of every tier** (the one stated horizon rule; verify ±1% in cleanup).
- **Character camera:** not applicable to sprites — Madame Belladonna appears only as silhouette/gloved hands inside environment art, never as a separate character asset (see §8).
- **Depth-of-field policy:** environments soften progressively behind the cabinet (layer0 softest); playfield, symbols and HUD are always tack-sharp; foreground occluders may be 10–15% softened to sell depth.

## 6. Color system

### 6.1 Color roles

| Role | Token | Hex | Usage | Must contrast against |
|---|---|---|---|---|
| Background deep | `bg-deep` | #120D16 | nightshade black — outermost environment, letterbox | — |
| Background mid | `bg-mid` | #241B2F | dusk violet — environment mid-layers | `bg-deep` |
| Playfield surface | `playfield` | #1B1512 | black-walnut cabinet backing behind symbols | symbol silhouettes |
| Primary brand | `primary` | #A98546 | tarnished brass — logo, reel cabinet, filigree, key props | `bg-deep` |
| Secondary | `secondary` | #5C4634 | dark walnut / leather — supporting props, low symbols | `playfield` |
| Action / interactive | `action` | #D98E2B | venom-amber — spin button, enabled controls. **RESERVED: appears on no non-interactive art** | `bg-deep` ≥ 4.5:1 |
| Win / value | `win` | #EFC75E | candle-gold — win amounts, countups, win-plate flourishes | `playfield` ≥ 4.5:1 |
| Danger / error | `danger` | #B3402E | oxblood — errors, destructive confirms | `bg-deep` ≥ 4.5:1 |
| HUD text | `text-hud` | #E9E0CB | bone-cream — balance, bet, win labels, engraved lettering | HUD panels ≥ 4.5:1 |
| Wild accent | `wild` | — | Not applicable — this game has no WILD (GDD §4, assumption A6); token unused | — |
| Scatter accent | `scatter` | #8C2E52 | wax mulberry — The Parlour Seal identity + anticipation glow | all symbol colours |
| Tier: feature | `tier-feature` | #C98F3D | candle amber — The Tasting identity | `bg-deep` |
| Tier: super_feature | `tier-super` | #4E8A6A | verdigris copper-green — The Distillery identity | `tier-feature` |
| Tier: ultimate_feature | `tier-ultimate` | #9B7BC4 | moonlit belladonna violet — The Night Garden identity | `tier-super` |
| Essence / multiplier | `orb` | #A8C94E | luminous chartreuse essence — MULT orb identity, vial fluid, value plates | `playfield`, all symbol colours |
| Poison green | `poison` | #74A12E | poison-glass bodies (H2), botanical accents, tier-super support | `playfield` |
| Belladonna violet | `violet` | #6C4E91 | premium glass (H1), night-garden blooms, tier-ultimate support | `playfield` |
| Moonlight rim | `moon` | #B9C7D9 | the global cold rim light; leaded-glass highlights | `bg-deep` |

**Palette families (binding, docs/research-addendum.md req 2):** poison greens (`poison`, `orb`, `tier-super`), belladonna violets (`bg-mid`, `violet`, `tier-ultimate`), black-walnut deeps (`bg-deep`, `playfield`, `secondary`), brass accent (`primary`, `tier-feature`), venom-amber warm accent (`action` — the one reserved interactive hue), bone-cream text (`text-hud`). All hues are muted jewel tones; saturated candy-bright values are off-palette by definition. **Magenta / hot-pink is banned from all sprite art — it is the keying colour (research/10 §4.3).**

### 6.2 Contrast rules

1. Symbols vs playfield: every symbol silhouette must hold ≥ 3:1 luminance contrast against `playfield` at 100% and at 50% brightness.
2. HUD text ≥ 4.5:1 against its panel in every state (CONVENTIONS §9.7). Win amounts ≥ 3:1 against any VFX behind them.
3. No information by colour alone — every colour-coded meaning is doubled by shape, icon, or label (see §16).
4. Interactive vs non-interactive: `action` #D98E2B is reserved — it never appears on non-interactive art. `win` #EFC75E is deliberately paler/yellower than `action` so countups never read as buttons.
5. Tier accents are mutually distinguishable for all colour-vision types (verify pairs in §16.2): amber vs green vs violet differ in luminance as well as hue.

## 7. Symbol silhouette rules

The grid area carries **12 unique reel-symbol silhouettes** (GDD §4 / config/symbols.json: SCATTER, MULT, FX1, H1–H4, L1–L5; no WILD) plus a thirteenth for the master-vial HUD element that docks beside the cabinet during features. Each must remain uniquely identifiable filled solid black on `playfield` at 120×120 px.

1. Unique outline: no two symbols share a silhouette. Premiums (H1–H4) read as **four distinct bottle profiles** (tall teardrop / serpent-coiled flask / squat hexagonal jar / slim twin-winged phial); lows (L1–L5) read as **apothecary sundries** (forked root / mushroom cluster / pod on stem / square parchment packet / arched foxglove sprig).
2. This game has no WILD (A6). SCATTER and MULT carry the two most distinctive silhouettes and never resemble each other. SCATTER: a round wax seal with two ribbon tails falling below the disc — the only circular-medallion outline. MULT: a glass sphere on a short brass cradle foot with a three-droplet crown rising above — round body but crowned, never tailed.
3. Interior detail budget: max 3 focal details per symbol; detail must survive 120 px (see §15).
4. Negative space: ≥ 10% of each symbol cell stays clear of detail so grid scanning stays fast.
5. Feature-exclusive FX1 (The Prisming Vial, ultimate only) inherits `tier-ultimate` #9B7BC4 and adds the set's only **sharp triangular prism stopper** — the single angular-apex silhouette on the grid.
6. Silhouette register (black-shape one-liners): **SCATTER** disc + double ribbon tail · **MULT** crowned sphere on foot · **FX1** triangle-topped slim vial · **H1** tall teardrop bottle, thorned crown stopper · **H2** flask wrapped by a coiled serpent · **H3** squat hexagonal jar · **H4** slim phial with two moth-wing flares · **L1** forked gnarled root · **L2** three-bell mushroom cluster · **L3** flat perforated pod on curved stem · **L4** square parchment packet with twine cross · **L5** arched dried sprig with a hanging row of foxglove bells (base/feature/ante reel sets only — removed in super/ultimate, GDD §4) · **master vial (HUD)** long-necked alembic with bulb base.

## 8. Character rules

- **Cast:** Madame Belladonna only — and she is never fully seen (GDD §2). She exists exclusively inside environment art as: a silhouette behind frosted glass (base parlour layer1), gloved hands at the edge of the buy-menu composition. **No character sprite assets, no rigged parts, no face is ever depicted.**
- **Proportions:** where silhouetted: elegant adult proportions, 7.5 heads, high collar, period dress — realistic-adult, never chibi or cartoon.
- **Face/expression policy:** faces are never shown; identity is carried by silhouette, gloves and voice (audio spec).
- **Pose vocabulary:** poised stillness only — pouring, presenting, waiting. No celebration poses, no mugging at camera.
- **Animation-part breakdown:** Not applicable — no character rig exists; logged as the "no character assets" row of docs/assumption-log.md mirror (step-11 integrator appends).
- **Originality guard:** no resemblance to protected characters or celebrity likenesses (§14); the silhouette must not evoke any known fictional poisoner/femme-fatale property.

## 9. Environment rules

- **Base-game environment:** the apothecary shopfront parlour after midnight — floor-to-ceiling bottle cabinets, brass fittings, a counter, rain on leaded-glass windows, candles burning low.
- **Layering:** base parlour ships as **4** separately exported parallax layers (deep wall → mid cabinets → near counter props → foreground occluder); each tier chamber ships **3–4** layers on the same recipe; all layers alpha-edged except the deepest (layer0 opaque).
- **Playfield integration:** the reels live inside a **built** apothecary cabinet — the reel frame IS the cabinet's brass-and-walnut face; symbols are bottles standing in its pigeonholes. Never a floating UI rectangle.
- **Animation hooks:** candle flames gutter (2–3 px flicker), rain streaks the window glass, dust motes drift in candle shafts, cabinet-glass reflections shimmer; in tiers: still-steam rises (Distillery), petals fall and prisms sway (Night Garden). All ambience sits below feedback motion in the hierarchy (motion spec §Motion hierarchy).
- **Per-tier environments:** each tier gets a **materially different room** (§13) — back parlour / cellar distillery / glass conservatory — never a recolour of the base scene.

## 10. UI rules

- **Chrome style:** skeuomorphic-to-theme, restrained: walnut panels with a single brass fillet and engraved bone-cream lettering. The theme enters the HUD through material and engraving, never through clutter; layout stays modern-flat in spacing.
- **Button shape & states:** all controls use the **round brass-collared medallion** (circle in a thin brass ring); every control ships all 10 component states (normal, hover, pressed, disabled, focused, loading, active/toggled, error, cooldown, hidden — per the step-7 UI spec), derived from the normal state via edit-image, never regenerated fresh.
- **Touch targets:** ≥ 44 px (CONVENTIONS §9.7); spin button ≥ 88 px.
- **HUD legibility:** balance / total bet / win always visible, `text-hud` on panels at ≥ 4.5:1, numerals use tabular figures.
- **Iconography:** engraved-line glyphs, 3 px stroke at 88 px, filled variants for active states, 8 px corner radius on any square icon plate; no text inside generated art — all labels render in-engine.
- **Safe areas:** HUD respects device notches and the orientation layouts in the step-7 UI spec; portrait puts the cabinet top 62%, vial + HUD bottom band, thumb-zone spin (GDD §16).

## 11. VFX rules

- **Particle vocabulary (4 families):** **glass shards** (cascade shatter — hard-edged, faceted), **essence droplets/streams** (orb collect, vial pours — liquid light with crisp meniscus), **prism caustics** (ultimate doubling — thin refracted light streaks), **dust motes / belladonna petals** (ambience; petals in the Night Garden only). No generic sparkles, no confetti.
- **Glow policy:** bloom radius ≤ 8 px at 1080p; only `orb`, `win`, tier accents and the scatter anticipation may glow; glows exported as separate hard-alpha layers, never baked feathered halos.
- **Trail policy:** essence streams leave a 200–300 ms chartreuse trail with hard core and 2 px falloff; shards leave no trails (they are debris, not magic).
- **Explosion/impact policy:** shatters are **radial glass-shard bursts** using §3's poison-glass material — shard shapes echo the broken bottle's hue; impacts are crisp and physical, never fireballs or smoke rings.
- **Colour discipline:** win VFX use `win`; tier VFX use their tier token; essence uses `orb`; error states never use `win`. All particle textures authored grayscale-for-tint except where the family is inherently hued (noted per asset).
- **Photosensitivity:** flash rate ≤ 3/s, no full-screen luminance inversion, zero saturated-red flashes (mirrors motion-specification.md §7 and GDD §22).

## 12. Typography

| Use | Family | Weight | Case | Notes |
|---|---|---|---|---|
| Display / big win | Cormorant Garamond | 700 (Bold) | small caps | outlined + filled variants for countups; Victorian-engraving flavour |
| HUD numerals | Inter (tabular-nums feature on) | 600 | — | tabular figures mandatory |
| Body / paytable | Inter | 400 | sentence | min 14 px at 1× |
| Buttons / labels | Inter | 600 | UPPER | tracking +4% |

- **Licensing:** Cormorant Garamond and Inter are both SIL Open Font License 1.1 — embeddable and redistributable; log in docs/source-register.md (step-11 integrator appends).
- **Localisation headroom:** labels reserve ≥ 30% width for translation expansion.
- Win-tier plates (big/mega/epic/max) are ornamental flourishes only — the localized tier word and numerals always render in-engine with these fonts, never baked into the art (§14.8).

## 13. Tier visual language

| Dimension | `feature` (3 scatters) | `super_feature` (4 scatters) | `ultimate_feature` (5+ scatters) |
|---|---|---|---|
| Public name | The Tasting | The Distillery | The Night Garden |
| Accent token | `tier-feature` #C98F3D | `tier-super` #4E8A6A | `tier-ultimate` #9B7BC4 |
| Environment | the back parlour: velvet curtain drawn aside, tasting table, closer candle groupings | the cellar distillery: copper stills, green-glass carboys, brick vaults, steam | the glass conservatory at night: moonlit belladonna in bloom, hanging prisms, rain on the roof |
| Lighting shift | candle key warms +15%, pools tighten | copper-glow underlight joins the key; green glass bounces `tier-super` fill | key drops to embers; `moon` rim becomes dominant; prisms scatter violet caustics |
| Camera change | 2% push-in on the cabinet | 4% vertical descent settles lower (post-stair-descent framing) | 2% pull-back revealing the glass roof; subtle prism-refraction vignette |
| Exclusive symbols/props | master vial docks on the counter (HUD) | pressure dial HUD; copper still props | FX1 The Prisming Vial (only here); prism rail HUD; hanging prism props |
| VFX intensity | ≤ 40 dust motes; vial fluid active | 60-particle ember burst at entry; steam wisps | 100-particle petal/prism burst at entry; prism caustics on doubles |
| HUD variation | + master vial (P) + spins-left counter | as feature + distillery pressure dial | as super + prism rail showing doubling events |
| Narrative beat | she pours for you in the back room | down the cellar stair — the house's real work | the forbidden conservatory, open only under the moon |
| Escalation rule | — | each tier is visibly "more" than the previous on at least **5** of the dimensions above, obvious within 2 seconds of entry | — |

## 14. Prohibited references

Never request or produce:

1. Protected characters (any studio, film, game, or comic property).
2. Protected logos, trademarks, or trade dress.
3. Unlicensed celebrity likenesses (living or dead).
4. Direct copies of existing slot assets (symbols, frames, backgrounds).
5. Direct imitation of living artists ("in the style of &lt;artist&gt;" is banned).
6. Direct replication of another studio's visual identity (see docs/source-register.md patterns-not-to-copy list): specifically **no candy-bright confectionery trade dress**, **no deity/god-portrait character-beside-the-reels composition**, **no anthropomorphic potion mascots**, no gritty-grunge-canvas identity mimicry, no transgressive-shock theming.
7. Trademarked mechanic names in on-screen text (the research/16 §3.2 lint blocklist applies to every game-facing string; use only our original public names — The Shattering, Distilled Essence, The Prisming, The Tasting, The Distillery, The Night Garden).
8. Game-specific additions: no child characters or child-appealing mascots anywhere (adult framing, CAP-code adjacency); no confectionery/candy cues; no readable text baked into any image (all text renders in-engine); no magenta or hot-pink pigment in any sprite (keying colour); no religious iconography on the seal; no drug-paraphernalia realism (the fantasy is period-gothic perfumery, not narcotics).

## 15. Mobile readability — the 120 px test

1. Render every symbol at **120×120 px** on `playfield` #1B1512 on a 6-inch screen (or simulated 360×780 CSS-px viewport): symbol identity must be recognisable in < 0.5 s without squinting. (6×5 grid at 390 px portrait ⇒ ~60 CSS-px cells, ~120 physical px at 2× DPR — GDD §6.4 mobile-readability row.)
2. At 120 px: minimum stroke weight **2** px, no text inside symbols except single glyphs ≥ **24** px (the essence-orb value plate — GDD §6.2 requires ≥ 24 px numerals, rendered in-engine), interior details below **6** px must be dropped from the small-size mip or simplified in-source.
3. HUD text minimum **14** px on 360 px-wide portrait; win countup minimum **32** px.
4. Anti-aliasing: assets exported at 2× grid size (**1024** px symbol masters) and downscaled by the atlas packer; no 1 px hairlines.
5. Failure handling: a symbol failing the test goes back through §18's derivative workflow with simplification instructions — never ship a failing symbol.
6. Device-variant plan: @2x masters authored per this document; @1x and @0.5x atlas variants emitted at pack time and mapped to config/device-profiles.json profiles (see prompts/art-generation.md §6.4). Variants are not yet listed in asset-manifest deviceVariants because nothing has been generated (this run is prompt-only).

## 16. Accessibility

### 16.1 General

- Reduced-motion variants exist for every animation event (motion-specification.md); static art must carry the same information as its animated version (e.g. the orb's value plate is legible without the collect animation).
- No information by colour alone: scatter count, tier identity, and win tiers are each also encoded by **silhouette + engraved icon + in-engine text label** (seal count ticks on the HUD as numerals; tiers named in HUD text; win tiers use distinct plate shapes and label text).
- Text contrast ≥ 4.5:1 in HUD; flash ≤ 3/s (CONVENTIONS §9.7).

### 16.2 Colour-blind-safe pairs

This run is prompt-only (no images generated); each pair below was **design-reviewed for combined hue + luminance separation**; simulator verification (deutan/protan/tritan) is a step-13 duty of the main session once art exists and is recorded in docs/validation-report.md.

| Pair (must stay distinguishable) | Deutan | Protan | Tritan | Backup encoding |
|---|---|---|---|---|
| `orb` vs `scatter` (no WILD exists; MULT/SCATTER is the critical special-symbol pair) | expected pass (light chartreuse vs dark mulberry — ΔL large) | expected pass | expected pass | silhouette (§7.2: crowned sphere vs ribboned disc) |
| `tier-feature` vs `tier-super` | expected pass (amber vs green, luminance-separated) | expected pass | expected pass | chamber environment + HUD tier label + entry choreography |
| `tier-super` vs `tier-ultimate` | expected pass (mid-green vs pale violet) | expected pass | expected pass | prism rail present only in ultimate + HUD tier label |
| `win` vs `danger` | expected pass (pale gold vs dark oxblood — ΔL large) | expected pass | expected pass | icon + position |
| `action` vs disabled control | expected pass (amber vs 40%-opacity walnut) | expected pass | expected pass | opacity + lock icon |

## 17. Prompt anchors

### 17.1 STYLE ANCHOR (prepend verbatim to EVERY image prompt)

```
STYLE ANCHOR [belladonna-parlour v0.1.0]: Belladonna's Parlour, a candle-lit
Victorian apothecary where a celebrated perfumer distils forbidden essences
after midnight. Mood: elegant menace, hushed, opulent, unhurried, adult.
Shape language: blown-glass volumes over Victorian brass filigree and tall
apothecary-cabinet geometry. Materials: poison glass, tarnished brass, dark
walnut. Lighting: warm candle key from lower-left; cold moonlight rim from
upper-right. Camera: symbols orthographic front-on; environments share a
horizon at 44% height. Painterly 2.5D game art, crisp edges, muted jewel
tones, no photorealism.
```

(78 words — within the 40–80 gate; stored once at the top of prompts/art-prompts.json and conceptually prepended to every rendered prompt.)

### 17.2 PALETTE LOCK (append to every prompt after the STYLE ANCHOR)

```
PALETTE LOCK: bg-deep #120D16, bg-mid #241B2F, playfield #1B1512, primary
brass #A98546, secondary walnut #5C4634, action venom-amber #D98E2B
(reserved: interactive elements ONLY), win candle-gold #EFC75E, danger
oxblood #B3402E, text bone-cream #E9E0CB, scatter wax-mulberry #8C2E52,
orb essence #A8C94E, poison green #74A12E, belladonna violet #6C4E91,
moonlight #B9C7D9, tier-feature amber #C98F3D, tier-super verdigris
#4E8A6A, tier-ultimate moon-violet #9B7BC4. Use ONLY these hues plus
neutral shades derived from them; no off-palette colours. Magenta and
hot-pink are banned from all art (keying colour).
```

### 17.3 NEGATIVE ANCHOR (default negative prompt, extend per asset)

```
NEGATIVE: photorealism, watermark, signature, readable text, text artifacts,
off-palette colours, existing slot-game lookalikes, protected characters or
logos, celebrity likeness, magenta or hot-pink pigment, soft feathered glow
halo, drop shadow, border, candy colours, confectionery, cartoon mascot,
child-appealing style, anthropomorphic bottles or plants
```

## 18. Consistency-reference workflow

1. **Hero asset first.** Generate ONE hero asset — `img.symbol.h1` (the Belladonna Philtre, the amethyst teardrop bottle) — before anything else. Iterate until it fully embodies §§1–12. This file becomes the master consistency reference.
2. **Lock the anchors.** Extract/confirm final hex values from the approved hero and update §6.1 and §17.2; re-render §17.1 with the hero's asset id if hues shift.
3. **Derive, don't re-invent.** Every subsequent asset is produced with `mcp__imagegen__edit_image` using the hero (or the nearest approved sibling — e.g. H1 → H2) in `source_images` as a style/composition reference, OR with `generate_images` prompts whose `consistencyReference` field names the hero asset id. Batch all same-wave assets into ONE `generate_images` call.
4. **Family passes.** Wave ① hero (H1) + base layer0; wave ② remaining symbols (H2–H4, L1–L4, SCATTER, MULT + plate, FX1); wave ③ environments (all 4 rooms × parallax layers) + reel frame + cells; wave ④ HUD elements + UI kit + win plates + VFX + buy menu + icon/thumbnail/splash.
5. **Sprites/cutouts:** `transparent: true` (magenta key) + record the keying/cleanup step per asset in the manifest provenance.
6. **Drift check per wave:** place new assets beside the hero at grid scale; any off-palette hue, lighting-direction mismatch, or shape-language break → regenerate via `edit_image` with a correction instruction before the next wave.
7. **Provenance:** every generated file records prompt id, tool, source references, and cleanup steps in artifact-manifest.json (gate G14).
8. **This run:** the imagegen MCP tools are ABSENT in the prompt-authoring environment — every manifest entry is `status: "prompt-only"`; the generation attempt (waves, drift checks, keying) is the main session's duty.

## 19. Image-prompt required fields (checklist for prompts/art-prompts.json)

| # | Field | Source in this bible |
|---|---|---|
| 1 | assetId (`img.<name>`) | asset plan |
| 2 | assetCategory | asset plan |
| 3 | purpose | asset plan |
| 4 | subject | §§1, 7–9 |
| 5 | composition | §§2, 7.4 |
| 6 | cameraAngle | §5 |
| 7 | perspective | §5 |
| 8 | lighting | §4 |
| 9 | materials | §3 |
| 10 | paletteRole (tokens) | §6.1 |
| 11 | silhouetteRequirement | §7 |
| 12 | mobileReadabilityRequirement | §15 |
| 13 | negativeSpaceRequirement | §7.4 |
| 14 | transparencyRequirement | §18.5 |
| 15 | resolution | §15.4 / asset plan |
| 16 | aspectRatio | asset plan |
| 17 | animationLayerRequirements | §8, §9.2 |
| 18 | consistencyReference | §18 |
| 19 | negativePrompt | §17.3 |
| 20 | prohibitedContent | §14 |
| 21 | manualCleanupInstructions | §18.5 |
| 22 | exportFormat | asset plan (png source of truth) |
| 23 | fileName (kebab-case) | asset plan |
| 24 | provenanceMetadata | §18.7 |

**Asset coverage:** prompts exist for every entry in config/asset-manifest.json: splash/loading art, base parlour background in 4 parallax layers, foreground occluders, three tier environments (3–4 layers each), reel cabinet frame, grid cells (+ win variant), all 12 reel symbols plus the orb value plate, master-vial / pressure-dial / prism-rail HUD elements, the full button kit + panels + spin-mode indicator, win-tier plates (big/mega/epic/max), the four VFX texture families, feature-buy screen, game icon and thumbnail. No lobby artwork was requested.
