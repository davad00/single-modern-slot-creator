# Motion, Animation & VFX Systems + Spin Presentation Modes

```yaml
domain: 09-motion-vfx
skill: single-modern-slot-creator v1.0.0
covers: prompt.txt §6 (Motion, Animation & VFX System) + §7 (Normal/Quick/Turbo/Skip/Autoplay)
date: 2026-08-08
researcher: research-09 (detached worker)
method: 14 WebSearch queries + primary-source WebFetch (UKGC RTS 14/8/13, UKGC consultation
  responses, AGCO Registrar's Standards for Internet Gaming, slotplate, timing article)
```

---

## Findings

### 1. Regulatory envelope for spin presentation speed (drives ALL timing budgets)

The single most important fact for a motion system: **presentation timing is regulated per
jurisdiction, and the strictest regimes ban the fast modes entirely.** The motion system must
therefore be built as a *policy-gated* timeline engine, not a fixed set of animations.

- **[mandatory — UK/GB]** RTS 14D: "A minimum of 2.5 seconds must pass between starting a game
  and being able to start the next cycle", and the player must "release and then depress" the
  start button each time. Continued contact with a button/screen must not trigger a new cycle.
  Game cycle = from initiation until all stakes/winnings are resolved and the start button is
  available again. Feature/bonus rounds awarded from the base game are part of the same game
  cycle. In force 31 Oct 2021. [S1][S4]
- **[mandatory — UK/GB]** RTS 14E: "The gambling system must not permit a customer to reduce the
  time until the result is presented." Turbo, quick spin and slam stop are banned by name (a
  non-exhaustive list), "regardless of game cycle speed". **Explicitly still allowed:** skipping
  animations *after* the result is shown; genuine choice elements (pick-a-box); bonus/feature
  games with no additional stake; scratch-all/reveal-all features. Even after skipping
  post-result animations, the next spin cannot begin until 2.5 s have elapsed (14D). In force
  31 Oct 2021. [S1][S3]
- **[mandatory — UK/GB]** RTS 8A (consolidated 17 Jan 2025): "The gambling system must require a
  customer to commit to each game cycle individually" — autoplay banned for ALL online gaming
  (was slots-only former 8C from 31 Oct 2021). Only carve-out: auto-posting blinds in P2P poker.
  [S2][S27]
- **[mandatory — UK/GB]** RTS 14F: no win-style audio/visual effects for returns ≤ total stake
  (losses disguised as wins / LDW ban). Neutral display of the amount returned, brief winning-line
  display, and a short neutral result sound are acceptable. [S1]
- **[mandatory — UK/GB]** RTS 14C: no simultaneous play of multiple games (split-screen /
  multi-screen); Jan 2026 wording update broadened "slots games" to "games". [S1]
- **[mandatory — UK/GB]** RTS 14G: 5-second minimum game cycle for casino games *other than*
  slots and P2P poker (in force 17 Jan 2025). [S1][S27]
- **[mandatory — Ontario, CA]** AGCO Registrar's Standards for Internet Gaming (in force
  4 Apr 2022), near-verbatim mirror of the UK package: 2.16(2) "Games shall not provide
  auto-play features for slots"; 2.17 no simultaneous multi-slot play; 2.18 minimum 2.5 s game
  cycle with release-and-depress requirement; 2.19 "the gaming system must not permit a customer
  to reduce the time until the result is presented" — "features such as turbo, quick spin and
  slam stop are not permitted" (illustrative, not exhaustive; bonus/feature games with no extra
  stake exempt); 2.20 no win-associated audio/visual effects for returns ≤ last total wagered
  (amended Feb 2022); 2.21 session net-position display in CAD; 2.22 players must be able to
  track passage of time. Standards 2.17–2.22 also bind gaming-related suppliers (i.e., the game
  studio, not just the operator). [S6]
- **[mandatory — Germany]** GlüStV 2021 §22a(6): average game round duration of 5 seconds
  between bets; §22a(7): €1 max stake per spin (statutory default — since 2026-07-01 the
  GGL permits tiered uplifts: €3 for players 21+, €5 after a 90-day no-harm qualification
  with behavioural monitoring; under-21 stays €1 [S33]); autoplay and progressive jackpots
  prohibited.
  A spin is defined as beginning with the player's declaration to start and ending with the
  display of the result. Saxony-Anhalt guidance interprets the 5 s as an **average over 120 paid
  spins in 10 minutes**, and it may not be shortened by unpaid spins; the GGL/DOCV are discussing
  operator flexibility to mix shorter and longer spins against the average. [S7][S8]
- **[mandatory — Sweden]** Re-regulated market (from 1 Jan 2019, Spelinspektionen): minimum
  3-second game round on online slots, anchored in LIFS 2018:8 technical requirements
  ("Varje spelomgång ska vara minst tre sekunder"; re-issued as SIFS 2022:3, decided
  2022-12-02) — and the provision **explicitly also applies to autoplay functions**.
  CORRECTION vs earlier draft: autoplay is NOT banned in Sweden — the 2023 ban push [S10]
  was never enacted; the June 2026 Spelinspektionen draft instead proposes a **60-round
  autoplay cap** + immediate stop (consultation closed ~2026-08, not in force). Operators
  must not suggest amounts for player-set deposit/loss/time limits. [S9][S10][S32]
- **[mandatory — Netherlands]** KSA regime: auto-spin and turbo/fast-play features disabled;
  mandatory player-set deposit, session-time and loss limits before play. [S12]
- **[mandatory — Finland, upcoming]** Draft regulations for the reformed (post-monopoly) regime
  ban online autoplay and set maximum slot stakes. [S30]
- **[observed — Malta]** MGA Player Protection Directive (Directive 2 of 2018, revised Jan 2024):
  operators must offer deposit *or* wagering limits + reality checks; loss limits encouraged, not
  mandatory. No autoplay ban surfaced — autoplay with configurable limits is the MGA-market norm.
  [S11]
