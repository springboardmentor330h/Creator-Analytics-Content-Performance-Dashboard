from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login():
    return {"message": "Login endpoint placeholder"}