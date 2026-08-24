"""
youtube_service.py

Handles all direct communication with the YouTube Data API v3.
This file ONLY talks to YouTube and transforms its response into the
CreatorIQ common content format — it never touches the database.
That work belongs to social_media.py (the sync/service layer).
"""

from datetime import datetime
from typing import Any, Dict, List

import requests

from app.config import settings

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeAPIError(Exception):
    """Raised for any YouTube API failure (bad key, bad channel, quota, etc.)."""
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _get_api_key() -> str:
    api_key = settings.YOUTUBE_API_KEY
    if not api_key:
        raise YouTubeAPIError(
            "YOUTUBE_API_KEY is not configured. Add it to your .env file.",
            status_code=500,
        )
    return api_key


def _handle_response_errors(response: requests.Response) -> None:
    """Raises a YouTubeAPIError with a clear message for common failure cases."""
    if response.status_code == 200:
        return

    try:
        error_body = response.json().get("error", {})
        reason = error_body.get("errors", [{}])[0].get("reason", "")
        message = error_body.get("message", "Unknown YouTube API error")
    except Exception:
        reason = ""
        message = response.text or "Unknown YouTube API error"

    if response.status_code == 400:
        raise YouTubeAPIError(f"Invalid request to YouTube API: {message}", 400)
    if response.status_code == 403:
        if reason == "quotaExceeded":
            raise YouTubeAPIError("YouTube API quota exceeded. Try again later.", 429)
        raise YouTubeAPIError(f"YouTube API access forbidden (check API key): {message}", 403)
    if response.status_code == 404:
        raise YouTubeAPIError("Channel or video not found on YouTube.", 404)

    raise YouTubeAPIError(f"YouTube API request failed: {message}", response.status_code)


def fetch_channel_video_ids(channel_id: str, max_results: int = 10) -> List[str]:
    """
    Step 1 of the fetch workflow: given a YouTube channel ID, find its
    most recent video IDs using the search endpoint.
    """
    api_key = _get_api_key()
    params = {
        "key": api_key,
        "channelId": channel_id,
        "part": "id",
        "order": "date",
        "maxResults": max_results,
        "type": "video",
    }

    response = requests.get(f"{YOUTUBE_API_BASE}/search", params=params, timeout=10)
    _handle_response_errors(response)

    data = response.json()
    items = data.get("items", [])
    if not items:
        raise YouTubeAPIError(
            "No videos found for this channel (empty API response).", 404
        )

    return [item["id"]["videoId"] for item in items if "videoId" in item.get("id", {})]


def fetch_video_details(video_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Step 2 of the fetch workflow: given video IDs, fetch their statistics
    and metadata (title, published date, view/like/comment counts).
    """
    if not video_ids:
        return []

    api_key = _get_api_key()
    params = {
        "key": api_key,
        "id": ",".join(video_ids),
        "part": "snippet,statistics",
    }

    response = requests.get(f"{YOUTUBE_API_BASE}/videos", params=params, timeout=10)
    _handle_response_errors(response)

    data = response.json()
    items = data.get("items", [])
    if not items:
        raise YouTubeAPIError("Empty API response when fetching video details.", 404)

    return items


def transform_video_to_common_format(video: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms a single raw YouTube API video object into the CreatorIQ
    common content format used across all platforms.
    """
    snippet = video.get("snippet", {})
    statistics = video.get("statistics", {})

    published_raw = snippet.get("publishedAt")  # e.g. "2026-08-01T12:00:00Z"
    published_date = (
        datetime.strptime(published_raw[:10], "%Y-%m-%d").date()
        if published_raw
        else datetime.utcnow().date()
    )

    return {
        "platform": "YouTube",
        "external_content_id": video.get("id"),
        "content_title": snippet.get("title", "Untitled"),
        "views": int(statistics.get("viewCount", 0)),
        "likes": int(statistics.get("likeCount", 0)),
        "comments": int(statistics.get("commentCount", 0)),
        "shares": 0,       # not available via YouTube Data API
        "saves": 0,        # not applicable to YouTube
        "watch_time": 0,   # not available without YouTube Analytics API (OAuth)
        "reach": int(statistics.get("viewCount", 0)),  # best available proxy
        "published_date": published_date,
    }


def fetch_and_transform_channel_videos(channel_id: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Full YouTube fetch workflow: channel ID -> video IDs -> video details
    -> transformed CreatorIQ common-format records, ready to store.
    """
    video_ids = fetch_channel_video_ids(channel_id, max_results=max_results)
    raw_videos = fetch_video_details(video_ids)
    return [transform_video_to_common_format(v) for v in raw_videos]