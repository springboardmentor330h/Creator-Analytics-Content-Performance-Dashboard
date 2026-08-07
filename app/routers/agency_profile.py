"""
Agency profile management.

A user with the AGENCY role can create, view, and update their own
extended profile (company name, website, contact person, description).
Administrators and Marketing Team members can view any agency's profile
(read-only) for partnership/analytics purposes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.db.database import get_db
from app.models.user import AgencyProfile, RoleEnum, User
from app.schemas.user import (
    AgencyProfileCreate,
    AgencyProfileResponse,
    AgencyProfileUpdate,
)

router = APIRouter(prefix="/agencies", tags=["Agency Profile"])


@router.post(
    "/profile",
    response_model=AgencyProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_agency_profile(
    profile_in: AgencyProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.AGENCY.value)),
):
    """
    Create the profile for the currently logged-in agency.
    Only one profile per user is allowed.
    """

    existing = (
        db.query(AgencyProfile)
        .filter(AgencyProfile.user_id == current_user.id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agency profile already exists. Use PUT /agencies/me to update it.",
        )

    profile = AgencyProfile(
        user_id=current_user.id,
        **profile_in.model_dump(),
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get("/me", response_model=AgencyProfileResponse)
def get_my_agency_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.AGENCY.value)),
):
    """Get the currently logged-in agency's own profile."""

    profile = (
        db.query(AgencyProfile)
        .filter(AgencyProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency profile not found. Create one with POST /agencies/profile.",
        )

    return profile


@router.put("/me", response_model=AgencyProfileResponse)
def update_my_agency_profile(
    profile_in: AgencyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.AGENCY.value)),
):
    """Update the currently logged-in agency's own profile (partial update)."""

    profile = (
        db.query(AgencyProfile)
        .filter(AgencyProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency profile not found. Create one with POST /agencies/profile.",
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/{user_id}", response_model=AgencyProfileResponse)
def get_agency_profile_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            RoleEnum.ADMINISTRATOR.value,
            RoleEnum.MARKETING_TEAM.value,
        )
    ),
):
    """
    Look up any agency's profile by their user ID.
    Restricted to Administrators and Marketing Team.
    """

    profile = (
        db.query(AgencyProfile)
        .filter(AgencyProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency profile not found.",
        )

    return profile
