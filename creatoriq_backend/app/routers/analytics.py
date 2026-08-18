from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_kpi_summary,
    get_engagement_chart,
    get_follower_growth_chart,
    get_platform_comparison
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# ============================================================
# SPRINT 2
# CONTENT ENGAGEMENT
# ============================================================

@router.get("/content/{content_id}/engagement")
def content_engagement(
    content_id: int,
    db: Session = Depends(get_db)
):

    result = get_content_engagement(
        db,
        content_id
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return result


# ============================================================
# SPRINT 2
# TOP CONTENT
# ============================================================

@router.get("/top-content")
def top_content(
    db: Session = Depends(get_db)
):

    return get_top_content(db)


# ============================================================
# SPRINT 2
# PLATFORM PERFORMANCE
# ============================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db)
):

    return get_platform_performance(db)


# ============================================================
# SPRINT 4
# KPI SUMMARY
# ============================================================

@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db)
):

    return get_kpi_summary(db)


# ============================================================
# SPRINT 4
# ENGAGEMENT CHART
# ============================================================

@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db)
):

    return get_engagement_chart(db)


# ============================================================
# SPRINT 4
# FOLLOWER GROWTH CHART
# ============================================================

@router.get("/chart/followers")
def follower_growth_chart(
    db: Session = Depends(get_db)
):

    return get_follower_growth_chart(db)


# ============================================================
# SPRINT 4
# PLATFORM COMPARISON
# ============================================================

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db)
):

    return get_platform_comparison(db)