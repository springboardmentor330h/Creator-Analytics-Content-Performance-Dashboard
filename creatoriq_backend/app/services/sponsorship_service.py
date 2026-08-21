"""Sponsorship service for CreatorIQ.

Handles CRUD operations and sponsorship analytics (summary metrics, contract values,
status breakdowns, and payment status tracking) with strict creator isolation.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.sponsorship import PAYMENT_STATUSES, SPONSORSHIP_STATUSES, Sponsorship
from app.models.user import User
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate


def _apply_sponsorship_scope(stmt: Any, user: User) -> Any:
    """Filter queries so creators only access their own sponsorship campaigns."""
    role = user.role.lower() if user.role else ""
    if role in {"administrator", "admin"}:
        return stmt
    if role == "agency":
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(Sponsorship.creator_id == user.id)
        return stmt.where(Sponsorship.creator_id.in_(assigned_ids))
    return stmt.where(Sponsorship.creator_id == user.id)


def create_sponsorship(db: Session, user: User, payload: SponsorshipCreate) -> Sponsorship:
    """Create a new sponsorship campaign for the authenticated creator."""
    if payload.status not in SPONSORSHIP_STATUSES:
        raise ValueError(f"Invalid status '{payload.status}'. Allowed: {', '.join(SPONSORSHIP_STATUSES)}")

    if payload.payment_status not in PAYMENT_STATUSES:
        raise ValueError(f"Invalid payment_status '{payload.payment_status}'. Allowed: {', '.join(PAYMENT_STATUSES)}")

    sponsorship = Sponsorship(
        creator_id=user.id,
        brand_name=payload.brand_name.strip(),
        campaign_name=payload.campaign_name.strip(),
        contract_value=round(float(payload.contract_value), 2),
        currency=payload.currency,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        payment_status=payload.payment_status,
        description=payload.description.strip() if payload.description else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)
    return sponsorship


def get_sponsorship(db: Session, user: User, sponsorship_id: int) -> Optional[Sponsorship]:
    """Retrieve a single sponsorship record ensuring creator ownership."""
    stmt = _apply_sponsorship_scope(select(Sponsorship).where(Sponsorship.id == sponsorship_id), user)
    return db.scalars(stmt).first()


def get_creator_sponsorships(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
) -> List[Sponsorship]:
    """Retrieve all sponsorship campaigns for the authenticated creator."""
    limit = min(max(limit, 1), 500)
    skip = max(0, skip)
    stmt = (
        _apply_sponsorship_scope(select(Sponsorship), user)
        .order_by(Sponsorship.start_date.desc(), Sponsorship.id.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def update_sponsorship(
    db: Session,
    user: User,
    sponsorship_id: int,
    payload: SponsorshipUpdate,
) -> Optional[Sponsorship]:
    """Update an existing sponsorship record ensuring creator ownership."""
    sponsorship = get_sponsorship(db, user, sponsorship_id)
    if not sponsorship:
        return None

    data = payload.model_dump(exclude_unset=True)

    if "brand_name" in data and data["brand_name"] is not None:
        sponsorship.brand_name = data["brand_name"].strip()

    if "campaign_name" in data and data["campaign_name"] is not None:
        sponsorship.campaign_name = data["campaign_name"].strip()

    if "contract_value" in data and data["contract_value"] is not None:
        sponsorship.contract_value = round(float(data["contract_value"]), 2)

    if "currency" in data and data["currency"] is not None:
        sponsorship.currency = data["currency"]

    if "start_date" in data and data["start_date"] is not None:
        sponsorship.start_date = data["start_date"]

    if "end_date" in data and data["end_date"] is not None:
        sponsorship.end_date = data["end_date"]

    # Verify start_date vs end_date validity after merging
    if sponsorship.end_date < sponsorship.start_date:
        raise ValueError("end_date cannot be earlier than start_date")

    if "status" in data and data["status"] is not None:
        if data["status"] not in SPONSORSHIP_STATUSES:
            raise ValueError(f"Invalid status '{data['status']}'. Allowed: {', '.join(SPONSORSHIP_STATUSES)}")
        sponsorship.status = data["status"]

    if "payment_status" in data and data["payment_status"] is not None:
        if data["payment_status"] not in PAYMENT_STATUSES:
            raise ValueError(f"Invalid payment_status '{data['payment_status']}'. Allowed: {', '.join(PAYMENT_STATUSES)}")
        sponsorship.payment_status = data["payment_status"]

    if "description" in data:
        sponsorship.description = data["description"].strip() if data["description"] else None

    sponsorship.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sponsorship)
    return sponsorship


def delete_sponsorship(db: Session, user: User, sponsorship_id: int) -> bool:
    """Delete a sponsorship record ensuring creator ownership."""
    sponsorship = get_sponsorship(db, user, sponsorship_id)
    if not sponsorship:
        return False

    db.delete(sponsorship)
    db.commit()
    return True


# =========================================================
# SPONSORSHIP ANALYTICS FUNCTIONS
# =========================================================

def get_sponsorships_summary(db: Session, user: User) -> Dict[str, Any]:
    """Calculate summary dashboard metrics across creator's sponsorship campaigns."""
    stmt = _apply_sponsorship_scope(select(Sponsorship), user)
    records = list(db.scalars(stmt).all())

    total_sponsorships = len(records)
    total_contract_value = sum(s.contract_value for s in records)
    active_sponsorships = sum(1 for s in records if s.status.lower() == "active")
    completed_sponsorships = sum(1 for s in records if s.status.lower() == "completed")
    pending_payments = sum(1 for s in records if s.payment_status.lower() == "pending")

    return {
        "total_sponsorships": total_sponsorships,
        "total_contract_value": round(total_contract_value, 2),
        "active_sponsorships": active_sponsorships,
        "completed_sponsorships": completed_sponsorships,
        "pending_payments": pending_payments,
    }


def get_sponsorships_status(db: Session, user: User) -> Dict[str, int]:
    """Calculate counts of sponsorship deals grouped by status for the creator."""
    stmt = (
        _apply_sponsorship_scope(
            select(
                Sponsorship.status,
                func.count(Sponsorship.id),
            ),
            user,
        )
        .group_by(Sponsorship.status)
    )
    rows = db.execute(stmt).all()

    # Pre-populate all supported statuses with 0
    result: Dict[str, int] = {st: 0 for st in SPONSORSHIP_STATUSES}
    for status_val, count in rows:
        if status_val in result:
            result[status_val] = int(count or 0)
        else:
            result[status_val] = int(count or 0)

    return result
