# Jurisdiction-Specific Game-Design Rules for a Single Slot

- Generator: single-modern-slot-creator v1.0.0 — research dossier 05
- Domain: per-jurisdiction rules on autoplay, quick/turbo spin, minimum round duration,
  animation skip, bonus buy, max stakes, win presentation (LDW), net-position & session
  displays, reality checks
- Date compiled: 2026-08-08 (sources verified via web research, 2024–2026 preferred)
- Status: research input for the skill's `jurisdiction-policies.json` defaults.
  NOTHING in this file is legal advice; every real-money release requires
  jurisdiction-specific legal review (CONVENTIONS.md §9.9).

Tag legend: **[mandatory]** = binding regulatory/technical requirement in that
jurisdiction · **[recommended]** = regulator guidance or lab expectation ·
**[observed]** = consistent industry practice / secondary-source claim ·
**[inferred]** = my synthesis, reasoning stated.

---

## Findings

### 1. United Kingdom — Gambling Commission (UKGC), Remote Technical Standards (RTS)

The RTS is the single most detailed game-design rulebook affecting slots. The relevant
requirements were verified against the Commission's own published RTS 14 page [S1] and
the RTS explorer/consultation responses [S2][S3][S4].

**Minimum game-cycle duration — RTS 14D** [mandatory, UK]
- Exact rule: "It must be a minimum of **2.5 seconds** from the time a game is started
  until the next game cycle can be commenced. It must always be necessary to release
  and then depress the 'start button' or take equivalent action to commence a game
  cycle." [S1]
- Game cycle = from the start action until all stakes are lost / winnings available and
  the start control is available again. Holding a button continuously must NOT launch a
  new cycle — each spin needs an individual commitment. [S1]
- In force for slots since 31 October 2021. [S3]
- Non-slot casino games (excluding peer-to-peer poker) got their own **5-second**
  minimum under **RTS 14G**, effective 17 January 2025. [S1][S4]
- Enforcement is real: Stakelogic BV paid a £122,835 regulatory settlement (announced
  2026) after self-reporting that slots including "Tiger Temple 88" ran at an average
  cycle of **1.97 s** — below the 14D minimum. The breach was found with a stopwatch.
  [S5][S6]

**Turbo / quick spin / slam stop / animation skip — RTS 14E** [mandatory, UK]
- Exact rule: "The gambling system must not permit a customer to reduce the time until
  the result is presented." [S1]
- Guidance: "Features such as turbo, quick spin and slam stop are not permitted" — and
  the Commission states this list is **illustrative, not exhaustive**: any mechanic that
  shortens time-to-result is caught, regardless of whether the cycle would still exceed
  2.5 s. [S1][S2]
- Carve-outs: (a) does NOT apply to bonus/feature games that require no additional
  stake (so a "skip feature intro" button inside a free-spins round is permissible);
  (b) "scratch-all"/"reveal-all" features on instant-wins are allowed; (c) games where
  inaction forfeits the stake (crash games) are exempt. [S1]
- Design consequence [inferred]: a UK-compliant client may skip *presentation* inside a
  no-extra-stake bonus, but must never let win count-ups, reel stops, or anticipation
  cuts shorten the 2.5 s base game cycle. This matches CONVENTIONS.md §9.2 (skip alters
  presentation only) but adds a hard floor on cycle time.

**Autoplay — RTS 8 / 8A** [mandatory, UK]
- "The gambling system must require a customer to commit to each game cycle
  individually" — autoplay is not permitted for online gaming. Sole carve-out:
  automatic blind posting in peer-to-peer poker. [S2]
- Banned for online slots from 31 October 2021; the January 2025 game-design package
  widened the prohibition from slots to **all online gaming products**. [S3][S4]

**Win presentation / losses disguised as wins — RTS 14F** [mandatory, UK]
- Exact rule: "The gambling system must not celebrate a return which is **less than or
  equal to** the total stake gambled." [S1]
- "Celebrate" = win-associated audio/visual effects. Permitted result communication:
  display the amount awarded, briefly show winning lines, use a short neutral sound for
  result/balance transfer. [S1]
