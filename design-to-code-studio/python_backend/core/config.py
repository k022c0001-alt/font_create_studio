from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    design_db_path: str = str(ROOT_DIR / "database" / "design_studio.db")

    # Upload
    upload_dir: str = str(ROOT_DIR / "assets" / "uploads")
    max_upload_size: int = 10 * 1024 * 1024
    allowed_image_extensions: str = ".png,.jpg,.jpeg,.webp"

    # Claude (legacy / design converter)
    claude_api_key: str = ""
    claude_model: str = "claude-3-5-sonnet-20241022"

    # LLM provider selection ("openai" | "anthropic")
    llm_provider: str = "anthropic"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-sonnet-20241022"


@lru_cache
def get_settings() -> Settings:
    return Settings()


# ---------------------------------------------------------------------------
# Legacy module-level constants (kept for backwards compatibility)
# ---------------------------------------------------------------------------
_s = get_settings()
DB_PATH = Path(_s.design_db_path)
UPLOAD_DIR = Path(_s.upload_dir)
CLAUDE_API_KEY = _s.claude_api_key
CLAUDE_MODEL = _s.claude_model
MAX_UPLOAD_SIZE = _s.max_upload_size
ALLOWED_IMAGE_EXTENSIONS = {ext.strip() for ext in _s.allowed_image_extensions.split(",")}

