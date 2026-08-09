<!--
TEMPLATE: motion-specification.md — single-modern-slot-creator v1.0.0
Fill every {{placeholder}}. Delete no sections; if a section does not apply,
write "Not applicable — <reason>" and log it in docs/assumption-log.md.
Numeric values in the tables are RECOMMENDED DEFAULTS — tune them per design,
then mirror every row 1:1 into config/animation-events.json (which must
validate against schemas/animation-event.schema.json — gate G8). Event ids are
FIXED per CONVENTIONS §4.3; do not rename them. Every event's trigger must map
to a real state in CONVENTIONS §4.4. Skipping/turbo NEVER changes any value in
the outcome manifest (CONVENTIONS §7, §9.2).
-->

# Motion Specification — {{gameName}}

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

## 1. Motion language principles

<!-- 4–8 named principles that make motion feel like THIS game, not generic
"smooth animations". Each principle: name, rule, where it applies. -->

1. **{{principle1Name}}** — {{principle1Rule}} <!-- e.g. "Weight before speed: everything heavy anticipates 80–120 ms before moving" -->
2. **{{principle2Name}}** — {{principle2Rule}}
3. **{{principle3Name}}** — {{principle3Rule}}
4. **{{principle4Name}}** — {{principle4Rule}}
- **Signature easing set:** {{signatureEasings}} <!-- the named curves used below; implemented in the deterministic in-house timeline engine (no GSAP runtime dep, CONVENTIONS §8) -->
- **Motion hierarchy:** outcome-critical motion (reel stops, win amounts) > feedback motion (landings, highlights) > ambience (idle, parallax). Lower layers never obscure higher ones.

## 2. Global timing table

<!-- Presentation modes alter presentation ONLY (CONVENTIONS §9.2). Jurisdiction
gates may disable quick/turbo/slam (jurisdiction-policies.json). Min round
duration, when mandated, is enforced by padding AFTER settlement display logic,
never by delaying outcome commitment. -->

| Parameter | Normal | Quick | Turbo |
|---|---|---|---|
| Min reel-spin time (reel 1 visible motion) | {{800}} ms | {{400}} ms | {{150}} ms |
| Per-reel stop stagger | {{200}} ms | {{80}} ms | 0 ms (all stop together) |
| Reel deceleration + bounce | {{400}} ms | {{200}} ms | {{80}} ms |
| Spin-press → last reel stopped (5 reels, no anticipation) | ≈ {{2200}} ms | ≈ {{1100}} ms | ≤ {{500}} ms |
| Win presentation before countup | {{600}} ms | {{300}} ms | {{150}} ms |
| Slam stop (player taps during spin) | allowed → seek all reels to `anim.reel.quick_stop` | same | n/a (already instant) |

**Anticipation extension:** when a scatter trigger is live (≥ 2 scatters landed and remaining reels can still complete 3/4/5), each anticipated reel extends its spin by {{anticipationExtMs}} ms ({{1500}}–{{2500}} ms recommended), max {{maxAnticipatedReels}} anticipated reels per spin. Anticipation is presentation only — it fires from the already-committed outcome manifest and never signals a false near-miss beyond the actual reel contents (CONVENTIONS §9.5). In turbo mode anticipation is compressed to ≤ {{500}} ms per reel.

**Win-tier thresholds & countup durations** (thresholds per CONVENTIONS §4.3, win/totalBet; configurable in spin-presentation.json):

| Tier | Threshold | Countup duration (normal) | Quick/turbo | Skippable to |
|---|---|---|---|---|
| small | < 5x | {{800}} ms | {{400}} ms | final value |
| medium | ≥ 5x | {{1500}} ms | {{700}} ms | final value |
| big | ≥ 15x | {{4000}} ms | {{2000}} ms | final value |
| mega | ≥ 40x | {{6000}} ms | {{3000}} ms | final value |
| epic | ≥ 80x | {{8000}} ms | {{4000}} ms | final value |
| max | maximumWinXBet reached | {{10000}} ms | {{5000}} ms | final value (celebration completes, round terminates via `max_win_termination` step) |

LDW rule: any win < stake presents at `small` tier or below — never celebrated above it (CONVENTIONS §9.5).

## 3. Animation-state inventory

