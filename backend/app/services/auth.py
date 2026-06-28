"""
Authentication helpers: password hashing, JWT tokens, current-user dependency.
"""
from __future__ import annotations

from datetime import timedelta

from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, utcnow
from app.models.user import User

# Password hashing context
pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def token_for(user: User) -> str:
    """Create a signed JWT for *user* valid for 12 hours."""
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": utcnow() + timedelta(hours=12),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency that extracts and validates the authenticated user."""
    raw = request.headers.get("authorization", "").removeprefix("Bearer ")
    if not raw:
        raise HTTPException(401, "Authentication required")

    try:
        user_id = int(
            jwt.decode(raw, settings.secret_key, algorithms=["HS256"])["sub"]
        )
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "Invalid or expired token")

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(401, "Inactive user")

    return user
