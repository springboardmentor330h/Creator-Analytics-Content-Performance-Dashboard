from sqlalchemy.orm import Session

from app.services.revenue_service import (
    get_monthly_revenue,
    get_revenue_by_source,
    get_revenue_summary,
)


def generate_revenue_report(
    db: Session,
    creator_id: int,
):
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


def generate_creator_report(
    db: Session,
    creator_id: int,
):
    revenue_report = generate_revenue_report(
        db,
        creator_id,
    )

    return {
        "creator_id": creator_id,
        "report_type": "creator_analytics",
        "revenue": revenue_report,
    }


def generate_content_report(
    db: Session,
    creator_id: int,
):
    return {
        "creator_id": creator_id,
        "report_type": "content_performance",
        "message": (
            "Content performance report uses the "
            "existing content analytics module."
        ),
    }


def generate_audience_report(
    db: Session,
    creator_id: int,
):
    return {
        "creator_id": creator_id,
        "report_type": "audience_analytics",
        "message": (
            "Audience analytics report uses the "
            "existing audience analytics module."
        ),
    }


def generate_growth_report(
    db: Session,
    creator_id: int,
):
    return {
        "creator_id": creator_id,
        "report_type": "growth_trends",
        "message": (
            "Growth report uses the existing "
            "growth analytics module."
        ),
    }


def generate_platform_report(
    db: Session,
    creator_id: int,
):
    return {
        "creator_id": creator_id,
        "report_type": "platform_comparison",
        "message": (
            "Platform comparison uses the existing "
            "social media analytics module."
        ),
    }