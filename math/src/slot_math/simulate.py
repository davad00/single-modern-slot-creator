"""Monte Carlo simulator with reproducible provenance.

    uv run python -m slot_math.simulate --config <dir> --rounds 100000 \
        --seed 42 --workers 2 --bet 100 --out reports/report.json

Every report records: gameVersion, mathVersion, configHash, simCodeVersion,
lockfileHash, seed policy + seeds, rounds, workers and the exact command
(CONVENTIONS.md §5). Natural-play reports validate against
schemas/simulation-report.schema.json; forced tier-isolated runs
(--forced-scatters) can exceed the schema's fraction bound of 10 on
rtp/contributions by construction and are DEV diagnostics only.
Statistics use floats; settlement never does.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from . import SIM_CODE_VERSION
from .config import load_config
from .engine import play_round
from .evaluator import scatter_win
from .rng import make_rng, spawn_worker_seeds

TIERS = ("feature", "super_feature", "ultimate_feature")


def _worker(args: tuple) -> dict:
    config_dir, seed, rounds, bet_minor, forced_scatters = args
    config = load_config(config_dir)
    rng = make_rng(seed)
    wins = np.zeros(rounds, dtype=np.int64)
    scatter_total = 0
    tier_pays = {t: [] for t in TIERS}      # per-instance feature payout (minor)
    tier_rounds = {t: [] for t in TIERS}    # per-instance feature rounds played
    tier_retrig = {t: [] for t in TIERS}    # per-instance retrigger count
    cascades = 0
    max_win_hits = 0
    forced = {"scatterCount": forced_scatters} if forced_scatters else None
    for i in range(rounds):
        m = play_round(config, rng, bet_minor, round_id=f"rnd_{seed}_{i}", forced=forced)
        wins[i] = m["totalWinMinor"]
        scatter_total += scatter_win(
            config.scatter_pays, m["steps"][0]["scatterCount"], bet_minor
        )
        f = m["feature"]
        if f["triggered"]:
            t = f["tier"]
            tier_pays[t].append(f["totalWinMinor"])
            tier_rounds[t].append(
                sum(1 for s in m["steps"] if s["type"] in ("feature_round", "feature_retrigger"))
            )
            tier_retrig[t].append(f["retriggers"])
        cascades += sum(1 for s in m["steps"] if s["type"] == "cascade")
        if m["maximumWinReached"]:
            max_win_hits += 1
    return {
        "wins": wins,
        "scatterTotal": scatter_total,
        "tierPays": tier_pays,
        "tierRounds": tier_rounds,
        "tierRetrig": tier_retrig,
        "cascades": cascades,
        "maxWinHits": max_win_hits,
    }


def run_simulation(
    config_dir: str | Path,
    rounds: int,
    seed: int,
    workers: int = 1,
    bet_minor: int = 100,
    forced_scatters: int = 0,
    command: str = "",
) -> dict:
    started = datetime.now(timezone.utc)
    t0 = time.perf_counter()
    config = load_config(config_dir)

    seeds = spawn_worker_seeds(seed, max(workers, 1))
    per = [rounds // len(seeds)] * len(seeds)
    per[0] += rounds - sum(per)
    tasks = [
        (str(config_dir), s, n, bet_minor, forced_scatters)
        for s, n in zip(seeds, per)
        if n > 0
    ]

    if workers > 1:
        with ProcessPoolExecutor(max_workers=workers) as ex:
            parts = list(ex.map(_worker, tasks))
    else:
        parts = [_worker(t) for t in tasks]

    wins = np.concatenate([p["wins"] for p in parts])
    n = len(wins)
    x = wins.astype(np.float64) / bet_minor  # per-round multiplier (stats only)
    rtp = float(x.mean())
    sd = float(x.std(ddof=1)) if n > 1 else 0.0
    ci = float(1.96 * sd / np.sqrt(n)) if n > 1 else 0.0

    tier_pays = {t: [v for p in parts for v in p["tierPays"][t]] for t in TIERS}
    tier_rounds = {t: [v for p in parts for v in p["tierRounds"][t]] for t in TIERS}
    tier_retrig = {t: [v for p in parts for v in p["tierRetrig"][t]] for t in TIERS}
    tier_count = {t: len(tier_pays[t]) for t in TIERS}
    tier_win = {t: sum(tier_pays[t]) for t in TIERS}
    total_wager = n * bet_minor
    scatter_contrib = sum(p["scatterTotal"] for p in parts) / total_wager

    # base is the residual so the decomposition sums to rtp exactly (QA gate G5)
    contributions = {t: tier_win[t] / total_wager for t in TIERS}
    contributions = {
        "base": rtp - scatter_contrib - sum(contributions.values()),
        "scatter_pay": scatter_contrib,
        **contributions,
    }

    percentiles = {
        f"p{q:g}": float(np.percentile(x, q)) for q in (50, 75, 90, 95, 99, 99.9)
    }

    def one_in_n(count: int) -> float:
        # 0 observed triggers cannot yield a measured frequency; report the
        # run horizon as an honest lower bound (flagged in passFail.notes)
        return n / count if count else float(n)

    zero_tiers = [t for t in TIERS if tier_count[t] == 0]
    instances = sum(tier_count.values())
    retriggered = sum(1 for t in TIERS for r in tier_retrig[t] if r > 0)

    per_tier = []
    for t in TIERS:
        pays_x = np.array(tier_pays[t], dtype=np.float64) / bet_minor
        got = tier_count[t] > 0
        per_tier.append(
            {
                "tierId": t,
                "entryMode": "natural",
                "triggers": tier_count[t],
                "freqOneInN": one_in_n(tier_count[t]),
                "rtpContribution": tier_win[t] / total_wager,
                "avgPayX": float(pays_x.mean()) if got else 0.0,
                "medianPayX": float(np.percentile(pays_x, 50)) if got else 0.0,
                "p99PayX": float(np.percentile(pays_x, 99)) if got else 0.0,
                "maxPayX": float(pays_x.max()) if got else 0.0,
                "avgRounds": float(np.mean(tier_rounds[t])) if got else 0.0,
                "retriggerRate": (
                    sum(1 for r in tier_retrig[t] if r > 0) / tier_count[t] if got else 0.0
                ),
            }
        )

    mm = config.math_model
    target = float(mm.get("targetRtp", 0.96))
    tolerance = float(mm.get("rtpTolerance", 0.003))
    passed = abs(rtp - target) <= max(tolerance, ci)

    notes = (
        f"dev-level run; |rtp-target|={abs(rtp - target):.4f}, "
        f"ci95 half-width={ci:.4f}; release sizing must follow prompts/math.md"
    )
    if zero_tiers:
        notes += (
            f"; tiers with 0 natural triggers at this size: {', '.join(zero_tiers)} "
            "(their freqOneInN is the run horizon, a lower bound, not a measurement)"
        )

    lock_candidates = [Path(__file__).resolve().parents[2] / "uv.lock"]
    lock_hash = None
    for lc in lock_candidates:
        if lc.exists():
            lock_hash = "sha256:" + hashlib.sha256(lc.read_bytes()).hexdigest()

    prefix = f"sim-forced{forced_scatters}" if forced_scatters else "sim"
    report = {
        "reportId": f"{prefix}-{seed}-{n}",
        "kind": "tier_isolated" if forced_scatters else "dev",
        "provenance": {
            "gameVersion": config.game_version,
            "mathVersion": config.math_version,
            "configHash": config.config_hash,
            "simCodeVersion": SIM_CODE_VERSION,
            "lockfileHash": lock_hash,
            "seedPolicy": "per-worker-derived",
            "seeds": seeds,
            "rounds": n,
            "workers": workers,
            "command": command or " ".join(sys.argv),
            "startedAt": started.isoformat(),
            "durationS": round(time.perf_counter() - t0, 2),
        },
        "results": {
            "rtp": rtp,
            "rtpCi95": [max(rtp - ci, 0.0), rtp + ci],
            "hitFrequency": float((wins > 0).mean()),
            "contributions": contributions,
            "featureFreq": {t: one_in_n(tier_count[t]) for t in TIERS},
            "retriggerRate": retriggered / instances if instances else 0.0,
            "avgCascades": sum(p["cascades"] for p in parts) / n,
            "payoutPercentiles": percentiles,
            "maxWinHits": sum(p["maxWinHits"] for p in parts),
            "maxWinProb": sum(p["maxWinHits"] for p in parts) / n,
            "variance": sd * sd,
            "stddev": sd,
            # studio volatility index: stddev clamped to the schema's 0-100 scale
            "volatilityIndex": min(sd, 100.0),
        },
        "perTier": per_tier,
        "passFail": {
            "targetRtp": target,
            "tolerance": tolerance,
            "pass": bool(passed),
            "notes": notes,
        },
    }
    return report


def main() -> None:
    ap = argparse.ArgumentParser(description="slot_math Monte Carlo simulator")
    ap.add_argument("--config", required=True, help="config directory")
    ap.add_argument("--rounds", type=int, default=1_000_000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--bet", type=int, default=100, help="bet in minor units")
    ap.add_argument("--forced-scatters", type=int, default=0, help="DEV: force tier entry")
    ap.add_argument("--profile", default="rtp-default")
    ap.add_argument("--out", default=None, help="write JSON report here")
    args = ap.parse_args()

    command = "uv run python -m slot_math.simulate " + " ".join(sys.argv[1:])
    report = run_simulation(
        args.config, args.rounds, args.seed, args.workers, args.bet,
        args.forced_scatters, command=command,
    )
    text = json.dumps(report, indent=2)
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(f"wrote {out}")
    r = report["results"]
    print(
        f"rounds={report['provenance']['rounds']} rtp={r['rtp']:.4f} "
        f"ci95=±{(r['rtpCi95'][1] - r['rtp']):.4f} hit={r['hitFrequency']:.3f} "
        f"pass={report['passFail']['pass']}"
    )


if __name__ == "__main__":
    main()
