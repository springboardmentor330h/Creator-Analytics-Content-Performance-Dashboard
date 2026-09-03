from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import ContentItem
from app.schemas.content_item import ContentItemCreate, ContentItemResponse

router = APIRouter(prefix="/content-items", tags=["Manual Multi-platform Content"])


@router.post(
    "",
    response_model=ContentItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an Instagram, LinkedIn, or other platform post",
)
def create_content_item(payload: ContentItemCreate, db: Session = Depends(get_db)):
    """Store a manually entered platform post for dashboard analytics.

    Use the platform's stable post identifier as ``content_id``. A platform and
    content-id pair can be entered only once, protecting reports from duplicate
    manual submissions.
    """
    existing = db.query(ContentItem).filter(
        ContentItem.platform == payload.platform,
        ContentItem.content_id == payload.content_id,
    ).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A content item with this platform and content_id already exists.",
        )
    item = ContentItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
