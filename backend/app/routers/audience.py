from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate

from app.services.audience_service import (
    get_total_followers,
    get_total_reach,
    get_total_impressions,
    get_gender_distribution,
    get_age_distribution,
    get_top_countries,
    get_top_cities,
    get_device_distribution,
    get_growth_trend
)

router = APIRouter(
    tags=["Audience"]
)


@router.post("/audience")
def create_audience(
    data: AudienceCreate,
    db: Session = Depends(get_db)
):
    audience = Audience(**data.model_dump())

    db.add(audience)
    db.commit()
    db.refresh(audience)

    return audience


@router.get("/audience")
def get_audience(db: Session = Depends(get_db)):
    return db.query(Audience).all()


@router.get("/audience/{id}")
def get_audience_by_id(
    id: int,
    db: Session = Depends(get_db)
):
    audience = db.query(Audience).filter(Audience.id == id).first()

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    return audience


@router.put("/audience/{id}")
def update_audience(
    id: int,
    data: AudienceUpdate,
    db: Session = Depends(get_db)
):
    audience = db.query(Audience).filter(Audience.id == id).first()

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(audience, key, value)

    db.commit()
    db.refresh(audience)

    return audience


@router.delete("/audience/{id}")
def delete_audience(
    id: int,
    db: Session = Depends(get_db)
):
    audience = db.query(Audience).filter(Audience.id == id).first()

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    db.delete(audience)
    db.commit()

    return {
        "message": "Audience record deleted successfully"
    }


@router.get("/analytics/audience")
def audience_analytics(
    db: Session = Depends(get_db)
):
    return {
        "total_followers": get_total_followers(db),
        "total_reach": get_total_reach(db),
        "total_impressions": get_total_impressions(db),
        "gender_distribution": get_gender_distribution(db),
        "age_distribution": get_age_distribution(db),
        "top_countries": get_top_countries(db),
        "top_cities": get_top_cities(db),
        "device_distribution": get_device_distribution(db)
    }


@router.get("/analytics/growth")
def growth_analytics(
    db: Session = Depends(get_db)
):
    return get_growth_trend(db)


@router.get("/analytics/audience-trends")
def audience_trends(
    db: Session = Depends(get_db)
):
    growth_data = db.query(Growth).order_by(Growth.date.asc()).all()

    return [
        {
            "date": item.date,
            "followers": item.followers,
            "reach": item.reach
        }
        for item in growth_data
    ]