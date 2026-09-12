"""
Instagram sample data service.

WHY sample data instead of a live API integration?
Instagram's official Graph API requires a Business/Creator account
linked to a Facebook Page, app review, and elevated permissions before
it will return analytics for any account beyond the developer's own --
there is no equivalent of YouTube's "public API key, read any public
channel" access model. That's a real platform restriction, not a
shortcut. Per the mentor-approved fallback, this generates REALISTIC
data and stores it in PostgreSQL through the existing
Content/AudienceGrowth models -- it does not fabricate a fake HTTP
response, and nothing here is hardcoded into the frontend.

WHY reuse Content/AudienceGrowth instead of new tables?
Instagram content and growth data need to flow through the exact same
content_service/audience_service/platform_analytics_service functions
every other platform already uses (no per-platform duplicate analytics
logic). Only CONSTRUCTING plausible rows is platform-specific --
everything downstream is the same existing code path YouTube uses.

IDEMPOTENCY: every seeded Content row gets a deterministic external_id
("ig-seed-0", "ig-seed-1", ...), so re-running the seed updates
existing rows instead of duplicating them -- same upsert pattern as
sync_service.py's YouTube logic.
"""
import random
import uuid
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from app.models.content import Content, Platform, ContentType
from app.models.audience import AudienceGrowth

_SEED = 7

_CAPTION_TOPICS = [
    "Behind the scenes", "New drop announcement", "Q&A with followers",
    "Tutorial: getting started", "Day in the life", "Product review",
    "Collab announcement", "Weekly recap", "Fan art feature", "Studio tour",
    "Tips & tricks", "Unboxing", "Live recap highlights", "Milestone celebration",
    "Community shoutout",
]

_CONTENT_TYPE_WEIGHTS = [
    (ContentType.reel, 0.5), (ContentType.post, 0.35), (ContentType.story, 0.15),
]


def _weighted_choice(rng, weighted_options):
    total = sum(w for _, w in weighted_options)
    r = rng.uniform(0, total)
    upto = 0
    for option, weight in weighted_options:
        upto += weight
        if upto >= r:
            return option
    return weighted_options[-1][0]


def generate_instagram_sample_data(db: Session, creator_id: uuid.UUID, num_posts: int = 40) -> dict:
    """
    Generates num_posts Instagram Content rows spanning ~6 months, plus
    weekly AudienceGrowth rows over the same period, stored via the
    existing models.

    Internal consistency rules (not arbitrary random numbers):
    - impressions is always reach * a modest multiplier (>= reach,
      since a post can be seen more than once by the same viewer).
    - Engagement (likes+comments+shares+saves) is a PERCENTAGE of
      reach, so engagement rate lands in a plausible 1-9% band.
    - Reels get a higher engagement-rate band and more reach than
      static posts/stories, reflecting real platform behavior.
    - Follower count grows with realistic week-to-week noise, mostly
      upward -- not a random walk that could go anywhere.
    """
    rng = random.Random(_SEED)
    today = date.today()
    start_date = today - timedelta(days=180)

    posts_created = 0
    posts_updated = 0

    for i in range(num_posts):
        days_offset = int(rng.uniform(0, 180))
        publish_date = datetime.combine(start_date + timedelta(days=days_offset), datetime.min.time())
        content_type = _weighted_choice(rng, _CONTENT_TYPE_WEIGHTS)

        if content_type == ContentType.reel:
            reach = rng.randint(8000, 60000)
            engagement_rate_target = rng.uniform(0.04, 0.09)
        elif content_type == ContentType.post:
            reach = rng.randint(3000, 25000)
            engagement_rate_target = rng.uniform(0.02, 0.06)
        else:
            reach = rng.randint(1500, 10000)
            engagement_rate_target = rng.uniform(0.01, 0.04)

        impressions = int(reach * rng.uniform(1.05, 1.35))
        total_engaged = int(reach * engagement_rate_target)

        likes = int(total_engaged * rng.uniform(0.75, 0.85))
        comments = int(total_engaged * rng.uniform(0.06, 0.12))
        shares = int(total_engaged * rng.uniform(0.04, 0.08))
        saves = max(total_engaged - likes - comments - shares, 0)

        topic = _CAPTION_TOPICS[i % len(_CAPTION_TOPICS)]
        title = f"{topic} #{i + 1}"
        external_id = f"ig-seed-{i}"

        existing = (
            db.query(Content)
            .filter(Content.creator_id == creator_id, Content.external_id == external_id)
            .first()
        )

        if existing:
            existing.title = title
            existing.content_type = content_type
            existing.publish_date = publish_date
            existing.reach = reach
            existing.impressions = impressions
            existing.likes = likes
            existing.comments = comments
            existing.shares = shares
            existing.saves = saves
            existing.views = impressions
            posts_updated += 1
        else:
            db.add(Content(
                creator_id=creator_id,
                platform=Platform.instagram,
                content_type=content_type,
                title=title,
                publish_date=publish_date,
                external_id=external_id,
                reach=reach,
                impressions=impressions,
                likes=likes,
                comments=comments,
                shares=shares,
                saves=saves,
                views=impressions,
            ))
            posts_created += 1

    db.commit()

    growth_points_created = 0
    growth_points_updated = 0
    starting_followers = rng.randint(4000, 15000)
    current_followers = starting_followers
    week_count = 180 // 7

    for week in range(week_count + 1):
        record_date = start_date + timedelta(weeks=week)
        if record_date > today:
            break

        weekly_change_percent = rng.uniform(-0.005, 0.025)
        current_followers = max(0, int(current_followers * (1 + weekly_change_percent)))

        existing_growth = (
            db.query(AudienceGrowth)
            .filter(
                AudienceGrowth.creator_id == creator_id,
                AudienceGrowth.platform == Platform.instagram,
                AudienceGrowth.record_date == record_date,
            )
            .first()
        )
        if existing_growth:
            existing_growth.follower_count = current_followers
            growth_points_updated += 1
        else:
            db.add(AudienceGrowth(
                creator_id=creator_id,
                platform=Platform.instagram,
                record_date=record_date,
                follower_count=current_followers,
            ))
            growth_points_created += 1

    db.commit()

    return {
        "posts_created": posts_created,
        "posts_updated": posts_updated,
        "growth_points_created": growth_points_created,
        "growth_points_updated": growth_points_updated,
        "final_follower_count": current_followers,
    }
