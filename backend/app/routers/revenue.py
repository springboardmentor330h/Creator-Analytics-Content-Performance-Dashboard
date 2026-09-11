# app/routers/revenue.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.revenue import RevenueRecord
from app.models.user import RoleEnum
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueOut
from app.services import revenue_service
from app.core.deps import get_current_user

router = APIRouter(prefix="/revenue", tags=["revenue"])


def _check_access(current_user, target_creator_id: int):
    """Centralized permission check."""
    if current_user.role != RoleEnum.admin and current_user.creator_id != target_creator_id:
        raise HTTPException(status_code=403, detail="Access denied")


# ── CREATE ───────────────────────────────────────────────────────────────

@router.post("", response_model=RevenueOut, status_code=201)
def create_revenue(payload: RevenueCreate, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user)):
    _check_access(current_user, payload.creator_id)
    record = RevenueRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── LIST (UI calls THIS) ─────────────────────────────────────────────────

@router.get("", response_model=list[RevenueOut])
def list_revenue(
    creator_id: int | None = Query(None, description="Filter by creator (admin only)"),
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    - Admin: sees all (or filtered by creator_id/platform)
    - Creator: sees only their own
    """
    query = db.query(RevenueRecord)

    if current_user.role == RoleEnum.admin:
        if creator_id:
            query = query.filter(RevenueRecord.creator_id == creator_id)
    else:
        # Creator always sees only their own
        query = query.filter(RevenueRecord.creator_id == current_user.creator_id)

    if platform:
        query = query.filter(RevenueRecord.platform == platform)

    return query.order_by(RevenueRecord.earned_date.desc()).all()


# ── GET BY CREATOR (explicit path) ───────────────────────────────────────

@router.get("/creator/{creator_id}", response_model=list[RevenueOut])
def get_revenue_for_creator(creator_id: int, db: Session = Depends(get_db),
                            current_user=Depends(get_current_user)):
    _check_access(current_user, creator_id)
    return (
        db.query(RevenueRecord)
        .filter(RevenueRecord.creator_id == creator_id)
        .order_by(RevenueRecord.earned_date.desc())
        .all()
    )


# ── GET BY ID ────────────────────────────────────────────────────────────

@router.get("/{id}", response_model=RevenueOut)
def get_revenue(id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    _check_access(current_user, record.creator_id)
    return record


# ── UPDATE ───────────────────────────────────────────────────────────────

@router.put("/{id}", response_model=RevenueOut)
def update_revenue(id: int, payload: RevenueUpdate, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    _check_access(current_user, record.creator_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


# ── DELETE ───────────────────────────────────────────────────────────────

@router.delete("/{id}")
def delete_revenue(id: int, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")
    _check_access(current_user, record.creator_id)
    db.delete(record)
    db.commit()
    return {"message": "Revenue record deleted successfully"}


# ── ANALYTICS ────────────────────────────────────────────────────────────

@router.get("/creator/{creator_id}/summary")
def revenue_summary(creator_id: int, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    _check_access(current_user, creator_id)
    return revenue_service.get_revenue_summary(db, creator_id)


@router.get("/creator/{creator_id}/monthly")
def monthly_revenue(creator_id: int, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user)):
    _check_access(current_user, creator_id)
    return revenue_service.get_monthly_revenue(db, creator_id)


@router.get("/creator/{creator_id}/trend")
def revenue_trend(creator_id: int, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    _check_access(current_user, creator_id)
    return revenue_service.get_revenue_trend(db, creator_id)   