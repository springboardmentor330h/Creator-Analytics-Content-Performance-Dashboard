from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.db.database import get_db

from app.models.content import Content

from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    connected_platforms
)

from app.services.youtube_service import (
    get_youtube_channel_videos
)

# CREATE ROUTER
router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)

# REQUEST SCHEMA
class PlatformConnection(BaseModel):

    platform: str

    account_name: str


# CONNECT PLATFORM
# POST /social/connect

@router.post("/connect")
def connect_social_platform(
    request: PlatformConnection
):

    result = connect_platform(
        request.platform,
        request.account_name
    )

    if not result:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported platform. "
                "Available platforms: "
                "YouTube, Instagram, Facebook, "
                "LinkedIn, TikTok, Twitter"
            )
        )

    return {
        "message": (
            f"{request.platform} "
            "account connected successfully"
        ),
        "account_name": request.account_name
    }


# GET CONNECTED PLATFORMS
# GET /social/platforms

@router.get("/platforms")
def connected_social_platforms():

    return get_connected_platforms()


# ============================================================
# GENERIC PLATFORM SYNCHRONIZATION
#
# POST /social/sync

@router.post("/sync")
def synchronize_platform_data(

    platform: str = Query(
        ...,
        description="Platform name"
    ),

    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CLEAN PLATFORM NAME
    # --------------------------------------------------------

    platform_name = platform.strip()

    # --------------------------------------------------------
    # CHECK PLATFORM CONNECTION
    # --------------------------------------------------------

    if platform_name not in connected_platforms:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{platform_name} is not connected. "
                "Connect the platform first."
            )
        )

    # --------------------------------------------------------
    # YOUTUBE
    # --------------------------------------------------------

    if platform_name.lower() == "youtube":

        raise HTTPException(
            status_code=400,
            detail=(
                "Use POST /social/youtube/sync "
                "for real YouTube API synchronization. "
                "Provide creator_id and channel_id."
            )
        )

    # --------------------------------------------------------
    # OTHER PLATFORMS
    # --------------------------------------------------------
    #
    # Do not insert mock data for Sprint 5.
    # Real APIs can be added here later.
    # --------------------------------------------------------

    raise HTTPException(
        status_code=501,
        detail=(
            f"Real API synchronization for "
            f"{platform_name} is not implemented yet."
        )
    )


# REAL YOUTUBE SYNCHRONIZATION
#
# POST /social/youtube/sync


