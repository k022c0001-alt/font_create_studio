"""
glyph_builder.py
────────────────
グリフをプログラムで組み立てるための最小ビルダー。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .curve_engine import Contour, CurveEngine
from .metrics_engine import FontMetrics, GlyphMetrics
from .stroke_engine import CapStyle, JoinStyle, StrokeEngine, StrokePath


@dataclass
class GlyphData:
    name: str
    unicode: Optional[int]
    contours: list[Contour] = field(default_factory=list)
    metrics: GlyphMetrics = field(default_factory=GlyphMetrics)

    @property
    def is_empty(self) -> bool:
        return len(self.contours) == 0


class GlyphBuilder:
    def __init__(
        self,
        name: str,
        unicode: Optional[int] = None,
        font_metrics: Optional[FontMetrics] = None,
    ) -> None:
        self._name = name
        self._unicode = unicode
        self._fm = font_metrics or FontMetrics.preset_latin()
        self._metrics = GlyphMetrics(advance_width=round(self._fm.cap_height * 0.7), lsb=40)
        self._contours: list[Contour] = []
        self._stroke_weight = 80.0
        self._cap = CapStyle.ROUND
        self._join = JoinStyle.ROUND

    def set_advance(self, width: int, lsb: int = 0) -> "GlyphBuilder":
        self._metrics.advance_width = width
        self._metrics.lsb = lsb
        return self

    def set_advance_auto(self) -> "GlyphBuilder":
        if self._name == ".space":
            aw = round(self._fm.upm * 0.25)
            lsb = 0
        elif self._name in {"I", "l", "i"}:
            aw = round(self._fm.cap_height * 0.42)
            lsb = round(aw * 0.15)
        else:
            aw = round(self._fm.cap_height * 0.78)
            lsb = round(aw * 0.10)
        return self.set_advance(aw, lsb)

    def draw_rect(self, x: float, y: float, w: float, h: float) -> "GlyphBuilder":
        self._contours.append(CurveEngine.rectangle(x, y, w, h))
        return self

    def draw_circle(self, cx: float, cy: float, r: float) -> "GlyphBuilder":
        self._contours.append(CurveEngine.circle(cx, cy, r))
        return self

    def stroke_weight(self, weight: float) -> "GlyphBuilder":
        self._stroke_weight = weight
        return self

    def stroke_style(self, cap: CapStyle = CapStyle.ROUND, join: JoinStyle = JoinStyle.ROUND) -> "GlyphBuilder":
        self._cap = cap
        self._join = join
        return self

    def draw_stroke(self, path: StrokePath) -> "GlyphBuilder":
        engine = StrokeEngine(weight=self._stroke_weight, cap=self._cap, join=self._join)
        contour = engine.expand_to_single_contour(path)
        self._contours.append(contour)
        return self

    def build(self) -> GlyphData:
        return GlyphData(
            name=self._name,
            unicode=self._unicode,
            contours=list(self._contours),
            metrics=self._metrics,
        )

    @classmethod
    def space(cls, font_metrics: Optional[FontMetrics] = None) -> GlyphData:
        fm = font_metrics or FontMetrics.preset_latin()
        return cls(name=".space", unicode=0x20, font_metrics=fm).set_advance(round(fm.upm * 0.25), 0).build()

    @classmethod
    def period(cls, font_metrics: Optional[FontMetrics] = None) -> GlyphData:
        fm = font_metrics or FontMetrics.preset_latin()
        b = cls(name="period", unicode=0x2E, font_metrics=fm).set_advance(round(fm.cap_height * 0.42), 30)
        r = max(22, round(fm.x_height * 0.10))
        b.draw_circle(b._metrics.advance_width // 2, r + 10, r)
        return b.build()

    @classmethod
    def letter_I(cls, font_metrics: Optional[FontMetrics] = None) -> GlyphData:
        fm = font_metrics or FontMetrics.preset_latin()
        b = cls(name="I", unicode=0x49, font_metrics=fm).set_advance(round(fm.cap_height * 0.42), 35)
        stem_w = max(60, round(fm.cap_height * 0.14))
        stem_x = (b._metrics.advance_width - stem_w) / 2
        b.draw_rect(stem_x, 0, stem_w, fm.cap_height)
        return b.build()

    @classmethod
    def letter_O(cls, font_metrics: Optional[FontMetrics] = None) -> GlyphData:
        fm = font_metrics or FontMetrics.preset_latin()
        b = cls(name="O", unicode=0x4F, font_metrics=fm).set_advance(round(fm.cap_height * 0.84), 45)
        aw = b._metrics.advance_width
        cx = aw / 2
        cy = fm.cap_height / 2
        outer_r = min(aw / 2 - 20, fm.cap_height / 2)
        inner_r = max(outer_r * 0.55, 40)

        outer = CurveEngine.circle(cx, cy, outer_r)
        inner = CurveEngine.circle(cx, cy, inner_r)
        inner.points = list(reversed(inner.points))
        inner.flags = list(reversed(inner.flags))

        b._contours.extend([outer, inner])
        return b.build()
