from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content

from app.schemas.social import (
    SocialConnectRequest,
    SocialConnectResponse,
    SocialSyncRequest,
    SocialSyncResponse,
    YouTubeSyncRequest,
    YouTubeSyncResponse
)

from app.services.social_media import get_platform_data
from app.services.youtube_service import (
    get_channel_videos,
    get_video_details,
    transform_video_data,
    YouTubeAPIError
)


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


@router.post(
    "/connect",
    response_model=SocialConnectResponse
)
def connect_platform(
    request: SocialConnectRequest
):
    return {
        "message": f"{request.platform} account connected successfully"
    }


@router.get("/platforms")
def get_connected_platforms():
    return {
        "platforms": [
            "YouTube",
            "Instagram",
            "LinkedIn"
        ]
    }


@router.post(
    "/sync",
    response_model=SocialSyncResponse
)
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db)
):
    platform_data = get_platform_data(request.platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail=f"No mock data available for platform: {request.platform}"
        )

    records_added = 0

    for data in platform_data:

        total_engagement = (
            data["likes"]
            + data["comments"]
            + data["shares"]
            + data["saves"]
        )

        if data["reach"] > 0:
            engagement_rate = (
                total_engagement / data["reach"]
            ) * 100
        else:
            engagement_rate = 0

        content = Content(
            creator_id=1,
            content_title=data["content_title"],
            platform=data["platform"],
            content_type="Social Media",
            views=data["views"],
            likes=data["likes"],
            comments=data["comments"],
            shares=data["shares"],
            saves=data["saves"],
            watch_time=data["watch_time"],
            reach=data["reach"],
            published_date=date.today(),
            engagement_rate=round(engagement_rate, 2)
        )

        db.add(content)
        records_added += 1

    db.commit()

    return {
        "message": f"{request.platform} data synchronized successfully",
        "platform": request.platform,
        "records_added": records_added
    }


@router.post(
    "/youtube/sync",
    response_model=YouTubeSyncResponse
)
def sync_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db)
):
    

    try:

        # Step 1: Fetch videos from YouTube
        playlist_data = get_channel_videos(
            request.channel_id,
            max_results=request.max_results
        )

        # Step 2: Extract video IDs
        video_ids = [
            item["contentDetails"]["videoId"]
            for item in playlist_data.get("items", [])
        ]

        if not video_ids:
            raise HTTPException(
                status_code=404,
                detail="No videos found for the YouTube channel"
            )

        # Step 3: Fetch video statistics
        videos = get_video_details(video_ids)

        records_synced = 0

        # Step 4: Transform and synchronize
        for video in videos:

            data = transform_video_data(video)

            # Check whether the YouTube video already exists
            existing_content = (
                db.query(Content)
                .filter(
                    Content.platform == data["platform"],
                    Content.external_content_id == data["external_content_id"]
                )
                .first()
            )

            # Calculate engagement rate
            if data["reach"] > 0:

                total_engagement = (
                    data["likes"]
                    + data["comments"]
                    + data["shares"]
                    + data["saves"]
                )

                engagement_rate = (
                    total_engagement / data["reach"]
                ) * 100

            else:
                engagement_rate = 0.0

            # If record already exists, update it
            if existing_content:

                existing_content.content_title = data["content_title"]
                existing_content.views = data["views"]
                existing_content.likes = data["likes"]
                existing_content.comments = data["comments"]
                existing_content.shares = data["shares"]
                existing_content.saves = data["saves"]
                existing_content.watch_time = data["watch_time"]
                existing_content.reach = data["reach"]
                existing_content.published_date = data["published_date"]
                existing_content.engagement_rate = round(
                    engagement_rate,
                    2
                )

            # Otherwise create a new record
            else:

                content = Content(
                    creator_id=1,
                    content_title=data["content_title"],
                    platform=data["platform"],
                    external_content_id=data["external_content_id"],
                    content_type="YouTube Video",
                    views=data["views"],
                    likes=data["likes"],
                    comments=data["comments"],
                    shares=data["shares"],
                    saves=data["saves"],
                    watch_time=data["watch_time"],
                    reach=data["reach"],
                    published_date=data["published_date"],
                    engagement_rate=round(
                        engagement_rate,
                        2
                    )
                )

                db.add(content)

            records_synced += 1

        db.commit()

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": records_synced
        }
    except HTTPException:
        raise

    except YouTubeAPIError as e:
        db.rollback()

        raise HTTPException(
            status_code=e.status_code,
            detail=str(e)
        )

    except ValueError as e:
        db.rollback()

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"YouTube synchronization failed: {str(e)}"
        )