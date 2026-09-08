from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.growth import Growth
from app.models.platform_growth import PlatformGrowth

def calculate_engagement_rate(content):
    """
    Calculate engagement rate using the best
    available metric.

    Priority:
    1. Reach
    2. Views
    """

    total_engagement = (
        (content.likes or 0)
        + (content.comments or 0)
        + (content.shares or 0)
        + (content.saves or 0)
    )

    if content.reach is not None and content.reach > 0:
        denominator = content.reach

    elif content.views is not None and content.views > 0:
        denominator = content.views

    else:
        return 0.0

    return round(
        (total_engagement / denominator) * 100,
        2
    )


# --------------------------------------------------
# CONTENT ENGAGEMENT
# --------------------------------------------------
def get_engagement_data(
    db: Session,
    content_id: int,
    creator_id: int
):
    content = (
        db.query(Content)
        .filter(
            Content.id == content_id,
            Content.creator_id == creator_id
        )
        .first()
    )

    if not content:
        return None

    total_engagement = (
        (content.likes or 0)
        + (content.comments or 0)
        + (content.shares or 0)
        + (content.saves or 0)
    )

    engagement_rate = calculate_engagement_rate(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views or 0,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate
    }
# --------------------------------------------------
# CONTENT COMPARISON
# --------------------------------------------------

def compare_content(
    db: Session,
    content_ids: list[int],
    creator_id: int
):
    contents = (
        db.query(Content)
        .filter(
            Content.id.in_(content_ids),
            Content.creator_id == creator_id
        )
        .all()
    )

    comparison_data = []

    for content in contents:
        comparison_data.append({
            "content_id": content.id,
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "watch_time": content.watch_time,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        })

    return comparison_data


# --------------------------------------------------
# TOP PERFORMING CONTENT
# --------------------------------------------------

def get_top_performing_content(
    db: Session,
    creator_id: int,
    limit: int = 5
):
    contents = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
        .all()
    )

    results = []

    for content in contents:

        engagement_rate = calculate_engagement_rate(
            content
        )

        results.append({
            "content_id": content.id,
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes or 0,
            "comments": content.comments or 0,
            "shares": content.shares or 0,
            "saves": content.saves or 0,
            "reach": content.reach,
            "engagement_rate": engagement_rate
        })

    results.sort(
        key=lambda item: item["engagement_rate"],
        reverse=True
    )

    return results[:limit]
# --------------------------------------------------
# REACH ANALYSIS
# --------------------------------------------------

def get_reach_analysis(
    db: Session,
    creator_id: int,
    limit: int = 5
):
    contents = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
        .order_by(Content.reach.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "content_id": content.id,
            "title": content.content_title,
            "platform": content.platform,
            "reach": content.reach
        }
        for content in contents
    ]
# --------------------------------------------------
# PERFORMANCE TRENDS
# --------------------------------------------------

def get_performance_trends(
    db: Session,
    creator_id: int,
    limit: int = 10
):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.id.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "content_id": content.id,
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        }
        for content in contents
    ]


# --------------------------------------------------
# TOP CONTENT
# --------------------------------------------------

def get_top_content(
    db: Session,
    creator_id: int,
    limit: int = 5
):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.engagement_rate.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": content.engagement_rate
        }
        for content in contents
    ]


# --------------------------------------------------
# PLATFORM PERFORMANCE
# --------------------------------------------------

