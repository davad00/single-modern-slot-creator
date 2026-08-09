# Step 8 — Motion, Animation & VFX Specification

Role: `agents/creative-director.md` · Gate: **G8** (SKILL.md:
"`config/animation-events.json` validates; every event has duration/easing/
skippable/skipTo/blocksInput/audioEvent/reducedMotion/lowPerf/recovery; every
event's trigger maps to a real state-machine state; skip rules cannot alter
outcomes")

## Objective

Produce the game's deterministic motion system: `config/animation-events.json`
(schema-valid, full ~50-state inventory) + `docs/motion-specification.md` (from the
template, filled with THIS game's real values) + the VFX budgets and tier-transition
choreography. No "smooth" or "polished" without a number: every event carries
concrete durations, easings, priorities and variants. All of it is presentation
only — same manifest ⇒ same final balance in every mode (CONVENTIONS §9.2).

## Read first

1. `CONVENTIONS.md` §4.3 (event-id grammar), §4.4 (state set), §9.2/§9.7/§9.8.
2. `schemas/animation-event.schema.json` — read the WHOLE schema; §Procedure 3 lists
   the places it is stricter than the template.
3. `templates/motion-specification.md` — your starting inventory and document shape.
4. `research/09-motion-vfx.md` — Design implications A–I are the timing/budget seed
   values; jurisdictional envelope in Findings §1.
5. `research/13-responsible-design-accessibility.md` §7–§8 + D1/D6 (photosensitivity,
   reduced motion, LDW presentation).
6. Step 3–7 outputs: GDD §6–§14, `config/state-machine.json`,
   `config/spin-presentation.json`, `config/features.json`, `docs/ui-spec.md`
   (Procedure-14 environment-event inventory).
7. `client-template/src/presentation/motionPlayer.ts`, `reelView.ts`,
   `winPresentation.ts` — the timeline engine you are configuring.
8. `prompt.txt` lines 1078–1270 (binding animation-state + invariant checklists).

## Procedure

1. **Build the event inventory.** Start from `templates/motion-specification.md` §3 —
   it is the prompt.txt 1124–1224 state list (~50 states) already mapped to
   CONVENTIONS §4.3 ids. Add design-specific events (environment reactions from
   `docs/ui-spec.md`, character reactions, jackpot/collector events the mechanics
   define) as `anim.<context>.<name>`. Delete a row ONLY when the design provably
   lacks the mechanic (e.g. no cascades) and log it in `docs/assumption-log.md`.
   Hard bounds: ≤ 200 events, every `eventId` unique.
2. **Set the global timing budgets** (seed values from research/09 §A–§C; tune within
   the band, record final numbers in the motion spec §2):

   | Phase | Normal | Quick | Turbo |
   |---|---|---|---|
   | Pre-spin ack (button, symbols dim) | 100 ms | 60 ms | 0 ms |
   | Reel acceleration (per reel, start staggered 0–60 ms) | 150 ms | 90 ms | 0 ms |
   | Min travel at full speed (reel 1) | 1,000 ms | 400 ms | 250 ms |
   | Per-reel stop stagger | 190 ms (band 150–220) | 110 ms | 40 ms |
   | Deceleration + bounce (last reel) | 260 + 170 ms | 160 + 100 ms | 80 ms snap, no bounce |
   | **Spin press → last reel settled** | **≈ 2,600 ms (band 2,400–3,200)** | **≈ 1,250 ms (band 1,100–1,400)** | **≈ 550 ms (band 450–700)** |

   Anticipation: +1,800 ms per teased reel (band 1,500–2,500), max 2 teased reels,
   350 ms micro-pause before the completing symbol; quick mode halves it (900 ms);
   turbo replaces it with a 250 ms highlight pulse. Anticipation fires ONLY from the
   committed manifest (≥ N−1 scatters landed AND completion still possible) — never
   from a random tease chance (CONVENTIONS §9.5).
   Win count-up durations (fixed per tier so speed scales with amount): small
   800 ms, medium 1,500 ms, big 4,000 ms, mega 6,000 ms, epic 8,000 ms, max
   10,000 ms; two-phase pacing for big+ (count at bet/2 per s until display = 20×
   bet or 60% elapsed, then finish on schedule); tick sound ≤ 20/s; count always
   lands exactly on `totalWinMinor`. Celebration overlays: big 4 s, mega 6 s, epic
   8 s, max 10 s — countup crossing a higher threshold escalates without
   restarting; max-win amount display is non-skippable, then the round terminates
   via the `max_win_termination` step. LDW rule: return ≤ stake gets NO win-class
   animation — neutral readout only (research/13 D1).
   Next-spin rule: `nextSpinEnabledAt = max(presentationEndAt, spinStartAt +
   minGameCycleMs)` from `jurisdiction-policies.json`; skipping never shortens it.
3. **Author `config/animation-events.json`.** One entry per inventory row. The schema
   is STRICTER than the template — apply these mappings or validation fails:
   - Allowed fields ONLY (`additionalProperties: false`): eventId, trigger,
     conditions, preconditions, timelineId, durationMs, easing, priority, layer,
     blocksInput, skippable, skipTo, fastForwardFactor, audioEvent, hapticEvent,
     reducedMotionTimelineId, lowPerformanceTimelineId, recoveryPolicy. There is NO
     delay/suspension field — encode delays and suspension behaviour inside the
     timeline definitions in the motion spec §5/§8, not in the config.
   - `timelineId` is kebab-case `^[a-z][a-z0-9-]{1,60}$`: the template's dotted
     `tl.reel.stop` style is INVALID — write `tl-reel-stop`, `tl-reel-stop-rm`
     (reduced motion), `tl-reel-stop-lp` (low performance). Loops: set `durationMs`
     to one loop cycle; the loop flag lives in the timeline definition.
   - `easing` matches `^[a-z][a-zA-Z0-9]{1,40}$`: `backOut(0.6)` is INVALID — name
     parameterized curves (`backOut06`) and define them in the motion spec §1
     signature-easing set.
   - `skipTo` enum is exactly `complete | next_step | summary` — the template's
     "end"/"final value" language maps to `complete`; feature-total skips map to
     `summary`; cascade fast-forward destinations map to `next_step`.
   - `recoveryPolicy` enum is `seek-to-authoritative-state | restart | skip` — map
     template legend: complete/drop → `skip`, seek → `seek-to-authoritative-state`,
     restart → `restart`. Reel motion, cascades, respins, recovery → seek; ambient
     loops, loading spinners → restart; one-shot flourishes → skip.
   - `trigger` is a snake_case state or presentation event that must map to a real
     CONVENTIONS §4.4 state. Canonical mapping: boot→`boot`, loading→`loading`,
     idle→`ready`, spin pressed→`round_requested`, reel accel/motion/decel/stop and
     scatter anticipation→`presenting_initial_result`, win highlight/lines/countup/
     big/mega/epic→`presenting_wins`, cascade remove/fall/refill→
     `presenting_cascades`, tier trigger banners→`feature_pending`, tier
     transitions→`feature_entry`/`super_feature_entry`/`ultimate_feature_entry`,
     round start→`feature_active` (and the super/ultimate `*_active` states),
     retrigger→`feature_retrigger`, max win→`maximum_win`, summary→
     `feature_summary`, return to base→`round_complete`, error→`error`,
     reconnection→`reconnecting`, recovery→`recovering`. Use `conditions`
     (symbolId/tierId/winTier/stepType/minScatterCount) to narrow, and
     `preconditions` for sequencing (e.g. `anim.win.countup` after the last
     `anim.cascade.refill`).
   - `durationMs` ≤ 30,000; `priority` 0–100; `layer` from the schema enum
     (background/reels/symbols/vfx/frame/hud/overlay/fullscreen).
   - `fastForwardFactor` defaults: 1.0 system/regulatory + reel events (mode pacing
     is separate timelines, not acceleration), 2.5 cascades, 3.0 win countups and
     transition flourishes; never > 10.
4. **Assign priorities, haptics, input locks.** Priority bands: system/regulatory
   (error, reconnect, recover, orientation) 100 · settlement (max win, feature
   summary totals) 90 · tier transitions/retriggers 80 · win presentation 60 ·
   reel/grid events 40 · feedback (highlights, meters) 30 · ambience 10. Higher
   preempts lower; preempted timelines snap to end-state. `hapticEvent`:
   `haptic.heavy` for tier triggers + big/mega/epic/max, `haptic.medium` for
   scatter/wild/sticky lands, `haptic.light` for UI acks, `null` elsewhere.
   `blocksInput: true` only where the state machine demands it (transitions,
   reveals, system overlays) — every lock is owned and force-released by its
   timeline's completion/cancel/recovery; document which inputs each lock blocks in
   the motion spec §5.
5. **Coordinate audio naming (step 10 runs in parallel).** Every non-null
   `audioEvent` must use the CONVENTIONS §4.3 grammar (`music.<state>`,
   `sfx.<context>.<name>`, `amb.<name>`, `ui.<name>`) and must exist in
   `config/audio-events.json` once step 10 lands (gate G10 checks the join). Write
   the complete deduplicated list of referenced audio ids, each with a one-line
   sound-design intent, into `docs/motion-specification.md` §"Required audio
   events" — this is the binding handoff to step 10. Music states referenced must
   be exactly `music.base`, `music.feature`, `music.super_feature`,
   `music.ultimate_feature`. Duplicate-audio protection: one audio fire per
   (roundId, stepId, eventId); a skip that passes an audio cue fires it at most
   once or not at all per the interrupt policy.
6. **Write the timeline composition rules** (motion spec §5, implemented by
   `motionPlayer.ts`): single monotonic clock, no setTimeout/setInterval in
   presentation code; presentation consumes the manifest's `steps[].events[]`
   strictly in order; simultaneous events sort by priority band then declaration
   order; every timeline is cancelable (`cancel(reason)` runs the recovery policy)
   and seekable (`seek(t)`/`seekToLabel` — all timeline state is a pure function of
   (manifest step, t)); duplicate-event guard: (roundId, stepId, eventId) plays at
   most once; recovery = re-fetch committed manifest, seek to `resumePointer`
   instantly; backgrounding/device-sleep resume snaps past-due timelines to
   end-state; WebGL context loss rebuilds textures then seeks — never re-requests
   the round.
7. **Copy the skip/fast-forward safety invariants VERBATIM** into motion spec §6 as
   the MUST-NEVER list (prompt.txt 1254–1268). Skipping or accelerating an
   animation must never:
   1. Change an outcome.
   2. Generate another wager.
   3. Skip settlement.
   4. Duplicate settlement.
   5. Duplicate a win.
   6. Alter a feature state.
   7. Move the client ahead of the authoritative outcome.
   8. Cause autoplay to start an overlapping round.
   Implementation rule: skip = `seekToLabel(skipTo)` on the presentation timeline
   only; state transitions are driven by manifest consumption, never by animation
   completion alone. Non-skippable always: reality-check/RG overlays, error states,
   max-win amount, feature-summary total (≥ 1.5 s before dismissible).
8. **Write the VFX spec** (motion spec §7 + device-tier table): particle budgets
   50 concurrent (low tier) / 100 (mid) / 150 (high), pools pre-allocated at peak
   +25%, overflow recycles oldest; shader quality tiers — high: bloom + god rays +
   displacement, mid: bloom only, low: none (sprite-glow substitutes); screen shake
   ≤ 8 px amplitude @1080p-equivalent, ≤ 8 Hz, ≤ 400 ms per burst, ≥ 1,000 ms
   between bursts, amplitude 0 under reduced motion; flash rate ≤ 3/s globally
   (every luminance transition ≥ 10% counts), zero saturated-red flashing, no
   flashing sequence > 5 s, full-field luminance change ≤ 20% per flash.
9. **Choreograph the tier transitions — materially escalating spectacle** (G6
   parity; concrete beats + numbers per tier, themed to the concept):
   - `feature` enter (`anim.feature.enter`, 1,800 ms): background crossfade +
     reel-frame variant + lighting shift + `music.feature`; ≤ 40 particles.
   - `super_feature` enter (2,200 ms): full world swap + camera push-in 4% over
     1,200 ms + 60-particle burst + `music.super_feature` stinger.
   - `ultimate_feature` enter (2,600 ms): fullscreen shader transition (named
     effect, e.g. 800 ms displacement wipe) + shake 6 px/300 ms + 100-particle
     burst + `music.ultimate_feature`; the scene, frame, and lighting must all be
     visibly distinct from both lower tiers.
   All three: skippable after the destination state is visible ≥ 400 ms,
   `skipTo: complete`, reduced-motion variant = ≤ 300 ms crossfade, recovery =
   `skip` (land in the destination state).
10. **Fill `templates/motion-specification.md` → `docs/motion-specification.md`**
    with the game's REAL values: metadata block, motion-language principles named
    for this theme, §2 timing tables (your tuned numbers), §3 inventory mirroring
    the config 1:1, §4–§9, plus the Required-audio-events handoff section. Order of
    truth: manifest > config > doc.
11. **Validate.** Run the client template's config validator if present
    (`bun run validate:config`), else
    `bunx ajv-cli validate --spec=draft2020 -s schemas/animation-event.schema.json
    -d games/<slug>/config/animation-events.json`. Then check: eventId uniqueness;
    every trigger appears in `config/state-machine.json`; every reduced-motion and
    low-performance timelineId is defined in the motion spec; every audioEvent id
    is in the handoff list (mark the audio-events.json join "pending G10" if step
    10 hasn't run). Update `artifact-manifest.json` and the logs.

## Outputs

All under `games/<slug>/` (CONVENTIONS §3):

- `config/animation-events.json` — full inventory, valid against
  `schemas/animation-event.schema.json`.
- `docs/motion-specification.md` — template fully filled with real values,
  including timing tables, VFX budgets, tier choreography, MUST-NEVER list, and
  the Required-audio-events handoff for step 10.
- `docs/game-design-document.md` — §17 Motion summary filled.
- `docs/assumption-log.md`, `docs/decision-log.md` — appended (deleted inventory
  rows, tuned timing bands, tier-choreography choices).
- `artifact-manifest.json` — updated.

## Gate checklist — G8 (all must pass before step 11 consumes this)

- [ ] `config/animation-events.json` validates against the schema (command + result
      recorded); eventIds unique; ≤ 200 events; no stray fields.
- [ ] Inventory covers every prompt.txt 1124–1224 state (template §3 baseline) —
      each deletion has an assumption-log entry proving the mechanic is absent.
- [ ] Every event has durationMs, easing, priority, layer, blocksInput, skippable,
      skipTo, audioEvent (or explicit null), hapticEvent (or null),
      reducedMotionTimelineId, lowPerformanceTimelineId, recoveryPolicy — variants
      are distinct timeline ids, not omissions.
- [ ] Every `trigger` maps to a real state in CONVENTIONS §4.4 /
      `config/state-machine.json`; anticipation events carry the manifest-derived
      conditions (minScatterCount), never a random tease.
- [ ] Timing numbers land in the research/09 bands (normal ≈ 2.4–3.2 s, quick
      ≈ 1.1–1.4 s, turbo ≈ 0.45–0.7 s, stagger 150–220 ms, anticipation
      +1.5–2.5 s/reel, countups/celebrations per tier table) or the deviation is
      logged with a reason.
- [ ] MUST-NEVER list present verbatim; every skippable event's skipTo lands on a
      committed-state label; non-skippable set (RG, error, max-win amount, feature
      total) intact; `nextSpinEnabledAt` rule stated.
- [ ] Tier transitions materially escalate (distinct durations, effects, music
      states per tier); reduced-motion + low-perf variants exist for all three.
- [ ] VFX budgets present with numbers: particle tiers 50/100/150, shader tiers,
      shake ≤ 8 px/≤ 400 ms/≥ 1 s cooldown, flash ≤ 3/s, no saturated-red flash.
- [ ] Required-audio-events handoff written; all ids grammar-valid; music states
      cover base + all three tiers.
- [ ] `docs/motion-specification.md` mirrors the config 1:1 (spot-check 5 events);
      GDD §17 filled.

## Failure handling

- Fix-and-recheck per failing item; max 3 attempts, then record FAILED-GATE G8 with
  evidence in `docs/validation-report.md` and stop honestly.
- Schema validation errors: fix the config first, then re-mirror the motion spec —
  never "fix" by loosening `schemas/animation-event.schema.json`.
- A needed state has no §4.4 trigger: model it as a presentation event inside an
  existing state (e.g. orientation change fires in any state via its snake_case
  presentation-event trigger) — never invent new state-machine states here.
- Audio id needed that the grammar can't express: rename within the grammar; never
  extend the grammar unilaterally — CONVENTIONS wins.
- If timing floors from `jurisdiction-policies.json` conflict with turbo bands,
  turbo stays within its band and the spin-button re-enable pads to the floor —
  presentation compresses, the cycle never does.
