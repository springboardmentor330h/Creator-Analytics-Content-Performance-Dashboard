from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.deps import get_current_user
from backend.app.services.sponsorship_service import SponsorshipService
from backend.app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)

router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorship Management"]
)


@router.post("", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
def create_sponsorship(
    sponsorship_in: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sponsorship deal for the authenticated creator."""
    return SponsorshipService.create_sponsorship(db, current_user.id, sponsorship_in)


@router.get("", response_model=List[SponsorshipResponse])
@router.get("/", response_model=List[SponsorshipResponse])
def get_all_sponsorships(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by deal status (e.g. Active, Completed)"),
    payment_status_filter: Optional[str] = Query(None, alias="payment_status", description="Filter by payment status (e.g. Paid, Unpaid)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all sponsorship contracts for the current creator."""
    return SponsorshipService.get_sponsorships(
        db=db,
        creator_id=current_user.id,
        status=status_filter,
        payment_status=payment_status_filter
    )


@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
def get_sponsorship_by_id(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific sponsorship contract by ID."""
    sponsorship = SponsorshipService.get_sponsorship_by_id(db, current_user.id, sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found"
        )
    return sponsorship


@router.put("/{sponsorship_id}", response_model=SponsorshipResponse)
def update_sponsorship(
    sponsorship_id: int,
    sponsorship_in: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update details of an existing sponsorship contract."""
    updated = SponsorshipService.update_sponsorship(db, current_user.id, sponsorship_id, sponsorship_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found"
        )
    return updated


@router.delete("/{sponsorship_id}", status_code=status.HTTP_200_OK)
def delete_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sponsorship record."""
    deleted = SponsorshipService.delete_sponsorship(db, current_user.id, sponsorship_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found"
        )
    return {"message": "Sponsorship record deleted successfully"}
