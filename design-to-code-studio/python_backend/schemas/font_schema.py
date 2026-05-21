"""Pydantic models for font-related API requests and responses."""
from pydantic import BaseModel


class FontUploadRequest(BaseModel):
    project_id: str
    filename: str
    content_type: str


class FontRecord(BaseModel):
    id: str
    project_id: str
    family: str
    file_path: str
    format: str  # ttf | otf | woff2
    is_variable: bool = False


class FontSubsetRequest(BaseModel):
    font_id: str
    unicode_ranges: list[str]


class FontConvertRequest(BaseModel):
    font_id: str
