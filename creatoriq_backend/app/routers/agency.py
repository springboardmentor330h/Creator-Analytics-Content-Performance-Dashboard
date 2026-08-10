from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import require_admin, require_role
from app.db.database import get_db
from app.models.user import User

router = APIRouter(prefix='/api/agency', tags=['agency'])


def _profile(user: User) -> dict:
    return {
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'role': user.role,
        'status': user.status,
        'agency_id': user.agency_id,
        'bio': user.bio,
        'avatar_url': user.avatar_url,
        'youtube_url': user.youtube_url,
        'instagram_url': user.instagram_url,
        'tiktok_url': user.tiktok_url,
        'facebook_url': user.facebook_url,
        'twitter_url': user.twitter_url,
        'linkedin_url': user.linkedin_url,
        'website_url': user.website_url,
    }


@router.get('/creators')
def list_assigned_creators(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('Agency', 'Administrator')),
):
    if current_user.role == 'Administrator':
        creators = list(db.scalars(select(User).where(User.role == 'Creator')))
    else:
        creators = list(
            db.scalars(select(User).where(User.role == 'Creator', User.agency_id == current_user.id))
        )
    return {'total': len(creators), 'creators': [_profile(user) for user in creators]}


@router.post('/creators/{creator_id}/assign')
def assign_creator(
    creator_id: int,
    agency_id: int = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    creator = db.get(User, creator_id)
    if creator is None or creator.role != 'Creator':
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Creator not found')
    agency = db.get(User, agency_id)
    if agency is None or agency.role != 'Agency':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid agency')
    creator.agency_id = agency_id
    db.commit()
    db.refresh(creator)
    return {'success': True, 'creator': _profile(creator)}
