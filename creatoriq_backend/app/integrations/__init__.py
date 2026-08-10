from typing import Dict
from app.integrations.base import BaseSocialIntegration
from app.integrations.youtube import YouTubeIntegration
from app.integrations.instagram import InstagramIntegration
from app.integrations.tiktok import TikTokIntegration
from app.integrations.facebook import FacebookIntegration
from app.integrations.twitter import TwitterIntegration
from app.integrations.linkedin import LinkedInIntegration

INTEGRATIONS: Dict[str, BaseSocialIntegration] = {
    "youtube": YouTubeIntegration(),
    "instagram": InstagramIntegration(),
    "tiktok": TikTokIntegration(),
    "facebook": FacebookIntegration(),
    "twitter": TwitterIntegration(),
    "linkedin": LinkedInIntegration(),
}

def get_integration(platform: str) -> BaseSocialIntegration:
    platform_key = platform.lower().strip()
    if platform_key not in INTEGRATIONS:
        raise ValueError(f"Unsupported social platform '{platform}'. Allowed: {list(INTEGRATIONS.keys())}")
    return INTEGRATIONS[platform_key]
