MOCK_PLATFORM_DATA = {
    "Facebook": [
        {
            "platform": "Facebook",
            "content_title": "Learn Python from Scratch",
            "views": 11000,
            "likes": 900,
            "comments": 120,
            "shares": 180,
            "saves": 60,
            "watch_time": 2500,
            "reach": 14000
        },
        {
            "platform": "Facebook",
            "content_title": "FastAPI Backend Guide",
            "views": 14500,
            "likes": 1150,
            "comments": 150,
            "shares": 220,
            "saves": 75,
            "watch_time": 3100,
            "reach": 17500
        }
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Backend Developer Roadmap",
            "views": 9000,
            "likes": 750,
            "comments": 110,
            "shares": 160,
            "saves": 50,
            "watch_time": 2100,
            "reach": 12000
        },
        {
            "platform": "LinkedIn",
            "content_title": "Python Career Guide",
            "views": 12500,
            "likes": 1100,
            "comments": 180,
            "shares": 240,
            "saves": 85,
            "watch_time": 2600,
            "reach": 16000
        }
    ],

    "TikTok": [
        {
            "platform": "TikTok",
            "content_title": "Python Coding Trick",
            "views": 22000,
            "likes": 2800,
            "comments": 320,
            "shares": 500,
            "saves": 450,
            "watch_time": 1800,
            "reach": 25000
        },
        {
            "platform": "TikTok",
            "content_title": "FastAPI Quick Tutorial",
            "views": 35000,
            "likes": 4800,
            "comments": 520,
            "shares": 750,
            "saves": 680,
            "watch_time": 2400,
            "reach": 39000
        }
    ],

    "X": [
        {
            "platform": "X",
            "content_title": "FastAPI Development Tips",
            "views": 7500,
            "likes": 600,
            "comments": 90,
            "shares": 140,
            "saves": 40,
            "watch_time": 1200,
            "reach": 9500
        },
        {
            "platform": "X",
            "content_title": "Python Backend Tips",
            "views": 9800,
            "likes": 850,
            "comments": 120,
            "shares": 190,
            "saves": 55,
            "watch_time": 1400,
            "reach": 12500
        }
    ]
}


def get_platform_data(platform: str):
    """
    Return mock/sample data for platforms
    that do not have live API integration.
    """

    return MOCK_PLATFORM_DATA.get(platform, [])