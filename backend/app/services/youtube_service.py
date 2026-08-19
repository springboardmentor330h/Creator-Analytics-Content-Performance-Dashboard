from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi import HTTPException
from app.config import settings


def get_youtube_client():
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YOUTUBE_API_KEY is not configured in .env")
    return build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)


def _call(request):
    try:
        return request.execute()
    except HttpError as e:
        status = e.resp.status if hasattr(e, "resp") else 500
        reason = getattr(e, "reason", str(e))
        if status == 403:
            detail = f"YouTube API access denied (check API key restrictions / quota): {reason}"
        elif status == 400:
            detail = f"Invalid request to YouTube API (check channel/video ID or query): {reason}"
        elif status == 404:
            detail = f"YouTube resource not found: {reason}"
        else:
            detail = f"YouTube API error ({status}): {reason}"
        raise HTTPException(status_code=502, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Unexpected error calling YouTube API: {str(e)}")


def search_video_ids(query: str, max_results: int = 10) -> list[str]:
    youtube = get_youtube_client()
    response = _call(youtube.search().list(q=query, part="id", maxResults=max_results, type="video"))
    return [item["id"]["videoId"] for item in response.get("items", [])]


def get_channel_video_ids(channel_id: str, max_results: int = 10) -> list[str]:
    youtube = get_youtube_client()
    response = _call(youtube.search().list(
        channelId=channel_id, part="id", order="date", maxResults=max_results, type="video"
    ))
    items = response.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail=f"No videos found for channel_id '{channel_id}'. Check the ID is correct.")
    return [item["id"]["videoId"] for item in items]


def get_video_details(video_ids: list[str]) -> list[dict]:
    """Fetches raw video data and transforms it into CreatorIQ's common content format."""
    if not video_ids:
        raise HTTPException(status_code=404, detail="No video IDs to fetch details for.")

    youtube = get_youtube_client()
    response = _call(youtube.videos().list(part="snippet,statistics", id=",".join(video_ids)))
    items = response.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail="YouTube API returned an empty response for the given video IDs.")

    return [transform_youtube_item(item) for item in items]


def transform_youtube_item(item: dict) -> dict:
    """YouTube API response -> CreatorIQ common content format."""
    snippet = item.get("snippet", {})
    stats = item.get("statistics", {})
    published = snippet.get("publishedAt")

    return {
        "platform": "YouTube",
        "external_content_id": item.get("id"),
        "content_title": snippet.get("title", "Untitled"),
        "views": int(stats.get("viewCount", 0)),
        "likes": int(stats.get("likeCount", 0)),
        "comments": int(stats.get("commentCount", 0)),
        "shares": 0,   # not exposed by YouTube Data API v3
        "saves": 0,    # not exposed by YouTube Data API v3
        "reach": int(stats.get("viewCount", 0)),  # approximation
        "published_date": (
            datetime.fromisoformat(published.replace("Z", "+00:00")).date()
            if published else datetime.utcnow().date()
        ),
    }