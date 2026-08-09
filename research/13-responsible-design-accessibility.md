# Responsible-by-Design & Accessibility for a Single Slot

- Skill: single-modern-slot-creator v1.0.0 · Dossier 13 · Domain: responsible design, dark-pattern prohibitions, reality checks, session displays, autoplay policy, spin-presentation modes, WCAG 2.2 / photosensitivity / sensory accessibility
- Date: 2026-08-08 · Author: research-13 (detached worker)
- Authoritative checklist: `prompt.txt` lines 1272–1450 (spin modes, autoplay, rapid-input protection) plus mission scope for dark patterns, reality checks, and accessibility.
- Tag legend: **[mandatory]** = required by a named regulator/standard in that jurisdiction; **[recommended]** = strong industry/standards-body guidance or academic consensus; **[observed]** = common market practice; **[inferred]** = my synthesis, reasoning stated.

---

## Findings

### 1. Dark patterns to prohibit (research-backed)

#### 1.1 Losses disguised as wins (LDWs)

- **Definition (academic):** an outcome where the return is less than the total stake (e.g. bet 1.00, "win" 0.50 across a subset of lines) yet the game celebrates with win-class audio/visuals. Only possible on multiline/multiway games. Dixon, Harrigan, Sandhu, Collins & Fugelsang (*Addiction*, 2010) measured skin-conductance and heart rate in 40 novices: **arousal for LDWs was statistically indistinguishable from real wins and significantly higher than losses** — players physiologically miscategorize LDWs as wins [S14]. A 2013 follow-up (96 gamblers, sound on/off conditions) showed celebratory **sound alone causes significant overestimation of win frequency** [S15]. Harrigan et al. (2011) simulations: on a 1–20-line game, "win" rate as experienced rises dramatically with lines played even though true-win rate barely moves (15% at 1 line vs 18% at 20 lines) because LDWs fill the gap [S14][S16].
- **UK [mandatory]:** RTS 14F — "The gambling system must not celebrate a return which is less than or equal to the total stake gambled." "Celebrate" = auditory or visual effects associated with a win. Applied to slots from 31 Oct 2021; extended to **all casino games from 17 Jan 2025**. Permitted: displaying the amount awarded, briefly highlighting winning lines (without breaching RTS 7E result-display rules), a brief "result/transfer" sound distinct from win celebration [S1][S2].
- **Ontario [mandatory]:** AGCO Registrar's Standards for Internet Gaming, Standard 2.20 — for slots, no auditory or visual effects associated with a win for returns **≤ last total amount wagered** (in force since market launch 4 Apr 2022) [S8].
- **Everywhere [recommended → skill default]:** treat return ≤ total stake as a *loss-class* presentation globally, not just in UK/ON. CONVENTIONS.md §9.5 already requires LDW never celebrated above `small` tier; the stricter, research-aligned rule is **no win-class celebration at all** for return ≤ stake (see Design implications §D1).

#### 1.2 Forced / engineered near-misses

