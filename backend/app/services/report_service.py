from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth
from app.models.revenue import Revenue
from app.services.analytics_service import get_platform_comparison

def generate_creator_report(db: Session, creator_id: int):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    audience_data = (
        db.query(Audience)
        .filter(Audience.creator_id == creator_id)
        .all()
    )

    growth_data = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .all()
    )

    revenues = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .all()
    )
    if not contents and not audience_data and not growth_data and not revenues:
        raise HTTPException(
        status_code=404,
        detail=f"No data found for creator ID {creator_id}"
        )
    # Content Performance
    total_views = sum(content.views for content in contents)
    total_reach = sum(content.reach for content in contents)

    # Engagement
    total_engagement = sum(
        content.likes
        + content.comments
        + content.shares
        + content.saves
        for content in contents
    )

    engagement_rate = (
        (total_engagement / total_reach) * 100
        if total_reach > 0 else 0
    )

    # Audience
    total_followers = sum(
        audience.followers for audience in audience_data
    )

    # Revenue
    total_revenue = sum(
        revenue.amount for revenue in revenues
    )

    # Growth
    latest_followers = (
        growth_data[-1].followers
        if growth_data else 0
    )

    return {
        "creator_id": creator_id,

        "content_performance": {
            "total_content": len(contents),
            "total_views": total_views,
            "total_reach": total_reach,
            "engagement_rate": round(engagement_rate, 2)
        },

        "audience_analytics": {
            "total_audience_records": len(audience_data),
            "total_followers": total_followers
        },

        "revenue_analytics": {
            "total_revenue": round(total_revenue, 2),
            "revenue_records": len(revenues)
        },

        "growth_trends": {
            "latest_followers": latest_followers,
            "growth_records": len(growth_data)
        }
    }
def get_creator_platform_comparison(db: Session, creator_id: int):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    platforms = {}

    for content in contents:
        total_engagement = (
            content.likes
            + content.comments
            + content.shares
            + content.saves
        )

        engagement_rate = (
            (total_engagement / content.reach) * 100
            if content.reach > 0 else 0
        )

        if content.platform not in platforms:
            platforms[content.platform] = {
                "platform": content.platform,
                "total_views": 0,
                "total_reach": 0,
                "engagement_rates": []
            }

        platforms[content.platform]["total_views"] += content.views
        platforms[content.platform]["total_reach"] += content.reach
        platforms[content.platform]["engagement_rates"].append(
            engagement_rate
        )

    results = []

    for platform in platforms.values():
        rates = platform["engagement_rates"]

        results.append({
            "platform": platform["platform"],
            "total_views": platform["total_views"],
            "total_reach": platform["total_reach"],
            "average_engagement_rate": round(
                sum(rates) / len(rates), 2
            ) if rates else 0
        })

    return results