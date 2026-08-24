from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse,
    RevenueSummary,
    MonthlyRevenue,
    RevenueTrendPoint,
)
from app.services import revenue_service


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"],
)


# ============================================================
# CREATE REVENUE
# ============================================================

@router.post(
    "",
    response_model=RevenueResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_revenue(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_revenue = Revenue(
        creator_id=current_user.id,
        source=revenue_data.source.value,
        amount=revenue_data.amount,
        currency=revenue_data.currency,
        description=revenue_data.description,
        date=revenue_data.date,
    )

    db.add(new_revenue)
    db.commit()
    db.refresh(new_revenue)

    return new_revenue


# ============================================================
# GET ALL REVENUE (current creator only)
# ============================================================

@router.get(
    "",
    response_model=list[RevenueResponse],
)
def get_all_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenues = (
        db.query(Revenue)
        .filter(Revenue.creator_id == current_user.id)
        .order_by(Revenue.date.desc())
        .all()
    )

    return revenues


# ============================================================
# ANALYTICS — must be declared before "/{revenue_id}"
# so "analytics" is not parsed as an id
# ============================================================

@router.get(
    "/analytics/summary",
    response_model=RevenueSummary,
)
def revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return revenue_service.get_revenue_summary(db, current_user.id)


@router.get(
    "/analytics/monthly",
    response_model=list[MonthlyRevenue],
)
def monthly_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return revenue_service.get_monthly_revenue(db, current_user.id)


@router.get(
    "/analytics/trend",
    response_model=RevenueTrendPoint,
)
def revenue_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return revenue_service.get_revenue_trend(db, current_user.id)


# ============================================================
# GET REVENUE BY ID
# ============================================================

@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def get_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id)
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record",
        )

    return revenue


# ============================================================
# UPDATE REVENUE
# ============================================================

@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def update_revenue(
    revenue_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id)
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record",
        )

    update_data = revenue_data.model_dump(exclude_unset=True)

    if "source" in update_data and update_data["source"] is not None:
        update_data["source"] = update_data["source"].value if hasattr(
            update_data["source"], "value"
        ) else update_data["source"]

    for field, value in update_data.items():
        setattr(revenue, field, value)

    db.commit()
    db.refresh(revenue)

    return revenue


# ============================================================
# DELETE REVENUE
# ============================================================

@router.delete(
    "/{revenue_id}",
)
def delete_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id)
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record",
        )

    db.delete(revenue)
    db.commit()

    return {
        "message": "Revenue record deleted successfully",
        "revenue_id": revenue_id,
    }