# Technical Standards & Game Integrity — GLI-19/GLI-11, RNG, Recovery, History, Certification

```
domain: 04 — Technical standards & game integrity
generator: single-modern-slot-creator v1.0.0 (research phase)
date: 2026-08-08
status: research dossier — NOT legal advice; every real-money use requires jurisdiction-specific legal review
sources: web research 2020–2026, primary standards documents preferred (see Source register)
```

> Scope note: this dossier maps the requirement checklist in `prompt.txt` §11
> (Regulatory Standards, Integrity & Certification Readiness) to verified, cited
> technical facts, then converts them into concrete defaults the skill encodes.
> Tags: **[mandatory]** = required by a named standard/regulator in the stated
> jurisdiction · **[recommended]** = lab/industry best practice · **[observed]** =
> common verified market practice · **[inferred]** = plausible but not directly
> verified against a primary source (reason given).

## Findings

### 1. GLI interactive-gaming technical standards — which documents govern

- **GLI-19 "Standards for Interactive Gaming Systems" v3.0, revised 2020-07-17, is the current version** of the primary iGaming technical standard, released publicly 2020-07-20. No v3.1/v4.0 had been published as of this research (2026-08); the PDF hosted by GLI (upload path dated 2024) is still v3.0. [mandatory — any GLI-19 jurisdiction] [S1][S2]
- Structure: Ch.1 Introduction, Ch.2 Platform/System Requirements, Ch.3 RNG Requirements, Ch.4 Game Requirements, plus Appendix A (Operational Audit — Gaming Procedures & Practices), Appendix B (Technical Security Controls), Appendix C (Service Providers) and a glossary. [S1][S2]
- Stated goals of v3.0: separate lab-testable technical requirements from on-site operational controls; **align game requirements with GLI-11** and reporting with GLI-33. [S2]
- **GLI-11 "Gaming Devices in Casinos" v3.0, released 2016-09-21**, is the land-based device standard; its RNG chapter (Ch.3) was a "major revision … reflecting current testing practices and technical trends for randomness". GLI-19 game requirements deliberately mirror GLI-11, so GLI-11 language (e.g., background cycling) is used by labs to interpret GLI-19. Relevance to an online slot: indirect but real — labs and several regulators cross-reference it. [mandatory where adopted; recommended as interpretive aid online] [S4][S5][S28]
- Adoption examples for GLI-19: Loto-Québec; Alberta (AGLC); Bahamas Gaming Board; Michigan Gaming Control Board; West Virginia Lottery; referenced by AGCO Ontario Registrar's Standards and Denmark's Spillemyndigheden SCP certification programme. UKGC uses its own RTS but approves labs that test to comparable strategies. [observed] [S2][S3][S25]
- GLI positions GLI-19 as a **compliance guideline**, not a self-executing law: the binding requirement set is always the target regulator's adoption of it (sometimes with amendments). [mandatory nuance] [S2]

### 2. RNG requirements (GLI-19 Ch.3, GLI-11 Ch.3, UKGC RTS 7, 25 CFR 547.14)

#### 2.1 Core properties
- Universally required triad: **statistical randomness, unpredictability, non-repeatability** (verbatim in 25 CFR 547.14(a); mirrored in GLI-19 §3.2.4 and UKGC RTS 7A guidance). [mandatory — US tribal (NIGC), UK, GLI-19 markets] [S7][S11][S3]
- **Distribution (GLI-19 §3.2.3):** each possible RNG selection must be equally likely; intentionally non-uniform designs must conform to their documented intended distribution; discarding values to remove bias is allowed only if documented. [mandatory] [S3]
- **Independence (GLI-19 §3.2.4):** knowledge of prior draws must reveal nothing about future draws; values within one draw must not reveal each other unless the game design intends it. It must be computationally infeasible to predict the next number without complete knowledge of algorithm and seed (mirrored in RTS 7A). [mandatory] [S3][S7]
- **Period/range:** the RNG period, together with the implementation, "must be sufficiently large to ensure that all game outcome combinations/permutations are possible" for the games served (Quinel GLI-19 test report wording). 25 CFR 547.14(f)(3) requires the scaled RNG be capable of producing **every possible outcome of the game**. [mandatory] [S25][S11]

#### 2.2 Approved algorithm families
- No standard names a single mandatory algorithm. Labs certify PRNGs with **long periods and clean statistical records**; **Mersenne Twister MT19937 (period 2^19937−1)** is the most widely certified in gaming; hardware RNGs (thermal noise, circuit feedback, radioactive decay per GLI-19 Ch.3) and cryptographic DRBGs (SP 800-90A family) are also certified. [observed/recommended] [S3][S14][S15][S26]
- iTech Labs states it only certifies PRNGs with long periods and has certified 300+ RNGs across algorithms and hardware generators. [observed] [S14][S15]
- MT19937 is **not cryptographically secure** (state recoverable from 624 outputs); it passes labs because gaming standards demand statistical randomness + operational unpredictability (server-side secrecy, background cycling, reseeding) rather than CSPRNG proofs. UK RTS 7A's "computationally infeasible to predict … without knowledge of algorithm and seed" is satisfied because the attacker has neither raw outputs nor state. A CSPRNG (e.g., ChaCha20-based, AES-CTR DRBG) removes this argument entirely. [observed + recommended: prefer CSPRNG for new builds] [S7][S14][S26]

#### 2.3 Seeding & entropy integrity
- 25 CFR 547.14(d): initial seed must come from **(i) a source of "true" randomness (hardware noise)** or **(ii) a combination of timestamps, system-unique parameters, prior RNG outputs, or similar** — a lone predictable timestamp is insufficient. Re-seed input must be "at least as statistically random as, and independent of, the output of the RNG being re-seeded" (547.14(c)(3)). [mandatory — NIGC; recommended template everywhere] [S11]
- UKGC RTS 7A guidance: "seeding and re-seeding must not introduce predictability"; two RNG instances must never produce identical streams and the stream must not cycle/synchronise. [mandatory — GB] [S7]
- iTech Labs methodology: verifies "seeding, background cycling and minimal reseeding"; requires initial seed from a random source and reseeding that is **random and infrequent**, so the probability of a repeated sequence is practically zero. [recommended/lab-enforced] [S14][S15]
- Modern lab expectations (industry guidance): multiple entropy sources combined via cryptographic hash; documented entropy sources; no seed value reused across rounds. [recommended] [S26]

