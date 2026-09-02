from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.social import (
    InstagramSyncRequest,
    PlatformConnectRequest,
    SyncRequest,
    YouTubeSyncRequest,
)
from app.services.instagram_service import InstagramService
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


@router.get("/youtube/channel")
def fetch_youtube_channel_by_name(channel_name: str, api_key: str | None = None):
    """Fetch live YouTube channel stats from a user-provided API key and channel name."""
    try:
        items = YouTubeService.fetch_channel_by_name(channel_name, api_key=api_key, max_results=1)
    except HTTPException as exc:
        return {
            "platform": "YouTube",
            "status": "error",
            "channel_name": channel_name,
            "channel": None,
            "error": exc.detail,
        }

    if not items:
        return {"platform": "YouTube", "status": "not_found", "channel_name": channel_name, "channel": None}

    channel = items[0]
    top_video_title = channel.get("top_video") or channel.get("title") or channel_name
    return {
        "platform": "YouTube",
        "status": "success",
        "channel_name": channel_name,
        "channel": {
            "id": channel.get("channel_id"),
            "title": top_video_title,
            "views": channel.get("views", 0),
            "likes": channel.get("likes", 0),
            "comments": channel.get("comments", 0),
            "shares": channel.get("shares", 0),
            "reach": channel.get("reach", 0),
            "subscribers": channel.get("subscribers", 0),
            "videos": channel.get("videos", 0),
            "top_video": top_video_title,
        },
    }


@router.get("/youtube/video")
def fetch_youtube_video_by_id(video_id: str, api_key: str | None = None):
    """Fetch live YouTube video stats by its ID."""
    try:
        items = YouTubeService.fetch_video_by_id(video_id, api_key=api_key)
    except HTTPException as exc:
        return {
            "platform": "YouTube",
            "status": "error",
            "video_id": video_id,
            "video": None,
            "error": exc.detail,
        }

    if not items:
        return {"platform": "YouTube", "status": "not_found", "video_id": video_id, "video": None}
    video = items[0]
    return {
        "platform": "YouTube",
        "status": "success",
        "video_id": video_id,
        "video": {
            "id": video["external_content_id"],
            "title": video["content_title"],
            "views": video["views"],
            "likes": video["likes"],
            "comments": video["comments"],
            "shares": video["shares"],
            "reach": video["reach"],
            "published_date": video["published_date"].isoformat() if video.get("published_date") else None,
        },
    }


@router.post("/youtube/sync", status_code=status.HTTP_200_OK)
def sync_youtube_data(payload: YouTubeSyncRequest, db: Session = Depends(get_db)):
    """Task 5: Synchronize real YouTube data into PostgreSQL."""
    return YouTubeService.sync_youtube_data(
        db=db,
        channel_id=payload.channel_id,
        creator_id=payload.creator_id,
        max_results=payload.max_results,
    )


@router.post("/instagram/sync", status_code=status.HTTP_200_OK)
def sync_instagram_data(payload: InstagramSyncRequest, db: Session = Depends(get_db)):
    """Synchronize Instagram data into the common CreatorIQ content model."""
    return InstagramService.sync_instagram_data(
        db=db,
        account_id=payload.account_id,
        access_token=payload.access_token,
        creator_id=payload.creator_id,
        max_results=payload.max_results,
    )