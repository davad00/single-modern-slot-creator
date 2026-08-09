# IP Risk Register — Protected Mechanic Names, Licensable Systems & AI-Art Provenance

```
domain: 16 — IP risk register (canonical; referenced by CONVENTIONS.md §9.10)
generator: single-modern-slot-creator v1.0.0 (research phase, job synth-ipjuris)
date: 2026-08-08
status: research dossier — NOT legal advice; every real-money release requires
        jurisdiction-specific legal review (CONVENTIONS.md §9.9)
inputs: research/12-market-patterns-ip.md (§6–§7 + source register S1–S49),
        research/04-technical-standards-rng-integrity.md,
        research/05-jurisdiction-rules.md, research/13-responsible-design-accessibility.md
```

Tag legend: **[mandatory]** = legally/contractually binding · **[recommended]** =
strong practice · **[observed]** = verified market fact · **[inferred]** = analyst
judgement, flagged for review.

Source references of the form `12:S5` point into the source register of
`research/12-market-patterns-ip.md`; `04:S…`/`05:S…` likewise.

---

## 1. Legal frame — what is actually protected

Mechanic **ideas** (cascades, ways-to-win, hold-and-respin, cluster wins, expanding
grids, collectors, symbol splitting, bonus-buy UX) are broadly unprotectable as such
once any patents lapse. What IS protected [observed, 12:S43][12:S44][12:S12]:

1. **Trademarked mechanic NAMES and logos** (Megaways™, xWays®, Gigablox™, …) —
   enforceable everywhere the mark is registered; the dominant risk class for this skill.
2. **Trade dress** — a rival's distinctive look & feel (Hacksaw's scratched-sketch art,
   Nolimit's grim sepia, Infinity Reels' add-a-reel presentation).
3. **Patents** — rare and narrow in slots, but real where they exist (BTG's US Megaways
   patent is the one active claim that matters; the Telnaes virtual-reel patent
   US 4,448,419 expired 2002 and is precedent, not a live risk) [12:S43][12:S4].
4. **Trade secrets** — math models, reel strips, symbol weights, PAR sheets. Proven
   enforceable at $127.5m scale (Aristocrat v. Light & Wonder, settled Jan 2026)
   [12:S45][12:S48][12:S49].
5. **Copyright** — art, audio, code, characters, and exact paytable/strip expressions of
   referenced games.

Skill consequence [mandatory]: concepts may be reused under **original generic names**;
names, art, characters, exact math, and distinctive presentation may **never** be copied.

## 2. Risk-level and flag legend

| Risk level | Meaning |
|---|---|
| **CRITICAL** | Active registered TM and/or live patent, actively licensed & policed. Any use of the name = infringement exposure; mechanic use may also be encumbered (patent/trade dress). |
| **HIGH** | Registered/claimed TM; owner enforces or licenses. Name banned; concept fine generically. |
| **MEDIUM** | Branding/marketing label, registration or scope unverified. Name avoided by policy; concept free. |
| **LOW** | Generic industry term or expired protection. Usable descriptively. |

`legal-review` flag values: **YES-before-any-use** · **YES-if-US-market** ·
**YES-if-player-facing** · **policy-only** (skill bans it as policy; no known legal bar).

## 3. Register — protected mechanic names, trademarks, licensable systems

