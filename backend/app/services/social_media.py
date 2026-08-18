"""
Simulated social media platform data. No real API/OAuth calls yet —
this stands in for real integrations until Sprint 5+.
"""

MOCK_PLATFORM_DATA = {
    "YouTube": [
        {"content_title": "Python Tutorial", "views": 15000, "likes": 1200, "comments": 150, "shares": 100, "saves": 80, "watch_time": 4200, "reach": 18000},
        {"content_title": "FastAPI Crash Course", "views": 9800, "likes": 760, "comments": 95, "shares": 60, "saves": 45, "watch_time": 2600, "reach": 12000},
    ],
    "Instagram": [
        {"content_title": "Behind the Scenes Reel", "views": 22000, "likes": 3100, "comments": 210, "shares": 340, "saves": 500, "watch_time": 1500, "reach": 30000},
        {"content_title": "Quick Coding Tip", "views": 14000, "likes": 1900, "comments": 130, "shares": 180, "saves": 260, "watch_time": 900, "reach": 19000},
    ],
    "Facebook": [
        {"content_title": "Weekly Update Post", "views": 8000, "likes": 600, "comments": 80, "shares": 120, "saves": 40, "watch_time": 500, "reach": 11000},
    ],
    "LinkedIn": [
        {"content_title": "Career Growth Tips", "views": 6000, "likes": 450, "comments": 60, "shares": 90, "saves": 70, "watch_time": 0, "reach": 8500},
    ],
    "TikTok": [
        {"content_title": "Coding in 60 Seconds", "views": 45000, "likes": 6200, "comments": 400, "shares": 900, "saves": 1100, "watch_time": 800, "reach": 60000},
    ],
    "X": [
        {"content_title": "Dev Thread: FastAPI Tips", "views": 5000, "likes": 380, "comments": 45, "shares": 200, "saves": 30, "watch_time": 0, "reach": 7000},
    ],
}


def get_platform_data(platform: str) -> list[dict]:
    return MOCK_PLATFORM_DATA.get(platform, [])


def get_supported_platforms() -> list[str]:
    return list(MOCK_PLATFORM_DATA.keys())