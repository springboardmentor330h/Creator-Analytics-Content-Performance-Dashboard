"""
analytics.py

API routes for content analytics and engagement reporting.
All calculation logic lives in services/analytics_service.py — this file
only handles the HTTP layer (routes, request/response, DB session).
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import analytics_service

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/content/{id}/engagement")
def content_engagement(id: int, db: Session = Depends(get_db)):
    """Task 1: Engagement rate for one content item."""
    result = analytics_service.get_content_engagement(db, id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Content with id {id} not found")
    return result


@router.get("/top-content")
def top_content(db: Session = Depends(get_db)):
    """Task 2: Top 5 content items ranked by engagement rate."""
    return analytics_service.get_top_content(db, limit=5)


@router.get("/platform-performance")
def platform_performance(db: Session = Depends(get_db)):
    """Task 3: Platform-wise performance comparison (original endpoint name)."""
    return analytics_service.get_platform_performance(db)


@router.get("/platform-comparison")
def platform_comparison(db: Session = Depends(get_db)):
    """Sprint 5 Task 8: Platform-wise comparison, same data under the expected name."""
    return analytics_service.get_platform_comparison(db)


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """Task 4: Full dashboard summary."""
    return analytics_service.get_dashboard_summary(db)


@router.get("/chart/engagement")
def chart_engagement(db: Session = Depends(get_db)):
    """Sprint 5 Task 8: Engagement rate over time, chart-ready."""
    return analytics_service.get_engagement_chart(db)


@router.get("/chart/followers")
def chart_followers(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Sprint 5 Task 8: Follower growth over time, chart-ready."""
    return analytics_service.get_followers_chart(db, creator_id=creator_id)