from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.content import Content
from app.models.growth import Growth
from app.models.audience import Audience


class AnalyticsService:

    @staticmethod
    def get_kpi_summary(db: Session, creator_id: int = 1) -> Dict[str, Any]:
        # Aggregate totals from Content table
        content_stats = (
            db.query(
                func.coalesce(func.sum(Content.views), 0).label("total_views"),
                func.coalesce(func.sum(Content.likes), 0).label("total_likes"),
                func.coalesce(func.sum(Content.comments), 0).label("total_comments"),
                func.coalesce(func.sum(Content.shares), 0).label("total_shares"),
                func.coalesce(func.sum(Content.reach), 0).label("total_reach"),
            )
            .filter(Content.creator_id == creator_id)
            .first()
        )

        # Get latest total followers from Growth table (or sum from Audience)
        latest_growth = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.desc())
            .first()
        )
        if latest_growth:
            total_followers = latest_growth.followers
        else:
            total_followers = (
                db.query(func.coalesce(func.sum(Audience.followers), 0))
                .filter(Audience.creator_id == creator_id)
                .scalar()
            )

        # Calculate Average Engagement Rate
        total_reach = content_stats.total_reach or 1
        total_interactions = (
            content_stats.total_likes
            + content_stats.total_comments
            + content_stats.total_shares
        )
        avg_engagement = round((total_interactions / total_reach) * 100, 2)

        return {
            "total_views": int(content_stats.total_views),
            "total_likes": int(content_stats.total_likes),
            "total_comments": int(content_stats.total_comments),
            "total_shares": int(content_stats.total_shares),
            "total_reach": int(content_stats.total_reach),
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
        values = [r.engagement_rate for r in records]

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
        values = [r.followers for r in records]

        return {"labels": labels, "values": values}

    @staticmethod
    def get_platform_comparison(db: Session, creator_id: int = 1) -> Dict[str, Any]:
        platform_stats = (
            db.query(
                Content.platform,
                func.coalesce(func.sum(Content.views), 0).label("views"),
                func.coalesce(func.sum(Content.reach), 0).label("reach"),
                func.coalesce(func.sum(Content.likes), 0).label("likes"),
                func.coalesce(func.sum(Content.comments), 0).label("comments"),
                func.coalesce(func.sum(Content.shares), 0).label("shares"),
                func.coalesce(func.sum(Content.saves), 0).label("saves"),
            )
            .filter(Content.creator_id == creator_id)
            .group_by(Content.platform)
            .all()
        )

        comparison = {}
        for row in platform_stats:
            reach = row.reach if row.reach > 0 else 1
            interactions = row.likes + row.comments + row.shares + row.saves
            engagement_rate = round((interactions / reach) * 100, 2)

            comparison[row.platform] = {
                "views": int(row.views),
                "reach": int(row.reach),
                "likes": int(row.likes),
                "comments": int(row.comments),
                "engagement_rate": engagement_rate,
            }

        return comparison