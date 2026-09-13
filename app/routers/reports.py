from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.reporting_service import build_report,pdf_report,excel_report

router=APIRouter(prefix="/reports",tags=["Reports"])

@router.get("/summary")
def report_summary(db:Session=Depends(get_db)): return build_report(db)

@router.get("/pdf")
def report_pdf(db:Session=Depends(get_db)):
    return StreamingResponse(pdf_report(build_report(db)),media_type="application/pdf",
        headers={"Content-Disposition":"attachment; filename=creatoriq_report.pdf"})

@router.get("/excel")
def report_excel(db:Session=Depends(get_db)):
    return StreamingResponse(excel_report(build_report(db)),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition":"attachment; filename=creatoriq_report.xlsx"})
