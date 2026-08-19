"""Router for dashboard analytics and performance reporting."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.analytics_service import (
    get_content_engagement,
    get_dashboard_summary,
    get_engagement_chart_data,
    get_follower_growth_chart_data,
    get_platform_comparison,
    get_platform_performance,
    get_top_content,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
@router.get("/api/analytics/summary", include_in_schema=False)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve high-level dashboard KPI summary metrics."""
    return get_dashboard_summary(db, current_user)


@router.get("/chart/engagement")
@router.get("/api/analytics/chart/engagement", include_in_schema=False)
def chart_engagement(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve chronological chart-ready engagement rate trend data."""
    return get_engagement_chart_data(db, current_user)


@router.get("/chart/followers")
@router.get("/api/analytics/chart/followers", include_in_schema=False)
def chart_followers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieve chronological chart-ready follower growth points from Growth table."""
    return get_follower_growth_chart_data(db, current_user)


@router.get("/platform-comparison")
@router.get("/api/analytics/platform-comparison", include_in_schema=False)
def platform_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Dict[str, Any]]:
    """Retrieve platform-level performance breakdown and comparison."""
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
def top_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve top performing content items."""
    return get_top_content(db, current_user)


@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """Retrieve platform performance summaries as a list."""
    return get_platform_performance(db, current_user)