#### 2.4 Background cycling / activity & timing independence
- GLI-11 v2.1 §3.3.4 (carried forward conceptually in v3.0): "The RNG shall be **cycled continuously in the background between games and during game play at a speed that cannot be timed by the player**." GLI's RNG-testing guidance for GLI-19 repeats: "adequate background cycling/activity must be implemented in between games" so outcomes cannot be predicted. [mandatory — GLI markets] [S6][S24]
- 25 CFR 547.14(c)(2): unpredictability must be ensured "by reseeding or by continuously cycling the RNG", with a sufficient number of RNG states. [mandatory — NIGC] [S11]
- Consequence: **no player action (spin-press timing, stop button, network timing) may influence which random value is drawn** in any exploitable way; the draw must be decoupled from human-timable events. For a server-based slot the draw happens server-side on wager receipt, from a continuously-cycled generator. [mandatory, derived directly from the above] [S6][S11][S24]

#### 2.5 Scaling & use of outputs
- Scaling must preserve distribution: GLI test language — "the scaling method shall not compromise the … strength of the random number generator" and "shall preserve the distribution of the scaled values"; a compliant scaling method "shall have bias equal to zero" (die example: each face equally frequent). [mandatory] [S24][S25]
- 25 CFR 547.14(f): scaled outputs must be independent and uniform over the range; **rejection sampling is explicitly the sanctioned exception** to the no-discard rule ("may discard numbers that do not map uniformly onto the required range" and must use the first correctly-mapping number in sequence); an algorithm is unbiased "if the measured bias is no greater than **1 in 50 million**". [mandatory — NIGC; recommended everywhere] [S11]
- Use-of-output rules (547.14(e), mirrored by GLI-19 §4.6 and RTS 7B): outputs must be **used immediately, in the order generated**; must not be arbitrarily discarded or selected; no "reflexive software or secondary decision" may alter displayed results; out-of-range values may only be discarded with an error logged and investigated (RTS 7B guidance). [mandatory — US tribal / GLI / GB] [S11][S3][S7]
- Practical implication: **naive modulo scaling is a known certification failure** ("distribution anomalies where outcome mapping creates uneven distribution due to incorrect modulo operations or biased rounding"). Use rejection sampling or 64-bit multiply-shift (Lemire) with bias analysis. [observed + recommended] [S26][S27]

#### 2.6 Statistical test expectations
- **GLI-19 §3.2.2** test battery (lab-selected, not supplier-selected): chi-square/total distribution, overlaps, coupon collector's, runs, interplay correlation, serial correlation, duplicates. §3.2.1: the lab **must review source code** of all core randomness/scaling/shuffling algorithms — black-box statistical testing alone is not acceptable. [mandatory] [S3]
- **25 CFR 547.14(b):** pass randomness tests at **99% confidence**; candidate tests: chi-square, runs, serial correlation, equi-distribution/frequency, gap, poker, coupon collector's, permutation, spectral, tests on subsequences. [mandatory — NIGC] [S11]
- **Lab practice:** iTech Labs runs Marsaglia **Diehard** on raw outputs and **chi-square on scaled/shuffled outputs**; deliverables include the certification report plus Diehard and chi-square results; certificates fingerprint (hash) the certified code. [observed/lab-enforced] [S14][S15][S16]
- Batteries in current use across labs: **NIST SP 800-22 (15 tests), Diehard/Dieharder, TestU01 (SmallCrush/Crush/BigCrush)**, on samples typically 10M–1B outcomes. SP 800-22 procedure: e.g. 100 substrings of 10^6 bits (≥10^8 bits total), per-test significance α = 0.01, plus p-value-uniformity chi-square. [observed/recommended] [S26][S12]
- **SP 800-22 Rev. 1a status:** NOT withdrawn. NIST decided in April 2022 to revise it (notably to reject its use for assessing *cryptographic* RNGs and align with SP 800-90 terminology), but **no draft revision had been published through 2025**; Rev. 1a (2010) remains the current final version. SP 800-90C (final) now completes the 800-90 series. Gaming labs continue to cite SP 800-22. [observed — verify at submission time] [S12][S13]
- Hardware RNGs additionally require **dynamic real-time monitoring** of output with statistically powerful sample sizes, and game play must be disabled when problems are detected (GLI-19 Ch.3, "RNG Strength and Monitoring"). [mandatory if HRNG used] [S25][S1]
- Raw-output collection: for RNG submissions GLI requires a **binary raw-output collection tool** (output captured *before* scaling/shuffling) and recommends the RNG run on hardware identical to production. [mandatory for GLI RNG submissions] [S24]

#### 2.7 Outcome independence & prohibited behaviours
- **GLI-19 §4.6:** "The game shall not modify or discard outcomes selected by the RNG due to adaptive behavior" and "shall not substitute a different losing outcome to show to the player than that originally selected" (no engineered near-misses). Games must not adjust bonus likelihood based on award history nor adapt theoretical return based on past payouts. Cited by labs as one of the most common initial-failure causes in feature-heavy slots. [mandatory] [S3]
- **UKGC RTS 7A/7B/7C:** adaptive behaviour ("compensated game") not permitted; random numbers used in order received, never discarded for adaptive reasons; substituting losing outcomes with near-miss losses prohibited; simulations of real devices must reflect real probabilities (GLI-19 §4.6.4 parallels: European roulette 1-in-37, American 1-in-38); every advertised outcome must be achievable. [mandatory — GB] [S7][S3]
- **UKGC RTS 7D:** rules/payouts/probabilities cannot change while a game is live except as its rules provide; changes require taking the game offline and flagging "rules changed / new odds / different payouts" to customers; blanket "rules may change at any time" clauses are unacceptable. [mandatory — GB] [S7]
- **UKGC RTS 7E:** the result and the customer's gamble must be displayed clearly, accurately, and long enough to understand the outcome. [mandatory — GB] [S7]

