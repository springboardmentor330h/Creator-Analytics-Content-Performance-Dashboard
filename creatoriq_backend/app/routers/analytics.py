from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/content/{id}/engagement")
def get_engagement(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    data = get_content_engagement(db, current_user, id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return data

@router.get("/top-content")
def top_content(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_top_content(db, current_user)

@router.get("/platform-performance")
def platform_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_platform_performance(db, current_user)

@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_dashboard_summary(db, current_user)
