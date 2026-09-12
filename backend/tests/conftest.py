"""
Shared test setup.

WHY a conftest.py instead of each test file setting up its own engine?
`app.dependency_overrides` is a single dict living on the shared `app`
object. If two test files each call `app.dependency_overrides[get_db] = ...`
at import time, whichever import happens last silently wins for BOTH
files — causing one file's tests to hit the other file's (torn-down)
database. Centralizing it here means there's exactly one override,
applied once, and every test file shares the same test database setup.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import Base, get_db

# StaticPool + in-memory SQLite keeps ALL test data in RAM, in a single
# shared connection — no leftover .db files, no cross-run pollution,
# and it's faster than writing to disk.
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Runs before/after EVERY test in EVERY file: fresh tables each time."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    """
    Direct DB session for tests that call a service function directly
    (bypassing the HTTP layer) — needed for async service functions like
    sync_youtube_channel, which TestClient can't invoke directly since
    it only speaks HTTP.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
