from sqlalchemy.orm import Session

from app.services import analytics_service, audience_service, revenue_service


def generate_full_report(db: Session, creator_id: int) -> dict:
    """
    Combines existing analytics outputs into one structured report, all scoped
    to the requesting creator. Reuses existing service functions — no duplicate
    calculation logic.
    """
    content_summary = analytics_service.get_kpi_summary(db, creator_id=creator_id)
    top_content = analytics_service.get_top_content(db, creator_id=creator_id, limit=5)
    platform_comparison = analytics_service.get_platform_comparison(db, creator_id=creator_id)

    audience_report = audience_service.get_audience_report(db, creator_id=creator_id)
    growth_report = audience_service.get_growth_report(db, creator_id=creator_id, days=30)

    revenue_summary = revenue_service.get_revenue_summary(db, creator_id)

    return {
        "creator_id": creator_id,
        "content_performance": {
            "summary": content_summary,
            "top_content": top_content
        },
        "platform_comparison": platform_comparison,
        "audience_analytics": audience_report,
        "growth_analytics": growth_report,
        "revenue_analytics": revenue_summary
    }
