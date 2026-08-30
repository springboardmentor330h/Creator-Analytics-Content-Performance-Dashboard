from datetime import date, timedelta

from app.db.database import Base, SessionLocal, engine
from app.models.audience import AudienceDemographics
from app.models.content import Content
from app.models.growth import ContentGrowth
from app.models.notification import Notification
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.models.user import User, UserRole
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

seed_users = [
    {
        "email": "demo@creatoriq.com",
        "full_name": "Demo Creator",
        "password": "creator123",
        "role": UserRole.CREATOR,
    },
    {
        "email": "creator2@creatoriq.com",
        "full_name": "Ariana Wells",
        "password": "creator123",
        "role": UserRole.CREATOR,
    },
    {
        "email": "agency@creatoriq.com",
        "full_name": "Northstar Agency",
        "password": "agency123",
        "role": UserRole.AGENCY,
    },
    {
        "email": "marketing@creatoriq.com",
        "full_name": "Marketing Team",
        "password": "team123",
        "role": UserRole.MARKETING_TEAM,
    },
    {
        "email": "admin@creatoriq.com",
        "full_name": "Admin User",
        "password": "admin123",
        "role": UserRole.ADMIN,
    },
]

for user_data in seed_users:
    user = db.query(User).filter(User.email == user_data["email"]).first()
    if not user:
        user = User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hash_password(user_data["password"]),
            role=user_data["role"],
        )
        db.add(user)
        print(f"{user_data['role'].value} user created: {user_data['email']} / {user_data['password']}")
    else:
        user.hashed_password = hash_password(user_data["password"])
        user.full_name = user_data["full_name"]
        user.role = user_data["role"]
        print(f"{user_data['role'].value} user already exists. Updated: {user_data['email']} / {user_data['password']}")

# Ensure the demo creator keeps ID 1 when the table is empty.
if db.query(User).filter(User.id == 1).count() == 0:
    first_user = db.query(User).filter(User.email == "demo@creatoriq.com").first()
    if first_user:
        first_user.id = 1

db.commit()

