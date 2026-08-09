# Consolidated Master Source Register (research files 01–13)

Generator: single-modern-slot-creator v1.0.0 · research job synth-sources · date 2026-08-08 ·
scope: single deduplicated register unifying the per-file source registers of
research/01–13. No new sources were added; no per-file register row was dropped.

## How to read this register

- **id** — master id `M1..Mn`. One row = one underlying document/page, or, where a
  per-file register row was itself a curated multi-URL bundle, that bundle kept whole.
- **cited in** — `NN:Sx` means row `Sx` of the source register in file `NN` (file key
  below). `(part)` = only part of that per-file row maps here; the remainder maps to
  another master entry (per-file aggregate rows were split when they clearly spanned
  two master sources).
- **type / date / jurisdiction** — carried over from the per-file rows (normalised).
- **reliability** — `A` primary (regulator, statute, standard, court/patent record,
  vendor-official doc, first-party spec/license); `B` reputable secondary (law firm,
  accredited test lab, academic, major trade press); `C` aggregator/affiliate/blog/forum
  — corroborate before any load-bearing use. Free-text nuance follows the grade.
- **⚠CS** — flag: source dated **before 2023** AND used to support a
  **currency-sensitive claim** (regulation in force, standard/version currency,
  licensing/IP status, pricing, platform policy). All ⚠CS entries are re-listed in
  the "Currency flags" section at the end with what to re-verify. Pre-2023 sources
  supporting stable facts (academic findings, historical events, math techniques,
  patents as historical records) are intentionally NOT flagged.

File key: `01` 01-slot-archetypes.md · `02` 02-mechanics-and-features.md ·
`03` 03-slot-math-and-simulation.md · `04` 04-technical-standards-rng-integrity.md ·
`05` 05-jurisdiction-rules.md · `06` 06-frontend-tech.md · `07` 07-rgs-architecture.md ·
`08` 08-ui-ux-conventions.md · `09` 09-motion-vfx.md · `10` 10-art-pipeline.md ·
`11` 11-audio-pipeline.md · `12` 12-market-patterns-ip.md ·
`13` 13-responsible-design-accessibility.md

---

## A. Technical standards & certification labs (M1–M26)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M1 | GLI Standards index (current versions) | standard-body page | retrieved 2026-08 | multi | https://gaminglabs.com/gli-standards/ | 01:S1 | A — version-currency checkpoint; re-check at build time |
| M2 | GLI-11 Gaming Devices in Casinos v3.0 (official PDF) | standard | 2016-09-21 | multi (GLI-adopting) | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | 02:S1; 04:S4; 13:S9 (part) | A — ⚠CS: 2016 doc supports "current version" claims; v3.0 confirmed latest as of 2026-08 (M1), but quote clause numbers from the PDF before compliance use |
| M3 | GLI-11 v2.0 (full text PDF) | standard | 2007 (posted 2016/2018) | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v2-0-Standard-FINAL.pdf | 01:S2; 02:S2 (part); 03:S3 | A — ⚠CS: superseded by v3.0; used for 75% floor / 1-in-50M rules, which are confirmed to persist into v3.0 |
| M4 | GLI-11 v2.1 Chapter 3 excerpt (digdia.com mirror) | standard excerpt | c.2007–2011 | multi | http://digdia.com/slots/GLI-11%20v2.1%20Gaming%20Devices%20in%20Casinos%20Chapter%203.pdf | 02:S2 (part); 03:S4; 04:S6 | B — ⚠CS: unofficial mirror of a superseded version; used for near-miss/background-cycling wording lineage |
| M5 | GLI-11 v1.3→v2.0 rule diffs (official PDF) | standard-body doc | 2018 (posted) | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-v1-3-v2-0-Rule-Diffs.pdf | 01:S4 | A — historical clarification of the base-game-only 75% rule |
| M6 | GLI-11 v3.0 Revision History (official PDF) | standard-body doc | 2016 | multi | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-V3-0-Revision-History.pdf | 04:S5 | A |
| M7 | GLI-12 Progressive Jackpots v3.0 (official PDF; v2.1 2011 lineage) | standard | 2026-01 (v2.1 2011-09-06) | multi | https://gaminglabs.com/wp-content/uploads/2026/01/GLI-12-v3-0-FINAL.pdf | 01:S3; 02:S4; 03:S5 | A — current; also re-confirms GLI-11 75% floor cross-reference |
| M8 | GLI-19 Interactive Gaming Systems v3.0 (official PDF) | standard | 2020-07-17 | multi (online; ON/DK/Bahamas/US tribal adopters) | https://gaminglabs.com/wp-content/uploads/2024/06/GLI-19-Interactive-Gaming-Systems-v3.0.pdf | 02:S3; 04:S1; 05:S36; 07:S11; 13:S10 | A — ⚠CS: 2020 doc supports "current version" claims; v3.0 confirmed current as of 2026-08, but re-check for v3.x errata/v4 drafts; exact §-numbering of some clauses reconstructed from lab reports (see 04 uncertainties) |
| M9 | GLI-19 v2.0 (Bahamas Gaming Board mirror) | standard | 2013 | multi | https://www.gamingboardbahamas.com/wp-content/uploads/2023/04/GLI-19_Interactive_Gaming_Systems_v2.0_Final.pdf | 04:S30; 09:S13 (part) | A — ⚠CS: superseded; used ONLY for clause-text lineage (§2.7.2 incomplete games, §2.3.7 recall) |
| M10 | GLI press release — GLI-19 v3.0 released | standard-body press | 2020-07-20 | multi | https://gaminglabs.com/press-releases/gaming-laboratories-international-gli-releases-revised-standard-gli-19-standards-for-interactive-gaming-systems-v3-0/ | 04:S2 | A |
| M11 | GLI Composite Submission Requirements v2.0 | standard-body doc | 2022-01 | multi | https://gaminglabs.com/wp-content/uploads/2022/01/GLI-Composite-Submission-Requirements-V2.0.pdf | 04:S18 | A — ⚠CS: submission requirements evolve; confirm current version with the lab per engagement |
| M12 | GLI — Technical Specifications for RNG Testing | lab (vendor docs) | current | multi | https://gaminglabs.com/getting-started/technical-specifications-for-rng-testing/ | 04:S24 | A |
| M13 | GLI — Game Mathematics / %RTP Analysis service page | lab (vendor docs) | current 2026 | multi | https://gaminglabs.com/services/igaming/game-mathematics-percentage-return-to-player-rtp-analysis/ | 03:S6; 04:S29 | A — service-scope description |
| M14 | Yogonet — GLI-11 v3.0 public release | industry press | 2016-09-26 | multi | https://www.yogonet.com/international/news/2016/09/26/40699-gli-publicly-releases-updated-version-of-gli11-gaming-devices-standard | 04:S28 | B — date corroboration only |
| M15 | NIST SP 800-22 Rev.1a (publication page) | standard | 2010; review note 2025-02-03 | US/intl | https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final | 04:S12 | A — ⚠CS: revision decided 2022, may land any time; treat test-battery list as configuration, not constant |
| M16 | NIST CSRC — decision to revise SP 800-22 Rev.1a | standards body | 2022-04-19 | US/intl | https://csrc.nist.gov/news/2022/decision-to-revise-nist-sp-800-22-rev-1a | 04:S13 | A |
| M17 | iTech Labs — RNG Testing & Certification | test lab | current | multi | https://itechlabs.com/compliance-testing/rng-testing/ | 04:S14 | A (lab methodology) |
| M18 | iTech Labs — FAQ (PRNG policy, MT19937, reseeding) | test lab | current | multi | https://itechlabs.com/faqs/ | 04:S15 | A |
| M19 | iTech Labs RNG certificate (SkillOnNet, Ontario) | lab certificate | 2022-04-05 | ON/GB refs | https://itechlabs.com/certificates/SkillOnNet/RNG_Certificate_Ont_SkillOnNet_05Apr22.pdf | 04:S16 | A — illustrative artifact (certificate contents/format), not a currency claim |
| M20 | iTech Labs RTP audit certificate + methodology (BeSoftware) | lab certificate | current 2026 | multi | https://itechlabs.com/certificates/besoftware/BeSoftware_RTP_audit_certificate.pdf | 03:S20 | A — illustrative artifact |
| M21 | eCOGRA — RNG certification service | test lab | current | GB/NL/ES+ | https://ecogra.org/services/random-number-generator-rng-certification/ | 04:S17 | A |
| M22 | Quinel RNG testing report vs GLI-19 (Booongo; Scribd mirror) | lab report | c.2020s | multi | https://www.scribd.com/document/937615254/Booongo-QUINEL-RNG-Certificate | 04:S25 | B — unofficial mirror; used for period-requirement wording corroboration |
| M23 | SDLC Corp — RNG certification for casino games | industry blog | 2024–2025 | multi | https://sdlccorp.com/post/rng-certification-for-casino-games/ | 04:S26 | C |
| M24 | TwinWin / Slots5 — slot certification guides | industry blog | 2025–2026 | multi | https://twinwingames.com/slot-certification-guide/ | 04:S27 | C |
| M25 | GamixLabs — simulation farm + certification workflow | vendor docs | 2025–2026 | n/a | https://gamixlabs.com/simulation.html | 03:S21 | B (vendor self-description) |
| M26 | wizards.us / gamblingkenya — certification-report articles | industry blog | 2025–2026 | n/a | https://wizards.us/blog/casino-game-testing/ | 03:S21b | C — low authority; heuristics only |

