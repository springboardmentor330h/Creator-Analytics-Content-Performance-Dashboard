"""Seed realistic multi-platform content data into PostgreSQL for CreatorIQ.

Ensures 12+ records each for YouTube, Instagram, Facebook, and LinkedIn (48+ records total)
with realistic metrics, historical dates, and duplicate prevention via platform + external_content_id.
"""
from datetime import date, datetime
from typing import Any, Dict, List
from sqlalchemy import select, func, or_

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.content import Content
from app.models.growth import Growth
from app.models.social_connection import SocialConnection
from app.models.user import User
from app.services.content_service import calculate_engagement_rate

# Realistic Multi-Platform Content Data (12 per platform = 48 items)
DATA_YOUTUBE: List[Dict[str, Any]] = [
    {
        "external_content_id": "YT101",
        "title": "FastAPI & Python Microservices: Complete Architectural Guide",
        "content_type": "Video",
        "published_at": date(2026, 5, 2),
        "views": 62000,
        "likes": 5400,
        "comments": 480,
        "shares": 320,
        "saves": 980,
        "watch_time": 185000,
        "reach": 58000,
    },
    {
        "external_content_id": "YT102",
        "title": "Building Real-Time Dashboards with React 19 & Tailwind",
        "content_type": "Video",
        "published_at": date(2026, 5, 10),
        "views": 48500,
        "likes": 3900,
        "comments": 340,
        "shares": 250,
        "saves": 720,
        "watch_time": 142000,
        "reach": 45000,
    },
    {
        "external_content_id": "YT103",
        "title": "5 Git Commands Every Senior Software Engineer Should Know",
        "content_type": "Short",
        "published_at": date(2026, 5, 18),
        "views": 38000,
        "likes": 3600,
        "comments": 290,
        "shares": 410,
        "saves": 580,
        "watch_time": 32000,
        "reach": 36000,
    },
    {
        "external_content_id": "YT104",
        "title": "PostgreSQL Performance Optimization: Indexing & Query Tuning",
        "content_type": "Video",
        "published_at": date(2026, 5, 26),
        "views": 54000,
        "likes": 4600,
        "comments": 410,
        "shares": 310,
        "saves": 1150,
        "watch_time": 168000,
        "reach": 51000,
    },
    {
        "external_content_id": "YT105",
        "title": "Why Docker Compose is All You Need for Early-Stage Startups",
        "content_type": "Video",
        "published_at": date(2026, 6, 4),
        "views": 29500,
        "likes": 2200,
        "comments": 190,
        "shares": 140,
        "saves": 460,
        "watch_time": 89000,
        "reach": 28000,
    },
    {
        "external_content_id": "YT106",
        "title": "Top 3 VS Code Themes for Better Focus in 2026",
        "content_type": "Short",
        "published_at": date(2026, 6, 12),
        "views": 44000,
        "likes": 4100,
        "comments": 330,
        "shares": 480,
        "saves": 670,
        "watch_time": 39000,
        "reach": 42000,
    },
    {
        "external_content_id": "YT107",
        "title": "System Design Interview: Designing High-Throughput Analytics",
        "content_type": "Video",
        "published_at": date(2026, 6, 21),
        "views": 71000,
        "likes": 6800,
        "comments": 620,
        "shares": 520,
        "saves": 1420,
        "watch_time": 225000,
        "reach": 66000,
    },
    {
        "external_content_id": "YT108",
        "title": "Modern Frontend State Management Without Redux Boilerplate",
        "content_type": "Video",
        "published_at": date(2026, 7, 2),
        "views": 22000,
        "likes": 1650,
        "comments": 140,
        "shares": 95,
        "saves": 380,
        "watch_time": 68000,
        "reach": 21000,
    },
    {
        "external_content_id": "YT109",
        "title": "Never write raw SQL string concatenations like this!",
        "content_type": "Short",
        "published_at": date(2026, 7, 11),
        "views": 33500,
        "likes": 2800,
        "comments": 210,
        "shares": 290,
        "saves": 490,
        "watch_time": 28000,
        "reach": 31000,
    },
    {
        "external_content_id": "YT110",
        "title": "Authentication in 2026: OAuth 2.1, JWT & Secure Cookies",
        "content_type": "Video",
        "published_at": date(2026, 7, 23),
        "views": 46000,
        "likes": 3750,
        "comments": 315,
        "shares": 225,
        "saves": 830,
        "watch_time": 139000,
        "reach": 43000,
    },
    {
        "external_content_id": "YT111",
        "title": "Building Resilient Background Queues with Celery and Redis",
        "content_type": "Video",
        "published_at": date(2026, 8, 4),
        "views": 18200,
        "likes": 1380,
        "comments": 115,
        "shares": 80,
        "saves": 310,
        "watch_time": 56000,
        "reach": 17500,
    },
    {
        "external_content_id": "YT112",
        "title": "The Clean Architecture Paradigm in Modern Python",
        "content_type": "Video",
        "published_at": date(2026, 8, 16),
        "views": 39500,
        "likes": 3200,
        "comments": 270,
        "shares": 190,
        "saves": 660,
        "watch_time": 118000,
        "reach": 37000,
    },
]

