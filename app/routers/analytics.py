from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Engagement Analytics"])


@router.get("/content/{content_id}/engagement")
def get_content_engagement(content_id: int, db: Session = Depends(get_db)):
    """Task 1: Fetch engagement metrics and rate for a specific content item."""
    data = AnalyticsService.get_content_engagement(db, content_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )
    return data


@router.get("/top-content")
def get_top_performing_content(
    limit: int = Query(
        default=5, ge=1, le=50, description="Number of top items to return"
    ),
    db: Session = Depends(get_db),
):
    """Task 2: Get top-performing content report sorted by engagement rate."""
    return AnalyticsService.get_top_performing_content(db, limit=limit)


@router.get("/platform-performance")
def get_platform_performance(db: Session = Depends(get_db)):
    """Task 3: Get aggregated analytics grouped by social media platform."""
    return AnalyticsService.get_platform_performance(db)


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Task 4: Get complete high-level dashboard summary report."""
    return AnalyticsService.get_dashboard_summary(db)