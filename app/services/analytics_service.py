from sqlalchemy.orm import Session
from app.models.content import Content


def calculate_engagement_rate(content):
    """Engagement rate = (likes+comments+shares+saves) / reach * 100.

    `shares` and `reach` can be NULL when a platform doesn't report them.
    NULL values are treated as 0 for this calculation.
    """
    total_engagement = (
        content.likes
        + content.comments
        + (content.shares or 0)
        + content.saves
    )

    reach = content.reach or 0
    if reach == 0:
        return 0

    return round((total_engagement / reach) * 100, 2)


def get_content_engagement(db: Session, content_id: int):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        return None

    total_engagement = (
        content.likes
        + content.comments
        + (content.shares or 0)
        + content.saves
    )

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": calculate_engagement_rate(content),
    }


def get_top_content(
    db: Session,
    creator_id: int | None = None,
    platform: str | None = None,
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    if platform is not None:
        query = query.filter(Content.platform == platform)

    contents = query.all()

    result = [
        {
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": calculate_engagement_rate(content),
        }
        for content in contents
    ]

    result.sort(key=lambda x: x["engagement_rate"], reverse=True)

    return result[:5]


def get_platform_performance(
    db: Session,
    creator_id: int | None = None,
    platform: str | None = None,
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    if platform is not None:
        query = query.filter(Content.platform == platform)

    contents = query.all()

    platforms = {}

    for content in contents:
        platform_name = content.platform

        if platform_name not in platforms:
            platforms[platform_name] = {
                "platform": platform_name,
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": [],
            }

        platforms[platform_name]["total_views"] += content.views or 0
        platforms[platform_name]["total_likes"] += content.likes
        platforms[platform_name]["total_comments"] += content.comments
        platforms[platform_name]["total_reach"] += content.reach or 0

        platforms[platform_name]["engagement_rates"].append(
            calculate_engagement_rate(content)
        )

    result = []

    for platform_data in platforms.values():
        rates = platform_data["engagement_rates"]

        average_rate = (
            round(sum(rates) / len(rates), 2)
            if rates
            else 0
        )

        result.append({
            "platform": platform_data["platform"],
            "total_views": platform_data["total_views"],
            "total_likes": platform_data["total_likes"],
            "total_comments": platform_data["total_comments"],
            "total_reach": platform_data["total_reach"],
            "average_engagement_rate": average_rate,
        })

    return result


def get_dashboard_summary(
    db: Session,
    creator_id: int | None = None,
    platform: str | None = None,
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    if platform is not None:
        query = query.filter(Content.platform == platform)

    contents = query.all()

    total_content = len(contents)

    total_views = sum(
        content.views or 0
        for content in contents
    )

    total_reach = sum(
        content.reach or 0
        for content in contents
    )

    engagement_rates = [
        calculate_engagement_rate(content)
        for content in contents
    ]

    average_engagement_rate = (
        round(
            sum(engagement_rates) / len(engagement_rates),
            2,
        )
        if engagement_rates
        else 0
    )

    platform_data = get_platform_performance(
        db,
        creator_id,
        platform,
    )

    best_platform = (
        max(
            platform_data,
            key=lambda x: x["average_engagement_rate"],
        )["platform"]
        if platform_data
        else None
    )

    top_content = (
        max(
            contents,
            key=calculate_engagement_rate,
        ).content_title
        if contents
        else None
    )

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": average_engagement_rate,
        "best_platform": best_platform,
        "top_content": top_content,
    }