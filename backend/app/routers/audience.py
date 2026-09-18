from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate, AudienceOut
from app.schemas.growth import GrowthCreate, GrowthOut
from app.services import audience_service
from app.core.deps import get_current_user
from app.services.access_service import resolve_creator_filter

router = APIRouter()


# ---- Audience CRUD ----

@router.post("/audience", response_model=AudienceOut, status_code=201)
def create_audience(
    payload: AudienceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add audience data")
    record = Audience(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/audience", response_model=list[AudienceOut])
def get_all_audience(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    query = db.query(Audience)
    if allowed is not None:
        query = query.filter(Audience.creator_id.in_(allowed))
    return query.all()


@router.get("/audience/{id}", response_model=AudienceOut)
def get_audience(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    # Enforce creator scoping on single-record access
    allowed = resolve_creator_filter(db, current_user, None)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this record")
    return record


@router.put("/audience/{id}", response_model=AudienceOut)
def update_audience(
    id: int,
    payload: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    allowed = resolve_creator_filter(db, current_user, None)
    if allowed is not None and record.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this record")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/audience/{id}")
def delete_audience(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete audience data")
    record = db.query(Audience).filter(Audience.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audience record not found")
    db.delete(record)
    db.commit()
    return {"message": "Audience record deleted successfully"}


# ---- Growth CRUD ----

@router.post("/growth", response_model=GrowthOut, status_code=201)
def create_growth(
    payload: GrowthCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add growth data")
    record = Growth(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/growth", response_model=list[GrowthOut])
def get_all_growth(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    query = db.query(Growth).order_by(Growth.date.asc())
    if allowed is not None:
        query = query.filter(Growth.creator_id.in_(allowed))
    return query.all()


# ---- Analytics reports ----

@router.get("/analytics/audience")
def audience_report(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return audience_service.get_audience_report(db, allowed)


@router.get("/analytics/growth")
def growth_report(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return audience_service.get_growth_report(db, days=30, allowed_creator_ids=allowed)


@router.get("/analytics/audience-trends")
def audience_trends(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return audience_service.get_audience_trends(db, allowed_creator_ids=allowed)


@router.get("/analytics/growth-trends")
def growth_trends(
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return audience_service.get_growth_trends(db, allowed_creator_ids=allowed)


@router.get("/analytics/growth-trends/{platform}")
def growth_trends_by_platform(
    platform: str,
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed = resolve_creator_filter(db, current_user, creator_id)
    return audience_service.get_growth_trends_by_platform(db, platform, allowed_creator_ids=allowed)   