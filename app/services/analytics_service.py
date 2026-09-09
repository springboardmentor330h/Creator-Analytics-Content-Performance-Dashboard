from sqlalchemy.orm import Session
from datetime import date
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
    platform: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None
):
    query = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
    )

    # --------------------------------------------------
    # PLATFORM FILTER
    # --------------------------------------------------

    if platform and platform.lower() != "all":
        query = query.filter(
            Content.platform == platform
        )

    # --------------------------------------------------
    # DATE FILTER
    # --------------------------------------------------

    if start_date:
        query = query.filter(
            Content.published_date >= start_date
        )

    if end_date:
        query = query.filter(
            Content.published_date <= end_date
        )

    contents = query.all()

    print(
        "DEBUG:",
        platform,
        "records:",
        len(contents),
        "views:",
        sum(
            content.views or 0
            for content in contents
        )
    )

    # --------------------------------------------------
    # VIEWS
    # --------------------------------------------------

    view_values = [
        content.views
        for content in contents
        if content.views is not None
    ]

    total_views = (
        sum(view_values)
        if view_values
        else None
    )

    # --------------------------------------------------
    # LIKES
    # --------------------------------------------------

    like_values = [
        content.likes
        for content in contents
        if content.likes is not None
    ]

    total_likes = (
        sum(like_values)
        if like_values
        else None
    )

    # --------------------------------------------------
    # COMMENTS
    # --------------------------------------------------

    comment_values = [
        content.comments
        for content in contents
        if content.comments is not None
    ]

    total_comments = (
        sum(comment_values)
        if comment_values
        else None
    )

    # --------------------------------------------------
    # SHARES
    # --------------------------------------------------

    share_values = [
        content.shares
        for content in contents
        if content.shares is not None
    ]

    total_shares = (
        sum(share_values)
        if share_values
        else None
    )

    # --------------------------------------------------
    # REACH
    # --------------------------------------------------

    reach_values = []

    for content in contents:

        # 0 / NULL means reach is unavailable
        # for platform API data in this project.

        if (
            content.reach is not None
            and content.reach > 0
        ):
            reach_values.append(
                content.reach
            )

    total_reach = (
        sum(reach_values)
        if reach_values
        else None
    )

    # --------------------------------------------------
    # ENGAGEMENT RATE
    # --------------------------------------------------

    engagement_rates = []

    for content in contents:

        engagement_rate = calculate_engagement_rate(
            content
        )

        if engagement_rate is not None:
            engagement_rates.append(
                engagement_rate
            )

    average_engagement_rate = (
        sum(engagement_rates)
        / len(engagement_rates)
        if engagement_rates
        else None
    )

    # --------------------------------------------------
    # FOLLOWERS
    # --------------------------------------------------

    follower_query = (
        db.query(PlatformGrowth)
        .filter(
            PlatformGrowth.creator_id == creator_id
        )
    )

    # Platform filter
    if platform and platform.lower() != "all":
        follower_query = follower_query.filter(
            PlatformGrowth.platform.ilike(platform)
        )

    # Date filter
    if start_date:
        follower_query = follower_query.filter(
            PlatformGrowth.date >= start_date
        )

    if end_date:
        follower_query = follower_query.filter(
            PlatformGrowth.date <= end_date
        )

    growth_records = (
        follower_query
        .order_by(
            PlatformGrowth.date.asc()
        )
        .all()
    )

    # --------------------------------------------------
    # CURRENT FOLLOWERS
    # --------------------------------------------------

    if growth_records:

        # --------------------------------------------------
        # ALL PLATFORMS
        # --------------------------------------------------

        if not platform or platform.lower() == "all":

            latest_followers_by_platform = {}

            for record in growth_records:

                platform_name = (
                    record.platform.lower()
                )

                # Keep only the latest follower count
                # for each platform.
                latest_followers_by_platform[
                    platform_name
                ] = record.followers

            total_followers = sum(
                latest_followers_by_platform.values()
            )

        # --------------------------------------------------
        # SELECTED PLATFORM
        # --------------------------------------------------

        else:

            # Latest follower count for selected platform.
            total_followers = (
                growth_records[-1].followers
            )

    else:
        total_followers = None

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

        "average_engagement_rate": (
            round(
                average_engagement_rate,
                2
            )
            if average_engagement_rate is not None
            else None
        )
    }

