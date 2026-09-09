"""Tests for Connected Apps and Live/Manual Analytics Synchronization upgrades."""
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.content import Content
from app.models.social_connection import SocialConnection
from app.models.user import User
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _create_user(db_session, email="creator_sync@example.com", name="Sync Creator"):
    user = User(
        email=email,
        password_hash=hash_password("Password123!"),
        full_name=name,
        role="Creator",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(user):
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_get_social_connections_endpoint(client, db_session):
    """Verify GET /social/connections returns connected platforms with metadata."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Initially no connected platforms
    res0 = client.get("/social/connections", headers=headers)
    assert res0.status_code == 200
    assert res0.json() == []

    # Connect YouTube and TikTok
    c1 = client.post("/social/connect", json={"platform": "YouTube", "account_name": "SureshTech"}, headers=headers)
    assert c1.status_code == 200
    c2 = client.post("/social/connect", json={"platform": "TikTok", "account_name": "SureshTikTok"}, headers=headers)
    assert c2.status_code == 200

    res = client.get("/social/connections", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2

    platforms = {item["platform"]: item for item in data}
    assert "YouTube" in platforms
    assert "TikTok" in platforms

    assert platforms["YouTube"]["status"] == "connected"
    assert platforms["YouTube"]["account_name"] == "SureshTech"
    assert platforms["YouTube"]["connection_mode"] == "live"

    assert platforms["TikTok"]["status"] == "connected"
    assert platforms["TikTok"]["account_name"] == "SureshTikTok"
    assert platforms["TikTok"]["connection_mode"] == "manual"


def test_dedicated_sync_endpoints(client, db_session):
    """Verify POST /social/{platform}/sync endpoints for all supported platforms."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Connect platforms
    for p in ["TikTok", "Facebook", "LinkedIn", "X"]:
        res = client.post("/social/connect", json={"platform": p, "account_name": f"{p}_User"}, headers=headers)
        assert res.status_code == 200

    # Call dedicated sync endpoints
    tt_res = client.post("/social/tiktok/sync", headers=headers)
    assert tt_res.status_code == 200
    assert tt_res.json()["platform"] == "TikTok"
    assert tt_res.json()["records_synced"] > 0
    assert tt_res.json()["status"] == "success"

    fb_res = client.post("/social/facebook/sync", headers=headers)
    assert fb_res.status_code == 200
    assert fb_res.json()["platform"] == "Facebook"
    assert fb_res.json()["records_synced"] > 0

    li_res = client.post("/social/linkedin/sync", headers=headers)
    assert li_res.status_code == 200
    assert li_res.json()["platform"] == "LinkedIn"
    assert li_res.json()["records_synced"] > 0

    x_res = client.post("/social/x/sync", headers=headers)
    assert x_res.status_code == 200
    assert x_res.json()["platform"] == "X"
    assert x_res.json()["records_synced"] > 0


def test_duplicate_handling_idempotent_sync(client, db_session):
    """Verify repeated synchronization updates metrics without creating duplicate rows."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Connect Instagram
    client.post("/social/connect", json={"platform": "Instagram", "account_name": "CreatorIG"}, headers=headers)

    # First sync
    res1 = client.post("/social/sync", json={"platform": "Instagram"}, headers=headers)
    assert res1.status_code == 200
    first_count = res1.json()["records_synced"]
    assert first_count == 3

    # Check Content table count
    rows1 = db_session.scalars(select(Content).where(Content.creator_id == user.id, Content.platform == "Instagram")).all()
    assert len(rows1) == 3

    # Second sync of the same platform
    res2 = client.post("/social/sync", json={"platform": "Instagram"}, headers=headers)
    assert res2.status_code == 200
    assert res2.json()["records_synced"] == 3

    # Check Content table count again: MUST STILL BE 3, NOT 6!
    rows2 = db_session.scalars(select(Content).where(Content.creator_id == user.id, Content.platform == "Instagram")).all()
    assert len(rows2) == 3


def test_creator_data_isolation(client, db_session):
    """Ensure data is strictly scoped and isolated between different creators."""
    creator1 = _create_user(db_session, email="creator1@example.com", name="Creator One")
    creator2 = _create_user(db_session, email="creator2@example.com", name="Creator Two")

    h1 = _auth_headers(creator1)
    h2 = _auth_headers(creator2)

    # Creator 1 connects and syncs TikTok
    client.post("/social/connect", json={"platform": "TikTok", "account_name": "Creator1TikTok"}, headers=h1)
    client.post("/social/tiktok/sync", headers=h1)

    # Creator 2 connects LinkedIn but NOT TikTok
    client.post("/social/connect", json={"platform": "LinkedIn", "account_name": "Creator2LinkedIn"}, headers=h2)
    client.post("/social/linkedin/sync", headers=h2)

    # Creator 1 connections should only have TikTok
    c1_conns = client.get("/social/connections", headers=h1).json()
    assert len(c1_conns) == 1
    assert c1_conns[0]["platform"] == "TikTok"
    assert c1_conns[0]["account_name"] == "Creator1TikTok"

    # Creator 2 connections should only have LinkedIn
    c2_conns = client.get("/social/connections", headers=h2).json()
    assert len(c2_conns) == 1
    assert c2_conns[0]["platform"] == "LinkedIn"
    assert c2_conns[0]["account_name"] == "Creator2LinkedIn"

    # Creator 1 analytics summary
    c1_summary = client.get("/analytics/summary", headers=h1).json()
    # Creator 2 analytics summary
    c2_summary = client.get("/analytics/summary", headers=h2).json()

    # Creator 2 must not see Creator 1's views or content
    c2_content = client.get("/api/content", headers=h2).json()
    for item in c2_content["items"]:
        assert item["platform"] == "LinkedIn"
        assert item["platform"] != "TikTok"


def test_dashboard_analytics_platform_filter_after_sync(client, db_session):
    """Verify dashboard summary and platform comparison automatically include synchronized data."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    client.post("/social/connect", json={"platform": "TikTok", "account_name": "MyTikTok"}, headers=headers)
    client.post("/social/tiktok/sync", headers=headers)

    client.post("/social/connect", json={"platform": "Facebook", "account_name": "MyFB"}, headers=headers)
    client.post("/social/facebook/sync", headers=headers)

    # Aggregated summary
    summary_all = client.get("/analytics/summary", headers=headers).json()
    assert summary_all["total_views"] > 0
    assert summary_all["total_likes"] > 0

    # Filter by TikTok
    summary_tt = client.get("/analytics/summary?platform=TikTok", headers=headers).json()
    assert summary_tt["total_views"] > 0

    # Platform comparison
    comparison = client.get("/analytics/platform-comparison", headers=headers).json()
    assert "TikTok" in comparison
    assert "Facebook" in comparison
    assert comparison["TikTok"]["views"] > 0
    assert comparison["Facebook"]["views"] > 0
