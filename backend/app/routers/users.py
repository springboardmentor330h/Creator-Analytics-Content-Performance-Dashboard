from fastapi import APIRouter, Depends
from app.models.user import RoleEnum, User
from app.routers.auth import get_current_user
from app.schemas.user import UserOut

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/")
def list_roles():
    """Returns available roles for the frontend's role-selection screen."""
    return [r.value for r in RoleEnum]


users_router = APIRouter(prefix="/users", tags=["Users"])


@users_router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user