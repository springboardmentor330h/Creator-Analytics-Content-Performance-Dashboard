
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.services.social_media import get_available_platforms
from app.services.youtube_service import get_channel_videos


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


class YouTubeSyncRequest(BaseModel):
    channel_id: str
    creator_id: int = 1


# --------------------------------------------------
# Connect Social Media Platform
# --------------------------------------------------

@router.post("/connect")
def connect_platform(request: SocialConnectRequest):

    return {
        "message": f"{request.platform} account connected successfully"
    }


# --------------------------------------------------
# Get Available Platforms
# --------------------------------------------------

@router.get("/platforms")
def get_platforms():

    platforms = get_available_platforms()

    return {
        "platforms": platforms
    }


# --------------------------------------------------
# YouTube Synchronization
# --------------------------------------------------

@router.post("/youtube/sync")
def sync_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db)
):

    try:
        # 1. Fetch data from YouTube API
        youtube_data = get_channel_videos(
            request.channel_id
        )

        # 2. Check empty response
        if not youtube_data:
            return {
                "platform": "YouTube",
                "status": "success",
                "records_synced": 0,
                "message": "No videos found"
            }

        records_synced = 0
        records_updated = 0

        # 3. Process each video
        for data in youtube_data:

            external_id = data["external_content_id"]

            # 4. Check whether record already exists
            existing_content = (
                db.query(Content)
                .filter(
                    Content.platform == "YouTube",
                    Content.external_content_id == external_id
                )
                .first()
            )

            if existing_content:

                # 5. Update existing record
                existing_content.creator_id = request.creator_id
                existing_content.content_title = data["content_title"]
                existing_content.views = data["views"]
                existing_content.likes = data["likes"]
                existing_content.comments = data["comments"]
                existing_content.shares = data["shares"]
                existing_content.saves = data["saves"]
                existing_content.watch_time = data["watch_time"]
                existing_content.reach = data["reach"]
                existing_content.published_date = data["published_date"]

                records_updated += 1

            else:

                # 6. Create new record
                new_content = Content(
                    creator_id=request.creator_id,
                    platform=data["platform"],
                    external_content_id=external_id,
                    content_title=data["content_title"],
                    views=data["views"],
                    likes=data["likes"],
                    comments=data["comments"],
                    shares=data["shares"],
                    saves=data["saves"],
                    watch_time=data["watch_time"],
                    reach=data["reach"],
                    published_date=data["published_date"]
                )

                db.add(new_content)

                records_synced += 1

        # 7. Save changes to PostgreSQL
        db.commit()

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": records_synced,
            "records_updated": records_updated
        }

    except ValueError as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"YouTube synchronization failed: {str(error)}"
        )
