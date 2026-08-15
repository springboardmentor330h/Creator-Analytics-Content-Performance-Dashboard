from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate, AudienceOut
from app.schemas.growth import GrowthCreate, GrowthOut
from app.services import audience_service

router = APIRouter()


# ---- Audience CRUD ----

@router.post("/audience", response_model=AudienceOut, status_code=201)
def create_audience(payload: AudienceCreate, db: Session = Depends(get_db)):
    record = Audience(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/audience", response_model=list[AudienceOut])
def get_all_audience(db: Session = Depends(get_db)):
    return db.query(Audience).all()


@router.get("/audience/{id}", response_model=AudienceOut)
def get_audience(id: int, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    return record


@router.put("/audience/{id}", response_model=AudienceOut)
def update_audience(id: int, payload: AudienceUpdate, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/audience/{id}")
def delete_audience(id: int, db: Session = Depends(get_db)):
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    db.delete(record)
    db.commit()
    return {"message": "Audience record deleted successfully"}


# ---- Growth CRUD (needed to populate data for the reports below) ----

@router.post("/growth", response_model=GrowthOut, status_code=201)
def create_growth(payload: GrowthCreate, db: Session = Depends(get_db)):
    record = Growth(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/growth", response_model=list[GrowthOut])
def get_all_growth(db: Session = Depends(get_db)):
    return db.query(Growth).order_by(Growth.date.asc()).all()


# ---- Analytics reports ----

@router.get("/analytics/audience")
def audience_report(db: Session = Depends(get_db)):
    return audience_service.get_audience_report(db)


@router.get("/analytics/growth")
def growth_report(db: Session = Depends(get_db)):
    return audience_service.get_growth_report(db, days=30)


@router.get("/analytics/audience-trends")
def audience_trends(db: Session = Depends(get_db)):
    return audience_service.get_audience_trends(db)