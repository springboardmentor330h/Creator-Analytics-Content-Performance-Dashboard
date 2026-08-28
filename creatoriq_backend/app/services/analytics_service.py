from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.growth import Growth


# ============================================================
# CALCULATE ENGAGEMENT RATE
# ============================================================

def calculate_engagement_rate(content):

    total_engagement = (
        (content.likes or 0)
        + (content.comments or 0)
        + (content.shares or 0)
        + (content.saves or 0)
    )

    # Prefer reach. If reach is missing (common for YouTube
    # public Data API), fall back to views so engagement
    # is still meaningful instead of always 0.
    denominator = content.reach or 0
    if denominator <= 0:
        denominator = content.views or 0

    if denominator > 0:
        engagement_rate = (total_engagement / denominator) * 100
    else:
        engagement_rate = 0

    return total_engagement, round(
        engagement_rate,
        2
    )


# ============================================================
# SPRINT 2
# CONTENT ENGAGEMENT
# GET /analytics/content/{content_id}/engagement
# ============================================================

def get_content_engagement(
    db: Session,
    content_id: int
):

    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:

        return None

    total_engagement, engagement_rate = (
        calculate_engagement_rate(content)
    )

    return {

        "content_id": content.id,

        "platform": content.platform,

        "views": content.views or 0,

        "reach": content.reach or 0,

        "total_engagement": total_engagement,

        "engagement_rate": engagement_rate
    }


# ============================================================
# SPRINT 2
# TOP PERFORMING CONTENT
# GET /analytics/top-content
# ============================================================

def get_top_content(
    db: Session,
    limit: int = 5
):

    contents = db.query(Content).all()

    result = []

    for content in contents:

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        result.append({

            "content_id": content.id,

            "title": content.content_title,

            "platform": content.platform,

            "views": content.views or 0,

            "reach": content.reach or 0,

            "watch_time": content.watch_time or 0,

            "engagement_rate": engagement_rate
        })

    result.sort(

        key=lambda x: x["engagement_rate"],

        reverse=True
    )

    return result[:limit]


# ============================================================
# SPRINT 2
# PLATFORM PERFORMANCE
# GET /analytics/platform-performance
# ============================================================

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

        platforms[platform]["total_reach"] += (
            content.reach or 0
        )

        platforms[platform]["engagement_rates"].append(
            engagement_rate
        )

    result = []

    for platform_data in platforms.values():

        rates = (
            platform_data["engagement_rates"]
        )

        average_engagement_rate = (

            sum(rates) / len(rates)

            if rates

            else 0
        )

        result.append({

            "platform": (
                platform_data["platform"]
            ),

            "total_views": (
                platform_data["total_views"]
            ),

            "total_likes": (
                platform_data["total_likes"]
            ),

            "total_comments": (
                platform_data["total_comments"]
            ),

            "total_reach": (
                platform_data["total_reach"]
            ),

            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        })

    result.sort(

        key=lambda x: (
            x["average_engagement_rate"]
        ),

        reverse=True
    )

    return result


# ============================================================
# SPRINT 4
# KPI SUMMARY
# GET /analytics/summary
# ============================================================

