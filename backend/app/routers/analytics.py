
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
def top_content(platform: Optional[str] = None, creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Task 2: Top 5 content items ranked by engagement rate.
    Pass ?platform=YouTube (or Instagram, etc.) to filter, or omit for all platforms.
    Pass ?creator_id=1 to scope to one creator, or omit for all creators.
    """
    return analytics_service.get_top_content(db, limit=5, platform=platform, creator_id=creator_id)


@router.get("/platform-performance")
def platform_performance(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Task 3: Platform-wise performance comparison (original endpoint name)."""
    return analytics_service.get_platform_performance(db, creator_id=creator_id)


@router.get("/platform-comparison")
def platform_comparison(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Multi-platform sprint: Platform-wise comparison, same data under the expected name."""
    return analytics_service.get_platform_comparison(db, creator_id=creator_id)


@router.get("/platforms")
def available_platforms(db: Session = Depends(get_db)):
    """Multi-platform sprint: distinct list of platforms currently in the content table, for dashboard dropdowns."""
    return analytics_service.get_available_platforms(db)


@router.get("/summary")
def dashboard_summary(platform: Optional[str] = None, creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Task 4: Full dashboard summary.
    Pass ?platform=YouTube (or Instagram, etc.) to filter, or omit for all platforms.
    Pass ?creator_id=1 to scope to one creator, or omit for all creators.
    """
    return analytics_service.get_dashboard_summary(db, platform=platform, creator_id=creator_id)


@router.get("/chart/engagement")
def chart_engagement(platform: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Engagement rate over time, chart-ready.
    Pass ?platform=YouTube (or Instagram, etc.) to filter, or omit for all platforms.
    """
    return analytics_service.get_engagement_chart(db, platform=platform)


@router.get("/chart/followers")
def chart_followers(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Follower growth over time, chart-ready."""
    return analytics_service.get_followers_chart(db, creator_id=creator_id)