### 3. Game requirements relevant to a single slot (GLI-19 Ch.4 + Ch.2)

- **Rules/paytable/RTP display (GLI-19 §2.6.9):** player software must display — directly or via an accessible page — gaming rules, paytable information, **RTP data where required by the regulatory body**, and responsible-gambling controls; abridged in-game info is allowed if the full version is one clearly-identified secondary screen away. [mandatory] [S3]
- **MGA:** game rules displayed in full **no more than one click away** from the game page; for downloadable games, rules presented before the first wager. [mandatory — Malta] [S20]
- **Interface fairness (GLI-19 §4.2):** the default display on entering a game must not show the highest advertised award unless it was the player's last outcome. [mandatory] [S3]
- **Game cycle & bet validation (GLI-19 §4.3):** game cycle runs wager-to-wager; **wagers are subtracted from balance immediately**; negative balances must be impossible; free spins / second-screen bonuses count as part of one game cycle (matters for round accounting and history). [mandatory] [S3]
- Bet validation beyond §4.3 (valid stake within configured min/max, valid denomination, sufficient funds, idempotent wager acceptance) is enforced at platform level under GLI-19 Ch.2 account/wagering integrity requirements and lab test scripts. [inferred — Ch.2 detail not fully extracted here; the direction is certain from §4.3 + Appendix A accounting audits] [S1][S3]
- **Minimum RTP (GLI-19 §4.7.1):** where a regulator sets a minimum, it "shall be met using a strategy of play that provides the greatest return to the player over a period of continuous play"; progressives evaluated at lowest jackpot parameters. [mandatory] [S3]
- **RTP display basis (GLI-19 §4.7.2):** RTP display is at regulator discretion; artwork must explain the basis (min/max/average); skill games must use an advertised strategy. [mandatory] [S3]
- **Jurisdiction RTP floors (examples):** Malta **85%** minimum average RTP for online RNG games (Player Protection Directive Art. 22, lowered from 92% in May 2021); New Jersey 83% (land-based-derived); **UK has NO statutory minimum RTP** — its standard accepts game description, house edge, RTP % or win probability as sufficient player information. [mandatory per jurisdiction] [S19][S20][S21]
- **Maximum-win claims:** advertised maximum win must be actually achievable (UKGC RTS 7C guidance: every advertised outcome achievable; RTS 7B: game implemented as described). GLI-19 §4.2 bars implying the top award is the default. Publishing max-win odds (e.g., probability of hitting the cap) is required by some operators/regulators as market practice but is **not** a universal GLI-19 clause. [mandatory (achievability, GB) / observed (odds publication)] [S7][S3]
- **Multi-player note:** GLI-19 §4.18 adds review for multi-player submissions — out of scope for a single slot but confirms single-game submissions are the base case. [observed] [S3]

### 4. Interrupted games, recovery & replay (GLI-19 §4.14–4.16)

- **Interrupted games (GLI-19 §4.16):** recognized causes: loss of communications platform↔device; platform restart; device restart; game disabled during play; abnormal client termination. The platform **must provide a mechanism to complete an incomplete game**. [mandatory] [S1][S3-adjacent summary in S30]
- **On reconnection:** where **no player input is required** (a normal slot round), the game must **display the final outcome as determined by the RNG and game rules and update the player's account accordingly**; where input is required, the player must be returned to the exact pre-interruption state and allowed to complete. If full recovery is impossible, the system must be capable of **returning or forfeiting wagers as appropriate**, and records of failed games must be kept; reporting must account for total funds held in incomplete games. [mandatory] [S1][S30]
- **Committed-round principle (derived):** the authoritative outcome is committed server-side at wager time; presentation is replayable. This is exactly why the CONVENTIONS.md outcome-manifest + `resumePointer` model exists — labs test "state recovery … after a sudden disconnection or power loss" and it is a common certification stumbling block. [mandatory in effect] [S30][S3]
- **Game recall / history (GLI-19 §4.14.1):** player must have a recall function — real-time display or retrievable record — of the **most recent completed game cycles** including final outcome, funds available, total wagered and won, results of player choices, and progressive/incrementing awards. Directly tested during certification. (Common lab interpretation: last 10–50 rounds available in-client; exact count jurisdiction-configurable.) [mandatory; count [inferred] from lab practice] [S3][S30]
- **Disable (GLI-19 §4.15):** the platform must be able to disable a game (e.g., on error, RTP deviation, regulator order); in-flight rounds follow §4.16. [mandatory] [S1][S30]
- **MGA player history:** players must be able to access **six months** of gambling history (wins/losses, deposits, withdrawals); licensee must keep a readily-available copy. [mandatory — Malta] [S20]

### 5. Configuration versioning & software integrity

- **GLI-19 §2.3.2:** critical components are verified via a **cryptographic hash with a digest of at least 128 bits, at minimum every 24 hours**. Certified code is fingerprinted by the lab (iTech certificates identify the exact reviewed code by hash). [mandatory / lab-enforced] [S3][S16]
- **Change management / re-certification:** material changes — **RNG, paytable, game logic, scaling/mapping, game rules** — trigger re-evaluation (GLI-19 certification practice; aligned with e.g. Denmark SCP.06.00.EN). UKGC Testing Strategy Annex A: a **"major update" = any software change which may affect the fairness of a game** (explicitly: changes to the RNG, scaling and mapping, or game rules) and requires external retesting by an approved test house; non-fairness changes are "minor updates" releasable without external retesting, with the licensee+test house judging the boundary. Licensees must also submit a games-testing annual audit. UKGC testing strategy last updated 2025-10-31. [mandatory — GB; recommended pattern everywhere] [S3][S9]
- Consequence: **every certifiable artifact needs a stable version + hash identity** (game version, math version, config hash) so a submission maps 1:1 to a certificate, and so a "minor vs major" diff is provable. [mandatory in effect] [S9][S16]

### 6. Selectable RTP profiles

