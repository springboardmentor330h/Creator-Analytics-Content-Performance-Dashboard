from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.services import audience_service

router = APIRouter()

def serialize_audience(record: Audience) -> dict:
    return {
        "id": record.id,
        "creator_id": record.creator_id,
        "age_group": record.age_group,
        "gender": record.gender,
        "country": record.country,
        "city": record.city,
        "device_type": record.device_type,
        "active_hour": record.active_hour,
        "followers": record.followers,
        "impressions": record.impressions,
        "reach": record.reach
    }


# ----- Reports (must come before /audience/{id}) -----

@router.get("/analytics/audience")
def audience_report(db: Session = Depends(get_db)):
    return audience_service.get_audience_report(db)


@router.get("/analytics/growth")
def growth_report(db: Session = Depends(get_db)):
    return audience_service.get_growth_report(db, days=30)


@router.get("/analytics/audience-trends")
def audience_trends(db: Session = Depends(get_db)):
    return audience_service.get_audience_trends(db)


# ----- CRUD -----

@router.post("/audience")
def create_audience(record: AudienceCreate, db: Session = Depends(get_db)):
    new_record = Audience(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return serialize_audience(new_record)


@router.get("/audience")
def get_all_audience(db: Session = Depends(get_db)):
    records = db.query(Audience).all()
    return [serialize_audience(r) for r in records]


@router.get("/audience/{audience_id}")
def get_audience(audience_id: int, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == audience_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    return serialize_audience(record)


@router.put("/audience/{audience_id}")
def update_audience(audience_id: int, updated: AudienceUpdate, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == audience_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return serialize_audience(record)


@router.delete("/audience/{audience_id}")
def delete_audience(audience_id: int, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == audience_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")

    db.delete(record)
    db.commit()
    return {"message": "Audience record deleted successfully"}