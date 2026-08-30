from typing import Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


def _verify_creator_exists(db: Session, creator_id: int) -> None:
    """Helper function to check if a creator exists before running queries."""
    creator = db.query(User).filter(User.id == creator_id).first()
    if not creator:
        raise HTTPException(
            status_code=404,
            detail=f"Creator with id {creator_id} not found",
        )


@router.get(
    "/summary",
    summary="Get KPI Summary",
    description="Retrieves total views, likes, reach, and average engagement rate for a creator.",
)
def get_kpi_summary(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    platform: str = Query("All", description="Optional platform filter: All, YouTube, Instagram"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_kpi_summary(db, creator_id=creator_id, platform=platform)


@router.get(
    "/engagement-chart",
    summary="Get Engagement Rate Over Time",
    description="Returns dates and corresponding engagement rates for line chart display.",
)
def get_engagement_chart_data(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_engagement_chart_data(db, creator_id=creator_id)


@router.get(
    "/follower-growth-chart",
    summary="Get Follower Growth Over Time",
    description="Returns dates and follower count trends for visual tracking.",
)
def get_follower_growth_chart_data(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_follower_growth_chart_data(db, creator_id=creator_id)


@router.get(
    "/platform-comparison",
    summary="Get Multi-Platform Breakdown",
    description="Returns comparative engagement and view counts aggregated by social platform.",
)
def get_platform_comparison(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    platform: str = Query("All", description="Optional platform filter: All, YouTube, Instagram"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_platform_comparison(db, creator_id=creator_id, platform=platform)