#----------------------------------------------
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
    platform: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None
):
    # If a specific platform is selected,
    # use platform-specific follower snapshots
    if platform and platform.lower() != "all":

        query = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == creator_id,
                PlatformGrowth.platform.ilike(platform)
            )
        )

        # Date filter
        if start_date:
            query = query.filter(
                PlatformGrowth.date >= start_date
            )

        if end_date:
            query = query.filter(
                PlatformGrowth.date <= end_date
            )

        growth_data = (
            query
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

    # Otherwise use creator-level growth
    query = (
        db.query(Growth)
        .filter(
            Growth.creator_id == creator_id
        )
    )

    # Date filter
    if start_date:
        query = query.filter(
            Growth.date >= start_date
        )

    if end_date:
        query = query.filter(
            Growth.date <= end_date
        )

    growth_data = (
        query
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
    creator_id: int,
    start_date: date | None = None,
    end_date: date | None = None
):
    query = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.isnot(None)
        )
    )

    # Date filter
    if start_date:
        query = query.filter(
            Content.published_date >= start_date
        )

    if end_date:
        query = query.filter(
            Content.published_date <= end_date
        )

    contents = query.all()

    platform_data = {}

    for content in contents:

        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,

                "has_views_data": False,
                "has_reach_data": False,
                "has_likes_data": False,
                "has_comments_data": False,

                "engagement_rates": []
            }

        # --------------------------------------------------
        # VIEWS
        # --------------------------------------------------

        if content.views is not None:
            platform_data[platform]["views"] += content.views
            platform_data[platform]["has_views_data"] = True

        # --------------------------------------------------
        # LIKES
        # --------------------------------------------------

        if content.likes is not None:
            platform_data[platform]["likes"] += content.likes
            platform_data[platform]["has_likes_data"] = True

        # --------------------------------------------------
        # COMMENTS
        # --------------------------------------------------

        if content.comments is not None:
            platform_data[platform]["comments"] += content.comments
            platform_data[platform]["has_comments_data"] = True

        # --------------------------------------------------
        # REACH
        # --------------------------------------------------

        if content.reach is not None:
            platform_data[platform]["reach"] += content.reach
            platform_data[platform]["has_reach_data"] = True

        # --------------------------------------------------
        # ENGAGEMENT RATE
        # --------------------------------------------------

        engagement_rate = calculate_engagement_rate(content)

        if engagement_rate is not None:
            platform_data[platform]["engagement_rates"].append(
                engagement_rate
            )

    result = []

    # --------------------------------------------------
    # BUILD PLATFORM COMPARISON RESULT
    # --------------------------------------------------

    for platform, data in platform_data.items():

        # --------------------------------------------------
        # AVERAGE ENGAGEMENT RATE
        # --------------------------------------------------

        if data["engagement_rates"]:
            average_engagement_rate = (
                sum(data["engagement_rates"])
                / len(data["engagement_rates"])
            )
        else:
            average_engagement_rate = None

        # --------------------------------------------------
        # PLATFORM GROWTH
        # --------------------------------------------------

        growth_query = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == creator_id,
                PlatformGrowth.platform.ilike(platform)
            )
        )

        # Date filter
        if start_date:
            growth_query = growth_query.filter(
                PlatformGrowth.date >= start_date
            )

        if end_date:
            growth_query = growth_query.filter(
                PlatformGrowth.date <= end_date
            )

        growth_records = (
            growth_query
            .order_by(
                PlatformGrowth.date.asc()
            )
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
            platform_growth = None

        # --------------------------------------------------
        # ADD PLATFORM RESULT
        # --------------------------------------------------

        result.append(
            {
                "platform": platform,

                # Unavailable views -> None -> N/A
                "views": (
                    data["views"]
                    if data["has_views_data"]
                    else None
                ),

                # Unavailable likes -> None -> N/A
                "likes": (
                    data["likes"]
                    if data["has_likes_data"]
                    else None
                ),

                # Unavailable comments -> None -> N/A
                "comments": (
                    data["comments"]
                    if data["has_comments_data"]
                    else None
                ),

                # Unavailable reach -> None -> N/A
                "reach": (
                    data["reach"]
                    if data["has_reach_data"]
                    else None
                ),

                # Unavailable engagement -> None -> N/A
                "engagement_rate": (
                    round(
                        average_engagement_rate,
                        2
                    )
                    if average_engagement_rate is not None
                    else None
                ),

                # Insufficient growth data -> None -> N/A
                "growth": platform_growth
            }
        )

    return result