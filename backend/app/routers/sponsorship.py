from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)
from app.services.sponsorship_service import (
    create_sponsorship,
    get_all_sponsorships,
    get_sponsorship,
    update_sponsorship,
    delete_sponsorship
)

router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"]
)


@router.post(
    "/",
    response_model=SponsorshipResponse,
    status_code=201
)
def create(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db)
):
    return create_sponsorship(db, sponsorship_data)


@router.get(
    "/",
    response_model=list[SponsorshipResponse]
)
def get_all(
    db: Session = Depends(get_db)
):
    return get_all_sponsorships(db)


@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def get_one(
    sponsorship_id: int,
    db: Session = Depends(get_db)
):
    sponsorship = get_sponsorship(
        db,
        sponsorship_id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return sponsorship


@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def update(
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db)
):
    sponsorship = update_sponsorship(
        db,
        sponsorship_id,
        sponsorship_data
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return sponsorship


@router.delete(
    "/{sponsorship_id}"
)
def delete(
    sponsorship_id: int,
    db: Session = Depends(get_db)
):
    sponsorship = delete_sponsorship(
        db,
        sponsorship_id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return {
        "message": "Sponsorship deleted successfully",
        "id": sponsorship_id
    }