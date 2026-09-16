from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import assert_owner_or_admin, get_current_user
from app.db.database import get_db
from app.models.growth import Growth
from app.models.user import User, UserRole
from app.schemas.growth import GrowthCreate, GrowthResponse
from app.services.growth_service import get_growth_trend, get_platform_growth_comparison
from app.utils.responses import success_response

router = APIRouter(prefix="/growth", tags=["Growth"])


@router.post("/", response_model=dict, status_code=201)
def create_growth_record(
    payload: GrowthCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, payload.creator_id)

    record = Growth(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return success_response(
        data=GrowthResponse.model_validate(record).model_dump(),
        message="Growth record created successfully",
        status_code=201,
    )


@router.get("/", response_model=dict)
def get_all_growth(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Growth)

    if current_user.role != UserRole.ADMINISTRATOR:
        query = query.filter(Growth.creator_id == current_user.id)
    elif creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)

    records = [GrowthResponse.model_validate(r).model_dump() for r in query.all()]
    return success_response(data=records, message="Growth records retrieved successfully")


@router.delete("/{growth_id}", response_model=dict)
def delete_growth_record(
    growth_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Growth).filter(Growth.id == growth_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Growth record not found")

    assert_owner_or_admin(current_user, record.creator_id)

    db.delete(record)
    db.commit()

    return success_response(data={"id": growth_id}, message="Growth record deleted successfully")


# --- Analytics endpoints ---

analytics_router = APIRouter(prefix="/analytics", tags=["Growth Analytics"])


@analytics_router.get("/growth/{creator_id}")
def growth_trend(
    creator_id: int,
    platform: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return get_growth_trend(db, creator_id, platform)


@analytics_router.get("/growth/{creator_id}/platform-comparison")
def growth_platform_comparison(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, creator_id)
    return get_platform_growth_comparison(db, creator_id)
