from datetime import datetime

import requests

from app.core.config import settings

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeAPIError(Exception):
    pass


def fetch_channel_videos(channel_id: str, max_results: int = 10) -> list[dict]:
    """Fetches recent video ids for a channel, then their statistics.

    Requires YOUTUBE_API_KEY in .env. Raises YouTubeAPIError on any failure
    so the router can turn it into a clean 502 instead of a stack trace.
    """
    if not settings.YOUTUBE_API_KEY:
        raise YouTubeAPIError("YOUTUBE_API_KEY is not configured")

    search_resp = requests.get(
        f"{YOUTUBE_API_BASE}/search",
        params={
            "key": settings.YOUTUBE_API_KEY,
            "channelId": channel_id,
            "part": "id",
            "order": "date",
            "maxResults": max_results,
            "type": "video",
        },
        timeout=10,
    )

    if search_resp.status_code != 200:
        raise YouTubeAPIError(f"YouTube search failed: {search_resp.text}")

    video_ids = [
        item["id"]["videoId"] for item in search_resp.json().get("items", [])
    ]

    if not video_ids:
        return []

    stats_resp = requests.get(
        f"{YOUTUBE_API_BASE}/videos",
        params={
            "key": settings.YOUTUBE_API_KEY,
            "id": ",".join(video_ids),
            "part": "snippet,statistics,contentDetails",
        },
        timeout=10,
    )

    if stats_resp.status_code != 200:
        raise YouTubeAPIError(f"YouTube video lookup failed: {stats_resp.text}")

    return stats_resp.json().get("items", [])


def transform_youtube_video(video: dict, creator_id: int) -> dict:
    """Maps a raw YouTube API video object into CreatorIQ's common Content shape.

    Metrics YouTube doesn't expose (e.g. saves) are left at 0 rather than guessed.
    """
    snippet = video.get("snippet", {})
    stats = video.get("statistics", {})

    published_at = snippet.get("publishedAt")
    published_date = (
        datetime.fromisoformat(published_at.replace("Z", "+00:00")).date()
        if published_at else datetime.utcnow().date()
    )

    return {
        "creator_id": creator_id,
        "platform": "YouTube",
        "external_content_id": video.get("id"),
        "content_title": snippet.get("title", "Untitled"),
        "views": int(stats.get("viewCount", 0)),
        "likes": int(stats.get("likeCount", 0)),
        "comments": int(stats.get("commentCount", 0)),
        "shares": None,    # not exposed by the public API
        "saves": 0,        # not exposed by the public API
        "watch_time": 0,   # requires YouTube Analytics API (OAuth), not Data API
        "reach": None,     # YouTube doesn't expose a "reach" metric via the Data API
        "published_date": published_date,
    }
