"""
Audience routes.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/audience",
    tags=["Audience"]
)


@router.get("/")
def audience():
    """
    Temporary audience endpoint.
    """

    return {
        "message": "Audience endpoint"
    }