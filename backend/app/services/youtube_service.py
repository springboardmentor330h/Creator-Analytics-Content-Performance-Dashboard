import os
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from sqlalchemy.orm import Session

from app.models.content import Content

load_dotenv()


def get_youtube_service():
    """
    Create and return a YouTube Data API service.
    """

    api_key = os.getenv("YOUTUBE_API_KEY")

    if not api_key:
        raise ValueError("YOUTUBE_API_KEY is not configured.")

    return build(
        "youtube",
        "v3",
        developerKey=api_key
    )


def get_video_details(video_id: str):
    """
    Fetch details of a single YouTube video.
    """

    youtube = get_youtube_service()

    try:
        response = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        ).execute()

        if not response.get("items"):
            return None

        video = response["items"][0]

        snippet = video.get("snippet", {})
        statistics = video.get("statistics", {})

        published_at = snippet.get("publishedAt")

        published_date = None

        if published_at:
            published_date = datetime.fromisoformat(
                published_at.replace("Z", "+00:00")
            ).date()

        return {
            "external_content_id": video_id,
            "content_title": snippet.get("title", ""),
            "views": int(statistics.get("viewCount", 0)),
            "likes": int(statistics.get("likeCount", 0)),
            "comments": int(statistics.get("commentCount", 0)),
            "published_date": published_date
        }

    except HttpError as e:
        print("YouTube API error:", e)
        raise


def save_youtube_video(
    db: Session,
    creator_id: int,
    video_id: str
):
    """
    Fetch a YouTube video and save it into the Content table.

    If the video already exists, update its metrics instead of
    creating a duplicate record.
    """

    video_data = get_video_details(video_id)

    if not video_data:
        return None

    existing_content = (
        db.query(Content)
        .filter(
            Content.platform == "YouTube",
            Content.external_content_id == video_id
        )
        .first()
    )

    if existing_content:
        existing_content.content_title = video_data["content_title"]
        existing_content.views = video_data["views"]
        existing_content.likes = video_data["likes"]
        existing_content.comments = video_data["comments"]
        existing_content.published_date = video_data["published_date"]

        db.commit()
        db.refresh(existing_content)

        return existing_content

    new_content = Content(
        creator_id=creator_id,
        platform="YouTube",
        external_content_id=video_data["external_content_id"],
        content_title=video_data["content_title"],
        views=video_data["views"],
        likes=video_data["likes"],
        comments=video_data["comments"],
        shares=0,
        saves=0,
        watch_time=0,
        reach=0,
        published_date=video_data["published_date"]
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return new_content