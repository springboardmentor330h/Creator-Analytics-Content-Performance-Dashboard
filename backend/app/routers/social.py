from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.social_connection import SocialConnection
from app.models.content import Content
from app.schemas.social import ConnectRequest, YouTubeSyncRequest, SyncResult,InstagramSyncRequest
from app.services import social_media, youtube_service
from app.services import instagram_service
from app.services import tiktok_service, facebook_service, x_service, linkedin_service
from app.schemas.social import TikTokSyncRequest, FacebookSyncRequest, XSyncRequest, LinkedInSyncRequest


router = APIRouter(prefix="/social", tags=["social-media-integration"])


@router.post("/connect")
def connect_platform(payload: ConnectRequest, db: Session = Depends(get_db)):
    if payload.platform not in social_media.get_supported_platforms() and payload.platform != "YouTube":
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {payload.platform}")
    connection = SocialConnection(platform=payload.platform, account_name=payload.account_name)
    db.add(connection)
    db.commit()
    db.refresh(connection)
    return {"message": f"{payload.platform} account connected successfully"}


@router.get("/platforms")
def connected_platforms(db: Session = Depends(get_db)):
    connections = db.query(SocialConnection).all()
    platforms = sorted(set(c.platform for c in connections))
    return {"platforms": platforms}


@router.post("/sync")
def sync_mock_platform_data(payload: dict, db: Session = Depends(get_db)):
    """Existing Sprint 4 mock-data sync — unchanged."""
    creator_id = payload.get("creator_id")
    platform = payload.get("platform")
    if not creator_id or not platform:
        raise HTTPException(status_code=400, detail="creator_id and platform are required")

    connection = db.query(SocialConnection).filter(SocialConnection.platform == platform).first()
    if not connection:
        raise HTTPException(status_code=400, detail=f"{platform} is not connected. Call /social/connect first.")

    raw_items = social_media.get_platform_data(platform)
    if not raw_items:
        raise HTTPException(status_code=404, detail=f"No mock data available for {platform}")

    from datetime import date
    saved = []
    for item in raw_items:
        new_content = Content(
            creator_id=creator_id, platform=platform, content_title=item["content_title"],
            views=item["views"], likes=item["likes"], comments=item["comments"],
            shares=item["shares"], saves=item["saves"], watch_time=item["watch_time"],
            reach=item["reach"], published_date=date.today(),
        )
        db.add(new_content)
        db.commit()
        db.refresh(new_content)
        saved.append(new_content.id)
    return {"message": f"Synced {len(saved)} items from {platform}", "content_ids": saved}


@router.post("/youtube/sync", response_model=SyncResult)
def sync_youtube_data(payload: YouTubeSyncRequest, db: Session = Depends(get_db)):
    """
    Real YouTube API sync workflow:
    request -> YouTube API -> fetch -> transform -> validate ->
    check duplicate (platform + external_content_id) -> create/update -> return result
    """
    if not payload.channel_id and not payload.search_query:
        raise HTTPException(status_code=400, detail="Provide either channel_id or search_query")

    if payload.channel_id:
        video_ids = youtube_service.get_channel_video_ids(payload.channel_id, payload.max_results)
    else:
        video_ids = youtube_service.search_video_ids(payload.search_query, payload.max_results)

    transformed_items = youtube_service.get_video_details(video_ids)

    synced_count = 0
    for item in transformed_items:
        existing = (
            db.query(Content)
            .filter(
                Content.platform == item["platform"],
                Content.external_content_id == item["external_content_id"],
            )
            .first()
        )

        if existing:
            # Record already exists -> UPDATE
            existing.content_title = item["content_title"]
            existing.views = item["views"]
            existing.likes = item["likes"]
            existing.comments = item["comments"]
            existing.reach = item["reach"]
            db.commit()
        else:
            # Record doesn't exist -> CREATE
            new_content = Content(
                creator_id=payload.creator_id,
                platform=item["platform"],
                external_content_id=item["external_content_id"],
                content_title=item["content_title"],
                views=item["views"],
                likes=item["likes"],
                comments=item["comments"],
                shares=item["shares"],
                saves=item["saves"],
                watch_time=0,
                reach=item["reach"],
                published_date=item["published_date"],
            )
            db.add(new_content)
            db.commit()
        synced_count += 1

    return SyncResult(platform="YouTube", status="success", records_synced=synced_count)



