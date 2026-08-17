from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import growth_trend_service as svc

router = APIRouter(prefix="/growth-trends", tags=["growth-trend-analysis"])


@router.get("/hashtags")
def hashtags(db: Session = Depends(get_db)):
    return svc.hashtag_analysis(db)


@router.get("/reach-prediction/{creator_id}")
def reach_prediction(creator_id: int, db: Session = Depends(get_db)):
    return svc.reach_prediction(db, creator_id)


@router.get("/content-growth/{creator_id}")
def content_growth(creator_id: int, db: Session = Depends(get_db)):
    return svc.content_growth_tracking(db, creator_id)


@router.get("/audience-forecast/{creator_id}")
def audience_forecast(creator_id: int, db: Session = Depends(get_db)):
    return svc.audience_growth_forecast(db, creator_id)


@router.get("/trend-direction/{creator_id}")
def trend_direction(creator_id: int, db: Session = Depends(get_db)):
    return {"trend": svc.trend_direction(db, creator_id)}