def get_kpi_summary(db: Session):

    contents = db.query(Content).all()

    # --------------------------------------------------------
    # TOTAL VIEWS
    # --------------------------------------------------------

    total_views = sum(

        content.views or 0

        for content in contents
    )

    # --------------------------------------------------------
    # TOTAL LIKES
    # --------------------------------------------------------

    total_likes = sum(

        content.likes or 0

        for content in contents
    )

    # --------------------------------------------------------
    # TOTAL COMMENTS
    # --------------------------------------------------------

    total_comments = sum(

        content.comments or 0

        for content in contents
    )

    # --------------------------------------------------------
    # TOTAL SHARES
    # --------------------------------------------------------

    total_shares = sum(

        content.shares or 0

        for content in contents
    )

    # --------------------------------------------------------
    # TOTAL REACH
    # --------------------------------------------------------

    total_reach = sum(

        content.reach or 0

        for content in contents
    )

    # --------------------------------------------------------
    # AVERAGE ENGAGEMENT RATE
    # --------------------------------------------------------

    engagement_rates = []

    for content in contents:

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        engagement_rates.append(
            engagement_rate
        )

    if engagement_rates:

        average_engagement_rate = round(

            sum(engagement_rates)
            / len(engagement_rates),

            2
        )

    else:

        average_engagement_rate = 0

    # --------------------------------------------------------
    # CURRENT FOLLOWERS
    #
    # Get the latest record from Growth table.
    # We do NOT sum followers because Growth contains
    # historical daily follower counts.
    # --------------------------------------------------------

    latest_growth = (

        db.query(Growth)

        .order_by(
            Growth.date.desc(),
            Growth.id.desc()
        )

        .first()
    )

    if latest_growth:

        total_followers = (
            latest_growth.followers or 0
        )

    else:

        total_followers = 0

    # --------------------------------------------------------
    # TOTAL CONTENT + BEST PLATFORM + TOP CONTENT
    # (Sprint 2 summary fields, kept alongside Sprint 4 KPIs)
    # --------------------------------------------------------

    total_content = len(contents)

    # Best platform by average engagement rate
    platform_rates = {}
    for content in contents:
        platform = content.platform or "Unknown"
        _, rate = calculate_engagement_rate(content)
        platform_rates.setdefault(platform, []).append(rate)

    best_platform = None
    best_rate = -1
    for platform, rates in platform_rates.items():
        avg = sum(rates) / len(rates) if rates else 0
        if avg > best_rate:
            best_rate = avg
            best_platform = platform

    # Top performing content title by engagement rate
    top_content_title = None
    top_rate = -1
    for content in contents:
        _, rate = calculate_engagement_rate(content)
        if rate > top_rate:
            top_rate = rate
            top_content_title = content.content_title

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {
        "total_content": total_content,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": total_followers,
        "average_engagement_rate": average_engagement_rate,
        "best_platform": best_platform,
        "top_content": top_content_title,
    }


# ============================================================
# SPRINT 4
# ENGAGEMENT CHART
# GET /analytics/chart/engagement
# ============================================================

def get_engagement_chart(db: Session):

    growth_data = (

        db.query(Growth)

        .order_by(
            Growth.date.asc(),
            Growth.id.asc()
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
                2
            )

            for row in growth_data
        ]
    }


# ============================================================
# SPRINT 4
# FOLLOWER GROWTH CHART
# GET /analytics/chart/followers
# ============================================================

def get_follower_growth_chart(db: Session):

    growth_data = (

        db.query(Growth)

        .order_by(
            Growth.date.asc(),
            Growth.id.asc()
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
        ]
    }


# ============================================================
# SPRINT 4
# PLATFORM COMPARISON
# GET /analytics/platform-comparison
# ============================================================

def get_platform_comparison(db: Session):

    contents = db.query(Content).all()

    platform_data = {}

    for content in contents:

        platform = content.platform

        if platform not in platform_data:

            platform_data[platform] = {

                "views": 0,

                "reach": 0,

                "likes": 0,

                "comments": 0,

                "engagement_rates": []
            }

        # Calculate engagement rate using
        # existing Content fields.

        _, engagement_rate = (
            calculate_engagement_rate(content)
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

        platform_data[platform][
            "engagement_rates"
        ].append(
            engagement_rate
        )

    result = {}

    for platform, data in platform_data.items():

        rates = data["engagement_rates"]

        average_engagement_rate = (

            sum(rates) / len(rates)

            if rates

            else 0
        )

        result[platform] = {

            "views": data["views"],

            "reach": data["reach"],

            "engagement_rate": round(
                average_engagement_rate,
                2
            ),

            "likes": data["likes"],

            "comments": data["comments"]
        }

    return result