from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate, SponsorshipOut
from app.services import revenue_service
from app.core.deps import get_current_user, verify_creator_access
from app.services.access_service import get_allowed_creator_ids

router = APIRouter(prefix="/sponsorships", tags=["sponsorships"])


@router.post("", response_model=SponsorshipOut, status_code=201)
def create_sponsorship(payload: SponsorshipCreate, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user)):
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and payload.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this creator's data")
    record = Sponsorship(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/creator/{creator_id}", response_model=list[SponsorshipOut])
def get_sponsorships(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()


@router.get("/{id}", response_model=SponsorshipOut)
def get_sponsorship(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(Sponsorship).filter(Sponsorship.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this sponsorship")
    return record


@router.put("/{id}", response_model=SponsorshipOut)
def update_sponsorship(id: int, payload: SponsorshipUpdate, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user)):
    record = db.query(Sponsorship).filter(Sponsorship.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this sponsorship")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{id}")
def delete_sponsorship(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(Sponsorship).filter(Sponsorship.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this sponsorship")
    db.delete(record)
    db.commit()
    return {"message": "Sponsorship deleted successfully"}


@router.get("/creator/{creator_id}/summary")
def sponsorship_summary(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return revenue_service.get_sponsorship_summary(db, creator_id)