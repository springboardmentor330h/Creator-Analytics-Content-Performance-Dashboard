import random
from datetime import date, timedelta

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.audience import Audience
from app.models.growth import Growth

# Make sure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Get existing users to attach audience/growth data to
users = db.query(User).all()

if not users:
    print("No users found. Please run seed_data.py first to create users.")
    db.close()
    exit()

TOTAL_AUDIENCE_RECORDS = 600
records_per_user = TOTAL_AUDIENCE_RECORDS // len(users)  # 600 / 15 = 40

# ---------- Seed Audience Records ----------
age_groups = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
genders = ["male", "female", "other"]
countries = ["India", "USA", "UK", "Canada", "Australia", "Germany", "Brazil", "UAE", "Singapore"]

cities = {
    "India": [
        "Bangalore",       # Karnataka
        "Mumbai",          # Maharashtra
        "Delhi",           # Delhi
        "Chennai",         # Tamil Nadu
        "Hyderabad",       # Telangana
        "Pune",            # Maharashtra
        "Kolkata",         # West Bengal
        "Ahmedabad",       # Gujarat
        "Jaipur",          # Rajasthan
        "Lucknow",         # Uttar Pradesh
        "Chandigarh",      # Chandigarh / Punjab
        "Bhopal",          # Madhya Pradesh
        "Patna",           # Bihar
        "Kochi",           # Kerala
        "Guwahati",        # Assam
        "Indore",          # Madhya Pradesh
        "Nagpur",          # Maharashtra
        "Surat",           # Gujarat
        "Coimbatore",      # Tamil Nadu
        "Visakhapatnam",   # Andhra Pradesh
        "Amritsar",        # Punjab
        "Dehradun",        # Uttarakhand
        "Ranchi",          # Jharkhand
        "Raipur",          # Chhattisgarh
        "Bhubaneswar"      # Odisha
    ],
    "USA": ["New York", "Los Angeles", "Chicago", "Austin", "Seattle", "Miami", "Boston", "Denver"],
    "UK": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt"],
    "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador"],
    "UAE": ["Dubai", "Abu Dhabi", "Sharjah"],
    "Singapore": ["Singapore"]
}
device_types = ["Mobile", "Desktop", "Tablet"]

audience_count = 0

for user in users:
    for _ in range(records_per_user):
        country = random.choices(
            countries,
            weights=[60, 5, 5, 5, 5, 5, 5, 5, 5],
            k=1
        )[0]
        city = random.choice(cities[country])

        record = Audience(
            creator_id=user.id,
            age_group=random.choice(age_groups),
            gender=random.choice(genders),
            country=country,
            city=city,
            device_type=random.choice(device_types),
            active_hour=random.randint(0, 23),
            followers=random.randint(100, 10000),
            impressions=random.randint(1000, 50000),
            reach=random.randint(500, 30000)
        )
        db.add(record)
        audience_count += 1

db.commit()
print(f"Seeded {audience_count} audience records.")

# ---------- Seed Growth Records (30 days per user) ----------
growth_count = 0

for user in users:
    starting_followers = random.randint(1000, 20000)
    current_followers = starting_followers

    start_date = date.today() - timedelta(days=30)

    for day_offset in range(30):
        current_date = start_date + timedelta(days=day_offset)

        daily_change = random.randint(-20, 150)
        current_followers = max(0, current_followers + daily_change)

        reach = int(current_followers * random.uniform(1.2, 3.0))
        engagement_rate = round(random.uniform(1.5, 12.0), 2)

        growth_record = Growth(
            creator_id=user.id,
            date=current_date,
            followers=current_followers,
            reach=reach,
            engagement_rate=engagement_rate
        )
        db.add(growth_record)
        growth_count += 1

db.commit()
print(f"Seeded {growth_count} growth records (30 days x {len(users)} users).")

db.close()