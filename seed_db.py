import random
from datetime import date, timedelta
from app.db.database import SessionLocal
from app.models.content import Content

# Platforms and topic generator
PLATFORMS = ["YouTube", "Instagram", "LinkedIn", "TikTok", "Twitter"]

TOPICS = [
    "FastAPI",
    "Python 3.13",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "System Design",
    "React",
    "Next.js",
    "SQLAlchemy",
    "GraphQL",
    "Microservices",
    "Data Structures",
    "Redis",
    "CI/CD Pipelines",
    "AWS",
]

FORMATS = [
    "Tutorial",
    "Crash Course",
    "Best Practices",
    "Mistakes to Avoid",
    "Architecture Guide",
    "Deep Dive",
    "Tips & Tricks",
    "Real-World Masterclass",
]


def seed_database(count: int = 100):
    db = SessionLocal()
    try:
        contents = []
        start_date = date(2026, 1, 1)

        print(f"Generating {count} realistic content records...")

        for i in range(1, count + 1):
            platform = random.choice(PLATFORMS)
            topic = random.choice(TOPICS)
            fmt = random.choice(FORMATS)

            views = random.randint(1000, 150000)
            reach = int(views * random.uniform(1.1, 2.2))
            likes = int(views * random.uniform(0.04, 0.12))
            comments = int(likes * random.uniform(0.05, 0.20))
            shares = int(likes * random.uniform(0.02, 0.15))
            saves = int(likes * random.uniform(0.05, 0.35))

            watch_time = (
                round(random.uniform(500.0, 18000.0), 1)
                if platform in ["YouTube", "TikTok"]
                else 0.0
            )

            published_date = start_date + timedelta(
                days=random.randint(0, 220)
            )

            content = Content(
                creator_id=random.randint(1, 15),
                platform=platform,
                content_title=f"{topic} {fmt} #{i}",
                views=views,
                likes=likes,
                comments=comments,
                shares=shares,
                saves=saves,
                watch_time=watch_time,
                reach=reach,
                published_date=published_date,
            )
            contents.append(content)

        db.add_all(contents)
        db.commit()
        print(
            f"Successfully inserted {count} records into your PostgreSQL database!"
        )

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(500)