from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.services import reporting_service, export_service

router = APIRouter()


@router.get("/reports/generate")
def generate_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return reporting_service.generate_full_report(db, current_user.id)


@router.get("/reports/export/pdf")
def export_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = reporting_service.generate_full_report(db, current_user.id)
    buffer = export_service.generate_pdf_report(report)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=creatoriq_report_{current_user.id}.pdf"}
    )


@router.get("/reports/export/excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = reporting_service.generate_full_report(db, current_user.id)
    buffer = export_service.generate_excel_report(report)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=creatoriq_report_{current_user.id}.xlsx"}
    )