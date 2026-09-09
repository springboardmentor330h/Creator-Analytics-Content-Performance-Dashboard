import urllib.parse
from typing import Any, Dict, Optional
import httpx
from app.core.config import get_settings
from app.integrations.base import BaseSocialIntegration


class YouTubeIntegration(BaseSocialIntegration):
    platform_key = "youtube"
    display_name = "YouTube"

    def is_configured(self) -> bool:
        settings = get_settings()
        client_id = getattr(settings, 'YOUTUBE_CLIENT_ID', None) or getattr(settings, 'GOOGLE_CLIENT_ID', None)
        client_secret = getattr(settings, 'YOUTUBE_CLIENT_SECRET', None) or getattr(settings, 'GOOGLE_CLIENT_SECRET', None)
        return bool(client_id and client_secret)

    def get_authorization_url(self, state: str) -> str:
        if not self.is_configured():
            raise ValueError("YouTube API credentials (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET) are not configured.")
        
        settings = get_settings()
        client_id = getattr(settings, 'YOUTUBE_CLIENT_ID', '') or getattr(settings, 'GOOGLE_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'GOOGLE_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/youtube/callback")
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile",
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'YOUTUBE_CLIENT_ID', '') or getattr(settings, 'GOOGLE_CLIENT_ID', '')
        client_secret = getattr(settings, 'YOUTUBE_CLIENT_SECRET', '') or getattr(settings, 'GOOGLE_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'GOOGLE_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/youtube/callback")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")
        expires_in = data.get("expires_in")
        scopes = data.get("scope")

        account_info = await self.fetch_account_info(access_token)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "scopes": scopes,
            "platform_user_id": account_info.get("id"),
            "platform_username": account_info.get("username"),
            "display_name": account_info.get("display_name"),
            "profile_url": account_info.get("profile_url"),
        }

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'YOUTUBE_CLIENT_ID', '') or getattr(settings, 'GOOGLE_CLIENT_ID', '')
        client_secret = getattr(settings, 'YOUTUBE_CLIENT_SECRET', '') or getattr(settings, 'GOOGLE_CLIENT_SECRET', '')

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "refresh_token": refresh_token,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "grant_type": "refresh_token",
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def fetch_account_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"part": "snippet,statistics", "mine": "true"},
            )
            if resp.status_code == 200:
                body = resp.json()
                items = body.get("items", [])
                if items:
                    channel = items[0]
                    snippet = channel.get("snippet", {})
                    channel_id = channel.get("id")
                    custom_url = snippet.get("customUrl", "")
                    title = snippet.get("title", "YouTube Creator")
                    return {
                        "id": channel_id,
                        "username": custom_url or channel_id,
                        "display_name": title,
                        "profile_url": f"https://www.youtube.com/channel/{channel_id}",
                    }
        return {"id": "yt_user", "username": "youtube_user", "display_name": "YouTube Account", "profile_url": "https://youtube.com"}

    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        """Fetch creator's uploaded videos and metrics from YouTube Data API v3 using OAuth Bearer token."""
        from app.models.user import User
        from app.services.youtube_service import sync_youtube_data

        user = db_session.get(User, user_id)
        if not user or not access_token:
            return 0

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {access_token}"}

                # 1. Fetch channel info & uploads playlist ID
                ch_resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/channels",
                    headers=headers,
                    params={"part": "contentDetails,snippet,statistics", "mine": "true"},
                )
                if ch_resp.status_code != 200:
                    return 0

                items = ch_resp.json().get("items", [])
                if not items:
                    return 0

                channel = items[0]
                channel_snippet = channel.get("snippet", {})
                channel_title = channel_snippet.get("title", "YouTube Channel")
                custom_url = channel_snippet.get("customUrl", "")
                channel_id = channel.get("id", "")
                uploads_playlist_id = channel.get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")
                if not uploads_playlist_id:
                    return 0

                # 2. Fetch playlist items from uploads playlist
                pl_resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/playlistItems",
                    headers=headers,
                    params={
                        "part": "snippet,contentDetails",
                        "playlistId": uploads_playlist_id,
                        "maxResults": 25,
                    },
                )
                if pl_resp.status_code != 200:
                    return 0

                pl_items = pl_resp.json().get("items", [])
                video_ids = [
                    item["contentDetails"]["videoId"]
                    for item in pl_items
                    if "contentDetails" in item and "videoId" in item["contentDetails"]
                ]
                if not video_ids:
                    return 0

                # 3. Fetch video details & statistics
                v_resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/videos",
                    headers=headers,
                    params={
                        "part": "snippet,statistics",
                        "id": ",".join(video_ids),
                    },
                )
                if v_resp.status_code != 200:
                    return 0

                video_items = v_resp.json().get("items", [])
                res = sync_youtube_data(
                    db=db_session,
                    user=user,
                    custom_items=video_items,
                    account_name=channel_title,
                    channel_id=custom_url or channel_id,
                )
                return int(res.get("records_synced", 0))

        except Exception:
            return 0

