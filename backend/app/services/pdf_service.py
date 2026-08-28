from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from app.services.report_service import generate_creator_report


def generate_pdf_report(db, creator_id: int):
    report_data = generate_creator_report(db, creator_id)

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4
    )

    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(
        Paragraph(
            f"CreatorIQ Analytics Report - Creator {creator_id}",
            styles["Title"]
        )
    )

    elements.append(Spacer(1, 20))

    # Content Performance
    elements.append(
        Paragraph(
            "Content Performance",
            styles["Heading2"]
        )
    )

    content = report_data["content_performance"]

    content_data = [
        ["Metric", "Value"],
        ["Total Content", content["total_content"]],
        ["Total Views", content["total_views"]],
        ["Total Reach", content["total_reach"]],
        ["Engagement Rate", f'{content["engagement_rate"]}%']
    ]

    elements.append(Table(content_data))
    elements.append(Spacer(1, 20))

    # Audience Analytics
    elements.append(
        Paragraph(
            "Audience Analytics",
            styles["Heading2"]
        )
    )

    audience = report_data["audience_analytics"]

    audience_data = [
        ["Metric", "Value"],
        ["Audience Records", audience["total_audience_records"]],
        ["Total Followers", audience["total_followers"]]
    ]

    elements.append(Table(audience_data))
    elements.append(Spacer(1, 20))

    # Revenue Analytics
    elements.append(
        Paragraph(
            "Revenue Analytics",
            styles["Heading2"]
        )
    )

    revenue = report_data["revenue_analytics"]

    revenue_data = [
        ["Metric", "Value"],
        ["Total Revenue", f'₹{revenue["total_revenue"]}'],
        ["Revenue Records", revenue["revenue_records"]]
    ]

    elements.append(Table(revenue_data))
    elements.append(Spacer(1, 20))

    # Growth Trends
    elements.append(
        Paragraph(
            "Growth Trends",
            styles["Heading2"]
        )
    )

    growth = report_data["growth_trends"]

    growth_data = [
        ["Metric", "Value"],
        ["Latest Followers", growth["latest_followers"]],
        ["Growth Records", growth["growth_records"]]
    ]

    elements.append(Table(growth_data))

    # Build PDF
    document.build(elements)

    buffer.seek(0)

    return buffer