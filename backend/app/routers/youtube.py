from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.db.database import get_db
from backend.app.services.youtube_service import YouTubeService

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube Integration"]
)

@router.post("/sync/{channel_id}")
@router.post("/sync/{channel_id}/")
def sync_youtube_channel(channel_id: str, creator_id: int = 1, db: Session = Depends(get_db)):
    """
    Sync videos, reach, views, and subscriber growth metrics for a YouTube channel.
    """
    try:
        result = YouTubeService.sync_channel_content(db, channel_id=channel_id, creator_id=creator_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube Sync Error: {str(e)}"
        )

@router.post("/sync")
@router.post("/sync/")
def sync_youtube_channel_query(channel_id: str = Query(..., min_length=1), creator_id: int = 1, db: Session = Depends(get_db)):
    """
    Sync videos by query parameter `channel_id`.
    """
    try:
        result = YouTubeService.sync_channel_content(db, channel_id=channel_id, creator_id=creator_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube Sync Error: {str(e)}"
        )
