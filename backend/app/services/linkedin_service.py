"""
LinkedIn API integration — MOCK DATA for now.
REAL API REFERENCE (for later): LinkedIn's API for post analytics
requires Marketing Developer Platform partner access, generally not
available to individual developers, hence mock data per sprint guidance.
Shape modeled after LinkedIn's UGC Posts + Social Actions APIs.
"""

from datetime import date
from fastapi import HTTPException

MOCK_LINKEDIN_POSTS = [
    {"id": "urn:li:share:7080123456789012345", "commentary": "How we scaled our creator analytics backend", "likeCount": 340, "commentCount": 52, "shareCount": 28, "publishedDate": "2026-07-08"},
    {"id": "urn:li:share:7080123456789012346", "commentary": "Career growth tips for junior developers", "likeCount": 510, "commentCount": 76, "shareCount": 41, "publishedDate": "2026-07-29"},
]


def fetch_linkedin_posts_mock(limit: int = 10) -> list[dict]:
    return MOCK_LINKEDIN_POSTS[:limit]


def fetch_linkedin_posts(limit: int = 10) -> list[dict]:
    """
    TODO (real API): replace with actual LinkedIn API call using
    settings.LINKEDIN_ACCESS_TOKEN once partner access is granted.
    """
    try:
        items = fetch_linkedin_posts_mock(limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error fetching LinkedIn data: {str(e)}")
    if not items:
        raise HTTPException(status_code=404, detail="No LinkedIn posts found")
    return items


def transform_linkedin_item(item: dict) -> dict:
    """LinkedIn API response -> CreatorIQ common content format."""
    return {
        "platform": "LinkedIn",
        "external_content_id": item.get("id"),
        "content_title": (item.get("commentary", "") or "Untitled LinkedIn Post")[:100],
        "views": None,  # LinkedIn does not expose impressions without Marketing API partner access
        "likes": item.get("likeCount", 0),
        "comments": item.get("commentCount", 0),
        "shares": item.get("shareCount", 0),
        "reach": None,  # requires Marketing Developer Platform partner access
        "published_date": (
            date.fromisoformat(item["publishedDate"]) if item.get("publishedDate") else date.today()
        ),
    }


def get_transformed_linkedin_content(limit: int = 10) -> list[dict]:
    return [transform_linkedin_item(item) for item in fetch_linkedin_posts(limit)]