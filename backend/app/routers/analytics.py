from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
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
# CONTENT ENGAGEMENT
# =========================================================

@router.get("/content/{content_id}/engagement")
def content_engagement(
    content_id: int,
    db: Session = Depends(get_db)
):
    result = get_content_engagement(db, content_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "message": "Engagement data fetched successfully",
        "data": result
    }


# =========================================================
# TOP PERFORMING CONTENT
# =========================================================

@router.get("/top-content")
def top_content(
    db: Session = Depends(get_db)
):
    result = get_top_content(db)

    return {
        "message": "Top performing content fetched successfully",
        "data": result
    }


# =========================================================
# PLATFORM PERFORMANCE
# =========================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db)
):
    result = get_platform_performance(db)

    return {
        "message": "Platform performance fetched successfully",
        "data": result
    }


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):
    result = get_kpi_summary(db)

    return {
        "message": "KPI summary fetched successfully",
        "data": result
    }


# =========================================================
# ENGAGEMENT CHART
# =========================================================

@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db)
):
    result = get_engagement_chart(db)

    return {
        "message": "Engagement chart data fetched successfully",
        "data": result
    }


# =========================================================
# FOLLOWER GROWTH CHART
# =========================================================

@router.get("/chart/followers")
def follower_growth_chart(
    db: Session = Depends(get_db)
):
    result = get_follower_growth_chart(db)

    return {
        "message": "Follower growth chart data fetched successfully",
        "data": result
    }


# =========================================================
# PLATFORM COMPARISON
# =========================================================

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db)
):
    result = get_platform_comparison(db)

    return {
        "message": "Platform comparison fetched successfully",
        "data": result
    }