DATA_INSTAGRAM: List[Dict[str, Any]] = [
    {
        "external_content_id": "IG101",
        "title": "Behind the Scenes: High-Performance Server Rack Setup",
        "content_type": "Reel",
        "published_at": date(2026, 5, 4),
        "views": 28500,
        "likes": 2950,
        "comments": 240,
        "shares": 380,
        "saves": 450,
        "watch_time": 19500,
        "reach": 26000,
    },
    {
        "external_content_id": "IG102",
        "title": "Clean Code vs Dirty Code: 5 Visual Comparisons",
        "content_type": "Post",
        "published_at": date(2026, 5, 12),
        "views": 36000,
        "likes": 4200,
        "comments": 380,
        "shares": 590,
        "saves": 1120,
        "watch_time": 12000,
        "reach": 33000,
    },
    {
        "external_content_id": "IG103",
        "title": "Minimalist Home Office Workspace Tour for Developers",
        "content_type": "Reel",
        "published_at": date(2026, 5, 20),
        "views": 49000,
        "likes": 5600,
        "comments": 490,
        "shares": 720,
        "saves": 830,
        "watch_time": 31000,
        "reach": 44000,
    },
    {
        "external_content_id": "IG104",
        "title": "Interactive Infographic: REST vs GraphQL vs gRPC",
        "content_type": "Post",
        "published_at": date(2026, 5, 29),
        "views": 24000,
        "likes": 2650,
        "comments": 210,
        "shares": 340,
        "saves": 690,
        "watch_time": 9500,
        "reach": 22000,
    },
    {
        "external_content_id": "IG105",
        "title": "How I debug production issues at 2 AM without panicking",
        "content_type": "Reel",
        "published_at": date(2026, 6, 8),
        "views": 52000,
        "likes": 5900,
        "comments": 530,
        "shares": 810,
        "saves": 940,
        "watch_time": 34000,
        "reach": 47000,
    },
    {
        "external_content_id": "IG106",
        "title": "SQL Join Visual Cheat Sheet (Save This!)",
        "content_type": "Post",
        "published_at": date(2026, 6, 17),
        "views": 41000,
        "likes": 4800,
        "comments": 420,
        "shares": 670,
        "saves": 1350,
        "watch_time": 14000,
        "reach": 37500,
    },
    {
        "external_content_id": "IG107",
        "title": "Day in the Life: Staff Software Engineer in Tech",
        "content_type": "Reel",
        "published_at": date(2026, 6, 27),
        "views": 33000,
        "likes": 3450,
        "comments": 290,
        "shares": 410,
        "saves": 520,
        "watch_time": 21000,
        "reach": 30000,
    },
    {
        "external_content_id": "IG108",
        "title": "Docker in 6 Slides: Concepts Explained Simply",
        "content_type": "Post",
        "published_at": date(2026, 7, 6),
        "views": 27500,
        "likes": 2900,
        "comments": 230,
        "shares": 390,
        "saves": 780,
        "watch_time": 11000,
        "reach": 25000,
    },
    {
        "external_content_id": "IG109",
        "title": "The Mechanical Keyboard Setup You Didn't Know You Needed",
        "content_type": "Reel",
        "published_at": date(2026, 7, 16),
        "views": 61000,
        "likes": 6900,
        "comments": 580,
        "shares": 930,
        "saves": 1100,
        "watch_time": 38000,
        "reach": 54000,
    },
    {
        "external_content_id": "IG110",
        "title": "Architecture Blueprint: Real-time Creator Analytics Platform",
        "content_type": "Post",
        "published_at": date(2026, 7, 28),
        "views": 21000,
        "likes": 2150,
        "comments": 175,
        "shares": 270,
        "saves": 560,
        "watch_time": 8500,
        "reach": 19500,
    },
    {
        "external_content_id": "IG111",
        "title": "When the junior developer pushes straight to main branch",
        "content_type": "Reel",
        "published_at": date(2026, 8, 8),
        "views": 74000,
        "likes": 8600,
        "comments": 740,
        "shares": 1250,
        "saves": 1400,
        "watch_time": 46000,
        "reach": 66000,
    },
    {
        "external_content_id": "IG112",
        "title": "Top 5 Developer Books That Transformed My Career",
        "content_type": "Post",
        "published_at": date(2026, 8, 19),
        "views": 18500,
        "likes": 1850,
        "comments": 150,
        "shares": 210,
        "saves": 480,
        "watch_time": 7200,
        "reach": 17000,
    },
]

