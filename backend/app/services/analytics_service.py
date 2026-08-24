"""
analytics_service.py

All calculation logic for the /analytics router lives here — the router
itself only handles HTTP request/response and DB sessions.
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


# ---------- Task 2: top content ----------

def get_top_content(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    all_content = db.query(Content).all()

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
    return scored[:limit]


# ---------- Task 3 / platform comparison ----------

def get_platform_performance(db: Session) -> List[Dict[str, Any]]:
    rows = (
        db.query(
            Content.platform,
            func.count(Content.id),
            func.coalesce(func.sum(Content.views), 0),
            func.coalesce(func.sum(Content.likes), 0),
            func.coalesce(func.sum(Content.comments), 0),
            func.coalesce(func.sum(Content.shares), 0),
        )
        .group_by(Content.platform)
        .all()
    )

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


def get_platform_comparison(db: Session) -> List[Dict[str, Any]]:
    """
    Same underlying metrics as platform performance, exposed under the
    name the sprint checklist specifically asks for so platforms can be
    compared side by side on a dashboard.
    """
    return get_platform_performance(db)


# ---------- Task 4: dashboard summary ----------

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    total_content = db.query(func.count(Content.id)).scalar()
    total_views = db.query(func.coalesce(func.sum(Content.views), 0)).scalar()
    total_likes = db.query(func.coalesce(func.sum(Content.likes), 0)).scalar()
    total_comments = db.query(func.coalesce(func.sum(Content.comments), 0)).scalar()
    total_shares = db.query(func.coalesce(func.sum(Content.shares), 0)).scalar()

    return {
        "total_content": int(total_content),
        "total_views": int(total_views),
        "total_likes": int(total_likes),
        "overall_engagement_rate": _engagement_rate(
            total_views, total_likes, total_comments, total_shares
        ),
        "platform_breakdown": get_platform_performance(db),
    }


# ---------- Chart-ready endpoints ----------

def get_engagement_chart(db: Session) -> List[Dict[str, Any]]:
    """Engagement rate over time, grouped by published date, chart-ready."""
    rows = (
        db.query(
            Content.published_date,
            func.coalesce(func.sum(Content.views), 0),
            func.coalesce(func.sum(Content.likes), 0),
            func.coalesce(func.sum(Content.comments), 0),
            func.coalesce(func.sum(Content.shares), 0),
        )
        .group_by(Content.published_date)
        .order_by(Content.published_date)
        .all()
    )

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