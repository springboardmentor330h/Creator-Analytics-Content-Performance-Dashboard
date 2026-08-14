import random
from datetime import date, timedelta
from app.db.database import SessionLocal
from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth

# Seed options
COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Germany"]
CITIES = ["Bangalore", "Mumbai", "New York", "London", "Toronto"]
AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54"]
GENDERS = ["Male", "Female"]
DEVICES = ["Mobile", "Desktop", "Tablet"]


def seed_database(count: int = 100):
    db = SessionLocal()
    try:
        print("Seeding database for Sprint 3...")

        # 1. Seed Audience records
        audience_list = []
        for i in range(1, 50):
            aud = Audience(
                creator_id=random.randint(1, 10),
                age_group=random.choice(AGE_GROUPS),
                gender=random.choice(GENDERS),
                country=random.choice(COUNTRIES),
                city=random.choice(CITIES),
                device_type=random.choice(DEVICES),
                active_hour=random.randint(0, 23),
                followers=random.randint(1000, 10000),
                impressions=random.randint(5000, 50000),
                reach=random.randint(3000, 30000),
            )
            audience_list.append(aud)

        db.add_all(audience_list)

        # 2. Seed 30-day Growth historical trend records
        growth_list = []
        base_followers = 100000
        start_date = date(2026, 7, 1)

        for day in range(30):
            daily_date = start_date + timedelta(days=day)
            base_followers += random.randint(200, 1500)
            reach = random.randint(15000, 45000)
            engagement_rate = round(random.uniform(4.5, 9.8), 2)

            growth_item = Growth(
                creator_id=1,
                date=daily_date,
                followers=base_followers,
                reach=reach,
                engagement_rate=engagement_rate,
            )
            growth_list.append(growth_item)

        db.add_all(growth_list)
        db.commit()

        print("Successfully seeded Audience and Growth records into PostgreSQL!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(300)