## B. Great Britain regulation (M27–M59)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M27 | UKGC RTS 14 — Responsible product design (official page) | regulator | pub 2021-02-02; upd 2026-01-12 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-14-responsible-product-design | 04:S8; 05:S1; 08:S1; 09:S1; 11:S6; 13:S1 | A — fetched live; core 14A–14G wording |
| M28 | UKGC RTS 13 — Time requirements and reality checks (official page) | regulator | upd 2025-01-21 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-13-time-requirements-and-reality-checks | 05:S11; 08:S2; 09:S5; 13:S4 | A |
| M29 | UKGC RTS 8 — Auto-play functionality (official page) | regulator | pub 2021-02-02; upd 2025-01-21 | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-8-autoplay-functionality | 08:S34; 09:S2; 13:S5 (part) | A — fetched live 2026-08 |
| M30 | UKGC RTS 7 — Generation of random outcomes (official page) | regulator | current (2021 consolidation) | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-7-generation-of-random-outcomes | 04:S7; 07:S10 (part); 13:S3 | A |
| M31 | UKGC RTS 1 & RTS 2 (official pages) | regulator | current | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-1-customer-account-information | 07:S10 (part) | A — account history, net-position/result display |
| M32 | UKGC RTS 3 — Rules, game descriptions, likelihood of winning | regulator | current 2026 | GB | https://www.gamblingcommission.gov.uk/manual/remote-gambling-and-software-technical-standards/rts-3-rules-game-descriptions-and-the-likelihood-of-winning | 08:S3 | A |
| M33 | UKGC RTS 10 — Interrupted gambling | regulator | current | GB | https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards/rts-10-interrupted-gambling | 02:S6; 07:S9 | A — note: 02:S6 cites an odd mirror path (report/young-people…/rts-10…); same standard text |
| M34 | UKGC Remote gambling & software technical standards (Feb 2021 PDF) | regulator | 2021-02 | GB | https://assets.ctfassets.net/j16ev64qyf6l/1KdHqgC205yZOnZbKKhjoz/a18598c19de61ef1f515c4dc98fe7d06/Remote_gambling_and_software_technical_standards__Feb21_.pdf | 08:S7 | A — ⚠CS: baseline snapshot; superseded by per-standard page updates (2025/2026); use live pages (M27–M33) for current wording |
| M35 | UKGC news — package of changes making online games safer by design | regulator | 2021-02-02 | GB | https://www.gamblingcommission.gov.uk/news/article/gambling-commission-announces-package-of-changes-which-make-online-games | 01:S5 | A — ⚠CS: 2021 announcement; rules confirmed still in force via M27–M29 (updated 2025/2026) |
| M36 | UKGC consultation response — introducing speed-of-play limits | regulator | 2021 | GB | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/summary-of-responses-introducing-speed-of-play-limits | 05:S3; 09:S4 | A — ⚠CS: 2021 rationale doc (game-cycle definition); current wording lives in RTS 14 (M27) |
| M37 | UKGC consultation response — prohibiting player-led spin-stop features | regulator | 2021 | GB | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/summary-of-responses-prohibiting-player-led-spin-stop-features | 09:S3 | A — ⚠CS: 2021 rationale; slam-stop ban confirmed in force via M27 |
| M38 | UKGC consultation response Annex 1 — summary of RTS changes (2024) | regulator | 2024-05 | GB | https://www.gamblingcommission.gov.uk/consultation-response/online-games-design-and-reverse-withdrawals/ogdrw-annex-1-summary-of-changes-to-rts | 08:S4; 13:S2 (part) | A |
| M39 | UKGC regulatory decisions — Proposal 2: speed of play | regulator | current | GB | https://www.gamblingcommission.gov.uk/guidance/regulatory-decisions-procedures-and-guidance-for-regulatory-hearings/proposal-2-speed-of-play | 05:S6 | A |
| M40 | UKGC — Proposal 6: display of net position and time spent | regulator | 2020–2021 | GB | https://www.gamblingcommission.gov.uk/guidance/regulatory-decisions-procedures-and-guidance-for-regulatory-hearings/proposal-6-display-of-net-position-and-time-spent | 08:S31 | A — ⚠CS: 2020–21 definition doc for RTS 2E net position; confirm against live RTS 2 (M31) |
| M41 | UKGC Testing Strategy (incl. Annex A major/minor updates) | regulator | upd 2025-10-31 | GB | https://www.gamblingcommission.gov.uk/strategy/testing-strategy-for-compliance-with-remote-gambling-and-software-technical/8-annex-a-major-and-minor-game-and-software-updates | 04:S9 | A |
| M42 | UKGC — Test houses page / framework | regulator | current | GB | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/test-houses | 04:S10 | A |
| M43 | gamingcompliance.io — UKGC RTS explorer | industry tool (editorial RTS summary) | compiled 2026-04 | GB | https://gamingcompliance.io/ukgc/remote-technical-standards/ | 02:S5; 05:S2; 08:S32 | C — secondary restatement of the RTS; verify exact wording against UKGC pages (M27–M33) before legal reliance |
| M44 | gamingcompliance.io — GLI-19 v3.0 certification explainer | industry analysis | c.2024–2025 | multi | https://gamingcompliance.io/gli-19-v3-0-what-every-online-casino-game-must-meet-to-pass-certification/ | 04:S3; 07:S16 | C — §-level detail useful, confirm numbering against M8 PDF |
| M45 | Wiggin LLP — remote game design changes taking effect 17 Jan 2025 | law-firm brief | 2024-12 | GB | https://www.wiggin.co.uk/insight/remote-game-design-changes-taking-effect-17-january-2025/ | 01:S12; 04:S23; 05:S4; 08:S5; 13:S2 (part) | B — high-quality secondary on the 2025 extension package |
| M46 | Harris Hagan — reminder: remote games design changes 17 Jan 2025 | law-firm brief | 2025-01 | GB | https://www.harrishagan.com/reminder-changes-to-remote-games-design-requirements-come-into-force-on-17-january-2025/ | 08:S6; 09:S27; 11:S15 | B — corroborates M45 |
| M47 | SBC News — UKGC bans online slots autoplay & quickspin | industry press | 2021-02-02 | GB | https://sbcnews.co.uk/igaming/2021/02/02/ukgc-bans-online-slots-autoplay-and-quickspin-features/ | 01:S7; 02:S7; 04:S22 | B — ⚠CS: 2021 news; rules confirmed current via M27/M29 |
| M48 | CasinoBeats — UKGC introduces package of enhanced protections | industry press | 2021-02-02 | GB | https://casinobeats.com/2021/02/02/ukgc-introduces-package-of-enhanced-protections-for-online-slots/ | 11:S14 | B — ⚠CS: same 2021 package; current via M27–M29 |
| M49 | CMS law — Gambling Commission calls for feature buy-ins to be removed | law-firm brief | 2020-01 | GB | https://cms.law/en/gbr/legal-updates/Gambling-Commission-calls-for-Feature-Buy-Ins-to-be-removed | 05:S7 | B — ⚠CS: 2020 event report; basis (RTS 3A+14A) of the ongoing GB buy prohibition — confirm current LCCP/RTS wording before shipping GB copy |
| M50 | CasinoBeats — UKGC issues slots 'feature buy-in' warning | industry press | 2020-01-17 | GB | https://casinobeats.com/2020/01/17/ukgc-issues-slots-feature-buy-in-warning-to-operators/ | 05:S52 | B — ⚠CS: same 2020 enforcement position; no later codification found (see 05/12 uncertainties) |
| M51 | Casino Professor — bonus buy slots UK | industry press | 2024–2026 | GB | https://casino-professor.com/en/casino-guides/bonus-buy-slots-uk/ | 02:S8; 12:S36 | C — affiliate; mechanism description only |
| M52 | CasinoGrounds — bonus-buy regulations UK/ON/NL/MGA | industry blog | 2024–2026 | GB/ON/NL/MT | https://casinogrounds.com/blog/bonus-buy-slots-regulations-in-uk/ | 05:S8; 08:S25 (part); 12:S37 | C — [observed]-grade; corroborate per jurisdiction |
| M53 | Slots Temple — bonus buy ban explainer | industry press | 2024–2026 | GB | https://www.slotstemple.com/news-and-blog/bonus-buy-ban-everything-you-need-to-know/ | 02:S35 | C — affiliate |
| M54 | Poppleston Allen — online slots stake-limit regulations (Apr 2025) | law-firm brief | 2025 | GB | https://www.popall.co.uk/news-publications/news/new-regulations-made-governing-online-slots-stake-limits-take-effect-from-early-april-2025 | 05:S9 | B — SI wording £5/£2, effective dates |
| M55 | UK Gov — new £2 maximum stake for under-25s (online slots) | government | 2025 | GB | https://gov.uk/government/news/new-2-maximum-stake-for-under-25s-playing-online-slots | 05:S10 | A |
| M56 | OLBG — UK slot game regulation changes | industry press | 2025 | GB | https://www.olbg.com/slots/articles/uk-slot-game-regulations | 12:S20 | C — affiliate recap |
| M57 | iGB — Betfred owner fined for LDW/RTS breaches | industry press | 2022 | GB | https://igamingbusiness.com/legal-compliance/betfred-owner-fined-online-slot-breach/ | 01:S9 | B — historical enforcement precedent (£240k); not a currency claim |
| M58 | intergameonline — Stakelogic penalty, stopwatch spin-speed test | industry press | 2026 | GB | https://www.intergameonline.com/igaming/news/stakelogic-penalty-gambling-commission-stopwatch-test-slot-spin-speed | 05:S5 | B — RTS 14D enforcement datapoint (£122,835; 1.97s) |
| M59 | FTI Consulting — Gambling Compliance 2026: Are You Keeping Up | advisory | 2026 | GB | https://www.fticonsulting.com/insights/articles/gambling-compliance-2026-are-you-keeping-up | 05:S51 | B — 2026 wagering-cap / RTS 12B changes |

## C. Europe & other jurisdictions (M60–M104)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M60 | GlüStV 2021 — §22a, §6h(7), §6c primary text (state law portals) | statute | in force 2021-07-01 | DE | https://gesetze.berlin.de/bsbe/document/jlr-Gl%C3%BCStVtrBE2021pP22a (+ bravors.brandenburg.de) | 13:S6 | A — ⚠CS: treaty text current but stake regime overlaid by GGL tiered €1/€3/€5 from 2026-07-01 (M63–M65); end-2026 GlüStV evaluation pending |
| M61 | GlüStV 2021 §22a secondary explainers (IDnow glossary; rakeback.com; iGB) | regulator via secondary | 2021+ | DE | https://www.idnow.io/glossary/gluecksspielstaatsvertrag-glustv/ | 09:S7 | C — ⚠CS: 2021-era summaries; verify against GGL primary text; €1 stake now only the statutory default |
| M62 | ICLG Gambling Laws & Regulations 2026 — Germany | legal guide | 2026 | DE | https://iclg.com/practice-areas/gambling-laws-and-regulations/germany | 05:S12 | B |
| M63 | iGB — Germany raises online slot stake limits (tiered, tracking duty) | industry press | 2026-07 | DE | https://igamingbusiness.com/legal-compliance/regulation/germany-raises-online-slot-stake-limits-operators-to-track-player-behaviours/ | 05:S43; 09:S33 (part); 13:S24 (part) | B |
| M64 | CasinoGuardian — Germany implements tiered stake system | industry press | 2026-07-10 | DE | https://www.casinoguardian.co.uk/2026/07/10/germany-implements-tiered-stake-system-for-online-slot-machines/ | 05:S45; 09:S33 (part); 13:S24 (part) | C — corroborates M63/M65 |
| M65 | GGL — FAQ zur Erhöhung des Einsatzlimits (official) | regulator | 2026 | DE | https://www.gluecksspiel-behoerde.de/de/news/haeufig-gestellte-fragen-faq-zur-erhoehung-des-anbieteruebergreifenden-einzahlungslimits-bei-online-gluecksspielen-und-die-pruefung-der-wirtschaftlichen-leistungsfaehigkeit | 05:S44 | A — qualification criteria for €5 tier |
| M66 | BrightSideOfNews — Germany GGL online slots review 2026 | industry press | 2026 | DE | https://brightsideofnews.com/gambling/germany-ggl-online-slots-review-2026/ | 05:S13 | C — low authority; €2–5 proposal / 2027 timeline claims |
| M67 | Landesfachstelle Glücksspielsucht NRW — criticism of stake uplift | state addiction body | 2026 | DE | https://gluecksspielsucht-nrw.de/news/erhoehung-des-einsatzlimits-bei-virtuellen-automatenspielen-landesfachstelle-sieht-gravierende-risiken-fuer-spielerschutz/ | 05:S46 | B — reversal-risk context |
| M68 | Saxony-Anhalt info sheet on slots (via R. Lenzhofer LinkedIn summary) | regulator guidance via secondary | 2021-11 | DE | https://www.linkedin.com/pulse/17th-novembers-info-sheet-from-saxony-anhalt-slots-robert-lenzhofer/ | 09:S8 | C — ⚠CS: 2021 interpretation of the 5s-average rule ("120 spins/10 min"); GGL–DOCV averaging talks ongoing; verify current GGL technical guidance |
| M69 | LIFS 2018:8 — Lotteriinspektionens föreskrifter om tekniska krav (lagen.nu full text) | statute | 2018 | SE | https://lagen.nu/lifs/2018:8 | 05:S47; 09:S32 (part); 13:S23 | A — ⚠CS: superseded by SIFS 2022:3 (M70); cited for the 3-second-per-round wording lineage incl. autoplay |
| M70 | SIFS 2022:3 — Spelinspektionens föreskrifter om tekniska krav samt ackreditering | regulator | decided 2022-12-02 | SE | https://www.spelinspektionen.se/lagar--villkor/foreskrifter/ | 05:S48; 09:S32 (part); 13:S23 (part) | A — ⚠CS (borderline: Dec 2022): current instrument, but a June-2026 replacement draft is in consultation (M72); quote exact section numbers from the primary PDF |
| M71 | Spelinspektionen — official site (onlinekasino pages) | regulator | current | SE | https://www.spelinspektionen.se/spelare/spelform/onlinekasino/ | 05:S14 | A |
| M72 | Focus Gaming News — Spelinspektionen proposes new binding regulations (June 2026 draft) | industry press | 2026-06 | SE | https://focusgn.com/spelinspektionen-proposes-new-binding-regulations-to-replace-the-2018-rules | 05:S49; 09:S32 (part); 13:S7 (part) | B — 60-round autoplay cap / idle logout draft; adoption unconfirmed |
| M73 | gamingcompliance.io — Sweden page | industry tool | current | SE | https://gamingcompliance.io/sweden/ | 13:S7 (part) | C — secondary summary |
| M74 | BoEkonomi — "Tresekundersregeln" explainer | industry blog | 2024–2025 | SE | https://www.boekonomi.se/okategoriserat/tresekundersregeln-varfor-kanns-svenska-slots-annorlunda/ | 05:S15 | C — [observed]-grade; primary basis is M69/M70 |
| M75 | EuropeanGaming — Sweden's single-bonus rule / bonus debate | industry press | 2025-10 | SE | https://europeangaming.eu/portal/latest-news/2025/10/07/193266/swedens-bonus-debate-and-the-push-for-stronger-licensing-reforms/ | 05:S16 | B |
| M76 | iGamingToday — Sweden reshapes slot machine rules ahead of 2026 reforms (SIFS 2025:1) | industry press | 2025 | SE | https://www.igamingtoday.com/sweden-slot-machine-hospitality-rules-2025/ | 05:S17 | C |
| M77 | Bigwinboard — Swedish online gambling re-regulation explainer | industry press | 2019 | SE | https://www.bigwinboard.com/swedish-online-gambling/ | 09:S9 | C — ⚠CS: 2019 summary of the 3s rule; rule confirmed by primary M69/M70 |
| M78 | iGB — Sweden to ban autoplay and reverse withdrawals | industry press | 2023 | SE | https://igamingbusiness.com/legal-compliance/regulation/sweden-ban-autoplay-reverse-withdrawal/ | 09:S10 | B — note: autoplay currently permitted under 3s rule; ban was proposal-stage (cross-check M72) |
| M79 | Play'n GO — Swedish bonus-buy polling | vendor press | 2023–2024 | SE | https://www.playngo.com/post/swedish-slot-players-think-bonus-buy-games-should-be-banned | 08:S26 | B — vendor-commissioned sentiment |
| M80 | KSA autoplay enforcement coverage (GamblingInsider 2025; iGB 2022 warning; EuropeanGaming 2025) | press on regulator action | 2022–2025 | NL | https://www.gamblinginsider.com/news/28597/ksa-cracks-down-on-online-gambling-autoplay-in-the-netherlands | 05:S18; 13:S11 | B — enforcement facts multi-corroborated |
| M81 | ICLG Gambling Laws & Regulations 2026 — Netherlands | legal guide | 2026 | NL | https://iclg.com/practice-areas/gambling-laws-and-regulations/netherlands/ | 05:S19 | B |
| M82 | intikkertje.nl — bonus buy verboden in Nederland | industry blog (NL) | 2024 | NL | https://intikkertje.nl/bonus-buy-verboden-in-nederland/ | 05:S20 | C — [observed]; art. 3.8 Regeling KOA basis; verify primary text |
| M83 | GamblingInsider — KSA new licence-application rules from 2026 | industry press | 2025 | NL | https://www.gamblinginsider.com/news/30998/ksa-introduces-new-rules-for-online-gambling-licence-applications-from-2026 | 05:S21 | B |
| M84 | Legal500 — Netherlands gambling law country guide | legal guide | 2024–2026 | NL | https://www.legal500.com/guides/chapter/the-netherlands-gambling-law/ | 09:S12 | B |
| M85 | BOE-A-2023-6735 — Real Decreto 176/2023 (official gazette) | statute | 2023-03-14 | ES | https://www.boe.es/buscar/doc.php?id=BOE-A-2023-6735 | 05:S24 | A — primary text |
| M86 | ECIJA — legal memo on RD 176/2023 safer gambling environments | law-firm brief | 2023 | ES | https://www.ecija.com/en/news-and-insights/legal-memo-on-the-new-royal-decree-176-2023-on-safer-gambling-environments/ | 05:S23; 13:S12 (part) | B |
| M87 | Chambers Gaming Law 2025 — Spain | legal guide | 2025 | ES | https://practiceguides.chambers.com/practice-guides/gaming-law-2025/spain | 05:S22; 13:S12 (part) | B — 3s online slot spin duration |
| M88 | BettorsInsider — Spain RD 520/2026 cross-operator deposit limits | industry press | 2026-06 | ES | https://bettorsinsider.com/sports-betting/2026/06/29/spain-sets-cross-operator-deposit-limits-for-online-gambling-under-new-royal-decree/ | 05:S25 | C — verify against BOE when load-bearing |
| M89 | Mondaq — iGaming in Italy: rules and regulations | law-firm brief | 2025 | IT | https://www.mondaq.com/italy/gaming/1657022/igaming-in-italy-rules-and-regulations | 05:S26 | B |
| M90 | PlayerProtectionHub — ADM updates IT checklist for concessions | industry press | 2025-04 | IT | https://playerprotectionhub.com/2025/04/adm-updates-italian-it-checklist-for-gambling-concessions/ | 05:S27 | C |
| M91 | eCOGRA — iGaming insights: Italy online gambling market | test-lab compliance overview | 2024–2026 | IT | https://ecogra.org/igaming/igaming-insights-italy-online-gambling-market/ | 05:S50 | B — 90% RTP floor for online slots |
| M92 | Spillemyndigheden — Technical requirements online casino & betting v2.3 | regulator | 2021 (v2.3) | DK | https://www.spillemyndigheden.dk/uploads/2021-04/Technical%20requirements%20%20online%20casino%20and%20betting%202.3%20-%20WT.pdf | 05:S28 | A — ⚠CS: 2021 version; confirm v2.3 still current at build time |
| M93 | iGB — Belgium bans under-21s (+ Bird & Bird update) | industry press / law firm | 2024 | BE | https://igamingbusiness.com/legal-compliance/licensing/belgium-implements-new-rules-banning-all-under-21s-from-gambling/ | 05:S29 | B |
| M94 | SBC News — Belgium €200 weekly deposit/loss limit (+gamblingclub.be explainer) | industry press | 2022–2024 | BE | https://sbcnews.co.uk/europe/2022/10/24/belgium-loss-limit/ | 05:S30 | B — ⚠CS: 2022 limit value; confirm current amount before BE release |
| M95 | ICLG Gambling Laws & Regulations 2026 — Belgium | legal guide | 2026 | BE | https://iclg.com/practice-areas/gambling-laws-and-regulations/belgium/ | 05:S31 | B |
| M96 | MGA Directive 2 of 2018 — Player Protection Directive (v3 PDF) | regulator | v3 2023-01 | MT | https://www.mga.org.mt/app/uploads/Directive-2-of-2018-Player-Protection-Directive.pdf | 04:S20; 05:S37 | A — current consolidated version |
| M97 | MGA press release — RTP streamlined to 85% | regulator | 2021-05 | MT | https://www.mga.org.mt/the-mga-streamlines-the-return-to-player-percentage-applicable-to-both-remote-and-land-based-sectors/ | 04:S19 | A — ⚠CS: 2021 announcement; 85% value confirmed current via M96 |
| M98 | MGA official pages — remote gaming regs amendments; player protection hub/FAQ (+Yogonet summary) | regulator (+press) | 2016/2021 → current | MT | https://www.mga.org.mt/amendments-remote-gaming-regulations-publication-return-player-directive/ ; https://www.mga.org.mt/licensee-hub/compliance/player-protection/ | 08:S11; 09:S11 | A/B mix — official pages primary; Yogonet part secondary |
| M99 | MGA RTP 92→85% press coverage (iGB; EuropeanGaming/Yogonet) | industry press | 2021 | MT | https://igamingbusiness.com/casino-games/product-technology/malta-gaming-authority-to-lower-minimum-rtp-threshold-to-85/ ; https://europeangaming.eu/portal/compliance-updates/2021/05/31/93389/malta-gaming-authority-lowers-rtp/ | 04:S21; 05:S39 | B — ⚠CS: 2021 change context; current value via M96 |
| M100 | Mondaq — updates to the MGA Player Protection Directive | law-firm brief | 2023 | MT | https://www.mondaq.com/gaming/1273866/updates-to-the-player-protection-directive | 05:S38 | B — 2023 amendments, 2024 deadline |
| M101 | CasinoGuardian — MGA mystery-shopper player-protection gaps | industry press | 2026-02 | MT | https://www.casinoguardian.co.uk/2026/02/18/malta-gaming-authority-unveils-hidden-gaps-in-gambling-site-player-protections/ | 05:S40 | C |
| M102 | Coincub / Zitadelle — Curaçao LOK regime guides | industry advisory | 2025–2026 | CW | https://coincub.com/blog/curacao-gaming-license/ | 05:S41 | C — advisory summaries |
| M103 | Curaçao Gaming Authority (CGA) — online-gaming portal | regulator | current | CW | https://www.cga.cw/regulation/online-gaming | 05:S42 | A |
| M104 | iGB — Finland draft regulations ban online autoplay | industry press | 2025 | FI | https://igamingbusiness.com/legal-compliance/finland-release-draft-regulations-reformed-gambling-regime/ | 09:S30 | B — draft-stage; track to adoption |

