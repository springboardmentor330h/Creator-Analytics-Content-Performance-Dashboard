from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import analytics_service

router = APIRouter()


# Task 2: Top-performing content
@router.get("/analytics/top-content")
def top_content(db: Session = Depends(get_db)):
    data = analytics_service.get_top_content(db, limit=5)
    return {
        "count": len(data),
        "data": data
    }


# Task 3: Platform performance comparison
@router.get("/analytics/platform-performance")
def platform_performance(db: Session = Depends(get_db)):
    return analytics_service.get_platform_performance(db)


# Task 4: Dashboard summary
@router.get("/analytics/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    return analytics_service.get_dashboard_summary(db)


# Task 1: Engagement rate for a single content item
@router.get("/analytics/content/{content_id}/engagement")
def content_engagement(content_id: int, db: Session = Depends(get_db)):
    result = analytics_service.get_content_engagement(db, content_id)
    if not result:
        raise HTTPException(status_code=404, detail="Content not found")
    return result