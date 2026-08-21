"""Router for Sponsorship campaign CRUD management."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipResponse,
    SponsorshipUpdate,
)
from app.services.sponsorship_service import (
    create_sponsorship,
    delete_sponsorship,
    get_creator_sponsorships,
    get_sponsorship,
    update_sponsorship,
)

router = APIRouter(prefix="/sponsorships", tags=["Sponsorships"])


@router.post("", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/api/sponsorships", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def add_sponsorship(
    payload: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SponsorshipResponse:
    """Create a new sponsorship record for the authenticated creator."""
    try:
        return create_sponsorship(db, current_user, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("", response_model=List[SponsorshipResponse])
@router.get("/", response_model=List[SponsorshipResponse], include_in_schema=False)
@router.get("/api/sponsorships", response_model=List[SponsorshipResponse], include_in_schema=False)
def list_sponsorships(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[SponsorshipResponse]:
    """Retrieve all sponsorship campaigns for the authenticated creator."""
    return get_creator_sponsorships(db, current_user, skip=skip, limit=limit)


@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
def get_single_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SponsorshipResponse:
    """Retrieve a single sponsorship campaign ensuring creator ownership."""
    sponsorship = get_sponsorship(db, current_user, sponsorship_id)
    if not sponsorship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found or access denied.",
        )
    return sponsorship


@router.put("/{sponsorship_id}", response_model=SponsorshipResponse)
def modify_sponsorship(
    sponsorship_id: int,
    payload: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SponsorshipResponse:
    """Update a sponsorship record ensuring creator ownership."""
    try:
        updated = update_sponsorship(db, current_user, sponsorship_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found or access denied.",
        )
    return updated


@router.delete("/{sponsorship_id}")
def remove_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Delete a sponsorship campaign ensuring creator ownership."""
    success = delete_sponsorship(db, current_user, sponsorship_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship record not found or access denied.",
        )
    return {"message": "Sponsorship record deleted successfully", "id": sponsorship_id}
