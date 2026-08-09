from pathlib import Path

import pytest

from slot_math.config import load_config

FIXTURE = Path(__file__).parent / "fixtures" / "default-config"


@pytest.fixture(scope="session")
def config():
    return load_config(FIXTURE)


@pytest.fixture()
def fresh_config():
    """Function-scoped copy safe to mutate in a test."""
    return load_config(FIXTURE)


@pytest.fixture()
def fixture_dir():
    return FIXTURE
