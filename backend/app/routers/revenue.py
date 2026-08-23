from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueUpdate
from app.core.auth import get_current_user
from app.services import revenue_service

router = APIRouter()


def serialize_revenue(record: Revenue) -> dict:
    return {
        "id": record.id,
        "creator_id": record.creator_id,
        "source": record.source,
        "amount": record.amount,
        "description": record.description,
        "date": record.date
    }


# ----- Analytics (must come before /revenue/{id}) -----

@router.get("/analytics/revenue")
def revenue_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return revenue_service.get_revenue_summary(db, creator_id=current_user.id)


@router.get("/analytics/revenue/trend")
def revenue_trend(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return revenue_service.get_revenue_trend(db, creator_id=current_user.id)


# ----- CRUD -----

@router.post("/revenue")
def create_revenue(
    record: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if record.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create revenue records for yourself")

    new_record = Revenue(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return serialize_revenue(new_record)


@router.get("/revenue")
def get_all_revenue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(Revenue).filter(Revenue.creator_id == current_user.id).all()
    return [serialize_revenue(r) for r in records]


@router.get("/revenue/{revenue_id}")
def get_revenue(revenue_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(Revenue).filter(
        Revenue.id == revenue_id, Revenue.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    return serialize_revenue(record)


@router.put("/revenue/{revenue_id}")
def update_revenue(
    revenue_id: int,
    updated: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(Revenue).filter(
        Revenue.id == revenue_id, Revenue.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return serialize_revenue(record)


@router.delete("/revenue/{revenue_id}")
def delete_revenue(revenue_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(Revenue).filter(
        Revenue.id == revenue_id, Revenue.creator_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")

    db.delete(record)
    db.commit()
    return {"message": "Revenue record deleted successfully"}