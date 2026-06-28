"""
Hindsight memory service.

Provides retain (store) and recall (search) operations against the
Hindsight cloud API, with local-fallback when no API key is set.
"""
from __future__ import annotations

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.audit import Audit


async def hindsight_retain(a: Audit) -> str:
    """
    Store an audit in Hindsight memory.

    Returns the provider name used (``"hindsight-cloud"`` or
    ``"local-fallback"``).
    """
    if not settings.hindsight_api_key:
        return "local-fallback"

    url = (
        f"{settings.hindsight_base_url}/v1/default/banks/"
        f"{settings.hindsight_bank_id}/memories"
    )
    content = (
        f"Audit {a.reference}: {a.decision_type} decision {a.decision} "
        f"for {a.subject_name}. {a.explanation} "
        f"Recommendations: {', '.join(a.recommendations)}"
    )

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            url,
            headers={"Authorization": f"Bearer {settings.hindsight_api_key}"},
            json={
                "items": [
                    {
                        "content": content,
                        "context": "AI Guardian verified audit",
                        "metadata": {
                            "audit_id": a.id,
                            "reference": a.reference,
                        },
                    }
                ]
            },
        )
        r.raise_for_status()

    return "hindsight-cloud"


async def hindsight_recall(
    query: str,
    limit: int,
    db: Session,
) -> list[dict]:
    """
    Search Hindsight memory for audits similar to *query*.

    Falls back to a local keyword-overlap search when the API key is
    not configured.
    """
    if settings.hindsight_api_key:
        url = (
            f"{settings.hindsight_base_url}/v1/default/banks/"
            f"{settings.hindsight_bank_id}/memories/recall"
        )
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                url,
                headers={"Authorization": f"Bearer {settings.hindsight_api_key}"},
                json={"query": query, "max_tokens": 2048},
            )
            r.raise_for_status()
            data = r.json()

        rows = data.get("results", [])[:limit]
        return [
            {
                "similarity": round(float(x.get("score", 0.8)) * 100),
                "reference": x.get("metadata", {}).get("reference", "Memory"),
                "outcome": "Historical",
                "explanation": x.get("text", x.get("content", "")),
                "source": "Hindsight",
            }
            for x in rows
        ]

    # Local keyword-overlap fallback
    words = set(query.lower().split())
    audits = db.scalars(
        select(Audit).order_by(Audit.created_at.desc()).limit(50)
    ).all()

    scored = []
    for a in audits:
        corpus = (
            f"{a.subject_name} {a.decision_type} {a.decision} {a.explanation}".lower()
        )
        overlap = sum(w in corpus for w in words)
        scored.append((min(98, 72 + overlap * 5), a))

    return [
        {
            "similarity": score,
            "reference": a.reference,
            "outcome": a.decision,
            "explanation": a.explanation,
            "recommendations": a.recommendations,
            "source": "Hindsight local memory",
        }
        for score, a in sorted(scored, reverse=True, key=lambda x: x[0])[:limit]
    ]
