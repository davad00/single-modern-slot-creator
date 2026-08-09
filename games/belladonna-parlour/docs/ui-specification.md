# UI/UX Specification — Belladonna's Parlour

| Field | Value |
|---|---|
| Game name | Belladonna's Parlour |
| Project slug | belladonna-parlour |
| Game version | 0.1.0 |
| Math version | 0.1.0 |
| Config hash | display `sha256:8f38ce34a29052bf03359e0283accbd892b91c157b2affcf95dd185dab0c4956` (see GDD metadata) |
| Date | 2026-08-08 |
| Generator | single-modern-slot-creator v1.0.0 · step 7 (gate G7) |
| Companion configs | `config/spin-presentation.json` · `config/autoplay.json` · `config/device-profiles.json` |

---

## 0. Scope & binding invariants

This document specifies the complete interface of Belladonna's Parlour as one cohesive
interactive world: the candle-lit Victorian apothecary parlour (base game) and its three
ever-deeper chambers — **The Tasting** (`feature`), **The Distillery** (`super_feature`),
**The Night Garden** (`ultimate_feature`).

Everything in this document is **presentation**. Nothing here can determine, predict, or alter a
committed outcome (CONVENTIONS §9.1–9.2). The client is a pure renderer of the outcome manifest;
skip/quick/turbo/autoplay re-time presentation only. Overlays (paytable, rules, settings, buy
menu, history) are **never** states in the game state machine (CONVENTIONS §4.4) and never block
settlement.

Hard numbers carried throughout (research/08 D1–D13, research/13 D6, CONVENTIONS §9.7):

- Touch targets ≥ **44×44 CSS px**, ≥ **8 px** spacing between adjacent targets.
- Spin button ≥ **72 px** mobile, ≥ **96 px** desktop.
- HUD text contrast ≥ **4.5:1**; non-text controls & focus indicators ≥ **3:1**.
- Symbol rendered size ≥ **120 physical px** on every supported viewport (§2).
- Orb value plate text ≥ **24 CSS px** (GDD §6.4 mobile-readability commitment).
- Flash rate ≤ **3/s** everywhere; zero saturated-red full-screen flashes.
- Text scaling to **200%** via UI scale factor; body ≥ 16 px; meter labels ≥ 12 px.
- LDW rule (unconditional, all policies): a return ≤ stake is a neutral result readout, never
  win-styled (research/13 D1; CONVENTIONS §9.5).
- Jurisdiction-gated controls are **removed (hidden), never greyed**, when their policy flag is
  off; UNKNOWN jurisdiction ⇒ `restricted-default` (most restrictive; CONVENTIONS §9.6).

Policy flags referenced below come from `config/jurisdiction-policies.json`:
`autoplayEnabled, quickSpinEnabled, turboSpinEnabled, slamStopEnabled, animationSkipEnabled,
bonusBuyEnabled, enhancedChanceEnabled, minimumRoundDurationMs, maxStakeMinor,
ldwCelebrationSuppressed, showRtp, showMaximumWin, showGameHistory, netPositionDisplay,
sessionClockDisplay, realityCheckMinutes`.

---

## 1. Layout system — five layouts

A 9-point anchor grid is used everywhere: **TL / TC / TR / ML / C / MR / BL / BC / BR**.
Every HUD element declares `anchor + offset(CSS px) + scale rule`. `app.ts` resolves the layout
on boot and on every resize/orientation event.

| # | Layout | Reference resolution | Trigger condition | Composition rule |
|---|---|---|---|---|
| L1 | **Mobile portrait** (PRIORITY) | 390×844 · min supported **375×667** (raised — see §2 assumption UI-A1) | aspect < 0.75 | cabinet in upper 55–62% of height; meter strip directly below cabinet; spin cluster centred in bottom third (thumb zone) |
| L2 | Mobile landscape | 844×390 | aspect ≥ 1.3 ∧ height < 500 | cabinet centred; right-side vertical control stack (spin largest at centre-right, autoplay above, bet below); menu + sound bottom-left; buy panel left of cabinet |
| L3 | Tablet | 1024×768 | 500 ≤ height ∧ 0.75 ≤ aspect < 1.9 | landscape composition; touch targets scaled ×1.15 |
| L4 | Desktop | 1920×1080 | pointer:fine ∧ aspect < 2.0 | landscape composition + keyboard map (§13.3) + fullscreen toggle (desktop only — no iOS fullscreen API) |
| L5 | Ultrawide | 2560×1080 | aspect ≥ 2.0 | desktop HUD anchored to central 16:9 zone; parlour art extends edge-to-edge; **nothing interactive outside the 16:9 zone** |

### 1.1 Anchor rules per layout (all interactive elements)

Offsets are from the anchor point; positive x → right, positive y → down. "safe+" means the
offset is additionally padded by the relevant `env(safe-area-inset-*)`.

| Element | L1 portrait | L2 landscape | L3 tablet | L4 desktop | L5 ultrawide |
|---|---|---|---|---|---|
| Regulatory strip (24 px) | TC (0, 0), full width | TC (0, 0), width minus side insets | as L2 | TC (0, 0) | TC of 16:9 zone |
| Settings ⚙ | TL (16, safe+32) | BL (safe+16, −16) | as L2 | BL (16, −16) | BL of 16:9 zone |
| Sound shortcut | TL (16+52, safe+32) | BL (safe+16+52, −16) | as L2 | BL (68, −16) | as L4 in zone |
| Paytable ⓘ / rules | TR (−16, safe+32) | BL (safe+16+104, −16) | as L2 | BL (120, −16) | as L4 in zone |
| Cabinet (6×5) | TC (0, safe+96), width-bound | C (−40, 0), height-bound | C (−40, 0) | C (0, −40), height-bound | C of 16:9 zone |
| Master vial (features) | MR (−10, 0) beside cabinet, drops to TC (0, safe+60) below 400 px width | ML (safe+16, −40) left of control stack | as L2 | ML (140, 0) | as L4 in zone |
| Buy entry (Ledger) | BL (16, −196) chip above meter strip | ML (safe+16, 0) panel left of cabinet | as L2 | ML (24, 0) | as L4 in zone |
| Patron's Ante toggle | BL (16+128, −196) beside Ledger chip | ML (safe+16, 96) below buy panel | as L2 | ML (24, 120) | as L4 in zone |
| Meter strip (balance/bet/win) | BC (0, −132), full width row | BL (safe+16, −16) horizontal strip | as L2 | BL (200, −16) | as L4 in zone |
| Spin button | BC (0, −56), Ø 88 px | MR (−safe−24, 0), Ø 96 px | MR, Ø 110 px | MR (−32, 0), Ø 96 px | MR of 16:9 zone |
| Autoplay button | BC (104, −56) right of spin | MR (−safe−24, −120) above spin | as L2 | MR (−32, −120) | as L4 in zone |
| Bet stepper −/+ | BC (−104, −56) left of spin | MR (−safe−24, 120) below spin | as L2 | MR (−32, 120) | as L4 in zone |
| Quick/turbo badges | BC (0, −8) under spin | MR (−safe−24, 190) | as L2 | MR (−32, 190) | as L4 in zone |
| Info line (RTP · max win) | BC (0, −4), 12 px text | BR (−safe−16, −4) | as L2 | BR (−16, −4) | BR of 16:9 zone |
| Network glyph | TR (−16, safe+80) | TR (−safe−16, 28) | as L2 | TR (−16, 28) | TR of 16:9 zone |
| Toast/banner area | TC (0, safe+56) | TC (0, 28) | as L2 | TC (0, 28) | TC of 16:9 zone |

Scale rules: controls scale with `min(vw/390, 1.35)` in L1 and `min(vh/768, 1.25)` in L2–L5;
touch targets never scale below 44 px; tablet multiplies control scale ×1.15.

### 1.2 Safe areas & notch (all layouts)

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
  is mandatory; without it every `env(safe-area-inset-*)` reads 0 and Safari letterboxes.
- Interactive HUD padded by `max(env(safe-area-inset-bottom), 16px)` at the bottom and ≥ 20 px
  at the top edge in landscape (landscape inset-top reports 0 — keep the buffer anyway).
- Side insets up to 62 pt (Dynamic Island, landscape): **no control ever inside an inset
  region**; the parlour scene art bleeds behind notch/island/home-indicator.
- Insets are read into the canvas layer via CSS custom properties + `getComputedStyle`
  (no direct JS API).

### 1.3 Orientation change

- Both orientations always supported — no `screen.orientation.lock()` anywhere (absent on iOS;
  feature-detected fullscreen+lock is NOT used because both orientations are first-class).
- Live relayout ≤ **300 ms**, no reload, no state loss: the presentation timeline continues,
  an in-flight win count-up keeps its current value and easing position across relayout.
- Exactly one debounced (≥ 250 ms) resize handler (iOS resize-leak, `device-profiles.json`
  runtimeBudgets); mid-round the committed manifest keeps playing — orientation can never
  interrupt settlement.
- No "please rotate" gate in normal play (both orientations work). The rotate hint exists only
  for the sub-375 px unsupported-viewport case (§2, control C26).

---

## 2. Cabinet & grid sizing math

