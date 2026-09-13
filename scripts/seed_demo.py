from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from app.db.database import SessionLocal, Base, engine
import app.models

from app.models.user import User
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship


# Create missing tables if required
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ---------------------------------------------------------
    # Find a user
    # ---------------------------------------------------------
    creator = db.query(User).first()

    if not creator:
        print("ERROR: No user found in the users table.")
        print("Please create a user first and run this script again.")
        raise SystemExit(1)

    # ---------------------------------------------------------
    # IMPORTANT:
    # content.creator_id references creators.id,
    # NOT users.id.
    #
    # Therefore we must get the UUID from the creators table.
    # ---------------------------------------------------------
    creator_row = db.execute(
        text("""
            SELECT id, name, platform
            FROM creators
            WHERE name = 'Asha Creator'
            ORDER BY created_at
            LIMIT 1
        """)
    ).fetchone()

    if not creator_row:
        print("ERROR: No creator found in the creators table.")
        print("Please make sure the creators table contains a creator.")
        raise SystemExit(1)

    creator_id = creator_row.id

    print(f"Using user: {creator.email}")
    print(f"Using creator: {creator_row.name}")
    print(f"Creator UUID: {creator_id}")

    # ---------------------------------------------------------
    # CONTENT DEMO DATA
    # ---------------------------------------------------------
    if not db.query(Content).first():

        platforms = [
            (
                "youtube",
                "Python Tutorial",
                "video",
                15000,
                1200,
                150,
                100,
                18000,
                3500,
            ),
            (
                "youtube",
                "FastAPI Tutorial",
                "video",
                12000,
                800,
                120,
                60,
                15000,
                3000,
            ),
            (
                "youtube",
                "SQL Basics",
                "video",
                8000,
                520,
                65,
                45,
                10000,
                2200,
            ),
            (
                "instagram",
                "Creator Tips",
                "reel",
                9800,
                1100,
                95,
                180,
                12500,
                0,
            ),
            (
                "instagram",
                "Reels Editing",
                "reel",
                18500,
                2100,
                140,
                250,
                23000,
                0,
            ),
            (
                "instagram",
                "Study With Me",
                "reel",
                7600,
                850,
                70,
                90,
                9500,
                0,
            ),
            (
                "twitter",
                "Career Roadmap",
                "post",
                5200,
                430,
                55,
                40,
                7000,
                0,
            ),
            (
                "twitter",
                "Python Skills",
                "post",
                6800,
                520,
                72,
                55,
                8500,
                0,
            ),
            (
                "facebook",
                "Web Development",
                "post",
                7400,
                610,
                80,
                70,
                9000,
                0,
            ),
            (
                "facebook",
                "SQL Basics",
                "post",
                6300,
                500,
                65,
                52,
                7800,
                0,
            ),
            (
                "tiktok",
                "Coding Hack",
                "video",
                22000,
                3200,
                210,
                400,
                27000,
                0,
            ),
            (
                "twitter",
                "Tech Update",
                "post",
                4100,
                300,
                45,
                35,
                5200,
                0,
            ),
        ]

        for i, p in enumerate(platforms, 1):

            published = (
                datetime.now(timezone.utc)
                - timedelta(days=len(platforms) - i)
            )

            content = Content(
                creator_id=creator_id,
                title=p[1],
                content_title=p[1],
                platform=p[0],
                content_type=p[2],
                views=p[3],
                likes=p[4],
                comments=p[5],
                shares=p[6],
                reach=p[7],
                impressions=p[7],
                saves=25,
                watch_time=p[8],
                posted_at=published,
                published_date=published,
                external_content_id=f"DEMO-{i:03d}",
            )

            db.add(content)

        print("Content demo data prepared.")

    else:
        print("Content data already exists. Skipping content seed.")

    # ---------------------------------------------------------
    # COMMIT
    # ---------------------------------------------------------
    db.commit()

    print("Demo data inserted successfully.")

except Exception as e:

    db.rollback()

    print("ERROR while inserting demo data:")
    print(e)

    raise

finally:

    db.close()