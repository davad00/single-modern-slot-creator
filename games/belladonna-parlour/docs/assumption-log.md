# Assumption Log — Belladonna's Parlour

| Field | Value |
|---|---|
| Game name | Belladonna's Parlour |
| Project slug | belladonna-parlour |
| Game version | 0.1.0 · Math version 0.1.0 |
| Config hash | (pending configs) |
| Date | 2026-08-08 |
| Generator | single-modern-slot-creator v1.0.0 |

| # | Date | Step | Assumption | Reason | Impact if wrong |
|---|---|---|---|---|---|
| A1 | 2026-08-08 | 1 | Brief is fully AUTO ⇒ CONVENTIONS §11 defaults + research/14 §2 recommendation order (C1 first) scope the run | prompts/research.md Procedure 1 | Re-scope concept phase |
| A2 | 2026-08-08 | 1 | Market posture: mainstream with streamer appeal — max win 10,000x, published cap odds | research/00 §4; research/12 §5 | Retune tail/caps |
| A3 | 2026-08-08 | 1 | Target jurisdictions: none named ⇒ build for generic-.com (MT baseline) + ship `restricted-default` policy for UNKNOWN (CONVENTIONS §9.6) | AUTO brief | Add policies later; engine is policy-driven |
| A4 | 2026-08-08 | 1 | Single RTP profile 0.9600 built this run; 0.94/0.92 listed as not-built variants | AUTO; CONVENTIONS §11 | Additional profiles need separate tuning+sim |
| A5 | 2026-08-08 | 2 | Web tools available; 2+ run-time sources included; dossier (generated 2026-08-08, same day) accepted without re-verification — nothing load-bearing is >12 months old | prompts/research.md Procedure 2–3 | — |
| A6 | 2026-08-08 | 3 | No WILD symbol: scatter-pays-anywhere family convention (C1); WILD would duplicate the cascade's purpose of extending wins | research/14 §2 C1; rejection rule 1 | Paytable rebalance |
| A7 | 2026-08-08 | 3 | Scatter counting: `initial-grid`, cascaded/copied scatters do NOT count (CONVENTIONS §11 default) | keeps trigger math closed-form; avoids research/14 §3 rule-1 Math+1 | Trigger frequencies change materially |
| A8 | 2026-08-08 | 4 | Max 1 SCATTER visible per reel (strip spacing ≥ window) ⇒ scatter count ∈ 0..6; the 6-scatter scatter-pay band (100x) IS the "6+ instant award" | bounded tier math; research/02 D3 6+-award pattern | Rebuild strips + bands |
| A9 | 2026-08-08 | 4 | Essence orbs bank into the persistent feature multiplier ONLY on spins whose tumble sequence wins > 0 | keeps per-spin math decomposable; anticipation stays honest (no dead-orb celebration = LDW rule) | Feature EV changes; retune orb tables |
| A10 | 2026-08-08 | 4 | Hardware constraint (4-core dev box): this run executes DEV-GRADE simulation sizing (≥1M natural rounds + ≥10⁴ forced entries per tier + per-buy-mode sims). research/14 §3 rule 2 (Overall-4 ⇒ release-grade ~700M rounds) is documented as REQUIRED-BEFORE-CERT, not executed | compute reality; precedent: examples/example-single-slot | Numbers carry dev-size CIs; certification evidence incomplete by design, declared in known-limitations.md |
| A11 | 2026-08-08 | 4 | Persistent multiplier hard cap ×512; cascade cap 20/spin; retrigger caps 3/4/5 by tier — termination provable | CONVENTIONS §9.4 | Liability model changes |
