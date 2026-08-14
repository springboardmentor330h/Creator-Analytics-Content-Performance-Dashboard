from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.services import audience_service


router = APIRouter(tags=["Audience"])


# --------------------------------------------------
# 1. Create Audience Record
# --------------------------------------------------

@router.post("/audience")
def create_audience(
    audience: AudienceCreate,
    db: Session = Depends(get_db)
):
    new_audience = Audience(
        creator_id=audience.creator_id,
        age_group=audience.age_group,
        gender=audience.gender,
        country=audience.country,
        city=audience.city,
        device_type=audience.device_type,
        active_hour=audience.active_hour,
        followers=audience.followers,
        impressions=audience.impressions,
        reach=audience.reach
    )

    db.add(new_audience)
    db.commit()
    db.refresh(new_audience)

    return {
        "message": "Audience record created successfully",
        "data": new_audience
    }


# --------------------------------------------------
# 2. Get All Audience Records
# --------------------------------------------------

@router.get("/audience")
def get_all_audience(
    db: Session = Depends(get_db)
):
    audience_records = db.query(Audience).all()

    return {
        "count": len(audience_records),
        "data": audience_records
    }


# --------------------------------------------------
# 3. Get Audience By ID
# --------------------------------------------------

@router.get("/audience/{audience_id}")
def get_audience_by_id(
    audience_id: int,
    db: Session = Depends(get_db)
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    return {
        "data": audience
    }


# --------------------------------------------------
# 4. Update Audience Record
# --------------------------------------------------

@router.put("/audience/{audience_id}")
def update_audience(
    audience_id: int,
    updated_audience: AudienceUpdate,
    db: Session = Depends(get_db)
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    update_data = updated_audience.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(audience, field, value)

    db.commit()
    db.refresh(audience)

    return {
        "message": "Audience record updated successfully",
        "data": audience
    }


# --------------------------------------------------
# 5. Delete Audience Record
# --------------------------------------------------

@router.delete("/audience/{audience_id}")
def delete_audience(
    audience_id: int,
    db: Session = Depends(get_db)
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

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


# --------------------------------------------------
# 6. Audience Analytics Report
# --------------------------------------------------

@router.get("/analytics/audience")
def get_audience_analytics(
    db: Session = Depends(get_db)
):
    gender_distribution = (
        audience_service.get_gender_distribution(db)
    )

    age_distribution = (
        audience_service.get_age_distribution(db)
    )

    top_countries = (
        audience_service.get_top_countries(db)
    )

    top_cities = (
        audience_service.get_top_cities(db)
    )

    device_distribution = (
        audience_service.get_device_distribution(db)
    )

    return {
        "total_followers": audience_service.get_total_followers(db),
        "total_reach": audience_service.get_total_reach(db),
        "total_impressions": audience_service.get_total_impressions(db),
        "gender_distribution": gender_distribution,
        "age_distribution": age_distribution,
        "top_countries": top_countries,
        "top_cities": top_cities,
        "device_usage": device_distribution
    }


# --------------------------------------------------
# 7. Growth Analytics Report
# --------------------------------------------------

@router.get("/analytics/growth")
def get_growth_analytics(
    db: Session = Depends(get_db)
):
    return audience_service.get_growth_trend(
        db,
        days=30
    )


# --------------------------------------------------
# 8. Audience Trends API
# --------------------------------------------------

@router.get("/analytics/audience-trends")
def get_audience_trends(
    db: Session = Depends(get_db)
):
    return audience_service.get_audience_trends(
        db,
        days=30
    )