@router.post("/instagram/sync", response_model=SyncResult)
def sync_instagram_data(payload: InstagramSyncRequest, db: Session = Depends(get_db)):
    transformed_items = instagram_service.get_transformed_instagram_content(payload.max_results)

    synced_count = 0
    for item in transformed_items:
        existing = (
            db.query(Content)
            .filter(
                Content.platform == item["platform"],
                Content.external_content_id == item["external_content_id"],
            )
            .first()
        )

        if existing:
            existing.content_title = item["content_title"]
            existing.likes = item["likes"]
            existing.comments = item["comments"]
            existing.views = item["views"]
            existing.shares = item["shares"]
            existing.reach = item["reach"]
            db.commit()
        else:
            new_content = Content(
                creator_id=payload.creator_id,
                platform=item["platform"],
                external_content_id=item["external_content_id"],
                content_title=item["content_title"],
                views=item["views"],
                likes=item["likes"],
                comments=item["comments"],
                shares=item["shares"],
                saves=0,
                watch_time=0,
                reach=item["reach"],
                published_date=item["published_date"],
            )
            db.add(new_content)
            db.commit()
        synced_count += 1

    return SyncResult(platform="Instagram", status="success", records_synced=synced_count)



def _sync_generic(db: Session, creator_id: int, platform: str, transformed_items: list[dict]) -> int:
    """Shared duplicate-check + create/update logic for all mock platforms."""
    synced_count = 0
    for item in transformed_items:
        existing = (
            db.query(Content)
            .filter(Content.platform == item["platform"], Content.external_content_id == item["external_content_id"])
            .first()
        )
        if existing:
            existing.content_title = item["content_title"]
            existing.likes = item["likes"]
            existing.comments = item["comments"]
            existing.views = item["views"]
            existing.shares = item["shares"]
            existing.reach = item["reach"]
            db.commit()
        else:
            new_content = Content(
                creator_id=creator_id,
                platform=item["platform"],
                external_content_id=item["external_content_id"],
                content_title=item["content_title"],
                views=item["views"],
                likes=item["likes"],
                comments=item["comments"],
                shares=item["shares"],
                saves=0,
                watch_time=0,
                reach=item["reach"],
                published_date=item["published_date"],
            )
            db.add(new_content)
            db.commit()
        synced_count += 1
    return synced_count


@router.post("/tiktok/sync", response_model=SyncResult)
def sync_tiktok_data(payload: TikTokSyncRequest, db: Session = Depends(get_db)):
    items = tiktok_service.get_transformed_tiktok_content(payload.max_results)
    count = _sync_generic(db, payload.creator_id, "TikTok", items)
    return SyncResult(platform="TikTok", status="success", records_synced=count)


@router.post("/facebook/sync", response_model=SyncResult)
def sync_facebook_data(payload: FacebookSyncRequest, db: Session = Depends(get_db)):
    items = facebook_service.get_transformed_facebook_content(payload.max_results)
    count = _sync_generic(db, payload.creator_id, "Facebook", items)
    return SyncResult(platform="Facebook", status="success", records_synced=count)


@router.post("/x/sync", response_model=SyncResult)
def sync_x_data(payload: XSyncRequest, db: Session = Depends(get_db)):
    items = x_service.get_transformed_x_content(payload.max_results)
    count = _sync_generic(db, payload.creator_id, "X", items)
    return SyncResult(platform="X", status="success", records_synced=count)


@router.post("/linkedin/sync", response_model=SyncResult)
def sync_linkedin_data(payload: LinkedInSyncRequest, db: Session = Depends(get_db)):
    items = linkedin_service.get_transformed_linkedin_content(payload.max_results)
    count = _sync_generic(db, payload.creator_id, "LinkedIn", items)
    return SyncResult(platform="LinkedIn", status="success", records_synced=count)