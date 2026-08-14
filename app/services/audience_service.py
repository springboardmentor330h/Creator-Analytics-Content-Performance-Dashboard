from collections import Counter
from typing import Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate


class AudienceService:

    # --- CRUD Operations for Audience ---

    @staticmethod
    def create_audience(db: Session, data: AudienceCreate) -> Audience:
        record = Audience(**data.model_dump())
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_all_audience(db: Session) -> List[Audience]:
        return db.query(Audience).all()

    @staticmethod
    def get_audience_by_id(db: Session, audience_id: int) -> Optional[Audience]:
        return db.query(Audience).filter(Audience.id == audience_id).first()

    @staticmethod
    def update_audience(
        db: Session, audience_id: int, data: AudienceUpdate
    ) -> Optional[Audience]:
        record = db.query(Audience).filter(Audience.id == audience_id).first()
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
        record = db.query(Audience).filter(Audience.id == audience_id).first()
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
                "age_distribution": {},
                "top_country": None,
                "top_city": None,
                "top_device": None,
            }

        total_followers = sum(r.followers for r in records)
        total_reach = sum(r.reach for r in records)
        total_impressions = sum(r.impressions for r in records)

        # Calculate Distributions
        gender_counts = Counter(r.gender for r in records)
        gender_dist = {
            gender: round((count / len(records)) * 100, 1)
            for gender, count in gender_counts.items()
        }

        age_counts = Counter(r.age_group for r in records)
        age_dist = {
            age: round((count / len(records)) * 100, 1)
            for age, count in age_counts.items()
        }

        # Calculate Most Popular Demographics
        top_country = (
            Counter(r.country for r in records).most_common(1)[0][0]
            if records
            else None
        )
        top_city = (
            Counter(r.city for r in records).most_common(1)[0][0]
            if records
            else None
        )
        top_device = (
            Counter(r.device_type for r in records).most_common(1)[0][0]
            if records
            else None
        )

        return {
            "total_followers": total_followers,
            "total_reach": total_reach,
            "total_impressions": total_impressions,
            "gender_distribution": gender_dist,
            "age_distribution": age_dist,
            "top_country": top_country,
            "top_city": top_city,
            "top_device": top_device,
        }

    @staticmethod
    def get_growth_analytics(db: Session, limit: int = 30) -> List[Dict]:
        growth_records = (
            db.query(Growth).order_by(Growth.date.asc()).limit(limit).all()
        )
        if not growth_records:
            return []

        report = []
        prev_followers = None

        for record in growth_records:
            if prev_followers is None or prev_followers == 0:
                daily_growth = 0
                growth_pct = 0.0
            else:
                daily_growth = record.followers - prev_followers
                growth_pct = round((daily_growth / prev_followers) * 100, 2)

            report.append(
                {
                    "date": record.date.isoformat(),
                    "followers": record.followers,
                    "daily_growth": daily_growth,
                    "growth_percentage": growth_pct,
                }
            )
            prev_followers = record.followers

        return report

    @staticmethod
    def get_audience_trends(db: Session) -> List[Dict]:
        growth_records = db.query(Growth).order_by(Growth.date.asc()).all()
        return [
            {
                "date": record.date.isoformat(),
                "followers": record.followers,
                "reach": record.reach,
            }
            for record in growth_records
        ]