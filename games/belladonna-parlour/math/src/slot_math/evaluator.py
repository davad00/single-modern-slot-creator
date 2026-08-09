"""Win evaluation: left-to-right line pays, ways pays, scatter counting.

Wilds substitute for every symbol except SCATTER. A line/way consisting
entirely of wilds is attributed to the best-paying interpretation (which,
absent a WILD paytable entry, is the highest-paying substitutable symbol).
All win amounts are integer minor units via the floor rule.
"""

from __future__ import annotations

from .money import win_minor

WILD = "WILD"
SCATTER = "SCATTER"


def _pay_for(paytable: dict, symbol: str, count: int) -> int:
    pays = paytable.get(symbol)
    if not pays:
        return 0
    return int(pays.get(str(count), 0))


def evaluate_lines(
    grid: list[list[str]],
    lines: list[list[int]],
    paytable: dict,
    bet_minor: int,
) -> list[dict]:
    """Left-to-right line evaluation with wild substitution.

    grid is columns-major: grid[col][row]. Returns win dicts with positions
    as [col, row] pairs.
    """
    wins: list[dict] = []
    for line_id, line in enumerate(lines):
        symbols_on_line = [grid[c][line[c]] for c in range(len(line))]
        best = _best_line_win(symbols_on_line, paytable)
        if best is None:
            continue
        target, count, pay_x100 = best
        wins.append(
            {
                "symbolId": target,
                "positions": [[c, line[c]] for c in range(count)],
                "payX100": pay_x100,
                "winMinor": win_minor(bet_minor, pay_x100),
                "lineId": line_id,
            }
        )
    return wins


def _best_line_win(symbols: list[str], paytable: dict) -> tuple[str, int, int] | None:
    """Best-paying (target, count, payX100) for one line, or None."""
    candidates: set[str] = set()
    for s in symbols:
        if s == SCATTER:
            break  # scatter never participates in line pays and blocks the run
        if s != WILD:
            candidates.add(s)
            break
    # a pure-wild prefix can substitute for anything in the paytable
    if not candidates:
        candidates = {s for s in paytable.keys() if s != SCATTER}
    best: tuple[str, int, int] | None = None
    for target in candidates:
        count = 0
        for s in symbols:
            if s == target or s == WILD:
                count += 1
            else:
                break
        pay = _pay_for(paytable, target, count)
        if pay > 0 and (best is None or pay > best[2]):
            best = (target, count, pay)
    return best


def evaluate_ways(
    grid: list[list[str]],
    paytable: dict,
    bet_minor: int,
) -> list[dict]:
    """All-ways evaluation: consecutive reels from the left; ways = product of
    per-reel match counts; pay is per way."""
    wins: list[dict] = []
    columns = len(grid)
    targets = {s for col in grid for s in col if s not in (WILD, SCATTER)}
    for target in sorted(targets):
        ways = 1
        count = 0
        positions: list[list[int]] = []
        for c in range(columns):
            matches = [r for r, s in enumerate(grid[c]) if s == target or s == WILD]
            if not matches:
                break
            ways *= len(matches)
            count += 1
            positions.extend([[c, r] for r in matches])
        pay = _pay_for(paytable, target, count)
        if pay > 0:
            total_x100 = pay * ways
            wins.append(
                {
                    "symbolId": target,
                    "positions": positions,
                    "payX100": total_x100,
                    "winMinor": win_minor(bet_minor, total_x100),
                    "waysCount": ways,
                }
            )
    return wins


def count_scatters(grid: list[list[str]]) -> tuple[int, list[list[int]]]:
    positions = [[c, r] for c, col in enumerate(grid) for r, s in enumerate(col) if s == SCATTER]
    return len(positions), positions


def scatter_win(scatter_pays: dict, count: int, bet_minor: int) -> int:
    """Scatter pays are on total bet; 6+ scatters use the highest defined band."""
    if not scatter_pays:
        return 0
    pay = 0
    for k, v in scatter_pays.items():
        if count >= int(k) and int(v) > pay:
            pay = int(v)
    return win_minor(bet_minor, pay)


NON_PAYING = {SCATTER, "MULT", "FX1"}


def evaluate_scatter_pays(
    grid: list[list[str]],
    paytable: dict,
    bet_minor: int,
) -> list[dict]:
    """Pays-anywhere threshold evaluation (Belladonna's Parlour archetype).

    Paytable keys per symbol are integer band thresholds as strings (e.g.
    "8", "10", "12"); a count pays the highest band <= count. Positions are
    every instance of the symbol. WILD does not exist in this archetype;
    SCATTER / MULT / FX1 never participate in pays.
    """
    counts: dict[str, list[list[int]]] = {}
    for c, col in enumerate(grid):
        for r, s in enumerate(col):
            if s in NON_PAYING:
                continue
            counts.setdefault(s, []).append([c, r])
    wins: list[dict] = []
    for symbol in sorted(counts):
        positions = counts[symbol]
        n = len(positions)
        bands = paytable.get(symbol)
        if not bands:
            continue
        pay = 0
        for k, v in bands.items():
            if n >= int(k) and int(v) > pay:
                pay = int(v)
        if pay > 0:
            wins.append(
                {
                    "symbolId": symbol,
                    "positions": positions,
                    "payX100": pay,
                    "winMinor": win_minor(bet_minor, pay),
                    "countAnywhere": n,
                }
            )
    return wins


def evaluate(config, grid: list[list[str]], bet_minor: int) -> list[dict]:
    if config.evaluation == "scatter_pays":
        return evaluate_scatter_pays(grid, config.paytable, bet_minor)
    if config.evaluation == "ways":
        return evaluate_ways(grid, config.paytable, bet_minor)
    return evaluate_lines(grid, config.lines, config.paytable, bet_minor)