- Providers ship the **same title in multiple certified RTP configurations** (commonly 3–6 builds, roughly 85–98% envelope; published defaults cluster 95.0–96.7%); the operator selects which certified build goes live, subject to local floors (e.g., Malta 85%). [observed] [S21][S31]
- **Each RTP configuration requires separate certification**, and the RTP displayed in-game must match the configuration actually deployed for that market (UK-facing build certified at the UK-facing RTP). [mandatory] [S31][S9]
- UKGC position is disclosure-based (RTP/house edge/win probability info must be *available* to the player), not floor-based; industry press documents operators quietly deploying lower-RTP variants — a reputational/RG consideration, not just legal. [observed] [S31]
- GLI-19 §4.6 still applies across profiles: RTP selection is a **static, versioned configuration choice**, never a runtime adaptive behaviour. Switching profiles on a live game engages RTS 7D (offline + notice) in GB. [mandatory] [S3][S7]

### 7. Responsible-product design constraints that bind the game engine (UK as strictest template)

- **Slots, GB, since 2021-10-31:** minimum spin cycle **2.5 seconds**; **no turbo/quick-spin** or any function letting a player speed up play; **no slam stop / spin stop** (RTS 14E: "the gambling system must not permit a customer to reduce the time until the result is presented"); **autoplay banned**; **no sounds or imagery celebrating a return ≤ stake** (losses-disguised-as-wins); mandatory display of **net wins/losses and elapsed time** during the slot session; multi-slot simultaneous play prohibited. [mandatory — GB] [S8][S22]
- **From 2025-01-17 the RTS 14E prohibition extends to all online casino products**; autoplay banned across all online gaming; non-slot casino games get a 5-second minimum between rounds; carve-outs exist only for scratch-all instant-win and crash games. UKGC states the prohibited-feature list is **not exhaustive** — treat any play-intensifying mechanic as suspect. [mandatory — GB] [S8][S23]
- **GB stake limits (2025):** £5 per spin (25+), £2 (18–24). [mandatory — GB] [S22-adjacent press; verify exact instrument at build time]
- **Feature buy (bonus buy):** not available on the GB market — removed under the Betting and Gaming Council's Game Design Code of Conduct (2020) with UKGC backing rather than an explicit RTS clause; widely enforced in practice. Other markets (e.g., most .com, Ontario with conditions) allow it. [observed — GB prohibition mechanism verified only to industry-code level; flag for legal review] [S22][S8-context]
- **Enhanced-chance / bought-volatility variants:** treated like bonus buy by GB operators (not offered); elsewhere generally permitted if the altered math is disclosed and separately certified (RTS 7B/7D analogues + GLI-19 §4.6 fixed-odds rule). [inferred from the above rules; no single primary clause found]
- **Autoplay where legal:** GLI-19 and most non-GB regimes allow autoplay with limits (spin count, loss limit, stop-on-feature); MGA requires an interval alert pop-up option on auto-spin. [mandatory — Malta detail; observed elsewhere] [S20]
- **Reality checks / session hooks:** MGA Player Protection Directive mandates RG tools (deposit or wagering limits mandatory, self-exclusion, markers-of-harm monitoring since 2023-01-12, further updates in force January 2024); GB mandates session win/loss + elapsed-time display in slots. The game client must therefore expose hooks: session clock, net-position feed, forced-interrupt overlay that pauses (never settles) a round presentation. [mandatory — Malta/GB; hook architecture [inferred] as the standard implementation] [S20][S22][S8]
- **GLI-19 Appendix A §3.8:** self-imposed limit relaxation takes effect only after **24 hours minimum**; exclusions immediate; excluded players can still withdraw cleared balances. (Platform-level, but the game must respect disable/exclusion signals.) [mandatory] [S3]
- **Accessibility:** no gaming-specific technical standard mandates WCAG in GLI-19; UK/EU accessibility law (e.g., European Accessibility Act, in force for services since 2025-06) and operator policy increasingly expect WCAG 2.1/2.2 AA-adjacent behaviour (contrast, reduced motion, no colour-only information, flash limits ≤3/s per photosensitivity guidance). [inferred/observed — encode as skill defaults; verify per jurisdiction] 

### 8. Payout verification, data & audit

- **GLI-19 Appendix A §6.2:** operators must periodically compare **theoretical vs actual RTP** per game/paytable; out-of-range deviations are logged as errors and escalated. Game/paytable performance reporting must include: date/time the theme/paytable went live, theoretical RTP %, number of games played, total value of wagers. [mandatory] [S3][S30]
- **GLI-19 Appendix B:** periodic penetration testing; firewall config-change and connection-attempt logging; remote access encrypted per **ISO/IEC 19790, FIPS 140-2 or equivalent**. [mandatory] [S3]
- Every wager/win event, incomplete-game funds, and recall data must be durably logged; reporting must reconcile funds in incomplete games (§4.16 records + Appendix A accounting). [mandatory] [S1][S30]
- **ISO/IEC references relevant to this domain:** ISO/IEC 17025 (test-lab competence — the accreditation all approved labs hold), ISO/IEC 17065 + ISO/IEC 27002 (selected requirements in the UKGC test-house framework), ISO/IEC 19790 / FIPS 140-2/140-3 (crypto modules for remote access/signing), ISO/IEC 27001 (ISMS — commonly required of licensees; e.g., basis of parts of Appendix B). [mandatory/recommended per use] [S10][S3]

### 9. Certification labs & the math submission package

- **Who:** GLI, BMM Testlabs, iTech Labs, eCOGRA, Gaming Associates, Quinel are the recurring approved labs; UKGC maintains an approved test-house list, and labs must hold **UKAS (or national-body) ISO/IEC 17025 accreditation** plus selected ISO/IEC 17065 and 27002 requirements; not every lab is approved for every product category — the licensee must check scope. eCOGRA's RNG methodology is approved by Great Britain, the Netherlands and Spain, among others. [mandatory — GB process; observed elsewhere] [S10][S17][S26]
- **What a game/math submission contains** (GLI Composite Submission Requirements v2.0, 2022 + lab practice):
  - **PAR sheets / calculation sheets** for each game "that determine the theoretical return to the player, including the base game, double-up options, and free games" — the math workbook with symbol weights, strip layouts, per-line/per-feature EV, hit frequencies, volatility, max-win derivation, and paytable/version identifiers. [mandatory] [S18][S32]
  - **RNG documentation & source:** algorithm identification, seeding/reseeding method and entropy sources, internal state description, scaling/shuffling code — labs review source (GLI-19 §3.2.1) and run raw + scaled statistical tests; a **raw binary output collection tool** must be supplied for RNG submissions. [mandatory] [S3][S24][S14]
  - **Simulation logs/reports:** studios pre-run 10M–100M+ spin simulations to demonstrate simulated RTP converges to the PAR-sheet theoretical value before submission; labs re-verify by simulation and/or exhaustive calculation; discrepancy between advertised and actual math (e.g., claimed 96.5% vs computed 96.1%) is a listed common failure. [mandatory in effect] [S27][S32][S29]
  - Game rules/help text, paytable screens, artwork claims (for RTS 7B "as described" checks), version-locked build + hashes, and target-jurisdiction matrix. [mandatory] [S9][S16][S27]
- **Process & timeline (industry-reported):** initial review 2–3 weeks; testing 6–12 weeks (RNG + math); each failed remediation loop +4–6 weeks; certificate issuance 2–3 weeks; overall ~2–4 months for a standard slot, 4–6 for complex titles. Certificates bind to a specific build/version/jurisdiction; RNG certs are commonly revisited every 1–3 years or on change. Pre-submission consultations are offered by most labs and worth taking. [observed] [S27][S26]
- **Post-cert:** re-certification required after major updates (fairness-affecting changes, new jurisdiction); Ontario/GB style certificates cite the exact standard version tested against (e.g., "GLI-19 v3.0", "RTS June 2017 + Testing Strategy Nov 2018", "Ontario Registrar's Standards Feb 2022"). [mandatory] [S16][S9]

## Source register

| id | name | type | pub/revision date | jurisdiction | URL | supports |
|----|------|------|-------------------|--------------|-----|----------|
| S1 | GLI-19 Standards for Interactive Gaming Systems v3.0 (official PDF) | standard | 2020-07-17 | multi (GLI-adopting) | https://gaminglabs.com/wp-content/uploads/2024/06/GLI-19-Interactive-Gaming-Systems-v3.0.pdf | version/date, structure, Ch.3, §4.14–4.16 |
| S2 | GLI press release: GLI-19 v3.0 released | standard-body press | 2020-07-20 | multi | https://gaminglabs.com/press-releases/gaming-laboratories-international-gli-releases-revised-standard-gli-19-standards-for-interactive-gaming-systems-v3-0/ | goals, adoption list, GLI-11 alignment |
| S3 | gamingcompliance.io — "GLI-19 v3.0: What Every Online Casino Game Must Meet" | industry analysis | c.2024–2025 | multi | https://gamingcompliance.io/gli-19-v3-0-what-every-online-casino-game-must-meet-to-pass-certification/ | §-level detail: 2.3.2, 2.6.9, 3.2.x, 4.2, 4.3, 4.6, 4.7, 4.14.1, App A/B/C |
| S4 | GLI-11 Gaming Devices v3.0 (official PDF) | standard | 2016-09-21 | multi (land-based) | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | GLI-11 content |
| S5 | GLI-11 v3.0 Revision History (official PDF) | standard-body doc | 2016 | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-V3-0-Revision-History.pdf | "fresh approach" to RNG chapter |
| S6 | GLI-11 v2.1 Chapter 3 excerpt (background cycling §3.3.4) | standard excerpt | c.2007 | multi | http://digdia.com/slots/GLI-11%20v2.1%20Gaming%20Devices%20in%20Casinos%20Chapter%203.pdf | background-cycling verbatim |
| S7 | UKGC RTS 7 — Generation of random outcomes (current web version) | regulator | current (RTS consolidated 2021; page live 2026) | Great Britain | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-7-generation-of-random-outcomes | 7A–7E + guidance |
| S8 | UKGC RTS 14 — Responsible product design | regulator | current; 14E extended 2025-01-17 | Great Britain | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | 14E, speed-of-play bans |
| S9 | UKGC Testing Strategy (incl. Annex A major/minor updates) | regulator | updated 2025-10-31 | Great Britain | https://www.gamblingcommission.gov.uk/strategy/testing-strategy-for-compliance-with-remote-gambling-and-software-technical/8-annex-a-major-and-minor-game-and-software-updates | re-test triggers, annual audit |
| S10 | UKGC Test Houses page / framework | regulator | current | Great Britain | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/test-houses | ISO 17025/17065/27002, approved-lab process |
| S11 | 25 CFR §547.14 — minimum technical standards for electronic RNG (Cornell LII) | regulation | in force | US tribal (NIGC) | https://www.law.cornell.edu/cfr/text/25/547.14 | 99% confidence tests, seeding, cycling, scaling bias 1/50M |
| S12 | NIST SP 800-22 Rev.1a publication page | standard | 2010; review note updated 2025-02-03 | US/intl | https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final | suite content/status |
| S13 | NIST CSRC — Decision to revise SP 800-22 Rev.1a | standards body | 2022-04-19 | US/intl | https://csrc.nist.gov/news/2022/decision-to-revise-nist-sp-800-22-rev-1a | revision status, crypto-use rejection |
| S14 | iTech Labs — RNG Testing & Certification | lab (vendor docs) | current | multi | https://itechlabs.com/compliance-testing/rng-testing/ | methodology: seeding, cycling, scaling, Diehard/chi-square |
| S15 | iTech Labs FAQ | lab | current | multi | https://itechlabs.com/faqs/ | long-period PRNG policy, MT19937, reseeding |
| S16 | iTech Labs RNG certificate (SkillOnNet, Ontario) | lab certificate | 2022-04-05 | Ontario/GB refs | https://itechlabs.com/certificates/SkillOnNet/RNG_Certificate_Ont_SkillOnNet_05Apr22.pdf | certificate contents, code fingerprint, standards cited |
| S17 | eCOGRA — RNG certification service | lab | current | GB/NL/ES + | https://ecogra.org/services/random-number-generator-rng-certification/ | methodology approval by jurisdictions |
| S18 | GLI Composite Submission Requirements v2.0 | standard-body doc | 2022-01 | multi | https://gaminglabs.com/wp-content/uploads/2022/01/GLI-Composite-Submission-Requirements-V2.0.pdf | PAR/calc-sheet submission requirement |
| S19 | MGA press release — RTP streamlined to 85% | regulator | 2021-05 | Malta | https://www.mga.org.mt/the-mga-streamlines-the-return-to-player-percentage-applicable-to-both-remote-and-land-based-sectors/ | 92%→85% change, Art.22 |
| S20 | MGA Directive 2 of 2018 — Player Protection Directive (v3) | regulator | v3, 2023-01 | Malta | https://www.mga.org.mt/app/uploads/Directive-2-of-2018-Player-Protection-Directive.pdf | 85% RTP, 6-month history, rules 1-click, auto-spin alert |
| S21 | iGB — MGA to lower minimum RTP threshold to 85% | industry press | 2021 | Malta | https://igamingbusiness.com/casino-games/product-technology/malta-gaming-authority-to-lower-minimum-rtp-threshold-to-85/ | context of change |
| S22 | SBC News — UKGC bans autoplay & quickspin | industry press | 2021-02-02 | Great Britain | https://sbcnews.co.uk/igaming/2021/02/02/ukgc-bans-online-slots-autoplay-and-quickspin-features/ | 2021-10-31 slot rules |
| S23 | Wiggin LLP — Remote game design changes effective 17 Jan 2025 | law-firm brief | 2024/2025 | Great Britain | https://www.wiggin.co.uk/insight/remote-game-design-changes-taking-effect-17-january-2025/ | 2025 extension to all casino games, 5s rule |
| S24 | GLI — Technical Specifications for RNG Testing | lab (vendor docs) | current | multi | https://gaminglabs.com/getting-started/technical-specifications-for-rng-testing/ | raw-output tool, cycling, scaling language |
| S25 | Quinel RNG testing report vs GLI-19 (Booongo) | lab report (via Scribd) | c.2020s | multi | https://www.scribd.com/document/937615254/Booongo-QUINEL-RNG-Certificate | period requirement wording, HRNG monitoring |
| S26 | SDLC Corp — RNG Certification for Casino Games guide | industry blog | 2024–2025 | multi | https://sdlccorp.com/post/rng-certification-for-casino-games/ | test batteries, sample sizes, entropy expectations |
| S27 | TwinWin / Slots5 slot-certification guides | industry blog | 2025–2026 | multi | https://twinwingames.com/slot-certification-guide/ | timelines, failure modes, submission tips |
| S28 | Yogonet — GLI-11 v3.0 public release | industry press | 2016-09-26 | multi | https://www.yogonet.com/international/news/2016/09/26/40699-gli-publicly-releases-updated-version-of-gli11-gaming-devices-standard | GLI-11 v3.0 date |
| S29 | GLI — Game Mathematics / %RTP Analysis service | lab (vendor docs) | current | multi | https://gaminglabs.com/services/igaming/game-mathematics-percentage-return-to-player-rtp-analysis/ | lab math-verification service scope |
| S30 | GLI-19 v2.0 (Bahamas Gaming Board mirror; §4.14/4.15/4.16 lineage) | standard | 2013 (v2.0) | multi | https://www.gamingboardbahamas.com/wp-content/uploads/2023/04/GLI-19_Interactive_Gaming_Systems_v2.0_Final.pdf | interrupted-game/recall clause text lineage |
| S31 | Webopedia / KingCasinoBonus / track360 — multi-RTP market practice | industry press | 2025–2026 | multi/GB | https://www.webopedia.com/crypto-gambling/casinos/guides/why-same-slot-has-different-rtp-at-different-casinos/ | selectable-RTP practice, per-config certification |
| S32 | wizards.us — What is a PAR sheet (+ GLI cross-ref) | industry blog | 2024–2025 | multi | https://wizards.us/blog/what-is-a-par-sheet/ | PAR sheet definition/contents |

