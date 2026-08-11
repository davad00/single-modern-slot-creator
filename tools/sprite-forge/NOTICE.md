# sprite-forge (vendored) — provenance & scope

Deterministic post-processing toolkit for AI-generated 2D sprites, vendored from
**agent-sprite-forge** and wired into step 9 of this skill
(`prompts/art-generation.md` §6 "Post-processing", sprite-sheet workflows).

| Field | Value |
|---|---|
| Upstream | <https://github.com/0x0funky/agent-sprite-forge> |
| Author | 0x0funky |
| License | MIT (see `LICENSE` in this directory — kept verbatim) |
| Vendored commit | `64fd0b57d3f2ae117ef0a95e4c2decc25b4c9dd2` |
| Vendored on | 2026-08-11 |

## What was vendored (and what was not)

Taken — the `generate2dsprite` skill's deterministic scripts and reference docs:

- `generate2dsprite.py` — the processor: magenta (`#FF00FF`) chroma-key cleanup +
  despill, grid frame extraction, component filtering, scaling/alignment
  (`fit`/`preserve`, `center`/`bottom`/`feet`), shared-scale profiles, strict QC
  metadata (`edge_touch_frames`, `body_scale_cv`, `anchor_y_std`), transparent sheet
  export, per-frame PNGs, GIF preview, `pipeline-meta.json`.
- `make_layout_guide.py` — abstract geometry-only grid guides for sheet generation.
- `make_anchor_layout.py` — character-anchor sheets (repeat an accepted master frame
  to lock scale/feet line across an action sheet).
- `references/modes.md`, `references/prompt-rules.md` — upstream's sheet-layout and
  prompt-containment rules (consult when authoring animated-sheet prompts).
- `tests/test_generate2dsprite.py` — upstream unit tests (13), import path adapted to
  the flat vendored layout; otherwise unmodified.

NOT taken: `generate2dmap` (game-map pipelines — out of scope for a slot),
`video2dsprite` (requires a Grok-exclusive `image_to_video` tool), showcase media.

## Local modifications

- `tests/test_generate2dsprite.py`: `SCRIPT_PATH` adjusted (upstream nests scripts
  under `skills/generate2dsprite/scripts/`; here they sit beside this file's parent).
- Nothing else modified. Upgrade path: re-copy the three scripts + references from
  upstream, re-apply the test path tweak, re-run `uv run --group dev pytest tests/ -q`.

## How this skill uses it

Slot art context, not platformer context — the mapping is:

- **Every `transparency: magenta-key` asset** (symbols, UI, VFX, frame, parallax
  layers) goes through `process` for keying/despill/defringe instead of ad-hoc
  cleanup code. Single stills are `--rows 1 --cols 1`.
- **Animation sheets** (win-state symbol loops, VFX explosion/impact sheets, coin
  loops, character parts) use grid generation + `process` for frame extraction,
  alignment and QC; `animation.gif` is the visual-QC artifact.
- **Blender turntable frames** (already true-alpha) skip keying but reuse the same
  sheet/QC conventions.
- Layout/anchor guides support multi-frame sheet prompts sent to the imagegen tools.

Invocation from the game folder (uv, per repo convention):

```bash
uv run --project <skill-root>/tools/sprite-forge \
  python <skill-root>/tools/sprite-forge/generate2dsprite.py process \
  --input assets/art/raw/vfx-impact-sheet.png \
  --target fx --mode impact --rows 2 --cols 2 \
  --output-dir assets/art/processed/vfx-impact \
  --cell-size 512 --component-mode all --strict-qc
```

Run the vendored test suite:

```bash
cd <skill-root>/tools/sprite-forge
uv run --group dev pytest tests/ -q
```
