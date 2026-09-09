from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.analytics import (
    ContentEngagementResponse,
    TopContentResponse,
    PlatformPerformanceResponse,
    PlatformReachBreakdownResponse,
    DashboardSummaryResponse,
    ChartDataResponse
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/summary", response_model=DashboardSummaryResponse)
@router.get("/summary/", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_dashboard_summary(db, platform=platform, creator_id=current_user.id)

@router.get("/chart/engagement", response_model=ChartDataResponse)
@router.get("/chart/engagement/", response_model=ChartDataResponse)
def get_engagement_chart(
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_engagement_chart_data(db, platform=platform, creator_id=current_user.id)

@router.get("/chart/followers", response_model=ChartDataResponse)
@router.get("/chart/followers/", response_model=ChartDataResponse)
def get_follower_growth_chart(
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_follower_growth_chart_data(db, platform=platform, creator_id=current_user.id)

@router.get("/platform-comparison")
@router.get("/platform-comparison/")
def get_platform_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_platform_comparison(db, creator_id=current_user.id)

@router.get("/content/{id}/engagement", response_model=ContentEngagementResponse)
def get_content_engagement(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AnalyticsService.get_content_engagement(db, id, creator_id=current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return result

@router.get("/top-content", response_model=List[TopContentResponse])
@router.get("/top-content/", response_model=List[TopContentResponse])
def get_top_content(
    limit: int = 3,
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_top_performing_content(db, limit=limit, platform=platform, creator_id=current_user.id)

@router.get("/platform-performance", response_model=List[PlatformPerformanceResponse])
@router.get("/platform-performance/", response_model=List[PlatformPerformanceResponse])
def get_platform_performance(
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_platform_performance(db, platform=platform, creator_id=current_user.id)

from backend.app.services.sentiment_service import SentimentService

@router.get("/reach-breakdown", response_model=PlatformReachBreakdownResponse)
@router.get("/reach-breakdown/", response_model=PlatformReachBreakdownResponse)
def get_platform_reach_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnalyticsService.get_reach_breakdown(db, creator_id=current_user.id)

@router.get("/sentiment")
@router.get("/sentiment/")
def get_audience_sentiment(
    platform: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SentimentService.analyze_audience_sentiment(db, creator_id=current_user.id, platform=platform or "All")

