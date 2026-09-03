"""Database-backed multi-platform reporting endpoints."""

import builtins
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import ContentItem

router = APIRouter(prefix="/reports", tags=["Multi-platform Reports"])

PLATFORMS = ("YouTube", "Instagram", "LinkedIn", "Twitter")
PlatformFilter = Literal["ALL", "YouTube", "Instagram", "LinkedIn", "Twitter"]


def _normalise_platform(platform: str) -> str:
    """Return a canonical platform name while accepting case-insensitive input."""
    requested = platform.strip().lower()
    if requested == "all":
        return "ALL"
    for value in PLATFORMS:
        if requested == value.lower():
            return value
    raise HTTPException(status_code=422, detail="platform must be ALL, YouTube, Instagram, LinkedIn, or Twitter")


def _filtered_query(db: Session, platform: str):
    query = db.query(ContentItem)
    return query if platform == "ALL" else query.filter(ContentItem.platform == platform)


def _engagement_rate(likes: int, comments: int, shares: int, denominator: int) -> float:
    return round(((likes + comments + shares) / denominator) * 100, 2) if denominator else 0.0


@router.get("/summary/me")
def get_my_summary(
    platform: PlatformFilter = Query("ALL"),
    db: Session = Depends(get_db),
):
    """Return dashboard KPIs calculated from ``content_items`` in PostgreSQL."""
    selected_platform = _normalise_platform(platform)
    totals = _filtered_query(db, selected_platform).with_entities(
        func.coalesce(func.sum(ContentItem.views), 0),
        func.coalesce(func.sum(ContentItem.likes), 0),
        func.coalesce(func.sum(ContentItem.comments), 0),
        func.coalesce(func.sum(ContentItem.shares), 0),
        func.coalesce(func.sum(ContentItem.reach), 0),
        func.count(ContentItem.id),
    ).one()
    views, likes, comments, shares, reach, count = (int(value or 0) for value in totals)
    # Reach is preferred for non-video networks; views keep video-only posts meaningful.
    denominator = reach or views
    return {
        "platform": selected_platform,
        "total_views": views,
        "total_likes": likes,
        "total_comments": comments,
        "total_shares": shares,
        "total_reach": reach,
        "avg_engagement_rate": _engagement_rate(likes, comments, shares, denominator),
        "total_content_count": count,
    }


@router.get("/trends/me")
def get_my_trends(
    platform: PlatformFilter = Query("ALL"),
    range: Literal["7d", "30d", "90d"] = Query("30d"),
    db: Session = Depends(get_db),
):
    """Return one chart point per published day for the selected rolling period."""
    selected_platform = _normalise_platform(platform)
    days = int(range[:-1])
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=days - 1)
    published_day = func.date(ContentItem.published_at)
    rows = (
        _filtered_query(db, selected_platform)
        .filter(published_day >= start_date)
        .with_entities(
            published_day.label("date"),
            func.coalesce(func.sum(ContentItem.views), 0).label("views"),
            func.coalesce(func.sum(ContentItem.likes), 0).label("likes"),
            func.coalesce(func.sum(ContentItem.comments), 0).label("comments"),
            func.coalesce(func.sum(ContentItem.shares), 0).label("shares"),
            func.coalesce(func.sum(ContentItem.reach), 0).label("reach"),
            func.count(ContentItem.id).label("post_count"),
        )
        .group_by(published_day)
        .order_by(published_day)
        .all()
    )
    values = {row.date: row for row in rows}
    points = []
    for offset in builtins.range(days):
        date_value = start_date + timedelta(days=offset)
        row = values.get(date_value)
        likes = int(row.likes) if row else 0
        comments = int(row.comments) if row else 0
        shares = int(row.shares) if row else 0
        reach = int(row.reach) if row else 0
        views = int(row.views) if row else 0
        points.append({
            "date": date_value.isoformat(),
            "views": views,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "reach": reach,
            "post_count": int(row.post_count) if row else 0,
            "engagement_rate": _engagement_rate(likes, comments, shares, reach or views),
        })
    return {"platform": selected_platform, "range": range, "data": points}


@router.get("/platform-comparison")
def get_platform_comparison(db: Session = Depends(get_db)):
    """Compare all dashboard platforms using the same engagement calculation."""
    rows = (
        db.query(
            ContentItem.platform,
            func.coalesce(func.sum(ContentItem.views), 0).label("total_views"),
            func.coalesce(func.sum(ContentItem.likes), 0).label("total_likes"),
            func.coalesce(func.sum(ContentItem.comments), 0).label("total_comments"),
            func.coalesce(func.sum(ContentItem.shares), 0).label("total_shares"),
            func.coalesce(func.sum(ContentItem.reach), 0).label("total_reach"),
            func.count(ContentItem.id).label("post_count"),
        )
        .filter(ContentItem.platform.in_(PLATFORMS))
        .group_by(ContentItem.platform)
        .all()
    )
    row_by_platform = {row.platform: row for row in rows}
    response = []
    for platform in PLATFORMS:
        row = row_by_platform.get(platform)
        views = int(row.total_views) if row else 0
        likes = int(row.total_likes) if row else 0
        comments = int(row.total_comments) if row else 0
        shares = int(row.total_shares) if row else 0
        reach = int(row.total_reach) if row else 0
        response.append({
            "platform": platform,
            "total_views": views,
            "total_likes": likes,
            "total_comments": comments,
            "total_shares": shares,
            "avg_engagement_rate": _engagement_rate(likes, comments, shares, reach or views),
            "post_count": int(row.post_count) if row else 0,
        })
    return response


def _platform_analytics_response(platform: str, range_value: str, db: Session) -> dict:
    """Compose the summary and time-series responses used by platform detail pages."""
    return {
        "platform": platform,
        "summary": get_my_summary(platform=platform, db=db),
        "trends": get_my_trends(platform=platform, range=range_value, db=db)["data"],
    }


@router.get(
    "/analytics/instagram",
    summary="Get Instagram analytics",
    description="Database-backed Instagram KPI totals and daily trend points for Swagger and dashboard clients.",
)
def get_instagram_analytics(
    range: Literal["7d", "30d", "90d"] = Query("30d", description="Analytics time range"),
    db: Session = Depends(get_db),
):
    return _platform_analytics_response("Instagram", range, db)


@router.get(
    "/analytics/linkedin",
    summary="Get LinkedIn analytics",
    description="Database-backed LinkedIn KPI totals and daily trend points for Swagger and dashboard clients.",
)
def get_linkedin_analytics(
    range: Literal["7d", "30d", "90d"] = Query("30d", description="Analytics time range"),
    db: Session = Depends(get_db),
):
    return _platform_analytics_response("LinkedIn", range, db)
