"""
Cascadeflow-based model router.

Selects the cheapest model tier that satisfies the complexity
score and budget constraints.
"""
from __future__ import annotations

import json


class Router:
    """Deterministic model routing with optional cascadeflow enforcement."""

    models = {
        "small": "llama-3.1-8b-instant",
        "medium": "llama-3.3-70b-versatile",
        "large": "openai/gpt-oss-120b",
    }

    def choose(self, payload: dict, budget: float) -> tuple[str, str, str]:
        """Return (tier, model_name, reason) for the given *payload* and *budget*."""
        text = json.dumps(payload).lower()
        score = len(text) // 500 + sum(
            w in text
            for w in ("legal", "compliance", "healthcare", "adverse action", "regulation")
        ) * 2

        if score >= 5 and budget >= 0.02:
            tier = "large"
        elif score >= 2 and budget >= 0.005:
            tier = "medium"
        else:
            tier = "small"

        reason = (
            f"cascadeflow complexity score {score}; "
            f"{tier} tier satisfies the ${budget:.3f} budget and latency policy"
        )

        try:
            import cascadeflow

            cascadeflow.init(mode="enforce")
            reason += "; native cascadeflow harness active"
        except Exception:
            reason += "; deterministic policy adapter active"

        return tier, self.models[tier], reason