## D. North America regulation (M105–M114)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M105 | AGCO Registrar's Standards for Internet Gaming (full text) | regulator | in force 2022-04-04; amended to 2024 | CA-ON | https://www.agco.ca/en/book/export/html/245361 (+ /guides/registrars-standards-internet-gaming) | 05:S32; 09:S6; 13:S8 | A — live page fetched; exact standard numbers for internet-gaming claims still flagged for legal review in 08 |
| M106 | AGCO — Casino EGD & Gaming Systems Minimum Technical Standards §11 | regulator | current | CA-ON (land-based) | https://www.agco.ca/en/lottery-and-gaming/responsibilities-and-resources/11-game-behaviour | 08:S10 | A — land-based; do not map 1:1 onto internet standards |
| M107 | AGCO — iGaming Standards (OLG; superseded Apr 2022) | regulator | archived 2022 | CA-ON | https://www.agco.ca/en/book/export/html/243256 | 08:S10b | A — ⚠CS: explicitly superseded; lineage/reference only, never cite as current |
| M108 | N.J.A.C. 13:69E-1.28A (Justia mirror) | regulation | current codification | US-NJ | https://regulations.justia.com/states/new-jersey/title-13/chapter-69e/subchapter-1/section-13-69e-1-28a | 05:S33 | A — 83% min RTP; mirror of official code |
| M109 | MGCB — internet gaming technical bulletins & standards | regulator | current | US-MI | https://www.michigan.gov/mgcb/internet-gaming-and-fantasy-contests/technical-bulletins-and-memos | 05:S34 | A — GLI-19 v3.0 adoption via R 432.633 |
| M110 | 58 Pa. Code Subpart L — Interactive Gaming (official) | regulation | current | US-PA | https://www.pacodeandbulletin.gov/Display/pacode?file=%2Fsecure%2Fpacode%2Fdata%2F058%2FsubpartVIILtoc.html | 05:S35 | A |
| M111 | 58 Pa. Code §461a.12 — Progressive slot machines (Cornell LII) | regulation | current | US-PA | https://www.law.cornell.edu/regulations/pennsylvania/58-Pa-Code-SS-461a-12 | 02:S33 | A (mirror) |
| M112 | PGCB Technical Standard §461b.1 (variance/SD calc) | regulator | current | US-PA | https://pgcb.pa.gov/files/technical_standards/Technical_Standards_Section_461b1.pdf | 03:S7 | A — codified VI = 1.96σ |
| M113 | 25 CFR §547.14 — minimum technical standards for RNGs (Cornell LII) | regulation | in force | US tribal (NIGC) | https://www.law.cornell.edu/cfr/text/25/547.14 | 04:S11 | A |
| M114 | Indiana 68 IAC 25-10-4 (Justia) | regulation | current codification | US-IN | https://regulations.justia.com/states/indiana/title-68/article-25/rule-10/section-4 | 07:S17 | A — interruption rules |

## E. Accessibility & responsible-design standards and research (M115–M132)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M115 | W3C WCAG 2.2 spec + Understanding docs (2.5.8 target size, 2.5.5, 1.4.x contrast, 2.2.2, 2.3.3, 2.4.11, 2.5.7) | standard | Rec 2023-10; ISO/IEC 40500:2025 | global | https://www.w3.org/TR/WCAG22/ ; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 08:S8; 08:S8b; 13:S13 | A — 08:S8b bundles Pope Tech/MotionSpec explainers (C-grade) with the W3C docs |
| M116 | WCAG SC 2.3.1 Understanding + techniques G15/G19/G176 (+Stark/NYU explainers) | standard | WCAG 2.0–2.2 lineage | global | https://w3c.github.io/wcag21/understanding/three-flashes-or-below-threshold.html ; https://www.w3.org/TR/WCAG20-TECHS/G15.html | 09:S14; 13:S21 | A — flash math (3/s, red flash, area); area formula assumes 1024×768 viewing model (see 13 U7) |
| M117 | Deque / AAArdvark — SC 2.5.5 Target Size (Enhanced) | standard explainer | current | global | https://dequeuniversity.com/resources/wcag2.1/2.5.5-target-size | 08:S9 | B — 44px AAA; Apple 44pt / Material 48dp comparison |
| M118 | Mondaq / WH Partners — EU Accessibility Act & online gambling | law-firm brief | 2025 | EU | https://www.mondaq.com/gaming/1630338/the-eu-accessibility-act-and-its-relevance-for-online-gambling-operators | 08:S12 | B — EAA scope legally unsettled for in-game content (see 08 U5) |
| M119 | Game Accessibility Guidelines (colour-alone) + Xbox XAG 103 + MDN prefers-reduced-motion + Pope Tech animation guide | community/vendor standards | ongoing; 2025 | global | https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/ ; https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103 | 08:S27; 13:S20 | B — de-facto game-industry norms, not law |
| M120 | Game Accessibility Guidelines — flickering images & repetitive patterns | community standard | current | global | https://gameaccessibilityguidelines.com/avoid-flickering-images-and-repetitive-patterns/ | 09:S16 | B |
| M121 | Microsoft Xbox Accessibility Guideline 102 (contrast) | vendor standard | current | global | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102 | 08:S28 | B |
| M122 | Microsoft Xbox Accessibility Guideline 118 (photosensitivity) | vendor standard | current | global | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/118 | 09:S15 | B |
| M123 | web.dev — prefers-reduced-motion | vendor docs | current | global | https://web.dev/prefers-reduced-motion/ | 09:S22 | A (platform docs) |
| M124 | Accessibly / TestDevLab — video-game accessibility overviews | blog | 2024–2025 | global | https://accessiblyapp.com/blog/video-game-accessibility/ | 08:S27b | C — population stats only |
| M125 | Canvas accessibility techniques (W3C HTML-WG wiki; TPGi/Vispero; PaulJAdam demos) | vendor docs/standard | 2011–ongoing | global | https://www.w3.org/html/wg/wiki/AddedElementCanvas ; https://www.tpgi.com/html5-canvas-accessibility-in-firefox-13/ | 13:S19 | B — sub-DOM fallback technique; re-verify AT support at build time |
| M126 | Cambridge BPP — "Cue the sad trombone" (LDW celebratory-sound audit) | academic | 2021 (online) / 2023 (issue) | GB | https://www.cambridge.org/core/journals/behavioural-public-policy/article/cue-the-sad-trombone-uk-gambling-regulations-have-not-prevented-the-misuse-of-celebratory-sound-effects-in-online-slots/5EDC0F428BC06371179A8636250BA204 | 01:S8; 11:S13 | B — research finding (17/26 non-compliant); files 01 and 11 date it differently (2021 vs 2023) |
| M127 | Dixon, Harrigan, Sandhu, Collins, Fugelsang — "Losses disguised as wins…" (Addiction 105(10)) | academic | 2010 | — | https://uwaterloo.ca/reasoning-decision-making-lab/sites/default/files/uploads/files/DixFugetal_10c.pdf | 13:S14 | B — stable research finding |
| M128 | Dixon et al. — sound-unmasks-LDW studies (J Gambling Studies 2013/2015; follow-ups to 2020) | academic | 2013–2020 | — | https://pubmed.ncbi.nlm.nih.gov/24198088/ ; https://lumsa.it/sites/default/files/pdf/DIXON_2015.pdf | 11:S16; 13:S15 | B |
| M129 | Near-miss & stop-button studies (Dixon et al. 2017 PMC5846825; Springer 2019 review) | academic | 2017/2019 | — | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5846825/ ; https://link.springer.com/article/10.1007/s10899-019-09891-8 | 13:S17 | B |
| M130 | Ladouceur & Sévigny (2005) stopping-device study; Chu et al. (2018) | academic | 2005; 2018 | — | https://link.springer.com/article/10.1007/s10899-005-3028-5 ; https://gamblingresearch.sites.olt.ubc.ca/files/2018/08/Chu_stoppers_AAM.pdf | 13:S18 | B — stable findings |
| M131 | Harrigan (2007) EGM structural characteristics; Griffiths (1993); Parke & Griffiths (2006) (+ 2009 PAR-sheets mirror) | academic | 1993–2009 | — | https://www.greo.ca/Modules/EvidenceCentre/files/Harrigan%20(2007)Electronic_gaming_machine_structural_characteristics.pdf | 13:S16 (part; PAR-sheets study = M234) | B — framework literature |
| M132 | GambleAware / Bournemouth University — product-risk report | academic / industry press | 2025-01 | GB | https://www.gambleaware.org/what-we-do/news/news-articles/new-gambleaware-commissioned-research-warns-of-high-risks-from-gaming-machines-online-casino-games-and-loot-boxes/ | 13:S22 | B |

