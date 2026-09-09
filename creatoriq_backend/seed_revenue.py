"""Seed realistic multi-month revenue records for CreatorIQ creators."""
from datetime import date, datetime
from typing import List, Dict, Any
from app.db.database import SessionLocal
from app.models.revenue import Revenue, REVENUE_SOURCES
from app.models.user import User

REALISTIC_TRANSACTIONS: List[Dict[str, Any]] = [
    # 2025-10 (Oct 2025)
    {"source": "Ad Revenue", "amount": 16400.0, "date": "2025-10-12", "desc": "YouTube Partner Program - AdSense Payout (Sept Views)"},
    {"source": "Subscription Revenue", "amount": 9200.0, "date": "2025-10-18", "desc": "YouTube Channel Memberships & Tier 2 Badges"},
    {"source": "Affiliate Marketing", "amount": 7800.0, "date": "2025-10-22", "desc": "Amazon Associates Tech Setup Equipment Links"},
    {"source": "Sponsorship", "amount": 38000.0, "date": "2025-10-26", "desc": "NordVPN Cybersecurity Awareness Campaign Mid-roll"},

    # 2025-11 (Nov 2025)
    {"source": "Ad Revenue", "amount": 18900.0, "date": "2025-11-10", "desc": "YouTube Partner Program - AdSense Monthly Payout"},
    {"source": "Subscription Revenue", "amount": 10500.0, "date": "2025-11-16", "desc": "Channel Memberships & SuperChat Earnings"},
    {"source": "Affiliate Marketing", "amount": 12400.0, "date": "2025-11-20", "desc": "Black Friday Tech Deals - Amazon & Impact Affiliates"},
    {"source": "Brand Collaboration", "amount": 32000.0, "date": "2025-11-25", "desc": "Keychron Mechanical Keyboards - Studio Tour Collab"},

    # 2025-12 (Dec 2025)
    {"source": "Ad Revenue", "amount": 26800.0, "date": "2025-12-11", "desc": "Q4 High CPM Holiday Surge - YouTube AdSense Payout"},
    {"source": "Subscription Revenue", "amount": 12800.0, "date": "2025-12-17", "desc": "Year-end Member Loyalty Subscriptions & Perks"},
    {"source": "Affiliate Marketing", "amount": 15600.0, "date": "2025-12-21", "desc": "Holiday Gift Guide Tech Gear Commissions"},
    {"source": "Sponsorship", "amount": 55000.0, "date": "2025-12-28", "desc": "Hostinger Year-End Web Development Special"},

    # 2026-01 (Jan 2026)
    {"source": "Ad Revenue", "amount": 15200.0, "date": "2026-01-12", "desc": "YouTube Partner Program - Post-holiday CPM Reset"},
    {"source": "Subscription Revenue", "amount": 13400.0, "date": "2026-01-18", "desc": "New Year Creator Community Pass Subscriptions"},
    {"source": "Affiliate Marketing", "amount": 8900.0, "date": "2026-01-24", "desc": "Software & Productivity SaaS Affiliate Commission"},
    {"source": "Sponsorship", "amount": 48000.0, "date": "2026-01-29", "desc": "Notion Productivity Suite 2026 Goal Planner Video"},

    # 2026-02 (Feb 2026)
    {"source": "Ad Revenue", "amount": 19400.0, "date": "2026-02-10", "desc": "YouTube Partner Program - AdSense Monthly Earnings"},
    {"source": "Subscription Revenue", "amount": 14200.0, "date": "2026-02-16", "desc": "Monthly Channel Memberships & Discord VIP Pass"},
    {"source": "Affiliate Marketing", "amount": 9800.0, "date": "2026-02-21", "desc": "Shopify Partner Referral & App Store Commission"},
    {"source": "Brand Collaboration", "amount": 35000.0, "date": "2026-02-25", "desc": "Boat Lifestyle Earphones Launch Reel Campaign"},

    # 2026-03 (Mar 2026)
    {"source": "Ad Revenue", "amount": 23500.0, "date": "2026-03-11", "desc": "YouTube Partner Program - Q1 Earnings Surge"},
    {"source": "Subscription Revenue", "amount": 15800.0, "date": "2026-03-17", "desc": "Channel Memberships & Livestream SuperThanks"},
    {"source": "Affiliate Marketing", "amount": 11200.0, "date": "2026-03-22", "desc": "Amazon Associates Camera & Lighting Gear"},
    {"source": "Sponsorship", "amount": 62000.0, "date": "2026-03-28", "desc": "Samsung Galaxy S24 Ultra - Camera & Video Deep Dive"},

    # 2026-04 (Apr 2026)
    {"source": "Ad Revenue", "amount": 21800.0, "date": "2026-04-10", "desc": "YouTube Partner Program - AdSense Monthly Payout"},
    {"source": "Subscription Revenue", "amount": 16500.0, "date": "2026-04-16", "desc": "Community Member Perks & Custom Badge Renewals"},
    {"source": "Affiliate Marketing", "amount": 10400.0, "date": "2026-04-21", "desc": "NordPass & Cloud Tools Affiliate Payouts"},
    {"source": "Sponsorship", "amount": 45000.0, "date": "2026-04-27", "desc": "Skillshare Online Learning 60s Integration Video"},

    # 2026-05 (May 2026)
    {"source": "Ad Revenue", "amount": 25600.0, "date": "2026-05-11", "desc": "YouTube Partner Program - Viral Short CPM Boost"},
    {"source": "Subscription Revenue", "amount": 17800.0, "date": "2026-05-17", "desc": "Active Channel Memberships & Member-Only Streams"},
    {"source": "Affiliate Marketing", "amount": 13200.0, "date": "2026-05-23", "desc": "Impact Radius SaaS Affiliate Revenue"},
    {"source": "Brand Collaboration", "amount": 42000.0, "date": "2026-05-28", "desc": "Logitech MX Master Studio Workspace Integration"},

    # 2026-06 (Jun 2026)
    {"source": "Ad Revenue", "amount": 28400.0, "date": "2026-06-10", "desc": "YouTube Partner Program - Mid-year Peak Views"},
    {"source": "Subscription Revenue", "amount": 18500.0, "date": "2026-06-16", "desc": "Monthly Channel Memberships & Supporter Tiers"},
    {"source": "Affiliate Marketing", "amount": 14100.0, "date": "2026-06-22", "desc": "Amazon Prime Day Prep Affiliate Commissions"},
    {"source": "Sponsorship", "amount": 65000.0, "date": "2026-06-27", "desc": "Zerodha Fintech - Tech Tools for Wealth Building"},

    # 2026-07 (Jul 2026)
    {"source": "Ad Revenue", "amount": 31200.0, "date": "2026-07-11", "desc": "YouTube Partner Program - High Summer Retention Payout"},
    {"source": "Subscription Revenue", "amount": 19800.0, "date": "2026-07-17", "desc": "Channel Memberships & SuperSticker Contributions"},
    {"source": "Affiliate Marketing", "amount": 18200.0, "date": "2026-07-23", "desc": "Prime Day Tech Haul Affiliate Commission Payout"},
    {"source": "Sponsorship", "amount": 58000.0, "date": "2026-07-29", "desc": "GitHub Copilot Developer Productivity Showcase"},

    # 2026-08 (Aug 2026)
    {"source": "Ad Revenue", "amount": 34500.0, "date": "2026-08-10", "desc": "YouTube Partner Program - Highest Monthly View Count"},
    {"source": "Subscription Revenue", "amount": 21000.0, "date": "2026-08-16", "desc": "Channel Memberships & Exclusive Discord Community"},
    {"source": "Affiliate Marketing", "amount": 16800.0, "date": "2026-08-21", "desc": "Software & Hardware Affiliate Earnings"},
    {"source": "Sponsorship", "amount": 72000.0, "date": "2026-08-26", "desc": "Ray-Ban Meta Smart Glasses Hands-On Feature"},
    {"source": "Brand Collaboration", "amount": 38000.0, "date": "2026-08-29", "desc": "Anker Prime GaN Studio Multi-Port Power System"},

    # 2026-09 (Current Month - Sep 2026)
    {"source": "Ad Revenue", "amount": 18200.0, "date": "2026-09-02", "desc": "YouTube Partner Program - Early September Realized Views"},
    {"source": "Subscription Revenue", "amount": 11500.0, "date": "2026-09-04", "desc": "September Recurring Channel Member Subscriptions"},
    {"source": "Affiliate Marketing", "amount": 9400.0, "date": "2026-09-05", "desc": "Creator Gear & Microphone Kit Affiliate Links"},
]

def seed_revenue_for_creators():
    db = SessionLocal()
    try:
        # Find target creators
        target_emails = ["suresh@gmail.com", "suresh15@gmail.com", "creator@creatoriq.dev"]
        creators = db.query(User).filter(User.email.in_(target_emails)).all()
        if not creators:
            # Fallback to any creator
            creators = db.query(User).filter(User.role == "Creator").limit(3).all()

        print(f"Found {len(creators)} creators to seed revenue: {[c.email for c in creators]}")

        for creator in creators:
            # Clean old records for clean slate
            db.query(Revenue).filter(Revenue.creator_id == creator.id).delete()

            total_amount = 0.0
            for item in REALISTIC_TRANSACTIONS:
                payout_date = datetime.strptime(item["date"], "%Y-%m-%d").date()
                record = Revenue(
                    creator_id=creator.id,
                    source=item["source"],
                    amount=item["amount"],
                    currency="INR",
                    description=item["desc"],
                    revenue_date=payout_date,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(record)
                total_amount += item["amount"]

            db.commit()
            print(f"Seeded {len(REALISTIC_TRANSACTIONS)} revenue records (Total: INR {total_amount:,.2f}) for {creator.email}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_revenue_for_creators()
