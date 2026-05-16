import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from python_backend.main import app
from python_backend.services.font_engine.generator.font_assembler import FontAssembler, FontMetadata
from python_backend.services.font_engine.generator.glyph_builder import GlyphBuilder
from python_backend.services.font_engine.generator.metrics_engine import FontMetrics


client = TestClient(app)


def _build_test_ttf() -> bytes:
    assembler = FontAssembler(
        metrics=FontMetrics.preset_latin(),
        metadata=FontMetadata(family_name="ImportFixture", style_name="Regular", version="1.0"),
    )
    assembler.add_glyph(GlyphBuilder.space())
    assembler.add_glyph(GlyphBuilder.letter_I())
    assembler.add_glyph(GlyphBuilder.letter_O())
    return assembler.build_ttf()


def test_import_ttf_returns_glyphs_metadata_and_metrics():
    response = client.post(
        "/api/fonts/import",
        files={"file": ("ImportFixture.ttf", _build_test_ttf(), "font/ttf")},
    )

    assert response.status_code == 200, response.text
    body = response.json()

    assert body["metadata"]["family"] == "ImportFixture"
    assert body["metadata"]["style"] == "Regular"
    assert body["metrics"]["unitsPerEm"] == 1000
    assert len(body["glyphs"]) >= 2

    glyph = next(item for item in body["glyphs"] if item["unicode"] == 73)
    assert glyph["name"] == "I"
    assert glyph["metrics"]["advance_width"] > 0
    assert len(glyph["contours"]) == 1
    assert len(glyph["contours"][0]["points"]) == len(glyph["contours"][0]["flags"])


def test_import_ttf_honors_unicode_override():
    response = client.post(
        "/api/fonts/import",
        data={"unicodes": "0x49,0x4F"},
        files={"file": ("ImportFixture.ttf", _build_test_ttf(), "font/ttf")},
    )

    assert response.status_code == 200, response.text
    unicodes = [glyph["unicode"] for glyph in response.json()["glyphs"]]
    assert unicodes == [73, 79]


def test_import_ttf_honors_max_glyphs_for_all_preset():
    response = client.post(
        "/api/fonts/import",
        data={"preset": "all", "max_glyphs": "1"},
        files={"file": ("ImportFixture.ttf", _build_test_ttf(), "font/ttf")},
    )

    assert response.status_code == 200, response.text
    assert len(response.json()["glyphs"]) == 1


def test_import_ttf_rejects_invalid_font_file():
    response = client.post(
        "/api/fonts/import",
        files={"file": ("broken.ttf", b"not-a-font", "font/ttf")},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["location"] == "file"
