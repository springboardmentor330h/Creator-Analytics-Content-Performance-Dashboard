from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.routers.auth import get_current_user

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


# =========================================================
# CREATE AUDIENCE
# =========================================================

@router.post("/audience")
def create_audience_record(
    audience_data: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_audience(db, audience_data)


# =========================================================
# GET MY AUDIENCE RECORDS
# =========================================================

@router.get("/audience")
def get_all_audience_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_audience(
        db,
        current_user.id
    )


# =========================================================
# GET MY AUDIENCE BY ID
# =========================================================

@router.get("/audience/{id}")
def get_audience_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_audience_by_id(
        db,
        id,
        current_user.id
    )


# =========================================================
# UPDATE MY AUDIENCE
# =========================================================

@router.put("/audience/{id}")
def update_audience_record(
    id: int,
    audience_data: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_audience(
        db,
        id,
        audience_data,
        current_user.id
    )


# =========================================================
# DELETE MY AUDIENCE
# =========================================================

@router.delete("/audience/{id}")
def delete_audience_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_audience(
        db,
        id,
        current_user.id
    )


# =========================================================
# AUDIENCE ANALYTICS
# =========================================================

@router.get("/analytics/audience")
def audience_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_audience_analytics(
        db,
        current_user.id
    )


# =========================================================
# GROWTH ANALYTICS
# =========================================================

@router.get("/analytics/growth")
def growth_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_growth_trend(
        db,
        current_user.id
    )


# =========================================================
# AUDIENCE TRENDS
# =========================================================

@router.get("/analytics/audience-trends")
def audience_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_audience_trends(
        db,
        current_user.id
    )