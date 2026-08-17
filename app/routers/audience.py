from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audience import Audience
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.services.audience_service import (
    get_audience_report,
    get_audience_trends,
    get_device_distribution,
    get_growth_report,
)


router = APIRouter(
    prefix="/audience",
    tags=["Audience"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
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
        "data": {
            "id": new_audience.id,
            "creator_id": new_audience.creator_id,
            "age_group": new_audience.age_group,
            "gender": new_audience.gender,
            "country": new_audience.country,
            "city": new_audience.city,
            "device_type": new_audience.device_type,
            "active_hour": new_audience.active_hour,
            "followers": new_audience.followers,
            "impressions": new_audience.impressions,
            "reach": new_audience.reach
        }
    }


@router.get("/")
def get_audience_records(
    db: Session = Depends(get_db)
):
    records = db.query(Audience).all()

    return {
        "message": "Audience records fetched successfully",
        "data": [
            {
                "id": record.id,
                "creator_id": record.creator_id,
                "age_group": record.age_group,
                "gender": record.gender,
                "country": record.country,
                "city": record.city,
                "device_type": record.device_type,
                "active_hour": record.active_hour,
                "followers": record.followers,
                "impressions": record.impressions,
                "reach": record.reach
            }
            for record in records
        ]
    }


@router.get("/{audience_id}")
def get_audience_by_id(
    audience_id: int,
    db: Session = Depends(get_db)
):
    record = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )

    return {
        "message": "Audience record fetched successfully",
        "data": {
            "id": record.id,
            "creator_id": record.creator_id,
            "age_group": record.age_group,
            "gender": record.gender,
            "country": record.country,
            "city": record.city,
            "device_type": record.device_type,
            "active_hour": record.active_hour,
            "followers": record.followers,
            "impressions": record.impressions,
            "reach": record.reach
        }
    }


@router.put("/{audience_id}")
def update_audience(
    audience_id: int,
    audience_data: AudienceUpdate,
    db: Session = Depends(get_db)
):
    record = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )

    update_data = audience_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return {
        "message": "Audience record updated successfully",
        "data": {
            "id": record.id,
            "creator_id": record.creator_id,
            "age_group": record.age_group,
            "gender": record.gender,
            "country": record.country,
            "city": record.city,
            "device_type": record.device_type,
            "active_hour": record.active_hour,
            "followers": record.followers,
            "impressions": record.impressions,
            "reach": record.reach
        }
    }


@router.delete("/{audience_id}")
def delete_audience(
    audience_id: int,
    db: Session = Depends(get_db)
):
    record = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Audience record deleted successfully"
    }


analytics_router = APIRouter(
    prefix="/analytics",
    tags=["Audience Analytics"]
)


@analytics_router.get("/audience")
def audience_analytics(
    db: Session = Depends(get_db)
):
    return get_audience_report(db)


@analytics_router.get("/growth")
def growth_analytics(
    db: Session = Depends(get_db)
):
    return get_growth_report(db)


@analytics_router.get("/audience-trends")
def audience_trends(
    db: Session = Depends(get_db)
):
    return get_audience_trends(db)