DATA_FACEBOOK: List[Dict[str, Any]] = [
    {
        "external_content_id": "FB101",
        "title": "Full-Stack Web Development: The 2026 Roadmap for Beginners",
        "content_type": "Post",
        "published_at": date(2026, 5, 6),
        "views": 18500,
        "likes": 1450,
        "comments": 185,
        "shares": 160,
        "saves": 190,
        "watch_time": 8200,
        "reach": 16800,
    },
    {
        "external_content_id": "FB102",
        "title": "Live Interactive Q&A: Career Growth & Transition to Tech",
        "content_type": "Live",
        "published_at": date(2026, 5, 15),
        "views": 32000,
        "likes": 2600,
        "comments": 410,
        "shares": 280,
        "saves": 310,
        "watch_time": 48000,
        "reach": 29000,
    },
    {
        "external_content_id": "FB103",
        "title": "Community Discussion: Are AI Coding Assistants Helping or Hurting?",
        "content_type": "Post",
        "published_at": date(2026, 5, 24),
        "views": 22500,
        "likes": 1850,
        "comments": 390,
        "shares": 220,
        "saves": 140,
        "watch_time": 9500,
        "reach": 20500,
    },
    {
        "external_content_id": "FB104",
        "title": "Step-by-Step Guide: Deploying Applications to Cloud Virtual Servers",
        "content_type": "Post",
        "published_at": date(2026, 6, 2),
        "views": 14000,
        "likes": 1100,
        "comments": 125,
        "shares": 115,
        "saves": 180,
        "watch_time": 6400,
        "reach": 12800,
    },
    {
        "external_content_id": "FB105",
        "title": "Live Coding Session: Building an API with FastAPI and PostgreSQL",
        "content_type": "Live",
        "published_at": date(2026, 6, 14),
        "views": 28000,
        "likes": 2250,
        "comments": 330,
        "shares": 240,
        "saves": 290,
        "watch_time": 42000,
        "reach": 25500,
    },
    {
        "external_content_id": "FB106",
        "title": "Top Open Source Tools Every Developer Group Should Know",
        "content_type": "Post",
        "published_at": date(2026, 6, 25),
        "views": 16500,
        "likes": 1320,
        "comments": 145,
        "shares": 150,
        "saves": 210,
        "watch_time": 7100,
        "reach": 15000,
    },
    {
        "external_content_id": "FB107",
        "title": "How to Protect Your Web App Against Modern Cybersecurity Threats",
        "content_type": "Post",
        "published_at": date(2026, 7, 5),
        "views": 25000,
        "likes": 2050,
        "comments": 260,
        "shares": 210,
        "saves": 340,
        "watch_time": 11000,
        "reach": 23000,
    },
    {
        "external_content_id": "FB108",
        "title": "Live Workshop: Masterclass on Modern React Hooks and Patterns",
        "content_type": "Live",
        "published_at": date(2026, 7, 18),
        "views": 35000,
        "likes": 2950,
        "comments": 440,
        "shares": 310,
        "saves": 410,
        "watch_time": 54000,
        "reach": 31500,
    },
    {
        "external_content_id": "FB109",
        "title": "Creator Milestone: Celebrating 50k Developers in Our Community!",
        "content_type": "Post",
        "published_at": date(2026, 7, 30),
        "views": 41000,
        "likes": 3800,
        "comments": 520,
        "shares": 390,
        "saves": 260,
        "watch_time": 14500,
        "reach": 37000,
    },
    {
        "external_content_id": "FB110",
        "title": "Database Schema Design Tips for High-Traffic Applications",
        "content_type": "Post",
        "published_at": date(2026, 8, 9),
        "views": 19500,
        "likes": 1550,
        "comments": 170,
        "shares": 165,
        "saves": 280,
        "watch_time": 8800,
        "reach": 17800,
    },
    {
        "external_content_id": "FB111",
        "title": "Live Stream: Code Reviews for Community Submissions",
        "content_type": "Live",
        "published_at": date(2026, 8, 17),
        "views": 27000,
        "likes": 2150,
        "comments": 310,
        "shares": 230,
        "saves": 250,
        "watch_time": 39000,
        "reach": 24500,
    },
    {
        "external_content_id": "FB112",
        "title": "The Evolution of Frontend Web Development: 2016 vs 2026",
        "content_type": "Post",
        "published_at": date(2026, 8, 26),
        "views": 31000,
        "likes": 2600,
        "comments": 380,
        "shares": 290,
        "saves": 350,
        "watch_time": 13000,
        "reach": 28000,
    },
]

