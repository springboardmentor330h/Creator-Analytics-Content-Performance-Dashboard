import os
from fastapi import HTTPException
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load YouTube API key from environment variables or fallback to your generated key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "YOUR_YOUTUBE_API_KEY_HERE")  # Replace with your actual API key or set in environment


def get_youtube_client():
    """Initializes and returns the YouTube Data API client."""
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        raise HTTPException(
            status_code=500,
            detail="YouTube API Key is missing or not configured."
        )
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


def fetch_youtube_video_data(video_id: str) -> dict:
    """Fetches video details and statistics from YouTube Data API v3."""
    try:
        youtube = get_youtube_client()
        request = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        )
        response = request.execute()

        items = response.get("items", [])
        if not items:
            raise HTTPException(status_code=404, detail="YouTube video not found.")

        video_info = items[0]
        snippet = video_info.get("snippet", {})
        statistics = video_info.get("statistics", {})

        views = int(statistics.get("viewCount", 0))
        likes = int(statistics.get("likeCount", 0))
        comments = int(statistics.get("commentCount", 0))

        # Reach approximation (Views used as baseline reach if impressions unavailable via public API)
        reach = views

        return {
            "video_id": video_id,
            "title": snippet.get("title", "YouTube Video"),
            "platform": "YouTube",
            "content_type": "Video",
            "metrics": {
                "views": views,
                "likes": likes,
                "comments": comments,
                "shares": 0,  # Public API does not expose shares
                "saves": 0,   # Public API does not expose saves
                "watch_time_seconds": 0.0,
                "reach": reach,
            }
        }

    except HttpError as e:
        raise HTTPException(status_code=400, detail=f"YouTube API Error: {str(e)}")