from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import social_media
from app.services.youtube_service import YouTubeAPIError

router = APIRouter(prefix="/social", tags=["Social Media Sync"])


class YouTubeSyncRequest(BaseModel):
    creator_id: int
    channel_id: str = Field(..., min_length=1)
    max_results: int = Field(10, ge=1, le=50)


@router.post("/youtube/sync")
def sync_youtube(payload: YouTubeSyncRequest, db: Session = Depends(get_db)):
    """
    Fetches recent videos for the given YouTube channel, transforms them
    into CreatorIQ's common content format, and stores/updates them in
    PostgreSQL. Re-running this for the same channel updates existing
    records instead of duplicating them.
    """
    try:
        result = social_media.sync_youtube_channel(
            db=db,
            creator_id=payload.creator_id,
            channel_id=payload.channel_id,
            max_results=payload.max_results,
        )
        return result

    except YouTubeAPIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error during sync: {str(e)}")