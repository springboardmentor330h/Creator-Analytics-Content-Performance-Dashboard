from sqlalchemy.orm import Session

from app.models.sponsorship import Sponsorship
from app.models.user import User
from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate
)


def get_creator_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_sponsorship(
    db: Session,
    sponsorship_data: SponsorshipCreate,
    creator_id: int
):
    sponsorship = Sponsorship(
        creator_id=creator_id,
        brand_name=sponsorship_data.brand_name,
        campaign=sponsorship_data.campaign,
        contract_value=sponsorship_data.contract_value,
        start_date=sponsorship_data.start_date,
        end_date=sponsorship_data.end_date,
        status=sponsorship_data.status,
        payment_status=sponsorship_data.payment_status
    )

    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def get_all_sponsorships(
    db: Session,
    creator_id: int
):
    return (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == creator_id)
        .order_by(Sponsorship.start_date.desc())
        .all()
    )


def get_sponsorship_by_id(
    db: Session,
    sponsorship_id: int,
    creator_id: int
):
    return (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id
        )
        .first()
    )


def update_sponsorship(
    db: Session,
    sponsorship: Sponsorship,
    sponsorship_data: SponsorshipUpdate
):
    update_data = sponsorship_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(sponsorship, field, value)

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def delete_sponsorship(
    db: Session,
    sponsorship: Sponsorship
):
    db.delete(sponsorship)
    db.commit()

    return True
