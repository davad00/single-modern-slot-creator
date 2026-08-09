# Decision Log — Belladonna's Parlour

Game: Belladonna's Parlour · slug belladonna-parlour · generator single-modern-slot-creator v1.0.0

## 2026-08-08 — Step 1: intake & normalization

- Brief: fully AUTO (user: "make a slot now using the new skill"). Normalized to skill-input
  defaults per CONVENTIONS §11; assumptions A1–A5 logged. projectSlug `belladonna-parlour`
  assigned at step 3 (placeholder `auto-slot` before selection). Output root:
  `H:\code\11Tools\slots-skill\games\belladonna-parlour\`.
- Definition of done = SKILL.md §Packaging + gates G2–G14; dev-grade sim sizing per A10.
- Execution model: orchestrator runs steps 1–6 and 11–14 in the main session; steps 7–10 run as
  detached workers (proven .build/detached machinery) — in-session subagents are interrupted by
  user messages in this harness (documented in .build/BUILD-STATE.md incident log).

## 2026-08-08 — Step 2: focused research

- Niche scoped to C1 family + dark-apothecary theme cluster; dossier reused as baseline (all files
  dated 2026-08-08); run-time research limited to the potion-niche incumbent check (W1–W4).
- Key finding: both potion-themed incumbents (Potion Spells/BGaming 2023; Potions/Paperclip
  Stake-exclusive) are 7×7 CLUSTER games ⇒ "dark apothecary × 6×5 scatter-pays" pairing is open.
- 5 binding differentiation requirements handed to step 3 (research-addendum.md §Originality).
- IP list seeded verbatim from research/16 §3.2 + register rows + both auto-flags (both N/A for a
  fixed 6×5 grid). Clean-room rule restated: no competitor strips/weights/paytables ever recorded.
- G2 self-check: 12 dated sources (4 run-time) ✓ · IP list ✓ · patterns-not-to-copy ✓ ·
  competitor matrix 8 rows aggregate-only ✓ · 4 sourced opportunities ✓ · originality review with
  5 requirements ✓ · **G2 PASS**.

## 2026-08-08 — Step 3: concept & theme (G3)

Three candidates drafted (full one-pagers + matrix in GDD §1 "Concept selection"):

| # | Title | Theme cluster | Archetype + primary mechanic | Weighted total (max 500) |
|---|---|---|---|---|
| A | **Belladonna's Parlour** | dark-fantasy apothecary | 6×5 scatter-pays + cascades (C1) | **455** |
| B | The Gilded Lift | neon-noir heist | 5×3 lines + hold-and-respin (C2) | 430 |
| C | Mycelium Crown | bioluminal fungal court | 7×7 cluster + cascades + meter (C3) | 410 |

- Selection: **A** by clear margin (25 pts > 5-pt tie threshold; no tie-break needed).
- B rejected: strong and cheapest to certify, but weakest theme-mechanic fusion and busiest niche.
- C rejected: freshest theme but 7×7 collides with both potion incumbents' archetype (differentiation
  req 1) and worst mobile readability + effort scores.
- Identity locked: final title **Belladonna's Parlour** · backup **The Nightshade Tonic** ·
  tagline **"Every cure has a price."** Lint-clean vs research/16 §3.2 (grep zero hits);
  real trademark search = pre-release legal item (risk K1).
- Adult-appropriate: Victorian poison-noir, no child characters, no juvenile pastiche, no
  confectionery cues (originality statement in GDD §2).

## 2026-08-08 — Step 4: archetype & mechanics (G4)

**Locked package** (generic internal ids; themed names are player-facing only):

| Role | Internal id | Public name | Market pattern derived from | Protected names NOT used |
|---|---|---|---|---|
| Archetype | `scatter_pays` 6×5 (thresholds 8-9/10-11/12+) | — | Pragmatic-class pay-anywhere (reference only) | "Super Scatter", any franchise names |
| Primary mechanic | `cascades` (cap 20/spin) | The Shattering | tumble family (generic) | "Tumble"™-free: descriptive use only |
| Supporting 1 | `summed_orb_multiplier` (MULT symbol, sequence multiplier; persistent bank in features) | Distilled Essence | orb-multiplier family (generic) | no orb-strike trade dress |
| Supporting 2 | `multiplier_doubler` (FX1, ultimate-only, P ×2 on winning spin, P cap ×512) | The Prisming | premium-enhancement family | — |
| Mandated (not counted) | tier hierarchy 3/4/5+ | The Tasting / The Distillery / The Night Garden | CONVENTIONS §4.1 | — |

- Compatibility: package = bundle **C1** (research/14 §2) — GOOD by inclusion; §3 row C1 scores
  Math 4 / SM 3 / Anim 3 / Rec 3 / **Overall 4**. Overall-4 mandates release-grade sim sizing ⇒
  handled per A10 (dev-grade this run + documented release plan; risk K3). Ten-dimension
  assessment table in GDD §6. ≤2 extreme-volatility levers respected (persistent multiplier +
  12+-band pays; cascade cap and P-cap bound the tail).
- Rejection rules: 7 rules × 3 mechanics evaluated — all PASS (table in GDD §6.4). Notable:
  no WILD symbol (A6) avoids purpose duplication with cascades; all mechanics representable as
  manifest steps (`initial_result`/`cascade`/`feature_*`/`max_win_termination`/`settlement`) with
  orb values serialized under step `ext.orbs` (forward-compat extension field).
- Trademark screen: grep of step-3/4 outputs vs §3.2 = zero hits in game-facing text ✓.
  Auto-flags: both N/A (fixed grid, no add-a-reel).
- Config touch map: GDD §6.5. No files written under config/ (mathematician's territory, step 5).
- **G4 self-check: PASS** (1 archetype ✓, 1 primary ✓, 2 supporting ✓, ten dimensions per
  mechanic ✓, caps everywhere ✓, canonical states only ✓, symbol ids conform ✓).

## 2026-08-08 — Steps 5-6: math model, tuning & tier design (G5/G6) — CLOSED

- Engine: scatter_pays evaluator + scatter_round module added to the game's math package
  (orbs = exact integer scalars; per-win floor rule only division; 46/46 tests green).
- Tuning: 8 recorded iterations + 3 battery cycles (all misses logged in tuning-log.md).
  FROZEN at battery v3: **RTP 0.9651 ± 0.0077 (3M rounds, seed 5252) — dev gate PASS**
  (Δ 0.0051 ≤ 0.01); hit 0.2849; σ 6.81. Math bundle sha256:c3a6de0f…31441.
- Tier design (G6 PASS): 10/12/12 rounds · bank ×1/×3/×5 · orb economies (freq+tables
  5.7/7.0/8.0 means) · FX1 doubler ultimate-only. Forced EVs 40.42×/88.01×/161.01× —
  strictly ordered, separate reports (seeds 521/522/523).
- Superseded early targets (recorded, not hidden): ultimate natural frequency accepted at
  measured 1-in-60,000 (early GDD band 1/6-10k was unreachable under independent-draw
  scatter math — tuning-log note 1); buy prices moved off the 100× anchor to measured-EV
  pricing 42.10×/91.70×/167.70× @ ~0.960 buy RTP (note 3); ante stake finalized ×1.20
  (from ×1.25) with measured effective RTP 0.9698 after 3 ante calibration runs.
- Hash provenance: main battery ran at pre-ante-recalibration bundle; final bundle differs
  ONLY in the ante set (strip-level diff verified — PAR sheet provenance note).
- OPEN ITEM K7 raised: advertised-max-win hittability vs GLI-11 (see risk register, PAR §8).
- Display configs synced to frozen math (sync_display_configs.py; schema v1.0.1 widening:
  scatter_pays evaluation mode + of-a-kind thresholds to 30 — backwards-compatible).
- Scenario bank regenerated at frozen hash; client 195/195 green (G11/G12 core evidence).
