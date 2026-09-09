from sqlalchemy.orm import Session
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth


def calculate_engagement(content: Content):
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

    return total_engagement, round(engagement_rate, 2)


def get_content_engagement(
    db: Session,
    content_id: int,
    creator_id: int | None = None,
):
    query = db.query(Content).filter(Content.id == content_id)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    content = query.first()

    if not content:
        return None

    total_engagement, engagement_rate = calculate_engagement(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate,
    }


def get_top_content(
    db: Session,
    limit: int = 5,
    creator_id: int | None = None,
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    contents = query.all()

    results = []

    for content in contents:
        _, engagement_rate = calculate_engagement(content)

        results.append({
            "content_title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": engagement_rate,
        })

    results.sort(
        key=lambda item: item["engagement_rate"],
        reverse=True,
    )

    return results[:limit]

#
def get_platform_performance(
    db: Session,
    creator_id: int | None = None,
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(Content.creator_id == creator_id)

    contents = query.all()

    platform_data = {}

    for content in contents:
        _, engagement_rate = calculate_engagement(content)

        if content.platform not in platform_data:
            platform_data[content.platform] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "engagement_rates": [],
            }

        platform_data[content.platform]["total_views"] += content.views
        platform_data[content.platform]["total_likes"] += content.likes
        platform_data[content.platform]["total_comments"] += content.comments
        platform_data[content.platform]["total_reach"] += content.reach
        platform_data[content.platform]["engagement_rates"].append(
            engagement_rate
        )

    results = []

    for platform, data in platform_data.items():
        rates = data["engagement_rates"]

        average_engagement_rate = (
            sum(rates) / len(rates)
            if rates
            else 0
        )

        results.append({
            "platform": platform,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(
                average_engagement_rate,
                2,
            ),
        })

    # Best-performing platform first
    results.sort(
        key=lambda item: item["average_engagement_rate"],
        reverse=True,
    )

    return results
#
def get_platform_comparison(
    db: Session,
    creator_id: int | None = None,
):
    platform_results = get_platform_performance(
        db,
        creator_id,
    )

    platform_results.sort(
        key=lambda item: item["total_views"],
        reverse=True,
    )

    return {
        item["platform"]: {
            "views": item["total_views"],
            "reach": item["total_reach"],
            "engagement_rate": item["average_engagement_rate"],
            "likes": item["total_likes"],
            "comments": item["total_comments"],
        }
        for item in platform_results
    }


def get_dashboard_summary(
    db: Session,
    creator_id: int | None = None,
):
    content_query = db.query(Content)
    audience_query = db.query(Audience)

    if creator_id is not None:
        content_query = content_query.filter(Content.creator_id == creator_id)
        audience_query = audience_query.filter(Audience.creator_id == creator_id)

    contents = content_query.all()
    audiences = audience_query.all()

    total_content = len(contents)

    total_views = sum(
        content.views
        for content in contents
    )

    total_likes = sum(
        content.likes
        for content in contents
    )

    total_comments = sum(
        content.comments
        for content in contents
    )

    total_shares = sum(
        content.shares
        for content in contents
    )

    total_reach = sum(
        content.reach
        for content in contents
    )

    total_followers = sum(
        audience.followers
        for audience in audiences
    )

    engagement_rates = []

    for content in contents:
        _, engagement_rate = calculate_engagement(content)
        engagement_rates.append(engagement_rate)

    average_engagement_rate = (
        sum(engagement_rates) / len(engagement_rates)
        if engagement_rates
        else 0
    )

    platform_results = get_platform_performance(db, creator_id)

    best_platform = None

    if platform_results:
        best_platform = platform_results[0]["platform"]

    top_content_results = get_top_content(
        db,
        limit=1,
        creator_id=creator_id,
    )

    top_content = None

    if top_content_results:
        top_content = top_content_results[0]["content_title"]

    return {
        # Sprint 2 fields
        "total_content": total_content,
        "total_views": total_views,
        "total_reach": total_reach,
        "average_engagement_rate": round(
            average_engagement_rate,
            2,
        ),
        "best_platform": best_platform,
        "top_content": top_content,

        # Sprint 4 KPI fields
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_followers": total_followers,
    }

def get_engagement_chart(
    db: Session,
    creator_id: int | None = None,
):
    query = db.query(Growth)

    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)

    growth_records = query.order_by(Growth.date.asc()).all()

    return {
        "labels": [
            record.date.isoformat()
            for record in growth_records
        ],
        "values": [
            record.engagement_rate
            for record in growth_records
        ],
    }

def get_followers_chart(
    db: Session,
    creator_id: int | None = None,
):
    query = db.query(Growth)

    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)

    growth_records = query.order_by(Growth.date.asc()).all()

    return {
        "labels": [
            record.date.isoformat()
            for record in growth_records
        ],
        "values": [
            record.followers
            for record in growth_records
        ],
    }