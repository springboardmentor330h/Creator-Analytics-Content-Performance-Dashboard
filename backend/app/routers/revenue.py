from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.core.auth import get_current_user

from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse
)

from app.services import revenue_service


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


# CREATE REVENUE
@router.post(
    "/",
    response_model=RevenueResponse,
    status_code=status.HTTP_201_CREATED
)
def create_revenue(
    revenue: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return revenue_service.create_revenue(
        db,
        revenue,
        current_user.id
    )


# GET ONLY CURRENT CREATOR'S REVENUE
@router.get(
    "/",
    response_model=List[RevenueResponse]
)
def get_all_revenues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return revenue_service.get_revenues_by_creator(
        db,
        current_user.id
    )


# GET ONE REVENUE
@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def get_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    revenue = revenue_service.get_revenue_by_id(
        db,
        revenue_id
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )

    # Ownership check
    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record"
        )

    return revenue


# UPDATE REVENUE
@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def update_revenue(
    revenue_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    revenue = revenue_service.get_revenue_by_id(
        db,
        revenue_id
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )

    # Ownership check
    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record"
        )

    updated_revenue = revenue_service.update_revenue(
        db,
        revenue_id,
        revenue_data
    )

    return updated_revenue


# DELETE REVENUE
@router.delete(
    "/{revenue_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    revenue = revenue_service.get_revenue_by_id(
        db,
        revenue_id
    )

    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )

    # Ownership check
    if revenue.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this revenue record"
        )

    revenue_service.delete_revenue(
        db,
        revenue_id
    )

    return None