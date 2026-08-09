# Motion Specification — Belladonna's Parlour

| Field | Value |
|---|---|
| Game name | Belladonna's Parlour |
| Project slug | belladonna-parlour |
| Game version | 0.1.0 |
| Math version | 0.1.0 |
| Config hash | (pending — set after config/ freeze, step 13; computed per CONVENTIONS §5) |
| Date | 2026-08-08 |
| Generator | single-modern-slot-creator v1.0.0 |

---

## 1. Motion language principles

1. **Glass has weight** — every bottle falls under gravity (cubicIn accelerating drop), lands with a short backOut06 settle (≤ 180 ms, overshoot ≤ 0.35 of a cell), and breaks *outward then down*: shatter reads as mass, never as confetti. Applies to: reel drop, cascade remove/refill, orb landings.
2. **Liquid tells the score** — all multiplier state is shown as fluid: essence streams into the master vial (`anim.orb.collect`), the vial pours onto the win plate (`anim.orb.apply`), the vial overflows at max win. Numbers ride on the liquid, never float free. Applies to: orb set, vial HUD, max-win sequence.
3. **The house descends** — each tier entry moves the camera *deeper and darker*: curtain (parlour, warm candle), stair descent (cellar, copper glow), conservatory doors (moonlit garden). Escalation is spatial and material, not just louder. Applies to: the three tier entries and their exits.
4. **Committed truth only** — no motion ever implies an outcome that is not already in the committed manifest: anticipation fires only from committed scatter counts (§2), win tiers are classified after the LDW mapping, and skip always lands on manifest end-states. Applies to: anticipation, win presentation, skip/turbo.
5. **Elegant menace pacing** — the base loop is unhurried (2,300 ms drop, 3/4-waltz-compatible cadence); tension is built with stillness (350 ms micro-pause before a completing seal) rather than speed. Applies to: base drop, anticipation, tier trigger banners.

