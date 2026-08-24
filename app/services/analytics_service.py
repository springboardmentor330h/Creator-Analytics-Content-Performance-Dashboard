from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.content import Content


# =========================================================
# TASK 1 - Content Engagement
# =========================================================

def get_content_engagement(db: Session, content_id: int):
    content = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    engagement_rate = (
        (total_engagement / content.reach) * 100
        if content.reach > 0
        else 0
    )

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2)
    }


# =========================================================
# TASK 2 - Top 5 Performing Content
# =========================================================

def get_top_performing_content(db: Session):
    contents = db.query(Content).all()

    results = []

    for content in contents:

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        engagement_rate = (
            (total_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        results.append({
            "content_id": content.id,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "total_engagement": total_engagement,
            "engagement_rate": round(
                engagement_rate,
                2
            )
        })

    # Highest engagement first
    results.sort(
        key=lambda x: x["total_engagement"],
        reverse=True
    )

    # Return only Top 5
    return results[:5]


# =========================================================
# TASK 3 - Platform Performance Comparison
# =========================================================

def get_platform_performance(db: Session):
    contents = db.query(Content).all()

    platform_data = {}

    for content in contents:

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        engagement_rate = (
            (total_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "platform": platform,
                "content_count": 0,
                "total_views": 0,
                "total_reach": 0,
                "total_engagement": 0,
                "engagement_rates": []
            }

        platform_data[platform]["content_count"] += 1

        platform_data[platform]["total_views"] += (
            content.views
        )

        platform_data[platform]["total_reach"] += (
            content.reach
        )

        platform_data[platform]["total_engagement"] += (
            total_engagement
        )

        platform_data[platform]["engagement_rates"].append(
            engagement_rate
        )

    results = []

    for data in platform_data.values():

        average_engagement_rate = (
            sum(data["engagement_rates"])
            / len(data["engagement_rates"])
            if data["engagement_rates"]
            else 0
        )

        results.append({
            "platform": data["platform"],
            "content_count": data["content_count"],
            "total_views": data["total_views"],
            "total_reach": data["total_reach"],
            "total_engagement": data["total_engagement"],
            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        })

    # Highest performing platform first
    results.sort(
        key=lambda x: x["average_engagement_rate"],
        reverse=True
    )

    return results


# =========================================================
# TASK 4 - Dashboard Summary
# =========================================================

def get_dashboard_summary(db: Session):
    contents = db.query(Content).all()

    # No content available
    if not contents:
        return {
            "total_contents": 0,
            "total_views": 0,
            "total_reach": 0,
            "total_engagement": 0,
            "average_engagement_rate": 0,
            "best_platform": None,
            "top_content": None
        }

    total_views = 0
    total_reach = 0
    total_engagement = 0

    engagement_rates = []
    content_results = []
    platform_data = {}

    for content in contents:

        # Calculate engagement
        content_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        # Calculate engagement rate
        engagement_rate = (
            (content_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        # Overall totals
        total_views += content.views
        total_reach += content.reach
        total_engagement += content_engagement

        engagement_rates.append(
            engagement_rate
        )

        # Store content information
        content_results.append({
            "content_id": content.id,
            "platform": content.platform,
            "total_engagement": content_engagement,
            "engagement_rate": round(
                engagement_rate,
                2
            )
        })

        # Platform information
        platform = content.platform

        if platform not in platform_data:
            platform_data[platform] = {
                "engagement_rates": []
            }

        platform_data[platform][
            "engagement_rates"
        ].append(
            engagement_rate
        )

    # Overall average engagement rate
    average_engagement_rate = (
        sum(engagement_rates)
        / len(engagement_rates)
        if engagement_rates
        else 0
    )

    # Find best platform
    best_platform = None
    best_platform_rate = -1

    for platform, data in platform_data.items():

        platform_average = (
            sum(data["engagement_rates"])
            / len(data["engagement_rates"])
            if data["engagement_rates"]
            else 0
        )

        if platform_average > best_platform_rate:
            best_platform_rate = platform_average
            best_platform = platform

    # Find top-performing content
    content_results.sort(
        key=lambda x: x["total_engagement"],
        reverse=True
    )

    top_content = (
        content_results[0]
        if content_results
        else None
    )

    return {
        "total_contents": len(contents),
        "total_views": total_views,
        "total_reach": total_reach,
        "total_engagement": total_engagement,
        "average_engagement_rate": round(
            average_engagement_rate,
            2
        ),
        "best_platform": best_platform,
        "top_content": top_content
    }