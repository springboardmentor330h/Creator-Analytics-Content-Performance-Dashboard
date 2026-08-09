import requests

from app.core.config import YOUTUBE_API_KEY


YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"


def search_videos(query: str, max_results: int = 10):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }

    response = requests.get(
        f"{YOUTUBE_API_URL}/search",
        params=params,
        timeout=15,
    )

    response.raise_for_status()

    return response.json()


def get_video_details(video_id: str):
    params = {
        "part": "snippet,statistics,contentDetails",
        "id": video_id,
        "key": YOUTUBE_API_KEY,
    }

    response = requests.get(
        f"{YOUTUBE_API_URL}/videos",
        params=params,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    if not data.get("items"):
        return None

    return data["items"][0]