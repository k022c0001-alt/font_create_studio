"""
api/routes_font_generator.py
─────────────────────────────
フォント生成・変換・プレビューの FastAPI ルーター。

エンドポイント:
  POST /fonts/generate      … GlyphBuilder + FontAssembler で TTF/WOFF2 を生成
  POST /fonts/subset        … SubsetExporter でサブセット化
  POST /fonts/convert       … Woff2Converter で TTF → WOFF2 変換
  GET  /fonts/preview/{id}  … PreviewRenderer でプレビュー PNG を返す

設計方針:
  - ルーターは薄く保つ（バリデーション + サービス呼び出しのみ）
  - ビジネスロジックはすべて services/font_engine/ に閉じ込める
  - エラーは HTTPException に変換して返す
  - 生成済みフォントは FontCache に一時保存して font_id で参照
"""

from __future__ import annotations
import base64
import io
import sys
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, JSONResponse

# パス解決（プロジェクトルートから実行されることを想定）
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from python_backend.schemas.font_schema import (
    GenerateFontRequest, GenerateFontResponse,
    SubsetRequest,       SubsetResponse,
    ConvertRequest,      ConvertResponse,
    PreviewParams,       PreviewType,
    FontOutputFormat,
    ErrorResponse,
)
from python_backend.core.font_cache import FontCache

# ── generator ──
from python_backend.services.font_engine.generator.metrics_engine import FontMetrics
from python_backend.services.font_engine.generator.glyph_builder  import GlyphBuilder
from python_backend.services.font_engine.generator.font_assembler  import FontAssembler, FontMetadata
from python_backend.services.font_engine.generator.kerning_engine  import KerningEngine
from python_backend.services.font_engine.generator.stroke_engine   import StrokePath, CapStyle, JoinStyle

# ── pipeline ──
from python_backend.services.font_engine.pipeline.font_loader      import FontLoader
from python_backend.services.font_engine.pipeline.subset_exporter  import SubsetExporter, SubsetConfig
from python_backend.services.font_engine.pipeline.woff2_converter  import Woff2Converter
from python_backend.services.font_engine.pipeline.preview_renderer import PreviewRenderer, PreviewConfig


router = APIRouter(prefix="/fonts", tags=["fonts"])
cache  = FontCache.instance()


# ══════════════════════════════════════════════════════════════════════
# POST /fonts/generate
# ══════════════════════════════════════════════════════════════════════

@router.post(
    "/generate",
    response_model=GenerateFontResponse,
    summary="フォントをゼロから生成する",
    description="""
GlyphBuilder でグリフを構築し、FontAssembler で TTF/WOFF2 として出力する。
生成したフォントは font_id で一時保存され、preview・subset・convert で再利用できる。
    """,
)
async def generate_font(req: GenerateFontRequest) -> GenerateFontResponse:

    # ── 1. FontMetrics を組み立て ──────────────────────────────────────
    if req.metrics:
        m = req.metrics
        fm = FontMetrics(
            upm=m.upm,
            ascender=m.ascender,
            descender=m.descender,
            cap_height=m.cap_height,
            x_height=m.x_height,
            line_gap=m.line_gap,
        )
    else:
        fm = FontMetrics.preset_latin()

    # ── 2. グリフを構築 ────────────────────────────────────────────────
    glyph_data_list = []
    for g in req.glyphs:
        try:
            gd = _build_glyph(g.name, g.unicode, g.shape, g.advance_width, g.lsb, g.stroke, fm)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=f"グリフ {g.name!r}: {e}")
        glyph_data_list.append(gd)

    # ── 3. FontAssembler で組み立て ────────────────────────────────────
    meta = FontMetadata(
        family_name=req.metadata.family_name,
        style_name=req.metadata.style_name,
        version=req.metadata.version,
        copyright=req.metadata.copyright,
        designer=req.metadata.designer,
        description=req.metadata.description,
        url=req.metadata.url,
    )
    kerning = KerningEngine.latin_preset(fm.upm) if req.include_kerning else None

    try:
        assembler = FontAssembler(metrics=fm, metadata=meta, kerning=kerning)
        assembler.add_glyphs(glyph_data_list)
        ttf_bytes = assembler.build_ttf()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"フォント組み立てエラー: {e}")

    # ── 4. フォーマット変換 ────────────────────────────────────────────
    converter = Woff2Converter()
    if req.output_format == FontOutputFormat.woff2:
        try:
            result = converter.convert_bytes(
                ttf_bytes,
                req.metadata.family_name,
                req.metadata.style_name,
            )
            output_bytes = result.woff2_bytes
            is_woff2 = True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WOFF2 変換エラー: {e}")
    else:
        output_bytes = ttf_bytes
        is_woff2 = False

    # ── 5. キャッシュに保存 ────────────────────────────────────────────
    font_id = cache.put(
        output_bytes,
        req.metadata.family_name,
        req.metadata.style_name,
        is_woff2=is_woff2,
    )

    # ── 6. @font-face CSS & data URL を生成 ───────────────────────────
    woff2_result = converter.convert_bytes(
        ttf_bytes,
        req.metadata.family_name,
        req.metadata.style_name,
    )
    data_url  = woff2_result.to_data_url()
    css       = woff2_result.to_font_face_css(src_type="base64")

    return GenerateFontResponse(
        font_id=font_id,
        family_name=req.metadata.family_name,
        style_name=req.metadata.style_name,
        glyph_count=len(glyph_data_list),
        output_format=req.output_format.value,
        file_size_bytes=len(output_bytes),
        font_face_css=css,
        data_url=data_url,
    )


