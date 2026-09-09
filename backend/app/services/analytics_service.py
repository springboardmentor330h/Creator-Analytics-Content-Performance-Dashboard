from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.models.content import Content
from backend.app.models.growth import Growth
from backend.app.models.audience import Audience

class AnalyticsService:

    @staticmethod
    def normalize_platform(platform: Optional[str]) -> Optional[str]:
        """Normalize platform filter string to standard CreatorIQ names."""
        if not platform or platform.strip().lower() in ["all", "all platforms", ""]:
            return None
        p_clean = platform.strip().lower()
        if p_clean in ["twitter", "x", "twitter/x"]:
            return "X"
        elif p_clean == "youtube":
            return "YouTube"
        elif p_clean == "instagram":
            return "Instagram"
        elif p_clean == "facebook":
            return "Facebook"
        elif p_clean == "linkedin":
            return "LinkedIn"
        return platform.strip().capitalize()

    @staticmethod
    def calculate_engagement_rate(likes: int, comments: int, shares: int, saves: int, reach: int) -> float:
        total_engagement = (likes or 0) + (comments or 0) + (shares or 0) + (saves or 0)
        if reach and reach > 0:
            return round((total_engagement / reach) * 100.0, 2)
        return 0.0

    @staticmethod
    def get_content_engagement(db: Session, content_id: int, creator_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        query = db.query(Content).filter(Content.id == content_id)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        content = query.first()
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
    def get_top_performing_content(db: Session, limit: int = 5, platform: Optional[str] = None, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
        norm_p = AnalyticsService.normalize_platform(platform)
        query = db.query(Content)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        if norm_p:
            query = query.filter(Content.platform.ilike(norm_p))
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
    def get_platform_performance(db: Session, platform: Optional[str] = None, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
        norm_p = AnalyticsService.normalize_platform(platform)
        query = db.query(Content)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        if norm_p:
            query = query.filter(Content.platform.ilike(norm_p))
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
    def get_dashboard_summary(db: Session, platform: Optional[str] = None, creator_id: Optional[int] = None) -> Dict[str, Any]:
        norm_p = AnalyticsService.normalize_platform(platform)

        # Auto-seed initial realtime data for new/empty user accounts
        if creator_id is not None:
            user_count = db.query(Content).filter(Content.creator_id == creator_id).count()
            if user_count == 0:
                from backend.app.services.youtube_service import YouTubeService
                from backend.app.services.instagram_service import InstagramService
                from backend.app.services.twitter_service import TwitterService
                from backend.app.services.facebook_service import FacebookService
                from backend.app.services.linkedin_service import LinkedInService
                try:
                    YouTubeService.sync_youtube_videos(db, creator_id=creator_id, channel_id="@mkbhd")
                    InstagramService.sync_instagram_media(db, creator_id=creator_id, instagram_handle="@cristiano")
                    TwitterService.sync_twitter_data(db, creator_id=creator_id, handle="elonmusk")
                    FacebookService.sync_facebook_data(db, creator_id=creator_id, handle="zuck")
                    LinkedInService.sync_linkedin_data(db, creator_id=creator_id, handle="revanth-rol")
                except Exception:
                    pass

        query = db.query(Content)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        if norm_p:
            query = query.filter(Content.platform.ilike(norm_p))
        contents = query.all()

        total_content = len(contents)
        total_views = sum(item.views or 0 for item in contents)
        total_likes = sum(item.likes or 0 for item in contents)
        total_comments = sum(item.comments or 0 for item in contents)
        total_shares = sum(item.shares or 0 for item in contents)
        total_reach = sum(item.reach or 0 for item in contents)

        # Calculate Total Followers across platforms or for selected platform
        g_query = db.query(Growth)
        if creator_id is not None:
            g_query = g_query.filter(Growth.creator_id == creator_id)

        if norm_p:
            g_query = g_query.filter(Growth.platform.ilike(norm_p))
            latest_g = g_query.order_by(Growth.date.desc()).first()
            total_followers = latest_g.followers if latest_g else 0
        else:
            platforms = ["YouTube", "Instagram", "TikTok", "Facebook", "LinkedIn", "X"]
            total_followers = 0
            for p in platforms:
                p_q = db.query(Growth).filter(Growth.platform.ilike(p))
                if creator_id is not None:
                    p_q = p_q.filter(Growth.creator_id == creator_id)
                latest_p = p_q.order_by(Growth.date.desc()).first()
                if latest_p:
                    total_followers += (latest_p.followers or 0)
            if total_followers == 0:
                aud_q = db.query(Audience)
                if creator_id is not None:
                    aud_q = aud_q.filter(Audience.creator_id == creator_id)
                aud_records = aud_q.all()
                total_followers = sum(a.followers or 0 for a in aud_records)

        rates = [
            AnalyticsService.calculate_engagement_rate(
                item.likes, item.comments, item.shares, item.saves, item.reach
            )
            for item in contents
        ]
        avg_eng_rate = round(sum(rates) / len(rates), 2) if rates else 0.0

        top_items = AnalyticsService.get_top_performing_content(db, limit=1, platform=platform, creator_id=creator_id)
        top_content = top_items[0]["content_title"] if top_items else None

        platforms_perf = AnalyticsService.get_platform_performance(db, platform=platform, creator_id=creator_id)
        best_platform = max(platforms_perf, key=lambda x: x["average_engagement_rate"])["platform"] if platforms_perf else (norm_p or "YouTube")

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
    def get_engagement_chart_data(db: Session, platform: Optional[str] = None, creator_id: Optional[int] = None) -> Dict[str, Any]:
        norm_p = AnalyticsService.normalize_platform(platform)
        query = db.query(Growth)
        if creator_id is not None:
            query = query.filter(Growth.creator_id == creator_id)
        if norm_p:
            query = query.filter(Growth.platform.ilike(norm_p))
        growth_records = query.order_by(Growth.date.asc()).all()

        if growth_records:
            date_map = {}
            for g in growth_records:
                d_str = str(g.date)
                if d_str not in date_map:
                    date_map[d_str] = []
                date_map[d_str].append(float(g.engagement_rate or 0.0))
            labels = list(date_map.keys())
            values = [round(sum(rates) / len(rates), 2) for rates in date_map.values()]
        else:
            c_query = db.query(Content).filter(Content.published_date.isnot(None))
            if creator_id is not None:
                c_query = c_query.filter(Content.creator_id == creator_id)
            if norm_p:
                c_query = c_query.filter(Content.platform.ilike(norm_p))
            contents = c_query.order_by(Content.published_date.asc()).all()
            date_map = {}
            for c in contents:
                d_str = str(c.published_date)
                eng = AnalyticsService.calculate_engagement_rate(c.likes, c.comments, c.shares, c.saves, c.reach)
                if d_str not in date_map:
                    date_map[d_str] = []
                date_map[d_str].append(eng)
            labels = list(date_map.keys())
            values = [round(sum(r) / len(r), 2) for r in date_map.values()]
        return {"labels": labels, "values": values}

    @staticmethod
    def get_follower_growth_chart_data(db: Session, platform: Optional[str] = None, creator_id: Optional[int] = None) -> Dict[str, Any]:
        norm_p = AnalyticsService.normalize_platform(platform)
        query = db.query(Growth)
        if creator_id is not None:
            query = query.filter(Growth.creator_id == creator_id)
        if norm_p:
            query = query.filter(Growth.platform.ilike(norm_p))
        growth_records = query.order_by(Growth.date.asc()).all()

        date_map = {}
        for g in growth_records:
            d_str = str(g.date)
            if d_str not in date_map:
                date_map[d_str] = 0
            date_map[d_str] += int(g.followers or 0)

        labels = list(date_map.keys())
        values = list(date_map.values())
        return {"labels": labels, "values": values}

    @staticmethod
    def get_platform_comparison(db: Session, creator_id: Optional[int] = None) -> Dict[str, Any]:
        query = db.query(Content)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        contents = query.all()

        platform_map: Dict[str, Dict[str, Any]] = {}
        default_platforms = ["YouTube", "Instagram", "Facebook", "LinkedIn", "X"]

        for p in default_platforms:
            platform_map[p] = {
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "saves": 0,
                "rates": []
            }

        for item in contents:
            p = item.platform
            if p not in platform_map:
                platform_map[p] = {
                    "views": 0,
                    "reach": 0,
                    "likes": 0,
                    "comments": 0,
                    "shares": 0,
                    "saves": 0,
                    "rates": []
                }
            platform_map[p]["views"] += (item.views or 0)
            platform_map[p]["reach"] += (item.reach or 0)
            platform_map[p]["likes"] += (item.likes or 0)
            platform_map[p]["comments"] += (item.comments or 0)
            platform_map[p]["shares"] += (item.shares or 0)
            platform_map[p]["saves"] += (item.saves or 0)

            rate = AnalyticsService.calculate_engagement_rate(
                item.likes or 0, item.comments or 0, item.shares or 0, item.saves or 0, item.reach or 0
            )
            platform_map[p]["rates"].append(rate)

        result = {}
        for p, data in platform_map.items():
            avg_eng_rate = round(sum(data["rates"]) / len(data["rates"]), 2) if data["rates"] else 0.0
            result[p] = {
                "views": data["views"],
                "reach": data["reach"],
                "engagement_rate": avg_eng_rate,
                "likes": data["likes"],
                "comments": data["comments"]
            }
        return result

    @staticmethod
    def get_reach_breakdown(db: Session, creator_id: Optional[int] = None) -> Dict[str, Any]:
        query = db.query(Content)
        if creator_id is not None:
            query = query.filter(Content.creator_id == creator_id)
        contents = query.all()

        combined_total_reach = sum(item.reach or 0 for item in contents)
        combined_total_views = sum(item.views or 0 for item in contents)

        platform_map: Dict[str, Dict[str, Any]] = {}
        default_platforms = ["YouTube", "Instagram", "Facebook", "LinkedIn", "X"]

        for p in default_platforms:
            platform_map[p] = {"platform": p, "reach": 0, "views": 0, "likes": 0}

        for item in contents:
            p = item.platform
            if p not in platform_map:
                platform_map[p] = {"platform": p, "reach": 0, "views": 0, "likes": 0}
            platform_map[p]["reach"] += (item.reach or 0)
            platform_map[p]["views"] += (item.views or 0)
            platform_map[p]["likes"] += (item.likes or 0)

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
