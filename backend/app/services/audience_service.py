from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.models.audience import Audience
from backend.app.models.growth import Growth


from backend.app.models.content import Content

class AudienceService:

    @staticmethod
    def total_followers(db: Session, creator_id: Optional[int] = None) -> int:
        distinct_platforms = ["YouTube", "Instagram", "Facebook", "LinkedIn", "X"]
        total = 0
        for p in distinct_platforms:
            g_q = db.query(Growth).filter(Growth.platform.ilike(p))
            if creator_id is not None:
                g_q = g_q.filter(Growth.creator_id == creator_id)
            latest_g = g_q.order_by(Growth.date.desc()).first()
            if latest_g and latest_g.followers:
                total += latest_g.followers
        if total > 0:
            return total
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = query.all()
        return sum(r.followers or 0 for r in records)

    @staticmethod
    def total_reach(db: Session, creator_id: Optional[int] = None) -> int:
        c_query = db.query(Content)
        if creator_id is not None:
            c_query = c_query.filter(Content.creator_id == creator_id)
        contents = c_query.all()
        if contents:
            return sum(c.reach or c.views or 0 for c in contents)
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = query.all()
        return sum(r.reach or 0 for r in records)

    @staticmethod
    def total_impressions(db: Session, creator_id: Optional[int] = None) -> int:
        c_query = db.query(Content)
        if creator_id is not None:
            c_query = c_query.filter(Content.creator_id == creator_id)
        contents = c_query.all()
        if contents:
            return sum((c.views or 0) * 2 + (c.reach or 0) for c in contents)
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = query.all()
        return sum(r.impressions or 0 for r in records)

    @staticmethod
    def gender_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, float]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = [r for r in query.all() if r.gender]
        if not records:
            return {}
        gender_totals: Dict[str, float] = {}
        total = 0.0
        for r in records:
            key = r.gender.lower()
            val = float(r.followers or 1)
            gender_totals[key] = gender_totals.get(key, 0.0) + val
            total += val
        if total == 0:
            return {}
        return {g: round((val / total) * 100, 2) for g, val in gender_totals.items()}

    @staticmethod
    def age_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, float]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = [r for r in query.all() if r.age_group]
        if not records:
            return {}
        age_totals: Dict[str, float] = {}
        total = 0.0
        for r in records:
            key = r.age_group
            val = float(r.followers or 1)
            age_totals[key] = age_totals.get(key, 0.0) + val
            total += val
        if total == 0:
            return {}
        return {a: round((val / total) * 100, 2) for a, val in age_totals.items()}

    @staticmethod
    def top_countries(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = [r for r in query.all() if r.country]
        if not records:
            return []
        country_map: Dict[str, int] = {}
        for r in records:
            c = r.country
            country_map[c] = country_map.get(c, 0) + (r.followers or 1)
        sorted_countries = sorted(country_map.items(), key=lambda x: x[1], reverse=True)
        return [{"country": c, "followers": count} for c, count in sorted_countries]

    @staticmethod
    def top_cities(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = [r for r in query.all() if r.city]
        if not records:
            return []
        city_map: Dict[str, int] = {}
        for r in records:
            c = r.city
            city_map[c] = city_map.get(c, 0) + (r.followers or 1)
        sorted_cities = sorted(city_map.items(), key=lambda x: x[1], reverse=True)
        return [{"city": c, "followers": count} for c, count in sorted_cities]

    @staticmethod
    def device_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, float]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = [r for r in query.all() if r.device_type]
        if not records:
            return {}
        dev_map: Dict[str, float] = {}
        total = 0.0
        for r in records:
            d = r.device_type
            val = float(r.followers or 1)
            dev_map[d] = dev_map.get(d, 0.0) + val
            total += val
        if total == 0:
            return {}
        return {d: round((val / total) * 100, 2) for d, val in dev_map.items()}

    @staticmethod
    def get_audience_report(db: Session, creator_id: Optional[int] = None) -> Dict[str, Any]:
        followers = AudienceService.total_followers(db, creator_id)
        reach = AudienceService.total_reach(db, creator_id)
        impressions = AudienceService.total_impressions(db, creator_id)
        genders = AudienceService.gender_distribution(db, creator_id)
        ages = AudienceService.age_distribution(db, creator_id)
        countries = AudienceService.top_countries(db, creator_id)
        cities = AudienceService.top_cities(db, creator_id)
        devices = AudienceService.device_distribution(db, creator_id)

        top_c = countries[0]["country"] if countries else None
        top_ci = cities[0]["city"] if cities else None
        top_dev = max(devices.items(), key=lambda x: x[1])[0] if devices else None

        return {
            "total_followers": followers,
            "total_reach": reach,
            "total_impressions": impressions,
            "gender_distribution": genders,
            "age_distribution": ages,
            "device_distribution": devices,
            "top_country": top_c,
            "top_city": top_ci,
            "top_device": top_dev
        }

    @staticmethod
    def growth_trend_generation(db: Session, creator_id: Optional[int] = None, platform: Optional[str] = None, limit: int = 30) -> List[Dict[str, Any]]:
        query = db.query(Growth)
        if creator_id is not None:
            query = query.filter(Growth.creator_id == creator_id)
        if platform and platform != "All":
            query = query.filter(Growth.platform == platform)

        records = query.order_by(Growth.date.asc()).limit(limit).all()

        results = []
        for i, rec in enumerate(records):
            prev_followers = records[i - 1].followers if i > 0 else 0
            daily_growth = (rec.followers - prev_followers) if i > 0 else 0
            if i > 0 and prev_followers > 0:
                growth_pct = round((daily_growth / prev_followers) * 100.0, 2)
            else:
                growth_pct = 0.0

            results.append({
                "date": str(rec.date),
                "platform": getattr(rec, 'platform', 'All') or 'All',
                "followers": rec.followers,
                "reach": rec.reach or 0,
                "daily_growth": daily_growth,
                "growth_percentage": growth_pct
            })
        return results

    @staticmethod
    def get_audience_trends(db: Session, creator_id: Optional[int] = None, platform: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(Growth)
        if creator_id is not None:
            query = query.filter(Growth.creator_id == creator_id)
        if platform and platform != "All":
            query = query.filter(Growth.platform == platform)

        records = query.order_by(Growth.date.asc()).all()

        return [
            {
                "date": str(rec.date),
                "platform": getattr(rec, 'platform', 'All') or 'All',
                "followers": rec.followers,
                "reach": rec.reach
            }
            for rec in records
        ]

