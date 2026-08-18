from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/content/{id}/engagement")
def content_engagement(id: int, db: Session = Depends(get_db)):
    result = analytics_service.get_content_engagement(db, id)
    if result is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return result


@router.get("/top-content")
def top_content(db: Session = Depends(get_db)):
    return analytics_service.get_top_performing_content(db, limit=5)


@router.get("/platform-performance")
def platform_performance(db: Session = Depends(get_db)):
    return analytics_service.get_platform_performance(db)



@router.get("/summary")
def kpi_summary(db: Session = Depends(get_db)):
    return analytics_service.get_kpi_summary(db)


@router.get("/chart/engagement")
def engagement_chart(db: Session = Depends(get_db)):
    return analytics_service.get_engagement_chart(db)


@router.get("/chart/followers")
def followers_chart(db: Session = Depends(get_db)):
    return analytics_service.get_followers_chart(db)


@router.get("/platform-comparison")
def platform_comparison(db: Session = Depends(get_db)):
    return analytics_service.get_platform_comparison(db)