"""Cascade (tumble) mechanics: remove winning positions, drop survivors,
refill from the strip above the stop, with a hard cascade cap.

The engine only invokes this when math-model.cascades.enabled is true; the
functions are pure so they can be unit-tested in isolation.
"""

from __future__ import annotations

import numpy as np


def remove_positions(grid: list[list[str]], positions: list[list[int]]) -> list[list[str | None]]:
    out: list[list[str | None]] = [list(col) for col in grid]
    for c, r in positions:
        out[c][r] = None
    return out


def refill(
    grid_with_holes: list[list[str | None]],
    strips: list[list[str]],
    stops: list[int],
    fill_offsets: list[int],
    rows: int,
) -> tuple[list[list[str]], list[int]]:
    """Gravity refill, columns-major with row 0 at the top.

    Surviving symbols fall down; new symbols enter from above, taken from the
    strip positions immediately above the current stop (wrapping), advancing
    a per-reel fill offset so consecutive cascades pull fresh strip sections.
    Returns (new_grid, updated_fill_offsets).
    """
    new_grid: list[list[str]] = []
    new_offsets = list(fill_offsets)
    for c, col in enumerate(grid_with_holes):
        survivors = [s for s in col if s is not None]
        need = rows - len(survivors)
        strip = strips[c]
        n = len(strip)
        incoming: list[str] = []
        for k in range(need):
            new_offsets[c] += 1
            incoming.append(strip[(stops[c] - new_offsets[c]) % n])
        # incoming symbols stack on top (closest to the stop lands lowest)
        new_grid.append(list(reversed(incoming)) + survivors)
    return new_grid, new_offsets


def cascade_multiplier(progression: list[int], cascade_index: int) -> int:
    """mult100 for the given cascade step (index 0 = first cascade); the last
    entry repeats for deeper cascades."""
    if not progression:
        return 100
    return int(progression[min(cascade_index, len(progression) - 1)])


def winning_positions(wins: list[dict]) -> list[list[int]]:
    seen: set[tuple[int, int]] = set()
    for w in wins:
        for c, r in w["positions"]:
            seen.add((c, r))
    return [[c, r] for c, r in sorted(seen)]
