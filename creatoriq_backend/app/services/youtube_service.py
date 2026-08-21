"""YouTube Data API v3 service for CreatorIQ.

Handles authentication, fetching, transforming, validating, and synchronizing YouTube
content data into PostgreSQL while enforcing duplicate detection and normalized schemas.
"""
import os
import json
import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.content import Content
from app.models.user import User
from app.services.content_service import calculate_engagement_rate

logger = logging.getLogger(__name__)

YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"


def get_youtube_api_key() -> str:
    """Retrieve the YouTube API key from configuration or environment variables."""
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if api_key is None:
        settings = get_settings()
        api_key = getattr(settings, "YOUTUBE_API_KEY", None)
    if not api_key or not str(api_key).strip() or str(api_key).strip() in {
        "your_key_here",
        "your_api_key_here",
        "your_actual_youtube_api_key",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="YouTube API key is missing or not configured in environment variables.",
        )
    return str(api_key).strip()


def get_youtube_client(api_key: Optional[str] = None):
    """Build and return an authorized YouTube Data API v3 client."""
    key = api_key or get_youtube_api_key()
    try:
        return build(
            YOUTUBE_API_SERVICE_NAME,
            YOUTUBE_API_VERSION,
            developerKey=key,
            static_discovery=True,
        )
    except Exception as exc:
        logger.error(f"Failed to initialize YouTube API client: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to initialize YouTube Data API client.",
        ) from exc


def transform_youtube_data(raw_item: Dict[str, Any]) -> Dict[str, Any]:
    """Transform raw YouTube API video data into the common CreatorIQ format.

    Common format:
    {
        "platform": "YouTube",
        "external_content_id": "youtube_video_id",
        "content_title": "Python Tutorial",
        "views": 15000,
        "likes": 1200,
        "comments": 150,
        "shares": 0,
        "reach": 0,
        "published_date": "2026-08-10"
    }
    """
    if not isinstance(raw_item, dict):
        raise ValueError("Invalid YouTube item format: expected a dictionary")

    # Support already-transformed or simplified dict format
    if "external_content_id" in raw_item or "content_title" in raw_item:
        video_id = str(raw_item.get("external_content_id") or raw_item.get("content_id") or raw_item.get("id") or "").strip()
        title = str(raw_item.get("content_title") or raw_item.get("title") or "Untitled Video").strip()
        views = int(raw_item.get("views", 0))
        likes = int(raw_item.get("likes", 0))
        comments = int(raw_item.get("comments", 0))
        shares = int(raw_item.get("shares", 0))
        reach = int(raw_item.get("reach", 0))
        pub_date_raw = raw_item.get("published_date") or raw_item.get("published_at")

        if isinstance(pub_date_raw, (datetime, date)):
            published_date_str = pub_date_raw.strftime("%Y-%m-%d") if isinstance(pub_date_raw, date) else pub_date_raw.date().isoformat()
        elif isinstance(pub_date_raw, str):
            published_date_str = pub_date_raw.split("T")[0]
        else:
            published_date_str = date.today().isoformat()

        return {
            "platform": "YouTube",
            "external_content_id": video_id,
            "content_title": title,
            "views": max(0, views),
            "likes": max(0, likes),
            "comments": max(0, comments),
            "shares": max(0, shares),
            "reach": max(0, reach),
            "published_date": published_date_str,
        }

    # Standard YouTube Data API v3 video resource structure
    video_id = ""
    if isinstance(raw_item.get("id"), dict):
        video_id = raw_item["id"].get("videoId", "")
    elif isinstance(raw_item.get("id"), str):
        video_id = raw_item["id"]
    elif "contentDetails" in raw_item and "videoId" in raw_item["contentDetails"]:
        video_id = raw_item["contentDetails"]["videoId"]

    snippet = raw_item.get("snippet", {})
    statistics = raw_item.get("statistics", {})

    title = snippet.get("title", "Untitled YouTube Video").strip()
    published_at_raw = snippet.get("publishedAt", "")
    if published_at_raw:
        published_date_str = published_at_raw.split("T")[0]
    else:
        published_date_str = date.today().isoformat()

    try:
        views = int(statistics.get("viewCount", 0))
    except (ValueError, TypeError):
        views = 0

    try:
        likes = int(statistics.get("likeCount", 0))
    except (ValueError, TypeError):
        likes = 0

    try:
        comments = int(statistics.get("commentCount", 0))
    except (ValueError, TypeError):
        comments = 0

    # Public YouTube Data API v3 does not expose shares or private reach on video endpoints
    shares = 0
    reach = 0

    return {
        "platform": "YouTube",
        "external_content_id": video_id,
        "content_title": title,
        "views": max(0, views),
        "likes": max(0, likes),
        "comments": max(0, comments),
        "shares": max(0, shares),
        "reach": max(0, reach),
        "published_date": published_date_str,
    }


