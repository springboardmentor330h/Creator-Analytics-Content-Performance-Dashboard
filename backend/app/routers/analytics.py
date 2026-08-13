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
def dashboard_summary(db: Session = Depends(get_db)):
    return analytics_service.get_dashboard_summary(db)