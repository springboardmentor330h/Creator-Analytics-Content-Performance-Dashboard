from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audience import AudienceData
from app.schemas.audience import AudienceCreate, AudienceUpdate, AudienceOut

router = APIRouter(prefix="/audience", tags=["audience"])


@router.post("", response_model=AudienceOut, status_code=201)
def create_audience_record(payload: AudienceCreate, db: Session = Depends(get_db)):
    record = AudienceData(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[AudienceOut])
def get_all_audience_records(db: Session = Depends(get_db)):
    return db.query(AudienceData).all()


@router.get("/{id}", response_model=AudienceOut)
def get_audience_record(id: int, db: Session = Depends(get_db)):
    record = db.query(AudienceData).filter(AudienceData.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    return record


@router.put("/{id}", response_model=AudienceOut)
def update_audience_record(id: int, payload: AudienceUpdate, db: Session = Depends(get_db)):
    record = db.query(AudienceData).filter(AudienceData.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{id}")
def delete_audience_record(id: int, db: Session = Depends(get_db)):
    record = db.query(AudienceData).filter(AudienceData.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    db.delete(record)
    db.commit()
    return {"message": "Audience record deleted successfully"}


@router.get("/creator/{creator_id}/latest", response_model=AudienceOut)
def latest_for_creator(creator_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(AudienceData)
        .filter(AudienceData.creator_id == creator_id)
        .order_by(AudienceData.recorded_date.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No audience data found for this creator")
    return record