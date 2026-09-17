from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.sponsorship import Sponsorship
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate
from app.core.auth import get_current_user

router = APIRouter()


def serialize_sponsorship(record: Sponsorship) -> dict:
    return {
        "id": record.id,
        "creator_id": record.creator_id,
        "brand_name": record.brand_name,
        "campaign_name": record.campaign_name,
        "contract_value": record.contract_value,
        "start_date": record.start_date,
        "end_date": record.end_date,
        "status": record.status,
        "payment_status": record.payment_status
    }


def sync_revenue_for_paid_sponsorship(db: Session, sponsorship: Sponsorship) -> None:
    """
    Ensures a paid sponsorship has a matching Revenue record. Called whenever a
    sponsorship is created or updated. Idempotent - if a revenue record for this
    exact sponsorship already exists, nothing new is created.
    """
    if sponsorship.payment_status != "paid":
        return

    description = f"{sponsorship.brand_name} - {sponsorship.campaign_name}"
    existing = db.query(Revenue).filter(
        Revenue.creator_id == sponsorship.creator_id,
        Revenue.source == "Sponsorship",
        Revenue.description == description,
    ).first()
    if existing:
        return

    revenue_entry = Revenue(
        creator_id=sponsorship.creator_id,
        source="Sponsorship",
        amount=sponsorship.contract_value,
        description=description,
        date=sponsorship.end_date or sponsorship.start_date or date.today(),
    )
    db.add(revenue_entry)
    db.commit()


@router.post("/sponsorships")
def create_sponsorship(
    record: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if record.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create sponsorships for yourself")

    new_record = Sponsorship(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    sync_revenue_for_paid_sponsorship(db, new_record)
    return serialize_sponsorship(new_record)


@router.get("/sponsorships")
def get_all_sponsorships(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(Sponsorship).filter(Sponsorship.creator_id == current_user.id).all()
    return [serialize_sponsorship(r) for r in records]


@router.get("/sponsorships/{sponsorship_id}")
def get_sponsorship(sponsorship_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id, Sponsorship.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    return serialize_sponsorship(record)


@router.put("/sponsorships/{sponsorship_id}")
def update_sponsorship(
    sponsorship_id: int,
    updated: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id, Sponsorship.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    sync_revenue_for_paid_sponsorship(db, record)
    return serialize_sponsorship(record)


@router.delete("/sponsorships/{sponsorship_id}")
def delete_sponsorship(sponsorship_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id, Sponsorship.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sponsorship not found")

    db.delete(record)
    db.commit()
    return {"message": "Sponsorship deleted successfully"}