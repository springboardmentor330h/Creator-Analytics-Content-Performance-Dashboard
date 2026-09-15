from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.social import SocialConnect, YoutubeSyncRequest
from app.services.social_media import connect, platforms, mock_data
from app.services.youtube_service import YouTubeService

router = APIRouter(prefix="/social", tags=["Social Media"])


@router.post("/connect")
def social_connect(data: SocialConnect):
    return connect(
        data.creator_id,
        data.platform,
        data.account_name,
    )


@router.get("/platforms")
def connected_platforms(creator_id: str):
    return platforms(creator_id)


@router.post("/sync")
def sync_platform(
    platform: str,
    creator_id: str,
    db: Session = Depends(get_db),
):
    rows = mock_data(platform)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"No mock data configured for {platform}",
        )

    synced = 0

    for row in rows:
        (
            content_title,
            external_content_id,
            views,
            likes,
            comments,
            shares,
            reach,
            watch_time,
        ) = row

        existing = (
            db.query(Content)
            .filter(
                Content.platform == platform.lower(),
                Content.external_content_id == external_content_id,
            )
            .first()
        )

        payload = {
            "creator_id": creator_id,
            "title": content_title,
            "platform": platform.lower(),
            "content_type": "video",
            "content_title": content_title,
            "views": views,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "reach": reach,
            "impressions": reach,
            "saves": 0,
            "watch_time": watch_time,
            "published_date": None,
            "external_content_id": external_content_id,
        }

        if existing:
            for key, value in payload.items():
                setattr(existing, key, value)
        else:
            db.add(Content(**payload))

        synced += 1

    db.commit()

    return {
        "platform": platform.lower(),
        "status": "success",
        "records_synced": synced,
    }


@router.post("/youtube/sync")
def youtube_sync(
    data: YoutubeSyncRequest,
    db: Session = Depends(get_db),
):
    rows = YouTubeService.fetch_channel_videos(
        channel_id=data.channel_id,
        max_results=data.max_results,
    )

    synced = 0

    for row in rows:
        existing = (
            db.query(Content)
            .filter(
                Content.platform == "youtube",
                Content.external_content_id
                == row["external_content_id"],
            )
            .first()
        )

        payload = {
            **row,
            "creator_id": data.creator_id,
            "title": row["content_title"],
            "content_type": "video",
            "impressions": row.get("reach", 0),
            "saves": 0,
            "watch_time": 0,
        }

        if existing:
            for key, value in payload.items():
                setattr(existing, key, value)
        else:
            db.add(Content(**payload))

        synced += 1

    db.commit()

    return {
        "platform": "youtube",
        "status": "success",
        "records_synced": synced,
    }