Formula (step-7 rule): `cellCss = floor((vw − 2·gutter − (nReels−1)·gap) / nReels)` with
`nReels = 6`, `renderedPx = cellCss × min(devicePixelRatio, 2)`.
**Readability rule: renderedPx ≥ 120 physical px on every supported viewport.**

Gutter/gap are adaptive in portrait (cabinet frame art absorbs the difference):

- width ≥ 390 px: gutter 6, gap 3 (comfortable)
- 375 ≤ width < 390: gutter 2, gap 2 (tight mode; frame art overlays the outer 2 px)

| Viewport | gutter/gap | cellCss | rendered @ min(DPR,2)=2 | Verdict |
|---|---|---|---|---|
| 320 portrait | 2/2 | floor(306/6)=51 | 102 | **FAIL — below raised minimum, unsupported** |
| 360 portrait | 2/2 | floor(346/6)=57 | 114 | **FAIL — below raised minimum, unsupported** |
| 375 portrait (new minimum) | 2/2 | floor(361/6)=60 | 120 | PASS (exactly at floor) |
| 390 portrait (reference) | 6/3 | floor(363/6)=60 | 120 | PASS |
| 428 portrait | 6/3 | floor(401/6)=66 | 132 | PASS |
| 844×390 landscape (height-bound: budget 390−24 reg −8 pad −30 frame = 328 for 5 rows, gap 3) | −/3 | floor(316/5)=63 | 126 | PASS |
| 1024×768 tablet (height budget ≈ 520) | −/4 | floor(504/5)=100 | 200 | PASS |
| 1920×1080 desktop (height budget 66% = 712) | −/4 | floor(696/5)=139 | 139 @ DPR 1 | PASS |
| 2560×1080 ultrawide (as desktop, 16:9 zone) | −/4 | 139 | 139 @ DPR 1 | PASS |

In landscape/desktop the cabinet is **height-bound**: `cellCss = floor((hBudget − 4·gap)/5)`,
then cabinet width = `6·cellCss + 5·gap` is centred; it always fits (≤ 850 px at 1080 height).

> **ASSUMPTION UI-A1 (raised minimum viewport).** A 6-reel grid cannot reach 120 physical px
> below 375 CSS px width even at the 2 px gutter/gap floor (360 px ⇒ 57 css ⇒ 114 phys).
> Minimum supported viewport is therefore raised from the skill default 320×568 to
> **375×667 CSS px**. Viewports narrower than 375 px get the unsupported-viewport message
> (C26) instead of a degraded cabinet — symbols below 120 rendered px never ship
> (prompts/ui-ux.md failure rule). Note: most sub-390 Androids report DPR 3; the device-profile
> `dprCap` (high=3) renders them sharper than the conservative min(DPR,2) figure above, but the
> gate evaluates the conservative formula. *To be mirrored into `docs/assumption-log.md` by the
> integration step — that file is outside this job's write list.*

Orb value plates: font-size `max(24, round(cellCss × 0.40))` CSS px, bold, on an opaque plate
(≥ 4.5:1 against plate); at the 60 px minimum cell the plate text is exactly 24 px.

---

## 3. Wireframes

Conventions: every box is labelled; `REG` = 24 px regulatory strip (operator session clock ·
net position · RG links via `hudApi.setRegulatory(...)`); `LEDGER` = feature-buy entry
(policy-gated); `ANTE` = Patron's Ante toggle (policy-gated); `VIAL` = master vial (P bank).
All eight wireframes below keep **balance, total bet, win, spin state** visible at all times.

### 3.1 Base game — mobile portrait (L1, 390×844)

```
┌──────────────────────────────────────────┐
│ REG: 24px strip · session clock · net pos│  ← reserved, nothing may obscure it
├──────────────────────────────────────────┤
│ [⚙ settings]   (title crest)  [ⓘ paytbl] │  ← top bar, 44px targets
│                                          │
│   parlour backdrop: rain on leaded       │  ← parallax layers far/mid
│   glass, candle sconces, bottle shelves  │
│ ┌──────────────────────────────────────┐ │
│ │ APOTHECARY CABINET — 6×5 grid        │ │  ← reel area, cells ≥60css
│ │ (brass frame; scatter = Parlour Seal;│ │     upper ~58% of height
│ │  orbs carry ≥24px value plates)      │ │
│ └──────────────────────────────────────┘ │
│  foreground occluder: counter edge, ivy  │  ← parallax 1.2 layer
│ [LEDGER chip £/x] [ANTE toggle ×1.20]    │  ← policy-gated row; hidden ⇒ row collapses
├──────────────────────────────────────────┤
│ BALANCE €—.——  TOTAL BET €—.——  WIN €—.——│  ← meter strip (always visible)
│                                          │
│ [− bet +]      (( SPIN Ø88 ))    [AUTO]  │  ← spin cluster, thumb zone
│ quick·turbo badges     RTP —% · MAX 10000×│  ← info line (policy-gated RTP)
│           home indicator safe area       │
└──────────────────────────────────────────┘
```

Spin state is carried by the spin button itself (label + colour per C1) — one of
`idle/requesting/spinning/skippable/disabled` is always legible.

### 3.2 Base game — desktop (L4, 1920×1080)

```
┌────────────────────────────────────────────────────────────────────┐
│ REG strip 24px (session clock · net position · RG links)           │
├────────────────────────────────────────────────────────────────────┤
│  parlour wide shot: shelves recede left+right (parallax far/mid)   │
│                                                                    │
│  [LEDGER panel]      ┌──────────────────────┐        [ VIAL dock ] │
│  Buy: The Tasting…   │  APOTHECARY CABINET  │        (empty in    │
│  (3 tiers + prices   │  6×5 · cell 139css   │         base game — │
│   from config)       │                      │         dock shows  │
│  [ANTE toggle]       └──────────────────────┘         brass stand)│
│                        foreground occluder             [AUTO]      │
│                                                        (( SPIN )) │
│                                                        [− bet +]  │
│                                                        [Q][T]     │
│ [⚙][♪][ⓘ]   BALANCE €—.——  TOTAL BET €—.——  WIN €—.——   RTP·MAX   │
└────────────────────────────────────────────────────────────────────┘
```

Right-side vertical control stack (spin largest at centre-right); meters bottom-left strip;
menu/sound/info bottom-left corner. Keyboard map active (§13.3); fullscreen toggle in settings.

### 3.3 The Tasting (`feature`) — mobile portrait

World transform vs 3.1 (materially different, CONVENTIONS §9.3): curtain drawn back — the
**back parlour** at close candle-light; warmer palette; cabinet re-dressed in darker wood;
`music.feature` state.

```
┌──────────────────────────────────────────┐
│ REG strip (unchanged, never transformed) │
├──────────────────────────────────────────┤
│ [⚙]  THE TASTING — banner   [ⓘ]          │  ← tier name in text (not colour-only)
│ back-parlour backdrop: velvet curtain,   │
│ tea service, close candlelight           │
│ ┌──────────────────────────────────────┐ │
│ │ CABINET (feature reel set)           │ │
│ └──────────────────────────────────────┘ │
│ [VIAL ×P (≥24px)]      [SPINS LEFT: n]   │  ← feature HUD row REPLACES ledger/ante row
├──────────────────────────────────────────┤     (buys/ante disabled during features)
│ BALANCE  ·  TOTAL BET  ·  WIN            │  ← unchanged, always visible
│ [− bet +]≡locked  (( SPIN/auto-run ))    │  ← bet locked mid-feature; spin advances rounds
│ badges                    RTP · MAX      │
└──────────────────────────────────────────┘
```

Master vial appears on the counter (portrait: left slot of the feature HUD row; it is the P
display — value plate ≥ 24 px, always paired with the literal text "×P").

### 3.4 The Tasting — desktop

As 3.2 with: back-parlour backdrop; LEDGER/ANTE panel replaced by the **VIAL dock** activating
(vial fills as P grows; numeric ×P beside it) + **SPINS LEFT** counter above the control stack;
banner "THE TASTING" TC under the REG strip; `music.feature`.

### 3.5 The Distillery (`super_feature`) — mobile portrait

World transform: descent to the **copper-lit cellar**; steam, green glass glow; cabinet frame
becomes riveted copper; `music.super_feature` (low brass + cimbalom).

```
┌──────────────────────────────────────────┐
│ REG strip                                │
├──────────────────────────────────────────┤
│ [⚙]  THE DISTILLERY — banner  [ⓘ]        │
│ cellar backdrop: copper stills, steam,   │
│ green glass glow (lighting state 2)      │
│ ┌──────────────────────────────────────┐ │
│ │ CABINET (super_feature reel set —    │ │
│ │  premium-boosted, L5 removed)        │ │
│ └──────────────────────────────────────┘ │
│ [VIAL ×P] [PRESSURE DIAL] [SPINS LEFT n] │  ← + distillery pressure dial (pure
├──────────────────────────────────────────┤    presentation of P growth rate, GDD §9)
│ BALANCE  ·  TOTAL BET  ·  WIN            │
│ [− bet +]locked   (( SPIN ))             │
└──────────────────────────────────────────┘
```

### 3.6 The Distillery — desktop

As 3.4 with cellar backdrop, copper frame, VIAL dock + **pressure dial** gauge beside it,
banner "THE DISTILLERY". Dial is decorative-informative only (needle rate = recent P growth);
its value is always also present as the numeric ×P (no information by motion/colour alone).

