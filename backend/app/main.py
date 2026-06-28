"""
AI Guardian API — slim application factory.

Creates the FastAPI app, includes all routers, adds CORS and
security middleware, seeds the database on first startup, and
exposes the /health endpoint.

Start with::

    uvicorn app.main:app --reload
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.middleware import SecurityMiddleware
from app.routes.audit import router as audit_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.intelligence import router as intelligence_router
from app.seed import seed

# Import models so that Base.metadata knows about every table
import app.models  # noqa: F401

app = FastAPI(
    title="AI Guardian API",
    version="1.0.0",
    description="Auditable AI decision intelligence with Hindsight and cascadeflow",
)

# --- Middleware (order matters: last added = first executed) ----------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityMiddleware)

# --- Routers ---------------------------------------------------------------

app.include_router(auth_router)
app.include_router(audit_router)
app.include_router(intelligence_router)
app.include_router(dashboard_router)


# --- Startup ---------------------------------------------------------------

@app.on_event("startup")
def startup() -> None:
    """Create all tables and seed demo data on first run."""
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)


# --- Health ----------------------------------------------------------------

@app.get("/health")
def health():
    """Liveness / readiness probe."""
    return {
        "status": "healthy",
        "memory": "hindsight" if settings.hindsight_api_key else "local-fallback",
        "routing": "cascadeflow",
    }
