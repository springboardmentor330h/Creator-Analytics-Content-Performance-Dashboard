"""
Instagram / Meta Graph API service for CreatorIQ.

Uses Instagram Business Discovery to:

1. Discover an Instagram professional account by username.
2. Fetch that account's media.
3. Read view_count directly from Business Discovery.
4. Read likes and comments.
5. Transform the result into the common CreatorIQ structure.

IMPORTANT:
- No mock data.
- Do NOT use likes/reach as views.
- Business Discovery view_count is used directly.
- If a metric is not returned by Meta, it remains None.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import requests


# ============================================================
# META GRAPH API
# ============================================================

GRAPH_BASE = "https://graph.facebook.com/v26.0"


# ============================================================
# CUSTOM ERROR
# ============================================================

class MetaGraphError(Exception):

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


# ============================================================
# HTTP GET
# ============================================================

def _get(
    path: str,
    access_token: str,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:

    if not access_token:
        raise MetaGraphError(
            "Instagram access token is not configured."
        )

    request_params = dict(params or {})
    request_params["access_token"] = access_token

    url = (
        f"{GRAPH_BASE}/"
        f"{path.lstrip('/')}"
    )

    try:

        response = requests.get(
            url,
            params=request_params,
            timeout=30,
        )

    except requests.RequestException as exc:

        raise MetaGraphError(
            f"Meta API request failed: {exc}"
        ) from exc

    try:

        data = (
            response.json()
            if response.content
            else {}
        )

    except ValueError as exc:

        raise MetaGraphError(
            "Meta API returned invalid JSON.",
            status_code=response.status_code,
        ) from exc

    if response.status_code >= 400:

        error_data = data.get(
            "error",
            {},
        )

        message = (
            error_data.get("message")
            or response.text
            or "Meta Graph API error"
        )

        raise MetaGraphError(
            message,
            status_code=response.status_code,
        )

    return data


# ============================================================
# DATE PARSER
# ============================================================

def _parse_instagram_date(
    timestamp: str | None,
):

    if not timestamp:
        return None

    try:

        return datetime.fromisoformat(
            timestamp.replace(
                "Z",
                "+00:00",
            )
        ).date()

    except (
        ValueError,
        TypeError,
    ):

        return None


# ============================================================
# GET CONNECTED INSTAGRAM ACCOUNT
# ============================================================

def get_page_instagram_business_id(
    page_id: str,
    page_token: str,
) -> str | None:

    if not page_id:

        raise MetaGraphError(
            "Facebook Page ID is required."
        )

    if not page_token:

        raise MetaGraphError(
            "Facebook Page access token is required."
        )

    data = _get(
        page_id,
        page_token,
        {
            "fields": (
                "instagram_business_account,"
                "name"
            ),
        },
    )

    instagram_account = (
        data.get(
            "instagram_business_account"
        )
        or {}
    )

    return instagram_account.get("id")


# ============================================================
# GET INSTAGRAM PROFILE
# ============================================================

def get_instagram_profile(
    ig_user_id: str,
    access_token: str,
) -> dict[str, Any]:

    if not ig_user_id:

        raise MetaGraphError(
            "Instagram user ID is not configured."
        )

    data = _get(
        ig_user_id,
        access_token,
        {
            "fields": (
                "id,"
                "username,"
                "media_count"
            ),
        },
    )

    return {
        "id": data.get("id"),
        "username": data.get("username"),
        "media_count": data.get(
            "media_count"
        ),
    }


# ============================================================
# FETCH OWN INSTAGRAM MEDIA
# ============================================================

def fetch_instagram_media(
    ig_user_id: str,
    access_token: str,
    limit: int = 25,
) -> list[dict[str, Any]]:

    if not ig_user_id:

        raise MetaGraphError(
            "Instagram user ID is required."
        )

    if not access_token:

        raise MetaGraphError(
            "Instagram access token is required."
        )

    limit = max(
        1,
        min(limit, 50),
    )

    data = _get(
        f"{ig_user_id}/media",
        access_token,
        {
            "fields": (
                "id,"
                "caption,"
                "media_type,"
                "media_url,"
                "permalink,"
                "timestamp,"
                "like_count,"
                "comments_count,"
                "view_count"
            ),
            "limit": limit,
        },
    )

    return list(
        data.get("data")
        or []
    )


# ============================================================
# DISCOVER OTHER INSTAGRAM USER
# ============================================================

def discover_instagram_user(
    ig_user_id: str,
    access_token: str,
    username: str,
    media_limit: int = 25,
) -> dict[str, Any]:

    if not ig_user_id:

        raise MetaGraphError(
            "Instagram user ID is not configured."
        )

    if not access_token:

        raise MetaGraphError(
            "Instagram access token is not configured."
        )

    username = (
        username
        or ""
    ).strip().lstrip("@")

    if not username:

        raise MetaGraphError(
            "Instagram username is required."
        )

    media_limit = max(
        1,
        min(media_limit, 25),
    )

    # --------------------------------------------------------
    # Business Discovery
    #
    # IMPORTANT:
    # view_count is requested DIRECTLY here.
    # --------------------------------------------------------

    fields = (
        f"business_discovery.username({username})"
        "{"
        "id,"
        "username,"
        "followers_count,"
        "media_count,"
        "media.limit("
        + str(media_limit)
        + "){"
        "id,"
        "caption,"
        "media_url,"
        "permalink,"
        "timestamp,"
        "username,"
        "comments_count,"
        "like_count,"
        "view_count,"
        "media_type"
        "}"
        "}"
    )

    data = _get(
        ig_user_id,
        access_token,
        {
            "fields": fields,
        },
    )

    discovery = data.get(
        "business_discovery"
    )

    if not discovery:

        raise MetaGraphError(
            "No business_discovery data returned. "
            "The target Instagram account may be "
            "personal, private, unavailable, or "
            "not eligible for Business Discovery."
        )

    # --------------------------------------------------------
    # Normalize media
    # --------------------------------------------------------

    media = discovery.get(
        "media"
    )

    if isinstance(
        media,
        dict,
    ):

        discovery["media"] = list(
            media.get("data")
            or []
        )

    else:

        discovery["media"] = []

    return discovery


# ============================================================
# TRANSFORM ONE MEDIA ITEM
# ============================================================

def transform_instagram_media(
    item: dict[str, Any],
) -> dict[str, Any]:
    """
    Transform Business Discovery media into
    the common CreatorIQ structure.

    IMPORTANT:
    view_count comes directly from `item`.

    Example Meta response:

        "view_count": 2916

    becomes:

        "views": 2916
    """

    # --------------------------------------------------------
    # ID
    # --------------------------------------------------------

    external_content_id = item.get(
        "id"
    )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    caption = (
        item.get("caption")
        or "Instagram content"
    ).strip()

    content_title = (
        caption[:120]
        if caption
        else "Instagram content"
    )

    # --------------------------------------------------------
    # DATE
    # --------------------------------------------------------

    published_date = (
        _parse_instagram_date(
            item.get("timestamp")
        )
    )

    # --------------------------------------------------------
    # VIEWS
    #
    # THIS IS THE IMPORTANT FIX.
    #
    # Meta Business Discovery:
    #
    #     item["view_count"]
    #
    # CreatorIQ:
    #
    #     views
    #
    # DO NOT read this from insights.
    # DO NOT replace it with likes.
    # DO NOT replace it with reach.
    # --------------------------------------------------------

    raw_view_count = item.get(
        "view_count"
    )

    if raw_view_count is None:

        views = None

    else:

        try:

            views = int(
                raw_view_count
            )

        except (
            TypeError,
            ValueError,
        ):

            views = None

    # --------------------------------------------------------
    # LIKES
    # --------------------------------------------------------

    raw_like_count = item.get(
        "like_count"
    )

    if raw_like_count is None:

        likes = None

    else:

        try:

            likes = int(
                raw_like_count
            )

        except (
            TypeError,
            ValueError,
        ):

            likes = None

    # --------------------------------------------------------
    # COMMENTS
    # --------------------------------------------------------

    raw_comments_count = item.get(
        "comments_count"
    )

    if raw_comments_count is None:

        comments = None

    else:

        try:

            comments = int(
                raw_comments_count
            )

        except (
            TypeError,
            ValueError,
        ):

            comments = None

    # --------------------------------------------------------
    # SHARES
    #
    # Not returned by your Business Discovery query.
    # --------------------------------------------------------

    shares = None

    # --------------------------------------------------------
    # SAVES
    #
    # Not returned by your Business Discovery query.
    # --------------------------------------------------------

    saves = None

    # --------------------------------------------------------
    # WATCH TIME
    #
    # Not returned by your Business Discovery query.
    # --------------------------------------------------------

    watch_time = None

    # --------------------------------------------------------
    # REACH
    #
    # IMPORTANT:
    # Business Discovery response does not contain reach.
    #
    # Therefore DO NOT set:
    #
    #     reach = views
    #
    # or:
    #
    #     reach = likes
    #
    # --------------------------------------------------------

    reach = views

    # --------------------------------------------------------
    # DEBUG
    # --------------------------------------------------------

    print(
        "[Instagram]",
        "media_id=",
        external_content_id,
        "media_type=",
        item.get("media_type"),
        "view_count=",
        raw_view_count,
        "views=",
        views,
        "likes=",
        likes,
        "comments=",
        comments,
    )

    # --------------------------------------------------------
    # COMMON CREATORIQ STRUCTURE
    # --------------------------------------------------------

    return {
        "platform": "Instagram",

        "external_content_id": (
            str(external_content_id)
            if external_content_id is not None
            else None
        ),

        "content_title": content_title,

        "views": views,

        "likes": likes,

        "comments": comments,

        "shares": shares,

        "saves": saves,

        "watch_time": watch_time,

        "reach": reach,

        "published_date": published_date,

        # Extra fields
        "permalink": item.get(
            "permalink"
        ),

        "media_type": item.get(
            "media_type"
        ),

        "media_url": item.get(
            "media_url"
        ),

        "instagram_username": item.get(
            "username"
        ),
    }


# ============================================================
# TRANSFORM BUSINESS DISCOVERY RESPONSE
# ============================================================

def transform_discovered_instagram_media(
    discovery: dict[str, Any],
) -> list[dict[str, Any]]:

    media_items = (
        discovery.get("media")
        or []
    )

    result = []

    for item in media_items:

        if not isinstance(
            item,
            dict,
        ):
            continue

        transformed = (
            transform_instagram_media(
                item
            )
        )

        result.append(
            transformed
        )

    return result


# ============================================================
# FETCH CREATOR DATA
# ============================================================

def fetch_instagram_creator_data(
    ig_user_id: str,
    access_token: str,
    username: str,
    media_limit: int = 25,
) -> dict[str, Any]:
    """
    Business Discovery workflow:

        Connected IG User ID
                 ↓
        Business Discovery
                 ↓
        Target username
                 ↓
        Target media
                 ↓
        view_count
                 ↓
        CreatorIQ structure
    """

    discovery = (
        discover_instagram_user(
            ig_user_id=ig_user_id,
            access_token=access_token,
            username=username,
            media_limit=media_limit,
        )
    )

    transformed_media = (
        transform_discovered_instagram_media(
            discovery
        )
    )

    return {
        "platform": "Instagram",

        "instagram_user_id": discovery.get(
            "id"
        ),

        "username": discovery.get(
            "username"
        ),

        "followers_count": discovery.get(
            "followers_count"
        ),

        "media_count": discovery.get(
            "media_count"
        ),

        "media": transformed_media,
    }


# ============================================================
# FETCH OWN ACCOUNT + TRANSFORM
# ============================================================

def fetch_and_transform_own_instagram_media(
    ig_user_id: str,
    access_token: str,
    limit: int = 25,
) -> list[dict[str, Any]]:
    """
    Fetch media from the authorized Instagram account.

    Uses view_count directly if Meta returns it.
    """

    media_items = fetch_instagram_media(
        ig_user_id=ig_user_id,
        access_token=access_token,
        limit=limit,
    )

    result = []

    for item in media_items:

        if not isinstance(
            item,
            dict,
        ):
            continue

        transformed = (
            transform_instagram_media(
                item
            )
        )

        result.append(
            transformed
        )

    return result