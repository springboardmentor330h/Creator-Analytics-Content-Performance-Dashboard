from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.content import Content
from backend.app.models.growth import Growth

class SocialMediaService:
    # In-memory registry of connected platforms (initial defaults + dynamically connected)
    _connected_platforms: List[str] = ["YouTube", "Instagram", "LinkedIn", "TikTok", "X"]

    # Mock data source representing multi-platform content feeds
    _mock_platform_feed: Dict[str, List[Dict[str, Any]]] = {
        "YouTube": [
            {"title": "Python FastAPI & PostgreSQL Masterclass", "views": 25000, "likes": 2100, "comments": 320, "shares": 180, "reach": 30000},
            {"title": "React 19 & Next.js Architecture Deep Dive", "views": 18000, "likes": 1600, "comments": 210, "shares": 140, "reach": 22000}
        ],
        "Instagram": [
            {"title": "10 Minimal Design System Guidelines", "views": 18000, "likes": 2400, "comments": 290, "shares": 350, "reach": 24000},
            {"title": "A Day in the Life of a Senior Software Engineer", "views": 32000, "likes": 4100, "comments": 510, "shares": 620, "reach": 41000}
        ],
        "Facebook": [
            {"title": "Tech Community Highlights & Updates", "views": 12000, "likes": 950, "comments": 140, "shares": 110, "reach": 15000}
        ],
        "LinkedIn": [
            {"title": "Building High Performance Microservices in 2026", "views": 14000, "likes": 1800, "comments": 220, "shares": 290, "reach": 19000},
            {"title": "Why Clean Architecture Matters in Large Teams", "views": 9500, "likes": 1100, "comments": 130, "shares": 180, "reach": 12500}
        ],
        "TikTok": [
            {"title": "Crazy CSS Trick You Didn't Know! ⚡", "views": 45000, "likes": 6200, "comments": 780, "shares": 950, "reach": 58000},
            {"title": "Top 3 Developer Productivity Extensions", "views": 29000, "likes": 3800, "comments": 410, "shares": 520, "reach": 37000}
        ],
        "X": [
            {"title": "10 Thread Tips on Building AI Agents", "views": 38000, "likes": 3200, "comments": 450, "shares": 720, "reach": 46000}
        ]
    }

    @classmethod
    def connect_account(cls, platform: str, account_name: str) -> Dict[str, str]:
        p_clean = platform.strip()
        if p_clean not in cls._connected_platforms:
            cls._connected_platforms.append(p_clean)
        return {"message": f"{p_clean} account connected successfully"}

    @classmethod
    def get_connected_platforms(cls) -> List[str]:
        return list(cls._connected_platforms)

    @classmethod
    def sync_platform_data(cls, db: Session, platform: Optional[str] = None, creator_id: int = 1) -> Dict[str, Any]:
        """
        Synchronize mock social media data directly into PostgreSQL contents & growth tables.
        """
        target_platforms = [platform] if (platform and platform != "All") else cls._connected_platforms
        synced_count = 0
        processed_items = []

        today = date.today()

        for p in target_platforms:
            items = cls._mock_platform_feed.get(p, [
                {"title": f"{p} Trending Content Update", "views": 15000, "likes": 1200, "comments": 150, "shares": 100, "reach": 18000}
            ])

            for idx, item in enumerate(items):
                pub_date = today - timedelta(days=idx * 3 + 1)
                existing = db.query(Content).filter(
                    Content.creator_id == creator_id,
                    Content.platform == p,
                    Content.content_title == item["title"]
                ).first()

                if not existing:
                    new_c = Content(
                        creator_id=creator_id,
                        platform=p,
                        content_title=item["title"],
                        views=item["views"],
                        likes=item["likes"],
                        comments=item["comments"],
                        shares=item["shares"],
                        saves=int(item["likes"] * 0.2),
                        watch_time=int(item["views"] * 3.5),
                        reach=item["reach"],
                        published_date=pub_date
                    )
                    db.add(new_c)
                    synced_count += 1
                    processed_items.append(f"{p}: {item['title']}")
                else:
                    existing.views = item["views"]
                    existing.likes = item["likes"]
                    existing.comments = item["comments"]
                    existing.reach = item["reach"]
                    synced_count += 1

            # Sync growth log for platform
            existing_g = db.query(Growth).filter(
                Growth.creator_id == creator_id,
                Growth.platform == p,
                Growth.date == today
            ).first()

            p_views = sum(i["views"] for i in items)
            p_likes = sum(i["likes"] for i in items)
            p_reach = sum(i["reach"] for i in items)
            p_eng = round((p_likes / p_reach * 100.0), 2) if p_reach > 0 else 5.0

            if not existing_g:
                db_g = Growth(
                    creator_id=creator_id,
                    platform=p,
                    date=today,
                    followers=int(p_views * 0.15) + 5000,
                    reach=p_reach,
                    engagement_rate=p_eng
                )
                db.add(db_g)
            else:
                existing_g.reach = p_reach
                existing_g.engagement_rate = p_eng

        db.commit()

        platform_label = platform if platform else "All Connected Platforms"
        return {
            "message": f"Successfully synchronized analytics data for {platform_label}",
            "platform": platform_label,
            "synced_records": synced_count
        }