- **[inferred]** Because UK/Ontario ban turbo+quick+slam+autoplay outright, Germany forces ~5 s
  averages, Sweden 3 s, and MGA/.com markets allow everything, the skill's
  `jurisdiction-policies.json` must gate — per jurisdiction — at minimum: `autoplayAllowed`,
  `quickSpinAllowed`, `turboAllowed`, `slamStopAllowed`, `minGameCycleMs`,
  `cycleDurationIsAverage` (Germany), `ldwCelebrationBanned`, `netPositionDisplay`,
  `elapsedTimeDisplay`, `realityChecksRequired`. UNKNOWN jurisdiction ⇒ most restrictive
  (all fast modes off, 5000 ms cycle, LDW ban on, session displays on) per CONVENTIONS §9.6.

### 2. Reel physics timing norms (base/normal spin)

Published exact numbers are scarce (studio-proprietary); the figures below combine an
industry-press timing article with numbers, US patents, open-source clients, and observable
market norms. Treat single-source ms values as tunable defaults, not standards.

- **[observed]** Total normal-spin presentation (spin press → last reel settled) in modern
  online slots: **~2.0–3.5 s** for a 5-reel game. Regulated-market builds pad the cycle so
  result + settle + minimal win presentation ≥ the jurisdiction's cycle floor (2.5 s UK/ON,
  3 s SE, 5 s avg DE). [S4][S9][S7] + market observation of NetEnt/Pragmatic-class titles
  [inferred: exact per-studio values unpublished].
- **[observed]** Reel acceleration ramp: **~0–100 ms** to top speed ("tempo map" practice:
  map accel, peak hold, ease-out per reel). [S17]
- **[observed]** Per-reel stop stagger: sequential 1-2-3-4-5 stops with **~120 ms gaps** cited
  as the anti-mechanical baseline [S17]; a USPTO reel-emulation patent gives whole-spin examples
  of **3.52 s / 4.07 s / 4.49 s** for reels 1/2/3 (i.e., 400–550 ms stagger on slower land-based
  pacing), with per-reel durations drawn randomly from a set of acceptable values and a formula
  controlling inter-reel stop delay. [S18] Practical online norm: **120–250 ms** stagger.
  [inferred from S17+S18 range and market observation]
- **[observed]** Stop bounce/overshoot: a small overshoot then settle-back is near-universal to
  "soften the transition and create a satisfying sense of closure"; typically implemented as
  back/elastic ease-out over roughly 100–250 ms. [S17][S26] (ms range [inferred] — sources
  describe the overshoot but not its duration.)
- **[observed]** Micro-pauses before reveals: **250–500 ms** reserve before the last symbol/
  reveal; a **40 ms** difference in final-stop timing is claimed to change perceived fairness
  ("rushed" vs "considered"). [S17]
- **[observed]** Deceleration easing: ease-out curve; one patent teaches two-phase deceleration
  for the last reel — above-average deceleration first, then below-average deceleration while
  the reel is visibly emphasized (and faster deceleration when no win is possible, to raise
  rounds/hour). Sound cadence tied to reel speed. [S19]
- **[recommended]** 60 fps target with easing functions rather than frame-stepped motion; reel
  motion via constant-velocity strip scroll between accel and decel phases. [S17][S28]

### 3. Anticipation (scatter tease / near-win extension)

- **[observed]** Trigger rule: anticipation activates when already-stopped reels make a
  significant outcome possible on remaining reels (e.g., 2 scatters landed, 3rd possible).
  Slow-down intensity is **tiered**: mild slow = possible win completion; pronounced slow +
  audio shift = possible bonus/high-value resolution. Duration itself is a signal — the same
  mechanic runs longer on an actual trigger than on a near miss. [S26]
- **[observed]** A **300–500 ms hold** before the last reel lands magnifies salience; extended
  anticipation spins in market titles run the teased reel roughly **1.5–3 s longer** than its
  normal stop time. [S17][S26] (1.5–3 s figure [inferred] — consistent with observed market
  titles; no published standard.)
- **[mandatory — server-authority]** The anticipation *decision* must come from the outcome
  manifest (or deterministic client rules over the committed grid), never from client guessing:
  slotplate's wire contract sends `teasingReels` in the `SpinResponse` — "The client never
  computes these." [S21] This also protects against the UKGC's warning that animation must not
  imply a result that isn't determined. [S1]
- **[legal-review]** Near-miss *presentation* is legal when outcome-driven; **forced/weighted
  near-miss outcome generation is prohibited** in most regimes (see research/13 §1.2 and
  research/12-market-patterns-ip.md; CONVENTIONS
  §9.5 already bans it). Anticipation must fire only from real committed outcomes: fire it
  exactly when N−1 of the required scatters are visible and the remaining reels haven't stopped
  — never on a random "tease chance". [inferred from S1/S26 + CONVENTIONS]

### 4. Win tiers, celebration lengths, count-up (rollup) rules

- **[observed]** "Big Win" celebration thresholds in market titles: **10x–25x bet** depending on
  studio (IGT ≈10x side; many Light & Wonder titles ≈25x; higher-volatility studios celebrate
  later). Thresholds are bet-multiples so excitement is stake-independent. Escalating tier
  names (Big → Mega → Epic/Super → Max) are the market norm. [S20]
- **[project-canonical]** CONVENTIONS §4.3 fixes this skill's defaults: `small < 5x`,
  `medium ≥ 5x`, `big ≥ 15x`, `mega ≥ 40x`, `epic ≥ 80x`, `max = maximumWinXBet`, configurable
  in `spin-presentation.json`. These sit inside the observed market envelope (big at 15x is
  between IGT's 10x and L&W's 25x). The prompt's alternate pattern (15/30/60/100) is a valid
  configuration but CONVENTIONS wins. [S20 + CONVENTIONS]
- **[mandatory — UK/ON]** LDW rule shapes tier presentation: any return ≤ stake must NOT get
  win-associated audio/visual effects (UK RTS 14F; AGCO 2.20). So the `small` tier below 1x bet
  must render as a *neutral* result readout, and even ≥1x "small" wins should stay modest.
  CONVENTIONS §9.5 ("LDW never celebrated above small") is the cross-market encoding. [S1][S6]
