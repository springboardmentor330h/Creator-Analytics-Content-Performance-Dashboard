from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content

from app.services.social_media import (
    get_available_platforms,
    get_platform_data
)

from app.services.youtube_service import fetch_youtube_videos


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


# =========================================================
# PLATFORM CONNECTION
# =========================================================

class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


# Runtime list for connection status
connected_platforms = []


@router.post("/connect")
def connect_platform(
    request: SocialConnectRequest
):
    """
    Connect a supported social-media platform.
    """

    available_platforms = get_available_platforms()

    if request.platform not in available_platforms:
        raise HTTPException(
            status_code=400,
            detail="Unsupported platform"
        )

    for platform in connected_platforms:

        if platform["platform"] == request.platform:

            return {
                "message": f"{request.platform} account already connected"
            }

    connected_platforms.append(
        {
            "platform": request.platform,
            "account_name": request.account_name
        }
    )

    return {
        "message": f"{request.platform} account connected successfully"
    }


# =========================================================
# CONNECTED PLATFORMS
# =========================================================

@router.get("/platforms")
def get_connected_platforms(
    db: Session = Depends(get_db)
):
    """
    Return platforms available in the system
    and platforms already stored in PostgreSQL.
    """

    platforms = set()

    # Runtime connections
    for platform in connected_platforms:
        platforms.add(platform["platform"])

    # PostgreSQL platforms
    database_platforms = (
        db.query(Content.platform)
        .distinct()
        .all()
    )

    for platform in database_platforms:

        if platform[0]:
            platforms.add(platform[0])

    return {
        "platforms": sorted(platforms)
    }


# =========================================================
# PLATFORM SYNCHRONIZATION
# =========================================================

class SocialSyncRequest(BaseModel):
    platform: str
    creator_id: int