### 3.7 The Night Garden (`ultimate_feature`) — mobile portrait

World transform: **moonlit glass conservatory**; belladonna in bloom, prisms hanging from the
glass roof; exclusive nocturne `music.ultimate_feature`; FX1 (The Prisming Vial) exists only
here.

```
┌──────────────────────────────────────────┐
│ REG strip                                │
├──────────────────────────────────────────┤
│ [⚙]  THE NIGHT GARDEN — banner  [ⓘ]      │
│ conservatory backdrop: moonlight through │
│ glass roof, blooming belladonna, hanging │
│ prisms (parallax + refraction shafts)    │
│ ┌──────────────────────────────────────┐ │
│ │ CABINET (ultimate reel set, FX1 on   │ │
│ │  reels 1 & 4; upgraded orb tables)   │ │
│ └──────────────────────────────────────┘ │
│ [VIAL ×P] [PRISM RAIL ◇◇◇] [SPINS LEFT n]│  ← + prism rail: one gem per Prisming
├──────────────────────────────────────────┤    (doubling) event this feature
│ BALANCE  ·  TOTAL BET  ·  WIN            │
│ [− bet +]locked   (( SPIN ))             │
└──────────────────────────────────────────┘
```

### 3.8 The Night Garden — desktop

As 3.6 with conservatory backdrop; VIAL dock + **prism rail** (each Prisming event adds a lit
prism gem with a "×2" text tag — count also announced via `aria-live`); banner "THE NIGHT
GARDEN"; prisming VFX refracts through the vial (`anim.ultimate_feature.prisming`,
`sfx.prisming.chime`).

### 3.9 Delta notes — remaining layouts (apply to all four states)

- **Mobile landscape (L2):** as desktop composition compressed — cabinet centred
  (height-bound cell 63 css), right vertical stack (AUTO above SPIN Ø96 above bet stepper),
  LEDGER/ANTE (or VIAL/dial/rail in features) left of cabinet; meters in one bottom-left row;
  menu + sound bottom-left corner; REG strip full width minus side insets.
- **Tablet (L3):** exactly the landscape composition with all touch targets ×1.15
  (spin Ø 110); no keyboard map; no fullscreen toggle (iPad element-fullscreen exists but the
  toggle ships desktop-only for consistency).
- **Ultrawide (L5):** desktop HUD pinned to the central 16:9 zone; parlour/cellar/conservatory
  art extends edge-to-edge with ambient loops in the wings; nothing interactive outside the
  zone; REG strip spans only the 16:9 zone (operator wrapper owns the rest).

---

## 4. HUD hierarchy

### 4.1 Always visible — every layout, every state

| Element | Content | Placement (L1 / L2–L5) | Rules |
|---|---|---|---|
| Balance | account currency, from `balanceAfterMinor` only | meter strip left / bottom-left strip | updates at settlement only, never mid-presentation |
| Total bet | currency (ante ON shows `×1.20` tag) | meter strip centre / strip | changes only via bet selector, locked mid-round |
| Win meter | currency; `—` when idle | meter strip right / strip | counts up per `spin-presentation.json`; LDW renders neutral (§0) |
| Spin state | spin button state machine (C1/C2) | spin cluster / right stack | one of idle · requesting · spinning · skippable · disabled always legible as label text |
| Autoplay remaining | count on/beside spin button | on spin button ring | only while autoplay active (C3) |
| Quick/turbo badge | active-mode badge | under spin / stack | only when mode ≠ normal |
| Regulatory strip | session clock · net position · RG links | 24 px TC strip | operator-fed via `hudApi.setRegulatory({netPositionMinor, elapsedSeconds, clockText})`; **no animation may obscure it**; rendered whenever `sessionClockDisplay` / `netPositionDisplay` are true (all shipped policies) |
| Info line | `RTP nn.nn%` (when `showRtp`) · `MAX WIN 10,000×` (when `showMaximumWin`) | info line BC/BR | max-win statement reachable ≤ 1 tap (paytable) as well |

### 4.2 Feature-only HUD additions

| Element | Tiers | Content | Rules |
|---|---|---|---|
| Master vial (C31) | all three | fill level + numeric **×P** (text ≥ 24 px) | P value comes only from manifest step `ext.multiplierBank100`; restored from `resumePointer` on recovery |
| Spins-left counter | all three | `SPINS LEFT: n` (+`+5` toast on retrigger) | from manifest feature steps; retrigger caps 3/4/5 per tier |
| Pressure dial | super, ultimate | P growth-rate needle | decorative-informative; numeric ×P always adjacent |
| Prism rail | ultimate only | one lit prism per Prisming event | each gem tagged "×2" in text; count announced via aria-live |

### 4.3 Z-order (top → bottom)

reality-check / error modals → reconnecting overlay → REG strip → toasts → overlays
(paytable/rules/settings/history/buy) → HUD controls → win plates/celebrations → foreground
occluder art → cabinet/symbols → environment layers. Celebrations can never cover the REG
strip, the meters, or an open modal. Focus ring renders above everything except modals (§13).

---

## 5. Controls — complete state matrices

