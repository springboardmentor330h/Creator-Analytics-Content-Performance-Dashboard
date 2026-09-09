"""Test suite for live social media API analytics and database switching."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
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


def _create_user(db_session, email="creator_live@example.com"):
    user = User(
        email=email,
        password_hash=hash_password("Password123!"),
        full_name="Live Test Creator",
        role="Creator",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(user):
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_database_vs_live_summary(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # 1. Database summary (should be 0 views initially)
    db_res = client.get("/analytics/summary?source=database", headers=headers)
    assert db_res.status_code == 200
    assert db_res.json()["total_views"] == 0

    # 2. Live summary before connecting any account
    live_res = client.get("/analytics/summary?source=live", headers=headers)
    assert live_res.status_code == 200
    live_data = live_res.json()
    assert live_data["data_source"] == "live"
    assert live_data["active_platform_count"] == 0

    # 3. Connect YouTube and Instagram
    client.post("/social/connect", json={"platform": "YouTube", "account_name": "DemoYT"}, headers=headers)
    client.post("/social/connect", json={"platform": "Instagram", "account_name": "DemoIG"}, headers=headers)

    # 4. Live summary now reflects connected platforms
    live_res_connected = client.get("/analytics/summary?source=live", headers=headers)
    assert live_res_connected.status_code == 200
    live_conn_data = live_res_connected.json()
    assert live_conn_data["data_source"] == "live"
    assert live_conn_data["active_platform_count"] == 2
    assert "YouTube" in live_conn_data["connected_platforms"]
    assert "Instagram" in live_conn_data["connected_platforms"]
    assert live_conn_data["total_views"] > 0
    assert live_conn_data["average_engagement_rate"] > 0

    # Database summary remains unchanged until synced!
    db_res2 = client.get("/analytics/summary?source=database", headers=headers)
    assert db_res2.status_code == 200
    assert db_res2.json()["total_views"] == 0


def test_live_analytics_charts_and_comparison(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Connect YouTube
    client.post("/social/connect", json={"platform": "YouTube", "account_name": "DemoYT"}, headers=headers)

    # Engagement chart in live mode
    eng_res = client.get("/analytics/chart/engagement?source=live", headers=headers)
    assert eng_res.status_code == 200
    assert "labels" in eng_res.json()
    assert "values" in eng_res.json()

    # Followers chart in live mode
    fol_res = client.get("/analytics/chart/followers?source=live", headers=headers)
    assert fol_res.status_code == 200
    assert len(fol_res.json()["values"]) > 0

    # Platform comparison in live mode
    comp_res = client.get("/analytics/platform-comparison?source=live", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["YouTube"]["connected"] is True
    assert comp_data["YouTube"]["views"] > 0
    assert comp_data["Facebook"]["connected"] is False


def test_sync_live_to_database(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Connect accounts
    client.post("/social/connect", json={"platform": "YouTube", "account_name": "DemoYT"}, headers=headers)
    client.post("/social/connect", json={"platform": "LinkedIn", "account_name": "DemoLI"}, headers=headers)

    # Trigger batch 1-click sync live
    sync_res = client.post("/analytics/sync-live", headers=headers)
    assert sync_res.status_code == 200
    assert sync_res.json()["status"] == "success"
    assert sync_res.json()["records_synced"] > 0

    # Now database summary has the records!
    db_res = client.get("/analytics/summary?source=database", headers=headers)
    assert db_res.status_code == 200
    assert db_res.json()["total_views"] > 0
