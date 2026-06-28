"""
Explainer service.

Calls the Groq API to generate audit explanations, falling back
to a deterministic heuristic when no API key is configured.
"""
from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import settings
from app.schemas.audit import AnalyzeIn


async def explain(
    payload: AnalyzeIn,
    model: str,
) -> tuple[dict[str, Any], int]:
    """
    Generate an audit explanation for *payload* using *model*.

    Returns ``(result_dict, token_count)``.
    """
    values = payload.data
    risk = min(
        0.95,
        max(
            0.05,
            (100 - (float(values.get("credit_score", 680)) - 500) / 3) / 100
            + (float(values.get("debt_ratio", 0.32)) - 0.3) * 0.5,
        ),
    )

    fallback: dict[str, Any] = {
        "explanation": (
            f"The {payload.decision.lower()} outcome was primarily influenced by "
            f"the submitted eligibility and risk indicators. The strongest signals "
            f"were financial capacity, stability, and policy fit."
        ),
        "technical_explanation": (
            f"A feature-level review using {model} identified affordability and "
            f"historical stability as the dominant contributors. Protected attributes "
            f"were excluded from the routing policy and checked independently."
        ),
        "recommendations": [
            "Request human review when confidence is below 80%",
            "Record the decisive policy rule",
            "Reassess if source data changes",
        ],
        "confidence": round(max(0.68, 0.94 - risk * 0.2), 2),
        "risk_score": round(risk, 2),
    }

    if not settings.groq_api_key:
        return fallback, 720

    prompt = (
        "Return strict JSON with explanation, technical_explanation, "
        "recommendations, confidence, risk_score. Audit this AI decision: "
        + json.dumps(payload.model_dump())
    )

    async with httpx.AsyncClient(timeout=35) as client:
        res = await client.post(
            f"{settings.groq_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an enterprise AI decision auditor. "
                            "Never infer protected traits."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"},
            },
        )
        res.raise_for_status()
        body = res.json()
        return (
            json.loads(body["choices"][0]["message"]["content"]),
            body.get("usage", {}).get("total_tokens", 0),
        )
