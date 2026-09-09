"""Automated test suite for YouTube OAuth flow, token encryption/refresh, session preservation, and live analytics."""
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.social_connection import SocialConnection
from app.models.user import User
from app.services.social_connection_service import (
    SocialConnectionService,
    generate_oauth_state,
    parse_and_validate_oauth_state,
)
from app.utils.crypto import decrypt_token, encrypt_token
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


def _create_user(db_session, *, email: str = "creator@example.com", full_name: str = "Test Creator") -> User:
    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password("Password123!"),
        role="Creator",
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_header(user: User) -> dict:
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_oauth_signed_state_generation_and_validation(db_session):
    """Verify cryptographically signed state token encodes user_id, platform, and prevents tampering."""
    user = _create_user(db_session)
    state = generate_oauth_state(user.id, "youtube")

    settings = get_settings()
    payload = jwt.decode(state, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    assert payload["user_id"] == user.id
    assert payload["platform"] == "youtube"

    # Validation succeeds
    extracted_uid = parse_and_validate_oauth_state(state, "youtube")
    assert extracted_uid == user.id

    # Tampered or wrong platform state fails with 400
    with pytest.raises(Exception):
        parse_and_validate_oauth_state(state, "instagram")


def test_youtube_oauth_connect_endpoint(client, db_session):
    """Verify GET /api/social/youtube/connect returns valid authorization URL with minimal required scopes."""
    user = _create_user(db_session)
    headers = _auth_header(user)

    res = client.get("/api/social/youtube/connect", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["configured"] is True
    assert "authorization_url" in data
    auth_url = data["authorization_url"]
    assert "accounts.google.com" in auth_url
    assert "youtube.readonly" in auth_url
    assert "access_type=offline" in auth_url
    assert "state=" in auth_url


def test_youtube_oauth_callback_preserves_user_and_redirects_to_social_connections(client, db_session):
    """Verify OAuth callback saves encrypted tokens against initiating user and redirects to /social-connections."""
    user = _create_user(db_session)
    state = generate_oauth_state(user.id, "youtube")

    mock_token_data = {
        "access_token": "ya29.test_access_token_12345",
        "refresh_token": "1//test_refresh_token_67890",
        "expires_in": 3600,
        "scopes": "https://www.googleapis.com/auth/youtube.readonly",
        "platform_user_id": "UC_TEST_CHANNEL_ID",
        "platform_username": "@testcreator",
        "display_name": "Test Creator Channel",
        "profile_url": "https://youtube.com/channel/UC_TEST_CHANNEL_ID",
    }

    with patch("app.integrations.youtube.YouTubeIntegration.exchange_code", new_callable=AsyncMock) as mock_exchange, \
         patch("app.integrations.youtube.YouTubeIntegration.sync_data", new_callable=AsyncMock) as mock_sync:
        mock_exchange.return_value = mock_token_data
        mock_sync.return_value = 5

        # Perform callback request
        res = client.get(
            f"/api/social/youtube/callback?code=mock_auth_code_123&state={state}",
            follow_redirects=False,
        )

        assert res.status_code == 307
        assert "social-connections?connected=youtube" in res.headers["location"]
        # CRITICAL: Must NEVER redirect to landing page
        assert res.headers["location"] != "/"
        assert "landing" not in res.headers["location"]

        # Verify DB connection record
        conn = db_session.query(SocialConnection).filter(
            SocialConnection.user_id == user.id,
            SocialConnection.platform == "youtube",
        ).first()

        assert conn is not None
        assert conn.status == "connected"
        assert conn.platform_username == "@testcreator"
        assert conn.display_name == "Test Creator Channel"
        assert conn.platform_user_id == "UC_TEST_CHANNEL_ID"
        # Verify tokens are encrypted
        assert conn.access_token_encrypted != "ya29.test_access_token_12345"
        assert decrypt_token(conn.access_token_encrypted) == "ya29.test_access_token_12345"
        assert decrypt_token(conn.refresh_token_encrypted) == "1//test_refresh_token_67890"


def test_youtube_oauth_callback_error_handling(client, db_session):
    """Verify callback handles errors by redirecting to /social-connections?error=..., NEVER landing page."""
    res = client.get(
        "/api/social/youtube/callback?error=access_denied&error_description=User+declined+permission",
        follow_redirects=False,
    )
    assert res.status_code == 307
    loc = res.headers["location"]
    assert "social-connections?error=" in loc
    assert loc != "/"


@pytest.mark.anyio
async def test_automatic_token_refresh(db_session):
    """Verify expired access token is refreshed automatically using stored encrypted refresh token."""
    user = _create_user(db_session)

    # Insert an expired token
    conn = SocialConnection(
        user_id=user.id,
        platform="youtube",
        status="connected",
        access_token_encrypted=encrypt_token("old_expired_access_token"),
        refresh_token_encrypted=encrypt_token("valid_refresh_token"),
        token_expires_at=datetime.utcnow() - timedelta(minutes=10),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(conn)
    db_session.commit()

    with patch("app.integrations.youtube.YouTubeIntegration.refresh_token", new_callable=AsyncMock) as mock_refresh:
        mock_refresh.return_value = {
            "access_token": "new_fresh_access_token_999",
            "expires_in": 3600,
        }

        token = await SocialConnectionService.get_valid_access_token(db_session, user.id, "youtube")
        assert token == "new_fresh_access_token_999"

        db_session.refresh(conn)
        assert decrypt_token(conn.access_token_encrypted) == "new_fresh_access_token_999"
        assert conn.token_expires_at > datetime.utcnow()


def test_youtube_live_analytics_connected_and_isolated(client, db_session):
    """Verify GET /api/social/youtube/live-analytics returns real-time data and enforces user isolation."""
    user1 = _create_user(db_session, email="creator1@example.com", full_name="Creator One")
    user2 = _create_user(db_session, email="creator2@example.com", full_name="Creator Two")

    # Connect YouTube only for User 1
    conn1 = SocialConnection(
        user_id=user1.id,
        platform="youtube",
        status="connected",
        platform_user_id="UC_CHAN_1",
        display_name="Creator One Channel",
        platform_username="@creatorone",
        access_token_encrypted=encrypt_token("token_user_1"),
        refresh_token_encrypted=encrypt_token("refresh_user_1"),
        token_expires_at=datetime.utcnow() + timedelta(hours=1),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(conn1)
    db_session.commit()

    mock_live_response = {
        "status": "connected",
        "platform": "YouTube",
        "channel": {
            "channel_id": "UC_CHAN_1",
            "title": "Creator One Channel",
            "custom_url": "@creatorone",
            "thumbnail_url": "https://yt3.ggpht.com/avatar.jpg",
            "subscribers": 52000,
            "total_views": 1840000,
            "video_count": 84,
        },
        "metrics": {
            "total_views": 1840000,
            "subscribers": 52000,
            "video_count": 84,
            "recent_views": 65000,
            "recent_likes": 4200,
            "recent_comments": 530,
            "average_engagement_rate": 7.28,
        },
        "recent_videos": [
            {
                "video_id": "vid123",
                "title": "FastAPI & React Guide",
                "views": 25000,
                "likes": 1800,
                "comments": 210,
                "engagement_rate": 8.04,
            }
        ],
        "fetched_at": datetime.utcnow().isoformat(),
        "is_live": True,
    }

    with patch("app.services.youtube_live_service.get_youtube_live_analytics", new_callable=AsyncMock) as mock_live:
        mock_live.return_value = mock_live_response

        # 1. User 1 accesses their own live analytics -> Success
        res1 = client.get("/api/social/youtube/live-analytics", headers=_auth_header(user1))
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["platform"] == "YouTube"
        assert data1["channel"]["title"] == "Creator One Channel"
        assert data1["metrics"]["subscribers"] == 52000
        assert data1["is_live"] is True

    # 2. User 2 (not connected) accesses live analytics -> 404 Not Connected
    res2 = client.get("/api/social/youtube/live-analytics", headers=_auth_header(user2))
    assert res2.status_code == 404
    assert "not connected" in res2.json()["detail"].lower()
