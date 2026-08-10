from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class BaseSocialIntegration(ABC):
    platform_key: str = ""
    display_name: str = ""

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if environment credentials (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) are configured."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """Generate official OAuth authorization URL with requested state parameter."""
        pass

    @abstractmethod
    async def exchange_code(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        """Exchange authorization code for access_token, refresh_token, and user info."""
        pass

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh expired access token if supported by platform."""
        pass

    @abstractmethod
    async def fetch_account_info(self, access_token: str) -> Dict[str, Any]:
        """Fetch authenticated user profile info (user_id, username, display_name, profile_url)."""
        pass

    @abstractmethod
    async def sync_data(self, db_session: Any, user_id: int, access_token: str) -> int:
        """Fetch social content analytics from official API and normalize into CreatorIQ Content DB."""
        pass
