from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user

from app.services.analytics_service import (
    get_content_engagement,
    get_top_performing_content,
    get_platform_performance,
    get_dashboard_summary,
    get_kpi_summary,
    get_engagement_chart,
    get_follower_growth_chart,
    get_platform_comparison
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# Content Engagement
# =========================================================

@router.get("/content/{id}/engagement")
def content_engagement(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_content_engagement(
        db,
        id,
        current_user.id
    )


# =========================================================
# Top Performing Content
# =========================================================

@router.get("/top-content")
def top_performing_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_top_performing_content(
        db,
        current_user.id
    )


# =========================================================
# Platform Performance
# =========================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_platform_performance(
        db,
        current_user.id
    )


# =========================================================
# Dashboard Summary
# =========================================================

@router.get("/dashboard-summary")
def dashboard_summary(
    platform: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(
        db,
        current_user.id,
        platform
    )


# =========================================================
# KPI Summary
# =========================================================

@router.get("/summary")
def kpi_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_kpi_summary(
        db,
        current_user.id
    )


# =========================================================
# Engagement Chart
# =========================================================

@router.get("/chart/engagement")
def engagement_chart(
    platform: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_engagement_chart(
        db,
        current_user.id,
        platform
    )


# =========================================================
# Follower Growth Chart
# =========================================================

@router.get("/chart/followers")
def follower_growth_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_follower_growth_chart(
        db,
        current_user.id
    )


# =========================================================
# Platform Comparison
# =========================================================

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_platform_comparison(
        db,
        current_user.id
    )