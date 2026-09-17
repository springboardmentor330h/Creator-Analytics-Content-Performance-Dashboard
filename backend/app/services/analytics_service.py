"""
analytics_service.py

All calculation logic for the /analytics router lives here — the router
itself only handles HTTP request/response and DB sessions.

Platform filtering: get_top_content and get_engagement_chart accept an
optional `platform` argument so the SAME functions serve "All Platforms",
"YouTube", "Instagram", etc. — no duplicate logic per platform.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.growth import Growth


def _engagement_rate(views: int, likes: int, comments: int, shares: int) -> float:
    """Engagement rate as a percentage of views. Returns 0 if there are no views."""
    if not views:
        return 0.0
    return round(((likes + comments + shares) / views) * 100, 2)


# ---------- Task 1: single content engagement ----------

def get_content_engagement(db: Session, content_id: int) -> Optional[Dict[str, Any]]:
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None

    return {
        "content_id": content.id,
        "content_title": content.content_title,
        "platform": content.platform,
        "views": content.views,
        "likes": content.likes,
        "comments": content.comments,
        "shares": content.shares,
        "engagement_rate": _engagement_rate(
            content.views, content.likes, content.comments, content.shares
        ),
    }


# ---------- Task 2: top content (platform-filterable) ----------

def get_top_content(db: Session, limit: int = 5, platform: Optional[str] = None, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query = db.query(Content)
    if platform and platform.lower() != "all":
        query = query.filter(Content.platform == platform)
    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)
    all_content = query.all()

    scored = [
        {
            "content_id": c.id,
            "content_title": c.content_title,
            "platform": c.platform,
            "views": c.views,
            "engagement_rate": _engagement_rate(c.views, c.likes, c.comments, c.shares),
        }
        for c in all_content
    ]
    scored.sort(key=lambda item: item["engagement_rate"], reverse=True)

    # NOTE: the content table currently contains duplicate rows (same
    # title/views/engagement under different content_id, likely from a
    # seed/import run twice). Dedupe by title here so the UI never shows
    # the same piece of content more than once, even before the underlying
    # duplicate rows are cleaned up in the database.
    seen_titles = set()
    unique_scored = []
    for item in scored:
        if item["content_title"] not in seen_titles:
            seen_titles.add(item["content_title"])
            unique_scored.append(item)

    return unique_scored[:limit]


# ---------- Task 3 / platform comparison ----------

def get_platform_performance(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query = db.query(
        Content.platform,
        func.count(Content.id),
        func.coalesce(func.sum(Content.views), 0),
        func.coalesce(func.sum(Content.likes), 0),
        func.coalesce(func.sum(Content.comments), 0),
        func.coalesce(func.sum(Content.shares), 0),
    )
    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)
    rows = query.group_by(Content.platform).all()

    return [
        {
            "platform": platform,
            "content_count": count,
            "total_views": int(views),
            "total_likes": int(likes),
            "avg_engagement_rate": _engagement_rate(views, likes, comments, shares),
        }
        for platform, count, views, likes, comments, shares in rows
    ]


def get_platform_comparison(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Same underlying metrics as platform performance, exposed under the
    name the sprint checklist specifically asks for so platforms can be
    compared side by side on a dashboard.
    """
    return get_platform_performance(db, creator_id=creator_id)


# ---------- Task 4: dashboard summary ----------

def get_dashboard_summary(db: Session, platform: Optional[str] = None, creator_id: Optional[int] = None) -> Dict[str, Any]:
    query_filter = []
    if platform and platform.lower() != "all":
        query_filter.append(Content.platform == platform)
    if creator_id is not None:
        query_filter.append(Content.creator_id == creator_id)

    total_content = db.query(func.count(Content.id)).filter(*query_filter).scalar()
    total_views = db.query(func.coalesce(func.sum(Content.views), 0)).filter(*query_filter).scalar()
    total_likes = db.query(func.coalesce(func.sum(Content.likes), 0)).filter(*query_filter).scalar()
    total_comments = db.query(func.coalesce(func.sum(Content.comments), 0)).filter(*query_filter).scalar()
    total_shares = db.query(func.coalesce(func.sum(Content.shares), 0)).filter(*query_filter).scalar()

    return {
        "total_content": int(total_content),
        "total_views": int(total_views),
        "total_likes": int(total_likes),
        "overall_engagement_rate": _engagement_rate(
            total_views, total_likes, total_comments, total_shares
        ),
        "platform_breakdown": get_platform_performance(db, creator_id=creator_id),
    }


# ---------- Chart-ready endpoints (platform-filterable) ----------

def get_engagement_chart(db: Session, platform: Optional[str] = None) -> List[Dict[str, Any]]:
    """Engagement rate over time, grouped by published date, chart-ready."""
    query = db.query(
        Content.published_date,
        func.coalesce(func.sum(Content.views), 0),
        func.coalesce(func.sum(Content.likes), 0),
        func.coalesce(func.sum(Content.comments), 0),
        func.coalesce(func.sum(Content.shares), 0),
    )
    if platform and platform.lower() != "all":
        query = query.filter(Content.platform == platform)

    rows = query.group_by(Content.published_date).order_by(Content.published_date).all()

    return [
        {
            "date": date,
            "engagement_rate": _engagement_rate(views, likes, comments, shares),
        }
        for date, views, likes, comments, shares in rows
    ]


def get_followers_chart(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Follower count over time, pulled from the growth table, chart-ready."""
    query = db.query(Growth.date, Growth.followers)
    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)

    rows = query.order_by(Growth.date).all()
    return [{"date": d, "followers": f} for d, f in rows]


def get_available_platforms(db: Session) -> List[str]:
    """Returns the distinct list of platforms currently in the content table."""
    rows = db.query(Content.platform).distinct().all()
    return sorted([p[0] for p in rows if p[0]])