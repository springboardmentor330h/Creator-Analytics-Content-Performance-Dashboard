from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content

from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    get_platform_data
)

from app.services.youtube_service import get_video_data


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


# --------------------------------------------------
# REQUEST SCHEMAS
# --------------------------------------------------

class PlatformConnection(BaseModel):
    platform: str
    account_name: str


class SyncRequest(BaseModel):
    platform: str


class YouTubeSyncRequest(BaseModel):
    video_id: str = Field(
        ...,
        min_length=1
    )

    creator_id: int = Field(
        1,
        gt=0
    )


# --------------------------------------------------
# SPRINT 4 - PLATFORM CONNECTION
# --------------------------------------------------

@router.post("/connect")
def connect_social_platform(
    request: PlatformConnection
):
    result = connect_platform(
        request.platform,
        request.account_name
    )

    return result


# --------------------------------------------------
# SPRINT 4 - CONNECTED PLATFORMS
# --------------------------------------------------

@router.get("/platforms")
def connected_platforms():
    return {
        "platforms": get_connected_platforms()
    }


# --------------------------------------------------
# SPRINT 4 - MOCK SYNCHRONIZATION
# --------------------------------------------------

@router.post("/sync")
def synchronize_platform(
    request: SyncRequest,
    db: Session = Depends(get_db)
):
    platform = request.platform

    if platform not in get_connected_platforms():
        raise HTTPException(
            status_code=400,
            detail="Platform is not connected"
        )

    platform_data = get_platform_data(platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail="No mock data available for this platform"
        )

    records_synced = 0

    for data in platform_data:

        content = Content(
            creator_id=1,
            platform=data["platform"],
            content_title=data["content_title"],
            views=data["views"],
            likes=data["likes"],
            comments=data["comments"],
            shares=data["shares"],
            saves=data["saves"],
            watch_time=data["watch_time"],
            reach=data["reach"],
            published_date=data.get(
                "published_date"
            )
        )

        db.add(content)

        records_synced += 1

    db.commit()

    return {
        "platform": platform,
        "status": "success",
        "records_synced": records_synced
    }


# --------------------------------------------------
# SPRINT 5 - YOUTUBE SYNCHRONIZATION
# --------------------------------------------------

@router.post("/youtube/sync")
def synchronize_youtube(
    request: YouTubeSyncRequest,
    db: Session = Depends(get_db)
):
    """
    Fetch a YouTube video, transform it into the
    CreatorIQ format and create/update PostgreSQL data.
    """

    try:

        youtube_data = get_video_data(
            request.video_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except PermissionError as e:

        raise HTTPException(
            status_code=403,
            detail=str(e)
        )

    except RuntimeError as e:

        raise HTTPException(
            status_code=502,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

    # ------------------------------------------
    # Video not found
    # ------------------------------------------

    if youtube_data is None:

        raise HTTPException(
            status_code=404,
            detail="YouTube video not found"
        )

    external_id = youtube_data[
        "external_content_id"
    ]

    # ------------------------------------------
    # Check duplicate
    # ------------------------------------------

    existing_content = (
        db.query(Content)
        .filter(
            Content.platform == "YouTube",
            Content.external_content_id == external_id,
            Content.creator_id == request.creator_id
        )
        .first()
    )

    # ------------------------------------------
    # UPDATE existing record
    # ------------------------------------------

    if existing_content:

        existing_content.content_title = (
            youtube_data["content_title"]
        )

        existing_content.views = (
            youtube_data["views"]
        )

        existing_content.likes = (
            youtube_data["likes"]
        )

        existing_content.comments = (
            youtube_data["comments"]
        )

        existing_content.shares = (
            youtube_data["shares"]
        )

        existing_content.saves = (
            youtube_data["saves"]
        )

        existing_content.watch_time = (
            youtube_data["watch_time"]
        )

        existing_content.reach = (
            youtube_data["reach"]
        )

        existing_content.published_date = (
            youtube_data["published_date"]
        )

        db.commit()

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": 1,
            "records_created": 0,
            "records_updated": 1
        }

    # ------------------------------------------
    # CREATE new record
    # ------------------------------------------

    content = Content(
        creator_id=request.creator_id,
        platform=youtube_data["platform"],
        external_content_id=youtube_data[
            "external_content_id"
        ],
        content_title=youtube_data[
            "content_title"
        ],
        views=youtube_data["views"],
        likes=youtube_data["likes"],
        comments=youtube_data["comments"],
        shares=youtube_data["shares"],
        saves=youtube_data["saves"],
        watch_time=youtube_data["watch_time"],
        reach=youtube_data["reach"],
        published_date=youtube_data[
            "published_date"
        ]
    )

    db.add(content)

    db.commit()

    return {
        "platform": "YouTube",
        "status": "success",
        "records_synced": 1,
        "records_created": 1,
        "records_updated": 0
    }