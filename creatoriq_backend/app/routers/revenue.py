from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.revenue import (
    RevenueCreate,
    RevenueResponse,
    RevenueUpdate,
)
from app.services.revenue_service import (
    create_revenue,
    delete_revenue,
    get_revenue,
    get_revenues,
    update_revenue,
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"],
)


@router.post(
    "",
    response_model=RevenueResponse,
    status_code=201,
)
def create_revenue_api(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db),
):
    return create_revenue(
        db,
        revenue_data,
    )


@router.get(
    "/creator/{creator_id}",
    response_model=list[RevenueResponse],
)
def list_revenue_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_revenues(
        db,
        creator_id,
    )


@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def get_revenue_api(
    revenue_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    revenue = get_revenue(
        db,
        revenue_id,
        creator_id,
    )

    if revenue is None:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found",
        )

    return revenue


@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def update_revenue_api(
    revenue_id: int,
    creator_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db),
):
    revenue = get_revenue(
        db,
        revenue_id,
        creator_id,
    )

    if revenue is None:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found",
        )

    return update_revenue(
        db,
        revenue,
        revenue_data,
    )


@router.delete(
    "/{revenue_id}",
)
def delete_revenue_api(
    revenue_id: int,
    creator_id: int,
    db: Session = Depends(get_db),
):
    revenue = get_revenue(
        db,
        revenue_id,
        creator_id,
    )

    if revenue is None:
        raise HTTPException(
            status_code=404,
            detail="Revenue record not found",
        )

    delete_revenue(
        db,
        revenue,
    )

    return {
        "message": "Revenue deleted successfully",
    }