import random

from app.db.database import SessionLocal
from app.models.audience import Audience


db = SessionLocal()

try:
    current_count = db.query(Audience).count()

    if current_count >= 500:
        print(f"Audience records already exist: {current_count}")
    else:
        records_needed = 500 - current_count

        random.seed(42)

        age_groups = [
            "18-24",
            "25-34",
            "35-44",
            "45-54",
            "55+"
        ]

        genders = [
            "Male",
            "Female",
            "Other"
        ]

        locations = [
            ("India", "Bangalore"),
            ("India", "Hyderabad"),
            ("India", "Mumbai"),
            ("India", "Delhi"),
            ("India", "Chennai"),
            ("USA", "New York"),
            ("USA", "Los Angeles"),
            ("UK", "London"),
            ("Canada", "Toronto"),
            ("Australia", "Sydney")
        ]

        devices = [
            "Mobile",
            "Desktop",
            "Tablet"
        ]

        audience_records = []

        for i in range(records_needed):

            country, city = random.choice(locations)

            record = Audience(
                creator_id=1,
                age_group=random.choice(age_groups),
                gender=random.choice(genders),
                country=country,
                city=city,
                device_type=random.choice(devices),
                active_hour=random.randint(0, 23),
                followers=random.randint(5000, 50000),
                impressions=random.randint(20000, 100000),
                reach=random.randint(10000, 80000)
            )

            audience_records.append(record)

        db.add_all(audience_records)
        db.commit()

        final_count = db.query(Audience).count()

        print(f"Previous records: {current_count}")
        print(f"Records added: {records_needed}")
        print(f"Total audience records: {final_count}")

finally:
    db.close()