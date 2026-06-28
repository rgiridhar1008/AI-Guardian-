"""
PDF report generation service.

Builds a styled PDF audit report using ReportLab and returns the
raw bytes together with a SHA-256 checksum.
"""
from __future__ import annotations

import hashlib
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.audit import Audit
from app.models.logs import BiasLog, RoutingLog


def generate_pdf(
    audit: Audit,
    route: RoutingLog | None,
    bias_rows: list[BiasLog],
) -> tuple[bytes, str]:
    """
    Render an audit report PDF.

    Returns ``(pdf_bytes, sha256_checksum)``.
    """
    buffer = io.BytesIO()
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=45,
        leftMargin=45,
    )

    story = [
        Paragraph("AI Guardian — Decision Audit Report", styles["Title"]),
        Paragraph(
            f"Immutable reference {audit.reference} • "
            f"{audit.created_at:%d %B %Y %H:%M UTC}",
            styles["Normal"],
        ),
        Spacer(1, 18),
    ]

    data = [
        ["Field", "Verified value"],
        ["Subject", audit.subject_name],
        ["Decision type", audit.decision_type.title()],
        ["Outcome", audit.decision],
        ["Confidence", f"{audit.confidence:.0%}"],
        ["Risk", f"{audit.risk_score:.0%}"],
        ["Model", route.selected_model if route else "N/A"],
        ["Latency", f"{route.latency_ms:.0f} ms" if route else "N/A"],
        ["Cost", f"${route.cost_usd:.4f}" if route else "N/A"],
    ]

    table = Table(data, colWidths=[130, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f0ff")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story += [
        table,
        Spacer(1, 16),
        Paragraph("Plain-language explanation", styles["Heading2"]),
        Paragraph(audit.explanation, styles["BodyText"]),
        Paragraph("Technical rationale", styles["Heading2"]),
        Paragraph(audit.technical_explanation, styles["BodyText"]),
        Paragraph("Recommendations", styles["Heading2"]),
    ]
    story += [
        Paragraph(f"• {x}", styles["BodyText"])
        for x in audit.recommendations
    ]

    if bias_rows:
        story += [
            Paragraph("Fairness findings", styles["Heading2"]),
            Paragraph(
                ", ".join(
                    f"{x.protected_attribute}: {x.severity} ({x.score:.0%})"
                    for x in bias_rows
                ),
                styles["BodyText"],
            ),
        ]

    doc.build(story)
    content = buffer.getvalue()
    checksum = hashlib.sha256(content).hexdigest()

    return content, checksum
