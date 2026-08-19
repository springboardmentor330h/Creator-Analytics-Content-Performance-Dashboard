from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.content import Content
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


@router.get("/summary")
def get_kpi_summary(db: Session = Depends(get_db)):
    """Task 1: Return key performance indicator summary."""
    return AnalyticsService.get_kpi_summary(db)


@router.get("/chart/engagement")
def get_engagement_chart(db: Session = Depends(get_db)):
    """Task 2: Return engagement rate time-series chart data."""
    return AnalyticsService.get_engagement_chart_data(db)


@router.get("/chart/followers")
def get_follower_chart(db: Session = Depends(get_db)):
    """Task 3: Return follower growth time-series chart data."""
    return AnalyticsService.get_follower_growth_chart_data(db)


@router.get("/platform-comparison")
def get_platform_comparison(db: Session = Depends(get_db)):
    """Task 4: Return platform performance comparison metrics."""
    return AnalyticsService.get_platform_comparison(db)

@staticmethod
def get_top_content(db: Session, creator_id: int = 1, limit: int = 5):
    return (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.views.desc())
        .limit(limit)
        .all()
    )

@router.get("/top-content")
def get_top_content_endpoint(db: Session = Depends(get_db), creator_id: int = 1, limit: int = 5):
    return get_top_content(db, creator_id, limit)