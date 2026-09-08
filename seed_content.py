
import random
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.content import Content


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

RECORDS_PER_PLATFORM = 100

CREATOR_IDS = [2]

MOCK_PLATFORMS = [
    "Facebook",
    "LinkedIn",
    "TikTok",
    "X",
]

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
    "Backend Developer Roadmap",
    "Learn Python from Scratch",
    "Building Production APIs",
    "Modern Backend Development",
    "Python Developer Career Guide",
]

CONTENT_TYPES = [
    "Video",
    "Tutorial",
    "Post",
    "Reel",
    "Article",
]


# ---------------------------------------------------------
# Platform-specific ranges
# ---------------------------------------------------------

PLATFORM_RANGES = {
    "Facebook": {
        "views": (5000, 40000),
        "like_rate": (0.03, 0.10),
        "comment_rate": (0.005, 0.025),
        "share_rate": (0.005, 0.03),
        "save_rate": (0.002, 0.01),
        "reach_multiplier": (0.9, 1.4),
    },

    "LinkedIn": {
        "views": (3000, 30000),
        "like_rate": (0.04, 0.12),
        "comment_rate": (0.005, 0.03),
        "share_rate": (0.003, 0.02),
        "save_rate": (0.002, 0.01),
        "reach_multiplier": (0.9, 1.5),
    },

    "TikTok": {
        "views": (10000, 100000),
        "like_rate": (0.05, 0.15),
        "comment_rate": (0.005, 0.04),
        "share_rate": (0.005, 0.04),
        "save_rate": (0.005, 0.03),
        "reach_multiplier": (0.85, 1.2),
    },

    "X": {
        "views": (2000, 25000),
        "like_rate": (0.02, 0.10),
        "comment_rate": (0.002, 0.02),
        "share_rate": (0.003, 0.025),
        "save_rate": (0.001, 0.01),
        "reach_multiplier": (0.9, 1.4),
    },
}


# ---------------------------------------------------------
# Generate sample data
# ---------------------------------------------------------

def generate_content():

    db = SessionLocal()

    try:

        random.seed(42)

        # -------------------------------------------------
        # Remove existing mock records only
        # -------------------------------------------------

        deleted_count = (
            db.query(Content)
            .filter(
                Content.platform.in_(MOCK_PLATFORMS)
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()

        print(
            f"Existing mock records removed: {deleted_count}"
        )

        rows = []

        start_date = date(2026, 1, 1)

        # -------------------------------------------------
        # Generate records
        # -------------------------------------------------

        for platform in MOCK_PLATFORMS:

            settings = PLATFORM_RANGES[platform]

            for index in range(RECORDS_PER_PLATFORM):

                # Views
                views = random.randint(
                    settings["views"][0],
                    settings["views"][1]
                )

                # Likes
                likes = random.randint(
                    int(
                        views
                        * settings["like_rate"][0]
                    ),
                    int(
                        views
                        * settings["like_rate"][1]
                    )
                )

                # Comments
                comments = random.randint(
                    int(
                        views
                        * settings["comment_rate"][0]
                    ),
                    int(
                        views
                        * settings["comment_rate"][1]
                    )
                )

                # Shares
                shares = random.randint(
                    int(
                        views
                        * settings["share_rate"][0]
                    ),
                    int(
                        views
                        * settings["share_rate"][1]
                    )
                )

                # Saves
                saves = random.randint(
                    int(
                        views
                        * settings["save_rate"][0]
                    ),
                    int(
                        views
                        * settings["save_rate"][1]
                    )
                )

                # Reach
                reach = int(
                    views
                    * random.uniform(
                        settings["reach_multiplier"][0],
                        settings["reach_multiplier"][1]
                    )
                )

                # Watch time
                watch_time = random.randint(
                    300,
                    7200
                )

                # Total engagement
                total_engagement = (
                    likes
                    + comments
                    + shares
                    + saves
                )

                # Engagement rate
                if reach > 0:

                    engagement_rate = (
                        total_engagement
                        / reach
                    ) * 100

                else:

                    engagement_rate = 0.0

                # Historical date
                published_date = (
                    start_date
                    + timedelta(
                        days=random.randint(
                            0,
                            250
                        )
                    )
                )

                # Unique external ID
                external_content_id = (
                    f"{platform.lower()}_mock_"
                    f"{index + 1:03d}"
                )

                # Create Content object
                content = Content(

                    creator_id=random.choice(
                        CREATOR_IDS
                    ),

                    content_title=random.choice(
                        CONTENT_TITLES
                    ),

                    platform=platform,

                    external_content_id=(
                        external_content_id
                    ),

                    content_type=random.choice(
                        CONTENT_TYPES
                    ),

                    views=views,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    saves=saves,
                    watch_time=watch_time,
                    reach=reach,

                    published_date=(
                        published_date
                    ),

                    engagement_rate=round(
                        engagement_rate,
                        2
                    ),
                )

                rows.append(content)

        # -------------------------------------------------
        # Insert records
        # -------------------------------------------------

        db.add_all(rows)

        db.commit()

        # -------------------------------------------------
        # Verification
        # -------------------------------------------------

        print(
            f"Mock records added: {len(rows)}"
        )

        for platform in MOCK_PLATFORMS:

            count = (
                db.query(Content)
                .filter(
                    Content.platform == platform
                )
                .count()
            )

            print(
                f"{platform}: {count} records"
            )

        total_count = (
            db.query(Content).count()
        )

        print(
            f"Total content records in database: "
            f"{total_count}"
        )

    except Exception as e:

        db.rollback()

        print(
            "Error while inserting mock content data:"
        )

        print(e)

    finally:

        db.close()


# ---------------------------------------------------------
# Run script
# ---------------------------------------------------------

if __name__ == "__main__":
    generate_content()

