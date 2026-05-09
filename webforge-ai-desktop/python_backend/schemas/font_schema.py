"""
schemas/font_schema.py
──────────────────────
フォント生成・変換 API の Pydantic モデル定義。

FastAPI はこれを使って:
  - リクエストボディのバリデーション
  - OpenAPI ドキュメントの自動生成
  - レスポンスの JSON シリアライズ
を行う。
"""

from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


# ──────────────────────────────────────────────
# 共通 Enum
# ──────────────────────────────────────────────

class CapStyleEnum(str, Enum):
    butt   = "butt"
    round  = "round"
    square = "square"


class JoinStyleEnum(str, Enum):
    miter = "miter"
    round = "round"
    bevel = "bevel"


class FontOutputFormat(str, Enum):
    ttf   = "ttf"
    woff2 = "woff2"


class PreviewType(str, Enum):
    sample     = "sample"
    grid       = "grid"
    sizes      = "sizes"
    weights    = "weights"


# ──────────────────────────────────────────────
# POST /fonts/generate
# ──────────────────────────────────────────────

class FontMetricsInput(BaseModel):
    """FontMetrics の API 入力表現。省略時はプリセットを使用。"""
    upm:         int   = Field(1000,  ge=16,    le=16384, description="Units Per eM")
    ascender:    int   = Field(800,   ge=1,     le=16384)
    descender:   int   = Field(-200,  le=-1)
    cap_height:  int   = Field(700,   ge=1,     le=16384)
    x_height:    int   = Field(520,   ge=1,     le=16384)
    line_gap:    int   = Field(0,     ge=0)

    @field_validator("descender")
    @classmethod
    def descender_must_be_negative(cls, v: int) -> int:
        if v >= 0:
            raise ValueError("descender は負の値にしてください")
        return v


class StrokeParams(BaseModel):
    """ストロークエンジンのパラメーター。"""
    weight:     float        = Field(80.0,  gt=0,  le=2000, description="ストローク幅（em単位）")
    cap_style:  CapStyleEnum = Field(CapStyleEnum.round)
    join_style: JoinStyleEnum = Field(JoinStyleEnum.round)


class GlyphRequest(BaseModel):
    """
    1グリフの生成リクエスト。
    shape="rect" | "circle" | "stroke" | "preset:{name}" で形状を指定する。
    """
    name:          str            = Field(..., min_length=1, max_length=64,
                                          description="グリフ名 例: 'A', 'uni3042'")
    unicode:       Optional[int]  = Field(None, ge=0, le=0x10FFFF,
                                          description="Unicodeコードポイント (16進数も可)")
    shape:         str            = Field("preset:space",
                                          description="形状種別: rect/circle/stroke/preset:O など")
    advance_width: Optional[int]  = Field(None, ge=1, le=32768)
    lsb:           int            = Field(0,    ge=0)
    stroke:        Optional[StrokeParams] = None

    # shape の簡易バリデーション
    @field_validator("shape")
    @classmethod
    def shape_valid(cls, v: str) -> str:
        allowed_prefixes = ("rect", "circle", "stroke", "preset:")
        if not any(v.startswith(p) for p in allowed_prefixes):
            raise ValueError(
                f"shape は {allowed_prefixes} のいずれかで始まる値を指定してください"
            )
        return v


class FontMetadataInput(BaseModel):
    family_name: str = Field("WebForge Font", min_length=1, max_length=64)
    style_name:  str = Field("Regular",       min_length=1, max_length=32)
    version:     str = Field("1.0",           max_length=16)
    copyright:   str = Field("",              max_length=256)
    designer:    str = Field("",              max_length=128)
    description: str = Field("",              max_length=512)
    url:         str = Field("",              max_length=256)


