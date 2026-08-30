from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db

from app.models.audience import Audience
from app.models.growth import Growth
from app.models.user import User

from app.schemas.audience import (
    AudienceCreate,
    AudienceUpdate,
)

from app.schemas.growth import (
    GrowthCreate,
    GrowthUpdate,
)

from app.services.audience_service import (
    get_audience_report,
    get_growth_report,
    get_audience_trends,
)


router = APIRouter(
    tags=["Audience and Growth Analytics"],
)


# ============================================================
# ROLE HELPERS
# ============================================================

def is_admin(
    current_user: User,
) -> bool:
    return current_user.role == "Administrator"


def is_creator(
    current_user: User,
) -> bool:
    return current_user.role == "Creator"


def get_creator_scope(
    current_user: User,
) -> int | None:
    """
    Administrator -> None -> all creators
    Creator -> current user id
    """

    if is_admin(current_user):
        return None

    return current_user.id


# ============================================================
# CREATE AUDIENCE
# POST /audience
# ============================================================

@router.post(
    "/audience",
    status_code=status.HTTP_201_CREATED,
)
def create_audience_record(
    audience_data: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only creators can create audience records.
    """

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can create "
                "audience records."
            ),
        )

    new_audience = Audience(
        creator_id=current_user.id,
        age_group=audience_data.age_group,
        gender=audience_data.gender,
        country=audience_data.country,
        city=audience_data.city,
        device_type=audience_data.device_type,
        active_hour=audience_data.active_hour,
        followers=audience_data.followers,
        impressions=audience_data.impressions,
        reach=audience_data.reach,
    )

    db.add(new_audience)

    db.commit()

    db.refresh(new_audience)

    return new_audience


# ============================================================
# GET ALL AUDIENCE
# GET /audience
# ============================================================

@router.get(
    "/audience"
)
def get_all_audience_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator -> own audience records.
    Administrator -> all audience records.
    """

    query = db.query(Audience)

    if not is_admin(current_user):

        query = query.filter(
            Audience.creator_id
            == current_user.id
        )

    return query.all()


# ============================================================
# GET AUDIENCE BY ID
# ============================================================

@router.get(
    "/audience/{audience_id}"
)
def get_audience_by_id(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Audience)
        .filter(
            Audience.id
            == audience_id
        )
    )

    if not is_admin(current_user):

        query = query.filter(
            Audience.creator_id
            == current_user.id
        )

    audience = query.first()

    if not audience:

        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    return audience


# ============================================================
# UPDATE AUDIENCE
# ============================================================

@router.put(
    "/audience/{audience_id}"
)
def update_audience_record(
    audience_id: int,
    audience_data: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if is_admin(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Administrators can view audience "
                "data but cannot modify it."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Only creators can update "
                "audience records."
            ),
        )

    audience = (
        db.query(Audience)
        .filter(
            Audience.id
            == audience_id,
            Audience.creator_id
            == current_user.id,
        )
        .first()
    )

    if not audience:

        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    update_data = (
        audience_data.model_dump(
            exclude_unset=True
        )
    )

    update_data.pop(
        "creator_id",
        None,
    )

    for field, value in update_data.items():

        setattr(
            audience,
            field,
            value,
        )

    db.commit()

    db.refresh(audience)

    return {
        "message": (
            "Audience record updated successfully"
        ),
        "data": audience,
    }


# ============================================================
# DELETE AUDIENCE
# ============================================================

@router.delete(
    "/audience/{audience_id}"
)
def delete_audience_record(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if is_admin(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Administrators can view audience "
                "data but cannot delete it."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Only creators can delete "
                "audience records."
            ),
        )

    audience = (
        db.query(Audience)
        .filter(
            Audience.id
            == audience_id,
            Audience.creator_id
            == current_user.id,
        )
        .first()
    )

    if not audience:

        raise HTTPException(
            status_code=404,
            detail="Audience record not found",
        )

    db.delete(audience)

    db.commit()

    return {
        "message": (
            "Audience record deleted successfully"
        )
    }


