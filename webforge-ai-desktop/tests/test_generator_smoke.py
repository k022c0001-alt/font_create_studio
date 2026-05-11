import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from python_backend.services.font_engine.generator.glyph_builder import GlyphBuilder, GlyphData
from python_backend.services.font_engine.generator.kerning_engine import KerningEngine
from python_backend.services.font_engine.generator.font_assembler import FontAssembler, FontMetadata
from python_backend.services.font_engine.generator.metrics_engine import FontMetrics


def test_glyph_builder_letter_o():
    glyph = GlyphBuilder.letter_O()
    assert isinstance(glyph, GlyphData)


def test_kerning_engine_preset():
    pairs = KerningEngine.latin_preset().export_flat_pairs()
    assert len(pairs) > 0


def test_font_assembler_build():
    assembler = FontAssembler(
        metrics=FontMetrics.preset_latin(),
        metadata=FontMetadata(family_name="SmokeTest", style_name="Regular"),
    )
    assembler.add_glyph(GlyphBuilder.letter_O())

    try:
        out = assembler.build_ttf()
    except ImportError:
        pytest.skip("fonttools is not installed")

    assert isinstance(out, bytes)
