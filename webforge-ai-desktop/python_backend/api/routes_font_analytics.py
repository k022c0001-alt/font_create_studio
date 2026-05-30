from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from python_backend.schemas.font_analytics_schema import MetricsAnalysisResponse, TypographyRecommendation
from python_backend.services.font_analytics_engine import FontAnalyticsEngine


router = APIRouter(prefix="/fonts", tags=["font-analytics"])
engine = FontAnalyticsEngine()


class RecommendTypographyRequest(BaseModel):
    font_id: str = Field(min_length=1)
    context: str = Field(min_length=1)


class RecommendTypographyResponse(BaseModel):
    css_vars: dict[str, str]
    tailwind_config: dict[str, Any]


@router.get("/{font_id}/metrics-analysis", response_model=MetricsAnalysisResponse)
async def get_font_metrics_analysis(font_id: str) -> MetricsAnalysisResponse:
    """Font metrics 分析 + Typography 推奨値を返す。"""
    loaded = engine.load_font_data(font_id)
    if loaded is None:
        raise HTTPException(status_code=404, detail=f"font_id {font_id!r} が見つかりません")

    font_metadata, glyphs = loaded
    analysis = engine.analyze_font_metrics(font_metadata, glyphs)
    return MetricsAnalysisResponse(
        font_id=font_id,
        recommendations=TypographyRecommendation(
            optimal_sizes=analysis["optimal_sizes"],
            letter_spacing_map=analysis["letter_spacing_map"],
            line_height_map=analysis["line_height_map"],
        ),
        has_cjk=analysis["has_cjk"],
        available_weights=analysis["available_weights"],
    )


@router.post("/recommend-typography", response_model=RecommendTypographyResponse)
async def recommend_typography(req: RecommendTypographyRequest) -> RecommendTypographyResponse:
    """Font ID + context から Typography 推奨値を生成する。"""
    context = req.context.strip().lower()
    try:
        recommendation = engine.recommend_typography(req.font_id, context=context)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"font_id {req.font_id!r} が見つかりません")

    resolved_context = next(iter(recommendation.optimal_sizes.keys()))
    size_min, size_max = recommendation.optimal_sizes[resolved_context]
    font_size = round((size_min + size_max) / 2, 1)
    letter_spacing = recommendation.letter_spacing_map[resolved_context]
    line_height = recommendation.line_height_map[resolved_context]
    css_vars = {
        f"--font-size-{resolved_context}": f"{font_size}px",
        f"--line-height-{resolved_context}": str(line_height),
        f"--letter-spacing-{resolved_context}": f"{letter_spacing}px",
    }
    return RecommendTypographyResponse(
        css_vars=css_vars,
        tailwind_config={
            "theme": {
                "extend": {
                    "fontSize": {resolved_context: f"{font_size}px"},
                    "lineHeight": {resolved_context: str(line_height)},
                    "letterSpacing": {resolved_context: f"{letter_spacing}px"},
                }
            },
            "meta": {"font_id": req.font_id},
        },
    )
