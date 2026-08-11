<!--
TEMPLATE: art-style-bible.md — single-modern-slot-creator v1.0.0
Fill every {{placeholder}}. Delete no sections; if a section does not apply,
write "Not applicable — <reason>" and log it in docs/assumption-log.md.
This document is the single source of truth for every visual decision and for
every image prompt in prompts/art-prompts.json. The STYLE ANCHOR and PALETTE
LOCK defined in §17 MUST be prepended verbatim to every image prompt (gate G9).
Tier internal ids are ALWAYS feature / super_feature / ultimate_feature
(CONVENTIONS §4.1) even when public names are themed. Keep tables complete —
add rows, never remove header rows.
-->

# Art Style Bible — {{gameName}}

| Field | Value |
|---|---|
| Game name | {{gameName}} |
| Project slug | {{projectSlug}} |
| Game version | {{gameVersion}} |
| Math version | {{mathVersion}} |
| Config hash | {{configHash}} <!-- sha256:<64 hex> per CONVENTIONS §5 --> |
| Date | {{dateIso}} |
| Generator | single-modern-slot-creator v1.0.0 |

---

## 1. Theme, narrative & mood

<!-- Original theme only: no copied names, characters, art, or another studio's
visual identity (CONVENTIONS §9.10, research/16-ip-risk-register.md). -->

- **Theme (one sentence):** {{themeOneSentence}}
- **Narrative:** {{narrativeParagraph}} <!-- the world, its inhabitants, what the player is doing there, and how the three bonus tiers escalate the story -->
- **Mood keywords (5–8):** {{moodKeywords}} <!-- e.g. "opulent, humid, bioluminescent, patient, dangerous" -->
- **Emotional arc of a session:** {{emotionalArc}} <!-- calm base → rising tension → tier-escalating spectacle → resolution -->
- **Originality statement:** {{originalityStatement}}

## 2. Shape language

<!-- Describe the geometric vocabulary that makes silhouettes recognisably
"this game". Every asset prompt must reference it. -->

- **Primary shapes:** {{primaryShapes}} <!-- e.g. "rounded triangles, layered arcs" -->
- **Secondary/accent shapes:** {{secondaryShapes}}
- **Forbidden shapes:** {{forbiddenShapes}} <!-- shapes that break the language -->
- **Corner/edge treatment:** {{edgeTreatment}} <!-- e.g. "soft 8px radius on UI, chipped bevels on symbols" -->
- **Symbol frame convention:** {{symbolFrameConvention}} <!-- e.g. "all symbols self-contained inside an implied rounded-square boundary with 8% padding" -->

## 3. Material language

| Surface class | Material | Finish / wear | Used on |
|---|---|---|---|
| Hero / premium | {{heroMaterial}} | {{heroFinish}} | H1–H2, WILD, tier portals |
| Standard | {{standardMaterial}} | {{standardFinish}} | H3–H4, environment props |
| Low / utility | {{lowMaterial}} | {{lowFinish}} | L1–L5, background filler |
| UI chrome | {{uiMaterial}} | {{uiFinish}} | HUD, buttons, panels |
| VFX / energy | {{vfxMaterial}} | {{vfxFinish}} | particles, glows, trails |

## 4. Lighting

- **Key light:** {{keyLight}} <!-- direction, colour temperature, hardness -->
- **Fill / ambient:** {{fillLight}}
- **Rim / accent:** {{rimLight}} <!-- usually the tier accent colour -->
- **Global rule:** {{lightingGlobalRule}} <!-- e.g. "key from upper-left at 35°, consistent across ALL assets so composites match" -->
- **Emissive policy:** {{emissivePolicy}} <!-- what may glow, max emissive area per symbol -->

## 5. Camera & perspective

- **Symbol camera:** {{symbolCamera}} <!-- e.g. "orthographic front-facing, 5° downward tilt, no foreshortening" — must be identical for all symbols so the grid reads flat -->
- **Environment camera:** {{environmentCamera}} <!-- e.g. "wide 24mm eye-level, horizon at 40% height" -->
- **Character camera:** {{characterCamera}}
- **Depth-of-field policy:** {{dofPolicy}} <!-- backgrounds soft, playfield always sharp -->

