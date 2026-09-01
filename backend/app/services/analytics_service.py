from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth

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

    if content.reach > 0:
        engagement_rate = (
            total_engagement / content.reach
        ) * 100
    else:
        engagement_rate = 0

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2)
    }


def get_top_content(db: Session):
    contents = db.query(Content).all()

    result = []

    for content in contents:

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        result.append({
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": round(engagement_rate, 2)
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

        if content.platform not in platforms:
            platforms[content.platform] = {
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

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        platforms[content.platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for platform, data in platforms.items():

        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = 0

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

    return result


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

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        engagement_rates.append(engagement_rate)

    average_engagement_rate = (
        sum(engagement_rates)
        / len(engagement_rates)
    )

    platform_performance = get_platform_performance(db)

    best_platform = None

    if platform_performance:
        best_platform_data = max(
            platform_performance,
            key=lambda x: x["average_engagement_rate"]
        )
        best_platform = best_platform_data["platform"]

    top_content = get_top_content(db)

    top_content_title = None

    if top_content:
        top_content_title = top_content[0]["content_title"]

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
def get_kpi_summary(db: Session):
    contents = db.query(Content).all()
    audiences = db.query(Audience).all()

    total_views = sum(content.views for content in contents)
    total_likes = sum(content.likes for content in contents)
    total_comments = sum(content.comments for content in contents)
    total_shares = sum(content.shares for content in contents)
    total_reach = sum(content.reach for content in contents)

    total_followers = sum(
        audience.followers
        for audience in audiences
    )

    engagement_rates = []

    for content in contents:
        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        engagement_rates.append(engagement_rate)

    if engagement_rates:
        average_engagement_rate = (
            sum(engagement_rates)
            / len(engagement_rates)
        )
    else:
        average_engagement_rate = 0

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
    growth_data = (
        db.query(Growth)
        .order_by(Growth.date)
        .all()
    )

    labels = []
    values = []

    for data in growth_data:
        labels.append(str(data.date))
        values.append(data.engagement_rate)

    return {
        "labels": labels,
        "values": values
    }
def get_follower_growth_chart(db: Session):
    growth_data = (
        db.query(Growth)
        .order_by(Growth.date)
        .all()
    )

    labels = []
    values = []

    for data in growth_data:
        labels.append(str(data.date))
        values.append(data.followers)

    return {
        "labels": labels,
        "values": values
    }
def get_platform_comparison(db: Session):
    contents = db.query(Content).all()

    platforms = {}

    for content in contents:
        platform = content.platform

        if platform not in platforms:
            platforms[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "engagement_rates": []
            }

        platforms[platform]["views"] += content.views
        platforms[platform]["reach"] += content.reach
        platforms[platform]["likes"] += content.likes
        platforms[platform]["comments"] += content.comments

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        platforms[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = {}

    for platform, data in platforms.items():

        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = 0

        result[platform] = {
            "views": data["views"],
            "reach": data["reach"],
            "engagement_rate": round(
                average_engagement_rate, 2
            ),
            "likes": data["likes"],
            "comments": data["comments"]
        }

    return result
def get_engagement_chart(db: Session):
    contents = (
        db.query(Content)
        .order_by(Content.published_date)
        .all()
    )

    labels = []
    values = []

    for content in contents:
        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        labels.append(str(content.published_date))
        values.append(round(engagement_rate, 2))

    return {
        "labels": labels,
        "values": values
    }
def get_follower_growth_chart(db: Session):
    growth_data = (
        db.query(Growth)
        .order_by(Growth.date)
        .all()
    )

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
    contents = db.query(Content).all()

    platforms = {}

    for content in contents:

        platform = content.platform

        if platform not in platforms:
            platforms[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "engagement_rates": []
            }

        platforms[platform]["views"] += content.views
        platforms[platform]["reach"] += content.reach
        platforms[platform]["likes"] += content.likes
        platforms[platform]["comments"] += content.comments

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if content.reach > 0:
            engagement_rate = (
                total_engagement / content.reach
            ) * 100
        else:
            engagement_rate = 0

        platforms[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = {}

    for platform, data in platforms.items():

        rates = data["engagement_rates"]

        if rates:
            average_engagement_rate = sum(rates) / len(rates)
        else:
            average_engagement_rate = 0

        result[platform] = {
            "views": data["views"],
            "reach": data["reach"],
            "likes": data["likes"],
            "comments": data["comments"],
            "engagement_rate": round(
                average_engagement_rate, 2
            )
        }

    return result