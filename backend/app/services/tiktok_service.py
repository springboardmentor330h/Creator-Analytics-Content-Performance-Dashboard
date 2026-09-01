"""
TikTok API integration — MOCK DATA for now.
REAL API REFERENCE (for later): TikTok Business/Research API requires
business verification. Endpoint shape (Content Posting/Display API):
GET https://open.tiktokapis.com/v2/video/list/
    fields=id,title,view_count,like_count,comment_count,share_count,create_time
"""

from datetime import date
from fastapi import HTTPException

MOCK_TIKTOK_VIDEOS = [
    {"id": "7291234567890123456", "title": "Coding in 60 seconds #shorts", "view_count": 120000, "like_count": 15400, "comment_count": 620, "share_count": 2100, "create_time": "2026-07-10"},
    {"id": "7291234567890123457", "title": "Day in the life of a dev", "view_count": 85000, "like_count": 9800, "comment_count": 410, "share_count": 1500, "create_time": "2026-07-22"},
    {"id": "7291234567890123458", "title": "3 VS Code tips you need", "view_count": 210000, "like_count": 28000, "comment_count": 1200, "share_count": 4300, "create_time": "2026-08-01"},
]


def fetch_tiktok_videos_mock(limit: int = 10) -> list[dict]:
    return MOCK_TIKTOK_VIDEOS[:limit]


def fetch_tiktok_videos(limit: int = 10) -> list[dict]:
    """
    TODO (real API): replace with actual TikTok Display API call using
    an OAuth access token stored in settings.TIKTOK_ACCESS_TOKEN.
    """
    try:
        items = fetch_tiktok_videos_mock(limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error fetching TikTok data: {str(e)}")
    if not items:
        raise HTTPException(status_code=404, detail="No TikTok videos found")
    return items


def transform_tiktok_item(item: dict) -> dict:
    """TikTok API response -> CreatorIQ common content format."""
    return {
        "platform": "TikTok",
        "external_content_id": item.get("id"),
        "content_title": item.get("title", "Untitled TikTok Video"),
        "views": item.get("view_count", 0),
        "likes": item.get("like_count", 0),
        "comments": item.get("comment_count", 0),
        "shares": item.get("share_count", 0),
        "reach": None,  # TikTok's public API does not expose reach separately from views
        "published_date": (
            date.fromisoformat(item["create_time"]) if item.get("create_time") else date.today()
        ),
    }


def get_transformed_tiktok_content(limit: int = 10) -> list[dict]:
    return [transform_tiktok_item(item) for item in fetch_tiktok_videos(limit)]