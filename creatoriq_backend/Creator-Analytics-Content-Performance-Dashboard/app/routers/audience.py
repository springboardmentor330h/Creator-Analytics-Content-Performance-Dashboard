# Audience router placeholder
from fastapi import APIRouter

router = APIRouter(prefix="/audience", tags=["Audience"])


@router.get("/")
def get_audience():
    return {"message": "Audience endpoint placeholder"}