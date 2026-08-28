
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.schemas.report import ReportResponse

from app.services.reporting_service import generate_creator_report
from app.services.pdf_service import generate_pdf_report
from app.services.excel_service import generate_excel_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# --------------------------------------------------
# JSON CREATOR REPORT
# --------------------------------------------------

@router.get(
    "/creator",
    response_model=ReportResponse
)
def generate_creator_report_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return generate_creator_report(
        db=db,
        creator_id=creator_id
    )


# --------------------------------------------------
# PDF CREATOR REPORT
# --------------------------------------------------

@router.get(
    "/creator/pdf"
)
def generate_creator_pdf_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    report_data = generate_creator_report(
        db=db,
        creator_id=creator_id
    )

    pdf_file = generate_pdf_report(
        report_data
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=creator_report.pdf"
            )
        }
    )


# --------------------------------------------------
# EXCEL CREATOR REPORT
# --------------------------------------------------

@router.get(
    "/creator/excel"
)
def generate_creator_excel_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    # Generate the same report data
    # used by the JSON and PDF APIs
    report_data = generate_creator_report(
        db=db,
        creator_id=creator_id
    )

    # Convert report data into Excel
    excel_file = generate_excel_report(
        report_data
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=creator_report.xlsx"
            )
        }
    )

