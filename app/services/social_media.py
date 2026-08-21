# Mock social media data for Sprint 4

MOCK_PLATFORM_DATA = {
    "YouTube": [
        {
            "platform": "YouTube",
            "content_title": "Python Tutorial",
            "views": 15000,
            "likes": 1200,
            "comments": 150,
            "shares": 100,
            "saves": 80,
            "watch_time": 5200,
            "reach": 18000
        },
        {
            "platform": "YouTube",
            "content_title": "FastAPI Beginner Guide",
            "views": 12000,
            "likes": 950,
            "comments": 120,
            "shares": 85,
            "saves": 60,
            "watch_time": 4300,
            "reach": 15000
        }
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "Python Reels",
            "views": 18000,
            "likes": 2100,
            "comments": 260,
            "shares": 180,
            "saves": 300,
            "watch_time": 3900,
            "reach": 22000
        },
        {
            "platform": "Instagram",
            "content_title": "Coding Tips",
            "views": 14000,
            "likes": 1700,
            "comments": 190,
            "shares": 140,
            "saves": 220,
            "watch_time": 3200,
            "reach": 18000
        }
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Building APIs with FastAPI",
            "views": 8500,
            "likes": 620,
            "comments": 95,
            "shares": 70,
            "saves": 45,
            "watch_time": 2800,
            "reach": 11000
        }
    ],

    "Facebook": [
        {
            "platform": "Facebook",
            "content_title": "Python Career Tips",
            "views": 10000,
            "likes": 800,
            "comments": 110,
            "shares": 90,
            "saves": 50,
            "watch_time": 3000,
            "reach": 13500
        }
    ],

    "TikTok": [
        {
            "platform": "TikTok",
            "content_title": "Learn Python in 60 Seconds",
            "views": 25000,
            "likes": 3200,
            "comments": 340,
            "shares": 420,
            "saves": 500,
            "watch_time": 4100,
            "reach": 30000
        }
    ],

    "X": [
        {
            "platform": "X",
            "content_title": "Python Development Tips",
            "views": 7000,
            "likes": 500,
            "comments": 80,
            "shares": 60,
            "saves": 30,
            "watch_time": 1800,
            "reach": 9000
        }
    ]
}


connected_platforms = {}


def connect_platform(platform: str, account_name: str):
    connected_platforms[platform] = account_name

    return {
        "platform": platform,
        "account_name": account_name,
        "message": f"{platform} account connected successfully"
    }


def get_connected_platforms():
    return list(connected_platforms.keys())


def get_platform_data(platform: str):
    return MOCK_PLATFORM_DATA.get(platform, [])