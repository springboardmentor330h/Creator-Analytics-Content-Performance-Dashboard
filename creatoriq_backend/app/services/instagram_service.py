"""Instagram Graph API service for CreatorIQ.

Handles authentication, fetching, transforming, validating, and synchronizing Instagram
content/media data into PostgreSQL while enforcing duplicate detection and normalized schemas.
"""
import os
import json
import logging
import socket
from datetime import date, datetime
from typing import Any, Dict, List, Optional
import httpx
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

# Ensure IPv4 addresses are prioritized over IPv6 to prevent Windows network timeout errors
_orig_getaddrinfo = socket.getaddrinfo

def _ipv4_first_getaddrinfo(*args, **kwargs):
    res = _orig_getaddrinfo(*args, **kwargs)
    return sorted(res, key=lambda x: 0 if x[0] == socket.AF_INET else 1)

if getattr(socket.getaddrinfo, "__name__", "") != "_ipv4_first_getaddrinfo":
    socket.getaddrinfo = _ipv4_first_getaddrinfo

from app.core.config import get_settings
from app.models.content import Content
from app.models.user import User
from app.services.content_service import calculate_engagement_rate

logger = logging.getLogger(__name__)

GRAPH_API_BASE = "https://graph.facebook.com/v19.0"


def get_instagram_credentials() -> Dict[str, str]:
    """Retrieve Instagram Graph API credentials from environment or configuration."""
    settings = get_settings()
    access_token = os.environ.get("INSTAGRAM_ACCESS_TOKEN") or getattr(settings, "INSTAGRAM_ACCESS_TOKEN", None)
    account_id = os.environ.get("INSTAGRAM_ACCOUNT_ID") or getattr(settings, "INSTAGRAM_ACCOUNT_ID", None)

    token_str = str(access_token).strip() if access_token else ""
    account_str = str(account_id).strip() if account_id else ""

    invalid_tokens = {"", "your_instagram_access_token", "your_access_token_here", "none", "null"}
    if not token_str or token_str.lower() in invalid_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Instagram access token is missing or not configured in environment variables.",
        )

    return {
        "access_token": token_str,
        "account_id": account_str,
    }


