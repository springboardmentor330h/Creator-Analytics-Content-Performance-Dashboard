from datetime import date


# ============================================================
# CONNECTED PLATFORMS
# ============================================================

connected_platforms = []


# ============================================================
# MOCK SOCIAL MEDIA DATA
# ============================================================

MOCK_PLATFORM_DATA = {

    "YouTube": {

        "creator_id": 1,

        "platform": "YouTube",

        "content_title": "Python Tutorial for Beginners",

        "views": 15000,

        "likes": 1200,

        "comments": 150,

        "shares": 100,

        "saves": 80,

        "watch_time": 54000,

        "reach": 18000,

        "published_date": date.today()
    },


    "Instagram": {

        "creator_id": 2,

        "platform": "Instagram",

        "content_title": "Daily Coding Tips",

        "views": 12000,

        "likes": 1100,

        "comments": 180,

        "shares": 220,

        "saves": 300,

        "watch_time": 24000,

        "reach": 16000,

        "published_date": date.today()
    },


    "Facebook": {

        "creator_id": 3,

        "platform": "Facebook",

        "content_title": "Technology Trends 2026",

        "views": 10000,

        "likes": 850,

        "comments": 120,

        "shares": 180,

        "saves": 90,

        "watch_time": 18000,

        "reach": 14000,

        "published_date": date.today()
    },


    "LinkedIn": {

        "creator_id": 4,

        "platform": "LinkedIn",

        "content_title": "Career Growth Tips",

        "views": 8000,

        "likes": 650,

        "comments": 95,

        "shares": 70,

        "saves": 110,

        "watch_time": 12000,

        "reach": 10000,

        "published_date": date.today()
    },


    "TikTok": {

        "creator_id": 5,

        "platform": "TikTok",

        "content_title": "Quick Python Trick",

        "views": 25000,

        "likes": 2500,

        "comments": 350,

        "shares": 400,

        "saves": 500,

        "watch_time": 36000,

        "reach": 30000,

        "published_date": date.today()
    },


    "X": {

        "creator_id": 6,

        "platform": "X",

        "content_title": "AI Development Update",

        "views": 9000,

        "likes": 700,

        "comments": 140,

        "shares": 250,

        "saves": 60,

        "watch_time": 10000,

        "reach": 13000,

        "published_date": date.today()
    }
}


# ============================================================
# CONNECT PLATFORM
# ============================================================

def connect_platform(
    platform: str,
    account_name: str
):

    if platform not in MOCK_PLATFORM_DATA:

        return None

    connection = {

        "platform": platform,

        "account_name": account_name
    }

    # Avoid duplicate platform connections
    if platform not in connected_platforms:

        connected_platforms.append(
            platform
        )

    return connection


# ============================================================
# GET CONNECTED PLATFORMS
# ============================================================

def get_connected_platforms():

    return {

        "platforms": connected_platforms
    }


# ============================================================
# GET MOCK DATA
# ============================================================

def get_platform_data(
    platform: str
):

    return MOCK_PLATFORM_DATA.get(
        platform
    )