from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    image_path: str = ''


class ProjectUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    image_path: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    image_path: str
    created_at: datetime
