# app/services/social_media.py

from sqlalchemy.orm import Session

from app.models.content import Content


# =========================================================
# SPRINT 8 - MULTI PLATFORM SERVICE
# =========================================================

SUPPORTED_PLATFORMS = [
    "YouTube",
    "Instagram",
    "LinkedIn",
    "Facebook",
    "TikTok",
    "X"
]


def get_available_platforms():
    """
    Return all supported social-media platforms.
    """

    return SUPPORTED_PLATFORMS


def get_platform_data(
    db: Session,
    platform: str,
    creator_id: int
):
    """
    Fetch platform data from PostgreSQL.

    No hard-coded analytics data is used.
    """

    if platform not in SUPPORTED_PLATFORMS:
        return []

    records = (
        db.query(Content)
        .filter(
            Content.platform == platform,
            Content.creator_id == creator_id
        )
        .order_by(Content.published_date.asc())
        .all()
    )

    return [
        {
            "platform": content.platform,
            "external_content_id": content.external_content_id,
            "content_title": content.content_title,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "watch_time": content.watch_time,
            "reach": content.reach,
            "published_date": content.published_date
        }
        for content in records
    ]