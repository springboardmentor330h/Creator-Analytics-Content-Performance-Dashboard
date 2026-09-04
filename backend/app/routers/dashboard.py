from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_role
from app.crud.user import get_or_create_demo_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Mock KPI data per role — replace with real analytics queries later
ROLE_KPIS = {
    "creator": {"total_views": 125000, "engagement_rate": 4.2, "followers": 8400, "revenue": 1200},
    "agency": {"managed_creators": 32, "total_reach": 980000, "active_campaigns": 5, "revenue": 45000},
    "marketing_team": {"active_campaigns": 5, "avg_engagement": 3.8, "total_reach": 980000, "ad_spend": 12000},
    "admin": {"total_users": 128, "total_creators": 90, "total_agencies": 12, "system_uptime": "99.9%"},
}

@router.get("/overview")
def overview(role: str = Depends(get_current_role), db: Session = Depends(get_db)):
    user = get_or_create_demo_user(db, role)
    return {
        "message": f"Welcome, {user.full_name}",
        "role": role,
        "kpis": ROLE_KPIS.get(role, {}),
    }