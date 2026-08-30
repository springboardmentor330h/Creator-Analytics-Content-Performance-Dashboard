from io import BytesIO

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db

from app.models.user import User

from app.services.report_service import (
    build_creator_report,
    export_report_excel,
    export_report_pdf,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


ALLOWED_TYPES = {
    "full",
    "content",
    "audience",
    "revenue",
    "growth",
    "platform",
}

ALLOWED_FORMATS = {
    "json",
    "excel",
    "pdf",
}


# ============================================================
# VALIDATION
# ============================================================

def _validate_report_type(
    report_type: str,
) -> str:

    report_type = (
        report_type
        or "full"
    ).lower().strip()

    if report_type not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid report_type. "
                "Allowed: "
                + ", ".join(
                    sorted(
                        ALLOWED_TYPES
                    )
                )
            ),
        )

    return report_type


# ============================================================
# FILE RESPONSE
# ============================================================

def _file_response(
    data: bytes,
    filename: str,
    media_type: str,
) -> StreamingResponse:

    return StreamingResponse(
        BytesIO(data),
        media_type=media_type,
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        },
    )


# ============================================================
# CREATOR SCOPE
# ============================================================

def get_report_creator_id(
    current_user: User,
) -> int | None:
    """
    Administrator:
        None -> all creators.

    Creator:
        current user's ID.
    """

    if current_user.role == "Administrator":

        return None

    if current_user.role == "Creator":

        return current_user.id

    raise HTTPException(
        status_code=403,
        detail=(
            "You do not have permission "
            "to generate reports."
        ),
    )


# ============================================================
# GENERATE REPORT
# ============================================================

@router.get(
    "/generate"
)
def generate_report(
    report_type: str = Query(
        "full",
        description=(
            "full | content | audience | "
            "revenue | growth | platform"
        ),
    ),
    format: str = Query(
        "json",
        description=(
            "json | excel | pdf"
        ),
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Generate report for themselves.

    Administrator:
        Generate report containing all creators.
    """

    report_type = _validate_report_type(
        report_type
    )

    fmt = (
        format
        or "json"
    ).lower().strip()

    if fmt not in ALLOWED_FORMATS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid format. "
                "Allowed: json, excel, pdf"
            ),
        )

    creator_id = get_report_creator_id(
        current_user
    )

    report = build_creator_report(
        db,
        creator_id=creator_id,
        report_type=report_type,
    )

    if fmt == "json":

        return report

    if fmt == "excel":

        try:

            data = export_report_excel(
                report
            )

        except RuntimeError as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc),
            ) from exc

        scope = (
            "all"
            if creator_id is None
            else str(creator_id)
        )

        filename = (
            f"creatoriq_{report_type}_"
            f"{scope}.xlsx"
        )

        return _file_response(
            data,
            filename,
            (
                "application/"
                "vnd.openxmlformats-officedocument"
                ".spreadsheetml.sheet"
            ),
        )

    # ========================================================
    # PDF
    # ========================================================

    try:

        data = export_report_pdf(
            report
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    scope = (
        "all"
        if creator_id is None
        else str(creator_id)
    )

    filename = (
        f"creatoriq_{report_type}_"
        f"{scope}.pdf"
    )

    return _file_response(
        data,
        filename,
        "application/pdf",
    )


# ============================================================
# EXCEL
# ============================================================

@router.get(
    "/export/excel"
)
def export_excel(
    report_type: str = Query(
        "full"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download Excel report.

    Creator:
        Own data.

    Administrator:
        All creators.
    """

    report_type = _validate_report_type(
        report_type
    )

    creator_id = get_report_creator_id(
        current_user
    )

    report = build_creator_report(
        db,
        creator_id=creator_id,
        report_type=report_type,
    )

    try:

        data = export_report_excel(
            report
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    scope = (
        "all"
        if creator_id is None
        else str(creator_id)
    )

    filename = (
        f"creatoriq_{report_type}_"
        f"{scope}.xlsx"
    )

    return _file_response(
        data,
        filename,
        (
            "application/"
            "vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        ),
    )


# ============================================================
# PDF
# ============================================================

@router.get(
    "/export/pdf"
)
def export_pdf(
    report_type: str = Query(
        "full"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download PDF report.

    Creator:
        Own data.

    Administrator:
        All creators.
    """

    report_type = _validate_report_type(
        report_type
    )

    creator_id = get_report_creator_id(
        current_user
    )

    report = build_creator_report(
        db,
        creator_id=creator_id,
        report_type=report_type,
    )

    try:

        data = export_report_pdf(
            report
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    scope = (
        "all"
        if creator_id is None
        else str(creator_id)
    )

    filename = (
        f"creatoriq_{report_type}_"
        f"{scope}.pdf"
    )

    return _file_response(
        data,
        filename,
        "application/pdf",
    )