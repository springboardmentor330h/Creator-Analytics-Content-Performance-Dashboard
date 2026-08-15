from sqlalchemy.orm import Session
from app.models.content import Content


def calculate_engagement_rate(content):
    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    if content.reach == 0:
        return 0

    return round(
        (total_engagement / content.reach) * 100,
        2
    )


def get_content_engagement(db: Session, content_id: int):

    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": calculate_engagement_rate(content)
    }


def get_top_content(db: Session):

    contents = db.query(Content).all()

    result = []

    for content in contents:

        result.append({
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": calculate_engagement_rate(content)
        })

    result.sort(
        key=lambda x: x["engagement_rate"],
        reverse=True
    )

    return result[:5]


def get_platform_performance(db: Session):

    contents = db.query(Content).all()

    platforms = {}

    for content in contents:

        platform = content.platform

        if platform not in platforms:
            platforms[platform] = {
                "platform": platform,
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platforms[platform]["total_views"] += content.views
        platforms[platform]["total_likes"] += content.likes
        platforms[platform]["total_comments"] += content.comments
        platforms[platform]["total_reach"] += content.reach

        platforms[platform]["engagement_rates"].append(
            calculate_engagement_rate(content)
        )

    result = []

    for platform_data in platforms.values():

        rates = platform_data["engagement_rates"]

        average_rate = 0

        if rates:
            average_rate = round(
                sum(rates) / len(rates),
                2
            )

        result.append({
            "platform": platform_data["platform"],
            "total_views": platform_data["total_views"],
            "total_likes": platform_data["total_likes"],
            "total_comments": platform_data["total_comments"],
            "total_reach": platform_data["total_reach"],
            "average_engagement_rate": average_rate
        })

    return result


def get_dashboard_summary(db: Session):

    contents = db.query(Content).all()

    total_content = len(contents)

    total_views = sum(
        content.views for content in contents
    )

    total_reach = sum(
        content.reach for content in contents
    )

    engagement_rates = [
        calculate_engagement_rate(content)
        for content in contents
    ]

    average_engagement_rate = 0

    if engagement_rates:
        average_engagement_rate = round(
            sum(engagement_rates) / len(engagement_rates),
            2
        )

    platform_data = get_platform_performance(db)

    best_platform = None

    if platform_data:
        best_platform = max(
            platform_data,
            key=lambda x: x["average_engagement_rate"]
        )["platform"]

    top_content = None

    if contents:
        best_content = max(
            contents,
            key=calculate_engagement_rate
        )

        top_content = best_content.content_title

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": average_engagement_rate,
        "best_platform": best_platform,
        "top_content": top_content
    }