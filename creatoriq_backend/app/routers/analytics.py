from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_creator_scope
from app.models.user import User

from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_kpi_summary,
    get_engagement_chart,
    get_follower_growth_chart,
    get_platform_comparison,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ============================================================
# CONTENT ENGAGEMENT
# ============================================================

@router.get("/content/{content_id}/engagement")
def content_engagement(
    content_id: int,
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    result = get_content_engagement(
        db,
        content_id,
        creator_id=creator_id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return result


# ============================================================
# TOP CONTENT
# ============================================================

@router.get("/top-content")
def top_content(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_top_content(
        db,
        creator_id=creator_id,
    )


# ============================================================
# PLATFORM PERFORMANCE
# ============================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_platform_performance(
        db,
        creator_id=creator_id,
    )


# ============================================================
# KPI SUMMARY
# ============================================================

@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_kpi_summary(
        db,
        creator_id=creator_id,
    )


# ============================================================
# ENGAGEMENT CHART
# ============================================================

@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_engagement_chart(
        db,
        creator_id=creator_id,
    )


# ============================================================
# FOLLOWER GROWTH CHART
# ============================================================

@router.get("/chart/followers")
def follower_growth_chart(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_follower_growth_chart(
        db,
        creator_id=creator_id,
    )


# ============================================================
# PLATFORM COMPARISON
# ============================================================

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db),
    creator_id: int | None = Depends(get_creator_scope),
):

    return get_platform_comparison(
        db,
        creator_id=creator_id,
    )