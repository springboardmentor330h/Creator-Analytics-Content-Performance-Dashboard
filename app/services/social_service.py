import random
from datetime import date, timedelta

SUPPORTED_PLATFORMS = ["YouTube", "Instagram", "TikTok", "Facebook", "LinkedIn", "X"]


def get_supported_platforms():
    return [{"platform": p, "connected": False} for p in SUPPORTED_PLATFORMS]


def generate_mock_content(platform: str, creator_id: int, count: int = 5) -> list[dict]:
    """Generates plausible content rows for platforms we don't have live API
    access to yet. Shape matches the real APIs' response format so the same
    analytics endpoints work regardless of data source. Metrics a platform
    genuinely doesn't support are left as 0 here (never invented as nonzero)."""
    rows = []
    today = date.today()

    for i in range(count):
        views = random.randint(500, 50000)
        rows.append({
            "creator_id": creator_id,
            "platform": platform,
            "external_content_id": f"mock-{platform.lower()}-{creator_id}-{i}",
            "content_title": f"{platform} post #{i + 1}",
            "views": views,
            "likes": int(views * random.uniform(0.02, 0.08)),
            "comments": int(views * random.uniform(0.001, 0.01)),
            "shares": int(views * random.uniform(0.001, 0.02)),
            "saves": int(views * random.uniform(0.001, 0.015)),
            "watch_time": int(views * random.uniform(5, 40)) if platform != "X" else 0,
            "reach": int(views * random.uniform(1.1, 1.6)),
            "published_date": today - timedelta(days=random.randint(0, 60)),
        })

    return rows
