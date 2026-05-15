from __future__ import annotations

import math

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from fontTools.ttLib import TTLibError

from python_backend.schemas.font_export_schema import (
    FontExportFormat,
    FontExportRequest,
    FontExportValidateResponse,
    ValidationErrorDetail,
)
from python_backend.services.font_engine.generator.curve_engine import Contour
from python_backend.services.font_engine.generator.font_assembler import FontAssembler, FontMetadata
from python_backend.services.font_engine.generator.glyph_builder import GlyphData
from python_backend.services.font_engine.generator.metrics_engine import FontMetrics, GlyphMetrics
from python_backend.services.font_engine.pipeline.woff2_converter import Woff2Converter


router = APIRouter(prefix="/fonts", tags=["font-export"])


class BuildValidationError(Exception):
    def __init__(self, code: str, message: str, location: str) -> None:
        self.code = code
        self.message = message
        self.location = location
        super().__init__(message)


@router.post("/export")
async def export_font(req: FontExportRequest) -> Response:
    try:
        result_bytes = _build_font_bytes(req)
    except BuildValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": exc.code, "message": exc.message, "location": exc.location},
        )
    except TTLibError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "fonttools_error", "message": str(exc), "location": "font_build"},
        )
    except Exception as exc:
        if exc.__class__.__module__.startswith("fontTools"):
            raise HTTPException(
                status_code=422,
                detail={"code": "fonttools_error", "message": str(exc), "location": "font_build"},
            )
        raise HTTPException(status_code=500, detail="Failed to export font")

    family = req.metadata.family_name.strip().replace(" ", "-")
    style = req.metadata.style_name.strip().replace(" ", "-")
    extension = req.format.value
    media_type = "font/woff2" if req.format == FontExportFormat.woff2 else "font/ttf"

    return Response(
        content=result_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{family}-{style}.{extension}"'},
    )


@router.post("/export/validate", response_model=FontExportValidateResponse)
async def validate_export_font(req: FontExportRequest) -> FontExportValidateResponse:
    try:
        _build_font_bytes(req)
        return FontExportValidateResponse(ok=True)
    except BuildValidationError as exc:
        return FontExportValidateResponse(
            ok=False,
            error=ValidationErrorDetail(code=exc.code, message=exc.message, location=exc.location),
        )
    except TTLibError as exc:
        return FontExportValidateResponse(
            ok=False,
            error=ValidationErrorDetail(code="fonttools_error", message=str(exc), location="font_build"),
        )
    except Exception as exc:
        if exc.__class__.__module__.startswith("fontTools"):
            return FontExportValidateResponse(
                ok=False,
                error=ValidationErrorDetail(code="fonttools_error", message=str(exc), location="font_build"),
            )
        return FontExportValidateResponse(
            ok=False,
            error=ValidationErrorDetail(code="build_error", message=str(exc), location="font_build"),
        )


def _build_font_bytes(req: FontExportRequest) -> bytes:
    fm = FontMetrics(
        upm=req.metrics.upm,
        ascender=req.metrics.ascender,
        descender=req.metrics.descender,
        cap_height=req.metrics.cap_height,
        x_height=req.metrics.x_height,
        line_gap=req.metrics.line_gap,
        italic_angle=req.metrics.italic_angle,
    )
    metadata = FontMetadata(
        family_name=req.metadata.family_name,
        style_name=req.metadata.style_name,
        version=req.metadata.version,
        copyright=req.metadata.copyright,
        designer=req.metadata.designer,
        description=req.metadata.description,
        url=req.metadata.url,
    )

    glyphs = [_to_glyph_data(g, i) for i, g in enumerate(req.glyphs)]
    assembler = FontAssembler(metrics=fm, metadata=metadata)
    assembler.add_glyphs(glyphs)
    ttf_bytes = assembler.build_ttf()

    if req.format == FontExportFormat.woff2:
        converter = Woff2Converter()
        return converter.convert_bytes(ttf_bytes, metadata.family_name, metadata.style_name).woff2_bytes
    return ttf_bytes


def _to_glyph_data(glyph_input, glyph_idx: int) -> GlyphData:
    if not glyph_input.name.strip():
        raise BuildValidationError("missing_field", "glyph name is required", f"glyphs[{glyph_idx}].name")

    contours: list[Contour] = []
    for contour_idx, contour_input in enumerate(glyph_input.contours):
        points = contour_input.points
        if len(points) < 3:
            raise BuildValidationError(
                "invalid_contour",
                "contour must have at least 3 points",
                f"glyphs[{glyph_idx}].contours[{contour_idx}].points",
            )
        if not any(p.on_curve for p in points):
            raise BuildValidationError(
                "invalid_contour",
                "contour must contain at least one on-curve point",
                f"glyphs[{glyph_idx}].contours[{contour_idx}]",
            )

        c = Contour()
        for point_idx, point in enumerate(points):
            if not (math.isfinite(point.x) and math.isfinite(point.y)):
                raise BuildValidationError(
                    "invalid_point",
                    "point coordinates must be finite numbers",
                    f"glyphs[{glyph_idx}].contours[{contour_idx}].points[{point_idx}]",
                )
            if point.on_curve:
                c.add_on_curve(point.x, point.y)
            else:
                c.add_off_curve(point.x, point.y)
        contours.append(c)

    return GlyphData(
        name=glyph_input.name,
        unicode=glyph_input.unicode,
        contours=contours,
        metrics=GlyphMetrics(
            advance_width=glyph_input.metrics.advance_width,
            lsb=glyph_input.metrics.left_side_bearing,
        ),
    )
