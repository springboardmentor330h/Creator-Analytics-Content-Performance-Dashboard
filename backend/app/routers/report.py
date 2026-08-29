import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import report_service, export_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/generate")
def generate_report(creator_id: int, db: Session = Depends(get_db)):
    """
    Returns the full structured report as JSON — content performance,
    top content, platform comparison, audience, growth, and revenue.
    """
    return report_service.generate_creator_report(db, creator_id)


@router.get("/export/pdf")
def export_report_pdf(creator_id: int, db: Session = Depends(get_db)):
    """Generates and downloads the report as a PDF file."""
    report = report_service.generate_creator_report(db, creator_id)
    pdf_bytes = export_service.generate_pdf_report(report)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=creator_{creator_id}_report.pdf"},
    )


@router.get("/export/excel")
def export_report_excel(creator_id: int, db: Session = Depends(get_db)):
    """Generates and downloads the report as an Excel (.xlsx) file."""
    report = report_service.generate_creator_report(db, creator_id)
    excel_bytes = export_service.generate_excel_report(report)

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=creator_{creator_id}_report.xlsx"},
    )