## Uncertainties & legal-review items

1. **GLI-19 v3.0 currency**: v3.0 (2020-07-17) verified current as of research date, and GLI published at least one clarifying note to it (article confirming an update exists returned HTTP 403; content unverified). **Re-check gaminglabs.com/gli-standards at build time** for any v3.x errata or v4 draft. [S1][S2]
2. **GLI-11 current version**: v3.0 (2016) is the latest confirmed; a v3.1 could not be verified from primary sources — do not cite "GLI-11 v3.1" without downloading the current PDF.
3. **Exact GLI-19 §3.x numbering for seeding/background-cycling clauses** was reconstructed from lab reports (Quinel, iTech) and GLI-11 v2.1 §3.3.4 rather than the v3.0 PDF text itself (PDF not machine-fetched). Clause *content* is multiply corroborated; the *numbers* for seeding/cycling in v3.0 should be confirmed against the PDF before quoting in a compliance document.
4. **GB feature-buy prohibition**: enforced via the BGC Game Design Code of Conduct + UKGC pressure, not a located explicit RTS clause. Legal review must confirm the current instrument before shipping any bonus-buy toggle for GB. Same for enhanced-chance modes.
5. **GB stake limits (£5/£2 by age)**: reported by industry press as in force 2025; confirm the statutory instrument text and effective dates.
6. **Reality-check exact RTS clause number** (GB) not pinned in this research; the *behaviour* (session elapsed-time + net win/loss display for slots) is verified [S22]. Confirm clause numbering (RTS 12/13) at build time.
7. **Game-recall depth** (how many rounds): GLI-19 §4.14.1 says "most recent" cycles without a universal number; 10–50 rounds is lab practice [inferred]. Jurisdictional overlays (e.g., MGA 6-month account history) are separate from in-game recall.
8. **NIST SP 800-22 revision** may land any time; if a revision publishes, labs may re-baseline batteries — treat the battery list as configuration, not constant.
9. **Accessibility**: no gaming-standard mandate found; European Accessibility Act applicability to gambling services needs jurisdiction-specific legal review.
10. **Aggregator/operator overlays**: RGS integrations impose additional round-lifecycle contracts (bet/win/rollback idempotency) not covered by GLI-19 itself — covered in the platform-integration dossier, but certification scope boundaries (platform vs game) must be agreed with the lab per engagement [S3].

