from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)


def generate_pdf_report(report_data: dict):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(
        Paragraph(
            "Creator Analytics Report",
            styles["Title"]
        )
    )

    story.append(Spacer(1, 15))

    creator_id = report_data.get("creator_id")

    story.append(
        Paragraph(
            f"Creator ID: {creator_id}",
            styles["Heading2"]
        )
    )

    story.append(Spacer(1, 15))

    # =====================================================
    # CONTENT PERFORMANCE
    # =====================================================

    story.append(
        Paragraph(
            "Content Performance",
            styles["Heading2"]
        )
    )

    content_data = [
        [
            "Platform",
            "Title",
            "Views",
            "Likes",
            "Comments",
            "Engagement"
        ]
    ]

    for content in report_data.get("content_performance", []):
        content_data.append([
            content.get("platform", ""),
            content.get("content_title", "")[:30],
            content.get("views", 0),
            content.get("likes", 0),
            content.get("comments", 0),
            content.get("total_engagement", 0)
        ])

    if len(content_data) == 1:
        content_data.append(
            ["No data", "-", 0, 0, 0, 0]
        )

    content_table = Table(
        content_data,
        repeatRows=1
    )

    content_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )

    story.append(content_table)
    story.append(Spacer(1, 20))

    # =====================================================
    # AUDIENCE ANALYTICS
    # =====================================================

    story.append(
        Paragraph(
            "Audience Analytics",
            styles["Heading2"]
        )
    )

    audience_data = [
        [
            "Age Group",
            "Gender",
            "Country",
            "Device",
            "Followers",
            "Reach"
        ]
    ]

    for audience in report_data.get("audience_analytics", []):
        audience_data.append([
            audience.get("age_group", ""),
            audience.get("gender", ""),
            audience.get("country", ""),
            audience.get("device_type", ""),
            audience.get("followers", 0),
            audience.get("reach", 0)
        ])

    if len(audience_data) == 1:
        audience_data.append(
            ["No data", "-", "-", "-", 0, 0]
        )

    audience_table = Table(
        audience_data,
        repeatRows=1
    )

    audience_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ])
    )

    story.append(audience_table)
    story.append(Spacer(1, 20))

    # =====================================================
    # GROWTH TRENDS
    # =====================================================

    story.append(
        Paragraph(
            "Growth Trends",
            styles["Heading2"]
        )
    )

    growth_data = [
        [
            "Date",
            "Followers",
            "Reach",
            "Engagement Rate"
        ]
    ]

    for growth in report_data.get("growth_trends", []):
        growth_data.append([
            str(growth.get("date", "")),
            growth.get("followers", 0),
            growth.get("reach", 0),
            growth.get("engagement_rate", 0)
        ])

    if len(growth_data) == 1:
        growth_data.append(
            ["No data", 0, 0, 0]
        )

    growth_table = Table(
        growth_data,
        repeatRows=1
    )

    growth_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ])
    )

    story.append(growth_table)
    story.append(Spacer(1, 20))

    # =====================================================
    # REVENUE ANALYTICS
    # =====================================================

    story.append(
        Paragraph(
            "Revenue Analytics",
            styles["Heading2"]
        )
    )

    revenue = report_data.get(
        "revenue_analytics",
        {}
    )

    revenue_data = [
        ["Metric", "Value"],
        [
            "Total Revenue",
            f"{revenue.get('total_revenue', 0):.2f}"
        ]
    ]

    for item in revenue.get("revenue_by_source", []):
        revenue_data.append([
            f"Revenue - {item.get('source', '')}",
            f"{item.get('total_amount', 0):.2f}"
        ])

    revenue_table = Table(revenue_data)

    revenue_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
        ])
    )

    story.append(revenue_table)

    document.build(story)

    buffer.seek(0)

    return buffer