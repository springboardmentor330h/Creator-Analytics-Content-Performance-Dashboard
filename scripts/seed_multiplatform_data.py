"""Seed the unified multi-platform content table with a realistic 90-day demo set.

Run from the repository root with ``python scripts/seed_multiplatform_data.py``.
The platform/content-id constraint makes repeated runs updates, not duplicates.
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
import random
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.database import Base, SessionLocal, engine
from app.models.content import ContentItem


PLATFORM_CONFIG = {
    "YouTube": {
        "prefix": "yt", "url": "https://youtube.com/watch?v=", "base_views": 88000,
        "titles": ["Creator workflow breakdown", "Studio setup tour", "Editing faster with AI", "Audience Q&A", "Brand deal playbook", "Weekly creator news"],
    },
    "Instagram": {
        "prefix": "ig", "url": "https://instagram.com/p/", "base_views": 54000,
        "titles": ["Behind the scenes reel", "Three hook ideas", "Creator desk refresh", "Launch day carousel", "Community spotlight", "Quick filming tip"],
    },
    "LinkedIn": {
        "prefix": "li", "url": "https://linkedin.com/posts/", "base_views": 21000,
        "titles": ["The creator economy is maturing", "Campaign retrospective", "Building a repeatable brief", "Thoughts on brand trust", "Team learning notes", "Quarterly creator trends"],
    },
    "Twitter": {
        "prefix": "x", "url": "https://x.com/creatoriq/status/", "base_views": 32000,
        "titles": ["Creator economy data thread", "Today’s production note", "Campaign lesson", "Audience growth observation", "Tool stack recommendation", "Weekly wins"],
    },
}


def make_records():
    """Generate 48 deterministic records distributed across the last 90 days."""
    randomizer = random.Random(20260903)
    now = datetime.now(timezone.utc).replace(hour=14, minute=0, second=0, microsecond=0)
    records = []
    # Twelve posts on every network, staggered to make charts informative.
    for platform_index, (platform, config) in enumerate(PLATFORM_CONFIG.items()):
        for post_index in range(12):
            days_ago = 2 + ((post_index * 8 + platform_index * 3) % 89)
            published_at = now - timedelta(days=days_ago, hours=post_index % 5)
            # Older posts have naturally accumulated more impressions, with occasional viral lifts.
            age_factor = 0.85 + (days_ago / 145)
            momentum = 2.1 if post_index in (3, 9) else randomizer.uniform(0.65, 1.35)
            views = max(800, int(config["base_views"] * age_factor * momentum))
            if platform == "Instagram":
                reach = int(views * randomizer.uniform(1.25, 1.75))
                likes = int(reach * randomizer.uniform(0.032, 0.071))
                comments = int(reach * randomizer.uniform(0.003, 0.013))
                shares = int(reach * randomizer.uniform(0.002, 0.012))
            elif platform == "LinkedIn":
                reach = int(views * randomizer.uniform(1.45, 2.3))
                likes = int(reach * randomizer.uniform(0.012, 0.035))
                comments = int(reach * randomizer.uniform(0.0015, 0.008))
                shares = int(reach * randomizer.uniform(0.001, 0.009))  # reposts
            elif platform == "Twitter":
                reach = int(views * randomizer.uniform(1.1, 1.65))
                likes = int(reach * randomizer.uniform(0.008, 0.03))
                comments = int(reach * randomizer.uniform(0.001, 0.006))
                shares = int(reach * randomizer.uniform(0.003, 0.018))  # reposts
            else:
                reach = int(views * randomizer.uniform(1.08, 1.38))
                likes = int(views * randomizer.uniform(0.035, 0.082))
                comments = int(views * randomizer.uniform(0.003, 0.014))
                shares = int(views * randomizer.uniform(0.001, 0.009))
            content_id = f"{config['prefix']}-{published_at:%Y%m%d}-{post_index + 1:02d}"
            records.append({
                "platform": platform,
                "content_id": content_id,
                "title": config["titles"][post_index % len(config["titles"])],
                "url": f"{config['url']}{content_id}",
                "views": views,
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "reach": reach,
                "published_at": published_at,
            })
    return records


def seed() -> int:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        inserted = updated = 0
        for values in make_records():
            item = db.query(ContentItem).filter(
                ContentItem.platform == values["platform"],
                ContentItem.content_id == values["content_id"],
            ).one_or_none()
            if item:
                for key, value in values.items():
                    setattr(item, key, value)
                updated += 1
            else:
                db.add(ContentItem(**values))
                inserted += 1
        db.commit()
        total = db.query(ContentItem).count()
        print(f"Multi-platform seed complete: {inserted} inserted, {updated} updated ({total} total content_items).")
        return total
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
