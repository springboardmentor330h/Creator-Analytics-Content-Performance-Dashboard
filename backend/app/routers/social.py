from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.models.content import Content
from app.services.social_media import (
    sync_platform_data,
    sync_instagram_data
)
from app.services.youtube_service import save_youtube_video


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


class PlatformConnection(BaseModel):
    platform: str
    account_name: str


connected_platforms = []


# Connect a social media platform
@router.post("/connect")
def connect_platform(data: PlatformConnection):
    connected_platforms.append({
        "platform": data.platform,
        "account_name": data.account_name
    })

    return {
        "message": f"{data.platform} account connected successfully"
    }


# Get connected platforms
@router.get("/platforms")
def get_connected_platforms():
    return {
        "platforms": [
            item["platform"]
            for item in connected_platforms
        ]
    }


# Generic platform synchronization
@router.post("/sync")
def sync_platform(
    platform: str,
    db: Session = Depends(get_db)
):
    platform_data = sync_platform_data(platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail="Platform not found"
        )

    synced_records = []

    for item in platform_data:
        content = Content(
            creator_id=1,
            platform=item["platform"],
            content_title=item["content_title"],
            views=item["views"],
            likes=item["likes"],
            comments=item["comments"],
            shares=item["shares"],
            saves=0,
            watch_time=0,
            reach=item["reach"],
            published_date=date.today()
        )

        db.add(content)
        synced_records.append(item["content_title"])

    db.commit()

    return {
        "message": f"{platform} data synchronized successfully",
        "records_synced": len(synced_records),
        "content": synced_records
    }


# YouTube synchronization using video_id
@router.post("/youtube/sync")
def sync_youtube(
    video_id: str,
    db: Session = Depends(get_db)
):
    try:
        content = save_youtube_video(
            db=db,
            creator_id=1,
            video_id=video_id
        )

        if not content:
            raise HTTPException(
                status_code=404,
                detail="YouTube video not found"
            )

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": 1,
            "content_id": content.id,
            "content_title": content.content_title
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"YouTube synchronization failed: {str(e)}"
        )


# Instagram synchronization
@router.post("/instagram/sync")
def sync_instagram(
    db: Session = Depends(get_db)
):
    try:
        platform_data = sync_instagram_data()

        if not platform_data:
            raise HTTPException(
                status_code=404,
                detail="Instagram data not found"
            )

        synced_records = []

        for index, item in enumerate(platform_data, start=1):

            external_id = f"IG-MOCK-{index}"

            existing_content = db.query(Content).filter(
                Content.platform == "Instagram",
                Content.external_content_id == external_id
            ).first()

            if existing_content:
                continue

            content = Content(
                creator_id=1,
                platform="Instagram",
                external_content_id=external_id,
                content_title=item["content_title"],
                views=item["views"],
                likes=item["likes"],
                comments=item["comments"],
                shares=item["shares"],
                saves=0,
                watch_time=0,
                reach=item["reach"],
                published_date=date.today()
            )

            db.add(content)
            synced_records.append(item["content_title"])

        db.commit()

        return {
            "platform": "Instagram",
            "status": "success",
            "records_synced": len(synced_records),
            "content": synced_records
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Instagram synchronization failed: {str(e)}"
        )