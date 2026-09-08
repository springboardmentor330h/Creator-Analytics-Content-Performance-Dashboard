from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sponsorship import Sponsorship


def get_sponsorship_summary(db: Session):
    total_sponsorships = db.query(Sponsorship).count()

    total_value = (
        db.query(
            func.coalesce(func.sum(Sponsorship.amount), 0)
        )
        .scalar()
    )

    return {
        "total_sponsorships": total_sponsorships,
        "total_value": total_value
    }


def get_sponsorships_by_status(db: Session):
    results = (
        db.query(
            Sponsorship.status,
            func.count(Sponsorship.id).label("count")
        )
        .group_by(Sponsorship.status)
        .all()
    )

    return [
        {
            "status": status,
            "count": count
        }
        for status, count in results
    ]


def get_sponsorships_by_brand(db: Session):
    results = (
        db.query(
            Sponsorship.brand_name,
            func.sum(Sponsorship.amount).label("total_amount")
        )
        .group_by(Sponsorship.brand_name)
        .all()
    )

    return [
        {
            "brand_name": brand_name,
            "total_amount": total_amount
        }
        for brand_name, total_amount in results
    ]