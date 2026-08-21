"""Router for Revenue CRUD management."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueResponse, RevenueUpdate
from app.services.revenue_service import (
    create_revenue,
    delete_revenue,
    get_creator_revenues,
    get_revenue_by_id,
    update_revenue,
)

router = APIRouter(prefix="/revenue", tags=["Revenue"])


@router.post("", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/api/revenue", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def add_revenue(
    payload: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RevenueResponse:
    """Create a new revenue record for the authenticated creator."""
    try:
        return create_revenue(db, current_user, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("", response_model=List[RevenueResponse])
@router.get("/", response_model=List[RevenueResponse], include_in_schema=False)
@router.get("/api/revenue", response_model=List[RevenueResponse], include_in_schema=False)
def list_revenues(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[RevenueResponse]:
    """Retrieve all revenue records for the authenticated creator."""
    return get_creator_revenues(db, current_user, skip=skip, limit=limit)


@router.get("/{revenue_id}", response_model=RevenueResponse)
def get_single_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RevenueResponse:
    """Retrieve a single revenue record ensuring creator ownership."""
    revenue = get_revenue_by_id(db, current_user, revenue_id)
    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found or access denied.",
        )
    return revenue


@router.put("/{revenue_id}", response_model=RevenueResponse)
def modify_revenue(
    revenue_id: int,
    payload: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RevenueResponse:
    """Update a revenue record ensuring creator ownership."""
    try:
        updated = update_revenue(db, current_user, revenue_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found or access denied.",
        )
    return updated


@router.delete("/{revenue_id}")
def remove_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Delete a revenue record ensuring creator ownership."""
    success = delete_revenue(db, current_user, revenue_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found or access denied.",
        )
    return {"message": "Revenue record deleted successfully", "id": revenue_id}
