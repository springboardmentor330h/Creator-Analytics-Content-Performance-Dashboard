from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.growth import Growth


# ============================================================
# ENGAGEMENT RATE
# ============================================================

def calculate_engagement_rate(content):

    total_engagement = (
        (content.likes or 0)
        + (content.comments or 0)
        + (content.shares or 0)
        + (content.saves or 0)
    )

    denominator = content.reach or 0

    if denominator <= 0:
        denominator = content.views or 0

    if denominator > 0:
        engagement_rate = (
            total_engagement / denominator
        ) * 100
    else:
        engagement_rate = 0

    return (
        total_engagement,
        round(engagement_rate, 2),
    )


# ============================================================
# CONTENT ENGAGEMENT
# ============================================================

def get_content_engagement(
    db: Session,
    content_id: int,
    creator_id: int | None = None,
):

    query = (
        db.query(Content)
        .filter(Content.id == content_id)
    )

    if creator_id is not None:
        query = query.filter(
            Content.creator_id == creator_id
        )

    content = query.first()

    if not content:
        return None

    total_engagement, engagement_rate = (
        calculate_engagement_rate(content)
    )

    return {
        "content_id": content.id,
        "creator_id": content.creator_id,
        "platform": content.platform,
        "views": content.views or 0,
        "reach": content.reach or 0,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate,
    }


# ============================================================
# TOP CONTENT
# ============================================================

def get_top_content(
    db: Session,
    limit: int = 5,
    creator_id: int | None = None,
):

    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(
            Content.creator_id == creator_id
        )

    contents = query.all()

    result = []

    for content in contents:

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        result.append({
            "content_id": content.id,
            "creator_id": content.creator_id,
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views or 0,
            "reach": content.reach or 0,
            "watch_time": content.watch_time or 0,
            "engagement_rate": engagement_rate,
        })

    result.sort(
        key=lambda x: x["engagement_rate"],
        reverse=True,
    )

    return result[:limit]


# ============================================================
# PLATFORM PERFORMANCE
# ============================================================

def get_platform_performance(
    db: Session,
    creator_id: int | None = None,
):

    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(
            Content.creator_id == creator_id
        )

    contents = query.all()

    platforms = {}

    for content in contents:

        platform = content.platform or "Unknown"

        if platform not in platforms:

            platforms[platform] = {
                "platform": platform,
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_shares": 0,
                "total_reach": 0,
                "engagement_rates": [],
            }

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        platforms[platform]["total_views"] += (
            content.views or 0
        )

        platforms[platform]["total_likes"] += (
            content.likes or 0
        )

        platforms[platform]["total_comments"] += (
            content.comments or 0
        )

        platforms[platform]["total_shares"] += (
            content.shares or 0
        )

        platforms[platform]["total_reach"] += (
            content.reach or 0
        )

        platforms[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for data in platforms.values():

        rates = data["engagement_rates"]

        average = (
            sum(rates) / len(rates)
            if rates
            else 0
        )

        result.append({
            "platform": data["platform"],
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_shares": data["total_shares"],
            "total_reach": data["total_reach"],
            "average_engagement_rate": round(
                average,
                2,
            ),
        })

    result.sort(
        key=lambda x: x["average_engagement_rate"],
        reverse=True,
    )

    return result


# ============================================================
# KPI SUMMARY
# ============================================================

def get_kpi_summary(
    db: Session,
    creator_id: int | None = None,
):

    content_query = db.query(Content)

    if creator_id is not None:
        content_query = content_query.filter(
            Content.creator_id == creator_id
        )

    contents = content_query.all()

    total_views = sum(
        content.views or 0
        for content in contents
    )

    total_likes = sum(
        content.likes or 0
        for content in contents
    )

    total_comments = sum(
        content.comments or 0
        for content in contents
    )

    total_shares = sum(
        content.shares or 0
        for content in contents
    )

    total_reach = sum(
        content.reach or 0
        for content in contents
    )

    engagement_rates = []

    for content in contents:

        _, rate = calculate_engagement_rate(
            content
        )

        engagement_rates.append(rate)

    average_engagement_rate = (
        round(
            sum(engagement_rates)
            / len(engagement_rates),
            2,
        )
        if engagement_rates
        else 0
    )

    # --------------------------------------------------------
    # FOLLOWERS
    # --------------------------------------------------------

    growth_query = db.query(Growth)

    if creator_id is not None:
        growth_query = growth_query.filter(
            Growth.creator_id == creator_id
        )

    latest_growth = (
        growth_query
        .order_by(
            Growth.date.desc(),
            Growth.id.desc(),
        )
        .first()
    )

    total_followers = (
        latest_growth.followers or 0
        if latest_growth
        else 0
    )

    # --------------------------------------------------------
    # TOTAL CONTENT
    # --------------------------------------------------------

    total_content = len(contents)

    # --------------------------------------------------------
    # BEST PLATFORM
    # --------------------------------------------------------

    platform_rates = {}

    for content in contents:

        platform = content.platform or "Unknown"

        _, rate = calculate_engagement_rate(
            content
        )

        platform_rates.setdefault(
            platform,
            [],
        ).append(rate)

    best_platform = None
    best_rate = -1

    for platform, rates in platform_rates.items():

        average = (
            sum(rates) / len(rates)
            if rates
            else 0
        )

        if average > best_rate:
            best_rate = average
            best_platform = platform

    # --------------------------------------------------------
    # TOP CONTENT
    # --------------------------------------------------------

    top_content_title = None
    top_rate = -1

    for content in contents:

        _, rate = calculate_engagement_rate(
            content
        )

        if rate > top_rate:
            top_rate = rate
            top_content_title = (
                content.content_title
            )

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": (
            average_engagement_rate
        ),
        "best_platform": best_platform,
        "top_content": top_content_title,
    }


