from sqlalchemy.orm import Session

from app.models.sponsorship import Sponsorship


def create_sponsorship(db: Session, creator_id: int, sponsorship_data):
    if sponsorship_data.end_date < sponsorship_data.start_date:
        raise ValueError(
            "End date cannot be earlier than start date"
        )

    sponsorship = Sponsorship(
        creator_id=creator_id,
        brand_name=sponsorship_data.brand_name,
        campaign_name=sponsorship_data.campaign_name,
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


def get_all_sponsorships(db: Session, creator_id: int):
    return (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == creator_id)
        .order_by(
            Sponsorship.start_date.desc(),
            Sponsorship.id.desc()
        )
        .all()
    )


def get_sponsorship_by_id(
    db: Session,
    creator_id: int,
    sponsorship_id: int
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
    sponsorship,
    sponsorship_data
):
    update_data = sponsorship_data.model_dump(
        exclude_unset=True
    )

    new_start_date = update_data.get(
        "start_date",
        sponsorship.start_date
    )

    new_end_date = update_data.get(
        "end_date",
        sponsorship.end_date
    )

    if new_end_date < new_start_date:
        raise ValueError(
            "End date cannot be earlier than start date"
        )

    for field, value in update_data.items():
        setattr(
            sponsorship,
            field,
            value
        )

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def delete_sponsorship(db: Session, sponsorship):
    db.delete(sponsorship)
    db.commit()