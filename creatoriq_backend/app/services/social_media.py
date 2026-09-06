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


# ---------------------------------------------------------
# Manual/sample datasets
# ---------------------------------------------------------
# These datasets are intentionally stored through the same
# Content model used by the real YouTube integration.
#
# YouTube can use the live YouTube API.
# Other platforms can use this normalized sample/manual data
# when API access is unavailable.
# ---------------------------------------------------------

SAMPLE_PLATFORM_DATA = {
    "Instagram": [
        {
            "external_content_id": "instagram-1-001",
            "content_title": "How I Built My First API",
            "views": 18500,
            "likes": 1420,
            "comments": 96,
            "shares": 180,
            "saves": 310,
            "watch_time": 6200,
            "reach": 22100,
            "published_date": date(2026, 8, 1),
        },
        {
            "external_content_id": "instagram-1-002",
            "content_title": "Python Tips Every Developer Should Know",
            "views": 26400,
            "likes": 2180,
            "comments": 143,
            "shares": 290,
            "saves": 510,
            "watch_time": 8900,
            "reach": 30200,
            "published_date": date(2026, 8, 5),
        },
        {
            "external_content_id": "instagram-1-003",
            "content_title": "FastAPI in 60 Seconds",
            "views": 31900,
            "likes": 2840,
            "comments": 187,
            "shares": 410,
            "saves": 620,
            "watch_time": 10800,
            "reach": 36500,
            "published_date": date(2026, 8, 10),
        },
        {
            "external_content_id": "instagram-1-004",
            "content_title": "3 Backend Mistakes Beginners Make",
            "views": 22800,
            "likes": 1760,
            "comments": 121,
            "shares": 245,
            "saves": 430,
            "watch_time": 7600,
            "reach": 27100,
            "published_date": date(2026, 8, 15),
        },
        {
            "external_content_id": "instagram-1-005",
            "content_title": "REST API vs GraphQL",
            "views": 35100,
            "likes": 3010,
            "comments": 205,
            "shares": 470,
            "saves": 710,
            "watch_time": 11900,
            "reach": 39800,
            "published_date": date(2026, 8, 20),
        },
    ],
    "TikTok": [
        {
            "external_content_id": "tiktok-1-001",
            "content_title": "Python in 60 Seconds",
            "views": 35000,
            "likes": 2800,
            "comments": 360,
            "shares": 520,
            "saves": 300,
            "watch_time": 9100,
            "reach": 42000,
            "published_date": date(2026, 8, 2),
        },
        {
            "external_content_id": "tiktok-1-002",
            "content_title": "FastAPI in One Minute",
            "views": 39000,
            "likes": 3200,
            "comments": 420,
            "shares": 610,
            "saves": 380,
            "watch_time": 10200,
            "reach": 46500,
            "published_date": date(2026, 8, 7),
        },
        {
            "external_content_id": "tiktok-1-003",
            "content_title": "SQL Tips for Beginners",
            "views": 28500,
            "likes": 2310,
            "comments": 280,
            "shares": 430,
            "saves": 340,
            "watch_time": 7400,
            "reach": 33700,
            "published_date": date(2026, 8, 12),
        },
        {
            "external_content_id": "tiktok-1-004",
            "content_title": "Build a REST API",
            "views": 44200,
            "likes": 3900,
            "comments": 510,
            "shares": 720,
            "saves": 460,
            "watch_time": 12100,
            "reach": 51800,
            "published_date": date(2026, 8, 17),
        },
        {
            "external_content_id": "tiktok-1-005",
            "content_title": "Developer Productivity Hacks",
            "views": 31800,
            "likes": 2670,
            "comments": 310,
            "shares": 480,
            "saves": 350,
            "watch_time": 8300,
            "reach": 37400,
            "published_date": date(2026, 8, 22),
        },
    ],
    "Facebook": [
        {
            "external_content_id": "facebook-1-001",
            "content_title": "Introduction to Python",
            "views": 11200,
            "likes": 820,
            "comments": 74,
            "shares": 130,
            "saves": 90,
            "watch_time": 4200,
            "reach": 14100,
            "published_date": date(2026, 8, 3),
        },
        {
            "external_content_id": "facebook-1-002",
            "content_title": "Understanding APIs",
            "views": 16800,
            "likes": 1210,
            "comments": 98,
            "shares": 210,
            "saves": 140,
            "watch_time": 5800,
            "reach": 20100,
            "published_date": date(2026, 8, 8),
        },
        {
            "external_content_id": "facebook-1-003",
            "content_title": "FastAPI Beginner Guide",
            "views": 19400,
            "likes": 1480,
            "comments": 126,
            "shares": 260,
            "saves": 170,
            "watch_time": 6400,
            "reach": 22700,
            "published_date": date(2026, 8, 13),
        },
        {
            "external_content_id": "facebook-1-004",
            "content_title": "SQL Explained Simply",
            "views": 15300,
            "likes": 1090,
            "comments": 87,
            "shares": 180,
            "saves": 120,
            "watch_time": 5100,
            "reach": 18400,
            "published_date": date(2026, 8, 18),
        },
        {
            "external_content_id": "facebook-1-005",
            "content_title": "Backend Development Roadmap",
            "views": 22100,
            "likes": 1740,
            "comments": 139,
            "shares": 310,
            "saves": 210,
            "watch_time": 7200,
            "reach": 25800,
            "published_date": date(2026, 8, 23),
        },
    ],
    "LinkedIn": [
        {
            "external_content_id": "linkedin-1-001",
            "content_title": "My Journey Into Backend Development",
            "views": 9800,
            "likes": 640,
            "comments": 82,
            "shares": 95,
            "saves": 120,
            "watch_time": 3200,
            "reach": 12400,
            "published_date": date(2026, 8, 4),
        },
        {
            "external_content_id": "linkedin-1-002",
            "content_title": "What I Learned Building a FastAPI Project",
            "views": 13100,
            "likes": 890,
            "comments": 116,
            "shares": 145,
            "saves": 148,
            "watch_time": 4900,
            "reach": 16900,
            "published_date": date(2026, 8, 9),
        },
        {
            "external_content_id": "linkedin-1-003",
            "content_title": "Why Data Analytics Matters for Creators",
            "views": 15700,
            "likes": 1080,
            "comments": 137,
            "shares": 190,
            "saves": 205,
            "watch_time": 5300,
            "reach": 19200,
            "published_date": date(2026, 8, 14),
        },
        {
            "external_content_id": "linkedin-1-004",
            "content_title": "Building APIs With Python",
            "views": 11900,
            "likes": 760,
            "comments": 91,
            "shares": 110,
            "saves": 132,
            "watch_time": 4100,
            "reach": 14600,
            "published_date": date(2026, 8, 19),
        },
        {
            "external_content_id": "linkedin-1-005",
            "content_title": "Lessons From My Internship Project",
            "views": 17600,
            "likes": 1260,
            "comments": 154,
            "shares": 220,
            "saves": 240,
            "watch_time": 5900,
            "reach": 21400,
            "published_date": date(2026, 8, 24),
        },
    ],
    "X": [
        {
            "external_content_id": "x-1-001",
            "content_title": "Python Tip of the Day",
            "views": 7400,
            "likes": 420,
            "comments": 52,
            "shares": 88,
            "saves": 0,
            "watch_time": 1800,
            "reach": 9100,
            "published_date": date(2026, 8, 5),
        },
        {
            "external_content_id": "x-1-002",
            "content_title": "FastAPI Development Tip",
            "views": 11200,
            "likes": 760,
            "comments": 83,
            "shares": 145,
            "saves": 0,
            "watch_time": 2600,
            "reach": 13800,
            "published_date": date(2026, 8, 10),
        },
        {
            "external_content_id": "x-1-003",
            "content_title": "SQL Query Every Developer Should Know",
            "views": 8900,
            "likes": 590,
            "comments": 61,
            "shares": 110,
            "saves": 0,
            "watch_time": 2200,
            "reach": 10800,
            "published_date": date(2026, 8, 15),
        },
        {
            "external_content_id": "x-1-004",
            "content_title": "Building My Creator Analytics Dashboard",
            "views": 14600,
            "likes": 1010,
            "comments": 94,
            "shares": 180,
            "saves": 0,
            "watch_time": 3400,
            "reach": 17400,
            "published_date": date(2026, 8, 20),
        },
        {
            "external_content_id": "x-1-005",
            "content_title": "What Makes a Good API?",
            "views": 12100,
            "likes": 830,
            "comments": 76,
            "shares": 152,
            "saves": 0,
            "watch_time": 2900,
            "reach": 14900,
            "published_date": date(2026, 8, 25),
        },
    ],
}