## F. Patents, case law & IP disputes (M133–M143)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M133 | US4448419A — Telnaes virtual-reel patent | patent record | filed 1982; granted 1984; expired 2002 | US | https://patents.google.com/patent/US4448419A/en | 12:S43 | A — historical record |
| M134 | WMS Gaming v. IGT, 184 F.3d 1339 (Fed. Cir. 1999) | case law | 1999 | US | https://caselaw.findlaw.com/court/us-federal-circuit/1461202.html | 12:S44 | A — precedent |
| M135 | IGT IR — IGT/WMS settle patent lawsuits ($28.67m) | vendor docs | 1999-12 | US | https://ir.igt.com/news/news-details/1999/International-Game-Technology-and-WMS-Gaming-Inc-Settle-Two-Related-Patent-Lawsuits/default.aspx | 12:S47 | A — historical fact |
| M136 | US Patent 8,360,847 — multimedia emulation of physical reel hardware | patent | issued 2013 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8360847 | 09:S18 | A — one vendor's approach, not a norm |
| M137 | US Patent 5,934,672 — reel deceleration methods | patent | issued 1999 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5934672 | 09:S19 | A — same caveat |
| M138 | US Patent 9,153,104 family — win-rollup increment ranks | patent | 2015 | US | https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9153104 | 09:S24 | A — same caveat |
| M139 | US Patent App 2023/0394914 — modular frontend game framework | patent application | 2023 | US | https://patents.justia.com/patent/20230394914 | 09:S31 | A — application, not granted claim |
| M140 | Las Vegas Review-Journal — $127.5m Aristocrat/L&W settlement | industry press | 2026-01 | US/AU | https://www.reviewjournal.com/business/casinos-gaming/las-vegas-slot-machine-manufacturer-to-pay-127-5m-in-settlement-over-cheap-knockoff-3606683/ | 12:S45 | B |
| M141 | Gambling Insider — Aristocrat & L&W settle global litigation | industry press | 2026-01 | US/AU | https://www.gamblinginsider.com/news/102862/aristocrat-light-wonder-settle-dragon-train-lawsuit | 12:S49 | B — math-model admission, deletion obligations |
| M142 | PokerScout — Aristocrat v. L&W Dragon Train analysis | industry press | 2024–2025 | US | https://www.pokerscout.com/aristocrat-v-light-wonder-dragon-train-lawsuit-update-discovery-battle/ | 12:S48 | C — analysis ("patents narrow, trade secrets decisive") |
| M143 | GGB Magazine — "Hold, Spin, Repeat" | industry press | c.2020 | US | https://ggbmagazine.com/articles/hold-spin-repeat/ | 12:S46 | B — historical origin of Lightning Link / hold-and-respin imitation wave |

## G. Vendor-official mechanics, licensing & game documentation (M144–M165)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M144 | Big Time Gaming — Megaways licences news (Gauselmann/Merkur/Blueprint) | vendor docs | 2018–2023 | global | https://www.bigtimegaming.com/news/big-time-gaming-licenses-megaways-to-gauselmann-merkur-blueprint | 02:S24; 12:S2 | A — ⚠CS: licensing-program status is time-sensitive; patent number/claims never independently verified (IP counsel item) |
| M145 | Gambling Insider — BTG licenses US-patented mechanic + MegaWays trademark | industry press | c.2019 | US/global | https://www.gamblinginsider.com/press/6028/btg-licenses-its-us-patented-mechanic-and-megaways-trademark-to-fellow-supplier | 12:S4 | B — ⚠CS: 2019 patent/TM status claim; unverified scope; re-check before any variable-height design |
| M146 | Gaming Intelligence — 1X2 Network signs Megaways licensing deal | industry press | c.2019 | global | https://www.gamingintelligence.com/products/casino/46103-1x2-network-signs-licensing-deal-for-big-time-gaming-s-megaways-mechanic/ | 12:S3 | B — ⚠CS: 2019 licensee-list datapoint |
| M147 | CasinoBeats — Jelly gains Megaways licence (+Bigwinboard on Blueprint deal) | industry press | 2023-02 / 2018 | global | https://casinobeats.com/2023/02/07/jelly-megaways-licence-must/ | 02:S25 | B — licensing model, Evolution acquisition |
| M148 | Gamingsoft — BTG Megaways mechanics for operators | industry press | 2026-05 | global | https://www.gamingsoft.com/blog/2026/05/big-time-gaming-casino-games/ | 01:S6 | C — low-authority aggregator; corroborated by BTG pages (M144) |
| M149 | Nolimit City — xWays/xNudge Trademark Mechanics & Rules (official PDF) | vendor docs | 2020 | global | https://static.nolimitcity.com/documents/internal/Nolimit_City_xWays_xNudge_Trademark_2020.pdf | 12:S5 | A — ⚠CS: 2020 TM-program document; confirm current registration/licensing status before referencing |
| M150 | iGB — Nolimit City extends xMechanic licensing deal (Sneaky Slots) | industry press | 2024–2025 | global | https://igamingbusiness.com/company-news/nolimit-city-extends-xmechanic-licensing-deal-with-sneaky-slots/ | 12:S6 | B — confirms xMechanics remain licensed IP |
| M151 | Yggdrasil — Peter & Sons agrees GEM offering (official) | vendor docs | c.2021 (program ongoing) | global | https://www.yggdrasilgaming.com/news/peter-sons-agrees-yggdrasil-game-engagement-mechanics-gem-offering | 12:S8 | A — ⚠CS: 2021 announcement of a live licensing program; verify program status |
| M152 | Yggdrasil — game-mechanics pages (Gigablox, MultiMAX) | vendor docs | current | global | https://yggdrasilgaming.com/game-mechanics/gigablox | 12:S9 | A |
| M153 | Gaming Intelligence — Relax Gaming/NetEnt secure ReelPlay Infinity Reels rights | industry press | 2020-04 | global | https://www.gamingintelligence.com/products/casino/96500-relax-gaming-and-netent-secure-ip-rights-to-reelplays-infinity-reels/ | 12:S10 | B — ⚠CS: 2020 licensing status |
| M154 | Light & Wonder newsroom — ReelPlay Infinity Reels license deal | vendor docs | 2020-12 | global | https://explore.lnw.com/newsroom/reelplay-boost-scientific-games-partnership-with-infinity-reels-license-deal/ | 12:S11 | A — ⚠CS: 2020 licensing status |
| M155 | Gaming Intelligence — Live 5 secures Infinity Reels rights | industry press | 2020-07 | global | https://www.gamingintelligence.com/products/casino/123879-live-5-secures-licensing-rights-for-reelplays-infinity-reels-mechanic/ | 12:S12 | B — ⚠CS: 2020; trade-dress + mechanic licensing model |
| M156 | AvatarUX — PopWins official mechanic page | vendor docs | retrieved 2026-08 | global | https://avatarux.com/game-mechanics/popwins/ | 01:S19 | A |
| M157 | Pragmatic Play — Gates of Olympus Super Scatter (official game page) | vendor docs | 2025 | global | https://www.pragmaticplay.com/en/games/gates-of-olympus-super-scatter/ | 02:S9 | A |
| M158 | MSport help — Gates of Olympus 1000 game guide (operator copy of official rules) | vendor docs (operator) | 2025 | global | https://msportsupport.zendesk.com/hc/en-us/articles/39774921309335 | 02:S10 | B — operator mirror of vendor rules |
| M159 | Relax Gaming — Money Train 4 product page | vendor docs | 2023–2025 | global | https://www.relax-gaming.com/products/casino/moneytrain4 | 12:S13 | A — vendor-stated RTP/hit/max-win figures |
| M160 | Nolimit City — official game pages (Supersized, Kill Em All, Flight Mode, Seamen, FitH3, San Quentin; + CasinoWizard max-win explainer) | vendor docs / industry press | 2023–2026 | global | https://nolimitcity.com/games/supersized ; https://nolimitcity.com/games/san-quentin | 03:S18; 08:S24 | A — published hit/feature/max-win frequencies, multi-RTP profiles |
| M161 | BGaming — Hold & Win slot mechanics explained | vendor docs | 2024–2026 (latest 2026-08-03) | global | https://bgaming.com/articles/hold-win-slot-mechanics-explained | 01:S16; 02:S12 | B — vendor blog; 2026-08 revision fetched live |
| M162 | 1spin4win — what are hold and win slots | vendor docs | 2024–2025 | global | https://www.1spin4win.com/blog/what-are-hold-and-win-slots | 02:S13 | B |
| M163 | Hacksaw Gaming — OpenRGS anniversary + 2025 round-up (official) | vendor docs | 2024–2026 | global | https://www.hacksawgaming.com/news/happy-birthday-hacksaw-openrgs-celebrating-one-whole-year-of-designing-developing-and-distributing | 12:S27 | A |
| M164 | Yogonet — Pragmatic Play unveils Fat Panda studio | industry press | 2025 | global | https://www.yogonet.com/international/news/2025/03/26/99363-pragmatic-play-unveils-first-two-slots-from-exclusive-new-studio-fat-panda | 12:S26 | B |
| M165 | GameBeat — why Hold & Win is still most popular (2025) | vendor blog | 2025 | global | https://gamebeat.studio/page82325356.html | 01:S15 | C — vendor marketing blog |

