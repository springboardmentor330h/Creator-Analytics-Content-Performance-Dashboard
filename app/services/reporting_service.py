from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth

from app.services.revenue_analytics_service import (
    get_total_revenue,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_trend
)


def generate_creator_report(db: Session, creator_id: int):

    # =====================================================
    # CONTENT PERFORMANCE
    # =====================================================

    content_records = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    content_performance = []

    for content in content_records:

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

        content_performance.append({
            "content_id": content.id,
            "platform": content.platform,
            "content_title": content.content_title,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "reach": content.reach,
            "total_engagement": total_engagement,
            "engagement_rate": round(engagement_rate, 2)
        })

    # =====================================================
    # AUDIENCE ANALYTICS
    # =====================================================

    audience_records = (
        db.query(Audience)
        .filter(Audience.creator_id == creator_id)
        .all()
    )

    audience_data = []

    for audience in audience_records:

        audience_data.append({
            "id": audience.id,
            "age_group": audience.age_group,
            "gender": audience.gender,
            "country": audience.country,
            "city": audience.city,
            "device_type": audience.device_type,
            "active_hour": audience.active_hour,
            "followers": audience.followers,
            "impressions": audience.impressions,
            "reach": audience.reach
        })

    # =====================================================
    # GROWTH TRENDS
    # =====================================================

    growth_records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date)
        .all()
    )

    growth_data = []

    for growth in growth_records:

        growth_data.append({
            "date": growth.date,
            "followers": growth.followers,
            "reach": growth.reach,
            "engagement_rate": growth.engagement_rate
        })

    # =====================================================
    # PLATFORM COMPARISON
    # =====================================================

    platform_data = {}

    for content in content_records:

        platform = content.platform

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

        if platform not in platform_data:

            platform_data[platform] = {
                "content_count": 0,
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "total_engagement": 0,
                "engagement_rates": []
            }

        platform_data[platform]["content_count"] += 1

        platform_data[platform]["views"] += content.views

        platform_data[platform]["reach"] += content.reach

        platform_data[platform]["likes"] += content.likes

        platform_data[platform]["comments"] += content.comments

        platform_data[platform]["shares"] += content.shares

        platform_data[platform]["total_engagement"] += (
            total_engagement
        )

        platform_data[platform]["engagement_rates"].append(
            engagement_rate
        )

    platform_comparison = []

    for platform, data in platform_data.items():

        average_engagement_rate = (
            sum(data["engagement_rates"])
            / len(data["engagement_rates"])
            if data["engagement_rates"]
            else 0
        )

        platform_comparison.append({
            "platform": platform,
            "content_count": data["content_count"],
            "views": data["views"],
            "reach": data["reach"],
            "likes": data["likes"],
            "comments": data["comments"],
            "shares": data["shares"],
            "total_engagement": data["total_engagement"],
            "average_engagement_rate": round(
                average_engagement_rate,
                2
            )
        })

    platform_comparison.sort(
        key=lambda x: x["average_engagement_rate"],
        reverse=True
    )

    # =====================================================
    # REVENUE ANALYTICS
    # =====================================================

    total_revenue = get_total_revenue(
        db,
        creator_id
    )

    revenue_by_source = get_revenue_by_source(
        db,
        creator_id
    )

    monthly_revenue = get_monthly_revenue(
        db,
        creator_id
    )

    revenue_trend = get_revenue_trend(
        db,
        creator_id
    )

    # =====================================================
    # FINAL CREATOR REPORT
    # =====================================================

    return {
        "creator_id": creator_id,

        "content_performance": content_performance,

        "audience_analytics": audience_data,

        "growth_trends": growth_data,

        "platform_comparison": platform_comparison,

        "revenue_analytics": {
            "total_revenue": total_revenue,
            "revenue_by_source": revenue_by_source,
            "monthly_revenue": monthly_revenue,
            "revenue_trend": revenue_trend
        }
    }