<!-- FULL inventory — one row per state required by the mission brief. Mirror
into config/animation-events.json with the complete per-event field set
(trigger, preconditions, delay, priority, layer, haptics, fast-forward,
suspension/context-loss behavior — §5 and §8 define the global defaults).
Legend — skipTo: label/where the timeline seeks when skipped; recovery:
  complete = seek to end instantly · restart = play from 0 · seek = seek to
  authoritative position from manifest/resumePointer · drop = discard silently.
reducedMotion / lowPerf: the variant that replaces the full animation. -->

| State | eventId | timelineId | durationMs | easing | skippable | skipTo | blocksInput | audioEvent | reducedMotion | lowPerf | recovery |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Game boot | `anim.system.boot` | `tl.system.boot` | {{1200}} | quadOut | yes | end | yes | `sfx.system.boot` | fade only | fade only | complete |
| Loading | `anim.system.loading` | `tl.system.loading` | loop | linear | no | — | yes | — | static progress bar | static progress bar | restart |
| Loading complete | `anim.system.loading_complete` | `tl.system.loading_complete` | {{600}} | cubicOut | yes | end | yes | `sfx.system.loading_complete` | fade | fade | complete |
| Idle | `anim.system.idle` | `tl.system.idle` | loop | sineInOut | no | — | no | — | static scene | half-rate ambience | restart |
| Spin pressed | `anim.ui.spin_pressed` | `tl.ui.spin_pressed` | {{120}} | quadOut | no | — | no | `ui.button_press` | none | none | drop |
| Reel acceleration | `anim.reel.spin_start` | `tl.reel.spin_start` | {{250}} | quadIn | no | — | no | `sfx.reel.spin_start` | shortened ({{100}} ms) | same | drop |
| Reel motion | `anim.reel.spin_loop` | `tl.reel.spin_loop` | loop (≥ mode min, §2) | linear | via slam stop | `anim.reel.quick_stop` | no | `sfx.reel.loop` | no motion blur, slow scroll | no blur shader | seek |
| Reel deceleration | `anim.reel.decelerate` | `tl.reel.decelerate` | {{400}}/reel | backOut(0.6) | yes (slam) | `anim.reel.stop` | no | — | shortened | same | seek |
| Reel stop | `anim.reel.stop` | `tl.reel.stop` | {{180}} | backOut | no | — | no | `sfx.reel.stop` | no bounce | no bounce | complete |
| Quick stop | `anim.reel.quick_stop` | `tl.reel.quick_stop` | {{80}} | quadOut | no | — | no | `sfx.reel.quick_stop` | same | same | complete |
| Turbo result | `anim.reel.turbo_result` | `tl.reel.turbo_result` | {{250}} | quadOut | no | — | no | `sfx.reel.turbo_result` | same | same | complete |
| Symbol landing | `anim.symbol.land` | `tl.symbol.land` | {{150}} | quadOut | no | — | no | — | none | none | drop |
| Wild landing | `anim.wild.land` | `tl.wild.land` | {{450}} | elasticOut | yes | end | no | `sfx.wild.land` | glow fade, no flash | no particles | complete |
| Scatter landing | `anim.scatter.land` | `tl.scatter.land` | {{600}} | backOut | no | — | no | `sfx.scatter.land` | glow fade | no particles | complete |
| Multiplier landing | `anim.mult.land` | `tl.mult.land` | {{450}} | backOut | yes | end | no | `sfx.mult.increase` | value pop only | no particles | complete |
| Mystery-symbol reveal | `anim.mystery.reveal` | `tl.mystery.reveal` | {{500}} | cubicInOut | yes | end | yes | `sfx.mystery.reveal` | crossfade swap | crossfade swap | complete |
| Winning-symbol highlight | `anim.win.highlight` | `tl.win.highlight` | {{800}} ×{{2}} loops | sineInOut | yes | end | no | — | static outline | static outline | complete |
| Payline visualization | `anim.win.payline` | `tl.win.payline` | {{600}}/line | quadInOut | yes | end | no | — | static line, no sweep | max {{3}} lines shown | complete |
| Ways visualization | `anim.win.ways` | `tl.win.ways` | {{600}} | quadInOut | yes | end | no | — | static highlight | static highlight | complete |
| Cluster visualization | `anim.win.cluster` | `tl.win.cluster` | {{600}} | quadInOut | yes | end | no | — | static outline | static outline | complete |
| Symbol removal | `anim.cascade.remove` | `tl.cascade.remove` | {{300}} | quadIn | yes | end | yes | `sfx.cascade.remove` | fade out | fade out | complete |
| Symbol explosion | `anim.cascade.explode` | `tl.cascade.explode` | {{350}} | quadOut | yes | end | no | `sfx.cascade.remove` | flash-free fade | no debris particles | complete |
| Cascade | `anim.cascade.fall` | `tl.cascade.fall` | {{400}} | bounceOut | yes | end | yes | — | fade-in-place | linear drop | complete |
| Grid refill | `anim.cascade.refill` | `tl.cascade.refill` | {{400}} | quadOut | yes | end | yes | `sfx.cascade.refill` | fade-in | linear drop | complete |
| Grid expansion | `anim.grid.expand` | `tl.grid.expand` | {{700}} | cubicInOut | yes | end | yes | `sfx.grid.expand` | instant resize + fade | instant resize | complete |
| Respin | `anim.respin.start` | `tl.respin.start` | {{500}} | quadInOut | no | — | yes | `sfx.respin.start` | shortened | same | seek |
| Sticky-symbol lock | `anim.symbol.sticky_lock` | `tl.symbol.sticky_lock` | {{350}} | backOut | yes | end | no | `sfx.symbol.sticky_lock` | glow only | glow only | complete |
| Collection meter | `anim.meter.collect` | `tl.meter.collect` | {{600}} | quadInOut | yes | end | no | `sfx.meter.collect` | counter jump, no flight | no trail | complete |
| Multiplier increase | `anim.mult.increase` | `tl.mult.increase` | {{500}} | backOut | yes | end | no | `sfx.mult.increase` | number swap | no particles | complete |
| Scatter anticipation | `anim.scatter.anticipation` | `tl.scatter.anticipation` | +{{anticipationExtMs}}/reel (§2) | quadInOut | yes | `anim.reel.stop` | no | `sfx.scatter.tension_2` | dim + slow pulse | no shader FX | seek |
| Feature Bonus trigger | `anim.feature.trigger` | `tl.feature.trigger` | {{2000}} | cubicOut | yes | end | yes | `sfx.feature.trigger` | banner fade | fewer particles | complete |
| Super Feature trigger | `anim.super_feature.trigger` | `tl.super_feature.trigger` | {{2500}} | cubicOut | yes | end | yes | `sfx.super_feature.trigger` | banner fade | fewer particles | complete |
| Ultimate Feature trigger | `anim.ultimate_feature.trigger` | `tl.ultimate_feature.trigger` | {{3000}} | cubicOut | yes | end | yes | `sfx.ultimate_feature.trigger` | banner fade | fewer particles | complete |
| Feature transition (enter, per tier) | `anim.feature.enter` | `tl.feature.enter` | {{1800}} | cubicInOut | yes | end | yes | `sfx.feature.enter` + `music.feature` | crossfade | static bg swap | complete |
| Super Feature transition (enter) | `anim.super_feature.enter` | `tl.super_feature.enter` | {{2200}} | cubicInOut | yes | end | yes | `sfx.super_feature.enter` + `music.super_feature` | crossfade | static bg swap | complete |
| Ultimate Feature transition (enter) | `anim.ultimate_feature.enter` | `tl.ultimate_feature.enter` | {{2600}} | cubicInOut | yes | end | yes | `sfx.ultimate_feature.enter` + `music.ultimate_feature` | crossfade | static bg swap | complete |
| Feature-round start | `anim.feature.round_start` | `tl.feature.round_start` | {{600}} | quadOut | yes | end | yes | — | fade | same | seek |
| Retrigger | `anim.feature.retrigger` | `tl.feature.retrigger` | {{1500}} | backOut | yes | end | yes | `sfx.feature.retrigger` | banner fade | fewer particles | complete |
| Feature upgrade | `anim.feature.upgrade` | `tl.feature.upgrade` | {{2000}} | cubicOut | yes | end | yes | `sfx.feature.upgrade` | crossfade | same | complete |
| Big Win | `anim.win.big` | `tl.win.big` | {{4000}} (§2 tier table) | see countup | yes | countup end | yes | `sfx.win.big` | reduced particles, no shake | sprite particles only | complete |
| Mega Win | `anim.win.mega` | `tl.win.mega` | {{6000}} | see countup | yes | countup end | yes | `sfx.win.mega` | reduced particles, no shake | sprite particles only | complete |
| Epic Win | `anim.win.epic` | `tl.win.epic` | {{8000}} | see countup | yes | countup end | yes | `sfx.win.epic` | reduced particles, no shake | sprite particles only | complete |
| Maximum Win | `anim.maxwin.reached` | `tl.maxwin.reached` | {{10000}} | see countup | yes | countup end | yes | `sfx.win.max` | reduced particles, no shake | sprite particles only | complete |
| Win count-up | `anim.win.countup` | `tl.win.countup` | per tier (§2) | quadOut value ramp | yes | final value | no | `sfx.win.<tier>` | instant value + short hold | same | complete |
| Feature summary | `anim.feature.summary` | `tl.feature.summary` | {{3000}} | cubicOut | yes | end | yes | `sfx.feature.summary` | static panel | static panel | complete |
| Return to base game | `anim.feature.exit` | `tl.feature.exit` | {{1500}} | cubicInOut | yes | end | yes | `sfx.feature.exit` + `music.base` | crossfade | static swap | complete |
| Autoplay start | `anim.autoplay.start` | `tl.autoplay.start` | {{300}} | quadOut | no | — | no | `ui.autoplay_start` | none | none | drop |
| Autoplay stop | `anim.autoplay.stop` | `tl.autoplay.stop` | {{300}} | quadOut | no | — | no | `ui.autoplay_stop` | none | none | drop |
| Error | `anim.system.error` | `tl.system.error` | {{400}} | quadOut | no | — | yes | `sfx.system.error` | fade | same | restart |
| Reconnection | `anim.system.reconnect` | `tl.system.reconnect` | loop | linear | no | — | yes | `sfx.system.reconnect` | static spinner | static spinner | restart |
| Round recovery | `anim.system.recover` | `tl.system.recover` | {{800}} | quadOut | no | — | yes | `sfx.system.recover` | fade | same | seek (to `resumePointer`) |
| Orientation change | `anim.system.orientation_change` | `tl.system.orientation_change` | {{250}} | quadInOut | no | — | yes (during relayout) | — | instant relayout | instant relayout | complete |

