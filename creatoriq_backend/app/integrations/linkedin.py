import urllib.parse
from typing import Any, Dict, Optional
import httpx
from app.core.config import get_settings
from app.integrations.base import BaseSocialIntegration


class LinkedInIntegration(BaseSocialIntegration):
    platform_key = "linkedin"
    display_name = "LinkedIn"

    def is_configured(self) -> bool:
        settings = get_settings()
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', None)
        client_secret = getattr(settings, 'LINKEDIN_CLIENT_SECRET', None)
        return bool(client_id and client_secret)

    def get_authorization_url(self, state: str) -> str:
        if not self.is_configured():
            raise ValueError("LinkedIn API credentials (LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET) are not configured.")
        
        settings = get_settings()
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'LINKEDIN_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/linkedin/callback")
        
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "scope": "openid profile email",
        }
        return f"https://www.linkedin.com/oauth/v2/authorization?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'LINKEDIN_CLIENT_ID', '')
        client_secret = getattr(settings, 'LINKEDIN_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'LINKEDIN_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/linkedin/callback")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": client_id,
                    "client_secret": client_secret,
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
            "expires_in": data.get("expires_in", 5184000),
            "scopes": "openid profile email",
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
                "https://api.linkedin.com/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                sub = data.get("sub", "linkedin_user")
                name = data.get("name", "LinkedIn User")
                return {
                    "id": sub,
                    "username": sub,
                    "display_name": name,
                    "profile_url": "https://www.linkedin.com",
                }
        return {"id": "li_user", "username": "linkedin_user", "display_name": "LinkedIn User", "profile_url": "https://linkedin.com"}

    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        return 0
