from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import analytics_service

router = APIRouter()


@router.get("/analytics/top-content")
def top_content(db: Session = Depends(get_db)):
    data = analytics_service.get_top_content(db, limit=5)
    return {"count": len(data), "data": data}


@router.get("/analytics/platform-performance")
def platform_performance(db: Session = Depends(get_db)):
    return analytics_service.get_platform_performance(db)


@router.get("/analytics/summary")
def summary(db: Session = Depends(get_db)):
    return analytics_service.get_kpi_summary(db)


@router.get("/analytics/chart/engagement")
def chart_engagement(db: Session = Depends(get_db)):
    return analytics_service.get_engagement_chart(db)


@router.get("/analytics/chart/followers")
def chart_followers(db: Session = Depends(get_db)):
    return analytics_service.get_followers_chart(db)


@router.get("/analytics/platform-comparison")
def platform_comparison(db: Session = Depends(get_db)):
    return analytics_service.get_platform_comparison(db)


@router.get("/analytics/content/{content_id}/engagement")
def content_engagement(content_id: int, db: Session = Depends(get_db)):
    result = analytics_service.get_content_engagement(db, content_id)
    if not result:
        raise HTTPException(status_code=404, detail="Content not found")
    return result