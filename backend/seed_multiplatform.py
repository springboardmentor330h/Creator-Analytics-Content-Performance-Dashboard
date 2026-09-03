"""
Sprint: Multi-platform analytics — bulk seed data generator.
Populates content, growth, revenue, and audience records across all 6
platforms with varied dates, performance levels, and realistic patterns,
so charts/trends/comparisons/reports have meaningful data to show.

Run: python seed_multiplatform.py   (with backend venv active, server running)
"""
import requests
import random
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000"
CREATOR_ID = 1

PLATFORMS = {
    "YouTube": {"base_views": (5000, 80000), "engagement_mult": 1.0},
    "Instagram": {"base_views": (2000, 40000), "engagement_mult": 1.4},
    "TikTok": {"base_views": (10000, 200000), "engagement_mult": 1.8},
    "Facebook": {"base_views": (1000, 15000), "engagement_mult": 0.8},
    "LinkedIn": {"base_views": (500, 8000), "engagement_mult": 0.6},
    "X": {"base_views": (800, 20000), "engagement_mult": 1.1},
}

TITLE_POOL = [
    "How I built a FastAPI backend", "5 tips for React performance", "Docker in 10 minutes",
    "Building a creator analytics dashboard", "SQL joins explained", "Behind the scenes of my workflow",
    "System design basics", "Weekly dev update", "My coding setup 2026", "Debugging like a pro",
    "Career advice for developers", "PostgreSQL vs MongoDB", "Clean architecture explained",
    "Building in public: week 12", "Top 3 VS Code extensions", "Async Python deep dive",
]

# ---- 1. Content: ~120 records over 6 months, across all platforms ----
print("Seeding content records...")
content_created = 0
for _ in range(120):
    platform = random.choice(list(PLATFORMS.keys()))
    cfg = PLATFORMS[platform]
    views = random.randint(*cfg["base_views"])
    engagement_factor = cfg["engagement_mult"]

    likes = int(views * random.uniform(0.03, 0.09) * engagement_factor)
    comments = int(views * random.uniform(0.005, 0.02) * engagement_factor)
    shares = int(views * random.uniform(0.002, 0.015) * engagement_factor)
    reach = int(views * random.uniform(1.1, 1.6))
    published = date.today() - timedelta(days=random.randint(1, 180))

    payload = {
        "creator_id": CREATOR_ID,
        "platform": platform,
        "content_title": f"{random.choice(TITLE_POOL)} #{random.randint(1, 999)}",
        "views": views,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": int(views * random.uniform(0.001, 0.01)),
        "watch_time": int(views * random.uniform(0.3, 2.5)),
        "reach": reach,
        "published_date": published.isoformat(),
    }
    r = requests.post(f"{BASE_URL}/content", json=payload)
    if r.status_code == 201:
        content_created += 1

print(f"  -> {content_created} content records created")

# ---- 2. Growth: 90 days of daily follower/reach/engagement history ----
print("Seeding growth records...")
growth_created = 0
followers = 8000
for i in range(90):
    day = date.today() - timedelta(days=90 - i)
    # gradual upward trend with some noise, occasional dips
    daily_change = random.randint(-30, 180)
    followers = max(followers + daily_change, 100)
    reach = int(followers * random.uniform(2, 5))
    engagement_rate = round(random.uniform(3.5, 9.5), 2)

    payload = {"creator_id": CREATOR_ID, "date": day.isoformat(), "followers": followers,
               "reach": reach, "engagement_rate": engagement_rate}
    r = requests.post(f"{BASE_URL}/growth", json=payload)
    if r.status_code == 201:
        growth_created += 1

print(f"  -> {growth_created} growth records created")

# ---- 3. Revenue: ~40 records across 5 sources, spread over 6 months ----
print("Seeding revenue records...")
SOURCES = ["sponsorship", "ad_revenue", "affiliate", "brand_collab", "subscription"]
revenue_created = 0
for _ in range(40):
    source = random.choice(SOURCES)
    platform = random.choice(list(PLATFORMS.keys()))
    amount = round(random.uniform(50, 3000), 2)
    earned = date.today() - timedelta(days=random.randint(1, 180))

    payload = {"creator_id": CREATOR_ID, "platform": platform, "source": source,
               "description": f"{source.replace('_', ' ').title()} via {platform}",
               "amount": amount, "currency": "USD", "earned_date": earned.isoformat()}
    r = requests.post(f"{BASE_URL}/revenue", json=payload)
    if r.status_code == 201:
        revenue_created += 1

print(f"  -> {revenue_created} revenue records created")

# ---- 4. Audience: demographic records across countries/devices/age groups ----
print("Seeding audience records...")
AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45+"]
GENDERS = ["male", "female", "other"]
COUNTRIES = ["India", "United States", "United Kingdom", "Brazil", "Germany", "Canada"]
CITIES = ["Mumbai", "New York", "London", "Sao Paulo", "Berlin", "Toronto"]
DEVICES = ["Mobile", "Desktop", "Tablet"]

audience_created = 0
for _ in range(25):
    idx = random.randint(0, len(COUNTRIES) - 1)
    payload = {
        "creator_id": CREATOR_ID,
        "age_group": random.choice(AGE_GROUPS),
        "gender": random.choice(GENDERS),
        "country": COUNTRIES[idx],
        "city": CITIES[idx],
        "device_type": random.choice(DEVICES),
        "active_hour": random.randint(6, 23),
        "followers": random.randint(500, 15000),
        "impressions": random.randint(2000, 60000),
        "reach": random.randint(1500, 45000),
    }
    r = requests.post(f"{BASE_URL}/audience", json=payload)
    if r.status_code == 201:
        audience_created += 1

print(f"  -> {audience_created} audience records created")
print("\nSeeding complete.")