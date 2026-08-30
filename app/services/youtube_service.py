from datetime import date, datetime
from typing import Any, Dict, List
from fastapi import HTTPException, status
import requests
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.content import Content
from app.models.user import User


class YouTubeService:
    BASE_URL = "https://www.googleapis.com/youtube/v3"

    @classmethod
    def fetch_channel_videos(
        cls, channel_id: str, max_results: int = 10
    ) -> List[Dict[str, Any]]:
        if not settings.YOUTUBE_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="YouTube API key is missing in environment configuration.",
            )

        # 1. Fetch video IDs from channel
        search_url = f"{cls.BASE_URL}/search"
        search_params = {
            "key": settings.YOUTUBE_API_KEY,
            "channelId": channel_id,
            "part": "snippet",
            "order": "date",
            "type": "video",
            "maxResults": max_results,
        }

        try:
            search_response = requests.get(
                search_url, params=search_params, timeout=10
            )
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

        # 2. Fetch video metrics
        videos_url = f"{cls.BASE_URL}/videos"
        videos_params = {
            "key": settings.YOUTUBE_API_KEY,
            "id": ",".join(video_ids),
            "part": "snippet,statistics",
        }

        videos_response = requests.get(
            videos_url, params=videos_params, timeout=10
        )
        videos_response.raise_for_status()
        videos_data = videos_response.json()

        # 3. Transform to CreatorIQ Common Format
        transformed_records = []
        for video in videos_data.get("items", []):
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})

            # Parse ISO date string
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
                    "shares": 0,  # YouTube API v3 does not expose share counts publicly
                    "saves": 0,
                    "reach": int(
                        views * 1.25
                    ),  # Estimated total reach multiplier
                    "watch_time": 0.0,
                    "published_date": pub_date,
                }
            )

        return transformed_records

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

        db.commit()

        return {
            "platform": "YouTube",
            "status": "success",
            "records_synced": synced_count,
            "records_updated": updated_count,
            "total_processed": len(raw_items),
        }