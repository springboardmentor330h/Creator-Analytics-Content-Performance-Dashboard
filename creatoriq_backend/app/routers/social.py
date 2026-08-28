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
    get_platform_data,
    is_platform_connected,
    normalize_platform,
    SUPPORTED_PLATFORMS,
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
                + ", ".join(SUPPORTED_PLATFORMS)
                + " (Twitter is accepted as X)"
            )
        )

    return {
        "message": (
            f"{result['platform']} "
            "account connected successfully"
        ),
        "platform": result["platform"],
        "account_name": request.account_name,
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
    # NORMALIZE PLATFORM NAME (case / alias insensitive)
    # Accepts: instagram, Instagram, twitter, Twitter, X, etc.
    # --------------------------------------------------------

    platform_name = normalize_platform(platform)

    if not platform_name:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported platform. "
                "Available platforms: "
                + ", ".join(SUPPORTED_PLATFORMS)
                + " (Twitter is accepted as X)"
            ),
        )

    # --------------------------------------------------------
    # CHECK PLATFORM CONNECTION
    # --------------------------------------------------------

    if not is_platform_connected(platform_name):
        raise HTTPException(
            status_code=400,
            detail=(
                f"{platform_name} is not connected. "
                "Call POST /social/connect first."
            ),
        )

    # --------------------------------------------------------
    # YOUTUBE → real API endpoint
    # --------------------------------------------------------

    if platform_name == "YouTube":
        raise HTTPException(
            status_code=400,
            detail=(
                "Use POST /social/youtube/sync "
                "for real YouTube API synchronization. "
                "Provide creator_id and channel_id."
            ),
        )

    # --------------------------------------------------------
    # OTHER PLATFORMS — mock sync into PostgreSQL
    # (Sprint 4 multi-platform workflow)
    # Real platform APIs can replace this later.
    # --------------------------------------------------------

    mock_data = get_platform_data(platform_name)

    if not mock_data:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No mock data available for {platform_name}. "
                "Supported: YouTube, Instagram, Facebook, "
                "LinkedIn, TikTok, X"
            )
        )

    external_id = (
        f"mock-{platform_name.lower()}-"
        f"{mock_data.get('content_title', 'content')}"
        .replace(" ", "-")
        .lower()
    )

    existing = (
        db.query(Content)
        .filter(
            Content.platform == mock_data["platform"],
            Content.external_content_id == external_id,
        )
        .first()
    )

    if existing:
        existing.views = mock_data.get("views", 0)
        existing.likes = mock_data.get("likes", 0)
        existing.comments = mock_data.get("comments", 0)
        existing.shares = mock_data.get("shares", 0)
        existing.saves = mock_data.get("saves", 0)
        existing.watch_time = mock_data.get("watch_time", 0)
        existing.reach = mock_data.get("reach", 0)
        existing.content_title = mock_data.get(
            "content_title", existing.content_title
        )
        existing.published_date = mock_data.get(
            "published_date", existing.published_date
        )
        db.commit()
        db.refresh(existing)
        content_row = existing
        action = "updated"
    else:
        content_row = Content(
            creator_id=mock_data.get("creator_id", 1),
            platform=mock_data["platform"],
            external_content_id=external_id,
            content_title=mock_data.get("content_title", "Untitled"),
            views=mock_data.get("views", 0),
            likes=mock_data.get("likes", 0),
            comments=mock_data.get("comments", 0),
            shares=mock_data.get("shares", 0),
            saves=mock_data.get("saves", 0),
            watch_time=mock_data.get("watch_time", 0),
            reach=mock_data.get("reach", 0),
            published_date=mock_data.get("published_date"),
        )
        db.add(content_row)
        db.commit()
        db.refresh(content_row)
        action = "created"

    return {
        "platform": platform_name,
        "status": "success",
        "action": action,
        "content_id": content_row.id,
        "message": (
            f"{platform_name} mock data synchronized "
            f"and stored in PostgreSQL"
        ),
    }


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