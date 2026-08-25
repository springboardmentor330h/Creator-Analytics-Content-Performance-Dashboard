from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.audience import AudienceCreate, AudienceUpdate

from app.services.audience_service import (
    create_audience,
    get_all_audience,
    get_audience_by_id,
    update_audience,
    delete_audience,
    get_audience_analytics,
    get_growth_trend,
    get_audience_trends
)


router = APIRouter(tags=["Audience"])


@router.post("/audience")
def create_audience_record(
    audience_data: AudienceCreate,
    db: Session = Depends(get_db)
):
    return create_audience(db, audience_data)


@router.get("/audience")
def get_all_audience_records(
    db: Session = Depends(get_db)
):
    return get_all_audience(db)


@router.get("/audience/{id}")
def get_audience_record(
    id: int,
    db: Session = Depends(get_db)
):
    return get_audience_by_id(db, id)


@router.put("/audience/{id}")
def update_audience_record(
    id: int,
    audience_data: AudienceUpdate,
    db: Session = Depends(get_db)
):
    return update_audience(db, id, audience_data)


@router.delete("/audience/{id}")
def delete_audience_record(
    id: int,
    db: Session = Depends(get_db)
):
    return delete_audience(db, id)


@router.get("/analytics/audience")
def audience_analytics(
    db: Session = Depends(get_db)
):
    return get_audience_analytics(db)


@router.get("/analytics/growth")
def growth_analytics(
    db: Session = Depends(get_db)
):
    return get_growth_trend(db)


@router.get("/analytics/audience-trends")
def audience_trends(
    db: Session = Depends(get_db)
):
    return get_audience_trends(db)
