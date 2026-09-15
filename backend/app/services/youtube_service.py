# app/services/youtube_service.py

import requests
from datetime import datetime
from typing import List, Dict, Any

from app.core.config import settings


YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"


def fetch_youtube_videos(video_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch YouTube video information using YouTube Data API v3.
    """

    if not video_ids:
        return []

    params = {
        "part": "snippet,statistics",
        "id": ",".join(video_ids),
        "key": settings.YOUTUBE_API_KEY,
    }

    try:
        response = requests.get(
            YOUTUBE_API_URL,
            params=params,
            timeout=15
        )

    except requests.RequestException as exc:
        raise RuntimeError(
            f"Unable to connect to YouTube API: {str(exc)}"
        )

    # API errors
    if response.status_code != 200:
        try:
            error_data = response.json()
        except ValueError:
            error_data = {}

        error_message = (
            error_data
            .get("error", {})
            .get("message", "Unknown YouTube API error")
        )

        raise RuntimeError(
            f"YouTube API request failed "
            f"(HTTP {response.status_code}): {error_message}"
        )

    try:
        data = response.json()
    except ValueError:
        raise RuntimeError("YouTube API returned an invalid response.")

    items = data.get("items", [])

    if not items:
        return []

    transformed_data = []

    for item in items:
        snippet = item.get("snippet", {})
        statistics = item.get("statistics", {})

        video_id = item.get("id")

        if not video_id:
            continue

        published_at = snippet.get("publishedAt")

        published_date = None

        if published_at:
            try:
                published_date = datetime.fromisoformat(
                    published_at.replace("Z", "+00:00")
                ).date()
            except ValueError:
                published_date = None

        # CreatorIQ common format
        transformed_data.append(
            {
                "platform": "YouTube",
                "external_content_id": video_id,
                "content_title": snippet.get(
                    "title",
                    "Untitled YouTube Video"
                ),
                "views": int(statistics.get("viewCount", 0)),
                "likes": int(statistics.get("likeCount", 0)),
                "comments": int(statistics.get("commentCount", 0)),
                "shares": 0,
                "reach": 0,
                "published_date": published_date,
            }
        )

    return transformed_data