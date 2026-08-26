from sqlalchemy.orm import Session

from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate


# CREATE REVENUE
def create_revenue(
    db: Session,
    revenue: RevenueCreate,
    creator_id: int
):
    revenue_data = revenue.model_dump()

    # Use the logged-in creator's ID
    revenue_data["creator_id"] = creator_id

    new_revenue = Revenue(**revenue_data)

    db.add(new_revenue)
    db.commit()
    db.refresh(new_revenue)

    return new_revenue


# GET REVENUE FOR CURRENT CREATOR ONLY
def get_revenues_by_creator(
    db: Session,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .all()
    )


# GET ONE REVENUE BY ID
def get_revenue_by_id(
    db: Session,
    revenue_id: int
):
    return (
        db.query(Revenue)
        .filter(Revenue.id == revenue_id)
        .first()
    )


# UPDATE REVENUE
def update_revenue(
    db: Session,
    revenue_id: int,
    revenue_data: RevenueUpdate
):
    revenue = get_revenue_by_id(
        db,
        revenue_id
    )

    if not revenue:
        return None

    update_data = revenue_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(revenue, key, value)

    db.commit()
    db.refresh(revenue)

    return revenue


# DELETE REVENUE
def delete_revenue(
    db: Session,
    revenue_id: int
):
    revenue = get_revenue_by_id(
        db,
        revenue_id
    )

    if not revenue:
        return None

    db.delete(revenue)
    db.commit()

    return revenue