import urllib.parse
from typing import Any, Dict, Optional
import httpx
from app.core.config import get_settings
from app.integrations.base import BaseSocialIntegration


class TikTokIntegration(BaseSocialIntegration):
    platform_key = "tiktok"
    display_name = "TikTok"

    def is_configured(self) -> bool:
        settings = get_settings()
        client_key = getattr(settings, 'TIKTOK_CLIENT_KEY', None)
        client_secret = getattr(settings, 'TIKTOK_CLIENT_SECRET', None)
        return bool(client_key and client_secret)

    def get_authorization_url(self, state: str) -> str:
        if not self.is_configured():
            raise ValueError("TikTok API credentials (TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET) are not configured.")
        
        settings = get_settings()
        client_key = getattr(settings, 'TIKTOK_CLIENT_KEY', '')
        redirect_uri = getattr(settings, 'TIKTOK_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/tiktok/callback")
        
        params = {
            "client_key": client_key,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "user.info.basic,video.list",
            "state": state,
        }
        return f"https://www.tiktok.com/v2/auth/authorize/?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        settings = get_settings()
        client_key = getattr(settings, 'TIKTOK_CLIENT_KEY', '')
        client_secret = getattr(settings, 'TIKTOK_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'TIKTOK_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/tiktok/callback")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://open.tiktokapis.com/v2/oauth/token/",
                data={
                    "client_key": client_key,
                    "client_secret": client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            data = resp.json()

        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")

        account_info = await self.fetch_account_info(access_token)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": data.get("expires_in", 86400),
            "scopes": "user.info.basic,video.list",
            "platform_user_id": account_info.get("id"),
            "platform_username": account_info.get("username"),
            "display_name": account_info.get("display_name"),
            "profile_url": account_info.get("profile_url"),
        }

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        settings = get_settings()
        client_key = getattr(settings, 'TIKTOK_CLIENT_KEY', '')
        client_secret = getattr(settings, 'TIKTOK_CLIENT_SECRET', '')

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://open.tiktokapis.com/v2/oauth/token/",
                data={
                    "client_key": client_key,
                    "client_secret": client_secret,
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def fetch_account_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://open.tiktokapis.com/v2/user/info/",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"fields": "open_id,union_id,avatar_url,display_name"},
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {}).get("user", {})
                display_name = data.get("display_name", "TikTok Creator")
                open_id = data.get("open_id", "tiktok_user")
                return {
                    "id": open_id,
                    "username": open_id,
                    "display_name": display_name,
                    "profile_url": f"https://www.tiktok.com/@{open_id}",
                }
        return {"id": "tiktok_user", "username": "tiktok_user", "display_name": "TikTok Creator", "profile_url": "https://tiktok.com"}

    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        return 0
