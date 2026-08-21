import os
import requests

from datetime import datetime
from dotenv import load_dotenv


load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

BASE_URL = "https://www.googleapis.com/youtube/v3"


def get_video_data(video_id: str):
    """
    Fetch a single public YouTube video's details
    and transform it into the CreatorIQ common format.
    """

    if not YOUTUBE_API_KEY:
        raise ValueError(
            "YOUTUBE_API_KEY is not configured"
        )

    url = f"{BASE_URL}/videos"

    params = {
        "part": "snippet,statistics",
        "id": video_id,
        "key": YOUTUBE_API_KEY
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=15
        )
    except requests.RequestException as e:
        raise RuntimeError(
            f"Failed to connect to YouTube API: {str(e)}"
        )

    if response.status_code == 400:
        raise ValueError(
            "Invalid YouTube video ID"
        )

    if response.status_code == 403:
        raise PermissionError(
            "YouTube API request denied. "
            "Check API key, API restrictions, or quota."
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"YouTube API request failed with "
            f"status code {response.status_code}"
        )

    data = response.json()

    items = data.get("items", [])

    if not items:
        return None

    video = items[0]

    snippet = video.get("snippet", {})
    statistics = video.get("statistics", {})

    published_at = snippet.get("publishedAt")

    if published_at:
        published_date = datetime.fromisoformat(
            published_at.replace("Z", "+00:00")
        ).date()
    else:
        published_date = datetime.now().date()

    return {
        "platform": "YouTube",

        "external_content_id": video.get(
            "id"
        ),

        "content_title": snippet.get(
            "title",
            "Untitled"
        ),

        "views": int(
            statistics.get("viewCount", 0)
        ),

        "likes": int(
            statistics.get("likeCount", 0)
        ),

        "comments": int(
            statistics.get("commentCount", 0)
        ),

        # YouTube Data API does not provide
        # public share count through this endpoint.
        "shares": 0,

        "saves": 0,

        # Watch time is not available through
        # the public Data API video statistics.
        "watch_time": 0,

        # Reach is not directly provided.
        # For this project we use views as a
        # practical approximation.
        "reach": int(
            statistics.get("viewCount", 0)
        ),

        "published_date": published_date
    }