from collections import Counter
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate


class AudienceService:

    # --- CRUD Operations ---

    @staticmethod
    def create_audience(db: Session, data: AudienceCreate) -> Audience:
        record = Audience(**data.model_dump())
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_all_audiences(db: Session) -> List[Audience]:
        return db.query(Audience).all()

    @staticmethod
    def get_audience_by_id(db: Session, audience_id: int) -> Optional[Audience]:
        return db.query(Audience).filter(Audience.id == audience_id).first()

    @staticmethod
    def update_audience(
        db: Session, audience_id: int, data: AudienceUpdate
    ) -> Optional[Audience]:
        record = AudienceService.get_audience_by_id(db, audience_id)
        if not record:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(record, key, value)

        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def delete_audience(db: Session, audience_id: int) -> bool:
        record = AudienceService.get_audience_by_id(db, audience_id)
        if not record:
            return False

        db.delete(record)
        db.commit()
        return True

    # --- Analytics Calculations ---

    @staticmethod
    def get_audience_analytics(db: Session) -> Dict:
        records = db.query(Audience).all()
        if not records:
            return {
                "total_followers": 0,
                "total_reach": 0,
                "total_impressions": 0,
                "gender_distribution": {},
                "top_country": None,
                "top_city": None,
                "top_device": None,
            }

        total_followers = sum(r.followers for r in records)
        total_reach = sum(r.reach for r in records)
        total_impressions = sum(r.impressions for r in records)

        # Calculate Gender Distribution (%)
        gender_counts = Counter(r.gender for r in records)
        total_gender_records = len(records)
        gender_distribution = {
            gender: round((count / total_gender_records) * 100, 1)
            for gender, count in gender_counts.items()
        }

        # Calculate Top Demographics
        country_counts = Counter(r.country for r in records)
        city_counts = Counter(r.city for r in records)
        device_counts = Counter(r.device_type for r in records)

        top_country = country_counts.most_common(1)[0][0] if country_counts else None
        top_city = city_counts.most_common(1)[0][0] if city_counts else None
        top_device = device_counts.most_common(1)[0][0] if device_counts else None

        return {
            "total_followers": total_followers,
            "total_reach": total_reach,
            "total_impressions": total_impressions,
            "gender_distribution": gender_distribution,
            "top_country": top_country,
            "top_city": top_city,
            "top_device": top_device,
        }

    @staticmethod
    def get_growth_analytics(
        db: Session, creator_id: int = 1, limit: int = 30
    ) -> List[Dict]:
        growth_records = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.asc())
            .limit(limit)
            .all()
        )

        results = []
        prev_followers = None

        for record in growth_records:
            if prev_followers is None:
                daily_growth = 0
                growth_pct = 0.0
            else:
                daily_growth = record.followers - prev_followers
                growth_pct = (
                    round((daily_growth / prev_followers) * 100, 2)
                    if prev_followers > 0
                    else 0.0
                )

            results.append(
                {
                    "date": str(record.date),
                    "followers": record.followers,
                    "daily_growth": daily_growth,
                    "growth_percentage": growth_pct,
                }
            )

            prev_followers = record.followers

        return results

    @staticmethod
    def get_audience_trends(db: Session, creator_id: int = 1) -> List[Dict]:
        growth_records = (
            db.query(Growth)
            .filter(Growth.creator_id == creator_id)
            .order_by(Growth.date.asc())
            .all()
        )

        return [
            {
                "date": str(r.date),
                "followers": r.followers,
                "reach": r.reach,
            }
            for r in growth_records
        ]