from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse
)

from app.services.revenue_service import (
    create_revenue,
    get_all_revenue,
    get_revenue_by_id,
    update_revenue,
    delete_revenue,
    get_revenue_summary,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_dashboard
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


# =========================================================
# REVENUE ANALYTICS
# =========================================================

# Revenue Summary
@router.get("/analytics/summary")
def revenue_summary(
    db: Session = Depends(get_db)
):
    return get_revenue_summary(db)


# Revenue by Source
@router.get("/analytics/by-source")
def revenue_by_source(
    db: Session = Depends(get_db)
):
    return get_revenue_by_source(db)


# Monthly Revenue
@router.get("/analytics/monthly")
def monthly_revenue(
    db: Session = Depends(get_db)
):
    return get_monthly_revenue(db)


# Revenue Dashboard
@router.get("/analytics/dashboard")
def revenue_dashboard(
    db: Session = Depends(get_db)
):
    return get_revenue_dashboard(db)


# =========================================================
# REVENUE CRUD
# =========================================================

# Create Revenue
@router.post(
    "",
    response_model=RevenueResponse,
    status_code=201
)
def add_revenue(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db)
):
    return create_revenue(db, revenue_data)


# Get All Revenue for Creator
@router.get(
    "/creator/{creator_id}",
    response_model=list[RevenueResponse]
)
def get_creator_revenue(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return get_all_revenue(db, creator_id)


# Get Revenue by ID
@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def get_single_revenue(
    revenue_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    revenue = get_revenue_by_id(
        db,
        revenue_id,
        creator_id
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found"
        )

    return revenue


# Update Revenue
@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def edit_revenue(
    revenue_id: int,
    creator_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db)
):
    revenue = update_revenue(
        db,
        revenue_id,
        creator_id,
        revenue_data
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found"
        )

    return revenue


# Delete Revenue
@router.delete("/{revenue_id}")
def remove_revenue(
    revenue_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    revenue = delete_revenue(
        db,
        revenue_id,
        creator_id
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found"
        )

    return {
        "message": "Revenue deleted successfully"
    }
