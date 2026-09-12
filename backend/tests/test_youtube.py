"""
YouTube integration tests.

These tests mock httpx responses instead of calling the real YouTube
API — standard practice for third-party integrations: no API key
needed to run the suite, no quota consumed, no flakiness from network
issues or YouTube being temporarily down, and tests run in milliseconds
instead of seconds.

What IS genuinely tested here: our request construction, response
parsing, error handling, and the sync/upsert logic — i.e. everything
our code is actually responsible for getting right. What's NOT tested:
whether YouTube's real API still matches the shape we're mocking. That
can only be verified by running an actual sync with a real key (see
docs/sprint-5.md for how to do that).
"""
from unittest.mock import AsyncMock, patch
import pytest

from app.services.youtube_service import YouTubeService, YouTubeAPIError
from app.services import sync_service


FAKE_CHANNEL_RESPONSE = {
    "items": [{
        "id": "UCFakeChannelId",
        "snippet": {"title": "Test Channel"},
        "statistics": {"subscriberCount": "12000", "viewCount": "500000", "videoCount": "42"},
        "contentDetails": {"relatedPlaylists": {"uploads": "UUFakeChannelId"}},
    }]
}

FAKE_PLAYLIST_RESPONSE = {
    "items": [
        {"contentDetails": {"videoId": "vid1"}},
        {"contentDetails": {"videoId": "vid2"}},
    ]
}

FAKE_VIDEOS_RESPONSE = {
    "items": [
        {
            "id": "vid1",
            "snippet": {"title": "First Video", "publishedAt": "2026-01-01T00:00:00Z"},
            "statistics": {"viewCount": "1000", "likeCount": "100", "commentCount": "10"},
        },
        {
            "id": "vid2",
            "snippet": {"title": "Second Video", "publishedAt": "2026-02-01T00:00:00Z"},
            "statistics": {"viewCount": "2000", "likeCount": "200", "commentCount": "20"},
        },
    ]
}


def _mock_response(json_data, status_code=200):
    mock = AsyncMock()
    mock.status_code = status_code
    mock.json = lambda: json_data
    mock.text = str(json_data)
    return mock


