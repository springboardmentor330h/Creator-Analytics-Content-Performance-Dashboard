from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query
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

ALLOWED_TYPES = {"full", "content", "audience", "revenue", "growth", "platform"}
ALLOWED_FORMATS = {"json", "excel", "pdf"}


def _validate_report_type(report_type: str) -> str:
    report_type = (report_type or "full").lower().strip()
    if report_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid report_type. Allowed: "
                + ", ".join(sorted(ALLOWED_TYPES))
            ),
        )
    return report_type


def _file_response(data: bytes, filename: str, media_type: str) -> StreamingResponse:
    return StreamingResponse(
        BytesIO(data),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


# ============================================================
# GENERATE REPORT
# format=json  → JSON body (default)
# format=excel → downloadable .xlsx
# format=pdf   → downloadable .pdf
# ============================================================

@router.get("/generate")
def generate_report(
    report_type: str = Query(
        "full",
        description="full | content | audience | revenue | growth | platform",
    ),
    format: str = Query(
        "json",
        description="json | excel | pdf — excel/pdf return a downloadable file",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a report for the logged-in creator.

    - format=json  → structured JSON (Swagger preview)
    - format=excel → downloads CreatorIQ Excel report
    - format=pdf   → downloads CreatorIQ PDF report
    """
    report_type = _validate_report_type(report_type)
    fmt = (format or "json").lower().strip()

    if fmt not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Allowed: json, excel, pdf",
        )

    report = build_creator_report(
        db,
        creator_id=current_user.id,
        report_type=report_type,
    )

    if fmt == "json":
        return report

    if fmt == "excel":
        try:
            data = export_report_excel(report)
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        filename = f"creatoriq_{report_type}_{current_user.id}.xlsx"
        return _file_response(
            data,
            filename,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    # pdf
    try:
        data = export_report_pdf(report)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    filename = f"creatoriq_{report_type}_{current_user.id}.pdf"
    return _file_response(data, filename, "application/pdf")


# ============================================================
# Dedicated download endpoints (same files, clearer URLs)
# ============================================================

@router.get("/export/excel")
def export_excel(
    report_type: str = Query("full"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download Excel report for the logged-in creator."""
    report_type = _validate_report_type(report_type)
    report = build_creator_report(
        db, creator_id=current_user.id, report_type=report_type
    )
    try:
        data = export_report_excel(report)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    filename = f"creatoriq_{report_type}_{current_user.id}.xlsx"
    return _file_response(
        data,
        filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/export/pdf")
def export_pdf(
    report_type: str = Query("full"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download PDF report for the logged-in creator."""
    report_type = _validate_report_type(report_type)
    report = build_creator_report(
        db, creator_id=current_user.id, report_type=report_type
    )
    try:
        data = export_report_pdf(report)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    filename = f"creatoriq_{report_type}_{current_user.id}.pdf"
    return _file_response(data, filename, "application/pdf")
