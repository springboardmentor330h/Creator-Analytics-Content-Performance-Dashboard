from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.routers.content_analytics import db_content, calculate_engagement_rate
from app.schemas.content_analytics import ContentMetrics, ContentResponse
from app.services.youtube_service import fetch_youtube_video_data

router = APIRouter(prefix="/youtube", tags=["YouTube Integration"])


@router.post("/import/{video_id}", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def import_youtube_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Fetches live metrics for a YouTube video ID and imports it into Content Analytics."""
    yt_data = fetch_youtube_video_data(video_id)
    
    # Build metrics schema
    metrics = ContentMetrics(**yt_data["metrics"])
    metrics.engagement_rate = calculate_engagement_rate(metrics)

    # Store imported content in analytics DB
    from datetime import datetime, timezone
    content_entry = ContentResponse(
        content_id=f"yt_{video_id}",
        title=yt_data["title"],
        platform=yt_data["platform"],
        content_type=yt_data["content_type"],
        created_at=datetime.now(timezone.utc),
        metrics=metrics,
    )

    db_content[content_entry.content_id] = content_entry
    return content_entry