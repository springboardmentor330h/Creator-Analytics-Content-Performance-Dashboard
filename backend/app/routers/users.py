from fastapi import APIRouter
from app.models.user import RoleEnum

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("/")
def list_roles():
    """Returns available roles for the frontend's role-selection screen."""
    return [r.value for r in RoleEnum]

