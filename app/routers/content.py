from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import assert_owner_or_admin, get_current_user
from app.db.database import get_db
from app.models.content import Content
from app.models.user import User, UserRole
from app.schemas.content import ContentCreate, ContentResponse, ContentUpdate
from app.utils.responses import success_response

router = APIRouter(prefix="/content", tags=["Content"])


@router.post("/", response_model=dict, status_code=201)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_owner_or_admin(current_user, content_data.creator_id)

    new_content = Content(**content_data.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return success_response(
        data=ContentResponse.model_validate(new_content).model_dump(),
        message="Content created successfully",
        status_code=201,
    )


@router.get("/", response_model=dict)
def get_all_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admins see everything; everyone else only sees their own content."""
    query = db.query(Content)
    if current_user.role != UserRole.ADMINISTRATOR:
        query = query.filter(Content.creator_id == current_user.id)

    content_list = [
        ContentResponse.model_validate(content).model_dump()
        for content in query.all()
    ]

    return success_response(data=content_list, message="Content retrieved successfully")


@router.get("/{content_id}", response_model=dict)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    assert_owner_or_admin(current_user, content.creator_id)

    return success_response(
        data=ContentResponse.model_validate(content).model_dump(),
        message="Content retrieved successfully",
    )


@router.put("/{content_id}", response_model=dict)
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    assert_owner_or_admin(current_user, content.creator_id)

    for field, value in content_data.model_dump(exclude_unset=True).items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return success_response(
        data=ContentResponse.model_validate(content).model_dump(),
        message="Content updated successfully",
    )


@router.delete("/{content_id}", response_model=dict)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    assert_owner_or_admin(current_user, content.creator_id)

    db.delete(content)
    db.commit()

    return success_response(data={"id": content_id}, message="Content deleted successfully")
