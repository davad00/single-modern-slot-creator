"""Seeded RNG (numpy PCG64) with worker spawning. Dev/simulation use ONLY —
production outcomes come from the Remote Game Server."""

from __future__ import annotations

import numpy as np


def make_rng(seed: int) -> np.random.Generator:
    return np.random.Generator(np.random.PCG64(np.random.SeedSequence(seed)))


def spawn_worker_seeds(seed: int, workers: int) -> list[int]:
    """Deterministic, independent child seeds for parallel workers."""
    ss = np.random.SeedSequence(seed)
    return [int(child.generate_state(1)[0]) for child in ss.spawn(workers)]
