"""Audit and intelligence request schemas."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AnalyzeIn(BaseModel):
    """Payload for the /analyze and /explain endpoints."""

    subject_name: str
    decision_type: str = "loan"
    decision: str = "review"
    data: dict[str, Any]
    budget_usd: float = Field(0.05, gt=0, le=2)


class SimilarIn(BaseModel):
    """Payload for Hindsight similarity recall."""

    query: str = Field(min_length=2)
    limit: int = Field(5, ge=1, le=20)


class BiasIn(BaseModel):
    """Payload for bias analysis on an audit."""

    audit_id: int
    protected_attributes: list[str] = ["gender", "age", "region", "income"]


class DriftIn(BaseModel):
    """Payload for model drift detection."""

    versions: list[dict[str, Any]] = Field(min_length=2)


class FeedbackIn(BaseModel):
    """Payload for submitting human feedback."""

    audit_id: int
    rating: int = Field(ge=1, le=5)
    correction: str = ""
