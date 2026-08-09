# Risk Register — Belladonna's Parlour

Game: Belladonna's Parlour · slug belladonna-parlour · started 2026-08-08 · generator single-modern-slot-creator v1.0.0

## IP-risk list (seeded from research/16-ip-risk-register.md — step 2, G2)

### Lint blocklist (verbatim from research/16 §3.2 — step-13 validation MUST grep, case-insensitive, games/belladonna-parlour/**; zero hits allowed in game-facing text)

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

(Note per research/16: hyphenated descriptive "hold-and-respin" is sanctioned generic vocabulary.)

### Register rows relevant to this niche (from research/16 §3)

| Protected item | Owner | What is protected | Safe generic alternative used here | Risk | Legal review? |
|---|---|---|---|---|---|
| "Super Scatter" (variant branding) | Pragmatic-associated | name/brand | tiered scatter entry (3/4/5+) | med if named | only if name echoed — it is not |
| Tumble/orb-multiplier presentation identity (Gates-class) | Pragmatic | trade dress (composition, orb-strike VFX), not the mechanic | diegetic essence-distillation into master vial | med | trade-dress distance check at step 13 |
| "Cluster Pays" (brand) | NetEnt/Evolution | brand name | (cluster not used) | low | no |
| Hold-and-spin brands (Lightning Link / Dragon Link) | Aristocrat | names | (mechanic not used) | low | no |
| Exact competitor math (strips/weights/paytables) | all studios | trade secret (Aristocrat v. L&W, $127.5M) | clean-room math; aggregate-stat similarity only | high if violated | policy: never record competitor math |

### Auto-flags (research/16 §3.2 notes)

- BTG variable-height US patent: **N/A** — fixed 6×5 grid, symbols-per-reel constant. Checked 2026-08-08.
- Add-a-reel / Infinity-Reels trade dress: **N/A** — no reel-count changes anywhere.

## Run risks

| # | Date | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|
| K1 | 2026-08-08 | "Belladonna's Parlour" name may collide with an existing mark in some class | low | med | pre-release trademark search = REQUIRED legal item; backup title "The Nightshade Tonic" reserved | legal (pre-release) |
| K2 | 2026-08-08 | Trade-dress proximity to Gates-class orb presentation | med | med | differentiation reqs 2–3 (research-addendum) enforced at steps 7–9; step-13 visual check | creative-director |
| K3 | 2026-08-08 | Dev-size simulation evidence insufficient for certification (research/14 §3 rule 2 requires ~700M-round class evidence at Overall 4) | certain this run | med | declared in known-limitations; release-sizing formula + commands documented in PAR sheet; REQUIRED-BEFORE-CERT | mathematician / lab |
| K4 | 2026-08-08 | Poison/apothecary theme could drift toward minor-appealing "witchy cute" styling | low | high (GB CAP) | adult-framing gate in style bible; no mascots, no cute familiars; step-13 review | creative-director |
| K5 | 2026-08-08 | Persistent multiplier × 12+-symbol pays can spike tail beyond 10,000x budget | med | med | hard caps (P ≤ 512, cascade ≤ 20, retriggers 3/4/5), max_win_termination settles exactly at cap; tail measured per tier | mathematician |
| K6 | 2026-08-08 | imagegen MCP backend outage (observed earlier today) may leave art prompt-only | med | low | prompts + Blender scripts always emitted; generation retried at step 9; degradation documented (SKILL.md G9 path) | orchestrator |
| K7 | 2026-08-08 | **OPEN — advertised max win vs GLI-11 hittability:** measured tail (0 cap hits in 3M+90k rounds; ultimate p99.9 ≈ 2,006×) implies 10,000× cap odds ≪ 1-in-50M, so ADVERTISING "max win 10,000×" fails GLI-11's advertised-award rule on current evidence | certain (as advertised claim) | high (cert blocker if advertised) | pre-release: (a) redesign ultimate tail hotter, (b) advertise a demonstrably hittable figure with published odds, or (c) lab guidance on liability-cap-vs-advertised-award language; rare-event estimation via importance sampling (research/03) REQUIRED-BEFORE-CERT | mathematician + legal/lab |