def get_auth_headers(client, email="yt_creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "YT Creator", "email": email, "password": "test1234"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "test1234"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


# ---------- Service-level tests (no HTTP endpoint involved) ----------

@pytest.mark.asyncio
async def test_get_channel_info_parses_response_correctly():
    service = YouTubeService(api_key="fake-key")
    with patch("httpx.AsyncClient.get", new=AsyncMock(return_value=_mock_response(FAKE_CHANNEL_RESPONSE))):
        info = await service.get_channel_info("UCFakeChannelId")

    assert info["title"] == "Test Channel"
    assert info["subscriber_count"] == 12000
    assert info["uploads_playlist_id"] == "UUFakeChannelId"


@pytest.mark.asyncio
async def test_channel_not_found_raises_error():
    service = YouTubeService(api_key="fake-key")
    with patch("httpx.AsyncClient.get", new=AsyncMock(return_value=_mock_response({"items": []}))):
        with pytest.raises(YouTubeAPIError, match="No channel found"):
            await service.get_channel_info("nonexistent")


@pytest.mark.asyncio
async def test_missing_api_key_raises_before_any_http_call():
    service = YouTubeService(api_key="")
    with pytest.raises(YouTubeAPIError, match="not configured"):
        await service.get_channel_info("UCFakeChannelId")


@pytest.mark.asyncio
async def test_api_error_status_raises_with_detail():
    service = YouTubeService(api_key="fake-key")
    with patch("httpx.AsyncClient.get", new=AsyncMock(return_value=_mock_response({"error": "quota exceeded"}, status_code=403))):
        with pytest.raises(YouTubeAPIError, match="403"):
            await service.get_channel_info("UCFakeChannelId")


@pytest.mark.asyncio
async def test_video_stats_batch_size_limit_enforced():
    service = YouTubeService(api_key="fake-key")
    with pytest.raises(ValueError, match="at most 50"):
        await service.get_video_stats([f"vid{i}" for i in range(51)])


# ---------- Sync service tests (writes to DB) ----------

@pytest.mark.asyncio
async def test_full_sync_creates_content_and_growth_record(client, db_session):
    headers = get_auth_headers(client)
    me = client.get("/api/users/me", headers=headers).json()

    responses = [
        _mock_response(FAKE_CHANNEL_RESPONSE),
        _mock_response(FAKE_PLAYLIST_RESPONSE),
        _mock_response(FAKE_VIDEOS_RESPONSE),
    ]
    with patch("httpx.AsyncClient.get", new=AsyncMock(side_effect=responses)):
        result = await sync_service.sync_youtube_channel(
            db_session, me["id"], "UCFakeChannelId", api_key="fake-key"
        )

    assert result["success"] is True
    assert result["videos_synced"] == 2
    assert result["videos_updated"] == 0
    assert result["channel"]["subscriber_count"] == 12000


@pytest.mark.asyncio
async def test_resync_same_channel_updates_instead_of_duplicating(client, db_session):
    headers = get_auth_headers(client)
    me = client.get("/api/users/me", headers=headers).json()

    responses_first = [
        _mock_response(FAKE_CHANNEL_RESPONSE),
        _mock_response(FAKE_PLAYLIST_RESPONSE),
        _mock_response(FAKE_VIDEOS_RESPONSE),
    ]
    with patch("httpx.AsyncClient.get", new=AsyncMock(side_effect=responses_first)):
        await sync_service.sync_youtube_channel(db_session, me["id"], "UCFakeChannelId", api_key="fake-key")

    updated_videos = {
        "items": [
            {**FAKE_VIDEOS_RESPONSE["items"][0], "statistics": {"viewCount": "5000", "likeCount": "500", "commentCount": "50"}},
            FAKE_VIDEOS_RESPONSE["items"][1],
        ]
    }
    responses_second = [
        _mock_response(FAKE_CHANNEL_RESPONSE),
        _mock_response(FAKE_PLAYLIST_RESPONSE),
        _mock_response(updated_videos),
    ]
    with patch("httpx.AsyncClient.get", new=AsyncMock(side_effect=responses_second)):
        result = await sync_service.sync_youtube_channel(db_session, me["id"], "UCFakeChannelId", api_key="fake-key")

    assert result["videos_synced"] == 0
    assert result["videos_updated"] == 2

    content_list = client.get("/api/content/", headers=headers).json()
    assert content_list["total"] == 2


@pytest.mark.asyncio
async def test_resync_same_day_updates_growth_record_not_duplicates(client, db_session):
    headers = get_auth_headers(client)
    me = client.get("/api/users/me", headers=headers).json()

    responses = [
        _mock_response(FAKE_CHANNEL_RESPONSE),
        _mock_response({"items": []}),
    ]
    with patch("httpx.AsyncClient.get", new=AsyncMock(side_effect=responses)):
        await sync_service.sync_youtube_channel(db_session, me["id"], "UCFakeChannelId", api_key="fake-key")

    channel_v2 = {
        "items": [{
            **FAKE_CHANNEL_RESPONSE["items"][0],
            "statistics": {"subscriberCount": "12500", "viewCount": "500000", "videoCount": "42"},
        }]
    }
    responses2 = [_mock_response(channel_v2), _mock_response({"items": []})]
    with patch("httpx.AsyncClient.get", new=AsyncMock(side_effect=responses2)):
        await sync_service.sync_youtube_channel(db_session, me["id"], "UCFakeChannelId", api_key="fake-key")

    trend = client.get("/api/audience/growth/trend?platform=youtube", headers=headers).json()
    assert len(trend) == 1
    assert trend[0]["follower_count"] == 12500


# ---------- Endpoint-level tests ----------

def test_sync_endpoint_requires_auth(client):
    response = client.post("/api/youtube/sync", json={"channel_id": "UCFake"})
    assert response.status_code == 401


def test_sync_endpoint_returns_503_without_api_key(client):
    headers = get_auth_headers(client)
    with patch("app.core.config.settings.YOUTUBE_API_KEY", ""):
        response = client.post(
            "/api/youtube/sync", json={"channel_id": "UCFake"}, headers=headers
        )
    assert response.status_code == 503
