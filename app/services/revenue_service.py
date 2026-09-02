from sqlalchemy.orm import Session
from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate


def create_revenue(
    db: Session,
    creator_id: int,
    data: RevenueCreate
):
    revenue = Revenue(
        creator_id=creator_id,
        source=data.source,
        amount=data.amount,
        description=data.description,
        revenue_date=data.revenue_date
    )

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

    return revenue


def get_creator_revenues(
    db: Session,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.revenue_date.desc())
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
    data: RevenueUpdate
):
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(revenue, field, value)

    db.commit()
    db.refresh(revenue)

    return revenue


def delete_revenue(
    db: Session,
    revenue: Revenue
):
    db.delete(revenue)
    db.commit()

    return True
