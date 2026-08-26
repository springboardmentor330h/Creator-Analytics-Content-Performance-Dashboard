from sqlalchemy.orm import Session

from app.models.sponsorship import Sponsorship
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate


def create_sponsorship(
    db: Session,
    sponsorship_data: SponsorshipCreate
):
    sponsorship = Sponsorship(
        **sponsorship_data.model_dump()
    )

    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def get_all_sponsorships(db: Session):
    return db.query(Sponsorship).all()


def get_sponsorship(
    db: Session,
    sponsorship_id: int
):
    return db.query(Sponsorship).filter(
        Sponsorship.id == sponsorship_id
    ).first()


def update_sponsorship(
    db: Session,
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate
):
    sponsorship = get_sponsorship(db, sponsorship_id)

    if not sponsorship:
        return None

    update_data = sponsorship_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(sponsorship, key, value)

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


def delete_sponsorship(
    db: Session,
    sponsorship_id: int
):
    sponsorship = get_sponsorship(db, sponsorship_id)

    if not sponsorship:
        return None

    db.delete(sponsorship)
    db.commit()

    return sponsorship