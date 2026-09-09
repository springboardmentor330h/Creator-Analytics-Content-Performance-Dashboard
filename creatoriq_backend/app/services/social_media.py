"""Simulated social media integration service with realistic mock data and DB synchronization."""
import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.social_connection import SocialConnection
from app.models.user import User
from app.services.content_service import calculate_engagement_rate

SUPPORTED_PLATFORMS: List[str] = ["YouTube", "Instagram", "Facebook", "LinkedIn", "TikTok", "X"]

PLATFORM_ALIASES: Dict[str, str] = {
    "youtube": "YouTube",
    "instagram": "Instagram",
    "facebook": "Facebook",
    "linkedin": "LinkedIn",
    "tiktok": "TikTok",
    "x": "X",
    "twitter": "X",
}

# Realistic mock datasets per platform with deterministic external IDs
MOCK_PLATFORM_DATA: Dict[str, List[Dict[str, Any]]] = {
    "YouTube": [
        {
            "external_content_id": "yt-vid-mock-1",
            "platform": "YouTube",
            "content_title": "Python Asyncio & FastAPI Masterclass",
            "content_type": "Video",
            "views": 25000,
            "likes": 1800,
            "comments": 220,
            "shares": 140,
            "saves": 90,
            "watch_time": 45000,
            "reach": 30000,
            "published_date": "2026-08-10",
        },
        {
            "external_content_id": "yt-vid-mock-2",
            "platform": "YouTube",
            "content_title": "Building Production Dashboards with React",
            "content_type": "Video",
            "views": 18000,
            "likes": 1400,
            "comments": 180,
            "shares": 110,
            "saves": 80,
            "watch_time": 32000,
            "reach": 22000,
            "published_date": "2026-08-14",
        },
        {
            "external_content_id": "yt-vid-mock-3",
            "platform": "YouTube",
            "content_title": "Top 10 Python Clean Code Tips in 60s",
            "content_type": "Short",
            "views": 35000,
            "likes": 2900,
            "comments": 310,
            "shares": 250,
            "saves": 190,
            "watch_time": 21000,
            "reach": 40000,
            "published_date": "2026-08-17",
        },
    ],
    "Instagram": [
        {
            "external_content_id": "ig-post-mock-1",
            "platform": "Instagram",
            "content_title": "Behind the Scenes: Code, Coffee & Deployments",
            "content_type": "Reel",
            "views": 12000,
            "likes": 950,
            "comments": 120,
            "shares": 75,
            "saves": 160,
            "watch_time": 6000,
            "reach": 15000,
            "published_date": "2026-08-12",
        },
        {
            "external_content_id": "ig-post-mock-2",
            "platform": "Instagram",
            "content_title": "Clean Code Architecture Cheat Sheet",
            "content_type": "Post",
            "views": 16000,
            "likes": 1300,
            "comments": 140,
            "shares": 190,
            "saves": 320,
            "watch_time": 8000,
            "reach": 19000,
            "published_date": "2026-08-15",
        },
        {
            "external_content_id": "ig-post-mock-3",
            "platform": "Instagram",
            "content_title": "Day in the Life of a Senior Backend Engineer",
            "content_type": "Reel",
            "views": 22000,
            "likes": 1750,
            "comments": 210,
            "shares": 130,
            "saves": 210,
            "watch_time": 14000,
            "reach": 26000,
            "published_date": "2026-08-18",
        },
    ],
    "Facebook": [
        {
            "external_content_id": "fb-post-mock-1",
            "platform": "Facebook",
            "content_title": "Full-Stack Web Development Roadmap 2026",
            "content_type": "Post",
            "views": 8500,
            "likes": 620,
            "comments": 95,
            "shares": 80,
            "saves": 45,
            "watch_time": 4200,
            "reach": 11000,
            "published_date": "2026-08-11",
        },
        {
            "external_content_id": "fb-post-mock-2",
            "platform": "Facebook",
            "content_title": "Live Q&A: Full-Stack Engineering Career Growth",
            "content_type": "Live",
            "views": 14000,
            "likes": 980,
            "comments": 240,
            "shares": 110,
            "saves": 65,
            "watch_time": 18000,
            "reach": 17500,
            "published_date": "2026-08-16",
        },
    ],
    "LinkedIn": [
        {
            "external_content_id": "li-post-mock-1",
            "platform": "LinkedIn",
            "content_title": "Scaling Microservices with PostgreSQL & Redis",
            "content_type": "Article",
            "views": 19500,
            "likes": 1550,
            "comments": 230,
            "shares": 180,
            "saves": 290,
            "watch_time": 9500,
            "reach": 24000,
            "published_date": "2026-08-13",
        },
        {
            "external_content_id": "li-post-mock-2",
            "platform": "LinkedIn",
            "content_title": "5 Key Architectural Lessons from Production Outages",
            "content_type": "Post",
            "views": 23000,
            "likes": 1900,
            "comments": 280,
            "shares": 240,
            "saves": 380,
            "watch_time": 11000,
            "reach": 28500,
            "published_date": "2026-08-17",
        },
    ],
    "TikTok": [
        {
            "external_content_id": "tt-vid-mock-1",
            "platform": "TikTok",
            "content_title": "When the bug only happens in production...",
            "content_type": "Video",
            "views": 45000,
            "likes": 4200,
            "comments": 380,
            "shares": 520,
            "saves": 410,
            "watch_time": 19000,
            "reach": 52000,
            "published_date": "2026-08-09",
        },
        {
            "external_content_id": "tt-vid-mock-2",
            "platform": "TikTok",
            "content_title": "Top 3 VS Code Extensions You Should Use Today",
            "content_type": "Video",
            "views": 38000,
            "likes": 3600,
            "comments": 290,
            "shares": 430,
            "saves": 510,
            "watch_time": 16000,
            "reach": 44000,
            "published_date": "2026-08-15",
        },
    ],
    "X": [
        {
            "external_content_id": "x-post-mock-1",
            "platform": "X",
            "content_title": "Thread: Why FastAPI is taking over backend development in 2026",
            "content_type": "Post",
            "views": 28000,
            "likes": 2100,
            "comments": 310,
            "shares": 480,
            "saves": 350,
            "watch_time": 7000,
            "reach": 33000,
            "published_date": "2026-08-14",
        },
        {
            "external_content_id": "x-post-mock-2",
            "platform": "X",
            "content_title": "10 database indexing mistakes to avoid for high-scale apps",
            "content_type": "Post",
            "views": 32000,
            "likes": 2600,
            "comments": 390,
            "shares": 620,
            "saves": 490,
            "watch_time": 8500,
            "reach": 38000,
            "published_date": "2026-08-18",
        },
    ],
}


