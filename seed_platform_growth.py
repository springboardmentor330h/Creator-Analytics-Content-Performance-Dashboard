
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.platform_growth import PlatformGrowth


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

CREATOR_ID = 2

MOCK_PLATFORMS = {
    "Facebook": {
        "start_followers": 120000,
        "daily_growth": 400
    },

    "LinkedIn": {
        "start_followers": 80000,
        "daily_growth": 300
    },

    "TikTok": {
        "start_followers": 150000,
        "daily_growth": 700
    },

    "X": {
        "start_followers": 60000,
        "daily_growth": 200
    }
}

START_DATE = date(2026, 8, 10)

NUMBER_OF_DAYS = 30


# ---------------------------------------------------------
# Generate mock platform growth
# ---------------------------------------------------------

def generate_platform_growth():

    db = SessionLocal()

    try:

        # -------------------------------------------------
        # Remove ONLY existing mock platform growth
        # -------------------------------------------------

        deleted_count = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id == CREATOR_ID,
                PlatformGrowth.platform.in_(
                    MOCK_PLATFORMS.keys()
                )
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()

        print(
            f"Existing mock platform growth removed: "
            f"{deleted_count}"
        )

        rows = []

        # -------------------------------------------------
        # Generate 30 days of mock data
        # -------------------------------------------------

        for platform, data in MOCK_PLATFORMS.items():

            for day in range(NUMBER_OF_DAYS):

                current_date = (
                    START_DATE
                    + timedelta(days=day)
                )

                followers = (
                    data["start_followers"]
                    + (
                        day
                        * data["daily_growth"]
                    )
                )

                rows.append(
                    PlatformGrowth(
                        creator_id=CREATOR_ID,
                        platform=platform,
                        date=current_date,
                        followers=followers
                    )
                )

        # -------------------------------------------------
        # Insert mock records
        # -------------------------------------------------

        db.add_all(rows)

        db.commit()

        print(
            f"Mock platform growth records added: "
            f"{len(rows)}"
        )

        # -------------------------------------------------
        # Verification
        # -------------------------------------------------

        for platform in MOCK_PLATFORMS:

            count = (
                db.query(PlatformGrowth)
                .filter(
                    PlatformGrowth.creator_id
                    == CREATOR_ID,
                    PlatformGrowth.platform
                    == platform
                )
                .count()
            )

            print(
                f"{platform}: {count} records"
            )

        # -------------------------------------------------
        # Verify real platforms were not modified
        # -------------------------------------------------

        youtube_count = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id
                == CREATOR_ID,
                PlatformGrowth.platform
                == "YouTube"
            )
            .count()
        )

        instagram_count = (
            db.query(PlatformGrowth)
            .filter(
                PlatformGrowth.creator_id
                == CREATOR_ID,
                PlatformGrowth.platform
                == "Instagram"
            )
            .count()
        )

        print(
            f"YouTube records preserved: "
            f"{youtube_count}"
        )

        print(
            f"Instagram records preserved: "
            f"{instagram_count}"
        )

    except Exception as e:

        db.rollback()

        print(
            "Error while inserting mock "
            "platform growth data:"
        )

        print(e)

    finally:

        db.close()


# ---------------------------------------------------------
# Run script
# ---------------------------------------------------------

if __name__ == "__main__":
    generate_platform_growth()

