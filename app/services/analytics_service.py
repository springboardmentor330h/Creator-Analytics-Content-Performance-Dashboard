from collections import defaultdict
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth


def engagement_rate(content: Content) -> float:
    total_engagement = (
        (content.likes or 0)
        + (content.comments or 0)
        + (content.shares or 0)
        + (content.saves or 0)
    )

    reach = content.reach or 0

    if reach == 0:
        return 0.0

    return round((total_engagement / reach) * 100, 2)


def content_engagement(db: Session, content_id: UUID):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    return {
        "content_id": str(content.id),
        "platform": content.platform,
        "views": content.views or 0,
        "reach": content.reach or 0,
        "total_engagement": (
            (content.likes or 0)
            + (content.comments or 0)
            + (content.shares or 0)
            + (content.saves or 0)
        ),
        "engagement_rate": engagement_rate(content),
    }


def top_content(
    db: Session,
    limit: int = 5,
    platform: str | None = None,
    creator_id: UUID | None = None,
):
    query = db.query(Content)

    if creator_id:
        query = query.filter(Content.creator_id == creator_id)

    if platform:
        query = query.filter(Content.platform == platform)

    rows = query.all()
    rows.sort(key=engagement_rate, reverse=True)

    return [
        {
            "content_id": str(content.id),
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views or 0,
            "reach": content.reach or 0,
            "watch_time": content.watch_time or 0,
            "engagement_rate": engagement_rate(content),
        }
        for content in rows[:limit]
    ]


def platform_performance(
    db: Session,
    creator_id: UUID | None = None,
):
    query = db.query(Content)

    if creator_id:
        query = query.filter(Content.creator_id == creator_id)

    groups = defaultdict(list)

    for content in query.all():
        groups[content.platform].append(content)

    result = []

    for platform, rows in sorted(groups.items()):
        result.append(
            {
                "platform": platform,
                "total_views": sum(
                    (x.views or 0) for x in rows
                ),
                "total_likes": sum(
                    (x.likes or 0) for x in rows
                ),
                "total_comments": sum(
                    (x.comments or 0) for x in rows
                ),
                "total_shares": sum(
                    (x.shares or 0) for x in rows
                ),
                "total_reach": sum(
                    (x.reach or 0) for x in rows
                ),
                "average_engagement_rate": round(
                    sum(engagement_rate(x) for x in rows)
                    / len(rows),
                    2,
                ),
            }
        )

    return result


def summary(
    db: Session,
    platform: str | None = None,
    creator_id: UUID | None = None,
):
    query = db.query(Content)

    if creator_id:
        query = query.filter(Content.creator_id == creator_id)

    if platform:
        query = query.filter(Content.platform == platform)

    rows = query.all()

    rates = [
        engagement_rate(content)
        for content in rows
    ]

    platforms = platform_performance(
        db,
        creator_id=creator_id,
    )

    if platform and rows:
        best_platform = platform
    elif platforms:
        best_platform = max(
            platforms,
            key=lambda x: x["average_engagement_rate"],
        )["platform"]
    else:
        best_platform = None

    top = top_content(
        db,
        1,
        platform,
        creator_id,
    )

    return {
        "total_content": len(rows),
        "total_views": sum(
            (content.views or 0)
            for content in rows
        ),
        "total_reach": sum(
            (content.reach or 0)
            for content in rows
        ),
        "average_engagement_rate": (
            round(sum(rates) / len(rates), 2)
            if rates
            else 0.0
        ),
        "best_performing_platform": best_platform,
        "top_content": (
            top[0]["content_title"]
            if top
            else None
        ),
    }