def normalize_platform_name(platform: str) -> Optional[str]:
    """Normalize input platform name to canonical supported name or None if unsupported."""
    if not platform:
        return None
    cleaned = platform.strip().lower()
    return PLATFORM_ALIASES.get(cleaned)


def get_supported_platforms() -> List[str]:
    """Return list of supported social media platforms."""
    return list(SUPPORTED_PLATFORMS)


def get_mock_platform_data(platform: str) -> List[Dict[str, Any]]:
    """Return mock content records for the given platform."""
    canonical = normalize_platform_name(platform)
    if not canonical:
        raise ValueError("Unsupported platform")
    return list(MOCK_PLATFORM_DATA.get(canonical, []))


def connect_platform(db: Session, user: User, platform: str, account_name: str) -> Dict[str, Any]:
    """Connect a social media account, persist connection state, and perform initial synchronization."""
    canonical = normalize_platform_name(platform)
    if not canonical:
        raise ValueError("Unsupported platform")

    if not account_name or not account_name.strip():
        raise ValueError("Account name is required")

    cleaned_account = account_name.strip()

    # Query existing connections matching user and platform (case-insensitive)
    existing_conns = db.query(SocialConnection).filter(
        SocialConnection.user_id == user.id,
        func.lower(SocialConnection.platform) == canonical.lower(),
    ).all()

    if len(existing_conns) > 1:
        # Deduplicate: preserve the connection with active tokens or the first one
        conn = next((c for c in existing_conns if c.access_token_encrypted or c.refresh_token_encrypted), existing_conns[0])
        for extra in existing_conns:
            if extra.id != conn.id:
                db.delete(extra)
        db.flush()
    elif len(existing_conns) == 1:
        conn = existing_conns[0]
    else:
        conn = None

    if not conn:
        conn = SocialConnection(
            user_id=user.id,
            platform=canonical,
            platform_username=cleaned_account,
            display_name=cleaned_account,
            status="connected",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(conn)
    else:
        conn.platform = canonical
        # Preserve OAuth tokens and handle if already authenticated via OAuth
        if not (conn.access_token_encrypted and canonical.lower() == "youtube"):
            conn.platform_username = cleaned_account
            conn.display_name = cleaned_account
        conn.status = "connected"
        conn.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(conn)

    return {"message": f"{canonical} account connected successfully"}


def get_connected_platforms(db: Session, user: User) -> List[str]:
    """Return list of platforms connected by the user."""
    connections = db.query(SocialConnection).filter(
        SocialConnection.user_id == user.id,
        SocialConnection.status == "connected",
    ).all()

    connected = []
    for conn in connections:
        canonical = normalize_platform_name(conn.platform)
        if canonical and canonical not in connected:
            connected.append(canonical)

    return connected


def sync_platform_data(db: Session, user: User, platform: str) -> Dict[str, Any]:
    """Synchronize social media data for a connected platform and save to PostgreSQL with duplicate handling."""
    from sqlalchemy import or_

    canonical = normalize_platform_name(platform)
    if not canonical:
        raise ValueError("Unsupported platform")

    # Check connection in DB
    conn = db.query(SocialConnection).filter(
        SocialConnection.user_id == user.id,
        func.lower(SocialConnection.platform) == canonical.lower(),
        SocialConnection.status == "connected",
    ).first()

    if not conn:
        raise ValueError("Platform is not connected")

    mock_items = get_mock_platform_data(canonical)
    synced_records_count = 0

    for idx, item in enumerate(mock_items):
        ext_id = str(item.get("external_content_id") or f"{canonical.lower()}-item-{idx + 1}")
        title = item["content_title"]
        pub_date = date.fromisoformat(item["published_date"])
        views = item.get("views", 0)
        likes = item.get("likes", 0)
        comments = item.get("comments", 0)
        shares = item.get("shares", 0)
        saves = item.get("saves", 0)
        watch_time = item.get("watch_time", 0)
        reach = item.get("reach", 0)
        content_type = item.get("content_type", "Video" if canonical == "YouTube" else "Post")

        engagement_rate = calculate_engagement_rate(likes, comments, shares, saves, reach)

        # Duplicate Handling: check creator_id + platform + external_content_id / content_id
        existing = db.query(Content).filter(
            Content.creator_id == user.id,
            func.lower(Content.platform) == canonical.lower(),
            or_(
                Content.external_content_id == ext_id,
                Content.content_id == ext_id,
            ),
        ).first()

        if existing:
            # UPDATE metrics idempotently
            existing.title = title
            existing.content_type = content_type
            existing.published_at = pub_date
            existing.views = views
            existing.likes = likes
            existing.comments = comments
            existing.shares = shares
            existing.saves = saves
            existing.watch_time = watch_time
            existing.reach = reach
            existing.engagement_rate = engagement_rate
            existing.external_content_id = ext_id
            existing.updated_at = datetime.utcnow()
        else:
            # CREATE new record
            new_content = Content(
                creator_id=user.id,
                platform=canonical,
                content_id=ext_id,
                external_content_id=ext_id,
                title=title,
                content_type=content_type,
                published_at=pub_date,
                views=views,
                likes=likes,
                comments=comments,
                shares=shares,
                saves=saves,
                watch_time=watch_time,
                reach=reach,
                engagement_rate=engagement_rate,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(new_content)

        synced_records_count += 1

    conn.last_synced_at = datetime.utcnow()
    conn.updated_at = datetime.utcnow()
    db.commit()

    return {
        "message": f"{canonical} data synchronized successfully",
        "platform": canonical,
        "status": "success",
        "account": conn.display_name or conn.platform_username or (user.full_name or "Creator Account"),
        "records_synced": synced_records_count,
        "last_synced_at": conn.last_synced_at.isoformat() if conn.last_synced_at else datetime.utcnow().isoformat(),
    }

