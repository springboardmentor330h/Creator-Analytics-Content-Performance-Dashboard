import logging
from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.app.models.content import Content
from backend.app.models.growth import Growth
from backend.app.models.audience import Audience
from backend.app.models.social_account import SocialAccount
from backend.app.models.user import User

logger = logging.getLogger(__name__)

# Sample multi-platform content datasets
PLATFORM_DATASETS = {
    "YouTube": [
        {"title": "Mastering Multi-Platform System Architecture in 2026", "views": 185000, "likes": 12400, "comments": 950, "shares": 4200, "saves": 3100, "watch_time": 888000, "reach": 296000, "days_ago": 180},
        {"title": "Full-Stack FastAPI & React Dashboard Performance Deep Dive", "views": 142000, "likes": 9800, "comments": 720, "shares": 3100, "saves": 2400, "watch_time": 681600, "reach": 227200, "days_ago": 165},
        {"title": "10 Clean Code Patterns for Modern Web Developers", "views": 210000, "likes": 16500, "comments": 1420, "shares": 5800, "saves": 4500, "watch_time": 1008000, "reach": 336000, "days_ago": 150},
        {"title": "PostgreSQL Optimization & Indexing Benchmark Guide", "views": 98000, "likes": 6700, "comments": 480, "shares": 1900, "saves": 1800, "watch_time": 470400, "reach": 156800, "days_ago": 135},
        {"title": "Building Realtime Analytics Pipelines from Scratch", "views": 175000, "likes": 11900, "comments": 890, "shares": 3900, "saves": 2900, "watch_time": 840000, "reach": 280000, "days_ago": 120},
        {"title": "Top 5 State Management Tools for React Apps Explained", "views": 130000, "likes": 8400, "comments": 610, "shares": 2600, "saves": 2100, "watch_time": 624000, "reach": 208000, "days_ago": 105},
        {"title": "Vite vs Next.js: Ultimate Frontend Framework Comparison", "views": 245000, "likes": 18900, "comments": 1680, "shares": 6700, "saves": 5200, "watch_time": 1176000, "reach": 392000, "days_ago": 90},
        {"title": "Microservices vs Monolith: Architectural Tradeoffs", "views": 115000, "likes": 7800, "comments": 540, "shares": 2200, "saves": 1900, "watch_time": 552000, "reach": 184000, "days_ago": 75},
        {"title": "Python AsyncIO vs Threading: Concurrent Programming", "views": 160000, "likes": 10800, "comments": 810, "shares": 3400, "saves": 2700, "watch_time": 768000, "reach": 256000, "days_ago": 60},
        {"title": "Docker Container Security & Deployment Best Practices", "views": 195000, "likes": 13800, "comments": 1120, "shares": 4900, "saves": 3800, "watch_time": 936000, "reach": 312000, "days_ago": 45},
        {"title": "AI Coding Assistants Comparison & Workflow Review", "views": 310000, "likes": 24500, "comments": 2200, "shares": 8900, "saves": 7100, "watch_time": 1488000, "reach": 496000, "days_ago": 30},
        {"title": "Building Scalable REST & GraphQL APIs with FastAPI", "views": 155000, "likes": 10200, "comments": 760, "shares": 3200, "saves": 2600, "watch_time": 744000, "reach": 248000, "days_ago": 15},
        {"title": "Live Q&A: Creator Economy Tech Stack & Growth Strategies", "views": 88000, "likes": 5900, "comments": 890, "shares": 1400, "saves": 1200, "watch_time": 422400, "reach": 140800, "days_ago": 5},
    ],
    "Instagram": [
        {"title": "Behind the Scenes at CreatorIQ Tech Studio 📸", "views": 95000, "likes": 14200, "comments": 880, "shares": 2900, "saves": 3800, "watch_time": 237500, "reach": 137750, "days_ago": 175},
        {"title": "Top 3 Visual Design Principles for Dashboard Interfaces ✨", "views": 128000, "likes": 18900, "comments": 1240, "shares": 4100, "saves": 5600, "watch_time": 320000, "reach": 185600, "days_ago": 160},
        {"title": "Reel: How We Process 1M Analytics Data Points Daily 🚀", "views": 215000, "likes": 31200, "comments": 2150, "shares": 8400, "saves": 9200, "watch_time": 537500, "reach": 311750, "days_ago": 145},
        {"title": "Carousel: Essential Developer Desk Setup Guide 💻", "views": 110000, "likes": 15600, "comments": 940, "shares": 3200, "saves": 4900, "watch_time": 275000, "reach": 159500, "days_ago": 130},
        {"title": "Product Update: Realtime Cross-Platform Analytics Released 🎉", "views": 164000, "likes": 22400, "comments": 1580, "shares": 5900, "saves": 6800, "watch_time": 410000, "reach": 237800, "days_ago": 115},
        {"title": "Reel: 5 Micro-Animations that elevate User Experience 🎨", "views": 189000, "likes": 27800, "comments": 1890, "shares": 7200, "saves": 8100, "watch_time": 472500, "reach": 274050, "days_ago": 100},
        {"title": "Infographic: Modern CSS Glassmorphism & Themes 🌈", "views": 140000, "likes": 19500, "comments": 1120, "shares": 4600, "saves": 5900, "watch_time": 350000, "reach": 203000, "days_ago": 85},
        {"title": "Reel: Day in the Life of a Senior Full-Stack Engineer ☕", "views": 240000, "likes": 35600, "comments": 2680, "shares": 9800, "saves": 11200, "watch_time": 600000, "reach": 348000, "days_ago": 70},
        {"title": "Carousel: How to Structure Clean React Components 🧠", "views": 152000, "likes": 21800, "comments": 1450, "shares": 5100, "saves": 6400, "watch_time": 380000, "reach": 220400, "days_ago": 55},
        {"title": "Reel: Why Dark Mode improves Dashboard Usability 🌙", "views": 178000, "likes": 25400, "comments": 1720, "shares": 6400, "saves": 7600, "watch_time": 445000, "reach": 258100, "days_ago": 40},
        {"title": "Creator Milestone: 100K Active Dashboard Users Milestone 🏆", "views": 205000, "likes": 29800, "comments": 2100, "shares": 7900, "saves": 8900, "watch_time": 512500, "reach": 297250, "days_ago": 25},
        {"title": "Carousel: UI Color Palette Guide for Developers 🎨", "views": 135000, "likes": 18200, "comments": 1050, "shares": 4300, "saves": 5400, "watch_time": 337500, "reach": 195750, "days_ago": 10},
    ],
    "Facebook": [
        {"title": "CreatorIQ Enterprise Multi-Platform Dashboard Release Overview", "views": 72000, "likes": 3800, "comments": 540, "shares": 2100, "saves": 950, "watch_time": 288000, "reach": 86400, "days_ago": 172},
        {"title": "Tech Community Spotlight: Supporting Creator Economy Infrastructure", "views": 85000, "likes": 4600, "comments": 680, "shares": 2600, "saves": 1150, "watch_time": 340000, "reach": 102000, "days_ago": 158},
        {"title": "How Multi-Platform Analytics empowers digital media teams", "views": 110000, "likes": 6400, "comments": 920, "shares": 3800, "saves": 1620, "watch_time": 440000, "reach": 132000, "days_ago": 142},
        {"title": "Live Stream Replay: Monetization & Revenue Management Strategies", "views": 64000, "likes": 3200, "comments": 490, "shares": 1800, "saves": 820, "watch_time": 256000, "reach": 76800, "days_ago": 128},
        {"title": "Case Study: Scaling Creator Operations across 5 Social Platforms", "views": 98000, "likes": 5300, "comments": 780, "shares": 3100, "saves": 1410, "watch_time": 392000, "reach": 117600, "days_ago": 112},
        {"title": "The Evolution of Digital Analytics: Key Industry Trends 2026", "views": 125000, "likes": 7100, "comments": 1050, "shares": 4400, "saves": 1890, "watch_time": 500000, "reach": 150000, "days_ago": 96},
        {"title": "Behind the Scenes: Engineering High-Throughput PostgreSQL DBs", "views": 78000, "likes": 4100, "comments": 610, "shares": 2300, "saves": 1050, "watch_time": 312000, "reach": 93600, "days_ago": 82},
        {"title": "Facebook Video Series: Advanced Audience Demographic Insights", "views": 92000, "likes": 5000, "comments": 730, "shares": 2900, "saves": 1320, "watch_time": 368000, "reach": 110400, "days_ago": 66},
        {"title": "Webinar Highlights: Maximizing Virality and Organic Reach", "views": 105000, "likes": 5800, "comments": 860, "shares": 3500, "saves": 1580, "watch_time": 420000, "reach": 126000, "days_ago": 52},
        {"title": "Creator Story: Building a 7-Figure Media Empire with Data", "views": 138000, "likes": 8200, "comments": 1240, "shares": 5200, "saves": 2150, "watch_time": 552000, "reach": 165600, "days_ago": 36},
        {"title": "Community Q&A: Social Media Algorithms Demystified", "views": 81000, "likes": 4300, "comments": 650, "shares": 2400, "saves": 1100, "watch_time": 324000, "reach": 97200, "days_ago": 22},
        {"title": "Annual Creator Economy Report 2026 Executive Summary", "views": 118000, "likes": 6900, "comments": 990, "shares": 4100, "saves": 1780, "watch_time": 472000, "reach": 141600, "days_ago": 7},
    ],
    "LinkedIn": [],
    "X": [
        {"title": "Thread: 10 Game-Changing Full-Stack Development Rules 🧵", "views": 240000, "likes": 12800, "comments": 1150, "shares": 4900, "saves": 5800, "watch_time": 360000, "reach": 432000, "days_ago": 176},
        {"title": "FastAPI 2.0 features you need to start using today ⚡", "views": 185000, "likes": 9600, "comments": 820, "shares": 3600, "saves": 4200, "watch_time": 277500, "reach": 333000, "days_ago": 161},
        {"title": "Thread: How PostgreSQL handles millions of concurrent queries 🐘", "views": 310000, "likes": 17500, "comments": 1620, "shares": 6800, "saves": 8100, "watch_time": 465000, "reach": 558000, "days_ago": 146},
        {"title": "Why TypeScript + React remains the gold standard in 2026 🎯", "views": 210000, "likes": 11200, "comments": 980, "shares": 4100, "saves": 4900, "watch_time": 315000, "reach": 378000, "days_ago": 131},
        {"title": "Thread: Building high-converting landing pages from first principles 🎨", "views": 280000, "likes": 15400, "comments": 1380, "shares": 5900, "saves": 7200, "watch_time": 420000, "reach": 504000, "days_ago": 117},
        {"title": "The biggest mistake junior devs make when writing REST APIs 🚫", "views": 165000, "likes": 8400, "comments": 710, "shares": 3100, "saves": 3600, "watch_time": 247500, "reach": 297000, "days_ago": 101},
        {"title": "Thread: Complete guide to modern web accessibility (a11y) ♿", "views": 195000, "likes": 10400, "comments": 890, "shares": 3900, "saves": 4700, "watch_time": 292500, "reach": 351000, "days_ago": 86},
        {"title": "Announcing CreatorIQ 4.0: Omnichannel Analytics Engine 🚀", "views": 390000, "likes": 22800, "comments": 2150, "shares": 9200, "saves": 10500, "watch_time": 585000, "reach": 702000, "days_ago": 71},
        {"title": "Thread: How to optimize React re-renders with ease ⚡", "views": 260000, "likes": 14100, "comments": 1240, "shares": 5400, "saves": 6600, "watch_time": 390000, "reach": 468000, "days_ago": 54},
        {"title": "Single-threaded vs Multi-threaded event loops explained simple 🧠", "views": 225000, "likes": 11900, "comments": 1020, "shares": 4500, "saves": 5300, "watch_time": 337500, "reach": 405000, "days_ago": 38},
        {"title": "Thread: 7 System Architecture diagrams every lead dev must master 📊", "views": 440000, "likes": 26500, "comments": 2580, "shares": 10800, "saves": 12900, "watch_time": 660000, "reach": 792000, "days_ago": 21},
        {"title": "What's your favorite Python web framework in 2026? 🐍", "views": 175000, "likes": 8900, "comments": 1450, "shares": 2900, "saves": 3200, "watch_time": 262500, "reach": 315000, "days_ago": 6},
    ]
}

