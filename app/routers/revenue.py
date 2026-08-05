"""
Revenue routes.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


@router.get("/")
def revenue():
    """
    Temporary revenue endpoint.
    """

    return {
        "message": "Revenue endpoint"
    }