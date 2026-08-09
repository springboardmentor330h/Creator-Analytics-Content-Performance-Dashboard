from fastapi import APIRouter, HTTPException

from app.services.content_analytics_service import (
    get_content_analytics,
)

router = APIRouter(
    prefix="/content-analytics",
    tags=["Content Analytics"],
)


@router.get("/youtube/{video_id}")
def get_youtube_content_analytics(video_id: str):

    analytics = get_content_analytics(video_id)

    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="Video not found",
        )

    return analytics