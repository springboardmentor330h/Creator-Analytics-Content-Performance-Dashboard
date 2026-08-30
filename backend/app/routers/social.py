from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.social_media import (
    get_available_platforms,
    sync_platform_data
)


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


# Connect Social Media Platform
@router.post("/connect")
def connect_platform(request: SocialConnectRequest):

    return {
        "message": f"{request.platform} account connected successfully"
    }


# Get Connected Platforms
@router.get("/platforms")
def get_platforms():

    platforms = get_available_platforms()

    return {
        "platforms": platforms
    }


# Synchronize Platform Data
@router.post("/sync")
def sync_platform(
    platform: str,
    db: Session = Depends(get_db)
):
    result = sync_platform_data(db, platform)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Platform not found"
        )

    return {
        "message": f"{platform} data synchronized successfully",
        "synced_content": result
    }