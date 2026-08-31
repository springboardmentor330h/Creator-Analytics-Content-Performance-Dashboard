"""Tests for Instagram Graph API integration, normalization, and analytics platform filtering."""
import os
import pytest
from datetime import date
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.content import Content
from app.models.user import User
from app.services.instagram_service import (
    get_instagram_credentials,
    transform_instagram_data,
    validate_instagram_data,
    sync_instagram_data,
)
from app.services.analytics_service import (
    get_dashboard_summary,
    get_top_content,
    get_platform_comparison,
)
from main import app

# In-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_user(db_session):
    user = User(
        email="creator_test@example.com",
        password_hash=hash_password("Password123!"),
        full_name="Instagram Creator",
        role="Creator",
        status="active",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
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


# 1. Test Credentials Verification
def test_missing_credentials_raises_error(monkeypatch):
    monkeypatch.delenv("INSTAGRAM_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("INSTAGRAM_ACCOUNT_ID", raising=False)
    with pytest.raises(HTTPException) as exc_info:
        get_instagram_credentials()
    assert exc_info.value.status_code == 400
    assert "not configured" in exc_info.value.detail or "missing" in exc_info.value.detail


# 2. Test Data Transformation to Common Platform Format
def test_transform_instagram_data_valid():
    raw_api_item = {
        "id": "17895612345678",
        "caption": "Building high-performance APIs with FastAPI!\n#python #coding",
        "media_type": "VIDEO",
        "timestamp": "2026-08-15T14:30:00+0000",
        "like_count": 1250,
        "comments_count": 84,
        "insights": {
            "data": [
                {"name": "impressions", "values": [{"value": 18500}]},
                {"name": "reach", "values": [{"value": 15200}]},
            ]
        },
    }

    transformed = transform_instagram_data(raw_api_item)
    assert transformed["platform"] == "Instagram"
    assert transformed["external_content_id"] == "17895612345678"
    assert transformed["content_title"] == "Building high-performance APIs with FastAPI!"
    assert transformed["content_type"] == "Reel"
    assert transformed["likes"] == 1250
    assert transformed["comments"] == 84
    assert transformed["reach"] == 15200
    assert transformed["published_date"] == "2026-08-15"


# 3. Test Data Validation
def test_validate_instagram_data_success():
    valid_data = {
        "platform": "Instagram",
        "external_content_id": "ig_12345",
        "content_title": "Clean Code Architecture",
        "content_type": "Post",
        "views": 5000,
        "likes": 300,
        "comments": 40,
        "shares": 0,
        "reach": 6000,
        "published_date": "2026-08-20",
    }
    validated = validate_instagram_data(valid_data)
    assert validated == valid_data


def test_validate_instagram_data_invalid_platform():
    invalid_data = {
        "platform": "TikTok",
        "external_content_id": "ig_12345",
        "content_title": "Clean Code Architecture",
        "views": 5000,
        "likes": 300,
        "comments": 40,
        "shares": 0,
        "reach": 6000,
        "published_date": "2026-08-20",
    }
    with pytest.raises(ValueError) as exc:
        validate_instagram_data(invalid_data)
    assert "expected 'Instagram'" in str(exc.value)


def test_validate_instagram_data_negative_metric():
    invalid_data = {
        "platform": "Instagram",
        "external_content_id": "ig_12345",
        "content_title": "Clean Code Architecture",
        "views": -5,
        "likes": 300,
        "comments": 40,
        "shares": 0,
        "reach": 6000,
        "published_date": "2026-08-20",
    }
    with pytest.raises(ValueError) as exc:
        validate_instagram_data(invalid_data)
    assert "non-negative" in str(exc.value)


# 4. Test Idempotent Sync & Duplicate Detection
def test_sync_instagram_data_upsert(db_session, test_user):
    mock_items = [
        {
            "id": "ig_item_001",
            "caption": "First Reel on Microservices",
            "media_type": "VIDEO",
            "timestamp": "2026-08-10T10:00:00+0000",
            "like_count": 500,
            "comments_count": 50,
            "insights": {"data": [{"name": "reach", "values": [{"value": 2000}]}]},
        }
    ]

    # First sync: creates record
    res1 = sync_instagram_data(db_session, test_user, custom_items=mock_items)
    assert res1["status"] == "success"
    assert res1["records_synced"] == 1

    content_item = db_session.query(Content).filter(
        Content.creator_id == test_user.id,
        Content.platform == "Instagram",
    ).first()
    assert content_item is not None
    assert content_item.title == "First Reel on Microservices"
    assert content_item.likes == 500

    # Second sync: updates record without creating duplicate
    mock_items[0]["like_count"] = 750
    res2 = sync_instagram_data(db_session, test_user, custom_items=mock_items)
    assert res2["records_synced"] == 1

    total_count = db_session.query(Content).filter(
        Content.creator_id == test_user.id,
        Content.platform == "Instagram",
    ).count()
    assert total_count == 1  # No duplicate created

    db_session.refresh(content_item)
    assert content_item.likes == 750


# 5. Test Router Endpoint: POST /social/instagram/sync
def test_sync_instagram_endpoint(client, test_user):
    token = create_access_token(str(test_user.id), test_user.email, test_user.role)
    headers = {"Authorization": f"Bearer {token}"}

    # Will attempt sync or handle credentials properly
    response = client.post(
        "/social/instagram/sync",
        json={"max_results": 5},
        headers=headers,
    )
    # If token is missing, expect 400 (which confirms route is reached and validation is active)
    assert response.status_code in {200, 400}


# 6. Test Analytics Platform Filter
def test_analytics_platform_filter(db_session, test_user):
    # Add a YouTube item and an Instagram item
    yt_item = Content(
        creator_id=test_user.id,
        platform="YouTube",
        content_id="yt_1",
        external_content_id="yt_1",
        title="YouTube Masterclass",
        content_type="Video",
        published_at=date(2026, 8, 1),
        views=10000,
        likes=1000,
        comments=100,
        shares=50,
        reach=12000,
        engagement_rate=9.58,
    )
    ig_item = Content(
        creator_id=test_user.id,
        platform="Instagram",
        content_id="ig_1",
        external_content_id="ig_1",
        title="Instagram Reel",
        content_type="Reel",
        published_at=date(2026, 8, 2),
        views=5000,
        likes=400,
        comments=40,
        shares=0,
        reach=6000,
        engagement_rate=7.33,
    )
    db_session.add_all([yt_item, ig_item])
    db_session.commit()

    # All platforms summary
    summary_all = get_dashboard_summary(db_session, test_user)
    assert summary_all["total_views"] == 15000

    # YouTube only summary
    summary_yt = get_dashboard_summary(db_session, test_user, platform="YouTube")
    assert summary_yt["total_views"] == 10000

    # Instagram only summary
    summary_ig = get_dashboard_summary(db_session, test_user, platform="Instagram")
    assert summary_ig["total_views"] == 5000

    # Top content filtered
    top_ig = get_top_content(db_session, test_user, platform="Instagram")
    assert len(top_ig) == 1
    assert top_ig[0]["platform"] == "Instagram"

    # Platform comparison
    comparison = get_platform_comparison(db_session, test_user)
    assert "YouTube" in comparison
    assert "Instagram" in comparison
    assert comparison["Instagram"]["views"] == 5000
