from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueResponse
from app.services import revenue_service

router = APIRouter(tags=["Revenue"])


@router.post("/revenue", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
def create_revenue(revenue: RevenueCreate, db: Session = Depends(get_db)):
    new_revenue = Revenue(**revenue.model_dump())
    db.add(new_revenue)
    db.commit()
    db.refresh(new_revenue)
    return new_revenue


@router.get("/revenue", response_model=List[RevenueResponse])
def get_all_revenue(creator_id: int, db: Session = Depends(get_db)):
    """creator_id is required so creators only see their own revenue data."""
    return db.query(Revenue).filter(Revenue.creator_id == creator_id).all()


@router.get("/revenue/{revenue_id}", response_model=RevenueResponse)
def get_revenue_by_id(revenue_id: int, creator_id: int, db: Session = Depends(get_db)):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id, Revenue.creator_id == creator_id)
        .first()
    )
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Revenue with id {revenue_id} not found")
    return revenue


@router.put("/revenue/{revenue_id}", response_model=RevenueResponse)
def update_revenue(revenue_id: int, creator_id: int, updates: RevenueUpdate, db: Session = Depends(get_db)):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id, Revenue.creator_id == creator_id)
        .first()
    )
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Revenue with id {revenue_id} not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(revenue, field, value)

    db.commit()
    db.refresh(revenue)
    return revenue


@router.delete("/revenue/{revenue_id}", status_code=status.HTTP_200_OK)
def delete_revenue(revenue_id: int, creator_id: int, db: Session = Depends(get_db)):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id, Revenue.creator_id == creator_id)
        .first()
    )
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Revenue with id {revenue_id} not found")

    db.delete(revenue)
    db.commit()
    return {"detail": f"Revenue with id {revenue_id} deleted successfully"}


@router.get("/analytics/revenue")
def revenue_summary(creator_id: int, db: Session = Depends(get_db)):
    return revenue_service.get_revenue_summary(db, creator_id)


@router.get("/analytics/revenue-trend")
def revenue_trend(creator_id: int, db: Session = Depends(get_db)):
    return revenue_service.get_revenue_trend(db, creator_id)