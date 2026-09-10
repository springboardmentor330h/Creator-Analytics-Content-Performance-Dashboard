"""Seeds the database with a demo creator and realistic multi-platform data.

Run after the schema exists (either `alembic upgrade head`, or just start the
app once so `create_all` runs):

    python seed_multiplatform.py

Safe to re-run: it looks up the demo user by email first instead of
duplicating it, and content dedupes on (platform, external_content_id) the
same way a real sync would.
"""
import random
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth
from app.models.revenue import RevenueRecord, Sponsorship
from app.models.user import User, UserRole
from app.services.social_service import SUPPORTED_PLATFORMS, generate_mock_content
from app.services.user_service import UserService
from app.schemas.user import UserCreate

DEMO_EMAIL = "demo@creatoriq.dev"
DEMO_PASSWORD = "demo12345"


def get_or_create_demo_user(db) -> User:
    existing = UserService.get_by_email(db, DEMO_EMAIL)
    if existing:
        print(f"Demo user already exists (id={existing.id})")
        return existing

    user = UserService.create(
        db,
        UserCreate(
            full_name="Demo Creator",
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
            role=UserRole.CREATOR,
            bio="Seeded demo account for CreatorIQ.",
        ),
    )
    print(f"Created demo user (id={user.id}, password={DEMO_PASSWORD})")
    return user


def seed_content(db, creator_id: int):
    inserted = 0
    for platform in SUPPORTED_PLATFORMS:
        for row in generate_mock_content(platform, creator_id, count=100):
            exists = (
                db.query(Content)
                .filter(
                    Content.platform == row["platform"],
                    Content.external_content_id == row["external_content_id"],
                )
                .first()
            )
            if exists:
                continue
            db.add(Content(**row))
            inserted += 1
    db.commit()
    print(f"Seeded {inserted} content rows across {len(SUPPORTED_PLATFORMS)} platforms")


def seed_audience(db, creator_id: int):
    if db.query(Audience).filter(Audience.creator_id == creator_id).first():
        print("Audience data already present, skipping")
        return

    age_groups = ["13-17", "18-24", "25-34", "35-44", "45+"]
    genders = ["Male", "Female", "Other"]
    countries = [("India", "Mumbai"), ("India", "Bangalore"), ("USA", "New York"), ("UK", "London")]
    devices = ["Mobile", "Desktop", "Tablet"]

    for _ in range(40):
        country, city = random.choice(countries)
        db.add(Audience(
            creator_id=creator_id,
            platform=random.choice(SUPPORTED_PLATFORMS),
            age_group=random.choice(age_groups),
            gender=random.choice(genders),
            country=country,
            city=city,
            device=random.choice(devices),
            active_hour=random.randint(0, 23),
            follower_count=random.randint(100, 5000),
        ))
    db.commit()
    print("Seeded 40 audience records")


def seed_growth(db, creator_id: int):
    if db.query(Growth).filter(Growth.creator_id == creator_id).first():
        print("Growth data already present, skipping")
        return

    followers = 1000
    today = date.today()
    for i in range(90, 0, -7):  # weekly checkpoints for the last ~90 days
        new_followers = random.randint(20, 150)
        unfollows = random.randint(0, 30)
        followers += new_followers - unfollows
        db.add(Growth(
            creator_id=creator_id,
            platform="YouTube",
            record_date=today - timedelta(days=i),
            follower_count=followers,
            new_followers=new_followers,
            unfollows=unfollows,
        ))
    db.commit()
    print("Seeded growth history")


def seed_revenue(db, creator_id: int):
    if db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).first():
        print("Revenue data already present, skipping")
        return

    sources = ["Ad Revenue", "Sponsorship", "Tips", "Affiliate"]
    today = date.today()
    for i in range(60, 0, -5):
        db.add(RevenueRecord(
            creator_id=creator_id,
            platform=random.choice(SUPPORTED_PLATFORMS),
            source=random.choice(sources),
            amount=round(random.uniform(20, 800), 2),
            record_date=today - timedelta(days=i),
        ))
    db.commit()
    print("Seeded revenue records")


def seed_sponsorships(db, creator_id: int):
    if db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).first():
        print("Sponsorship data already present, skipping")
        return

    brands = ["Acme Co", "Nova Tech", "Brightline", "Solstice Foods"]
    statuses = ["Pending", "Active", "Completed"]
    for brand in brands:
        db.add(Sponsorship(
            creator_id=creator_id,
            brand_name=brand,
            platform=random.choice(SUPPORTED_PLATFORMS),
            deal_amount=round(random.uniform(200, 3000), 2),
            status=random.choice(statuses),
        ))
    db.commit()
    print("Seeded sponsorships")


def main():
    db = SessionLocal()
    try:
        user = get_or_create_demo_user(db)
        seed_content(db, user.id)
        seed_audience(db, user.id)
        seed_growth(db, user.id)
        seed_revenue(db, user.id)
        seed_sponsorships(db, user.id)
        print(f"\nDone. Log in with: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