# ---------------------------------------------------------
# Platform validation
# ---------------------------------------------------------

def validate_platform(platform: str) -> str:
    if not platform:
        raise ValueError("Platform is required")

    normalized_platform = platform.strip()

    if normalized_platform not in SUPPORTED_PLATFORMS:
        raise ValueError(
            f"Unsupported platform: {normalized_platform}. "
            f"Supported platforms: {sorted(SUPPORTED_PLATFORMS)}"
        )

    return normalized_platform


# ---------------------------------------------------------
# Connected platform management
# ---------------------------------------------------------

connected_platforms = {}


def connect_platform(
    platform: str,
    account_name: str,
):
    platform = validate_platform(platform)

    if not account_name or not account_name.strip():
        raise ValueError("Account name is required")

    connected_platforms[platform] = account_name.strip()

    return {
        "platform": platform,
        "account_name": account_name.strip(),
        "status": "connected",
    }


def get_connected_platforms():
    return connected_platforms


# ---------------------------------------------------------
# Data normalization
# ---------------------------------------------------------

def normalize_content_record(
    record: dict,
    creator_id: int,
    platform: str,
) -> dict:
    platform = validate_platform(platform)

    if not creator_id or creator_id < 1:
        raise ValueError("creator_id must be a positive integer")

    required_fields = [
        "external_content_id",
        "content_title",
        "published_date",
    ]

    for field in required_fields:
        if not record.get(field):
            raise ValueError(
                f"Content record is missing required field: {field}"
            )

    return {
        "creator_id": creator_id,
        "platform": platform,
        "external_content_id": str(record["external_content_id"]),
        "content_title": str(record["content_title"]),
        "views": max(0, int(record.get("views", 0))),
        "likes": max(0, int(record.get("likes", 0))),
        "comments": max(0, int(record.get("comments", 0))),
        "shares": max(0, int(record.get("shares", 0))),
        "saves": max(0, int(record.get("saves", 0))),
        "watch_time": max(0, int(record.get("watch_time", 0))),
        "reach": max(0, int(record.get("reach", 0))),
        "published_date": record["published_date"],
    }


