import random
from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.content import Content

# In-memory storage for connected accounts for this sprint
CONNECTED_PLATFORMS: Dict[str, str] = {}


class SocialMediaService:

    SUPPORTED_PLATFORMS = ["YouTube", "Instagram", "Facebook", "LinkedIn", "TikTok", "X"]

    @staticmethod
    def connect_platform(platform: str, account_name: str) -> Dict[str, str]:
        CONNECTED_PLATFORMS[platform] = account_name
        return {"message": f"{platform} account connected successfully"}

    @staticmethod
    def get_connected_platforms() -> Dict[str, List[str]]:
        return {"platforms": list(CONNECTED_PLATFORMS.keys())}

    @staticmethod
    def generate_mock_platform_data(platform: str) -> List[Dict[str, Any]]:
        """Task 5: Generate simulated social media platform data."""
        sample_titles = {
            "YouTube": ["Python FastAPI Tutorial", "Fullstack Web Dev Guide", "Docker Setup Crash Course"],
            "Instagram": ["Behind the Scenes Reel", "Setup Showcase #2026", "Quick Coding Tips"],
            "Facebook": ["Community Q&A Highlights", "Weekly Dev Newsletter", "Tech Trends Discussion"],
            "LinkedIn": ["System Architecture Breakdown", "Career Growth Insights", "FastAPI vs Flask"],
            "TikTok": ["30-Sec Code Hack", "Developer Life Meme", "Keyboard ASMR"],
            "X": ["Tech Hot Take #12", "Thread on SQL Joins", "FastAPI Tip of the Day"],
        }

        titles = sample_titles.get(platform, ["Generic Tech Post"])
        mock_posts = []

        for title in titles:
            views = random.randint(5000, 50000)
            reach = int(views * random.uniform(1.1, 2.0))
            likes = int(views * random.uniform(0.05, 0.15))
            comments = int(likes * random.uniform(0.05, 0.20))
            shares = int(likes * random.uniform(0.02, 0.10))
            saves = int(likes * random.uniform(0.05, 0.25))

            mock_posts.append({
                "platform": platform,
                "content_title": title,
                "views": views,
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "saves": saves,
                "reach": reach,
                "watch_time": round(random.uniform(100.0, 5000.0), 2),
                "published_date": date.today() - timedelta(days=random.randint(1, 10)),
            })

        return mock_posts

    @staticmethod
    def sync_platform_data(db: Session, platform: str, creator_id: int = 1) -> Dict[str, Any]:
        """Task 8: Ingest, process, and store platform data in PostgreSQL."""
        if platform not in CONNECTED_PLATFORMS:
            # Fallback connection if not explicitly connected first
            CONNECTED_PLATFORMS[platform] = "DemoCreator"

        raw_data = SocialMediaService.generate_mock_platform_data(platform)
        synced_records = []

        for item in raw_data:
            content_record = Content(
                creator_id=creator_id,
                platform=item["platform"],
                content_title=item["content_title"],
                views=item["views"],
                likes=item["likes"],
                comments=item["comments"],
                shares=item["shares"],
                saves=item["saves"],
                watch_time=item["watch_time"],
                reach=item["reach"],
                published_date=item["published_date"],
            )
            db.add(content_record)
            synced_records.append(content_record)

        db.commit()

        return {
            "status": "success",
            "message": f"Successfully synchronized {len(synced_records)} items from {platform}",
            "synced_count": len(synced_records),
            "platform": platform,
        }