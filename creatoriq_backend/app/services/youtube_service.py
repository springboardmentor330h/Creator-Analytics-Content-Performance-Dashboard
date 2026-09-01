from datetime import datetime
import requests
from app.core.config import settings

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"


def get_youtube_channel_videos(channel_id: str, max_results: int = 10):
    if not settings.YOUTUBE_API_KEY:
        raise ValueError("YouTube API key is not configured")
    if not channel_id:
        raise ValueError("YouTube channel ID is required")
    if max_results < 1 or max_results > 50:
        raise ValueError("max_results must be between 1 and 50")

    # 1) Get uploads playlist id for this channel
    ch = requests.get(
        f"{YOUTUBE_API_URL}/channels",
        params={
            "key": settings.YOUTUBE_API_KEY,
            "id": channel_id,
            "part": "contentDetails",
        },
        timeout=15,
    )
    if ch.status_code != 200:
        raise ValueError(f"YouTube API error: {ch.text}")

    items = ch.json().get("items") or []
    if not items:
        raise ValueError("YouTube channel not found or inaccessible")

    uploads_id = (
        items[0]
        .get("contentDetails", {})
        .get("relatedPlaylists", {})
        .get("uploads")
    )
    if not uploads_id:
        raise ValueError("Could not find uploads playlist for this channel")

    # 2) List video IDs from uploads playlist (one page, up to max_results)
    pl = requests.get(
        f"{YOUTUBE_API_URL}/playlistItems",
        params={
            "key": settings.YOUTUBE_API_KEY,
            "playlistId": uploads_id,
            "part": "contentDetails,snippet",
            "maxResults": max_results,
        },
        timeout=15,
    )
    if pl.status_code != 200:
        raise ValueError(f"YouTube API error: {pl.text}")

    video_ids = []
    for item in pl.json().get("items") or []:
        vid = item.get("contentDetails", {}).get("videoId")
        if vid:
            video_ids.append(vid)

    if not video_ids:
        return []

    # 3) Video statistics
    vid = requests.get(
        f"{YOUTUBE_API_URL}/videos",
        params={
            "key": settings.YOUTUBE_API_KEY,
            "id": ",".join(video_ids),
            "part": "snippet,statistics",
        },
        timeout=15,
    )
    if vid.status_code != 200:
        raise ValueError(f"YouTube API error: {vid.text}")

    transformed = []
    for video in vid.json().get("items") or []:
        video_id = video.get("id")
        if not video_id:
            continue
        stats = video.get("statistics") or {}
        snippet = video.get("snippet") or {}
        published_date = None
        published_at = snippet.get("publishedAt")
        if published_at:
            try:
                published_date = datetime.fromisoformat(
                    published_at.replace("Z", "+00:00")
                ).date()
            except ValueError:
                published_date = None

        # Fallback so sync does not skip the row
        if published_date is None:
            published_date = datetime.utcnow().date()

        views = int(stats.get("viewCount") or 0)
        transformed.append({
            "platform": "YouTube",
            "external_content_id": video_id,
            "content_title": snippet.get("title") or "Untitled YouTube Video",
            "views": views,
            "likes": int(stats.get("likeCount") or 0),
            "comments": int(stats.get("commentCount") or 0),
            "shares": 0,
            "saves": 0,
            "watch_time": 0,
            "reach": views,
            "published_date": published_date,
        })

    return transformed