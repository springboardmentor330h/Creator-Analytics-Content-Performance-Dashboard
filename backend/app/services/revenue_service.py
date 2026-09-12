"""
Revenue + sponsorship service.

A DELIBERATE CHOICE: "total revenue" only sums records with
status=received. Pending revenue is real money expected, but counting
it as already-earned would overstate a creator's actual income — the
KPI summary reports both separately so neither number is misleading.
"""
import uuid
from datetime import date
from typing import List, Optional
from collections import defaultdict
from sqlalchemy.orm import Session

from app.models.revenue import Revenue, Sponsorship, RevenueStatus, SponsorshipStatus
from app.schemas.revenue import RevenueCreate, RevenueUpdate, SponsorshipCreate, SponsorshipUpdate


# ---------- Revenue CRUD ----------

def create_revenue(db: Session, creator_id: uuid.UUID, data: RevenueCreate) -> Revenue:
    revenue = Revenue(creator_id=creator_id, **data.model_dump())
    db.add(revenue)
    db.commit()
    db.refresh(revenue)
    return revenue


def get_revenue_by_id(db: Session, revenue_id: uuid.UUID, creator_id: uuid.UUID) -> Optional[Revenue]:
    return (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id, Revenue.creator_id == creator_id)
        .first()
    )


def list_revenue(db: Session, creator_id: uuid.UUID, skip: int = 0, limit: int = 50) -> List[Revenue]:
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_revenue(db: Session, revenue: Revenue, data: RevenueUpdate) -> Revenue:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(revenue, field, value)
    db.commit()
    db.refresh(revenue)
    return revenue


def delete_revenue(db: Session, revenue: Revenue) -> None:
    db.delete(revenue)
    db.commit()


# ---------- Sponsorship CRUD ----------

def create_sponsorship(db: Session, creator_id: uuid.UUID, data: SponsorshipCreate) -> Sponsorship:
    sponsorship = Sponsorship(creator_id=creator_id, **data.model_dump())
    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)
    return sponsorship


def get_sponsorship_by_id(db: Session, sponsorship_id: uuid.UUID, creator_id: uuid.UUID) -> Optional[Sponsorship]:
    return (
        db.query(Sponsorship)
        .filter(Sponsorship.id == sponsorship_id, Sponsorship.creator_id == creator_id)
        .first()
    )


def list_sponsorships(
    db: Session, creator_id: uuid.UUID, status: Optional[SponsorshipStatus] = None
) -> List[Sponsorship]:
    query = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id)
    if status:
        query = query.filter(Sponsorship.status == status)
    return query.order_by(Sponsorship.start_date.desc()).all()


def update_sponsorship(db: Session, sponsorship: Sponsorship, data: SponsorshipUpdate) -> Sponsorship:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sponsorship, field, value)
    db.commit()
    db.refresh(sponsorship)
    return sponsorship


def delete_sponsorship(db: Session, sponsorship: Sponsorship) -> None:
    db.delete(sponsorship)
    db.commit()


# ---------- Analytics ----------

def get_monthly_revenue_trend(db: Session, creator_id: uuid.UUID) -> List[dict]:
    records = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id, Revenue.status == RevenueStatus.received)
        .all()
    )
    by_month: dict[str, float] = defaultdict(float)
    for r in records:
        month_key = r.date.strftime("%Y-%m")
        by_month[month_key] += r.amount

    return [
        {"month": month, "total": round(total, 2)}
        for month, total in sorted(by_month.items())
    ]


def get_revenue_by_platform(db: Session, creator_id: uuid.UUID) -> List[dict]:
    records = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id, Revenue.status == RevenueStatus.received)
        .all()
    )
    by_platform: dict = defaultdict(float)
    for r in records:
        by_platform[r.source] += r.amount

    return [
        {"source": platform, "total": round(total, 2)}
        for platform, total in by_platform.items()
    ]


def get_revenue_by_type(db: Session, creator_id: uuid.UUID) -> List[dict]:
    records = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id, Revenue.status == RevenueStatus.received)
        .all()
    )
    by_type: dict = defaultdict(float)
    for r in records:
        by_type[r.revenue_type] += r.amount

    return [
        {"revenue_type": rtype, "total": round(total, 2)}
        for rtype, total in by_type.items()
    ]


def get_revenue_kpi_summary(db: Session, creator_id: uuid.UUID) -> dict:
    all_revenue = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()

    total_revenue = sum(r.amount for r in all_revenue if r.status == RevenueStatus.received)
    pending_revenue = sum(r.amount for r in all_revenue if r.status == RevenueStatus.pending)

    all_sponsorships = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()
    total_sponsorship_value = sum(s.amount for s in all_sponsorships)
    active_sponsorships = sum(1 for s in all_sponsorships if s.status == SponsorshipStatus.active)

    return {
        "total_revenue": round(total_revenue, 2),
        "pending_revenue": round(pending_revenue, 2),
        "total_sponsorship_value": round(total_sponsorship_value, 2),
        "active_sponsorships": active_sponsorships,
    }
