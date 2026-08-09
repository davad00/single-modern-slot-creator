"""Exact base-game enumeration for line games with uniform independent stops.

For each line we enumerate the joint distribution of the symbols on that
line: under uniform stops, the symbol at a fixed visible row of reel c is
distributed as count(s in strip_c) / len(strip_c), independent across reels.
Expected pay uses the SAME best-line-win logic as the runtime evaluator, so
theory and simulation cannot drift apart.

Complexity: O(lines * S^C) with S distinct symbols per reel and C reels —
fine for S<=12, C<=5 (~2.5M evaluations). For ways/cluster/cascade games use
Monte Carlo instead (see prompts/math.md).
"""

from __future__ import annotations

from itertools import product

from .evaluator import SCATTER, _best_line_win
from .reels import symbol_probabilities


def expected_line_pay_x100(strips: list[list[str]], lines: list[list[int]], paytable: dict) -> float:
    """Exact E[total line pay per round], in payX100 units (of total bet)."""
    per_reel = [list(symbol_probabilities(strip).items()) for strip in strips]
    total = 0.0
    for _line in lines:
        # the visible row doesn't change the distribution under uniform stops,
        # so every line has the same per-reel symbol distribution
        for combo in product(*per_reel):
            symbols = [s for s, _ in combo]
            p = 1.0
            for _, prob in combo:
                p *= prob
            best = _best_line_win(symbols, paytable)
            if best is not None:
                total += p * best[2]
    return total


def scatter_probabilities(strips: list[list[str]], rows: int) -> dict[int, float]:
    """Exact distribution of visible scatter count (Poisson binomial over
    reels; assumes each strip window shows at most `rows` scatters and that
    scatters per reel are counted from strip composition)."""
    # P(k scatters visible on reel c): with uniform stops, expected count of
    # scatter cells in the window = rows * count/len; for strips with a single
    # scatter, at most one is visible: p = rows * count / len (exact when
    # scatters on the strip are spaced >= rows apart).
    probs = []
    for strip in strips:
        count = sum(1 for s in strip if s == SCATTER)
        p = min(rows * count / len(strip), 1.0)
        probs.append(p)
    dist = {0: 1.0}
    for p in probs:
        new: dict[int, float] = {}
        for k, q in dist.items():
            new[k] = new.get(k, 0.0) + q * (1 - p)
            new[k + 1] = new.get(k + 1, 0.0) + q * p
        dist = new
    return dist


def expected_scatter_pay_x100(strips: list[list[str]], rows: int, scatter_pays: dict) -> float:
    if not scatter_pays:
        return 0.0
    dist = scatter_probabilities(strips, rows)
    total = 0.0
    for k, p in dist.items():
        pay = 0
        for req, v in scatter_pays.items():
            if k >= int(req) and int(v) > pay:
                pay = int(v)
        total += p * pay
    return total


def theoretical_base_rtp(config) -> float:
    """Exact base-game RTP (line pays + scatter pays), fraction of bet.
    Excludes features — those need simulation or a feature-value model."""
    strips = config.strips("base")
    line_ev = expected_line_pay_x100(strips, config.lines, config.paytable)
    sc_ev = expected_scatter_pay_x100(strips, config.rows, config.scatter_pays)
    return (line_ev + sc_ev) / 100.0
