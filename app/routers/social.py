
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user

from app.models.user import User
from app.models.content import Content
from app.models.platform_growth import PlatformGrowth

from app.schemas.social import (
    SocialConnectRequest,
    SocialConnectResponse,
    SocialSyncRequest,
    SocialSyncResponse,
    YouTubeSyncRequest,
    YouTubeSyncResponse,
    InstagramSyncRequest,
    InstagramSyncResponse
)

from app.services.social_media import get_platform_data

from app.services.youtube_service import (
    get_channel_videos,
    get_video_details,
    get_channel_subscriber_count,
    transform_video_data,
    YouTubeAPIError
)

from app.services.instagram_service import (
    get_instagram_media,
    get_instagram_media_insights,
    get_instagram_follower_count,
    transform_instagram_media,
    InstagramAPIError,
)

from app.services.analytics_service import calculate_engagement_rate


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


# ============================================================
# CONNECT PLATFORM
# ============================================================

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


# ============================================================
# GET SUPPORTED PLATFORMS
# ============================================================

@router.get("/platforms")
def get_connected_platforms():
    return {
        "platforms": [
            "YouTube",
            "Instagram",
            "TikTok",
            "Facebook",
            "LinkedIn",
            "X"
        ]
    }


# ============================================================
# MOCK PLATFORM SYNC
# Facebook / LinkedIn / TikTok / X
# ============================================================

@router.post(
    "/sync",
    response_model=SocialSyncResponse
)
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    mock_platforms = {
        "Facebook",
        "LinkedIn",
        "TikTok",
        "X"
    }

    if request.platform not in mock_platforms:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{request.platform} uses a dedicated API sync. "
                "Use the appropriate platform sync endpoint."
            )
        )

    platform_data = get_platform_data(request.platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail=f"No mock data available for platform: {request.platform}"
        )

    records_added = 0

    for index, data in enumerate(platform_data, start=1):

        # Create a stable mock external ID
        external_content_id = data.get(
            "external_content_id",
            f"{request.platform.lower()}_mock_{index:03d}"
        )

        # Check whether this mock content already exists
        existing_content = (
            db.query(Content)
            .filter(
                Content.creator_id == current_user.id,
                Content.platform == request.platform,
                Content.external_content_id == external_content_id
            )
            .first()
        )

        if existing_content:

            existing_content.content_title = data["content_title"]
            existing_content.views = data.get("views")
            existing_content.likes = data.get("likes", 0)
            existing_content.comments = data.get("comments", 0)
            existing_content.shares = data.get("shares", 0)
            existing_content.saves = data.get("saves", 0)
            existing_content.watch_time = data.get("watch_time")
            existing_content.reach = data.get("reach")

            existing_content.engagement_rate = (
                calculate_engagement_rate(existing_content)
            )

            records_added += 1
            continue

        # Create new mock content
        content = Content(
            creator_id=current_user.id,
            content_title=data["content_title"],
            platform=request.platform,
            external_content_id=external_content_id,
            content_type="Social Media",
            views=data.get("views"),
            likes=data.get("likes", 0),
            comments=data.get("comments", 0),
            shares=data.get("shares", 0),
            saves=data.get("saves", 0),
            watch_time=data.get("watch_time"),
            reach=data.get("reach"),
            published_date=data.get(
                "published_date",
                date.today()
            ),
            engagement_rate=0.0
        )

        content.engagement_rate = calculate_engagement_rate(
            content
        )

        db.add(content)
        records_added += 1

    db.commit()

    return {
        "message": f"{request.platform} data synchronized successfully",
        "platform": request.platform,
        "records_added": records_added
    }


# ============================================================
# YOUTUBE REAL API SYNC
# ============================================================

