"""
Thin wrapper around the YouTube Data API v3.
Keeping all Google API calls in one place makes it easy to swap providers
(Instagram, TikTok, etc.) later without touching router/endpoint code.
"""

from googleapiclient.discovery import build
from app.config import settings

def get_youtube_client():
    if not settings.YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY is not set in .env")
    return build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)


def search_videos(query: str, max_results: int = 10):
    """Search YouTube for videos matching a query, return basic video IDs + snippet."""
    youtube = get_youtube_client()
    search_response = youtube.search().list(
        q=query,
        part="id,snippet",
        maxResults=max_results,
        type="video",
    ).execute()

    video_ids = [item["id"]["videoId"] for item in search_response.get("items", [])]
    return video_ids


def get_video_stats(video_ids: list[str]):
    """Given a list of video IDs, fetch full stats (views, likes, comments, etc.)."""
    if not video_ids:
        return []

    youtube = get_youtube_client()
    response = youtube.videos().list(
        part="snippet,statistics",
        id=",".join(video_ids),
    ).execute()

    results = []
    for item in response.get("items", []):
        snippet = item["snippet"]
        stats = item.get("statistics", {})
        results.append({
            "video_id": item["id"],
            "title": snippet.get("title"),
            "channel_title": snippet.get("channelTitle"),
            "thumbnail_url": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
            "published_at": snippet.get("publishedAt"),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
        })
    return results


def get_channel_videos(channel_id: str, max_results: int = 10):
    """Fetch recent videos for a specific channel ID, with stats."""
    youtube = get_youtube_client()
    search_response = youtube.search().list(
        channelId=channel_id,
        part="id",
        order="date",
        maxResults=max_results,
        type="video",
    ).execute()

    video_ids = [item["id"]["videoId"] for item in search_response.get("items", [])]
    return get_video_stats(video_ids)