# CRUD Operations for Revenue
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueResponse
from app.models.user import User

router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"])

@router.post("/", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
def create_revenue(revenue: RevenueCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    creator_id = int(current_user_id)
    user = db.query(User).filter(User.id == creator_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Creator with id {creator_id} not found")
    
    db_revenue = Revenue(**revenue.model_dump(exclude={"creator_id"}), creator_id=creator_id)
    db.add(db_revenue)
    db.commit()
    db.refresh(db_revenue)
    return db_revenue

@router.get("/creator/{creator_id}", response_model=List[RevenueResponse])
def get_revenue_by_creator(creator_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if creator_id != int(current_user_id):
        raise HTTPException(status_code=403, detail="You cannot access another creator's revenue")
    revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
    if not revenues:
        raise HTTPException(status_code=404, detail=f"No revenue records found for creator with id {creator_id}")
    return revenues

@router.get("/{revenue_id}", response_model=RevenueResponse)
def get_revenue(revenue_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    revenue = db.query(Revenue).filter(Revenue.id == revenue_id, Revenue.creator_id == int(current_user_id)).first()
    if not revenue:
        raise HTTPException(status_code=404, detail=f"Revenue with id {revenue_id} not found")
    return revenue

@router.put("/{revenue_id}", response_model=RevenueResponse)
def update_revenue(revenue_id: int, revenue_update: RevenueUpdate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    revenue = db.query(Revenue).filter(Revenue.id == revenue_id, Revenue.creator_id == int(current_user_id)).first()
    if not revenue:
        raise HTTPException(status_code=404, detail=f"Revenue with id {revenue_id} not found")
    update_data = revenue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(revenue, key, value)
    
    db.commit()
    db.refresh(revenue)
    return revenue


@router.delete("/{revenue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_revenue(revenue_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    revenue = db.query(Revenue).filter(Revenue.id == revenue_id, Revenue.creator_id == int(current_user_id)).first()
    if not revenue:
        raise HTTPException(status_code=404, detail=f"Revenue with id {revenue_id} not found")
    db.delete(revenue)
    db.commit()