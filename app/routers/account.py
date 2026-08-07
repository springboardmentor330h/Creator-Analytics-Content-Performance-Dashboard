"""
Account settings.

Lets ANY logged-in user (Creator, Agency, Marketing Team, or
Administrator) manage their own account: update basic details or
change their password. This is distinct from the admin-only /users
CRUD endpoints, which manage other people's accounts.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.security import hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    AccountSettingsUpdate,
    PasswordChangeRequest,
    UserResponse,
)

router = APIRouter(prefix="/account", tags=["Account Settings"])


@router.get("/settings", response_model=UserResponse)
def get_my_account_settings(
    current_user: User = Depends(get_current_user),
):
    """Get the currently logged-in user's own account details."""
    return current_user


@router.put("/settings", response_model=UserResponse)
def update_my_account_settings(
    settings_in: AccountSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the currently logged-in user's own account details
    (full name and/or email). Role cannot be changed here — only an
    Administrator can change roles, via PUT /users/{user_id}.
    """

    update_data = settings_in.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] is not None:
        existing = (
            db.query(User)
            .filter(User.email == update_data["email"])
            .first()
        )

        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another account.",
            )

    for field, value in update_data.items():
        if value is not None:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/password", status_code=status.HTTP_200_OK)
def change_my_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the currently logged-in user's own password.
    Requires the current password to confirm identity.
    """

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password updated successfully."}
