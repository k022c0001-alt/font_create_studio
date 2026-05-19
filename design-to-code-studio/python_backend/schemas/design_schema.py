from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class DetectedElement(BaseModel):
    id: str
    type: Literal['container', 'text', 'button', 'image', 'input', 'unknown'] = 'unknown'
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    text: str | None = None
    class_name: str | None = None


class UploadResponse(BaseModel):
    project_id: str
    image_path: str
    created_at: datetime


class AnalyzeRequest(BaseModel):
    project_id: str
    prompt: str | None = None


class AnalyzeResponse(BaseModel):
    analysis_id: str
    project_id: str
    elements: list[DetectedElement]
    layout_summary: str
    source: Literal['claude_vision', 'fallback']


class GenerateJsxRequest(BaseModel):
    analysis_id: str
    component_name: str = 'GeneratedScreen'
    stream: bool = False


class GenerateJsxResponse(BaseModel):
    analysis_id: str
    jsx: str
    css: str


class ErrorResponse(BaseModel):
    detail: str
