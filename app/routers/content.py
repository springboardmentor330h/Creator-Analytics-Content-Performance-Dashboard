"""
Content routes.
"""

from fastapi import APIRouter


router = APIRouter(
    prefix="/content",
    tags=["Content"]
)


@router.get("/")
def content():
    """
    Temporary content endpoint.
    """

    return {
        "message": "Content endpoint"
    }