DATA_LINKEDIN: List[Dict[str, Any]] = [
    {
        "external_content_id": "LI101",
        "title": "Scaling Distributed Architecture: 5 Lessons from 100M Daily Requests",
        "content_type": "Article",
        "published_at": date(2026, 5, 5),
        "views": 26000,
        "likes": 2100,
        "comments": 280,
        "shares": 240,
        "saves": 410,
        "watch_time": 14000,
        "reach": 24500,
    },
    {
        "external_content_id": "LI102",
        "title": "Why Senior Engineers Spend More Time Reading Code Than Writing It",
        "content_type": "Post",
        "published_at": date(2026, 5, 14),
        "views": 34000,
        "likes": 2900,
        "comments": 390,
        "shares": 380,
        "saves": 530,
        "watch_time": 11500,
        "reach": 31000,
    },
    {
        "external_content_id": "LI103",
        "title": "The True Cost of Premature Optimization in Software Systems",
        "content_type": "Article",
        "published_at": date(2026, 5, 22),
        "views": 19500,
        "likes": 1600,
        "comments": 195,
        "shares": 170,
        "saves": 320,
        "watch_time": 9800,
        "reach": 18000,
    },
    {
        "external_content_id": "LI104",
        "title": "Engineering Leadership: How to Run Effective Blameless Post-Mortems",
        "content_type": "Post",
        "published_at": date(2026, 6, 1),
        "views": 38000,
        "likes": 3300,
        "comments": 440,
        "shares": 420,
        "saves": 670,
        "watch_time": 13200,
        "reach": 35000,
    },
    {
        "external_content_id": "LI105",
        "title": "Database Architecture Patterns for High-Availability Microservices",
        "content_type": "Article",
        "published_at": date(2026, 6, 11),
        "views": 44000,
        "likes": 3900,
        "comments": 490,
        "shares": 490,
        "saves": 820,
        "watch_time": 21000,
        "reach": 41000,
    },
    {
        "external_content_id": "LI106",
        "title": "Hiring Top 1% Engineers: Technical Evaluation Beyond LeetCode",
        "content_type": "Post",
        "published_at": date(2026, 6, 22),
        "views": 49000,
        "likes": 4400,
        "comments": 610,
        "shares": 560,
        "saves": 750,
        "watch_time": 16000,
        "reach": 45000,
    },
    {
        "external_content_id": "LI107",
        "title": "Deep Dive: PostgreSQL Concurrency, Isolation Levels & MVCC",
        "content_type": "Article",
        "published_at": date(2026, 7, 3),
        "views": 29000,
        "likes": 2450,
        "comments": 310,
        "shares": 290,
        "saves": 590,
        "watch_time": 15500,
        "reach": 27500,
    },
    {
        "external_content_id": "LI108",
        "title": "The Architecture Behind High-Scale Real-Time Notification Engines",
        "content_type": "Post",
        "published_at": date(2026, 7, 14),
        "views": 23000,
        "likes": 1950,
        "comments": 230,
        "shares": 210,
        "saves": 380,
        "watch_time": 9200,
        "reach": 21500,
    },
    {
        "external_content_id": "LI109",
        "title": "Building Reliable Event-Driven Pipelines with Kafka and Python",
        "content_type": "Article",
        "published_at": date(2026, 7, 26),
        "views": 37000,
        "likes": 3100,
        "comments": 380,
        "shares": 390,
        "saves": 660,
        "watch_time": 18500,
        "reach": 34500,
    },
    {
        "external_content_id": "LI110",
        "title": "From IC to Tech Lead: 3 Mindset Shifts Required to Succeed",
        "content_type": "Post",
        "published_at": date(2026, 8, 6),
        "views": 53000,
        "likes": 4900,
        "comments": 670,
        "shares": 630,
        "saves": 920,
        "watch_time": 17800,
        "reach": 49000,
    },
    {
        "external_content_id": "LI111",
        "title": "Microservices vs Monolith: A Pragmatic Production Retrospective",
        "content_type": "Article",
        "published_at": date(2026, 8, 18),
        "views": 31000,
        "likes": 2600,
        "comments": 340,
        "shares": 310,
        "saves": 510,
        "watch_time": 14200,
        "reach": 29000,
    },
    {
        "external_content_id": "LI112",
        "title": "Key Engineering Metrics to Track in 2026 Beyond DORA",
        "content_type": "Post",
        "published_at": date(2026, 8, 27),
        "views": 25000,
        "likes": 2150,
        "comments": 270,
        "shares": 240,
        "saves": 430,
        "watch_time": 10500,
        "reach": 23500,
    },
]

