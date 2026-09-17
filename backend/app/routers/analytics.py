from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.services import analytics_service

router = APIRouter()


@router.get("/analytics/top-content")
def top_content(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = analytics_service.get_top_content(db, creator_id=current_user.id, limit=5)
    return {"count": len(data), "data": data}


@router.get("/analytics/platform-performance")
def platform_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_platform_comparison(db, creator_id=current_user.id)


@router.get("/analytics/summary")
def summary(platform: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_kpi_summary(db, creator_id=current_user.id, platform=platform)


@router.get("/analytics/chart/engagement")
def chart_engagement(platform: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_engagement_chart(db, creator_id=current_user.id, platform=platform)

@router.get("/analytics/chart/followers")
def chart_followers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_followers_chart(db, creator_id=current_user.id)


@router.get("/analytics/content-growth")
def content_growth(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tracks volume of content published over time - distinct from follower growth."""
    return analytics_service.get_content_growth(db, creator_id=current_user.id, start_date=start_date, end_date=end_date)


@router.get("/analytics/platform-comparison")
def platform_comparison(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_service.get_platform_comparison(db, creator_id=current_user.id)


@router.get("/analytics/content/{content_id}/engagement")
def content_engagement(content_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = analytics_service.get_content_engagement(db, content_id, creator_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Content not found")
    return result
