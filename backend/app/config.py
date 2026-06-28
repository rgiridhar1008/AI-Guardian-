"""
Application configuration.

Loads settings from environment variables and an optional .env file
using pydantic-settings.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the AI Guardian backend."""

    database_url: str = "sqlite:///./ai_guardian.db"
    secret_key: str = "development-only-change-me"
    groq_api_key: str = ""
    groq_base_url: str = "https://api.groq.com/openai/v1"
    hindsight_api_key: str = ""
    hindsight_base_url: str = "https://api.hindsight.vectorize.io"
    hindsight_bank_id: str = "ai-guardian-audits"
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