<!-- Add design-specific rows below (e.g. jackpot award, symbol upgrade,
character reactions). New eventIds must match `anim.<context>.<name>`
(CONVENTIONS §4.3) and every new audioEvent must be added to
audio-specification.md §4 and config/audio-events.json. Delete rows ONLY for
mechanics the design provably lacks (e.g. no cascades) and log the deletion in
docs/assumption-log.md. -->

## 4. Priorities, layers & haptics defaults

| Band | Priority | Layer (z) | Contents | Haptic |
|---|---|---|---|---|
| System | 100 | topmost | error, reconnection, recovery, orientation | — |
| Outcome | 90 | overlay | win countups, maxwin, feature triggers/transitions | `haptic.heavy` (big+ wins, tier triggers) |
| Grid events | 70 | playfield | reel motion/stops, landings, cascades | `haptic.medium` (scatter/wild land) |
| Feedback | 50 | playfield-under | highlights, paylines, meters | `haptic.light` (button, stop) |
| Ambience | 10 | background | idle, parallax, environment loops | — |

Higher priority interrupts lower; equal priority queues FIFO. Haptics fire only where the platform exposes them and reduced-sensory mode is off.

## 5. Timeline engine rules

<!-- Implemented in the client's deterministic timeline engine (own code,
GSAP-style easings, no runtime GSAP dependency — CONVENTIONS §8). -->