@router.post("/sync")
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Synchronize platform data from PostgreSQL.

    For manually added platforms such as Instagram,
    data is already stored in PostgreSQL.

    This endpoint validates and returns the existing
    platform records without creating duplicate rows.
    """

    # -----------------------------------------------------
    # 1. Validate platform
    # -----------------------------------------------------

    available_platforms = get_available_platforms()

    if request.platform not in available_platforms:

        raise HTTPException(
            status_code=400,
            detail="Unsupported platform"
        )

    # -----------------------------------------------------
    # 2. Validate creator ID
    # -----------------------------------------------------

    if request.creator_id <= 0:

        raise HTTPException(
            status_code=400,
            detail="creator_id must be greater than 0"
        )

    # -----------------------------------------------------
    # 3. Get platform data from PostgreSQL
    # -----------------------------------------------------

    platform_data = get_platform_data(
        db,
        request.platform,
        request.creator_id
    )

    # -----------------------------------------------------
    # 4. Check whether data exists
    # -----------------------------------------------------

    if not platform_data:

        raise HTTPException(
            status_code=404,
            detail=(
                f"No data available for {request.platform} "
                f"for creator {request.creator_id}"
            )
        )

    # -----------------------------------------------------
    # 5. Prepare response
    # -----------------------------------------------------

    synchronized_records = []

    for item in platform_data:

        synchronized_records.append(
            {
                "platform": item["platform"],
                "external_content_id": item[
                    "external_content_id"
                ],
                "content_title": item["content_title"],
                "views": item["views"],
                "likes": item["likes"],
                "comments": item["comments"],
                "shares": item["shares"],
                "saves": item["saves"],
                "watch_time": item["watch_time"],
                "reach": item["reach"],
                "published_date": item["published_date"]
            }
        )

    # -----------------------------------------------------
    # 6. Mark platform as connected
    # -----------------------------------------------------

    already_connected = any(
        platform["platform"] == request.platform
        for platform in connected_platforms
    )

    if not already_connected:

        connected_platforms.append(
            {
                "platform": request.platform,
                "account_name": "PostgreSQL Data"
            }
        )

    # -----------------------------------------------------
    # 7. Return result
    # -----------------------------------------------------

    return {
        "message": (
            f"{request.platform} data synchronized successfully"
        ),
        "platform": request.platform,
        "records_synchronized": len(
            synchronized_records
        ),
        "data": synchronized_records
    }


# =========================================================
# YOUTUBE SYNCHRONIZATION
# =========================================================

class YouTubeSyncRequest(BaseModel):
    creator_id: int
    video_ids: list[str]


@router.post("/youtube/sync")
def sync_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Fetch YouTube data from YouTube API,
    transform it into CreatorIQ format,
    and create/update PostgreSQL records.
    """

    # -----------------------------------------------------
    # 1. Validate creator ID
    # -----------------------------------------------------

    if request.creator_id <= 0:

        raise HTTPException(
            status_code=400,
            detail="creator_id must be greater than 0"
        )

    # -----------------------------------------------------
    # 2. Validate video IDs
    # -----------------------------------------------------

    if not request.video_ids:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least one YouTube video ID is required"
            )
        )

    # -----------------------------------------------------
    # 3. Remove duplicate video IDs
    # -----------------------------------------------------

    video_ids = list(
        dict.fromkeys(request.video_ids)
    )

    # -----------------------------------------------------
    # 4. Fetch YouTube API data
    # -----------------------------------------------------

    try:

        youtube_data = fetch_youtube_videos(
            video_ids
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected error while fetching "
                "YouTube data"
            )
        )

    # -----------------------------------------------------
    # 5. Handle empty response
    # -----------------------------------------------------

    if not youtube_data:

        raise HTTPException(
            status_code=404,
            detail="No YouTube video data found"
        )

    # -----------------------------------------------------
    # 6. Counters
    # -----------------------------------------------------

    records_synced = 0
    created_records = 0
    updated_records = 0

    # -----------------------------------------------------
    # 7. Process each YouTube record
    # -----------------------------------------------------

    for item in youtube_data:

        external_id = item.get(
            "external_content_id"
        )

        content_title = item.get(
            "content_title"
        )

        published_date = item.get(
            "published_date"
        )

        # -------------------------------------------------
        # Validate required fields
        # -------------------------------------------------

        if not external_id:
            continue

        if not content_title:
            continue

        if not published_date:

            raise HTTPException(
                status_code=422,
                detail=(
                    "Published date missing for video "
                    f"{external_id}"
                )
            )

        # -------------------------------------------------
        # Check existing YouTube record
        # -------------------------------------------------

        existing_content = (
            db.query(Content)
            .filter(
                Content.creator_id == request.creator_id,
                Content.platform == "YouTube",
                Content.external_content_id == external_id
            )
            .first()
        )

        # -------------------------------------------------
        # UPDATE existing record
        # -------------------------------------------------

        if existing_content:

            existing_content.content_title = content_title

            existing_content.views = item.get(
                "views",
                0
            )

            existing_content.likes = item.get(
                "likes",
                0
            )

            existing_content.comments = item.get(
                "comments",
                0
            )

            existing_content.shares = item.get(
                "shares",
                0
            )

            existing_content.reach = item.get(
                "reach",
                0
            )

            existing_content.published_date = (
                published_date
            )

            updated_records += 1

        # -------------------------------------------------
        # CREATE new record
        # -------------------------------------------------

        else:

            new_content = Content(
                creator_id=request.creator_id,
                platform="YouTube",
                external_content_id=external_id,
                content_title=content_title,

                views=item.get(
                    "views",
                    0
                ),

                likes=item.get(
                    "likes",
                    0
                ),

                comments=item.get(
                    "comments",
                    0
                ),

                shares=item.get(
                    "shares",
                    0
                ),

                saves=0,

                watch_time=0,

                reach=item.get(
                    "reach",
                    0
                ),

                published_date=published_date
            )

            db.add(new_content)

            created_records += 1

        records_synced += 1

    # -----------------------------------------------------
    # 8. Save changes
    # -----------------------------------------------------

    try:

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save YouTube data: "
                f"{str(exc)}"
            )
        )

    # -----------------------------------------------------
    # 9. Mark YouTube as connected
    # -----------------------------------------------------

    already_connected = any(
        platform["platform"] == "YouTube"
        for platform in connected_platforms
    )

    if not already_connected:

        connected_platforms.append(
            {
                "platform": "YouTube",
                "account_name": "YouTube API"
            }
        )

    # -----------------------------------------------------
    # 10. Return synchronization result
    # -----------------------------------------------------

    return {
        "platform": "YouTube",
        "status": "success",
        "records_synced": records_synced,
        "created_records": created_records,
        "updated_records": updated_records
    }