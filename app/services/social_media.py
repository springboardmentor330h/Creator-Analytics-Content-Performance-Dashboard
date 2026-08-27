# app/services/social_media.py

# =========================================================
# SPRINT 4 - TASK 5
# SOCIAL MEDIA SERVICE
# =========================================================

MOCK_PLATFORM_DATA = {
    "YouTube": [
        {
            "platform": "YouTube",
            "content_title": "Python Tutorial",
            "views": 15000,
            "likes": 1200,
            "comments": 150,
            "shares": 100,
            "reach": 18000
        },
        {
            "platform": "YouTube",
            "content_title": "FastAPI Tutorial",
            "views": 12000,
            "likes": 950,
            "comments": 120,
            "shares": 80,
            "reach": 15000
        }
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "AI Tips",
            "views": 10000,
            "likes": 1800,
            "comments": 220,
            "shares": 150,
            "reach": 14000
        },
        {
            "platform": "Instagram",
            "content_title": "Machine Learning Basics",
            "views": 8500,
            "likes": 1400,
            "comments": 180,
            "shares": 120,
            "reach": 11000
        }
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Data Science Career Tips",
            "views": 7000,
            "likes": 600,
            "comments": 90,
            "shares": 75,
            "reach": 9000
        }
    ],

    "Facebook": [
        {
            "platform": "Facebook",
            "content_title": "Technology Trends",
            "views": 9000,
            "likes": 800,
            "comments": 100,
            "shares": 90,
            "reach": 12000
        }
    ],

    "TikTok": [
        {
            "platform": "TikTok",
            "content_title": "Coding Short",
            "views": 20000,
            "likes": 2500,
            "comments": 300,
            "shares": 200,
            "reach": 24000
        }
    ],

    "X": [
        {
            "platform": "X",
            "content_title": "AI News Update",
            "views": 5000,
            "likes": 400,
            "comments": 60,
            "shares": 50,
            "reach": 6500
        }
    ]
}


def get_platform_data(platform: str):
    """
    Return mock analytics data for the selected platform.
    """

    return MOCK_PLATFORM_DATA.get(platform, [])


def get_available_platforms():
    """
    Return all supported social-media platforms.
    """

    return list(MOCK_PLATFORM_DATA.keys())