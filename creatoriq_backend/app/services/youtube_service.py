import requests
from app.core.config import YOUTUBE_API_KEY
from datetime import date
from sqlalchemy.orm import Session
from app.models.content import Content

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"


def _youtube_request(endpoint: str, params: dict):
    try:
        response = requests.get(
            f"{YOUTUBE_API_URL}/{endpoint}",
            params=params,
            timeout=15,
        )

        if response.status_code == 400:
            raise RuntimeError(
                "Invalid YouTube API request or parameters"
            )

        if response.status_code == 403:
            raise RuntimeError(
                "YouTube API access denied or quota exceeded"
            )

        if response.status_code == 404:
            raise RuntimeError(
                "YouTube resource not found"
            )

        response.raise_for_status()

        data = response.json()

        if not isinstance(data, dict):
            raise RuntimeError(
                "Unexpected response from YouTube API"
            )

        return data

    except requests.Timeout as exc:
        raise RuntimeError(
            "YouTube API request timed out"
        ) from exc

    except requests.RequestException as exc:
        raise RuntimeError(
            "Failed to connect to YouTube API"
        ) from exc


def search_videos(
    query: str,
    max_results: int = 10,
):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }

    return _youtube_request(
        "search",
        params,
    )


def get_video_details(video_id: str):
    params = {
        "part": "snippet,statistics,contentDetails",
        "id": video_id,
        "key": YOUTUBE_API_KEY,
    }

    data = _youtube_request(
        "videos",
        params,
    )

    if not data.get("items"):
        return None

    return data["items"][0]


def transform_youtube_video(video: dict) -> dict:
    snippet = video.get("snippet", {})
    statistics = video.get("statistics", {})

    published_at = snippet.get("publishedAt")

    if not video.get("id"):
        raise RuntimeError(
            "YouTube response is missing video ID"
        )

    if not snippet.get("title"):
        raise RuntimeError(
            "YouTube response is missing video title"
        )

    if not published_at:
        raise RuntimeError(
            "YouTube response is missing published date"
        )

    return {
        "platform": "YouTube",
        "external_content_id": video["id"],
        "content_title": snippet["title"],
        "views": int(statistics.get("viewCount", 0)),
        "likes": int(statistics.get("likeCount", 0)),
        "comments": int(
            statistics.get("commentCount", 0)
        ),
        "shares": 0,
        "saves": 0,
        "watch_time": 0,
        "reach": 0,
        "published_date": published_at[:10],
    }


def get_youtube_videos(
    video_ids: list[str],
) -> list[dict]:
    if not video_ids:
        return []

    data = _youtube_request(
        "videos",
        {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(video_ids),
            "key": YOUTUBE_API_KEY,
        },
    )

    items = data.get("items", [])

    if not items:
        raise RuntimeError(
            "No YouTube videos found for the provided video IDs"
        )

    return [
        transform_youtube_video(video)
        for video in items
    ]


def synchronize_youtube_videos(
    db: Session,
    video_ids: list[str],
    creator_id: int = 1,
):
    videos = get_youtube_videos(video_ids)

    if not videos:
        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": 0,
            "records_created": 0,
            "records_updated": 0,
        }

    records_created = 0
    records_updated = 0

    try:
        for video in videos:
            external_content_id = video["external_content_id"]

            existing_content = (
                db.query(Content)
                .filter(
                    Content.platform == "YouTube",
                    Content.external_content_id
                    == external_content_id,
                )
                .first()
            )

            published_date = (
                video["published_date"]
            )

            if isinstance(published_date, str):
                published_date = date.fromisoformat(
                    published_date
                )

            if existing_content:
                # UPDATE existing YouTube content
                existing_content.creator_id = creator_id
                existing_content.content_title = (
                    video["content_title"]
                )
                existing_content.views = video["views"]
                existing_content.likes = video["likes"]
                existing_content.comments = video["comments"]
                existing_content.shares = video["shares"]
                existing_content.saves = video["saves"]
                existing_content.watch_time = (
                    video["watch_time"]
                )
                existing_content.reach = video["reach"]
                existing_content.published_date = (
                    published_date
                )

                records_updated += 1

            else:
                # CREATE new YouTube content
                new_content = Content(
                    creator_id=creator_id,
                    platform="YouTube",
                    external_content_id=(
                        external_content_id
                    ),
                    content_title=video["content_title"],
                    views=video["views"],
                    likes=video["likes"],
                    comments=video["comments"],
                    shares=video["shares"],
                    saves=video["saves"],
                    watch_time=video["watch_time"],
                    reach=video["reach"],
                    published_date=published_date,
                )

                db.add(new_content)
                records_created += 1

        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "platform": "YouTube",
        "status": "success",
        "records_synced": (
            records_created + records_updated
        ),
        "records_created": records_created,
        "records_updated": records_updated,
    }