- **[observed]** Rollup/count-up design (from gaming-machine patents): increment speed and win
  sound are **banded by win rank** (one patent defines 24 ranks); within most ranks the count-up
  is **fixed-duration** (win amount ÷ seconds = increment rate, so speed scales with size);
  for the largest ranks a **two-phase scheme** counts at bet/2-per-second until the display
  reaches 20× total bet, then divides the remainder by the remaining time to finish on schedule
  (anticipation first, acceleration to completion after). Count always lands exactly on the
  final amount. [S24]
- **[observed]** Celebration duration scales with tier: minor wins get quick symbol flashes
  (~0.5–1.5 s), medium wins symbol bounce + light particles (~1.5–3 s), big+ wins get layered
  full-screen sequences with plaque, particles, music swell (~5–10 s per tier step in market
  titles). [S17][S20][S26] (Exact per-tier durations are studio-proprietary — the s ranges here
  are [inferred] from observed market titles and the fixed-duration rollup patent teaching.)
- **[observed]** Skip semantics for count-ups: tap/click or spin input snaps the meter to the
  final value and (in market titles) collapses the remaining celebration to its end-state.
  Legal in UK/ON because it happens **after the result is presented** — but the next cycle
  still can't start before the 2.5 s floor. [S3][S6]
- **[mandatory — UK/ON]** Big-win plaques and feature-total screens may be skippable, but the
  *final total display* and settlement update must always occur; AGCO 2.21/RTS 13C session
  net-position and elapsed-time displays are permanent HUD elements that no animation may
  obscure. [S5][S6]

### 5. Quick spin & turbo spin (where legal)

- **[observed]** Quick spin ≈ **20–30 % shorter** than normal (keeps some animation; shortened
  travel + reduced stop delay ⇒ ~1.2–2.0 s total); turbo ≈ **40–60 %+ shorter** (near-instant
  result, deceleration phases removed entirely, reels stop abruptly; ~0.4–1.0 s total).
  Wazdan's "Ultra Fast" mode completes each spin in **< 1 s**; turbo-class autoplay can reach
  3–4 spins/s where unregulated. Pragmatic Play's turbo is explicitly documented as
  presentation-only (no math change). [S25][S29]
- **[observed]** Activation UX: settings (gear) toggle, dedicated lightning-bolt button,
  press-and-hold spin, or hold-spacebar-for-turbo. Active mode must be clearly indicated
  (button state change / badge). [S25]
- **[mandatory — invariant]** All speed modes alter presentation only — never RTP, strips,
  weights, probabilities, max win, wager, settlement or outcome generation (prompt §7;
  CONVENTIONS §9.2 equivalence test: same manifest ⇒ same final balance in every mode). Turbo
  in market titles "doesn't alter the math — outcomes remain RNG-based". [S29]
- **[mandatory — gating]** Quick/turbo must be flag-removable per jurisdiction (banned UK/ON/NL;
  effectively pointless in DE at 5 s average; SE floor 3 s). Where a `minGameCycleMs` exists,
  quick/turbo compress *animation* but the spin button re-enable waits out the floor. [S1][S6]

### 6. Stop / skip / slam & fast-forward semantics

- **[mandatory — UK/ON]** Slam stop (player input causing reels to stop early, shortening time
  to result) is **banned** in GB (RTS 14E) and Ontario (2.19). Rationale: accelerates play and
  creates an illusion of control. [S1][S3][S6]
- **[mandatory — UK/GB]** What remains skippable in the strictest markets: animations **after**
  the result is displayed (win celebrations, count-ups, transition flourishes), genuine-choice
  bonus interactions, and no-extra-stake feature presentation. UKGC warned it will act against
  developers who inflate the "feature" share of gameplay to exploit the carve-out. [S3]
- **[observed]** In permissive markets, slam stop is implemented as: on input after outcome
  commit, all reels immediately decelerate-and-settle to the committed grid (typically
  ~150–300 ms), anticipation sequences cancel to their end-state, and the win presentation
  begins. [S25][S21] (ms figure [inferred] from observed titles.)
- **[mandatory — integrity]** Skipping/accelerating must never: change an outcome, generate
  another wager, skip or duplicate settlement, duplicate a win, alter feature state, move the
  client ahead of the authoritative outcome, or let autoplay overlap rounds (prompt §6 list).
  GLI-19 supports this server-side: incomplete games must be resolved before the player can
  play another instance of the same game (§2.7.2), with result-recall records maintained for
  recovery (§2.3.7); where no player input is needed to complete, the game must display the
  final RNG-determined outcome and update the account. [S13]
- **[observed]** Non-skippable-by-convention displays: final win total of a feature, max-win
  reached screen, error states, RG/reality-check interruptions (which must be acknowledged —
  RTS 13B), and regulatory session displays. [S5][S6]

### 7. Autoplay behaviors (where permitted)

- **[mandatory — GB/ON/DE/NL, FI draft]** Autoplay prohibited outright. [S2][S6][S7][S12][S30]
- **[corrected — SE]** Autoplay is PERMITTED in Sweden: the 2023 reported ban [S10] was a
  proposal that was never enacted. Binding rule: each automated round must respect the
  3-second minimum (LIFS 2018:8 / SIFS 2022:3 — the round-duration provision explicitly
  covers autoplay). Pending: June 2026 Spelinspektionen draft proposes a 60-round cap +
  immediate stop. [S32]
- **[observed — MGA/.com norm]** Where legal, standard offering: finite round counts (typical
  preset ladder 10/25/50/75/100, sometimes 500/1000 in .com markets), always-visible remaining
  count, single-tap immediate stop, and advanced settings: stop on any win, stop on single win
  exceeding X, stop on feature/bonus trigger, stop if balance decreases by X (loss limit), stop
  if balance increases by X (profit limit). [S11][S25] (Preset ladder values [inferred] from
  market observation; the *categories* are directly observed in market UIs.)
- **[recommended]** Loss-limit-before-start is a hard requirement in several MGA-influenced and
  UK-pre-ban rulebooks (former UK RTS required loss limit + stop-on-jackpot before the ban) —
  encode "autoplay requires explicit loss limit set before start" as the skill default wherever
  autoplay is on. [S11] [inferred: former-UK detail from pre-2021 RTS, now moot in GB]
