from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.content import Content


def calculate_engagement_rate(content):
    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    if content.reach == 0:
        engagement_rate = 0
    else:
        engagement_rate = (total_engagement / content.reach) * 100

    return total_engagement, round(engagement_rate, 2)


def get_content_engagement(db: Session, content_id: int):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    total_engagement, engagement_rate = calculate_engagement_rate(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate
    }


def get_top_content(db: Session):
    contents = db.query(Content).all()

    analytics = []

    for content in contents:
        total_engagement, engagement_rate = calculate_engagement_rate(content)

        analytics.append({
            "content_id": content.id,
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": engagement_rate
        })

    analytics.sort(
        key=lambda x: x["engagement_rate"],
        reverse=True
    )

    return analytics[:5]


def get_platform_performance(db: Session):
    contents = db.query(Content).all()

    platform_data = {}

    for content in contents:
        total_engagement, engagement_rate = calculate_engagement_rate(content)

        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platform_data[platform]["total_views"] += content.views
        platform_data[platform]["total_likes"] += content.likes
        platform_data[platform]["total_comments"] += content.comments
        platform_data[platform]["total_reach"] += content.reach
        platform_data[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for platform, data in platform_data.items():

        average_engagement_rate = (
            sum(data["engagement_rates"])
            / len(data["engagement_rates"])
        )

        result.append({
            "platform": platform,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(
                average_engagement_rate, 2
            )
        })

    result.sort(
        key=lambda x: x["average_engagement_rate"],
        reverse=True
    )

    return result


def get_summary(db: Session):
    contents = db.query(Content).all()

    total_content = len(contents)

    total_views = sum(content.views for content in contents)
    total_reach = sum(content.reach for content in contents)

    engagement_rates = []

    for content in contents:
        _, engagement_rate = calculate_engagement_rate(content)
        engagement_rates.append(engagement_rate)

    if engagement_rates:
        average_engagement_rate = (
            sum(engagement_rates)
            / len(engagement_rates)
        )
    else:
        average_engagement_rate = 0

    platform_performance = get_platform_performance(db)

    if platform_performance:
        best_platform = platform_performance[0]["platform"]
    else:
        best_platform = None

    top_content = get_top_content(db)

    if top_content:
        top_content_title = top_content[0]["content_title"]
    else:
        top_content_title = None

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": round(
            average_engagement_rate, 2
        ),
        "best_platform": best_platform,
        "top_content": top_content_title
    }