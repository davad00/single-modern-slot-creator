# Adaptive Slot Audio Pipeline

Dossier 11 of the single-modern-slot-creator research set.
Generator: `single-modern-slot-creator v1.0.0` · Date: 2026-08-08 · Scope: adaptive
music states, stingers, reel/symbol SFX, anticipation audio, win-tier scaling,
count-up loops, ducking/mixing, loudness targets, Web Audio implementation,
audiosprites, formats/bitrates, mobile constraints, AI audio generation.
Covers prompt.txt §10 "Audio Pipeline" (lines 1818–1942) in full.

Tag legend: **[mandatory]** legally or technically required · **[recommended]**
strong industry norm · **[observed]** seen in shipped products/verified docs ·
**[inferred]** reasoned from evidence, not directly sourced.

---

## Findings

### 1. Adaptive music architecture (base / feature / super / ultimate)

- **[recommended]** The two canonical adaptive-music techniques are **vertical
  layering** (stems at identical tempo/key/length mixed in and out in real time)
  and **horizontal resequencing** (pre-composed sections re-ordered at musical
  boundaries). Vertical layering suits real-time intensity shifts within one
  game state; horizontal resequencing suits discrete state changes (base →
  feature). Best practice blends both: horizontal switches between
  `music.base` / `music.feature` / `music.super_feature` / `music.ultimate_feature`,
  vertical layers inside each state track multiplier/progress intensity. [S1][S2]
- **[mandatory-for-vertical]** All stems of one vertical set MUST share tempo,
  time signature, key, and exact sample length, or layer mixing produces phase
  and bar-drift artifacts. [S1][S2]
- **[observed]** Modern slot studios treat music as tiered escalation: bonus
  triggers transition the music "up" while staying on one coherent musical idea
  (same motif family across tiers); vendors such as Play'n GO run full in-house
  music teams and publish slot soundtracks to streaming services. [S3][S4]
- **[recommended]** Transitions between music states should be **beat-synced**:
  quantize the switch to the next beat or next bar boundary, cover the seam with
  a stinger, and crossfade 200–500 ms. Middleware (Wwise/FMOD/Elias) does this
  natively; on the web the same behaviour is implemented with
  `AudioBufferSourceNode.start(when)` scheduled on the shared `AudioContext`
  clock (`context.currentTime` + time-to-next-bar computed from BPM). [S1][S2][S5]
- **[recommended]** Memory trade-off: vertical layering costs RAM (all stems
  decoded simultaneously — a decoded stereo 44.1 kHz minute ≈ 21 MB as Float32);
  horizontal costs almost nothing extra. On low-end mobile profiles, drop to
  2 stems max per state or pure horizontal switching. [S1][S2]
- **[inferred, from CONVENTIONS §4.3 + middleware norms]** Encode music states as
  exactly four looped beds — `music.base`, `music.feature`,
  `music.super_feature`, `music.ultimate_feature` — each with 2–4 vertical
  intensity stems, plus per-state entry stingers. Multiplier/progress escalation
  inside a feature maps to stem count and a global low-pass/energy macro, not to
  new tracks.
- **[mandatory]** The adaptive system reacts only to the committed outcome
  manifest (server-authoritative). Anticipation/tension audio may accompany
  the *presentation* of an already-committed outcome, but no audio may imply
  that player input (slam, tap, hold) can change the result (prompt.txt:1942;
  CONVENTIONS §9.1–9.2; also see RTS 14E below which bans slam/turbo in GB). [S6]

### 2. Loudness targets and mixing

- **[recommended]** Integrated loudness for mobile/handheld games:
  **−16 LUFS integrated** is the community-consensus target, derived from AES
  streaming guidance (TD1004 → TD1008: −16 to −20 LUFS distribution range;
  speech/assorted content −18 LUFS) with the mobile listening environment
  justifying the loud end. Sony ASWG-R0001, the first formal game loudness
  standard (2012–13), sets **−24 LUFS ±2 for console (PS3/PS4)** and
  **−18 LUFS ±2 for portable (PS Vita)**; Microsoft, Nintendo and G.A.N.G.
  aligned on ~−24 LUFS for home consoles. For a browser slot played mostly on
  phones, target **−16 LUFS integrated (game session average), −18 LUFS for
  music beds alone**. [S7][S8][S9]
- **[recommended]** **True peak ≤ −1.0 dBTP** on every asset and on the master
  bus (both ASWG-R0001 and AES TD1008 specify −1 dBTP max; lossy encoding can
  add inter-sample overshoot beyond that, so leave the headroom). [S7][S9]
- **[recommended]** Loudness range (LRA) ≤ 20 LU per ASWG; for a slot, keep
  practical LRA much tighter (≈ 8–12 LU) because sessions are long and the
  content repetitive. [S8][S9]
- **[recommended]** Per-bus targets that sum to the session target [inferred
  from the above standards + ducking practice]:
  music bus −18 LUFS, ambience bus −24 LUFS, reel/UI SFX bus −16 LUFS
  short-term, win stingers up to −12 LUFS short-term (they are rare and short),
  everything peaking ≤ −1 dBTP pre-master.
- **[recommended]** Ducking amounts: game-audio reference implementations duck
  the bed by **−6 to −9 dB with a 300–500 ms ramp** (LucasArts *Fracture*
  FMOD ducker: −9 dB target over 500 ms; ~4:1 ratio if compressor-style).
  For slots: duck music −6 dB under reel-stop/feature-trigger SFX,
  −9 to −12 dB under big-win fanfares and the count-up loop, restore over
  400–800 ms after the trigger ends. Fixed-range bus duckers (not true
  side-chain compressors) are the norm in FMOD/Wwise and are trivial to
  implement with `GainNode.gain.linearRampToValueAtTime`. [S10]
- **[observed]** Casino floor / slot practice keeps one sound "in focus" at a
  time: reel stops dominate during spin, win rollup dominates during count-up,
  music dominates otherwise. Priority + ducking, not simultaneous loudness. [S11][S12]

### 3. Regulatory constraints that shape the audio spec

- **[mandatory, GB]** **UKGC RTS 14F**: "The gambling system must not celebrate
  a return which is less than or equal to the total stake gambled." Guidance:
  "by 'celebrate' we mean the use of auditory or visual effects that are
  associated with a win are not permitted for returns which are less than or
  equal to the last total amount staked." A brief, *distinguishable* result
  sound (different from the win sound) IS permitted to inform the player of the
  result and balance transfer. In force for slots since 31 Oct 2021; extended
  to **all casino products from 17 Jan 2025**. Enforcement is real: £240,000
  fine to the Betfred.com operator for games celebrating losses as wins /
  failing to show net position. [S6][S13][S14][S15]