# ══════════════════════════════════════════════════════════════════════
# POST /fonts/subset
# ══════════════════════════════════════════════════════════════════════

@router.post(
    "/subset",
    response_model=SubsetResponse,
    summary="フォントをサブセット化する",
    description="""
font_id（generate済み）または file_b64（Base64 TTF）を受け取り、
指定した文字・Unicodeレンジに絞ったフォントを返す。
    """,
)
async def subset_font(req: SubsetRequest) -> SubsetResponse:

    # ── 1. 入力フォント取得 ────────────────────────────────────────────
    font_bytes = _resolve_font_bytes(req.font_id, req.file_b64)

    # ── 2. サブセット設定を組み立て ────────────────────────────────────
    if not req.has_content():
        raise HTTPException(
            status_code=422,
            detail="text / unicodes / preset のいずれかを指定してください",
        )

    if req.preset == "landing_jp":
        config = SubsetConfig.preset_landing_jp()
        if req.text:
            config.text = req.text
    elif req.preset == "landing_en":
        config = SubsetConfig.preset_landing_en()
        if req.text:
            config.text = req.text
    else:
        config = SubsetConfig(
            text=req.text or "",
            unicodes=set(req.unicodes or []),
            hinting=req.hinting,
        )

    # ── 3. サブセット実行 ──────────────────────────────────────────────
    loader   = FontLoader()
    exporter = SubsetExporter()

    try:
        loaded = loader.load_bytes(font_bytes)
        result = exporter.subset(loaded, config)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"サブセットエラー: {e}")

    subset_bytes = result.to_bytes()

    # ── 4. WOFF2 変換（指定時）─────────────────────────────────────────
    converter = Woff2Converter()
    if req.output_format == FontOutputFormat.woff2:
        try:
            woff2 = converter.convert_bytes(
                subset_bytes, loaded.family_name, loaded.style_name
            )
            output_bytes = woff2.woff2_bytes
            is_woff2     = True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WOFF2 変換エラー: {e}")
    else:
        output_bytes = subset_bytes
        is_woff2     = False

    # ── 5. キャッシュ & レスポンス ──────────────────────────────────────
    font_id = cache.put(output_bytes, loaded.family_name, loaded.style_name, is_woff2)

    woff2_for_css = converter.convert_bytes(
        subset_bytes, loaded.family_name, loaded.style_name
    )
    css      = woff2_for_css.to_font_face_css(src_type="base64")
    data_url = woff2_for_css.to_data_url()

    return SubsetResponse(
        font_id=font_id,
        original_glyph_count=result.original_glyph_count,
        subset_glyph_count=result.subset_glyph_count,
        original_size_bytes=result.original_size_bytes,
        subset_size_bytes=len(output_bytes),
        reduction_percent=result.reduction_percent,
        font_face_css=css,
        data_url=data_url,
    )


# ══════════════════════════════════════════════════════════════════════
# POST /fonts/convert
# ══════════════════════════════════════════════════════════════════════

