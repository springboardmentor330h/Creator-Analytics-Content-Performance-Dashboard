
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse
)

from app.services.content_service import (
    create_content,
    get_all_content,
    get_content,
    update_content,
    delete_content,
)


router = APIRouter(
    prefix="/content",
    tags=["Content"],
)


@router.post(
    "/",
    response_model=ContentResponse
)
def create_new_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = current_user.id

    return create_content(
        db=db,
        content=content,
        creator_id=creator_id,
    )


@router.get(
    "/",
    response_model=list[ContentResponse]
)
def get_all_contents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = current_user.id

    return get_all_content(
        db,
        creator_id
    )


@router.get(
    "/{content_id}",
    response_model=ContentResponse
)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = current_user.id

    content = get_content(
        db,
        content_id,
        creator_id
    )

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return content


@router.put(
    "/{content_id}",
    response_model=ContentResponse
)
def update_existing_content(
    content_id: int,
    content: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = current_user.id

    updated_content = update_content(
        db=db,
        content_id=content_id,
        content=content,
        creator_id=creator_id
    )

    if not updated_content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return updated_content


@router.delete(
    "/{content_id}"
)
def delete_existing_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = current_user.id

    deleted_content = delete_content(
        db=db,
        content_id=content_id,
        creator_id=creator_id
    )

    if not deleted_content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "message": "Content deleted successfully",
        "content_id": content_id,
    }

