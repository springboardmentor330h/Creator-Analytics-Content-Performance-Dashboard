"""Analytics service for CreatorIQ dashboard and performance metrics."""
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth
from app.models.user import User
from app.services.content_service import _apply_scope, can_view_content


def calculate_item_engagement_rate(item: Content) -> float:
    """Calculate engagement rate for an individual content record."""
    total_eng = item.likes + item.comments + item.shares + item.saves
    if item.reach > 0:
        return (total_eng / item.reach) * 100.0
    return 0.0


def _apply_growth_scope(stmt: Any, user: User) -> Any:
    role = user.role.lower() if user.role else ""
    if role in {"administrator", "admin", "marketing team", "marketing"}:
        return stmt
    if role == "creator":
        return stmt.where(Growth.creator_id == user.id)
    if role == "agency":
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(Growth.creator_id == user.id)
        return stmt.where(Growth.creator_id.in_(assigned_ids))
    return stmt.where(Growth.creator_id == user.id)


def _apply_audience_scope(stmt: Any, user: User) -> Any:
    role = user.role.lower() if user.role else ""
    if role in {"administrator", "admin", "marketing team", "marketing"}:
        return stmt
    if role == "creator":
        return stmt.where(Audience.creator_id == user.id)
    if role == "agency":
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(Audience.creator_id == user.id)
        return stmt.where(Audience.creator_id.in_(assigned_ids))
    return stmt.where(Audience.creator_id == user.id)


def get_total_followers(db: Session, user: User) -> int:
    """Calculate total current followers from Growth (latest date) or Audience data."""
    role = user.role.lower() if user.role else ""
    if role in {"administrator", "admin", "marketing team", "marketing"}:
        target_creators = db.scalars(select(User.id).where(User.role.ilike("Creator"))).all()
        if not target_creators:
            target_creators = db.scalars(select(User.id)).all()
    elif role == "agency":
        target_creators = [c.id for c in (user.assigned_creators or [])]
        if not target_creators:
            target_creators = [user.id]
    else:
        target_creators = [user.id]

    if not target_creators:
        return 0

    total_followers = 0
    creators_with_no_growth = []

    for cid in target_creators:
        latest_growth = db.scalars(
            select(Growth)
            .where(Growth.creator_id == cid)
            .order_by(Growth.date.desc())
        ).first()
        if latest_growth:
            total_followers += latest_growth.followers
        else:
            creators_with_no_growth.append(cid)

    if creators_with_no_growth:
        aud_stmt = select(func.coalesce(func.sum(Audience.followers), 0)).where(
            Audience.creator_id.in_(creators_with_no_growth)
        )
        total_followers += int(db.scalar(aud_stmt) or 0)

    return total_followers


