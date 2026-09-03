from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.content import Content

from app.services import instagram_service

Base.metadata.create_all(bind=engine)

db = SessionLocal()

users = db.query(User).all()

if not users:
    print("No users found. Please run seed_data.py first to create users.")
    db.close()
    exit()

NUM_CREATORS = 15
selected_users = users[:NUM_CREATORS]

PLATFORM_JOBS = [
    ("Instagram", instagram_service.get_account_content_in_common_format, "demo_creator_ig"),
]

total_created = 0
total_updated = 0

for user in selected_users:
    for platform_name, fetch_fn, account_id in PLATFORM_JOBS:
        try:
            records = fetch_fn(account_id, creator_id=user.id, max_results=10)
        except Exception as e:
            print(f"  Skipped {platform_name} for user {user.id}: {e}")
            continue

        for record in records:
            existing = (
                db.query(Content)
                .filter(
                    Content.platform == record["platform"],
                    Content.external_content_id == record["external_content_id"],
                    Content.creator_id == record["creator_id"]
                )
                .first()
            )

            if existing:
                for field, value in record.items():
                    if field not in ("creator_id", "platform", "external_content_id"):
                        setattr(existing, field, value)
                total_updated += 1
            else:
                db.add(Content(**record))
                total_created += 1

    db.commit()
    print(f"Synced Instagram for user {user.id} ({user.full_name})")

print(f"\nDone. Created {total_created} new records, updated {total_updated} existing records.")

db.close()