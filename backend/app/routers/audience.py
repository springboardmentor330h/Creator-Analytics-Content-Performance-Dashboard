from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.services.audience_service import (
    get_audience_analytics,
    get_growth_trend
)


router = APIRouter(
    tags=["Audience"]
)


# =========================
# CREATE AUDIENCE
# =========================

@router.post("/audience")
def create_audience(
    audience_data: AudienceCreate,
    db: Session = Depends(get_db)
):
    new_audience = Audience(
        creator_id=audience_data.creator_id,
        age_group=audience_data.age_group,
        gender=audience_data.gender,
        country=audience_data.country,
        city=audience_data.city,
        device_type=audience_data.device_type,
        active_hour=audience_data.active_hour,
        followers=audience_data.followers,
        impressions=audience_data.impressions,
        reach=audience_data.reach
    )

    db.add(new_audience)
    db.commit()
    db.refresh(new_audience)

    return {
        "message": "Audience record created successfully",
        "data": new_audience
    }


# =========================
# GET ALL AUDIENCE
# =========================

@router.get("/audience")
def get_all_audience(
    db: Session = Depends(get_db)
):
    audience = db.query(Audience).all()

    return {
        "message": "Audience records fetched successfully",
        "data": audience
    }


# =========================
# GET AUDIENCE BY ID
# =========================

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
        "message": "Audience record fetched successfully",
        "data": audience
    }


# =========================
# UPDATE AUDIENCE
# =========================

@router.put("/audience/{audience_id}")
def update_audience(
    audience_id: int,
    audience_data: AudienceUpdate,
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

    update_data = audience_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(audience, key, value)

    db.commit()
    db.refresh(audience)

    return {
        "message": "Audience record updated successfully",
        "data": audience
    }


# =========================
# DELETE AUDIENCE
# =========================

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


# =========================
# AUDIENCE ANALYTICS
# =========================

@router.get("/analytics/audience")
def audience_analytics(
    db: Session = Depends(get_db)
):
    result = get_audience_analytics(db)

    return {
        "message": "Audience analytics fetched successfully",
        "data": result
    }


# =========================
# GROWTH ANALYTICS
# =========================

@router.get("/analytics/growth")
def growth_analytics(
    db: Session = Depends(get_db)
):
    result = get_growth_trend(db)

    return {
        "message": "Growth analytics fetched successfully",
        "data": result
    }


# =========================
# AUDIENCE TRENDS
# =========================

@router.get("/analytics/audience-trends")
def audience_trends(
    db: Session = Depends(get_db)
):
    growth_records = (
        db.query(
            __import__(
                "app.models.growth",
                fromlist=["Growth"]
            ).Growth
        )
        .order_by(
            __import__(
                "app.models.growth",
                fromlist=["Growth"]
            ).Growth.date.asc()
        )
        .limit(30)
        .all()
    )

    result = []

    for record in growth_records:
        result.append({
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach
        })

    return {
        "message": "Audience trends fetched successfully",
        "data": result
    }