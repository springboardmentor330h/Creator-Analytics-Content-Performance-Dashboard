"""Live YouTube API analytics service.

Fetches real-time channel statistics and recent video metrics directly from the
YouTube Data API v3 using the creator's connected OAuth credentials or API key.
Zero sample/mock data. Zero queries to persisted PostgreSQL content tables for live data.
"""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import httpx
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.social_connection import SocialConnection
from app.models.user import User
from app.services.content_service import calculate_engagement_rate
from app.services.social_connection_service import SocialConnectionService
from app.services.youtube_service import get_youtube_client

logger = logging.getLogger(__name__)


async def get_youtube_live_analytics(db: Session, user: User) -> Dict[str, Any]:
    """Retrieve real-time live channel and video performance metrics from YouTube Data API v3.

    Strictly scoped to the authenticated creator (user.id).
    """
    # 1. Retrieve the creator's YouTube connection
    conn = db.query(SocialConnection).filter(
        SocialConnection.user_id == user.id,
        func.lower(SocialConnection.platform) == "youtube",
    ).first()

    if not conn or conn.status != "connected":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="YouTube account is not connected. Please connect YouTube under Connected Apps.",
        )

    # 2. Check for OAuth Bearer token or API key
    plain_token: Optional[str] = None
    try:
        if conn.access_token_encrypted or conn.refresh_token_encrypted:
            plain_token = await SocialConnectionService.get_valid_access_token(db, user.id, "youtube")
    except HTTPException as exc:
        # If OAuth token expired and cannot be refreshed, propagate clear message
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.detail,
        ) from exc
    except Exception as exc:
        logger.warning(f"Error obtaining YouTube access token: {exc}")

    # 3. If OAuth Bearer token available, query YouTube Data API v3 via httpx
    if plain_token:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {plain_token}"}

                # a) Fetch channel information & uploads playlist ID
                ch_resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/channels",
                    headers=headers,
                    params={"part": "snippet,contentDetails,statistics", "mine": "true"},
                )

                if ch_resp.status_code == 401:
                    conn.status = "expired"
                    db.commit()
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="YouTube OAuth token has expired or was revoked. Please reconnect YouTube.",
                    )
                if ch_resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"YouTube API returned error status {ch_resp.status_code}.",
                    )

                ch_data = ch_resp.json()
                items = ch_data.get("items", [])
                if not items:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="No YouTube channel found for the authenticated Google account.",
                    )

                channel = items[0]
                channel_id = channel.get("id", "")
                snippet = channel.get("snippet", {})
                statistics = channel.get("statistics", {})
                content_details = channel.get("contentDetails", {})

                channel_title = snippet.get("title") or conn.display_name or "YouTube Channel"
                custom_url = snippet.get("customUrl") or conn.platform_username or ""
                thumbnails = snippet.get("thumbnails", {})
                thumbnail_url = (
                    thumbnails.get("high", {}).get("url")
                    or thumbnails.get("medium", {}).get("url")
                    or thumbnails.get("default", {}).get("url")
                )

                # Keep SocialConnection in sync with actual authenticated channel identity
                need_commit = False
                if channel_title and conn.display_name != channel_title:
                    conn.display_name = channel_title
                    need_commit = True
                if custom_url and conn.platform_username != custom_url:
                    conn.platform_username = custom_url
                    need_commit = True
                elif channel_id and not conn.platform_username:
                    conn.platform_username = channel_id
                    need_commit = True
                if channel_id and conn.platform_user_id != channel_id:
                    conn.platform_user_id = channel_id
                    need_commit = True
                if channel_id and not conn.profile_url:
                    conn.profile_url = f"https://www.youtube.com/channel/{channel_id}"
                    need_commit = True
                if need_commit:
                    try:
                        db.commit()
                        db.refresh(conn)
                    except Exception:
                        db.rollback()

                try:
                    subscribers = int(statistics.get("subscriberCount", 0))
                except (ValueError, TypeError):
                    subscribers = 0

                try:
                    total_views = int(statistics.get("viewCount", 0))
                except (ValueError, TypeError):
                    total_views = 0

                try:
                    video_count = int(statistics.get("videoCount", 0))
                except (ValueError, TypeError):
                    video_count = 0

                uploads_playlist = content_details.get("relatedPlaylists", {}).get("uploads")
                if not uploads_playlist and channel_id.startswith("UC"):
                    uploads_playlist = "UU" + channel_id[2:]

                recent_videos: List[Dict[str, Any]] = []
                video_ids: List[str] = []

                # b) Fetch uploaded videos from uploads playlist
                if uploads_playlist:
                    try:
                        pl_resp = await client.get(
                            "https://www.googleapis.com/youtube/v3/playlistItems",
                            headers=headers,
                            params={
                                "part": "snippet,contentDetails",
                                "playlistId": uploads_playlist,
                                "maxResults": 10,
                            },
                        )
                        if pl_resp.status_code == 200:
                            pl_data = pl_resp.json()
                            video_ids = [
                                it["contentDetails"]["videoId"]
                                for it in pl_data.get("items", [])
                                if "contentDetails" in it and "videoId" in it["contentDetails"]
                            ]
                    except Exception:
                        pass

                # If playlistItems returned no video IDs, fall back to channel search
                if not video_ids and channel_id:
                    try:
                        s_resp = await client.get(
                            "https://www.googleapis.com/youtube/v3/search",
                            headers=headers,
                            params={
                                "part": "id",
                                "channelId": channel_id,
                                "type": "video",
                                "order": "date",
                                "maxResults": 10,
                            },
                        )
                        if s_resp.status_code == 200:
                            s_data = s_resp.json()
                            for sit in s_data.get("items", []):
                                vid = sit.get("id", {}).get("videoId")
                                if vid and vid not in video_ids:
                                    video_ids.append(vid)
                    except Exception:
                        pass

                # c) Fetch video statistics
                if video_ids:
                    v_resp = await client.get(
                        "https://www.googleapis.com/youtube/v3/videos",
                        headers=headers,
                        params={
                            "part": "snippet,statistics",
                            "id": ",".join(video_ids),
                        },
                    )
                    if v_resp.status_code == 200:
                        v_data = v_resp.json()
                        for v_item in v_data.get("items", []):
                            v_id = v_item.get("id", "")
                            v_snippet = v_item.get("snippet", {})
                            v_stats = v_item.get("statistics", {})

                            v_views = int(v_stats.get("viewCount", 0))
                            v_likes = int(v_stats.get("likeCount", 0))
                            v_comments = int(v_stats.get("commentCount", 0))
                            v_eng = calculate_engagement_rate(
                                likes=v_likes,
                                comments=v_comments,
                                shares=0,
                                saves=0,
                                reach=v_views,
                            )

                            v_thumbs = v_snippet.get("thumbnails", {})
                            v_thumb = (
                                v_thumbs.get("high", {}).get("url")
                                or v_thumbs.get("medium", {}).get("url")
                                or v_thumbs.get("default", {}).get("url")
                            )

                            recent_videos.append({
                                "video_id": v_id,
                                "title": v_snippet.get("title", "Untitled Video"),
                                "thumbnail_url": v_thumb,
                                "published_at": v_snippet.get("publishedAt", ""),
                                "views": v_views,
                                "likes": v_likes,
                                "comments": v_comments,
                                "engagement_rate": round(v_eng, 2),
                                "video_url": f"https://www.youtube.com/watch?v={v_id}",
                            })

                recent_views = sum(v["views"] for v in recent_videos)
                recent_likes = sum(v["likes"] for v in recent_videos)
                recent_comments = sum(v["comments"] for v in recent_videos)
                avg_engagement = (
                    round(sum(v["engagement_rate"] for v in recent_videos) / len(recent_videos), 2)
                    if recent_videos
                    else 0.0
                )

                return {
                    "status": "connected",
                    "platform": "YouTube",
                    "connection_mode": "oauth_live",
                    "channel": {
                        "channel_id": channel_id,
                        "title": channel_title,
                        "custom_url": custom_url,
                        "thumbnail_url": thumbnail_url,
                        "subscribers": subscribers,
                        "total_views": total_views,
                        "video_count": video_count,
                        "profile_url": f"https://www.youtube.com/channel/{channel_id}" if channel_id else "",
                    },
                    "metrics": {
                        "total_views": total_views,
                        "subscribers": subscribers,
                        "video_count": video_count,
                        "recent_views": recent_views,
                        "recent_likes": recent_likes,
                        "recent_comments": recent_comments,
                        "average_engagement_rate": avg_engagement,
                    },
                    "recent_videos": recent_videos,
                    "fetched_at": datetime.utcnow().isoformat(),
                    "is_live": True,
                }

        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Error fetching live YouTube data via OAuth: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to fetch live YouTube analytics. Please verify your connection.",
            ) from exc

    # 4. Fallback for accounts configured with YOUTUBE_API_KEY
    try:
        youtube = get_youtube_client()
        cid = conn.platform_user_id or conn.platform_username or ""

        channel_resp = None
        if cid.startswith("UC"):
            channel_resp = youtube.channels().list(part="contentDetails,snippet,statistics", id=cid).execute()
        if not channel_resp or not channel_resp.get("items"):
            handle_name = cid.lstrip("@")
            try:
                channel_resp = youtube.channels().list(part="contentDetails,snippet,statistics", forHandle=handle_name).execute()
            except Exception:
                channel_resp = None

        if not channel_resp or not channel_resp.get("items"):
            # If no channel found by ID, return safe structure with connected info
            return {
                "status": "connected",
                "platform": "YouTube",
                "connection_mode": "api_key",
                "channel": {
                    "channel_id": cid or "connected_youtube_channel",
                    "title": conn.display_name or "YouTube Channel",
                    "custom_url": conn.platform_username or "",
                    "thumbnail_url": None,
                    "subscribers": 0,
                    "total_views": 0,
                    "video_count": 0,
                    "profile_url": conn.profile_url or "",
                },
                "metrics": {
                    "total_views": 0,
                    "subscribers": 0,
                    "video_count": 0,
                    "recent_views": 0,
                    "recent_likes": 0,
                    "recent_comments": 0,
                    "average_engagement_rate": 0.0,
                },
                "recent_videos": [],
                "fetched_at": datetime.utcnow().isoformat(),
                "is_live": True,
            }

        ch = channel_resp["items"][0]
        c_stats = ch.get("statistics", {})
        c_snip = ch.get("snippet", {})
        c_thumbs = c_snip.get("thumbnails", {})

        return {
            "status": "connected",
            "platform": "YouTube",
            "connection_mode": "api_key",
            "channel": {
                "channel_id": ch.get("id"),
                "title": c_snip.get("title", conn.display_name),
                "custom_url": c_snip.get("customUrl", conn.platform_username),
                "thumbnail_url": c_thumbs.get("high", {}).get("url"),
                "subscribers": int(c_stats.get("subscriberCount", 0)),
                "total_views": int(c_stats.get("viewCount", 0)),
                "video_count": int(c_stats.get("videoCount", 0)),
                "profile_url": f"https://www.youtube.com/channel/{ch.get('id')}",
            },
            "metrics": {
                "total_views": int(c_stats.get("viewCount", 0)),
                "subscribers": int(c_stats.get("subscriberCount", 0)),
                "video_count": int(c_stats.get("videoCount", 0)),
                "recent_views": 0,
                "recent_likes": 0,
                "recent_comments": 0,
                "average_engagement_rate": 0.0,
            },
            "recent_videos": [],
            "fetched_at": datetime.utcnow().isoformat(),
            "is_live": True,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error fetching live YouTube data via API key: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to fetch live YouTube analytics. Please verify your connection.",
        ) from exc
