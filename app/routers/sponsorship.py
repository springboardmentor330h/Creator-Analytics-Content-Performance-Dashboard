# CRUD Operations for Revenue
from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from typing import List
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate, SponsorshipResponse
from app.models.user import User

router = APIRouter(
    prefix="/sponsorship",
    tags=["Sponsorship"])

@router.post("/", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
def create_sponsorship(sponsorship: SponsorshipCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    creator_id = int(current_user_id)
    user = db.query(User).filter(User.id == creator_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Creator with id {creator_id} not found")

    db_sponsorship = Sponsorship(**sponsorship.model_dump(exclude={"creator_id"}), creator_id=creator_id)
    db.add(db_sponsorship)
    db.commit()
    db.refresh(db_sponsorship)
    return db_sponsorship

@router.get("/creator/{creator_id}", response_model=List[SponsorshipResponse])
def get_sponsorship_by_creator(creator_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if creator_id != int(current_user_id):
        raise HTTPException(status_code=403, detail="You cannot access another creator's sponsorships")
    sponsorships = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()
    if not sponsorships:
        raise HTTPException(status_code=404, detail=f"No sponsorship records found for creator with id {creator_id}")
    return sponsorships

@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
def get_sponsorship(sponsorship_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    sponsorship = db.query(Sponsorship).filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == int(current_user_id)).first()
    if not sponsorship:
        raise HTTPException(status_code=404, detail=f"Sponsorship with id {sponsorship_id} not found")
    return sponsorship

@router.put("/{sponsorship_id}", response_model=SponsorshipResponse)
def update_sponsorship(sponsorship_id: int, sponsorship_update: SponsorshipUpdate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    sponsorship = db.query(Sponsorship).filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == int(current_user_id)).first()
    if not sponsorship:
        raise HTTPException(status_code=404, detail=f"Sponsorship with id {sponsorship_id} not found")
    update_data = sponsorship_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sponsorship, key, value)

    db.commit()
    db.refresh(sponsorship)
    return sponsorship


@router.delete("/{sponsorship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sponsorship(sponsorship_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    sponsorship = db.query(Sponsorship).filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == int(current_user_id)).first()
    if not sponsorship:
        raise HTTPException(status_code=404, detail=f"Sponsorship with id {sponsorship_id} not found")
    db.delete(sponsorship)
    db.commit()