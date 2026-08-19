from datetime import date
from sqlalchemy.orm import Session
from app.models.content import Content


SUPPORTED_PLATFORMS = {
    "YouTube",
    "Instagram",
    "Facebook",
    "LinkedIn",
    "TikTok",
    "X",
}


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
            "watch_time": 4200,
            "reach": 18000,
            "published_date": date(2026, 8, 1),
        },
        {
            "platform": "YouTube",
            "content_title": "FastAPI Tutorial",
            "views": 22000,
            "likes": 1700,
            "comments": 210,
            "shares": 140,
            "saves": 110,
            "watch_time": 5800,
            "reach": 26000,
            "published_date": date(2026, 8, 5),
        },
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "Python Tips",
            "views": 18000,
            "likes": 1600,
            "comments": 230,
            "shares": 280,
            "saves": 350,
            "watch_time": 3900,
            "reach": 25000,
            "published_date": date(2026, 8, 2),
        },
        {
            "platform": "Instagram",
            "content_title": "Django Tips",
            "views": 21000,
            "likes": 1900,
            "comments": 260,
            "shares": 310,
            "saves": 380,
            "watch_time": 4500,
            "reach": 29000,
            "published_date": date(2026, 8, 6),
        },
    ],

    "Facebook": [
        {
            "platform": "Facebook",
            "content_title": "Web Development Basics",
            "views": 14000,
            "likes": 850,
            "comments": 130,
            "shares": 220,
            "saves": 70,
            "watch_time": 3200,
            "reach": 20000,
            "published_date": date(2026, 8, 3),
        },
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Backend Development Career Tips",
            "views": 9000,
            "likes": 700,
            "comments": 120,
            "shares": 150,
            "saves": 90,
            "watch_time": 2800,
            "reach": 13000,
            "published_date": date(2026, 8, 4),
        },
    ],

    "TikTok": [
        {
            "platform": "TikTok",
            "content_title": "Python in 60 Seconds",
            "views": 35000,
            "likes": 3200,
            "comments": 420,
            "shares": 500,
            "saves": 260,
            "watch_time": 1800,
            "reach": 42000,
            "published_date": date(2026, 8, 7),
        },
        {
            "platform": "TikTok",
            "content_title": "FastAPI in One Minute",
            "views": 28000,
            "likes": 2500,
            "comments": 310,
            "shares": 390,
            "saves": 210,
            "watch_time": 1500,
            "reach": 34000,
            "published_date": date(2026, 8, 9),
        },
    ],

    "X": [
        {
            "platform": "X",
            "content_title": "FastAPI Development Tip",
            "views": 11000,
            "likes": 780,
            "comments": 110,
            "shares": 210,
            "saves": 70,
            "watch_time": 1600,
            "reach": 16000,
            "published_date": date(2026, 8, 8),
        },
    ],
}


connected_platforms = {}


def get_platform_data(platform: str):
    if platform not in SUPPORTED_PLATFORMS:
        return []

    return MOCK_PLATFORM_DATA.get(platform, [])


def connect_platform(
    platform: str,
    account_name: str,
):
    if platform not in SUPPORTED_PLATFORMS:
        return None

    connected_platforms[platform] = account_name

    return {
        "message": (
            f"{platform} account connected successfully"
        )
    }


def get_connected_platforms():
    return list(connected_platforms.keys())


def synchronize_platform(
    db: Session,
    platform: str,
):
    platform_data = get_platform_data(platform)

    if not platform_data:
        return None

    records_added = 0
    records_skipped = 0

    for data in platform_data:
        existing_content = (
            db.query(Content)
            .filter(
                Content.platform == data["platform"],
                Content.content_title == data["content_title"],
                Content.published_date == data["published_date"],
            )
            .first()
        )

        if existing_content:
            records_skipped += 1
            continue

        content = Content(
            creator_id=1,
            platform=data["platform"],
            content_title=data["content_title"],
            views=data["views"],
            likes=data["likes"],
            comments=data["comments"],
            shares=data["shares"],
            saves=data["saves"],
            watch_time=data["watch_time"],
            reach=data["reach"],
            published_date=data["published_date"],
        )

        db.add(content)
        records_added += 1

    db.commit()

    return {
        "platform": platform,
        "records_added": records_added,
        "records_skipped": records_skipped,
        "message": (
            f"{platform} data synchronized successfully"
        ),
    }