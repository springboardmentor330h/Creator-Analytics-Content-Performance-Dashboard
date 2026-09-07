from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    synchronize_platform,
)
from app.services.youtube_service import synchronize_youtube_videos


router = APIRouter(
    prefix="/social",
    tags=["Social Media"],
)


# ---------------------------------------------------------
# Request schemas
# ---------------------------------------------------------

class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str = Field(min_length=1)


class SocialSyncRequest(BaseModel):
    platform: str
    creator_id: int = Field(gt=0)


class YouTubeSyncRequest(BaseModel):
    video_ids: list[str]
    creator_id: int = Field(gt=0)


# ---------------------------------------------------------
# Connect a social platform
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Get connected platforms
# ---------------------------------------------------------

@router.get("/platforms")
def get_platforms():
    return {
        "platforms": get_connected_platforms()
    }


# ---------------------------------------------------------
# Synchronize social-media platform data
# ---------------------------------------------------------

@router.post("/sync")
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db),
):
    try:
        result = synchronize_platform(
            db,
            request.platform,
            request.creator_id,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print("SOCIAL SYNC ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ---------------------------------------------------------
# Synchronize YouTube videos
# ---------------------------------------------------------

@router.post("/youtube/sync")
def sync_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db),
):
    if not request.video_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one YouTube video ID is required",
        )

    try:
        result = synchronize_youtube_videos(
            db,
            request.video_ids,
            request.creator_id,
        )

        return result

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to synchronize YouTube data",
        ) from exc