- **GLI-11 [mandatory, US/tribal + widely adopted]:** §4.3.1(b) "No Near Miss — After selection of the game outcome, the gaming device shall not make a variable secondary decision, which affects the results shown to the player." I.e. once RNG picks "loss," the game may not re-poll to choose an *exciting-looking* loss (the classic banned pattern: two jackpot symbols on the line, third just off the line, selected deliberately) [S9].
- **GLI-19 v3.0 (online systems, rev. 17 Jul 2020) [mandatory where adopted]:** §4.6 outcome-integrity — the game shall not modify or discard RNG-selected outcomes due to adaptive behaviour; no secondary decision affecting the displayed result. Referenced by Ontario AGCO, Denmark SCP, and others [S10].
- **Ontario [mandatory]:** AGCO standards restate the secondary-decision ban verbatim ("such as substituting a 'near miss' loss display") and add: games shall not display amounts or symbols that are unachievable [S8].
- **Nuance [observed]:** naturally occurring near-misses from a fixed random strip are legal everywhere — nearly every losing spin is "near" something. What is banned is the *secondary decision*. Deliberately weighting **virtual reels** so high-pay symbols cluster just off the payline (Harrigan's "high award symbol ratio" work) is *not* caught by GLI's secondary-decision test in the US, but Dixon/Harrigan near-miss arousal research shows near-wins are rated more unpleasant AND more arousing than other losses, prolonging play [S9][S16][S17]. The skill should ban both mechanisms (see D2).
- **UK [mandatory, adjacent]:** RTS 7B requires games to be implemented as described to the customer (probabilities/paytable as stated); RTS 7A bans adaptive behaviour. UKGC/AGCO language rules also prohibit misleading near-miss *messaging* ("so close!", "almost!") [S3][S8].

#### 1.3 Adaptive / behavioural / compensated RTP

- **UK [mandatory]:** RTS 7A — outcomes must be acceptably random; "**Adaptive behaviour (that is, a compensated game) is not permitted.**" Guidance: no automatic or manual interventions that change outcome probabilities during play; bonus features with different rule-sets are fine only if entered via random events [S3].
- **GLI-11/GLI-19 [mandatory]:** same prohibition, tested directly by ITLs [S9][S10]. Gibraltar §7.3 mirrors it [S3].
- **Implication:** no per-player RTP, no loss-chasing "pity" mechanics, no win throttling after big wins, no engagement-driven weighting. Matches CONVENTIONS.md §9.5. RTP profiles (0.96/0.94/0.92) are legal only as **operator-configured, fixed-per-market builds**, never switched in-session or per-player behaviourally [inferred from S3+S10; standard certification practice].

#### 1.4 Illusion of control

- **Stop buttons / slam stop:** Ladouceur & Sévigny (2005, *J Gambling Studies* 21) — access to a stopping device increased illusory-control cognitions and gambling persistence [S18]. Dixon et al. (2017) — 13.6% of players held erroneous stop-button cognitions; harder button presses, larger SCRs with stop button [S17]. Chu et al. (2018) reframe stop buttons as an *event-speed* feature — either way harmful [S18].
- **UK [mandatory]:** RTS 14E (from 17 Jan 2025, all casino games) — customers must not be able to reduce the time until the result is presented; **turbo, quick spin and slam stop all prohibited** (list explicitly non-exhaustive). Exemptions: bonus features with no additional stake, scratch-all/reveal-all, crash-style games where inaction loses the stake [S1][S2].
- **Ontario [mandatory]:** min 2.5 s cycle, no turbo/quick-spin, and games must not: imply skill affects a chance outcome, imply chances improve with time/spend, use "due / overdue / ready to hit" language, present winning as the probable outcome, or encourage recovering losses [S8].
- **Australia [mandatory, land-based reference]:** stopping devices prohibited on EGMs [S18].
- **UK [mandatory]:** RTS 14A — no encouraging loss-chasing, stake-raising, continued play after an expressed wish to stop; no auto top-ups; no "win it back" messaging; no free-game lures on exit [S1].

#### 1.5 Other prohibited/deceptive presentation

- Unachievable symbols/amounts must never be displayed (AGCO) [mandatory, ON] [S8].
- No celebratory re-presentation of the player's own returned stake as a win [inferred from RTS 14F logic].
- No countdown/scarcity pressure on wagers, no "hot streak" claims — caught by ON language rules and UK LCCP fairness principles [mandatory ON, inferred UK] [S8].
- Reverse-withdrawal option prohibited (UK RTS 14B; Sweden 2026 draft) — operator-side, but the game must never surface "cancel withdrawal and keep playing" prompts [mandatory UK] [S1][S7].

### 2. Reality checks & session displays by jurisdiction

| Jurisdiction | Instrument | Requirement | Tag |
|---|---|---|---|
| UK | RTS 13B | System must offer facilities for the **customer to set** reality-check frequency; check displays elapsed session time, must be **acknowledged** to dismiss, offers exit/logout + link to account history; blocks new stakes until acknowledged; **must halt any autoplay sequence** (autoplay itself now banned anyway). Defaults from a pre-set list must be the **minimum** interval offered. | [mandatory] [S4] |
| UK | RTS 13A | Full-screen client obscuring device clock ⇒ app must show time-of-day or elapsed time (hours+minutes) wherever practicable. | [mandatory] [S4] |
| UK | RTS 13C | **Elapsed time displayed for the whole gaming session**, in seconds/minutes/hours; start at game-open or first play. Slots since 31 Oct 2021; all casino products (exc. p2p poker) since 17 Jan 2025. | [mandatory] [S4][S2] |
| UK | RTS 2E | **Net position** (all winnings − all losses since session start) displayed throughout the session, in account currency. Same rollout dates as 13C. | [mandatory] [S2] |
| Germany | §6h(7) GlüStV 2021 + §22a(9) | After **60 min** of play, notice of elapsed time requiring express confirmation; for virtual slots continuation is allowed only **5 minutes after** confirmation ⇒ enforced 5-min break per hour. Repeats every 60 min. | [mandatory] [S6] |
| Spain | RD 176/2023 art. 11 (in force 15 Sep 2023) | Interrupt continuous play **at least every 60 min** with a reality check showing cumulative deposits, stakes, winnings and time; offer end-session and limit-change options. | [mandatory] [S12] |
| Sweden | Gambling Act 2018:1138 + LIFS 2018:2 (SIFS successors) | Player must be able to set max stake/round, max session time, and a **reality-check interval showing elapsed time and net position**; elapsed session time displayed continuously, values refreshed each round; login-time limit reminders; Spelpaus + panic button (24 h, immediate). 2026 draft: auto-logout after 60 min inactivity. | [mandatory] [S7] |
| Ontario | AGCO 2.21 / 2.22 | 2.21: slots sessions clearly display **net position in CAD** (winnings − losses since session start). 2.22: players shall have means to **track passage of time**. 2.23: easy limit-setting at and after registration. | [mandatory] [S8] |
| Netherlands | KOA/Ksa practice | Session info and loss-of-control interventions operator-side; in-game, the binding game-level rules are the autoplay ban (below) and cross-provider limits. | [mandatory, operator-level] [S11] |

**Session definition (UK):** starts when the player begins playing for real money, ends on game exit; may span multiple game cycles [S2]. Prominence: UKGC has warned it may get prescriptive if operators bury the displays — put them in the persistent HUD, not a sub-menu [recommended] [S2].

### 3. Autoplay

- **UK [mandatory]:** banned for slots since 31 Oct 2021 (RTS 8: "The gambling system must require a customer to commit to each game cycle individually"); ban extended to **all online gaming** from 17 Jan 2025. UKGC evidence: 58% of autoplay users said it made them play faster than intended [S5][S2].
- **Netherlands [mandatory]:** autoplay prohibited in online slots (player must make a "conscious choice" per spin); Ksa enforces against suppliers too — fines up to €300,000; 2025 enforcement extended the reading to auto-repeat-bet in roulette. Supplier is responsible for checking third-party software [S11].
- **Germany [mandatory]:** §22a(6) GlüStV — spins must not be automated; each spin manually initiated [S6].
- **Ontario [mandatory]:** autoplay prohibited; conscious button **release-and-depress** per cycle [S8].
- **Sweden [mandatory today]:** autoplay is currently PERMITTED, but the 3-second minimum game round in LIFS 2018:8 (re-issued SIFS 2022:3) explicitly applies to autoplay rounds too [S23]. **[mandatory-pending]:** June 2026 Spelinspektionen draft replaces the 2018 rules; proposes a **60-round cap** on autoplay in commercial online casino, plus immediate-stop requirements (comments closed 10 Aug 2026; expected in force with 2026 reforms) [S7].
- **Where permitted (historic UK RTS 8 as best-practice template, still the de-facto multi-market baseline):** batch ≤ 100 (2016 version: 25); player must pre-select stake, number of rounds, and at least a loss limit (accumulated autoplay stakes − accumulated autoplay wins) or single-win limit; stop available at any time; autoplay must not override result-display minimums (RTS 7E); reality check interrupts and blocks the next auto round [mandatory-where-offered] [S5][S4].
- **Checklist mapping (prompt.txt 1382–1424):** every listed stop condition is either directly sourced (finite count, immediate stop, loss/win-threshold stops, reality-check stop, no infinite default — UK RTS 8 + Sweden draft) or standard certification behaviour (stop on feature trigger, error, disconnection, bet change, max win, insufficient balance — GLI-19 game-cycle integrity + vendor practice) [S5][S10][observed]. No source contradicts any item; encode all of them.

### 4. Spin-presentation modes (Normal / Quick / Turbo / Skip) — regulatory envelope

- **Invariant [mandatory in all certified markets]:** presentation modes must not touch RTP, strips, weights, probabilities, settlement, or outcome generation (GLI-11/19 outcome integrity; UK RTS 7B "implemented as described") [S3][S9][S10]. This matches prompt.txt 1276–1300 and CONVENTIONS.md §9.2 — same manifest ⇒ same final balance in every mode.
- **Minimum round duration [mandatory, per-jurisdiction]:** UK slots ≥ 2.5 s per game cycle (RTS 14D, cycle = start-press until all stakes/wins settled and button re-available; button must be **released and re-pressed**, no held-button repeat); UK non-slot casino ≥ 5 s (14G); Germany average ≥ 5 s (§22a(6) — "average," so GGL tolerates variance around 5 s); Ontario ≥ 2.5 s + release-and-depress [S1][S6][S8]. Enforcement is real: Stakelogic fined £122,835 (June 2026) for slots running faster than permitted [S2].
- **Quick/turbo/slam [mandatory UK+ON: prohibited]:** any player-initiated reduction of time-to-result is banned (RTS 14E; AGCO). In markets without the ban (e.g. .com, MGA-generic), quick/turbo are [observed] standard — so they must be **jurisdiction-flagged, default OFF for UNKNOWN** per CONVENTIONS.md §9.6 [S1][S8].
- **Skip carve-outs [mandatory UK]:** RTS 14E exempts (a) bonus/feature games with no additional stake, (b) scratch-all/reveal-all; so **win-count-up skip, feature-transition skip, and cascade fast-forward inside an already-settled round are permissible even in the UK**, provided the base game-cycle floor (2.5 s) is respected and no new stake commences sooner [S1] + [inferred: skips act after outcome committed, which 14E's "time until result is presented" arguably covers — see Uncertainties U2 for the conservative reading].
- **Non-skippable information [mandatory]:** reality checks (acknowledge to dismiss), regulatory messages, net-position/elapsed-time HUD, error states, and max-win termination notices must survive every speed mode and skipping (RTS 13B; prompt.txt 1336, 1372) [S4].

### 5. Rapid-input protection (prompt.txt 1426–1450)

No regulator prescribes debouncing directly, but three rules force it [inferred, high confidence]:
- UK/ON release-and-repress means held or synthetically repeated input must not start cycles (RTS 14D/AGCO) [S1][S8].
- Min-cycle floors mean queued clicks/space/Enter during the 2.5 s window must be dropped, not buffered into an "unbounded queue of pending wagers" (prompt.txt 1422).
- GLI-19 game-recall/interruption rules require exactly one open round; reconnection resumes the committed round rather than accepting new input (matches CONVENTIONS.md §7 resumePointer) [S10].
Design: swallow repeat pointer/touch/keyboard input while state ∉ {ready}; single-flight round requests; ignore stop/skip input until outcome committed; on reconnect/orientation-change/backgrounding, re-sync then re-enable input.

### 6. Accessibility — WCAG 2.2 application to a canvas slot

**Status [mandatory-as-adopted]:** WCAG 2.2 is a W3C Recommendation since 5 Oct 2023 (errata 12 Dec 2024) and **ISO/IEC 40500:2025** since 21 Oct 2025. Superset of 2.1 minus 4.1.1 Parsing. EU EN 301 549 / European Accessibility Act (applies to e-commerce services from 28 Jun 2025) and US DOJ Title II rule (WCAG 2.1 AA) make AA the practical floor; target 2.2 AA [S13].

Level-A/AA criteria that concretely bind a PixiJS canvas slot:

| SC | Level | Application to the slot |
|---|---|---|
| 1.4.1 Use of Color | A | No information by colour alone: symbol identity, win lines, feature states need shape/icon/pattern/label redundancy [S13][S20] |
| 1.4.3 Contrast (Minimum) | AA | HUD text (balance, bet, win, elapsed time, net position) ≥ 4.5:1 (large text ≥ 3:1) [S13] |
| 1.4.11 Non-text Contrast | AA | Buttons, focus rings, toggle states, meter fills ≥ 3:1 vs adjacent colours [S13] |
| 2.1.1 Keyboard | A | Spin, bet ±, menu, paytable, feature choices all keyboard-operable; canvas needs a mirrored focusable sub-DOM [S13][S19] |
| 2.3.1 Three Flashes or Below | A | See §7 — non-interference criterion: one violation fails the whole page [S21] |
| 2.4.7 / 2.4.11 Focus Visible / Not Obscured (Min) | AA | Custom-drawn focus indicator ≥ 3:1, never fully hidden by overlays/win banners [S13] |
| 2.5.7 Dragging Movements | AA | No drag-only interactions (bet sliders need ± buttons) [S13] |
| 2.5.8 Target Size (Minimum) | AA | ≥ 24×24 CSS px minimum; **skill adopts ≥ 44×44 px** (Apple HIG/WCAG 2.5.5-AAA-aligned; CONVENTIONS.md §9.7 already mandates 44) [S13] |
| 1.1.1 / 4.1.2 Text alternatives, Name-Role-Value | A | Canvas is invisible to AT: maintain hidden DOM twins for interactive controls + `aria-live="polite"` region announcing result summaries ("Win 4.50, balance 98.20") [S19] |
| 2.2.2 Pause, Stop, Hide | A | Ambient/idle animations pausable — reuse reduced-motion pathway [S13] |

**Canvas technique [recommended]:** sub-DOM fallback — one focusable DOM element per interactive canvas region, kept in tab order, positioned over the canvas hit areas; browsers expose canvas child content to AT. Do not rely on (removed) hit-region APIs [S19].

**Motor accessibility [recommended]:** no precision-timing input anywhere (banned by RTS 14E logic anyway — any timing-based stop is slam stop); all interactions single-tap; ≥ 8 px spacing between adjacent targets; hold-to-repeat disabled on spin [S1][S13][inferred].

**Cognitive [recommended]:** plain-language paytable (x-bet values per CONVENTIONS.md §5), always-accessible rules, no time-limited menu decisions, persistent bet/balance/win in one stable HUD location, feature-state banners in text not just colour/motion [S13][S20].

### 7. Photosensitivity

- **WCAG 2.3.1 (A) [mandatory-as-adopted]:** nothing flashes **more than 3 times in any one-second period**, unless below both thresholds: (a) *general flash* — pair of opposing luminance changes ≥ 10% of max relative luminance with darker state < 0.80, (b) *red flash* — opposing transitions to/from saturated red (R/(R+G+B) ≥ 0.8 and (R−G−B)×320 > 20). Area exemption: combined flashing area ≤ 0.006 steradians in any 10° field ≈ **21,824 px² (≈341×256) at 1024×768-equivalent viewing** — pro-rate to canvas resolution. Fine balanced patterns < 0.1° squares exempt [S21].
- Non-interference: a single violating win celebration fails the entire product; warnings do not substitute [S21].
- **Testing [recommended]:** run PEAT (Photosensitive Epilepsy Analysis Tool) on captures of big-win/mega-win/feature-entry sequences; the W3C thunderstorm example (insert pauses between flash pairs) is the canonical fix pattern [S21].
- Slot-specific hot spots [observed]: win-line strobes, coin-shower flicker, lightning/electric themes, retrigger flashes, red "MEGA WIN" pulses (double jeopardy: red flash test). Cap all UI pulse loops at ≤ 3 Hz and avoid saturated-red full-screen pulses entirely [S21][inferred].

### 8. Reduced-motion & sensory modes

- **Detection [recommended]:** honor OS `prefers-reduced-motion` via `window.matchMedia('(prefers-reduced-motion: reduce)')` in the JS game loop **and** provide an in-game toggle (shared machines, situational need) [S20].
- **Semantics [recommended]:** reduce/replace, don't blank: swap large translations/parallax/zoom/shake for opacity fades, colour changes, shortened durations; reels present via short cross-fade to final grid rather than full spin travel; result information must remain complete (prompt.txt 1374: skip behaviour in reduced-motion mode = instant-present with fades) [S20].
- WCAG 2.3.3 Animation from Interactions is AAA — the skill treats it as a shipped mode, not a conformance claim [S13][S20].
- Additional sensory modes [recommended, from Game Accessibility Guidelines / Xbox XAG]: separate volume sliders (music/SFX/UI), full mute with visual win feedback intact, optional screen-shake/haptics toggles, colour-blind-safe palette verified against deuteranopia/protanopia/tritanopia simulators (Color Oracle; Unreal's built-in simulator as reference tooling) [S20].

### 9. Colour-blind-safe symbol design

- ~8% of males have red-green CVD [observed]. Rules [recommended] [S20]:
  - Every symbol distinct by **silhouette first**: unique shape/character per symbol id (H1–H4, L1–L5 as distinct suit-like glyphs, not same gem recoloured).
  - Rank encoded redundantly: size/ornament tier + optional letter/pip, never hue alone (Uno's shape-per-colour redesign and ColorADD are precedents).
  - Win-line/cluster highlights: outline + brightness pulse + per-line glyph, not colour-only line tints.
  - State colours (active/inactive, sticky, multiplier levels) get icon or pattern reinforcement.
  - Verify contrast of foregrounds under CVD simulation — reds darken for protanopes; avoid red-on-dark critical UI.

### 10. Academic base → design levers (summary)

| Finding | Source | Design lever |
|---|---|---|
| LDWs arouse like wins; sound drives win-frequency overestimation | Dixon/Harrigan 2010; 2013 sound study [S14][S15] | Loss-class presentation for return ≤ stake; no celebratory audio |
| Near-miss arousal prolongs play; engineered clustering is exploitative | Harrigan 2007/2009; near-miss reviews [S16][S17] | No secondary decisions; no deliberate off-line clustering of top symbols in strip design; no "almost!" messaging |
| Stop buttons foster illusion of control / raise event speed | Ladouceur & Sévigny 2005; Dixon 2017; Chu 2018 [S17][S18] | No slam-stop in restricted markets; where allowed, frame as "show result", never as skill |
| Speed/event frequency is a primary harm factor | Griffiths 1993; Parke & Griffiths 2006; GambleAware/Bournemouth 2025 (online casino ⇒ ~4× harm likelihood) [S16][S22] | Respect min cycle times; no features whose only purpose is intensity |
| Multi-game/split-screen play raises intensity | UKGC RTS 14C; Germany §22a; AGCO [S1][S6][S8] | Single game instance; block second concurrent round |

---

## Source register

| id | name | type | pub/revision | jurisdiction | URL | supports |
|----|------|------|--------------|-------------|-----|----------|
| S1 | UKGC RTS 14 – Responsible product design (fetched full text) | regulator | pub 2 Feb 2021, upd 12 Jan 2026 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | 14A–14G exact text: LDW ban, 2.5 s/5 s cycles, spin-stop ban, exemptions |
| S2 | Wiggin LLP "Remote game design changes taking effect 17 Jan 2025" + UKGC consultation responses (net position, speed limits, annex 1) | industry-press/regulator | 2024–2025 | GB | https://www.wiggin.co.uk/insight/remote-game-design-changes-taking-effect-17-january-2025/ ; https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/ogdrw-annex-1-summary-of-changes-to-rts | 2025 extension of slots rules to all casino games; RTS 2E net position; session definition; Stakelogic fine |
| S3 | UKGC RTS 7 – Generation of random outcomes | regulator | Feb 2021 ed. | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-7-generation-of-random-outcomes | 7A adaptive/compensated ban; 7B implemented-as-described; 7E result display |
| S4 | UKGC RTS 13 – Time requirements and reality checks (fetched full text) | regulator | pub 2 Feb 2021, upd 21 Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-13-time-requirements-and-reality-checks | 13A clock, 13B customer-set reality checks + acknowledgement + autoplay block, 13C elapsed time |
| S5 | UKGC RTS 8 – Auto-play + OGDRW consultation response | regulator | Oct 2021; upd Jan 2025 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-8-autoplay-functionality | Slots autoplay ban 31 Oct 2021; all-products ban 17 Jan 2025; historic ≤100-batch + loss/win-limit controls; 58% stat |
| S6 | GlüStV 2021 §22a, §6h(7), §6c (state law portals + explanatory notes) | regulator | in force 1 Jul 2021 | DE | https://gesetze.berlin.de/bsbe/document/jlr-Gl%C3%BCStVtrBE2021pP22a ; https://bravors.brandenburg.de/vertraege/gluestv_2021 | 5 s avg spin, €1 stake (GGL 2025/26: €3/€5 for qualifying players), no autoplay, no simultaneous play, no in-stake jackpots, 60-min notice + 5-min break, €1,000 deposit limit, panic button |
| S7 | Spelinspektionen framework (Gambling Act 2018:1138, LIFS 2018:2) + June 2026 draft replacing it | regulator | 2019; draft 16 Jun 2026 | SE | https://focusgn.com/spelinspektionen-proposes-new-binding-regulations-to-replace-the-2018-rules ; https://gamingcompliance.io/sweden/ | Player-set reality-check interval showing time+net position; login limits; 72 h limit-increase delay; draft 60-round autoplay cap, 60-min idle logout, reverse-withdrawal ban |
| S8 | AGCO Registrar's Standards for Internet Gaming (2.20–2.23 etc.) | regulator | in force 4 Apr 2022 | CA-ON | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming | LDW ban 2.20; net position CAD 2.21; time tracking 2.22; limits 2.23; 2.5 s + release-and-depress; near-miss secondary-decision ban; "due/overdue" language ban |
| S9 | GLI-11 Gaming Devices in Casinos (v2.0/v3.0 PDFs) | standard | v3.0 c. 2016–2018 | US/multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | §4.3.1(b) No Near Miss / secondary decision; outcome authenticity; last-10-plays recall |
| S10 | GLI-19 Standards for Interactive Gaming Systems v3.0 | standard | rev 17 Jul 2020 | multi (ON, DK, …) | https://gaminglabs.com/wp-content/uploads/2024/06/GLI-19-Interactive-Gaming-Systems-v3.0.pdf | §4.6 outcome integrity, no adaptive behaviour, RTP disclosure, game recall/interruption |
| S11 | Ksa autoplay enforcement (2022 warning; 2025 roulette crackdown) | regulator/industry-press | 2022–2025 | NL | https://igamingbusiness.com/legal-compliance/__trashed-3/ ; https://europeangaming.eu/portal/latest-news/2025/03/07/177848/dutch-gambling-authority-cracks-down-on-online-gambling-autoplay-feature/ | NL autoplay ban, "conscious choice" per spin, €300k fine exposure, supplier responsibility |
| S12 | Spain Royal Decree 176/2023 (ECIJA legal memo; Chambers Gaming Law 2025) | regulator/legal | approved 14 Mar 2023, in force 15 Sep 2023 | ES | https://ecija.com/en/sala-de-prensa/legal-memo-on-the-new-royal-decree-176-2023-on-safer-gambling-environments/ | Art. 11 ≥60-min reality check (deposits/stakes/winnings/time + end-session option); intensive-gambler thresholds €600/€200-u25 |
| S13 | W3C WCAG 2.2 (TR) + Understanding docs + practitioner guides (Deque, getwcag) | standard | Rec 5 Oct 2023; ISO/IEC 40500:2025 (21 Oct 2025) | global | https://www.w3.org/TR/WCAG22/ | 2.5.8 24px, 2.4.11, 2.5.7, 1.4.x contrast, ISO status, superset relation |
| S14 | Dixon, Harrigan, Sandhu, Collins, Fugelsang — "Losses disguised as wins in modern multi-line video slot machines", *Addiction* 105(10) | academic | 2010 | — | https://uwaterloo.ca/reasoning-decision-making-lab/sites/default/files/uploads/files/DixFugetal_10c.pdf | LDW arousal = win arousal; Lobstermania full-outcome analysis |
| S15 | Dixon et al. — "Using sound to unmask losses disguised as wins" (*J Gambling Studies*) + ScienceDaily summary | academic | 2013/2015 | — | https://lumsa.it/sites/default/files/pdf/DIXON_2015.pdf | Celebratory sound ⇒ win-frequency overestimation |
| S16 | Harrigan — EGM structural characteristics (2007); Harrigan & Dixon PAR-sheets study (2009); Griffiths (1993); Parke & Griffiths (2006) | academic | 1993–2009 | — | https://www.greo.ca/Modules/EvidenceCentre/files/Harrigan%20(2007)Electronic_gaming_machine_structural_characteristics.pdf ; https://www.stoppredatorygambling.org/wp-content/uploads/2012/12/PAR-Sheets-Probabilities-and-Slot-Machine-Play-Implications-for-Problem-and-Non-Problem-Gambling.pdf | Structural-characteristics framework; virtual-reel near-miss engineering; speed as harm factor |
| S17 | Dixon et al. — "Near-misses and stop buttons in slot machine play" (*J Gambling Studies*, PMC5846825); near-miss review Springer 2019 | academic | 2017/2019 | — | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5846825/ ; https://link.springer.com/article/10.1007/s10899-019-09891-8 | 13.6% stop-button / 16% near-miss erroneous cognitions; arousal signatures |
| S18 | Ladouceur & Sévigny (2005) stopping-device study; Chu et al. (2018) | academic | 2005; 2018 | — | https://link.springer.com/article/10.1007/s10899-005-3028-5 ; https://gamblingresearch.sites.olt.ubc.ca/files/2018/08/Chu_stoppers_AAM.pdf | Illusion of control + persistence; event-speed reframing; AU prohibition note |
| S19 | Canvas accessibility: W3C HTML-WG wiki, TPGi/Vispero, PaulJAdam demos | vendor-docs/standard | 2011–ongoing | global | https://www.w3.org/html/wg/wiki/AddedElementCanvas ; https://www.tpgi.com/html5-canvas-accessibility-in-firefox-13/ | Sub-DOM fallback technique; canvas children exposed to AT + tab order |
| S20 | Game Accessibility Guidelines; Xbox Accessibility Guidelines (XAG 103); MDN prefers-reduced-motion; Pope Tech animation guide (Dec 2025) | vendor-docs/blog | ongoing; 2025 | global | https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/ ; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion ; https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103 | Colour-alone ban, CVD tooling, reduce-vs-remove motion, in-game toggle |
| S21 | WCAG 2.3.1 Understanding + G15/G19/G176 techniques; Stark/NYU explainers | standard | WCAG 2.0–2.2 lineage | global | https://w3c.github.io/wcag21/understanding/three-flashes-or-below-threshold.html ; https://www.w3.org/TR/WCAG20-TECHS/G15.html | 3-flash rule, general/red-flash formulas, 21,824 px² area, PEAT |
| S22 | GambleAware/Bournemouth University product-risk report + coverage | academic/industry-press | Jan 2025 | GB | https://www.gambleaware.org/what-we-do/news/news-articles/new-gambleaware-commissioned-research-warns-of-high-risks-from-gaming-machines-online-casino-games-and-loot-boxes/ | Online casino ≈4× harm likelihood; speed/accessibility as risk factors; multi-activity risk |
| S23 | LIFS 2018:8 — Spelinspektionen/Lotteriinspektionen technical requirements (lagen.nu full text; re-issued SIFS 2022:3, 2022-12-02) | regulator/statute | 2018 / 2022 | SE | https://lagen.nu/lifs/2018:8 | "Varje spelomgång ska vara minst tre sekunder"; provision applies to autoplay; autoplay itself permitted |
| S24 | iGB — Germany raises online slot stake limits (tiered €1/€3/€5, behavioural tracking) + CasinoGuardian tiered-system report | industry-press | 2026-07 | DE | https://igamingbusiness.com/legal-compliance/regulation/germany-raises-online-slot-stake-limits-operators-to-track-player-behaviours/ | GGL tiered stakes effective 2026-07-01, 90-day qualification, under-21 €1 |

---

## Uncertainties & legal-review items

- **U1 — Germany stake relaxation.** RESOLVED (2026-08 follow-up): the GGL implemented a tiered system effective **2026-07-01** — €1 remains the statutory default (§22a(7)) and the cap for under-21s; players 21+ may be offered up to **€3**; up to **€5** only after a **90-day no-harm qualification period**, with mandatory operator behavioural monitoring before and after the uplift (operator opt-in per player) [S24]. The 5 s average round rule is unchanged. Residual: confirm the GGL decision guideline's exact qualification criteria from the primary FAQ before a DE release, and monitor the end-2026 GlüStV evaluation (NRW addiction office publicly opposes the increase — reversal risk).
- **U2 — UK scope of RTS 14E over post-commit skips.** 14E bans reducing "time until the result is presented." Bonus-feature and reveal-all exemptions strongly suggest count-up skip and feature-transition skip inside an already-presented result are fine, and market practice in GB (win-skip present, turbo absent) supports it [observed]. But no UKGC text explicitly blesses win-count-up skipping; conservative default: in GB profile, skipping never shortens the 2.5 s cycle and initial reel-stop presentation is never player-acceleratable. Legal review before shipping GB.
- **U3 — Sweden 2026 draft status.** The 60-round autoplay cap / 60-min idle logout were in consultation (closed ~10 Aug 2026). Final SIFS text and in-force date unconfirmed as of today; encode as pending flag.
- **U4 — UK reality-check interval.** There is **no fixed statutory "1-hour" UK reality check for slots**; RTS 13B is customer-set (default = minimum of any preset list). The 60-minute mandatory interrupt is Spain (RD 176/2023) and Germany (§6h(7)). Downstream agents must not hard-code "UK = 1 hr".
- **U5 — Near-miss strip-weighting legality.** GLI's ban covers only secondary decisions; deliberate off-line clustering via virtual-reel weighting is legal in most US frameworks though academically condemned. The skill bans it as policy (D2), which exceeds law in some markets — document as a design stance, not a legal requirement.
- **U6 — WCAG legal applicability to real-money games.** Gambling products aren't uniformly in scope of EAA/ADA case law; treat WCAG 2.2 AA as contractual/ethical baseline pending counsel. Canvas games can only meet several SCs via the sub-DOM/live-region pattern; a strict auditor may still flag reel areas as insufficiently described.
- **U7 — Flash-area math on modern viewports.** The 21,824 px² figure assumes a 1024×768/typical-viewing model; for 4K or mobile-held-close, safest is to apply the ≤3 flashes/s rule to the whole canvas and skip the area exemption entirely.
- **U8 — GLI-11 v3.0 exact near-miss section number.** 4.3.1(b) is cited from v1.3/v2.x-era text via secondary sources; verify the clause number against the v3.0 PDF at certification-prep time (the substance is unchanged).

---

## Design implications for the Skill

Concrete rules for `jurisdiction-policies.json`, `spin-presentation.json`, `autoplay.json`, `animation-events.json`, client HUD, and validators. These are the encode-me items.

### D1 — Win presentation & LDW (hard rules, global defaults)
1. `winClass = loss` whenever `totalWinMinor <= wagerMinor` for the round: **no** win-tier animation, **no** celebratory audio, **no** "WIN!" text. Permitted: numeric award display, ≤1 brief line-highlight pass, one neutral "result/transfer" sound distinct from every win sound.
2. Win-tier thresholds (CONVENTIONS §4.3) evaluate on **net-of-stake multiples** for presentation intensity in strict profiles: GB/ON profile uses `celebrate only if totalWin > stake` (RTS 14F / AGCO 2.20). Validator: assert no `anim.win.*` or `sfx.win.*` event fires for any manifest step where round `totalWinMinor <= wagerMinor`.
3. Audio validator: every audio event reachable from a `return <= stake` round must not share the win jingle family [S14][S15].

### D2 — Outcome authenticity (math + engine invariants)
4. No secondary decisions: the displayed grid is byte-identical to the RNG/manifest grid; no re-rolls, no substitution of "exciting losers" (GLI-11 §4.3.1(b), GLI-19 §4.6, AGCO).
5. No adaptive/compensated behaviour: probabilities constant per versioned math build (UK RTS 7A); RTP profiles are fixed per-market builds selected at deploy, never in-session.
6. Reel-strip lint (policy, exceeds law — documented as design stance): no deliberate off-payline clustering of top symbols to inflate near-miss frequency; anticipation is allowed only when the *live* outcome still permits the trigger (e.g. 2 scatters landed, ≥1 scatter exists on remaining strips). Never play anticipation on rounds where the committed outcome cannot trigger.
7. Never display unachievable symbols/amounts; never use "due/overdue/hot/ready to hit/almost!" strings anywhere (copy lint list in validation).
8. No loss-chasing copy: forbid strings matching win-back/recover-losses patterns; no exit-intent free-spin lures (RTS 14A).

### D3 — Timing & speed modes (`spin-presentation.json` + `jurisdiction-policies.json`)
9. `minRoundDurationMs` per jurisdiction: GB slots **2500**; ON **2500**; DE **5000 (average; implement as fixed 5000 floor)**; SE **2500 [inferred parity with GB-style practice — verify]**; UNKNOWN ⇒ **5000** (most restrictive known floor).
10. Input model: start button requires release-and-repress; held input never starts a cycle; input queued during the floor window is discarded (GB/ON) — make this the global default.
11. `quickSpin`/`turboSpin`: flags default **false**; GB/ON/DE/NL profiles hard-disable (RTS 14E, AGCO, §22a). Where enabled, they compress presentation only and never below `minRoundDurationMs`.
12. `slamStop` (player reel-stop): disabled in GB/ON/AU-style profiles; where enabled, UI copy must present it as "show result", and it can never reveal before outcome committed. Default OFF everywhere (illusion-of-control research, D-lever table).
13. Skips: win-count-up skip, cascade fast-forward, feature-transition skip allowed **after** outcome committed and only within the round's settled presentation; GB profile additionally never lets skips shorten the 2.5 s cycle floor or the initial result presentation (U2 conservative reading). Non-skippable: reality checks, regulatory messages, error states, max-win termination notice, feature-summary totals.
14. Equivalence test (already CONVENTIONS §9.2): same manifest ⇒ identical settlement in every speed/skip/reduced-motion mode; add automated test that runs one manifest through all modes and diffs final balance + event-derived totals.

### D4 — Autoplay (`autoplay.json`)
15. Availability: `autoplayAllowed=false` for GB, NL, DE, ON, and UNKNOWN. Where allowed: finite counts only from a preset list capped at **100** (legacy RTS 8 ceiling; use ≤ 60 for a Sweden-ready build), mandatory pre-selection of stake + rounds + (lossLimit OR singleWinLimit), immediate always-visible STOP, and on-screen remaining-round counter.
16. Mandatory stop triggers (all of prompt.txt 1384–1424): feature/super/ultimate trigger, win ≥ threshold, cumulative loss ≥ threshold, profit ≥ threshold, balance < threshold, insufficient balance, network error, game error, RG interruption, **reality check (blocks next round until acknowledged — RTS 13B)**, bet change, max win. No infinite mode, no wager queueing, no overlapping rounds.
17. Reality-check interaction: autoplay state machine must treat `realityCheckPending` as a blocking gate before `round_requested`.

### D5 — Reality checks & session HUD (client + `jurisdiction-policies.json`)
18. Persistent HUD (all profiles, not just GB): **elapsed session time** (updates ≥ 1/s, format h:mm:ss) and **net position** (Σwins − Σstakes since session start, account currency, signed). Visible in every state including features; never obscured by celebrations (ties to WCAG 2.4.11 layering rules).
19. Reality-check engine: configurable `intervalMinutes` with modes: `customer-set` (GB — expose setter UI hook, default = minimum of preset list), `fixed-60` (ES, DE), `customer-set-with-net-position` (SE). Dialog content: elapsed time (+ ES: cumulative deposits/stakes/winnings; SE: net position), buttons: `continue` (requires explicit acknowledgement), `exit session`, link to history. Blocks new stakes until acknowledged; allowed to defer only mid multi-state step.
20. DE profile: after each 60 min confirmation, enforce **5-minute lockout** before next spin (§22a(9)); render a countdown, keep balance visible, no game input.
21. Session semantics: session starts at first real-money play, ends at game exit; timers persist across reconnection (recovery must restore session clock, not reset it).

### D6 — Accessibility (`client-template` + `device-profiles.json` + validators)
22. Targets: all interactive elements ≥ **44×44 px** (exceeds WCAG 2.5.8's 24 px), ≥ 8 px spacing; spin button ≥ 64 px on touch.
23. Contrast: HUD text ≥ 4.5:1; icons/controls/focus ≥ 3:1; run automated contrast checks on the generated palette in validation.
24. Keyboard: full operation via Tab/Enter/Space (spin), +/− (bet), P (paytable), M (mute), Esc (close overlay); visible custom focus ring ≥ 3:1, never fully obscured; canvas mirrored by hidden focusable DOM controls; `aria-live="polite"` announcer for round results, feature entry, balance changes, reality checks (`assertive`).
25. No colour-only information: every symbol has a unique silhouette; win highlights = outline + brightness + shape marker; feature/multiplier states carry icons or text. CVD validation step: render symbol set through deuteranopia/protanopia/tritanopia simulation and assert pairwise distinguishability notes in the accessibility report.
26. No precision-timing or drag-only inputs anywhere; all choices single-tap with no timeout (feature picks wait indefinitely).
27. Photosensitivity budget (encode in `animation-events.json` validator): no event may cause > **3 luminance flashes (≥10% relative-luminance swing) per second** over more than the safe area; **zero saturated-red flashing** (skip the red-flash math by banning it); win celebrations use ramps/holds instead of strobes; document PEAT run over big-win/feature-entry captures in the validation report. Treat whole-canvas as the flash area (U7).
28. Reduced motion: every `anim.*` event ships a `reducedMotion` variant (CONVENTIONS §9.8) implementing replace-not-remove: reel spin → ≤300 ms cross-fade to final grid; camera shake/zoom/parallax → off; count-ups → shortened with final value flash-free; particles → static glow. Trigger = OS `prefers-reduced-motion` OR in-game toggle (settings persist). Information parity is a validator assertion: reduced-motion mode must emit the same textual/numeric results as full mode.
29. Audio accessibility: independent music/SFX/UI sliders + master mute; all critical feedback (win amount, feature entry, errors, reality check) has visual+text form with sound off (silent-safe manager per CONVENTIONS §8).
30. Cognitive: paytable always reachable in ≤ 2 interactions, pays shown as x-bet AND currency at current bet; rules in plain language; one stable HUD layout across states; no flashing/moving text for critical information.

### D7 — Rapid-input & round integrity
31. Debounce/single-flight: while state ∉ `ready`, spin inputs (pointer, touch, Space, Enter) are swallowed, not queued; at most one `round_requested` in flight; stop/skip inputs ignored until `outcome_committed`; repeated skip presses idempotent.
32. Reconnection/orientation/backgrounding/device-sleep: on resume, re-fetch committed manifest, seek presentation via `resumePointer`, restore session clock + reality-check timers, re-assert any pending RG lockout (DE break, reality check) before accepting input.

### D8 — Jurisdiction policy matrix (seed values for `jurisdiction-policies.json`)

| flag | GB | DE | SE | ES | NL | ON | UNKNOWN |
|---|---|---|---|---|---|---|---|
| autoplay | off | off | on (each round ≥3 s [S23]; ≤60 pending U3) | on (limits) | off | off | off |
| quick/turbo | off | off | verify | verify | off | off | off |
| slamStop | off | off | off | off | off | off | off |
| minRoundMs | 2500 | 5000 | 2500 [inferred] | 2500 [inferred] | 2500 [inferred] | 2500 | 5000 |
| ldwCelebration | banned | banned [inferred-safe] | banned [inferred-safe] | banned [inferred-safe] | banned [inferred-safe] | banned | banned |
| realityCheck | customer-set | fixed-60 + 5-min break | customer-set (time+net) | fixed-60 (full financials) | operator-side | operator-side (2.22 time-tracking) | fixed-60 |
| elapsed+netPosition HUD | required | required [inferred] | required | required | recommended | required (net CAD) | required |
| simultaneous play | banned | banned | banned [inferred] | — | — | banned | banned |
| maxStakePerSpin | — | €1 default; €3 (21+) / €5 (90-day qualified, monitored) since 2026-07-01 [S24] | player-set | — | — | — | conservative cap |

UNKNOWN = most restrictive union, per CONVENTIONS §9.6. Cells marked [inferred] are safe-side defaults, not verified statutory requirements — flag in compliance-review template.

### D9 — Validation hooks (feed `prompts/validation.md`)
33. Automated: LDW-celebration lint (D1.2), mode-equivalence diff (D3.14), flash-rate scan of animation timelines (D6.27), contrast checks (D6.23), forbidden-copy lint (D2.7–8), autoplay stop-trigger unit tests (D4.16), reality-check gating tests (D5.19, D7.32), target-size audit (D6.22).
34. Manual/report: PEAT capture analysis, CVD simulation review, keyboard-only playthrough, screen-reader smoke test (NVDA), reduced-motion parity playthrough — all logged in `accessibility-report` and `compliance-review.md`.
