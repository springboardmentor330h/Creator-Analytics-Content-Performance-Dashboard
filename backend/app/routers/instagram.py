"""
Instagram sample-data endpoint.

WHY an endpoint instead of a one-off script? Every other data-producing
action in this app works through an authenticated API call scoped to
current_user. Exposing it as a normal authenticated POST keeps this
consistent with the rest of the project, and lets the frontend trigger
it with a button, the same way YouTube sync works.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.instagram import InstagramSeedRequest, InstagramSeedResponse
from app.services import instagram_sample_data_service

router = APIRouter(prefix="/api/instagram", tags=["Instagram Sample Data"])


@router.post("/seed", response_model=InstagramSeedResponse)
def seed_instagram_sample_data(
    request: InstagramSeedRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates realistic Instagram content + follower-growth history for
    the logged-in creator and stores it via the existing Content/
    AudienceGrowth models. Safe to call repeatedly -- re-running updates
    the same deterministically-keyed rows instead of duplicating them.
    """
    return instagram_sample_data_service.generate_instagram_sample_data(
        db, current_user.id, request.num_posts
    )
