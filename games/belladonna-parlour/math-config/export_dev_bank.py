"""Export the DEV-ONLY scenario bank the client's ScenarioBankProvider replays.

    cd games/belladonna-parlour/math
    uv run python ../math-config/export_dev_bank.py

Adapts the Python engine manifest (CONVENTIONS §7 wire shape) to the client
core's OutcomeManifest contract (client/src/core/types.ts):

- wagerMinor→betMinor · maximumWinReached→capped · + maxWinCapMinor
- every settled minor amount becomes a Win entry so the client's
  "totalWinMinor == Σ win.winMinor" and per-win floor cross-checks hold:
  * scatter pays  → SCATTER win entry on the initial step
  * orb/bank multiplier deltas → MULT win entry on the apply step
    (exact because the bank is generated at betMinor=100: payX100 == minor delta)
- steps keep multiplier=1 (raw wins; multipliers are settled via delta entries)
- feature block remapped to tierId/roundsAwarded/retriggerCount/retriggerCap/…

Deterministic: fixed seeds. Regenerate after ANY math change — the bank embeds
the configHash it was built from and the client refuses a mismatched hash.
DEV ONLY. Never a production outcome source.
"""

import json
from pathlib import Path

from slot_math.config import load_config
from slot_math.engine import play_round
from slot_math.evaluator import scatter_win
from slot_math.money import win_minor
from slot_math.rng import make_rng

HERE = Path(__file__).parent
BET = 100  # adapter exactness requires betMinor == 100 (payX100 == minor units)


def adapt(m: dict, cfg) -> dict:
    bet = m["wagerMinor"]
    assert bet == BET, "scenario bank must be generated at betMinor=100"
    steps_out = []
    for s in m["steps"]:
        wins = []
        for w in s["wins"]:
            wins.append(
                {
                    "symbolId": w["symbolId"],
                    "count": w.get("countAnywhere", len(w["positions"])),
                    "payX100": w["payX100"],
                    "winMinor": w["winMinor"],
                    "positions": [list(p) for p in w["positions"]],
                }
            )
        ext = s.get("ext", {})
        # scatter pays land on every sequence-first step: the base initial drop
        # AND each feature spin's drop (engine settles them flat there)
        if s["type"] in ("initial_result", "feature_round", "feature_retrigger") and s["scatterCount"] > 0:
            sc_pay = scatter_win(cfg.scatter_pays, s["scatterCount"], bet)
            if sc_pay > 0:
                positions = [
                    [c, r]
                    for c, col in enumerate(s["grid"])
                    for r, sym in enumerate(col)
                    if sym == "SCATTER"
                ]
                wins.append(
                    {
                        "symbolId": "SCATTER",
                        "count": s["scatterCount"],
                        "payX100": sc_pay,  # bet=100 ⇒ payX100 == minor amount
                        "winMinor": sc_pay,
                        "positions": positions,
                    }
                )
        ma = ext.get("multiplierApply")
        if ma:
            delta = ma["after"] - ma["before"]
            if delta > 0:
                orb_positions = [o["pos"] for o in ext.get("orbGrid", [])]
                wins.append(
                    {
                        "symbolId": "MULT",
                        "count": max(len(orb_positions), 1),
                        "payX100": delta,  # bet=100 ⇒ exact
                        "winMinor": delta,
                        "positions": orb_positions or [[0, 0]],
                    }
                )
        steps_out.append(
            {
                "stepId": s["stepId"],
                "type": s["type"],
                "grid": s["grid"],
                "wins": wins,
                "scatterCount": s["scatterCount"],
                "multiplier": 1,
                "events": s["events"],
            }
        )

    feature = None
    f = m["feature"]
    if f["triggered"]:
        rt = int(cfg.features[f["tier"]].get("retriggerCap", 3))
        rounds_played = sum(
            1 for s in m["steps"] if s["type"] in ("feature_round", "feature_retrigger")
        )
        bank = 1
        for s in m["steps"]:
            b = s.get("ext", {}).get("multiplierBank")
            if b:
                bank = b
        feature = {
            "tierId": f["tier"],
            "triggerScatterCount": m["steps"][0]["scatterCount"],
            "initialRoundsAwarded": f["initialRounds"],
            "roundsAwarded": f["initialRounds"] + 5 * f["retriggers"],
            "roundsPlayed": rounds_played,
            "retriggerCount": f["retriggers"],
            "retriggerCap": rt,
            "multiplier": bank,
            "winMinor": f["totalWinMinor"],
        }

    return {
        "manifestVersion": "1.0.0",
        "roundId": m["roundId"],
        "gameVersion": m["gameVersion"],
        "mathVersion": m["mathVersion"],
        "betMinor": bet,
        "currency": m["currency"],
        "totalWinMinor": m["totalWinMinor"],
        "maxWinCapMinor": win_minor(bet, cfg.max_win_x_bet * 100),
        "capped": m["maximumWinReached"],
        "steps": steps_out,
        "feature": feature,
        "signature": "DEV-FAKE-SIGNATURE",
    }


def main() -> None:
    cfg = load_config(HERE)
    raw = []
    rng = make_rng(20260808)
    for i in range(240):
        raw.append(play_round(cfg, rng, BET, round_id=f"rnd_bank_{i}"))
    for n, count in ((3, 8), (4, 6), (5, 4), (6, 2)):
        for j in range(count):
            raw.append(
                play_round(
                    cfg, make_rng(9000 + n * 100 + j), BET,
                    round_id=f"rnd_bank_forced{n}_{j}", forced={"scatterCount": n},
                )
            )
    bank = [adapt(m, cfg) for m in raw]

    # adapter invariant: totals equal the sum of win entries (uncapped rounds)
    for b in bank:
        s = sum(w["winMinor"] for st in b["steps"] for w in st["wins"])
        if not b["capped"]:
            assert s == b["totalWinMinor"], (b["roundId"], s, b["totalWinMinor"])
        else:
            assert s >= b["totalWinMinor"]

    out = HERE.parent / "client" / "scenarios"
    out.mkdir(parents=True, exist_ok=True)
    meta = {
        "generator": "slot_math scenario export (DEV ONLY - never production)",
        "gameId": cfg.game_id,
        "configHash": cfg.config_hash,
        "seedPolicy": "make_rng(20260808) sequential + forced seeds 9xxx",
        "betMinor": BET,
        "count": len(bank),
    }
    (out / "dev-bank.json").write_text(
        json.dumps({"meta": meta, "manifests": bank}), encoding="utf-8"
    )
    trig = [b for b in bank if b["feature"]]
    print(
        "wrote", len(bank), "client-shape manifests;",
        "features:", len(trig),
        "tiers:", {t: sum(1 for b in trig if b["feature"]["tierId"] == t)
                   for t in ("feature", "super_feature", "ultimate_feature")},
        "capped:", sum(1 for b in bank if b["capped"]),
    )


if __name__ == "__main__":
    main()
