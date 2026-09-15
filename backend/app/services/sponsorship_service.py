from sqlalchemy.orm import Session
from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate


def create_sponsorship(
    db: Session,
    creator_id: int,
    data: SponsorshipCreate
):
    sponsorship = Sponsorship(
        creator_id=creator_id,
        brand_name=data.brand_name,
        campaign=data.campaign,
        contract_value=data.contract_value,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
        payment_status=data.payment_status
    )

    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def get_creator_sponsorships(
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
    data: SponsorshipUpdate
):
    update_data = data.model_dump(exclude_unset=True)

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