- **[mandatory — prompt/CONVENTIONS]** Autoplay must stop on: feature/super/ultimate trigger,
  configurable win/loss/profit thresholds, balance below threshold, insufficient balance,
  network error, game error, RG interruption, reality check (RTS 13B pop-up must pause play and
  require acknowledgement [S5]), bet change, max win. No infinite default, no queued wagers, no
  overlapping rounds. [S5] + prompt §7 checklist.
- **[observed]** During autoplay, per-spin win presentation is typically compressed (shortened
  count-ups, no plaque holds below `big`), but feature entries and big+ tiers still interrupt —
  and in this skill they stop autoplay entirely. [S25] [inferred defaults]

### 8. Deterministic timeline engine design

- **[observed — open source]** slotplate (pixi-reels boilerplate) validates the architecture the
  prompt requires: layered one-way imports (UI → Scenes → Flow → Presenters → Infra → State →
  Domain); FSM phases `idle → spin → stopSpin → winShow → idle` with a bonus sub-FSM,
  anticipation and slam-stop as tagged features; Flow layer "owns GAME TIME" and is the "only
  writer to stores"; all timing on a single GSAP-style ticker with a **"no setTimeout" rule**
  (leaking timers across scenes called out as the classic failure mode); server-authoritative
  wire contract (`SpinRequest {bet}` → `SpinResponse {grid, winlines, totalWin, teasingReels}`).
  "If it's math, it's server. If it's pixels, it's client." [S21]
- **[observed — patent]** Modular frontend frameworks define game execution flow externally
  (config-file timelines) so presentation order can change without recompiling — supports the
  prompt's data-driven `animation-events.json` approach. [S31]
- **[recommended]** Deterministic playback = pure function of (outcome manifest, presentation
  config, mode flags, seed-free clock). Requirements from prompt §6 mapped to engine features:
  cancelable + seekable timelines (seek = jump to any `stepId` for recovery, per CONVENTIONS §7
  `resumePointer`), deterministic event ordering (topologically ordered event list per step;
  ties broken by declared priority then declaration order), timeline priorities + interrupt
  rules (higher priority preempts; preempted timelines snap to end-state, never abort mid-way
  leaving stale sprites), duplicate-event and duplicate-audio protection (event instance ids;
  an event id may fire once per stepId), recovery from backgrounding/sleep (on `visibilitychange`
  resume: recompute elapsed authoritative time, snap presentation to the correct step end-state
  rather than replaying), WebGL context loss (Pixi context-restored hook → rebuild textures →
  seek timeline to current step). [S21][S13] + [inferred engineering practice]
- **[recommended]** Every animation event record needs the full field set the prompt lists
  (eventId, trigger, preconditions, timelineId, duration, delay, easing, priority, layer,
  blocksInput, skippable, skipTo, fastForward, audioEvent, hapticEvent, reducedMotion,
  lowPerformance, interruptRecovery, suspendRecovery, contextLossRecovery) — CONVENTIONS §9.8
  makes duration/easing/skippable/skipTo/blocksInput/audioEvent/variants/recovery mandatory
  per event. [CONVENTIONS] [inferred: no external standard defines this schema; it is our
  synthesis of S21+S3+S13 constraints]

### 9. Particles, screen shake, photosensitivity, reduced-motion, low-perf

- **[mandatory — WCAG 2.3.1, Level A]** Nothing may flash more than **three times in any one
  second**, or the flash must be below the general and red flash thresholds; saturated-red
  flashing has a stricter special test; flashes are permissible if they occupy < 25 % of any
  10° viewing area (≤ 0.006 steradians); every transition counts as a flash; non-compliant
  content fails the whole page under the non-interference conformance requirement. [S14]
- **[recommended — Xbox XAG 118]** Game-specific operationalization: a flash = ≥10 % luminance
  change (darker value < 0.8 of max white); problems when > ~3 flashes/s or the flashing covers
  ≥ ~20 % of screen; test ALL games for photosensitive triggers even without intentional
  flashing; eliminating triggers beats warning splash screens; ~1 in 4,000 people are
  susceptible. [S15]
- **[recommended — Game Accessibility Guidelines]** Avoid: flashing sequences > 5 s; > 3
  flashes/s covering ≥ 25 % of screen; moving repeated patterns covering ≥ 25 %; static
  repeated patterns covering ≥ 40 %. High-frequency screen shake can mimic flash frequency —
  provide "Disable Screen Shake" / "Reduce Motion" / photosensitivity-mode toggles; shaders can
  clamp max luminance delta. Test with PEAT (Trace Center) / Harding; ITU-R BT.1702 is the
  broadcast-derived reference. [S16][S15]
- **[recommended]** `prefers-reduced-motion`: detect via
  `window.matchMedia('(prefers-reduced-motion: reduce)')` in code — CSS-only approaches cannot
  stop WebGL/canvas/Web-Animations-API motion. Replace motion (scale/rotate/parallax/shake)
  with fade, dissolve, and color-change equivalents rather than deleting feedback wholesale.
  [S22]
- **[recommended]** Particle pooling: pre-allocate pools sized from profiled peak + 20–30 %
  headroom; overflow policy for particles = forcibly recycle the oldest; reset state on
  acquire; keep free objects at the list tail for O(1) acquire/release. Mobile particle
  budgets ~50 concurrent vs ~150 desktop; ≤ ~100 for stable 60 fps on mid devices. [S23][S28]
- **[recommended]** Low-performance variants: device-tier detection driving effect density,
  particle counts, shadow/filters, and frame-rate caps (30 fps floor tier); atlas/sprite-sheet
  packing, WebP, lazy-load non-critical assets, intelligent redraw. A "lite mode" toggle is
  market practice for data-expensive regions. [S28]

### 10. Session-time & reality-check displays interacting with motion

- **[mandatory — UK/GB]** RTS 13A: full-screen clients that obscure the device clock must show
  time of day or elapsed time. RTS 13B: player-set reality-check frequency; the check displays
  elapsed session time, **must be acknowledged to be dismissed**, must offer session exit + link
  to account history, and recurs until session end. RTS 13C (in force 17 Jan 2025): elapsed time
  displayed continuously for slots/casino, in seconds/minutes/hours, starting at game open or
  first play. [S5]
