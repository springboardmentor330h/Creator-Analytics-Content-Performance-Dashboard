from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.analytics import (
    ContentEngagementResponse,
    TopContentResponse,
    PlatformPerformanceResponse,
    DashboardSummaryResponse
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/content/{id}/engagement", response_model=ContentEngagementResponse)
def get_content_engagement(id: int, db: Session = Depends(get_db)):
    result = AnalyticsService.get_content_engagement(db, id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return result

@router.get("/top-content", response_model=List[TopContentResponse])
@router.get("/top-content/", response_model=List[TopContentResponse])
def get_top_content(limit: int = 3, db: Session = Depends(get_db)):
    return AnalyticsService.get_top_performing_content(db, limit=limit)

@router.get("/platform-performance", response_model=List[PlatformPerformanceResponse])
@router.get("/platform-performance/", response_model=List[PlatformPerformanceResponse])
def get_platform_performance(db: Session = Depends(get_db)):
    return AnalyticsService.get_platform_performance(db)

@router.get("/summary", response_model=DashboardSummaryResponse)
@router.get("/summary/", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_summary(db)
