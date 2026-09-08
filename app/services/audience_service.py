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
    def get_all_audiences(db: Session, creator_id: Optional[int] = None) -> List[Audience]:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        return query.all()

    @staticmethod
    def get_all_audience(db: Session, creator_id: Optional[int] = None) -> List[Audience]:
        """Backward-compatible singular alias used by the router."""
        return AudienceService.get_all_audiences(db, creator_id)

    @staticmethod
    def get_audience_by_id(db: Session, audience_id: int) -> Optional[Audience]:
        return db.query(Audience).filter(Audience.id == audience_id).first()

    @staticmethod
    def update_audience(
        db: Session, audience_id: int, data: AudienceUpdate, creator_id: Optional[int] = None
    ) -> Optional[Audience]:
        record = AudienceService.get_audience_by_id(db, audience_id)
        if record and creator_id is not None and record.creator_id != creator_id:
            return None
        if not record:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(record, key, value)

        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def delete_audience(db: Session, audience_id: int, creator_id: Optional[int] = None) -> bool:
        record = AudienceService.get_audience_by_id(db, audience_id)
        if not record or (creator_id is not None and record.creator_id != creator_id):
            return False

        db.delete(record)
        db.commit()
        return True

    # --- Analytics Calculations ---

    @staticmethod
    def get_audience_analytics(db: Session, creator_id: Optional[int] = None) -> Dict:
        query = db.query(Audience)
        if creator_id is not None:
            query = query.filter(Audience.creator_id == creator_id)
        records = query.all()
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

        total_followers = sum(r.percentage for r in records)
        total_reach = total_followers
        total_impressions = len(records)

        gender_counts = Counter(r.gender for r in records)
        total_gender_records = len(records)
        gender_distribution = {
            gender: round((count / total_gender_records) * 100, 1)
            for gender, count in gender_counts.items()
        }

        # Calculate Top Demographics
        country_counts = Counter(r.country for r in records)
        top_country = country_counts.most_common(1)[0][0] if country_counts else None

        return {
            "total_followers": total_followers,
            "total_reach": total_reach,
            "total_impressions": total_impressions,
            "gender_distribution": gender_distribution,
            "top_country": top_country,
            "top_city": None,
            "top_device": None,
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
                "engagement_rate": r.engagement_rate,
            }
            for r in growth_records
        ]