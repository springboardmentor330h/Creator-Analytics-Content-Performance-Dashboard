"""
Instagram Graph API integration.

CURRENT STATE: Uses mock data (see MOCK_INSTAGRAM_MEDIA below) instead of a
real API call, since Instagram Business API credentials/app review are
pending. The function signatures, error handling shape, and transform
logic are written exactly as they would be for the real API — swapping
`fetch_instagram_media_mock()` for a real `requests.get(...)` call to
Graph API is the ONLY change needed later. Nothing in routers, services,
or the database layer needs to change.

REAL API REFERENCE (for later):
GET https://graph.facebook.com/v19.0/{ig-business-account-id}/media
    ?fields=id,caption,media_type,like_count,comments_count,timestamp,permalink
    &access_token={access_token}
"""

from datetime import datetime, date
from fastapi import HTTPException
from app.config import settings


MOCK_INSTAGRAM_MEDIA = [
    {
        "id": "17895695668004550",
        "caption": "Behind the scenes of our latest shoot #bts",
        "media_type": "IMAGE",
        "like_count": 3400,
        "comments_count": 210,
        "timestamp": "2026-07-15T10:30:00+0000",
        "permalink": "https://www.instagram.com/p/mock1/",
    },
    {
        "id": "17895695668004551",
        "caption": "Quick tutorial reel on FastAPI basics",
        "media_type": "VIDEO",
        "like_count": 5200,
        "comments_count": 340,
        "timestamp": "2026-07-20T14:00:00+0000",
        "permalink": "https://www.instagram.com/p/mock2/",
    },
    {
        "id": "17895695668004552",
        "caption": "Weekend coding setup tour",
        "media_type": "CAROUSEL_ALBUM",
        "like_count": 1800,
        "comments_count": 95,
        "timestamp": "2026-07-28T09:15:00+0000",
        "permalink": "https://www.instagram.com/p/mock3/",
    },
]


def get_instagram_client_config():
    """
    Placeholder for future real-API credential check, mirroring
    youtube_service.get_youtube_client(). Currently just validates that
    the mock mode has what it needs (nothing, since it's mock), but kept
    here so the real implementation slots in with the same call shape.
    """
    return True


def fetch_instagram_media_mock(limit: int = 10) -> list[dict]:
    """Mock stand-in for the real Graph API GET request."""
    get_instagram_client_config()
    return MOCK_INSTAGRAM_MEDIA[:limit]


def fetch_instagram_media(limit: int = 10) -> list[dict]:
    """
    Public entry point used by the router/sync workflow.
    TODO (real API): replace body with:

        import requests
        url = f"https://graph.facebook.com/v19.0/{settings.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
        params = {
            "fields": "id,caption,media_type,like_count,comments_count,timestamp,permalink",
            "access_token": settings.INSTAGRAM_ACCESS_TOKEN,
            "limit": limit,
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Instagram API error: {response.text}")
        data = response.json().get("data", [])
        if not data:
            raise HTTPException(status_code=404, detail="No Instagram media found")
        return data

    For now, returns mock data with the identical shape.
    """
    try:
        items = fetch_instagram_media_mock(limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error fetching Instagram data: {str(e)}")

    if not items:
        raise HTTPException(status_code=404, detail="No Instagram media found")

    return items


def transform_instagram_item(item: dict) -> dict:
    """
    Instagram Graph API response -> CreatorIQ common content format.
    Same responsibility as youtube_service.transform_youtube_item().

    Note: Instagram's Graph API does not expose a raw "views" count for
    IMAGE/CAROUSEL posts (only Reels insights do, via a separate insights
    endpoint not used here). Per sprint instructions, we do NOT invent a
    views value — it's left as None/0 and explicitly flagged as
    unavailable, rather than approximated from likes.
    """
    caption = item.get("caption", "") or "Untitled Instagram Post"
    title = caption[:100]  # truncate long captions for a title-like field

    timestamp = item.get("timestamp")
    published_date = (
        datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S%z").date()
        if timestamp else date.today()
    )

    return {
        "platform": "Instagram",
        "external_content_id": item.get("id"),
        "content_title": title,
        "views": None,       # not available via this endpoint — explicitly unavailable
        "likes": item.get("like_count", 0),
        "comments": item.get("comments_count", 0),
        "shares": None,      # Instagram Graph API does not expose shares for standard media
        "reach": None,       # requires Insights API (separate permission), not available here
        "published_date": published_date,
    }


def get_transformed_instagram_content(limit: int = 10) -> list[dict]:
    raw_items = fetch_instagram_media(limit)
    return [transform_instagram_item(item) for item in raw_items]