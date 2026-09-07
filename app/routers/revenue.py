from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.revenue import RevenueRecord, Sponsorship
from app.schemas.revenue import (
    RevenueCreate,
    RevenueResponse,
    SponsorshipCreate,
    SponsorshipResponse,
    SponsorshipUpdate,
)
from app.services.revenue_service import (
    get_monthly_breakdown,
    get_revenue_summary,
    get_revenue_trend,
    get_sponsorship_summary,
)
from app.utils.responses import success_response

router = APIRouter(prefix="/revenue", tags=["Revenue"])


@router.post("/", response_model=dict, status_code=201)
def create_revenue(payload: RevenueCreate, db: Session = Depends(get_db)):
    record = RevenueRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return success_response(
        data=RevenueResponse.model_validate(record).model_dump(),
        message="Revenue record created successfully",
        status_code=201,
    )


@router.get("/", response_model=dict)
def get_all_revenue(creator_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(RevenueRecord)
    if creator_id is not None:
        query = query.filter(RevenueRecord.creator_id == creator_id)

    records = [RevenueResponse.model_validate(r).model_dump() for r in query.all()]
    return success_response(data=records, message="Revenue records retrieved successfully")


@router.delete("/{revenue_id}", response_model=dict)
def delete_revenue(revenue_id: int, db: Session = Depends(get_db)):
    record = db.query(RevenueRecord).filter(RevenueRecord.id == revenue_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Revenue record not found")

    db.delete(record)
    db.commit()
    return success_response(data={"id": revenue_id}, message="Revenue record deleted successfully")


@router.get("/creator/{creator_id}/summary")
def revenue_summary(creator_id: int, db: Session = Depends(get_db)):
    return get_revenue_summary(db, creator_id)


@router.get("/creator/{creator_id}/monthly")
def revenue_monthly(creator_id: int, db: Session = Depends(get_db)):
    return get_monthly_breakdown(db, creator_id)


@router.get("/creator/{creator_id}/trend")
def revenue_trend(creator_id: int, db: Session = Depends(get_db)):
    return get_revenue_trend(db, creator_id)


# --- Sponsorships (separate resource, same router file since they're revenue-adjacent) ---

sponsorship_router = APIRouter(prefix="/sponsorships", tags=["Sponsorships"])


@sponsorship_router.post("/", response_model=dict, status_code=201)
def create_sponsorship(payload: SponsorshipCreate, db: Session = Depends(get_db)):
    deal = Sponsorship(**payload.model_dump())
    db.add(deal)
    db.commit()
    db.refresh(deal)

    return success_response(
        data=SponsorshipResponse.model_validate(deal).model_dump(),
        message="Sponsorship created successfully",
        status_code=201,
    )


@sponsorship_router.get("/", response_model=dict)
def get_all_sponsorships(creator_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Sponsorship)
    if creator_id is not None:
        query = query.filter(Sponsorship.creator_id == creator_id)

    deals = [SponsorshipResponse.model_validate(d).model_dump() for d in query.all()]
    return success_response(data=deals, message="Sponsorships retrieved successfully")


@sponsorship_router.put("/{sponsorship_id}", response_model=dict)
def update_sponsorship(sponsorship_id: int, payload: SponsorshipUpdate, db: Session = Depends(get_db)):
    deal = db.query(Sponsorship).filter(Sponsorship.id == sponsorship_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Sponsorship not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)

    return success_response(
        data=SponsorshipResponse.model_validate(deal).model_dump(),
        message="Sponsorship updated successfully",
    )


@sponsorship_router.delete("/{sponsorship_id}", response_model=dict)
def delete_sponsorship(sponsorship_id: int, db: Session = Depends(get_db)):
    deal = db.query(Sponsorship).filter(Sponsorship.id == sponsorship_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Sponsorship not found")

    db.delete(deal)
    db.commit()
    return success_response(data={"id": sponsorship_id}, message="Sponsorship deleted successfully")


@sponsorship_router.get("/creator/{creator_id}/summary")
def sponsorship_summary(creator_id: int, db: Session = Depends(get_db)):
    return get_sponsorship_summary(db, creator_id)
