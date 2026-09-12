from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.revenue import RevenueRecord
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueOut
from app.services import revenue_service
from app.core.deps import get_current_user, verify_creator_access
from app.services.access_service import get_allowed_creator_ids

router = APIRouter(prefix="/revenue", tags=["revenue"])


@router.post("", response_model=RevenueOut, status_code=201)
def create_revenue(payload: RevenueCreate, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and payload.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this creator's data")
    record = RevenueRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/creator/{creator_id}", response_model=list[RevenueOut])
def get_revenue_for_creator(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()


@router.get("/{id}", response_model=RevenueOut)
def get_revenue(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this revenue record")
    return record


@router.put("/{id}", response_model=RevenueOut)
def update_revenue(id: int, payload: RevenueUpdate, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this revenue record")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{id}")
def delete_revenue(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this revenue record")
    db.delete(record)
    db.commit()
    return {"message": "Revenue record deleted successfully"}


@router.get("/creator/{creator_id}/summary")
def revenue_summary(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return revenue_service.get_revenue_summary(db, creator_id)


@router.get("/creator/{creator_id}/monthly")
def monthly_revenue(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return revenue_service.get_monthly_revenue(db, creator_id)


@router.get("/creator/{creator_id}/trend")
def revenue_trend(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return revenue_service.get_revenue_trend(db, creator_id)