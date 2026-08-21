from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.app.models.sponsorship import Sponsorship
from backend.app.models.revenue import Revenue
from backend.app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate


class SponsorshipService:

    @staticmethod
    def create_sponsorship(
        db: Session,
        creator_id: int,
        sponsorship_in: SponsorshipCreate
    ) -> Sponsorship:
        """Create a new sponsorship deal for a creator."""
        db_sponsorship = Sponsorship(
            creator_id=creator_id,
            brand_name=sponsorship_in.brand_name,
            campaign_name=sponsorship_in.campaign_name,
            contract_value=sponsorship_in.contract_value,
            start_date=sponsorship_in.start_date,
            end_date=sponsorship_in.end_date,
            status=sponsorship_in.status,
            payment_status=sponsorship_in.payment_status,
            notes=sponsorship_in.notes
        )
        db.add(db_sponsorship)
        db.commit()
        db.refresh(db_sponsorship)

        # If sponsorship is marked as Paid upon creation, sync with Revenue record
        if db_sponsorship.payment_status.lower() == "paid":
            SponsorshipService._sync_revenue_entry(db, db_sponsorship)

        return db_sponsorship

    @staticmethod
    def get_sponsorships(
        db: Session,
        creator_id: int,
        status: Optional[str] = None,
        payment_status: Optional[str] = None
    ) -> List[Sponsorship]:
        """Fetch all sponsorship deals for a creator with optional status filters."""
        query = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id)

        if status and status.lower() != "all":
            query = query.filter(Sponsorship.status.ilike(status))

        if payment_status and payment_status.lower() != "all":
            query = query.filter(Sponsorship.payment_status.ilike(payment_status))

        return query.order_by(Sponsorship.start_date.desc()).all()

    @staticmethod
    def get_sponsorship_by_id(
        db: Session,
        creator_id: int,
        sponsorship_id: int
    ) -> Optional[Sponsorship]:
        """Retrieve a specific sponsorship record ensuring creator scoping."""
        return db.query(Sponsorship).filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id
        ).first()

    @staticmethod
    def update_sponsorship(
        db: Session,
        creator_id: int,
        sponsorship_id: int,
        update_in: SponsorshipUpdate
    ) -> Optional[Sponsorship]:
        """Update an existing sponsorship contract record."""
        db_sponsorship = SponsorshipService.get_sponsorship_by_id(db, creator_id, sponsorship_id)
        if not db_sponsorship:
            return None

        previous_payment_status = db_sponsorship.payment_status
        update_data = update_in.model_dump(exclude_unset=True)

        for field, val in update_data.items():
            setattr(db_sponsorship, field, val)

        db.commit()
        db.refresh(db_sponsorship)

        # If payment status changed to Paid, record or update revenue record
        if previous_payment_status.lower() != "paid" and db_sponsorship.payment_status.lower() == "paid":
            SponsorshipService._sync_revenue_entry(db, db_sponsorship)

        return db_sponsorship

    @staticmethod
    def delete_sponsorship(db: Session, creator_id: int, sponsorship_id: int) -> bool:
        """Delete a sponsorship record."""
        db_sponsorship = SponsorshipService.get_sponsorship_by_id(db, creator_id, sponsorship_id)
        if not db_sponsorship:
            return False

        db.delete(db_sponsorship)
        db.commit()
        return True

    @staticmethod
    def _sync_revenue_entry(db: Session, sponsorship: Sponsorship) -> None:
        """Helper to create a corresponding revenue entry when a sponsorship is paid."""
        revenue_desc = f"Sponsorship Payment: {sponsorship.brand_name} - {sponsorship.campaign_name}"
        existing = db.query(Revenue).filter(
            Revenue.creator_id == sponsorship.creator_id,
            Revenue.source == "Sponsorships",
            Revenue.description == revenue_desc
        ).first()

        if not existing:
            new_rev = Revenue(
                creator_id=sponsorship.creator_id,
                source="Sponsorships",
                amount=sponsorship.contract_value,
                currency="USD",
                description=revenue_desc,
                date=sponsorship.start_date or date.today()
            )
            db.add(new_rev)
            db.commit()
