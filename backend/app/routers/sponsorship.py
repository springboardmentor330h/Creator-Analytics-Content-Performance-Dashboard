from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate, SponsorshipResponse

router = APIRouter(tags=["Sponsorship"])


@router.post("/sponsorship", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
def create_sponsorship(sponsorship: SponsorshipCreate, db: Session = Depends(get_db)):
    new_sponsorship = Sponsorship(**sponsorship.model_dump())
    db.add(new_sponsorship)
    db.commit()
    db.refresh(new_sponsorship)
    return new_sponsorship


@router.get("/sponsorship", response_model=List[SponsorshipResponse])
def get_all_sponsorships(creator_id: int, db: Session = Depends(get_db)):
    return db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()


@router.get("/sponsorship/{sponsorship_id}", response_model=SponsorshipResponse)
def get_sponsorship_by_id(sponsorship_id: int, creator_id: int, db: Session = Depends(get_db)):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == creator_id)
        .first()
    )
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sponsorship with id {sponsorship_id} not found")
    return sponsorship


@router.put("/sponsorship/{sponsorship_id}", response_model=SponsorshipResponse)
def update_sponsorship(sponsorship_id: int, creator_id: int, updates: SponsorshipUpdate, db: Session = Depends(get_db)):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == creator_id)
        .first()
    )
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sponsorship with id {sponsorship_id} not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sponsorship, field, value)

    db.commit()
    db.refresh(sponsorship)
    return sponsorship


@router.delete("/sponsorship/{sponsorship_id}", status_code=status.HTTP_200_OK)
def delete_sponsorship(sponsorship_id: int, creator_id: int, db: Session = Depends(get_db)):
    sponsorship = (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == creator_id)
        .first()
    )
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sponsorship with id {sponsorship_id} not found")

    db.delete(sponsorship)
    db.commit()
    return {"detail": f"Sponsorship with id {sponsorship_id} deleted successfully"}