def seed_creator_analytics(db, creator_user: User):
    """Seed realistic demo analytics for a creator account."""
    if not creator_user or creator_user.role != UserRole.CREATOR:
        return

    existing_platforms = {
        (content.platform or "").lower()
        for content in db.query(Content).filter(Content.creator_id == creator_user.id).all()
    }

    base_views = 120000 + (creator_user.id * 9000)
    base_reach = 310000 + (creator_user.id * 28000)
    records_to_add = []

    if "youtube" not in existing_platforms:
        records_to_add.append(
            Content(
                creator_id=creator_user.id,
                platform="YouTube",
                content_title=f"{creator_user.full_name.split()[0]}'s Kickoff Video",
                views=base_views,
                likes=int(base_views * 0.042),
                comments=int(base_views * 0.007),
                shares=int(base_views * 0.002),
                saves=int(base_views * 0.004),
                reach=base_reach,
                published_date=date.today() - timedelta(days=12),
            )
        )

    if "instagram" not in existing_platforms:
        records_to_add.append(
            Content(
                creator_id=creator_user.id,
                platform="Instagram",
                content_title="Behind the Scenes Reel",
                views=int(base_views * 0.78),
                likes=int(base_views * 0.034),
                comments=int(base_views * 0.006),
                shares=int(base_views * 0.003),
                saves=int(base_views * 0.005),
                reach=int(base_reach * 0.74),
                published_date=date.today() - timedelta(days=8),
            )
        )

    if "linkedin" not in existing_platforms:
        records_to_add.append(
            Content(
                creator_id=creator_user.id,
                platform="LinkedIn",
                content_title="Growth Strategy Post",
                views=int(base_views * 0.33),
                likes=int(base_views * 0.014),
                comments=int(base_views * 0.002),
                shares=int(base_views * 0.001),
                saves=int(base_views * 0.002),
                reach=int(base_reach * 0.28),
                published_date=date.today() - timedelta(days=4),
            )
        )

    if records_to_add:
        db.add_all(records_to_add)

    if not db.query(Revenue).filter(Revenue.creator_id == creator_user.id).first():
        db.add_all(
            [
                Revenue(
                    creator_id=creator_user.id,
                    amount=float(4200 + creator_user.id * 300),
                    source="ad_revenue",
                    description="Brand sponsorship revenue",
                    earned_date=date.today() - timedelta(days=18),
                ),
                Revenue(
                    creator_id=creator_user.id,
                    amount=float(2600 + creator_user.id * 200),
                    source="affiliate_marketing",
                    description="Creator storefront revenue",
                    earned_date=date.today() - timedelta(days=9),
                ),
            ]
        )

    if not db.query(Sponsorship).filter(Sponsorship.creator_id == creator_user.id).first():
        db.add(
            Sponsorship(
                creator_id=creator_user.id,
                sponsor_name="Northstar Labs",
                amount=6200.0 + (creator_user.id * 300),
                description="Quarterly content partnership",
                start_date=date.today() - timedelta(days=30),
                end_date=date.today() + timedelta(days=15),
                payment_status="completed",
            )
        )

    if not db.query(AudienceDemographics).filter(AudienceDemographics.creator_id == creator_user.id).first():
        db.add_all(
            [
                AudienceDemographics(
                    creator_id=creator_user.id,
                    age_group="18-24",
                    gender="female",
                    country="United States",
                    percentage=28.5,
                ),
                AudienceDemographics(
                    creator_id=creator_user.id,
                    age_group="25-34",
                    gender="female",
                    country="United Kingdom",
                    percentage=21.2,
                ),
                AudienceDemographics(
                    creator_id=creator_user.id,
                    age_group="25-34",
                    gender="male",
                    country="Canada",
                    percentage=18.7,
                ),
                AudienceDemographics(
                    creator_id=creator_user.id,
                    age_group="35-44",
                    gender="female",
                    country="Australia",
                    percentage=13.6,
                ),
            ]
        )

    if not db.query(ContentGrowth).filter(ContentGrowth.creator_id == creator_user.id).first():
        growth_dates = [
            date.today() - timedelta(days=35),
            date.today() - timedelta(days=24),
            date.today() - timedelta(days=13),
            date.today() - timedelta(days=5),
        ]
        follower_values = [120000 + (creator_user.id * 5000), 145000 + (creator_user.id * 7000), 164000 + (creator_user.id * 9000), 188000 + (creator_user.id * 11000)]
        engagement_values = [4.2, 5.6, 6.1, 7.4]
        db.add_all(
            [
                ContentGrowth(
                    creator_id=creator_user.id,
                    date=day,
                    followers=follower,
                    engagement_rate=engagement,
                )
                for day, follower, engagement in zip(growth_dates, follower_values, engagement_values)
            ]
        )

    if not db.query(Notification).filter(Notification.creator_id == creator_user.id).first():
        db.add_all(
            [
                Notification(
                    creator_id=creator_user.id,
                    title="Audience spike detected",
                    message="Your audience grew 12.4% this week across YouTube and Instagram.",
                    category="performance",
                    is_read=False,
                ),
                Notification(
                    creator_id=creator_user.id,
                    title="Sponsorship milestone reached",
                    message="You have crossed your monthly sponsorship revenue target.",
                    category="revenue",
                    is_read=True,
                ),
            ]
        )


# Seed realistic analytics data for all creator users.
creator_users = db.query(User).filter(User.role == UserRole.CREATOR).all()
for creator_user in creator_users:
    seed_creator_analytics(db, creator_user)

db.commit()
print("\nSeeded users:")
for user in db.query(User).order_by(User.id).all():
    print(f"- {user.id}: {user.email} ({user.role.value})")

print("\nSample analytics by creator:")
for creator_user in creator_users:
    print(
        creator_user.email,
        "-> Content:",
        db.query(Content).filter(Content.creator_id == creator_user.id).count(),
        "Revenue:",
        db.query(Revenue).filter(Revenue.creator_id == creator_user.id).count(),
        "Audience:",
        db.query(AudienceDemographics).filter(AudienceDemographics.creator_id == creator_user.id).count(),
    )

db.close()
print("Database seeding completed successfully!")