def get_platform_performance(
    db: Session,
    creator_id: int
):
    contents = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
        .all()
    )

    platform_data = {}

    for content in contents:

        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_reach": 0,
                "has_reach_data": False,
                "engagement_rates": []
            }

        platform_data[platform]["total_views"] += (
            content.views or 0
        )

        platform_data[platform]["total_likes"] += (
            content.likes or 0
        )

        platform_data[platform]["total_comments"] += (
            content.comments or 0
        )

        if content.reach is not None:
            platform_data[platform]["total_reach"] += (
                content.reach
            )

            platform_data[platform]["has_reach_data"] = True

        engagement_rate = calculate_engagement_rate(
            content
        )

        platform_data[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for platform, data in platform_data.items():

        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = 0.0

        result.append({
            "platform": platform,
            "total_views": data["total_views"],
            "total_likes": data["total_likes"],
            "total_comments": data["total_comments"],
            "total_reach": (
                data["total_reach"]
                if data["has_reach_data"]
                else None
            ),
            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        })

    return result

# --------------------------------------------------
# DASHBOARD SUMMARY
# --------------------------------------------------

def get_dashboard_summary(
    db: Session,
    creator_id: int,
    platform: str | None = None
):
    query = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
    )

    # "all" means all available platform data
    if platform and platform.lower() != "all":
        query = query.filter(
            Content.platform == platform
        )

    contents = query.all()

    print(
        "DEBUG:",
        platform,
        "records:",
        len(contents),
        "views:",
        sum(content.views or 0 for content in contents)
    )

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

    # --------------------------------------------------
    # TOTAL REACH
    # --------------------------------------------------

    reach_values = [
        content.reach
        for content in contents
        if content.reach is not None
    ]

    total_reach = (
        sum(reach_values)
        if reach_values
        else None
    )

    # --------------------------------------------------
    # ENGAGEMENT RATE
    # --------------------------------------------------

    if contents:

        engagement_rates = []

        for content in contents:

            engagement_rate = calculate_engagement_rate(
                content
            )

            if engagement_rate > 0:
                engagement_rates.append(
                    engagement_rate
                )

        average_engagement_rate = (
            sum(engagement_rates)
            / len(engagement_rates)
            if engagement_rates
            else 0
        )

    else:
        average_engagement_rate = 0

    # --------------------------------------------------
    # LATEST FOLLOWER COUNT
    # --------------------------------------------------

    latest_growth = (
        db.query(Growth)
        .filter(
            Growth.creator_id == creator_id
        )
        .order_by(
            Growth.date.desc(),
            Growth.id.desc()
        )
        .first()
    )

    total_followers = (
        latest_growth.followers
        if latest_growth
        else 0
    )

    # --------------------------------------------------
    # FINAL SUMMARY
    # --------------------------------------------------

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": round(
            average_engagement_rate,
            2
        )
    }
# --------------------------------------------------
# ENGAGEMENT CHART
# --------------------------------------------------

def get_engagement_chart(
    db: Session,
    creator_id: int
):
    growth_data = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .all()
    )

    return {
        "labels": [
            row.date.isoformat()
            for row in growth_data
        ],
        "values": [
            round(row.engagement_rate, 2)
            for row in growth_data
        ]
    }

# --------------------------------------------------
# FOLLOWER CHART
# --------------------------------------------------

def get_follower_chart(
    db: Session,
    creator_id: int,
    platform: str | None = None
):
    # If a specific platform is selected,
    # use platform-specific follower snapshots
    if platform and platform.lower() != "all":

        growth_data = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == creator_id,
                PlatformGrowth.platform.ilike(platform)
            )
            .order_by(PlatformGrowth.date.asc())
            .all()
        )

        return {
            "labels": [
                row.date.isoformat()
                for row in growth_data
            ],
            "values": [
                row.followers
                for row in growth_data
            ]
        }

    # Otherwise keep the existing creator-level growth
    growth_data = (
        db.query(Growth)
        .filter(
            Growth.creator_id == creator_id
        )
        .order_by(Growth.date.asc())
        .all()
    )

    return {
        "labels": [
            row.date.isoformat()
            for row in growth_data
        ],
        "values": [
            row.followers
            for row in growth_data
        ]
    }

# --------------------------------------------------
# PLATFORM COMPARISON
# --------------------------------------------------

def get_platform_comparison(
    db: Session,
    creator_id: int
):
    contents = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
        .all()
    )

    platform_data = {}

    for content in contents:

        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "has_reach_data": False,
                "engagement_rates": []
            }

        platform_data[platform]["views"] += (
            content.views or 0
        )

        platform_data[platform]["likes"] += (
            content.likes or 0
        )

        platform_data[platform]["comments"] += (
            content.comments or 0
        )

        if content.reach is not None:
            platform_data[platform]["reach"] += (
                content.reach
            )

            platform_data[platform]["has_reach_data"] = True

        engagement_rate = calculate_engagement_rate(
            content
        )

        platform_data[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for platform, data in platform_data.items():

        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = 0.0

        # ------------------------------------------
        # PLATFORM-SPECIFIC FOLLOWER GROWTH
        # ------------------------------------------

        growth_records = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == creator_id,
                PlatformGrowth.platform == platform
            )
            .order_by(PlatformGrowth.date.asc())
            .all()
        )

        if len(growth_records) >= 2:
            earliest_followers = growth_records[0].followers
            latest_followers = growth_records[-1].followers

            platform_growth = (
                latest_followers - earliest_followers
            )
        else:
            # Not enough historical data
            # to calculate real growth
            platform_growth = 0

        result.append({
            "platform": platform,
            "views": data["views"],
            "reach": (
                data["reach"]
                if data["has_reach_data"]
                else 0
            ),
            "engagement_rate": round(
                average_engagement_rate,
                2
            ),
            "likes": data["likes"],
            "comments": data["comments"],
            "growth": platform_growth
        })

    return result

