"""
Facebook Pages API integration — MOCK DATA for now.
REAL API REFERENCE (for later): Facebook Graph API, Page posts:
GET https://graph.facebook.com/v19.0/{page-id}/posts
    ?fields=id,message,likes.summary(true),comments.summary(true),shares,created_time
    &access_token={page_access_token}
"""

from datetime import datetime, date
from fastapi import HTTPException

MOCK_FACEBOOK_POSTS = [
    {"id": "1234567890_001", "message": "Excited to announce our new product launch!", "likes": {"summary": {"total_count": 540}}, "comments": {"summary": {"total_count": 88}}, "shares": {"count": 120}, "created_time": "2026-07-05T12:00:00+0000"},
    {"id": "1234567890_002", "message": "Weekly recap: what we built this week", "likes": {"summary": {"total_count": 310}}, "comments": {"summary": {"total_count": 45}}, "shares": {"count": 60}, "created_time": "2026-07-18T09:30:00+0000"},
]


def fetch_facebook_posts_mock(limit: int = 10) -> list[dict]:
    return MOCK_FACEBOOK_POSTS[:limit]


def fetch_facebook_posts(limit: int = 10) -> list[dict]:
    """
    TODO (real API): replace with actual Graph API call using
    settings.FACEBOOK_PAGE_ACCESS_TOKEN and settings.FACEBOOK_PAGE_ID.
    """
    try:
        items = fetch_facebook_posts_mock(limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error fetching Facebook data: {str(e)}")
    if not items:
        raise HTTPException(status_code=404, detail="No Facebook posts found")
    return items


def transform_facebook_item(item: dict) -> dict:
    """Facebook Graph API response -> CreatorIQ common content format."""
    message = item.get("message", "") or "Untitled Facebook Post"
    created = item.get("created_time")
    published_date = (
        datetime.strptime(created, "%Y-%m-%dT%H:%M:%S%z").date() if created else date.today()
    )
    return {
        "platform": "Facebook",
        "external_content_id": item.get("id"),
        "content_title": message[:100],
        "views": None,  # not exposed for standard posts without Page Insights permission
        "likes": item.get("likes", {}).get("summary", {}).get("total_count", 0),
        "comments": item.get("comments", {}).get("summary", {}).get("total_count", 0),
        "shares": item.get("shares", {}).get("count", 0),
        "reach": None,  # requires Page Insights (insights.impressions), not available here
        "published_date": published_date,
    }


def get_transformed_facebook_content(limit: int = 10) -> list[dict]:
    return [transform_facebook_item(item) for item in fetch_facebook_posts(limit)]