1. **Cancelable:** every timeline exposes `cancel(reason)`; cancellation runs the event's `recovery` policy (§3 legend), releases input locks, and emits a single completion callback.
2. **Seekable:** every timeline exposes `seek(t)` / `seekToLabel(label)`; all state applied by a timeline is a pure function of (manifest step, t) so seeking is always safe.
3. **Deterministic ordering:** presentation events for a round are consumed strictly in the order of the outcome manifest's `steps[].events[]`; simultaneous events sort by priority band (§4) then declaration order. No wall-clock races: the scheduler ticks from a single monotonic clock.
4. **Priorities:** a higher-priority timeline may interrupt a lower one; the interrupted timeline runs its recovery policy. Nothing may interrupt System-band timelines except a newer System event.
5. **Duplicate-event protection:** each (roundId, stepId, eventId) triple plays at most once; replays/seeks mark events consumed. Rapid input cannot enqueue the same event twice.
6. **Duplicate-audio protection:** audio triggers are routed through the same consumed-set; a skipped timeline fires its audio at most once (or not at all if `skipTo` passes the audio cue — the audio manager decides per `interrupt` policy in audio-specification.md §4).
7. **Input locking:** `blocksInput: yes` sets a scoped lock (never a global permanent lock); every lock has an owner timeline and is force-released by that timeline's completion, cancel, or recovery — a stuck lock is a P0 defect.
8. **Frame-rate independence:** all durations are wall-time ms, not frames; at low FPS timelines drop visual frames but land on exact end states.

