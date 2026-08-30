from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.config import settings

from app.db.database import get_db

from app.models.content import Content
from app.models.user import User

from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    normalize_platform,
    SUPPORTED_PLATFORMS,
)

from app.services.youtube_service import (
    get_youtube_channel_videos,
)

from app.services.instagram_service import (
    discover_instagram_user,
    transform_instagram_media,
    MetaGraphError,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/social",
    tags=["Social Media"],
)


# ============================================================
# HELPER
# ============================================================

def validate_creator(
    db: Session,
    creator_id: int,
) -> User:
    """
    Validate that the supplied ID belongs to a Creator.
    """

    creator = (
        db.query(User)
        .filter(
            User.id == creator_id
        )
        .first()
    )

    if not creator:
        raise HTTPException(
            status_code=404,
            detail="Creator not found",
        )

    if (
        not creator.role
        or creator.role.lower() != "creator"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "The supplied creator_id does not "
                "belong to a Creator account"
            ),
        )

    return creator


# ============================================================
# HELPER
# ============================================================

def check_creator_access(
    current_user: User,
    creator_id: int,
):
    """
    Creator can only synchronize their own data.
    Admin can synchronize any creator.
    """

    role = (
        current_user.role.lower()
        if current_user.role
        else ""
    )

    if (
        role == "creator"
        and current_user.id != creator_id
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Creators can only synchronize "
                "their own data."
            ),
        )


# ============================================================
# CONNECT PLATFORM
# ============================================================

