"""
font_engine.generator
─────────────────────
ゼロからフォントを設計・生成するエンジン。

層の役割:
  generator/  … グリフ設計・パス操作・TTF組み立て（設計領域）
  pipeline/   … 既存フォントの加工・軽量化・変換（変換領域）

Public API（外から使うのはこれだけ）:
  from font_engine.generator import FontAssembler, GlyphBuilder
"""

from .font_assembler import FontAssembler
from .glyph_builder import GlyphBuilder

__all__ = ["FontAssembler", "GlyphBuilder"]