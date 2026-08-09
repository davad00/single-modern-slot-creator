"""Builds the mechanical display configs for the Kilnspire example.

Generates (into ./config/):
  - reel-sets.json        from ./math-config/reel-sets.json (the strips that were
                          actually simulated) + three bonus_buy_entry presentation sets
  - animation-events.json 27 events, full CONVENTIONS 9.8 field set each
  - audio-events.json     28 events, full loop/priority/ducking/polyphony spec each
  - asset-manifest.json   62 assets (33 symbol images + environments, frame, UI,
                          VFX, win plates, meta art, music, font), all prompt-only
  - patches game-config.json configHash

configHash bootstrap rule (documented in ../README.md): the hash is computed per
CONVENTIONS 5 over all config/*.json in filename-alphabetical order with
game-config.json's own configHash field set to the sha256:000...0 placeholder,
then written into game-config.json.

Run:  uv run python build_display_config.py   (from this directory)
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).parent
CFG = HERE / "config"
GENERATED_AT = "2026-08-08T07:30:00Z"  # authoring timestamp of this example

PLACEHOLDER = "sha256:" + "0" * 64


# ---------------------------------------------------------------- reel sets
def build_reel_sets() -> None:
    runtime = json.loads((HERE / "math-config" / "reel-sets.json").read_text(encoding="utf-8"))
    strips = {s["purpose"]: s["strips"] for s in runtime["sets"]}
    sets = []
    for purpose in ("base", "feature", "super_feature", "ultimate_feature"):
        set_id = {"base": "base-96"}.get(purpose, purpose.replace("_", "-") + "-strips")
        entry = {
            "setId": set_id,
            "purpose": purpose,
            "mode": "strips",
            "stopSelection": "uniform_strip",
            "rtpProfileId": "rtp-96",
            "strips": strips[purpose],
        }
        sets.append(entry)

    # bonus_buy_entry presentation sets: base strips with lows swapped for extra
    # scatters so the guaranteed entry spin lands its scatters naturally on
    # screen. Math authority is bonus-buys.json forcedEntryDistribution; these
    # strips shape presentation of the entry spin only.
    extra_per_tier = {"feature": 2, "super_feature": 3, "ultimate_feature": 4}
    for tier, extra in extra_per_tier.items():
        buy_strips = []
        for strip in strips["base"]:
            s = list(strip)
            added = 0
            for i, sym in enumerate(s):
                if added >= extra:
                    break
                # keep scatters spaced: only replace lows at least 6 slots from
                # an existing scatter
                if sym.startswith("L") and all(
                    s[(i + d) % len(s)] != "SCATTER" for d in range(-5, 6)
                ):
                    s[i] = "SCATTER"
                    added += 1
            buy_strips.append(s)
        sets.append(
            {
                "setId": "buy-entry-" + tier.replace("_", "-"),
                "purpose": "bonus_buy_entry",
                "mode": "strips",
                "stopSelection": "uniform_strip",
                "rtpProfileId": "rtp-96",
                "strips": buy_strips,
            }
        )
    (CFG / "reel-sets.json").write_text(json.dumps(sets, indent=2) + "\n", encoding="utf-8")
    print("wrote config/reel-sets.json")


# ---------------------------------------------------------- animation events
def anim(event_id, trigger, dur, easing, prio, layer, blocks, skippable, skip_to,
         audio, haptic, recovery, conditions=None, fast_forward=None):
    e = {
        "eventId": event_id,
        "trigger": trigger,
        "timelineId": event_id.replace("anim.", "tl-").replace(".", "-").replace("_", "-"),
        "durationMs": dur,
        "easing": easing,
        "priority": prio,
        "layer": layer,
        "blocksInput": blocks,
        "skippable": skippable,
        "skipTo": skip_to,
        "audioEvent": audio,
        "hapticEvent": haptic,
        "reducedMotionTimelineId": event_id.replace("anim.", "tl-rm-").replace(".", "-").replace("_", "-"),
        "lowPerformanceTimelineId": event_id.replace("anim.", "tl-lp-").replace(".", "-").replace("_", "-"),
        "recoveryPolicy": recovery,
    }
    if conditions:
        e["conditions"] = conditions
    if fast_forward:
        e["fastForwardFactor"] = fast_forward
    return e


def build_animation_events() -> None:
    events = [
        anim("anim.reel.spin_start", "spin_pressed", 400, "easeInCubic", 90, "reels", True, False, "complete", "sfx.reel.spin_loop", None, "skip", fast_forward=2),
        anim("anim.reel.stop", "reel_stop", 220, "easeOutBack", 90, "reels", True, False, "complete", "sfx.reel.stop", "haptic.light", "seek-to-authoritative-state", fast_forward=4),
        anim("anim.symbol.land", "symbol_landed", 180, "easeOutQuad", 40, "symbols", False, True, "complete", None, None, "skip", fast_forward=4),
        anim("anim.scatter.land", "symbol_landed", 650, "easeOutElastic", 80, "symbols", False, False, "complete", "sfx.scatter.land_1", "haptic.medium", "seek-to-authoritative-state", conditions={"symbolId": "SCATTER"}),
        anim("anim.scatter.anticipation", "reel_anticipation", 900, "easeInOutSine", 85, "reels", True, False, "complete", "sfx.scatter.anticipation", None, "skip", conditions={"symbolId": "SCATTER", "minScatterCount": 2}),
        anim("anim.win.ways", "presenting_wins", 900, "easeOutQuad", 60, "symbols", False, True, "complete", None, None, "seek-to-authoritative-state", fast_forward=3),
        anim("anim.frame.win_glow", "presenting_wins", 900, "easeInOutSine", 30, "frame", False, True, "complete", None, None, "skip"),
        anim("anim.win.countup", "win_countup", 1600, "linear", 70, "hud", False, True, "complete", "sfx.win.countup_loop", None, "seek-to-authoritative-state", fast_forward=6),
        anim("anim.win.medium", "win_presented", 1600, "easeOutBack", 70, "overlay", False, True, "complete", "sfx.win.medium", "haptic.light", "skip", conditions={"winTier": "medium"}, fast_forward=3),
        anim("anim.win.big", "win_presented", 2600, "easeOutBack", 80, "overlay", True, True, "complete", "sfx.win.big", "haptic.medium", "seek-to-authoritative-state", conditions={"winTier": "big"}, fast_forward=3),
        anim("anim.win.mega", "win_presented", 3600, "easeOutBack", 85, "overlay", True, True, "complete", "sfx.win.mega", "haptic.heavy", "seek-to-authoritative-state", conditions={"winTier": "mega"}, fast_forward=3),
        anim("anim.win.epic", "win_presented", 4800, "easeOutBack", 90, "fullscreen", True, True, "complete", "sfx.win.epic", "haptic.heavy", "seek-to-authoritative-state", conditions={"winTier": "epic"}, fast_forward=2),
        anim("anim.win.max", "max_win_step", 6000, "easeOutExpo", 100, "fullscreen", True, False, "complete", "sfx.win.max", "haptic.heavy", "seek-to-authoritative-state", conditions={"winTier": "max"}),
        anim("anim.cascade.remove", "cascade_step", 380, "easeInBack", 60, "symbols", True, True, "next_step", "sfx.cascade.remove", None, "seek-to-authoritative-state", fast_forward=3),
        anim("anim.cascade.refill", "cascade_step", 450, "easeOutBounce", 60, "symbols", True, True, "next_step", "sfx.cascade.refill", None, "seek-to-authoritative-state", fast_forward=3),
        anim("anim.cascade.multiplier", "cascade_step", 500, "easeOutElastic", 65, "hud", False, True, "complete", "sfx.cascade.multiplier", "haptic.light", "skip", fast_forward=3),
        anim("anim.env.tier_transition", "feature_pending", 1400, "easeInOutCubic", 88, "background", True, True, "complete", None, None, "skip", fast_forward=2),
        anim("anim.feature.enter", "feature_entry", 2800, "easeInOutCubic", 95, "fullscreen", True, True, "complete", "sfx.feature.enter", "haptic.medium", "seek-to-authoritative-state", conditions={"tierId": "feature"}, fast_forward=2),
        anim("anim.super_feature.enter", "super_feature_entry", 3400, "easeInOutCubic", 95, "fullscreen", True, True, "complete", "sfx.feature.enter", "haptic.heavy", "seek-to-authoritative-state", conditions={"tierId": "super_feature"}, fast_forward=2),
        anim("anim.ultimate_feature.enter", "ultimate_feature_entry", 4200, "easeInOutCubic", 98, "fullscreen", True, True, "complete", "sfx.feature.enter", "haptic.heavy", "seek-to-authoritative-state", conditions={"tierId": "ultimate_feature"}, fast_forward=2),
        anim("anim.feature.round", "feature_round_step", 700, "easeOutQuad", 50, "reels", True, True, "next_step", None, None, "seek-to-authoritative-state", conditions={"tierId": "feature", "stepType": "feature_round"}, fast_forward=4),
        anim("anim.super_feature.round", "feature_round_step", 700, "easeOutQuad", 50, "reels", True, True, "next_step", None, None, "seek-to-authoritative-state", conditions={"tierId": "super_feature", "stepType": "feature_round"}, fast_forward=4),
        anim("anim.ultimate_feature.round", "feature_round_step", 700, "easeOutQuad", 50, "reels", True, True, "next_step", None, None, "seek-to-authoritative-state", conditions={"tierId": "ultimate_feature", "stepType": "feature_round"}, fast_forward=4),
        anim("anim.feature.retrigger", "retrigger_step", 1800, "easeOutElastic", 92, "overlay", True, True, "complete", "sfx.feature.retrigger", "haptic.medium", "seek-to-authoritative-state", conditions={"stepType": "feature_retrigger"}, fast_forward=2),
        anim("anim.feature.summary", "feature_summary", 3200, "easeInOutCubic", 95, "fullscreen", True, True, "summary", "sfx.feature.summary", None, "seek-to-authoritative-state", fast_forward=2),
        anim("anim.maxwin.reached", "max_win_step", 5200, "easeOutExpo", 100, "fullscreen", True, False, "complete", "sfx.win.max", "haptic.heavy", "seek-to-authoritative-state", conditions={"stepType": "max_win_termination"}),
        anim("anim.ui.button_press", "spin_pressed", 120, "easeOutQuad", 20, "hud", False, False, "complete", "ui.button_press", "haptic.light", "skip"),
    ]
    (CFG / "animation-events.json").write_text(json.dumps({"events": events}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote config/animation-events.json ({len(events)} events)")


# -------------------------------------------------------------- audio events
def audio(event_id, file, dur, loop, prio, poly, vol, lufs, ducks, duck_db, interrupt,
          focus, reduced, anim_ref, tool, prompt, bpm=None, key=None):
    e = {
        "eventId": event_id,
        "file": file,
        "format": "ogg",
        "sampleRateHz": 44100,
        "bitrateKbps": 160,
        "durationMs": dur,
        "loop": {"enabled": loop, "startMs": 0, "endMs": dur},
        "priority": prio,
        "polyphonyLimit": poly,
        "volumeDb": vol,
        "loudnessLufsTarget": lufs,
        "ducking": {"ducks": ducks, "amountDb": duck_db, "attackMs": 120 if ducks else 0, "releaseMs": 500 if ducks else 0},
        "interruptBehavior": interrupt,
        "mobileFallback": {"file": file.replace(".ogg", ".m4a"), "format": "m4a"},
        "focusLossBehavior": focus,
        "reducedSensoryBehavior": reduced,
        "associatedAnimationEvent": anim_ref,
        "generationPrompt": {"tool": tool, "prompt": prompt},
    }
    if bpm:
        e["generationPrompt"]["bpm"] = bpm
    if key:
        e["generationPrompt"]["key"] = key
    return e


def build_audio_events() -> None:
    sa, el = "stable-audio-2.5", "elevenlabs-sfx-v2"
    events = [
        audio("music.base", "music/base.ogg", 96000, True, 50, 1, -6, -16, [], 0, "crossfade", "pause", "attenuate", None, sa,
              "Warm industrial-fantasy underscore for a molten glassworks: hammered dulcimer, low tuned percussion, soft furnace-drone pads, glass chimes; patient and hypnotic; seamless loop.", 96, "Am"),
        audio("music.feature", "music/feature.ogg", 80000, True, 55, 1, -6, -16, [], 0, "crossfade", "pause", "attenuate", None, sa,
              "Kindled Spins layer: base theme plus driving frame-drum groove, brighter dulcimer arpeggios and rising ember shimmer; determined energy; same key/tempo family as the base loop; seamless loop.", 96, "Am"),
        audio("music.super_feature", "music/super-feature.ogg", 80000, True, 60, 1, -6, -15, [], 0, "crossfade", "pause", "attenuate", None, sa,
              "Roaring Kiln layer: heavy anvil hits, choir-of-bellows swells, urgent string ostinato over the base groove; forge at full blast; same key/tempo family; seamless loop.", 96, "Am"),
        audio("music.ultimate_feature", "music/ultimate-feature.ogg", 80000, True, 65, 1, -5, -15, [], 0, "crossfade", "pause", "attenuate", None, sa,
              "Starfire Crown layer: full orchestral-hybrid peak with soaring brass, cascading glass-harp runs and thunderous drums; triumphant, incandescent; same key/tempo family; seamless loop.", 96, "Am"),
        audio("amb.forge", "amb/forge.ogg", 60000, True, 20, 1, -14, -28, [], 0, "ignore", "pause", "mute", None, el,
              "Distant glass furnace room tone: soft roaring kiln, occasional glass tinkles and metal creaks, low air rumble, no melody, smooth loop."),
        audio("sfx.reel.spin_loop", "sfx/reel-spin-loop.ogg", 1400, True, 40, 1, -10, -20, [], 0, "steal", "continue", "attenuate", "anim.reel.spin_start", el,
              "Continuous soft mechanical whir of five spinning glass-and-brass reels, airy ticks, dry, loopable."),
        audio("sfx.reel.stop", "sfx/reel-stop.ogg", 300, False, 60, 5, -6, -18, ["music.*"], -3, "steal", "continue", "attenuate", "anim.reel.stop", el,
              "Slot reel stop: solid brass thunk with a short glass clink, tight and dry, no reverb tail."),
        audio("sfx.scatter.land_1", "sfx/scatter-land-1.ogg", 700, False, 80, 1, -4, -16, ["music.*"], -6, "steal", "continue", "attenuate", "anim.scatter.land", el,
              "First Kiln Sigil scatter stinger: single struck glass bell with warm furnace whoosh, medium pitch, dry tail."),
        audio("sfx.scatter.land_2", "sfx/scatter-land-2.ogg", 800, False, 82, 1, -4, -16, ["music.*"], -6, "steal", "continue", "attenuate", "anim.scatter.land", el,
              "Second scatter stinger: two-note rising glass bell motif over a swelling ember crackle, a third higher than stinger one, more urgent."),
        audio("sfx.scatter.land_3", "sfx/scatter-land-3.ogg", 1000, False, 85, 1, -3, -15, ["music.*"], -9, "steal", "continue", "attenuate", "anim.scatter.land", el,
              "Third scatter stinger: triumphant three-note glass bell fanfare with deep kiln boom and bright spark burst, resolving upward; the trigger moment."),
        audio("sfx.scatter.anticipation", "sfx/scatter-anticipation.ogg", 1200, True, 75, 1, -8, -18, ["music.*"], -4, "steal", "continue", "attenuate", "anim.scatter.anticipation", el,
              "Rising tension shimmer: bowed glass drone crescendo with accelerating ember ticks, loopable while the last reels spin."),
        audio("sfx.cascade.remove", "sfx/cascade-remove.ogg", 350, False, 55, 4, -8, -18, [], 0, "steal", "continue", "attenuate", "anim.cascade.remove", el,
              "Winning glass symbols shattering into soft molten sparks, crisp crystalline break, no harsh edge, dry."),
        audio("sfx.cascade.refill", "sfx/cascade-refill.ogg", 400, False, 50, 4, -9, -19, [], 0, "steal", "continue", "attenuate", "anim.cascade.refill", el,
              "New glass symbols dropping into place: quick sequence of soft glass taps landing bottom-up, light and playful, dry."),
        audio("sfx.cascade.multiplier", "sfx/cascade-multiplier.ogg", 500, False, 65, 2, -6, -17, ["music.*"], -4, "steal", "continue", "attenuate", "anim.cascade.multiplier", el,
              "Multiplier step-up chime: bright ascending two-note glass harp pluck with a warm furnace pulse underneath."),
        audio("sfx.win.medium", "sfx/win-medium.ogg", 1400, False, 70, 1, -5, -16, ["music.*"], -6, "steal", "continue", "attenuate", "anim.win.medium", el,
              "Medium win tune: short cheerful glass-marimba phrase with warm brass tail, satisfying but restrained."),
        audio("sfx.win.big", "sfx/win-big.ogg", 2400, False, 80, 1, -4, -15, ["music.*"], -9, "steal", "continue", "attenuate", "anim.win.big", el,
              "Big win fanfare: bold brass-and-glass-harp flourish with kiln-boom accent and sparkling tail, celebratory."),
        audio("sfx.win.mega", "sfx/win-mega.ogg", 3400, False, 85, 1, -3, -14, ["music.*"], -12, "steal", "continue", "attenuate", "anim.win.mega", el,
              "Mega win fanfare: longer, higher brass fanfare with rolling percussion, cascading glass runs and crowd-of-bells finale."),
        audio("sfx.win.epic", "sfx/win-epic.ogg", 4600, False, 90, 1, -3, -14, ["music.*"], -60, "steal", "continue", "attenuate", "anim.win.epic", sa,
              "Epic win celebration piece that takes over the music bus: soaring orchestral-hybrid theme with glass-harp cascades, huge drums and triumphant final chord.", 96, "Am"),
        audio("sfx.win.max", "sfx/win-max.ogg", 6000, False, 100, 1, -2, -14, ["music.*"], -60, "steal", "continue", "unchanged", "anim.win.max", sa,
              "Maximum win anthem, uninterruptible: the game's full theme at maximum intensity with star-burst glass shimmer, deep kiln detonation and a long radiant outro.", 96, "Am"),
        audio("sfx.win.countup_loop", "sfx/win-countup-loop.ogg", 1250, True, 72, 1, -8, -18, ["music.*"], -9, "steal", "continue", "attenuate", "anim.win.countup", el,
              "Win meter count-up loop: rapid soft glass-tick arpeggio, one bar at 96 bpm, seamless loop, energy without harshness."),
        audio("sfx.win.countup_end", "sfx/win-countup-end.ogg", 600, False, 74, 1, -5, -16, [], 0, "steal", "continue", "attenuate", "anim.win.countup", el,
              "Count-up terminator: single resolving glass-bell hit with warm low thump, beat-quantized landing."),
        audio("sfx.result.neutral", "sfx/result-neutral.ogg", 450, False, 30, 1, -12, -24, [], 0, "ignore", "continue", "mute", None, el,
              "Neutral non-celebratory result tick: single muted glass tap, flat pitch, non-melodic, under half a second, clearly distinct from any win sound."),
        audio("sfx.feature.enter", "sfx/feature-enter.ogg", 2600, False, 92, 1, -3, -15, ["music.*"], -12, "steal", "continue", "attenuate", "anim.feature.enter", el,
              "Bonus entry hit: massive kiln door opening with molten roar, deep brass swell and radiant glass choir bloom."),
        audio("sfx.feature.retrigger", "sfx/feature-retrigger.ogg", 1600, False, 88, 1, -4, -15, ["music.*"], -9, "steal", "continue", "attenuate", "anim.feature.retrigger", el,
              "Retrigger stinger: urgent rising bell cascade with a bellows-blast accent, adds-more-rounds excitement."),
        audio("sfx.feature.summary", "sfx/feature-summary.ogg", 2800, False, 85, 1, -4, -15, ["music.*"], -9, "steal", "continue", "attenuate", "anim.feature.summary", el,
              "Feature summary flourish: warm settling brass-and-glass resolution phrase with soft sparkle tail, conclusive."),
        audio("ui.button_press", "ui/button-press.ogg", 120, False, 25, 4, -10, -22, [], 0, "steal", "continue", "mute", "anim.ui.button_press", el,
              "UI button press: tiny brass click with faint glass overtone, instant, dry."),
        audio("ui.menu_open", "ui/menu-open.ogg", 250, False, 25, 2, -10, -22, [], 0, "steal", "continue", "mute", None, el,
              "Menu open whoosh: short soft air movement with a light glass shimmer, subtle."),
        audio("ui.error", "ui/error.ogg", 400, False, 60, 1, -8, -20, ["music.*"], -6, "steal", "continue", "unchanged", None, el,
              "Error notice: muted double thud with dull glass damp, serious but not alarming, no melody."),
    ]
    (CFG / "audio-events.json").write_text(json.dumps({"events": events}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote config/audio-events.json ({len(events)} events)")


# ------------------------------------------------------------ asset manifest
def asset(asset_id, category, purpose, file, fmt="png", res=(1024, 1024), transparent=True,
          atlas="base", variants=None):
    a = {
        "assetId": asset_id,
        "category": category,
        "purpose": purpose,
        "file": file,
        "format": fmt,
        "transparent": transparent,
        "atlasGroup": atlas,
        "deviceVariants": variants or [],
        "provenance": {
            "generator": "imagegen-mcp",
            "prompt": "see prompts/art-prompts.json entry for this assetId (or the shared style block for derivative states)",
            "sourceFiles": [],
            "generatedAt": GENERATED_AT,
            "license": "not yet generated - prompt-only entry; will be generated in-run via imagegen MCP as original work, no third-party IP",
        },
        "status": "prompt-only",
    }
    if fmt in ("png", "webp", "jpg") and res:
        a["resolution"] = {"w": res[0], "h": res[1]}
    return a


def build_asset_manifest() -> None:
    assets = []
    sym = {
        "wild": "WILD Molten Core", "scatter": "SCATTER Kiln Sigil",
        "h1": "H1 Star-Glass Orb", "h2": "H2 Glasswright's Gauntlet",
        "h3": "H3 Crucible of Embers", "h4": "H4 Blowpipe & Shears",
        "l1": "L1 Cobalt Bead", "l2": "L2 Amber Bead", "l3": "L3 Viridian Bead",
        "l4": "L4 Rose Bead", "l5": "L5 Smoke Bead",
    }
    for key, label in sym.items():
        for state in ("static", "win", "blur"):
            assets.append(asset(
                f"img.symbol.{key}.{state}", "symbol",
                f"{label} symbol, {state} state; base and all feature reel sets",
                f"art/symbols/{key}-{state}.png", atlas="base"))
    for i, layer in enumerate(("sky", "mid", "near")):
        assets.append(asset(
            f"img.env.base.layer{i}", "background",
            f"Base-game environment parallax layer {i} ({layer}): the Kilnspire glassworks tower interior",
            f"art/env/base-layer{i}.png", res=(2048, 1024), transparent=(i > 0), atlas=None))
    for tier in ("feature", "super-feature", "ultimate-feature"):
        assets.append(asset(
            f"img.env.{tier.replace('-', '_')}.backdrop", "feature_env",
            f"{tier} tier environment backdrop (world transformation per tier)",
            f"art/env/{tier}-backdrop.png", res=(2048, 1024), transparent=False,
            atlas=None))
    assets += [
        asset("img.frame.reel", "frame", "Reel frame: brass-and-glass kiln aperture around the 5x4 grid", "art/frame/reel-frame.png", res=(1600, 1200), atlas="base"),
        asset("img.frame.cell", "frame", "Grid cell backing tile", "art/frame/cell.png", res=(256, 256), atlas="base"),
        asset("img.frame.cell_win", "frame", "Grid cell win-highlight variant", "art/frame/cell-win.png", res=(256, 256), atlas="base"),
        asset("img.ui.btn_spin.normal", "ui", "Primary spin button, normal state (1 of 10 states; other 9 derived via edit_image)", "art/ui/btn-spin-normal.png", res=(512, 512), atlas="preload"),
        asset("img.ui.btn_spin.pressed", "ui", "Primary spin button, pressed state", "art/ui/btn-spin-pressed.png", res=(512, 512), atlas="preload"),
        asset("img.ui.btn_spin.disabled", "ui", "Primary spin button, disabled state", "art/ui/btn-spin-disabled.png", res=(512, 512), atlas="preload"),
        asset("img.ui.btn_menu", "ui", "Menu button", "art/ui/btn-menu.png", res=(256, 256), atlas="preload"),
        asset("img.ui.btn_autoplay", "ui", "Autoplay button (excluded from builds where autoplay is jurisdiction-disabled)", "art/ui/btn-autoplay.png", res=(256, 256), atlas="preload"),
        asset("img.ui.hud_panel", "ui", "HUD 9-slice panel for balance/bet/win", "art/ui/hud-panel.png", res=(512, 256), atlas="preload"),
        asset("img.ui.buy_panel", "ui", "Bonus-buy menu panel art (three tier cards)", "art/ui/buy-panel.png", res=(1024, 768), atlas="feature"),
        asset("img.vfx.particle_ember", "vfx", "Ember particle texture, grayscale-for-tint", "art/vfx/particle-ember.png", res=(128, 128), atlas="celebrations"),
        asset("img.vfx.particle_glass", "vfx", "Glass shard particle texture, grayscale-for-tint", "art/vfx/particle-glass.png", res=(128, 128), atlas="celebrations"),
        asset("img.vfx.glow_ring", "vfx", "Radial glow ring for win highlights and scatter anticipation", "art/vfx/glow-ring.png", res=(256, 256), atlas="celebrations"),
        asset("img.winplate.big", "ui", "BIG WIN typography plate", "art/winplates/big.png", res=(1024, 512), atlas="celebrations"),
        asset("img.winplate.mega", "ui", "MEGA WIN typography plate", "art/winplates/mega.png", res=(1024, 512), atlas="celebrations"),
        asset("img.winplate.epic", "ui", "EPIC WIN typography plate", "art/winplates/epic.png", res=(1024, 512), atlas="celebrations"),
        asset("img.winplate.max", "ui", "MAX WIN typography plate (10,000x cap)", "art/winplates/max.png", res=(1024, 512), atlas="celebrations"),
        asset("img.meta.icon", "icon", "Game icon 1:1", "art/meta/icon.png", res=(512, 512), transparent=False, atlas=None),
        asset("img.meta.thumbnail", "thumbnail", "Lobby thumbnail 16:9", "art/meta/thumbnail.png", res=(1920, 1080), transparent=False, atlas=None),
        asset("img.meta.splash", "splash", "Splash/loading screen", "art/meta/splash.png", res=(2048, 1152), transparent=False, atlas=None),
    ]
    for mid in ("base", "feature", "super-feature", "ultimate-feature"):
        assets.append(asset(
            f"audio.music.{mid.replace('-', '_')}", "audio_music",
            f"Adaptive music loop: music.{mid.replace('-', '_')} state",
            f"audio/music/{mid}.ogg", fmt="ogg", res=None, transparent=False, atlas=None))
    assets.append(asset("font.hud_numerals", "font", "HUD numeral font (tabular figures, 4.5:1 contrast on playfield)", "fonts/hud-numerals.woff2", fmt="woff2", res=None, transparent=False, atlas=None))
    (CFG / "asset-manifest.json").write_text(json.dumps({"assets": assets}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote config/asset-manifest.json ({len(assets)} assets)")


# ----------------------------------------------------------------- confighash
def canonical(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def finalize_config_hash() -> None:
    gc_path = CFG / "game-config.json"
    gc = json.loads(gc_path.read_text(encoding="utf-8"))
    gc["configHash"] = PLACEHOLDER
    gc_path.write_text(json.dumps(gc, indent=2) + "\n", encoding="utf-8")
    h = hashlib.sha256()
    for path in sorted(CFG.glob("*.json"), key=lambda p: p.name):
        h.update(canonical(json.loads(path.read_text(encoding="utf-8"))).encode("utf-8"))
    gc["configHash"] = "sha256:" + h.hexdigest()
    gc_path.write_text(json.dumps(gc, indent=2) + "\n", encoding="utf-8")
    print("configHash:", gc["configHash"])


if __name__ == "__main__":
    build_reel_sets()
    build_animation_events()
    build_audio_events()
    build_asset_manifest()
    finalize_config_hash()
