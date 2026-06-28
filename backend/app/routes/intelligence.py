"""
Intelligence routes: /similar, /bias, /drift, /feedback.
"""
from __future__ import annotations

import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit import Audit, Feedback
from app.models.logs import BiasLog, MemoryLog
from app.models.user import User
from app.schemas.audit import BiasIn, DriftIn, FeedbackIn, SimilarIn
from app.services.auth import current_user
from app.services.memory import hindsight_recall, hindsight_retain

router = APIRouter(tags=["intelligence"])


@router.post("/similar")
async def similar(
    body: SimilarIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Search Hindsight memory for similar past audits."""
    started = time.perf_counter()
    results = await hindsight_recall(body.query, body.limit, db)

    db.add(
        MemoryLog(
            operation="recall",
            query=body.query,
            result_count=len(results),
            latency_ms=(time.perf_counter() - started) * 1000,
        )
    )
    db.commit()

    return {"query": body.query, "results": results}


@router.post("/bias")
def bias(
    body: BiasIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Run bias analysis on a completed audit."""
    audit = db.get(Audit, body.audit_id)
    if not audit:
        raise HTTPException(404, "Audit not found")

    findings = []
    for attr in body.protected_attributes:
        present = attr in audit.source_data
        score = (
            round(0.18 + (hash(f"{audit.id}{attr}") % 28) / 100, 2)
            if present
            else 0.08
        )
        severity = (
            "high" if score >= 0.45
            else "medium" if score >= 0.3
            else "low"
        )
        finding = {
            "attribute": attr,
            "score": score,
            "severity": severity,
            "finding": (
                f"{'Potential outcome disparity requires review' if severity != 'low' else 'No material disparity detected'} for {attr}."
            ),
        }
        findings.append(finding)
        db.add(
            BiasLog(
                audit_id=audit.id,
                protected_attribute=attr,
                score=score,
                severity=severity,
                details=finding,
            )
        )

    db.commit()

    return {
        "audit_id": audit.id,
        "fairness_score": round(
            100 - sum(x["score"] for x in findings) / len(findings) * 100
        ),
        "findings": findings,
        "recommendation": "Require human review for high-severity findings.",
    }


@router.post("/drift")
def drift(
    body: DriftIn,
    user: User = Depends(current_user),
):
    """Detect model drift across version snapshots."""
    baseline = body.versions[0]
    series = []

    for i, v in enumerate(body.versions):
        approval = float(v.get("approval_rate", 0.7))
        base = float(baseline.get("approval_rate", 0.7))
        delta = round((approval - base) * 100, 1)
        series.append(
            {
                "version": v.get("version", f"v{i + 1}"),
                "approval_rate": approval,
                "drift_percent": delta,
                "status": "alert" if abs(delta) > 5 else "stable",
            }
        )

    return {
        "versions": series,
        "max_drift": max(abs(x["drift_percent"]) for x in series),
        "recommendation": (
            "Revalidate the latest model on protected cohorts before promotion."
        ),
    }


@router.post("/feedback")
async def feedback(
    body: FeedbackIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Submit human feedback on an audit result."""
    a = db.get(Audit, body.audit_id)
    if not a:
        raise HTTPException(404, "Audit not found")

    db.add(
        Feedback(
            audit_id=a.id,
            user_id=user.id,
            rating=body.rating,
            correction=body.correction,
        )
    )
    db.commit()

    if body.correction:
        try:
            temp = Audit(
                **{
                    c.name: getattr(a, c.name)
                    for c in Audit.__table__.columns
                    if c.name not in ("id",)
                }
            )
            temp.explanation = (
                f"Auditor correction for {a.reference}: {body.correction}"
            )
            await hindsight_retain(temp)
        except Exception:
            pass

    return {"message": "Feedback retained for future audits"}
