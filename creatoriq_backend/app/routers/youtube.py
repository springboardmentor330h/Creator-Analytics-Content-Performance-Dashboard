from fastapi import APIRouter, HTTPException

from app.services.youtube_service import get_video_details


router = APIRouter(
    prefix="/youtube",
    tags=["YouTube Analytics"],
)


@router.get("/video/{video_id}")
def get_video(video_id: str):

    video = get_video_details(video_id)

    if not video:
        raise HTTPException(
            status_code=404,
            detail="YouTube video not found",
        )

    return video