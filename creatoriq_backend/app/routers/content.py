from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db

from app.models.content import Content
from app.models.user import User

from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
)


router = APIRouter(
    prefix="/content",
    tags=["Content Analytics"],
)


# ============================================================
# ROLE HELPER
# ============================================================

def is_admin(current_user: User) -> bool:
    """
    Return True when the authenticated user is an Administrator.
    """

    return current_user.role == "Administrator"


# ============================================================
# CREATE CONTENT
# POST /content
# ============================================================

@router.post(
    "",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create content for the logged-in creator.

    Creator:
        Content is automatically assigned to current_user.id.

    Administrator:
        Cannot create creator content through this endpoint.
    """

    # --------------------------------------------------------
    # ONLY CREATOR CAN CREATE CONTENT
    # --------------------------------------------------------

    if not is_admin(current_user):

        if current_user.role != "Creator":

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only creators can create content."
                ),
            )

        creator_id = current_user.id

    else:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view creator content "
                "but cannot create content for a creator."
            ),
        )

    # --------------------------------------------------------
    # CREATE CONTENT
    # --------------------------------------------------------

    new_content = Content(
        creator_id=creator_id,
        platform=content_data.platform,
        external_content_id=(
            content_data.external_content_id
        ),
        content_title=(
            content_data.content_title
        ),
        views=content_data.views,
        likes=content_data.likes,
        comments=content_data.comments,
        shares=content_data.shares,
        saves=content_data.saves,
        watch_time=content_data.watch_time,
        reach=content_data.reach,
        published_date=(
            content_data.published_date
        ),
    )

    db.add(new_content)

    db.commit()

    db.refresh(new_content)

    return new_content


# ============================================================
# GET ALL CONTENT
# GET /content
# ============================================================

@router.get(
    "",
    response_model=list[ContentResponse],
)
def get_all_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Administrator:
        Return all creators' content.

    Creator:
        Return only the logged-in creator's content.
    """

    query = db.query(Content)

    # --------------------------------------------------------
    # CREATOR → OWN DATA ONLY
    # --------------------------------------------------------

    if not is_admin(current_user):

        query = query.filter(
            Content.creator_id == current_user.id
        )

    # --------------------------------------------------------
    # ADMIN → ALL CONTENT
    # --------------------------------------------------------

    contents = (
        query
        .order_by(
            Content.published_date.desc(),
            Content.id.desc(),
        )
        .all()
    )

    return contents


# ============================================================
# GET CONTENT BY ID
# GET /content/{content_id}
# ============================================================

@router.get(
    "/{content_id}",
    response_model=ContentResponse,
)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Administrator:
        Can view any content.

    Creator:
        Can view only their own content.
    """

    query = (
        db.query(Content)
        .filter(
            Content.id == content_id
        )
    )

    # --------------------------------------------------------
    # CREATOR → OWN CONTENT ONLY
    # --------------------------------------------------------

    if not is_admin(current_user):

        query = query.filter(
            Content.creator_id == current_user.id
        )

    content = query.first()

    if not content:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    return content


# ============================================================
# UPDATE CONTENT
# PUT /content/{content_id}
# ============================================================

@router.put(
    "/{content_id}",
    response_model=ContentResponse,
)
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Can update only their own content.

    Administrator:
        Can view all data but cannot modify creator content.
    """

    query = (
        db.query(Content)
        .filter(
            Content.id == content_id
        )
    )

    # --------------------------------------------------------
    # CREATOR → OWN CONTENT ONLY
    # --------------------------------------------------------

    if not is_admin(current_user):

        if current_user.role != "Creator":

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update content.",
            )

        query = query.filter(
            Content.creator_id == current_user.id
        )

    # --------------------------------------------------------
    # ADMIN CANNOT MODIFY
    # --------------------------------------------------------

    else:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view creator content "
                "but cannot modify it."
            ),
        )

    content = query.first()

    if not content:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    update_data = content_data.model_dump(
        exclude_unset=True
    )

    # --------------------------------------------------------
    # NEVER ALLOW creator_id TO BE CHANGED
    # --------------------------------------------------------

    update_data.pop(
        "creator_id",
        None
    )

    for field, value in update_data.items():

        setattr(
            content,
            field,
            value
        )

    db.commit()

    db.refresh(content)

    return content


# ============================================================
# DELETE CONTENT
# DELETE /content/{content_id}
# ============================================================

@router.delete(
    "/{content_id}",
)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Can delete only their own content.

    Administrator:
        Cannot delete creator content.
    """

    query = (
        db.query(Content)
        .filter(
            Content.id == content_id
        )
    )

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    if is_admin(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view creator content "
                "but cannot delete it."
            ),
        )

    # --------------------------------------------------------
    # ONLY CREATOR
    # --------------------------------------------------------

    if current_user.role != "Creator":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can delete content."
            ),
        )

    # --------------------------------------------------------
    # OWN CONTENT
    # --------------------------------------------------------

    query = query.filter(
        Content.creator_id == current_user.id
    )

    content = query.first()

    if not content:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    db.delete(content)

    db.commit()

    return {
        "message": "Content deleted successfully",
        "content_id": content_id,
    }