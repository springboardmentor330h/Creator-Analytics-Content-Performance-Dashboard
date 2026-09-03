from datetime import date, datetime, timezone
from typing import Any, Dict, List
from fastapi import HTTPException, status
import requests
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.content import Content, ContentItem
from app.models.user import User


class YouTubeService:
    BASE_URL = "https://www.googleapis.com/youtube/v3"

    @staticmethod
    def _resolve_api_key(api_key: str | None = None) -> str:
        resolved = (api_key or settings.YOUTUBE_API_KEY or "").strip()
        if not resolved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="YouTube API key is required.",
            )
        return resolved

    @classmethod
    def _fetch_search_results(
        cls,
        query: str | None = None,
        channel_id: str | None = None,
        max_results: int = 10,
        api_key: str | None = None,
    ) -> List[Dict[str, Any]]:
        final_api_key = cls._resolve_api_key(api_key)

        search_url = f"{cls.BASE_URL}/search"
        search_params = {
            "key": final_api_key,
            "part": "snippet",
            "order": "relevance",
            "type": "video",
            "maxResults": max_results,
        }

        if channel_id:
            search_params["channelId"] = channel_id
            search_params["order"] = "date"
        if query:
            search_params["q"] = query

        try:
            search_response = requests.get(search_url, params=search_params, timeout=10)
            if search_response.status_code == 400:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid YouTube Channel ID or parameters.",
                )
            elif search_response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="YouTube API Key invalid or Quota exceeded.",
                )

            search_response.raise_for_status()
            search_data = search_response.json()
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with YouTube API: {str(e)}",
            )

        items = search_data.get("items", [])
        if not items:
            return []

        video_ids = [
            item["id"]["videoId"]
            for item in items
            if "videoId" in item.get("id", {})
        ]
        if not video_ids:
            return []

        videos_url = f"{cls.BASE_URL}/videos"
        videos_params = {
            "key": final_api_key,
            "id": ",".join(video_ids),
            "part": "snippet,statistics",
        }

        videos_response = requests.get(videos_url, params=videos_params, timeout=10)
        videos_response.raise_for_status()
        videos_data = videos_response.json()

        transformed_records = []
        for video in videos_data.get("items", []):
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})
            pub_date_raw = snippet.get("publishedAt", "")
            pub_date = (
                datetime.strptime(pub_date_raw[:10], "%Y-%m-%d").date()
                if pub_date_raw
                else date.today()
            )

            views = int(stats.get("viewCount", 0))
            transformed_records.append(
                {
                    "platform": "YouTube",
                    "external_content_id": video.get("id"),
                    "content_title": snippet.get("title", "Untitled Video"),
                    "views": views,
                    "likes": int(stats.get("likeCount", 0)),
                    "comments": int(stats.get("commentCount", 0)),
                    "shares": 0,
                    "saves": 0,
                    "reach": max(views, 1),
                    "watch_time": 0.0,
                    "published_date": pub_date,
                }
            )

        return transformed_records

    @classmethod
    def fetch_channel_videos(
        cls, channel_id: str, max_results: int = 10
    ) -> List[Dict[str, Any]]:
        return cls._fetch_search_results(channel_id=channel_id, max_results=max_results)

    @classmethod
    def fetch_channel_by_name(
        cls, channel_name: str, api_key: str | None = None, max_results: int = 10
    ) -> List[Dict[str, Any]]:
        if not channel_name or not channel_name.strip():
            raise HTTPException(status_code=400, detail="Channel name is required.")

        final_api_key = cls._resolve_api_key(api_key)

        search_url = f"{cls.BASE_URL}/search"
        search_params = {
            "key": final_api_key,
            "part": "snippet",
            "type": "channel",
            "q": channel_name.strip(),
            "maxResults": max_results,
        }

        try:
            search_response = requests.get(search_url, params=search_params, timeout=10)
            if search_response.status_code == 400:
                raise HTTPException(status_code=400, detail="Invalid YouTube channel parameters.")
            elif search_response.status_code == 403:
                raise HTTPException(status_code=403, detail="YouTube API key is invalid or quota has been exceeded.")
            search_response.raise_for_status()
            search_data = search_response.json()
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with YouTube API: {str(e)}",
            )

        matches = search_data.get("items", [])
        if not matches:
            return []

        channel_ids = [
            item["id"].get("channelId")
            for item in matches
            if item.get("id", {}).get("channelId")
        ]
        if not channel_ids:
            return []

        channels_url = f"{cls.BASE_URL}/channels"
        channels_params = {
            "key": final_api_key,
            "id": ",".join(channel_ids),
            "part": "snippet,statistics",
        }

        channels_response = requests.get(channels_url, params=channels_params, timeout=10)
        channels_response.raise_for_status()
        channels_data = channels_response.json()

        video_search_url = f"{cls.BASE_URL}/search"
        video_search_params = {
            "key": final_api_key,
            "channelId": channel_ids[0],
            "part": "snippet",
            "type": "video",
            "order": "viewCount",
            "maxResults": max_results,
        }

        video_search_response = requests.get(video_search_url, params=video_search_params, timeout=10)
        video_search_response.raise_for_status()
        recent_videos = video_search_response.json().get("items", [])

        video_ids = [
            item["id"]["videoId"]
            for item in recent_videos
            if item.get("id", {}).get("videoId")
        ]
        if not video_ids:
            return []

        videos_url = f"{cls.BASE_URL}/videos"
        videos_params = {
            "key": final_api_key,
            "id": ",".join(video_ids),
            "part": "snippet,statistics",
        }

        videos_response = requests.get(videos_url, params=videos_params, timeout=10)
        videos_response.raise_for_status()
        videos_data = videos_response.json().get("items", [])

        video_metrics = []
        for video in videos_data:
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})
            video_metrics.append(
                {
                    "title": snippet.get("title", "Untitled Video"),
                    "views": int(stats.get("viewCount", 0)),
                    "likes": int(stats.get("likeCount", 0)),
                    "comments": int(stats.get("commentCount", 0)),
                    "shares": 0,
                }
            )

        top_video = max(video_metrics, key=lambda item: item["views"], default={"title": channel_name.strip(), "views": 0, "likes": 0, "comments": 0, "shares": 0})
        total_views = sum(item["views"] for item in video_metrics)
        total_likes = sum(item["likes"] for item in video_metrics)
        total_comments = sum(item["comments"] for item in video_metrics)
        total_shares = sum(item["shares"] for item in video_metrics)
        total_reach = max(total_views, 1)

        channel = channels_data.get("items", [])[0]
        stats = channel.get("statistics", {})
        snippet = channel.get("snippet", {})

        top_video_title = top_video.get("title", channel_name.strip())
        return [{
            "platform": "YouTube",
            "channel_id": channel.get("id"),
            "channel_title": snippet.get("title", channel_name.strip()),
            "title": top_video_title,
            "views": total_views,
            "likes": total_likes,
            "comments": total_comments,
            "shares": total_shares,
            "reach": total_reach,
            "subscribers": int(stats.get("subscriberCount", 0)),
            "videos": int(stats.get("videoCount", 0)),
            "top_video": top_video_title,
        }]

    @classmethod
    def fetch_video_by_name(
        cls, video_name: str, max_results: int = 5, api_key: str | None = None
    ) -> List[Dict[str, Any]]:
        if not video_name or not video_name.strip():
            raise HTTPException(status_code=400, detail="Video name is required.")
        return cls._fetch_search_results(query=video_name.strip(), max_results=max_results, api_key=api_key)

    @classmethod
    def fetch_video_by_id(cls, video_id: str, api_key: str | None = None) -> List[Dict[str, Any]]:
        if not video_id or not video_id.strip():
            raise HTTPException(status_code=400, detail="YouTube video ID is required.")

        final_api_key = cls._resolve_api_key(api_key)
        try:
            response = requests.get(
                f"{cls.BASE_URL}/videos",
                params={"key": final_api_key, "id": video_id.strip(), "part": "snippet,statistics"},
                timeout=10,
            )
            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="YouTube API Key invalid or Quota exceeded.")
            response.raise_for_status()
            items = response.json().get("items", [])
        except requests.RequestException as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with YouTube API: {str(exc)}",
            )

        records = []
        for video in items:
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})
            published_at = snippet.get("publishedAt", "")
            views = int(stats.get("viewCount", 0))
            records.append({
                "platform": "YouTube",
                "external_content_id": video.get("id", video_id.strip()),
                "content_title": snippet.get("title", "Untitled Video"),
                "views": views,
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0)),
                "shares": 0,
                "reach": max(views, 1),
                "published_date": datetime.strptime(published_at[:10], "%Y-%m-%d").date() if published_at else date.today(),
            })
        return records

    @classmethod
    def sync_youtube_data(
        cls,
        db: Session,
        channel_id: str,
        creator_id: int = 1,
        max_results: int = 10,
    ) -> Dict[str, Any]:
        # Verify user exists to prevent foreign key constraint crashes
        user_exists = db.query(User).filter(User.id == creator_id).first()
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Creator with ID {creator_id} does not exist in users table.",
            )

        raw_items = cls.fetch_channel_videos(
            channel_id=channel_id, max_results=max_results
        )

        synced_count = 0
        updated_count = 0

        for item in raw_items:
            # Check for existing record to prevent duplication
            existing_record = (
                db.query(Content)
                .filter(
                    Content.creator_id == creator_id,
                    func.lower(Content.platform) == "youtube",
                    Content.external_content_id == item["external_content_id"],
                )
                .first()
            )

            if existing_record:
                # Upsert: Update existing statistics
                existing_record.content_title = item["content_title"]
                existing_record.views = item["views"]
                existing_record.likes = item["likes"]
                existing_record.comments = item["comments"]
                existing_record.reach = item["reach"]
                updated_count += 1
            else:
                # Insert: Create new content entry
                new_record = Content(creator_id=creator_id, **item)
                db.add(new_record)
                synced_count += 1

            # The dashboard reports read the platform-neutral table. Mirror the
            # live YouTube ingestion here so it never falls back to frontend data.
            unified_record = (
                db.query(ContentItem)
                .filter(
                    ContentItem.platform == "YouTube",
                    ContentItem.content_id == item["external_content_id"],
                )
                .one_or_none()
            )
            unified_values = {
                "title": item["content_title"],
                "url": f"https://www.youtube.com/watch?v={item['external_content_id']}",
                "views": item["views"],
                "likes": item["likes"],
                "comments": item["comments"],
                "shares": item.get("shares", 0),
                "reach": item["reach"],
                "published_at": datetime.combine(
                    item["published_date"], datetime.min.time(), tzinfo=timezone.utc
                ),
            }
            if unified_record:
                for field, value in unified_values.items():
                    setattr(unified_record, field, value)
            else:
                db.add(
                    ContentItem(
                        platform="YouTube",
                        content_id=item["external_content_id"],
                        **unified_values,
                    )
                )

        db.commit()

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": synced_count,
            "records_updated": updated_count,
            "total_processed": len(raw_items),
        }
