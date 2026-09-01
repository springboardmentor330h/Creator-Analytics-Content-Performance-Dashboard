import os
from datetime import datetime

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_client():
    if not YOUTUBE_API_KEY:
        raise ValueError(
            "YOUTUBE_API_KEY is not configured in .env"
        )

    return build(
        "youtube",
        "v3",
        developerKey=YOUTUBE_API_KEY
    )


def get_channel_videos(channel_id: str):
    youtube = get_youtube_client()

    try:
        search_response = youtube.search().list(
            part="id",
            channelId=channel_id,
            maxResults=10,
            order="date",
            type="video"
        ).execute()

        video_ids = [
            item["id"]["videoId"]
            for item in search_response.get("items", [])
        ]

        if not video_ids:
            return []

        videos_response = youtube.videos().list(
            part="snippet,statistics",
            id=",".join(video_ids)
        ).execute()

        transformed_data = []

        for video in videos_response.get("items", []):

            snippet = video.get("snippet", {})
            statistics = video.get("statistics", {})

            published_at = snippet.get("publishedAt")

            if not published_at:
                continue

            published_date = datetime.fromisoformat(
                published_at.replace("Z", "+00:00")
            ).date()

            transformed_data.append({
                "platform": "YouTube",
                "external_content_id": video["id"],
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
                "shares": 0,
                "saves": 0,
                "watch_time": 0,
                "reach": 0,
                "published_date": published_date
            })

        return transformed_data

    except HttpError as error:
        raise RuntimeError(
            f"YouTube API error: {error}"
        )