class GenerateFontRequest(BaseModel):
    """POST /fonts/generate のリクエストボディ。"""
    metadata:      FontMetadataInput          = Field(default_factory=FontMetadataInput)
    metrics:       Optional[FontMetricsInput] = None   # None でプリセット (latin)
    glyphs:        list[GlyphRequest]         = Field(..., min_length=1, max_length=512)
    output_format: FontOutputFormat           = FontOutputFormat.woff2
    include_kerning: bool                     = Field(True,
                                                      description="latin プリセットのカーニングを含めるか")

    model_config = {"json_schema_extra": {"example": {
        "metadata": {"family_name": "MyFont", "style_name": "Regular"},
        "glyphs": [
            {"name": ".space", "unicode": 32,  "shape": "preset:space"},
            {"name": "O",      "unicode": 79,  "shape": "preset:O"},
            {"name": "I",      "unicode": 73,  "shape": "preset:I"},
        ],
        "output_format": "woff2",
    }}}


class GenerateFontResponse(BaseModel):
    """POST /fonts/generate のレスポンス。"""
    font_id:        str   = Field(..., description="生成フォントの一時ID（プレビュー等に使う）")
    family_name:    str
    style_name:     str
    glyph_count:    int
    output_format:  str
    file_size_bytes: int
    font_face_css:  str   = Field(..., description="@font-face CSS（base64埋め込み）")
    data_url:       str   = Field(..., description="data: URL（フロントで直接使用可）")


# ──────────────────────────────────────────────
# POST /fonts/subset
# ──────────────────────────────────────────────

class SubsetRequest(BaseModel):
    """POST /fonts/subset のリクエストボディ。"""
    font_id:         Optional[str] = Field(None,
                                           description="generate で得た font_id（これか file_b64 のどちらか）")
    file_b64:        Optional[str] = Field(None,
                                           description="TTF/OTF の Base64（font_id がない場合）")
    text:            Optional[str] = Field(None, max_length=10000,
                                           description="含める文字列")
    unicodes:        Optional[list[int]] = Field(None,
                                                  description="含めるコードポイントのリスト")
    preset:          Optional[str] = Field(None,
                                           description="landing_jp / landing_en")
    output_format:   FontOutputFormat = FontOutputFormat.woff2
    hinting:         bool = False

    @field_validator("preset")
    @classmethod
    def preset_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("landing_jp", "landing_en"):
            raise ValueError("preset は 'landing_jp' か 'landing_en' を指定してください")
        return v

    def has_content(self) -> bool:
        """テキスト・unicodes・preset のいずれかが指定されているか。"""
        return bool(self.text or self.unicodes or self.preset)


class SubsetResponse(BaseModel):
    """POST /fonts/subset のレスポンス。"""
    font_id:              str
    original_glyph_count: int
    subset_glyph_count:   int
    original_size_bytes:  int
    subset_size_bytes:    int
    reduction_percent:    str
    font_face_css:        str
    data_url:             str


# ──────────────────────────────────────────────
# POST /fonts/convert
# ──────────────────────────────────────────────

class ConvertRequest(BaseModel):
    """POST /fonts/convert のリクエストボディ。"""
    font_id:       Optional[str] = None
    file_b64:      Optional[str] = None
    family_name:   str           = Field("Converted Font", min_length=1)
    style_name:    str           = Field("Regular",        min_length=1)
    weight:        int           = Field(0, ge=0, le=1000,
                                        description="0=style_name から自動推定")
    output_format: FontOutputFormat = FontOutputFormat.woff2


class ConvertResponse(BaseModel):
    """POST /fonts/convert のレスポンス。"""
    font_id:              str
    family_name:          str
    style_name:           str
    weight:               int
    original_size_bytes:  int
    converted_size_bytes: int
    reduction_percent:    str
    font_face_css:        str
    data_url:             str


# ──────────────────────────────────────────────
# GET /fonts/preview/{id}
# ──────────────────────────────────────────────

class PreviewParams(BaseModel):
    """GET /fonts/preview/{id} のクエリパラメーター。"""
    type:        PreviewType = PreviewType.sample
    text:        str         = Field("Aa Bb 123", max_length=200)
    width:       int         = Field(800,  ge=100, le=2400)
    height:      int         = Field(200,  ge=50,  le=1200)
    font_size:   int         = Field(80,   ge=8,   le=400)
    columns:     int         = Field(16,   ge=4,   le=64,
                                     description="グリフグリッドの列数")


# ──────────────────────────────────────────────
# 共通エラーレスポンス
# ──────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
    code:   Optional[str] = None