def kpi_summary(
    db: Session,
    platform: str | None = None,
    creator_id: UUID | None = None,
):
    query = db.query(Content)

    if creator_id:
        query = query.filter(Content.creator_id == creator_id)

    if platform:
        query = query.filter(Content.platform == platform)

    rows = query.all()

    audience_query = db.query(Audience)

    if creator_id:
        audience_query = audience_query.filter(
            Audience.creator_id == creator_id
        )

    audience_rows = audience_query.all()

    rates = [
        engagement_rate(content)
        for content in rows
    ]

    return {
        "total_views": sum(
            (content.views or 0)
            for content in rows
        ),
        "total_likes": sum(
            (content.likes or 0)
            for content in rows
        ),
        "total_comments": sum(
            (content.comments or 0)
            for content in rows
        ),
        "total_shares": sum(
            (content.shares or 0)
            for content in rows
        ),
        "total_reach": sum(
            (content.reach or 0)
            for content in rows
        ),
        "total_followers": sum(
            (audience.followers or 0)
            for audience in audience_rows
        ),
        "average_engagement_rate": (
            round(sum(rates) / len(rates), 2)
            if rates
            else 0.0
        ),
    }


def engagement_chart(
    db: Session,
    platform: str | None = None,
    creator_id: UUID | None = None,
):
    query = db.query(Content)

    if creator_id:
        query = query.filter(Content.creator_id == creator_id)

    if platform:
        query = query.filter(
            Content.platform == platform
        )

    rows = [
        content
        for content in query.all()
        if content.published_date
    ]

    rows.sort(
        key=lambda content: content.published_date
    )

    return {
        "labels": [
            content.published_date.date().isoformat()
            for content in rows
        ],
        "values": [
            engagement_rate(content)
            for content in rows
        ],
    }


def follower_chart(
    db: Session,
    creator_id: UUID | None = None,
):
    query = db.query(Growth)

    if creator_id:
        query = query.filter(
            Growth.creator_id == creator_id
        )

    rows = (
        query
        .order_by(Growth.date)
        .all()
    )

    return {
        "labels": [
            growth.date.isoformat()
            for growth in rows
        ],
        "values": [
            growth.followers
            for growth in rows
        ],
    }


def growth_report(
    db: Session,
    days: int = 30,
    creator_id: UUID | None = None,
):
    query = db.query(Growth)

    if creator_id:
        query = query.filter(
            Growth.creator_id == creator_id
        )

    rows = (
        query
        .order_by(Growth.date)
        .all()
    )

    if not rows:
        return {
            "days": days,
            "total_growth": 0,
            "average_growth": 0,
            "latest_followers": 0,
            "growth_records": 0,
        }

    follower_changes = []

    for index in range(1, len(rows)):
        previous = rows[index - 1].followers or 0
        current = rows[index].followers or 0
        follower_changes.append(current - previous)

    total_growth = (
        rows[-1].followers - rows[0].followers
        if len(rows) > 1
        else 0
    )

    average_growth = (
        round(
            sum(follower_changes) / len(follower_changes),
            2,
        )
        if follower_changes
        else 0
    )

    return {
        "days": days,
        "total_growth": total_growth,
        "average_growth": average_growth,
        "latest_followers": rows[-1].followers or 0,
        "growth_records": len(rows),
    }
def platform_comparison(db):
    rows = (
        db.query(
            Content.platform,
            func.count(Content.id).label("content_count"),
            func.coalesce(func.sum(Content.views), 0).label("views"),
            func.coalesce(func.sum(Content.likes), 0).label("likes"),
            func.coalesce(func.sum(Content.comments), 0).label("comments"),
            func.coalesce(func.sum(Content.shares), 0).label("shares"),
            func.coalesce(func.sum(Content.saves), 0).label("saves"),
            func.coalesce(func.sum(Content.reach), 0).label("reach"),
            func.coalesce(func.sum(Content.impressions), 0).label("impressions"),
        )
        .group_by(Content.platform)
        .order_by(Content.platform)
        .all()
    )

    result = []

    for row in rows:
        result.append({
            "platform": row.platform,
            "content_count": int(row.content_count or 0),
            "views": int(row.views or 0),
            "likes": int(row.likes or 0),
            "comments": int(row.comments or 0),
            "shares": int(row.shares or 0),
            "saves": int(row.saves or 0),
            "reach": int(row.reach or 0),
            "impressions": int(row.impressions or 0),
        })

    return result