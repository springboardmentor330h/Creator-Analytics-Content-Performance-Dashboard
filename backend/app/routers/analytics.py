from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import analytics_service
from app.services.access_service import resolve_creator_filter
from app.core.deps import get_current_user  # adjust path to wherever it's defined


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/content/{id}/engagement")
def content_engagement(
    id: int,
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    result = analytics_service.get_content_engagement(db, id, allowed=allowed)
    if result is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return result


@router.get("/top-content")
def top_content(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_top_performing_content(db, limit=5, allowed=allowed)


@router.get("/platform-performance")
def platform_performance(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_platform_performance(db, allowed)


@router.get("/summary")
def kpi_summary(platform: str | None = Query(None), 
                creator_id: int | None = Query(None),
                 db: Session = Depends(get_db), 
                 current_user=Depends(get_current_user)):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_kpi_summary_filtered(db, platform, allowed)

@router.get("/chart/engagement")
def engagement_chart(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_engagement_chart(db, allowed)


@router.get("/chart/followers")
def followers_chart(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_followers_chart(db, allowed)


@router.get("/platform-comparison")
def platform_comparison(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return analytics_service.get_platform_comparison(db, allowed)   