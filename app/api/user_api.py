"""
Additional user API routes.

This file demonstrates how the JWT authentication
dependency can be reused in another API module.
"""

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/api/users",
    tags=["User API"]
)


@router.get("/profile")
def profile(
    current_user: User = Depends(
        get_current_user
    )
):
    """
    Return the authenticated user's profile.

    A valid JWT token is required.
    """

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }