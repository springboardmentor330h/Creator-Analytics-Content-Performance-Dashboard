from datetime import date
from sqlalchemy.orm import Session

from app.models.content import Content


MOCK_DATA = {
    "YouTube": [
        {
            "platform": "YouTube",
            "content_title": "Python Tutorial",
            "views": 15000,
            "likes": 1200,
            "comments": 150,
            "shares": 100,
            "saves": 50,
            "watch_time": 3500,
            "reach": 18000,
            "published_date": "2026-08-20"
        },
        {
            "platform": "YouTube",
            "content_title": "FastAPI Tutorial",
            "views": 12000,
            "likes": 900,
            "comments": 120,
            "shares": 80,
            "saves": 40,
            "watch_time": 3000,
            "reach": 15000,
            "published_date": "2026-08-21"
        }
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "AI Project",
            "views": 10000,
            "likes": 1500,
            "comments": 200,
            "shares": 120,
            "saves": 300,
            "watch_time": 1800,
            "reach": 14000,
            "published_date": "2026-08-22"
        },
        {
            "platform": "Instagram",
            "content_title": "Machine Learning Tips",
            "views": 8500,
            "likes": 1100,
            "comments": 150,
            "shares": 90,
            "saves": 200,
            "watch_time": 1500,
            "reach": 12000,
            "published_date": "2026-08-23"
        }
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Career Tips",
            "views": 7000,
            "likes": 600,
            "comments": 100,
            "shares": 80,
            "saves": 50,
            "watch_time": 1000,
            "reach": 9000,
            "published_date": "2026-08-24"
        }
    ]
}


def get_platform_data(platform: str):
    return MOCK_DATA.get(platform, [])


def get_available_platforms():
    return list(MOCK_DATA.keys())


def sync_platform_data(db: Session, platform: str):
    platform_data = get_platform_data(platform)

    if not platform_data:
        return None

    synced_records = []

    for data in platform_data:

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
            published_date=date.fromisoformat(
                data["published_date"]
            )
        )

        db.add(content)

        synced_records.append(
            data["content_title"]
        )

    db.commit()

    return synced_records