def get_content_engagement(db: Session, user: User, content_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve engagement metrics for a specific content item."""
    content = db.get(Content, content_id)
    if not content or not can_view_content(user, content):
        return None

    total_engagement = content.likes + content.comments + content.shares + content.saves
    engagement_rate = calculate_item_engagement_rate(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2),
    }


def get_top_content(db: Session, user: User, platform: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve top-performing content items by engagement rate, optionally filtered by platform."""
    stmt = _apply_scope(select(Content), user)
    if platform and platform.strip().lower() not in {"all", "all platforms"}:
        stmt = stmt.where(func.lower(Content.platform) == platform.strip().lower())
    records = db.scalars(stmt).all()

    results = []
    for item in records:
        eng_rate = calculate_item_engagement_rate(item)
        results.append({
            "content_title": item.title,
            "platform": item.platform,
            "views": item.views,
            "reach": item.reach,
            "watch_time": item.watch_time,
            "engagement_rate": round(eng_rate, 2),
        })

    results.sort(key=lambda x: x["engagement_rate"], reverse=True)
    return results[:5]


def get_platform_performance(db: Session, user: User, platform: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve aggregated performance metrics grouped by platform (list format)."""
    stmt = _apply_scope(select(Content), user)
    if platform and platform.strip().lower() not in {"all", "all platforms"}:
        stmt = stmt.where(func.lower(Content.platform) == platform.strip().lower())
    records = db.scalars(stmt).all()

    platforms: Dict[str, Dict[str, Any]] = {}
    for item in records:
        p = item.platform
        if p not in platforms:
            platforms[p] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "sum_eng_rate": 0.0,
                "count": 0,
            }

        platforms[p]["total_views"] += item.views
        platforms[p]["total_likes"] += item.likes
        platforms[p]["total_comments"] += item.comments
        platforms[p]["total_reach"] += item.reach

        eng_rate = calculate_item_engagement_rate(item)
        platforms[p]["sum_eng_rate"] += eng_rate
        platforms[p]["count"] += 1

    results = []
    for p, data in platforms.items():
        avg_eng = data["sum_eng_rate"] / data["count"] if data["count"] > 0 else 0.0
        results.append({
            "platform": p,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(avg_eng, 2),
        })
    return results


def get_dashboard_summary(db: Session, user: User, platform: Optional[str] = None) -> Dict[str, Any]:
    """Calculate KPI summary metrics across Content and Growth/Audience data with optional platform filter."""
    stmt = _apply_scope(select(Content), user)
    if platform and platform.strip().lower() not in {"all", "all platforms"}:
        stmt = stmt.where(func.lower(Content.platform) == platform.strip().lower())
    records = db.scalars(stmt).all()

    total_views = sum(item.views for item in records)
    total_likes = sum(item.likes for item in records)
    total_comments = sum(item.comments for item in records)
    total_shares = sum(item.shares for item in records)
    total_reach = sum(item.reach for item in records)

    if records:
        sum_eng_rate = sum(calculate_item_engagement_rate(item) for item in records)
        avg_eng_rate = sum_eng_rate / len(records)
    else:
        avg_eng_rate = 0.0

    total_followers = get_total_followers(db, user)

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": round(avg_eng_rate, 2),
    }


def get_engagement_chart_data(db: Session, user: User, platform: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve chart-ready engagement rate trend sorted chronologically, optionally filtered by platform."""
    stmt = _apply_scope(select(Content), user).order_by(Content.published_at.asc())
    if platform and platform.strip().lower() not in {"all", "all platforms"}:
        stmt = stmt.where(func.lower(Content.platform) == platform.strip().lower())
    records = db.scalars(stmt).all()

    if records:
        by_date: Dict[str, List[float]] = {}
        for item in records:
            d_str = item.published_at.isoformat()
            if d_str not in by_date:
                by_date[d_str] = []
            by_date[d_str].append(calculate_item_engagement_rate(item))

        labels: List[str] = []
        values: List[float] = []
        for d_str in sorted(by_date.keys()):
            rates = by_date[d_str]
            avg_rate = round(sum(rates) / len(rates), 2)
            labels.append(d_str)
            values.append(avg_rate)

        return {"labels": labels, "values": values}

    # Fallback to growth table engagement_rate if no content records
    growth_stmt = _apply_growth_scope(select(Growth), user).order_by(Growth.date.asc())
    growth_records = db.scalars(growth_stmt).all()
    labels = [g.date.isoformat() for g in growth_records]
    values = [round(float(g.engagement_rate or 0.0), 2) for g in growth_records]
    return {"labels": labels, "values": values}


def get_follower_growth_chart_data(db: Session, user: User) -> Dict[str, Any]:
    """Retrieve chart-ready follower growth points sorted chronologically from Growth table."""
    stmt = _apply_growth_scope(select(Growth), user).order_by(Growth.date.asc())
    records = db.scalars(stmt).all()

    by_date: Dict[str, int] = {}
    for g in records:
        d_str = g.date.isoformat()
        by_date[d_str] = by_date.get(d_str, 0) + g.followers

    labels: List[str] = []
    values: List[int] = []
    for d_str in sorted(by_date.keys()):
        labels.append(d_str)
        values.append(by_date[d_str])

    return {"labels": labels, "values": values}


def get_platform_comparison(db: Session, user: User) -> Dict[str, Dict[str, Any]]:
    """Group content analytics by platform and compute platform-level engagement metrics."""
    stmt = _apply_scope(select(Content), user)
    records = db.scalars(stmt).all()

    platforms: Dict[str, Dict[str, Any]] = {}
    for item in records:
        p = item.platform
        if p not in platforms:
            platforms[p] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "saves": 0,
            }

        platforms[p]["views"] += item.views
        platforms[p]["reach"] += item.reach
        platforms[p]["likes"] += item.likes
        platforms[p]["comments"] += item.comments
        platforms[p]["shares"] += item.shares
        platforms[p]["saves"] += item.saves

    result: Dict[str, Dict[str, Any]] = {}
    for p, data in platforms.items():
        total_reach = data["reach"]
        total_eng = data["likes"] + data["comments"] + data["shares"] + data["saves"]
        eng_rate = round((total_eng / total_reach) * 100, 2) if total_reach > 0 else 0.0

        result[p] = {
            "views": data["views"],
            "reach": data["reach"],
            "engagement_rate": eng_rate,
            "likes": data["likes"],
            "comments": data["comments"],
        }

    return result
