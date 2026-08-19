from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth
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
def get_top_content(db: Session):
    contents = db.query(Content).all()

    results = []

    for content in contents:
        total_engagement, engagement_rate = calculate_engagement_rate(content)

        results.append({
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": engagement_rate
        })

    results.sort(
        key=lambda x: x["engagement_rate"],
        reverse=True
    )

    return results[:5]
def get_platform_performance(db: Session):
    contents = db.query(Content).all()

    platforms = {}

    for content in contents:
        total_engagement, engagement_rate = calculate_engagement_rate(content)

        if content.platform not in platforms:
            platforms[content.platform] = {
                "platform": content.platform,
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platforms[content.platform]["total_views"] += content.views
        platforms[content.platform]["total_likes"] += content.likes
        platforms[content.platform]["total_comments"] += content.comments
        platforms[content.platform]["total_reach"] += content.reach
        platforms[content.platform]["engagement_rates"].append(
            engagement_rate
        )

    results = []

    for platform_data in platforms.values():
        rates = platform_data["engagement_rates"]

        average_engagement_rate = (
            sum(rates) / len(rates)
            if rates else 0
        )

        results.append({
            "platform": platform_data["platform"],
            "total_views": platform_data["total_views"],
            "total_likes": platform_data["total_likes"],
            "total_comments": platform_data["total_comments"],
            "total_reach": platform_data["total_reach"],
            "average_engagement_rate": round(
                average_engagement_rate, 2
            )
        })

    return results
def get_dashboard_summary(db: Session):
    contents = db.query(Content).all()

    if not contents:
        return {
            "total_content": 0,
            "total_views": 0,
            "total_reach": 0,
            "average_engagement_rate": 0,
            "best_platform": None,
            "top_content": None
        }

    total_content = len(contents)
    total_views = sum(content.views for content in contents)
    total_reach = sum(content.reach for content in contents)

    engagement_rates = []

    for content in contents:
        _, engagement_rate = calculate_engagement_rate(content)
        engagement_rates.append(engagement_rate)

    average_engagement_rate = (
        sum(engagement_rates) / len(engagement_rates)
    )

    platform_performance = get_platform_performance(db)

    best_platform_data = max(
        platform_performance,
        key=lambda x: x["average_engagement_rate"]
    )

    top_content_data = max(
        contents,
        key=lambda content: calculate_engagement_rate(content)[1]
    )

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": round(
            average_engagement_rate, 2
        ),
        "best_platform": best_platform_data["platform"],
        "top_content": top_content_data.content_title
    }
def get_kpi_summary(db: Session):
    contents = db.query(Content).all()
    audience_data = db.query(Audience).all()

    total_views = sum(content.views for content in contents)
    total_likes = sum(content.likes for content in contents)
    total_comments = sum(content.comments for content in contents)
    total_shares = sum(content.shares for content in contents)
    total_reach = sum(content.reach for content in contents)

    total_followers = sum(
        audience.followers for audience in audience_data
    )

    engagement_rates = []

    for content in contents:
        _, engagement_rate = calculate_engagement_rate(content)
        engagement_rates.append(engagement_rate)

    average_engagement_rate = (
        sum(engagement_rates) / len(engagement_rates)
        if engagement_rates else 0
    )

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": round(
            average_engagement_rate, 2
        )
    }
def get_engagement_chart(db: Session):
    contents = db.query(Content).order_by(Content.published_date.asc()).all()

    labels = []
    values = []

    for content in contents:
        _, engagement_rate = calculate_engagement_rate(content)

        labels.append(str(content.published_date))
        values.append(engagement_rate)

    return {
        "labels": labels,
        "values": values
    }
def get_follower_chart(db: Session):
    growth_data = db.query(Growth).order_by(Growth.date.asc()).all()

    labels = []
    values = []

    for record in growth_data:
        labels.append(str(record.date))
        values.append(record.followers)

    return {
        "labels": labels,
        "values": values
    }
def get_platform_comparison(db: Session):
    return get_platform_performance(db)