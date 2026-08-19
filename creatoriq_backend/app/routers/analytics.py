from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
    get_engagement_chart,
    get_followers_chart,
    get_platform_comparison,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/content/{content_id}/engagement")
def get_engagement(
    content_id: int,
    db: Session = Depends(get_db),
):
    result = get_content_engagement(
        db,
        content_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return result

@router.get("/top-content")
def top_content(
    db: Session = Depends(get_db),
):
    return get_top_content(db)

@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db),
):
    return get_platform_performance(db)

@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db),
):
    return get_platform_comparison(db)

@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db),
):
    return get_engagement_chart(db)

@router.get("/chart/followers")
def followers_chart(
    db: Session = Depends(get_db),
):
    return get_followers_chart(db)

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(db)

