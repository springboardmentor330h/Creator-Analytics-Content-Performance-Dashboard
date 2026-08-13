from sqlalchemy.orm import Session

from app.models.content import Content


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

    if content.reach and content.reach > 0:

        engagement_rate = (
            total_engagement / content.reach
        ) * 100

    else:

        engagement_rate = 0

    return total_engagement, round(
        engagement_rate,
        2
    )


# ============================================================
# TASK 1: CONTENT ENGAGEMENT
# GET /analytics/content/{id}/engagement
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
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate
    }


# ============================================================
# TASK 2: TOP PERFORMING CONTENT
# GET /analytics/top-content
# ============================================================

def get_top_content(db: Session):

    contents = db.query(Content).all()

    result = []

    for content in contents:

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        result.append({
            "content_id": content.id,

            # Your model uses content_title
            "title": content.content_title,

            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "watch_time": content.watch_time,
            "engagement_rate": engagement_rate
        })

    result.sort(
        key=lambda x: x["engagement_rate"],
        reverse=True
    )

    return result[:5]


# ============================================================
# TASK 3: PLATFORM PERFORMANCE
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

        rates = platform_data["engagement_rates"]

        average_engagement_rate = (

            sum(rates) / len(rates)

            if rates else 0

        )

        result.append({

            "platform": platform_data["platform"],

            "total_views": platform_data["total_views"],

            "total_likes": platform_data["total_likes"],

            "total_comments": (
                platform_data["total_comments"]
            ),

            "total_reach": platform_data["total_reach"],

            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        })

    result.sort(

        key=lambda x: x["average_engagement_rate"],

        reverse=True
    )

    return result


# ============================================================
# TASK 4: DASHBOARD SUMMARY
# GET /analytics/summary
# ============================================================

def get_dashboard_summary(db: Session):

    contents = db.query(Content).all()

    # --------------------------------------------------------
    # HANDLE EMPTY DATABASE
    # --------------------------------------------------------

    if not contents:

        return {

            "total_content": 0,

            "total_views": 0,

            "total_reach": 0,

            "average_engagement_rate": 0,

            "best_platform": None,

            "top_content": None
        }

    # --------------------------------------------------------
    # TOTAL CONTENT
    # --------------------------------------------------------

    total_content = len(contents)

    # --------------------------------------------------------
    # TOTAL VIEWS
    # --------------------------------------------------------

    total_views = sum(

        content.views or 0

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
    # ENGAGEMENT RATE AND TOP CONTENT
    # --------------------------------------------------------

    engagement_rates = []

    top_content = None

    highest_engagement_rate = -1

    for content in contents:

        _, engagement_rate = (
            calculate_engagement_rate(content)
        )

        engagement_rates.append(
            engagement_rate
        )

        if engagement_rate > highest_engagement_rate:

            highest_engagement_rate = (
                engagement_rate
            )

            # Your model uses content_title
            top_content = (
                content.content_title
            )

    # --------------------------------------------------------
    # AVERAGE ENGAGEMENT RATE
    # --------------------------------------------------------

    average_engagement_rate = (

        sum(engagement_rates)

        / len(engagement_rates)
    )

    # --------------------------------------------------------
    # GET BEST PLATFORM
    # --------------------------------------------------------

    platform_performance = (
        get_platform_performance(db)
    )

    best_platform = None

    if platform_performance:

        best_platform = (
            platform_performance[0]["platform"]
        )

    # --------------------------------------------------------
    # FINAL DASHBOARD RESPONSE
    # --------------------------------------------------------

    return {

        "total_content": total_content,

        "total_views": total_views,

        "total_reach": total_reach,

        "average_engagement_rate": round(
            average_engagement_rate,
            2
        ),

        "best_platform": best_platform,

        "top_content": top_content
    }