Every control below specifies **all 10 component states** —
`default / hover / focused / pressed / disabled / active / loading / error / hidden /
jurisdiction-disabled` — with visual delta (numbers), input handling, and screen-reader
announcement (via each control's hidden focusable sub-DOM twin, §13.4). Global rules:

- `hidden` ≠ `jurisdiction-disabled`: `hidden` is a transient presentation condition (e.g.
  control absent in this game state); `jurisdiction-disabled` means the policy flag is off —
  the control is **not instantiated at all**, the layout reflows, and its sub-DOM twin is
  removed from the tab order. Gated controls: autoplay, quick, turbo, slam-stop behaviour of
  the spin button, feature-buy, Patron's Ante, animation skip.
- States that cannot occur are still specified and marked `unreachable — <reason>`.
- Hover exists only for `pointer:fine`; on touch, hover = default.
- Every activation plays `ui.click` (except where a more specific event is named).
- Primary action debounce 150 ms; **release-and-re-press required** — held input never starts
  a cycle; spin disabled until `nextSpinEnabledAt` (jurisdiction `minimumRoundDurationMs`).

Colour tokens (from the step-9 style bible; contrast pre-checked): `--btn` #232a3d,
`--btn-active` #3a86ff, `--btn-disabled` #1a1e2a, `--spin` #2ec27e, `--stop` #e0644f,
`--text` #ffffff, `--text-dim` #aab2c5, `--focus` #ffd166 (≥3:1 on all placements).

### C1 — Spin button (primary action)

Ø 88 px (L1) / 96 px (L2, L4, L5) / 110 px (L3). Emits `onPrimaryAction` → InputGuard.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | `--spin` fill, seal glyph, idle pulse ±3% scale @ 0.8 Hz (off under reduced motion) | tap/Space/Enter on **release** starts round; held input ignored | "Spin button" |
| hover | +8% brightness, pulse pauses | as default | — (hover not announced) |
| focused | `--focus` ring 3 px offset 2 px | Enter/Space activate on keyup | "Spin button, press Enter to spin" |
| pressed | scale 0.94, −10% brightness, `haptic.light` | intent captured; fires on release; 150 ms debounce | — |
| disabled | `--btn-disabled` fill, label dimmed `--text-dim` | all input swallowed, not queued | "Spin unavailable" + reason ("insufficient balance" / "round in progress") |
| active | = spinning phase → becomes C2 (STOP/SKIP face) | see C2 | see C2 |
| loading | during `round_requested`: "…" glyph, slow rotate 1 Hz | input swallowed (single-flight) | "Spin in progress" |
| error | brief 200 ms shake ≤4 px + returns to disabled while error modal owns focus | input swallowed | error announced by C24, not the button |
| hidden | unreachable — spin is never hidden in any layout/state | — | — |
| jurisdiction-disabled | unreachable — spin itself is not policy-gated (only its stop/skip face is, C2) | — | — |

Autoplay-active face: remaining-count ring (e.g. "37") + stop glyph; one tap = stop autoplay
(C3). Announced "Autoplay, 37 rounds remaining, press to stop".

### C2 — Stop / Skip (spinning-phase face of C1)

Same physical control; appears only while presentation is running. Two faces: **STOP**
(slam stop — reels still travelling; gated by `slamStopEnabled`, OFF in every shipped policy —
design stance) and **SKIP** (collapse committed presentation to step-terminal state; gated by
`animationSkipEnabled`). Values never change (CONVENTIONS §9.2).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | `--stop` fill, "SKIP" label (skip face) | tap collapses current timeline to its skipTo seam; repeated presses idempotent | "Skip presentation" |
| hover | +8% brightness | as default | — |
| focused | `--focus` ring 3 px | Space/Enter = skip | "Skip presentation button" |
| pressed | scale 0.94 | skip executes once; further presses ignored until next seam | — |
| disabled | "…" face, `--btn-disabled` (before `outcome_committed` — nothing to skip yet) | input swallowed | "Please wait" |
| active | during multi-step cascades: stays SKIP through each seam | each press advances one seam (`next_step` → `summary`) | "Skipping" |
| loading | unreachable — loading is C1's state; C2 exists only mid-presentation | — | — |
| error | reverts to C1 error handling | — | — |
| hidden | when `animationSkipEnabled=false` ∧ `slamStopEnabled=false`: button shows non-interactive "…" face during presentation | input swallowed | "Round in progress" |
| jurisdiction-disabled | STOP face never instantiated when `slamStopEnabled=false`; SKIP face never instantiated when `animationSkipEnabled=false` (gb/de/se/restricted-default) | — | twin removed from tab order |

Non-skippable regardless of flags: reality checks, error states, max-win termination notice,
feature-summary totals (research/13 D3.13).

### C3 — Autoplay button + panel

Gated by `autoplayEnabled` (mt-generic, se-spel only). Presets **10 / 25 / 50 / 100**
(`config/autoplay.json`); mandatory loss limit; full stop-condition set (§7).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 76×44 "AUTO" button beside/above spin | tap opens panel (overlay, never a machine state) | "Autoplay options" |
| hover | +8% brightness | as default | — |
| focused | `--focus` ring | Enter opens panel; panel is a focus trap until closed | "Autoplay options button" |
| pressed | scale 0.96 | — | — |
| disabled | dimmed while round in flight or feature active | input swallowed | "Autoplay unavailable during round" |
| active | autoplay running: button = "STOP", `--stop` fill; remaining count on spin ring | one tap stops before next round request | "Autoplay active, n remaining, press to stop" |
| loading | unreachable — arming is instant/local | — | — |
| error | if start rejected (e.g. rounds > policy cap): panel row shakes ≤4 px, inline message | panel stays open for correction | "Autoplay could not start: <reason>" |
| hidden | during features (autoplay auto-stopped on trigger anyway) | — | — |
| jurisdiction-disabled | `autoplayEnabled=false` (gb/de/restricted-default): button AND panel not instantiated; layout reflows (bet stepper takes its slot) | — | twin removed |

### C4 — Quick-spin toggle

Gated by `quickSpinEnabled`. Persistent badge under/beside spin + settings entry; state
persists in localStorage keyed `belladonna-parlour`.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 76×44 "QUICK" outline chip | tap toggles quick mode (mutually exclusive with turbo) | "Quick spin off" |
| hover | +8% brightness | — | — |
| focused | `--focus` ring | Space toggles | "Quick spin toggle, off" |
| pressed | scale 0.96 | — | — |
| disabled | unreachable — toggling mid-round is allowed (applies from next round) | — | — |
| active | `--btn-active` fill + "QUICK" badge visible near spin | tap returns to normal | "Quick spin on" |
| loading | unreachable — local toggle | — | — |
| error | unreachable — no failure path | — | — |
| hidden | never hidden while flag on | — | — |
| jurisdiction-disabled | `quickSpinEnabled=false` (gb/de/se/restricted-default): not instantiated (also removed from settings list) | — | twin removed |

### C5 — Turbo-spin toggle

Gated by `turboSpinEnabled`. Mutually exclusive with quick (C4); persisted per slug. Requested
turbo silently degrades to quick→normal per `resolveSpinMode` if policy changes mid-session.
Active badge is a spinning-vial glyph — deliberately lightning-free, no strobe.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 76×44 "TURBO" outline chip | tap toggles turbo (turns quick off if on) | "Turbo spin off" |
| hover | +8% brightness | as default | — |
| focused | `--focus` ring | Space toggles | "Turbo spin toggle, off" |
| pressed | scale 0.96 | — | — |
| disabled | unreachable — toggling mid-round allowed (applies next round) | — | — |
| active | `--btn-active` fill + "TURBO" badge (spinning-vial glyph) near spin | tap returns to normal | "Turbo spin on" |
| loading | unreachable — local toggle | — | — |
| error | unreachable — no failure path | — | — |
| hidden | never hidden while flag on | — | — |
| jurisdiction-disabled | `turboSpinEnabled=false` (gb/de/se/restricted-default): not instantiated (also removed from settings list) | — | twin removed |

### C6 — Bet stepper (− / +)

Two 44×44 buttons flanking the total-bet readout. Ladder = `game-config.json betLevelsMinor`
(10 … 10000 minor). Long-press acceleration **OFF**. `maxStakeMinor` (policy) truncates the
ladder at runtime.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | − / + glyphs on `--btn` | single step per press; bet change stops autoplay (`bet_changed`) | "Decrease bet" / "Increase bet" |
| hover | +8% brightness | — | — |
| focused | `--focus` ring | +/− keyboard keys mirror (§13.3) | "Increase bet button, current bet €1.00" |
| pressed | scale 0.94 | one step only — hold does NOT repeat | announces new value: "Total bet €2.00" |
| disabled | dimmed at ladder end (− at min, + at max) and **always mid-round** | input swallowed | "Minimum bet reached" / "Bet locked during round" |
| active | unreachable — stateless momentary control | — | — |
| loading | unreachable — local | — | — |
| error | unreachable | — | — |
| hidden | never | — | — |
| jurisdiction-disabled | unreachable as removal — not gated; but `maxStakeMinor` (de €1, gb £5) silently truncates the ladder; + becomes disabled at the cap | — | "Maximum bet for your region reached" |

Never visually privilege Max Bet; no raise-stake prompts anywhere (RTS 14A / AGCO 11.1.7).

### C7 — Bet sheet (tap total-bet to open)

Modal sheet: preset chips (every `betLevelsMinor` value), Min / Max buttons (equal visual
weight), current-bet highlight.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | sheet hidden; total-bet readout shows affordance underline | tap readout opens sheet | "Total bet €1.00, activate to change" |
| hover | readout underline brightens | — | — |
| focused | ring on readout; inside sheet: chip-by-chip focus order min→max | Esc closes; Enter selects | "Bet €2.00, 4 of 10" |
| pressed | chip scale 0.96 | select = set bet + close + `ui.bet.change` | "Total bet set to €2.00" |
| disabled | readout not activatable mid-round | swallowed | "Bet locked during round" |
| active | current-bet chip `--btn-active` + check glyph | — | "Selected" |
| loading | unreachable — local | — | — |
| error | unreachable | — | — |
| hidden | sheet hidden whenever another overlay is open (one overlay at a time) | — | — |
| jurisdiction-disabled | not gated as a control; chips above `maxStakeMinor` are **not rendered** (removed, not greyed) | — | — |

### C8 — Total-bet display

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | label "TOTAL BET" 12 px `--text-dim` + value 20 px `--text` | tap opens bet sheet (C7) | live region: "Total bet €1.00" on change |
| hover | underline affordance | — | — |
| focused | ring (it is C7's opener) | Enter opens sheet | "Total bet €1.00, button" |
| pressed | scale 0.98 | — | — |
| disabled | mid-round: affordance underline removed | tap swallowed | — |
| active | ante ON: value shows "€1.20 (×1.20 Ante)" text tag | — | "Total bet €1.20, Patron's Ante active" |
| loading | unreachable — value is local config | — | — |
| error | unreachable — display only | — | — |
| hidden | unreachable — always-visible HUD element (hard rule) | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C9 — Balance display

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | "BALANCE" label + currency value 20 px | non-interactive | aria-live announces at settlement: "Balance €98.20" |
| hover | none (non-interactive) | — | — |
| focused | in reading order of the sub-DOM (not tab-focusable) | — | readable by AT cursor |
| pressed | unreachable — non-interactive | — | — |
| disabled | unreachable | — | — |
| active | brief 300 ms brightness pulse on settlement update (no colour-only cue; value text changes) | — | announced with new value |
| loading | while `round_requested`: value unchanged (balance only moves at settlement); subtle "…" suffix if RGS confirm is pending >2 s | — | "Balance updating" |
| error | on reconcile failure the error modal owns messaging; display keeps last confirmed value | — | — |
| hidden | unreachable — always-visible (hard rule) | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C10 — Current-win display

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | "WIN" label + `—` idle | non-interactive | — |
| hover | none | — | — |
| focused | in AT reading order | — | — |
| pressed | unreachable | — | — |
| disabled | unreachable | — | — |
| active | count-up per `spin-presentation.json winPresentation`; tier styling from `small`…`max`; **LDW/return ≤ stake: plain value, no win styling, no `sfx.win.*`** | tap during count-up = skip to final (where skip allowed) | aria-live "Win €4.50" at final value only (not per tick) |
| loading | unreachable — value from committed manifest | — | — |
| error | unreachable — display only | — | — |
| hidden | unreachable — always-visible (hard rule; shows `—` when no win) | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C11 — Feature-buy entry ("The Ledger")

Gated by `bonusBuyEnabled` (mt-generic only among shipped policies). Portrait: chip above
meter strip with themed ledger art + **cheapest** price; landscape/desktop: panel left of
cabinet listing all three buys. Prices always x-bet AND currency at current bet, computed
`priceXBet100 / 100 × betMinor` from `config/bonus-buys.json` — never hand-typed.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | leather ledger chip, "BUY FROM <cheapest>×" + currency | tap opens buy modal (C12) | "Bonus buy menu, from 42.10 times bet" (value from config) |
| hover | +8% brightness, ledger ribbon lifts 2 px | — | — |
| focused | `--focus` ring | Enter opens modal | "Bonus buy menu button" |
| pressed | scale 0.96 | — | — |
| disabled | dimmed when: balance < cheapest price · round in flight · autoplay active · **Patron's Ante ON (mutually exclusive)** | swallowed; tooltip/inline reason | "Bonus buy unavailable: Patron's Ante is active" (or reason) |
| active | modal open: chip stays highlighted `--btn-active` | — | — |
| loading | unreachable — opening is local; purchase loading lives in C12 | — | — |
| error | unreachable at entry level (C12 handles purchase errors) | — | — |
| hidden | during features | — | — |
| jurisdiction-disabled | `bonusBuyEnabled=false` (gb/de/se/restricted-default): chip/panel not instantiated; portrait row collapses; paytable buy page also removed | — | twin removed |

### C12 — Buy modal (3 tiers + two-step confirm)

Lists each mode from `config/bonus-buys.json`: themed art, price in x-bet AND currency,
one-line description, **per-mode RTP disclosure** (`uiDisclosure.disclosureText` — includes
buy RTP %, rounds, starting ×P, max win). Two-step commit; **Cancel is the focused default**.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | modal 3 rows: Buy: The Tasting / The Distillery / The Night Garden; prices + RTP % rendered from config | tap row → confirm step | reads row: name, price ×bet, price currency, buy RTP |
| hover | row +6% brightness | — | — |
| focused | ring row-by-row; focus order: rows → Cancel → (Confirm appears in step 2 focused LAST, Cancel first) | Esc = cancel anywhere | "Buy The Tasting, 42.10 times bet, €42.10, purchase RTP 96.01%" (from config) |
| pressed | row scale 0.98 | — | — |
| disabled | rows with price > balance dimmed with "insufficient balance" text; whole modal unopenable mid-round/autoplay/ante (C11) | swallowed | "Unavailable, insufficient balance" |
| active | confirm step: chosen tier art enlarges, **price restated** + "This purchase deducts €X and starts <tier> immediately." Cancel (focused) / Confirm | Confirm = wager request; post-buy the triggering seals land visibly | "Confirm purchase of The Night Garden for €167.70? Cancel or Confirm" |
| loading | Confirm pressed: buttons lock, spinner ≤ 1 Hz, "placing purchase…" | all input swallowed (single-flight) | "Purchasing, please wait" |
| error | RGS reject: inline plain-language message + error code + roundId; modal returns to step 1 | retry allowed | "Purchase failed: <message>" (assertive) |
| hidden | closed; also auto-closes if a reality check fires (RG interrupts own the screen) | — | — |
| jurisdiction-disabled | with `bonusBuyEnabled=false` the modal never exists (C11 removed) | — | — |

### C13 — Patron's Ante toggle (enhanced chance)

Gated by `enhancedChanceEnabled` (mt-generic only). Stake ×1.20; seal frequency ≈×1.55; ante
reel set. **Mutually exclusive with buys** — turning Ante ON disables C11/C12 (and vice-versa:
Ante is disabled while the buy modal is open).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 100×44 chip "PATRON'S ANTE ×1.20" with wax-seal art, OFF state outline | tap toggles; total bet updates immediately with text tag | "Patron's Ante off. Increases stake 1.20 times for more Parlour Seals" |
| hover | +8% brightness | — | — |
| focused | `--focus` ring | Space toggles | "Patron's Ante toggle, off" |
| pressed | scale 0.96, `haptic.light` | — | — |
| disabled | dimmed mid-round, during autoplay, during features, while buy modal open | swallowed + reason | "Ante locked during round" |
| active | ON: wax seal fills red-amber + literal "ON ×1.20" text (not colour-only); total-bet display shows ante tag; buy chip (C11) becomes disabled with reason | tap turns off | "Patron's Ante on, total bet €1.20" |
| loading | unreachable — local toggle affecting next round request | — | — |
| error | unreachable | — | — |
| hidden | during features | — | — |
| jurisdiction-disabled | `enhancedChanceEnabled=false` (gb/de/se/restricted-default): not instantiated; rules page omits ante section | — | twin removed |

### C14 — Settings (burger menu)

Contents (§9.1): Sound FX · Music · Quick/Turbo (gated) · Battery-saver/low-perf · Reduced
motion · Screen shake off/low/full · Haptics (hidden where unsupported) · Data-saver · Intro
screen on/off · Game history · Rules · Paytable · Feature guide · version + RTP footer.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 44×44 ⚙ glyph | tap opens panel (overlay) | "Settings" |
| hover | rotate 15°, +8% brightness | — | — |
| focused | `--focus` ring | Enter opens; panel = focus trap; Esc closes | "Settings button" |
| pressed | scale 0.94 | — | — |
| disabled | unreachable — settings always available (overlays never block settlement) | — | — |
| active | panel open: glyph `--btn-active` | tap closes | "Settings open" |
| loading | unreachable — local | — | — |
| error | unreachable | — | — |
| hidden | unreachable — always present | — | — |
| jurisdiction-disabled | panel itself never gated; gated rows (quick/turbo) are **removed** from the list per flags | — | — |

### C15 — Sound FX toggle · C16 — Music toggle

Two independent rows in settings + a sound shortcut glyph next to ⚙ (master mute). Persisted
per slug. Same matrix for both; differences noted.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | row "SOUND FX — ON" / "MUSIC — ON" with slider glyph | tap toggles instantly | "Sound effects on" / "Music on" |
| hover | +8% brightness | — | — |
| focused | ring | Space toggles; M key = master mute (§13.3) | "Sound effects toggle, on" |
| pressed | slider knob slides 150 ms | — | — |
| disabled | before audio unlock (C22): rows visible but inert with "tap Continue to enable audio" note | swallowed | "Audio not yet enabled" |
| active | ON state: knob right + literal "ON" text | — | — |
| loading | unreachable — local | — | — |
| error | if `AudioContext` failed: row shows "audio unavailable on this device"; game continues silent-safe | — | "Audio unavailable" |
| hidden | unreachable — always in menu | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C17 — Fullscreen toggle (desktop only)

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | settings row "FULLSCREEN — OFF" (L4/L5 only) | tap calls `requestFullscreen()` | "Fullscreen off" |
| hover | +8% brightness | — | — |
| focused | ring | Enter toggles | "Fullscreen toggle" |
| pressed | knob slides | — | — |
| disabled | unreachable on L4/L5 (API present); control absent elsewhere | — | — |
| active | ON: knob right; browser chrome gone; RTS 13A note: session clock in REG strip satisfies the hidden-device-clock rule | Esc (browser) exits; state re-syncs on `fullscreenchange` | "Fullscreen on" |
| loading | unreachable — synchronous API | — | — |
| error | promise rejection (permission): row flashes "not permitted", stays OFF | — | "Fullscreen not permitted" |
| hidden | L1/L2/L3 and iOS: row **not rendered** (no iPhone element-fullscreen API) | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C18 — Paytable button + overlay

ⓘ button, ≤ 1 tap from base HUD. Paged overlay order: (1) features & scatter tiers with 3/4/5+
trigger counts, (2) buy prices (only where `bonusBuyEnabled`), (3) symbol pays, (4)
scatter-pays band diagram (8–9 / 10–11 / 12+ anywhere — no lines), (5) general rules +
malfunction clause + max-win + RTP % per active profile, version footer.
**Single source of truth: every pay value is computed at render time as
`payX100 / 100 × current betMinor` from `config/paytable.json` — hand-typed pay values are a
G7 FAIL and none appear in this spec.** Values re-render live when bet changes.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | 44×44 ⓘ glyph | tap opens overlay; P key opens (§13.3) | "Paytable and rules" |
| hover | +8% brightness | — | — |
| focused | ring; inside overlay: page-by-page focus, swipe/arrow paging | Esc closes | "Paytable, page 1 of 5: features" |
| pressed | scale 0.94 | — | — |
| disabled | unreachable — paytable never blocks and is never blocked (overlay may open mid-presentation; settlement continues beneath) | — | — |
| active | overlay open: glyph `--btn-active`; pages announce on change | — | "Page 3: symbol pays at current bet" |
| loading | first open may lazy-load hi-res art: skeleton rows ≤ 500 ms, values (text) render immediately from config | readable immediately | — |
| error | art bundle failure: text values still render (config is local); missing images show symbol name text | — | — |
| hidden | closed | — | — |
| jurisdiction-disabled | overlay itself never gated; **buy-price page removed** when `bonusBuyEnabled=false`; ante paragraph removed when `enhancedChanceEnabled=false`; RTP line always present when `showRtp` | — | — |

### C19 — Game rules · C20 — Feature guide

Entries in settings + last paytable pages. Rules text is generated from configs (trigger
counts from `scatter-tiers.json`, caps from `features.json`, buy/ante text from their configs +
measured RTP disclosures); includes malfunction-voids clause and max-win statement.
Feature guide = 4 illustrated panels (base cascade loop, Tasting, Distillery, Night Garden).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | menu rows "GAME RULES" / "FEATURE GUIDE" | tap opens scroll overlay | "Game rules" / "Feature guide" |
| hover | +8% brightness | — | — |
| focused | ring; overlay content in reading order | Esc closes | reads sections |
| pressed | scale 0.98 | — | — |
| disabled | unreachable — always available pre-bet (MGA one-click, AGCO pre-bet availability) | — | — |
| active | overlay open | scroll/swipe; no timeout | — |
| loading | as C18 loading (text-first render) | — | — |
| error | as C18 error | — | — |
| hidden | closed | — | — |
| jurisdiction-disabled | overlay never gated; gated sections (buy/ante/autoplay/quick/turbo paragraphs) removed per flags so rules never describe absent controls | — | — |

### C21 — Network status indicator

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | hidden while healthy (glyph absent — status by exception) | non-interactive | — |
| hover | tooltip "connection OK" when visible (desktop) | — | — |
| focused | not focusable; state mirrored in aria-live | — | — |
| pressed | unreachable — non-interactive | — | — |
| disabled | unreachable | — | — |
| active | degradation: amber wifi-off glyph 24 px TR + non-blocking toast "connection unstable" (auto-dismiss 4 s) | — | polite: "Connection unstable" |
| loading | reconnect attempt: glyph pulses 1 Hz (≤3 flashes/s budget respected) | — | — |
| error | connection lost mid-round: escalates to C23 blocking overlay | — | assertive via C23 |
| hidden | healthy (default) | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C22 — Loading screen & Continue button (audio unlock)

Sequence in §10. The Continue button is the **audio-unlock gesture**.

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | after progress completes, bar morphs into bottom-centre "ENTER THE PARLOUR" button ≥ 64 px tall | tap = `AudioContext.resume()` inside handler; verify `state === 'running'`; then intro screen or game | "Enter the parlour. Activating enables sound." |
| hover | +8% brightness, candle flicker on frame (≤3/s) | — | — |
| focused | ring; it is the ONLY focusable element at this stage | Enter activates | as default |
| pressed | scale 0.96 | — | — |
| disabled | while progress < 100%: button not yet present (bar in its place) | — | progress announced every 25%: "Loading, 75%" |
| active | unreachable — one-shot control | — | — |
| loading | the state before default: determinate bar + % + one rotating feature hint | — | "Loading" |
| error | asset bundle retry exhausted: bar → "retry" button + error code | tap retries bundle | "Loading failed, retry" |
| hidden | after activation, never returns | — | — |
| jurisdiction-disabled | unreachable — not gated (jurisdiction acknowledgements may append to this gate as operator pages) | — | — |

### C23 — Reconnecting overlay

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | blocking dim 70% + spinner + elapsed timer + copy: "Reconnecting… your result is safe." | ALL game input blocked; settings/sound still reachable | assertive: "Connection lost, reconnecting. Your result is safe." |
| hover | none | — | — |
| focused | focus trapped on overlay (single "keep waiting" live region + lobby link after 30 s) | — | elapsed announced each 15 s |
| pressed | unreachable — no buttons in first 30 s | — | — |
| disabled | unreachable | — | — |
| active | = visible state (default); on recovery: overlay drops, presentation **seeks to committed `resumePointer`** — no re-spin theatre; vial ×P and spins-left restored from step ext fields | input re-enabled after seek completes | "Connection restored" |
| loading | = spinner (inherent) | — | — |
| error | recovery failed: escalates to C24 with code + lobby-return | — | — |
| hidden | healthy connection | — | — |
| jurisdiction-disabled | unreachable — recovery behaviour is mandatory everywhere | — | — |

### C24 — Error modal

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | modal: plain-language message, error code, `roundId`, malfunction-voids clause, buttons per severity | focus trapped | assertive: full message + code |
| hover | button hover +8% | — | — |
| focused | Cancel/Retry focus order; RETURN TO LOBBY last | Enter activates | — |
| pressed | scale 0.96 | — | — |
| disabled | unreachable — modal buttons always live | — | — |
| active | recoverable: "TRY AGAIN" re-requests state; unrecoverable: only "RETURN TO LOBBY" (operator wrapper callback) | single-flight retry | — |
| loading | retry in flight: buttons lock + spinner | swallowed | "Retrying" |
| error | = itself (terminal display) | — | — |
| hidden | no error | — | — |
| jurisdiction-disabled | unreachable — error handling mandatory | — | — |

### C25 — Insufficient-balance state

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | spin → disabled face; inline message under meter strip: "Balance too low for this bet." **No deposit upsell in-game** (operator wrapper owns cashier) | spin swallowed; bet-down remains enabled | "Insufficient balance for current bet. Lower the bet or add funds via the casino menu." |
| hover | none | — | — |
| focused | message in reading order | — | — |
| pressed | unreachable — message is not a control | — | — |
| disabled | = the spin button's condition (C1 disabled) | — | — |
| active | while condition holds; clears automatically when balance ≥ bet or bet lowered | — | "Spin available" on clear |
| loading | unreachable — local comparison | — | — |
| error | unreachable | — | — |
| hidden | balance sufficient | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C26 — Orientation change / unsupported viewport

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | invisible; relayout happens live ≤ 300 ms (§1.3) | input continuous | — |
| hover | unreachable | — | — |
| focused | unreachable — not a control | — | — |
| pressed | unreachable | — | — |
| disabled | unreachable | — | — |
| active | during relayout: 150 ms cross-fade veil; count-up values persist | input deferred ≤ 300 ms | — |
| loading | unreachable | — | — |
| error | unreachable | — | — |
| hidden | = default | — | — |
| jurisdiction-disabled | unreachable | — | — |

Sub-375 px viewports (assumption UI-A1): full-screen message "This game needs a larger screen
(375 px minimum). Please rotate or use another device." with lobby-return link — shown instead
of the game; no wagers possible.

### C27 — Reduced-motion toggle · C28 — Low-performance toggle · C29 — Data-saver toggle

Three settings rows; same matrix, differences noted. Reduced motion additionally auto-follows
OS `prefers-reduced-motion` (row shows "ON (system)" when OS-driven). Low-perf is
auto-suggested via toast when FPS < 30 for 5 s (`device-profiles.json`).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | row "REDUCED MOTION — OFF" / "BATTERY SAVER — OFF" / "DATA SAVER — OFF" | tap toggles; applies immediately | "<name> off" |
| hover | +8% brightness | — | — |
| focused | ring | Space toggles | "<name> toggle, off" |
| pressed | knob slides 150 ms | — | — |
| disabled | data-saver: dimmed after all bundles already downloaded ("everything already loaded") | swallowed | "Data saver has no effect: assets loaded" |
| active | ON + literal text; reduced-motion ON switches every anim to its reducedMotion variant (§12) | — | "<name> on" |
| loading | low-perf/data-saver may swap atlases: ≤ 1 s veil "adjusting quality" | input deferred | "Adjusting quality" |
| error | unreachable — local | — | — |
| hidden | haptics row (adjacent) hidden where `navigator.vibrate` unsupported (iOS); these three never hidden | — | — |
| jurisdiction-disabled | unreachable — not gated | — | — |

### C30 — Game history / replay

Gated ON by `showGameHistory` (true in all shipped policies).

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | settings row "GAME HISTORY" | tap opens committed-round list (newest first): bet, win, timestamps, tier badge | "Game history" |
| hover | +8% brightness | — | — |
| focused | ring; list rows focusable | Enter opens round detail | "Round <time>, bet €1.00, win €4.50" |
| pressed | row scale 0.98 | — | — |
| disabled | unreachable — read-only screen always available | — | — |
| active | round detail: per-step list (grids, wins, ×P per step) + REPLAY button — replay renders the stored committed manifest through the normal presenter (marked "REPLAY", no wager) | replay skippable | "Replaying round, no wager" |
| loading | fetching history page: skeleton rows + spinner | — | "Loading history" |
| error | fetch failure: inline retry | — | "History unavailable, retry" |
| hidden | closed | — | — |
| jurisdiction-disabled | if a policy ever sets `showGameHistory=false` the row is removed (none shipped do) | — | — |

### C31 — Master vial (P bank display; game-specific HUD element)

| State | Visual delta | Input handling | Screen-reader |
|---|---|---|---|
| default | base game: brass stand only (desktop dock) / element absent (portrait) — P exists only in features | non-interactive | — |
| hover | tooltip "Master vial: banked multiplier" (desktop) | — | — |
| focused | in AT reading order during features | — | "Master vial multiplier 8×" |
| pressed | unreachable — non-interactive | — | — |
| disabled | unreachable | — | — |
| active | features: fill level ∝ log(P)/log(512), numeric "×P" ≥ 24 px beside it; on `sfx.orb.collect` essence streams in; on apply, vial pours (`anim` orb.apply); on Prisming, refraction flash ≤ 3/s + "×2" tag; at P=512 cap: vial brim + "MAX ×512" text | — | aria-live on change: "Vial now 8 times" |
| loading | unreachable — value from manifest steps | — | — |
| error | unreachable — display only; recovery restores from `resumePointer` step ext | — | — |
| hidden | base game portrait (no dock) and between features | — | — |
| jurisdiction-disabled | unreachable — core mechanic display, not gated | — | — |

### Coin-value selector — intentionally absent

The math model uses a single total-bet ladder (`betLevelsMinor`); no coin-value dimension
exists, so no coin-value selector is rendered (research/08 D3: coin UI only when the math
model needs it). Recorded here so the control list is complete.

---

## 6. Bet selector — behaviour contract

- Single total-bet model: stepper (C6) + bet sheet (C7); ladder from
  `game-config.json betLevelsMinor` (10 → 10000 minor, default 100), truncated at runtime by
  policy `maxStakeMinor` (chips above the cap are removed, not greyed).
- Long-press acceleration OFF; one step per press; 44 px targets with ≥ 8 px spacing (stepper
  never flush against spin — 60 px gap in every layout).
- Bet changes disabled mid-round (`setControlsLocked`); a bet change stops autoplay
  (`bet_changed` stop reason).
- Min/Max buttons carry equal visual weight; Max is never highlighted, pulsed, or defaulted;
  zero raise-stake prompts anywhere in the product (RTS 14A / AGCO 11.1.7).
- Ante interaction: with Patron's Ante ON the wager sent is `betMinor × 1.20` (from
  `features.json` ante definition); the total-bet display always shows the true deducted
  amount with the "×1.20 Ante" text tag.

## 7. Autoplay panel — full specification

Rendered only where `autoplayEnabled=true` (mt-generic, se-spel). Config: `config/autoplay.json`.

- **Round counts: {10, 25, 50, 100}** — finite only; no infinite option exists in config, UI,
  or code (`AutoplayController` rejects non-finite).
- **Mandatory before start:** round count AND loss limit (`mandatoryBeforeStart`). START stays
  disabled until both are set; the panel explains why.
- **Optional stops (player-configurable, default OFF):** single win ≥ {10,25,50,100}×bet ·
  profit ≥ {10,25,50,100}×bet · balance < {10,20,50}×bet.
- **Always-on stops (verbatim list, not configurable):** rounds exhausted (`completed`) ·
  user stop (`user_stop`) · `feature` trigger (`feature_triggered`) · `super_feature` trigger
  (`super_feature_triggered`) · `ultimate_feature` trigger (`ultimate_feature_triggered`) ·
  single win ≥ configured threshold (`win_threshold`) · cumulative loss limit reached
  (`loss_threshold`) · cumulative profit limit reached (`profit_threshold`) · balance below
  threshold (`balance_floor`) · insufficient balance (`insufficient_balance`) · bet changed
  (`bet_changed`) · network error (`network_error`) · game error (`game_error`) · RG /
  reality-check interruption (`rg_interruption`, `reality_check` — blocks the next
  `round_requested` until acknowledged) · max win reached (`max_win`).
- Remaining count on the spin button ring; one-tap STOP always visible (spin button itself +
  AUTO button both stop); stop takes effect **before the next round request** — the in-flight
  round always settles.
- No wager queue; no overlapping rounds (`beginRound` throws on overlap); each autoplay round
  honours `minimumRoundDurationMs` (SE: 3000 ms applies to autoplay rounds).

## 8. Feature-buy & Patron's Ante interfaces

Covered as C11/C12/C13; binding extras:

- Buy prices and RTP disclosures are **rendered from `config/bonus-buys.json`**
  (`priceXBet100`, `rtp`, `uiDisclosure.disclosureText`) — currency price recomputed at the
  current bet on every open. Current config values (informative, source = config):
  buy-feature 42.10×, buy-super 91.70×, buy-ultimate 167.70×, buy RTPs 96.01% / 95.98% /
  96.01%.
- Two-step commit with price restated; Cancel focused by default; balance check before
  enabling; disabled during rounds, autoplay, and while Ante is ON.
- Post-buy the triggering spin plays out visibly: seals land with full
  `sfx.scatter.land` / `sfx.scatter.anticipation` treatment before the tier entry.
- Ultimate buy note (from config `forcedEntryDistribution`): entry lands 5 or 6 seals at
  natural conditional odds; a 6-seal entry also awards the independent 6-seal pay — the modal
  discloses this line verbatim from config.
- Mutual exclusion (GDD §13): Ante ON ⇒ buys disabled with visible reason; buy modal open ⇒
  Ante toggle disabled. Both gated independently (`bonusBuyEnabled`, `enhancedChanceEnabled`);
  when off, removed entirely (control, paytable page, rules paragraphs).

## 9. Settings, paytable, rules, history

### 9.1 Burger menu (final content order)

1. Sound FX (C15) · 2. Music (C16) · 3. Quick spin (C4, gated) · 4. Turbo (C5, gated) ·
5. Battery saver / low-performance (C28) · 6. Reduced motion (C27) · 7. Screen shake
off/low/full · 8. Haptics (hidden where unsupported — iOS/Firefox) · 9. Data saver (C29) ·
10. Intro screen on/off · 11. Fullscreen (C17, desktop only) · 12. Game history (C30) ·
13. Game rules (C19) · 14. Paytable (C18) · 15. Feature guide (C20) ·
16. Footer: "Belladonna's Parlour v0.1.0 · math v0.1.0 · RTP 96.00%" (RTP per active profile).
All toggles persist in `localStorage` keyed by `belladonna-parlour`.

### 9.2 Paytable recompute rule (single source of truth)

Every pay figure shown anywhere (paytable overlay, feature guide, win-tier examples) is
computed at render time: `displayPay = payX100 / 100 × currentBetMinor`, formatted via
`formatMinor`. Band structure (8–9 / 10–11 / 12+ anywhere) and the seal pays (3/4/5/6 counts)
come from `config/paytable.json`; tier trigger counts (3/4/5+) from
`config/scatter-tiers.json`; caps (cascade 20, retrigger 3/4/5, P ≤ 512, max win 10,000×) from
`config/game-config.json` / `config/features.json`. **No pay value is hand-typed in any UI
surface or in this spec.** Values re-render on bet change while the overlay is open.

### 9.3 Rules content skeleton (generated)

How to play (scatter-pays: 8+ anywhere) → The Shattering (cascades, cap 20) → Distilled
Essence (orbs; orbs on losing spins pay nothing) → the three chambers (rounds 10/12/12, vial
starts ×1/×3/×5, retrigger +5 caps 3/4/5, Prisming in Night Garden only, one doubling per
spin) → Patron's Ante (gated) → Buys (gated, per-mode RTP) → autoplay (gated) → max win
10,000× & termination → malfunction clause → RTP statement → version footer.

## 10. Loading UX

1. **Inline splash** < 300 KB (game crest on black, pure HTML/CSS) — instant.
2. **Determinate progress bar** with % + one rotating hint ("3 Parlour Seals open The
   Tasting…"), animated shimmer ≤ 3/s. Core bundle target: **interactive ≤ 8 MB / ≤ 5 s on
   4G** (`device-profiles.json transferBudgets`).
3. Bar **morphs into the Continue button** "ENTER THE PARLOUR" (≥ 64 px tall, bottom-centre)
   — the tap is the audio-unlock gesture: `AudioContext.resume()` inside the handler, verify
   `state === 'running'`, silent-safe fallback if not (audio manager runs muted; C15 row shows
   the condition). Cross-origin iframe embeds need delegated autoplay permission — documented
   for the operator wrapper.
4. **Optional intro screen** (skippable, "don't show again" persisted): three feature panels
   (the three chambers), max-win statement, volatility meter (medium-high), RTP line.
5. **Ready.** Feature/big-win/audio bundles stream in background with per-bundle retry
   (`Assets.backgroundLoadBundle(['feature','bigwin'])` after first spin available); feature
   entry awaits its bundle behind the tier-entry transition.

## 11. Edge & failure states (summary — full matrices in C21–C26)

| Situation | Treatment |
|---|---|
| Degraded network | amber glyph + non-blocking toast (C21) |
| Lost mid-round | blocking reconnect overlay, elapsed timer, "your result is safe"; on recovery seek to committed `resumePointer` — vial ×P, spins-left, prisming count restored from step ext fields; no re-spin theatre (C23) |
| Recovery fails | error modal: message, code, `roundId`, malfunction clause, lobby-return callback (C24) |
| Insufficient balance | spin disabled + inline message; **no in-game deposit upsell** (C25) |
| Reality check due | blocking dialog between rounds: elapsed time (+net position where policy), Continue (explicit ack) / Exit / history link; blocks next `round_requested`; stops autoplay; DE (`de-ggl`): after ack, 5-min countdown lockout before next spin |
| Max win reached | `maximum_win` state: vial-overflow presentation, **non-skippable summary plate** "Maximum win 10,000× reached — remaining rounds forfeited"; then feature summary |
| Backgrounded tab | ticker paused, audio suspended; on visible: delta reset, fast-forward presentation to current step; settlement server-side, nothing drifts |
| WebGL context loss | "restoring…" veil, GPU resources rebuilt, seek to `resumePointer`; reload offer after 10 s |

## 12. Reduced-motion, low-performance, data-saver — per-screen deltas

"Same as normal" is stated explicitly where true.

| Screen / system | Reduced motion (OS pref OR toggle) | Low performance (tier `low` / toggle) | Data saver |
|---|---|---|---|
| Loading | shimmer removed; bar fills in steps | same as normal | hi-res splash art skipped (crest only) |
| Base spin | reel travel → ≤ 300 ms cross-fade to committed grid; no anticipation travel (text cue "Seal chance!" instead) | full motion, DPR ≤ 1.5, 30 fps | same as low-perf atlas set (0.5×) |
| Cascades | shatter → 200 ms fade-out; survivors reposition by fade, not fall | no glass shards — sprite swap only (GDD §6.1) | same as normal timing |
| Orbs / vial | collect stream → fade + counter tick; vial fill steps without fluid sim | no fluid shader — straight lerp fill | same as normal |
| Prisming | plate flip + "×2" text, no refraction flash | static glow frame (GDD §6.3) | same as normal |
| Tier entries | full-screen transitions → 300 ms cross-fade; music transition unchanged | shader-free entry (pre-baked frames) | entry art at 0.5× atlas |
| Win celebrations | count-up kept (numbers are information); particles/zoom/shake off; plates fade | particle cap 50; no filters; pre-baked glows | same as low-perf |
| Camera & parallax | parallax 0, push-in 0, shake 0 | parallax 1 layer only | parallax layers not downloaded beyond mid |
| Ambient idle | off (static scene) | off | off (bundles deferred) |
| HUD/menus | instant open/close (no slide) | same as normal | same as normal |
| Audio | same as normal (audio is not motion) | same as normal | non-critical audio (ambience, feature music) deferred until feature entry |

Information parity is mandatory: every variant presents identical values, states, and
announcements — enforced by the mode-equivalence test (same manifest ⇒ same final balance and
identical aria-live transcript).

## 13. Accessibility contract (gate numbers)

### 13.1 Hard numbers

- All targets ≥ **44×44 CSS px**, ≥ **8 px** spacing; spin ≥ 72 px mobile / 96 px desktop.
- HUD text ≥ **4.5:1**; controls, focus ring, meter fills ≥ **3:1**; body ≥ 16 px, meter
  labels ≥ 12 px; UI text scaling to **200%** via UI scale factor without loss/overlap.
- Flash ≤ **3/s** everywhere (whole-canvas rule — no area exemption used); zero saturated-red
  flashes; PEAT run over big-win/tier-entry captures logged in the validation report.
- No drag-only inputs; no precision-timing inputs; feature picks (none in this game) would
  wait indefinitely — nothing in this game times out a decision.

### 13.2 Colour independence

Symbol identity by silhouette first (distinct bottle/flora shapes per id — style-bible
enforced); orb values printed as numbers; tier states named in text banners ("THE TASTING"),
never colour-only; win highlights = outline + brightness + shape marker; verified under
protan/deutan/tritan simulation (step-13 check).

### 13.3 Keyboard map (L4/L5; hardware keyboards elsewhere)

| Key | Action |
|---|---|
| Space / Enter | spin (release-triggered, no hold-repeat) / activate focused control |
| + / − | bet up / down (one step per press) |
| A | autoplay panel (only where instantiated) |
| P | paytable |
| M | master mute |
| F | fullscreen (desktop) |
| Esc | close top overlay / cancel confirm step |
| Tab / Shift-Tab | focus traversal (order: spin → bet − → bet + → total bet → autoplay →
quick → turbo → ledger → ante → settings → paytable; overlays trap focus) |

Visible focus ring `--focus` ≥ 3:1, 3 px, never fully obscured (ring layer above celebrations,
§4.3).

### 13.4 Screen-reader sub-DOM

Hidden focusable DOM twin per interactive canvas control (positioned over hit areas, real
`<button>`/`<input>` semantics, name-role-value maintained); `aria-live="polite"` announcer
for results ("Win 4.50, balance 98.20"), feature entry/exit, vial changes, autoplay status;
`aria-live="assertive"` for errors, reconnection, reality checks. Jurisdiction-removed
controls are removed from the twin DOM too (no ghost tab stops). Announcement text per
control is specified in each C-table above.

## 14. Immersion layer

### 14.1 Composition

Full-scene world (no hard reel frame): 4 background layers — far / mid / near /
foreground-occluder — with parallax factors **0.05 / 0.15 / 0.3 / 1.2** of camera motion;
ambient idle loops on ≥ 2 layers (candle flames + rain on glass in base; steam in Distillery;
fireflies + prism glints in Night Garden). Layer count per device tier from
`device-profiles.json` (`parallaxLayers` 4/3/1).

### 14.2 Camera

Anticipation push-in ≤ **4% over ≤ 1.2 s** (only while committed outcome still permits the
next tier threshold — §7 anticipation rule; never on dead boards); big-win zoom ≤ **8%**;
screen shake default 6 px / 250 ms, hard cap 8 px / 400 ms; **all zeroed under reduced
motion**.

### 14.3 Reactive-environment trigger table (hand-off to step 8)

| Game event (real ids) | Environment reaction | Audio |
|---|---|---|
| `anim.reel.spin_start` | candle flames lean; cabinet glass rattles subtly | `sfx.reel.stop` per stop (motion job maps) |
| `anim.symbol.land` (orb variant) | local glow cast onto shelf behind cell | `sfx.orb.land` (pitch by value band) |
| `anim.scatter.land` | lighting flicker; wax-seal ember drift | `sfx.scatter.land` |
| `anim.scatter.anticipation` | room dims 10%, remaining-reel spotlight; push-in ≤ 4% | `sfx.scatter.anticipation` |
| `anim.cascade.remove` | glass shards + shelf dust motes (particle-capped) | `sfx.cascade.shatter` (+1 semitone per depth, cap +12) |
| `anim.cascade.refill` | bottles settle; shelf shadows re-seat | `sfx.cascade.settle` |
| orb collect (feature) | essence stream to vial; vial glow grows with P | `sfx.orb.collect` |
| orb apply | vial pours; win plate irradiates | `sfx.orb.apply` (gated ≤ `small` when return ≤ stake) |
| win ≥ `big` tier | environment glow cast (warm bloom on near layer) | `sfx.win.big` family |
| `anim.feature.enter` | full world transform: curtain → back parlour; frame re-dress; lighting state 1 | `sfx.feature.enter` → `music.feature` |
| `anim.super_feature.enter` | descent transition → cellar; copper frame; lighting state 2 | `sfx.super_feature.enter` → `music.super_feature` |
| `anim.ultimate_feature.enter` | conservatory doors → moonlight; prisms descend; lighting state 3 | `sfx.ultimate_feature.enter` → `music.ultimate_feature` |
| `anim.ultimate_feature.prisming` | light refracts through vial; prism rail gem lights | `sfx.prisming.chime` (ducks music −8 dB) |
| `anim.feature.retrigger` | +5 seal stamps onto spins-left counter | `sfx.feature.retrigger` |
| `anim.feature.summary` | chamber dims; summary plate on lectern | `sfx.feature.summary` |
| `anim.maxwin.reached` | the master vial overflows — house lights up (≤ 3 flashes/s) | `sfx.maxwin.reached` |
| autoplay start/stop | none (HUD only) | `sfx.autoplay.start` / `sfx.autoplay.stop` |
| ui interactions | none | `ui.click`, `ui.bet.change`, `ui.toggle`, `ui.error`, `ui.reconnect` |

### 14.4 Character rules

Madame Belladonna is a **presence, not an on-stage character** (GDD §2: never fully seen).
Reaction set: gloved hands at the cabinet edge (idle, rare), silhouette lean-in during
anticipation, hands pour at tier entry, slow applause silhouette at wins ≥ `big`. Reactions
**never fire on returns ≤ stake** and never imply "due to hit"; all reactions are decorative
(no information), so reduced motion may drop them entirely. Logged: no full character module.

## 15. G7 gate self-check

| # | Gate item (SKILL.md / prompts/ui-ux.md) | Result |
|---|---|---|
| 1 | 5 layouts with reference resolution, trigger, anchor rules, safe areas, orientation behaviour | PASS — §1 (table + §1.1–1.3) |
| 2 | Wireframes base + 3 tiers, portrait AND desktop, materially different, all regions labelled | PASS — §3.1–3.8 + deltas §3.9 |
| 3 | Sizing table; ≥ 120 physical px or logged raised minimum | PASS — §2; raised minimum 375×667 logged as UI-A1 (mirror to assumption-log pending — outside this job's write list) |
| 4 | HUD shows balance, total bet, win, spin state in every layout and state; regulatory strip reserved | PASS — §4.1; every wireframe carries the meter strip + spin state + REG strip |
| 5 | Every Procedure-5 control with all 10 states × visual/input/announcement | PASS — §5 C1–C31 (31 matrices; coin-value absence recorded) |
| 6 | Gated controls hidden not greyed; UNKNOWN most restrictive; autoplay counts + full stop list | PASS — §0/§5 rule, C3/C4/C5/C11/C13; §7 verbatim stop list |
| 7 | Feature-buy per-tier price (x-bet + currency) + buy RTP + two-step confirm + policy gate | PASS — C11/C12/§8 |
| 8 | Paytable values generated from config; recompute rule stated; no hand-typed pays | PASS — §9.2 (spec contains zero pay values) |
| 9 | Loading budgets + audio-unlock continue gate; error/reconnect/insufficient-balance specified | PASS — §10, C22–C25 |
| 10 | Reduced-motion / low-performance / data-saver per screen | PASS — §12 |
| 11 | Accessibility numbers complete (44 px, 8 px, 4.5:1, 3:1, 200%, ≤ 3/s, keyboard map) | PASS — §13 |
| 12 | Immersion: parallax counts+factors, trigger table on real events, character rules | PASS — §14 |

---

> Presentation-only document. Nothing herein implies the client can influence a committed
> outcome. Certification-ready **candidate** material; not certified (CONVENTIONS §9.9).


