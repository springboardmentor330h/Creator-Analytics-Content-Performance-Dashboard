from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.content import Content
from app.models.growth import Growth


class AnalyticsService:

    @staticmethod
    def _get_follower_count(record: Any) -> int:
        """Safely extracts follower/subscriber count regardless of model field name."""
        if not record:
            return 0
        for attr in ["followers", "follower_count", "subscribers", "total_followers"]:
            if hasattr(record, attr):
                return getattr(record, attr) or 0
        return 0

    @staticmethod
    def _normalize_platform_name(platform: str | None) -> str:
        if not platform:
            return "Unknown"

        platform_map = {
            "youtube": "YouTube",
            "instagram": "Instagram",
            "linkedin": "LinkedIn",
            "facebook": "Facebook",
            "tiktok": "TikTok",
            "x": "X",
        }
        return platform_map.get(platform.strip().lower(), platform.strip().title())

    @staticmethod
    def get_kpi_summary(db: Session, creator_id: int = 1, platform: str | None = None) -> Dict[str, Any]:
        query = db.query(
            func.coalesce(func.sum(Content.views), 0).label("total_views"),
            func.coalesce(func.sum(Content.likes), 0).label("total_likes"),
            func.coalesce(func.sum(Content.comments), 0).label("total_comments"),
            func.coalesce(func.sum(Content.shares), 0).label("total_shares"),
            func.coalesce(func.sum(Content.reach), 0).label("total_reach"),
        ).filter(Content.creator_id == creator_id)

        if platform and platform.lower() != "all":
            query = query.filter(func.lower(Content.platform) == platform.lower())

        content_stats = query.first()

        latest_growth = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.desc())
            .first()
        )
        total_followers = AnalyticsService._get_follower_count(latest_growth)

        total_reach = int(content_stats.total_reach or 0)
        total_interactions = (
            int(content_stats.total_likes or 0)
            + int(content_stats.total_comments or 0)
            + int(content_stats.total_shares or 0)
        )
        avg_engagement = round((total_interactions / total_reach) * 100, 2) if total_reach else 0.0

        return {
            "platform": platform or "All",
            "total_views": int(content_stats.total_views or 0),
            "total_likes": int(content_stats.total_likes or 0),
            "total_comments": int(content_stats.total_comments or 0),
            "total_shares": int(content_stats.total_shares or 0),
            "total_reach": total_reach,
            "total_followers": int(total_followers),
            "average_engagement_rate": avg_engagement,
        }

    @staticmethod
    def get_engagement_chart_data(db: Session, creator_id: int = 1) -> Dict[str, Any]:
        records = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.asc())
            .all()
        )
        labels = [str(r.date) for r in records]
        values = [getattr(r, "engagement_rate", 0.0) for r in records]

        return {"labels": labels, "values": values}

    @staticmethod
    def get_follower_growth_chart_data(db: Session, creator_id: int = 1) -> Dict[str, Any]:
        records = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.asc())
            .all()
        )
        labels = [str(r.date) for r in records]
        values = [AnalyticsService._get_follower_count(r) for r in records]

        return {"labels": labels, "values": values}

    @staticmethod
    def get_platform_comparison(db: Session, creator_id: int = 1, platform: str | None = None) -> Dict[str, Any]:
        has_saves = hasattr(Content, "saves")

        query = db.query(
            func.lower(Content.platform).label("platform_key"),
            func.coalesce(func.sum(Content.views), 0).label("views"),
            func.coalesce(func.sum(Content.reach), 0).label("reach"),
            func.coalesce(func.sum(Content.likes), 0).label("likes"),
            func.coalesce(func.sum(Content.comments), 0).label("comments"),
            func.coalesce(func.sum(Content.shares), 0).label("shares"),
        ).filter(Content.creator_id == creator_id)

        if platform and platform.lower() != "all":
            query = query.filter(func.lower(Content.platform) == platform.lower())

        if has_saves:
            query = query.add_columns(func.coalesce(func.sum(Content.saves), 0).label("saves"))

        platform_stats = query.group_by(func.lower(Content.platform)).all()

        comparison = {}
        for row in platform_stats:
            reach = int(row.reach or 0)
            saves_val = int(getattr(row, "saves", 0) or 0)
            likes = int(row.likes or 0)
            comments = int(row.comments or 0)
            shares = int(row.shares or 0)
            interactions = likes + comments + shares + saves_val
            engagement_rate = round((interactions / reach) * 100, 2) if reach else 0.0
            platform_name = AnalyticsService._normalize_platform_name(row.platform_key)

            comparison[platform_name] = {
                "views": int(row.views or 0),
                "reach": reach,
                "likes": likes,
                "comments": comments,
                "engagement_rate": engagement_rate,
            }

        return comparison