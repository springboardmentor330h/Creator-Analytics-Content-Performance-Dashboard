import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audience import AudienceSnapshot
from app.models.content import ContentItem
from app.schemas.audience import AudienceSnapshotOut
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/audience", tags=["audience-analytics"])

COUNTRIES = ["India", "United States", "United Kingdom", "Brazil", "Germany"]
DEVICES = ["Mobile", "Desktop", "Tablet"]


@router.post("/refresh", response_model=AudienceSnapshotOut)
def refresh_audience_snapshot(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generates a new audience snapshot.
    Followers/reach/impressions are derived from real synced content views
    (approximation); demographic breakdown is simulated realistically since
    it requires YouTube Analytics API + OAuth2 (not yet integrated).
    """
    total_views = sum(
        i.views for i in db.query(ContentItem).filter(ContentItem.owner_id == current_user.id).all()
    )
    followers = max(total_views // 20, 100)  # rough approximation
    new_followers = int(followers * random.uniform(0.01, 0.05))

    snapshot = AudienceSnapshot(
        owner_id=current_user.id,
        followers=followers,
        new_followers=new_followers,
        impressions=total_views * 3,
        reach=total_views,
        age_13_17=round(random.uniform(2, 8), 1),
        age_18_24=round(random.uniform(25, 40), 1),
        age_25_34=round(random.uniform(20, 35), 1),
        age_35_44=round(random.uniform(10, 20), 1),
        age_45_plus=round(random.uniform(5, 15), 1),
        male_pct=round(random.uniform(45, 65), 1),
        female_pct=round(random.uniform(30, 50), 1),
        other_pct=round(random.uniform(1, 5), 1),
        top_country=random.choice(COUNTRIES),
        top_device=random.choice(DEVICES),
        peak_active_hour=random.randint(17, 22),
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.get("/latest", response_model=AudienceSnapshotOut)
def latest_snapshot(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    snapshot = (
        db.query(AudienceSnapshot)
        .filter(AudienceSnapshot.owner_id == current_user.id)
        .order_by(AudienceSnapshot.snapshot_date.desc())
        .first()
    )
    if not snapshot:
        # auto-generate one on first request so the dashboard never looks empty
        return refresh_audience_snapshot(db, current_user)
    return snapshot


@router.get("/history", response_model=list[AudienceSnapshotOut])
def snapshot_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(AudienceSnapshot)
        .filter(AudienceSnapshot.owner_id == current_user.id)
        .order_by(AudienceSnapshot.snapshot_date.asc())
        .all()
    )