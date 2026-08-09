"""PAR sheet builder: symbol inventories, theoretical base RTP (line games),
and simulation-derived statistics, rendered to Markdown."""

from __future__ import annotations

from .enumerate_lines import theoretical_base_rtp


def symbol_distribution(strips: list[list[str]]) -> list[dict]:
    out = []
    for i, strip in enumerate(strips):
        counts: dict[str, int] = {}
        for s in strip:
            counts[s] = counts.get(s, 0) + 1
        out.append({"reel": i + 1, "stripLength": len(strip), "counts": counts})
    return out


def build_par_sheet(config, sim_report: dict | None = None) -> dict:
    par: dict = {
        "game": {
            "gameId": config.game_id,
            "gameName": config.game_name,
            "gameVersion": config.game_version,
            "mathVersion": config.math_version,
            "configHash": config.config_hash,
        },
        "grid": {"columns": config.columns, "rows": config.rows},
        "evaluation": config.evaluation,
        "maxWinXBet": config.max_win_x_bet,
        "reelSets": {
            purpose: symbol_distribution(strips)
            for purpose, strips in config.reel_sets.items()
        },
        "paytablePayX100": config.paytable,
        "scatterPaysPayX100": config.scatter_pays,
        "tiers": config.features,
    }
    if config.evaluation == "lines":
        par["theoreticalBaseRtp"] = theoretical_base_rtp(config)
    if sim_report:
        par["simulation"] = {
            "provenance": sim_report["provenance"],
            "results": sim_report["results"],
            "perTier": sim_report["perTier"],
        }
    return par


def render_markdown(par: dict) -> str:
    g = par["game"]
    lines = [
        f"# PAR Sheet — {g['gameName']}",
        "",
        f"- gameId: `{g['gameId']}` · version {g['gameVersion']} · math {g['mathVersion']}",
        f"- configHash: `{g['configHash']}`",
        f"- grid: {par['grid']['columns']}x{par['grid']['rows']} · evaluation: {par['evaluation']}",
        f"- max win: {par['maxWinXBet']}x bet",
        "",
    ]
    if "theoreticalBaseRtp" in par:
        lines += [f"**Theoretical base-game RTP (exact):** {par['theoreticalBaseRtp']:.4f}", ""]
    for purpose, dist in par["reelSets"].items():
        lines += [f"## Reel set `{purpose}` — symbol distribution", "",
                  "| Reel | Length | " + " | ".join(sorted(dist[0]["counts"])) + " |",
                  "|" + "---|" * (2 + len(dist[0]["counts"]))]
        for row in dist:
            keys = sorted(dist[0]["counts"])
            lines.append(
                f"| {row['reel']} | {row['stripLength']} | "
                + " | ".join(str(row["counts"].get(k, 0)) for k in keys) + " |"
            )
        lines.append("")
    if "simulation" in par:
        r = par["simulation"]["results"]
        p = par["simulation"]["provenance"]
        lines += [
            "## Simulation", "",
            f"- rounds: {p['rounds']} · seeds: {p['seeds']} · command: `{p['command']}`",
            f"- RTP: {r['rtp']:.4f} (95% CI {r['rtpCi95'][0]:.4f}–{r['rtpCi95'][1]:.4f})",
            f"- hit frequency: {r['hitFrequency']:.4f}",
            f"- stddev: {r['stddev']:.2f} · max-win prob: {r['maxWinProb']:.2e}",
            "",
            "| Tier | 1-in-N | RTP contribution | Avg payout (x bet) |",
            "|---|---|---|---|",
        ]
        for t in par["simulation"]["perTier"]:
            freq = f"{t['freqOneInN']:.0f}" if t["triggers"] else "—"
            avg = f"{t['avgPayX']:.1f}" if t["triggers"] else "—"
            lines.append(f"| {t['tierId']} | {freq} | {t['rtpContribution']:.4f} | {avg} |")
        lines.append("")
    lines += [
        "---",
        "_Independent mathematical verification is REQUIRED before any real-money release._",
    ]
    return "\n".join(lines)
