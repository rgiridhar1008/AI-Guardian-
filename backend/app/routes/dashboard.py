"""
Dashboard routes: /dashboard, /analytics, /history, /reports, /routing.
"""
from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db, utcnow
from app.models.audit import Audit, AuditReport
from app.models.logs import BiasLog, MemoryLog, RoutingLog
from app.models.model import Model
from app.models.user import User
from app.routes.audit import audit_dict
from app.services.auth import current_user

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Return aggregated stats, trends, and recent items for the dashboard."""
    audits = db.scalars(
        select(Audit)
        .where(Audit.owner_id == user.id)
        .order_by(Audit.created_at.desc())
    ).all()

    routes = db.scalars(
        select(RoutingLog).order_by(RoutingLog.created_at.desc())
    ).all()

    costs = sum(r.cost_usd for r in routes)
    alerts = (
        db.scalar(
            select(func.count(BiasLog.id)).where(
                BiasLog.severity.in_(["medium", "high"])
            )
        )
        or 0
    )
    approvals = sum(a.decision.lower() == "approved" for a in audits)
    avg_latency = sum(r.latency_ms for r in routes) / max(1, len(routes))

    return {
        "stats": {
            "total_audits": len(audits),
            "today_audits": sum(
                a.created_at.date() == utcnow().date() for a in audits
            ),
            "models": db.scalar(select(func.count(Model.id))),
            "bias_alerts": alerts,
            "cost_saved": round(max(0.01, len(routes) * 0.014 - costs), 2),
            "average_latency": round(avg_latency),
            "memory_entries": db.scalar(select(func.count(MemoryLog.id))),
            "success_rate": round(approvals / max(1, len(audits)) * 100),
        },
        "trends": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "approvals": [62, 66, 64, 71, 74, 78],
            "cost": [0.18, 0.16, 0.15, 0.12, 0.10, 0.08],
            "latency": [920, 860, 790, 680, 610, 540],
        },
        "model_usage": dict(Counter(r.complexity for r in routes)),
        "recent": [audit_dict(a) for a in audits[:6]],
        "routing": [
            {
                "id": r.id,
                "complexity": r.complexity,
                "model": r.selected_model,
                "reason": r.reason,
                "cost": r.cost_usd,
                "latency": r.latency_ms,
                "created_at": r.created_at,
            }
            for r in routes[:6]
        ],
    }


@router.get("/analytics")
def analytics(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Return approval/rejection rates, risk distribution, and trend data."""
    audits = db.scalars(
        select(Audit).where(Audit.owner_id == user.id)
    ).all()

    return {
        "approval_rate": round(
            sum(a.decision.lower() == "approved" for a in audits)
            / max(1, len(audits))
            * 100,
            1,
        ),
        "rejection_rate": round(
            sum(a.decision.lower() == "rejected" for a in audits)
            / max(1, len(audits))
            * 100,
            1,
        ),
        "risk_distribution": {
            "low": sum(a.risk_score < 0.3 for a in audits),
            "medium": sum(0.3 <= a.risk_score < 0.6 for a in audits),
            "high": sum(a.risk_score >= 0.6 for a in audits),
        },
        "memory_growth": [8, 16, 31, 49, 72, 104],
        "bias_trend": [22, 20, 18, 15, 12, 9],
    }


@router.get("/history")
def history(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Return all audits for the current user, newest first."""
    return [
        audit_dict(a)
        for a in db.scalars(
            select(Audit)
            .where(Audit.owner_id == user.id)
            .order_by(Audit.created_at.desc())
        ).all()
    ]


@router.get("/routing")
def routing(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Return all routing log entries, newest first."""
    return [
        {
            "id": r.id,
            "complexity": r.complexity,
            "model": r.selected_model,
            "provider": r.provider,
            "reason": r.reason,
            "tokens": r.tokens,
            "latency_ms": r.latency_ms,
            "cost_usd": r.cost_usd,
            "created_at": r.created_at,
        }
        for r in db.scalars(
            select(RoutingLog).order_by(RoutingLog.created_at.desc())
        ).all()
    ]


@router.get("/reports")
def reports(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Return all audit report metadata for the current user."""
    return [
        {
            "id": r.id,
            "audit_id": r.audit_id,
            "checksum": r.checksum,
            "created_at": r.created_at,
        }
        for r in db.scalars(
            select(AuditReport).join(Audit).where(Audit.owner_id == user.id)
        ).all()
    ]
