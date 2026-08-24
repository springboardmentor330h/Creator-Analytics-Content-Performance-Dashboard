from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.services.analytics_service import (
    get_content_engagement,
    get_top_performing_content,
    get_platform_performance,
    get_dashboard_summary
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# TASK 1 - Content Engagement
# =========================================================

@router.get("/content/{id}/engagement")
def content_engagement(
    id: int,
    db: Session = Depends(get_db)
):
    return get_content_engagement(
        db,
        id
    )


# =========================================================
# TASK 2 - Top 5 Performing Content
# =========================================================

@router.get("/top-content")
def top_performing_content(
    db: Session = Depends(get_db)
):
    return get_top_performing_content(
        db
    )


# =========================================================
# TASK 3 - Platform Performance Comparison
# =========================================================

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db)
):
    return get_platform_performance(
        db
    )


# =========================================================
# TASK 4 - Dashboard Summary
# =========================================================

@router.get("/dashboard-summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(
        db
    )