- **[mandatory — Ontario]** AGCO 2.21 net position (CAD) + 2.22 time tracking, continuous. [S6]
- **[inferred]** Timeline-engine consequence: the reality-check overlay is a **top-priority,
  input-blocking, non-skippable timeline** that pauses the game loop between rounds (never
  mid-settlement), stops autoplay (where autoplay exists), and requires explicit acknowledgement
  — model it as a state-machine interrupt, not an animation event.

---

## Source register

| id | name | type | pub/rev date | jurisdiction | URL | supports |
|----|------|------|--------------|--------------|-----|----------|
| S1 | UKGC Remote Technical Standards — RTS 14 Responsible product design (fetched full text) | regulator | updated Jan 2026 (14C wording); core in force 31 Oct 2021 / 17 Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | 14A–14G: 2.5 s cycle, speed-up ban, LDW ban, multi-game ban |
| S2 | UKGC RTS 8 — Auto-play functionality | regulator | updated 21 Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-8-autoplay-functionality | autoplay ban (8A), former 8C history |
| S3 | UKGC consultation response — Prohibiting player-led spin stop features (fetched) | regulator | 2021 | GB | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/summary-of-responses-prohibiting-player-led-spin-stop-features | slam-stop ban wording, post-result skip allowance, carve-outs |
| S4 | UKGC consultation response — Introducing speed of play limits | regulator | 2021 | GB | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/summary-of-responses-introducing-speed-of-play-limits | game-cycle definition, 2.5 s rationale, SE precedent |
| S5 | UKGC RTS 13 — Time requirements and reality checks | regulator | 13C in force 17 Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-13-time-requirements-and-reality-checks | elapsed-time display, reality-check acknowledge/pause rules |
| S6 | AGCO Registrar's Standards for Internet Gaming (fetched full text of 2.16–2.22) | regulator | in force 4 Apr 2022; 2.20/2.21 amended Feb 2022 | Ontario, CA | https://www.agco.ca/en/book/export/html/245361 | autoplay ban, 2.5 s, slam/turbo ban, LDW, net position, supplier applicability |
| S7 | GlüStV 2021 §22a overview (IDnow glossary; rakeback.com analysis; iGB stake-limit report) | regulator (via secondary) | treaty in force 1 Jul 2021 | Germany | https://www.idnow.io/glossary/gluecksspielstaatsvertrag-glustv/ | 5 s average round, €1 stake, autoplay/jackpot ban |
| S8 | Saxony-Anhalt info-sheet on slots (17 Nov, via R. Lenzhofer LinkedIn summary) | regulator guidance (via secondary) | Nov 2021 | Germany | https://www.linkedin.com/pulse/17th-novembers-info-sheet-from-saxony-anhalt-slots-robert-lenzhofer/ | "average of 120 spins in 10 min" interpretation; spin definition |
| S9 | Swedish re-regulation coverage (Bigwinboard explainer; CalvinAyre analysis) | industry-press | 2019 | Sweden | https://www.bigwinboard.com/swedish-online-gambling/ | 3 s minimum spin interval |
| S10 | iGamingBusiness — Sweden to ban autoplay and reverse withdrawals | industry-press | 2023 | Sweden | https://igamingbusiness.com/legal-compliance/regulation/sweden-ban-autoplay-reverse-withdrawal/ | SE autoplay ban incl. finite-count autoplay |
| S11 | MGA Player Protection pages + FAQ (Directive 2 of 2018, rev. Jan 2024) | regulator | 2018/2024 | Malta | https://www.mga.org.mt/licensee-hub/compliance/player-protection/ | mandatory limit offering, reality checks; loss limits encouraged |
| S12 | Netherlands KSA regime coverage (Legal500 country guide; inquisitr/RoyalCoala; iGB deposit rules) | legal-guide/press | 2024–2026 | Netherlands | https://www.legal500.com/guides/chapter/the-netherlands-gambling-law/ | auto-spin + turbo disabled; mandatory player-set limits |
| S13 | GLI-19 Standards for Interactive Gaming Systems v2.0 PDF (Bahamas GB mirror) / v3.0 release notes | standard | v3.0 released 20 Jul 2020 | multi (US tribal, Bahamas, etc.) | https://www.gamingboardbahamas.com/wp-content/uploads/2023/04/GLI-19_Interactive_Gaming_Systems_v2.0_Final.pdf | §2.7.2 incomplete-game completion, §2.3.7 result recall, display of final outcome |
| S14 | W3C Understanding SC 2.3.1 Three Flashes or Below Threshold | standard | WCAG 2.1/2.2 | global | https://w3c.github.io/wcag21/understanding/three-flashes-or-below-threshold.html | 3 flashes/s, red-flash, 25 %/10° area, non-interference |
| S15 | Microsoft Xbox Accessibility Guideline 118 (photosensitivity) | vendor-docs | current (2024+) | global | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/118 | flash = 10 % luminance delta, ~20 % screen area, test-all-games |
| S16 | Game Accessibility Guidelines — flickering images & repetitive patterns | standard (community) | current | global | https://gameaccessibilityguidelines.com/avoid-flickering-images-and-repetitive-patterns/ | 5 s flashing cap, 25 %/40 % pattern-area rules, VR caveat, shake toggles |
| S17 | On: Yorkshire Magazine — "The Slow Spin Effect: millisecond-level timing in slot animations" (fetched) | industry-press/blog | 2025 | n/a | https://www.on-magazine.co.uk/stuff/gaming/how-millisecond-level-timing-in-slot-animations-shapes-player-emotion-and-perceived-luck/ | 0–100 ms accel, 120 ms stagger, 40 ms fairness delta, 250–500 ms reveals, 300–500 ms holds, tempo maps |
| S18 | US Patent 8,360,847 — Multimedia emulation of physical reel hardware | patent | issued 2013 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8360847 | randomized per-reel spin durations (3.52/4.07/4.49 s example), stop-delay formula |
| S19 | US Patent 5,934,672 — Slot machine and methods of operation (reel deceleration) | patent | issued 1999 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5934672 | two-phase last-reel deceleration, faster stop when no win possible, speed-linked audio |
| S20 | Know Your Slots — "What constitutes a Big Win on slot machines?" | blog (domain expert) | 2023 | US market | https://www.knowyourslots.com/what-constitutes-a-big-win-on-slot-machines/ | 10x–25x big-win thresholds by manufacturer, volatility scaling |
| S21 | slotplate — opinionated slot-game client on pixi-reels (fetched) | repo/docs | v0.1, 2025–2026 | n/a | https://slotplate.schmooky.dev/ | FSM phases, layered architecture, single-ticker rule, teasingReels server contract, slam-stop as client feature |
| S22 | web.dev — prefers-reduced-motion | vendor-docs | current | global | https://web.dev/prefers-reduced-motion/ | matchMedia detection, replace-not-remove guidance, JS-animation caveat |
| S23 | Game Programming Patterns — Object Pool | book/reference | current | n/a | https://gameprogrammingpatterns.com/object-pool.html | pooling pattern, recycle-oldest overflow, O(1) free-list |
| S24 | US gaming-machine patents on win-rollup increment ranks (e.g. 9,153,104 family) | patent | 2015 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9153104 | 24 win-rank increment speeds, fixed-duration rollup, two-phase big-win count (bet/2 per s to 20x, then finish-on-schedule) |
| S25 | Turbo/quick spin market surveys (Slots Temple turbo index; CasinoTreasure; BetMGM guide; Slingo UK settings guide) | industry-press | 2024–2026 | multi | https://www.slotstemple.com/us/slots-by-feature/turbo-spin/ | quick −20–30 %, turbo −40–60 %, Wazdan Ultra Fast < 1 s, activation UX, autoplay 3–4 spins/s |
| S26 | Editions Complexe — "What anticipation animations signal during online slot spins" | blog | 2025 | n/a | https://www.editionscomplexe.com/what-anticipation-animations-signal-during-online-slot-spins/ | tiered slow-down semantics, trigger vs near-miss duration signaling |
| S27 | Harris Hagan / Wiggin LLP — remote games design changes in force 17 Jan 2025 | legal-press | 2024/2025 | GB | https://www.harrishagan.com/reminder-changes-to-remote-games-design-requirements-come-into-force-on-17-january-2025/ | RTS 8A consolidation, 14G 5 s non-slots, 13C elapsed time |
| S28 | Gamixlabs — Optimizing HTML5 slot game performance | vendor-blog | 2024 | n/a | https://gamixlabs.com/blog/optimizing-performance-in-html5-slot-games-for-mobile-and-web/ | pooling, dynamic effect scaling, atlas/webp, redraw strategy |
| S29 | Pragmatic Play turbo analyses (Chitech; Borgata blog) | industry-press | 2024–2026 | .com | https://chitech.us/pragmatics-turbo-spin-risky-or-just-fast/ | turbo = presentation-only, near-instant result |
| S30 | iGamingBusiness — Finland draft regulations ban online autoplay | industry-press | 2025 | Finland | https://igamingbusiness.com/legal-compliance/finland-release-draft-regulations-reformed-gambling-regime/ | FI autoplay ban (draft) |
| S31 | US Patent App 2023/0394914 — Modular frontend game development framework | patent | 2023 | US | https://patents.justia.com/patent/20230394914 | externally-defined game flow / config-driven presentation |
| S32 | LIFS 2018:8 (lagen.nu full text) + SIFS 2022:3 successor + Focus Gaming News on the June 2026 draft | regulator/statute + industry-press | 2018 / 2022-12-02 / 2026-06 | Sweden | https://lagen.nu/lifs/2018:8 ; https://focusgn.com/spelinspektionen-proposes-new-binding-regulations-to-replace-the-2018-rules | 3 s per round incl. autoplay; autoplay permitted; 2026 draft 60-round cap |
| S33 | iGB + CasinoGuardian — Germany tiered stake limits from 2026-07-01 | industry-press | 2026-07 | Germany | https://igamingbusiness.com/legal-compliance/regulation/germany-raises-online-slot-stake-limits-operators-to-track-player-behaviours/ | GGL €1/€3/€5 tiers, 90-day qualification, behavioural monitoring |