def validate_youtube_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate normalized YouTube content data before persistence."""
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")

    if data.get("platform") != "YouTube":
        raise ValueError(f"Invalid platform '{data.get('platform')}': expected 'YouTube'")

    external_id = data.get("external_content_id")
    if not external_id or not str(external_id).strip():
        raise ValueError("external_content_id is required and cannot be empty")

    title = data.get("content_title")
    if not title or len(str(title).strip()) < 1:
        raise ValueError("content_title is required and cannot be empty")

    # Validate integer fields
    for field in ("views", "likes", "comments", "shares", "reach"):
        val = data.get(field, 0)
        if not isinstance(val, int) or val < 0:
            raise ValueError(f"Field '{field}' must be a non-negative integer")

    # Validate published_date
    pub_date = data.get("published_date")
    if not pub_date:
        raise ValueError("published_date is required")
    try:
        date.fromisoformat(str(pub_date))
    except ValueError as exc:
        raise ValueError(f"Invalid published_date format '{pub_date}', expected 'YYYY-MM-DD'") from exc

    return data


def _handle_http_error(exc: HttpError) -> None:
    """Parse Google API HttpError and raise clean, sanitized HTTPException."""
    status_code = exc.resp.status if exc.resp else 500
    error_reason = "YouTube API request failed"
    try:
        content = json.loads(exc.content.decode("utf-8"))
        errors = content.get("error", {}).get("errors", [])
        if errors:
            reason = errors[0].get("reason", "")
            message = errors[0].get("message", "")
            if reason in {"keyInvalid", "API_KEY_INVALID", "badRequest"} or "API key not valid" in message:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid YouTube API key provided.",
                )
            if reason in {"quotaExceeded", "dailyLimitExceeded", "rateLimitExceeded"}:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="YouTube API quota or rate limit exceeded. Please try again later.",
                )
            if reason in {"channelNotFound", "playlistNotFound", "videoNotFound"}:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified YouTube channel or video not found.",
                )
            error_reason = message or reason
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
        pass

    if status_code == 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid YouTube API request: {error_reason}")
    if status_code in (401, 403):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"YouTube API access denied: {error_reason}")
    if status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="YouTube resource not found.")
    if status_code == 429:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="YouTube API rate limit exceeded.")

    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"YouTube API error: {error_reason}")


def fetch_youtube_data(
    channel_id: Optional[str] = None,
    query: Optional[str] = None,
    max_results: int = 10,
    api_key: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Fetch video metadata and statistics from YouTube Data API v3."""
    youtube = get_youtube_client(api_key=api_key)
    max_results = min(max(1, max_results), 50)

    try:
        video_ids: List[str] = []

        if channel_id and channel_id.strip():
            cid = channel_id.strip()
            # Try fetching channel's uploads playlist
            channel_resp = None
            if cid.startswith("UC"):
                channel_resp = youtube.channels().list(part="contentDetails", id=cid).execute()
            if not channel_resp or not channel_resp.get("items"):
                # Try forHandle or forUsername
                handle_name = cid.lstrip("@")
                try:
                    channel_resp = youtube.channels().list(part="contentDetails", forHandle=handle_name).execute()
                except HttpError:
                    channel_resp = None
                if not channel_resp or not channel_resp.get("items"):
                    channel_resp = youtube.channels().list(part="contentDetails", forUsername=cid).execute()

            channel_items = channel_resp.get("items", []) if channel_resp else []
            if not channel_items:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"YouTube channel '{channel_id}' not found.",
                )

            uploads_playlist_id = channel_items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
            playlist_resp = youtube.playlistItems().list(
                part="contentDetails",
                playlistId=uploads_playlist_id,
                maxResults=max_results,
            ).execute()

            for item in playlist_resp.get("items", []):
                vid = item.get("contentDetails", {}).get("videoId")
                if vid:
                    video_ids.append(vid)

        elif query and query.strip():
            search_resp = youtube.search().list(
                part="id",
                q=query.strip(),
                type="video",
                maxResults=max_results,
            ).execute()
            for item in search_resp.get("items", []):
                vid = item.get("id", {}).get("videoId")
                if vid:
                    video_ids.append(vid)

        else:
            # Default fetch: most popular videos
            popular_resp = youtube.videos().list(
                part="snippet,statistics",
                chart="mostPopular",
                maxResults=max_results,
            ).execute()
            return popular_resp.get("items", [])

        if not video_ids:
            return []

        # Retrieve full snippet & statistics for identified video IDs
        videos_resp = youtube.videos().list(
            part="snippet,statistics",
            id=",".join(video_ids),
        ).execute()

        return videos_resp.get("items", [])

    except HttpError as exc:
        _handle_http_error(exc)
        return []
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Unexpected error during YouTube API communication: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unexpected error occurred while fetching YouTube data.",
        ) from exc


