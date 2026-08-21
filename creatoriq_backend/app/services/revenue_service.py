"""Revenue service for CreatorIQ.

Handles CRUD operations and revenue analytics (total revenue, breakdown by source,
monthly aggregations, and revenue trend visualizations) with strict creator isolation.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.revenue import REVENUE_SOURCES, Revenue
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueUpdate


def _apply_revenue_scope(stmt: Any, user: User) -> Any:
    """Filter queries so creators only access their own revenue data."""
    role = user.role.lower() if user.role else ""
    if role in {"administrator", "admin"}:
        return stmt
    if role == "agency":
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(Revenue.creator_id == user.id)
        return stmt.where(Revenue.creator_id.in_(assigned_ids))
    return stmt.where(Revenue.creator_id == user.id)


def create_revenue(db: Session, user: User, payload: RevenueCreate) -> Revenue:
    """Create a new revenue record for the authenticated creator."""
    if payload.source not in REVENUE_SOURCES:
        raise ValueError(f"Invalid revenue source '{payload.source}'. Allowed: {', '.join(REVENUE_SOURCES)}")

    revenue = Revenue(
        creator_id=user.id,
        source=payload.source,
        amount=round(float(payload.amount), 2),
        currency=payload.currency,
        description=payload.description.strip() if payload.description else None,
        revenue_date=payload.revenue_date,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(revenue)
    db.commit()
    db.refresh(revenue)
    return revenue


def get_revenue_by_id(db: Session, user: User, revenue_id: int) -> Optional[Revenue]:
    """Retrieve a single revenue record ensuring creator ownership."""
    stmt = _apply_revenue_scope(select(Revenue).where(Revenue.id == revenue_id), user)
    return db.scalars(stmt).first()


def get_creator_revenues(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
) -> List[Revenue]:
    """Retrieve all revenue records for the authenticated creator, ordered by date descending."""
    limit = min(max(limit, 1), 500)
    skip = max(0, skip)
    stmt = (
        _apply_revenue_scope(select(Revenue), user)
        .order_by(Revenue.revenue_date.desc(), Revenue.id.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def update_revenue(
    db: Session,
    user: User,
    revenue_id: int,
    payload: RevenueUpdate,
) -> Optional[Revenue]:
    """Update an existing revenue record ensuring creator ownership."""
    revenue = get_revenue_by_id(db, user, revenue_id)
    if not revenue:
        return None

    data = payload.model_dump(exclude_unset=True)
    if "source" in data and data["source"] is not None:
        if data["source"] not in REVENUE_SOURCES:
            raise ValueError(f"Invalid revenue source '{data['source']}'. Allowed: {', '.join(REVENUE_SOURCES)}")
        revenue.source = data["source"]

    if "amount" in data and data["amount"] is not None:
        revenue.amount = round(float(data["amount"]), 2)

    if "currency" in data and data["currency"] is not None:
        revenue.currency = data["currency"]

    if "description" in data:
        revenue.description = data["description"].strip() if data["description"] else None

    if "revenue_date" in data and data["revenue_date"] is not None:
        revenue.revenue_date = data["revenue_date"]

    revenue.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(revenue)
    return revenue


def delete_revenue(db: Session, user: User, revenue_id: int) -> bool:
    """Delete a revenue record ensuring creator ownership."""
    revenue = get_revenue_by_id(db, user, revenue_id)
    if not revenue:
        return False

    db.delete(revenue)
    db.commit()
    return True


# =========================================================
# REVENUE ANALYTICS FUNCTIONS
# =========================================================

def get_total_revenue(db: Session, user: User) -> Dict[str, Any]:
    """Calculate total accumulated revenue for the authenticated creator."""
    stmt = _apply_revenue_scope(select(func.coalesce(func.sum(Revenue.amount), 0.0)), user)
    total = float(db.scalar(stmt) or 0.0)

    # Determine default currency from existing records or fallback to INR
    first_record = db.scalars(_apply_revenue_scope(select(Revenue), user).limit(1)).first()
    currency = first_record.currency if first_record else "INR"

    return {
        "total_revenue": round(total, 2),
        "currency": currency,
    }


def get_revenue_by_source(db: Session, user: User) -> Dict[str, float]:
    """Calculate revenue breakdown grouped by source for the authenticated creator."""
    stmt = (
        _apply_revenue_scope(
            select(
                Revenue.source,
                func.coalesce(func.sum(Revenue.amount), 0.0),
            ),
            user,
        )
        .group_by(Revenue.source)
    )
    rows = db.execute(stmt).all()

    # Pre-populate all supported revenue sources with 0.0
    result: Dict[str, float] = {src: 0.0 for src in REVENUE_SOURCES}
    for source, total in rows:
        result[source] = round(float(total or 0.0), 2)

    return result


def get_monthly_revenue(db: Session, user: User) -> List[Dict[str, Any]]:
    """Generate monthly aggregated revenue points chronologically for the creator."""
    stmt = _apply_revenue_scope(select(Revenue), user).order_by(Revenue.revenue_date.asc())
    records = list(db.scalars(stmt).all())

    monthly_totals: Dict[str, float] = {}
    for item in records:
        month_key = item.revenue_date.strftime("%Y-%m")
        monthly_totals[month_key] = monthly_totals.get(month_key, 0.0) + item.amount

    return [
        {"month": m, "revenue": round(rev, 2)}
        for m, rev in sorted(monthly_totals.items())
    ]


def get_revenue_trend(db: Session, user: User) -> Dict[str, Any]:
    """Generate chart-ready labels and values for monthly revenue trend."""
    monthly_data = get_monthly_revenue(db, user)
    labels = [item["month"] for item in monthly_data]
    values = [item["revenue"] for item in monthly_data]
    return {
        "labels": labels,
        "values": values,
    }