# Historical growth baseline numbers per platform
GROWTH_BASELINES = {
    "YouTube": {"start_followers": 450000, "daily_growth": 420},
    "Instagram": {"start_followers": 320000, "daily_growth": 360},
    "Facebook": {"start_followers": 210000, "daily_growth": 180},
    "LinkedIn": {"start_followers": 145000, "daily_growth": 240},
    "X": {"start_followers": 290000, "daily_growth": 480},
}

def seed_database(db: Session, force_reset: bool = False):
    """
    Seeds PostgreSQL database with rich, realistic multi-platform social media data across
    contents, growth, audience, and social_accounts tables.
    """
    logger.info("Checking database for multi-platform seeding requirement...")

    existing_content_count = db.query(Content).count()
    existing_platforms = set(p[0] for p in db.query(Content.platform).distinct().all())
    required_platforms = {"YouTube", "Instagram", "Facebook", "LinkedIn", "X"}

    # Check if all required platforms are populated
    if not force_reset and required_platforms.issubset(existing_platforms) and existing_content_count >= 70:
        logger.info(f"Database already populated with {existing_content_count} multi-platform records across {len(existing_platforms)} platforms.")
        return

    logger.info("Populating PostgreSQL with multi-platform datasets for CreatorIQ...")

    creator_id = 1
    today = date.today()

    # 1. Seed Content Records
    seeded_content_count = 0
    for platform, items in PLATFORM_DATASETS.items():
        handle = f"@{platform.lower()}_creatoriq" if platform != "YouTube" else "UC_CreatorIQ_Official"
        
        for idx, item in enumerate(items, start=1):
            ext_id = f"{platform.lower()}_seed_{idx:03d}"
            pub_date = today - timedelta(days=item["days_ago"])
            
            # Check duplicate by external_content_id or platform+title
            existing = db.query(Content).filter(
                Content.platform == platform,
                (Content.external_content_id == ext_id) | (Content.content_title == item["title"])
            ).first()

            if not existing:
                new_c = Content(
                    creator_id=creator_id,
                    platform=platform,
                    channel_handle=handle,
                    external_content_id=ext_id,
                    content_title=item["title"],
                    views=item["views"],
                    likes=item["likes"],
                    comments=item["comments"],
                    shares=item["shares"],
                    saves=item["saves"],
                    watch_time=item["watch_time"],
                    reach=item["reach"],
                    published_date=pub_date
                )
                db.add(new_c)
                seeded_content_count += 1
            else:
                existing.views = item["views"]
                existing.likes = item["likes"]
                existing.comments = item["comments"]
                existing.shares = item["shares"]
                existing.saves = item["saves"]
                existing.watch_time = item["watch_time"]
                existing.reach = item["reach"]
                existing.published_date = pub_date

    # 2. Seed Historical Growth Logs (past 180 days, sampled every 5 days)
    seeded_growth_count = 0
    for platform, baseline in GROWTH_BASELINES.items():
        base_fol = baseline["start_followers"]
        daily_inc = baseline["daily_growth"]

        for day_offset in range(180, -1, -5):
            g_date = today - timedelta(days=day_offset)
            current_fol = base_fol + int((180 - day_offset) * daily_inc)
            
            # Estimate reach & engagement rate per platform
            reach_val = int(current_fol * 0.45)
            eng_val = round(4.5 + ((180 - day_offset) * 0.015) % 3.5, 2)

            existing_g = db.query(Growth).filter(
                Growth.creator_id == creator_id,
                Growth.platform == platform,
                Growth.date == g_date
            ).first()

            if not existing_g:
                new_g = Growth(
                    creator_id=creator_id,
                    platform=platform,
                    date=g_date,
                    followers=current_fol,
                    reach=reach_val,
                    engagement_rate=eng_val
                )
                db.add(new_g)
                seeded_growth_count += 1
            else:
                existing_g.followers = current_fol
                existing_g.reach = reach_val
                existing_g.engagement_rate = eng_val

    # 3. Seed Connected Social Accounts
    for platform in required_platforms:
        handle = f"@{platform.lower()}_creatoriq" if platform != "YouTube" else "UC_CreatorIQ_Official"
        acc_name = f"CreatorIQ Official ({platform})"

        existing_acc = db.query(SocialAccount).filter(
            SocialAccount.creator_id == creator_id,
            SocialAccount.platform == platform,
            SocialAccount.account_handle == handle
        ).first()

        if not existing_acc:
            new_acc = SocialAccount(
                creator_id=creator_id,
                platform=platform,
                account_handle=handle,
                account_name=acc_name,
                account_id=handle,
                is_active=True
            )
            db.add(new_acc)

    # 4. Seed Demographic Audience Records
    if db.query(Audience).count() == 0:
        audiences = [
            Audience(creator_id=creator_id, age_group="18-24", gender="Male", country="India", city="Hyderabad", device_type="Mobile", active_hour=19, followers=185000, impressions=420000, reach=350000),
            Audience(creator_id=creator_id, age_group="25-34", gender="Male", country="India", city="Mumbai", device_type="Mobile", active_hour=20, followers=155000, impressions=350000, reach=290000),
            Audience(creator_id=creator_id, age_group="18-24", gender="Female", country="India", city="New Delhi", device_type="Mobile", active_hour=18, followers=128000, impressions=290000, reach=240000),
            Audience(creator_id=creator_id, age_group="25-34", gender="Female", country="India", city="Bengaluru", device_type="Mobile", active_hour=21, followers=108000, impressions=240000, reach=195000),
            Audience(creator_id=creator_id, age_group="35-44", gender="Male", country="India", city="Chennai", device_type="Mobile", active_hour=18, followers=85000, impressions=180000, reach=150000),
            Audience(creator_id=creator_id, age_group="25-34", gender="Male", country="United States", city="San Francisco", device_type="Desktop", active_hour=21, followers=81000, impressions=190000, reach=160000),
            Audience(creator_id=creator_id, age_group="18-24", gender="Female", country="United Kingdom", city="London", device_type="Mobile", active_hour=17, followers=34000, impressions=78000, reach=65000),
            Audience(creator_id=creator_id, age_group="25-34", gender="Male", country="United Arab Emirates", city="Dubai", device_type="Mobile", active_hour=20, followers=29000, impressions=65000, reach=55000),
            Audience(creator_id=creator_id, age_group="45+", gender="Female", country="Canada", city="Toronto", device_type="Tablet", active_hour=16, followers=19000, impressions=45000, reach=38000)
        ]
        db.add_all(audiences)

    db.commit()
    logger.info(f"Successfully seeded PostgreSQL DB: {seeded_content_count} new Content items, {seeded_growth_count} Growth data points.")
