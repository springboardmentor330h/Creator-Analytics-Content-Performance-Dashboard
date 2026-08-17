from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.social import PlatformConnectRequest, SyncRequest
from app.services.social_media import SocialMediaService

router = APIRouter(prefix="/social", tags=["Social Media Integration"])


@router.post("/connect", status_code=status.HTTP_200_OK)
def connect_platform(payload: PlatformConnectRequest):
    """Task 6: Simulate platform connection."""
    return SocialMediaService.connect_platform(payload.platform, payload.account_name)


@router.get("/platforms")
def get_connected_platforms():
    """Task 7: Retrieve all currently connected platforms."""
    return SocialMediaService.get_connected_platforms()


@router.post("/sync", status_code=status.HTTP_200_OK)
def sync_platform_data(payload: SyncRequest, db: Session = Depends(get_db)):
    """Task 8: Synchronize platform metrics into PostgreSQL."""
    return SocialMediaService.sync_platform_data(db, payload.platform, payload.creator_id)