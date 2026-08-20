from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user

from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)

from app.services.sponsorship_service import (
    get_creator_by_email,
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


@router.post(
    "",
    response_model=SponsorshipResponse,
    status_code=status.HTTP_201_CREATED
)
def create_sponsorship_api(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return create_sponsorship(
        db,
        sponsorship_data,
        user.id
    )


@router.get(
    "",
    response_model=list[SponsorshipResponse]
)
def get_sponsorship_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_all_sponsorships(
        db,
        user.id
    )


@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def get_sponsorship_by_id_api(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        user.id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found"
        )

    return sponsorship


@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def update_sponsorship_api(
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        user.id
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


@router.delete(
    "/{sponsorship_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_sponsorship_api(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        user.id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found"
        )

    delete_sponsorship(db, sponsorship)

    return None