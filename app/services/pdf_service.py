from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from app.services.reporting_service import generate_creator_report


def generate_pdf_report(db, creator_id: int):

    report = generate_creator_report(
        db,
        creator_id
    )

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    story = []

    # -------------------------------------------------
    # TITLE
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Creator Analytics Report",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            f"Creator ID: {creator_id}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 15))

    # -------------------------------------------------
    # CONTENT PERFORMANCE
    # -------------------------------------------------

    story.append(
        Paragraph(
            "1. Content Performance",
            styles["Heading2"]
        )
    )

    summary = report["content_performance"]["summary"]

    content_data = [
        ["KPI", "Value"],
        ["Total Content", summary["total_content"]],
        ["Total Views", summary["total_views"]],
        ["Total Likes", summary["total_likes"]],
        ["Total Comments", summary["total_comments"]],
        ["Total Shares", summary["total_shares"]],
        ["Total Reach", summary["total_reach"]],
        [
            "Average Engagement Rate",
            f'{summary["average_engagement_rate"]}%'
        ],
        ["Best Platform", summary["best_platform"] or "N/A"],
        ["Top Content", summary["top_content"] or "N/A"],
    ]

    table = Table(
        content_data,
        colWidths=[80 * mm, 90 * mm]
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )

    story.append(table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------
    # TOP CONTENT
    # -------------------------------------------------

    story.append(
        Paragraph(
            "Top Performing Content",
            styles["Heading3"]
        )
    )

    top_content = report["content_performance"]["top_content"]

    top_content_data = [
        [
            "Content",
            "Platform",
            "Views",
            "Reach",
            "Engagement %"
        ]
    ]

    for content in top_content:
        top_content_data.append([
            content["content_title"],
            content["platform"],
            content["views"],
            content["reach"],
            content["engagement_rate"],
        ])

    if len(top_content_data) == 1:
        top_content_data.append(
            ["No data", "-", "-", "-", "-"]
        )

    table = Table(top_content_data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("PADDING", (0, 0), (-1, -1), 5),
        ])
    )

    story.append(table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------
    # AUDIENCE ANALYTICS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "2. Audience Analytics",
            styles["Heading2"]
        )
    )

    audience = report["audience_analytics"]

    audience_data = [
        ["KPI", "Value"],
        ["Total Followers", audience["total_followers"]],
        ["Total Reach", audience["total_reach"]],
        ["Total Impressions", audience["total_impressions"]],
    ]

    table = Table(
        audience_data,
        colWidths=[80 * mm, 90 * mm]
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )

    story.append(table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------
    # REVENUE ANALYTICS
    # -------------------------------------------------

    story.append(
        Paragraph(
            "3. Revenue Analytics",
            styles["Heading2"]
        )
    )

    revenue = report["revenue_analytics"]

    revenue_data = [
        ["Revenue KPI", "Value"],
        [
            "Total Revenue",
            f'₹{revenue["total_revenue"]:.2f}'
        ],
    ]

    for source, amount in revenue["revenue_by_source"].items():
        revenue_data.append([
            source,
            f"₹{amount:.2f}"
        ])

    table = Table(
        revenue_data,
        colWidths=[80 * mm, 90 * mm]
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ])
    )

    story.append(table)
    story.append(Spacer(1, 15))

    # -------------------------------------------------
    # PLATFORM COMPARISON
    # -------------------------------------------------

    story.append(
        Paragraph(
            "4. Platform Comparison",
            styles["Heading2"]
        )
    )

    platform_data = [
        [
            "Platform",
            "Views",
            "Reach",
            "Engagement %",
            "Likes",
            "Comments"
        ]
    ]

    for platform, data in report["platform_comparison"].items():
        platform_data.append([
            platform,
            data["views"],
            data["reach"],
            data["engagement_rate"],
            data["likes"],
            data["comments"],
        ])

    if len(platform_data) == 1:
        platform_data.append(
            ["No data", "-", "-", "-", "-", "-"]
        )

    table = Table(platform_data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("PADDING", (0, 0), (-1, -1), 5),
        ])
    )

    story.append(table)

    # -------------------------------------------------
    # BUILD PDF
    # -------------------------------------------------

    document.build(story)

    buffer.seek(0)

    return buffer