## H. Market data, game reviews & industry press (M166–M233)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M166 | Bigwinboard — bonus-buy slots database (+CasinoGrounds top-RTP & iGamingWheel aggregate in 03) | industry press (DB) | continuously updated 2024–2026 | global | https://www.bigwinboard.com/bonus-buy-slots/ | 02:S15; 03:S19 | C — reviewer database; buy prices/RTP deltas are aggregator-sourced, verify per title |
| M167 | iGaming Wheel — bonus buy math guide | industry press | 2025 | global | https://igamingwheel.com/guides/bonus-buy-guide | 02:S16 | C |
| M168 | Casino Hipster — Pragmatic ante bet explained (+JPU breakdown) | industry press | 2025 | global | https://casinohipster.com/blog/pragmatic-play-the-ante-bet-bet-multiplier-variant-explained/ | 02:S18 | C — per-title vendor-stated multipliers, uncertified |
| M169 | Bigwinboard — Sweet Bonanza 2500 review | industry press | 2025 | global | https://www.bigwinboard.com/sweet-bonanza-2500-pragmatic-play-slot-review/ | 02:S19 | C |
| M170 | Hideous Slots — Nolimit City symbols/mechanics explained | industry press | 2024–2025 | global | https://hideousslots.com/news/nolimit-city-symbols-explained/ | 02:S20 | C |
| M171 | FruitySlots — Nolimit xMechanics guide | industry press | 2025 | global | https://fruityslots.com/slots/mechanics/x-mechanics/ | 02:S21; 12:S7 | C — mechanic timeline + TM status; cross-check M149/M150 |
| M172 | Fire in the Hole 3 reviews (Hideous Slots + FruitySlots + Bigwinboard) | industry press | 2024–2025 | global | https://hideousslots.com/slot-review/fire-in-the-hole-3/ | 02:S22 | C — multi-outlet corroborated figures |
| M173 | Money Train 4 reviews (FruitySlots / MrQ / Hideous Slots / Bigwinboard) | industry press | 2023–2024 | global | https://fruityslots.com/slots/reviews/money-train-4/ ; https://www.bigwinboard.com/money-train-4-relax-gaming-slot-review/ | 01:S29; 02:S23; 12:S14 | C — corroborated by vendor page M159 |
| M174 | VegasSlotsOnline — retriggering & retrigger-cap explainers | industry press | 2024–2026 | global | https://www.vegasslotsonline.com/features/retriggering/ | 02:S27 | C — "regulatory cap" claims unsupported (see 02 uncertainties #4) |
| M175 | Wanted Dead or a Wild reviews (Galaxy of Slots / Racing Post / FruitySlots / SlotArk / Stake) | industry press | 2024–2026 | global | https://galaxyofslots.com/wanted-dead-or-a-wild ; https://www.slotark.com/slots/wanted-dead-or-a-wild/ | 02:S28; 12:S31; 12:S32 | C — per-tier RTP/volatility figures, multi-outlet |
| M176 | Reactoonz reviews (Galaxy of Slots / Casinos.com) | industry press | 2024–2026 | global | https://galaxyofslots.com/reactoonz | 02:S29 | C |
| M177 | OnlyiGaming / Spinaspin / iGamingToday — max-win records & 2025 trends | industry press | 2025–2026 | global | https://onlyigaming.com/news/top-10-slots-highest-max-win-multipliers-2026 | 02:S34 | C |
| M178 | Wild-mechanics guides (Borgata; WorstCasino; LuckyTiger; DesignEntrepreneurshipWorkshop) | industry press | 2024–2026 | global | https://www.borgataonline.com/en/blog/how-expanding-wilds-and-sticky-wilds-work-in-slot-games/ ; https://worstcasino.com/slots/sticky-wilds/ | 02:S36 | C — taxonomy corroborated across outlets |
| M179 | Slot feature/paytable explainers (SlotsOnlineCanada; win.gg; covers.com; pokerlistings) | industry press | 2023–2026 | global | https://www.slotsonlinecanada.com/symbols-bonus-features/ ; https://win.gg/scatter-mechanic-online-slots/ | 02:S4s | C — convention descriptions only |
| M180 | win.gg — cascading slots explained | industry press | 2023–2025 | global | https://win.gg/what-is-cascading-slot/ | 01:S13 | C |
| M181 | Cascading/tumble mechanics explainers (Slingo guides; SlotRandomizer; Sarasota/AdvantagePoint) | industry press / blog | 2025–2026 | global | https://www.slingo.com/blog/guides/understanding-tumble-mechanics-in-gates-of-olympus-1000/ ; https://slotrandomizer.com/blog/cascading-wins-explained/ | 02:S11; 03:S24b | C — LOW authority; cascade stats (avg depth 2.3, cap 15) are anecdotes, not constraints |
| M182 | LeoVegas — hold & win roundup (Playson Energy Joker values) | industry press | 2025 | global | https://www.leovegas.com/en-ca/blog/online-casino/slots-themes/hold-and-win-slots | 02:S14 | C |
| M183 | Casino Life Magazine — top 5 slot games 2025 | industry press | 2025 | global | https://www.casinolifemagazine.com/blog/top-5-slot-games-2025-spins-systems-and-surprises | 01:S14 | C |
| M184 | McLuck — Megaways guide | industry press | 2025 | US sweeps | https://blog.mcluck.com/guides/slots/game-mechanics/megaways/ | 01:S17 | C |
| M185 | casinos.com — cluster pays explained | industry press | 2025 | global | https://www.casinos.com/slots/cluster-pays | 01:S18; 12:S19 | C |
| M186 | BetMGM — cluster pays system | industry press | 2024 | US | https://casino.betmgm.com/en/blog/all-you-need-to-know-about-cluster-pays-system/ | 01:S20 | C |
| M187 | star-burst.co.uk — Starburst technical review | fan/technical site | 2025–2026 | GB | https://star-burst.co.uk/ | 01:S25 | C — affiliate/fan; mechanic description only, corroborated ≥2 sources per 01 note |
| M188 | CasinoHipster — how Megaquads works | industry press | 2021–2026 | global | https://casinohipster.com/blog/how-does-a-megaquads-slot-work/ | 01:S26 | C |
| M189 | Gambling.com — Siberian Storm Dual Play review | industry press | retrieved 2026-08 | global | https://www.gambling.com/games/free-slots/siberian-storm-dual-play | 01:S27 | C |
| M190 | HideousSlots — Sweet Bonanza Super Scatter review | industry press | 2025 | global | https://hideousslots.com/slot-review/sweet-bonanza-super-scatter/ | 01:S28 | C |
| M191 | ChaseTheScatter — guide to scatter pays | blog | 2025 | global | https://chasethescatter.com/gambling-guides/guide-to-scatter-pays/ | 01:S30 | C |
| M192 | Yggdrasil Gigablox reviews (casino.band; allslotsonline Giganimals) | industry press | 2024–2026 | global | https://casino.band/slots/yggdrasil-gaming | 01:S35 | C |
| M193 | Track360 — jackpot slots progressive & must-drop economics | industry press | 2026 | global | https://track360.io/blog/jackpot-slots-progressive-must-drop-operator-guide-2026 | 01:S36 | C — operator-side economics; needs GLI-12 review for real progressive work |
| M194 | Track360 — slot RTP benchmarks by provider 2026 | industry press (data) | 2026 | global | https://track360.io/blog/slot-rtp-benchmarks-by-provider-reference-2026 | 12:S33 | C |
| M195 | Track360 — single wallet vs transfer wallet guide | industry press | 2026 | global | https://track360.io/blog/single-wallet-vs-transfer-wallet-igaming-operator-2026 | 07:S18 | C |
| M196 | Raijin Studio — slot game math explained | vendor blog | 2024–2025 | global | https://raijinnstudio.com/blog/slot-game-math-explained-rtp-volatility-hit-frequency | 01:S37 | C — design-target ranges; no industry-standard VI scale exists |
| M197 | PokerNews + VegasSlotsOnline — volatility guides | industry press | 2024–2026 | global | https://www.pokernews.com/casino/slots/understanding-slots-volatility.htm | 01:S38 | C — numeric ranges vary by source |
| M198 | EJAW — top new slot games / trends 2025 | industry press | 2025 | global | https://ejaw.net/global-trends-top-new-slot-games-2025/ | 01:S40 | C |
| M199 | Gamingslots — top 10 high-volatility slots of 2025 | industry press | 2026-01 | global | https://www.gamingslots.com/2026/01/top-10-high-volatility-slots-of-2025-selected-by-gamingslots/ | 12:S1 | C |
| M200 | SlotGods / Slototimes — ELK Studios profiles | industry press | 2024–2026 | global | https://slotgods.co.uk/slot-developers/elk-studios | 12:S15 | C |
| M201 | SportsBoom / PlayFortune — Razor Returns reviews | industry press | 2024–2026 | global | https://www.sportsboom.co.uk/betting/casino/games/slots/razor-returns | 12:S16 | C |
| M202 | Bigwinboard — Razor Ways review | industry press | 2024 | global | https://www.bigwinboard.com/razor-ways-push-gaming-slot-review/ | 12:S17 | C |
| M203 | Slots Temple — Aloha Cluster Pays | industry press | current | global | https://www.slotstemple.com/us/free-slots/aloha-cluster-pays/ | 12:S18 | C — NetEnt "Cluster Pays" TM claim not register-verified (see 12 uncertainties #3) |
| M204 | Racing Post — Gates of Olympus / Sweet Bonanza reviews | industry press | 2024–2025 | global | https://www.racingpost.com/online-casino/slots/gates-of-olympus/ | 12:S21 | C |
| M205 | SlotsCompared — Gates of Olympus franchise comparisons | industry press | 2025 | global | https://slotscompared.com/gates-of-olympus/ | 12:S22 | C |
| M206 | Slot Tracker — Pragmatic Play live stats | industry data (crowd-sourced) | 2025 | global | https://slottracker.com/pragmatic/ | 12:S23 | C — crowd-sourced, NOT certified math; sanity bounds only |
| M207 | BGaming / SOFTSWISS / GammaStack — 2026 trend reports | industry press | 2025–2026 | global | https://bgaming.com/articles/igaming-trends-2026-key-technologies-and-market-shifts | 12:S24 | C |
| M208 | Bigwinboard / Dimers — Print Studios profiles | industry press | 2025–2026 | global | https://www.bigwinboard.com/online-casino-game-developers/print-studios/ | 12:S25 | C |
| M209 | CasinoBeats — how Twitch and TikTok influence slot player habits | industry press | 2025 | global | https://casinobeats.com/features/social-media-influence-on-slot-player-habits/ | 12:S28 | C — session-length stat single-source, directional only |
| M210 | AboutSlots — Hacksaw partners with BullShark Games | industry press | 2023 | global | https://www.aboutslots.com/news/hacksaw-gaming-partner-with-bullshark-games-aboutslots-com | 12:S29 | C |
| M211 | iGamingToday — why bonus-buy features became popular (+VSO Trainwreck coverage) | industry press | 2025–2026 | global | https://www.igamingtoday.com/why-bonus-buy-features-became-so-popular/ | 12:S30 | C |
| M212 | iGamingToday — RTP downgrades quietly reshape UK slot economics | industry press | 2025–2026 | GB | https://www.igamingtoday.com/rtp-downgrades-quietly-reshape-uk-slot-economics/ | 12:S34 | C |
| M213 | Configurable/multi-RTP market-practice explainers (Webopedia; Hub88; KingCasinoBonus; Track360) | industry press | 2025–2026 | multi/GB | https://www.webopedia.com/crypto-gambling/casinos/guides/why-same-slot-has-different-rtp-at-different-casinos/ ; https://hub88.io/blog/post/what-is-rtp/ | 04:S31; 12:S35 | C — per-config certification practice, corroborated across outlets |
| M214 | AAA Slot Game Development — 2026 slot art trends (+Zvky top styles) | vendor blog | 2025–2026 | global | https://aaaslotgamedevelopment.com/blog/game-art-slot | 12:S38 | C |
| M215 | Roger.com — slot game art in 2025 | blog | 2025 | global | https://www.roger.com/articles/game/slot-game-art-design-trends-2025/ | 12:S39 | C |
| M216 | Streams Charts + Statista — Kick/Twitch slots category data | industry data | 2025 | global | https://streamscharts.com/channels?game=slots-casino&platform=kick | 12:S40 | B — platform metrics |
| M217 | Webopedia — top Kick streamers for slots | industry press | 2025 | global | https://www.webopedia.com/crypto-gambling/casinos/guides/top-kick-streamers/ | 12:S41 | C |
| M218 | Lucky7Bonus / Spindex — streamer max-win trackers | industry press | 2025 | global | https://lucky-7-bonus.com/blog/streamers-who-have-won-the-max-win-on-a-slot | 12:S42 | C |
| M219 | Wizard of Vegas forum — value of buying bonus (Big Catch Bass Fishing) | forum (math community) | 2023–2024 | global | https://wizardofvegas.com/forum/gambling/slots/39411-how-to-determine-the-value-of-buying-bonus-game/ | 02:S17 | C — practitioner math datapoint |
| M220 | Wizards.us — validating a progressive jackpot system | practitioner blog | 2024–2025 | multi | https://wizards.us/blog/progressive-jackpot-system/ | 02:S31 | C |
| M221 | Know Your Slots — must-hit-by progressives overview | practitioner blog | 2020–2024 | US | https://www.knowyourslots.com/must-hit-by-progressives-an-overview/ | 02:S32 | C — domain expert |
| M222 | Know Your Slots — what constitutes a big win | practitioner blog | 2023 | US | https://www.knowyourslots.com/what-constitutes-a-big-win-on-slot-machines/ | 09:S20 | C — domain expert; tuning guidance |
| M223 | Turbo/quick-spin market surveys (Slots Temple turbo index; CasinoTreasure; BetMGM; Slingo settings guide) | industry press | 2024–2026 | multi | https://www.slotstemple.com/us/slots-by-feature/turbo-spin/ | 09:S25 | C — timing reductions are tuning guidance, not standards |
| M224 | Chitech / Borgata — Pragmatic turbo-spin analyses | industry press | 2024–2026 | .com markets | https://chitech.us/pragmatics-turbo-spin-risky-or-just-fast/ | 09:S29 | C — turbo = presentation-only corroboration |
| M225 | Editions Complexe — what anticipation animations signal | blog | 2025 | n/a | https://www.editionscomplexe.com/what-anticipation-animations-signal-during-online-slot-spins/ | 09:S26 | C |
| M226 | On: Yorkshire Magazine — millisecond-level timing in slot animations | industry press / blog | 2025 | n/a | https://www.on-magazine.co.uk/stuff/gaming/how-millisecond-level-timing-in-slot-animations-shapes-player-emotion-and-perceived-luck/ | 09:S17 | C — fetched; timing numbers are tuning guidance |
| M227 | OnlineGamblingExperts — mobile-first slot UX innovations 2025 | industry press | 2025 | global | https://www.onlinegamblingexperts.com/mobile-first-slot-game-ux-innovations/ | 01:S32; 08:S20 | C |
| M228 | OnlineGamblingExperts — psychology of slot game sound design | industry press | 2024 | global | https://www.onlinegamblingexperts.com/psychology-of-slot-game-sound-design/ | 11:S28 | C |
| M229 | GamblingZone — why do some slots have adaptive sound effects | industry press | c.2024 | global | https://www.gamblingzone.com/ca/the-zone/casino/why-do-some-slots-have-adaptive-sound-effects/ | 11:S3 | C |
| M230 | SDLC Corp — sound design and music in slot game engagement | industry press / vendor | c.2024 | global | https://sdlccorp.com/post/the-role-of-sound-design-and-music-in-slot-game-engagement/ | 11:S4 | C |
| M231 | GammaStack — optimizing slot games for mobile | vendor blog | 2024–2025 | global | https://www.gammastack.com/blog/best-practices-for-optimizing-slot-games-for-mobile-devices/ | 01:S31 | C |
| M232 | Pragmatic Play system-UI documentation via SlotCatalog / ClashOfSlots / Sugar Rush technical analysis / PlayOJO | industry press | 2024–2026 | global | https://clashofslots.com/slots/pragmatic-play/ ; https://holycitysinner.com/technical-analysis-of-sugar-rush-slot-game/ | 08:S30 | C — market inspection of burger-menu/battery-saver conventions |
| M233 | ClashOfSlots — bonus-buy catalog (+PlayOJO guides) | industry press | 2024–2026 | multi | https://clashofslots.com/catalog/bonus-buy/ | 08:S25 (part) | C — buy price ranges |

