"""Operational log ORM models: MemoryLog, BiasLog, RoutingLog, CostLog."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, utcnow


class MemoryLog(Base):
    """Log entry for Hindsight memory retain/recall operations."""

    __tablename__ = "memory_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    audit_id: Mapped[int | None] = mapped_column(
        ForeignKey("audits.id", ondelete="CASCADE"), index=True
    )
    operation: Mapped[str] = mapped_column(String(20), index=True)
    query: Mapped[str] = mapped_column(Text, default="")
    provider: Mapped[str] = mapped_column(String(40), default="hindsight")
    result_count: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )


class BiasLog(Base):
    """Log entry for bias detection findings."""

    __tablename__ = "bias_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    audit_id: Mapped[int] = mapped_column(
        ForeignKey("audits.id", ondelete="CASCADE"), index=True
    )
    protected_attribute: Mapped[str] = mapped_column(String(60), index=True)
    score: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )


class RoutingLog(Base):
    """Log entry for cascadeflow model routing decisions."""

    __tablename__ = "routing_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    audit_id: Mapped[int | None] = mapped_column(
        ForeignKey("audits.id", ondelete="SET NULL"), index=True
    )
    complexity: Mapped[str] = mapped_column(String(20), index=True)
    selected_model: Mapped[str] = mapped_column(String(100), index=True)
    provider: Mapped[str] = mapped_column(String(40))
    reason: Mapped[str] = mapped_column(Text)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[float] = mapped_column(Float, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0)
    budget_usd: Mapped[float] = mapped_column(Float, default=0.05)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True
    )


class CostLog(Base):
    """Log entry for per-audit cost tracking."""

    __tablename__ = "cost_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    audit_id: Mapped[int] = mapped_column(
        ForeignKey("audits.id", ondelete="CASCADE"), index=True
    )
    category: Mapped[str] = mapped_column(String(40), index=True)
    amount_usd: Mapped[float] = mapped_column(Float)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )
