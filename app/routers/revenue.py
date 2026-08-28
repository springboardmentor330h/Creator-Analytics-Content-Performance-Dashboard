
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

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
    delete_revenue
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


@router.post(
    "",
    response_model=RevenueResponse,
    status_code=status.HTTP_201_CREATED
)
def create_revenue_api(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return create_revenue(
        db,
        revenue_data,
        creator_id
    )


@router.get(
    "",
    response_model=list[RevenueResponse]
)
def get_revenue_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_all_revenue(
        db,
        creator_id
    )


@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def get_revenue_by_id_api(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

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


@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def update_revenue_api(
    revenue_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

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

    return update_revenue(
        db,
        revenue,
        revenue_data
    )


@router.delete(
    "/{revenue_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_revenue_api(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

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

    return None

