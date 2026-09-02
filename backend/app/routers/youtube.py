"""
YouTube integration endpoint. Triggers a sync of a creator's channel
stats and recent videos into the internal Content/AudienceGrowth tables.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.youtube import YouTubeSyncRequest, YouTubeSyncResponse
from app.services import sync_service

router = APIRouter(prefix="/api/youtube", tags=["YouTube Integration"])


@router.post("/sync", response_model=YouTubeSyncResponse)
async def sync_channel(
    request: YouTubeSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="YouTube integration is not configured. Set YOUTUBE_API_KEY in .env.",
        )

    result = await sync_service.sync_youtube_channel(db, current_user.id, request.channel_id)

    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result["error"])

    return result
