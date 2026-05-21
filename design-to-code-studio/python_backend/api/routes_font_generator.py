from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SubsetRequest(BaseModel):
    font_id: str
    unicode_ranges: list[str]


class ConvertRequest(BaseModel):
    font_id: str


@router.post("/fonts/subset")
async def subset_font(body: SubsetRequest):
    """Subset a font to the specified Unicode ranges."""
    # TODO: delegate to font_engine.subset_exporter
    return {"status": "ok", "font_id": body.font_id}


@router.post("/fonts/convert")
async def convert_font(body: ConvertRequest):
    """Convert a font to woff2."""
    # TODO: delegate to font_engine.woff2_converter
    return {"status": "ok", "font_id": body.font_id}
