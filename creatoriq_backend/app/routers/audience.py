from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.audience import Audience
from app.models.growth import Growth

from app.schemas.audience import (
    AudienceCreate,
    AudienceUpdate
)

from app.schemas.growth import (
    GrowthCreate,
    GrowthUpdate
)

from app.services.audience_service import (
    get_audience_report,
    get_growth_report,
    get_audience_trends
)


router = APIRouter(
    tags=["Audience Analytics"]
)


# ============================================================
# CREATE AUDIENCE RECORD
# POST /audience
# ============================================================

@router.post(
    "/audience",
    status_code=status.HTTP_201_CREATED
)
def create_audience_record(

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

    return new_audience


# ============================================================
# GET ALL AUDIENCE RECORDS
# GET /audience
# ============================================================

@router.get(
    "/audience"
)
def get_all_audience_records(

    db: Session = Depends(get_db)
):

    records = (
        db.query(Audience)
        .all()
    )

    return records


# ============================================================
# GET AUDIENCE BY ID
# GET /audience/{audience_id}
# ============================================================

@router.get(
    "/audience/{audience_id}"
)
def get_audience_by_id(

    audience_id: int,

    db: Session = Depends(get_db)
):

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id
        )
        .first()
    )

    if not audience:

        raise HTTPException(

            status_code=404,

            detail="Audience record not found"
        )

    return audience


# ============================================================
# UPDATE AUDIENCE RECORD
# PUT /audience/{audience_id}
# ============================================================

@router.put(
    "/audience/{audience_id}"
)
def update_audience_record(

    audience_id: int,

    audience_data: AudienceUpdate,

    db: Session = Depends(get_db)
):

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id
        )
        .first()
    )

    if not audience:

        raise HTTPException(

            status_code=404,

            detail="Audience record not found"
        )

    update_data = (
        audience_data.model_dump(
            exclude_unset=True
        )
    )

    for field, value in update_data.items():

        setattr(
            audience,
            field,
            value
        )

    db.commit()

    db.refresh(audience)

    return {

        "message":
            "Audience record updated successfully",

        "data":
            audience
    }


# ============================================================
# DELETE AUDIENCE RECORD
# DELETE /audience/{audience_id}
# ============================================================

@router.delete(
    "/audience/{audience_id}"
)
def delete_audience_record(

    audience_id: int,

    db: Session = Depends(get_db)
):

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id
        )
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

        "message":
            "Audience record deleted successfully"
    }


# ============================================================
# CREATE GROWTH RECORD
# POST /growth
# ============================================================

@router.post(
    "/growth",
    status_code=status.HTTP_201_CREATED
)
def create_growth_record(

    growth_data: GrowthCreate,

    db: Session = Depends(get_db)
):

    new_growth = Growth(

        creator_id=growth_data.creator_id,

        date=growth_data.date,

        followers=growth_data.followers,

        reach=growth_data.reach,

        engagement_rate=growth_data.engagement_rate
    )

    db.add(new_growth)

    db.commit()

    db.refresh(new_growth)

    return new_growth


# ============================================================
# GET ALL GROWTH RECORDS
# GET /growth
# ============================================================

@router.get(
    "/growth"
)
def get_all_growth_records(

    db: Session = Depends(get_db)
):

    records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .all()
    )

    return records


# ============================================================
# GET GROWTH RECORD BY ID
# ============================================================

@router.get(
    "/growth/{growth_id}"
)
def get_growth_by_id(

    growth_id: int,

    db: Session = Depends(get_db)
):

    growth = (
        db.query(Growth)
        .filter(
            Growth.id == growth_id
        )
        .first()
    )

    if not growth:

        raise HTTPException(

            status_code=404,

            detail="Growth record not found"
        )

    return growth


# ============================================================
# UPDATE GROWTH RECORD
# ============================================================

@router.put(
    "/growth/{growth_id}"
)
def update_growth_record(

    growth_id: int,

    growth_data: GrowthUpdate,

    db: Session = Depends(get_db)
):

    growth = (
        db.query(Growth)
        .filter(
            Growth.id == growth_id
        )
        .first()
    )

    if not growth:

        raise HTTPException(

            status_code=404,

            detail="Growth record not found"
        )

    update_data = (
        growth_data.model_dump(
            exclude_unset=True
        )
    )

    for field, value in update_data.items():

        setattr(
            growth,
            field,
            value
        )

    db.commit()

    db.refresh(growth)

    return {

        "message":
            "Growth record updated successfully",

        "data":
            growth
    }


# ============================================================
# DELETE GROWTH RECORD
# ============================================================

@router.delete(
    "/growth/{growth_id}"
)
def delete_growth_record(

    growth_id: int,

    db: Session = Depends(get_db)
):

    growth = (
        db.query(Growth)
        .filter(
            Growth.id == growth_id
        )
        .first()
    )

    if not growth:

        raise HTTPException(

            status_code=404,

            detail="Growth record not found"
        )

    db.delete(growth)

    db.commit()

    return {

        "message":
            "Growth record deleted successfully"
    }


# ============================================================
# AUDIENCE ANALYTICS REPORT
# GET /analytics/audience
# ============================================================

@router.get(
    "/analytics/audience"
)
def audience_analytics(

    db: Session = Depends(get_db)
):

    return get_audience_report(db)


# ============================================================
# GROWTH ANALYTICS REPORT
# GET /analytics/growth
# ============================================================

@router.get(
    "/analytics/growth"
)
def growth_analytics(

    db: Session = Depends(get_db)
):

    return get_growth_report(db)


# ============================================================
# AUDIENCE TRENDS
# GET /analytics/audience-trends
# ============================================================

@router.get(
    "/analytics/audience-trends"
)
def audience_trends(

    db: Session = Depends(get_db)
):

    return get_audience_trends(db)