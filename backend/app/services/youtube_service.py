from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi import HTTPException
from app.config import settings


def get_youtube_client():
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YOUTUBE_API_KEY is not configured in .env")
    return build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)


def _handle_api_call(func, *args, **kwargs):
    try:
        return func(*args, **kwargs).execute()
    except HttpError as e:
        raise HTTPException(status_code=e.resp.status, detail=f"YouTube API error: {e.reason}")


def search_video_ids(query: str, max_results: int = 10) -> list[str]:
    youtube = get_youtube_client()
    response = _handle_api_call(
        youtube.search().list,
        q=query, part="id", maxResults=max_results, type="video",
    )
    return [item["id"]["videoId"] for item in response.get("items", [])]


def get_channel_video_ids(channel_id: str, max_results: int = 10) -> list[str]:
    youtube = get_youtube_client()
    response = _handle_api_call(
        youtube.search().list,
        channelId=channel_id, part="id", order="date", maxResults=max_results, type="video",
    )
    return [item["id"]["videoId"] for item in response.get("items", [])]


def get_video_details(video_ids: list[str]) -> list[dict]:
    if not video_ids:
        return []
    youtube = get_youtube_client()
    response = _handle_api_call(
        youtube.videos().list,
        part="snippet,statistics", id=",".join(video_ids),
    )
    results = []
    for item in response.get("items", []):
        snippet = item["snippet"]
        stats = item.get("statistics", {})
        published = snippet.get("publishedAt")
        results.append({
            "content_title": snippet.get("title"),
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "comments": int(stats.get("commentCount", 0)),
            "shares": 0,
            "saves": 0,
            "watch_time": 0,
            "reach": int(stats.get("viewCount", 0)),
            "published_date": datetime.fromisoformat(published.replace("Z", "+00:00")).date() if published else None,
        })
    return results