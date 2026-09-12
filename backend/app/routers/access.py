from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.services.access_service import get_allowed_creator_ids
from app.models.user import User

router = APIRouter(prefix="/access", tags=["access"])

@router.get("/my-creators")
def my_creators(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is None:
        ids = [u.creator_id for u in db.query(User).filter(User.creator_id.isnot(None)).order_by(User.creator_id).all()]
    else:
        ids = sorted(set(allowed))
    return [{"creator_id": cid} for cid in ids]