- **Signature easing set** (implemented in the deterministic in-house timeline engine, no GSAP runtime dependency — CONVENTIONS §8): `linear`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`, `cubicInOut`, `sineInOut`, `backOut06` (back ease-out, overshoot parameter 0.6, settle ≤ 180 ms), `bounceOut` (two diminishing bounces, second ≤ 30 % of first).
- **Motion hierarchy:** outcome-critical motion (column settles, win amounts, vial value) > feedback motion (landings, highlights, dial ticks) > ambience (candle flicker, rain, parallax). Lower layers never obscure higher ones; the HUD safe-area (balance/bet/win, session clock, net position) is never covered by any VFX layer.

## 2. Global timing table

Belladonna's Parlour is a 6×5 **drop-and-cascade** grid (no revolving reel travel): a spin clears the cabinet and drops six columns of new bottles, columns-major, left to right. "Reel" event ids are the CONVENTIONS §4.3 canonical ids applied to columns.

| Phase | Normal | Quick | Turbo |
|---|---|---|---|
| Pre-spin ack (button press, symbols dim) | 100 ms | 60 ms | 0 ms |
| Cabinet clear-out (`anim.reel.spin_start`) | 350 ms | 200 ms | 80 ms |
| Per-column drop (fall + pre-settle), per column | 450 ms | 260 ms | 140 ms |
| Per-column start stagger (columns-major, 6 columns) | 190 ms | 110 ms | 40 ms |
| Column settle bounce (`anim.reel.stop`) | 180 ms | 110 ms | 60 ms snap, no bounce |
| **Spin press → last column settled (no anticipation)** | **≈ 2,300 ms** | **≈ 1,200 ms** | **≈ 600 ms** |
| Win presentation hold before countup | 600 ms | 300 ms | 150 ms |
| Cascade step: shatter → settle → step pause | 380 + 480 + 250 ms | 380 + 480 + 120 ms (pauses halved) | fast-forward ×2.5 |
| Slam stop (where `animationSkipEnabled`) | all columns settle to committed grid in 150 ms (`anim.reel.quick_stop`) | same | n/a (already near-instant) |

Deviation note (G8): the research/09 normal band is 2,400–3,200 ms for revolving 5-reel spins. GDD §14 mandates ≈ 2,300 ms for this game's drop presentation (no reel-travel phase to pad). Quick (1,200 ms, band 1,100–1,400) and turbo (600 ms, band 450–700) are in-band. Logged here as the authoritative rationale; the GDD is the design source of truth.

**Anticipation extension:** when a tier trigger is still live from the committed manifest (≥ 2 Parlour Seals already visible AND the not-yet-settled columns can still complete 3/4/5 — GDD §7 anticipation rule), each anticipated column extends its drop by **1,800 ms** (band 1,500–2,500), **max 2 anticipated columns per spin**, with a **350 ms micro-pause** before the completing seal settles. Anticipation is presentation only — it fires from the already-committed outcome manifest (`minScatterCount: 2` condition) and never signals a false near-miss beyond the actual column contents (CONVENTIONS §9.5); it never fires on dead boards. Quick mode halves the extension (900 ms); turbo replaces it with a 250 ms static highlight pulse on the completing column.

**Win-tier thresholds & countup durations** (thresholds per CONVENTIONS §4.3, win/totalBet; configurable in spin-presentation.json):

| Tier | Threshold | Countup duration (normal) | Quick/turbo | Skippable to |
|---|---|---|---|---|
| small | < 5x | 800 ms | 400 ms | final value |
| medium | ≥ 5x | 1,500 ms | 700 ms | final value |
| big | ≥ 15x | 4,000 ms | 2,000 ms | final value |
| mega | ≥ 40x | 6,000 ms | 3,000 ms | final value |
| epic | ≥ 80x | 8,000 ms | 4,000 ms | final value |
| max | 10,000x cap reached | 10,000 ms | 10,000 ms (never compressed) | not skippable (amount plate); round terminates via `max_win_termination` step |

Countup engine rules: fixed duration per tier (increment speed scales with amount so end time is constant); two-phase pacing for big+ (count at totalBet/2 per second until the display reaches 20× bet or 60 % of the tier duration has elapsed, then divide the remainder over the remaining time); tick audio rate-limited ≤ 20/s; the counter always lands exactly on `totalWinMinor` (integer math, no float drift). A countup that crosses a higher tier threshold mid-roll escalates the celebration without restarting the count. `config/animation-events.json` stores the small-tier baseline (800 ms) on `anim.win.countup`; the timeline engine stretches the same timeline to the tier duration from this table — one event, tier-scaled playback, values from the manifest only.

**LDW rule (unconditional, all policies):** any return ≤ total stake presents at the neutral `small` tier only — `anim.win.small` is a neutral amount readout on the HUD (no plaque, no particles, no celebration vocabulary; audio `sfx.win.small` is a brief neutral chime). The win-tier classifier maps win ≤ stake → `small` **before** the `winTier` condition on any win event is evaluated, so `anim.win.medium/big/mega/epic` can never fire for an LDW (their `winTier` conditions are unreachable for such returns). Orb collect/apply never plays celebration framing when the multiplied total is still ≤ stake (GDD §6.2 A9: orbs on losing spins pay/bank nothing and produce no collect event at all).

**Next-spin rule:** `nextSpinEnabledAt = max(presentationEndAt, spinStartAt + minGameCycleMs)` with `minGameCycleMs` from `config/jurisdiction-policies.json` (GDD §21: 2,500 ms gb/on, 3,000 ms se/es, 5,000 ms de and restricted-default). Skipping or fast-forwarding never shortens it — presentation compresses, the game cycle never does. Where a cycle floor applies, quick/turbo stay within their presentation bands and the spin button re-enable pads to the floor.

## 3. Animation-state inventory

Legend — cond: schema `conditions` filters; FF: `fastForwardFactor`; RM/LP: reduced-motion / low-performance variant timelines (always `<timelineId>-rm` / `<timelineId>-lp`); recovery: `seek` = `seek-to-authoritative-state`. This table mirrors `config/animation-events.json` **1:1** (50 events); the config is the order of truth above this document.

| State / moment | eventId | trigger | cond | timelineId | ms | easing | prio | layer | blocks | skip | skipTo | FF | audioEvent | haptic | recovery |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Game boot | `anim.system.boot` | boot | — | tl-system-boot | 1200 | cubicOut | 100 | fullscreen | yes | yes | complete | 1.0 | — | — | skip |
| Loading (loop cycle) | `anim.system.loading` | loading | — | tl-system-loading | 1600 | linear | 100 | fullscreen | yes | no | complete | 1.0 | — | — | restart |
| Loading complete | `anim.system.loading_complete` | loading | pre: loading | tl-system-loading-complete | 600 | cubicOut | 100 | fullscreen | yes | yes | complete | 1.0 | — | — | skip |
| Idle / attract (loop cycle) | `anim.system.idle` | ready | — | tl-system-idle | 8000 | sineInOut | 10 | background | no | no | complete | 1.0 | amb.parlour | — | restart |
| Spin pressed | `anim.ui.spin_pressed` | round_requested | — | tl-ui-spin-pressed | 120 | quadOut | 30 | hud | no | no | complete | 1.0 | ui.click | light | skip |
| Cabinet clear-out | `anim.reel.spin_start` | round_requested | — | tl-reel-spin-start | 350 | quadIn | 40 | reels | no | no | complete | 1.0 | — | — | seek |
| Columns-major drop (6 col × 190 ms stagger + 450 ms fall) | `anim.reel.drop` | presenting_initial_result | stepType initial_result | tl-reel-drop | 1580 | cubicIn | 40 | reels | no | yes | complete | 1.0 | — | — | seek |
| Column settle bounce | `anim.reel.stop` | presenting_initial_result | stepType initial_result · pre: drop | tl-reel-stop | 180 | backOut06 | 40 | reels | no | no | complete | 1.0 | sfx.reel.stop | — | seek |
| Slam-stop settle (jurisdiction-gated) | `anim.reel.quick_stop` | presenting_initial_result | stepType initial_result | tl-reel-quick-stop | 150 | quadOut | 40 | reels | no | no | complete | 1.0 | sfx.reel.stop | — | seek |
| Turbo result present | `anim.reel.turbo_result` | presenting_initial_result | stepType initial_result | tl-reel-turbo-result | 250 | quadOut | 40 | reels | no | no | complete | 1.0 | sfx.reel.stop | — | seek |
| Symbol landing | `anim.symbol.land` | presenting_initial_result | — | tl-symbol-land | 150 | quadOut | 30 | symbols | no | no | complete | 1.0 | sfx.symbol.land | — | skip |
| Seal (scatter) landing | `anim.scatter.land` | presenting_initial_result | symbolId SCATTER | tl-scatter-land | 600 | backOut06 | 40 | symbols | no | no | complete | 1.0 | sfx.scatter.land | medium | skip |
| Seal anticipation (committed-outcome gated) | `anim.scatter.anticipation` | presenting_initial_result | SCATTER · minScatterCount 2 | tl-scatter-anticipation | 1800 | quadInOut | 60 | vfx | no | yes | complete | 1.0 | sfx.scatter.anticipation | — | seek |
| Bottle shatter (cascade remove) | `anim.cascade.remove` | presenting_cascades | stepType cascade | tl-cascade-remove | 380 | quadIn | 40 | symbols | no | yes | next_step | 2.5 | sfx.cascade.shatter | — | seek |
| Cascade refill (fall + settle) | `anim.cascade.refill` | presenting_cascades | stepType cascade · pre: remove | tl-cascade-refill | 480 | bounceOut | 40 | symbols | no | yes | next_step | 2.5 | sfx.cascade.settle | — | seek |
| Essence orb lands (value plate ≥ 24 px) | `anim.orb.land` | presenting_initial_result | symbolId MULT | tl-orb-land | 450 | backOut06 | 40 | symbols | no | no | complete | 1.0 | sfx.orb.land | light | skip |
| Essence orb lands on refill | `anim.orb.land_refill` | presenting_cascades | MULT · stepType cascade | tl-orb-land-refill | 450 | backOut06 | 40 | symbols | no | yes | next_step | 2.5 | sfx.orb.land | light | skip |
| Essence streams to master vial | `anim.orb.collect` | presenting_wins | — | tl-orb-collect | 900 | cubicInOut | 60 | vfx | no | yes | complete | 3.0 | sfx.orb.collect | — | skip |
| Vial pours onto win plate (×O / ×P) | `anim.orb.apply` | presenting_wins | pre: collect | tl-orb-apply | 800 | backOut06 | 60 | vfx | no | yes | complete | 3.0 | sfx.orb.apply | — | skip |
| Master-vial HUD value update | `anim.hud.vial_update` | presenting_wins | pre: collect | tl-hud-vial-update | 400 | quadOut | 30 | hud | no | no | complete | 3.0 | — | — | skip |
| Winning-symbol highlight | `anim.win.highlight` | presenting_wins | — | tl-win-highlight | 700 | sineInOut | 30 | symbols | no | yes | complete | 3.0 | — | — | skip |
| Win countup (tier-scaled, §2) | `anim.win.countup` | presenting_wins | pre: refill, apply | tl-win-countup | 800 | quadOut | 60 | hud | no | yes | complete | 3.0 | — (tick loop via audio manager: sfx.win.countup.loop) | — | skip |
| Countup terminal tick | `anim.win.countup_end` | presenting_wins | pre: countup | tl-win-countup-end | 200 | quadOut | 60 | hud | no | no | complete | 3.0 | — (sfx.win.countup.end via audio manager) | — | skip |
| Small win (neutral readout; the only LDW presentation) | `anim.win.small` | presenting_wins | winTier small | tl-win-small | 800 | quadOut | 60 | hud | no | yes | complete | 3.0 | sfx.win.small | — | skip |
| Medium win | `anim.win.medium` | presenting_wins | winTier medium | tl-win-medium | 1500 | cubicOut | 60 | vfx | no | yes | complete | 3.0 | sfx.win.medium | — | skip |
| Big win plaque | `anim.win.big` | presenting_wins | winTier big | tl-win-big | 4000 | cubicOut | 60 | overlay | yes | yes | complete | 3.0 | sfx.win.big | heavy | skip |
| Mega win plaque | `anim.win.mega` | presenting_wins | winTier mega | tl-win-mega | 6000 | cubicOut | 60 | overlay | yes | yes | complete | 3.0 | sfx.win.mega | heavy | skip |
| Epic win plaque | `anim.win.epic` | presenting_wins | winTier epic | tl-win-epic | 8000 | cubicOut | 60 | overlay | yes | yes | complete | 3.0 | sfx.win.epic | heavy | skip |
| Max win — vial overflow, house lights up | `anim.maxwin.reached` | maximum_win | winTier max · stepType max_win_termination | tl-maxwin-reached | 10000 | cubicOut | 90 | fullscreen | yes | **no** | complete | 1.0 | sfx.maxwin.reached | heavy | seek |
| Tier trigger banner — 3 seals | `anim.feature.trigger` | feature_pending | tierId feature · minScatterCount 3 | tl-feature-trigger | 1600 | cubicOut | 80 | overlay | yes | yes | complete | 3.0 | — | heavy | skip |
| Tier trigger banner — 4 seals | `anim.super_feature.trigger` | feature_pending | tierId super_feature · minScatterCount 4 | tl-super-feature-trigger | 2000 | cubicOut | 80 | overlay | yes | yes | complete | 3.0 | — | heavy | skip |
| Tier trigger banner — 5+ seals | `anim.ultimate_feature.trigger` | feature_pending | tierId ultimate_feature · minScatterCount 5 | tl-ultimate-feature-trigger | 2400 | cubicOut | 80 | overlay | yes | yes | complete | 3.0 | — | heavy | skip |
| The Tasting — curtain entry | `anim.feature.enter` | feature_entry | tierId feature | tl-feature-enter | 1800 | cubicInOut | 80 | fullscreen | yes | yes | complete | 3.0 | sfx.feature.enter | heavy | skip |
| The Distillery — cellar descent | `anim.super_feature.enter` | super_feature_entry | tierId super_feature | tl-super-feature-enter | 2200 | cubicInOut | 80 | fullscreen | yes | yes | complete | 3.0 | sfx.super_feature.enter | heavy | skip |
| The Night Garden — conservatory doors | `anim.ultimate_feature.enter` | ultimate_feature_entry | tierId ultimate_feature | tl-ultimate-feature-enter | 2600 | cubicInOut | 80 | fullscreen | yes | yes | complete | 3.0 | sfx.ultimate_feature.enter | heavy | skip |
| Feature round start (spins-left tick + vial pulse) | `anim.feature.round_start` | feature_active | feature · feature_round | tl-feature-round-start | 500 | quadOut | 30 | hud | no | no | complete | 3.0 | — | — | skip |
| Super feature round start (+ pressure dial) | `anim.super_feature.round_start` | super_feature_active | super_feature · feature_round | tl-super-feature-round-start | 500 | quadOut | 30 | hud | no | no | complete | 3.0 | — | — | skip |
| Ultimate feature round start (+ prism rail) | `anim.ultimate_feature.round_start` | ultimate_feature_active | ultimate_feature · feature_round | tl-ultimate-feature-round-start | 500 | quadOut | 30 | hud | no | no | complete | 3.0 | — | — | skip |
| Retrigger (+5 spins, all tiers) | `anim.feature.retrigger` | feature_retrigger | stepType feature_retrigger · minScatterCount 3 | tl-feature-retrigger | 1500 | backOut06 | 80 | overlay | yes | yes | complete | 3.0 | sfx.feature.retrigger | medium | skip |
| The Prisming (light refracts, P doubles on plate) | `anim.ultimate_feature.prisming` | ultimate_feature_active | ultimate_feature · symbolId FX1 | tl-ultimate-feature-prisming | 1400 | cubicInOut | 60 | vfx | no | yes | complete | 3.0 | sfx.prisming.chime | heavy | skip |
| Summary — "The Tasting concludes" | `anim.feature.summary` | feature_summary | tierId feature | tl-feature-summary | 3000 | cubicOut | 90 | overlay | yes | yes* | complete | 3.0 | sfx.feature.summary | — | seek |
| Summary — "The Distillery seals its doors" | `anim.super_feature.summary` | feature_summary | tierId super_feature | tl-super-feature-summary | 3200 | cubicOut | 90 | overlay | yes | yes* | complete | 3.0 | sfx.feature.summary | — | seek |
| Summary — "The garden closes until next moon" | `anim.ultimate_feature.summary` | feature_summary | tierId ultimate_feature | tl-ultimate-feature-summary | 3500 | cubicOut | 90 | overlay | yes | yes* | complete | 3.0 | sfx.feature.summary | — | seek |
| Return to base (parlour crossfade) | `anim.feature.exit` | round_complete | stepType settlement | tl-feature-exit | 1500 | cubicInOut | 80 | fullscreen | yes | yes | complete | 3.0 | music.base | — | skip |
| Autoplay start badge | `anim.autoplay.start` | autoplay_started† | — | tl-autoplay-start | 300 | quadOut | 30 | hud | no | no | complete | 1.0 | sfx.autoplay.start | — | skip |
| Autoplay stop badge | `anim.autoplay.stop` | autoplay_stopped† | — | tl-autoplay-stop | 300 | quadOut | 30 | hud | no | no | complete | 1.0 | sfx.autoplay.stop | — | skip |
| Error overlay | `anim.system.error` | error | — | tl-system-error | 400 | quadOut | 100 | fullscreen | yes | **no** | complete | 1.0 | ui.error | — | restart |
| Reconnecting (loop cycle) | `anim.system.reconnect` | reconnecting | — | tl-system-reconnect | 1200 | linear | 100 | fullscreen | yes | **no** | complete | 1.0 | ui.reconnect | — | restart |
| Round recovery (seek to resumePointer) | `anim.system.recover` | recovering | — | tl-system-recover | 800 | quadOut | 100 | fullscreen | yes | **no** | complete | 1.0 | — | — | seek |
| Orientation change mask | `anim.system.orientation_change` | orientation_changed† | — | tl-system-orientation-change | 250 | quadInOut | 100 | fullscreen | yes | **no** | complete | 1.0 | — | — | skip |

\* Summaries are dismissible only after the total has been visible ≥ 1,500 ms (non-skippable minimum, §6); skip then lands on `complete` (totals plate held).

### 3.1 Trigger → state-machine mapping

Every `trigger` is either a CONVENTIONS §4.4 state entry or a documented presentation event owned by a §4.4 state (sanctioned by prompts/animation-vfx.md failure-handling — no new machine states are invented):

| Presentation-event trigger (†) | Owning state(s) | Rationale |
|---|---|---|
| `autoplay_started` / `autoplay_stopped` | `ready` | Autoplay toggles only in `ready`; a state-entry trigger would fire on every `ready` entry. |
| `orientation_changed` | any state | Device rotation can occur at any time; the mask fires in-place and never transitions the machine. |

Feature-context note (GDD §6.1): during `feature_active` / `super_feature_active` / `ultimate_feature_active`, `feature_round` steps replay the presentation sub-phases — the engine re-enters `presenting_initial_result` → `presenting_wins` → `presenting_cascades` as sub-states of the active tier state, so drop/cascade/orb/win events fire identically inside features. The `winTier`/`stepType`/`tierId` conditions do the narrowing; no duplicate event definitions are needed.

### 3.2 Template rows deleted (mechanic provably absent)

Per template rules, deletions are logged with proof; scope note: this step's task writes only this file and the config, so the mirror entry for `docs/assumption-log.md` is listed here verbatim for the step-11 integrator to append.

| Template row | Reason absent (GDD source) |
|---|---|
| Wild landing (`anim.wild.land`) | No WILD in the game — GDD §4/A6 (substitution duplicates cascade purpose in pays-anywhere). |
| Mystery reveal (`anim.mystery.reveal`) | No MYSTERY symbol — GDD §4 symbol set. |
| Payline / ways / cluster visualization | `scatter_pays` archetype: no lines, no ways, no clusters — GDD §3. `anim.win.highlight` is the pays-anywhere equivalent. |
| Grid expansion (`anim.grid.expand`) | Geometry constant 6×5 in all tiers — GDD §3. |
| Respin (`anim.respin.start`) | No respin mechanic — GDD §6. |
| Sticky-symbol lock | No sticky/hold mechanic — GDD §6. |
| Collection meter (`anim.meter.collect`) | Realized as the master vial: `anim.orb.collect` + `anim.hud.vial_update` — GDD §6.2. |
| Multiplier increase (`anim.mult.increase`) | Realized as `anim.orb.apply` (banking/apply) and `anim.ultimate_feature.prisming` (doubling) — GDD §6.2/§6.3. |
| Feature upgrade (`anim.feature.upgrade`) | Tiers are entered directly by seal count; no upgrade path exists — GDD §7. |
| Jackpot award | No jackpots — GDD §15. |
| `anim.cascade.explode` / `anim.cascade.fall` as separate rows | Folded into `anim.cascade.remove` (shatter) + `anim.cascade.refill` (fall + settle): one remove and one refill beat per cascade step — GDD §6.1 visual treatment. |

## 4. Priorities, layers & haptics defaults

| Band | Priority | Layer (z) | Contents | Haptic |
|---|---|---|---|---|
| System / regulatory | 100 | fullscreen (topmost) | boot, loading, error, reconnect, recover, orientation | — |
| Settlement | 90 | fullscreen / overlay | max win, feature summaries | `haptic.heavy` (max win) |
| Tier transitions | 80 | overlay / fullscreen | trigger banners, tier entries, retrigger, feature exit | `haptic.heavy` (triggers/entries), `haptic.medium` (retrigger) |
| Win presentation | 60 | overlay / vfx / hud | countup, win tiers, orb collect/apply, anticipation, prisming | `haptic.heavy` (big/mega/epic) |
| Grid events | 40 | reels / symbols | clear-out, drop, settles, cascades, seal/orb landings | `haptic.medium` (seal land), `haptic.light` (orb land) |
| Feedback | 30 | symbols / hud | symbol land, highlights, vial/round-start HUD ticks, spin ack, autoplay badges | `haptic.light` (spin press) |
| Ambience | 10 | background | idle parlour loop (candle flicker, rain) | — |

Higher priority preempts lower; a preempted timeline snaps to its end-state (never aborts mid-way leaving stale sprites). Equal priority queues in manifest declaration order. Haptics fire only where the platform exposes them and reduced-sensory mode is off.

**Input locks:** `blocksInput: true` events lock exactly {spin, bet change, menu open, buy menu}; the skip input stays live on skippable events, and settings/RG access is never locked outside System-band overlays. Every lock is owned by its timeline and force-released on completion, cancel, or recovery — a stuck lock is a P0 defect.

## 5. Timeline engine rules

Implemented in the client's deterministic timeline engine (`client/src/presentation/motionPlayer.ts`; own code, GSAP-style easings, no runtime GSAP dependency — CONVENTIONS §8).

1. **Cancelable:** every timeline exposes `cancel(reason)`; cancellation runs the event's `recoveryPolicy`, releases input locks, and emits a single completion callback.
2. **Seekable:** every timeline exposes `seek(t)` / `seekToLabel(label)`; all state applied by a timeline is a pure function of (manifest step, t), so seeking is always safe and recovery can land anywhere instantly.
3. **Deterministic ordering:** presentation events for a round are consumed strictly in the order of the outcome manifest's `steps[].events[]`; simultaneous events sort by priority band (§4) then declaration order. Single monotonic clock; **no setTimeout/setInterval anywhere in presentation code** — all delays are timeline offsets (the per-column 190 ms drop stagger, cascade step pauses, and micro-pauses live inside timeline definitions, not the config).
4. **Priorities:** a higher-priority timeline may interrupt a lower one; the interrupted timeline runs its recovery policy. Nothing interrupts System-band timelines except a newer System event.
5. **Duplicate-event protection:** each (roundId, stepId, eventId) triple plays at most once; replays/seeks mark events consumed. Rapid input cannot enqueue the same event twice.
6. **Duplicate-audio protection:** audio triggers route through the same consumed-set; a skipped timeline fires its audio at most once, or not at all if `skipTo` passes the audio cue (per-event interrupt policy in audio-specification.md §4). One audio fire per (roundId, stepId, eventId).
7. **Preconditions:** `preconditions` gate start order among events instantiated for the **same step**; a precondition on an event that was never instantiated this step (e.g. `anim.orb.apply` on an orbless win) is vacuously satisfied.
8. **Input locking:** per §4 — scoped, owned, force-released.
9. **Frame-rate independence:** all durations are wall-time ms, not frames; at low FPS timelines drop visual frames but land on exact end states.
10. **Loops:** `durationMs` in the config is one loop cycle for looping events (`anim.system.loading` 1,600 ms, `anim.system.idle` 8,000 ms, `anim.system.reconnect` 1,200 ms); the loop flag lives in the timeline definition and loops end only by state exit.

## 6. Skip & fast-forward safety invariants

Binding invariants from the mission brief; enforced by the G12 equivalence test (same manifest ⇒ identical final balance/win in every mode). Skipping or fast-forwarding an animation must NEVER:

1. Change an outcome.
2. Generate another wager.
3. Skip settlement.
4. Duplicate settlement.
5. Duplicate a win.
6. Alter a feature state.
7. Move the client ahead of the authoritative outcome (`outcome_committed` gates all presentation).
8. Cause autoplay to start an overlapping round.

Implementation rule: skip = `seekToLabel(skipTo)` on the presentation timeline ONLY; game-state transitions (CONVENTIONS §4.4) are driven by manifest consumption, never by animation completion alone. Fast-forward multiplies playback rate (per-event `fastForwardFactor`: 1.0 system/regulatory/reel, 2.5 cascades, 3.0 win countups and transition flourishes; never > 10) without reordering events.

**Non-skippable always:** reality-check/RG overlays, error states (`anim.system.error`), reconnect/recover overlays, the max-win amount plate (`anim.maxwin.reached`), and each feature summary's total for its first 1,500 ms. Tier entries become skippable only after the destination scene has been visible ≥ 400 ms; their skip lands in the exact destination state. `nextSpinEnabledAt = max(presentationEndAt, spinStartAt + minGameCycleMs)` — skipping never shortens the game cycle.

CI invariants: same manifest ⇒ identical `balanceAfterMinor` across {normal, quick, turbo, all-skipped, autoplay} replays; no double-fire of any `anim.*`/`sfx.*` per stepId; skip during network delay shows a waiting state instead of advancing past authoritative data; spin inputs require release-then-press with 150 ms debounce.

## 7. Screen shake & photosensitivity limits

| Constraint | Limit |
|---|---|
| Flash rate (every luminance transition ≥ 10 % of max white counts) | ≤ 3 flashes/s globally (CONVENTIONS §9.7 / WCAG 2.3.1) |
| Full-field luminance change | ≤ 20 % per flash; no full-screen white/black strobes |
| Saturated red flashing | prohibited — **zero** saturated-red flashes anywhere (shatter glints are desaturated amber/green glass tones) |
| Flashing sequence length | ≤ 5 s; flashing area < 25 % of screen |
| Screen-shake amplitude | ≤ 8 px @1080p-equivalent, ≤ 400 ms per burst |
| Shake frequency | ≤ 8 Hz; ≥ 1,000 ms between bursts |
| Shake usage in this game | only `anim.ultimate_feature.enter` (6 px / 300 ms, one burst) and `anim.maxwin.reached` (8 px / 400 ms, one burst); user toggle exposed |
| Reduced-motion mode | all shake amplitude = 0; flashes replaced by ≤ 1 crossfade per event |
| Reduced-sensory mode | shake 0 + celebration durations halved + particle density ≤ 25 % |

**Photosensitivity budget per hot event:** bottle shatter (`anim.cascade.remove`) uses ≤ 1 glint flash per step (chained cascades therefore stay ≤ 3/s at the ×2.5 fast-forward worst case — 380 ms/2.5 = 152 ms per step with one flash each is 6.6 steps/s, so the shatter glint is applied on **alternate** fast-forwarded steps to hold the ≤ 3/s budget); prisming refraction is a single ≤ 300 ms brightness ramp (no oscillation); win plaques pulse at ≤ 2 Hz. Lint pass over declared flash counts + PEAT spot-check is part of step 13 validation.

**VFX & device-tier budgets:**

| Tier | Concurrent particles | Shaders | Notes |
|---|---|---|---|
| high | 150 | bloom + god-rays (Night Garden moonlight) + displacement (door wipe) | full glass-shard debris, fluid vial shader |
| mid | 100 | bloom only | shard count halved, vial fluid = masked gradient |
| low | 50 | none (sprite-glow substitutes) | no glass particles (sprite swap per GDD §6.1), no motion blur, 30 fps floor cap |

Pools pre-allocated at profiled peak +25 %; overflow recycles the oldest particle; state reset on acquire; O(1) free-list. Peak moments budgeted: feature enter ≤ 40 particles, super enter 60-particle ember burst, ultimate enter 100-particle petal/prism burst, max win ≤ 150 (high tier only; scaled per tier).

## 8. Backgrounding, device sleep & context-loss recovery

1. **Tab hidden / device sleep:** on `visibilitychange → hidden`, pause all timelines and the audio clock (audio-specification.md §8). On resume, compute elapsed authoritative time: any timeline whose end passed while hidden runs its recovery policy (§3) — presentation catches up instantly; settlement was never blocked on animation.
2. **WebGL/WebGPU context loss:** on `contextlost`, freeze the scheduler and show the System-band recovery overlay; on `contextrestored`, rebuild GPU resources from the asset manifest, then `seek` every active timeline to its authoritative position derived from the committed manifest + `resumePointer` (CONVENTIONS §7). Never re-request the round.
3. **Reconnection/recovery:** `anim.system.recover` seeks presentation to the `resumePointer` step instantly (no replaying of already-presented steps at full length), then resumes normal playback. Mid-feature recovery restores the master vial (P) and spins-left from the step's `ext.multiplierBank100` fields (GDD §8–§10); mid-cascade recovery renders the resume step's grid instantly and continues remaining steps (GDD §6.1).
4. **Autoplay:** while hidden or recovering, autoplay is suspended and never queues rounds; it resumes only from `round_complete` in the `ready` state with all stop conditions re-evaluated.
5. **Orientation change:** relayout is instant; `anim.system.orientation_change` (250 ms) masks the reflow; an in-flight win countup keeps its value and continues in the new layout.

## 9. Reduced-motion & low-performance global rules

- **Reduced motion** (OS `prefers-reduced-motion` via `matchMedia`, or in-game setting — CSS alone cannot stop WebGL motion): every event plays its `-rm` timeline from §3; parallax, shake, and flash are disabled; all information is still conveyed. Strategy per family: shatter → cross-fade removal, no shards (GDD §6.1); drop/refill → fade-in-place with counter ticks; orb collect/apply → fade + counter tick (GDD §6.2); tier entries → ≤ 300 ms crossfade into the destination scene; prisming → plate flip (GDD §6.3); plaques → static plate + counter; anticipation → dim + slow pulse, no shader FX; idle → static scene.
- **Low performance** (device-profiles.json tier `low`, or runtime FPS < 45 sustained for 3 s): switch to `-lp` variants — particle budget ≤ 50, shader FX off, motion blur off, texture tier down, vial fluid → straight lerp (GDD §6.2), prisming → static glow frame (GDD §6.3), 30 fps floor cap. Switching variants mid-round is safe because variants share timeline labels and durations.
- Both variants are REQUIRED for every event (CONVENTIONS §9.8) and are declared as distinct timeline ids (`-rm`/`-lp`) in the config for all 50 events — "same as full" is expressed as a variant timeline that references the full choreography minus the disallowed layers, never as an omission.

## 10. Tier-transition choreography (signature moments)

Materially different per tier (CONVENTIONS §9.3), themed per GDD §8–§10; all three: `blocksInput` until done, skippable after the destination scene is visible ≥ 400 ms (`skipTo: complete`), reduced-motion = ≤ 300 ms crossfade, recovery = `skip` (land in the destination state), haptic.heavy on the door/threshold beat.

**The Tasting (`anim.feature.enter`, 1,800 ms):** 0–400 ms the parlour curtain draws back (cloth sim on high tier, sprite sheet on low); 400–1,100 ms the cabinet re-dresses (bottle fronts crossfade to Tasting variants) while candle lighting warms +15 % and the camera eases 2 % closer; 1,100–1,800 ms the master vial slides onto the counter (HUD dock) with a single glass note. ≤ 40 particles (dust motes). Audio `sfx.feature.enter`; music state → `music.feature` (audio engine state map).

**The Distillery (`anim.super_feature.enter`, 2,200 ms):** 0–600 ms floor panels part and the view descends the cellar stair (vertical camera push 4 % over 1,200 ms, background parallax swap); 600–1,500 ms copper stills ignite left-to-right (three staged glow ramps, no strobe); 1,500–2,200 ms the vial arrives half-charged (P0 = ×2 pours in) and the pressure dial unfolds on the HUD. 60-particle ember burst at ignition. Audio `sfx.super_feature.enter`; music → `music.super_feature`.

**The Night Garden (`anim.ultimate_feature.enter`, 2,600 ms):** 0–800 ms fullscreen displacement wipe (named effect: `displacement-door-wipe`, 800 ms) as the conservatory doors open to moonlight; 800–1,100 ms one 6 px / 300 ms shake burst as the doors seat; 1,100–2,000 ms prisms descend on wires and the prism rail docks into the HUD; 2,000–2,600 ms belladonna blooms unfurl (100-particle petal/pollen burst) and the vial arrives at P0 = ×3. Scene, frame, and lighting all distinct from both lower tiers (moonlit blue-green vs candle amber vs copper). Audio `sfx.ultimate_feature.enter`; music → `music.ultimate_feature`.

**Exit (`anim.feature.exit`, 1,500 ms, all tiers):** scene crossfades back to the parlour, the vial pours its final state into the win meter and dims, tier HUD elements undock; music → `music.base`.

## 11. Required audio events (binding handoff to step 10)

Deduplicated list of every audio id this motion system references. Ids marked *(manager)* are driven by the audio manager on timeline labels rather than an `audioEvent` field (the animation-event schema's audio pattern takes three-segment sfx ids; the four-segment countup pair is canonical in the audio domain and rides the countup timeline's labels). All ids are CONVENTIONS §4.3 grammar-valid; music states cover base + all three tiers. Join to `config/audio-events.json` is **pending G10** (step 10 runs in parallel).

| Audio id | Sound-design intent (one line) |
|---|---|
| music.base | Sparse 3/4 parlour waltz — harpsichord + low strings; re-entered via `anim.feature.exit`. |
| music.feature | Waltz + pizzicato pulse; entered on The Tasting (state map at `feature_entry`). |
| music.super_feature | Low brass + cimbalom drive; entered on The Distillery. |
| music.ultimate_feature | Full nocturne, choir pads, glass-harmonica lead; entered on The Night Garden. |
| amb.parlour | Idle bed: rain on leaded glass, candle crackle, distant clock. |
| sfx.reel.stop | Per-column glass-on-wood settle thunk; six staggered instances per drop. |
| sfx.symbol.land | Soft bottle tick; polyphony-capped landing layer under the settles. |
| sfx.scatter.land | Wax-seal stamp + low string pluck; one per seal. |
| sfx.scatter.anticipation | Rising glass-harmonica shimmer + heartbeat pulse while a tier is still live. |
| sfx.cascade.shatter | Bottle break, pitch +1 semitone per chain depth, cap +12 (GDD §6.1). |
| sfx.cascade.settle | Survivors + refills landing; softer than initial drop. |
| sfx.orb.land | Glass ping, brightness banded by orb value (GDD §6.2). |
| sfx.orb.collect | Liquid draw into the master vial. |
| sfx.orb.apply | Cork pop + swell, gated by win tier — never above `small` framing when total ≤ stake. |
| sfx.prisming.chime | Glass-harmonica gliss; ducks music −8 dB (GDD §6.3). |
| sfx.feature.enter | Curtain draw + single warm glass note. |
| sfx.super_feature.enter | Stair descent rumble + copper-still ignition whumps. |
| sfx.ultimate_feature.enter | Conservatory doors + moonlit bloom shimmer stinger. |
| sfx.feature.retrigger | Seal stamp triplet + spins-added flourish (all tiers). |
| sfx.feature.summary | Ledger-close chord under the totals plate (all tiers). |
| sfx.win.small | Brief neutral chime — the LDW-safe readout sound. |
| sfx.win.medium | Modest two-note glass motif. |
| sfx.win.big | Plaque hit + first celebration swell. |
| sfx.win.mega | Bigger swell, choir touch. |
| sfx.win.epic | Full flourish, nocturne quote. |
| sfx.win.max | Terminal max-win sting under the amount plate *(manager, max tier countup end)*. |
| sfx.win.countup.loop *(manager)* | Rising tick loop ≤ 20 ticks/s, pitch rises with progress. |
| sfx.win.countup.end *(manager)* | Terminal tick/settle on exact `totalWinMinor`. |
| sfx.maxwin.reached | Vial-overflow cascade + house-lights swell (10 s bed). |
| sfx.autoplay.start | Discreet mechanism engage. |
| sfx.autoplay.stop | Discreet mechanism release. |
| ui.click | Spin/press ack. |
| ui.error | Muted error tone (no alarm strobe pairing). |
| ui.reconnect | Soft searching pulse loop. |

## 12. Config synchronisation

Every row in §3 maps 1:1 to an entry in `config/animation-events.json` (schema: `schemas/animation-event.schema.json`, draft 2020-12) with the full per-event field set: eventId, trigger, conditions, preconditions, timelineId, durationMs, easing, priority, layer, blocksInput, skippable, skipTo, fastForwardFactor, audioEvent, hapticEvent, reducedMotionTimelineId, lowPerformanceTimelineId, recoveryPolicy. Delays, staggers, loop flags, and suspension/context-loss behaviour live in the timeline definitions (§5/§8), not the config — the schema has no delay field by design. Gate G8 fails if this document and the config disagree; fix the config, then this document, in that order of truth: **manifest > config > doc**.
