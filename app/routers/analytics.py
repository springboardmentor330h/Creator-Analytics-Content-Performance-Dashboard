"""
Analytics routes.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/")
def analytics():
    """
    Temporary analytics endpoint.
    """

    return {
        "message": "Analytics endpoint"
    }