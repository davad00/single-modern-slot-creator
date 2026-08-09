# Step 7 — Immersive UI/UX Specification

Role: `agents/creative-director.md` · Gate: **G7** (SKILL.md: "every screen/state in
`prompts/ui-ux.md` §Layouts specified for portrait, landscape, tablet, desktop,
ultrawide; HUD always shows balance, total bet, win, spin state; every control has
all 10 component states")

## Objective

Specify the complete interface of THE selected game as a cohesive interactive world:
4 game-state wireframes, 5 responsive layouts with exact anchor rules, reel sizing
math, a full HUD hierarchy, every control with all 10 component states, all feature
interfaces, all edge/failure states, and the accessibility + immersion contracts.
Output = full spec in `docs/ui-spec.md` + summary in `docs/game-design-document.md`
§16/§22. Everything here is presentation; nothing in this step may imply the client
can influence a committed outcome (CONVENTIONS §9.1–9.2).

## Read first

1. `CONVENTIONS.md` §4.1/§4.3 (tier + event ids), §9 (esp. 9.2, 9.5, 9.6, 9.7), §10.
2. `research/08-ui-ux-conventions.md` — Design implications D1–D13 are the defaults;
   deviate only with a reason logged in `docs/decision-log.md`.
3. `research/13-responsible-design-accessibility.md` §6–§9 + D1/D5/D6 (LDW, session
   HUD, accessibility hard numbers).
4. Step 3–6 outputs: `docs/game-design-document.md` §1–§14, `config/paytable.json`,
   `config/symbols.json`, `config/features.json`, `config/bonus-buys.json`,
   `config/scatter-tiers.json`, `config/jurisdiction-policies.json`,
   `config/spin-presentation.json`, `config/autoplay.json`.
5. `client-template/src/presentation/hud.ts` and `app.ts` — anchor/layout API you are
   specifying against.
6. `prompt.txt` lines 926–1076 (the binding checklist this step must cover in full).

## Procedure

1. **Define the 5 layouts** (this table is the "§Layouts" set the G7 gate text in
   SKILL.md refers to). For each, record: design reference resolution, trigger
   condition, and the anchor rules below. Use a 9-point anchor grid (TL/TC/TR/ML/C/MR/
   BL/BC/BR); every HUD element declares `anchor + offset(CSS px) + scale rule`.

   | Layout | Reference | Trigger | Composition rule |
   |---|---|---|---|
   | Mobile portrait (PRIORITY — design this first) | 390×844, min supported 320×568 | aspect < 0.75 | reels in upper 55–62% of height; meter strip directly below reels; spin cluster centred in bottom third (thumb zone) |
   | Mobile landscape | 844×390 | aspect ≥ 1.3 ∧ height < 500 | reels centred; right-side vertical control stack (spin largest, autoplay above, bet below); menu + sound bottom-left |
   | Tablet | 1024×768 | 500 ≤ height ∧ 0.75 ≤ aspect < 1.9 | landscape composition, touch targets scaled ×1.15 |
   | Desktop | 1920×1080 | pointer:fine ∧ aspect < 2.0 | landscape composition + keyboard map + fullscreen toggle (desktop only — no iOS fullscreen API) |
   | Ultrawide | 2560×1080 | aspect ≥ 2.0 | desktop HUD anchored to central 16:9 zone; background art extends edge-to-edge; nothing interactive outside the 16:9 zone |

   Safe areas: require `viewport-fit=cover`; pad interactive HUD by
   `max(env(safe-area-inset-bottom), 16px)` bottom and ≥ 20 px top in landscape; side
   insets up to 62 pt (Dynamic Island) — controls never inside inset regions,
   decorative art bleeds behind notch/island. Orientation change: live relayout
   ≤ 300 ms, no reload, no state loss; both orientations supported (no `lock()` on
   iOS); in-flight win countup keeps its value across relayout.
2. **Do the reel/grid sizing math.** Formula:
   `cellCss = floor((vw − 2·gutter − (nReels−1)·gap) / nReels)`, gutter 8 px, gap 4 px,
   `renderedPx = cellCss × min(devicePixelRatio, 2)`. **Readability rule: renderedPx
   ≥ 120 physical px on every supported viewport** — FAIL the layout otherwise.
   Tabulate at minimum: 320, 390, 428 (portrait width), 768, 1080 (reel-area height
   budget in landscape/desktop). Example (5 reels @ 390 px): cellCss = 72,
   rendered = 144 ≥ 120 ✓; @ 320 px: cellCss = 60, rendered = 120 ✓ (exactly at
   floor). If the game's grid is wider than 6 reels and fails at 320 px, log the
   raised minimum viewport in `docs/assumption-log.md`.
3. **Draw the wireframes.** One ASCII block (or Mermaid `block` diagram) per game
   state × layout: base game, `feature`, `super_feature`, `ultimate_feature`, each in
   mobile portrait AND desktop; the other three layouts get delta notes ("as desktop,
   except…"). Every wireframe labels: reel area, meter strip, spin cluster,
   feature-buy entry, menu/info entries, the 24 px regulatory strip, and what the
   tier transforms (background, frame, meters — tiers must look materially different,
   CONVENTIONS §9.3). No unlabeled boxes.
4. **Specify the HUD hierarchy.** Always visible in every layout and every state:
   **balance (currency), total bet (currency), win meter, spin state** — plus active
   autoplay count, active quick/turbo badge, feature-buy price (where enabled),
   max-win statement reachable ≤ 1 tap, RTP where jurisdiction requires. Exact
   placement per layout (portrait: balance left / total bet centre / win right of the
   meter strip; landscape/desktop: bottom-left strip). Spin button ≥ 72 px mobile,
   ≥ 96 px desktop. Reserve a 24 px top strip for operator regulatory UI (session
   clock, net position, RG links) via `hudApi.setRegulatory(...)`; no animation may
   obscure it. Win meter: counts up per motion spec; balance updates only at
   settlement; return ≤ stake renders as neutral result readout — never win-styled
   (research/13 D1).
5. **Specify every control with all 10 component states.** Controls (all of
   prompt.txt 1018–1076): spin, stop/skip, autoplay, quick-spin, turbo-spin, bet
   selector, coin-value selector (only if the math model needs it), total-bet
   display, balance display, current-win display, feature-buy, enhanced-chance,
   settings, sound toggle, music toggle, fullscreen, paytable, game rules, feature
   guide, network status, loading, reconnection, error, insufficient balance,
   orientation change, reduced-motion mode, low-performance mode, data-saver mode,
   game history/replay. For EACH produce a 10-row state table —
   `default / hover / focused / pressed / disabled / active / loading / error /
   hidden / jurisdiction-disabled` — with three columns: visual delta (colour/scale/
   icon change with numbers), input handling, screen-reader announcement.
   Rules: `hidden` ≠ `jurisdiction-disabled` — jurisdiction-gated controls (autoplay,
   quick/turbo, feature-buy, enhanced-chance, slam stop) are REMOVED (hidden), not
   greyed, when the policy flag is off; UNKNOWN jurisdiction = most restrictive
   (CONVENTIONS §9.6). Spin requires release-and-re-press; held input never starts a
   cycle; 150 ms debounce; disabled until `nextSpinEnabledAt` (min round duration).
6. **Bet selector.** Single total-bet stepper (−/+) + tap-to-open bet sheet with
   preset chips (min…max from `config/game-config.json`), Min/Max buttons,
   current-bet highlight. Long-press acceleration OFF. Bet changes disabled
   mid-round; bet change stops autoplay. Never visually privilege Max Bet; no
   raise-stake prompts anywhere (RTS 14A / AGCO 11.1.7).
7. **Autoplay panel** (rendered only where `autoplay` policy = true). Round-count
   presets {10, 25, 50, 75, 100} — finite only, no infinite option. Mandatory
   loss-limit set before start. Optional stops: single win ≥ X, profit ≥ X, balance
   < X. Always-on stops (list them verbatim in the spec): feature / super_feature /
   ultimate_feature trigger, insufficient balance, network error, game error, RG /
   reality-check interruption, bet change, max win. Remaining-count on the spin
   button; one-tap STOP always visible; stop takes effect before the next round
   request. No wager queue, no overlapping rounds.
8. **Feature-buy interface** (only where `bonusBuy` policy = true; hidden otherwise).
   Entry panel left of reels (landscape) / chip above reels (portrait) with themed
   art + cheapest price. Tap → modal listing each purchasable tier from
   `config/bonus-buys.json` with price in x-bet AND currency at current bet, one-line
   description, and the buy-mode RTP disclosure per tier. Two-step commit: Confirm
   restates price; Cancel is the focused default. Disabled when balance < price,
   mid-round, or during autoplay. Post-buy, the triggering spin plays out visibly.
9. **Settings, paytable, rules.** Burger menu contents: sound FX, music, quick/turbo
   (gated), battery-saver/low-perf, reduced motion, screen-shake off/low/full,
   haptics (hidden where unsupported), data-saver, intro screen on/off, game history,
   rules, paytable, feature guide, version + RTP footer; persist all toggles in
   localStorage keyed by `projectSlug`. Paytable: paged overlay ≤ 1 tap from base
   HUD, order: features & scatter tiers (3/4/5+ trigger counts), buy prices (where
   enabled), symbol pays, lines/ways diagram, general rules + malfunction clause +
   max win + RTP % per active profile, version footer. **Every pay value is computed
   at render time from `config/paytable.json` (`payX100/100 × current bet`) — single
   source of truth; hand-typed pay values are a G7 FAIL.** Overlays never block
   settlement and are never states in the game state machine (CONVENTIONS §4.4).
10. **Loading UX.** Sequence: inline splash (< 300 KB) → determinate progress bar
    with % + one rotating feature hint → bar morphs into bottom-centre
    **Continue/Play button (≥ 64 px)** whose tap is the audio-unlock gesture
    (`AudioContext.resume()` in the handler; verify `state === 'running'`;
    silent-safe fallback) → optional intro screen (feature panels, max win,
    volatility meter, "don't show again") → ready. Budget: interactive core ≤ 8 MB /
    ≤ 5 s on 4G; stream feature/big-win/audio bundles in background with per-bundle
    retry.
11. **Edge & failure states.** Reconnecting: blocking overlay with spinner, elapsed
    time, "your result is safe" copy; on recovery, seek presentation to the committed
    manifest's `resumePointer` — no re-spin theatre. Error: modal with plain-language
    message, error code, `roundId`, malfunction-voids clause, lobby-return callback.
    Insufficient balance: spin disabled + inline message; NO in-game deposit upsell.
    Network status: subtle glyph, non-blocking toast on degradation. Game history:
    committed-round list with per-round detail (bet, win, timestamps, steps) +
    manifest replay.
12. **Reduced-motion, low-performance, data-saver variants.** Reduced motion
    (OS `prefers-reduced-motion` OR in-game toggle): parallax/shake/zoom off, spins
    present via ≤ 300 ms cross-fade, information parity mandatory. Low-performance
    (device tier or FPS < 30 for 5 s → auto-suggest): particle budget ≤ 50, shaders
    off, DPR cap 1, static background layers. Data-saver: skip hi-res atlases,
    static backgrounds, defer non-critical audio. Specify what each variant changes
    per screen — "same as normal" must be an explicit statement.
13. **Accessibility contract** (research/13 D6 — these are gate numbers): all
    targets ≥ 44×44 CSS px with ≥ 8 px spacing; HUD text contrast ≥ 4.5:1, controls/
    focus ≥ 3:1; no information by colour alone (symbol silhouettes distinct under
    protan/deutan/tritan simulation); keyboard map (Space/Enter spin, +/− bet,
    P paytable, M mute, Esc close) with visible focus ring ≥ 3:1 never fully
    obscured; hidden focusable sub-DOM twins for canvas controls + `aria-live`
    announcer ("Win 4.50, balance 98.20"); text scaling to 200% via a UI scale
    factor, body ≥ 16 px, meter labels ≥ 12 px; flash ≤ 3/s; no drag-only inputs;
    feature picks wait indefinitely.
14. **Immersion layer.** Full-scene composition default: 4 background layers
    (far/mid/near/foreground-occluder) with parallax factors 0.05/0.15/0.3/1.2 of
    camera motion; ambient idle loops on ≥ 2 layers. Reactive environment: a trigger
    table mapping game events → environment reactions (e.g. `anim.scatter.land` →
    lighting flicker; win ≥ `big` → environment glow cast; each tier entry → full
    world transform: background + frame + lighting + music state). If the concept
    has a character: reaction set {idle, win-small, win-big, anticipation,
    feature-enter}; reactions NEVER fire on returns ≤ stake and never imply "due to
    hit". Camera: anticipation push-in ≤ 4% over ≤ 1.2 s; big-win zoom ≤ 8%; all
    zeroed under reduced motion. Hand this table to step 8 as the environment-event
    inventory.
15. **Write the outputs.** Full spec → `docs/ui-spec.md` (metadata block per
    CONVENTIONS §10 first). Summaries → GDD §16 (layouts, HUD, screens) and §22
    (accessibility). Record the five breakpoint definitions verbatim so step 11 can
    generate `config/device-profiles.json` from them. Append `docs/decision-log.md`
    (composition family, control-placement choices) and `docs/assumption-log.md`
    (anything resolved from AUTO). Update `artifact-manifest.json`.

## Outputs

All under `games/<slug>/` (CONVENTIONS §3):

- `docs/ui-spec.md` — the full specification from Procedure 1–14: 5 layout
  definitions, sizing table, ≥ 8 wireframes + deltas, HUD hierarchy, ~29 control
  state-matrices, feature interfaces, loading/edge states, variant specs,
  accessibility contract, immersion trigger table.
- `docs/game-design-document.md` — §16 UI summary + §22 Accessibility filled.
- `docs/decision-log.md`, `docs/assumption-log.md` — appended.
- `artifact-manifest.json` — updated.

## Gate checklist — G7 (all must pass before step 11 consumes this)

- [ ] All 5 layouts (portrait, landscape, tablet, desktop, ultrawide) defined with
      reference resolution, trigger condition, anchor rules, safe-area handling, and
      orientation-change behaviour — every screen/state covered in each.
- [ ] Wireframes exist for base + all three tiers (portrait AND desktop), each tier
      visibly/materially different; every wireframe region labelled.
- [ ] Sizing table present; rendered symbol ≥ 120 physical px at every supported
      viewport, or a logged raised-minimum assumption.
- [ ] HUD shows balance, total bet, win, spin state in EVERY layout and EVERY state
      (verify against each wireframe); regulatory strip reserved.
- [ ] Every control listed in Procedure 5 has all 10 component states with visual/
      input/announcement columns — a missing state or missing control is a FAIL.
- [ ] Jurisdiction-gated controls are hidden (not greyed) when off; UNKNOWN maps to
      most-restrictive; autoplay panel has round count + every stop condition.
- [ ] Feature-buy shows per-tier price (x-bet + currency) + buy-mode RTP disclosure
      + two-step confirm, and is policy-gated.
- [ ] Paytable/rules values are generated from `config/paytable.json` — spec states
      the recompute rule; no hand-typed pay numbers anywhere in the spec.
- [ ] Loading sequence includes progressive budget numbers + audio-unlock continue
      gate; error/reconnection/insufficient-balance states fully specified.
- [ ] Reduced-motion, low-performance, data-saver variants specified per screen.
- [ ] Accessibility contract complete with the exact numbers (44 px, 8 px, 4.5:1,
      3:1, 200%, ≤ 3 flashes/s, keyboard map).
- [ ] Immersion: parallax layer counts + factors, reactive-environment trigger
      table tied to real game events, character rules (or "no character" logged).

## Failure handling

- Fix-and-recheck per failing item; max 3 attempts, then record FAILED-GATE G7 with
  evidence in `docs/validation-report.md` and stop honestly.
- Sizing rule unsatisfiable for the chosen grid: first shrink gutters/gap to the
  44 px-spacing floor, then raise the minimum supported viewport (log it) — never
  ship symbols below 120 rendered px.
- A control state that "can't happen" (e.g. `loading` on the balance display) is
  still specified — write the state and mark it `unreachable — <reason>`; do not
  delete rows.
- Conflict between a research/08 default and the concept's theme: theme may restyle,
  never remove, an always-visible HUD element or a gate number; log the deviation.
