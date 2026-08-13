from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.models.content import Content

class AnalyticsService:

    @staticmethod
    def calculate_engagement_rate(likes: int, comments: int, shares: int, saves: int, reach: int) -> float:
        total_engagement = (likes or 0) + (comments or 0) + (shares or 0) + (saves or 0)
        if reach and reach > 0:
            return round((total_engagement / reach) * 100.0, 2)
        return 0.0

    @staticmethod
    def get_content_engagement(db: Session, content_id: int) -> Optional[Dict[str, Any]]:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return None

        likes = content.likes or 0
        comments = content.comments or 0
        shares = content.shares or 0
        saves = content.saves or 0
        reach = content.reach or 0
        total_engagement = likes + comments + shares + saves
        engagement_rate = AnalyticsService.calculate_engagement_rate(likes, comments, shares, saves, reach)

        return {
            "content_id": content.id,
            "platform": content.platform,
            "views": content.views or 0,
            "reach": reach,
            "total_engagement": total_engagement,
            "engagement_rate": engagement_rate
        }

    @staticmethod
    def get_top_performing_content(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        contents = db.query(Content).all()
        items = []
        for item in contents:
            eng_rate = AnalyticsService.calculate_engagement_rate(
                item.likes, item.comments, item.shares, item.saves, item.reach
            )
            items.append({
                "content_id": item.id,
                "content_title": item.content_title,
                "platform": item.platform,
                "views": item.views or 0,
                "reach": item.reach or 0,
                "watch_time": item.watch_time or 0,
                "engagement_rate": eng_rate
            })

        items.sort(key=lambda x: x["engagement_rate"], reverse=True)
        return items[:limit]

    @staticmethod
    def get_platform_performance(db: Session) -> List[Dict[str, Any]]:
        contents = db.query(Content).all()
        platform_map: Dict[str, Dict[str, Any]] = {}

        for item in contents:
            p = item.platform
            if p not in platform_map:
                platform_map[p] = {
                    "platform": p,
                    "total_views": 0,
                    "total_likes": 0,
                    "total_comments": 0,
                    "total_reach": 0,
                    "rates": []
                }
            platform_map[p]["total_views"] += (item.views or 0)
            platform_map[p]["total_likes"] += (item.likes or 0)
            platform_map[p]["total_comments"] += (item.comments or 0)
            platform_map[p]["total_reach"] += (item.reach or 0)
            rate = AnalyticsService.calculate_engagement_rate(
                item.likes, item.comments, item.shares, item.saves, item.reach
            )
            platform_map[p]["rates"].append(rate)

        result = []
        for p, data in platform_map.items():
            avg_rate = round(sum(data["rates"]) / len(data["rates"]), 2) if data["rates"] else 0.0
            result.append({
                "platform": data["platform"],
                "total_views": data["total_views"],
                "total_likes": data["total_likes"],
                "total_comments": data["total_comments"],
                "total_reach": data["total_reach"],
                "average_engagement_rate": avg_rate
            })
        return result

    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict[str, Any]:
        contents = db.query(Content).all()
        total_content = len(contents)
        if total_content == 0:
            return {
                "total_content": 0,
                "total_views": 0,
                "total_reach": 0,
                "average_engagement_rate": 0.0,
                "best_platform": None,
                "top_content": None
            }

        total_views = sum(item.views or 0 for item in contents)
        total_reach = sum(item.reach or 0 for item in contents)

        rates = [
            AnalyticsService.calculate_engagement_rate(
                item.likes, item.comments, item.shares, item.saves, item.reach
            )
            for item in contents
        ]
        avg_eng_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

        top_items = AnalyticsService.get_top_performing_content(db, limit=1)
        top_content = top_items[0]["content_title"] if top_items else None

        platforms = AnalyticsService.get_platform_performance(db)
        best_platform = max(platforms, key=lambda x: x["average_engagement_rate"])["platform"] if platforms else None

        return {
            "total_content": total_content,
            "total_views": total_views,
            "total_reach": total_reach,
            "average_engagement_rate": avg_eng_rate,
            "best_platform": best_platform,
            "top_content": top_content
        }
