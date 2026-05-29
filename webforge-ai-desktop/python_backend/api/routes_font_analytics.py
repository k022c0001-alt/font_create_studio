from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from python_backend.schemas.font_analytics_schema import MetricsAnalysisResponse, TypographyRecommendation


router = APIRouter(prefix="/fonts", tags=["font-analytics"])


class RecommendTypographyRequest(BaseModel):
    font_id: str = Field(min_length=1)
    context: str = Field(min_length=1)


class RecommendTypographyResponse(BaseModel):
    css_vars: dict[str, str]
    tailwind_config: dict[str, Any]


@router.get("/{font_id}/metrics-analysis", response_model=MetricsAnalysisResponse)
async def get_font_metrics_analysis(font_id: str) -> MetricsAnalysisResponse:
    """Font metrics 分析 + Typography 推奨値を返す。"""
    # TODO: Step 2 で Service 層を実装し、font_id から実データを分析する。
    return MetricsAnalysisResponse(
        font_id=font_id,
        recommendations=TypographyRecommendation(
            optimal_sizes={"body": (14.0, 16.0), "heading": (24.0, 32.0)},
            letter_spacing_map={"body": 0.5, "heading": 1.2},
            line_height_map={"body": 1.6, "heading": 1.3},
        ),
        has_cjk=False,
        available_weights=[400, 700],
    )


@router.post("/recommend-typography", response_model=RecommendTypographyResponse)
async def recommend_typography(req: RecommendTypographyRequest) -> RecommendTypographyResponse:
    """Font ID + context から Typography 推奨値を生成する。"""
    # TODO: Step 2 で FontAnalyticsService を呼び出して推奨値を生成する。
    context = req.context.strip().lower()
    css_vars = {
        f"--font-size-{context}": "16px",
        f"--line-height-{context}": "1.6",
        f"--letter-spacing-{context}": "0.5px",
    }
    return RecommendTypographyResponse(
        css_vars=css_vars,
        tailwind_config={
            "theme": {
                "extend": {
                    "fontSize": {context: "16px"},
                    "lineHeight": {context: "1.6"},
                    "letterSpacing": {context: "0.5px"},
                }
            },
            "meta": {"font_id": req.font_id},
        },
    )
