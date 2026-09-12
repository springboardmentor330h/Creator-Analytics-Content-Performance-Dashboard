from __future__ import annotations

import os
import random
from datetime import date, timedelta

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("Set DATABASE_URL in .env")

from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth
from app.models.user import User

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Mock / sample platforms (plus optional YouTube sample volume)
PLATFORMS = [
    "TikTok",
    "Facebook",
    "LinkedIn",
    "Twitter",
]

RECORDS_PER_PLATFORM = 70
HISTORY_DAYS = 90

TITLE_POOL = {
    "TikTok": [
        "Trend remix transition",
        "Sound-on storytelling",
        "POV: analytics click",
        "Quick cut hack",
        "60s product demo",
        "Burnout skit",
        "Stitch reaction",
        "Setup tour 15s",
        "Duet mentor advice",
        "Preset showcase",
        "Product unboxing",
        "Audience poll results",
        "Collab teaser",
        "Save-worthy checklist",
        "BTS photo set",
    ],
    "Facebook": [
        "Community weekly wins",
        "Event recap album",
        "Long-form brand tip",
        "Live session highlights",
        "Group discussion starter",
        "Campaign results",
        "AMA summary",
        "Milestone post",
        "Beginner resource list",
        "Weekend challenge",
        "Carousel: hook formulas",
        "Reel: day in the life",
        "Story highlight dump",
        "Before/after edit",
        "Tip of the week",
    ],
    "LinkedIn": [
        "Lessons from CreatorIQ",
        "Why multi-platform analytics",
        "Hiring vs freelancers",
        "Engagement benchmarks",
        "Hobby to systemized content",
        "Sponsorship pricing",
        "Audience research checklist",
        "What agencies want in reports",
        "Creator ops stack",
        "Quarterly retrospective",\
        "30-day growth challenge recap",
        "Behind the scenes production",
        "Creator tool stack 2026",
        "Long-form editing workflow",
        "Live stream highlights reel",
    ],
    "Twitter": [
        "Thread: content systems",
        "Posting frequency take",
        "Poll: best CTA",
        "Hooks under 10 words",
        "Dashboard notes",
        "Industry reaction",
        "Ship log analytics",
        "AMA growth metrics",
        "Reels vs shorts benchmarks",
        "Pre-publish checklist",
        "Full tutorial: analytics that convert",
        "Weekly vlog — studio day",
        "Content calendar system",
        "Community Q&A live",
        "Engagement rate deep dive",
    ],
}


