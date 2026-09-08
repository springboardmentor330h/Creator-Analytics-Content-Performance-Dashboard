"""
Mock platform data service.

WHY does this exist?
Real integrations (YouTube API in Sprint 5, others later) aren't built
yet, but the multi-platform comparison feature needs *some* data to
normalize and compare. Rather than leaving Instagram/TikTok blank or
faking it inline inside the analytics service, this file is the single,
clearly-labeled place mock data comes from.

WHEN THIS GETS REPLACED:
Sprint 5 adds a real YouTubeService (app/services/youtube_service.py).
The normalization service (below) will call the real service for
platforms that have one, and fall back to this mock service only for
platforms that don't yet. That swap happens in ONE place — normalization
logic never needs to change, because both services return the same
PlatformSnapshot shape.

Every value from here has is_mock_data=True so the frontend/API consumer
always knows what's real vs simulated — never silently presented as real.
"""
import random
from app.models.content import Platform

# Fixed seed per platform so mock numbers are stable across requests
# within a session, instead of jumping around every time someone refreshes
# the dashboard (which would look like a bug, not a feature).
_MOCK_SEEDS = {
    Platform.instagram: 42,
    Platform.tiktok: 99,
}


def get_mock_platform_snapshot(platform: Platform) -> dict:
    if platform not in _MOCK_SEEDS:
        raise ValueError(f"No mock data configured for platform: {platform}")

    rng = random.Random(_MOCK_SEEDS[platform])
    followers = rng.randint(5000, 250000)
    total_content = rng.randint(10, 80)
    total_reach = followers * rng.uniform(0.3, 1.2)
    avg_engagement_rate = round(rng.uniform(1.5, 12.0), 2)
    growth_rate_percent = round(rng.uniform(-2.0, 15.0), 2)

    return {
        "platform": platform,
        "followers": followers,
        "total_content": total_content,
        "total_reach": int(total_reach),
        "avg_engagement_rate": avg_engagement_rate,
        "growth_rate_percent": growth_rate_percent,
        "is_mock_data": True,
    }
