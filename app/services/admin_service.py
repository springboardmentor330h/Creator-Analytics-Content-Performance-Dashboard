from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.user import User
from app.services.analytics_service import calculate_engagement_rate


def get_platform_overview(db: Session) -> dict:
    """High-level, platform-wide numbers for the admin control center."""
    users = db.query(User).filter(User.is_deleted == False).all()  # noqa: E712
    contents = db.query(Content).all()

    role_breakdown = defaultdict(int)
    for u in users:
        role_breakdown[u.role.value] += 1

    active_users = sum(1 for u in users if u.is_active)
    inactive_users = len(users) - active_users

    creator_ids = {c.creator_id for c in contents}
    platforms = {c.platform for c in contents}

    total_views = sum(c.views or 0 for c in contents)
    total_reach = sum(c.reach or 0 for c in contents)
    engagement_rates = [calculate_engagement_rate(c) for c in contents]
    avg_engagement = (
        round(sum(engagement_rates) / len(engagement_rates), 2)
        if engagement_rates
        else 0
    )

    return {
        "total_users": len(users),
        "active_users": active_users,
        "inactive_users": inactive_users,
        "role_breakdown": role_breakdown,
        "total_creators_with_content": len(creator_ids),
        "connected_platforms": len(platforms),
        "total_content": len(contents),
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": avg_engagement,
    }


def get_top_creators(db: Session, limit: int = 10) -> list[dict]:
    """Ranks creators by total views across all of their synced content."""
    contents = db.query(Content).all()

    by_creator = defaultdict(list)
    for c in contents:
        by_creator[c.creator_id].append(c)

    creator_ids = list(by_creator.keys())
    users = (
        db.query(User)
        .filter(User.id.in_(creator_ids), User.is_deleted == False)  # noqa: E712
        .all()
        if creator_ids
        else []
    )
    users_by_id = {u.id: u for u in users}

    rows = []
    for creator_id, items in by_creator.items():
        user = users_by_id.get(creator_id)

        total_views = sum(c.views or 0 for c in items)
        total_likes = sum(c.likes for c in items)
        total_comments = sum(c.comments for c in items)
        rates = [calculate_engagement_rate(c) for c in items]
        avg_rate = round(sum(rates) / len(rates), 2) if rates else 0

        platform_counts = defaultdict(int)
        for c in items:
            platform_counts[c.platform] += 1
        top_platform = max(platform_counts, key=platform_counts.get) if platform_counts else None

        rows.append({
            "creator_id": creator_id,
            "full_name": user.full_name if user else f"Unknown Creator #{creator_id}",
            "email": user.email if user else None,
            "role": user.role.value if user else None,
            "is_active": user.is_active if user else None,
            "content_count": len(items),
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "average_engagement_rate": avg_rate,
            "top_platform": top_platform,
            "platforms_used": sorted(platform_counts.keys()),
        })

    rows.sort(key=lambda x: x["total_views"], reverse=True)
    return rows[:limit]


def get_top_content_by_platform(db: Session, limit_per_platform: int = 3) -> list[dict]:
    """For every platform with content, returns its top N pieces by engagement rate."""
    contents = db.query(Content).all()

    creator_ids = {c.creator_id for c in contents}
    users_by_id = {
        u.id: u
        for u in db.query(User)
        .filter(User.id.in_(creator_ids), User.is_deleted == False)  # noqa: E712
        .all()
    } if creator_ids else {}

    by_platform = defaultdict(list)
    for c in contents:
        by_platform[c.platform].append(c)

    result = []
    for platform, items in by_platform.items():
        ranked = sorted(items, key=calculate_engagement_rate, reverse=True)[:limit_per_platform]

        result.append({
            "platform": platform,
            "content_count": len(items),
            "top_content": [
                {
                    "content_id": c.id,
                    "content_title": c.content_title,
                    "creator_id": c.creator_id,
                    "creator_name": users_by_id.get(c.creator_id).full_name
                    if users_by_id.get(c.creator_id)
                    else f"Unknown Creator #{c.creator_id}",
                    "views": c.views,
                    "reach": c.reach,
                    "engagement_rate": calculate_engagement_rate(c),
                    "published_date": c.published_date.isoformat() if c.published_date else None,
                }
                for c in ranked
            ],
        })

    result.sort(key=lambda x: x["content_count"], reverse=True)
    return result


def get_recent_signups(db: Session, limit: int = 8) -> list[dict]:
    """Most recently created accounts, newest first — useful for an admin activity feed."""
    users = (
        db.query(User)
        .filter(User.is_deleted == False)  # noqa: E712
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
