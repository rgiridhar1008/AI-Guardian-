"""
Authentication routes: /login, /register, /forgot-password.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, RegisterIn
from app.services.auth import pwd, token_for

router = APIRouter(tags=["auth"])


@router.post("/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT."""
    if db.scalar(select(User).where(User.email == body.email.lower())):
        raise HTTPException(409, "Email already registered")

    user = User(
        email=body.email.lower(),
        full_name=body.full_name,
        password_hash=pwd.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": token_for(user),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT."""
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if not user or not pwd.verify(body.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    return {
        "access_token": token_for(user),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/forgot-password")
def forgot(body: dict):
    """Placeholder for password-reset flow."""
    return {"message": "If the account exists, a secure reset link has been issued."}
