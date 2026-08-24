from sqlalchemy.orm import Session

from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate


def create_revenue(
    db: Session,
    revenue_data: RevenueCreate
):
    revenue = Revenue(
        creator_id=revenue_data.creator_id,
        source=revenue_data.source,
        amount=revenue_data.amount,
        description=revenue_data.description,
        date=revenue_data.date
    )

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

    return revenue


def get_revenues(
    db: Session,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(Revenue.date.desc())
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


# ---------------------------------------------
# REVENUE ANALYTICS
# ---------------------------------------------

def get_total_revenue(
    db: Session,
    creator_id: int
):
    revenues = (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .all()
    )

    total = sum(
        revenue.amount
        for revenue in revenues
    )

    return round(total, 2)


def get_revenue_by_source(
    db: Session,
    creator_id: int
):
    revenues = (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .all()
    )

    result = {}

    for revenue in revenues:
        if revenue.source not in result:
            result[revenue.source] = 0

        result[revenue.source] += revenue.amount

    return {
        source: round(amount, 2)
        for source, amount in result.items()
    }


def get_monthly_revenue(
    db: Session,
    creator_id: int
):
    revenues = (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(Revenue.date)
        .all()
    )

    monthly_data = {}

    for revenue in revenues:

        month = revenue.date.strftime(
            "%Y-%m"
        )

        if month not in monthly_data:
            monthly_data[month] = 0

        monthly_data[month] += revenue.amount

    return [
        {
            "month": month,
            "revenue": round(amount, 2)
        }
        for month, amount in monthly_data.items()
    ]


def get_revenue_trend(
    db: Session,
    creator_id: int
):
    revenues = (
        db.query(Revenue)
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(Revenue.date)
        .all()
    )

    daily_data = {}

    for revenue in revenues:

        day = revenue.date.isoformat()

        if day not in daily_data:
            daily_data[day] = 0

        daily_data[day] += revenue.amount

    return [
        {
            "date": day,
            "revenue": round(amount, 2)
        }
        for day, amount in daily_data.items()
    ]