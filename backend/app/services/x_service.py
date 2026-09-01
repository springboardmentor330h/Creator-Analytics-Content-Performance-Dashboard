"""
X (Twitter) API integration — MOCK DATA for now.
REAL API REFERENCE (for later): X API v2, user tweets endpoint:
GET https://api.twitter.com/2/users/{id}/tweets
    ?tweet.fields=public_metrics,created_at
Note: the free tier is heavily rate-limited/paywalled, which is why
mock data is used here per the sprint's platform-selection guidance.
"""

from datetime import datetime, date
from fastapi import HTTPException

MOCK_X_POSTS = [
    {"id": "1780123456789012345", "text": "Just shipped a new FastAPI feature 🚀", "public_metrics": {"like_count": 210, "reply_count": 34, "retweet_count": 45, "impression_count": 8900}, "created_at": "2026-07-12T08:00:00.000Z"},
    {"id": "1780123456789012346", "text": "Thread: 5 lessons from building a creator analytics platform", "public_metrics": {"like_count": 620, "reply_count": 98, "retweet_count": 150, "impression_count": 22000}, "created_at": "2026-07-25T15:20:00.000Z"},
]


def fetch_x_posts_mock(limit: int = 10) -> list[dict]:
    return MOCK_X_POSTS[:limit]


def fetch_x_posts(limit: int = 10) -> list[dict]:
    """
    TODO (real API): replace with actual X API v2 call using
    settings.X_BEARER_TOKEN and settings.X_USER_ID.
    """
    try:
        items = fetch_x_posts_mock(limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error fetching X data: {str(e)}")
    if not items:
        raise HTTPException(status_code=404, detail="No X posts found")
    return items


def transform_x_item(item: dict) -> dict:
    """X API v2 response -> CreatorIQ common content format."""
    metrics = item.get("public_metrics", {})
    created = item.get("created_at")
    published_date = (
        datetime.strptime(created, "%Y-%m-%dT%H:%M:%S.%fZ").date() if created else date.today()
    )
    return {
        "platform": "X",
        "external_content_id": item.get("id"),
        "content_title": (item.get("text", "") or "Untitled Post")[:100],
        "views": metrics.get("impression_count"),  # X calls this "impressions", closest to views
        "likes": metrics.get("like_count", 0),
        "comments": metrics.get("reply_count", 0),
        "shares": metrics.get("retweet_count", 0),
        "reach": None,  # X does not expose a distinct "reach" metric via public API
        "published_date": published_date,
    }


def get_transformed_x_content(limit: int = 10) -> list[dict]:
    return [transform_x_item(item) for item in fetch_x_posts(limit)]