- **[mandatory, GB]** **UKGC RTS 14E**: the system "must not permit a customer
  to reduce the time until the result is presented" — turbo, quick spin, slam
  stop banned (slots ≥ 2.5 s per spin since Oct 2021; 14E extended to all
  remote games 17 Jan 2025, excluding non-staked bonus rounds). Audio
  consequence: quick/turbo SFX variants exist in the asset set but are gated by
  `jurisdiction-policies.json`; in GB they are never triggered. [S6][S14][S15]
- **[observed]** Academic audits (Cambridge *Behavioural Public Policy*, "Cue
  the sad trombone") found 17/26 UK-available slots still used win-associated
  sounds after LDW outcomes post-ban — i.e. labs and regulators are actively
  looking at audio, and "technically compliant but celebratory" is a documented
  enforcement risk. Design conservatively: for any `totalWin ≤ totalStake`,
  play a neutral, short (≤ 600 ms), non-melodic acknowledgement tone with no
  count-up celebration, no music duck, no pitch-rise. [S13][S16]
- **[observed]** LDW psychology research (Dixon et al., U. Waterloo): standard
  celebratory rollup sound causes players to miscategorise LDWs as wins and
  overestimate win frequency; negative/neutral sounds reverse it. This is the
  scientific basis for RTS 14F. [S16]
- **[inferred]** No jurisdiction mandates specific loudness for iGaming audio;
  loudness targets are engineering norms, not compliance items. Flash-rate and
  reduced-sensory duties come from accessibility (WCAG 2.2 §2.3) and apply to
  visuals, but a "reduced sensory" audio mode (music off, key SFX only) is an
  industry-observed toggle and required by CONVENTIONS §9.7 parity.

### 4. Web Audio implementation

**Unlock / autoplay policy**
- **[mandatory]** All browsers gate audio behind a user gesture; iOS Safari is
  strictest. The `AudioContext` starts `suspended` and must be `resume()`d
  inside a gesture handler. On iOS the qualifying gesture is **`touchend` /
  `click` — NOT `touchstart`** (unlock fails until the finger lifts). Standard
  pattern: on first `click`/`touchend`/`keydown`, if `state === 'suspended'`
  call `resume()`, then remove the listeners. [S17][S18]
- **[recommended]** Use **one shared `AudioContext`** for the whole game —
  Safari historically caps live contexts at ~4 per page; a single context
  unlocked once serves all buses. Slots conventionally fold this into the
  "tap to continue" load-complete screen, which doubles as the unlock gesture. [S17]
- **[observed]** iOS quirks: hardware mute (ring/silent) switch silences Web
  Audio; iOS 17–18 point releases have shown re-suspension regressions (e.g.
  reports of the context re-locking seconds after unlock on 18.5) — defensively
  re-check `context.state` before every music state change and re-arm unlock
  listeners whenever `state !== 'running'`. [S17][S18]

**Focus loss / visibilitychange**
- **[recommended]** On `visibilitychange → hidden`: call `audioContext.suspend()`
  (halts the audio clock, saves CPU/battery) and remember what was playing
  (`playingOnHide` flag). On `→ visible`: `resume()` only if audio was playing
  and the user had already unlocked audio — never auto-start otherwise. On
  mobile, listen to **both `visibilitychange` and `blur`** (iOS does not fire
  desktop-style blur/focus reliably). Music resumes at the correct game state
  (re-evaluate state machine), not mid-stinger. [S19][S20]
- **[recommended]** Because `suspend()` freezes the context clock, scheduled
  beat-sync events survive suspension coherently; but long count-ups should be
  recomputed from wall-clock on resume so presentation stays in sync with the
  outcome manifest recovery rules. [inferred from S19 + CONVENTIONS §7]

**Library choice**
- **[recommended]** **howler.js** (v2.2.x, ~7 KB gzipped, MIT) is the default
  web-game audio library: Web Audio first with HTML5 Audio fallback, built-in
  audiosprite support, per-sound loop/volume/rate, pooled playback, its own
  mobile-unlock handling (`Howler.autoUnlock`), and codec selection across an
  ordered `src` list. Weekly downloads ~790 k vs ~400 for standalone
  pixi-sound. [S21]
- **[observed]** **@pixi/sound** integrates with the PixiJS asset loader but is
  version-coupled to Pixi releases, modern-browser-only, and much less
  maintained (last commit ≈ 1 year old as of the 2025 comparison). Since the
  client template is PixiJS v8, either works; howler is the safer default and
  keeps audio independent of renderer upgrades. [S21]
- **[recommended]** Raw Web Audio API is reserved for the pieces libraries do
  badly: sample-accurate loop points (`AudioBufferSourceNode.loopStart/loopEnd`),
  beat-scheduled state transitions, bus graph (music/sfx/amb/ui `GainNode`s into
  a master `GainNode` → `DynamicsCompressorNode` limiter → destination), and
  ducking ramps. A thin manager over howler-loaded buffers, or a fully
  hand-rolled ~300-line engine, are both proven approaches. [S5][S21][S22]

**Audiosprites**
- **[recommended]** Combine short SFX into sprite files with
  **`audiosprite`** (tonistiigi/audiosprite, ffmpeg wrapper): one network
  request, one decode, no per-file mobile latency; emits Howler-compatible JSON
  (`--format howler2`). Defaults: 1 s silence gaps, sounds aligned to whole
  seconds (`--ignorerounding` to disable), `--bitrate` default 128,
  `--loop <name>` marks looping tracks, exports mp3/ogg/m4a/ac3/caf. Forks
  (realbluesky/soundsprite) add webm/opus output. [S23]
- **[recommended]** Sprite policy for slots [inferred from S23 + shipped-game
  norms]: one `sfx-core` sprite (reel, symbol, UI ≈ 25–40 cues), one
  `sfx-wins` sprite (win stingers + count-up loop), music and ambience as
  individual files (they loop and stream-decode independently). Keep each
  sprite < 3 MB so decode stays < ~300 ms on low-end Android.

**Formats / codec matrix (2025–2026)**
- **[observed]** iOS Safari ≥ **18.4 (March 2025)** finally plays/records WebM
  Opus (`audio/webm;codecs=opus`), plus Ogg, fragmented MP4, ALAC/PCM. Safari
  11–18.3 decode Opus **only inside CAF**; Ogg-Opus is broken there. Chrome,
  Firefox, Edge, Android have had Opus for years. Safari's native default
  remains AAC in MP4. [S24]
- **[observed]** Codec efficiency: Opus ≈ 30–50 % smaller than MP3 and
  20–30 % smaller than AAC at equal quality; recommended web-game bitrates —
  music **Opus 96–128 kbps** (AAC 128–160 / MP3 160–192 fallback), SFX
  **Opus 48–64 kbps** (MP3 112–128 fallback). Opus downmixes to mono below
  ~19 kbps — stay well above. [S25]
- **[mandatory-technical]** **Never rely on MP3 for seamless loops**: the MP3
  frame structure adds encoder-delay padding at head/tail, producing an audible
  gap in naïve looping. Fixes, in preference order: (1) Opus/Ogg (truly
  gapless); (2) decode any format into an `AudioBuffer` and set
  `loopStart`/`loopEnd` in seconds (sample-accurate, skips the padding);
  (3) OGG `LOOPSTART`/`LOOPEND` sample-position comments for engines that
  honour them. HTML5 `<audio loop>` is never gapless. [S26]
- **[recommended]** Ship every asset in **two encodings**: `webm` (Opus) primary
  + `mp3` (SFX) / `m4a` AAC (music loops) fallback, listed in that order in
  howler `src`. This covers iOS < 18.4 without CAF gymnastics because the
  fallback is universally decodable; loops still loop cleanly because playback
  goes through Web Audio buffers with explicit loop points. [S21][S24][S26]
- **[recommended]** Sample rates: author at 48 kHz (matches ElevenLabs v2
  output and modern device contexts), deliver music at 44.1 or 48 kHz, SFX may
  be 44.1 kHz; the `AudioContext` resamples to hardware rate automatically.
  Bit depth irrelevant post-encode (lossy); masters archived as 24-bit WAV. [S27][S25]

**Mobile constraints**
- **[observed]** Budgets: total audio download for a mobile slot commonly
  2–6 MB compressed; decoded-in-RAM budget matters more (Float32 stereo
  48 kHz ≈ 23 MB/min) — keep simultaneously-decoded music stems ≤ ~90 s
  combined on `device-profiles.json` low tier. [inferred from S25 + §1 memory
  math]
- **[recommended]** Polyphony cap ~8–12 simultaneous voices on low-end mobile;
  howler's internal pool defaults to 5 HTML5 nodes but Web Audio voices are
  cheap — cap per-event polyphony explicitly (see catalogue) and hard-cap the
  mixer at 16 voices, stealing lowest-priority oldest voice. [inferred from
  S21 + middleware norms]

### 5. Win-tier audio scaling and count-up loops

- **[observed]** Industry libraries and floor practice define a standard cue
  family: short win tunes per tier, a musical **rollup/count-up loop** while
  the meter climbs, a **terminator** hit when the meter lands, plus escalating
  fanfares for big/mega/epic celebrations. Rollup speed and pitch traditionally
  rise with win size. [S11][S12]
- **[recommended]** Tier mapping (CONVENTIONS §4.3 thresholds): `small` (< 5×)
  one-shot chime, no count-up celebration if ≤ stake (RTS 14F); `medium` (≥ 5×)
  short tune + 1–2 s count-up; `big` (≥ 15×) fanfare + looping count-up with
  music ducked −9 dB; `mega` (≥ 40×) bigger fanfare, count-up layer 2;
  `epic` (≥ 80×) full celebration music takeover; `max` dedicated one-off
  "maximum win" piece that REPLACES (interrupts) everything. [S11][S12][S6]
- **[recommended]** Count-up loop implementation: a 1–2 bar loop
  (`loopStart/loopEnd`), pitch-stepped +1 semitone per tier escalation
  (`playbackRate` 1.0 → 1.059 → 1.122…) or pre-rendered per-tier variants;
  terminator stinger is beat-quantized to the loop so the landing always
  resolves musically. Skipping the count-up (tap to collect) jumps to the
  terminator instantly — presentation only, never value-changing. [S5][S11]
  [inferred detail]
- **[recommended]** Anticipation audio: when scatter #2 is on screen and a
  scatter-bearing reel is still spinning, per-reel anticipation risers
  (1.5–3 s, pitch/energy rising, one per remaining reel) with reel-slowdown
  layered underneath; classic "near-miss tension" pattern. Because outcomes
  are pre-committed, the riser is presentation-only; do NOT weight near-miss
  frequency in math (CONVENTIONS §9.5). [S11][S12][S28]

### 6. AI audio generation tools (2025–2026) & licensing

- **[observed]** **ElevenLabs SFX v2** (`eleven_text_to_sound_v2`, launched
  2 Sep 2025): text→SFX, up to **30 s**, **48 kHz**, **seamless-loop flag**,
  4 variations per request. API `POST /v1/sound-generation`; params:
  `duration_seconds` 0.5–30 (None = auto), `prompt_influence` 0–1 (default
  0.3; higher = closer to prompt, less variety), `loop` bool (v2 only),
  `output_format` from `mp3_44100_128` … `opus_48000_128`, PCM up to 48 kHz.
  Cost 40 credits/s when duration is pinned. Paid plans (from the ~$5 Starter)
  include royalty-free commercial license, no attribution; free tier requires
  attribution. [S27][S29]
- **[observed]** **Stable Audio 2.5** (Stability AI, Sep 2025): up to 3-minute
  tracks in < 2 s inference, audio inpainting, multi-part structure; trained on
  a **fully licensed dataset** (AudioSparx) — marketed as enterprise/commercially
  safe. Community License: free commercial use below **US $1 M annual
  revenue**; Enterprise license above. Available via Stability API, fal,
  Replicate, ComfyUI. Best for music beds and longer ambiences. [S30][S31]
- **[observed]** **Suno / Udio**: legal position materially changed 2025–26 but
  remains the riskiest option for B2B gambling content. UMG–Udio settlement
  (Oct 2025, per-generation royalties, content-ID obligations), Warner–Suno and
  Warner–Udio settlements (Nov 2025, artist opt-in licensed models); BUT Sony v.
  Suno and UMG v. Suno continue (May 2026 filing expanded to 61,026 recordings,
  statutory exposure > $9 B; Boston hearing Jul 2026), GEMA v. Suno verdict due
  31 Jul 2026 in Munich, plus class actions from independent artists (Nguyen v.
  Suno, N.D. Cal. Nov 2025) and the AFM suit against the labels themselves.
  A paid plan grants contractual commercial-use rights but does not confer
  copyright on fully-AI output nor indemnify downstream use. **Do not use
  Suno/Udio for slot deliverables**; prefer ElevenLabs (SFX) + Stable Audio
  (music) whose training-data provenance is licensed/declared. [S32][S33]
- **[recommended]** Prompt patterns (from Stability's official prompt guides +
  researcher guidance): order = *genre/style → key musical elements →
  instruments → mood → BPM (→ key)*; specify exact BPM for anything that must
  loop or beat-sync ("128 BPM"), name the key for stem families that must layer
  ("D minor"), say "seamless loop" / "30-second loop", and "instrumental" to
  suppress vocals. ElevenLabs SFX prompts work best short and physical
  ("mechanical reel stop, wooden thunk with soft metallic click, dry, no
  reverb tail"), with `prompt_influence` ≈ 0.7–0.9 for precise UI cues and
  ≈ 0.3–0.5 for creative ambiences. [S27][S34]
- **[mandatory-process]** Per CONVENTIONS §8: ALWAYS emit
  `prompts/audio-prompts.json` regardless of tool availability, and the client
  must run silent-safe when files are missing.

### 7. Complete audio-event catalogue (checklist coverage)

Global defaults (apply unless overridden in the table):
**format** dual `webm` (Opus) + fallback (`mp3` for sprited SFX,
`m4a` AAC for music/amb loops); **sample rate** 48 kHz (44.1 kHz acceptable
for sprited SFX); **bitrate** Opus 64 kbps SFX / 96 kbps music, fallback MP3
128 kbps / AAC 160 kbps; **loudness** SFX normalized to −16 LUFS-S, music beds
−18 LUFS-I, stingers ≤ −12 LUFS-S, all ≤ −1 dBTP; **mobile fallback** same
asset via fallback codec + sprite (no separate low-fi assets; low tier just
caps polyphony and drops music stems); **focus-loss** `AudioContext.suspend()`
on `hidden`, state-correct resume on `visible` (never resume before first
unlock gesture); **reduced-sensory mode** music+ambience muted, SFX limited to
one result cue per spin at −6 dB, no anticipation risers, no count-up loop
(single terminator only); **interrupt** "steal-lowest": a new sound at higher
priority steals the oldest lowest-priority voice; music state changes are
beat-quantized crossfades (≤ 500 ms). Priorities: 0 = never steal (music
states, max-win), 1 = critical result cues, 2 = feature/win, 3 = reel/symbol,
4 = UI/ambience.

Volume is the default fader in the mixer (dB rel. bus). Loop points in
`loopStart/loopEnd` seconds on the decoded buffer (sample-accurate). Durations
are targets for generation.

| Event (checklist) | eventId | file | dur | loop | prio | poly | vol | ducking | interrupt / notes | anim event |
|---|---|---|---|---|---|---|---|---|---|---|
| Game boot | `ui.boot` | ui-sprite:boot | 1.5 s | no | 4 | 1 | −6 dB | none | plays once after unlock gesture only | — |
| Loading completion | `ui.load_complete` | ui-sprite:load_complete | 1.2 s | no | 4 | 1 | −6 dB | none | doubles as audio-unlock confirmation | `anim.loading.complete` [inferred id] |
| Base ambience | `amb.base` | amb-base.webm/m4a | 45–60 s | full-file gapless | 4 | 1 | −12 dB | ducked with music bus | fades out in features | — |
| Base music | `music.base` | music-base(-l1/-l2/-l3).webm/m4a | 60–96 s (mult. of bars) | sample loop, intro optional via loopStart | 0 | 1 set | 0 dB bus −18 LUFS | duck −6 dB under prio ≤ 2 SFX, −9/−12 dB under big-win/count-up | beat-quantized crossfade to other music.* | — |
| Spin start | `sfx.reel.spin_start` | core-sprite:spin_start | 0.4 s | no | 3 | 1 | −3 dB | none | retrigger allowed each spin | `anim.reel.spin_start` |
| Reel movement | `sfx.reel.spin_loop` | core-sprite:spin_loop | 2.0 s | sample loop | 3 | 1 | none | stops on last reel stop | `anim.reel.spin_start` |
| Reel stops | `sfx.reel.stop` | core-sprite:stop (pitch var ±2 st per reel) | 0.25 s | no | 3 | 5 | 0 dB | duck music −3 dB 150 ms [inferred] | one per reel; pitch rises reel 1→5 | `anim.reel.stop` |
| Quick-spin reel stop | `sfx.reel.stop_quick` | core-sprite:stop_quick | 0.15 s | no | 3 | 5 | 0 dB | none | jurisdiction-gated (GB: never — RTS 14E) | `anim.reel.stop` |
| Turbo-spin result | `sfx.reel.result_turbo` | core-sprite:result_turbo | 0.5 s | no | 2 | 1 | 0 dB | −3 dB music | single composite cue replacing 5 stops; jurisdiction-gated | `anim.reel.stop` |
| Wild landing | `sfx.symbol.wild_land` | core-sprite:wild_land | 0.8 s | no | 3 | 3 | −2 dB | none | per-wild, cap 3 voices | `anim.symbol.land` |
| Scatter landing | `sfx.scatter.land` | core-sprite:scatter_land (pitch +1 st per count) | 1.0 s | no | 2 | 2 | 0 dB | −3 dB music | pitch/energy scales with scatter index | `anim.scatter.land` |
| 2nd-scatter tension | `sfx.scatter.anticipation` | core-sprite:anticipation_riser | 2.5 s | loops until reel stops | 2 | 2 | 0 dB | music −6 dB | presentation-only riser; killed instantly by reel stop | `anim.scatter.anticipation` |
| 3rd scatter → Feature trigger | `sfx.scatter.trigger_feature` | wins-sprite:trigger_feature | 2.5 s | no | 1 | 1 | +0 dB | music −9 dB | interrupts anticipation; leads into feature entry | `anim.feature.enter` |
| 4th scatter → Super trigger | `sfx.scatter.trigger_super` | wins-sprite:trigger_super | 3.0 s | no | 1 | 1 | +0 dB | music −9 dB | bigger harmonic lift than feature | `anim.super_feature.enter` |
| 5th scatter → Ultimate trigger | `sfx.scatter.trigger_ultimate` | wins-sprite:trigger_ultimate | 3.5 s | no | 1 | 1 | +0 dB | full music stop → stinger | rarest, biggest; hard-cuts music (horizontal) | `anim.ultimate_feature.enter` |
| Cascade | `sfx.cascade.remove` | core-sprite:cascade_remove (pitch +1 st per chain, cap +7) | 0.6 s | no | 3 | 2 | 0 dB | none | pitch ladder resets each spin | `anim.cascade.remove` |
| Grid refill | `sfx.cascade.refill` | core-sprite:cascade_refill | 0.7 s | no | 3 | 2 | none | none | overlaps remove tail | `anim.cascade.refill` |
| Grid expansion | `sfx.grid.expand` | wins-sprite:grid_expand | 1.2 s | no | 2 | 1 | 0 dB | −6 dB music | mechanical + magical layer | `anim.grid.expand` [inferred id] |
| Multiplier increase | `sfx.mult.increase` | core-sprite:mult_up (pitch-stepped) | 0.5 s | no | 2 | 2 | none | none | semitone ladder mirrors multiplier value | `anim.mult.increase` [inferred id] |
| Meter collection | `sfx.meter.collect` | core-sprite:meter_collect | 0.4 s | no | 3 | 4 | −2 dB | none | rapid retrigger allowed (poly 4) | `anim.meter.collect` [inferred id] |
| Standard win (small, > stake) | `sfx.win.small` | wins-sprite:win_small | 1.0 s | no | 2 | 1 | 0 dB | music −6 dB | LDW rule: if win ≤ stake play `sfx.result.neutral` instead | `anim.win.countup` |
| LDW / result-only (win ≤ stake) | `sfx.result.neutral` | core-sprite:result_neutral | 0.5 s | no | 1 | 1 | −4 dB | NO duck | non-melodic tick; RTS 14F: must be distinguishable from win sounds; no count-up celebration | `anim.win.countup` (plain) |
| Medium win | `sfx.win.medium` | wins-sprite:win_medium | 1.5 s | no | 2 | 1 | 0 dB | music −6 dB | short count-up ≤ 2 s | `anim.win.countup` |
| Big Win | `sfx.win.big` + `sfx.win.countup_loop` + `sfx.win.countup_end` | wins-sprite | 2.5 s / 2-bar loop / 1.2 s | countup sample-loop | 1 | 1 | +2 dB | music −9 dB for whole sequence | fanfare → loop (pitch tier 1) → beat-quantized terminator; tap-to-skip jumps to terminator | `anim.win.big` |
| Mega Win | `sfx.win.mega` (+ countup tier 2) | wins-sprite | 3.0 s | as above | 1 | 1 | +2 dB | music −12 dB | countup playbackRate +1 st, adds percussion layer | `anim.win.big` (mega variant) |
| Epic Win | `sfx.win.epic` (+ countup tier 3) | epic-win.webm/m4a | 6–8 s | as above | 1 | 1 | +3 dB | music muted; celebration piece takes over | separate un-sprited file (length) | `anim.win.big` (epic variant) |
| Maximum Win | `sfx.win.max` | max-win.webm/m4a | 8–10 s | no | 0 | 1 | +3 dB | everything else stopped | unique piece; fires with `max_win_termination` step; uninterruptible | `anim.maxwin.reached` |
| Feature Bonus entry | `sfx.feature.enter` | wins-sprite:feature_enter | 2.0 s | no | 1 | 1 | 0 dB | music crossfade | stinger covers base→feature music seam | `anim.feature.enter` |
| Feature Bonus music | `music.feature` | music-feature(-l1/-l2).webm/m4a | 60–90 s | sample loop | 0 | 1 set | −18 LUFS | std duck rules | +10–15 BPM vs base or denser stems; same key family | — |
| Super Feature entry | `sfx.super_feature.enter` | wins-sprite:super_enter | 2.5 s | no | 1 | 1 | 0 dB | music crossfade | — | `anim.super_feature.enter` |
| Super Feature music | `music.super_feature` | music-super(-l1/-l2).webm/m4a | 60–90 s | sample loop | 0 | 1 set | −17 LUFS | std | higher energy: +key-change or double-time percussion | — |
| Ultimate Feature entry | `sfx.ultimate_feature.enter` | wins-sprite:ultimate_enter | 3.0 s | no | 1 | 1 | +2 dB | music hard-cut | — | `anim.ultimate_feature.enter` |
| Ultimate Feature music | `music.ultimate_feature` | music-ultimate.webm/m4a | 60–90 s | sample loop | 0 | 1 set | −16 LUFS | std | maximum intensity; distinct motif variation | — |
| Retrigger | `sfx.feature.retrigger` | wins-sprite:retrigger | 1.5 s | no | 1 | 1 | 0 dB | music −6 dB | shortened trigger motif | `anim.feature.retrigger` |
| Feature summary | `sfx.feature.summary` | wins-sprite:summary | 3.0 s | no | 1 | 1 | 0 dB | music −9 dB | plays under total-win count-up on summary screen | `anim.feature.summary` |
| Return to base game | `sfx.feature.exit` | core-sprite:feature_exit | 1.2 s | no | 2 | 1 | −2 dB | — | covers feature→base music crossfade | `anim.feature.summary` (end) |
| Autoplay start | `ui.autoplay_start` | ui-sprite:autoplay_start | 0.5 s | no | 4 | 1 | −6 dB | none | jurisdiction-gated (GB: autoplay banned) | — |
| Autoplay stop | `ui.autoplay_stop` | ui-sprite:autoplay_stop | 0.5 s | no | 4 | 1 | −6 dB | none | also fires on auto-stop conditions | — |
| Button interactions | `ui.press` / `ui.toggle` / `ui.denied` | ui-sprite | 0.1–0.2 s | no | 4 | 2 | −8 dB | none | ≤ 120 ms latency matters more than fidelity | — |
| Error | `ui.error` | ui-sprite:error | 0.8 s | no | 1 | 1 | −4 dB | music −6 dB | neutral-negative, non-alarming; accompanies error state | `anim.error.show` [inferred id] |
| Reconnection | `ui.reconnect` | ui-sprite:reconnect | 0.6 s | no | 1 | 1 | −4 dB | none | fires entering `reconnecting`; music paused, not stopped | — |
| Recovered round | `ui.recovered` | ui-sprite:recovered | 1.0 s | no | 1 | 1 | −4 dB | none | fires when `recovering` resumes presentation at resumePointer | — |

All rows: focus-loss and reduced-sensory behaviour per the global defaults
block above; mobile fallback = fallback codec of the same asset. Catalogue
IDs conform to CONVENTIONS §4.3; rows marked [inferred id] need matching
entries added in `animation-events.json`.

### 8. Generation prompts (per event family — for `prompts/audio-prompts.json`)

Music (Stable Audio 2.5, structure: genre → elements → instruments → mood →
BPM → key → loop directive [S30][S34]):
- `music.base`: "Instrumental <theme-genre> game music bed, warm and inviting,
  medium energy, <theme instruments>, subtle rhythmic pulse, mood: relaxed
  focus, 100 BPM, D minor, seamless 64-second loop, no vocals, 48kHz stereo."
- `music.feature`: same family "…higher energy, added percussion and lead
  melody, mood: excited, 110 BPM, D minor, seamless loop."
- `music.super_feature`: "…driving percussion, key lift to E minor, urgent
  heroic mood, 120 BPM, seamless loop."
- `music.ultimate_feature`: "…maximum intensity, full ensemble, soaring lead,
  triumphant, 128 BPM, E minor, seamless loop."
- Vertical stems: generate the full-intensity track once, then request
  inpainting/stem variants OR generate matching-BPM/key reduced arrangements
  ("same piece, drums and bass only, 110 BPM, D minor") — verify bar-length
  equality before shipping. [S30][S34] [inferred workflow]

SFX (ElevenLabs SFX v2, short physical descriptions, `prompt_influence`
0.7–0.9, pinned `duration_seconds`, `loop:true` for beds [S27][S29]):
- `sfx.reel.stop`: "Mechanical slot reel stop, soft wooden thunk with a light
  metallic click, tight and dry, no reverb tail." (0.3 s)
- `sfx.scatter.anticipation`: "Rising tension riser, shimmering strings and
  accelerating ticks, builds continuously, suspenseful." (2.5 s, loop:true)
- `sfx.win.countup_loop`: "Fast bright arpeggiated coin-counter loop, playful
  mallets and glissando sparkles, steady 128 BPM, seamless loop." (1.875 s =
  1 bar @128, loop:true)
- `sfx.win.big`: "Triumphant short casino fanfare, brass hit and cascading
  coins, punchy, celebratory, big finish." (2.5 s)
- `sfx.result.neutral`: "Single soft neutral UI tick, short muted marimba
  note, flat, unemotional, dry." (0.4 s)
- `ui.press`: "Tiny soft plastic button click, subtle, clean, dry." (0.12 s)
- `amb.base`: "<theme> ambience bed, gentle air and distant environmental
  detail, calm, unobtrusive, seamless loop." (30 s, loop:true — max duration)

---

## Source register

| id | name | type | pub/rev date | jurisdiction | URL | supports |
|----|------|------|--------------|--------------|-----|----------|
| S1 | The Game Audio Co — "Vertical Layering vs. Horizontal Resequencing" | blog (practitioner) | c. 2023–24 | global | https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing | adaptive techniques, constraints, memory trade-offs |
| S2 | Blips.fm — "Adaptive music in video games" | blog | c. 2023 | global | https://blog.blips.fm/articles/adaptive-music-in-video-games-what-it-is-and-how-it-works | layering/resequencing definitions, middleware |
| S3 | GamblingZone — "Why Do Some Slots Have Adaptive Sound Effects?" | industry-press | c. 2024 | global | https://www.gamblingzone.com/ca/the-zone/casino/why-do-some-slots-have-adaptive-sound-effects/ | slots using vertical layering, tempo/intensity escalation |
| S4 | SDLC Corp — "Sound Design and Music in Slot Game Engagement" | industry-press/vendor | c. 2024 | global | https://sdlccorp.com/post/the-role-of-sound-design-and-music-in-slot-game-engagement/ | slot audio conventions, Play'n GO music team, pacing |
| S5 | W3C Web Audio API 1.1 spec | standard | 2024–25 (WD/CR) | global | https://www.w3.org/TR/webaudio-1.1/ | scheduling, AudioBufferSourceNode loop points, game-audio goals |
| S6 | UKGC Remote Gambling & Software Technical Standards — RTS 14 | regulator | in force 31 Oct 2021; extended 17 Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | RTS 14E (no speed-up), 14F (no LDW celebration), guidance wording |
| S7 | AES TD1008 (v3.13, 2021; AES77 in 2023) — Loudness of Internet Audio Streaming | standard | 2021/2023 | global | https://aes2.org/wp-content/uploads/2024/01/20210924_TD1008_v3.13.pdf | −16…−20 LUFS distribution loudness, −1 dBTP |
| S8 | Sony ASWG-R0001 loudness recommendation (via Coppinger / ASWG summaries) | standard (platform) | 2012–13 | global | https://randycoppinger.com/2013/10/18/loudness-in-interactive-sound-at-sony/ | −24 LUFS console, −18 LUFS portable, ≤ −1 dBTP, LRA ≤ 20 LU |
| S9 | Univ. of Skövde thesis — "A New Approach and Guideline for Loudness in Games" | academic | 2023 | global | https://his.diva-portal.org/smash/get/diva2:1790653/FULLTEXT01.pdf | −16 LUFS mobile reference, −1 dBTP guidance, standards survey |
| S10 | Game Developer — "Game Audio Theory: Ducking" | practitioner article | 2009 (still-current practice) | global | https://www.gamedeveloper.com/audio/game-audio-theory-ducking | −9 dB / 500 ms duck example (Fracture, FMOD) |
| S11 | SONNISS / Fusehive — Universal Slots Sound Effects Library (asset taxonomy) | vendor-docs | 2023–24 | global | https://sonniss.com/sound-effects/universal-slots-sound-effects-library/ | canonical slot cue families: rollups, win tunes, reel stops, anticipation |
| S12 | GDC Vault — Peter Inouye, "Beyond Cha-Ching! Music for Slot Machines" | conference talk | 2013 | US (land-based, transfers) | https://www.gdcvault.com/play/1017949/Beyond-Cha-Ching-Music-for | slot interactive-music practice, reward-driven design |
| S13 | Cambridge BPP — "Cue the sad trombone…" (LDW sound audit) | academic | 2023 | GB | https://www.cambridge.org/core/journals/behavioural-public-policy/article/cue-the-sad-trombone-uk-gambling-regulations-have-not-prevented-the-misuse-of-celebratory-sound-effects-in-online-slots/5EDC0F428BC06371179A8636250BA204 | 17/26 games non-compliant post-ban; 'celebrate' definition loophole |
| S14 | CasinoBeats — "UKGC introduces package of enhanced protections for online slots" | industry-press | 2 Feb 2021 | GB | https://casinobeats.com/2021/02/02/ukgc-introduces-package-of-enhanced-protections-for-online-slots/ | 2.5 s min spin, autoplay/turbo/slam bans, Oct 2021 timeline |
| S15 | Harris Hagan — "Changes to remote games design requirements, 17 Jan 2025" | law-firm brief | 2024-12 | GB | https://www.harrishagan.com/reminder-changes-to-remote-games-design-requirements-come-into-force-on-17-january-2025/ | 14E/14F extension to all casino products, Jan 2025 |
| S16 | Dixon et al., J. Gambling Studies / U. Waterloo LDW sound studies | academic | 2013 & 2020 | global | https://pubmed.ncbi.nlm.nih.gov/24198088/ | negative sounds unmask LDWs; celebratory rollup causes win overestimation |
| S17 | Matt Montag — "Unlock Web Audio in Safari for iOS and macOS" | blog (practitioner) | rev. c. 2023 | global | https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos | touchend-not-touchstart unlock, 4-context cap, silent-switch |
| S18 | miniaudio GitHub issue #759 — iOS 17 audio after first touch | repo issue | 2023–25 | global | https://github.com/mackron/miniaudio/issues/759 | tap-to-start best practice, iOS regressions incl. 18.5 relock report |
| S19 | MDN — Page Visibility API / visibilitychange / AudioContext.suspend() | vendor-docs | current 2025 | global | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API | suspend/resume pattern, playingOnHide flag |
| S20 | Ourcade — "Web Audio Best Practices for Games (Phaser 3)" | blog | 2020 | global | https://blog.ourcade.co/posts/2020/phaser-3-web-audio-best-practices-games/ | visibilitychange+blur on mobile, engine auto-suspend |
| S21 | howler.js docs + npmtrends howler vs pixi-sound | vendor-docs/registry | 2024–25 | global | https://howlerjs.com/ ; https://npmtrends.com/audio-vs-howler-vs-jukebox-vs-pixi-sound-vs-pizzicato | library comparison, sprite support, codec fallback, adoption numbers |
| S22 | Chrome Developers — "Web Audio, Autoplay Policy and Games" | vendor-docs | 2018, still-current policy | global | https://developer.chrome.com/blog/web-audio-autoplay | resume-after-gesture requirement |
| S23 | tonistiigi/audiosprite (+ realbluesky/soundsprite fork) | repo | maintained; fork adds opus/webm | global | https://github.com/tonistiigi/audiosprite | audiosprite CLI options, howler2 JSON, format exports |
| S24 | TestMu/interop + WebKit release notes summaries — Opus/WebM in Safari 18.4 | vendor-docs/press | Mar 2025 | global | https://www.testmuai.com/learning-hub/opus-audio-codec-browser-support/ | iOS 18.4 WebM-Opus support; 11–18.3 CAF-only Opus |
| S25 | AudioUtils Opus bitrate guide + Blips "Game audio files" + Xiph Opus recommended settings | vendor-docs/blog | 2024–26 | global | https://audioutils.com/blog/opus-bitrate-guide ; https://wiki.xiph.org/Opus_Recommended_Settings | bitrate ladders, Opus efficiency vs MP3/AAC, mono-downmix floor |
| S26 | WebAudio spec discussion #2505 + Wikipedia "Gapless playback" + PyMusicLooper | spec-discussion/repo | 2022–24 | global | https://github.com/WebAudio/web-audio-api/discussions/2505 ; https://github.com/arkrow/PyMusicLooper | MP3 padding gap, Opus gapless, LOOPSTART/LOOPEND tags, loop tooling |
| S27 | ElevenLabs docs — Create sound effect API + SFX product guide | vendor-docs | 2025 (v2 model Sep 2025) | global | https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert | params (duration 0.5–30 s, prompt_influence, loop), output formats, 48 kHz |
| S28 | OnlineGamblingExperts — "Psychology of Slot Game Sound Design" | industry-press | 2024 | global | https://www.onlinegamblingexperts.com/psychology-of-slot-game-sound-design/ | anticipation/reel-stop conventions, arousal research summary |
| S29 | blockchain.news AI desk — "ElevenLabs Launches SFX Model v2" | industry-press | 2 Sep 2025 | global | https://blockchain.news/ainews/elevenlabs-launches-sfx-model-v2-high-quality-ai-sound-effects-with-seamless-looping-and-extended-duration | v2 launch date, 30 s max, 48 kHz, looping |
| S30 | Stability AI — "Stable Audio 2.5" announcement + prompt guide | vendor-docs | Sep 2025 | global | https://stability.ai/news-updates/stability-ai-introduces-stable-audio-25-the-first-audio-model-built-for-enterprise-sound-production-at-scale ; https://stability.ai/learning-hub/stable-audio-25-prompt-guide | licensed dataset (AudioSparx), 3-min tracks, inpainting, prompt structure |
| S31 | Stability AI License page / Dynamoi licensing explainer | vendor-docs | 2025 | global | https://stability.ai/license | Community License free < $1M revenue; enterprise above |
| S32 | Forbes (V. Berger) — "Launch, Train, Settle: Suno and Udio licensing deals" | industry-press | 18 Dec 2025 | US | https://www.forbes.com/sites/virginieberger/2025/12/18/launch-train-settle-how-suno-and-udios-licensing-deals-made-copyright-infringement-profitable/ | UMG-Udio & Warner settlements, royalty terms |
| S33 | TechTimes / Hollywood Reporter lawsuit trackers (Sony v. Suno; GEMA; AFM; Nguyen) | industry-press | Jun–Jul 2026 | US/DE | https://www.techtimes.com/articles/320139/20260710/ai-music-training-hits-two-courts-july-suno-faces-verdicts-munich-boston.htm | ongoing litigation, $9B exposure, Jul 2026 hearings |
| S34 | Jordi Pons — "On Prompting Stable Audio" + Stable Audio 3 prompting docs | blog (Stability researcher) / repo | 2024–26 | global | https://www.jordipons.me/on-prompting-stable-audio/ ; https://github.com/Stability-AI/stable-audio-3/blob/main/docs/guides/prompting.md | genre→instruments→mood→BPM prompt order, BPM/key cues, loop prompting |

---

## Uncertainties & legal-review items

1. **RTS 14F 'celebrate' boundary (GB)** — the Commission's guidance permits a
   "brief sound to indicate the result… distinguishable to that utilised with a
   win above total stake", but the Cambridge audit shows labs/academics judge
   "celebratory" subjectively and 65 % of audited games were arguably
   non-compliant. Legal review should sign off the exact `sfx.result.neutral`
   design (length, timbre, absence of melody/pitch-rise) before GB release. [S6][S13]
2. **iOS re-suspension regressions** — the iOS 18.5 "context relocks after ~5 s"
   report is a single practitioner account [S18]; treat the defensive re-arm
   pattern as insurance, and re-test on each iOS point release. [observed→uncertain]
3. **−16 LUFS mobile target** — engineering consensus, not a formal standard;
   no iGaming regulator or test lab (GLI/BMM) mandates loudness numbers as far
   as this research found. [inferred] If an operator platform (aggregator SDK)
   imposes its own loudness/mute rules, those win.
4. **Suno/Udio outputs** — even post-settlement, using them for commercial
   gambling products before the Sony/UMG/GEMA cases resolve (verdicts due from
   Jul 2026 onward) is a legal-review item; current skill policy is "do not
   use". Revisit after Boston and Munich rulings. [S32][S33]
5. **ElevenLabs terms for gambling content** — the commercial license on paid
   plans is broad, but whether ElevenLabs' acceptable-use terms carve out
   real-money gambling was not verifiable from fetched sources. [inferred risk]
   Legal review of the current ToS required before shipping paid-tier assets in
   a real-money title.
6. **audiosprite tool maintenance** — tonistiigi/audiosprite is old but
   functional; its CAF/IMA-ADPCM export is macOS-only and irrelevant for this
   pipeline. If Bun-native tooling is preferred, a thin ffmpeg wrapper script
   reproducing the howler2 JSON is ~50 lines. [observed]
7. **Aggregator/RGS platform audio hooks** — some operator platforms inject
   their own mute/reality-check overlays that must duck or stop game audio;
   no public standard exists. Encode a public `window`-level mute API on the
   audio manager. [inferred from platform norms]

---

## Design implications for the Skill

Rules and defaults downstream authoring agents must encode.

**Architecture**
1. One shared `AudioContext`; bus graph `music | amb | sfx | ui → master →
   DynamicsCompressorNode (limiter: threshold −3 dB, ratio 12:1, knee 0) →
   destination`. All ducking via `GainNode` ramps on the music/amb buses.
2. Music: 4 horizontal states exactly matching `music.base|feature|
   super_feature|ultimate_feature`; each state 1–4 vertical stems sharing BPM,
   key family, bar-aligned length. Transitions beat-quantized (next-bar) with
   entry stingers covering the seam; crossfade 200–500 ms; hard-cut allowed
   only into `ultimate_feature` and `max` win.
3. Escalation inputs are read from the committed outcome manifest step stream
   only. No audio cue may respond to player input in a way that suggests
   outcome influence (no slam-stop audio in GB at all — RTS 14E).
4. The audio manager is **silent-safe**: missing/failed assets log once and
   no-op; the game must be fully playable muted (CONVENTIONS §8).

**Loudness / mix numbers (encode in `audio-specification.md` template)**
5. Session integrated target −16 LUFS ±1; music bed −18 LUFS-I; ambience
   −24 LUFS-I; win stingers ≤ −12 LUFS-S; every file ≤ −1.0 dBTP; LRA ≤ 12 LU.
6. Ducking defaults: prio ≤ 2 SFX duck music −6 dB (attack 150 ms, release
   500 ms); big-win/count-up sequence ducks music −9 to −12 dB for its whole
   duration (release 800 ms); error/reconnect cues duck −6 dB. Reel stops duck
   −3 dB for 150 ms.
7. Voice management: global cap 16; per-event polyphony per catalogue table;
   steal lowest-priority-oldest; priorities 0–4 as defined in §7.

**Formats / delivery**
8. Dual-encode everything: `webm` Opus (music 96 kbps, SFX 64 kbps) +
   fallback (`m4a` AAC 160 kbps for music/amb, `mp3` 128 kbps for sprites);
   howler `src` order `[webm, m4a|mp3]`. 48 kHz authoring, 24-bit WAV masters
   archived in `assets/audio/src/` (not shipped).
9. Loops NEVER depend on MP3 file-looping: all loops play as decoded
   `AudioBuffer`s with explicit `loopStart`/`loopEnd` (seconds, sample-derived)
   recorded per event in `audio-events.json`.
10. Two SFX sprites (`sfx-core`, `sfx-wins`) built with
    audiosprite/`--format howler2` (or equivalent ffmpeg script run via
    `bun run`), each < 3 MB; music/amb as separate streaming files. Total
    compressed audio budget ≤ 6 MB default, ≤ 3 MB on the low
    `device-profiles.json` tier (drop vertical stems first, then ambience).

**Mobile / lifecycle**
11. Unlock on first `pointerup`/`click`/`keydown` (never `touchstart`);
    unlock UI = the "tap to continue" loading-complete screen; re-check
    `context.state` before every music transition and re-arm unlock listeners
    if not `running`.
12. `visibilitychange → hidden`: suspend context, snapshot playing state;
    `→ visible`: resume only if previously unlocked and playing; also handle
    `blur` on mobile. `pagehide` = full stop. Count-ups recompute from
    manifest + wall clock on resume.
13. Respect the iOS hardware mute switch (no workaround); document it in
    known-limitations.

**Regulatory / responsible design**
14. LDW gate is a hard rule in the audio manager, not in content: if
    `totalWinMinor ≤ totalStakeMinor`, the ONLY result audio permitted is
    `sfx.result.neutral` (≤ 600 ms, non-melodic, no pitch rise, no duck, no
    count-up loop); `sfx.win.*` events are unreachable. Applies globally
    (safest-default), mandatory for GB (RTS 14F).
15. Quick/turbo audio variants exist but fire only where
    `jurisdiction-policies.json` allows quick/turbo spin; GB profile never
    fires them (RTS 14E) and autoplay cues are dormant (GB autoplay ban).
16. Reduced-sensory mode (settings toggle, default off): music + ambience
    muted; SFX collapsed to one result cue per spin at −6 dB; no anticipation
    risers; count-up replaced by single terminator. Persist the setting.
17. Win-tier audio maps 1:1 to CONVENTIONS win tiers (small/medium/big/mega/
    epic/max at <5/≥5/≥15/≥40/≥80/max-cap x-bet); `max` audio is priority 0,
    uninterruptible, and accompanies the `max_win_termination` step.

**Generation pipeline**
18. `prompts/audio-prompts.json` always emitted; each entry: eventId, tool
    (`elevenlabs-sfx-v2` | `stable-audio-2.5`), prompt text, duration_seconds,
    loop flag, prompt_influence (SFX), BPM/key (music), output_format
    (`opus_48000_96` music / `opus_48000_64` SFX from ElevenLabs; WAV master
    from Stable Audio then encode), post-processing chain (trim → loudness
    normalize to target → limiter → dual encode → loop-point extraction, e.g.
    PyMusicLooper for music loop points).
19. Tool licensing defaults: ElevenLabs paid tier (commercial, no attribution)
    for SFX; Stable Audio 2.5 (licensed dataset; free commercial < $1M
    revenue) for music/ambience; Suno/Udio prohibited pending litigation
    outcomes. Record tool+model+date per asset in `artifact-manifest.json`.
20. Music prompt template: "Instrumental <genre>, <elements>, <instruments>,
    mood: <mood>, <BPM> BPM, <key>, seamless <bars>-bar loop, no vocals";
    keep one BPM/key family per music-state set so vertical stems and the
    count-up loop stay mixable; count-up loop bars must divide evenly into the
    music BPM grid for beat-quantized terminators.
