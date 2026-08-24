from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipResponse,
    SponsorshipUpdate,
)
from app.services.sponsorship_service import (
    create_sponsorship,
    delete_sponsorship,
    get_sponsorship,
    get_sponsorships,
    update_sponsorship,
)


router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"],
)


@router.post(
    "",
    response_model=SponsorshipResponse,
    status_code=201,
)
def create_sponsorship_api(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db),
):
    return create_sponsorship(
        db,
        sponsorship_data,
    )


@router.get(
    "/creator/{creator_id}",
    response_model=list[SponsorshipResponse],
)
def list_sponsorships_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_sponsorships(
        db,
        creator_id,
    )


@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def get_sponsorship_api(
    sponsorship_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    sponsorship = get_sponsorship(
        db,
        sponsorship_id,
        creator_id,
    )

    if sponsorship is None:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found",
        )

    return sponsorship


@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def update_sponsorship_api(
    sponsorship_id: int,
    creator_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db),
):
    sponsorship = get_sponsorship(
        db,
        sponsorship_id,
        creator_id,
    )

    if sponsorship is None:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found",
        )

    return update_sponsorship(
        db,
        sponsorship,
        sponsorship_data,
    )


@router.delete(
    "/{sponsorship_id}",
)
def delete_sponsorship_api(
    sponsorship_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    sponsorship = get_sponsorship(
        db,
        sponsorship_id,
        creator_id,
    )

    if sponsorship is None:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship record not found",
        )

    delete_sponsorship(
        db,
        sponsorship,
    )

    return {
        "message": "Sponsorship deleted successfully",
    }