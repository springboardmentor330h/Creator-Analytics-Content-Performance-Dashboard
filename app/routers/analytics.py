from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import analytics_service as svc

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/content/{content_id}/engagement")
def engagement(content_id: UUID, db: Session = Depends(get_db)):
    data = svc.content_engagement(db, content_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return data


@router.get("/top-content")
def top_content(
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return svc.top_content(db, platform=platform)


@router.get("/platform-performance")
def platform_performance(db: Session = Depends(get_db)):
    return svc.platform_performance(db)


@router.get("/summary")
def summary(
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
):
    data = svc.summary(db, platform=platform)
    kpi = svc.kpi_summary(db, platform=platform)
    return {**data, **kpi}


@router.get("/chart/engagement")
def chart_engagement(
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return svc.engagement_chart(db, platform=platform)


@router.get("/chart/followers")
def chart_followers(db: Session = Depends(get_db)):
    return svc.follower_chart(db)


@router.get("/platform-comparison")
def platform_comparison(db: Session = Depends(get_db)):
    return svc.platform_comparison(db)
