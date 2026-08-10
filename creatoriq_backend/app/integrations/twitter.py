import urllib.parse
from typing import Any, Dict, Optional
import httpx
from app.core.config import get_settings
from app.integrations.base import BaseSocialIntegration


class TwitterIntegration(BaseSocialIntegration):
    platform_key = "twitter"
    display_name = "X (Twitter)"

    def is_configured(self) -> bool:
        settings = get_settings()
        client_id = getattr(settings, 'X_CLIENT_ID', None)
        client_secret = getattr(settings, 'X_CLIENT_SECRET', None)
        return bool(client_id and client_secret)

    def get_authorization_url(self, state: str) -> str:
        if not self.is_configured():
            raise ValueError("X (Twitter) API credentials (X_CLIENT_ID, X_CLIENT_SECRET) are not configured.")
        
        settings = get_settings()
        client_id = getattr(settings, 'X_CLIENT_ID', '')
        redirect_uri = getattr(settings, 'X_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/twitter/callback")
        
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "tweet.read users.read offline.access",
            "state": state,
            "code_challenge": "challenge",
            "code_challenge_method": "plain",
        }
        return f"https://twitter.com/i/oauth2/authorize?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'X_CLIENT_ID', '')
        client_secret = getattr(settings, 'X_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'X_REDIRECT_URI', f"{str(settings.FRONTEND_URL).rstrip('/')}/api/social/twitter/callback")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.twitter.com/2/oauth2/token",
                data={
                    "code": code,
                    "grant_type": "authorization_code",
                    "client_id": client_id,
                    "redirect_uri": redirect_uri,
                    "code_verifier": "challenge",
                },
                auth=(client_id, client_secret) if client_secret else None,
            )
            resp.raise_for_status()
            data = resp.json()

        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")

        account_info = await self.fetch_account_info(access_token)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": data.get("expires_in", 7200),
            "scopes": "tweet.read users.read offline.access",
            "platform_user_id": account_info.get("id"),
            "platform_username": account_info.get("username"),
            "display_name": account_info.get("display_name"),
            "profile_url": account_info.get("profile_url"),
        }

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        settings = get_settings()
        client_id = getattr(settings, 'X_CLIENT_ID', '')
        client_secret = getattr(settings, 'X_CLIENT_SECRET', '')

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.twitter.com/2/oauth2/token",
                data={
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                    "client_id": client_id,
                },
                auth=(client_id, client_secret) if client_secret else None,
            )
            resp.raise_for_status()
            return resp.json()

    async def fetch_account_info(self, access_token: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.twitter.com/2/users/me",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"user.fields": "id,name,username"},
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                username = data.get("username", "twitter_user")
                return {
                    "id": str(data.get("id")),
                    "username": username,
                    "display_name": data.get("name", username),
                    "profile_url": f"https://x.com/{username}",
                }
        return {"id": "tw_user", "username": "x_user", "display_name": "X Account", "profile_url": "https://x.com"}

    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        return 0