## I. Slot math, simulation & practitioner engineering resources (M234–M260)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M234 | Harrigan & Dixon — "PAR Sheets, probabilities, and slot machine play" (J. Gambling Issues 23) | academic | 2009-06 | Ontario/CA | https://cdspress.ca/wp-content/uploads/2022/08/Kevin-A.-Harrigan-Mike-Dixon-.pdf | 03:S1; 13:S16 (part — stoppredatorygambling mirror) | B — PDF text-verified locally; PAR structure/VI conventions are stable facts |
| M235 | Harrigan — "The Design of Slot Machine Games" (NH Gambling Commission presentation) | academic | 2010 | US-NH | https://stoppredatorygambling.org/wp-content/uploads/2012/12/Harrigan-presentation-to-the-2010-NH-Gambling-Commission.pdf | 03:S2 | B — corroboration of M234 |
| M236 | Balabanov, Zankinski, Shumanov — slot RTP optimization with genetic algorithms | academic | 2015 | n/a | https://link.springer.com/chapter/10.1007/978-3-319-15585-2_6 | 03:S10 | B — methodology |
| M237 | Balabanov et al. — RTP optimization with discrete differential evolution | academic | 2016 | n/a | https://www.researchgate.net/publication/300209679 | 03:S11 | B |
| M238 | Kamanas et al. — slot RTP optimization using VNS (Math. Probl. Eng.) | academic | 2021 | n/a | https://onlinelibrary.wiley.com/doi/10.1155/2021/8784065 | 03:S12 | B — methodology |
| M239 | MDPI Mathematics 11(2):266 — efficient Monte Carlo methods for slot jackpot modelling | academic | 2023-01 | n/a | https://www.mdpi.com/2227-7390/11/2/266 | 01:S39; 03:S15 | B — QMC variance-reduction methods |
| M240 | Importance-sampling / stratification references (Sigman IEOR 4703 notes; Owen "Monte Carlo" ch.8; arXiv 1508.05047) | academic | 2007–2015 | n/a | http://www.columbia.edu/~ks20/4703-Sigman/4703-07-Notes-IS.pdf ; https://artowen.su.domains/mc/Ch-var-basic.pdf | 03:S16 | B — stable theory |
| M241 | "Markov chain applications in the slot machine industry" (OR Insight 21(1)) | academic | 2008 | n/a | https://link.springer.com/content/pdf/10.1057/ori.2008.53.pdf | 03:S17 | B — stable methodology |
| M242 | UNLV Gaming Research & Review Journal — par-sheet & par-change studies (Lucas & Brandmier 2005; Singh et al. 2012; CGR papers) | academic | 2005–2015 | US-NV | https://oasis.library.unlv.edu/grrj/ | 03:S22 | B — field-study findings |
| M243 | Wilson, J. — "Slot machine volatility index" (Slot Tech Magazine) | industry press (print) | 2003-12 | n/a | (print; cited via M234) | 03:S23 | B — historical origin of the VI convention |
| M244 | Wizard of Odds / Wizard of Vegas — Atkins Diet slot deconstruction | expert blog / forum | 2008, maintained | n/a | https://wizardofodds.com/games/slots/atkins-diet/ ; https://wizardofvegas.com/forum/questions-and-answers/gambling/25894-deconstructing-the-atkins-diet-slot-machine/ | 01:S24; 03:S8 | B — worked exact-enumeration example (stable math) |
| M245 | Wizard of Vegas — volatility-index definition threads | forum | 2011–2023 | n/a | https://wizardofvegas.com/forum/questions-and-answers/math/23680-the-significance-of-volatility-index/ | 03:S9 | C — convention documentation (1.645/1.96) |
| M246 | Wizard of Vegas — simulating RTP vs exact algorithm (practitioner thread) | forum | 2014–2015, evergreen | n/a | https://wizardofvegas.com/forum/gambling/slots/19069-casino-slots-design-pros-and-cons-simulating-rtp-and-wincombinations-vs-exact-algorithm/ | 01:S22 | C — tradeoff discussion (stable) |
| M247 | SlotGameDesign.com — "Going Wild" slot math tutorial 2 | practitioner blog | 2019-02 | global | https://slotgamedesign.com/2019/02/09/going-wild-symbols-slot-math-tutorial-2/ | 02:S26 | C — stable math tutorial |
| M248 | Know Your Slots — reel strips & virtual reel mapping (+USPTO 9230401 ref) | practitioner blog | 2019–2023 | US | https://www.knowyourslots.com/slot-vocabulary-reel-strips/ | 01:S23 | C — domain expert; stable concepts |
| M249 | easy.vegas — how slot machines work + Know Your Slots — PAR sheet under the hood | practitioner blog | maintained 2024+ | n/a | https://easy.vegas/games/slots/how-they-work ; https://www.knowyourslots.com/the-par-sheet-a-look-under-the-hood-of-a-slot-machine-game/ | 03:S24; 03:S25 (same KYS page, Bally-era design-target anecdote) | C — Telnaes lineage, PAR confidentiality; anecdotes not constraints |
| M250 | Stake Engine SDK documentation site (math docs: overview/game_struct/force/events; RGS docs: endpoints/data format) | vendor docs | live, fetched 2026-08-08 | global (crypto-led) | https://stakeengine.github.io/math-sdk/ | 01:S11; 03:S13 (part); 07:S1; 07:S2; 07:S3; 07:S4; 07:S5 | A (first-party) — lookup-table/static-outcome architecture, RGS round lifecycle, resume, micro-units |
| M251 | StakeEngine/math-sdk (GitHub repo) | repo | active 2024–2026 | n/a | https://github.com/StakeEngine/math-sdk | 01:S10; 03:S13 (part) | A (first-party code) |
| M252 | Raw-Fun-Gaming/stake-engine-math (community fork) | repo | 2025–2026 | n/a | https://github.com/Raw-Fun-Gaming/stake-engine-math | 03:S26 | C — community fork; PAR export additions |
| M253 | Raw-Fun-Gaming/stake-engine-client (independent TS client) | repo | active, fetched 2026-08-08 | n/a | https://github.com/Raw-Fun-Gaming/stake-engine-client | 07:S14 | C — independent confirmation of play()/endRound() surface (07 register names it furic/stake-engine-client) |
| M254 | NumPy random docs — performance, parallel generation, PCG64/upgrading | vendor docs | NumPy 1.25–2.5 (2023–2026) | n/a | https://numpy.org/doc/stable/reference/random/upgrading-pcg64.html | 03:S14 | A — first-party; PCG64/DXSM + SeedSequence.spawn guidance |
| M255 | Xoshiro-vs-PCG tradeoff refs (EcoEpi sick-bees MR !88; Numerics.NET RNG guide) | repo / vendor docs | 2023–2025 | n/a | https://git.ufz.de/ecoepi/sick-bees/-/merge_requests/88 | 03:S14b | C — generator-switch reproducibility caveat |
| M256 | slotplate (schmooky.dev) — opinionated FSM slot client boilerplate | repo/docs | v0.1, 2024–2026 | n/a | https://slotplate.schmooky.dev/ | 01:S33; 09:S21 | C — single practitioner project; FSM/recovery patterns corroborated by M8/M27 requirements |
| M257 | Tangram Games — core architecture of slot games | vendor blog | 2024–2025 | global | https://www.tangramgames.co.uk/blog/core-architecture-of-slot-games-rng-game-logic-and-mathematical-models/ | 01:S34 | C |
| M258 | Medium/TDS — connected-component labeling from scratch | blog | 2020 | n/a | https://medium.com/data-science/implementing-a-connected-component-labeling-algorithm-from-scratch-94e1636554f | 01:S21 | C — stable algorithm reference |
| M259 | Game Programming Patterns — Object Pool | book/reference | current | n/a | https://gameprogrammingpatterns.com/object-pool.html | 09:S23 | B — canonical pattern text |
| M260 | wizards.us — what is a PAR sheet (+GLI cross-ref) | industry blog | 2024–2025 | multi | https://wizards.us/blog/what-is-a-par-sheet/ | 04:S32 | C |

## J. RGS & platform integration (M261–M266)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M261 | Hub88 — Wallet API reference | vendor docs | live, fetched 2026-08-08 | multi (MGA/UKGC/SGA/GRA/CeG enums) | https://docs.hub88.io/developer-docs/operator-api-reference/wallet-api | 07:S6 | A — bet/win/rollback contract, ×100000 money units, retry policy |
| M262 | Hub88 — Operator API overview & seamless-wallet statuses | vendor docs | live, fetched 2026-08-08 | multi | https://docs.hub88.io/developer-docs/operator-api-reference/operator-api-overview/seamless-wallet-response-statuses-operator-api | 07:S7 | A |
| M263 | coingaming/Hub88-Examples (GitHub) | repo | active, 2026-08-08 | n/a | https://github.com/coingaming/Hub88-Examples | 07:S8 | A (first-party examples) — RSA-SHA256 signing flow |
| M264 | coingaming/ih-ngiw — Hub88 next-gen integration wrapper | repo | active, 2026-08-08 | n/a | https://github.com/coingaming/ih-ngiw | 07:S15 | A (first-party) |
| M265 | CasinoWebScripts — RGS-CWS seamless wallet API docs | vendor docs | live, fetched 2026-08-08 | multi | https://docs.casinowebscripts.com/articles/6174587-receive-data-from-rgs-cws-api-seamless-wallet | 07:S12 | A — duplicate-success rule, cancel-txid convention; note: private aggregator specs (EveryMatrix/SOFTSWISS/Relax/Slotmill) are NOT public, contract shapes generalized from M261–M265 |
| M266 | CrustLab — what is a Remote Gaming Server (RGS) in iGaming | industry blog | 2024–2025 | global | https://crustlab.com/blog/remote-gaming-server-guide/ | 07:S13 | C — orientation-level overview |

