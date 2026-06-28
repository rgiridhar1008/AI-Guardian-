"""Authentication request schemas."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    """Payload for user registration."""

    email: EmailStr
    full_name: str = Field(min_length=2)
    password: str = Field(min_length=8)


class LoginIn(BaseModel):
    """Payload for user login."""

    email: EmailStr
    password: str
