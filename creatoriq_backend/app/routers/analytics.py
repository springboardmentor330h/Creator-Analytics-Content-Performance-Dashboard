"""Router for dashboard analytics and performance reporting."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services import live_analytics_service
from app.services.analytics_service import (
    get_content_engagement,
    get_dashboard_summary,
    get_engagement_chart_data,
    get_follower_growth_chart_data,
    get_platform_comparison,
    get_platform_performance,
    get_top_content,
)
from app.services.revenue_service import (
    get_monthly_revenue,
    get_revenue_by_source,
    get_revenue_trend,
    get_total_revenue,
)
from app.services.sponsorship_service import (
    get_sponsorships_status,
    get_sponsorships_summary,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
@router.get("/api/analytics/summary", include_in_schema=False)
def dashboard_summary(
    platform: Optional[str] = Query(None),
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve high-level dashboard KPI summary metrics from PostgreSQL database or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_dashboard_summary(db, current_user, platform=platform)
    return get_dashboard_summary(db, current_user, platform=platform)


@router.get("/chart/engagement")
@router.get("/api/analytics/chart/engagement", include_in_schema=False)
def chart_engagement(
    platform: Optional[str] = Query(None),
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve chronological chart-ready engagement rate trend data from PostgreSQL or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_engagement_chart_data(db, current_user, platform=platform)
    return get_engagement_chart_data(db, current_user, platform=platform)


@router.get("/chart/followers")
@router.get("/api/analytics/chart/followers", include_in_schema=False)
def chart_followers(
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve chronological chart-ready follower growth points from PostgreSQL or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_follower_growth_chart_data(db, current_user)
    return get_follower_growth_chart_data(db, current_user)


@router.get("/platform-comparison")
@router.get("/api/analytics/platform-comparison", include_in_schema=False)
def platform_comparison(
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Dict[str, Any]]:
    """Retrieve platform-level performance breakdown and comparison from PostgreSQL or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_platform_comparison(db, current_user)
    return get_platform_comparison(db, current_user)


@router.get("/content/{id}/engagement")
def get_engagement(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve engagement metrics for a single content item."""
    data = get_content_engagement(db, current_user, id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return data


@router.get("/top-content")
@router.get("/api/analytics/top-content", include_in_schema=False)
def top_content(
    platform: Optional[str] = Query(None),
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve top performing content items from PostgreSQL or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_top_content(db, current_user, platform=platform)
    return get_top_content(db, current_user, platform=platform)


@router.get("/platform-performance")
@router.get("/api/analytics/platform-performance", include_in_schema=False)
def platform_performance(
    platform: Optional[str] = Query(None),
    source: Optional[str] = Query("database"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve platform performance summaries from PostgreSQL or live social APIs."""
    if source and source.strip().lower() == "live":
        return live_analytics_service.get_live_platform_performance(db, current_user, platform=platform)
    return get_platform_performance(db, current_user, platform=platform)


@router.post("/sync-live")
@router.post("/api/analytics/sync-live", include_in_schema=False)
def sync_live_to_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """1-Click batch sync all currently connected social platforms into PostgreSQL database."""
    return live_analytics_service.sync_all_live_to_db(db, current_user)


# =========================================================
# REVENUE & SPONSORSHIP ANALYTICS (SPRINT 6)
# =========================================================

@router.get("/revenue/summary")
@router.get("/api/analytics/revenue/summary", include_in_schema=False)
def revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve creator's total accumulated revenue and currency."""
    return get_total_revenue(db, current_user)


@router.get("/revenue/by-source")
@router.get("/api/analytics/revenue/by-source", include_in_schema=False)
def revenue_by_source(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, float]:
    """Retrieve creator's revenue aggregated by source category."""
    return get_revenue_by_source(db, current_user)


@router.get("/revenue/monthly")
@router.get("/api/analytics/revenue/monthly", include_in_schema=False)
def revenue_monthly(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve chronological monthly revenue totals."""
    return get_monthly_revenue(db, current_user)


@router.get("/revenue/trend")
@router.get("/api/analytics/revenue/trend", include_in_schema=False)
def revenue_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve chart-ready monthly revenue trend points."""
    return get_revenue_trend(db, current_user)


@router.get("/sponsorships/summary")
@router.get("/api/analytics/sponsorships/summary", include_in_schema=False)
def sponsorships_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve creator's sponsorship performance overview and pipeline value."""
    return get_sponsorships_summary(db, current_user)


@router.get("/sponsorships/status")
@router.get("/api/analytics/sponsorships/status", include_in_schema=False)
def sponsorships_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, int]:
    """Retrieve breakdown of sponsorship deals grouped by status."""
    return get_sponsorships_status(db, current_user)