@router.post(
    "/convert",
    response_model=ConvertResponse,
    summary="フォントを WOFF2 に変換する",
    description="""
font_id または file_b64 で受け取った TTF/OTF を WOFF2 に変換する。
@font-face CSS と data URL を返すので、フロントでそのまま使える。
    """,
)
async def convert_font(req: ConvertRequest) -> ConvertResponse:

    # ── 1. 入力フォント取得 ────────────────────────────────────────────
    font_bytes    = _resolve_font_bytes(req.font_id, req.file_b64)
    original_size = len(font_bytes)

    # ── 2. 変換 ────────────────────────────────────────────────────────
    converter = Woff2Converter()
    try:
        result = converter.convert_bytes(
            font_bytes,
            req.family_name,
            req.style_name,
            weight=req.weight,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"変換エラー: {e}")

    # ── 3. キャッシュ & レスポンス ──────────────────────────────────────
    font_id = cache.put(
        result.woff2_bytes,
        result.family_name,
        result.style_name,
        is_woff2=True,
    )

    return ConvertResponse(
        font_id=font_id,
        family_name=result.family_name,
        style_name=result.style_name,
        weight=result.weight,
        original_size_bytes=original_size,
        converted_size_bytes=result.size,
        reduction_percent=result.reduction_percent,
        font_face_css=result.to_font_face_css(src_type="base64"),
        data_url=result.to_data_url(),
    )


# ══════════════════════════════════════════════════════════════════════
# GET /fonts/preview/{id}
# ══════════════════════════════════════════════════════════════════════

@router.get(
    "/preview/{font_id}",
    response_class=Response,
    summary="フォントのプレビュー PNG を返す",
    description="""
font_id に対応するフォントのプレビュー画像（PNG）を返す。
type クエリで sample / grid / sizes / weights を選択できる。
    """,
    responses={
        200: {"content": {"image/png": {}}, "description": "PNG プレビュー画像"},
        404: {"model": ErrorResponse, "description": "font_id が見つからない"},
    },
)
async def preview_font(
    font_id:   str,
    type:      PreviewType = Query(PreviewType.sample,  description="プレビュー種別"),
    text:      str         = Query("Aa Bb 123",         description="サンプルテキスト"),
    width:     int         = Query(800,  ge=100, le=2400),
    height:    int         = Query(200,  ge=50,  le=1200),
    font_size: int         = Query(80,   ge=8,   le=400),
    columns:   int         = Query(16,   ge=4,   le=64),
) -> Response:

    # ── 1. キャッシュから取得 ──────────────────────────────────────────
    entry = cache.get(font_id)
    if entry is None:
        raise HTTPException(
            status_code=404,
            detail=f"font_id {font_id!r} が見つかりません（有効期限切れか未生成）",
        )

    # ── 2. フォント読み込み ────────────────────────────────────────────
    loader = FontLoader()
    try:
        # WOFF2 は TTF に戻してから PIL で読む
        font_bytes = _ensure_ttf(entry.font_bytes, entry.is_woff2)
        loaded     = loader.load_bytes(font_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"フォント読み込みエラー: {e}")

    # ── 3. プレビュー生成 ──────────────────────────────────────────────
    renderer = PreviewRenderer()
    cfg      = PreviewConfig(
        width=width, height=height,
        font_size=font_size,
        sample_text=text,
    )

    try:
        if type == PreviewType.sample:
            result = renderer.render_sample(loaded, cfg)

        elif type == PreviewType.grid:
            result = renderer.render_glyph_grid(loaded, columns=columns)

        elif type == PreviewType.sizes:
            result = renderer.render_size_comparison(
                loaded,
                sizes=[12, 18, 24, 36, 48, 72, 96],
                text=text,
            )

        elif type == PreviewType.weights:
            result = renderer.render_weight_comparison(loaded, text=text)

        else:
            result = renderer.render_sample(loaded, cfg)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"プレビュー生成エラー: {e}")

    # ── 4. PNG として返す ──────────────────────────────────────────────
    return Response(
        content=result.to_bytes(),
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=60",
            "X-Font-Family":  entry.family_name,
            "X-Font-Style":   entry.style_name,
        },
    )


# ══════════════════════════════════════════════════════════════════════
# GET /fonts/cache/stats  （デバッグ用）
# ══════════════════════════════════════════════════════════════════════

@router.get(
    "/cache/stats",
    summary="キャッシュの統計情報を返す（デバッグ用）",
    include_in_schema=False,   # OpenAPI ドキュメントには非表示
)
async def cache_stats() -> dict:
    return cache.stats()


