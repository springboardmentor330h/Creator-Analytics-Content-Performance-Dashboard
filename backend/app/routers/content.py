from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Content
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.content import ContentCreate, ContentUpdate, ContentResponse

router = APIRouter(
    prefix="/content",
    tags=["Content"],
)


@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new content analytics record.
    A creator can have multiple content records, so no uniqueness
    constraint is enforced on creator_id.
    """
    new_content = Content(**content.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content


@router.get("", response_model=List[ContentResponse])
def get_all_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return content records for the logged-in user's creator_id only.
    Admins see everything, since they're expected to have platform-wide visibility.
    """
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    query = db.query(Content)
    if role != "admin":
        query = query.filter(Content.creator_id == current_user.creator_id)
    return query.all()


@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single content record by its id, if it belongs to the caller (or caller is admin)."""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role != "admin" and content.creator_id != current_user.creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this content record",
        )
    return content


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    updates: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing content record. Returns 404 if it doesn't exist, 403 if it's not yours."""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role != "admin" and content.creator_id != current_user.creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this content record",
        )

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_200_OK)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a content record. Returns 404 if it doesn't exist, 403 if it's not yours."""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {content_id} not found",
        )
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role != "admin" and content.creator_id != current_user.creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this content record",
        )

    db.delete(content)
    db.commit()
    return {"detail": f"Content with id {content_id} deleted successfully"}
