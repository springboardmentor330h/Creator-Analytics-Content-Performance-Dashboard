from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.services.analytics_service import get_follower_chart
from app.services.analytics_service import (
    calculate_engagement_rate,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
    get_kpi_summary,
    get_engagement_chart,
    get_platform_comparison,
    get_revenue_summary,
    get_revenue_by_source,
    get_monthly_revenue
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/content/{id}/engagement")
def get_content_engagement(
    id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    total_engagement, engagement_rate = calculate_engagement_rate(content)

    return {
        "content_id": content.id,
        "platform": content.platform,
        "views": content.views,
        "reach": content.reach,
        "total_engagement": total_engagement,
        "engagement_rate": engagement_rate
    }


@router.get("/top-content")
def get_top_performing_content(
    db: Session = Depends(get_db)
):
    return get_top_content(db)


@router.get("/platform-performance")
def platform_performance(
    db: Session = Depends(get_db)
):
    return get_platform_performance(db)


@router.get("/summary")
def kpi_summary(
    db: Session = Depends(get_db)
):
    return get_kpi_summary(db)


@router.get("/chart/engagement")
def engagement_chart(
    db: Session = Depends(get_db)
):
    return get_engagement_chart(db)
@router.get("/chart/followers")
def follower_chart(
    db: Session = Depends(get_db)
):
    return get_follower_chart(db)
@router.get("/platform-comparison")
def platform_comparison(
    db: Session = Depends(get_db)
):
    return get_platform_comparison(db)
@router.get("/revenue/summary")
def revenue_summary(
    db: Session = Depends(get_db)
):
    return get_revenue_summary(db)


@router.get("/revenue/by-source")
def revenue_by_source(
    db: Session = Depends(get_db)
):
    return get_revenue_by_source(db)


@router.get("/revenue/monthly")
def monthly_revenue(
    db: Session = Depends(get_db)
):
    return get_monthly_revenue(db)