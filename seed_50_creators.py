"""Create 50 simple demo creator accounts.

Safe to re-run:
- Existing accounts are skipped.
- Existing data is never deleted or modified.
"""

from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.services.user_service import UserService


PASSWORD = "123456"


def create_creators():
    db = SessionLocal()

    created = 0
    skipped = 0

    try:
        for i in range(1, 51):
            name = f"Creator {i}"
            email = f"creator{i}@test.com"

            existing = UserService.get_by_email(db, email)

            if existing:
                print(f"SKIP: {email} already exists (id={existing.id})")
                skipped += 1
                continue

            UserService.create(
                db,
                UserCreate(
                    full_name=name,
                    email=email,
                    password=PASSWORD,
                    role=UserRole.CREATOR,
                    bio=f"Demo creator account {i}",
                ),
            )

            print(f"CREATED: {name} | {email}")
            created += 1

        print()
        print("=" * 50)
        print("CREATOR SEEDING COMPLETE")
        print(f"Created: {created}")
        print(f"Skipped: {skipped}")
        print(f"Total accounts checked: {created + skipped}")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print()
        print("ERROR: Creator seeding failed.")
        print(repr(e))
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_creators()