# ---------------------------------------------------------
# Sample/manual data provider
# ---------------------------------------------------------

def get_sample_platform_data(
    platform: str,
    creator_id: int,
) -> list[dict]:
    platform = validate_platform(platform)

    if creator_id < 1:
        raise ValueError("creator_id must be a positive integer")

    platform_data = SAMPLE_PLATFORM_DATA.get(platform, [])

    normalized_records = []

    for record in platform_data:
        normalized = normalize_content_record(
            record=record,
            creator_id=creator_id,
            platform=platform,
        )

        # Make external IDs creator-specific.
        # This prevents collisions when the same sample dataset
        # is synchronized for another creator.
        normalized["external_content_id"] = (
            f"{platform.lower()}-{creator_id}-"
            f"{record['external_content_id'].split('-')[-1]}"
        )

        normalized_records.append(normalized)

    return normalized_records


# ---------------------------------------------------------
# Synchronization
# ---------------------------------------------------------

def synchronize_platform(
    db: Session,
    platform: str,
    creator_id: int,
):
    """
    Synchronize platform content into the PostgreSQL content table.

    The creator_id is explicitly required so that data is not
    accidentally assigned to creator 1.
    """

    platform = validate_platform(platform)

    if not creator_id or creator_id < 1:
        raise ValueError("creator_id must be a positive integer")

    records = get_sample_platform_data(
        platform=platform,
        creator_id=creator_id,
    )

    records_created = 0
    records_updated = 0

    try:
        for record in records:
            existing_content = (
                db.query(Content)
                .filter(
                    Content.creator_id == creator_id,
                    Content.platform == platform,
                    Content.external_content_id
                    == record["external_content_id"],
                )
                .first()
            )

            if existing_content:
                existing_content.content_title = record["content_title"]
                existing_content.views = record["views"]
                existing_content.likes = record["likes"]
                existing_content.comments = record["comments"]
                existing_content.shares = record["shares"]
                existing_content.saves = record["saves"]
                existing_content.watch_time = record["watch_time"]
                existing_content.reach = record["reach"]
                existing_content.published_date = record["published_date"]

                records_updated += 1

            else:
                new_content = Content(
                    creator_id=record["creator_id"],
                    platform=record["platform"],
                    external_content_id=record["external_content_id"],
                    content_title=record["content_title"],
                    views=record["views"],
                    likes=record["likes"],
                    comments=record["comments"],
                    shares=record["shares"],
                    saves=record["saves"],
                    watch_time=record["watch_time"],
                    reach=record["reach"],
                    published_date=record["published_date"],
                )

                db.add(new_content)
                records_created += 1

        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "platform": platform,
        "creator_id": creator_id,
        "status": "success",
        "records_synced": records_created + records_updated,
        "records_created": records_created,
        "records_updated": records_updated,
    }