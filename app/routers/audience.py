from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.audience import Audience
from app.models.growth import Growth

from app.schemas.audience import (
    AudienceCreate,
    AudienceUpdate,
    AudienceResponse,
)

from app.schemas.growth import (
    GrowthCreate,
    GrowthUpdate,
    GrowthResponse,
)

from app.services.audience_service import report


router = APIRouter(
    tags=["Audience"],
)


@router.post(
    "/audience",
    response_model=AudienceResponse,
    status_code=201,
)
def create_audience(
    data: AudienceCreate,
    db: Session = Depends(get_db),
):
    obj = Audience(
        **data.model_dump()
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


@router.get(
    "/audience",
    response_model=List[AudienceResponse],
)
def get_audience(
    db: Session = Depends(get_db),
):
    return (
        db.query(Audience)
        .order_by(Audience.id.desc())
        .all()
    )


@router.get(
    "/audience/{audience_id}",
    response_model=AudienceResponse,
)
def get_audience_id(
    audience_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    return obj


@router.put(
    "/audience/{audience_id}",
    response_model=AudienceResponse,
)
def update_audience(
    audience_id: UUID,
    data: AudienceUpdate,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)

    return obj


@router.delete("/audience/{audience_id}")
def delete_audience(
    audience_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    db.delete(obj)
    db.commit()

    return {
        "message": "Audience record deleted successfully"
    }


@router.get("/analytics/audience")
def audience_report(
    db: Session = Depends(get_db),
):
    return report(db)


@router.post(
    "/growth",
    response_model=GrowthResponse,
    status_code=201,
)
def create_growth(
    data: GrowthCreate,
    db: Session = Depends(get_db),
):
    obj = Growth(
        **data.model_dump()
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


@router.get(
    "/growth",
    response_model=List[GrowthResponse],
)
def get_growth(
    db: Session = Depends(get_db),
):
    return (
        db.query(Growth)
        .order_by(Growth.date.desc())
        .all()
    )


@router.get(
    "/growth/{growth_id}",
    response_model=GrowthResponse,
)
def get_growth_id(
    growth_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Growth)
        .filter(Growth.id == growth_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    return obj


@router.put(
    "/growth/{growth_id}",
    response_model=GrowthResponse,
)
def update_growth(
    growth_id: UUID,
    data: GrowthUpdate,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Growth)
        .filter(Growth.id == growth_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)

    return obj


@router.delete("/growth/{growth_id}")
def delete_growth(
    growth_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Growth)
        .filter(Growth.id == growth_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    db.delete(obj)
    db.commit()

    return {
        "message": "Growth record deleted successfully"
    }


@router.get("/analytics/growth")
def analytics_growth(
    db: Session = Depends(get_db),
):
    return growth_report(db)


@router.get("/analytics/audience-trends")
def audience_trends(
    db: Session = Depends(get_db),
):
    return trends(db)




