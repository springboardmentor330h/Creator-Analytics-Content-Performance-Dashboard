from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.deps import get_current_user
from backend.app.services.revenue_service import RevenueService
from backend.app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse,
    RevenueSummaryResponse,
    RevenueSourceBreakdown,
    MonthlyRevenueItem,
    RevenueTrendItem
)

router = APIRouter(
    prefix="/revenue",
    tags=["Revenue Management"]
)

# ----------------------------------------------------
# Revenue Analytics Endpoints (Defined before /{revenue_id})
# ----------------------------------------------------

@router.get("/analytics/summary", response_model=RevenueSummaryResponse)
@router.get("/analytics/summary/", response_model=RevenueSummaryResponse)
def get_revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve complete executive revenue summary for the current creator."""
    return RevenueService.get_revenue_summary(db, current_user.id)


@router.get("/analytics/by-source", response_model=List[RevenueSourceBreakdown])
@router.get("/analytics/by-source/", response_model=List[RevenueSourceBreakdown])
def get_revenue_by_source(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve total earnings breakdown categorized by revenue stream."""
    return RevenueService.get_revenue_by_source(db, current_user.id)


@router.get("/analytics/monthly", response_model=List[MonthlyRevenueItem])
@router.get("/analytics/monthly/", response_model=List[MonthlyRevenueItem])
def get_monthly_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve monthly aggregated earnings data for trend visualization."""
    return RevenueService.get_monthly_revenue(db, current_user.id)


@router.get("/analytics/trends", response_model=List[RevenueTrendItem])
@router.get("/analytics/trends/", response_model=List[RevenueTrendItem])
def get_revenue_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve daily or chronological revenue trend data points."""
    return RevenueService.get_revenue_trends(db, current_user.id, days=days)


# ----------------------------------------------------
# Revenue CRUD Endpoints
# ----------------------------------------------------

@router.post("", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
def create_revenue(
    revenue_in: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a new revenue earnings entry for the current creator."""
    return RevenueService.create_revenue(db, current_user.id, revenue_in)


@router.get("", response_model=List[RevenueResponse])
@router.get("/", response_model=List[RevenueResponse])
def get_all_revenue(
    source: Optional[str] = Query(None, description="Filter by revenue source"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all revenue records belonging to the authenticated creator."""
    return RevenueService.get_revenues(
        db=db,
        creator_id=current_user.id,
        source=source,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/{revenue_id}", response_model=RevenueResponse)
def get_revenue_by_id(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific revenue record by ID."""
    revenue = RevenueService.get_revenue_by_id(db, current_user.id, revenue_id)
    if not revenue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )
    return revenue


@router.put("/{revenue_id}", response_model=RevenueResponse)
def update_revenue(
    revenue_id: int,
    revenue_in: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing revenue record."""
    updated = RevenueService.update_revenue(db, current_user.id, revenue_id, revenue_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )
    return updated


@router.delete("/{revenue_id}", status_code=status.HTTP_200_OK)
def delete_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a revenue record."""
    deleted = RevenueService.delete_revenue(db, current_user.id, revenue_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found"
        )
    return {"message": "Revenue record deleted successfully"}