- [inferred] This maps directly to CONVENTIONS.md §9.5 ("LDW never celebrated above
  small tier") but the UK rule is stricter than "small tier": returns ≤ stake get NO
  celebratory effects at all in a UK build.

**Simultaneous play — RTS 14C** [mandatory, UK]
- No functionality that facilitates playing multiple (slot) games at the same time; no
  split-screen/multi-screen. Wording updated 12 January 2026 to refer to slot games.
  [S1]

**Bonus buy / feature buy** [mandatory in effect, UK]
- There is no explicit "no bonus buy" RTS clause. The UKGC's 2019 enforcement position
  is that feature buy-ins breach **RTS 14A** ("products must not actively encourage
  customers to chase their losses, increase their stake or increase the amount they
  have decided to gamble") and raised RTS 3A rules-disclosure issues; all six operators
  contacted in 2019 removed the feature, and UK builds of international titles ship
  with bonus buy stripped. [S7][S8]
- Ante-bet style "enhanced chance" toggles (e.g. +25% stake for doubled scatter odds)
  are **currently observed live** on UK sites as the replacement for bonus buy
  [observed], but they sit close to the same 14A language — treat as a legal-review
  item, not a safe default. [S7]
- Note the new stake caps below make large bonus-buy prices arithmetically impossible
  in the UK anyway [inferred].

**Maximum stakes** [mandatory, UK]
- The Gambling Act 2005 (Operating Licence Conditions) (Amendment) Regulations 2025
  added a licence condition: for an online slots game, the total amount staked in any
  game cycle may not exceed **£5** (player aged 25+, from **9 April 2025**) and **£2**
  (player aged 18–24, from **21 May 2025**). Applies to all remote casino operators.
  [S9][S10]
- [inferred] Because the limit is per *game cycle* and age-dependent, the game client
  must accept an operator/RGS-supplied `maxStakeMinor` override per session — a static
  in-game bet ladder is insufficient.

**Net position & session displays — RTS 2E, RTS 13C** [mandatory, UK]
- RTS 2E: "All gaming sessions must clearly display a customer's net position, in the
  currency of their account" — net position = total winnings minus total losses since
  session start. [S2][S11]
- RTS 13C: "The elapsed time should be displayed for the duration of the gaming
  session", starting at game-open or play-start, shown in seconds/minutes/hours.
  [S2][S11]
- Both applied to slots from 31 October 2021 and were extended to all casino products
  (except P2P poker) on 17 January 2025. [S4][S11]

**Reality checks — RTS 13B** [mandatory, UK]
- Customers must be able to set the frequency of reality checks; the check appears at
  the end of a game cycle, must be acknowledged before a new cycle (it blocks
  play), and must offer account-history access and session exit. [S2]

**2026 RTS changes (promo-adjacent, not spin mechanics)** [mandatory, UK]
- Wagering requirements attached to incentives (bonuses) capped at **10× the incentive
  amount** from **19 January 2026**; RTS 12B deposit/financial-limit clarifications
  effective **30 June 2026**. Neither touches game math, but any promo hooks or
  bonus-related copy surfaced through the game wrapper must respect them. [S51]
- **No 2026 formalisation of the bonus-buy prohibition exists**: verified as of
  2026-08 that the ban still rests on the Commission's 2019/2020 enforcement position
  under RTS 3A + 14A (January 2020 warning after finding six operators offering
  feature buy-ins priced up to £3,000; all removed the feature). Unlike the autoplay
  ban, there was never a consultation — the UKGC treated buys as a breach of existing
  standards. Claims of a "June 2026 formalisation" circulating in low-authority press
  were NOT substantiated. [S52][S7]

### 2. Germany — GGL under GlüStV 2021 (virtual slot machines, "virtuelle Automatenspiele")

- **Minimum round duration**: average game duration of **5 seconds** per spin,
  §22a(6) GlüStV 2021 [mandatory, DE]. Note the German rule is phrased as an *average*
  ("durchschnittlich"), unlike the UK's hard per-cycle floor — but implementations
  universally enforce ≥5 s per spin [observed]. [S12][S13]
- **Maximum stake — TIERED since 1 July 2026**: the statutory default remains **€1 per
  spin** (§22a(7) GlüStV 2021), but the GGL used its treaty powers to permit higher
  stakes from **2026-07-01**: players under 21 stay at €1; players 21+ may be offered
  up to **€3**; up to **€5** only for players showing no signs of harmful play over a
  **90-day qualification period**, with mandatory operator behavioural monitoring
  before and after the uplift. Operator opt-in per player; many titles remain capped
  at €1 pending provider updates. First use of the GGL's stake-adjustment power
  [mandatory, DE]. [S43][S44][S45]
- **Autoplay**: prohibited; turbo features prohibited [mandatory, DE]. [S12]
- **No jackpots** (progressive or otherwise) on virtual slots [mandatory, DE]. [S12]
- **Bonus buy**: no explicit clause found, but even at the 2026 tiered €1/€3/€5 caps a
  100x feature price cannot be purchased in one action; parallel-game and autoplay bans
  block the usual mechanic. Treat as prohibited-in-effect [inferred]. 
- **Deposit limit**: €1,000/month cross-operator (LUGAS monitoring), exceptions to
  €10k/€30k possible; OASIS national self-exclusion mandatory [mandatory, DE]. [S12]
- **Tax**: 5.3% of stakes (not GGR) — this is why German RTP profiles are typically
  reduced (~94% or lower) [observed]; the skill's selectable-RTP-profile requirement is
  driven largely by this market. [S12]
- **Currency of rules**: the tiered stake change landed ahead of the GlüStV 2021
  evaluation due end-2026 (channelisation stood at ~77% per GGL's 2025 market report);
  the 5 s average round duration is unchanged but flagged as a candidate for future GGL
  softening. Player-protection bodies (NRW Landesfachstelle Glücksspielsucht) publicly
  oppose the increase — communicated only via a GGL FAQ + decision guideline — so
  reversal/adjustment risk exists; re-verify at any DE release [observed]. [S43][S45][S46]

### 3. Sweden — Spelinspektionen

- **Minimum round duration**: at least **3 seconds** per game round on online slot
  machines ("tresekundersregeln"). Statutory anchor PINNED: the technical-requirements
  regulations **LIFS 2018:8** ("Varje spelomgång ska vara minst tre sekunder"), whose
  provision **explicitly also applies to autoplay functions**; re-issued as
  **SIFS 2022:3** (decided 2022-12-02, published 2022-12-16). Note LIFS 2018:2 §20 has
  a *different* 3-second rule (a message must show ≥3 s before an automatic choice is
  made) — do not confuse the two [mandatory, SE]. [S47][S48][S15]
- **Bonus restrictions**: only ONE welcome bonus per player lifetime per licensee
  (Gambling Act 2018:1138); no reloads/VIP/cashback [mandatory, SE]. A full bonus ban
  was under government debate through 2025 [observed]. [S15][S16]
- **Self-exclusion / RG**: Spelpaus national register; players must be offered
  immediate 24-hour self-exclusion from online casino/slots (SIFS 2022:3, 9 kap. 8 §);
  mandatory player-set deposit limits (day/month/year) [mandatory, SE]. [S14][S15]
- **Bonus buy**: frequently disabled on Swedish-licensed sites [observed]; no explicit
  national prohibition found — legal-review item. [S16]
- **Autoplay**: PERMITTED — but each automated round must respect the 3-second minimum
  (LIFS 2018:8 / SIFS 2022:3 state the round-duration rule "also applies to an autoplay
  function") [mandatory, SE]. A 2023 government/press push to ban autoplay was never
  enacted; instead, Spelinspektionen's **June 2026 draft** (replacing the 2018 rules)
  proposes a **60-round cap** on autoplay plus immediate-stop requirements —
  consultation closed ~2026-08-10, not yet in force [observed, pending]. [S47][S49]
- Land-based slot rules were re-issued as SIFS 2025:1 (in force 1 December 2025) with
  the regulator signalling "greater alignment between land-based and online gaming
  environments" — watch for online tightening [observed]. [S17]

### 4. Netherlands — Kansspelautoriteit (KSA), Wet/Besluit/Regeling Kansspelen op afstand (KOA)

- **Autoplay**: prohibited. Players must make a conscious, individual decision for
  each game; KSA enforcement actions in 2022 (slots "spin credit" autoplay) and 2025
  (roulette auto-rebet — letters sent to ALL licensees) [mandatory, NL]. [S18][S19]
- **Bonus buy**: prohibited. KSA treats a purchased batch of bonus spins that play out
  automatically as a form of autoplay, contrary to **art. 3.8 Regeling kansspelen op
  afstand** (player must be able to decide per individual game) [mandatory, NL].
  [S20]
- **Turbo/quick spin**: no explicit prohibition found [observed: turbo commonly
  available on NL-licensed slots]; legal-review item.
- **Coming changes** (announced 2025–2026): minimum age for online slots to rise from
  18 to **21**; unified cross-operator deposit/loss limits with affordability checks;
  KSA licensing-rule updates effective 1 January 2026 [observed, pending]. [S19][S21]
- **Session displays**: NL duty-of-care rules require session information and limit
  prompts; exact per-game HUD mandates (clock/net position) not verified in this pass
  [inferred from KOA duty-of-care structure — verify against Besluit KOA before NL
  release].

### 5. Spain — DGOJ (Law 13/2011; RD 176/2023 "safer gambling environments")

- **Minimum spin duration**: **3 seconds** for online slots per approved game rules
  (Orden HAP/1370/2014 framework; Chambers 2025 practice guide cites 3 s for online
  play) [observed→mandatory, ES — verify exact resolution clause in homologation].
  [S22]
- **Mandatory session configuration** (RD 176/2023, in force from 15 September 2023
  onward): before EVERY slots session the player must expressly set (a) max session
  time and (b) max spend for that session; no defaults carried over; configuration
  cannot be changed mid-session; session auto-terminates when a limit is exhausted
  (letting in-flight spins finish) [mandatory, ES]. [S23][S24]
- **Reality check**: a mandatory-read self-assessment message at least every **60
  minutes** of play [mandatory, ES]. [S23][S24]
- **Deposit limits**: RD 520/2026 (approved 23 June 2026) creates real-time
  cross-operator deposit tracking with default limits €700/day, €1,750/week, €3,300
  per 4 weeks [mandatory, ES — phasing in]. [S25]
- **Autoplay**: no confirmed Spanish autoplay ban found in this pass [observed:
  historically available]; legal-review item.
- RD 176/2023 also defines "intensive gambler" risk profiles (net loss €600 over 3
  consecutive weeks; €200 for under-25s) triggering credit-card bans and mandatory
  behavioural monitoring — platform-level, but the game must tolerate forced session
  termination [mandatory, ES]. [S23]

### 6. Italy — ADM (ex-AAMS)

- **Reality check**: periodic pop-ups during sessions are required; activity
  statements mandatory [mandatory, IT]. [S26]
- **Inactivity logout**: gaming systems must log the user out after **20 minutes** of
  inactivity and must restore prior game state on return [mandatory, IT]. [S26]
- **Deposit/wager limits**: mandatory at registration [mandatory, IT]. [S26]
- **Certification**: technical verification by an approved Organismo di Verifica under
  the March 2024 reorganisation decree; ADM updated its IT checklist for concessions
  in 2025 [mandatory, IT]. [S26][S27]
- **Minimum RTP**: **90%** for online fixed-odds games including slots — total RTP
  (including any second-phase/bonus games) must be ≥ 90% of net amounts collected;
  bingo floor is 70%. Verified via eCOGRA's Italy market compliance overview; the 90%
  floor dates from the 2012 online-slots market opening. Land-based floors differ
  (AWP bar slots 65%, VLT 83%) — do not conflate. Only theoretical RTP appears in the
  game certificate; integration testing follows core certification before ADM go-live
  [mandatory, IT]. [S50]
- Autoplay/turbo/bonus buy: no explicit prohibitions surfaced [observed: bonus buy
  availability in IT varies by operator]; legal-review item.

### 7. Denmark — Spillemyndigheden

- Technical Requirements for online casino v2.x: SAFE data-warehouse reporting with
  Tamper Token security, DGA online access to latest 12 months of game data + 48
  months on readable media, certification programme (approved labs), MitID identity
  assurance "substantial"+ [mandatory, DK]. [S28]
- ROFUS national self-exclusion (24 h / 1 / 3 / 6 months / permanent) integration
  required [mandatory, DK]. [S28]
- **No slot spin-speed, autoplay, turbo, or bonus-buy prohibition found** [observed —
  Denmark regulates via data/certification rather than game-design micro-rules].
  Deposit-limit setting is mandatory at account level [observed]. Legal-review item
  for game-level specifics.

### 8. Belgium — Kansspelcommissie / Gaming Commission

- **Minimum age 21** for ALL gambling incl. online slots, from 1 September 2024 (Law
  of 18 February 2024; Royal Decree of 12 August 2024) [mandatory, BE]. [S29]
- **Bonuses banned** entirely for online games of chance (2024 reform) [mandatory,
  BE]. [S29]
- **Vertical separation**: casino games, slots (B+), and betting may not be offered on
  the same website or shared player account [mandatory, BE]. [S29]
- **Deposit limit**: €200/week default per operator since 20 October 2022 (raisable
  only after checks) [mandatory, BE]. [S30]
- **Loss-rate math caps**: land-based machines are approved against *average hourly
  loss* ceilings (arcade machines €25/h; casino ~€70/h; betting-shop machines
  €12.50/h averaged over >200,000 games). The government has statutory power to cap
  online stakes/losses/wins but **has never used it** — online framework remains
  fragmentary [mandatory for land-based math; observed gap online]. [S30][S31]
- Autoplay observed available with controls on BE-licensed sites [observed]. Bingoal
  class B+ game approvals still require Gaming Commission model approval per game
  [mandatory, BE]. [S31]
- [inferred] For a Belgian online slot, labs may ask for an hourly-loss simulation at
  min-cycle speed; the math package should be able to output avg loss/hour at a given
  spin cadence.

### 9. Ontario, Canada — AGCO Registrar's Standards for Internet Gaming

Verified directly against the AGCO standards text [S32]. Ontario copied the UK package
almost verbatim (market launch 4 April 2022):

- **Std 2.16 (Req 2)**: "Games shall not provide auto-play features for slots"
  [mandatory, ON-CA].
- **Std 2.17**: no functionality facilitating multiple slots games simultaneously
  (split/multi-screen ban) [mandatory, ON-CA].
- **Std 2.18**: minimum **2.5 seconds** per game cycle; release-and-re-press start for
  every cycle; held button must not start a new game [mandatory, ON-CA].
- **Std 2.19**: system must not permit reducing time-to-result; "turbo, quick spin and
  slam stop are not permitted" (illustrative list); bonus/feature games with no extra
  stake exempt [mandatory, ON-CA].
- **Std 2.20**: win-associated audio/visual effects banned for returns ≤ last total
  amount wagered (LDW ban) [mandatory, ON-CA].
- **Std 2.21**: net position (total winnings − total losses since session start)
  displayed in **Canadian dollars, not credits** [mandatory, ON-CA].
- **Std 2.22**: players must have means to track passage of time [mandatory, ON-CA].
- **Std 2.15**: no unachievable displays, **no near-miss substitution** after outcome
  selection, demo/free-play odds identical to real play [mandatory, ON-CA].
- **Std 4.05/4.06**: per-game specs must document odds of winning per prize and
  operator advantage; player-facing rules must explain odds/RTP understandably before
  wagering [mandatory, ON-CA].
- **Bonus buy**: not addressed in the standards text; industry sources report bonus
  buy is not available on Ontario-licensed casinos [observed — treat as prohibited by
  default, legal-review item]. [S8][S32]
- Limit-setting: deposit/loss limits with 24-hour cooling-off before increases; breaks
  in play from one day to three months (Std 2.13, 2.23–2.24) [mandatory, ON-CA]. [S32]

### 10. United States (NJ, MI, PA) — state-by-state, generally feature-permissive

- **New Jersey (DGE, N.J.A.C. 13:69E)**: minimum theoretical RTP **83%**; max odds of
  any advertised win 100,000,000:1; "malfunction voids all pays" language required;
  free-game/re-spin counters must display remaining games; auto-pick features must be
  disclosed, and where RTP assumes optimal play the auto-pick must pick the highest-RTP
  choice or select unbiasedly [mandatory, US-NJ]. Autoplay itself is available on NJ
  online casinos [observed]. [S33]
- **Michigan (MGCB)**: R 432.633 adopts **GLI-19 v3.0** as the binding technical
  standard for internet games; all games require lab evaluation + written board
  approval before offer [mandatory, US-MI]. [S34]
- **Pennsylvania (PGCB)**: 58 Pa. Code Subpart L (interactive gaming), chapters 809a
  (platform) and 810a (testing/controls); slots simulations are one of three
  authorized interactive categories; lab testing per §461a.4(g) [mandatory, US-PA].
  [S35]
- [observed] No US state in scope bans turbo spin or imposes a minimum spin duration;
  autoplay is broadly permitted; bonus buy is generally *not offered* in US regulated
  markets (supplier practice + game-approval friction) — treat bonusBuy=false as the
  US default with per-state legal review.
- **GLI-19 v3.0** (revision date 2020-07-17, released 2020-07-20 — the "2024-06" in
  the hosting URL is an upload path, not a revision date; v3.0 remains current as of
  2026-08) is the baseline lab standard: Chapter 4 game requirements cover RNG use,
  game fairness, interrupted-game recovery, and display accuracy; it aligns game
  requirements with GLI-11 [mandatory where adopted]. [S36]

### 11. Malta — MGA (baseline "export" jurisdiction)

- **Player Protection Directive (Directive 2 of 2018, v3 January 2023)**: operators
  must offer deposit OR wagering limits and player-set **reality checks**; the reality
  check must state time played, amount wagered, wins/losses, plus (since the 2023
  amendment, deadline 12 January 2024) a stay-in-control reminder; it must persist
  until acknowledged [mandatory, MT]. [S37][S38]
- **Autoplay**: permitted, but games with auto-spin must offer a pop-up to set alerts
  at intervals [mandatory-conditional, MT]. [S37]
- **Minimum RTP**: **85%** (lowered from 92% in May 2021, Article 22 of the
  Directive) [mandatory, MT]. [S39]
- **Demo parity**: demo/free-play RTP and technical conditions must equal the
  real-money game [mandatory, MT]. [S37]
- **Gambling history**: players must be able to access 6 months of history (wins,
  losses, deposits, withdrawals) [mandatory, MT]. [S38]
- Turbo, quick spin, bonus buy, enhanced chance: all **permitted** under MGA rules
  [observed] — MGA is the permissive baseline against which restrictive markets are
  configured. 2025 mystery-shopping found widespread reality-check content
  deficiencies, so expect enforcement attention on RC content [observed]. [S40]

### 12. Curaçao — CGA under the LOK

- LOK (Landsverordening op de Kansspelen) passed 17 December 2024, in force 24
  December 2024; master/sub-licence system abolished (subs expired January 2025; NOOGH
  transition until 24 June 2025 + extension; portal seals retired 15 October 2025;
  local-substance requirements from 1 January 2026) [mandatory, CW]. [S41][S42]
- Licence split: B2C (operators) / B2B (suppliers — a slot studio supplying CW
  operators needs B2B); fees ≈ €4,592 application + €47,450/yr B2C [mandatory, CW].
  [S41]
- RG obligations: self-exclusion, no credit to players, addiction-prevention
  reporting, RNG/software certification by CGA-approved lab (e.g. GLI), CGA seal
  display, ADR provider [mandatory, CW]. [S42]
- **No game-design micro-rules** (no spin-speed floor, autoplay/turbo/bonus-buy bans)
  in the LOK regime as of this research [observed] — Curaçao regulates the entity, not
  the reel timing. Feature-permissive default. 

### 13. Cross-cutting: animation skip, enhanced chance, RTP display

- **Animation skip**: no jurisdiction bans skipping *pure presentation* that does not
  shorten the regulated game cycle. UK/Ontario carve-outs explicitly allow skip inside
  no-extra-stake bonus games [S1][S32]. The safe universal rule [inferred]: skip may
  compress presentation only down to the jurisdiction's `minimumRoundDurationMs`
  floor; win amounts and end-state are unchanged (matches CONVENTIONS.md §7, §9.2).
- **Enhanced chance / ante bet**: only the UK has regulator language (RTS 14A) close
  enough to threaten it, and it survives there today [observed]; Germany's €1 cap
  effectively blocks meaningful ante multipliers [inferred]; everywhere else it is a
  commercial choice. Because the UKGC calls its prohibited-features lists
  non-exhaustive, default enhanced-chance OFF in UK/ON [recommended].
- **RTP display**: UK expects RTP in game rules (RTS 3A rules-disclosure); Ontario
  Std 4.06 requires understandable odds/RTP info before wagering [mandatory, ON-CA];
  MGA requires validated RTP publicly displayed [observed→recommended, MT]; NJ fixes a
  floor (83%) rather than a display duty [S33]. Ship RTP in the paytable/help in ALL
  jurisdictions [recommended].
- **Selectable RTP profiles**: driven by German stake tax (~94%), operator
  commercial tiers (MGA floor 85%, NJ floor 83%); each profile must be separately
  certified and the active profile disclosed in help [observed industry practice;
  mandatory certification implication]. [S39][S33]

---

## Source register

| id | name | type | pub/revision | jurisdiction | URL | supports |
|----|------|------|--------------|--------------|-----|----------|
| S1 | UKGC RTS 14 "Responsible product design" (official standard page) | regulator | current (12 Jan 2026 wording update noted) | UK | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | 14A–14G exact wording: 2.5 s cycle, turbo/slam ban, LDW ban, 5 s non-slots |
| S2 | gamingcompliance.io UKGC RTS explorer | industry-press (editorial summary of RTS) | compiled 2026-04-17 | UK | https://gamingcompliance.io/ukgc/remote-technical-standards/ | RTS 8A autoplay, 13A–13C reality check/elapsed time, 2E net position |
| S3 | UKGC consultation response: Online games design & reverse withdrawals | regulator | 2021 | UK | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/summary-of-responses-introducing-speed-of-play-limits | 2021 package rationale; speed-of-play, autoplay, spin-stop bans |
| S4 | Wiggin LLP: "Remote game design changes taking effect 17 January 2025" | law-firm brief | 2024-12 | UK | https://www.wiggin.co.uk/insight/remote-game-design-changes-taking-effect-17-january-2025/ | RTS 14G 5 s, extension of autoplay/net-position/elapsed-time to all casino |
| S5 | intergameonline: Stakelogic penalty, stopwatch spin-speed test | industry-press | 2026 | UK | https://www.intergameonline.com/igaming/news/stakelogic-penalty-gambling-commission-stopwatch-test-slot-spin-speed | RTS 14D enforcement, 1.97 s Tiger Temple 88, £122,835 |
| S6 | UKGC regulatory decisions / speed-of-play proposal 2 | regulator | current | UK | https://www.gamblingcommission.gov.uk/guidance/regulatory-decisions-procedures-and-guidance-for-regulatory-hearings/proposal-2-speed-of-play | speed-of-play enforcement framework |
| S7 | CMS law: "Gambling Commission calls for Feature Buy-Ins to be removed" | law-firm brief | 2020-01 | UK | https://cms.law/en/gbr/legal-updates/Gambling-Commission-calls-for-Feature-Buy-Ins-to-be-removed | 2019 bonus-buy removal, RTS 14A/3A basis |
| S8 | CasinoGrounds: bonus buy UK/ON regulation overview | industry blog | 2024–2026 | UK/ON/NL | https://casinogrounds.com/blog/bonus-buy-slots-regulations-in-uk/ | bonus buy status UK/Ontario/NL/MGA [observed-grade] |
| S9 | Poppleston Allen: online slots stake-limit regulations April 2025 | law-firm brief | 2025 | UK | https://www.popall.co.uk/news-publications/news/new-regulations-made-governing-online-slots-stake-limits-take-effect-from-early-april-2025 | SI wording £5 / £2, effective 9 Apr / 21 May 2025 |
| S10 | UK Gov: "New £2 maximum stake for under 25s playing online slots" | government | 2025 | UK | https://gov.uk/government/news/new-2-maximum-stake-for-under-25s-playing-online-slots | £2 under-25 limit, dates, rationale |
| S11 | UKGC RTS 13 time requirements & reality checks (official) | regulator | current | UK | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-13-time-requirements-and-reality-checks | 13B/13C exact wording |
| S12 | ICLG Gambling Laws & Regulations 2026 — Germany | legal guide | 2026 | DE | https://iclg.com/practice-areas/gambling-laws-and-regulations/germany | §22a(6) 5 s avg, §22a(7) €1, autoplay/jackpot bans, LUGAS/OASIS, 5.3% tax |
| S13 | BrightSideOfNews: "Germany GGL Online Slots Review" | industry-press | 2026 | DE | https://brightsideofnews.com/gambling/germany-ggl-online-slots-review-2026/ | 2026 GGL review of €1 stake, €2–5 proposal, 2027 timeline |
| S14 | Spelinspektionen (official site, onlinekasino pages) | regulator | current | SE | https://www.spelinspektionen.se/spelare/spelform/onlinekasino/ | SE licensing framework, LIFS/SIFS structure |
| S15 | BoEkonomi: "Tresekundersregeln" explainer + LIFS/SIFS refs | industry blog | 2024–2025 | SE | https://www.boekonomi.se/okategoriserat/tresekundersregeln-varfor-kanns-svenska-slots-annorlunda/ | 3 s rule for SE online slots [observed-grade] |
| S16 | EuropeanGaming: "Sweden's Single Bonus Rule / bonus debate" | industry-press | 2025-10 | SE | https://europeangaming.eu/portal/latest-news/2025/10/07/193266/swedens-bonus-debate-and-the-push-for-stronger-licensing-reforms/ | one-bonus rule, proposed full bonus ban, channelization 72–82% |
| S17 | iGamingToday: "Sweden reshapes slot machine rules ahead of 2026 reforms" (SIFS 2025:1) | industry-press | 2025 | SE | https://www.igamingtoday.com/sweden-slot-machine-hospitality-rules-2025/ | SIFS 2025:1, land/online alignment signal |
| S18 | KSA autoplay enforcement (GamblingInsider, 2025 roulette case) | industry-press | 2025-03 | NL | https://www.gamblinginsider.com/news/28597/ksa-cracks-down-on-online-gambling-autoplay-in-the-netherlands | NL autoplay ban + enforcement, letters to all licensees |
| S19 | ICLG Gambling Laws & Regulations 2026 — Netherlands | legal guide | 2026 | NL | https://iclg.com/practice-areas/gambling-laws-and-regulations/netherlands/ | KOA framework, CRUKS, age-21 slots proposal, 2026 licensing changes |
| S20 | intikkertje.nl: "Bonus Buy is verboden in Nederland" | industry blog (NL) | 2024 | NL | https://intikkertje.nl/bonus-buy-verboden-in-nederland/ | art. 3.8 Regeling KOA basis for bonus-buy=autoplay |
| S21 | GamblingInsider: KSA new licence-application rules from 2026 | industry-press | 2025 | NL | https://www.gamblinginsider.com/news/30998/ksa-introduces-new-rules-for-online-gambling-licence-applications-from-2026 | 2026 licensing cycle |
| S22 | Chambers Gaming Law 2025 — Spain | legal guide | 2025 | ES | https://practiceguides.chambers.com/practice-guides/gaming-law-2025/spain | 3 s online slot spin duration, licence structure |
| S23 | ECIJA legal memo: Royal Decree 176/2023 Safer Gambling Environments | law-firm brief | 2023 | ES | https://www.ecija.com/en/news-and-insights/legal-memo-on-the-new-royal-decree-176-2023-on-safer-gambling-environments/ | session pre-configuration, 60-min messages, risk profiles |
| S24 | BOE-A-2023-6735 Real Decreto 176/2023 (official gazette) | regulator/statute | 2023-03-14 | ES | https://www.boe.es/buscar/doc.php?id=BOE-A-2023-6735 | primary text of RD 176/2023 |
| S25 | BettorsInsider: Spain RD 520/2026 cross-operator deposit limits | industry-press | 2026-06 | ES | https://bettorsinsider.com/sports-betting/2026/06/29/spain-sets-cross-operator-deposit-limits-for-online-gambling-under-new-royal-decree/ | €700/day, €1,750/wk, €3,300/4wk defaults |
| S26 | Mondaq: "iGaming in Italy: rules and regulations" | law-firm brief | 2025 | IT | https://www.mondaq.com/italy/gaming/1657022/igaming-in-italy-rules-and-regulations | reality checks, 20-min inactivity logout + state restore, limits |
| S27 | PlayerProtectionHub: ADM updates IT checklist for concessions | industry-press | 2025-04 | IT | https://playerprotectionhub.com/2025/04/adm-updates-italian-it-checklist-for-gambling-concessions/ | Organismo di Verifica / 2024 decree verification regime |
| S28 | Spillemyndigheden: Technical requirements online casino & betting v2.3 | regulator | 2021 (v2.3, current line) | DK | https://www.spillemyndigheden.dk/uploads/2021-04/Technical%20requirements%20%20online%20casino%20and%20betting%202.3%20-%20WT.pdf | SAFE/Tamper Token, data retention, certification |
| S29 | iGB: "Belgium implements new rules banning all under-21s" + Bird & Bird update | industry-press / law-firm | 2024 | BE | https://igamingbusiness.com/legal-compliance/licensing/belgium-implements-new-rules-banning-all-under-21s-from-gambling/ | age 21 (1 Sep 2024), bonus ban, vertical separation |
| S30 | SBC News: Belgium €200 loss/deposit limit; gamblingclub.be deposit-limit explainer | industry-press | 2022–2024 | BE | https://sbcnews.co.uk/europe/2022/10/24/belgium-loss-limit/ | €200 weekly deposit limit since 20 Oct 2022 |
| S31 | ICLG Gambling Laws & Regulations 2026 — Belgium | legal guide | 2026 | BE | https://iclg.com/practice-areas/gambling-laws-and-regulations/belgium/ | hourly-loss averages, unused online stake-cap power, licence classes |
| S32 | AGCO Registrar's Standards for Internet Gaming (official full text) | regulator | current (amended to 2024) | ON-CA | https://www.agco.ca/en/book/export/html/245361 | Std 2.15–2.24, 4.05–4.06 exact text |
| S33 | N.J.A.C. 13:69E-1.28A (Justia mirror of NJ Administrative Code) | statute/regulation | current | US-NJ | https://regulations.justia.com/states/new-jersey/title-13/chapter-69e/subchapter-1/section-13-69e-1-28a | 83% min RTP, odds cap, auto-pick, display rules |
| S34 | MGCB technical bulletins / internet gaming standards pages | regulator | current | US-MI | https://www.michigan.gov/mgcb/internet-gaming-and-fantasy-contests/technical-bulletins-and-memos | GLI-19 v3.0 adoption via R 432.633 |
| S35 | 58 Pa. Code Subpart L — Interactive Gaming (official) | statute/regulation | current | US-PA | https://www.pacodeandbulletin.gov/Display/pacode?file=%2Fsecure%2Fpacode%2Fdata%2F058%2FsubpartVIILtoc.html | PA interactive gaming chapters 809a/810a |
| S36 | GLI-19 Standards for Interactive Gaming Systems v3.0 (official PDF) | standard | 2020-07-17 (PDF hosted at 2024-06 upload path) | multi | https://gaminglabs.com/wp-content/uploads/2024/06/GLI-19-Interactive-Gaming-Systems-v3.0.pdf | lab baseline: RNG, game requirements chapters |
| S43 | iGB — Germany raises online slot stake limits, operators to track player behaviours | industry-press | 2026-07 | DE | https://igamingbusiness.com/legal-compliance/regulation/germany-raises-online-slot-stake-limits-operators-to-track-player-behaviours/ | tiered €1/€3/€5 stakes from 2026-07-01, behavioural tracking duty |
| S44 | GGL — FAQ zur Erhöhung des Einsatzlimits / Einzahlungslimit und Einsatzlimit bei Online-Glücksspielen | regulator | 2026 | DE | https://www.gluecksspiel-behoerde.de/de/news/haeufig-gestellte-fragen-faq-zur-erhoehung-des-anbieteruebergreifenden-einzahlungslimits-bei-online-gluecksspielen-und-die-pruefung-der-wirtschaftlichen-leistungsfaehigkeit | GGL FAQ: qualification criteria, operator opt-in mechanics |
| S45 | CasinoGuardian — Germany implements tiered stake system for online slot machines | industry-press | 2026-07-10 | DE | https://www.casinoguardian.co.uk/2026/07/10/germany-implements-tiered-stake-system-for-online-slot-machines/ | under-21 €1, 21+ €3, €5 after 90-day no-harm qualification |
| S46 | Landesfachstelle Glücksspielsucht NRW — Erhöhung des Einsatzlimits: gravierende Risiken | state addiction body | 2026 | DE | https://gluecksspielsucht-nrw.de/news/erhoehung-des-einsatzlimits-bei-virtuellen-automatenspielen-landesfachstelle-sieht-gravierende-risiken-fuer-spielerschutz/ | criticism of the uplift, FAQ-only communication, reversal-risk context |
| S47 | LIFS 2018:8 — Lotteriinspektionens föreskrifter om tekniska krav (full text, lagen.nu) | regulator/statute | 2018 (superseded by SIFS 2022:3) | SE | https://lagen.nu/lifs/2018:8 | "Varje spelomgång ska vara minst tre sekunder", provision applies to autoplay |
| S48 | SIFS 2022:3 — Spelinspektionens föreskrifter om tekniska krav samt ackreditering | regulator | decided 2022-12-02, published 2022-12-16 | SE | https://www.spelinspektionen.se/lagar--villkor/foreskrifter/ | successor to LIFS 2018:8, technical requirements incl. round duration |
| S49 | Focus Gaming News — Spelinspektionen proposes new binding regulations to replace the 2018 rules | industry-press | 2026-06 | SE | https://focusgn.com/spelinspektionen-proposes-new-binding-regulations-to-replace-the-2018-rules | 2026 draft: 60-round autoplay cap, immediate stop, idle logout |
| S50 | eCOGRA — iGaming insights: Italy online gambling market | test-lab compliance overview | 2024–2026 | IT | https://ecogra.org/igaming/igaming-insights-italy-online-gambling-market/ | 90% RTP floor for online fixed-odds incl. slots, 70% bingo, ADM certification flow |
| S51 | FTI Consulting — Gambling Compliance 2026: Are You Keeping Up | advisory | 2026 | UK | https://www.fticonsulting.com/insights/articles/gambling-compliance-2026-are-you-keeping-up | 10× wagering-requirement cap from 2026-01-19, RTS 12B changes 2026-06-30 |
| S52 | CasinoBeats — UKGC issues slots 'feature buy-in' warning to operators | industry-press | 2020-01-17 | UK | https://casinobeats.com/2020/01/17/ukgc-issues-slots-feature-buy-in-warning-to-operators/ | RTS 3A + 14A basis for buy ban, six operators, £3,000 buy-ins |
| S37 | MGA Directive 2 of 2018 — Player Protection Directive v3 (official PDF) | regulator | 2023-01 (v3) | MT | https://www.mga.org.mt/app/uploads/Directive-2-of-2018-Player-Protection-Directive.pdf | reality-check content, auto-spin alert pop-up, limits |
| S38 | Mondaq: "Updates to the Player Protection Directive" | law-firm brief | 2023 | MT | https://www.mondaq.com/gaming/1273866/updates-to-the-player-protection-directive | 2023 amendments, 12 Jan 2024 deadline, 6-month history |
| S39 | EuropeanGaming/Yogonet: MGA lowers minimum RTP 92%→85% | industry-press | 2021-05 | MT | https://europeangaming.eu/portal/compliance-updates/2021/05/31/93389/malta-gaming-authority-lowers-rtp/ | Article 22 min RTP 85% |
| S40 | CasinoGuardian: MGA mystery-shopper player-protection gaps | industry-press | 2026-02 | MT | https://www.casinoguardian.co.uk/2026/02/18/malta-gaming-authority-unveils-hidden-gaps-in-gambling-site-player-protections/ | RC content enforcement attention |
| S41 | Coincub / Zitadelle: Curaçao LOK regime guides | industry advisory | 2025–2026 | CW | https://coincub.com/blog/curacao-gaming-license/ | LOK dates, licence split, fees, transition milestones |
| S42 | Curaçao Gaming Authority (CGA) online-gaming portal | regulator | current | CW | https://www.cga.cw/regulation/online-gaming | CGA licensing/RG requirements |

Reliability note: S1, S11, S24, S28, S32, S33, S35, S36, S37, S42 are primary
(regulator/statute/standard). S2, S8, S15, S20 are secondary; claims resting only on
them are tagged [observed] and appear in the legal-review list.

---

## Uncertainties & legal-review items

1. **Sweden 3-second rule** — RESOLVED (2026-08 pass): anchored in LIFS 2018:8
   technical requirements (now SIFS 2022:3), explicitly covering autoplay rounds
   [S47][S48]. Residual item: quote the exact SIFS 2022:3 section number from the
   primary PDF in any SE compliance doc.
2. **Sweden & bonus buy**: widely disabled on SE sites; no confirmed written ban.
   Also track the June 2026 Spelinspektionen draft (60-round autoplay cap) through
   to adoption [S49].
3. **Netherlands turbo/quick spin**: autoplay and bonus buy bans are confirmed
   (art. 3.8 Regeling KOA); turbo appears tolerated. Confirm with a Dutch lab whether
   turbo counts as "reducing deliberate decision" — KSA's expansive 2025 autoplay
   reading (roulette auto-rebet) suggests conservatism. [S18][S20]
4. **Netherlands HUD mandates**: exact per-game clock/net-position display duties
   under Besluit KOA not verified — [inferred] from duty-of-care structure only.
5. **Spain autoplay**: no confirmed ban; RD 176/2023 session mechanics dominate. The
   game must expose hooks for forced mid-session termination when platform limits hit.
6. **Spain 3-second citation**: 3 s for online slots is from a Chambers practice guide;
   the underlying DGOJ resolution/homologation clause should be quoted in the
   compliance review of any ES release. [S22]
7. **Italy minimum RTP 90%** — RESOLVED (2026-08 pass): verified at 90% for online
   fixed-odds games incl. slots [S50]. Residual item: verify current ADM reality-check
   interval numbers and cite the underlying decreto in any IT compliance doc.
8. **Ontario bonus buy**: prohibition is industry-observed, not visible as an explicit
   AGCO standard in the exported text; AGCO may treat it under 2.16 (impulsive play).
   Needs confirmation from AGCO guidance or an Ontario lab. [S8][S32]
9. **Germany bonus buy**: prohibited-in-effect via the stake caps (tiered €1/€3/€5
   since 2026-07-01 — still far below any 100x buy price) and the autoplay ban
   [inferred]; no explicit §22a clause names it.
10. **UK enhanced-chance / ante-bet**: live today but sits near RTS 14A language the
    UKGC used against bonus buy in 2019; a future clarification could catch it.
11. **UK 12 Jan 2026 RTS wording update** (14C now says "slot games"): fetch the
    full current RTS PDF at build time; this dossier reflects the page as of Aug 2026.
12. **Germany stake tiers** — SUPERSEDED (2026-08 pass): the GGL implemented the
    tiered €1/€3/€5 system on 2026-07-01 [S43][S45]; the earlier "recommendation early
    2027" timeline [S13] is obsolete. Residual items: confirm the GGL decision
    guideline's exact qualification criteria from the primary FAQ [S44] before any DE
    release; monitor the end-2026 GlüStV evaluation and the NRW-led opposition for
    reversal risk [S46].
13. **Belgium constitutional challenges** to the 2024 reforms were pending (ruling
    expected late 2025/early 2026); confirm outcome before a BE release. [S31]
14. **Curaçao**: regime is new and moving; verify current CGA game-certification
    expectations (approved labs list) at release time. [S41][S42]
15. **US autoplay per state**: NJ/MI/PA allow autoplay today [observed]; each state's
    lab submission checklist should be pulled fresh (state bulletins change quietly).

---

## Design implications for the Skill

### D1. Per-jurisdiction feature-flag table (encode as `jurisdiction-policies.json` defaults)

Values below are research-backed defaults, NOT legal conclusions (prompt.txt §11).
`minimumRoundDurationMs` = enforced floor from spin start to next spin availability.
`maxStakeMinor` in the account currency's minor units; `null` = no regulatory cap
(operator/game config governs).

| policyId | autoplay | quickSpin | turboSpin | slamStop/animSkip base game | bonusBuy | enhancedChance | minRoundMs | maxStake | LDW celebration | netPosition display | elapsedTime display | realityCheck | showRtp |
|----------|----------|-----------|-----------|------------------------------|----------|----------------|-----------|----------|-----------------|--------------------|--------------------|--------------|---------|
| `gb-ukgc` | ❌ RTS 8A | ❌ 14E | ❌ 14E | ❌ 14E (skip ok inside no-stake bonus) | ❌ (14A position) | ⚠️ off by default | 2500 | £5/spin (25+), £2 (18–24) — session-level override required | ❌ banned ≤ stake (14F) | ✅ 2E (account currency) | ✅ 13C (h/m/s) | player-set, blocking (13B) | ✅ in rules (3A) |
| `de-ggl` | ❌ §22a | ❌ | ❌ | ❌ (5 s avg floor) | ❌ [inferred] | ❌ [inferred] | 5000 | €1 default; €3 (21+) / €5 (90-day qualified, monitored) since 2026-07-01 — session-level override required | ⚠️ no explicit rule; apply ban | ⚠️ recommended | ⚠️ recommended | operator-level (LUGAS/OASIS) | ✅ recommended |
| `se-spel` | ✅ allowed; each auto round ≥3 s (LIFS 2018:8/SIFS 2022:3); 2026 draft: ≤60 rounds | ❌ (3 s floor) | ❌ (3 s floor) | ⚠️ skip to 3 s floor | ⚠️ default off [observed] | ⚠️ default off | 3000 | null | ⚠️ apply ban as default | ✅ recommended | ✅ recommended | mandatory limits + 24 h instant exclusion | ✅ recommended |
| `nl-ksa` | ❌ (KOA) | ⚠️ verify | ⚠️ verify | ⚠️ verify | ❌ (art. 3.8 Regeling KOA) | ⚠️ default off | null (none found) | null | ⚠️ apply ban as default | ✅ recommended | ✅ recommended | duty-of-care prompts | ✅ recommended |
| `es-dgoj` | ⚠️ verify | ❌ (3 s floor) | ❌ (3 s floor) | ⚠️ skip to 3 s floor | ⚠️ default off | ⚠️ default off | 3000 | null | ⚠️ default off | ✅ session spend shown (RD 176/2023) | ✅ session timer mandatory | mandatory 60-min forced-read + pre-session limit config | ✅ recommended |
| `it-adm` | ⚠️ verify | ✅ | ✅ | ✅ | ⚠️ varies | ⚠️ varies | null | null | ⚠️ default off | ✅ recommended | ✅ + 20-min inactivity logout w/ state restore | periodic mandatory pop-ups | ✅ min RTP 90% (verified [S50]) |
| `dk-spil` | ✅ [observed] | ✅ | ✅ | ✅ | ✅ [observed] | ✅ | null | null | ⚠️ default off | ⚠️ recommended | ⚠️ recommended | deposit limits mandatory | ✅ recommended |
| `be-gc` | ⚠️ allowed w/ controls [observed] | ✅ | ✅ | ✅ | ⚠️ verify | ⚠️ verify | null | null (unused statutory power) | ⚠️ default off | ✅ recommended | ✅ recommended | €200/wk deposit limit, age 21 | ✅ recommended |
| `ca-on-agco` | ❌ 2.16 | ❌ 2.19 | ❌ 2.19 | ❌ 2.19 (no-stake bonus exempt) | ❌ [observed] | ⚠️ off by default | 2500 (2.18) | null | ❌ banned ≤ last wager (2.20) | ✅ 2.21 in CAD, not credits | ✅ 2.22 | breaks-in-play + limits (2.13/2.23) | ✅ odds info (4.06) |
| `us-nj-dge` | ✅ | ✅ | ✅ | ✅ | ❌ default off [observed] | ✅ | null | null | ⚠️ default off | ⚠️ recommended | ⚠️ recommended | RG page/limits | ✅ RTP ≥ 83% |
| `us-mi-mgcb` | ✅ | ✅ | ✅ | ✅ | ❌ default off [observed] | ✅ | null | null | ⚠️ default off | per GLI-19 | per GLI-19 | per GLI-19/state | ✅ |
| `us-pa-pgcb` | ✅ | ✅ | ✅ | ✅ | ❌ default off [observed] | ✅ | null | null | ⚠️ default off | ⚠️ recommended | ⚠️ recommended | per 810a | ✅ |
| `mt-mga` | ✅ (alert pop-up required) | ✅ | ✅ | ✅ | ✅ | ✅ | null | null | ⚠️ default off | ⚠️ recommended | ✅ in reality check | player-set, persistent until ack, content mandated | ✅ RTP ≥ 85%, demo parity |
| `cw-cga` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | null | null | ⚠️ default off | ⚠️ recommended | ⚠️ recommended | self-exclusion, no credit | ✅ recommended |
| `unknown` (fallback) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 5000 | most-restrictive ladder | ❌ | ✅ | ✅ | ✅ blocking, 60 min | ✅ |

Legend: ✅ allowed/required as marked · ❌ prohibited/required-off · ⚠️ = default shown
plus a mandatory legal-review flag in `compliance-review.md`.

### D2. Concrete engine rules the skill must generate

1. **`minimumRoundDurationMs` is a presentation-layer clamp with a hard gate.** The
   spin state machine must not re-enable the spin control until
   `max(presentationTime, policy.minimumRoundDurationMs)` has elapsed since
   `round_requested`. Implement as a policy-driven timer in `spin-presentation.json`;
   values: 2500 (GB, CA-ON), 3000 (SE, ES), 5000 (DE), null elsewhere, 5000 unknown.
2. **Start-control debounce (UK 14D / AGCO 2.18 wording):** the spin button must
   require release-then-press per cycle; holding, key-repeat, or tap-and-hold must not
   start the next round in any policy where `minimumRoundDurationMs != null`.
   Encode `requireStartRelease: true` in those policies.
3. **Turbo/quick/skip semantics:** one boolean per policy is not enough. Model three
   independent flags: `quickSpinEnabled` (shorter reel spin), `turboSpinEnabled`
   (near-instant presentation), `animationSkipEnabled` (tap-to-skip win
   presentation). In minRound jurisdictions all three must be forced false for the
   *base game cycle*, but `bonusPresentationSkipEnabled` may remain true (UK 14E /
   AGCO 2.19 exempt no-extra-stake bonus games). This refines the schema in
   prompt.txt lines 2002–2016.
4. **LDW rule as a win-tier gate:** when `ldwCelebrationBanned` is true, any step
   where `totalWinMinor <= totalStakeMinor` must route to a neutral "result" preset —
   no win jingle, no `anim.win.countup` celebration variant, no big-win banner; show
   amount + brief line highlight only (UK 14F guidance). Default the flag TRUE in
   every policy (it is mandatory in GB/ON and harmless elsewhere) — this also
   satisfies CONVENTIONS.md §9.5.
5. **Autoplay is a module, not a button.** Where allowed it still needs: spin-count
   selection, loss limit, single-win stop threshold, visible stop control (industry
   baseline + MGA alert pop-up). Where `autoplayEnabled=false` the entire module and
   its UI strings must be excluded from the build, not hidden — regulators (KSA 2025)
   have acted on discoverable autoplay-like behaviors. Bonus buy counts as autoplay
   in NL (art. 3.8 Regeling KOA): never bundle "buy N bonus rounds" batches anywhere.
6. **Bonus buy pricing must respect stake caps:** `bonusBuy.price = priceX100 × bet`;
   in any policy with `maxStakeMinor != null`, validate
   `betMinor × priceX100 / 100 ≤ maxStakeMinor`, which effectively disables bonus buy
   in GB (£5) and DE (€1–€5 tiered). Emit a validation error, not a silent clamp.
7. **HUD contract:** a policy-driven HUD region with `netPositionVisible` (formula:
   Σwins − Σlosses since session start, account currency — never credits in Ontario)
   and `elapsedTimeVisible` (h/m/s, from game open). Default both ON everywhere; they
   are mandatory in GB (2E/13C) and ON (2.21/2.22) and best practice elsewhere.
8. **Reality-check hook, three modes:** `player-set-blocking` (GB 13B, MT with
   mandated content: time played, wagered, wins/losses, stay-in-control message),
   `mandatory-interval` (ES: 60-min forced-read; IT: periodic), `off/platform`
   (US states, CW). The check must (a) fire only at `round_complete`, (b) block the
   next `round_requested`, (c) require explicit acknowledgment, (d) offer exit +
   history links. The client-template needs a `realityCheck` event the platform can
   drive.
9. **Forced session termination:** ES (RD 176/2023) and IT (20-min inactivity logout
   with state restore) require the game to accept an external `session_end` command at
   any time, finish in-flight presentation, settle, and hand off — plus full state
   restore on re-login (maps to `reconnecting`/`recovering` states in
   CONVENTIONS.md §4.4).
10. **Max-stake as session data:** GB's age-tiered caps (£5/£2) mean the bet ladder
    must be filtered at runtime by an RGS/operator-supplied `maxStakeMinor`, not baked
    into the game config. Schema: `jurisdiction-policy.maxStake` supports
    `{defaultMinor, byAgeBand:[{minAge,maxAge,stakeMinor}]}` or null.
11. **RTP profiles per market:** floors — MT 85%, NJ 83%, IT ~90% [inferred], DE
    commercially ~94% net-of-stake-tax; demo/free-play must use identical math
    everywhere (MGA Directive 2, AGCO 2.15). Each profile needs separate simulation
    reports (CONVENTIONS.md §5) because labs certify per profile.
12. **No near-miss substitution / no variable secondary decisions** (AGCO 2.15, GLI
    lineage): once the outcome is selected, presentation must not re-weight losing
    displays. This is already CONVENTIONS.md §9.5; cite AGCO 2.15 in the compliance
    template.
13. **Simultaneous-play ban:** GB 14C / AGCO 2.17 — the client must refuse to run in
    multiple concurrent instances for the same account where policy demands
    (`multiInstanceBlocked: true` for gb/on; implement via storage/heartbeat flag and
    document the operator-side duty).
14. **Vertical/branding constraints do not affect the game binary** but Belgium's
    site-separation and bonus ban mean promotional hooks (e.g. "claim free spins")
    must be feature-flagged out per policy (`promoHooksEnabled:false` for BE, SE
    single-bonus, NL under-24 bonus ban).
15. **Compliance review doc:** for every generated game, `compliance-review.md` must
    list the target policyIds, print this feature-flag table filtered to them, and
    carry the 15 legal-review items above verbatim where relevant. The `unknown`
    policy (most restrictive: no autoplay/turbo/quick/skip/bonus-buy, 5000 ms floor,
    LDW ban, blocking 60-min reality check, HUD on) MUST be the shipped default,
    matching CONVENTIONS.md §9.6.

### D3. Numbers to hard-code as named constants

```
GB_MIN_CYCLE_MS = 2500        # RTS 14D (slots), since 2021-10-31
GB_NONSLOT_MIN_CYCLE_MS = 5000# RTS 14G, since 2025-01-17
GB_MAX_STAKE_ADULT = £5.00    # SI 2025, since 2025-04-09
GB_MAX_STAKE_18_24 = £2.00    # SI 2025, since 2025-05-21
DE_MIN_AVG_CYCLE_MS = 5000    # §22a(6) GlüStV 2021
DE_MAX_STAKE_DEFAULT = €1.00  # §22a(7) GlüStV 2021 statutory default
DE_MAX_STAKE_21PLUS = €3.00   # GGL tiered uplift since 2026-07-01 (operator opt-in)
DE_MAX_STAKE_QUALIFIED = €5.00# 90-day no-harm qualification + behavioural monitoring
SE_MIN_CYCLE_MS = 3000        # LIFS 2018:8 / SIFS 2022:3 — applies to autoplay rounds too
ES_MIN_CYCLE_MS = 3000        # DGOJ-approved game rules [verify clause]
IT_MIN_RTP = 0.90             # ADM online fixed-odds floor incl. slots (verified)
ES_REALITY_CHECK_MIN = 60     # RD 176/2023 forced-read message interval (minutes)
IT_INACTIVITY_LOGOUT_MIN = 20 # ADM session requirement
ON_MIN_CYCLE_MS = 2500        # AGCO Std 2.18
MT_MIN_RTP = 0.85             # MGA Directive 2 Art. 22 (since 2021-05)
NJ_MIN_RTP = 0.83             # N.J.A.C. 13:69E
BE_DEPOSIT_LIMIT_WEEK = €200  # since 2022-10-20
UNKNOWN_MIN_CYCLE_MS = 5000   # most-restrictive fallback
```

— end of dossier —
