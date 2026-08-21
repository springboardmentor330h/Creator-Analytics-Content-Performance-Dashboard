from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from collections import defaultdict

from backend.app.models.revenue import Revenue
from backend.app.models.sponsorship import Sponsorship
from backend.app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    VALID_REVENUE_SOURCES
)


class RevenueService:

    @staticmethod
    def create_revenue(db: Session, creator_id: int, revenue_in: RevenueCreate) -> Revenue:
        """Create a new revenue record associated with a creator."""
        db_revenue = Revenue(
            creator_id=creator_id,
            source=revenue_in.source,
            amount=revenue_in.amount,
            currency=revenue_in.currency,
            description=revenue_in.description,
            date=revenue_in.date
        )
        db.add(db_revenue)
        db.commit()
        db.refresh(db_revenue)
        return db_revenue

    @staticmethod
    def get_revenues(
        db: Session,
        creator_id: int,
        source: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Revenue]:
        """Fetch all revenue records for a specific creator with optional filtering."""
        query = db.query(Revenue).filter(Revenue.creator_id == creator_id)

        if source and source.lower() != "all":
            query = query.filter(Revenue.source.ilike(source))
        if start_date:
            query = query.filter(Revenue.date >= start_date)
        if end_date:
            query = query.filter(Revenue.date <= end_date)

        return query.order_by(Revenue.date.desc()).all()

    @staticmethod
    def get_revenue_by_id(db: Session, creator_id: int, revenue_id: int) -> Optional[Revenue]:
        """Retrieve a single revenue record ensuring creator multi-tenancy access."""
        return db.query(Revenue).filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id
        ).first()

    @staticmethod
    def update_revenue(
        db: Session,
        creator_id: int,
        revenue_id: int,
        update_in: RevenueUpdate
    ) -> Optional[Revenue]:
        """Update an existing revenue entry."""
        db_revenue = RevenueService.get_revenue_by_id(db, creator_id, revenue_id)
        if not db_revenue:
            return None

        update_data = update_in.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            setattr(db_revenue, field, val)

        db.commit()
        db.refresh(db_revenue)
        return db_revenue

    @staticmethod
    def delete_revenue(db: Session, creator_id: int, revenue_id: int) -> bool:
        """Delete a revenue record."""
        db_revenue = RevenueService.get_revenue_by_id(db, creator_id, revenue_id)
        if not db_revenue:
            return False

        db.delete(db_revenue)
        db.commit()
        return True

    @staticmethod
    def calculate_total_revenue(db: Session, creator_id: int) -> float:
        """Calculate aggregate sum of all recorded revenues for creator."""
        revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
        return round(sum(r.amount for r in revenues), 2)

    @staticmethod
    def get_revenue_by_source(db: Session, creator_id: int) -> List[Dict[str, Any]]:
        """Generate breakdown of earnings grouped by source stream."""
        revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
        totals = defaultdict(float)

        # Initialize standard sources with 0.0
        for src in VALID_REVENUE_SOURCES:
            totals[src] = 0.0

        for r in revenues:
            totals[r.source] += r.amount

        grand_total = sum(totals.values())
        result = []

        for source_name, amount in totals.items():
            percentage = round((amount / grand_total * 100.0), 2) if grand_total > 0 else 0.0
            result.append({
                "source": source_name,
                "amount": round(amount, 2),
                "percentage": percentage
            })

        result.sort(key=lambda x: x["amount"], reverse=True)
        return result

    @staticmethod
    def get_monthly_revenue(db: Session, creator_id: int) -> List[Dict[str, Any]]:
        """Aggregate revenue by month and year."""
        revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).order_by(Revenue.date.asc()).all()

        monthly_map: Dict[str, Dict[str, Any]] = {}

        for r in revenues:
            if not r.date:
                continue
            month_name = r.date.strftime("%b")
            year_val = r.date.year
            key = f"{month_name} {year_val}"

            if key not in monthly_map:
                monthly_map[key] = {
                    "month": month_name,
                    "year": year_val,
                    "amount": 0.0,
                    "by_source": defaultdict(float)
                }

            monthly_map[key]["amount"] += r.amount
            monthly_map[key]["by_source"][r.source] += r.amount

        result = []
        for key, item in monthly_map.items():
            result.append({
                "month": item["month"],
                "year": item["year"],
                "amount": round(item["amount"], 2),
                "by_source": {k: round(v, 2) for k, v in item["by_source"].items()}
            })

        return result

    @staticmethod
    def get_revenue_trends(db: Session, creator_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """Retrieve daily or chronological revenue trend data points."""
        cutoff_date = date.today() - timedelta(days=days)
        revenues = db.query(Revenue).filter(
            Revenue.creator_id == creator_id,
            Revenue.date >= cutoff_date
        ).order_by(Revenue.date.asc()).all()

        result = []
        for r in revenues:
            result.append({
                "date": r.date.isoformat(),
                "amount": round(r.amount, 2),
                "source": r.source
            })
        return result

    @staticmethod
    def get_revenue_summary(db: Session, creator_id: int) -> Dict[str, Any]:
        """Comprehensive executive summary of creator revenues and sponsorships."""
        revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()

        stream_totals = defaultdict(float)
        for r in revenues:
            stream_totals[r.source] += r.amount

        total_rev = round(sum(r.amount for r in revenues), 2)
        by_source = RevenueService.get_revenue_by_source(db, creator_id)
        monthly_rev = RevenueService.get_monthly_revenue(db, creator_id)

        return {
            "total_revenue": total_rev,
            "total_sponsorship_revenue": round(stream_totals["Sponsorships"], 2),
            "total_ad_revenue": round(stream_totals["Ad Revenue"], 2),
            "total_affiliate_revenue": round(stream_totals["Affiliate Marketing"], 2),
            "total_collaboration_revenue": round(stream_totals["Brand Collaborations"], 2),
            "total_subscription_revenue": round(stream_totals["Subscription Revenue"], 2),
            "revenue_by_source": by_source,
            "monthly_revenue": monthly_rev
        }