@router.post("/connect")
def connect_social_platform(
    platform: str = Query(
        ...,
        description=(
            "Platform name: YouTube or Instagram"
        ),
    ),

    account_name: str = Query(
        ...,
        min_length=1,
        description="Connected account name or username",
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Register a social platform for the
    authenticated creator.

    No social-media data is fetched here.

    Actual synchronization happens through:

        POST /social/youtube/sync
        POST /social/instagram/sync
    """

    canonical = normalize_platform(
        platform
    )

    if canonical not in {
        "YouTube",
        "Instagram",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only YouTube and Instagram are "
                "supported for this sprint."
            ),
        )

    if (
        not account_name
        or not account_name.strip()
    ):
        raise HTTPException(
            status_code=400,
            detail="Account name is required.",
        )

    # --------------------------------------------------------
    # Creator connection
    # --------------------------------------------------------

    creator_id = current_user.id

    result = connect_platform(
        creator_id=creator_id,
        platform=canonical,
        account_name=account_name.strip(),
    )

    if not result:
        raise HTTPException(
            status_code=400,
            detail="Unable to connect platform.",
        )

    return {
        "message": (
            f"{canonical} account connected successfully"
        ),
        "creator_id": creator_id,
        "platform": canonical,
        "account_name": account_name.strip(),
        "connected_by": current_user.id,
    }


# ============================================================
# GET CONNECTED PLATFORMS
# ============================================================

@router.get("/platforms")
def connected_social_platforms(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return connected platforms for
    the authenticated creator.
    """

    return get_connected_platforms(
        creator_id=current_user.id
    )


# ============================================================
# YOUTUBE SYNCHRONIZATION
# ============================================================

@router.post("/youtube/sync")
def synchronize_youtube_data(
    creator_id: int = Query(
        ...,
        gt=0,
        description=(
            "CreatorIQ creator ID. "
            "All synchronized YouTube records are "
            "stored against this creator."
        ),
    ),

    channel_id: str = Query(
        ...,
        min_length=1,
        description="YouTube channel ID",
    ),

    max_results: int = Query(
        10,
        ge=1,
        le=50,
        description=(
            "Number of YouTube videos to synchronize"
        ),
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Synchronize YouTube content.

    YouTube API
        ↓
    Fetch
        ↓
    Transform
        ↓
    PostgreSQL
        ↓
    creator_id
    """

    # --------------------------------------------------------
    # Validate creator
    # --------------------------------------------------------

    creator = validate_creator(
        db,
        creator_id,
    )

    check_creator_access(
        current_user,
        creator_id,
    )

    # --------------------------------------------------------
    # Channel ID
    # --------------------------------------------------------

    channel_id = channel_id.strip()

    if not channel_id:

        raise HTTPException(
            status_code=400,
            detail="YouTube channel ID is required.",
        )

    # --------------------------------------------------------
    # Fetch YouTube
    # --------------------------------------------------------

    try:

        youtube_data = (
            get_youtube_channel_videos(
                channel_id=channel_id,
                max_results=max_results,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected error while fetching "
                f"YouTube data: {error}"
            ),
        )

    # --------------------------------------------------------
    # Empty
    # --------------------------------------------------------

    if not youtube_data:

        return {
            "platform": "YouTube",
            "status": "success",
            "creator_id": creator_id,
            "creator_name": creator.full_name,
            "records_synced": 0,
            "records_created": 0,
            "records_updated": 0,
            "records_skipped": 0,
            "message": (
                "No YouTube videos were found "
                "for the specified channel."
            ),
        }

    records_created = 0
    records_updated = 0
    records_skipped = 0

    # --------------------------------------------------------
    # Process
    # --------------------------------------------------------

    try:

        for video_data in youtube_data:

            external_content_id = (
                video_data.get(
                    "external_content_id"
                )
            )

            if not external_content_id:

                records_skipped += 1
                continue

            published_date = (
                video_data.get(
                    "published_date"
                )
            )

            if not published_date:

                records_skipped += 1
                continue

            existing_content = (
                db.query(Content)
                .filter(
                    Content.creator_id == creator_id,
                    Content.platform == "YouTube",
                    Content.external_content_id
                    == str(
                        external_content_id
                    ),
                )
                .first()
            )

            # =================================================
            # UPDATE
            # =================================================

            if existing_content:

                existing_content.content_title = (
                    video_data.get(
                        "content_title"
                    )
                    or existing_content.content_title
                )

                existing_content.views = (
                    video_data.get("views")
                    or 0
                )

                existing_content.likes = (
                    video_data.get("likes")
                    or 0
                )

                existing_content.comments = (
                    video_data.get("comments")
                    or 0
                )

                existing_content.shares = (
                    video_data.get("shares")
                    or 0
                )

                existing_content.saves = (
                    video_data.get("saves")
                    or 0
                )

                existing_content.watch_time = (
                    video_data.get("watch_time")
                    or 0
                )

                existing_content.reach = (
                    video_data.get("reach")
                    or 0
                )

                existing_content.published_date = (
                    published_date
                )

                records_updated += 1

            # =================================================
            # CREATE
            # =================================================

            else:

                new_content = Content(
                    creator_id=creator_id,
                    platform="YouTube",
                    external_content_id=str(
                        external_content_id
                    ),
                    content_title=(
                        video_data.get(
                            "content_title"
                        )
                        or "Untitled YouTube Video"
                    ),
                    views=(
                        video_data.get("views")
                        or 0
                    ),
                    likes=(
                        video_data.get("likes")
                        or 0
                    ),
                    comments=(
                        video_data.get("comments")
                        or 0
                    ),
                    shares=(
                        video_data.get("shares")
                        or 0
                    ),
                    saves=(
                        video_data.get("saves")
                        or 0
                    ),
                    watch_time=(
                        video_data.get("watch_time")
                        or 0
                    ),
                    reach=(
                        video_data.get("reach")
                        or 0
                    ),
                    published_date=(
                        published_date
                    ),
                )

                db.add(
                    new_content
                )

                records_created += 1

        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to store YouTube data "
                f"in PostgreSQL: {error}"
            ),
        )

    return {
        "platform": "YouTube",
        "status": "success",
        "creator_id": creator_id,
        "creator_name": creator.full_name,
        "channel_id": channel_id,
        "records_synced": (
            records_created
            + records_updated
        ),
        "records_created": records_created,
        "records_updated": records_updated,
        "records_skipped": records_skipped,
        "message": (
            "YouTube data synchronized "
            "successfully."
        ),
    }


# ============================================================
# INSTAGRAM SYNCHRONIZATION
# ============================================================

@router.post("/instagram/sync")
def synchronize_instagram_data(
    creator_id: int = Query(
        ...,
        gt=0,
        description=(
            "CreatorIQ creator ID. "
            "All synchronized Instagram records "
            "are stored against this creator."
        ),
    ),

    instagram_username: str = Query(
        ...,
        min_length=1,
        description=(
            "Instagram Business/Creator username "
            "to retrieve through Meta Business Discovery."
        ),
    ),

    media_limit: int = Query(
        10,
        ge=1,
        le=25,
        description=(
            "Maximum number of Instagram media "
            "records to synchronize."
        ),
    ),

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Synchronize Instagram Business Discovery data.

    IMPORTANT:

    The creator_id supplied here is the CreatorIQ
    database creator.

    instagram_username is the Instagram account
    being discovered.

    Example:

        creator_id = 4
        instagram_username = madhu_0006

    The records are stored as:

        creator_id = 4
        platform = Instagram

    Meta:

        Business Discovery
                ↓
        username
                ↓
        media
                ↓
        view_count
                ↓
        CreatorIQ views
                ↓
        PostgreSQL
    """

    # ========================================================
    # CREATOR VALIDATION
    # ========================================================

    creator = validate_creator(
        db,
        creator_id,
    )

    check_creator_access(
        current_user,
        creator_id,
    )

    # ========================================================
    # USERNAME
    # ========================================================

    instagram_username = (
        instagram_username
        .strip()
        .lstrip("@")
    )

    if not instagram_username:

        raise HTTPException(
            status_code=400,
            detail=(
                "Instagram username is required."
            ),
        )

    # ========================================================
    # SETTINGS
    # ========================================================

    ig_user_id = getattr(
        settings,
        "INSTAGRAM_USER_ID",
        None,
    )

    access_token = getattr(
        settings,
        "INSTAGRAM_ACCESS_TOKEN",
        None,
    )

    if not ig_user_id:

        raise HTTPException(
            status_code=500,
            detail=(
                "Instagram user ID is not configured. "
                "Set INSTAGRAM_USER_ID in .env."
            ),
        )

    if not access_token:

        raise HTTPException(
            status_code=500,
            detail=(
                "Instagram access token is not configured. "
                "Set INSTAGRAM_ACCESS_TOKEN in .env."
            ),
        )

    # ========================================================
    # META BUSINESS DISCOVERY
    # ========================================================

    try:

        discovery = (
            discover_instagram_user(
                ig_user_id=ig_user_id,
                access_token=access_token,
                username=instagram_username,
                media_limit=media_limit,
            )
        )

    except MetaGraphError as error:

        raise HTTPException(
            status_code=400,
            detail=error.message,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected error while accessing "
                f"Instagram: {error}"
            ),
        )

    # ========================================================
    # GET MEDIA
    # ========================================================

    media_container = (
        discovery.get("media")
        or {}
    )

    if isinstance(
        media_container,
        dict,
    ):

        media_items = (
            media_container.get(
                "data"
            )
            or []
        )

    elif isinstance(
        media_container,
        list,
    ):

        media_items = media_container

    else:

        media_items = []

    # ========================================================
    # NO MEDIA
    # ========================================================

    if not media_items:

        return {
            "platform": "Instagram",
            "status": "success",
            "creator_id": creator_id,
            "creator_name": creator.full_name,
            "instagram_username": (
                instagram_username
            ),
            "records_synced": 0,
            "records_created": 0,
            "records_updated": 0,
            "records_skipped": 0,
            "message": (
                "No Instagram media was found."
            ),
        }

    records_created = 0
    records_updated = 0
    records_skipped = 0

    # ========================================================
    # PROCESS MEDIA
    # ========================================================

    try:

        for item in media_items:

            if not isinstance(
                item,
                dict,
            ):
                records_skipped += 1
                continue

            # ------------------------------------------------
            # TRANSFORM USING INSTAGRAM SERVICE
            #
            # THIS IS THE IMPORTANT FIX.
            #
            # transform_instagram_media()
            # reads:
            #
            #     item["view_count"]
            #
            # and converts it to:
            #
            #     data["views"]
            # ------------------------------------------------

            instagram_data = (
                transform_instagram_media(
                    item
                )
            )

            external_content_id = (
                instagram_data.get(
                    "external_content_id"
                )
            )

            if not external_content_id:

                records_skipped += 1
                continue

            published_date = (
                instagram_data.get(
                    "published_date"
                )
            )

            # ------------------------------------------------
            # DEBUG
            # ------------------------------------------------

            print(
                "========================================"
            )

            print(
                "INSTAGRAM SYNC"
            )

            print(
                "CreatorIQ creator_id:",
                creator_id,
            )

            print(
                "Instagram username:",
                instagram_username,
            )

            print(
                "Media ID:",
                external_content_id,
            )

            print(
                "Meta view_count:",
                item.get(
                    "view_count"
                ),
            )

            print(
                "CreatorIQ views:",
                instagram_data.get(
                    "views"
                ),
            )

            print(
                "Likes:",
                instagram_data.get(
                    "likes"
                ),
            )

            print(
                "Comments:",
                instagram_data.get(
                    "comments"
                ),
            )

            print(
                "Reach:",
                instagram_data.get(
                    "reach"
                ),
            )

            print(
                "========================================"
            )

            # ------------------------------------------------
            # FIND EXISTING
            # ------------------------------------------------

            existing_content = (
                db.query(Content)
                .filter(
                    Content.creator_id == creator_id,
                    Content.platform == "Instagram",
                    Content.external_content_id
                    == str(
                        external_content_id
                    ),
                )
                .first()
            )

            # =================================================
            # UPDATE EXISTING
            # =================================================

            if existing_content:

                existing_content.content_title = (
                    instagram_data.get(
                        "content_title"
                    )
                    or existing_content.content_title
                )

                # --------------------------------------------
                # IMPORTANT
                #
                # Do NOT use:
                #
                #     views = 0
                #
                # --------------------------------------------

                new_views = instagram_data.get(
                    "views"
                )

                if new_views is not None:

                    existing_content.views = (
                        new_views
                    )

                new_likes = instagram_data.get(
                    "likes"
                )

                if new_likes is not None:

                    existing_content.likes = (
                        new_likes
                    )

                new_comments = instagram_data.get(
                    "comments"
                )

                if new_comments is not None:

                    existing_content.comments = (
                        new_comments
                    )

                new_shares = instagram_data.get(
                    "shares"
                )

                if new_shares is not None:

                    existing_content.shares = (
                        new_shares
                    )

                new_saves = instagram_data.get(
                    "saves"
                )

                if new_saves is not None:

                    existing_content.saves = (
                        new_saves
                    )

                new_watch_time = (
                    instagram_data.get(
                        "watch_time"
                    )
                )

                if new_watch_time is not None:

                    existing_content.watch_time = (
                        new_watch_time
                    )

                new_reach = instagram_data.get(
                    "reach"
                )

                if new_reach is not None:

                    existing_content.reach = (
                        new_reach
                    )

                if published_date:

                    existing_content.published_date = (
                        published_date
                    )

                records_updated += 1

            # =================================================
            # CREATE NEW
            # =================================================

            else:

                new_content = Content(
                    creator_id=creator_id,

                    platform="Instagram",

                    external_content_id=str(
                        external_content_id
                    ),

                    content_title=(
                        instagram_data.get(
                            "content_title"
                        )
                        or "Instagram content"
                    ),

                    # ----------------------------------------
                    # REAL VIEW COUNT
                    # ----------------------------------------

                    views=(
                        instagram_data.get(
                            "views"
                        )
                    ),

                    likes=(
                        instagram_data.get(
                            "likes"
                        )
                    ),

                    comments=(
                        instagram_data.get(
                            "comments"
                        )
                    ),

                    shares=(
                        instagram_data.get(
                            "shares"
                        )
                    ),

                    saves=(
                        instagram_data.get(
                            "saves"
                        )
                    ),

                    watch_time=(
                        instagram_data.get(
                            "watch_time"
                        )
                    ),

                    reach=(
                        instagram_data.get(
                            "reach"
                        )
                    ),

                    published_date=(
                        published_date
                    ),
                )

                db.add(
                    new_content
                )

                records_created += 1

        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to store Instagram data "
                f"in PostgreSQL: {error}"
            ),
        )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "platform": "Instagram",

        "status": "success",

        "creator_id": creator_id,

        "creator_name": creator.full_name,

        "instagram_username": (
            instagram_username
        ),

        "instagram_user_id": (
            discovery.get("id")
        ),

        "instagram_followers": (
            discovery.get(
                "followers_count"
            )
        ),

        "instagram_media_count": (
            discovery.get(
                "media_count"
            )
        ),

        "records_synced": (
            records_created
            + records_updated
        ),

        "records_created": records_created,

        "records_updated": records_updated,

        "records_skipped": records_skipped,

        "message": (
            "Instagram data synchronized "
            "successfully."
        ),
    }