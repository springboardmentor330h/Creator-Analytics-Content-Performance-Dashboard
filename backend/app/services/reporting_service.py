from sqlalchemy.orm import Session

from app.services import analytics_service, audience_service, revenue_service


def generate_full_report(db: Session, creator_id: int) -> dict:
    """
    Combines existing analytics outputs into one structured report.
    Reuses existing service functions — no duplicate calculation logic.
    """
    content_summary = analytics_service.get_kpi_summary(db)
    top_content = analytics_service.get_top_content(db, limit=5)
    platform_comparison = analytics_service.get_platform_performance(db)

    audience_report = audience_service.get_audience_report(db)

    revenue_summary = revenue_service.get_revenue_summary(db, creator_id)

    return {
        "creator_id": creator_id,
        "content_performance": {
            "summary": content_summary,
            "top_content": top_content
        },
        "platform_comparison": platform_comparison,
        "audience_analytics": audience_report,
        "revenue_analytics": revenue_summary
    }