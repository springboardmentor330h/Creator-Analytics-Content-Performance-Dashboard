from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db

from app.models.sponsorship import Sponsorship
from app.models.user import User

from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse,
)


router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"],
)


# ============================================================
# ROLE HELPERS
# ============================================================

def is_admin(
    current_user: User,
) -> bool:
    return current_user.role == "Administrator"


def is_creator(
    current_user: User,
) -> bool:
    return current_user.role == "Creator"


# ============================================================
# CREATE SPONSORSHIP
# POST /sponsorships
# ============================================================

@router.post(
    "",
    response_model=SponsorshipResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sponsorship(
    sponsorship_data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only creators can create sponsorships.

    creator_id is always taken from JWT.
    """

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can create sponsorships."
            ),
        )

    if (
        sponsorship_data.end_date
        and sponsorship_data.end_date
        < sponsorship_data.start_date
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date cannot be before start_date"
            ),
        )

    new_sponsorship = Sponsorship(
        creator_id=current_user.id,
        brand_name=sponsorship_data.brand_name,
        campaign_name=sponsorship_data.campaign_name,
        contract_value=sponsorship_data.contract_value,
        start_date=sponsorship_data.start_date,
        end_date=sponsorship_data.end_date,
        status=(
            sponsorship_data.status.value
            if hasattr(
                sponsorship_data.status,
                "value",
            )
            else sponsorship_data.status
        ),
        payment_status=(
            sponsorship_data.payment_status.value
            if hasattr(
                sponsorship_data.payment_status,
                "value",
            )
            else sponsorship_data.payment_status
        ),
    )

    db.add(new_sponsorship)

    db.commit()

    db.refresh(new_sponsorship)

    return new_sponsorship


# ============================================================
# GET ALL SPONSORSHIPS
# GET /sponsorships
# ============================================================

@router.get(
    "",
    response_model=list[SponsorshipResponse],
)
def get_all_sponsorships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Own sponsorships.

    Administrator:
        All sponsorships.
    """

    query = db.query(
        Sponsorship
    )

    if not is_admin(current_user):

        query = query.filter(
            Sponsorship.creator_id
            == current_user.id
        )

    return (
        query
        .order_by(
            Sponsorship.start_date.desc(),
            Sponsorship.id.desc(),
        )
        .all()
    )


# ============================================================
# GET SPONSORSHIP BY ID
# GET /sponsorships/{sponsorship_id}
# ============================================================

@router.get(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def get_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id
            == sponsorship_id
        )
    )

    if not is_admin(current_user):

        query = query.filter(
            Sponsorship.creator_id
            == current_user.id
        )

    sponsorship = query.first()

    if not sponsorship:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    return sponsorship


# ============================================================
# UPDATE SPONSORSHIP
# PUT /sponsorships/{sponsorship_id}
# ============================================================

@router.put(
    "/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def update_sponsorship(
    sponsorship_id: int,
    sponsorship_data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only the owning creator can update.

    Administrator is read-only.
    """

    if is_admin(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view sponsorships "
                "but cannot modify them."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can update sponsorships."
            ),
        )

    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id
            == sponsorship_id,
            Sponsorship.creator_id
            == current_user.id,
        )
        .first()
    )

    if not sponsorship:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    update_data = (
        sponsorship_data.model_dump(
            exclude_unset=True
        )
    )

    update_data.pop(
        "creator_id",
        None,
    )

    for field in (
        "status",
        "payment_status",
    ):

        if (
            field in update_data
            and update_data[field]
            is not None
        ):

            value = update_data[field]

            update_data[field] = (
                value.value
                if hasattr(
                    value,
                    "value",
                )
                else value
            )

    new_start_date = update_data.get(
        "start_date",
        sponsorship.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        sponsorship.end_date,
    )

    if (
        new_end_date
        and new_start_date
        and new_end_date < new_start_date
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date cannot be before start_date"
            ),
        )

    for field, value in update_data.items():

        setattr(
            sponsorship,
            field,
            value,
        )

    db.commit()

    db.refresh(sponsorship)

    return sponsorship


# ============================================================
# DELETE SPONSORSHIP
# DELETE /sponsorships/{sponsorship_id}
# ============================================================

@router.delete(
    "/{sponsorship_id}",
)
def delete_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only owning creator can delete.

    Administrator is read-only.
    """

    if is_admin(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view sponsorships "
                "but cannot delete them."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can delete sponsorships."
            ),
        )

    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id
            == sponsorship_id,
            Sponsorship.creator_id
            == current_user.id,
        )
        .first()
    )

    if not sponsorship:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsorship not found",
        )

    db.delete(sponsorship)

    db.commit()

    return {
        "message": (
            "Sponsorship deleted successfully"
        ),
        "sponsorship_id": sponsorship_id,
    }