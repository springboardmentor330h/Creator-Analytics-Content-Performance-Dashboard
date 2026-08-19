from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    synchronize_platform,
)


router = APIRouter(
    prefix="/social",
    tags=["Social Media"],
)


class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


class SocialSyncRequest(BaseModel):
    platform: str


@router.post("/connect")
def connect_social_platform(
    request: SocialConnectRequest,
):
    result = connect_platform(
        request.platform,
        request.account_name,
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Unsupported platform",
        )

    return result


@router.get("/platforms")
def get_platforms():
    return {
        "platforms": get_connected_platforms()
    }


@router.post("/sync")
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db),
):
    if request.platform not in get_connected_platforms():
        raise HTTPException(
            status_code=400,
            detail="Platform is not connected",
        )

    result = synchronize_platform(
        db,
        request.platform,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No mock data available for this platform",
        )

    return result