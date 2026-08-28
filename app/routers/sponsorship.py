
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)

from app.services.sponsorship_service import (
    create_sponsorship,
    get_all_sponsorships,
    get_sponsorship_by_id,
    update_sponsorship,
    delete_sponsorship
)


router = APIRouter(
    prefix="/sponsorship",
    tags=["Sponsorship"]
)


# --------------------------------------------------
# 1. Create Sponsorship
# --------------------------------------------------

@router.post(
    "",
    response_model=SponsorshipResponse,
    status_code=status.HTTP_201_CREATED
)
def create_sponsorship_api(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return create_sponsorship(
        db,
        sponsorship_data,
        creator_id
    )


# --------------------------------------------------
# 2. Get All Sponsorships
# --------------------------------------------------

@router.get(
    "",
    response_model=list[SponsorshipResponse]
)
def get_sponsorship_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_all_sponsorships(
        db,
        creator_id
    )


# --------------------------------------------------
# 3. Get Sponsorship By ID
# --------------------------------------------------

@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def get_sponsorship_by_id_api(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        creator_id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found"
        )

    return sponsorship


# --------------------------------------------------
# 4. Update Sponsorship
# --------------------------------------------------

@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def update_sponsorship_api(
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        creator_id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found"
        )

    return update_sponsorship(
        db,
        sponsorship,
        sponsorship_data
    )


# --------------------------------------------------
# 5. Delete Sponsorship
# --------------------------------------------------

@router.delete(
    "/{sponsorship_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_sponsorship_api(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        creator_id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found"
        )

    delete_sponsorship(
        db,
        sponsorship
    )

    return None

