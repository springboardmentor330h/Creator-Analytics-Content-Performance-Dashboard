"""
Reporting service.

ARCHITECTURE RULE (per the spec): this file computes NOTHING. Every
number in a generated report comes from calling an existing Sprint 2/3/4/6
service function — content_service, audience_service,
platform_analytics_service, revenue_service. This file's only job is
COLLECTING those results into one structured object per creator.

If a number in a report is ever wrong, the bug is in the underlying
service (and its existing tests), not here — that's the point of not
duplicating logic: one source of truth per metric.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User
from app.services import content_service, audience_service, platform_analytics_service, revenue_service


def generate_creator_report(db: Session, creator: User) -> dict:
    """
    Builds the full cross-sprint report for one creator. `creator` is
    passed in (not just creator_id) so the report can include name/email
    without a redundant extra query — the caller (router) already has
    the User object from get_current_user.
    """
    creator_id = creator.id

    content_kpi = content_service.get_kpi_summary(db, creator_id)
    top_content = content_service.get_top_performing_content(db, creator_id, limit=5)
    top_content_dicts = [content_service.to_response_dict(c) for c in top_content]
    content_platform_comparison = content_service.get_platform_comparison(db, creator_id)

    audience_kpi = audience_service.get_audience_kpi_summary(db, creator_id)
    age_breakdown = audience_service.get_age_breakdown(db, creator_id)
    geo_breakdown = audience_service.get_geographic_breakdown(db, creator_id)

    revenue_kpi = revenue_service.get_revenue_kpi_summary(db, creator_id)
    monthly_trend = revenue_service.get_monthly_revenue_trend(db, creator_id)

    growth_comparison = platform_analytics_service.get_growth_comparison(db, creator_id)

    cross_platform_kpis = platform_analytics_service.get_cross_platform_kpis(db, creator_id)
    platform_snapshots = platform_analytics_service.get_all_platform_snapshots(db, creator_id)

    return {
        "generated_at": datetime.utcnow(),
        "creator": {
            "id": str(creator.id),
            "name": creator.name,
            "email": creator.email,
        },
        "content": {
            "kpi_summary": content_kpi,
            "top_performing": top_content_dicts,
            "platform_comparison": content_platform_comparison,
        },
        "audience": {
            "kpi_summary": audience_kpi,
            "age_breakdown": age_breakdown,
            "geographic_breakdown": geo_breakdown,
        },
        "revenue": {
            "kpi_summary": revenue_kpi,
            "monthly_trend": monthly_trend,
        },
        "growth": {
            "by_platform": growth_comparison,
        },
        "platforms": {
            "cross_platform_kpis": cross_platform_kpis,
            "snapshots": platform_snapshots,
        },
    }
