from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user

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

from app.services.revenue_service import get_creator_by_email


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
    current_user: str = Depends(get_current_user),
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return create_content(
        db=db,
        content=content,
        creator_id=user.id,
    )


@router.get(
    "/",
    response_model=list[ContentResponse]
)
def get_all_contents(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_all_content(
        db,
        user.id
    )


@router.get(
    "/{content_id}",
    response_model=ContentResponse
)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    content = get_content(
        db,
        content_id,
        user.id
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
    current_user: str = Depends(get_current_user),
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    updated_content = update_content(
        db=db,
        content_id=content_id,
        content=content,
        creator_id=user.id
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
    current_user: str = Depends(get_current_user),
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    deleted_content = delete_content(
        db=db,
        content_id=content_id,
        creator_id=user.id
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