Primary-source confidence: S1–S6 fetched or quoted from regulator pages (high). S7–S12 are
regulator rules via reputable secondaries (medium-high; flag for legal review). S17/S20/S25/S26
are industry press/blogs (numbers are tuning guidance, not standards). Patents (S18/S19/S24/S31)
are primary documents but describe one vendor's approach, not norms.

---

## Uncertainties & legal-review items

1. **Germany "average" interpretation** — §22a(6) 5 s average per Saxony-Anhalt (120 spins /
   10 min) with ongoing GGL–DOCV talks about flexible averaging; whether free/feature spins count
   is contested ("unentgeltliche Spiele" debate). Verify against current GGL technical guidance
   before shipping a DE profile. [S7][S8]
2. **UK bonus-round carve-out breadth** — RTS 14E exempts no-extra-stake feature games from the
   speed-up ban, but UKGC explicitly warned against inflating feature share to exploit it. Where
   the line sits (e.g., can cascades inside a paid spin be fast-forwarded before final settlement
   display?) is not black-letter; our reading: cascades are part of result *presentation after
   commitment*, so fast-forward after each cascade step's result is shown is defensible — legal
   review required. [S3]
3. **Sweden 3 s** — RESOLVED (2026-08 follow-up): anchored in LIFS 2018:8 (now SIFS
   2022:3), and the provision explicitly extends to autoplay rounds; the reported SE
   autoplay ban was never enacted — a June 2026 draft proposes a 60-round cap instead
   [S32]. Residual: quote the exact SIFS 2022:3 section number in SE compliance docs
   and track the 2026 draft to adoption.
4. **Netherlands turbo/autoplay** — reported as "disabled" via KSA responsible-gaming policy
   (Ksa Remote Gambling Decree / Rgvk); exact article numbers not captured. Legal review needed.
   [S12]
