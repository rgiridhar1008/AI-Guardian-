"""
Audit routes: /analyze, /explain, /upload, /report, /audit/{id}.
"""
from __future__ import annotations

import csv
import io
import json
import os
import time
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from openpyxl import load_workbook
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit import Audit, AuditReport
from app.models.logs import BiasLog, CostLog, MemoryLog, RoutingLog
from app.models.user import User
from app.schemas.audit import AnalyzeIn
from app.services.auth import current_user
from app.services.explainer import explain
from app.services.memory import hindsight_retain
from app.services.report import generate_pdf
from app.services.router import Router
from app.config import settings

router = APIRouter(tags=["audit"])


def audit_dict(a: Audit) -> dict:
    """Serialize an Audit to a plain dict for JSON responses."""
    return {
        k: getattr(a, k)
        for k in (
            "id",
            "reference",
            "subject_name",
            "decision_type",
            "decision",
            "explanation",
            "technical_explanation",
            "recommendations",
            "confidence",
            "risk_score",
            "status",
            "created_at",
        )
    }


@router.post("/analyze")
@router.post("/explain")
async def analyze(
    body: AnalyzeIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Run a full audit: route → explain → persist → retain in memory."""
    tier, model, reason = Router().choose(body.data, body.budget_usd)

    started = time.perf_counter()
    result, tokens = await explain(body, model)
    latency = (time.perf_counter() - started) * 1000

    cost = round(
        tokens * {"small": 0.0000001, "medium": 0.00000059, "large": 0.0000009}[tier],
        6,
    )

    a = Audit(
        reference=f"AG-{uuid.uuid4().hex[:6].upper()}",
        owner_id=user.id,
        subject_name=body.subject_name,
        decision_type=body.decision_type,
        decision=body.decision,
        source_data=body.data,
        **result,
    )
    db.add(a)
    db.flush()

    db.add(
        RoutingLog(
            audit_id=a.id,
            complexity=tier,
            selected_model=model,
            provider="Groq" if settings.groq_api_key else "Simulation",
            reason=reason,
            tokens=tokens,
            latency_ms=latency,
            cost_usd=cost,
            budget_usd=body.budget_usd,
        )
    )
    db.add(
        CostLog(
            audit_id=a.id,
            category="explanation",
            amount_usd=cost,
            tokens=tokens,
        )
    )
    db.commit()
    db.refresh(a)

    memory_start = time.perf_counter()
    try:
        provider = await hindsight_retain(a)
    except Exception:
        provider = "local-fallback"

    db.add(
        MemoryLog(
            audit_id=a.id,
            operation="retain",
            provider=provider,
            result_count=1,
            latency_ms=(time.perf_counter() - memory_start) * 1000,
        )
    )
    db.commit()

    return {
        **audit_dict(a),
        "routing": {
            "tier": tier,
            "model": model,
            "reason": reason,
            "tokens": tokens,
            "latency_ms": round(latency),
            "cost_usd": cost,
        },
        "memory_provider": provider,
    }


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
):
    """Parse an uploaded CSV, JSON, or XLSX file and return a preview."""
    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(413, "File exceeds 10 MB limit")

    ext = os.path.splitext(file.filename or "")[1].lower()
    rows: list[dict] = []

    try:
        if ext == ".csv":
            rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))))
        elif ext == ".json":
            data = json.loads(raw)
            rows = data if isinstance(data, list) else [data]
        elif ext in (".xlsx", ".xlsm"):
            ws = load_workbook(
                io.BytesIO(raw), read_only=True, data_only=True
            ).active
            values = list(ws.values)
            rows = [dict(zip(values[0], r)) for r in values[1:]]
        else:
            raise HTTPException(415, "Use CSV, JSON, or XLSX")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(422, f"Could not parse file: {e}")

    return {
        "filename": file.filename,
        "rows": len(rows),
        "columns": list(rows[0]) if rows else [],
        "preview": rows[:10],
    }


@router.post("/report")
def report(
    body: dict,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Generate and return a PDF audit report."""
    a = db.get(Audit, int(body.get("audit_id", 0)))
    if not a or a.owner_id != user.id:
        raise HTTPException(404, "Audit not found")

    route = db.scalar(
        select(RoutingLog)
        .where(RoutingLog.audit_id == a.id)
        .order_by(RoutingLog.created_at.desc())
    )
    bias_rows = db.scalars(
        select(BiasLog).where(BiasLog.audit_id == a.id)
    ).all()

    content, checksum = generate_pdf(a, route, bias_rows)

    db.add(
        AuditReport(
            audit_id=a.id,
            report_data={
                "reference": a.reference,
                "model": route.selected_model if route else None,
            },
            checksum=checksum,
        )
    )
    db.commit()

    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{a.reference}-audit-report.pdf"'
            ),
            "X-Report-Checksum": checksum,
        },
    )


@router.delete("/audit/{audit_id}", status_code=204)
def delete_audit(
    audit_id: int,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Delete an audit owned by the current user."""
    a = db.get(Audit, audit_id)
    if not a or a.owner_id != user.id:
        raise HTTPException(404, "Audit not found")
    db.delete(a)
    db.commit()
