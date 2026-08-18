MOCK_PLATFORM_DATA = {
    "YouTube": [
        {
            "platform": "YouTube",
            "content_title": "Python Backend Development",
            "views": 15000,
            "likes": 1200,
            "comments": 150,
            "shares": 100,
            "saves": 80,
            "watch_time": 4500,
            "reach": 18000
        },
        {
            "platform": "YouTube",
            "content_title": "FastAPI Tutorial",
            "views": 12500,
            "likes": 1050,
            "comments": 130,
            "shares": 90,
            "saves": 70,
            "watch_time": 3800,
            "reach": 15500
        }
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "Python Programming Tips",
            "views": 18000,
            "likes": 2200,
            "comments": 280,
            "shares": 350,
            "saves": 420,
            "watch_time": 3200,
            "reach": 21000
        },
        {
            "platform": "Instagram",
            "content_title": "FastAPI Coding Tips",
            "views": 16500,
            "likes": 2050,
            "comments": 240,
            "shares": 310,
            "saves": 380,
            "watch_time": 2900,
            "reach": 19500
        }
    ],

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
        }
    ]
}


def get_platform_data(platform: str):
    """
    Simulate fetching data from a social-media platform.
    """

    return MOCK_PLATFORM_DATA.get(platform, [])
