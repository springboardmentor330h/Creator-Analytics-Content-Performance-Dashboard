from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.sponsorship import Sponsorship
from app.models.user import User
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse,
)


router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"],
)


# ============================================================
# CREATE SPONSORSHIP
# ============================================================

@router.post(
    "",
    response_model=SponsorshipResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sponsorship(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_sponsorship = Sponsorship(
        creator_id=current_user.id,
        brand_name=sponsorship_data.brand_name,
        campaign_name=sponsorship_data.campaign_name,
        contract_value=sponsorship_data.contract_value,
        start_date=sponsorship_data.start_date,
        end_date=sponsorship_data.end_date,
        status=sponsorship_data.status.value,
        payment_status=sponsorship_data.payment_status.value,
    )

    db.add(new_sponsorship)
    db.commit()
    db.refresh(new_sponsorship)

    return new_sponsorship


# ============================================================
# GET ALL SPONSORSHIPS (current creator only)
# ============================================================

@router.get(
    "",
    response_model=list[SponsorshipResponse],
)
def get_all_sponsorships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sponsorships = (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == current_user.id)
        .order_by(Sponsorship.start_date.desc())
        .all()
    )

    return sponsorships


# ============================================================
# GET SPONSORSHIP BY ID
# ============================================================

@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def get_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id)
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    if sponsorship.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this sponsorship",
        )

    return sponsorship


# ============================================================
# UPDATE SPONSORSHIP
# ============================================================

@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def update_sponsorship(
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id)
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    if sponsorship.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this sponsorship",
        )

    update_data = sponsorship_data.model_dump(exclude_unset=True)

    for field in ("status", "payment_status"):
        if field in update_data and update_data[field] is not None:
            value = update_data[field]
            update_data[field] = value.value if hasattr(value, "value") else value

    for field, value in update_data.items():
        setattr(sponsorship, field, value)

    if sponsorship.end_date and sponsorship.end_date < sponsorship.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date cannot be before start_date",
        )

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


# ============================================================
# DELETE SPONSORSHIP
# ============================================================

@router.delete(
    "/{sponsorship_id}",
)
def delete_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id)
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    if sponsorship.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this sponsorship",
        )

    db.delete(sponsorship)
    db.commit()

    return {
        "message": "Sponsorship deleted successfully",
        "sponsorship_id": sponsorship_id,
    }