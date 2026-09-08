from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)
from app.services.sponsorship_service import (
    get_sponsorship_summary,
    get_sponsorships_by_status,
    get_sponsorships_by_brand
)
router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"]
)


@router.post("/", response_model=SponsorshipResponse)
def create_sponsorship(
    sponsorship: SponsorshipCreate,
    db: Session = Depends(get_db)
):
    new_sponsorship = Sponsorship(**sponsorship.model_dump())

    db.add(new_sponsorship)
    db.commit()
    db.refresh(new_sponsorship)

    return new_sponsorship


@router.get("/", response_model=list[SponsorshipResponse])
def get_sponsorships(db: Session = Depends(get_db)):
    return db.query(Sponsorship).all()


@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
def get_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db)
):
    sponsorship = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id
    ).first()

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return sponsorship


@router.put("/{sponsorship_id}", response_model=SponsorshipResponse)
def update_sponsorship(
    sponsorship_id: int,
    data: SponsorshipUpdate,
    db: Session = Depends(get_db)
):
    sponsorship = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id
    ).first()

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(sponsorship, key, value)

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


@router.delete("/{sponsorship_id}")
def delete_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db)
):
    sponsorship = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id
    ).first()

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    db.delete(sponsorship)
    db.commit()

    return {"message": "Sponsorship deleted successfully"}
@router.get("/analytics/summary")
def sponsorship_summary(
    db: Session = Depends(get_db)
):
    return get_sponsorship_summary(db)


@router.get("/analytics/by-status")
def sponsorship_by_status(
    db: Session = Depends(get_db)
):
    return get_sponsorships_by_status(db)


@router.get("/analytics/by-brand")
def sponsorship_by_brand(
    db: Session = Depends(get_db)
):
    return get_sponsorships_by_brand(db)