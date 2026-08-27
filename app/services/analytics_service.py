from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.content import Content


# =========================================================
# SPRINT 2 - TASK 1
# Content Engagement
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
# SPRINT 2 - TASK 2
# Top 5 Performing Content
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

    results.sort(
        key=lambda x: x["total_engagement"],
        reverse=True
    )

    return results[:5]


# =========================================================
# SPRINT 2 - TASK 3
# Platform Performance Comparison
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

    results.sort(
        key=lambda x: x["average_engagement_rate"],
        reverse=True
    )

    return results


# =========================================================
# SPRINT 2 - TASK 4
# Dashboard Summary
# =========================================================

def get_dashboard_summary(db: Session):

    contents = db.query(Content).all()

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

        content_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        engagement_rate = (
            (content_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        total_views += content.views
        total_reach += content.reach
        total_engagement += content_engagement

        engagement_rates.append(
            engagement_rate
        )

        content_results.append({
            "content_id": content.id,
            "platform": content.platform,
            "total_engagement": content_engagement,
            "engagement_rate": round(
                engagement_rate,
                2
            )
        })

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

    average_engagement_rate = (
        sum(engagement_rates)
        / len(engagement_rates)
        if engagement_rates
        else 0
    )

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


# =========================================================
# SPRINT 4 - TASK 1
# KPI Summary
# =========================================================

def get_kpi_summary(db: Session):

    contents = db.query(Content).all()

    if not contents:

        return {
            "total_views": 0,
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0,
            "total_reach": 0,
            "total_followers": 0,
            "average_engagement_rate": 0
        }

    total_views = sum(
        content.views for content in contents
    )

    total_likes = sum(
        content.likes for content in contents
    )

    total_comments = sum(
        content.comments for content in contents
    )

    total_shares = sum(
        content.shares for content in contents
    )

    total_reach = sum(
        content.reach for content in contents
    )

    engagement_rates = []

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

        engagement_rates.append(
            engagement_rate
        )

    average_engagement_rate = (
        sum(engagement_rates)
        / len(engagement_rates)
        if engagement_rates
        else 0
    )

    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": 0,
        "average_engagement_rate": round(
            average_engagement_rate,
            2
        )
    }


# =========================================================
# SPRINT 4 - TASK 2
# Engagement Chart
# =========================================================

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

        engagement_rate = (
            (total_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        labels.append(
            str(content.published_date)
        )

        values.append(
            round(engagement_rate, 2)
        )

    return {
        "labels": labels,
        "values": values
    }


# =========================================================
# SPRINT 4 - TASK 3
# Follower Growth Chart
# =========================================================

def get_follower_growth_chart(db: Session):

    # Follower data will be connected with Growth model
    # after confirming the Sprint 3 Growth model structure.

    return {
        "labels": [],
        "values": []
    }


# =========================================================
# SPRINT 4 - TASK 4
# Platform Comparison
# =========================================================

def get_platform_comparison(db: Session):

    contents = db.query(Content).all()

    platform_data = {}

    for content in contents:

        platform = content.platform

        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        if platform not in platform_data:

            platform_data[platform] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "engagement_rates": []
            }

        platform_data[platform]["views"] += (
            content.views
        )

        platform_data[platform]["reach"] += (
            content.reach
        )

        platform_data[platform]["likes"] += (
            content.likes
        )

        platform_data[platform]["comments"] += (
            content.comments
        )

        platform_data[platform]["shares"] += (
            content.shares
        )

        engagement_rate = (
            (total_engagement / content.reach) * 100
            if content.reach > 0
            else 0
        )

        platform_data[platform][
            "engagement_rates"
        ].append(
            engagement_rate
        )

    result = {}

    for platform, data in platform_data.items():

        average_rate = (
            sum(data["engagement_rates"])
            / len(data["engagement_rates"])
            if data["engagement_rates"]
            else 0
        )

        result[platform] = {
            "views": data["views"],
            "reach": data["reach"],
            "engagement_rate": round(
                average_rate,
                2
            ),
            "likes": data["likes"],
            "comments": data["comments"]
        }

    return result