def transform_instagram_data(raw_item: Dict[str, Any]) -> Dict[str, Any]:
    """Transform raw Instagram Graph API media item into the common CreatorIQ format.

    Common format:
    {
        "platform": "Instagram",
        "external_content_id": "1789569234857",
        "content_title": "Behind the scenes reel",
        "content_type": "Reel",
        "views": 12000,
        "likes": 950,
        "comments": 120,
        "shares": 0,
        "reach": 15000,
        "published_date": "2026-08-15"
    }
    """
    if not isinstance(raw_item, dict):
        raise ValueError("Invalid Instagram item format: expected a dictionary")

    # If item is already pre-formatted
    if "external_content_id" in raw_item or "content_title" in raw_item:
        media_id = str(raw_item.get("external_content_id") or raw_item.get("content_id") or raw_item.get("id") or "").strip()
        title = str(raw_item.get("content_title") or raw_item.get("title") or raw_item.get("caption") or "Untitled Instagram Post").strip()
        media_type_raw = str(raw_item.get("content_type") or raw_item.get("media_type") or "Post").strip().capitalize()
        if media_type_raw.upper() in {"VIDEO", "REEL", "REELS"}:
            c_type = "Reel"
        elif media_type_raw.upper() in {"IMAGE", "CAROUSEL_ALBUM", "POST"}:
            c_type = "Post"
        else:
            c_type = "Post"

        views = int(raw_item.get("views", 0) or 0)
        likes = int(raw_item.get("likes", 0) or 0)
        comments = int(raw_item.get("comments", 0) or 0)
        shares = int(raw_item.get("shares", 0) or 0)
        reach = int(raw_item.get("reach", 0) or 0)
        pub_date_raw = raw_item.get("published_date") or raw_item.get("published_at") or raw_item.get("timestamp")

        if isinstance(pub_date_raw, (datetime, date)):
            published_date_str = pub_date_raw.strftime("%Y-%m-%d") if isinstance(pub_date_raw, date) else pub_date_raw.date().isoformat()
        elif isinstance(pub_date_raw, str) and pub_date_raw:
            published_date_str = pub_date_raw.split("T")[0]
        else:
            published_date_str = date.today().isoformat()

        return {
            "platform": "Instagram",
            "external_content_id": media_id,
            "content_title": title[:255],
            "content_type": c_type,
            "views": max(0, views),
            "likes": max(0, likes),
            "comments": max(0, comments),
            "shares": max(0, shares),
            "reach": max(0, reach),
            "published_date": published_date_str,
        }

    # Standard Graph API media node
    media_id = str(raw_item.get("id", "")).strip()
    caption = str(raw_item.get("caption", "")).strip()
    title = caption.split("\n")[0].strip() if caption else f"Instagram Media {media_id}"
    if not title:
        title = f"Instagram Media {media_id}"

    raw_media_type = str(raw_item.get("media_type", "POST")).upper()
    if raw_media_type in {"VIDEO", "REELS"}:
        content_type = "Reel"
    else:
        content_type = "Post"

    timestamp_raw = raw_item.get("timestamp", "")
    if timestamp_raw:
        published_date_str = timestamp_raw.split("T")[0]
    else:
        published_date_str = date.today().isoformat()

    try:
        likes = int(raw_item.get("like_count", 0))
    except (ValueError, TypeError):
        likes = 0

    try:
        comments = int(raw_item.get("comments_count", 0))
    except (ValueError, TypeError):
        comments = 0

    # Insights extraction if present (e.g. from /insights edge)
    reach = 0
    views = 0
    impressions = 0
    insights = raw_item.get("insights", {}).get("data", [])
    for metric in insights:
        name = metric.get("name")
        values = metric.get("values", [{}])
        val = values[0].get("value", 0) if values else 0
        if name == "reach":
            reach = int(val or 0)
        elif name == "impressions":
            impressions = int(val or 0)
        elif name in ("plays", "video_views", "views"):
            views = max(views, int(val or 0))

    if reach == 0 and impressions > 0:
        reach = impressions
    if views == 0 and impressions > 0:
        views = impressions
    elif views == 0 and reach > 0:
        views = reach
    elif views == 0:
        views = max(likes + comments, 0)

    shares = 0

    return {
        "platform": "Instagram",
        "external_content_id": media_id,
        "content_title": title[:255],
        "content_type": content_type,
        "views": max(0, views),
        "likes": max(0, likes),
        "comments": max(0, comments),
        "shares": max(0, shares),
        "reach": max(0, reach),
        "published_date": published_date_str,
    }