5. **Exact celebration durations & tier thresholds** — no published standard exists; all per-tier
   duration numbers in this dossier are synthesized defaults ([inferred]/[observed] from market
   titles, patents, and press). They are safe as *defaults* but should not be represented as
   compliance requirements.
6. **S24 patent identity** — the 24-rank rollup teaching was surfaced via search-result excerpts
   across a family of gaming-machine patents (9,153,104 / 9,520,019 / 9,342,949); the specific
   claim-to-patent mapping should be re-verified if quoted formally.
7. **Ontario vs UK drift post-2025** — GB extended autoplay ban to all gaming and added 14G
   (5 s non-slots) in Jan 2025; whether AGCO has since mirrored these is unverified. Treat
   Ontario policy file as "2.5 s slots + autoplay ban" until re-checked.
8. **WCAG version** — WCAG 2.2 is current for 2.3.1 (unchanged from 2.0/2.1). "WCAG 3" (the
   prompt's phrasing) is still a W3C draft in 2026; encode against 2.3.1/2.3.2 + XAG 118, not
   WCAG 3. [S14][S15]
9. **US regulated iGaming states (NJ/PA/MI)** — not individually researched here; NJ DGE and PA
   technical standards have their own celebration/incomplete-round rules (PA 58 §461a surfaced
   but is land-based). Cross-reference research/05-jurisdiction-rules.md.

---

## Design implications for the Skill

Everything below is a concrete default the authoring agents should encode. Timing values go in
`config/spin-presentation.json` and `config/animation-events.json`; gates go in
`config/jurisdiction-policies.json`. All values presentation-only (CONVENTIONS §9.2).

### A. Spin presentation timing table (defaults, 5×4 grid, 5 reels)

| Phase | normal | quick | turbo | notes |
|---|---|---|---|---|
| Pre-spin (button ack, symbols dim) | 100 ms | 60 ms | 0 ms | never blocks outcome request |
| Reel acceleration (per reel, staggered start 0–60 ms/reel) | 120 ms | 80 ms | 0 ms (cut) | ease-in quad [S17] |
| Min travel at full speed (reel 1) | 700 ms | 350 ms | 80 ms | outcome usually committed well before stop |
| Per-reel stop stagger | 180 ms | 100 ms | 0–30 ms | norm band 120–250 ms [S17][S18] |
| Deceleration + bounce per reel | 220 ms decel + 160 ms bounce (back-out, overshoot ≈ 0.35 symbol) | 140 + 100 ms | 60 ms snap-settle, no bounce | two-phase decel on emphasized reel [S19] |
| Total spin→last-settle | ≈ 2,200 ms | ≈ 1,200 ms | ≈ 450 ms | matches observed norms (~2–3.5 s / 1–1.5 s / 0.4–0.8 s) |
| Post-result idle before next-spin enable | pad to `minGameCycleMs` | pad | pad | UK/ON 2500, SE 3000, DE 5000-avg, unknown ⇒ 5000 [S1][S6][S7][S9] |

Rule: `nextSpinEnabledAt = max(presentationEndAt, spinStartAt + minGameCycleMs)`. In DE-average
mode, maintain a rolling 120-round window and pad so windowed mean ≥ 5000 ms.

### B. Anticipation defaults

- Trigger: fire `anim.scatter.anticipation` on reel R iff committed grid shows ≥ (required−1)
  scatters on reels < R and reel R (or a later reel) carries a possible completing scatter
  position — computed from the outcome manifest / `teasingReels` hint, never randomly. [S21][S26]
- Extension: teased reel travel +1,800 ms (range 1,500–3,000 configurable); pronounced two-phase
  deceleration; final-symbol micro-pause 350 ms (band 250–500 ms). [S17][S19]
- Tier signaling: `feature` tease = standard glow + riser; `super`/`ultimate` tease = stronger
  slow-down + audio escalation. Extended anticipation must respect flash limits (§E).
- Cap total anticipation added per spin at 2 reels × 1.8 s so worst-case round stays < ~7 s.
  [inferred]
- Quick mode: anticipation kept but halved (900 ms). Turbo: replaced by a 250 ms static
  highlight pulse on the completing reel (result already visible). [inferred]

### C. Win tiers, celebrations, count-ups

- Thresholds (CONVENTIONS §4.3, canonical): small < 5x, medium ≥ 5x, big ≥ 15x, mega ≥ 40x,
  epic ≥ 80x, max = cap reached. Market-envelope-validated (big win fires 10–25x across
  studios). [S20]
- LDW rule (hard, all jurisdictions where set, default ON): return ≤ 1.0x total bet ⇒ neutral
  presentation only — pay amount readout + brief line highlight + neutral chime; no "WIN"
  vocabulary, no coins, no music swell. [S1 RTS 14F][S6 AGCO 2.20]
- Count-up (rollup) rules:
  - Fixed duration per tier (speed scales with amount so end time is constant): small 800 ms,
    medium 1,500 ms, big 4,000 ms, mega 6,000 ms, epic 8,000 ms, max 10,000 ms. [S24 pattern;
    values inferred]
  - Two-phase pacing for big+: phase 1 counts at (totalBet/2)/s until display = 20x bet or 60 %
    of tier duration elapses, phase 2 divides remainder over remaining time. [S24]
  - Tick sound rate-limited (≤ 20/s), pitch rises with progress; count ALWAYS lands exactly on
    `totalWinMinor` (integer math, no float drift).
  - Skip: any pointer/space/enter input snaps meter to final value and jumps timeline to
    `skipTo` = tier plaque end-state. Skipping never shortens `minGameCycleMs`. [S3]
- Celebration overlays: plaque in + hold + out — big 4 s, mega 6 s, epic 8 s (upgrade
  transitions if count-up crosses a higher threshold mid-roll: escalate without restarting).
  Max win: 10 s, **non-skippable summary of amount** (skippable flourish), always ends round via
  `max_win_termination` step.
- Feature summary screen: total win non-skippable for minimum 1.5 s, then dismissible.

### D. Skip / slam / fast-forward policy matrix (encode in `spin-presentation.json`)

| Action | UK/ON profile | permissive profile | rule |
|---|---|---|---|
| Slam stop (stop reels early, pre-result-display) | **disabled** [S1][S6] | enabled: settle all reels in 250 ms to committed grid | only after `outcome_committed`; cancels anticipation to end-state |
| Skip win count-up / plaques (post-result) | allowed [S3] | allowed | snap to final values |
| Fast-forward cascades | each cascade step's result must display ≥ 250 ms; step pauses compressible | fully compressible to 150 ms/step | settlement per manifest, never re-ordered |
| Skip feature transition | allowed after destination state visible ≥ 400 ms | allowed | must land in exact target state |
| Skip reality-check / RG / error / max-win amount | **never** | never | input-blocking priority timelines |
| Repeated input (spam) | debounce 150 ms; identical skip requests idempotent | same | duplicate-event protection |

Invariants (test in CI): same manifest ⇒ identical `balanceAfterMinor` across
{normal, quick, turbo, all-skipped, autoplay} replays; no double-fire of any `anim.*`/`sfx.*`
per stepId; skip during network delay shows waiting state instead of advancing past
authoritative data.

### E. VFX / photosensitivity / accessibility budgets

- Flash budget: ≤ 3 flashes/s globally (count every luminance transition ≥ 10 % of max white
  with darker frame < 0.8), no saturated-red flashing, flashing area < 20–25 % of screen;
  no flashing sequence > 5 s. Enforce via a lint pass over `animation-events.json` (declared
  `flashRate`, `flashAreaPct` fields) + PEAT/Harding spot-checks. [S14][S15][S16]
- Screen shake: max amplitude 8 px @1080p-equivalent, max frequency 8 Hz, max burst 400 ms,
  cooldown 1 s; OFF in reduced-motion; user toggle exposed. [S15][S16; numeric caps inferred]
- Reduced-motion variant REQUIRED per event (CONVENTIONS §9.7): substitute fades/dissolves/
  color changes for scale/rotate/parallax/shake; keep all information content. Detect via
  `matchMedia('(prefers-reduced-motion: reduce)')` in engine code (CSS alone can't stop
  WebGL/WAAPI motion) + in-game setting override. [S22]
- Low-performance variant REQUIRED per event: device-tier (GPU/memory/thermal) detection ⇒
  particle budget 50 (low) / 100 (mid) / 150+ (high) concurrent; filters/shaders off at low
  tier; 30 fps cap fallback. Particle pools pre-allocated at profiled peak +25 %, overflow =
  recycle oldest, state reset on acquire, O(1) free-list. [S23][S28]

### F. Timeline engine (client-template requirements)

- Single authoritative ticker; **no setTimeout/setInterval anywhere in presentation code**
  (slotplate's #1 rule) — all delays are timeline offsets, so pause/seek/suspend works. [S21]
- Timelines are pure data: built from `animation-events.json` + the outcome manifest's ordered
  `steps[]`/`events[]`; playback = f(manifest, config, modeFlags). Seekable to any `stepId`
  (recovery: re-fetch committed manifest, seek to `resumePointer`, render end-states instantly —
  GLI-19 §2.7.2/§2.3.7 alignment: incomplete round must resolve and display final outcome before
  a new round). [S13][S21]
- Priority classes (high→low): `regulatory` (reality check, error) > `settlement` (max win,
  feature summary totals) > `feature` (transitions, retriggers) > `win` (count-ups, plaques) >
  `reel` > `ambient`. Higher class preempts lower; preempted timelines snap to end-state.
  Duplicate-event guard: (eventId, stepId) fires once; audio manager enforces per-event
  polyphony caps.
- Suspension handling: on `visibilitychange`/device-sleep resume, compute elapsed time, snap to
  correct step end-state (never replay audio/wins); on WebGL context loss, rebuild textures then
  seek to current step; both paths re-verify state against `state-machine.json`.
- Every event record carries the full CONVENTIONS §9.8 field set; `skipTo` must reference a
  labeled timeline position, and `blocksInput:true` events must enumerate which inputs (spin,
  skip, menu) they block.

### G. Autoplay module (built, but jurisdiction-gated OFF by default)

- Gates: `autoplayAllowed:false` for GB, ON, DE, NL, FI(draft); SE = `true` with each auto
  round ≥ 3 s (LIFS 2018:8/SIFS 2022:3) and a Sweden-ready ≤60-round cap (2026 draft);
  `true` with config for MGA/.com profile. UNKNOWN ⇒ false. [S2][S6][S7][S12][S30][S32]
- Where allowed: finite counts only {10, 25, 50, 75, 100}; mandatory loss-limit set before
  start; optional single-win stop, profit stop, balance-floor stop; remaining-count always
  visible; one-tap stop that takes effect before the next round request (never cancels an
  in-flight settled round). [S11][S25]
- Hard stops (always on): feature/super/ultimate trigger, max win, bet change, insufficient
  balance, network/game error, reality check or any RG interruption, session limit reached.
  No wager queuing; next round requests only after `round_complete`. [S5] + prompt §7.
- Autoplay presentation: quick-spin pacing if quick is legal, else normal; win presentation
  compressed below `big`; reality-check overlay pauses and requires acknowledgement (RTS 13B).
  [S5]

### H. Rapid-input protection

- All spin-starting inputs (pointer, touch, space, enter) route through one gate: requires
  release-then-press (no held-key repeat starts a cycle — RTS 14D / AGCO 2.18 wording), 150 ms
  debounce, disabled until `nextSpinEnabledAt`. [S1][S6]
- Skip inputs idempotent per timeline; input during `reconnecting/recovering` buffered-then-
  dropped; orientation change pauses timeline for ≤ 300 ms relayout then resumes at same
  timestamp; backgrounding/sleep per §F.

### I. HUD/session displays (always-on layer, z-above VFX)

- Elapsed session time (h:mm:ss) and net position displays as permanent HUD elements per
  GB RTS 13C / AGCO 2.21–2.22 profiles; no animation event may obscure them (reserve HUD
  safe-area in layout; celebration overlays letterbox around it). [S5][S6]
- Reality-check overlay: modal, pauses between rounds, acknowledge button + exit-session link +
  account-history link. [S5]
