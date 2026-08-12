from typing import Dict, List, Optional 
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import db
from app.models.content import Content
def calculate_engagement_rate(content: Content) -> float:
    # Calculate the engagement rate for a given content item.
    if not content.reach or content.reach == 0:
        return 0.0
    total_engagement = content.likes + content.comments + content.shares
    engagement_rate = (total_engagement / content.reach) * 100
    return engagement_rate

class AnalyticsService:
    
    @staticmethod
    def get_content_engagement(db: Session,content_id: int) -> Optional[Dict]:
        # Engagement Metrics for a specific content item
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return None
        total_engagement = content.likes + content.comments + content.shares
        engagement_rate = calculate_engagement_rate(content)
        return {
            "content_id": content.id,
            "platform": content.platform,
            "views": content.views,
            "reach": content.reach,
            "total_engagement": total_engagement,
            "engagement_rate": engagement_rate,
        }
        
    @staticmethod
    def get_top_performing_content(db: Session, limit: int = 5) -> List[Dict]:
        # Top performing content
        all_content = db.query(Content).all()
        if not all_content:
            return []
        
        ranked_content = []
        for content in all_content:
            engagement_rate = calculate_engagement_rate(content)
            ranked_content.append(
                {
                    "content_id": content.id,
                    "content_title": content.content_title,
                    "platform": content.platform,
                    "views": content.views,
                    "reach": content.reach,
                    "watch_time": content.watch_time,
                    "engagement_rate": engagement_rate,
                }
            )
            ranked_content.sort(key=lambda x: x["engagement_rate"], reverse=True)
        return ranked_content[:limit]
    
    @staticmethod
    def get_platform_performance(db: Session) -> List[Dict]:
        # Platform performance metrics
        platform_metrics = (
            db.query(
                Content.platform,
                func.sum(Content.views).label("total_views"),
                func.sum(Content.reach).label("total_reach"),
                func.sum(Content.likes + Content.comments + Content.shares).label("total_engagement"),
            )
            .group_by(Content.platform)
            .all()
        )
        result = []
        for platform, total_views, total_reach, total_engagement in platform_metrics:
            engagement_rate = (total_engagement / total_reach) * 100 if total_reach else 0.0
            result.append(
                {
                    "platform": platform,
                    "total_views": total_views,
                    "total_reach": total_reach,
                    "total_engagement": total_engagement,
                    "engagement_rate": engagement_rate,
                }
            )
        return result
    
    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict:
        # Summary of overall performance metrics
        total_views = db.query(func.sum(Content.views)).scalar() or 0
        total_reach = db.query(func.sum(Content.reach)).scalar() or 0
        total_engagement = db.query(func.sum(Content.likes + Content.comments + Content.shares)).scalar() or 0
        engagement_rate = (total_engagement / total_reach) * 100 if total_reach else 0.0
        
        return {
            "total_views": total_views,
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "engagement_rate": engagement_rate,
        }