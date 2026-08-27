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

    For this sprint, connection is simulated.
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
# TASK 8 - SYNCHRONIZATION
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
    # 5. Mark platform as connected in runtime workflow
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