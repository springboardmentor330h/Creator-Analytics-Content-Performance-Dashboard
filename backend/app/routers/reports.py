from fastapi import APIRouter, Depends,HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import report_service as svc
from app.schemas.report import CombinedReport
from app.core.deps import get_current_user


router = APIRouter(prefix="/reports", tags=["reports-export"])


@router.get("/content/pdf/{creator_id}")
def content_pdf(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_content_pdf(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=content_report_{creator_id}.pdf"},
    )


@router.get("/content/excel/{creator_id}")
def content_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_content_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=content_report_{creator_id}.xlsx"},
    )


@router.get("/audience/excel/{creator_id}")
def audience_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_audience_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=audience_report_{creator_id}.xlsx"},
    )


@router.get("/revenue/excel/{creator_id}")
def revenue_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_revenue_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=revenue_report_{creator_id}.xlsx"},
    )


@router.get("/creator/{creator_id}/generate", response_model=CombinedReport)
def generate_report(creator_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin" and current_user.creator_id != creator_id:
        raise HTTPException(status_code=403, detail="You can only generate reports for your own creator_id")
    return svc.generate_combined_report(db, creator_id)