import random
from datetime import date, timedelta

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.content import Content
from app.core.security import get_password_hash

# Make sure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

TOTAL_USERS = 50
TOTAL_CONTENT = 300

# ---------- Seed Users ----------
roles = ["creator", "agency", "marketing team", "administrator"]
first_names = [
    "Riya", "Aman", "Trisha", "Karan", "Sneha", "Aditi", "Rohan", "Meera",
    "Vikram", "Anjali", "Farhan", "Priya", "Sahil", "Neha", "Arjun", "Divya",
    "Rahul", "Pooja", "Aryan", "Kavya", "Nikhil", "Isha", "Varun", "Simran",
    "Aditya", "Tanvi", "Yash", "Ritu", "Manav", "Shreya", "Kabir", "Ananya",
    "Dev", "Naina", "Ishaan", "Radhika", "Siddharth", "Palak", "Harsh", "Bhavna",
    "Om", "Jhanvi", "Vivaan", "Sanya", "Reyansh", "Diya", "Ayaan", "Myra",
    "Kunal", "Tara"
]

last_names = ["Sharma", "Verma", "Gupta", "Mehta", "Iyer", "Reddy", "Nair", "Patel"]

created_users = []

for i, name in enumerate(first_names[:TOTAL_USERS], start=1):
    email = f"{name.lower()}{i}@example.com"

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        created_users.append(existing)
        continue

    user = User(
        full_name=f"{name} {random.choice(last_names)}",
        email=email,
        password=get_password_hash("password123"),
        role=random.choice(roles)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    created_users.append(user)

print(f"Seeded {len(created_users)} users.")


# ---------- Seed Content ----------
platforms = [
    "YouTube", "Instagram", "LinkedIn", "TikTok", "Facebook",
    "Twitter", "Snapchat", "Pinterest", "Threads", "Twitch"
]

title_templates = [
    "How I Grew My Channel to {n}K",
    "5 Tips for Better {platform} Content",
    "Behind the Scenes: {n} Day Challenge",
    "My Honest Review of {n} Tools",
    "Q&A: Answering Your Top Questions",
    "Tutorial: Getting Started in {n} Minutes",
    "Vlog: A Day in My Life",
    "Top {n} Mistakes Creators Make",
    "Collab Special with Guest Creator",
    "Product Launch Announcement",
    "{n} Hacks Every Creator Should Know",
    "Reacting to My Old {platform} Posts",
    "The Truth About Growing on {platform}",
    "Unboxing: {n} Products I'm Loving",
    "My {n}-Day Content Creation Routine",
    "Why I Almost Quit {platform}",
    "Ask Me Anything: Creator Edition",
    "Ranking {n} Trends This Month",
    "How to Get More Views on {platform}",
    "A Beginner's Guide to {platform} Growth",
    "{n} Lessons I Learned This Year",
    "Live Q&A Highlights",
    "My Studio Setup Tour",
    "Reacting to Fan Comments",
    "Testing {n} Viral Trends",
    "How I Plan My Content Calendar",
    "Monthly Recap: {n}K Milestone",
    "Behind the Algorithm: What Really Works",
    "My Biggest Fails as a Creator",
    "Interview With a Fellow Creator"
]

content_count = 0

for i in range(TOTAL_CONTENT):
    platform = random.choice(platforms)
    title = random.choice(title_templates).format(
        n=random.choice([5, 10, 30, 60, 100]),
        platform=platform
    )

    views = random.randint(500, 50000)
    reach = int(views * random.uniform(1.0, 1.5))
    likes = int(views * random.uniform(0.02, 0.15))
    comments = int(views * random.uniform(0.005, 0.03))
    shares = int(views * random.uniform(0.002, 0.02))
    saves = int(views * random.uniform(0.001, 0.015))
    watch_time = round(views * random.uniform(0.3, 3.0), 2)

    published_date = date(2026, 1, 1) + timedelta(days=random.randint(0, 220))

    content = Content(
        creator_id=random.choice(created_users).id,
        platform=platform,
        content_title=f"{title} #{i+1}",
        views=views,
        likes=likes,
        comments=comments,
        shares=shares,
        saves=saves,
        watch_time=watch_time,
        reach=reach,
        published_date=published_date
    )
    db.add(content)
    content_count += 1

db.commit()
print(f"Seeded {content_count} content records.")

print("\n--- Sample Seeded User Login Credentials (first 5) ---")
for user in created_users[:5]:
    print(f"{user.full_name:<20} | {user.email:<25} | password123")

db.close()