ALL_PLATFORM_DATA = {
    "YouTube": DATA_YOUTUBE,
    "Instagram": DATA_INSTAGRAM,
    "Facebook": DATA_FACEBOOK,
    "LinkedIn": DATA_LINKEDIN,
}


def seed_multiplatform_content():
    """Seed multi-platform records into PostgreSQL for all demo creators."""
    db = SessionLocal()
    try:
        # Find or create primary demo creator
        creator = db.scalar(select(User).where(User.email == "creator@creatoriq.dev"))
        if creator is None:
            creator = User(
                full_name="Demo Creator",
                email="creator@creatoriq.dev",
                password_hash=hash_password("Password123!"),
                role="Creator",
                status="active",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(creator)
            db.commit()
            db.refresh(creator)

        print(f"Targeting Creator ID={creator.id} ({creator.email})")

        total_inserted = 0
        total_updated = 0

        # Also find any other active creators to seed so all test accounts have data
        creators_to_seed = [creator]
        other_creators = db.scalars(
            select(User).where(
                User.id.in_([42, 43]),
                User.role.ilike("Creator"),
            )
        ).all()
        for oc in other_creators:
            if oc.id != creator.id:
                creators_to_seed.append(oc)

        for target_user in creators_to_seed:
            user_inserted = 0
            user_updated = 0

            for platform, items in ALL_PLATFORM_DATA.items():
                for item in items:
                    ext_id = item["external_content_id"]
                    pub_date = item["published_at"]
                    views = item["views"]
                    likes = item["likes"]
                    comments = item["comments"]
                    shares = item["shares"]
                    saves = item["saves"]
                    watch_time = item["watch_time"]
                    reach = item["reach"]
                    title = item["title"]
                    content_type = item["content_type"]

                    engagement_rate = calculate_engagement_rate(likes, comments, shares, saves, reach)

                    # Duplicate detection: creator_id + platform + external_content_id
                    existing = db.query(Content).filter(
                        Content.creator_id == target_user.id,
                        func.lower(Content.platform) == platform.lower(),
                        or_(
                            Content.external_content_id == ext_id,
                            Content.content_id == ext_id,
                            Content.title == title,
                        ),
                    ).first()

                    if existing:
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
                        user_updated += 1
                        total_updated += 1
                    else:
                        new_content = Content(
                            creator_id=target_user.id,
                            platform=platform,
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
                        user_inserted += 1
                        total_inserted += 1

                # Ensure SocialConnection status is marked 'connected' for supported platforms
                conn = db.query(SocialConnection).filter(
                    SocialConnection.user_id == target_user.id,
                    func.lower(SocialConnection.platform) == platform.lower(),
                ).first()
                if not conn:
                    conn = SocialConnection(
                        user_id=target_user.id,
                        platform=platform.lower(),
                        platform_username=f"{target_user.full_name.lower().replace(' ', '')}_{platform.lower()}",
                        display_name=f"{target_user.full_name} on {platform}",
                        status="connected",
                        last_synced_at=datetime.utcnow(),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                    db.add(conn)
                else:
                    conn.status = "connected"
                    conn.last_synced_at = datetime.utcnow()

            db.commit()
            print(f"Creator {target_user.email} (ID {target_user.id}): {user_inserted} inserted, {user_updated} updated.")

        print(f"\nTotal across all accounts: {total_inserted} inserted, {total_updated} updated.")

        # Print platform counts for verification
        counts = db.execute(
            select(Content.platform, func.count(Content.id))
            .where(Content.creator_id == creator.id)
            .group_by(Content.platform)
        ).all()
        print(f"\nPlatform counts in PostgreSQL for creator@creatoriq.dev:")
        for row in counts:
            print(f"  {row[0]}: {row[1]} records")

    finally:
        db.close()


if __name__ == "__main__":
    seed_multiplatform_content()
