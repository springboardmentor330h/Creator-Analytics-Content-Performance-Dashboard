
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

    elements = []

    # --------------------------------------------------
    # TITLE
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "CreatorIQ Analytics Report",
            styles["Title"]
        )
    )

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # SUMMARY
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Dashboard Summary",
            styles["Heading2"]
        )
    )

    summary = report_data.get("summary", {})

    summary_data = [
        ["Metric", "Value"],
        ["Total Views", str(summary.get("total_views", 0))],
        ["Total Likes", str(summary.get("total_likes", 0))],
        ["Total Comments", str(summary.get("total_comments", 0))],
        ["Total Shares", str(summary.get("total_shares", 0))],
        ["Total Reach", str(summary.get("total_reach", 0))],
        ["Total Followers", str(summary.get("total_followers", 0))],
        [
            "Average Engagement Rate",
            f"{summary.get('average_engagement_rate', 0)}%"
        ]
    ]

    summary_table = Table(
        summary_data,
        colWidths=[250, 150]
    )

    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("PADDING", (0, 0), (-1, -1), 6)
        ])
    )

    elements.append(summary_table)

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # CONTENT PERFORMANCE
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Content Performance",
            styles["Heading2"]
        )
    )

    content_data = [
        [
            "Title",
            "Platform",
            "Views",
            "Reach",
            "Engagement"
        ]
    ]

    for content in report_data.get(
        "content_performance",
        []
    ):
        content_data.append([
            str(content.get("title", ""))[:30],
            str(content.get("platform", "")),
            str(content.get("views", 0)),
            str(content.get("reach", 0)),
            f"{content.get('engagement_rate', 0)}%"
        ])

    if len(content_data) > 1:

        content_table = Table(
            content_data,
            colWidths=[150, 80, 70, 70, 80],
            repeatRows=1
        )

        content_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 5)
            ])
        )

        elements.append(content_table)

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # AUDIENCE ANALYTICS
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Audience Analytics",
            styles["Heading2"]
        )
    )

    audience = report_data.get(
        "audience_analytics",
        {}
    )

    audience_data = [
        ["Metric", "Value"],
        [
            "Total Followers",
            str(audience.get("total_followers", 0))
        ],
        [
            "Total Reach",
            str(audience.get("total_reach", 0))
        ],
        [
            "Total Impressions",
            str(audience.get("total_impressions", 0))
        ]
    ]

    audience_table = Table(
        audience_data,
        colWidths=[250, 150]
    )

    audience_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("PADDING", (0, 0), (-1, -1), 6)
        ])
    )

    elements.append(audience_table)

    elements.append(Spacer(1, 10))

    # --------------------------------------------------
    # GENDER DISTRIBUTION
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Gender Distribution",
            styles["Heading3"]
        )
    )

    gender_data = [
        ["Gender", "Percentage"]
    ]

    for gender, percentage in audience.get(
        "gender_distribution",
        {}
    ).items():

        gender_data.append([
            str(gender),
            f"{percentage}%"
        ])

    if len(gender_data) > 1:

        gender_table = Table(
            gender_data,
            colWidths=[250, 150]
        )

        gender_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("PADDING", (0, 0), (-1, -1), 6)
            ])
        )

        elements.append(gender_table)

    elements.append(Spacer(1, 10))

    # --------------------------------------------------
    # AGE DISTRIBUTION
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Age Distribution",
            styles["Heading3"]
        )
    )

    age_data = [
        ["Age Group", "Percentage"]
    ]

    for age_group, percentage in audience.get(
        "age_distribution",
        {}
    ).items():

        age_data.append([
            str(age_group),
            f"{percentage}%"
        ])

    if len(age_data) > 1:

        age_table = Table(
            age_data,
            colWidths=[250, 150]
        )

        age_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("PADDING", (0, 0), (-1, -1), 6)
            ])
        )

        elements.append(age_table)

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # REVENUE ANALYTICS
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Revenue Analytics",
            styles["Heading2"]
        )
    )

    revenue = report_data.get(
        "revenue_analytics",
        {}
    )

    elements.append(
        Paragraph(
            f"Total Revenue: "
            f"{revenue.get('total_revenue', 0)}",
            styles["BodyText"]
        )
    )

    elements.append(Spacer(1, 10))

    revenue_data = [
        ["Source", "Amount"]
    ]

    for source, amount in revenue.get(
        "revenue_by_source",
        {}
    ).items():

        revenue_data.append([
            str(source),
            str(amount)
        ])

    if len(revenue_data) > 1:

        revenue_table = Table(
            revenue_data,
            colWidths=[250, 150]
        )

        revenue_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("PADDING", (0, 0), (-1, -1), 6)
            ])
        )

        elements.append(revenue_table)

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # GROWTH TRENDS
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Growth Trends",
            styles["Heading2"]
        )
    )

    growth_data = [
        [
            "Date",
            "Followers",
            "Daily Growth",
            "Growth %"
        ]
    ]

    for growth in report_data.get(
        "growth_trends",
        []
    ):

        growth_data.append([
            str(growth.get("date", "")),
            str(growth.get("followers", 0)),
            str(growth.get("daily_growth", 0)),
            f"{growth.get('growth_percentage', 0)}%"
        ])

    if len(growth_data) > 1:

        growth_table = Table(
            growth_data,
            colWidths=[100, 100, 100, 100],
            repeatRows=1
        )

        growth_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 5)
            ])
        )

        elements.append(growth_table)

    elements.append(Spacer(1, 20))

    # --------------------------------------------------
    # PLATFORM COMPARISON
    # --------------------------------------------------

    elements.append(
        Paragraph(
            "Platform Comparison",
            styles["Heading2"]
        )
    )

    platform_data = [
        [
            "Platform",
            "Views",
            "Reach",
            "Engagement"
        ]
    ]

    for platform in report_data.get(
        "platform_comparison",
        []
    ):

        platform_data.append([
            str(platform.get("platform", "")),
            str(platform.get("views", 0)),
            str(platform.get("reach", 0)),
            f"{platform.get('engagement_rate', 0)}%"
        ])

    if len(platform_data) > 1:

        platform_table = Table(
            platform_data,
            colWidths=[150, 100, 100, 100],
            repeatRows=1
        )

        platform_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("PADDING", (0, 0), (-1, -1), 6)
            ])
        )

        elements.append(platform_table)

    # --------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------

    document.build(elements)

    buffer.seek(0)

    return buffer