| Protected name / asset | Owner | What exactly is protected | Safe generic alternative (the ONLY naming the skill may emit) | Risk | Legal review |
|---|---|---|---|---|---|
| **Megaways™** | Big Time Gaming (Evolution) | NAME (registered TM, licensed program: Blueprint, iSoftBet, 1X2, ReelPlay, …) **+ US patent on the mechanic** — the one case where the mechanic itself may be encumbered (US only) [12:S2][12:S3][12:S4] | "variable ways" / "2–7 symbols per reel, ways vary each spin"; avoid the 117,649 marketing framing | **CRITICAL** | YES-if-US-market (patent); name = YES-before-any-use |
| **Megaclusters™, Megapays™, MegaScatter™, MegaQuads™, MegaDozer™** | BTG | NAMES (TM add-ons to the Megaways licensing program) [12:S2] | "grid cluster splits", "shared jackpot pays", etc. — describe behaviour, never the Mega- brand | HIGH | YES-if-player-facing |
| **xWays®, xNudge®, xSplit®, xBomb®, xPays®** + all ~19 xMechanics and the `x`-prefix branding | Nolimit City (Evolution) | NAMES (registered TMs with published usage rules, 2020; licensed to Sneaky Slots, Booming Games) — mechanics themselves imitated freely under other names [12:S5][12:S6][12:S7] | "symbol stack reveal" (xWays), "stepping wild multiplier" (xNudge), "symbol split" (xSplit), "exploding wild" (xBomb); NEVER brand any mechanic `x<Name>` | HIGH | YES-if-player-facing |
| **Gigablox™, Splitz™, MultiMAX™, GigaRise™, DoubleMax™, TopHit™** (GEM program) | Yggdrasil | NAMES (licensable only inside YG Masters/GEM program) [12:S8][12:S9] | "giant block symbols", "split symbols", "growing win multiplier" | HIGH | YES-if-player-facing |
| **Infinity Reels™** (and trade dress) / **InfiniReels™** | ReelPlay / NetEnt (coexistence agreement) | NAME + **trade dress** on the add-a-reel presentation; licensed (Relax network, Live 5, L&W, PG Soft) [12:S10][12:S11][12:S12] | "expanding reel count" / "add-a-reel"; if implemented, presentation must NOT mimic theirs (camera push, reel-append animation style) | HIGH | YES-before-any-use (trade-dress check if concept used) |
| **Cluster Pays™** | NetEnt (Evolution) | NAME (reported registered TM, 2016); the cluster-win concept is universally adopted under other names [12:S18][12:S19] | "cluster wins" / "cluster pay mechanic" (descriptive, docs-only); never as a game brand or marketing label | MEDIUM | YES-if-player-facing (descriptive-use boundary unverified, 12 §Uncertainty 3) |
| **Hold & Spin™ / Lightning Link™ / Dragon Link™** | Aristocrat | NAMES + franchise trade dress of the 2014 persistent-respin line; mechanic widely imitated legally [12:S45][12:S46] | "hold-and-respin" (generic industry term); do not imitate the Lightning/Dragon Link look & feel | HIGH (names) / LOW (concept) | YES-if-player-facing |
| **Dream Drop™** | Relax Gaming | NAME (progressive jackpot brand) [12:S1] | generic jackpot tier ids `JP_MINI..JP_GRAND` (CONVENTIONS §4.2) with themed public labels | HIGH | YES-if-player-facing |
| **X-iter™** | ELK Studios | NAME (branded paid-entry menu) [12:S15] | "feature entry tiers" / "paid entry menu" | MEDIUM | policy-only |
| **Push Bet™** | Push Gaming | NAME (branded stake modifier) [12:S16] | "boosted bet" / "stake modifier" | MEDIUM | policy-only |
| **Super Scatter™, Ante Bet, "1000"-series framing** | Pragmatic Play | Franchise/marketing labels [12:S21][12:S22] | "higher-value scatter mode", "ante stake toggle" (concepts free) | MEDIUM | policy-only |
| **DuelReels™ / "VS" symbol presentation** | Hacksaw Gaming | Feature branding + Hacksaw's scratched-sketch trade dress; no mechanics-licensing program found (Hacksaw licenses distribution, not mechanics) [12:S27][12:S31] | "reel-versus-reel wild transform"; different visual identity mandatory | MEDIUM | policy-only (trade-dress caution) |
| **PopWins™** | AvatarUX | NAME (licensed via aggregators) [12 §6] | "expanding symbol pops" | MEDIUM | policy-only |
| **OpenRGS™** | Hacksaw Gaming | Distribution-platform TM [12:S27] | n/a — never claim compatibility by name | MEDIUM | policy-only |
| **Book of Ra™ / "Book of …" franchise identities** | Novomatic (and per-title owners) | Game titles and art; the "expanding-symbol book game" archetype itself is genericised [12 §2, Play'n GO row] | "expanding special symbol" archetype with an original theme object (never a golden book clone) | MEDIUM | policy-only (trade-dress caution) |
| **Studio names** (Pragmatic Play, Hacksaw, Nolimit City, Push, Relax, ELK, Play'n GO, NetEnt, BTG, Print, …) | respective studios | Company trademarks. Nominative use OK in research/comparison docs; **never** in game names, marketing copy, in-game text, art prompts [12 §6, mandatory note] | — | HIGH | policy-only (hard lint) |
| **Referenced game titles & characters** (Gates of Olympus, Sweet Bonanza, Money Train, Wanted Dead or a Wild, Big Bass fisherman, …) | respective studios | Copyright (art/characters/audio) + title TMs + trade dress | Original theme, characters, names only | **CRITICAL** if copied | policy-only (hard lint) |
| **Competitor reel strips / symbol weights / paytable values / PAR sheets** | respective studios | **Trade secrets** — numerically copying a competitor's math is actionable even without patents (Aristocrat v. L&W: $127.5m, market withdrawal, deletion obligations) [12:S45][12:S48][12:S49] | Clean-room math generated from aggregate public stats only (RTP, volatility class, hit frequency, max win) | **CRITICAL** | policy-only (hard rule; see §5.2) |
| **Telnaes virtual-reel patent** (US 4,448,419) | IGT (historic) | EXPIRED 2002-02-24 — virtual-reel weighting is public domain; cited only as enforcement precedent [12:S43][12:S44][12:S47] | freely usable | LOW | none |
| Cascading/tumbling reels, scatter-pays-anywhere, cluster wins, expanding grids, persistent collectors, stepping wild multipliers, symbol splitting, bonus-buy UX | — | **No blocking patent found**; shipped unlicensed by many studios across regulated markets [12 §7, inferred-high-confidence] | usable as concepts under original names | LOW | route through compliance-review IP checklist |

### 3.1 Default rule for anything not in this table

**Any capitalised mechanic brand from another studio is presumed trademarked — never
reuse it** [12 §6, PopWins row]. When the concept agent imports a mechanic pattern from
research/01/02/14, it must assign an original internal id and an original themed public
name, and record the mapping in `docs/decision-log.md`.

### 3.2 Canonical lint blocklist (validation MUST grep, case-insensitive, `games/<slug>/**`)

```
megaways, megaclusters, megapays, megaquads, megadozer, megascatter,
xways, xnudge, xsplit, xbomb, xpays, x-iter, xiter,
gigablox, splitz, multimax, gigarise, doublemax, tophit,
infinity reels, infinireels, cluster pays, popwins,
hold & spin, hold and spin (as brand), lightning link, dragon link,
dream drop, push bet, duelreels, super scatter, openrgs,
pragmatic play, hacksaw, nolimit city, push gaming, relax gaming,
elk studios, play'n go, playngo, netent, big time gaming, yggdrasil,
reelplay, avatarux, aristocrat, novomatic, print studios,
gates of olympus, sweet bonanza, big bass, money train, wanted dead or a wild,
book of dead, book of ra, starburst, bonanza, san quentin, mental,
tombstone, razor returns, razor ways, jammin jars, pirots, iron bank,
white rabbit, chaos crew, le cowboy, sugar rush, lil devil, snake arena
```

Notes: "hold-and-respin" (hyphenated, descriptive) is the sanctioned generic term and is
NOT a violation; "cluster wins"/"cluster pay mechanic" descriptive use in internal docs
is tolerated but excluded from player-facing text pending TM-scope verification.
Two extra flags the validator must raise (not string matches): (a) any 6-reel game where
symbols-per-reel varies per spin ⇒ auto-flag **"BTG US patent — legal review required
for US distribution"** [12:S4]; (b) any add-a-reel presentation ⇒ trade-dress review vs
Infinity Reels [12:S10][12:S12].

## 4. Patents & trade secrets — the three facts that set policy

1. **BTG US Megaways patent** [observed]: licensing PR references "its U.S patented
   mechanic and MegaWays trademark"; exact number/claims unpinned. Outside the US treat
   as trademark-only risk (unlicensed ways-variant games are widespread in the EU)
   [12:S4][12 §Uncertainty 1]. → validator flag above.
2. **Aristocrat v. Light & Wonder (settled Jan 2026, $127.5m)** [observed]: trade-secret
   case — L&W admitted using Aristocrat math brought by ex-employees; Dragon Train pulled
   from market. Industry takeaway: patents are narrow in slots; **math models, par
   sheets, and design docs are the enforceable asset** [12:S45][12:S48][12:S49].
   → clean-room rule §5.2.
3. **Telnaes precedent** [observed]: while alive, a slot-math patent was enforced hard
   (WMS willful infringement, ~$28.67m); now expired. Lesson: if a live patent is ever
   identified for a target mechanic, treat as blocking until counsel clears it
   [12:S43][12:S44][12:S47].

## 5. AI-generated art & audio — provenance and copyright cautions

The skill generates art via `mcp__imagegen__*` (gpt-image class) and audio via
ElevenLabs/Stable-Audio-class prompts (CONVENTIONS §8). Risks and the rules that
contain them:

### 5.1 Copyrightability of the generated assets

- **US** [observed]: the Copyright Office requires human authorship. Purely
  AI-generated images are not registrable (*Zarya of the Dawn* partial cancellation,
  2023; *Thaler v. Perlmutter*, D.C. Cir. 2025 affirming no authorship for machine-only
  works). The USCO's January 2025 Copyrightability report confirms: prompts alone do not
  confer authorship; **human selection, arrangement, and modification of AI output can**
  make the resulting whole registrable to the extent of the human contribution.
- **UK** [observed]: CDPA s.9(3) grants computer-generated works a form of protection
  (author = person making the arrangements), under government review — divergence from
  US means per-market advice needed.
- **EU** [observed]: no AI-specific authorship rule; human-creation doctrine applies.
  AI Act transparency obligations (Art. 50) may require disclosing AI-generated content
  in some consumer contexts — flag for operator legal review.
- **Skill consequence** [mandatory]: a generated game's art may be **thin or
  unprotectable against copyists** in the US unless human authorship is documented.
  Every run must record, per asset: prompt, tool/model, date, and **all human edits**
  (keying/cleanup, compositing, atlas packing choices, palette grading, manual retouch)
  in `prompts/art-prompts.json` + `docs/source-register.md`, so a registration claim can
  be scoped to the human contribution. Do not represent generated assets as fully
  copyright-protected in any doc.

### 5.2 Infringement risk in the OUTPUT (the bigger practical risk)

- [mandatory] **Prompt lint** — image/audio prompts must never contain: competitor
  studio names, game titles, character names, or "in the style of <living artist /
  named studio>" phrasing. Style must be specified via generic descriptors (palette,
  medium, mood, era) per the art-style bible. The §3.2 blocklist applies to
  `prompts/**` too.
- [mandatory] **Output review gate** — generated symbols/characters must be visually
  checked against the referenced-market table (12 §2) for accidental resemblance to
  known characters/trade dress (e.g. anything resembling the Big Bass fisherman, Zeus of
  Gates of Olympus, Hacksaw's scratch style). Log the check in `validation-report.md`.
- [mandatory] **No training-data laundering claims** — the skill never asserts the
  generation model's training data was licensed; provenance of the *model* is outside
  our control and stays a disclosed residual risk in `known-limitations.md`.
- [recommended] Keep magenta-keyed source PNGs + edit history as evidence of independent
  creation (mirrors the clean-room posture of §4.2 for art).
- [recommended] Trademark side: generated LOGOS/wordmarks for the game name must be
  screened against a TM search before commercial use; the skill only auto-checks the
  §3.2 blocklist.

### 5.3 Audio specifics

- [mandatory] Same prompt lint (no artist names, no "sounds like <track/composer>", no
  competitor game jingle references). Win/feature stingers must be original; do not
  request imitations of known slot jingle families (LDW research in dossier 13 also
  requires our win-sound taxonomy to be original and tier-gated).
- [observed] AI-music copyright status mirrors §5.1 (human-authorship doctrine);
  document human arrangement (loop points, layering, mixing) per asset in
  `prompts/audio-prompts.json`.

### 5.4 Provenance record — required fields

Every entry in `prompts/art-prompts.json` / `audio-prompts.json` must carry:
`assetId`, `prompt`, `negativeOrStyleConstraints`, `tool`, `model` (if reported),
`generatedAt`, `humanEdits[]` (free-text steps), `resemblanceCheck` (pass/flag+note),
`licenseNote` ("AI-generated; human contribution documented; provenance per
research/16 §5"). The asset-manifest schema should reference these fields.

## 6. Skill enforcement summary (encode-me list)

1. Validation step greps the §3.2 blocklist across `games/<slug>/**` including
   `prompts/**`; any hit = build FAIL [mandatory].
2. Auto-flags: 6-reel variable-symbols-per-reel ⇒ BTG US-patent flag; add-a-reel ⇒
   Infinity Reels trade-dress flag; any capitalised third-party mechanic brand not in
   the table ⇒ presume trademarked, FAIL [mandatory].
3. Clean-room math: never ingest/reproduce competitor strips, weights, pays; similarity
   only at aggregate-stat level; state this in `compliance-review.md` [mandatory].
4. Trade-dress: art direction must differ recognisably from the named studio identities
   (Hacksaw scratched-sketch, Nolimit grim sepia, Infinity Reels presentation); creative
   director prompt carries this constraint [mandatory].
5. AI provenance: per-asset record per §5.4; human-edit log; resemblance check;
   known-limitations disclosure of model-training residual risk [mandatory].
6. `compliance-review.md` for every generated game embeds this register's table filtered
   to the mechanics actually used, plus every triggered legal-review flag [mandatory].

## 7. Uncertainties & legal-review items

1. BTG Megaways US patent number/claims/expiry unpinned — YES-if-US-market before any
   6-reel variable-ways game ships to the US [12 §U1].
2. "Cluster Pays" TM scope (phrase vs title/logo) unverified against EUIPO/USPTO —
   keep out of player-facing copy until checked [12 §U3].
3. "DuelReels" registration status unverified — avoided regardless [12 §U4].
4. USCO/court AI-authorship doctrine is moving (2025–26 rulemaking follow-ups); re-check
   the current USCO guidance at each release; UK s.9(3) review may change UK posture.
5. EU AI Act Art. 50 transparency duty as applied to in-game art (vs marketing) is
   unsettled — operator counsel item.
6. This register inherits dossier 12's uncertainty that some TM claims rest on secondary
   sources; before any commercial release, run registry lookups (EUIPO/USPTO/UKIPO) for
   the marks actually adjacent to the shipped game.

— end of dossier —
