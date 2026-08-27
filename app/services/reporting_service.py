from sqlalchemy.orm import Session

from app.services.analytics_service import (
    get_dashboard_summary,
    get_top_performing_content,
    get_platform_comparison
)

from app.services.audience_service import (
    get_total_followers,
    get_total_reach,
    get_total_impressions,
    get_gender_distribution,
    get_age_distribution,
    get_top_countries,
    get_top_cities,
    get_device_distribution,
    get_growth_trend,
    get_audience_trends
)

from app.models.revenue import Revenue


def get_revenue_report(
    db: Session,
    creator_id: int
):
    revenues = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.revenue_date.desc())
        .all()
    )

    total_revenue = sum(
        float(revenue.amount)
        for revenue in revenues
    )

    revenue_by_source = {}

    for revenue in revenues:
        source = revenue.source

        if source not in revenue_by_source:
            revenue_by_source[source] = 0

        revenue_by_source[source] += float(
            revenue.amount
        )

    transactions = [
        {
            "id": revenue.id,
            "source": revenue.source,
            "amount": float(revenue.amount),
            "currency": revenue.currency,
            "description": revenue.description,
            "revenue_date": revenue.revenue_date
        }
        for revenue in revenues
    ]

    return {
        "total_revenue": round(total_revenue, 2),
        "revenue_by_source": {
            source: round(amount, 2)
            for source, amount in revenue_by_source.items()
        },
        "transactions": transactions
    }


def generate_creator_report(
    db: Session,
    creator_id: int
):
    # --------------------------------------------------
    # DASHBOARD SUMMARY
    # --------------------------------------------------

    summary = get_dashboard_summary(
        db=db,
        creator_id=creator_id
    )

    # --------------------------------------------------
    # CONTENT PERFORMANCE
    # --------------------------------------------------

    content_performance = get_top_performing_content(
        db=db,
        creator_id=creator_id,
        limit=10
    )

    # --------------------------------------------------
    # PLATFORM COMPARISON
    # --------------------------------------------------

    platform_comparison = get_platform_comparison(
        db=db,
        creator_id=creator_id
    )

    # --------------------------------------------------
    # AUDIENCE ANALYTICS
    # --------------------------------------------------

    audience = {
        "total_followers": get_total_followers(
            db=db,
            creator_id=creator_id
        ),

        "total_reach": get_total_reach(
            db=db,
            creator_id=creator_id
        ),

        "total_impressions": get_total_impressions(
            db=db,
            creator_id=creator_id
        ),

        "gender_distribution": get_gender_distribution(
            db=db,
            creator_id=creator_id
        ),

        "age_distribution": get_age_distribution(
            db=db,
            creator_id=creator_id
        ),

        "top_countries": get_top_countries(
            db=db,
            creator_id=creator_id
        ),

        "top_cities": get_top_cities(
            db=db,
            creator_id=creator_id
        ),

        "device_distribution": get_device_distribution(
            db=db,
            creator_id=creator_id
        )
    }

    # --------------------------------------------------
    # GROWTH TRENDS
    # --------------------------------------------------

    growth = get_growth_trend(
        db=db,
        creator_id=creator_id,
        days=30
    )

    # --------------------------------------------------
    # AUDIENCE TRENDS
    # --------------------------------------------------

    audience_trends = get_audience_trends(
        db=db,
        creator_id=creator_id,
        days=30
    )

    # --------------------------------------------------
    # REVENUE ANALYTICS
    # --------------------------------------------------

    revenue = get_revenue_report(
        db=db,
        creator_id=creator_id
    )

    # --------------------------------------------------
    # FINAL CREATOR REPORT
    # --------------------------------------------------

    return {
        "summary": summary,
        "content_performance": content_performance,
        "audience_analytics": audience,
        "revenue_analytics": revenue,
        "growth_trends": growth,
        "audience_trends": audience_trends,
        "platform_comparison": platform_comparison
    }