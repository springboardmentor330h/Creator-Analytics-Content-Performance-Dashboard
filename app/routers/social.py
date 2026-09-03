from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.social import (
    InstagramManualPostRequest,
    InstagramSyncRequest,
    LinkedInManualPostRequest,
    PlatformConnectRequest,
    SyncRequest,
    YouTubeSyncRequest,
)
from app.models.content import ContentItem
from app.services.instagram_service import InstagramService
from app.services.social_media import SocialMediaService
from app.services.youtube_service import YouTubeService

router = APIRouter(prefix="/social", tags=["Social Media Integration"])


def _save_manual_platform_post(db: Session, platform: str, payload: InstagramManualPostRequest | LinkedInManualPostRequest):
    existing = db.query(ContentItem).filter(
        ContentItem.platform == platform,
        ContentItem.content_id == payload.content_id,
    ).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{platform} content_id already exists. Use a new content_id to avoid double-counting.",
        )
    item = ContentItem(platform=platform, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "platform": platform,
        "status": "success",
        "message": f"{platform} post saved and included in analytics.",
        "content_item": {
            "id": item.id,
            "content_id": item.content_id,
            "title": item.title,
            "views": item.views,
            "likes": item.likes,
            "comments": item.comments,
            "shares": item.shares,
            "reach": item.reach,
            "published_at": item.published_at,
        },
    }


def _save_manual_platform_posts(
    db: Session,
    platform: str,
    payloads: list[InstagramManualPostRequest] | list[LinkedInManualPostRequest],
):
    """Validate a batch first, then write it as one transaction."""
    content_ids = [payload.content_id for payload in payloads]
    duplicate_in_request = sorted({content_id for content_id in content_ids if content_ids.count(content_id) > 1})
    if duplicate_in_request:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Each content_id must be unique within a bulk request.", "content_ids": duplicate_in_request},
        )

    existing_ids = [row[0] for row in db.query(ContentItem.content_id).filter(
        ContentItem.platform == platform,
        ContentItem.content_id.in_(content_ids),
    ).all()]
    if existing_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "One or more content_ids already exist; no posts were added.", "content_ids": existing_ids},
        )

    items = [ContentItem(platform=platform, **payload.model_dump()) for payload in payloads]
    try:
        db.add_all(items)
        db.commit()
        for item in items:
            db.refresh(item)
    except Exception:
        db.rollback()
        raise
    return {
        "platform": platform,
        "status": "success",
        "records_created": len(items),
        "content_items": [
            {"id": item.id, "content_id": item.content_id, "title": item.title, "published_at": item.published_at}
            for item in items
        ],
    }


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


@router.post("/instagram/manual-post", status_code=status.HTTP_201_CREATED)
def add_instagram_manual_post(payload: InstagramManualPostRequest, db: Session = Depends(get_db)):
    """Enter Instagram post metrics manually from Swagger; no Graph API token required."""
    return _save_manual_platform_post(db, "Instagram", payload)


@router.post("/linkedin/manual-post", status_code=status.HTTP_201_CREATED)
def add_linkedin_manual_post(payload: LinkedInManualPostRequest, db: Session = Depends(get_db)):
    """Enter LinkedIn post metrics manually from Swagger; no LinkedIn API access required."""
    return _save_manual_platform_post(db, "LinkedIn", payload)


@router.post("/instagram/bulk-manual-posts", status_code=status.HTTP_201_CREATED)
def add_instagram_manual_posts_bulk(
    payload: list[InstagramManualPostRequest] = Body(..., min_length=1),
    db: Session = Depends(get_db),
):
    """Add multiple Instagram posts from Swagger in one database transaction."""
    return _save_manual_platform_posts(db, "Instagram", payload)


@router.post("/linkedin/bulk-manual-posts", status_code=status.HTTP_201_CREATED)
def add_linkedin_manual_posts_bulk(
    payload: list[LinkedInManualPostRequest] = Body(..., min_length=1),
    db: Session = Depends(get_db),
):
    """Add multiple LinkedIn posts from Swagger in one database transaction."""
    return _save_manual_platform_posts(db, "LinkedIn", payload)
