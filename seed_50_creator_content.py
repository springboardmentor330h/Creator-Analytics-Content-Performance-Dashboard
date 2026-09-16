"""Seed 20 content records per platform for 50 demo creators.

Safe to re-run:
- Existing records are skipped.
- Existing users/data are not deleted or modified.
"""

from app.db.database import SessionLocal
from app.models.user import User
from app.models.content import Content
from app.services.social_service import SUPPORTED_PLATFORMS, generate_mock_content


CREATOR_EMAIL_PREFIX = "creator"
CREATOR_EMAIL_DOMAIN = "@test.com"
CONTENT_PER_PLATFORM = 20


def seed_content():
    db = SessionLocal()

    inserted = 0
    skipped = 0

    try:
        creators = (
            db.query(User)
            .filter(
                User.email.like(f"{CREATOR_EMAIL_PREFIX}%{CREATOR_EMAIL_DOMAIN}")
            )
            .order_by(User.id)
            .all()
        )

        print(f"Found {len(creators)} demo creators.")
        print()

        for creator in creators:
            print(f"Processing {creator.full_name} (id={creator.id})...")

            for platform in SUPPORTED_PLATFORMS:
                rows = generate_mock_content(
                    platform=platform,
                    creator_id=creator.id,
                    count=CONTENT_PER_PLATFORM,
                )

                for row in rows:
                    existing = (
                        db.query(Content)
                        .filter(
                            Content.creator_id == creator.id,
                            Content.platform == platform,
                            Content.external_content_id
                            == row["external_content_id"],
                        )
                        .first()
                    )

                    if existing:
                        skipped += 1
                        continue

                    db.add(Content(**row))
                    inserted += 1

            db.commit()

        print()
        print("=" * 60)
        print("CONTENT SEEDING COMPLETE")
        print("=" * 60)
        print(f"Creators processed: {len(creators)}")
        print(f"Platforms: {len(SUPPORTED_PLATFORMS)}")
        print(f"Content per platform: {CONTENT_PER_PLATFORM}")
        print(f"Expected new records: {len(creators) * len(SUPPORTED_PLATFORMS) * CONTENT_PER_PLATFORM}")
        print(f"Inserted: {inserted}")
        print(f"Skipped: {skipped}")
        print(f"Total checked: {inserted + skipped}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print()
        print("ERROR: Content seeding failed.")
        print(repr(e))
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_content()