"""
HTTP middleware: rate limiting and security headers.
"""
from __future__ import annotations

import io
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import StreamingResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# Per-IP sliding-window request counter (60-second window, 120 req max)
_request_windows: dict[str, deque] = defaultdict(deque)


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Combined rate-limiting and security-header middleware.

    * Enforces a per-IP rate limit of 120 requests per 60 seconds.
    * Attaches security headers to every response.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        key = request.client.host if request.client else "local"
        now = time.time()
        window = _request_windows[key]

        # Expire entries older than 60 seconds
        while window and window[0] < now - 60:
            window.popleft()

        if len(window) > 120:
            return StreamingResponse(
                io.BytesIO(b'{"detail":"Rate limit exceeded"}'),
                status_code=429,
                media_type="application/json",
            )

        window.append(now)
        response = await call_next(request)

        response.headers.update(
            {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            }
        )

        return response
