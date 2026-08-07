"""
Creator profile management.

A user with the CREATOR role can create, view, and update their own
extended profile (bio, niche, social links, follower count).
Administrators and Marketing Team members can view any creator's profile
(read-only) for analytics/outreach purposes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.db.database import get_db
from app.models.user import CreatorProfile, RoleEnum, User
from app.schemas.user import (
    CreatorProfileCreate,
    CreatorProfileResponse,
    CreatorProfileUpdate,
)

router = APIRouter(prefix="/creators", tags=["Creator Profile"])


@router.post(
    "/profile",
    response_model=CreatorProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_creator_profile(
    profile_in: CreatorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.CREATOR.value)),
):
    """
    Create the profile for the currently logged-in creator.
    Only one profile per user is allowed.
    """

    existing = (
        db.query(CreatorProfile)
        .filter(CreatorProfile.user_id == current_user.id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator profile already exists. Use PUT /creators/me to update it.",
        )

    profile = CreatorProfile(
        user_id=current_user.id,
        **profile_in.model_dump(),
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get("/me", response_model=CreatorProfileResponse)
def get_my_creator_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.CREATOR.value)),
):
    """Get the currently logged-in creator's own profile."""

    profile = (
        db.query(CreatorProfile)
        .filter(CreatorProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found. Create one with POST /creators/profile.",
        )

    return profile


@router.put("/me", response_model=CreatorProfileResponse)
def update_my_creator_profile(
    profile_in: CreatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.CREATOR.value)),
):
    """Update the currently logged-in creator's own profile (partial update)."""

    profile = (
        db.query(CreatorProfile)
        .filter(CreatorProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found. Create one with POST /creators/profile.",
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/{user_id}", response_model=CreatorProfileResponse)
def get_creator_profile_by_id(
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
    Look up any creator's profile by their user ID.
    Restricted to Administrators and Marketing Team (e.g. for outreach/analytics).
    """

    profile = (
        db.query(CreatorProfile)
        .filter(CreatorProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found.",
        )

    return profile