## 6. Color system

### 6.1 Color roles

<!-- Hex values become the PALETTE LOCK tokens in §17.2. HUD text pairs must
meet ≥ 4.5:1 contrast (CONVENTIONS §9.7); verify in §16. -->

| Role | Token | Hex | Usage | Must contrast against |
|---|---|---|---|---|
| Background deep | `bg-deep` | {{#hexBgDeep}} | outermost environment, letterbox | — |
| Background mid | `bg-mid` | {{#hexBgMid}} | environment mid-layers | `bg-deep` |
| Playfield surface | `playfield` | {{#hexPlayfield}} | reel area backing | symbol silhouettes |
| Primary brand | `primary` | {{#hexPrimary}} | logo, reel frame, key props | `bg-deep` |
| Secondary | `secondary` | {{#hexSecondary}} | supporting props, low symbols | `playfield` |
| Action / interactive | `action` | {{#hexAction}} | spin button, enabled controls | `bg-deep` ≥ 4.5:1 |
| Win / value | `win` | {{#hexWin}} | win amounts, coin VFX, countups | `playfield` ≥ 4.5:1 |
| Danger / error | `danger` | {{#hexDanger}} | errors, destructive confirms | `bg-deep` ≥ 4.5:1 |
| HUD text | `text-hud` | {{#hexTextHud}} | balance, bet, win labels | HUD panels ≥ 4.5:1 |
| Wild accent | `wild` | {{#hexWild}} | WILD symbol identity | all symbol colours |
| Scatter accent | `scatter` | {{#hexScatter}} | SCATTER identity + anticipation | all symbol colours |
| Tier: feature | `tier-feature` | {{#hexTierFeature}} | 3-scatter bonus identity | `bg-deep` |
| Tier: super_feature | `tier-super` | {{#hexTierSuper}} | 4-scatter bonus identity | `tier-feature` |
| Tier: ultimate_feature | `tier-ultimate` | {{#hexTierUltimate}} | 5-scatter bonus identity | `tier-super` |

### 6.2 Contrast rules

1. Symbols vs playfield: every symbol silhouette must hold ≥ {{symbolContrastRatio}}:1 luminance contrast against `playfield` at 100% and at 50% brightness.
2. HUD text ≥ 4.5:1 against its panel in every state (CONVENTIONS §9.7). Win amounts ≥ 3:1 against any VFX behind them.
3. No information by colour alone — every colour-coded meaning is doubled by shape, icon, or label (see §16).
4. Interactive vs non-interactive: `action` hue is reserved — it never appears on non-interactive art. {{contrastExtraRules}}
5. Tier accents are mutually distinguishable for all colour-vision types (verify pairs in §16.2).

## 7. Symbol silhouette rules

<!-- The silhouette test is the gate: fill each symbol solid black on the
playfield colour at 120×120 px — every symbol must remain uniquely
identifiable. Record the test result in docs/validation-report.md. -->

1. Unique outline: no two symbols share a silhouette; premiums (H1–H4) read as {{premiumSilhouetteFamily}}, lows (L1–L5) as {{lowSilhouetteFamily}}.
2. WILD and SCATTER have the two most distinctive silhouettes on the grid and never resemble each other. WILD: {{wildSilhouette}}. SCATTER: {{scatterSilhouette}}.
3. Interior detail budget: max {{maxInteriorDetails}} focal details per symbol; detail must survive 120 px (see §15).
4. Negative space: ≥ {{negativeSpacePct}}% of each symbol cell stays clear of detail so grid scanning stays fast.
5. Feature-exclusive symbols (FX1..) inherit the tier accent colour of the tier they belong to and add {{fxSilhouetteMarker}}.
6. {{symbolSilhouetteExtraRules}}

## 8. Character rules

- **Cast:** {{characterCast}} <!-- list characters; "None" is valid for object-led themes -->
- **Proportions:** {{characterProportions}} <!-- e.g. "3.5 heads tall, oversized hands" -->
- **Face/expression policy:** {{characterExpressions}}
- **Pose vocabulary:** {{characterPoses}} <!-- idle / celebrate / anticipate poses used across assets -->
- **Animation-part breakdown:** {{characterParts}} <!-- separately exported layers: head, torso, arms, fx — for spine/cutout animation -->
- **Originality guard:** no resemblance to protected characters or celebrity likenesses (see §14).

## 9. Environment rules

- **Base-game environment:** {{baseEnvironment}} <!-- setting, time of day, weather -->
- **Layering:** {{parallaxLayers}} layers exported separately for parallax (deep sky → mid → near → foreground occluders); each layer alpha-edged.
- **Playfield integration:** {{playfieldIntegration}} <!-- how the reel frame sits in the world: carved, floating, grown, built -->
- **Animation hooks:** {{environmentAnimHooks}} <!-- what subtly moves in idle: {{examples}} -->
- **Per-tier environments:** each tier gets a materially different environment (§13), not a recolour.

## 10. UI rules

- **Chrome style:** {{uiChromeStyle}} <!-- flat / skeuomorphic-to-theme / glass; how much theme enters the HUD -->
- **Button shape & states:** all controls use {{buttonShape}}; every control ships all 10 component states (normal, hover, pressed, disabled, focused, loading, active/toggled, error, cooldown, hidden — per prompts/ui-ux.md).
- **Touch targets:** ≥ 44 px (CONVENTIONS §9.7); spin button ≥ {{spinButtonPx}} px.
- **HUD legibility:** balance / total bet / win always visible, `text-hud` on panels at ≥ 4.5:1, numerals use tabular figures.
- **Iconography:** {{iconStyle}} <!-- stroke weight, filled vs outline, corner radius -->
- **Safe areas:** HUD respects device notches and the orientation layouts in prompts/ui-ux.md.

## 11. VFX rules

- **Particle vocabulary:** {{particleVocabulary}} <!-- the 3–5 particle families used everywhere: e.g. "embers, glass shards, pollen" — no generic sparkles unless themed -->
- **Glow policy:** {{glowPolicy}} <!-- max bloom radius, which tokens may glow -->
- **Trail policy:** {{trailPolicy}}
- **Explosion/impact policy:** {{explosionPolicy}} <!-- shape language of impacts; debris uses material language §3 -->
- **Colour discipline:** win VFX use `win`; tier VFX use their tier token; error states never use `win`.
- **Photosensitivity:** flash rate ≤ 3/s, no full-screen luminance inversion (mirrors motion-specification.md §7).

## 12. Typography

| Use | Family | Weight | Case | Notes |
|---|---|---|---|---|
| Display / big win | {{displayFont}} | {{displayWeight}} | {{displayCase}} | outlined + filled variants for countups |
| HUD numerals | {{hudFont}} | {{hudWeight}} | — | tabular figures mandatory |
| Body / paytable | {{bodyFont}} | {{bodyWeight}} | sentence | min 14 px at 1× |
| Buttons / labels | {{labelFont}} | {{labelWeight}} | {{labelCase}} | tracking {{labelTracking}} |

- **Licensing:** {{fontLicensing}} <!-- confirm embeddable licences; log in docs/source-register.md -->
- **Localisation headroom:** labels reserve ≥ {{locHeadroomPct}}% width for translation expansion.

## 13. Tier visual language

<!-- Gate G6: tiers must be materially different in presentation. A recolour or
title swap fails the gate. Fill every row for every tier. -->

| Dimension | `feature` (3 scatters) | `super_feature` (4 scatters) | `ultimate_feature` (5+ scatters) |
|---|---|---|---|
| Public name | {{featureName}} | {{superFeatureName}} | {{ultimateFeatureName}} |
| Accent token | `tier-feature` | `tier-super` | `tier-ultimate` |
| Environment | {{featureEnv}} | {{superFeatureEnv}} | {{ultimateFeatureEnv}} |
| Lighting shift | {{featureLighting}} | {{superFeatureLighting}} | {{ultimateFeatureLighting}} |
| Camera change | {{featureCamera}} | {{superFeatureCamera}} | {{ultimateFeatureCamera}} |
| Exclusive symbols/props | {{featureExclusives}} | {{superFeatureExclusives}} | {{ultimateFeatureExclusives}} |
| VFX intensity | {{featureVfx}} | {{superFeatureVfx}} | {{ultimateFeatureVfx}} |
| HUD variation | {{featureHud}} | {{superFeatureHud}} | {{ultimateFeatureHud}} |
| Narrative beat | {{featureBeat}} | {{superFeatureBeat}} | {{ultimateFeatureBeat}} |

**Escalation rule:** each tier must be visibly "more" than the previous on at least {{escalationDimensions}} of the dimensions above, and the escalation must be obvious within 2 seconds of entry.

## 14. Prohibited references

<!-- From the mission brief + research/16-ip-risk-register.md. Every image
prompt inherits these as its "prohibited content" field. Add game-specific
entries; never remove the baseline. -->

Never request or produce:

1. Protected characters (any studio, film, game, or comic property).
2. Protected logos, trademarks, or trade dress.
3. Unlicensed celebrity likenesses (living or dead).
4. Direct copies of existing slot assets (symbols, frames, backgrounds).
5. Direct imitation of living artists ("in the style of <artist>" is banned).
6. Direct replication of another studio's visual identity (see docs/source-register.md patterns-not-to-copy list).
7. Trademarked mechanic names in on-screen text (e.g. "Megaways" — licensed).
8. {{gameSpecificProhibitions}}

## 15. Mobile readability — the 120 px test

<!-- The binding readability gate for every grid asset. Record results per
symbol in docs/validation-report.md. -->

1. Render every symbol at **120×120 px** on the `playfield` colour on a 6-inch screen (or simulated 360×780 CSS-px viewport): symbol identity must be recognisable in < 0.5 s without squinting.
2. At 120 px: minimum stroke weight {{minStrokePx}} px, no text inside symbols except single glyphs ≥ {{minGlyphPx}} px, interior details below {{minDetailPx}} px must be dropped from the small-size mip or simplified in-source.
3. HUD text minimum {{minHudTextPx}} px on 360 px-wide portrait; win countup minimum {{minCountupPx}} px.
4. Anti-aliasing: assets exported at 2× grid size ({{exportSymbolPx}} px) and downscaled by the atlas packer; no 1 px hairlines.
5. Failure handling: a symbol failing the test goes back through §18's derivative workflow with simplification instructions — never ship a failing symbol.

## 16. Accessibility

### 16.1 General

- Reduced-motion variants exist for every animation event (motion-specification.md); static art must carry the same information as its animated version.
- No information by colour alone: scatter count, tier identity, and win tiers are each also encoded by {{redundantEncoding}} <!-- e.g. "icon shape + label + frame ornament" -->.
- Text contrast ≥ 4.5:1 in HUD; flash ≤ 3/s (CONVENTIONS §9.7).

### 16.2 Colour-blind-safe pairs

<!-- Verify every pair below under deuteranopia, protanopia, and tritanopia
simulation. Every row must pass, or the palette (§6.1) must change. -->

| Pair (must stay distinguishable) | Deutan | Protan | Tritan | Backup encoding |
|---|---|---|---|---|
| `wild` vs `scatter` | {{passFail}} | {{passFail}} | {{passFail}} | silhouette (§7.2) |
| `tier-feature` vs `tier-super` | {{passFail}} | {{passFail}} | {{passFail}} | {{tierBackup1}} |
| `tier-super` vs `tier-ultimate` | {{passFail}} | {{passFail}} | {{passFail}} | {{tierBackup2}} |
| `win` vs `danger` | {{passFail}} | {{passFail}} | {{passFail}} | icon + position |
| `action` vs disabled control | {{passFail}} | {{passFail}} | {{passFail}} | opacity + lock icon |

## 17. Prompt anchors

<!-- These strings keep every generated image on-model. They are REQUIRED
building blocks of every prompt in prompts/art-prompts.json (gate G9). -->

### 17.1 STYLE ANCHOR (prepend verbatim to EVERY image prompt)

```
STYLE ANCHOR [{{projectSlug}} v{{gameVersion}}]: {{themeOneSentence}};
{{moodKeywords}}; shape language: {{primaryShapes}}; materials:
{{heroMaterial}} / {{standardMaterial}}; lighting: {{lightingGlobalRule}};
camera: {{symbolCamera}} (symbols) / {{environmentCamera}} (environments);
rendering style: {{renderingStyle}} <!-- e.g. "painterly 2.5D, crisp edges, game-art finish" -->;
consistent with reference asset {{heroAssetId}}.
```

### 17.2 PALETTE LOCK (append to every prompt after the STYLE ANCHOR)

```
PALETTE LOCK: bg-deep {{#hexBgDeep}}, bg-mid {{#hexBgMid}}, playfield
{{#hexPlayfield}}, primary {{#hexPrimary}}, secondary {{#hexSecondary}},
action {{#hexAction}}, win {{#hexWin}}, wild {{#hexWild}}, scatter
{{#hexScatter}}, tier-feature {{#hexTierFeature}}, tier-super
{{#hexTierSuper}}, tier-ultimate {{#hexTierUltimate}}. Use ONLY these hues
plus neutral shades derived from them; no off-palette colours.
```

### 17.3 NEGATIVE ANCHOR (default negative prompt, extend per asset)

```
NEGATIVE: photorealism, watermark, signature, text artifacts, off-palette
colours, existing slot-game lookalikes, protected characters or logos,
celebrity likeness, {{extraNegativeTerms}}
```

## 18. Consistency-reference workflow

<!-- How prompts/art-prompts.json + the imagegen MCP tools keep the set
coherent. Mirrors CONVENTIONS §8 (batch via mcp__imagegen__generate_images;
transparent: true magenta key for sprites/cutouts). -->

1. **Hero asset first.** Generate ONE hero asset ({{heroAssetId}}, usually the H1 symbol or key art) before anything else. Iterate until it fully embodies §§1–12. This file becomes the master consistency reference.
2. **Lock the anchors.** Extract/confirm final hex values and update §6.1 and §17.2 from the approved hero. Re-render §17.1 with the hero's asset id.
3. **Derive, don't re-invent.** Every subsequent asset is produced with `mcp__imagegen__edit_image` using the hero (or the nearest approved sibling — e.g. H1 → H2) in `source_images` as a style/composition reference, OR with `generate_images` prompts whose `consistencyReference` field names the hero asset id. Batch all same-wave assets into ONE `generate_images` call.
4. **Family passes.** Generate in waves so each wave can reference the previous: ① hero + background, ② premium symbols H1–H4 + WILD + SCATTER, ③ lows L1–L5 + FX/MULT/CASH/COLLECT/MYSTERY, ④ tier environments + HUDs, ⑤ UI + paytable + VFX sheets + icon/thumbnail/splash/loading.
5. **Sprites/cutouts:** `transparent: true` (magenta key); keying/despill/defringe runs through the vendored `tools/sprite-forge` processor (CONVENTIONS §8) and the resulting `pipeline-meta.json` + cleanup steps are recorded per asset in the manifest provenance.
6. **Drift check per wave:** place new assets beside the hero at grid scale; any off-palette hue, lighting-direction mismatch, or shape-language break → regenerate via `edit_image` with a correction instruction before the next wave.
7. **Provenance:** every generated file records prompt id, tool, source references, and cleanup steps in artifact-manifest.json (gate G14).

## 19. Image-prompt required fields (checklist for prompts/art-prompts.json)

<!-- Every prompt object must carry ALL of these fields (mission brief; gate
G9). The schema is schemas/asset-manifest + art-prompt conventions. -->

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

**Asset coverage:** prompts must exist for every entry in config/asset-manifest.json, including at minimum: loading screen, splash art, base background + parallax layers, foreground layers, reel frame, grid cells, all low/high symbols, WILD, SCATTER, bonus/mystery/multiplier/collector/feature-exclusive symbols used by the design, all three tier environments, feature HUDs, buttons, settings icons, spin-mode indicators, paytable elements, big-win typography, particles, glows, trails, explosions, character animation parts, feature-buy interface, game icon, thumbnail, and (if requested) lobby artwork.
