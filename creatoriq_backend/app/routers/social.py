from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.db.database import get_db

from app.models.content import Content

from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    get_platform_data,
    connected_platforms
)


router = APIRouter(

    prefix="/social",

    tags=["Social Media"]
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class PlatformConnection(BaseModel):

    platform: str

    account_name: str


# ============================================================
# CONNECT PLATFORM
# POST /social/connect
# ============================================================

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
                "LinkedIn, TikTok, X"
            )
        )

    return {

        "message": (
            f"{request.platform} "
            "account connected successfully"
        ),

        "account_name": request.account_name
    }


# ============================================================
# GET CONNECTED PLATFORMS
# GET /social/platforms
# ============================================================

@router.get("/platforms")
def connected_social_platforms():

    return get_connected_platforms()


# ============================================================
# SYNCHRONIZE PLATFORM DATA
# POST /social/sync
# ============================================================

@router.post("/sync")
def synchronize_platform_data(

    platform: str,

    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK CONNECTION
    # --------------------------------------------------------

    if platform not in connected_platforms:

        raise HTTPException(

            status_code=400,

            detail=(
                f"{platform} is not connected. "
                "Connect the platform first."
            )
        )

    # --------------------------------------------------------
    # GET MOCK DATA
    # --------------------------------------------------------

    platform_data = get_platform_data(
        platform
    )

    if not platform_data:

        raise HTTPException(

            status_code=404,

            detail="Platform data not found"
        )

    # --------------------------------------------------------
    # CREATE CONTENT RECORD
    # --------------------------------------------------------

    new_content = Content(

        creator_id=platform_data[
            "creator_id"
        ],

        platform=platform_data[
            "platform"
        ],

        content_title=platform_data[
            "content_title"
        ],

        views=platform_data[
            "views"
        ],

        likes=platform_data[
            "likes"
        ],

        comments=platform_data[
            "comments"
        ],

        shares=platform_data[
            "shares"
        ],

        saves=platform_data[
            "saves"
        ],

        watch_time=platform_data[
            "watch_time"
        ],

        reach=platform_data[
            "reach"
        ],

        published_date=platform_data[
            "published_date"
        ]
    )

    # --------------------------------------------------------
    # STORE IN DATABASE
    # --------------------------------------------------------

    db.add(
        new_content
    )

    db.commit()

    db.refresh(
        new_content
    )

    # --------------------------------------------------------
    # RETURN RESPONSE
    # --------------------------------------------------------

    return {

        "message": (
            f"{platform} data "
            "synchronized successfully"
        ),

        "content_id": new_content.id,

        "platform": new_content.platform,

        "content_title": (
            new_content.content_title
        )
    }