# Step 10 — Audio Spec & Prompts

Role: `agents/creative-director.md` · Gate: **G10** (SKILL.md: "`config/audio-events.json`
validates; every animation event's `audioEvent` exists; music states cover base + all
three tiers")

## Objective

Produce the complete adaptive-audio package for the game: a filled
`docs/audio-specification.md`, a schema-valid `config/audio-events.json` covering the
full mission-brief event inventory, an adaptive music-state graph with layered
intensity stems, tool-ready generation prompts in `prompts/audio-prompts.json`, and the
mixing/ducking/loop/priority rules the client's silent-safe audio manager will enforce.
No audio file is required to exist — the game MUST run with zero audio assets — but
every event must be fully specified and regenerable from its prompt.

## Read first

1. `CONVENTIONS.md` §4.3 (audio event ids, win tiers), §8 (audio tool bindings), §9.5
   (never celebrate LDW above `small`), §9.7–§9.8 (accessibility; every audio event
   defines loop points, priority, ducking, polyphony).
2. `schemas/audio-event.schema.json` — the exact field set, id patterns, and enums
   `config/audio-events.json` must satisfy. Note: `priority` is 0–100 where **100 =
   never steal** (the mixer steals lower-priority voices first).
3. `research/11-audio-pipeline.md` — the authority: §1 adaptive architecture, §2
   loudness/ducking numbers, §3 regulatory constraints (UKGC RTS 14E/14F), §4 Web
   Audio/formats, §5 win-tier scaling, §6 generation tools, §7 the full event
   catalogue with per-event values, §8 prompt patterns, and all 20 Design implications.
4. `templates/audio-specification.md` — fill every section.
5. `config/animation-events.json` (step 8 output) — every animation event's
   `audioEvent` field must resolve to an event you define here; and
   `config/jurisdiction-policies.json` if present (quick/turbo/autoplay gating).
6. `docs/game-design-document.md` §1 (theme → music direction) and the mechanics list
   (which conditional events — cascade, multiplier, meter, grid expansion — apply).

## Procedure

### 1. Audio direction & the music-state graph

Write the direction paragraph (genre, instrumentation family, ONE BPM/key family per
state set) in `docs/audio-specification.md` §1, then define the state graph (§2) as a
Mermaid diagram plus a transition table:

- **States:** exactly `music.base`, `music.feature`, `music.super_feature`,
  `music.ultimate_feature` (CONVENTIONS §4.3), plus `silence` (boot/error).
- **Transitions:** base → tier on `anim.<tier>.enter`; tier → base on
  `anim.feature.summary` end. Every transition is **beat-synced**: quantize to the
  next bar boundary (computed from BPM via the shared `AudioContext` clock), cover the
  seam with the tier's entry stinger, crossfade 200–500 ms. Hard-cut (no crossfade) is
  allowed ONLY into `music.ultimate_feature` and the maximum-win piece.
- **Layered intensity (vertical stems):** each state is a stem set sharing IDENTICAL
  BPM, key, time signature, and bar-aligned sample length — document per state:
  `-l1` base loop (always on) + `-l2` percussion layer + `-l3` lead layer. Stems are
  keyed to committed-outcome escalation only: multiplier value or feature progress
  (e.g. l2 at multiplier ≥ 3 or ≥ 50% of free spins consumed, l3 at multiplier ≥ 10
  or last-third progress). Escalation tiers per state go in the §2 table.
- **Integrity rule (mission brief line 1942):** the graph reacts ONLY to the committed
  outcome manifest. No transition, stem, or riser may imply player input can affect an
  already-committed result; slam/turbo cues never fire where
  `jurisdiction-policies.json` forbids them (GB: RTS 14E).

### 2. Build the full event inventory — `config/audio-events.json`

Cover EVERY mission-brief event (lines 1822–1901). Minimum inventory — extend with
mechanic-conditional events your GDD needs, never shrink:

| Family | Events |
|---|---|
| Boot/loading | `sfx.system.boot`, `sfx.system.loading_complete` (doubles as the audio-unlock confirmation) |
| Base bed | `amb.base`, `music.base` (+ stems) |
| Reels | `sfx.reel.spin_start`, `sfx.reel.spin_loop`, `sfx.reel.stop` (pitch +per reel), `sfx.reel.quick_stop` (jurisdiction-gated), `sfx.reel.turbo_result` (jurisdiction-gated) |
| Symbols/scatter | `sfx.wild.land`, `sfx.scatter.land` (pitch-stepped per scatter index), `sfx.scatter.anticipation` (riser), `sfx.scatter.trigger_feature`, `sfx.scatter.trigger_super`, `sfx.scatter.trigger_ultimate` |
| Mechanics (as applicable) | `sfx.cascade.remove` (pitch ladder, cap +7 st), `sfx.cascade.refill`, `sfx.grid.expand`, `sfx.mult.increase`, `sfx.meter.collect` |
| Wins | `sfx.result.neutral` (LDW), `sfx.win.small`, `sfx.win.medium`, `sfx.win.big`, `sfx.win.mega`, `sfx.win.epic`, `sfx.win.max`, `sfx.win.countup_loop`, `sfx.win.countup_end` |
| Features | `sfx.feature.enter`, `music.feature`, `sfx.super_feature.enter`, `music.super_feature`, `sfx.ultimate_feature.enter`, `music.ultimate_feature`, `sfx.feature.retrigger`, `sfx.feature.summary`, `sfx.feature.exit` |
| UI/system | `ui.autoplay_start`, `ui.autoplay_stop` (gated), `ui.button_press`, `ui.toggle`, `ui.denied`, `ui.error`, `ui.reconnect`, `ui.recovered` |

Every event object carries ALL required schema fields, using `research/11` §7 as the
value source: `eventId` · `file` (path under `assets/audio/`) · `format` — primary
**`ogg`** (Opus/Vorbis) with **`m4a` AAC as the `mobileFallback`** entry (covers
Safari/iOS < 18.4; never rely on mp3 file-looping — MP3 frame padding gaps) ·
`sampleRateHz` 48000 (44100 acceptable for short sfx) · `bitrateKbps` (music 96–160,
sfx 64–128) · `durationMs` · `loop` `{enabled, startMs, endMs}` — **sample-accurate**:
loops always play as decoded buffers with explicit `loopStart/loopEnd`; one-shots set
`enabled:false, startMs:0, endMs:durationMs`; derive real points post-generation (e.g.
PyMusicLooper) and record the requested points now · `priority` (bands: music states +
`sfx.win.max` = 100; critical result cues incl. `sfx.result.neutral` and tier triggers
= 80; win/feature sfx = 60; reel/symbol/mechanic = 40; UI + ambience = 20) ·
`polyphonyLimit` (reel stops 5, cascades 2, meter 4, most others 1; global mixer cap
16, steal lowest-priority-oldest) · `volumeDb` · `loudnessLufsTarget` (music beds −18,
ambience −24, sfx −16, big-win stingers −12; every file mastered ≤ −1 dBTP — record
that constraint in the spec §3.2) · `ducking` `{ducks[], amountDb, attackMs,
releaseMs}` per the matrix below · `interruptBehavior` (`crossfade` for music,
`steal` for most sfx, `ignore` for spam-prone UI) · `mobileFallback` `{file, format}` ·
`focusLossBehavior` (`pause` for music/amb/loops; `continue` only for committed-result
one-shots already playing) · `reducedSensoryBehavior` (see step 5) ·
`associatedAnimationEvent` (the `anim.*` id it syncs to, or null for free-running) ·
`generationPrompt` (see step 4 — mirrored into `prompts/audio-prompts.json`).

**Ducking matrix (encode on the DUCKING event's `ducks` field, targets as globs):**
reel stop → `music.*` −3 dB (attack 50 ms, release 150 ms); priority-80 triggers and
win sfx → `music.*` −6 dB (150/500 ms); big-win fanfare + `sfx.win.countup_loop` →
`music.*` −9 to −12 dB held for the sequence (release 800 ms); `sfx.win.epic` mutes
music (its piece takes over); `sfx.win.max` stops everything else; `ui.error` →
`music.*` −6 dB. `sfx.result.neutral` ducks NOTHING (no celebration cues).

Validate the file against `schemas/audio-event.schema.json` before proceeding, and
cross-check: every `audioEvent` referenced by `config/animation-events.json` exists
here, and every `associatedAnimationEvent` you name exists there.

### 3. Win-tier escalation, count-up, and anticipation design

- **Tier ladder** (CONVENTIONS §4.3 thresholds, win/totalBet): `small` < 5 → one-shot
  chime; `medium` ≥ 5 → short tune + ≤ 2 s count-up; `big` ≥ 15 → fanfare +
  `sfx.win.countup_loop` (music −9 dB); `mega` ≥ 40 → bigger fanfare, count-up
  playbackRate +1 semitone + percussion layer; `epic` ≥ 80 → celebration piece takes
  over the music bus; `max` → dedicated uninterruptible piece (priority 100) fired
  with the `max_win_termination` step. Each tier must be audibly "more" than the
  previous (length, harmonic lift, layer count) — a volume bump alone fails review.
- **LDW hard rule (RTS 14F; CONVENTIONS §9.5):** if `totalWinMinor ≤ totalStakeMinor`
  the ONLY result audio is `sfx.result.neutral` — ≤ 600 ms, non-melodic, flat pitch,
  no duck, no count-up; it must be clearly distinguishable from every `sfx.win.*`
  sound. This is a rule in the audio manager, applied globally (safest default).
- **Count-up loop + terminal hit:** `sfx.win.countup_loop` is a 1–2 bar seamless loop
  at the music BPM (bar length divides the BPM grid); pitch-steps per tier;
  `sfx.win.countup_end` is the terminator, beat-quantized to the loop so the landing
  resolves musically. Tap-to-skip jumps straight to the terminator — presentation
  only, never value-changing.
- **Scatter anticipation per tier:** scatter #1 lands with `sfx.scatter.land`;
  from scatter #2, while any scatter-bearing reel still spins, `sfx.scatter.
  anticipation` risers loop per remaining reel (2–3 s, rising pitch/energy, music
  −6 dB), killed instantly by the reel stop. Landing stingers escalate: 3rd scatter →
  `sfx.scatter.trigger_feature`, 4th → `trigger_super` (bigger harmonic lift), 5th →
  `trigger_ultimate` (rarest/biggest, hard-cuts music). Risers are presentation of a
  committed outcome — never weight near-misses in math.

### 4. Generation prompts — `prompts/audio-prompts.json`

Structure: `{ "defaults": {…}, "prompts": [ … ] }`, one entry per audio event,
mirroring each event's `generationPrompt`. Two registers:

- **SFX (ElevenLabs-SFX-style)** — fields: `eventId`, `tool: "elevenlabs-sfx-v2"`,
  `prompt` (short, physical, texture-first), `durationSeconds` (pinned),
  `loop` (bool), `promptInfluence` (0.7–0.9 precise UI cues, 0.3–0.5 ambiences),
  `noMusic: true` for non-musical cues, `outputFormat` (48 kHz). Register example:
  `sfx.reel.stop` → "Mechanical slot reel stop, soft wooden thunk with a light
  metallic click, tight and dry, no reverb tail." (0.3 s). Write EVERY sfx prompt in
  this register: subject + character + texture keywords + dryness/tail note.
- **Music (Stable-Audio-style)** — fields: `eventId`, `tool: "stable-audio-2.5"`,
  `prompt` ordered *genre → key elements → instruments → mood → BPM → key*, `bpm`,
  `key`, `bars`, `seamlessLoop: true`, `instrumental: true`, `durationSeconds`.
  Stems: generate the full-intensity track, then request matching-BPM/key reduced
  arrangements ("same piece, drums and bass only, <BPM>, <key>") — verify bar-length
  equality before shipping. Keep ONE BPM/key family per state so stems and the
  count-up loop stay mixable; tier states escalate BPM/energy (e.g. base 100 →
  feature 110 → super 120 → ultimate 128 BPM, related keys).
- **Post-chain per asset (record in defaults):** trim → loudness-normalize to target →
  limiter ≤ −1 dBTP → dual-encode ogg + m4a → extract sample-accurate loop points →
  write real `loop.startMs/endMs` back into `config/audio-events.json`.
- **Tool policy:** ElevenLabs (paid tier) for sfx, Stable Audio 2.5 for music/ambience;
  Suno/Udio prohibited (litigation — `research/11` §6). Record tool+model+date per
  generated asset in `artifact-manifest.json`. If no audio tool is available, prompts
  are the deliverable; that is a normal green outcome for this step.

### 5. Silent-safe + reduced-sensory + lifecycle rules (spec §§7–9)

- **Silent-safe (CONVENTIONS §8, non-negotiable):** the client audio manager treats
  every asset as optional — missing/failed files log once and no-op; ALL game logic
  proceeds regardless. The game must be fully playable with `assets/audio/` empty.
- **Reduced-sensory mode (settings toggle, persisted):** music + ambience muted; sfx
  collapsed to one result cue per spin at −6 dB; no anticipation risers; count-up
  replaced by the terminator alone. Encode per event via `reducedSensoryBehavior`:
  `mute` (music, amb, risers, countup_loop), `attenuate` (result cues, triggers),
  `unchanged` (only `ui.error`, `ui.reconnect`, `ui.recovered` — essential feedback).
- **Unlock/lifecycle:** one shared `AudioContext`, unlocked on first
  `pointerup`/`click`/`keydown` (never `touchstart`) at the tap-to-continue screen;
  `visibilitychange → hidden` suspends the context and snapshots state; resume only
  if previously unlocked; count-ups recompute from manifest + wall clock on resume.
- **Jurisdiction gating:** `sfx.reel.quick_stop`, `sfx.reel.turbo_result`,
  `ui.autoplay_*` exist in the inventory but fire only where
  `jurisdiction-policies.json` allows; GB profile never fires them.

## Outputs

All under `games/<slug>/`:

- `docs/audio-specification.md` — every template section filled (direction, state
  graph, buses, loudness, ducking matrix, inventory, formats, loop rules, unlock,
  focus loss, reduced-sensory, config sync).
- `config/audio-events.json` — full inventory, validates against
  `schemas/audio-event.schema.json`.
- `prompts/audio-prompts.json` — one tool-ready prompt per event, both registers.
- `assets/audio/` — generated files if a tool was available; otherwise empty (legal).
- `artifact-manifest.json` — updated with any generated audio + provenance.

## Gate checklist — G10 (all must pass before step 11)

- [ ] `config/audio-events.json` validates against the schema; ids match the
      CONVENTIONS §4.3 patterns; no duplicate eventIds.
- [ ] Music states cover EXACTLY `music.base`, `music.feature`,
      `music.super_feature`, `music.ultimate_feature`; each with stem layering, BPM,
      key, and beat-synced transition rules documented in the spec §2.
- [ ] Every `audioEvent` referenced in `config/animation-events.json` resolves to a
      defined event, and every non-null `associatedAnimationEvent` exists there —
      FAIL on any dangling reference in either direction.
- [ ] Full mission-brief inventory present (boot → recovered round, all 8 families in
      Procedure step 2), plus every mechanic-conditional event the GDD requires.
- [ ] Every event defines loop points, priority, ducking, polyphony (CONVENTIONS
      §9.8) plus format+fallback, LUFS target, interrupt, focus-loss,
      reduced-sensory, and a generation prompt — no empty/TBD fields.
- [ ] LDW rule encoded: `sfx.result.neutral` exists (≤ 600 ms, non-melodic, ducks
      nothing) and the spec states that `sfx.win.*` is unreachable when
      win ≤ stake; win-tier ladder maps 1:1 to the §4.3 thresholds; `sfx.win.max`
      is priority 100 and uninterruptible.
- [ ] Count-up loop + terminator are bar-aligned to the music BPM family; scatter
      anticipation risers + 3rd/4th/5th landing stingers escalate per tier; all
      documented as presentation-only.
- [ ] `prompts/audio-prompts.json` covers every event; sfx prompts in the
      ElevenLabs-SFX register (subject/character/duration/texture, no-music flag),
      music prompts in the Stable-Audio register (genre/mood/instruments/BPM/key/
      bars/seamless-loop); Suno/Udio nowhere.
- [ ] Silent-safe + reduced-sensory + jurisdiction gating specified; quick/turbo/
      autoplay cues marked gated.

## Failure handling

- Fix-and-recheck per failing item; max 3 attempts, then record FAILED-GATE G10 with
  evidence in `docs/validation-report.md` and stop honestly.
- Schema validation failure: fix the event object, never loosen the schema.
- Dangling animation↔audio reference: if the animation event is wrong, coordinate a
  step-8 re-entry note in `docs/decision-log.md`; if the audio event is missing, add
  it — never delete the animation's `audioEvent` to silence the check.
- A mechanic in the GDD with no audio family (e.g. jackpot wheel): extend the
  inventory with new `sfx.<context>.<name>` events following the catalogue register;
  log the addition.
- Generated loop that audibly gaps: re-extract loop points on the decoded buffer;
  if the source can't loop cleanly, regenerate with an explicit "seamless loop" and
  exact bar count — never ship an MP3-file-looping workaround.
- Audio tools unavailable or generation fails: prompts-only is a green outcome —
  record what was and wasn't generated honestly in the validation report; never
  fabricate files or provenance.
