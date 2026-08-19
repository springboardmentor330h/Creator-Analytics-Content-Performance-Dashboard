from datetime import datetime

import requests

from app.core.config import settings


# ============================================================
# YOUTUBE API
# ============================================================

YOUTUBE_API_URL = (
    "https://www.googleapis.com/youtube/v3"
)


# ============================================================
# GET YOUTUBE CHANNEL VIDEOS
# ============================================================

def get_youtube_channel_videos(
    channel_id: str,
    max_results: int = 10
):

    # --------------------------------------------------------
    # VALIDATE API KEY
    # --------------------------------------------------------

    if not settings.YOUTUBE_API_KEY:

        raise ValueError(
            "YouTube API key is not configured"
        )

    # --------------------------------------------------------
    # VALIDATE CHANNEL ID
    # --------------------------------------------------------

    if not channel_id:

        raise ValueError(
            "YouTube channel ID is required"
        )

    # --------------------------------------------------------
    # VALIDATE MAX RESULTS
    # --------------------------------------------------------

    if max_results < 1 or max_results > 50:

        raise ValueError(
            "max_results must be between 1 and 50"
        )

    # ========================================================
    # STEP 1
    # GET VIDEOS FROM CHANNEL
    # ========================================================

    search_url = (
        f"{YOUTUBE_API_URL}/search"
    )

    search_params = {

        "key": settings.YOUTUBE_API_KEY,

        "channelId": channel_id,

        "part": "snippet",

        "order": "date",

        "type": "video",

        "maxResults": max_results
    }

    try:

        response = requests.get(
            search_url,
            params=search_params,
            timeout=15
        )

    except requests.RequestException as error:

        raise ValueError(
            "Failed to connect to YouTube API: "
            f"{error}"
        )

    # --------------------------------------------------------
    # HANDLE SEARCH API ERROR
    # --------------------------------------------------------

    if response.status_code != 200:

        try:

            error_data = response.json()

            error_message = (
                error_data
                .get("error", {})
                .get("message")
            )

            error_reason = (
                error_data
                .get("error", {})
                .get("errors", [{}])[0]
                .get("reason")
            )

            if error_reason:

                error_message = (
                    f"{error_message} "
                    f"({error_reason})"
                )

        except Exception:

            error_message = response.text

        raise ValueError(
            f"YouTube API error: {error_message}"
        )

    # --------------------------------------------------------
    # PARSE SEARCH RESPONSE
    # --------------------------------------------------------

    try:

        search_data = response.json()

    except ValueError:

        raise ValueError(
            "YouTube API returned invalid JSON"
        )

    # --------------------------------------------------------
    # EXTRACT VIDEO IDS
    # --------------------------------------------------------

    video_ids = []

    for item in search_data.get("items", []):

        video_id = (
            item
            .get("id", {})
            .get("videoId")
        )

        if video_id:

            video_ids.append(video_id)

    # --------------------------------------------------------
    # NO VIDEOS
    # --------------------------------------------------------

    if not video_ids:

        return []

    # ========================================================
    # STEP 2
    # GET VIDEO STATISTICS
    # ========================================================

    videos_url = (
        f"{YOUTUBE_API_URL}/videos"
    )

    videos_params = {

        "key": settings.YOUTUBE_API_KEY,

        "id": ",".join(video_ids),

        "part": "snippet,statistics"
    }

    try:

        response = requests.get(
            videos_url,
            params=videos_params,
            timeout=15
        )

    except requests.RequestException as error:

        raise ValueError(
            "Failed to fetch YouTube video data: "
            f"{error}"
        )

    # --------------------------------------------------------
    # HANDLE VIDEO API ERROR
    # --------------------------------------------------------

    if response.status_code != 200:

        try:

            error_data = response.json()

            error_message = (
                error_data
                .get("error", {})
                .get("message")
            )

        except Exception:

            error_message = response.text

        raise ValueError(
            f"YouTube API error: {error_message}"
        )

    # --------------------------------------------------------
    # PARSE RESPONSE
    # --------------------------------------------------------

    try:

        videos_data = response.json()

    except ValueError:

        raise ValueError(
            "YouTube API returned invalid JSON"
        )

    # ========================================================
    # STEP 3
    # TRANSFORM TO CREATORIQ FORMAT
    # ========================================================

    transformed_data = []

    for video in videos_data.get("items", []):

        video_id = video.get("id")

        if not video_id:

            continue

        statistics = (
            video.get("statistics", {})
        )

        snippet = (
            video.get("snippet", {})
        )

        published_at = (
            snippet.get("publishedAt")
        )

        # ----------------------------------------------------
        # CONVERT PUBLISHED DATE
        # ----------------------------------------------------

        published_date = None

        if published_at:

            try:

                published_date = (
                    datetime
                    .fromisoformat(
                        published_at.replace(
                            "Z",
                            "+00:00"
                        )
                    )
                    .date()
                )

            except ValueError:

                published_date = None

        # ----------------------------------------------------
        # CONTENT TITLE
        # ----------------------------------------------------

        content_title = (
            snippet.get("title")
            or "Untitled YouTube Video"
        )

        # ----------------------------------------------------
        # CREATORIQ COMMON FORMAT
        # ----------------------------------------------------

        transformed_data.append({

            "platform": "YouTube",

            "external_content_id": video_id,

            "content_title": content_title,

            "views": int(
                statistics.get(
                    "viewCount",
                    0
                )
            ),

            "likes": int(
                statistics.get(
                    "likeCount",
                    0
                )
            ),

            "comments": int(
                statistics.get(
                    "commentCount",
                    0
                )
            ),

            # YouTube Data API does not
            # provide general share count.
            "shares": 0,

            "saves": 0,

            # Watch time is not available
            # from this public Data API request.
            "watch_time": 0,

            # Reach is not directly provided
            # by YouTube Data API.
            "reach": 0,

            "published_date": published_date
        })

    return transformed_data