# ============================================================
# CREATE GROWTH
# POST /growth
# ============================================================

@router.post(
    "/growth",
    status_code=status.HTTP_201_CREATED,
)
def create_growth_record(
    growth_data: GrowthCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not is_creator(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Only creators can create "
                "growth records."
            ),
        )

    new_growth = Growth(
        creator_id=current_user.id,
        date=growth_data.date,
        followers=growth_data.followers,
        reach=growth_data.reach,
        engagement_rate=(
            growth_data.engagement_rate
        ),
    )

    db.add(new_growth)

    db.commit()

    db.refresh(new_growth)

    return new_growth


# ============================================================
# GET ALL GROWTH
# GET /growth
# ============================================================

@router.get(
    "/growth"
)
def get_all_growth_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Growth)

    if not is_admin(current_user):

        query = query.filter(
            Growth.creator_id
            == current_user.id
        )

    return (
        query
        .order_by(
            Growth.date.asc(),
            Growth.id.asc(),
        )
        .all()
    )


# ============================================================
# GET GROWTH BY ID
# ============================================================

@router.get(
    "/growth/{growth_id}"
)
def get_growth_by_id(
    growth_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Growth)
        .filter(
            Growth.id
            == growth_id
        )
    )

    if not is_admin(current_user):

        query = query.filter(
            Growth.creator_id
            == current_user.id
        )

    growth = query.first()

    if not growth:

        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    return growth


# ============================================================
# UPDATE GROWTH
# ============================================================

@router.put(
    "/growth/{growth_id}"
)
def update_growth_record(
    growth_id: int,
    growth_data: GrowthUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if is_admin(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Administrators can view growth "
                "data but cannot modify it."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Only creators can update "
                "growth records."
            ),
        )

    growth = (
        db.query(Growth)
        .filter(
            Growth.id == growth_id,
            Growth.creator_id
            == current_user.id,
        )
        .first()
    )

    if not growth:

        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    update_data = (
        growth_data.model_dump(
            exclude_unset=True
        )
    )

    update_data.pop(
        "creator_id",
        None,
    )

    for field, value in update_data.items():

        setattr(
            growth,
            field,
            value,
        )

    db.commit()

    db.refresh(growth)

    return {
        "message": (
            "Growth record updated successfully"
        ),
        "data": growth,
    }


# ============================================================
# DELETE GROWTH
# ============================================================

@router.delete(
    "/growth/{growth_id}"
)
def delete_growth_record(
    growth_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if is_admin(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Administrators can view growth "
                "data but cannot delete it."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=403,
            detail=(
                "Only creators can delete "
                "growth records."
            ),
        )

    growth = (
        db.query(Growth)
        .filter(
            Growth.id == growth_id,
            Growth.creator_id
            == current_user.id,
        )
        .first()
    )

    if not growth:

        raise HTTPException(
            status_code=404,
            detail="Growth record not found",
        )

    db.delete(growth)

    db.commit()

    return {
        "message": (
            "Growth record deleted successfully"
        )
    }


# ============================================================
# AUDIENCE ANALYTICS
# GET /analytics/audience
# ============================================================

@router.get(
    "/analytics/audience"
)
def audience_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = get_creator_scope(
        current_user
    )

    return get_audience_report(
        db,
        creator_id=creator_id,
    )


# ============================================================
# GROWTH ANALYTICS
# GET /analytics/growth
# ============================================================

@router.get(
    "/analytics/growth"
)
def growth_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = get_creator_scope(
        current_user
    )

    return get_growth_report(
        db,
        creator_id=creator_id,
    )


# ============================================================
# AUDIENCE TRENDS
# GET /analytics/audience-trends
# ============================================================

@router.get(
    "/analytics/audience-trends"
)
def audience_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = get_creator_scope(
        current_user
    )

    return get_audience_trends(
        db,
        creator_id=creator_id,
    )