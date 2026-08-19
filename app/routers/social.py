from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.social import (
    PlatformConnectRequest,
    SyncRequest,
    YouTubeSyncRequest,
)
from app.services.social_media import SocialMediaService
from app.services.youtube_service import YouTubeService

router = APIRouter(prefix="/social", tags=["Social Media Integration"])


@router.post("/connect", status_code=status.HTTP_200_OK)
def connect_platform(payload: PlatformConnectRequest):
    return SocialMediaService.connect_platform(payload.platform, payload.account_name)


@router.get("/platforms")
def get_connected_platforms():
    return SocialMediaService.get_connected_platforms()


@router.post("/sync", status_code=status.HTTP_200_OK)
def sync_platform_data(payload: SyncRequest, db: Session = Depends(get_db)):
    return SocialMediaService.sync_platform_data(
        db, payload.platform, payload.creator_id
    )


@router.post("/youtube/sync", status_code=status.HTTP_200_OK)
def sync_youtube_data(payload: YouTubeSyncRequest, db: Session = Depends(get_db)):
    """Task 5: Synchronize real YouTube data into PostgreSQL."""
    return YouTubeService.sync_youtube_data(
        db=db,
        channel_id=payload.channel_id,
        creator_id=payload.creator_id,
        max_results=payload.max_results,
    )