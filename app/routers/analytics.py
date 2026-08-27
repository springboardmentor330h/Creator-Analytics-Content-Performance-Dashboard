from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

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
# SPRINT 2 - TASK 1
# =========================================================

@router.get("/content/{id}/engagement")
def content_engagement(
    id: int,
    db: Session = Depends(get_db)
):
    return get_content_engagement(
        db,
        id
    )


# =========================================================
# SPRINT 2 - TASK 2
# =========================================================

@router.get("/top-content")
def top_performing_content(
    db: Session = Depends(get_db)
):
    return get_top_performing_content(
        db
    )


# =========================================================
# SPRINT 2 - TASK 3
# =========================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db)
):
    return get_platform_performance(
        db
    )


# =========================================================
# SPRINT 2 - TASK 4
# =========================================================

@router.get("/dashboard-summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(
        db
    )


# =========================================================
# SPRINT 4 - TASK 1
# KPI SUMMARY
# =========================================================

@router.get("/summary")
def kpi_summary(
    db: Session = Depends(get_db)
):
    return get_kpi_summary(
        db
    )


# =========================================================
# SPRINT 4 - TASK 2
# ENGAGEMENT CHART
# =========================================================

@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db)
):
    return get_engagement_chart(
        db
    )


# =========================================================
# SPRINT 4 - TASK 3
# FOLLOWER GROWTH CHART
# =========================================================

@router.get("/chart/followers")
def follower_growth_chart(
    db: Session = Depends(get_db)
):
    return get_follower_growth_chart(
        db
    )


# =========================================================
# SPRINT 4 - TASK 4
# PLATFORM COMPARISON
# =========================================================

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db)
):
    return get_platform_comparison(
        db
    )