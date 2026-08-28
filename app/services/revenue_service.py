from sqlalchemy.orm import Session

from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueUpdate

from app.services.notification_service import check_revenue_alert


# def get_creator_by_email(db: Session, email: str):
#     return (
#         db.query(User)
#         .filter(User.email == email)
#         .first()
#     )


def create_revenue(
    db: Session,
    revenue_data: RevenueCreate,
    creator_id: int
):
    revenue = Revenue(
        creator_id=creator_id,
        source=revenue_data.source,
        amount=revenue_data.amount,
        currency=revenue_data.currency,
        description=revenue_data.description,
        revenue_date=revenue_data.revenue_date
    )

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

    # Check for revenue alert
    check_revenue_alert(
        db,
        creator_id,
        revenue
    )

    return revenue


def get_all_revenue(
    db: Session,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(
            Revenue.revenue_date.desc()
        )
        .all()
    )


def get_revenue_by_id(
    db: Session,
    revenue_id: int,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id
        )
        .first()
    )


def update_revenue(
    db: Session,
    revenue: Revenue,
    revenue_data: RevenueUpdate
):
    update_data = revenue_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            revenue,
            field,
            value
        )

    db.commit()
    db.refresh(revenue)

    # Check for revenue alert after update
    check_revenue_alert(
        db,
        revenue.creator_id,
        revenue
    )

    return revenue


def delete_revenue(
    db: Session,
    revenue: Revenue
):
    db.delete(revenue)
    db.commit()

    return True