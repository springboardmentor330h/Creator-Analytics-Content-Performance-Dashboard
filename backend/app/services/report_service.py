"""
report_service.py

Combines data already produced by analytics_service, audience_service,
and revenue_service into one structured report. No new analytics
calculations happen here — this file only assembles existing results.
"""

from datetime import datetime, timezone
from typing import Any, Dict

from sqlalchemy.orm import Session

from app.services import analytics_service, audience_service, revenue_service


def generate_creator_report(db: Session, creator_id: int) -> Dict[str, Any]:
    """
    Builds the full CreatorIQ report for one creator, combining:
    content performance, top content, platform comparison, audience
    analytics, growth trends, and revenue analytics/trend.
    """
    return {
        "creator_id": creator_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "content_performance": analytics_service.get_dashboard_summary(db),
        "top_content": analytics_service.get_top_content(db, limit=5),
        "platform_comparison": analytics_service.get_platform_comparison(db),
        "audience_analytics": audience_service.get_audience_report(db),
        "growth_trends": audience_service.get_growth_report(db),
        "revenue_analytics": revenue_service.get_revenue_summary(db, creator_id),
        "revenue_trend": revenue_service.get_revenue_trend(db, creator_id),
    }