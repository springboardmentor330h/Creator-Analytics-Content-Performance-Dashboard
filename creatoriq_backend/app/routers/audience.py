from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.schemas.audience import (
    AudienceCreate,
    AudienceUpdate,
)
from app.services.audience_service import (
    get_total_followers,
    get_total_reach,
    get_total_impressions,
    get_gender_distribution,
    get_age_distribution,
    get_top_countries,
    get_top_cities,
    get_device_distribution,
    get_growth_trend,
    get_audience_trends as build_audience_trends,
)


router = APIRouter(
    tags=["Audience Analytics"],
)


# ---------------------------------
# AUDIENCE CRUD
# ---------------------------------

@router.post("/audience")
def create_audience(
    audience_data: AudienceCreate,
    db: Session = Depends(get_db),
):
    new_audience = Audience(
        **audience_data.model_dump()
    )

    db.add(new_audience)
    db.commit()
    db.refresh(new_audience)

    return new_audience


@router.get("/audience")
def get_all_audience(
    db: Session = Depends(get_db),
):
    return db.query(Audience).all()


@router.get("/audience/{audience_id}")
def get_audience_by_id(
    audience_id: int,
    db: Session = Depends(get_db),
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience not found",
        )

    return audience


@router.put("/audience/{audience_id}")
def update_audience(
    audience_id: int,
    audience_data: AudienceUpdate,
    db: Session = Depends(get_db),
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience not found",
        )

    update_data = audience_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(audience, field, value)

    db.commit()
    db.refresh(audience)

    return audience


@router.delete("/audience/{audience_id}")
def delete_audience(
    audience_id: int,
    db: Session = Depends(get_db),
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience not found",
        )

    db.delete(audience)
    db.commit()

    return {
        "message": "Audience deleted successfully",
        "audience_id": audience_id,
    }


# ---------------------------------
# AUDIENCE ANALYTICS
# ---------------------------------

@router.get("/analytics/audience")
def get_audience_analytics(
    db: Session = Depends(get_db),
):
    top_countries = get_top_countries(db)
    top_cities = get_top_cities(db)
    device_distribution = get_device_distribution(db)

    return {
        "total_followers": get_total_followers(db),
        "total_reach": get_total_reach(db),
        "total_impressions": get_total_impressions(db),
        "gender_distribution": get_gender_distribution(db),
        "age_distribution": get_age_distribution(db),
        "top_countries": top_countries,
        "top_cities": top_cities,
        "device_usage": device_distribution,
    }


# ---------------------------------
# GROWTH ANALYTICS
# ---------------------------------

@router.get("/analytics/growth")
def get_growth_analytics(
    db: Session = Depends(get_db),
):
    return get_growth_trend(db)


# ---------------------------------
# AUDIENCE TRENDS
# ---------------------------------

@router.get("/analytics/audience-trends")
def get_audience_trends(
    db: Session = Depends(get_db),
):
    return build_audience_trends(db)