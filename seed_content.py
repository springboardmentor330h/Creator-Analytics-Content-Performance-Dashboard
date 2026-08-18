import random
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.content import Content


TARGET_RECORDS = 500

CREATOR_IDS = [1, 2, 3, 5]

PLATFORMS = ["YouTube", "Instagram", "LinkedIn"]

CONTENT_TITLES = [
    "Python Full Stack Tutorial",
    "FastAPI Tutorial",
    "Python Backend Development Roadmap",
    "PostgreSQL Database Design Tutorial",
    "JWT Authentication with FastAPI",
    "SQLAlchemy ORM Tutorial",
    "REST API Development with FastAPI",
    "Python Interview Preparation",
    "Backend Development Guide",
    "Database Optimization Techniques",
    "Web Development Roadmap",
    "API Development Best Practices",
    "Python Programming Masterclass",
    "FastAPI Project Tutorial",
    "PostgreSQL for Beginners",
]

CONTENT_TYPES = [
    "Video",
    "Tutorial",
    "Post",
    "Reel",
    "Article",
]


def generate_content():
    db = SessionLocal()

    try:
        current_count = db.query(Content).count()
        records_needed = max(0, TARGET_RECORDS - current_count)

        print(f"Previous records: {current_count}")

        if records_needed == 0:
            print("Content table already has 500 or more records.")
            return

        random.seed(42)

        rows = []

        start_date = date(2026, 1, 1)

        for _ in range(records_needed):

            platform = random.choice(PLATFORMS)

            views = random.randint(5000, 50000)

            likes = random.randint(
                int(views * 0.03),
                int(views * 0.12)
            )

            comments = random.randint(
                int(views * 0.005),
                int(views * 0.03)
            )

            shares = random.randint(
                int(views * 0.003),
                int(views * 0.02)
            )

            saves = random.randint(
                int(views * 0.002),
                int(views * 0.015)
            )

            reach = random.randint(
                int(views * 0.8),
                int(views * 1.5)
            )

            watch_time = random.randint(
                300,
                7200
            )

            total_engagement = (
                likes
                + comments
                + shares
                + saves
            )

            if reach > 0:
                engagement_rate = (
                    total_engagement / reach
                ) * 100
            else:
                engagement_rate = 0.0

            published_date = (
                start_date
                + timedelta(days=random.randint(0, 230))
            )

            content = Content(
                creator_id=random.choice(CREATOR_IDS),
                content_title=random.choice(CONTENT_TITLES),
                platform=platform,
                content_type=random.choice(CONTENT_TYPES),
                views=views,
                likes=likes,
                comments=comments,
                shares=shares,
                saves=saves,
                watch_time=watch_time,
                reach=reach,
                published_date=published_date,
                engagement_rate=round(
                    engagement_rate,
                    2
                ),
            )

            rows.append(content)

        db.add_all(rows)
        db.commit()

        total_count = db.query(Content).count()

        print(f"Records added: {records_needed}")
        print(f"Total content records: {total_count}")

    except Exception as e:
        db.rollback()
        print("Error while inserting content data:")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    generate_content()
