from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate
)
from app.services.sponsorship_service import (
    create_sponsorship,
    get_sponsorships,
    get_sponsorship_by_id,
    update_sponsorship,
    delete_sponsorship
)


router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"]
)


# --------------------------------------------------
# CREATE SPONSORSHIP
# POST /sponsorships/
# --------------------------------------------------

@router.post("/")
def create_sponsorship_record(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db)
):
    sponsorship = create_sponsorship(
        db,
        sponsorship_data
    )

    return {
        "message": "Sponsorship created successfully",
        "data": sponsorship
    }


# --------------------------------------------------
# GET ALL SPONSORSHIPS
# GET /sponsorships/?creator_id=1
# --------------------------------------------------

@router.get("/")
def get_all_sponsorships(
    creator_id: int,
    db: Session = Depends(get_db)
):
    sponsorships = get_sponsorships(
        db,
        creator_id
    )

    return {
        "message": "Sponsorship records fetched successfully",
        "data": sponsorships
    }


# --------------------------------------------------
# GET SPONSORSHIP BY ID
# GET /sponsorships/{sponsorship_id}?creator_id=1
# --------------------------------------------------

@router.get("/{sponsorship_id}")
def get_single_sponsorship(
    sponsorship_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
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

    return {
        "message": "Sponsorship record fetched successfully",
        "data": sponsorship
    }


# --------------------------------------------------
# UPDATE SPONSORSHIP
# PUT /sponsorships/{sponsorship_id}?creator_id=1
# --------------------------------------------------

@router.put("/{sponsorship_id}")
def update_sponsorship_record(
    sponsorship_id: int,
    creator_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db)
):
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

    updated_sponsorship = update_sponsorship(
        db,
        sponsorship,
        sponsorship_data
    )

    return {
        "message": "Sponsorship updated successfully",
        "data": updated_sponsorship
    }


# --------------------------------------------------
# DELETE SPONSORSHIP
# DELETE /sponsorships/{sponsorship_id}?creator_id=1
# --------------------------------------------------

@router.delete("/{sponsorship_id}")
def delete_sponsorship_record(
    sponsorship_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
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

    return {
        "message": "Sponsorship deleted successfully"
    }