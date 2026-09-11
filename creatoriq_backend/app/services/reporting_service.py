from sqlalchemy.orm import Session

from app.services.analytics_service import (
    get_dashboard_summary,
    get_platform_comparison,
    get_top_content,
)

from app.services.audience_service import (
    get_active_hours,
    get_age_distribution,
    get_audience_behavior,
    get_audience_trends,
    get_device_distribution,
    get_gender_distribution,
    get_growth_trend,
    get_top_cities,
    get_top_countries,
    get_total_followers,
    get_total_impressions,
    get_total_reach,
)

from app.services.revenue_service import (
    get_monthly_revenue,
    get_revenue_by_source,
    get_revenue_summary,
)


def generate_revenue_report(
    db: Session,
    creator_id: int,
) -> dict:
    summary = get_revenue_summary(
        db,
        creator_id,
    )

    by_source = get_revenue_by_source(
        db,
        creator_id,
    )

    monthly = get_monthly_revenue(
        db,
        creator_id,
    )

    return {
        "creator_id": creator_id,
        "report_type": "revenue",
        "revenue_summary": summary,
        "revenue_by_source": by_source,
        "monthly_revenue": monthly,
    }


def generate_content_report(
    db: Session,
    creator_id: int,
) -> dict:
    summary = get_dashboard_summary(
        db,
        creator_id,
    )

    top_content = get_top_content(
        db,
        limit=10,
        creator_id=creator_id,
    )

    return {
        "creator_id": creator_id,
        "report_type": "content_performance",
        "summary": summary,
        "top_content": top_content,
    }


def generate_audience_report(
    db: Session,
    creator_id: int,
) -> dict:
    return {
        "creator_id": creator_id,
        "report_type": "audience_analytics",

        "summary": {
            "total_followers": get_total_followers(
                db,
                creator_id,
            ),
            "total_reach": get_total_reach(
                db,
                creator_id,
            ),
            "total_impressions": get_total_impressions(
                db,
                creator_id,
            ),
        },

        "gender_distribution": get_gender_distribution(
            db,
            creator_id,
        ),

        "age_distribution": get_age_distribution(
            db,
            creator_id,
        ),

        "top_countries": get_top_countries(
            db,
            creator_id,
        ),

        "top_cities": get_top_cities(
            db,
            creator_id,
        ),

        "device_distribution": get_device_distribution(
            db,
            creator_id,
        ),

        "active_hours": get_active_hours(
            db,
            creator_id,
        ),

        "behavior": get_audience_behavior(
            db,
            creator_id,
        ),

        "trends": get_audience_trends(
            db,
            creator_id,
        ),
    }


def generate_growth_report(
    db: Session,
    creator_id: int,
) -> dict:
    growth_trend = get_growth_trend(
        db,
        creator_id,
        limit=30,
    )

    return {
        "creator_id": creator_id,
        "report_type": "growth_trends",
        "growth_trend": growth_trend,
    }


def generate_platform_report(
    db: Session,
    creator_id: int,
) -> dict:
    comparison = get_platform_comparison(
        db,
        creator_id,
    )

    return {
        "creator_id": creator_id,
        "report_type": "platform_comparison",
        "platform_comparison": comparison,
    }


def generate_creator_report(
    db: Session,
    creator_id: int,
) -> dict:
    """
    Build the complete creator report.

    All sections use the existing analytics services.
    No mock data is created here.
    """

    return {
        "creator_id": creator_id,
        "report_type": "creator_analytics",

        "content_performance": generate_content_report(
            db,
            creator_id,
        ),

        "audience_analytics": generate_audience_report(
            db,
            creator_id,
        ),

        "revenue": generate_revenue_report(
            db,
            creator_id,
        ),

        "growth_trends": generate_growth_report(
            db,
            creator_id,
        ),

        "platform_comparison": generate_platform_report(
            db,
            creator_id,
        ),
    }