def validate_instagram_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate normalized Instagram content data before persistence."""
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")

    if data.get("platform") != "Instagram":
        raise ValueError(f"Invalid platform '{data.get('platform')}': expected 'Instagram'")

    external_id = data.get("external_content_id")
    if not external_id or not str(external_id).strip():
        raise ValueError("external_content_id is required and cannot be empty")

    title = data.get("content_title")
    if not title or len(str(title).strip()) < 1:
        raise ValueError("content_title is required and cannot be empty")

    for field in ("views", "likes", "comments", "shares", "reach"):
        val = data.get(field, 0)
        if not isinstance(val, int) or val < 0:
            raise ValueError(f"Field '{field}' must be a non-negative integer")

    pub_date = data.get("published_date")
    if not pub_date:
        raise ValueError("published_date is required")
    try:
        date.fromisoformat(str(pub_date))
    except ValueError as exc:
        raise ValueError(f"Invalid published_date format '{pub_date}', expected 'YYYY-MM-DD'") from exc

    return data


def fetch_instagram_data(
    account_id: Optional[str] = None,
    access_token: Optional[str] = None,
    max_results: int = 10,
) -> List[Dict[str, Any]]:
    """Fetch media metadata and insights from Instagram Graph API."""
    creds = {}
    if not access_token:
        creds = get_instagram_credentials()
        access_token = creds["access_token"]
        if not account_id:
            account_id = creds["account_id"]

    target_account = account_id or "me"
    max_results = min(max(1, max_results), 50)

    try:
        with httpx.Client(timeout=15.0) as client:
            # 1. If target_account is "me", find the IG Business Account ID or profile
            if target_account == "me" or not target_account:
                me_resp = client.get(
                    f"{GRAPH_API_BASE}/me",
                    params={
                        "fields": "id,name,accounts{instagram_business_account}",
                        "access_token": access_token,
                    },
                )
                if me_resp.status_code == 200:
                    me_data = me_resp.json()
                    accounts = me_data.get("accounts", {}).get("data", [])
                    for acc in accounts:
                        ig_acc = acc.get("instagram_business_account", {}).get("id")
                        if ig_acc:
                            target_account = ig_acc
                            break
                    if target_account == "me" or not target_account:
                        target_account = me_data.get("id", "me")
                else:
                    _handle_api_error_response(me_resp)

            # 2. Fetch media edge from target account
            media_resp = client.get(
                f"{GRAPH_API_BASE}/{target_account}/media",
                params={
                    "fields": "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count",
                    "limit": max_results,
                    "access_token": access_token,
                },
            )

            if media_resp.status_code != 200:
                _handle_api_error_response(media_resp)

            media_data = media_resp.json()
            items = media_data.get("data", [])

            # Optionally fetch insights per media if allowed
            enriched_items = []
            for item in items:
                m_id = item.get("id")
                try:
                    insights_resp = client.get(
                        f"{GRAPH_API_BASE}/{m_id}/insights",
                        params={
                            "metric": "impressions,reach",
                            "access_token": access_token,
                        },
                    )
                    if insights_resp.status_code == 200:
                        item["insights"] = insights_resp.json()
                except Exception:
                    pass
                enriched_items.append(item)

            return enriched_items

    except HTTPException:
        raise
    except httpx.RequestError as exc:
        logger.error(f"Network error during Instagram API request: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Instagram API connection failed or timed out.",
        ) from exc
    except Exception as exc:
        logger.error(f"Unexpected error during Instagram API communication: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Instagram API communication error: {str(exc)}",
        ) from exc


def _handle_api_error_response(resp: httpx.Response) -> None:
    """Parse Instagram Graph API error body and raise an informative HTTPException."""
    try:
        err_json = resp.json().get("error", {})
        err_msg = err_json.get("message", "Instagram API request failed")
        err_code = err_json.get("code")
        err_type = err_json.get("type", "")

        if err_code in {190, 102} or "OAuthException" in err_type or "validate access token" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Instagram API authentication failed. Please verify the configured access token.",
            )
        if err_code in {4, 17, 32} or "rate limit" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Instagram API rate limit exceeded. Please try again later.",
            )
        if err_code in {10, 200, 210, 80004} or "permission" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Instagram API permission denied: {err_msg}",
            )
        if resp.status_code == 404 or err_code == 100:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instagram resource not found: {err_msg}",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Instagram API error: {err_msg}",
        )
    except (json.JSONDecodeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Instagram API returned status {resp.status_code}.",
        )


def sync_instagram_data(
    db: Session,
    user: User,
    account_id: Optional[str] = None,
    max_results: int = 10,
    custom_items: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Execute end-to-end Instagram content synchronization and upsert into PostgreSQL.

    Enforces duplicate detection using platform + external_content_id (scoped to creator).
    """
    raw_items: List[Dict[str, Any]] = []

    if custom_items is not None:
        raw_items = custom_items
    else:
        raw_items = fetch_instagram_data(
            account_id=account_id,
            max_results=max_results,
        )

    if not raw_items:
        return {
            "platform": "Instagram",
            "status": "success",
            "records_synced": 0,
        }

    synced_count = 0

    try:
        for raw_item in raw_items:
            # 1. Data Transformation
            transformed = transform_instagram_data(raw_item)

            # 2. Validation
            validated = validate_instagram_data(transformed)

            ext_id = validated["external_content_id"]
            title = validated["content_title"]
            c_type = validated["content_type"]
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
                func.lower(Content.platform) == "instagram",
                or_(
                    Content.external_content_id == ext_id,
                    Content.content_id == ext_id,
                ),
            ).first()

            if existing:
                # UPDATE existing record (idempotent update)
                existing.title = title
                existing.content_type = c_type
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
                    platform="Instagram",
                    content_id=ext_id,
                    external_content_id=ext_id,
                    title=title,
                    content_type=c_type,
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
        logger.error(f"Database error during Instagram synchronization: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction failed during Instagram synchronization.",
        ) from exc

    return {
        "platform": "Instagram",
        "status": "success",
        "records_synced": synced_count,
    }
