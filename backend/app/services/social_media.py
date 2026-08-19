import random

MOCK_PLATFORM_DATA = {
    "YouTube": {
        "platform": "YouTube",
        "content_title": "Python Tutorial",
        "views": 15000, "likes": 1200, "comments": 150,
        "shares": 100, "saves": 80, "watch_time": 4200.0, "reach": 18000
    },
    "Instagram": {
        "platform": "Instagram",
        "content_title": "Behind the Scenes Reel",
        "views": 9500, "likes": 2100, "comments": 320,
        "shares": 210, "saves": 450, "watch_time": 1800.0, "reach": 12500
    },
    "Facebook": {
        "platform": "Facebook",
        "content_title": "Live Q&A Recap",
        "views": 6200, "likes": 540, "comments": 95,
        "shares": 130, "saves": 60, "watch_time": 2100.0, "reach": 8800
    },
    "LinkedIn": {
        "platform": "LinkedIn",
        "content_title": "Career Tips for Creators",
        "views": 4300, "likes": 610, "comments": 88,
        "shares": 145, "saves": 90, "watch_time": 900.0, "reach": 5600
    },
    "TikTok": {
        "platform": "TikTok",
        "content_title": "Quick Editing Hack",
        "views": 42000, "likes": 8700, "comments": 610,
        "shares": 1900, "saves": 1200, "watch_time": 3100.0, "reach": 51000
    },
    "X": {
        "platform": "X",
        "content_title": "Thread: 5 Growth Lessons",
        "views": 3100, "likes": 410, "comments": 76,
        "shares": 95, "saves": 30, "watch_time": 0.0, "reach": 4200
    }
}


def get_platform_mock_data(platform: str) -> dict | None:
    """Fetch simulated analytics data for a given platform, with slight randomness per sync."""
    base = MOCK_PLATFORM_DATA.get(platform)
    if not base:
        return None

    varied = base.copy()
    for field in ["views", "likes", "comments", "shares", "saves", "reach"]:
        varied[field] = int(base[field] * random.uniform(0.9, 1.1))

    return varied