## 6. Skip & fast-forward safety invariants

<!-- Binding invariants from the mission brief; enforced by the G12
equivalence test (same manifest ⇒ identical final balance/win in every mode).
Skipping/fast-forwarding an animation must NEVER: -->

1. Change an outcome.
2. Generate another wager.
3. Skip settlement.
4. Duplicate settlement.
5. Duplicate a win.
6. Alter a feature state.
7. Move the client ahead of the authoritative outcome (`outcome_committed` gates all presentation).
8. Cause autoplay to start an overlapping round.

Implementation rule: skip = `seekToLabel(skipTo)` on the presentation timeline ONLY; game-state transitions (CONVENTIONS §4.4) are driven by manifest consumption, never by animation completion alone. Fast-forward multiplies playback rate ({{ffRate}}×, default {{3}}×) without reordering events.

## 7. Screen shake & photosensitivity limits

| Constraint | Limit |
|---|---|
| Flash rate (any luminance oscillation) | ≤ 3 flashes/s (CONVENTIONS §9.7) |
| Full-field luminance change | ≤ {{20}}% per flash; no full-screen white/black strobes |
| Saturated red flashing | prohibited |
| Screen-shake amplitude | ≤ {{shakeMaxPx}} px ({{12}} px @1080p recommended), ≤ {{shakeMaxMs}} ms ({{400}} ms) per burst |
| Shake frequency | ≤ {{8}} Hz; min {{1000}} ms between bursts |
| Reduced-motion mode | all shake amplitude = 0; flashes replaced by ≤ 1 crossfade |
| Reduced-sensory mode | shake 0 + celebration durations halved + particle density ≤ 25% |

## 8. Backgrounding, device sleep & context-loss recovery

1. **Tab hidden / device sleep:** on `visibilitychange → hidden`, pause all timelines and the audio clock (audio-specification.md §8). On resume, compute elapsed authoritative time: any timeline whose end passed while hidden runs its recovery policy (§3) — presentation catches up instantly; settlement was never blocked on animation.
2. **WebGL/WebGPU context loss:** on `contextlost`, freeze the scheduler and show the System-band recovery overlay; on `contextrestored`, rebuild GPU resources from the asset manifest, then `seek` every active timeline to its authoritative position derived from the committed manifest + `resumePointer` (CONVENTIONS §7). Never re-request the round.
3. **Reconnection/recovery:** `anim.system.recover` seeks presentation to the `resumePointer` step instantly (no replaying of already-presented steps at full length), then resumes normal playback.
4. **Autoplay:** while hidden or recovering, autoplay is suspended and never queues rounds; it resumes only from `round_complete` in the `ready` state with all stop conditions re-evaluated.
5. **Orientation change:** relayout is instant + `anim.system.orientation_change` masks the reflow; an in-flight win countup keeps its value and continues in the new layout.

## 9. Reduced-motion & low-performance global rules

- **Reduced motion** (OS `prefers-reduced-motion` or in-game setting): every event uses its `reducedMotion` variant from §3; parallax, shake, and flash are disabled; all information still conveyed (art-style-bible.md §16).
- **Low performance** (device-profiles.json tier or runtime FPS < {{lowPerfFpsThreshold}} for {{3}} s): switch to `lowPerf` variants — particle budgets ≤ {{lowPerfParticleBudget}}, shader FX off, motion blur off, texture tier down. Switching variants mid-round is safe because variants share timeline labels and durations.
- Both variants are REQUIRED for every event (CONVENTIONS §9.8); "same" is an explicit declaration, not an omission.

## 10. Config synchronisation

Every row in §3 maps 1:1 to an entry in `config/animation-events.json` (schema: `schemas/animation-event.schema.json`) with the full per-event field set: eventId, trigger state, preconditions, timelineId, durationMs, delayMs, easing, priority, layer, blocksInput, skippable, skipTo, fastForward, audioEvent, hapticEvent, reducedMotion, lowPerformance, recovery, suspension & context-loss behavior. Gate G8 fails if this document and the config disagree; fix the config, then this document, in that order of truth: manifest > config > doc.
