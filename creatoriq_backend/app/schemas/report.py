from pydantic import BaseModel


class ReportResponse(BaseModel):
    creator_id: int
    report_type: str
    report: dict


class ReportExportResponse(BaseModel):
    creator_id: int
    report_type: str
    filename: str
    message: str