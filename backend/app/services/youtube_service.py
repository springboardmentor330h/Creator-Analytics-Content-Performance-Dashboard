import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeAPIError(Exception):
    """Raised when the YouTube API returns an error or unexpected response."""
    pass


def fetch_channel_videos(channel_id: str, max_results: int = 10) -> list:
    """
    Fetches the most recent video IDs for a channel.
    Step 1: search.list to get video IDs for the channel.
    """
    if not YOUTUBE_API_KEY:
        raise YouTubeAPIError("YouTube API key is not configured. Check YOUTUBE_API_KEY in .env")

    search_url = f"{YOUTUBE_API_BASE}/search"
    params = {
        "key": YOUTUBE_API_KEY,
        "channelId": channel_id,
        "part": "id",
        "order": "date",
        "maxResults": max_results,
        "type": "video"
    }

    response = requests.get(search_url, params=params)

    if response.status_code == 401:
        raise YouTubeAPIError("Invalid YouTube API key (401 Unauthorized).")
    if response.status_code == 403:
        raise YouTubeAPIError("YouTube API quota exceeded or access forbidden (403).")
    if response.status_code == 404:
        raise YouTubeAPIError(f"Channel not found: {channel_id}")
    if response.status_code != 200:
        raise YouTubeAPIError(f"YouTube API request failed with status {response.status_code}: {response.text}")

    data = response.json()
    items = data.get("items", [])

    if not items:
        raise YouTubeAPIError(f"No videos found for channel: {channel_id}")

    video_ids = [item["id"]["videoId"] for item in items if "videoId" in item.get("id", {})]

    if not video_ids:
        raise YouTubeAPIError("Empty or unexpected response structure from YouTube search API.")

    return video_ids


def fetch_video_statistics(video_ids: list) -> list:
    """
    Step 2: videos.list to get statistics (views, likes, comments) for given video IDs.
    """
    if not YOUTUBE_API_KEY:
        raise YouTubeAPIError("YouTube API key is not configured.")

    videos_url = f"{YOUTUBE_API_BASE}/videos"
    params = {
        "key": YOUTUBE_API_KEY,
        "id": ",".join(video_ids),
        "part": "snippet,statistics"
    }

    response = requests.get(videos_url, params=params)

    if response.status_code == 401:
        raise YouTubeAPIError("Invalid YouTube API key (401 Unauthorized).")
    if response.status_code == 403:
        raise YouTubeAPIError("YouTube API quota exceeded (403).")
    if response.status_code != 200:
        raise YouTubeAPIError(f"YouTube API request failed with status {response.status_code}: {response.text}")

    data = response.json()
    items = data.get("items", [])

    if not items:
        raise YouTubeAPIError("Empty response from YouTube videos API.")

    return items


def transform_to_common_format(video_item: dict, creator_id: int) -> dict:
    """
    Transforms a raw YouTube API video item into CreatorIQ's common content format.
    """
    snippet = video_item.get("snippet", {})
    statistics = video_item.get("statistics", {})

    published_at_raw = snippet.get("publishedAt")  # e.g. "2026-08-01T12:00:00Z"
    try:
        published_date = datetime.strptime(published_at_raw[:10], "%Y-%m-%d").date()
    except (TypeError, ValueError):
        published_date = datetime.today().date()

    views = int(statistics.get("viewCount", 0))
    likes = int(statistics.get("likeCount", 0))
    comments = int(statistics.get("commentCount", 0))

    return {
        "creator_id": creator_id,
        "platform": "YouTube",
        "external_content_id": video_item.get("id"),
        "content_title": snippet.get("title", "Untitled"),
        "views": views,
        "likes": likes,
        "comments": comments,
        "shares": 0,          # Not available via public YouTube Data API
        "saves": 0,           # Not available
        "watch_time": 0.0,    # Requires YouTube Analytics API (OAuth), not covered here
        "reach": views,       # Best available proxy — YouTube doesn't expose "reach" publicly
        "published_date": published_date
    }


def get_channel_content_in_common_format(channel_id: str, creator_id: int, max_results: int = 10) -> list:
    """Full pipeline: fetch videos -> fetch stats -> transform to CreatorIQ format."""
    video_ids = fetch_channel_videos(channel_id, max_results=max_results)
    print(f"DEBUG: video_ids fetched = {video_ids}")  # ADD THIS

    video_items = fetch_video_statistics(video_ids)
    print(f"DEBUG: video_items returned = {len(video_items)}")  # ADD THIS

    return [transform_to_common_format(item, creator_id) for item in video_items]