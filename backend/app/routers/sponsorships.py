import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.revenue import SponsorshipStatus
from app.schemas.revenue import SponsorshipCreate, SponsorshipUpdate, SponsorshipResponse
from app.services import revenue_service

router = APIRouter(prefix="/api/sponsorships", tags=["Sponsorships"])


@router.post("/", response_model=SponsorshipResponse, status_code=status.HTTP_201_CREATED)
def create_sponsorship(
    data: SponsorshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return revenue_service.create_sponsorship(db, current_user.id, data)


@router.get("/", response_model=list[SponsorshipResponse])
def list_sponsorships(
    status_filter: Optional[SponsorshipStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return revenue_service.list_sponsorships(db, current_user.id, status_filter)


@router.get("/{sponsorship_id}", response_model=SponsorshipResponse)
def get_sponsorship(
    sponsorship_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsorship = revenue_service.get_sponsorship_by_id(db, sponsorship_id, current_user.id)
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsorship not found")
    return sponsorship


@router.put("/{sponsorship_id}", response_model=SponsorshipResponse)
def update_sponsorship(
    sponsorship_id: uuid.UUID,
    data: SponsorshipUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsorship = revenue_service.get_sponsorship_by_id(db, sponsorship_id, current_user.id)
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsorship not found")
    return revenue_service.update_sponsorship(db, sponsorship, data)


@router.delete("/{sponsorship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sponsorship(
    sponsorship_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sponsorship = revenue_service.get_sponsorship_by_id(db, sponsorship_id, current_user.id)
    if not sponsorship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsorship not found")
    revenue_service.delete_sponsorship(db, sponsorship)
