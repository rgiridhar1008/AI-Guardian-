"""
Database seeding.

Populates the database with a demo user, sample models, and example
audits when the database is empty.
"""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import utcnow
from app.models.audit import Audit
from app.models.logs import BiasLog, CostLog, MemoryLog, RoutingLog
from app.models.model import Model
from app.models.user import User
from app.services.auth import pwd


def seed(db: Session) -> None:
    """Insert demo data if the database is empty."""
    if db.scalar(select(func.count(User.id))):
        return

    user = User(
        email="auditor@aiguardian.dev",
        full_name="Maya Chen",
        password_hash=pwd.hash("Guardian123!"),
        role="admin",
    )
    db.add(user)
    db.flush()

    for name, tier in [
        ("llama-3.1-8b-instant", "small"),
        ("llama-3.3-70b-versatile", "medium"),
        ("openai/gpt-oss-120b", "large"),
    ]:
        db.add(Model(name=name, provider="Groq", tier=tier))

    samples = [
        ("AG-1048", "Noah Williams", "loan", "Approved", 0.91, 0.18),
        ("AG-1047", "Amelia Brown", "insurance", "Review", 0.76, 0.46),
        ("AG-1046", "Liam Davis", "hiring", "Rejected", 0.88, 0.67),
        ("AG-1045", "Olivia Wilson", "admission", "Approved", 0.94, 0.12),
        ("AG-1044", "Ethan Martin", "healthcare", "Review", 0.72, 0.58),
    ]

    for i, (ref, name, kind, decision, conf, risk) in enumerate(samples):
        a = Audit(
            reference=ref,
            owner_id=user.id,
            subject_name=name,
            decision_type=kind,
            decision=decision,
            source_data={
                "income": 78000 - i * 4500,
                "age": 29 + i * 6,
                "region": "North",
            },
            explanation=(
                "The decision was driven by eligibility, affordability, "
                "and historical risk indicators."
            ),
            technical_explanation=(
                "Weighted feature contribution analysis found stable primary "
                "predictors with no single protected feature controlling the outcome."
            ),
            recommendations=[
                "Document the decisive features",
                "Schedule a human review for borderline cases",
            ],
            confidence=conf,
            risk_score=risk,
            created_at=utcnow() - timedelta(days=i),
        )
        db.add(a)
        db.flush()

        model_names = [
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-120b",
        ]
        tiers = ["small", "medium", "large"]

        db.add(
            RoutingLog(
                audit_id=a.id,
                complexity=tiers[i % 3],
                selected_model=model_names[i % 3],
                provider="Groq",
                reason=(
                    "cascadeflow policy selected the lowest-cost compliant model"
                ),
                tokens=640 + i * 91,
                latency_ms=410 + i * 180,
                cost_usd=0.0012 + i * 0.0011,
            )
        )
        db.add(
            CostLog(
                audit_id=a.id,
                category="explanation",
                amount_usd=0.0012 + i * 0.0011,
                tokens=640 + i * 91,
            )
        )
        db.add(
            MemoryLog(
                audit_id=a.id,
                operation="retain",
                result_count=1,
                latency_ms=82 + i * 9,
            )
        )

        if i in (1, 2):
            db.add(
                BiasLog(
                    audit_id=a.id,
                    protected_attribute="region" if i == 1 else "age",
                    score=0.41 + i * 0.12,
                    severity="medium" if i == 1 else "high",
                    details={"threshold": 0.35},
                )
            )

    db.commit()