## K. Frontend, web platform & client tooling (M267–M323)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M267 | PixiJS blog — June 2026 update (v8.18/8.19) | vendor docs | 2026-06-12 | global | https://pixijs.com/blog/june-2026 | 06:S1 | A — fetched in full |
| M268 | PixiJS blog — v8.16.0 (experimental canvas renderer) | vendor docs | 2026-02 | global | https://pixijs.com/blog/8.16.0 | 06:S2 | A |
| M269 | PixiJS GitHub releases + v8 launch/migration posts | vendor docs / repo | 2024–2026 | global | https://github.com/pixijs/pixijs/releases | 06:S3 | A |
| M270 | PixiJS — performance tips guide + ParticleContainer v8 blog | vendor docs | 2024–2025 (v8) | n/a | https://pixijs.com/8.x/guides/concepts/performance-tips ; https://pixijs.com/blog/particlecontainer-v8 | 02:S30 | A |
| M271 | Texture compression & formats (PixiJS compressed-textures guide; Don McCurdy 2024-02-11; KHR_texture_basisu; pixi KTX2 discussion #10222 + Sparcks/pixi-basis-ktx2) | vendor docs / expert blog / standard / repo | 2024–2025 | global | https://pixijs.com/8.x/guides/components/assets/compressed-textures ; https://www.donmccurdy.com/2024/02/11/web-texture-formats/ ; https://github.com/pixijs/pixijs/discussions/10222 | 06:S4; 06:S19; 06:S45; 10:S14 | A/B — VRAM math, ETC1S vs UASTC; KTX2 block-alignment bug: verify on real low-end Android |
| M272 | PixiJS AssetPack — TexturePacker pipe docs | vendor docs | 2024–2025 | global | https://pixijs.io/assetpack/docs/guide/pipes/texture-packer/ | 06:S5 | A — note: AssetPack-under-Bun unverified (sharp native module; see 06 uncertainties #5) |
| M273 | PixiJS AssetPack — manifest pipe docs | vendor docs | 2024–2025 | global | https://pixijs.io/assetpack/docs/guide/pipes/manifest/ | 06:S6 | A |
| M274 | PixiJS blog — AssetPack 1.0.0 release | vendor docs | 2024 | global | https://pixijs.com/blog/assetpack-1.0.0 | 06:S7 | A |
| M275 | Webflow blog — "GSAP becomes free" | vendor docs | 2025-04 | global | https://webflow.com/blog/gsap-becomes-free | 06:S8 | A (GSAP owner) |
| M276 | GSAP Standard License | vendor license | 2025 | global | https://gsap.com/community/standard-license/ | 06:S9 | A — no-code-competitor clause breadth untested (06 uncertainties #2) |
| M277 | CSS-Tricks — GSAP now completely free | industry press | 2025-04 | global | https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ | 06:S10 | B — independent confirmation |
| M278 | Esoteric Software — Spine purchase page | vendor docs | fetched 2026-08 | global | https://esotericsoftware.com/spine-purchase | 06:S11 | A — fetched in full; tier pricing |
| M279 | Spine Editor License Agreement | vendor license | 2025 | global | https://esotericsoftware.com/spine-editor-license | 06:S12 | A — SDK per-user clause = legal-review item for skill templates |
| M280 | Spine Runtimes License Agreement | vendor license | 2025-04-05 | global | https://esotericsoftware.com/spine-runtimes-license | 06:S13 | A |
| M281 | npm — @esotericsoftware/spine-pixi-v8 | registry | 2026 (4.3.x) | global | https://www.npmjs.com/package/@esotericsoftware/spine-pixi-v8 | 06:S14 | A |
| M282 | Esoteric blog — spine-pixi-v8 runtime released | vendor docs | 2024 | global | https://en.esotericsoftware.com/blog/spine-pixi-v8-runtime-released | 06:S15 | A |
| M283 | Rive — pricing page | vendor docs | 2025–2026 | global | https://rive.app/pricing | 06:S16 | A |
| M284 | Rive blog — new pricing (pay-at-export) | vendor docs | 2025-10 | global | https://rive.app/blog/new-pricing | 06:S17 | A |
| M285 | rive-app/rive-runtime LICENSE (MIT) | repo license | current | global | https://github.com/rive-app/rive-runtime/blob/main/LICENSE | 06:S18 | A |
| M286 | three.js — KTX2Loader docs/examples | vendor docs | current | global | https://threejs.org/docs (KTX2Loader) | 06:S20 | A |
| M287 | three.js manual — WebGPURenderer; r184 releases | vendor docs / repo | 2026 | global | https://threejs.org/manual/en/webgpurenderer.html | 06:S41 | A |
| M288 | CrazyGames — technical requirements | platform docs | current 2025–2026 | global | https://docs.crazygames.com/requirements/technical/ | 06:S21 | B — reached via search summaries; headline numbers as reported |
| M289 | Bountyboard — submitting HTML5 games to web platforms | blog | 2025 | global | https://www.bountyboard.gg/blog/how-to-submit-an-html5-game-to-web-platforms | 06:S22 | C — Poki 8 MB figure is aggregator-sourced, tag [observed] |
| M290 | Apple Developer Forums threads 112218 / 687866 / 778735 (canvas memory caps; iOS 18.2–18.4 WebGL regression) | vendor forum | 2018–2025 | global (iOS) | https://developer.apple.com/forums/thread/778735 | 06:S23 | B — forum evidence; no official Apple number; needs on-device verification |
| M291 | WebKit Bugzilla #219780 — iOS WebGL canvas-resize memory leak | bug tracker | open | global (iOS) | https://bugs.webkit.org/show_bug.cgi?id=219780 | 06:S24 | A (first-party tracker) |
| M292 | Khronos WebGL wiki — HandlingContextLost | standard body wiki | current | global | https://wikis.khronos.org/webgl/HandlingContextLost | 06:S25 | A — canonical loss/restore pattern |
| M293 | MDN — WEBGL_lose_context / webglcontextrestored | vendor docs | current | global | https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext | 06:S26 | A |
| M294 | MDN — autoplay guide for media and Web Audio APIs (+Web Audio best practices) | vendor docs | current | global | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | 06:S27; 08:S15 | A |
| M295 | Chrome Developers — autoplay policy in Chrome | vendor docs | 2017, maintained | global | https://developer.chrome.com/blog/autoplay | 08:S13 | A — ⚠CS: 2017 post supports current-policy claims; page maintained, but re-verify behaviour at build time |
| M296 | Chrome Developers — Web Audio, autoplay policy and games | vendor docs | 2018, maintained | global | https://developer.chrome.com/blog/web-audio-autoplay | 08:S14; 11:S22 | A — ⚠CS: same caveat as M295 |
| M297 | Matt Montag — unlock Web Audio in Safari for iOS/macOS | expert blog | maintained (rev. c.2023) | global (iOS) | https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos | 06:S28; 11:S17 | B — touchend unlock, 4-context cap; iOS behaviour is a moving target |
| M298 | MDN — Page Visibility API / visibilitychange | vendor docs | current | global | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API | 06:S29; 11:S19 | A |
| M299 | Bun blog — Bun 1.3 | vendor docs | 2025-10-10 | global | https://bun.com/blog/bun-v1.3 | 06:S30 | A |
| M300 | heise online — Bun 1.3 full-stack runtime | industry press | 2025-10 | global | https://www.heise.de/en/news/Web-Development-Bun-1-3-Becomes-Full-Stack-JavaScript-Runtime-10759717.html | 06:S31 | B |
| M301 | PkgPulse — Bun vs Vite 2026 guide | blog | 2026 | global | https://www.pkgpulse.com/guides/bun-vs-vite-2026 | 06:S32 | C |
| M302 | caniuse — WebGPU support data | support data | live, checked 2026-08 | global | https://caniuse.com/webgpu | 06:S33 | A — live data |
| M303 | web.dev — WebGPU supported in major browsers | vendor docs | 2025-11 | global | https://web.dev/blog/webgpu-supported-major-browsers | 06:S34 | A |
| M304 | App Developer Magazine / Wikipedia — WebGPU in iOS 26 | industry press | 2025-09 | global (iOS) | https://appdevelopermagazine.com/webgpu-in-ios-26/ | 06:S35 | B |
| M305 | MDN — web audio codec guide | vendor docs | current | global | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs | 06:S36 | A |
| M306 | Supadark — which audio codec for the web (2026) | blog | 2026 | global | https://supadark.com/notes/which-codec-to-choose-for-my-website-s-audio-content | 06:S37 | C — Safari Opus-in-CAF caveat, via search summary |
| M307 | howler.js — repo + docs + adoption analyses (Snyk advisor; npmtrends) | repo / registry data | checked 2026-08 | global | https://github.com/goldfire/howler.js ; https://howlerjs.com/ | 06:S38; 11:S21 | A/B — inactive-maintenance status is load-bearing for the no-howler decision |
| M308 | pmndrs/detect-gpu | repo | maintained | global | https://github.com/pmndrs/detect-gpu | 06:S39 | A |
| M309 | PlayCanvas — device pixel ratio optimization | vendor docs | current | global | https://developer.playcanvas.com/user-manual/optimization/runtime-devicepixelratio/ | 06:S40 | A |
| M310 | Gamixlabs — optimizing HTML5 slot game performance | vendor blog | 2024–2025 | n/a | https://gamixlabs.com/blog/optimizing-performance-in-html5-slot-games-for-mobile-and-web/ | 02:S37; 06:S42; 09:S28 | C — slot-specific optimization techniques |
| M311 | rumvision / caniuse — WebP vs AVIF support | blog + support data | 2025 | global | https://www.rumvision.com/blog/modern-image-formats-webp-avif-browser-support/ | 06:S43 | B |
| M312 | GeneralistProgrammer — Phaser vs PixiJS (2025/2026) | blog | 2025–2026 | global | https://generalistprogrammer.com/comparisons/phaser-vs-pixijs | 06:S44 | C |
| M313 | tenngrand / Prathaminstitute — mobile slot load & lobby analyses | industry press | 2025–2026 | AU/global | https://tenngrand.com/technical-efficiency-mobile-slot-software-adapting-to-short-player-sessions/ | 06:S46 | C — via search summaries; numbers as reported |
| M314 | Pontis Technology — setInterval throttling (+MDN rAF docs) | blog + vendor docs | 2024–2025 | global | https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/ | 06:S47 | B |
| M315 | Playgama / IDC Games — HTML5 mobile optimization & low-end guides | blog | 2025 | global | https://playgama.com/blog/general/optimizing-html5-games-for-mobile-a-complete-porting-guide/ | 06:S48 | C |
| M316 | MDN ScreenOrientation.lock + mdn/browser-compat-data issue #19355 | vendor docs / repo | 2023–2025 | global | https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock ; https://github.com/mdn/browser-compat-data/issues/19355 | 08:S16 | A — Safari lacks lock() |
| M317 | W3C Screen Orientation spec | standard | living | global | https://www.w3.org/TR/screen-orientation/ | 08:S17 | A |
| M318 | Safe-area/notch guides (CSS-Tricks "The Notch and CSS"; Polypane; fozzedout PWA gist) | blog / vendor docs | 2017–2025 | global | https://css-tricks.com/the-notch-and-css/ ; https://polypane.app/blog/using-safe-area-inset-to-build-mobile-safe-layouts/ | 08:S18 | B — techniques current; Dynamic Island dimensions per-device |
| M319 | Vibration/haptics support (caniuse navigator.vibrate; ios-haptics; ios-vibrator-pro-max) | support data / repos | 2025–2026 | global | https://caniuse.com/mdn-api_navigator_vibrate ; https://github.com/tijnjh/ios-haptics | 08:S19 | B — iOS haptic quirk is a moving target (patched 26.5); never ship a dependency on it |
| M320 | UXPin — splash screen best practices (+UX Planet) | blog | 2025–2026 | global | https://www.uxpin.com/studio/blog/splash-screen/ | 08:S33 | C |
| M321 | Absolutist — essential elements of slot game design | vendor blog | 2024 | global | https://art.absolutist.com/blog/essential-elements-slot-game-design/ | 08:S23 | C |
| M322 | Gamixlabs — UI/UX & iconography for slot interfaces | vendor blog | 2024 | global | https://gamixlabs.com/blog/ui-ux-design-iconography-tips-engaging-slot-machine-interfaces/ | 08:S22 | C |
| M323 | Zvky Design Studio — slot game animations | vendor blog | 2024 | global | https://www.zvky.com/blogs/articles/slot-game-animations-how-motion-and-visual-effects-improve-gameplay | 08:S29 | C |

## L. Art pipeline & AI asset generation (M324–M341)

Note: file 10's register rows are curated multi-URL bundles; they are kept whole here
(splitting them into ~45 single-outlet rows would add noise without adding dedup value).

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M324 | Slot symbol & style-guide guides (ArtHouseLabs; AAA Game Art; PaintPool; Game-Ace; Whimsy) | vendor docs / blog bundle | 2024–2026 | global | https://arthouselabs.com/blog/slot-game-art-style-guide-how-to-keep-visual-consistency-across-games ; https://paintpoolstudio.com/blog/slot-machine-symbols-how-symbol-sets-are-built-for-slot-games/ | 10:S1 | C — practitioner norms (silhouette test, detail tiering); "~120px readability" is a rule of thumb, not a standard |
| M325 | AI art in games — policy/ownership bundle (isitdev 2025; promise.legal; Inkration/StudioKrew) | industry press / legal blog | 2025–2026 | US/global | https://isitdev.com/ai-art-in-games-2025-policies-risks-studio-guide/ ; https://blog.promise.legal/ai-game-assets-what-studios-own-2026/ | 10:S2 | C — adoption numbers + counsel-level commentary; pair with M339 for the primary legal position |
| M326 | Game-Ace — slot game art & asset deliverables (+Technology.org mobile slot rendering) | vendor docs | 2024–2026 | global | https://game-ace.com/blog/10-types-of-slot-assets-in-online-casino-gaming/ ; https://game-ace.com/blog/slot-game-art/ ; https://www.technology.org/2026/03/13/graphics-and-rendering-technology-that-drives-mobile-slot-game-design/ | 08:S21; 10:S3 | C — canvas sizes, symbol resolutions, 3-state buttons |
| M327 | Whimsy Games — iGaming visual production guide | vendor docs | 2025 | global | https://igaming.whimsygames.co/blog/slot-game-art-services-a-complete-guide-to-visual-production-in-modern-igaming/ | 10:S4 | C |
| M328 | Spine-for-slots workflow bundle (Gamix Labs; PaintPool; newArteest) | vendor docs / blog | 2024–2025 | global | https://gamixlabs.com/blog/creating-symbol-animations-in-spine-for-slot-games/ ; https://paintpoolstudio.com/blog/spine-animation-in-igaming/ | 10:S5 | C — skeletal vs sprite-sheet trade-offs |
| M329 | gpt-image prompting & transparency bundle (OpenAI Cookbook; OpenAI dev community; dredyson guide; rembg notes; Photoshop defringe guides) | vendor docs / blog | 2024–2026 | global | https://cookbook.openai.com/examples/multimodal/image-gen-1.5-prompting_guide ; https://knightli.com/en/2026/04/19/rembg-background-removal-notes/ | 10:S6 | B/C mix — background param + halo-fix techniques; magenta-keying success rates not independently benchmarked |
| M330 | Midjourney official docs — Style Reference / Omni Reference (+CometAPI/Flowith V7 guides) | vendor docs | 2025 | global | https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference ; https://www.cometapi.com/how-to-use-omni-reference-in-midjourney-v7/ | 10:S7 | A/C mix — first-party docs plus third-party guides |
| M331 | ComfyUI workflows + LoRA training bundle (Comfy.org; fal FLUX.2-klein spritesheet LoRA; Limbicnation pixel LoRA; BFL klein blog; StraySpark/StackSheriff) | repo / vendor docs | 2024–2026 | global | https://comfy.org/workflows/tag/game/ ; https://huggingface.co/fal/flux-2-klein-4b-spritesheet-lora ; https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora | 10:S8 | B/C — model-license facts (klein Apache-2.0 vs FLUX.1-dev non-commercial) were true early 2026; snapshot licenses at generation time |
| M332 | Negative-prompt / CFG behaviour bundle (Forge discussion #981; Civitai CFG article; SDXL guides; NAG/VSF arXiv) | repo / blog / academic | 2024–2026 | global | https://github.com/lllyasviel/stable-diffusion-webui-forge/discussions/981 ; https://civitai.com/articles/10087/ ; https://diffusedalice.com/articles/effective-negative-prompts | 10:S9 | B/C — Flux CFG=1 ignores negatives; model-version-specific behaviour |
| M333 | Blender sprite tooling bundle (Spritesheet Renderer; Sprite Render Kit; DirectionalSpriteBatchRender; Eevee-vs-Cycles comparisons; cxong pixel-sprites) | repo / vendor docs / blog | 2016–2026 | global | https://blender-addons.org/spritesheet-renderer/ ; https://github.com/chronicleroflegends/DirectionalSpriteBatchRender ; https://garagefarm.net/blog/eevee-vs-cycles | 10:S10 | B/C — techniques stable; add-on availability drifts by Blender version |
| M334 | Blender CLI / headless guides (Renderday, checked vs Blender 4.4 help; CGWire; blenderless) | vendor docs / blog | 2025–2026 | global | https://renderday.com/blog/mastering-the-blender-cli ; https://blog.cg-wire.com/blender-scripting-animation/ | 10:S11 | B — --background/--python syntax, arg-order gotcha |
| M335 | Texture packing & lighting bundle (free-tex-packer-core; CodeAndWeb TexturePacker/SpriteIlluminator; PixiJS NineSliceSprite; pixijs-userland/lights; Esoteric forum) | repo / vendor docs | 2019–2026 | global | https://github.com/odrick/free-tex-packer-core ; https://www.codeandweb.com/texturepacker/documentation/texture-settings ; https://pixijs.com/8.x/guides/components/scene-objects/nine-slice-sprite | 10:S12 | A/B — first-party tool docs; _n.png normal convention |
| M336 | Twin Win Games — AI art pipeline for casino/slot production | vendor docs | 2026-02-04 (fetched 2026-08-08) | EU (EE/UA) | https://twinwingames.com/ai-art-pipeline-for-slot-games/ | 10:S13 | B — fetched in full; two-pipeline model, curation/consent rules |
| M337 | Blender Manual — render passes & Cycles baking (+Artisticrender; Sequenced Bake; KatsBits) | vendor docs | 2024–2026 (Blender 4.x/5.x) | global | https://docs.blender.org/manual/en/latest/render/layers/passes.html ; https://docs.blender.org/manual/en/latest/render/cycles/baking.html | 10:S15 | A — first-party manual; emission-pass caveats |
| M338 | Real-ESRGAN docs & guides (realesrgan.org; Clore.ai; Local AI Master; RealEsrganUpscalerGUI) | repo / vendor docs | 2024–2026 | global | https://realesrgan.org/blog/real-esrgan-product ; https://github.com/PeteJobi/RealEsrganUpscalerGUI | 10:S16 | B/C — upscaling defaults; Topaz licensing change noted |
| M339 | US Copyright Office — Copyright and AI Part 2: Copyrightability (2025-01-29) + Part 1 (2024-07-31) + law-firm analyses (Skadden, Crowell, Mintz, Akin) | regulator + legal analysis | 2024–2025 | US | https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf ; https://www.copyright.gov/ai/ | 10:S17 | A — human-authorship rule, prompts-alone insufficient; hybrid-asset threshold unsettled (counsel item) |
| M340 | C2PA spec v2.2/v2.3 + adoption reports (Numonic IPTC/C2PA; truescreen; c2paviewer) | standard + industry press | 2025–2026 | global (EU AI Act Art.50; CA SB 942) | https://www.numonic.ai/blog/iptc-2025-c2pa-ai-provenance-metadata ; https://truescreen.io/articles/c2pa-standard-history-limitations/ | 10:S18 | A/B — metadata-stripping limit: JSON provenance record stays authoritative |
| M341 | Valve Steam AI disclosure policy (Jan 2024; rewritten 2026-01-16) via Game Developer / PC Gamer | platform policy / press | 2024-01 & 2026-01 | global (platform) | https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam | 10:S19 | B — de-facto disclosure norm; no iGaming-regulator AI-art mandate found as of 2026-08 |

## M. Audio pipeline (M342–M363)

| id | name | type | date | jurisdiction | URL | cited in | reliability note |
|----|------|------|------|--------------|-----|----------|------------------|
| M342 | The Game Audio Co — vertical layering vs horizontal resequencing | practitioner blog | c.2023–24 | global | https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing | 11:S1 | C — stable technique description |
| M343 | Blips.fm — adaptive music in video games | blog | c.2023 | global | https://blog.blips.fm/articles/adaptive-music-in-video-games-what-it-is-and-how-it-works | 11:S2 | C |
| M344 | W3C Web Audio API 1.1 spec | standard | 2024–25 (WD/CR) | global | https://www.w3.org/TR/webaudio-1.1/ | 11:S5 | A |
| M345 | AES TD1008 v3.13 — loudness of internet audio streaming (AES77 successor 2023) | standard | 2021 / 2023 | global | https://aes2.org/wp-content/uploads/2024/01/20210924_TD1008_v3.13.pdf | 11:S7 | A — −16…−20 LUFS / −1 dBTP; AES77 (2023) formalizes it, so currency is covered |
| M346 | Sony ASWG-R0001 loudness recommendation (via Coppinger/ASWG summaries) | platform standard (via secondary) | 2012–13 | global | https://randycoppinger.com/2013/10/18/loudness-in-interactive-sound-at-sony/ | 11:S8 | B — ⚠CS: 2012-era platform recommendation supporting current loudness targets; stable in practice but confirm no newer ASWG revision |
| M347 | Univ. of Skövde thesis — a new approach and guideline for loudness in games | academic | 2023 | global | https://his.diva-portal.org/smash/get/diva2:1790653/FULLTEXT01.pdf | 11:S9 | B — −16 LUFS mobile reference, standards survey |
| M348 | Game Developer — game audio theory: ducking | practitioner article | 2009 (still-current practice) | global | https://www.gamedeveloper.com/audio/game-audio-theory-ducking | 11:S10 | B — technique example (−9 dB / 500 ms), not a currency claim |
| M349 | SONNISS / Fusehive — universal slots SFX library (asset taxonomy) | vendor docs | 2023–24 | global | https://sonniss.com/sound-effects/universal-slots-sound-effects-library/ | 11:S11 | B — canonical slot cue families |
| M350 | GDC Vault — Peter Inouye, "Beyond Cha-Ching! Music for Slot Machines" | conference talk | 2013 | US (land-based) | https://www.gdcvault.com/play/1017949/Beyond-Cha-Ching-Music-for | 11:S12 | B — practice transfers; historical |
| M351 | miniaudio GitHub issue #759 — iOS 17+ audio after first touch | repo issue | 2023–25 | global | https://github.com/mackron/miniaudio/issues/759 | 11:S18 | B — incl. iOS 18.5 relock report; moving target |
| M352 | Ourcade — Web Audio best practices for games (Phaser 3) | blog | 2020 | global | https://blog.ourcade.co/posts/2020/phaser-3-web-audio-best-practices-games/ | 11:S20 | C — ⚠CS: 2020 browser-behaviour guidance; re-verify visibilitychange/blur handling on current browsers |
| M353 | tonistiigi/audiosprite (+realbluesky/soundsprite fork) | repo | maintained; fork adds opus/webm | global | https://github.com/tonistiigi/audiosprite | 11:S23 | A (first-party tool) |
| M354 | Opus/WebM in Safari 18.4 (TestMu interop; WebKit release-note summaries) | vendor docs / press | 2025-03 | global | https://www.testmuai.com/learning-hub/opus-audio-codec-browser-support/ | 11:S24 | B — 11–18.3 CAF-only Opus caveat |
| M355 | Opus bitrate/settings guides (AudioUtils; Blips; Xiph recommended settings) | vendor docs / blog | 2024–26 | global | https://audioutils.com/blog/opus-bitrate-guide ; https://wiki.xiph.org/Opus_Recommended_Settings | 11:S25 | B — Xiph is first-party for Opus |
| M356 | Gapless playback refs (WebAudio API discussion #2505; Wikipedia gapless; PyMusicLooper) | spec discussion / repo | 2022–24 | global | https://github.com/WebAudio/web-audio-api/discussions/2505 ; https://github.com/arkrow/PyMusicLooper | 11:S26 | B — MP3 padding gap, LOOPSTART/LOOPEND tooling |
| M357 | ElevenLabs docs — create sound effect API + SFX product guide | vendor docs | 2025 (v2 model 2025-09) | global | https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert | 11:S27 | A — params/limits; API surface drifts, pin at build time |
| M358 | blockchain.news — ElevenLabs launches SFX model v2 | industry press | 2025-09-02 | global | https://blockchain.news/ainews/elevenlabs-launches-sfx-model-v2-high-quality-ai-sound-effects-with-seamless-looping-and-extended-duration | 11:S29 | C — launch-date corroboration |
| M359 | Stability AI — Stable Audio 2.5 announcement + prompt guide | vendor docs | 2025-09 | global | https://stability.ai/news-updates/stability-ai-introduces-stable-audio-25-the-first-audio-model-built-for-enterprise-sound-production-at-scale | 11:S30 | A — licensed-dataset claim is vendor-stated |
| M360 | Stability AI license page (+Dynamoi explainer) | vendor license | 2025 | global | https://stability.ai/license | 11:S31 | A — Community License < $1M revenue; re-check terms at generation time |
| M361 | Forbes (V. Berger) — Suno and Udio licensing settlements | industry press | 2025-12-18 | US | https://www.forbes.com/sites/virginieberger/2025/12/18/launch-train-settle-how-suno-and-udios-licensing-deals-made-copyright-infringement-profitable/ | 11:S32 | B |
| M362 | TechTimes / Hollywood Reporter — AI-music lawsuit trackers (Sony v. Suno; GEMA; AFM; Nguyen) | industry press | 2026-06/07 | US/DE | https://www.techtimes.com/articles/320139/20260710/ai-music-training-hits-two-courts-july-suno-faces-verdicts-munich-boston.htm | 11:S33 | B — ongoing litigation; outcome-sensitive |
| M363 | Jordi Pons — "On Prompting Stable Audio" + Stable Audio 3 prompting docs | researcher blog / repo | 2024–26 | global | https://www.jordipons.me/on-prompting-stable-audio/ ; https://github.com/Stability-AI/stable-audio-3/blob/main/docs/guides/prompting.md | 11:S34 | B — first-party-adjacent prompting guidance |

---

## Currency flags — pre-2023 sources supporting currency-sensitive claims (⚠CS)

39 of 363 entries are flagged. Grouped by what must be re-verified before any
compliance-grade or commercially load-bearing use:

**Standard/version currency (re-check gaminglabs.com + NIST at build time):**
- M2 GLI-11 v3.0 (2016) — confirmed latest as of 2026-08; quote clause numbers from the PDF.
- M3 GLI-11 v2.0 (2007) · M4 GLI-11 v2.1 excerpt (c.2007–11) — superseded; lineage only.
- M8 GLI-19 v3.0 (2020) — confirmed current 2026-08; watch for v3.x errata / v4 drafts.
- M9 GLI-19 v2.0 (2013) — superseded; clause-text lineage only.
- M11 GLI Composite Submission Requirements v2.0 (2022) — confirm current version per lab engagement.
- M15 NIST SP 800-22 Rev.1a (2010) — revision decided 2022, pending; battery list = configuration.

**GB rules announced 2020–2021 (in force, but always cite the live RTS pages M27–M33, updated 2025/2026, not these snapshots):**
- M34 RTS Feb-2021 PDF · M35 UKGC 2021 news · M36 speed-of-play consultation (2021) ·
  M37 spin-stop consultation (2021) · M40 Proposal 6 (2020–21) · M47 SBC News (2021) ·
  M48 CasinoBeats (2021) · M49 CMS law (2020) · M50 CasinoBeats buy-in warning (2020).

**EU/other regulation with known post-publication drift:**
- M60 GlüStV 2021 primary text · M61 §22a secondaries (2021) — GGL tiered €1/€3/€5 stakes overlay since 2026-07-01 (M63–M65); end-2026 evaluation pending.
- M68 Saxony-Anhalt info sheet (2021) — 5s-averaging interpretation contested; verify current GGL guidance.
- M69 LIFS 2018:8 — superseded by SIFS 2022:3 (M70).
- M70 SIFS 2022:3 (Dec 2022, borderline) — current, but June-2026 replacement draft in consultation (M72).
- M77 Bigwinboard Sweden explainer (2019) — rely on M69/M70 primaries instead.
- M92 Spillemyndigheden tech requirements v2.3 (2021) — confirm still-current version.
- M94 Belgium €200 weekly limit (2022) — confirm current amount.
- M97 MGA RTP press release (2021) · M99 MGA RTP press coverage (2021) — 85% value confirmed current via Directive 2 v3 (M96, 2023).
- M107 AGCO OLG iGaming standards (archived 2022) — explicitly superseded; never cite as current.

**IP/licensing status claims from 2018–2021 (re-verify registers & programs before design decisions):**
- M144 BTG Megaways licences (2018–2023) · M145 BTG US-patent claim (~2019) · M146 1X2 licence (~2019) —
  patent number/claims never verified; IP counsel before any variable-height US release.
- M149 Nolimit xWays/xNudge TM PDF (2020) — program continuity supported by M150 (2024–25).
- M151 Yggdrasil GEM (~2021) · M153 Relax/NetEnt Infinity Reels (2020) · M154 L&W Infinity Reels (2020) ·
  M155 Live 5 Infinity Reels (2020).

**Web-platform policy pages first published pre-2023 (maintained, but re-verify behaviour at build time):**
- M295 Chrome autoplay policy (2017) · M296 Chrome Web Audio autoplay (2018) · M352 Ourcade Web Audio practices (2020).

**Audio standards:**
- M346 Sony ASWG-R0001 (2012–13) — stable platform loudness recommendation; confirm no newer ASWG revision.

Not flagged by design: pre-2023 academic findings (M126–M131, M234–M244), historical
events/settlements (M57, M133–M138, M143), stable math/technique references (M240–M241,
M246–M249, M258–M259, M348, M350), and live legal-code mirrors whose pages track current
law (M108–M114).

---

## Register statistics

- **Raw register rows across files 01–13:** 453 (01: 40 · 02: 38 · 03: 29 · 04: 32 ·
  05: 52 · 06: 48 · 07: 18 · 08: 37 · 09: 33 · 10: 19 · 11: 34 · 12: 49 · 13: 24).
- **Deduplicated master entries:** 363 (M1–M363). Every one of the 453 per-file rows is
  mapped to exactly one master entry (aggregate per-file rows that spanned two sources
  are split with "(part)" markers).
- **Most-cited sources:** UKGC RTS 14 (M27 — 6 files), GLI-19 v3.0 (M8 — 5 files),
  Wiggin LLP Jan-2025 brief (M45 — 5 files), UKGC RTS 13 (M28 — 4 files).
- **⚠CS currency flags:** 39 entries (see section above).
- **Reliability mix (by grade of the lead source):** ~35% A (primary), ~30% B
  (reputable secondary), ~35% C (aggregator/affiliate/blog — corroborate before
  load-bearing use).
- Sections: A standards/labs 26 · B Great Britain 33 · C Europe/other 45 ·
  D North America 10 · E accessibility/RG 18 · F patents/case law 11 ·
  G vendor-official 22 · H market/press 68 · I math/practitioner 27 ·
  J RGS integration 6 · K frontend/web 57 · L art pipeline 18 · M audio 22.

Per CONVENTIONS §9.10, market sources here are references only — never copy names, art,
characters, exact paytables/strips, or trademarked mechanic names. Per §9.9, nothing in
this register makes any generated game "certified"; real-money release requires legal
review, independent math verification, lab certification, and operator UAT.