@router.delete(
    "/cache/{font_id}",
    summary="キャッシュから指定フォントを削除する",
    include_in_schema=False,
)
async def delete_cache_entry(font_id: str) -> dict:
    deleted = cache.delete(font_id)
    return {"deleted": deleted, "font_id": font_id}


# ══════════════════════════════════════════════════════════════════════
# 内部ユーティリティ
# ══════════════════════════════════════════════════════════════════════

def _resolve_font_bytes(
    font_id: Optional[str],
    file_b64: Optional[str],
) -> bytes:
    """
    font_id または file_b64 からフォントの bytes を取得する。
    どちらも指定されていない場合は 422 を返す。
    """
    if font_id:
        entry = cache.get(font_id)
        if entry is None:
            raise HTTPException(
                status_code=404,
                detail=f"font_id {font_id!r} が見つかりません",
            )
        return entry.font_bytes

    if file_b64:
        try:
            return base64.b64decode(file_b64)
        except Exception:
            raise HTTPException(
                status_code=422,
                detail="file_b64 が正しい Base64 文字列ではありません",
            )

    raise HTTPException(
        status_code=422,
        detail="font_id か file_b64 のどちらかを指定してください",
    )


def _ensure_ttf(font_bytes: bytes, is_woff2: bool) -> bytes:
    """
    WOFF2 フォントを TTF に戻す。
    PIL (PreviewRenderer) は TTF しか読めないため。
    TTF はそのまま返す。
    """
    if not is_woff2:
        return font_bytes

    from fontTools.ttLib.woff2 import decompress as woff2_decompress
    in_buf  = io.BytesIO(font_bytes)
    out_buf = io.BytesIO()
    woff2_decompress(in_buf, out_buf)
    return out_buf.getvalue()


def _build_glyph(
    name:          str,
    unicode_val:   Optional[int],
    shape:         str,
    advance_width: Optional[int],
    lsb:           int,
    stroke_params,          # StrokeParams | None
    fm:            FontMetrics,
):
    """
    shape 文字列から GlyphBuilder でグリフを構築する。

    shape の書式:
      "preset:space"   … GlyphBuilder.space()
      "preset:O"       … GlyphBuilder.letter_O()
      "preset:I"       … GlyphBuilder.letter_I()
      "preset:period"  … GlyphBuilder.period()
      "rect"           … 矩形（advance_width 幅・cap_height 高さ）
      "circle"         … 円（cap_height の半径）
      "stroke"         … 水平ストローク（stroke_params が必要）
    """
    # ── プリセット ──
    if shape.startswith("preset:"):
        preset_name = shape[len("preset:"):]
        preset_map = {
            "space":  lambda: GlyphBuilder.space(fm),
            "O":      lambda: GlyphBuilder.letter_O(fm),
            "I":      lambda: GlyphBuilder.letter_I(fm),
            "period": lambda: GlyphBuilder.period(fm),
        }
        if preset_name not in preset_map:
            raise ValueError(
                f"preset:{preset_name} は未定義です。"
                f"利用可能: {list(preset_map.keys())}"
            )
        return preset_map[preset_name]()

    # ── カスタム形状 ──
    builder = GlyphBuilder(name, unicode=unicode_val, font_metrics=fm)

    if advance_width:
        builder.set_advance(advance_width, lsb=lsb)
    else:
        builder.set_advance_auto()

    aw = builder._metrics.advance_width

    if shape == "rect":
        builder.draw_rect(lsb, 0, aw - lsb * 2, fm.cap_height)

    elif shape == "circle":
        r  = min(aw // 2, fm.cap_height // 2) - 10
        cx = aw // 2
        cy = fm.cap_height // 2
        builder.draw_circle(cx, cy, r)

    elif shape == "stroke":
        weight = stroke_params.weight if stroke_params else 80.0
        cap    = CapStyle(stroke_params.cap_style.value)  if stroke_params else CapStyle.ROUND
        join   = JoinStyle(stroke_params.join_style.value) if stroke_params else JoinStyle.ROUND
        builder.stroke_weight(weight).stroke_style(cap=cap, join=join)
        path = StrokePath().add_point(lsb, 0).add_point(aw - lsb, 0)
        builder.draw_stroke(path)

    else:
        raise ValueError(f"未知の shape: {shape!r}")

    return builder.build()

    return builder.build()
