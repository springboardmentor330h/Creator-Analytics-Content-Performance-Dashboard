"""Comprehensive tests for Sprint 5: YouTube API Integration, Deduplication, and Analytics Integration."""
from datetime import date
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from googleapiclient.errors import HttpError
import httplib2
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.content import Content
from app.models.growth import Growth
from app.models.user import User
from app.services.youtube_service import (
    get_youtube_api_key,
    sync_youtube_data,
    transform_youtube_data,
    validate_youtube_data,
)
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


def _create_user(db_session, *, email: str = "creator@example.com", role: str = "Creator") -> User:
    user = User(
        full_name="Test Creator",
        email=email,
        password_hash=hash_password("Password123!"),
        role=role,
        status="active",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(user: User) -> dict:
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {"Authorization": f"Bearer {token}"}


# ==========================================
# 1. YOUTUBE SERVICE UNIT TESTS
# ==========================================

def test_transform_youtube_raw_api_item():
    """Verify raw YouTube Data API v3 item format is transformed into CreatorIQ format."""
    raw_api_item = {
        "id": "yt_vid_101",
        "snippet": {
            "title": "Python FastAPI Async Masterclass",
            "publishedAt": "2026-08-10T14:30:00Z",
        },
        "statistics": {
            "viewCount": "15000",
            "likeCount": "1200",
            "commentCount": "150",
        },
    }
    transformed = transform_youtube_data(raw_api_item)
    assert transformed["platform"] == "YouTube"
    assert transformed["external_content_id"] == "yt_vid_101"
    assert transformed["content_title"] == "Python FastAPI Async Masterclass"
    assert transformed["views"] == 15000
    assert transformed["likes"] == 1200
    assert transformed["comments"] == 150
    assert transformed["shares"] == 0
    assert transformed["reach"] == 0
    assert transformed["published_date"] == "2026-08-10"


def test_transform_youtube_dict_format():
    """Verify simplified dict format transformation."""
    custom_item = {
        "platform": "YouTube",
        "external_content_id": "vid_py_01",
        "content_title": "Python Tutorial",
        "views": 15000,
        "likes": 1200,
        "comments": 150,
        "shares": 0,
        "reach": 0,
        "published_date": "2026-08-10",
    }
    transformed = transform_youtube_data(custom_item)
    assert transformed["platform"] == "YouTube"
    assert transformed["external_content_id"] == "vid_py_01"
    assert transformed["content_title"] == "Python Tutorial"
    assert transformed["views"] == 15000
    assert transformed["likes"] == 1200
    assert transformed["comments"] == 150


def test_validate_youtube_data_success():
    """Verify validation passes for valid transformed data."""
    valid_data = {
        "platform": "YouTube",
        "external_content_id": "vid_123",
        "content_title": "Clean Code in Python",
        "views": 5000,
        "likes": 400,
        "comments": 30,
        "shares": 0,
        "reach": 0,
        "published_date": "2026-08-15",
    }
    validated = validate_youtube_data(valid_data)
    assert validated == valid_data


def test_validate_youtube_data_errors():
    """Verify validation raises errors for invalid fields."""
    with pytest.raises(ValueError, match="Invalid platform"):
        validate_youtube_data({"platform": "Twitter", "external_content_id": "1", "content_title": "Test", "published_date": "2026-08-01"})

    with pytest.raises(ValueError, match="external_content_id is required"):
        validate_youtube_data({"platform": "YouTube", "external_content_id": "", "content_title": "Test", "published_date": "2026-08-01"})

    with pytest.raises(ValueError, match="Invalid published_date format"):
        validate_youtube_data({"platform": "YouTube", "external_content_id": "123", "content_title": "Test", "views": 0, "likes": 0, "comments": 0, "shares": 0, "reach": 0, "published_date": "not-a-date"})


# ==========================================
# 2. ERROR HANDLING TESTS
# ==========================================

def test_missing_api_key(monkeypatch):
    """Verify error raised when YouTube API key is missing or not configured."""
    monkeypatch.setenv("YOUTUBE_API_KEY", "")
    with pytest.raises(Exception) as exc_info:
        get_youtube_api_key()
    assert "YouTube API key is missing or not configured" in str(exc_info.value)


@patch("app.services.youtube_service.get_youtube_client")
def test_sync_youtube_invalid_api_key(mock_client, client, db_session):
    """Verify 401 response on invalid YouTube API key."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    mock_service = MagicMock()
    mock_client.return_value = mock_service

    resp = httplib2.Response({"status": 400})
    error_content = b'{"error": {"errors": [{"reason": "API_KEY_INVALID", "message": "API key not valid"}]}}'
    mock_service.videos().list().execute.side_effect = HttpError(resp, error_content)

    response = client.post("/social/youtube/sync", headers=headers)
    assert response.status_code in (400, 401)
    assert "Invalid YouTube API key" in response.json()["detail"] or "API key" in response.json()["detail"]


@patch("app.services.youtube_service.get_youtube_client")
def test_sync_youtube_quota_exceeded(mock_client, client, db_session):
    """Verify 429 response when YouTube API quota is exceeded."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    mock_service = MagicMock()
    mock_client.return_value = mock_service

    resp = httplib2.Response({"status": 403})
    error_content = b'{"error": {"errors": [{"reason": "quotaExceeded", "message": "The request cannot be completed because you have exceeded your quota."}]}}'
    mock_service.videos().list().execute.side_effect = HttpError(resp, error_content)

    response = client.post("/social/youtube/sync", headers=headers)
    assert response.status_code == 429
    assert "quota" in response.json()["detail"].lower()


# ==========================================
# 3. SYNCHRONIZATION & DEDUPLICATION TESTS
# ==========================================

@patch("app.services.youtube_service.fetch_youtube_data")
def test_youtube_sync_endpoint_and_deduplication(mock_fetch, client, db_session):
    """Verify POST /social/youtube/sync stores data in PostgreSQL and avoids duplicates on repeat sync."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    mock_items = [
        {
            "id": "vid_yt_01",
            "snippet": {
                "title": "Python Asyncio & FastAPI Masterclass",
                "publishedAt": "2026-08-10T00:00:00Z",
            },
            "statistics": {
                "viewCount": "25000",
                "likeCount": "1800",
                "commentCount": "220",
            },
        },
        {
            "id": "vid_yt_02",
            "snippet": {
                "title": "Building Production Dashboards with React",
                "publishedAt": "2026-08-14T00:00:00Z",
            },
            "statistics": {
                "viewCount": "18000",
                "likeCount": "1400",
                "commentCount": "180",
            },
        },
    ]
    mock_fetch.return_value = mock_items

    # 1. First sync call
    res1 = client.post("/social/youtube/sync", headers=headers)
    assert res1.status_code == 200
    body1 = res1.json()
    assert body1["platform"] == "YouTube"
    assert body1["status"] == "success"
    assert body1["records_synced"] == 2

    # Verify rows in DB
    records = db_session.scalars(select(Content).where(Content.creator_id == user.id)).all()
    assert len(records) == 2
    r1 = next(r for r in records if r.external_content_id == "vid_yt_01")
    assert r1.platform == "YouTube"
    assert r1.title == "Python Asyncio & FastAPI Masterclass"
    assert r1.views == 25000
    assert r1.likes == 1800
    assert r1.comments == 220
    assert r1.published_at == date(2026, 8, 10)

    # 2. Second sync call with updated views/likes
    updated_items = [
        {
            "id": "vid_yt_01",
            "snippet": {
                "title": "Python Asyncio & FastAPI Masterclass - Updated",
                "publishedAt": "2026-08-10T00:00:00Z",
            },
            "statistics": {
                "viewCount": "30000",
                "likeCount": "2200",
                "commentCount": "300",
            },
        },
        {
            "id": "vid_yt_02",
            "snippet": {
                "title": "Building Production Dashboards with React",
                "publishedAt": "2026-08-14T00:00:00Z",
            },
            "statistics": {
                "viewCount": "18000",
                "likeCount": "1400",
                "commentCount": "180",
            },
        },
    ]
    mock_fetch.return_value = updated_items

    res2 = client.post("/social/youtube/sync", headers=headers)
    assert res2.status_code == 200
    body2 = res2.json()
    assert body2["records_synced"] == 2

    # Verify duplicate records were NOT created (count remains 2) and record was updated
    records_after = db_session.scalars(select(Content).where(Content.creator_id == user.id)).all()
    assert len(records_after) == 2
    r1_updated = next(r for r in records_after if r.external_content_id == "vid_yt_01")
    assert r1_updated.views == 30000
    assert r1_updated.likes == 2200
    assert r1_updated.comments == 300
    assert r1_updated.title == "Python Asyncio & FastAPI Masterclass - Updated"


# ==========================================
# 4. END-TO-END ANALYTICS APIS VERIFICATION
# ==========================================

@patch("app.services.youtube_service.fetch_youtube_data")
def test_analytics_apis_reflect_youtube_data(mock_fetch, client, db_session):
    """Verify existing analytics endpoints incorporate synced YouTube data."""
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Seed growth followers for the user
    growth = Growth(creator_id=user.id, date=date(2026, 8, 15), followers=12500, engagement_rate=4.5)
    db_session.add(growth)
    db_session.commit()

    # Sync YouTube content
    mock_fetch.return_value = [
        {
            "id": "yt_video_001",
            "snippet": {"title": "Full Stack Architecture", "publishedAt": "2026-08-12T00:00:00Z"},
            "statistics": {"viewCount": "40000", "likeCount": "3000", "commentCount": "500"},
        },
        {
            "id": "yt_video_002",
            "snippet": {"title": "PostgreSQL Optimization", "publishedAt": "2026-08-16T00:00:00Z"},
            "statistics": {"viewCount": "20000", "likeCount": "1500", "commentCount": "200"},
        },
    ]

    sync_res = client.post("/social/youtube/sync", headers=headers)
    assert sync_res.status_code == 200

    # 1. GET /analytics/summary
    summary_res = client.get("/analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["total_views"] == 60000
    assert summary_data["total_likes"] == 4500
    assert summary_data["total_comments"] == 700
    assert summary_data["total_followers"] == 12500

    # 2. GET /analytics/top-content
    top_res = client.get("/analytics/top-content", headers=headers)
    assert top_res.status_code == 200
    top_data = top_res.json()
    assert len(top_data) == 2
    assert any(c["platform"] == "YouTube" for c in top_data)

    # 3. GET /analytics/platform-comparison
    plat_res = client.get("/analytics/platform-comparison", headers=headers)
    assert plat_res.status_code == 200
    plat_data = plat_res.json()
    assert "YouTube" in plat_data
    assert plat_data["YouTube"]["views"] == 60000
    assert plat_data["YouTube"]["likes"] == 4500
    assert plat_data["YouTube"]["comments"] == 700

    # 4. GET /analytics/chart/engagement
    chart_eng_res = client.get("/analytics/chart/engagement", headers=headers)
    assert chart_eng_res.status_code == 200
    chart_eng_data = chart_eng_res.json()
    assert "labels" in chart_eng_data
    assert "values" in chart_eng_data
    assert "2026-08-12" in chart_eng_data["labels"]
    assert "2026-08-16" in chart_eng_data["labels"]

    # 5. GET /analytics/chart/followers
    chart_foll_res = client.get("/analytics/chart/followers", headers=headers)
    assert chart_foll_res.status_code == 200
    chart_foll_data = chart_foll_res.json()
    assert chart_foll_data["labels"] == ["2026-08-15"]
    assert chart_foll_data["values"] == [12500]