def sync_youtube_data(
    db: Session,
    user: User,
    channel_id: Optional[str] = None,
    query: Optional[str] = None,
    max_results: int = 10,
    custom_items: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Execute end-to-end YouTube content synchronization and upsert into PostgreSQL.

    Enforces duplicate detection using platform + external_content_id.
    """
    raw_items: List[Dict[str, Any]] = []

    if custom_items is not None:
        raw_items = custom_items
    else:
        raw_items = fetch_youtube_data(
            channel_id=channel_id,
            query=query,
            max_results=max_results,
        )

    if not raw_items:
        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": 0,
        }

    synced_count = 0

    try:
        for raw_item in raw_items:
            # 1. Data Transformation
            transformed = transform_youtube_data(raw_item)

            # 2. Validation
            validated = validate_youtube_data(transformed)

            ext_id = validated["external_content_id"]
            title = validated["content_title"]
            pub_date = date.fromisoformat(validated["published_date"])
            views = validated["views"]
            likes = validated["likes"]
            comments = validated["comments"]
            shares = validated["shares"]
            reach = validated["reach"]

            # Calculate engagement rate using the project's standard formula
            engagement_rate = calculate_engagement_rate(likes, comments, shares, saves=0, reach=reach)

            # 3. Duplicate Detection: platform + external_content_id (scoped to creator)
            existing = db.query(Content).filter(
                Content.creator_id == user.id,
                func.lower(Content.platform) == "youtube",
                or_(
                    Content.external_content_id == ext_id,
                    Content.content_id == ext_id,
                ),
            ).first()

            if existing:
                # UPDATE existing record
                existing.title = title
                existing.views = views
                existing.likes = likes
                existing.comments = comments
                existing.shares = shares
                existing.reach = reach
                existing.published_at = pub_date
                existing.engagement_rate = engagement_rate
                existing.external_content_id = ext_id
                existing.updated_at = datetime.utcnow()
            else:
                # CREATE new record
                new_record = Content(
                    creator_id=user.id,
                    platform="YouTube",
                    content_id=ext_id,
                    external_content_id=ext_id,
                    title=title,
                    content_type="Video",
                    published_at=pub_date,
                    views=views,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    saves=0,
                    watch_time=0,
                    reach=reach,
                    engagement_rate=engagement_rate,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(new_record)

            synced_count += 1

        db.commit()

    except HTTPException:
        db.rollback()
        raise
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Data validation error: {str(exc)}",
        ) from exc
    except Exception as exc:
        db.rollback()
        logger.error(f"Database error during YouTube synchronization: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction failed during YouTube synchronization.",
        ) from exc

    return {
        "platform": "YouTube",
        "status": "success",
        "records_synced": synced_count,
    }
