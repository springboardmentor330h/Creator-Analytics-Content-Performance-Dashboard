import urllib.parse
from typing import Any, Dict, Optional
import httpx
from app.core.config import get_settings
from app.integrations.base import BaseSocialIntegration


class InstagramIntegration(BaseSocialIntegration):
    platform_key = "instagram"
    display_name = "Instagram"

    def is_configured(self) -> bool:
        settings = get_settings()
        client_id = getattr(settings, 'META_CLIENT_ID', None)
        client_secret = getattr(settings, 'META_CLIENT_SECRET', None)
        return bool(client_id and client_secret)

    def get_authorization_url(self, state: str) -> str:
        if not self.is_configured():
            raise ValueError("Instagram/Meta API credentials (META_CLIENT_ID, META_CLIENT_SECRET) are not configured.")
        
        settings = get_settings()
        client_id = getattr(settings, 'META_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'META_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/instagram/callback")
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "instagram_basic,instagram_manage_insights,pages_read_engagement",
            "state": state,
        }
        return f"https://www.facebook.com/v18.0/dialog/oauth?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'META_CLIENT_ID', '')
        client_secret = getattr(settings, 'META_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'META_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/instagram/callback")

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://graph.facebook.com/v18.0/oauth/access_token",
                params={
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "code": code,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        access_token = data.get("access_token")
        account_info = await self.fetch_account_info(access_token)

        return {
            "access_token": access_token,
            "refresh_token": None,
            "expires_in": data.get("expires_in", 5184000),
            "scopes": "instagram_basic,instagram_manage_insights",
            "platform_user_id": account_info.get("id"),
            "platform_username": account_info.get("username"),
            "display_name": account_info.get("display_name"),
            "profile_url": account_info.get("profile_url"),
        }

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        return {}

    async def fetch_account_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://graph.facebook.com/v18.0/me",
                params={"fields": "id,name,username", "access_token": access_token},
            )
            if resp.status_code == 200:
                data = resp.json()
                username = data.get("username", data.get("name", "instagram_user"))
                return {
                    "id": str(data.get("id")),
                    "username": username,
                    "display_name": data.get("name", username),
                    "profile_url": f"https://www.instagram.com/{username}",
                }
        return {"id": "ig_user", "username": "instagram_user", "display_name": "Instagram Professional", "profile_url": "https://instagram.com"}

    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        return 0