# ============================================================
# ENGAGEMENT CHART
# ============================================================

def get_engagement_chart(
    db: Session,
    creator_id: int | None = None,
):

    query = db.query(Growth)

    if creator_id is not None:
        query = query.filter(
            Growth.creator_id == creator_id
        )

    growth_data = (
        query
        .order_by(
            Growth.date.asc(),
            Growth.id.asc(),
        )
        .all()
    )

    return {
        "labels": [
            row.date.isoformat()
            for row in growth_data
        ],
        "values": [
            round(
                row.engagement_rate or 0,
                2,
            )
            for row in growth_data
        ],
    }


# ============================================================
# FOLLOWER GROWTH CHART
# ============================================================

def get_follower_growth_chart(
    db: Session,
    creator_id: int | None = None,
):

    query = db.query(Growth)

    if creator_id is not None:
        query = query.filter(
            Growth.creator_id == creator_id
        )

    growth_data = (
        query
        .order_by(
            Growth.date.asc(),
            Growth.id.asc(),
        )
        .all()
    )

    return {
        "labels": [
            row.date.isoformat()
            for row in growth_data
        ],
        "values": [
            row.followers or 0
            for row in growth_data
        ],
    }


# ============================================================
# PLATFORM COMPARISON
# ============================================================

def get_platform_comparison(
    db: Session,
    creator_id: int | None = None,
):

    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(
            Content.creator_id == creator_id
        )

    contents = query.all()

    platform_data = {}

    for content in contents:

        platform = content.platform or "Unknown"

        if platform not in platform_data:

            platform_data[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "engagement_rates": [],
            }

        _, rate = calculate_engagement_rate(
            content
        )

        platform_data[platform]["views"] += (
            content.views or 0
        )

        platform_data[platform]["reach"] += (
            content.reach or 0
        )

        platform_data[platform]["likes"] += (
            content.likes or 0
        )

        platform_data[platform]["comments"] += (
            content.comments or 0
        )

        platform_data[platform]["shares"] += (
            content.shares or 0
        )

        platform_data[platform][
            "engagement_rates"
        ].append(rate)

    result = {}

    for platform, data in platform_data.items():

        rates = data["engagement_rates"]

        average = (
            sum(rates) / len(rates)
            if rates
            else 0
        )

        result[platform] = {
            "views": data["views"],
            "reach": data["reach"],
            "likes": data["likes"],
            "comments": data["comments"],
            "shares": data["shares"],
            "engagement_rate": round(
                average,
                2,
            ),
        }

    return result