from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import assert_owner_or_admin, get_current_user
from app.db.database import get_db
from app.models.audience import Audience
from app.models.user import User, UserRole
from app.schemas.audience import AudienceCreate, AudienceResponse, AudienceUpdate
from app.services.audience_service import (
    get_active_hours,
    get_audience_demographics,
    get_top_locations,
)
from app.utils.responses import success_response

router = APIRouter(prefix="/audience", tags=["Audience"])


@router.post("/", response_model=dict, status_code=201)
def create_audience(
    payload: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, payload.creator_id)

    record = Audience(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return success_response(
        data=AudienceResponse.model_validate(record).model_dump(),
        message="Audience record created successfully",
        status_code=201,
    )


@router.get("/", response_model=dict)
def get_all_audience(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Audience)

    if current_user.role != UserRole.ADMINISTRATOR:
        # Non-admins are always scoped to themselves, regardless of what they passed.
        query = query.filter(Audience.creator_id == current_user.id)
    elif creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)

    records = [AudienceResponse.model_validate(r).model_dump() for r in query.all()]
    return success_response(data=records, message="Audience records retrieved successfully")


@router.put("/{audience_id}", response_model=dict)
def update_audience(
    audience_id: int,
    payload: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Audience).filter(Audience.id == audience_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")

    assert_owner_or_admin(current_user, record.creator_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return success_response(
        data=AudienceResponse.model_validate(record).model_dump(),
        message="Audience record updated successfully",
    )


@router.delete("/{audience_id}", response_model=dict)
def delete_audience(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Audience).filter(Audience.id == audience_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")

    assert_owner_or_admin(current_user, record.creator_id)

    db.delete(record)
    db.commit()

    return success_response(data={"id": audience_id}, message="Audience record deleted successfully")


# --- Analytics endpoints (mounted under /analytics/* to match the rest of the API) ---

analytics_router = APIRouter(prefix="/analytics", tags=["Audience Analytics"])


@analytics_router.get("/audience/{creator_id}")
def audience_demographics(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return get_audience_demographics(db, creator_id)


@analytics_router.get("/audience/{creator_id}/locations")
def audience_locations(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return get_top_locations(db, creator_id)


@analytics_router.get("/audience/{creator_id}/active-hours")
def audience_active_hours(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return get_active_hours(db, creator_id)
