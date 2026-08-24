from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate
)
from app.services.revenue_service import (
    create_revenue,
    get_revenues,
    get_revenue_by_id,
    update_revenue,
    delete_revenue,
    get_total_revenue,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_trend
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


# --------------------------------------------------
# CREATE REVENUE
# POST /revenue
# --------------------------------------------------

@router.post("/")
def create_revenue_record(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db)
):
    revenue = create_revenue(
        db,
        revenue_data
    )

    return {
        "message": "Revenue created successfully",
        "data": revenue
    }


# --------------------------------------------------
# GET ALL REVENUE FOR CREATOR
# GET /revenue?creator_id=1
# --------------------------------------------------

@router.get("/")
def get_all_revenue(
    creator_id: int,
    db: Session = Depends(get_db)
):
    revenues = get_revenues(
        db,
        creator_id
    )

    return {
        "message": "Revenue records fetched successfully",
        "data": revenues
    }


# --------------------------------------------------
# GET REVENUE BY ID
# GET /revenue/{revenue_id}?creator_id=1
# --------------------------------------------------

@router.get("/{revenue_id}")
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

    return {
        "message": "Revenue record fetched successfully",
        "data": revenue
    }


# --------------------------------------------------
# UPDATE REVENUE
# PUT /revenue/{revenue_id}?creator_id=1
# --------------------------------------------------

@router.put("/{revenue_id}")
def update_revenue_record(
    revenue_id: int,
    creator_id: int,
    revenue_data: RevenueUpdate,
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

    updated_revenue = update_revenue(
        db,
        revenue,
        revenue_data
    )

    return {
        "message": "Revenue updated successfully",
        "data": updated_revenue
    }


# --------------------------------------------------
# DELETE REVENUE
# DELETE /revenue/{revenue_id}?creator_id=1
# --------------------------------------------------

@router.delete("/{revenue_id}")
def delete_revenue_record(
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

    delete_revenue(
        db,
        revenue
    )

    return {
        "message": "Revenue deleted successfully"
    }


# ==================================================
# REVENUE ANALYTICS
# ==================================================


# --------------------------------------------------
# TOTAL REVENUE
# GET /revenue/analytics/summary
# --------------------------------------------------

@router.get("/analytics/summary")
def revenue_summary(
    creator_id: int,
    db: Session = Depends(get_db)
):
    total = get_total_revenue(
        db,
        creator_id
    )

    return {
        "creator_id": creator_id,
        "total_revenue": total
    }


# --------------------------------------------------
# REVENUE BY SOURCE
# GET /revenue/analytics/by-source
# --------------------------------------------------

@router.get("/analytics/by-source")
def revenue_by_source(
    creator_id: int,
    db: Session = Depends(get_db)
):
    result = get_revenue_by_source(
        db,
        creator_id
    )

    return {
        "creator_id": creator_id,
        "revenue_by_source": result
    }


# --------------------------------------------------
# MONTHLY REVENUE
# GET /revenue/analytics/monthly
# --------------------------------------------------

@router.get("/analytics/monthly")
def monthly_revenue(
    creator_id: int,
    db: Session = Depends(get_db)
):
    result = get_monthly_revenue(
        db,
        creator_id
    )

    return {
        "creator_id": creator_id,
        "data": result
    }


# --------------------------------------------------
# REVENUE TREND
# GET /revenue/analytics/trend
# --------------------------------------------------

@router.get("/analytics/trend")
def revenue_trend(
    creator_id: int,
    db: Session = Depends(get_db)
):
    result = get_revenue_trend(
        db,
        creator_id
    )

    return {
        "creator_id": creator_id,
        "data": result
    }