## Design implications for the Skill

These are the rules the single-modern-slot-creator skill encodes. Numbers marked (default) are skill defaults, overridable per jurisdiction policy; all consistent with CONVENTIONS.md.

### RNG & outcome generation
1. **Server-authoritative outcomes only** (CONVENTIONS §9.1): production outcomes come from the RGS; the client never draws. The skill's dev round provider (TS xoshiro128**, recorded seed) and simulator (Python `numpy.random.Generator(PCG64(seed))`) are flagged DEV/SIM-ONLY in every generated doc, because **neither would pass lab review as a production RNG without the operational wrapper** (secret state, background cycling, entropy seeding).
2. Generated `docs/compliance-review.md` must state the production-RNG expectations the RGS must meet: statistical randomness + unpredictability + non-repeatability; source-code review (GLI-19 §3.2.1); lab-selected battery (chi-square, runs, serial correlation, overlaps, coupon collector's, duplicates — GLI-19 §3.2.2; 99% confidence per 25 CFR 547.14(b)); Diehard on raw + chi-square on scaled outputs (iTech practice); NIST SP 800-22 named as commonly applied.
3. **Scaling rule encoded in both math and client dev-RNG:** rejection sampling (or Lemire multiply-shift with documented bias analysis) — never bare modulo. Acceptance bar: measured bias ≤ 1 in 50,000,000 (25 CFR 547.14(f)(4)) and zero structural bias by construction. Unit test: for each reel-strip length L, verify draw distribution uniformity by chi-square at α=0.01 over ≥ 10⁷ draws in the simulator.
4. **Use-in-order invariant:** the outcome pipeline consumes RNG values immediately, in generation order, with no discard except documented rejection-sampling rejects (log counter). No secondary decision may read a drawn value and re-draw. Encode as a code-review checklist item + simulator assertion.
5. **No timing influence:** the spin button triggers a *request*; the draw happens server-side independent of press timing. The dev provider must also draw on request receipt, not on animation frames, so behaviour parity holds. Document that background cycling/seed entropy are RGS obligations (GLI-11 §3.3.4 lineage; 25 CFR 547.14(c)).
6. **Independence guarantees in math:** every spin independent; no state carried between rounds except explicitly-declared persistent features, which must be documented in the PAR sheet as part of the game cycle (GLI-19 §4.12 persistence games) with their own RTP contribution.

### Fixed math & prohibited behaviours (hard fails in validation)
7. Validation step MUST fail the build if any generated config or code implies: adaptive RTP, compensated play, outcome substitution, engineered near-misses, bonus likelihood conditioned on award history, or discarding outcomes (GLI-19 §4.6; RTS 7A/7B/7C). These are grep-able patterns + schema constraints (`paytable.json`/`reel-sets.json` contain no fields keyed on player history).
8. **LDW rule:** win < stake is never presented above `small` tier — no big-win sounds/imagery for returns ≤ bet (GB 2021 rule; CONVENTIONS §9.5). `spin-presentation.json` validator enforces: tier thresholds start at win/bet ≥ 1.0 for any celebratory tier.
9. **Simulated-device fidelity:** if art implies a physical device (wheel, dice, cards), displayed probabilities must equal real-device probabilities (GLI-19 §4.6.4; RTS 7C). Skill default: avoid literal real-device depictions in themes.
10. **Every advertised outcome achievable:** simulator must observe ≥1 max-win hit at release-level simulation size or prove reachability analytically; the PAR sheet must state P(max win) per spin. Max-win cap termination (`max_win_termination` step) enforced in math and engine (CONVENTIONS §9.4).

### Round lifecycle, recovery, history
11. **Committed-outcome model:** outcome manifest generated and committed server-side at `outcome_committed` before any presentation (CONVENTIONS §7). Recovery = re-fetch committed manifest + `resumePointer`, seek instantly; where no player input is required the recovered view shows the final outcome and settled balance (GLI-19 §4.16). The skill's client template ships a `recovering` state implementing exactly this, plus an equivalence test: interrupt at every step boundary ⇒ identical final balance.
12. **Wager accounting:** stake debited immediately at round start; negative balance impossible; free spins/features are part of one game cycle for accounting (GLI-19 §4.3). Bet validation: stake ∈ configured bet ladder, min 10 / max 10000 minor units (default), idempotent round creation keyed by `roundId`.
13. **Game recall:** client template includes a history view of the last **N completed rounds (default 50, jurisdiction-configurable ≥10)** showing final grid/outcome, total wagered, total won, player choices, and feature awards (GLI-19 §4.14.1). The outcome manifest is the replay record — the same data drives recall rendering. Server-side retention guidance: ≥ 6 months player-accessible history noted for Malta (MGA PPD).
14. **Disable/interrupt hooks:** engine exposes `game.disable` handling: block new rounds, let committed rounds settle, surface regulator-friendly messaging (GLI-19 §4.15). RTP-deviation monitoring is documented as an operator duty (Appendix A §6.2) with the game exporting theoretical RTP + version metadata to make it possible.

### Versioning, hashing, certification identity
15. Every artifact carries `gameVersion`, `mathVersion` (semver) and `configHash` = sha256 over canonical concatenated configs (CONVENTIONS §5) — this satisfies the ≥128-bit-digest verification pattern (GLI-19 §2.3.2 uses SHA-family hashes; ours is 256-bit) and gives the lab a fingerprintable submission unit.
16. **Major-vs-minor change ledger:** generated `docs/decision-log.md` labels every post-release change proposal as fairness-affecting (RNG/scaling/mapping/game-rules/paytable ⇒ external retest, UKGC Annex A) or cosmetic (minor). The validation report includes the current configHash so any diff is provable.
17. **Selectable RTP profiles:** `game-config.json` supports profiles (default 0.9600; optional 0.94/0.92 per CONVENTIONS §11) as **separate, fully-simulated, separately-hashed configurations** — each profile gets its own simulation report and PAR-sheet columns, because each deployed RTP configuration certifies separately and displayed RTP must match the deployed build. Floor guard: reject any profile < 0.85 by default (Malta floor as the skill's conservative baseline; configurable downward only with an explicit jurisdiction override + warning).
18. RTP tolerance gate stays as CONVENTIONS §5: |simRTP − targetRTP| within 99% CI half-width AND ≤ 0.003 absolute at release-level rounds — stricter than the "advertised vs actual" mismatch labs flag.

### Jurisdiction policy schema (game-specific instance)
19. Ship `config/jurisdiction-policies.json` with named policies; **UNKNOWN jurisdiction ⇒ most restrictive default** (CONVENTIONS §9.6). Recommended presets derived from this research (values are engineering defaults, NOT legal conclusions):

```json
{
  "jurisdictionPolicies": [
    {
      "policyId": "default-demo",
      "autoplayEnabled": true,
      "quickSpinEnabled": true,
      "turboSpinEnabled": true,
      "slamStopEnabled": true,
      "animationSkipEnabled": true,
      "bonusBuyEnabled": true,
      "enhancedChanceEnabled": true,
      "minimumRoundDurationMs": null,
      "showRtp": true,
      "showMaximumWin": true,
      "showGameHistory": true,
      "sessionClockEnabled": true,
      "sessionNetPositionEnabled": true,
      "realityCheckIntervalMin": null,
      "ldwCelebrationSuppressed": true
    },
    {
      "policyId": "gb-strict",
      "autoplayEnabled": false,
      "quickSpinEnabled": false,
      "turboSpinEnabled": false,
      "slamStopEnabled": false,
      "animationSkipEnabled": false,
      "bonusBuyEnabled": false,
      "enhancedChanceEnabled": false,
      "minimumRoundDurationMs": 2500,
      "showRtp": true,
      "showMaximumWin": true,
      "showGameHistory": true,
      "sessionClockEnabled": true,
      "sessionNetPositionEnabled": true,
      "realityCheckIntervalMin": 60,
      "ldwCelebrationSuppressed": true
    },
    {
      "policyId": "unknown-most-restrictive",
      "autoplayEnabled": false,
      "quickSpinEnabled": false,
      "turboSpinEnabled": false,
      "slamStopEnabled": false,
      "animationSkipEnabled": false,
      "bonusBuyEnabled": false,
      "enhancedChanceEnabled": false,
      "minimumRoundDurationMs": 2500,
      "showRtp": true,
      "showMaximumWin": true,
      "showGameHistory": true,
      "sessionClockEnabled": true,
      "sessionNetPositionEnabled": true,
      "realityCheckIntervalMin": 60,
      "ldwCelebrationSuppressed": true
    }
  ]
}
```

   Notes: `animationSkipEnabled:false` in gb-strict because RTS 14E prohibits *reducing time until the result is presented* — skip may only compress post-result celebration, never the 2.5 s result cycle; implement skip as "seek within presentation after result display", and disable even that in gb-strict for safety. `minimumRoundDurationMs` 2500 = GB slots floor (5000 for non-slot casino rounds from 2025-01-17 — irrelevant here but recorded).

### Presentation-equivalence & win presentation
20. Equivalence invariant (CONVENTIONS §9.2) is also the compliance invariant for RTS 14E and GLI-19 §4.6: same manifest ⇒ same final balance in every presentation mode; turbo/skip alter presentation only. Ship the automated test.
21. Result display: final grid + total win shown clearly for a minimum on-screen duration (default ≥ 1000 ms, and never less than the jurisdiction minimum round duration) before the next round can start (RTS 7E).
22. Default display on game load must not depict the max win as if achieved (GLI-19 §4.2) — the idle/loading screen shows theme art or last real outcome, never a fake jackpot grid.

### Responsible-gaming & session hooks (engine-level API the skill generates)
23. Client exposes: `session.elapsedMs`, `session.netPositionMinor`, forced overlay channel for reality checks / operator interrupts (pause presentation, never settlement), autoplay module with loss-limit + stop-on-feature + per-policy disable, and honoured `game.disable`. MGA-style auto-spin interval alert supported when autoplay is on.
24. Accessibility defaults (CONVENTIONS §9.7 restated as compliance posture): reduced-motion variants, no colour-only information, flash ≤ 3/s, HUD contrast ≥ 4.5:1, ≥44 px touch targets.

### Lab-submission readiness (what the skill outputs so a lab package is assemblable)
25. Every run emits: **PAR sheet** (template §templates/par-sheet.md — must include symbol weights per reel set, per-feature RTP decomposition, hit frequency, volatility index, P(feature)/P(super)/P(ultimate), P(max win), max-exposure proof); **simulation-report.json** (gameVersion, mathVersion, configHash, simCodeVersion, lockfile hash, seeds, rounds, workers, exact command — CONVENTIONS §5, matching lab reproducibility expectations); **compliance-review.md** mapping each GLI-19/RTS clause above to evidence; **known-limitations.md** stating dev-RNG non-production status.
26. Release-level simulation default: **≥ 100,000,000 rounds** per RTP profile (industry pre-submission practice is 10M–100M; we take the top of the range), with per-tier feature simulation counts sufficient for 99% CI half-width < 0.5% of each tier's RTP contribution.
27. **Certification honesty (hard rule, CONVENTIONS §9.9):** outputs are "certification-ready candidates". Generated docs must never claim GLI-19/RTS compliance as fact; they claim *design alignment* with cited clauses. Every real-money release checklist includes: jurisdiction-specific legal review; independent mathematical verification; external security review; laboratory/regulator certification where applicable; operator/aggregator UAT — and a game is never labelled certified without actual certification evidence.
28. Timeline guidance surfaced to users: expect ~2–4 months lab cycle for a standard slot; budget one remediation loop (+4–6 weeks); pre-submission consultation recommended; any post-cert change to RNG/scaling/rules/paytable ⇒ external retest.
