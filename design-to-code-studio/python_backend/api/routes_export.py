from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ExportZipRequest(BaseModel):
    project_id: str
    include_fonts: bool = True


@router.post("/export/zip")
async def export_zip(body: ExportZipRequest):
    """Package project output into a ZIP archive."""
    # TODO: delegate to export_engine.zip_exporter
    return {"status": "ok", "download_url": ""}
