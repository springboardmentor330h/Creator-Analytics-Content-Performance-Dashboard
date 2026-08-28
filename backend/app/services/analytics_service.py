from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.models.content import Content
from backend.app.models.growth import Growth
from backend.app.models.audience import Audience

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
    def get_top_performing_content(db: Session, limit: int = 5, platform: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(Content)
        if platform and platform.lower() != "all":
            query = query.filter(Content.platform.ilike(platform))
        contents = query.all()
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
    def get_platform_performance(db: Session, platform: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(Content)
        if platform and platform.lower() != "all":
            query = query.filter(Content.platform.ilike(platform))
        contents = query.all()
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
    def get_dashboard_summary(db: Session, platform: Optional[str] = None) -> Dict[str, Any]:
        query = db.query(Content)
        if platform and platform.lower() != "all":
            query = query.filter(Content.platform.ilike(platform))
        contents = query.all()

        total_content = len(contents)
        total_views = sum(item.views or 0 for item in contents)
        total_likes = sum(item.likes or 0 for item in contents)
        total_comments = sum(item.comments or 0 for item in contents)
        total_shares = sum(item.shares or 0 for item in contents)
        total_reach = sum(item.reach or 0 for item in contents)

        aud_query = db.query(Audience)
        if platform and platform.lower() != "all":
            # Filter audience by platform if platform column exists or return sum
            aud_query = aud_query
        audience_records = aud_query.all()

        if audience_records:
            total_followers = sum(a.followers or 0 for a in audience_records)
        else:
            g_query = db.query(Growth)
            if platform and platform.lower() != "all":
                g_query = g_query.filter(Growth.platform.ilike(platform))
            latest_growth = g_query.order_by(Growth.date.desc()).first()
            total_followers = latest_growth.followers if latest_growth else 0

        rates = [
            AnalyticsService.calculate_engagement_rate(
                item.likes, item.comments, item.shares, item.saves, item.reach
            )
            for item in contents
        ]
        avg_eng_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

        top_items = AnalyticsService.get_top_performing_content(db, limit=1, platform=platform)
        top_content = top_items[0]["content_title"] if top_items else None

        platforms = AnalyticsService.get_platform_performance(db, platform=platform)
        best_platform = max(platforms, key=lambda x: x["average_engagement_rate"])["platform"] if platforms else (platform if platform and platform.lower() != "all" else "YouTube")

        return {
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_reach": total_reach,
            "total_followers": total_followers,
            "average_engagement_rate": avg_eng_rate,
            "total_content": total_content,
            "best_platform": best_platform,
            "top_content": top_content
        }

    @staticmethod
    def get_engagement_chart_data(db: Session) -> Dict[str, Any]:
        growth_records = db.query(Growth).order_by(Growth.date.asc()).all()
        if growth_records:
            labels = [str(g.date) for g in growth_records]
            values = [float(g.engagement_rate or 0.0) for g in growth_records]
        else:
            contents = db.query(Content).filter(Content.published_date.isnot(None)).order_by(Content.published_date.asc()).all()
            date_map = {}
            for c in contents:
                d_str = str(c.published_date)
                eng = AnalyticsService.calculate_engagement_rate(c.likes, c.comments, c.shares, c.saves, c.reach)
                date_map[d_str] = eng
            labels = list(date_map.keys())
            values = list(date_map.values())
        return {"labels": labels, "values": values}

    @staticmethod
    def get_follower_growth_chart_data(db: Session) -> Dict[str, Any]:
        growth_records = db.query(Growth).order_by(Growth.date.asc()).all()
        labels = [str(g.date) for g in growth_records]
        values = [int(g.followers or 0) for g in growth_records]
        return {"labels": labels, "values": values}

    @staticmethod
    def get_platform_comparison(db: Session) -> Dict[str, Any]:
        contents = db.query(Content).all()
        platform_map: Dict[str, Dict[str, Any]] = {}
        for item in contents:
            p = item.platform
            if p not in platform_map:
                platform_map[p] = {
                    "views": 0,
                    "reach": 0,
                    "likes": 0,
                    "comments": 0,
                    "shares": 0,
                    "saves": 0
                }
            platform_map[p]["views"] += (item.views or 0)
            platform_map[p]["reach"] += (item.reach or 0)
            platform_map[p]["likes"] += (item.likes or 0)
            platform_map[p]["comments"] += (item.comments or 0)
            platform_map[p]["shares"] += (item.shares or 0)
            platform_map[p]["saves"] += (item.saves or 0)

        result = {}
        for p, data in platform_map.items():
            eng_rate = AnalyticsService.calculate_engagement_rate(
                data["likes"], data["comments"], data["shares"], data["saves"], data["reach"]
            )
            result[p] = {
                "views": data["views"],
                "reach": data["reach"],
                "engagement_rate": eng_rate,
                "likes": data["likes"],
                "comments": data["comments"]
            }
        return result

    @staticmethod
    def get_reach_breakdown(db: Session) -> Dict[str, Any]:
        contents = db.query(Content).all()
        combined_total_reach = sum(item.reach or 0 for item in contents)
        combined_total_views = sum(item.views or 0 for item in contents)

        platform_map: Dict[str, Dict[str, Any]] = {}
        for item in contents:
            p = item.platform
            if p not in platform_map:
                platform_map[p] = {
                    "platform": p,
                    "reach": 0,
                    "views": 0,
                    "likes": 0
                }
            platform_map[p]["reach"] += (item.reach or 0)
            platform_map[p]["views"] += (item.views or 0)
            platform_map[p]["likes"] += (item.likes or 0)

        default_platforms = ["YouTube", "Instagram", "TikTok", "LinkedIn", "Twitter/X"]
        for p in default_platforms:
            if p not in platform_map:
                platform_map[p] = {"platform": p, "reach": 0, "views": 0, "likes": 0}

        breakdown = []
        for p, data in platform_map.items():
            pct = round((data["reach"] / combined_total_reach * 100.0), 2) if combined_total_reach > 0 else 0.0
            breakdown.append({
                "platform": p,
                "reach": data["reach"],
                "views": data["views"],
                "likes": data["likes"],
                "percentage_share": pct
            })

        breakdown.sort(key=lambda x: x["reach"], reverse=True)

        return {
            "combined_total_reach": combined_total_reach,
            "combined_total_views": combined_total_views,
            "platform_breakdown": breakdown
        }


