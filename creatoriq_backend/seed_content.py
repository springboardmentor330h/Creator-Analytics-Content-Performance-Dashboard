"""Seed sample content analytics data for local development."""
from datetime import date, datetime

from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.content import Content
from app.models.user import User
from app.services.content_service import calculate_engagement_rate

SAMPLE_CONTENT = [
    {
        'title': 'Python Tutorial',
        'platform': 'YouTube',
        'content_type': 'Video',
        'published_at': date(2026, 5, 1),
        'views': 50000,
        'likes': 4200,
        'comments': 380,
        'shares': 210,
        'saves': 640,
        'watch_time': 125000,
        'reach': 48000,
    },
    {
        'title': 'React Dashboard',
        'platform': 'YouTube',
        'content_type': 'Video',
        'published_at': date(2026, 5, 8),
        'views': 41200,
        'likes': 3100,
        'comments': 290,
        'shares': 180,
        'saves': 510,
        'watch_time': 98000,
        'reach': 39000,
    },
    {
        'title': 'Laptop Review',
        'platform': 'Instagram',
        'content_type': 'Reel',
        'published_at': date(2026, 5, 12),
        'views': 31700,
        'likes': 5400,
        'comments': 420,
        'shares': 960,
        'saves': 1500,
        'watch_time': 22000,
        'reach': 30000,
    },
    {
        'title': 'Developer Life',
        'platform': 'TikTok',
        'content_type': 'Short',
        'published_at': date(2026, 5, 18),
        'views': 27900,
        'likes': 6100,
        'comments': 510,
        'shares': 1400,
        'saves': 890,
        'watch_time': 18000,
        'reach': 26500,
    },
    {
        'title': 'JavaScript Tutorial',
        'platform': 'YouTube',
        'content_type': 'Video',
        'published_at': date(2026, 5, 22),
        'views': 23600,
        'likes': 1900,
        'comments': 160,
        'shares': 95,
        'saves': 340,
        'watch_time': 72000,
        'reach': 22000,
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        creator = db.scalar(select(User).where(User.email == 'creator@creatoriq.dev'))
        if creator is None:
            creator = User(
                full_name='Demo Creator',
                email='creator@creatoriq.dev',
                password_hash=hash_password('Password123!'),
                role='Creator',
                status='active',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(creator)
            db.commit()
            db.refresh(creator)

        existing_titles = {
            title for title in db.scalars(select(Content.title).where(Content.creator_id == creator.id))
        }
        for item in SAMPLE_CONTENT:
            if item['title'] in existing_titles:
                continue
            content = Content(
                creator_id=creator.id,
                content_id=f"{creator.id}-{item['title'].lower().replace(' ', '-')}",
                title=item['title'],
                platform=item['platform'],
                content_type=item['content_type'],
                published_at=item['published_at'],
                views=item['views'],
                likes=item['likes'],
                comments=item['comments'],
                shares=item['shares'],
                saves=item['saves'],
                watch_time=item['watch_time'],
                reach=item['reach'],
                engagement_rate=calculate_engagement_rate(
                    item['likes'], item['comments'], item['shares'], item['saves'], item['reach']
                ),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(content)
        db.commit()
        print(f'Seed complete for creator_id={creator.id} ({creator.email})')
    finally:
        db.close()


if __name__ == '__main__':
    seed()
