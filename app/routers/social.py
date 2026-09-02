# app/routers/social.py

from datetime import date

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
# TASK 6 - PLATFORM CONNECTION
# =========================================================

class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


# Temporary runtime list for simulated connection workflow
connected_platforms = []


@router.post("/connect")
def connect_platform(
    request: SocialConnectRequest
):
    # Check whether platform is supported
    available_platforms = get_available_platforms()

    if request.platform not in available_platforms:
        raise HTTPException(
            status_code=400,
            detail="Unsupported platform"
        )

    # Check whether already connected
    for platform in connected_platforms:
        if platform["platform"] == request.platform:
            return {
                "message": f"{request.platform} account already connected"
            }

    # Simulated connection
    connected_platforms.append({
        "platform": request.platform,
        "account_name": request.account_name
    })

    return {
        "message": f"{request.platform} account connected successfully"
    }


# =========================================================
# TASK 7 - CONNECTED PLATFORMS
# =========================================================

@router.get("/platforms")
def get_connected_platforms(
    db: Session = Depends(get_db)
):
    """
    Return connected platforms.

    Platforms that have already been synchronized are
    also considered connected based on PostgreSQL data.
    """

    platforms = set()

    # 1. Runtime simulated connections
    for platform in connected_platforms:
        platforms.add(platform["platform"])

    # 2. Platforms already stored in PostgreSQL
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
# TASK 8 - EXISTING MOCK SYNCHRONIZATION
# =========================================================

class SocialSyncRequest(BaseModel):
    platform: str
    creator_id: int


@router.post("/sync")
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db)
):
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
    # 2. Get mock platform data
    # -----------------------------------------------------

    platform_data = get_platform_data(
        request.platform
    )

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail="No data available for this platform"
        )

    # -----------------------------------------------------
    # 3. Process and store data
    # -----------------------------------------------------

    synchronized_records = []

    for item in platform_data:

        new_content = Content(
            creator_id=request.creator_id,
            platform=item["platform"],
            external_content_id=None,
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

        db.add(new_content)

        synchronized_records.append({
            "platform": item["platform"],
            "content_title": item["content_title"],
            "views": item["views"],
            "likes": item["likes"],
            "comments": item["comments"],
            "shares": item["shares"],
            "reach": item["reach"]
        })

    # -----------------------------------------------------
    # 4. Save synchronized data to PostgreSQL
    # -----------------------------------------------------

    try:
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to synchronize data"
        )

    # -----------------------------------------------------
    # 5. Mark platform as connected
    # -----------------------------------------------------

    already_connected = any(
        platform["platform"] == request.platform
        for platform in connected_platforms
    )

    if not already_connected:
        connected_platforms.append({
            "platform": request.platform,
            "account_name": "Synchronized Account"
        })

    # -----------------------------------------------------
    # 6. Return synchronization result
    # -----------------------------------------------------

    return {
        "message": f"{request.platform} data synchronized successfully",
        "platform": request.platform,
        "records_synchronized": len(
            synchronized_records
        ),
        "data": synchronized_records
    }


# =========================================================
# SPRINT 5 - TASK 5
# YOUTUBE SYNCHRONIZATION API
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
    Fetch YouTube data, transform it into CreatorIQ format,
    validate it, and create/update PostgreSQL records.
    """

    # -----------------------------------------------------
    # 1. Validate request
    # -----------------------------------------------------

    if request.creator_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="creator_id must be greater than 0"
        )

    if not request.video_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one YouTube video ID is required"
        )

    # Remove duplicate video IDs from the request itself
    video_ids = list(dict.fromkeys(request.video_ids))

    # -----------------------------------------------------
    # 2. Fetch data from YouTube API
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
            detail="Unexpected error while fetching YouTube data"
        )

    # -----------------------------------------------------
    # 3. Handle empty API response
    # -----------------------------------------------------

    if not youtube_data:
        raise HTTPException(
            status_code=404,
            detail="No YouTube video data found"
        )

    # -----------------------------------------------------
    # 4. Counters
    # -----------------------------------------------------

    records_synced = 0
    created_records = 0
    updated_records = 0

    # -----------------------------------------------------
    # 5. Process each YouTube record
    # -----------------------------------------------------

    for item in youtube_data:

        # -------------------------------------------------
        # Validate required fields
        # -------------------------------------------------

        external_id = item.get(
            "external_content_id"
        )

        content_title = item.get(
            "content_title"
        )

        published_date = item.get(
            "published_date"
        )

        if not external_id:
            continue

        if not content_title:
            continue

        if not published_date:
            raise HTTPException(
                status_code=422,
                detail=f"Published date missing for video {external_id}"
            )

        # -------------------------------------------------
        # Check duplicate
        #
        # Unique combination:
        # creator_id + platform + external_content_id
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
        # 6. UPDATE existing record
        # -------------------------------------------------

        if existing_content:

            existing_content.content_title = content_title

            existing_content.views = item.get(
                "views", 0
            )

            existing_content.likes = item.get(
                "likes", 0
            )

            existing_content.comments = item.get(
                "comments", 0
            )

            existing_content.shares = item.get(
                "shares", 0
            )

            existing_content.reach = item.get(
                "reach", 0
            )

            existing_content.published_date = published_date

            updated_records += 1

        # -------------------------------------------------
        # 7. CREATE new record
        # -------------------------------------------------

        else:

            new_content = Content(
                creator_id=request.creator_id,
                platform="YouTube",
                external_content_id=external_id,
                content_title=content_title,

                views=item.get(
                    "views", 0
                ),

                likes=item.get(
                    "likes", 0
                ),

                comments=item.get(
                    "comments", 0
                ),

                shares=item.get(
                    "shares", 0
                ),

                saves=0,
                watch_time=0,

                reach=item.get(
                    "reach", 0
                ),

                published_date=published_date
            )

            db.add(new_content)

            created_records += 1

        records_synced += 1

    # -----------------------------------------------------
    # 8. Save changes to PostgreSQL
    # -----------------------------------------------------

    try:

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save YouTube data: {str(exc)}"
        )

    # -----------------------------------------------------
    # 9. Mark YouTube as connected
    # -----------------------------------------------------

    already_connected = any(
        platform["platform"] == "YouTube"
        for platform in connected_platforms
    )

    if not already_connected:

        connected_platforms.append({
            "platform": "YouTube",
            "account_name": "YouTube API"
        })

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