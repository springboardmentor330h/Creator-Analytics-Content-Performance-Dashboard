
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.audience import Audience
from app.models.user import User
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.services import audience_service


router = APIRouter(tags=["Audience"])


# --------------------------------------------------
# Helper: Get authenticated user
# --------------------------------------------------

def get_authenticated_user(
    current_user=Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authenticated user not found"
        )

    return current_user


# --------------------------------------------------
# 1. Create Audience Record
# --------------------------------------------------

@router.post("/audience")
def create_audience(
    audience: AudienceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    # Support User object returned by authentication
    if isinstance(current_user, User):
        creator_id = current_user.id

    # Support email string returned by authentication
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    new_audience = Audience(
        creator_id=creator_id,
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
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    audience_records = (
        db.query(Audience)
        .filter(Audience.creator_id == creator_id)
        .all()
    )

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
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id,
            Audience.creator_id == creator_id
        )
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
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id,
            Audience.creator_id == creator_id
        )
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

    # Never allow client to change ownership
    update_data.pop("creator_id", None)

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
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    audience = (
        db.query(Audience)
        .filter(
            Audience.id == audience_id,
            Audience.creator_id == creator_id
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
        "message": "Audience record deleted successfully"
    }


# --------------------------------------------------
# 6. Audience Analytics Report
# --------------------------------------------------

@router.get("/analytics/audience")
def get_audience_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    gender_distribution = (
        audience_service.get_gender_distribution(
            db,
            creator_id
        )
    )

    age_distribution = (
        audience_service.get_age_distribution(
            db,
            creator_id
        )
    )

    top_countries = (
        audience_service.get_top_countries(
            db,
            creator_id
        )
    )

    top_cities = (
        audience_service.get_top_cities(
            db,
            creator_id
        )
    )

    device_distribution = (
        audience_service.get_device_distribution(
            db,
            creator_id
        )
    )

    return {
        "total_followers": audience_service.get_total_followers(
            db,
            creator_id
        ),
        "total_reach": audience_service.get_total_reach(
            db,
            creator_id
        ),
        "total_impressions": audience_service.get_total_impressions(
            db,
            creator_id
        ),
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
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    return audience_service.get_growth_trend(
        db,
        creator_id,
        days=30
    )


# --------------------------------------------------
# 8. Audience Trends API
# --------------------------------------------------

@router.get("/analytics/audience-trends")
def get_audience_trends(
    db: Session = Depends(get_db),
    current_user=Depends(get_authenticated_user)
):
    if isinstance(current_user, User):
        creator_id = current_user.id
    else:
        user = (
            db.query(User)
            .filter(User.email == current_user)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authenticated user not found"
            )

        creator_id = user.id

    return audience_service.get_audience_trends(
        db,
        creator_id,
        days=30
    )

