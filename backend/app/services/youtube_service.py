"""
YouTube Data API v3 client.

WHY isolated in its own file?
This is the ONLY file that should know YouTube's specific URL structure,
query params, and JSON response shape. Everything else in the app works
with our internal Content/AudienceGrowth models. If YouTube changes their
API, or we later add a second video platform, only this file changes.

AUTH: uses a simple API key (query param), not OAuth. This is correct
for reading PUBLIC channel/video data (subscriber counts, video stats),
which is all this integration needs. OAuth would only be required for
private data or actions on the creator's own account (uploading,
reading private analytics) — out of scope here per the spec.

QUOTA: each real YouTube API call costs "quota units" against a daily
cap (10,000/day on the free tier). channels.list costs 1 unit,
playlistItems.list costs 1 unit per page, videos.list costs 1 unit per
call (up to 50 IDs). Kept in mind by batching video IDs into groups of
50 rather than calling videos.list once per video.
"""
import httpx
from typing import Optional

from app.core.config import settings

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeAPIError(Exception):
    """Raised when the YouTube API returns an error response."""
    pass


class YouTubeService:
    def __init__(self, api_key: Optional[str] = None):
        # Allows tests to inject a fake key without touching global settings.
        self.api_key = api_key or settings.YOUTUBE_API_KEY

    def _check_key_configured(self):
        if not self.api_key:
            raise YouTubeAPIError(
                "YOUTUBE_API_KEY is not configured. Set it in your .env file."
            )

    async def get_channel_info(self, channel_id: str) -> dict:
        """
        Fetches channel snippet + statistics.
        Docs: https://developers.google.com/youtube/v3/docs/channels/list
        """
        self._check_key_configured()

        params = {
            "part": "snippet,statistics,contentDetails",
            "id": channel_id,
            "key": self.api_key,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{YOUTUBE_API_BASE}/channels", params=params)

        if response.status_code != 200:
            raise YouTubeAPIError(
                f"YouTube API error ({response.status_code}): {response.text}"
            )

        data = response.json()
        items = data.get("items", [])
        if not items:
            raise YouTubeAPIError(f"No channel found for id '{channel_id}'")

        channel = items[0]
        return {
            "channel_id": channel["id"],
            "title": channel["snippet"]["title"],
            "subscriber_count": int(channel["statistics"].get("subscriberCount", 0)),
            "view_count": int(channel["statistics"].get("viewCount", 0)),
            "video_count": int(channel["statistics"].get("videoCount", 0)),
            "uploads_playlist_id": channel["contentDetails"]["relatedPlaylists"]["uploads"],
        }

    async def get_recent_video_ids(self, uploads_playlist_id: str, max_results: int = 25) -> list[str]:
        """
        Docs: https://developers.google.com/youtube/v3/docs/playlistItems/list
        """
        self._check_key_configured()

        params = {
            "part": "contentDetails",
            "playlistId": uploads_playlist_id,
            "maxResults": min(max_results, 50),  # API hard cap per page
            "key": self.api_key,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{YOUTUBE_API_BASE}/playlistItems", params=params)

        if response.status_code != 200:
            raise YouTubeAPIError(
                f"YouTube API error ({response.status_code}): {response.text}"
            )

        data = response.json()
        return [item["contentDetails"]["videoId"] for item in data.get("items", [])]

    async def get_video_stats(self, video_ids: list[str]) -> list[dict]:
        """
        Docs: https://developers.google.com/youtube/v3/docs/videos/list
        videos.list accepts up to 50 comma-separated IDs per call — the
        caller is expected to batch (see sync_service.py) rather than
        calling this once per video, to conserve quota.
        """
        self._check_key_configured()
        if not video_ids:
            return []
        if len(video_ids) > 50:
            raise ValueError("videos.list accepts at most 50 IDs per call — batch upstream")

        params = {
            "part": "snippet,statistics",
            "id": ",".join(video_ids),
            "key": self.api_key,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{YOUTUBE_API_BASE}/videos", params=params)

        if response.status_code != 200:
            raise YouTubeAPIError(
                f"YouTube API error ({response.status_code}): {response.text}"
            )

        data = response.json()
        results = []
        for item in data.get("items", []):
            stats = item.get("statistics", {})
            results.append({
                "video_id": item["id"],
                "title": item["snippet"]["title"],
                "publish_date": item["snippet"]["publishedAt"],
                "view_count": int(stats.get("viewCount", 0)),
                "like_count": int(stats.get("likeCount", 0)),
                "comment_count": int(stats.get("commentCount", 0)),
            })
        return results
