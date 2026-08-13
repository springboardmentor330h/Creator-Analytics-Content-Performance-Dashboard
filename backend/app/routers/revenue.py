from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.revenue import RevenueRecord
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueOut, RevenueSummary

router = APIRouter(prefix="/revenue", tags=["revenue"])


@router.post("", response_model=RevenueOut, status_code=201)
def create_revenue(payload: RevenueCreate, db: Session = Depends(get_db)):
    record = RevenueRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[RevenueOut])
def get_all_revenue(db: Session = Depends(get_db)):
    return db.query(RevenueRecord).all()


@router.get("/{id}", response_model=RevenueOut)
def get_revenue(id: int, db: Session = Depends(get_db)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    return record


@router.put("/{id}", response_model=RevenueOut)
def update_revenue(id: int, payload: RevenueUpdate, db: Session = Depends(get_db)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{id}")
def delete_revenue(id: int, db: Session = Depends(get_db)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    db.delete(record)
    db.commit()
    return {"message": "Revenue record deleted successfully"}


@router.get("/creator/{creator_id}/summary", response_model=RevenueSummary)
def revenue_summary(creator_id: int, db: Session = Depends(get_db)):
    records = db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()
    total = sum(r.amount for r in records)

    by_source = {}
    for r in records:
        by_source[r.source] = by_source.get(r.source, 0) + r.amount

    by_platform = {}
    for r in records:
        by_platform[r.platform] = by_platform.get(r.platform, 0) + r.amount

    return RevenueSummary(
        total_earnings=round(total, 2),
        by_source={k: round(v, 2) for k, v in by_source.items()},
        by_platform={k: round(v, 2) for k, v in by_platform.items()},
        record_count=len(records),
    )