from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import (
    build_creator_report_data,
    generate_excel_report,
    generate_pdf_report,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/creator/{creator_id}/generate")
def generate_report_data(creator_id: int, db: Session = Depends(get_db)):
    """Returns the raw combined report data as JSON (used by the frontend Reports page)."""
    return build_creator_report_data(db, creator_id)


@router.get("/creator/{creator_id}/pdf")
def download_pdf_report(creator_id: int, db: Session = Depends(get_db)):
    buffer = generate_pdf_report(db, creator_id)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=creator_{creator_id}_report.pdf"},
    )


@router.get("/creator/{creator_id}/excel")
def download_excel_report(creator_id: int, db: Session = Depends(get_db)):
    buffer = generate_excel_report(db, creator_id)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=creator_{creator_id}_report.xlsx"},
    )