def metrics(platform: str, quality: str) -> dict:
    ranges = {
        "TikTok": {
            "high": (70000, 300000, 7000, 28000, 350, 1600, 400, 3500),
            "mid": (12000, 65000, 1200, 6500, 70, 380, 80, 550),
            "low": (800, 11000, 60, 800, 8, 55, 10, 70),
        },
        "Facebook": {
            "high": (12000, 55000, 700, 3200, 70, 280, 40, 220),
            "mid": (2500, 13000, 120, 650, 15, 90, 8, 55),
            "low": (250, 2200, 15, 110, 2, 22, 1, 10),
        },
        "LinkedIn": {
            "high": (4000, 20000, 250, 1100, 35, 140, 25, 110),
            "mid": (1000, 4000, 70, 320, 12, 55, 8, 35),
            "low": (120, 900, 8, 60, 1, 12, 1, 6),
        },
        "Twitter": {
            "high": (9000, 45000, 450, 2400, 90, 380, 40, 180),
            "mid": (1800, 8500, 70, 450, 18, 100, 8, 45),
            "low": (150, 1600, 8, 70, 2, 20, 1, 8),
        },
    }
    r = ranges[platform][quality]
    views = random.randint(r[0], r[1])
    likes = random.randint(r[2], r[3])
    comments = random.randint(r[4], r[5])
    shares = random.randint(r[6], r[7])
    saves = 0 if platform == "Twitter" else random.randint(0, max(shares // 2, 1))
    reach = int(views * random.uniform(1.05, 1.5))
    return {
        "views": views,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": saves,
        "watch_time": random.randint(50, 9000) if platform == "YouTube" else 0,
        "reach": reach,
    }


def seed_user(user: User) -> None:
    creator_id = user.id
    print(f"\n→ User {creator_id} ({user.email})")

    # Remove previous seed rows only (keep real API external ids)
    deleted = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_content_id.like("seed-%"),
        )
        .delete(synchronize_session=False)
    )
    print(f"  cleared {deleted} old seed content rows")

    today = date.today()
    qualities = ["high", "mid", "mid", "low", "high", "mid", "low"]
    created = 0

    for platform in PLATFORMS:
        titles = TITLE_POOL[platform]
        for i in range(RECORDS_PER_PLATFORM):
            q = qualities[i % len(qualities)]
            m = metrics(platform, q)
            published = today - timedelta(days=random.randint(0, HISTORY_DAYS))
            base_title = titles[i % len(titles)]
            title = f"{base_title} #{i + 1}"
            db.add(
                Content(
                    creator_id=creator_id,
                    platform=platform,
                    external_content_id=f"seed-{platform.lower()}-{i + 1:03d}",
                    content_title=title[:255],
                    views=m["views"],
                    likes=m["likes"],
                    comments=m["comments"],
                    shares=m["shares"],
                    saves=m["saves"],
                    watch_time=m["watch_time"],
                    reach=m["reach"],
                    published_date=published,
                )
            )
            created += 1

    # Growth history
    db.query(Growth).filter(Growth.creator_id == creator_id).delete(
        synchronize_session=False
    )
    followers = random.randint(5000, 20000)
    for d in range(HISTORY_DAYS, -1, -1):
        followers += random.randint(-25, 140)
        followers = max(followers, 800)
        db.add(
            Growth(
                creator_id=creator_id,
                date=today - timedelta(days=d),
                followers=followers,
                reach=int(followers * random.uniform(0.9, 2.4)),
                engagement_rate=round(random.uniform(2.0, 10.5), 2),
            )
        )

    # Audience segments
    db.query(Audience).filter(Audience.creator_id == creator_id).delete(
        synchronize_session=False
    )
    for gender in ("Female", "Male", "Other"):
        for age in ("18-24", "25-34", "35-44", "45-54"):
            db.add(
                Audience(
                    creator_id=creator_id,
                    age_group=age,
                    gender=gender,
                    country=random.choice(
                        ["India", "USA", "UK", "UAE", "Canada", "Australia"]
                    ),
                    city=random.choice(
                        ["Bengaluru", "Mumbai", "London", "Dubai", "Toronto", "Sydney"]
                    ),
                    device_type=random.choice(["Mobile", "Desktop", "Tablet"]),
                    active_hour=random.randint(0, 23),
                    followers=random.randint(400, 6000),
                    impressions=random.randint(2500, 35000),
                    reach=random.randint(1500, 22000),
                )
            )

    print(
        f"  + {created} content "
        f"({RECORDS_PER_PLATFORM} × {len(PLATFORMS)} platforms), "
        f"{HISTORY_DAYS + 1} growth days, audience segments"
    )


def main():
    users = db.query(User).order_by(User.id.asc()).all()
    if not users:
        raise SystemExit("No users in DB. Register at least one user first.")

    print(f"Seeding {len(users)} user(s) × {len(PLATFORMS)} platforms × {RECORDS_PER_PLATFORM} posts")
    for user in users:
        seed_user(user)

    db.commit()
    total = (
        len(users) * len(PLATFORMS) * RECORDS_PER_PLATFORM
    )
    print(f"\nDone. ~{total} content rows in PostgreSQL.")
    print("Refresh dashboard / analytics / reports — all via APIs.")


if __name__ == "__main__":
    main()
