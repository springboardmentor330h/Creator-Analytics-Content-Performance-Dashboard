"""
Revenue endpoints. Analytics routes declared before {revenue_id}, same
ordering discipline as content/audience/platforms routers.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.revenue import (
    RevenueCreate, RevenueUpdate, RevenueResponse,
    MonthlyRevenuePoint, RevenueByPlatform, RevenueBySource, RevenueKPISummary,
)
from app.services import revenue_service

router = APIRouter(prefix="/api/revenue", tags=["Revenue"])


@router.get("/analytics/summary", response_model=RevenueKPISummary)
def get_kpi_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return revenue_service.get_revenue_kpi_summary(db, current_user.id)


@router.get("/analytics/monthly-trend", response_model=list[MonthlyRevenuePoint])
def get_monthly_trend(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return revenue_service.get_monthly_revenue_trend(db, current_user.id)


@router.get("/analytics/by-platform", response_model=list[RevenueByPlatform])
def get_by_platform(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return revenue_service.get_revenue_by_platform(db, current_user.id)


@router.get("/analytics/by-type", response_model=list[RevenueBySource])
def get_by_type(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return revenue_service.get_revenue_by_type(db, current_user.id)


@router.post("/", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
def create_revenue(
    data: RevenueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return revenue_service.create_revenue(db, current_user.id, data)


@router.get("/", response_model=list[RevenueResponse])
def list_revenue(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return revenue_service.list_revenue(db, current_user.id, skip, limit)


@router.get("/{revenue_id}", response_model=RevenueResponse)
def get_revenue(
    revenue_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    revenue = revenue_service.get_revenue_by_id(db, revenue_id, current_user.id)
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revenue record not found")
    return revenue


@router.put("/{revenue_id}", response_model=RevenueResponse)
def update_revenue(
    revenue_id: uuid.UUID,
    data: RevenueUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    revenue = revenue_service.get_revenue_by_id(db, revenue_id, current_user.id)
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revenue record not found")
    return revenue_service.update_revenue(db, revenue, data)


@router.delete("/{revenue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_revenue(
    revenue_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    revenue = revenue_service.get_revenue_by_id(db, revenue_id, current_user.id)
    if not revenue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revenue record not found")
    revenue_service.delete_revenue(db, revenue)