@router.post(
    "/youtube/sync",
    response_model=YouTubeSyncResponse
)
def sync_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # Step 1: Fetch videos from YouTube
        playlist_data = get_channel_videos(
            request.channel_id,
            max_results=request.max_results
        )

        # Fetch current subscriber count from the REAL YouTube API
        subscriber_count = get_channel_subscriber_count(
            request.channel_id
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
                    Content.creator_id == current_user.id,
                    Content.platform == data["platform"],
                    Content.external_content_id
                    == data["external_content_id"]
                )
                .first()
            )

            # ------------------------------------------------
            # Update existing YouTube content
            # ------------------------------------------------
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

                existing_content.engagement_rate = (
                    calculate_engagement_rate(existing_content)
                )

            # ------------------------------------------------
            # Create new YouTube content
            # ------------------------------------------------
            else:

                content = Content(
                    creator_id=current_user.id,
                    content_title=data["content_title"],
                    platform=data["platform"],
                    external_content_id=data["external_content_id"],
                    content_type="YouTube Video",
                    views=data["views"],
                    likes=data["likes"] or 0,
                    comments=data["comments"] or 0,
                    shares=data["shares"] or 0,
                    saves=data["saves"] or 0,
                    watch_time=data["watch_time"],
                    reach=data["reach"],
                    published_date=data["published_date"],
                    engagement_rate=0.0
                )

                content.engagement_rate = (
                    calculate_engagement_rate(content)
                )

                db.add(content)

            records_synced += 1

        # ------------------------------------------------
        # Store REAL YouTube subscriber snapshot
        # ------------------------------------------------

        today = date.today()

        existing_growth = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == current_user.id,
                PlatformGrowth.platform == "YouTube",
                PlatformGrowth.date == today
            )
            .first()
        )

        if existing_growth:

            # Update today's real subscriber snapshot
            existing_growth.followers = subscriber_count

        else:

            # Create a new real API snapshot
            db.add(
                PlatformGrowth(
                    creator_id=current_user.id,
                    platform="YouTube",
                    date=today,
                    followers=subscriber_count
                )
            )

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


# ============================================================
# INSTAGRAM REAL API SYNC
# ============================================================

@router.post(
    "/instagram/sync",
    response_model=InstagramSyncResponse
)
def sync_instagram(
    request: InstagramSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    try:

        # Step 1: Fetch Instagram media
        media_response = get_instagram_media(
            user_id=request.instagram_user_id,
            limit=request.max_results
        )

        media_items = media_response.get("data", [])

        if not media_items:
            raise HTTPException(
                status_code=404,
                detail="No Instagram media found"
            )
            # Fetch REAL Instagram follower count
            follower_count = get_instagram_follower_count()

        records_synced = 0

        # Step 2: Process each media item
        for media in media_items:

            media_id = media.get("id")

            if not media_id:
                continue

            # Fetch Instagram insights
            insights = get_instagram_media_insights(
                media_id
            )

            # Transform API response
            data = transform_instagram_media(
                media,
                insights
            )

            # Check for existing content
            existing_content = (
                db.query(Content)
                .filter(
                    Content.creator_id == current_user.id,
                    Content.platform == data["platform"],
                    Content.external_content_id
                    == data["external_content_id"]
                )
                .first()
            )

            # ------------------------------------------------
            # Update existing Instagram content
            # ------------------------------------------------
            if existing_content:

                existing_content.content_title = data["content_title"]
                existing_content.views = data["views"]
                existing_content.likes = data["likes"] or 0
                existing_content.comments = data["comments"] or 0
                existing_content.shares = data["shares"] or 0
                existing_content.saves = data["saves"] or 0
                existing_content.watch_time = data["watch_time"]
                existing_content.reach = data["reach"]
                existing_content.published_date = data["published_date"]

                existing_content.engagement_rate = (
                    calculate_engagement_rate(existing_content)
                )

            # ------------------------------------------------
            # Create new Instagram content
            # ------------------------------------------------
            else:

                content = Content(
                    creator_id=current_user.id,
                    content_title=data["content_title"],
                    platform=data["platform"],
                    external_content_id=data["external_content_id"],
                    content_type="Instagram Media",
                    views=data["views"],
                    likes=data["likes"] or 0,
                    comments=data["comments"] or 0,
                    shares=data["shares"] or 0,
                    saves=data["saves"] or 0,
                    watch_time=data["watch_time"],
                    reach=data["reach"],
                    published_date=data["published_date"],
                    engagement_rate=0.0
                )

                content.engagement_rate = (
                    calculate_engagement_rate(content)
                )

                db.add(content)

            records_synced += 1

        # ------------------------------------------------
        # Store REAL Instagram follower snapshot
        # ------------------------------------------------

        follower_count = get_instagram_follower_count()

        today = date.today()

        existing_growth = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == current_user.id,
                PlatformGrowth.platform == "Instagram",
                PlatformGrowth.date == today
            )
            .first()
        )

        if existing_growth:

            existing_growth.followers = follower_count

        else:

            db.add(
                PlatformGrowth(
                    creator_id=current_user.id,
                    platform="Instagram",
                    date=today,
                    followers=follower_count
                )
            )

        db.commit()

        return {
            "platform": "Instagram",
            "status": "success",
            "records_synced": records_synced
        }

        db.commit()

        return {
            "platform": "Instagram",
            "status": "success",
            "records_synced": records_synced
        }

    except HTTPException:
        raise

    except InstagramAPIError as e:
        db.rollback()

        raise HTTPException(
            status_code=e.status_code,
            detail=str(e)
        )

    except ValueError as e:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Instagram synchronization failed: {str(e)}"
        )