@router.post("/youtube/sync")
def synchronize_youtube_data(

    creator_id: int = Query(
        ...,
        gt=0,
        description="CreatorIQ creator ID"
    ),

    channel_id: str = Query(
        ...,
        min_length=1,
        description="YouTube channel ID"
    ),

    max_results: int = Query(
        10,
        ge=1,
        le=50,
        description="Number of YouTube videos to synchronize"
    ),

    db: Session = Depends(get_db)
):

    # ========================================================
    # VALIDATE CREATOR ID
    # ========================================================

    if creator_id <= 0:

        raise HTTPException(
            status_code=400,
            detail="creator_id must be greater than 0"
        )

    # ========================================================
    # VALIDATE CHANNEL ID
    # ========================================================

    if not channel_id.strip():

        raise HTTPException(
            status_code=400,
            detail="YouTube channel ID is required"
        )

    # ========================================================
    # CALL REAL YOUTUBE API
    # ========================================================

    try:

        youtube_data = get_youtube_channel_videos(
            channel_id=channel_id,
            max_results=max_results
        )

    # --------------------------------------------------------
    # YOUTUBE/API ERROR
    # --------------------------------------------------------

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # --------------------------------------------------------
    # UNEXPECTED ERROR
    # --------------------------------------------------------

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected error while fetching "
                f"YouTube data: {str(error)}"
            )
        )

    # ========================================================
    # HANDLE EMPTY RESPONSE
    # ========================================================

    if not youtube_data:

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": 0,
            "records_created": 0,
            "records_updated": 0,
            "records_skipped": 0,
            "message": (
                "No YouTube videos were found "
                "for the specified channel."
            )
        }

    # ========================================================
    # COUNTERS
    # ========================================================

    records_created = 0

    records_updated = 0

    records_skipped = 0

    # ========================================================
    # PROCESS YOUTUBE RECORDS
    # ========================================================

    try:

        for video_data in youtube_data:

            # =================================================
            # GET EXTERNAL CONTENT ID
            # =================================================

            external_content_id = (
                video_data.get(
                    "external_content_id"
                )
            )

            # -------------------------------------------------
            # INVALID EXTERNAL ID
            # -------------------------------------------------

            if not external_content_id:

                records_skipped += 1

                continue

            # =================================================
            # GET PUBLISHED DATE
            # =================================================

            published_date = (
                video_data.get(
                    "published_date"
                )
            )

            # -------------------------------------------------
            # INVALID PUBLISHED DATE
            # -------------------------------------------------

            if not published_date:

                records_skipped += 1

                continue

            # =================================================
            # FIND EXISTING RECORD
            #
            # Duplicate identification:
            #
            # platform + external_content_id
            # =================================================

            existing_content = (

                db.query(Content)

                .filter(

                    Content.platform == "YouTube",

                    Content.external_content_id
                    == external_content_id

                )

                .first()
            )

            # =================================================
            # UPDATE EXISTING CONTENT
            # =================================================

            if existing_content:

                existing_content.creator_id = (
                    creator_id
                )

                existing_content.content_title = (

                    video_data.get(
                        "content_title"
                    )

                    or existing_content.content_title
                )

                existing_content.views = (

                    video_data.get(
                        "views"
                    )
                    or 0
                )

                existing_content.likes = (

                    video_data.get(
                        "likes"
                    )
                    or 0
                )

                existing_content.comments = (

                    video_data.get(
                        "comments"
                    )
                    or 0
                )

                existing_content.shares = (

                    video_data.get(
                        "shares"
                    )
                    or 0
                )

                existing_content.saves = (

                    video_data.get(
                        "saves"
                    )
                    or 0
                )

                existing_content.watch_time = (

                    video_data.get(
                        "watch_time"
                    )
                    or 0
                )

                existing_content.reach = (

                    video_data.get(
                        "reach"
                    )
                    or 0
                )

                existing_content.published_date = (
                    published_date
                )

                records_updated += 1

            # =================================================
            # CREATE NEW CONTENT
            # =================================================

            else:

                new_content = Content(

                    creator_id=creator_id,

                    platform="YouTube",

                    external_content_id=(
                        external_content_id
                    ),

                    content_title=(

                        video_data.get(
                            "content_title"
                        )

                        or "Untitled YouTube Video"
                    ),

                    views=(

                        video_data.get(
                            "views"
                        )
                        or 0
                    ),

                    likes=(

                        video_data.get(
                            "likes"
                        )
                        or 0
                    ),

                    comments=(

                        video_data.get(
                            "comments"
                        )
                        or 0
                    ),

                    shares=(

                        video_data.get(
                            "shares"
                        )
                        or 0
                    ),

                    saves=(

                        video_data.get(
                            "saves"
                        )
                        or 0
                    ),

                    watch_time=(

                        video_data.get(
                            "watch_time"
                        )
                        or 0
                    ),

                    reach=(

                        video_data.get(
                            "reach"
                        )
                        or 0
                    ),

                    published_date=(
                        published_date
                    )
                )

                db.add(
                    new_content
                )

                records_created += 1

        # ====================================================
        # COMMIT DATABASE CHANGES
        # ====================================================

        db.commit()

    # ========================================================
    # DATABASE ERROR
    # ========================================================

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to store YouTube data "
                "in PostgreSQL: "
                f"{str(error)}"
            )
        )

    # ========================================================
    # CALCULATE TOTAL
    # ========================================================

    records_synced = (
        records_created
        + records_updated
    )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "platform": "YouTube",

        "status": "success",

        "records_synced": records_synced,

        "records_created": records_created,

        "records_updated": records_updated,

        "records_skipped": records_skipped,

        "channel_id": channel_id,

        "message": (
            "YouTube data synchronized "
            "successfully"
        )
    }