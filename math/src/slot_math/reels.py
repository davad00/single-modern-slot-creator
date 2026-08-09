"""Reel spinning: uniform independent stops on physical-style strips, plus
weighted-table sampling for virtual-reel designs."""

from __future__ import annotations

import numpy as np


def spin_stops(rng: np.random.Generator, strips: list[list[str]]) -> list[int]:
    """One uniform stop index per reel (independent)."""
    return [int(rng.integers(0, len(strip))) for strip in strips]


def window_from_stops(strips: list[list[str]], stops: list[int], rows: int) -> list[list[str]]:
    """Columns-major visible window; reel wraps around its strip."""
    grid: list[list[str]] = []
    for strip, stop in zip(strips, stops):
        n = len(strip)
        grid.append([strip[(stop + r) % n] for r in range(rows)])
    return grid


def spin_window(rng: np.random.Generator, strips: list[list[str]], rows: int) -> list[list[str]]:
    return window_from_stops(strips, spin_stops(rng, strips), rows)


def sample_weighted(rng: np.random.Generator, table: dict[str, int]) -> str:
    """Sample one symbol from a {symbolId: weight} table (virtual reel)."""
    symbols = list(table.keys())
    weights = np.array([table[s] for s in symbols], dtype=np.float64)
    total = weights.sum()
    if total <= 0:
        raise ValueError("weighted table must have positive total weight")
    return symbols[int(rng.choice(len(symbols), p=weights / total))]


def symbol_probabilities(strip: list[str]) -> dict[str, float]:
    """Per-reel symbol probability under uniform stops (statistics only)."""
    n = len(strip)
    out: dict[str, float] = {}
    for s in strip:
        out[s] = out.get(s, 0.0) + 1.0 / n
    return out
