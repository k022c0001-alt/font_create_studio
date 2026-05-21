"""Pydantic models for export-related API requests and responses."""
from pydantic import BaseModel


class ExportZipRequest(BaseModel):
    project_id: str
    include_fonts: bool = True
    embed_fonts: bool = False


class ExportZipResponse(BaseModel):
    download_url: str
    file_size: int
