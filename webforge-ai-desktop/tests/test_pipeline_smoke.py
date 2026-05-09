"""
test_pipeline_smoke.py
──────────────────────
pipeline/ の各モジュールが正しく動くかを確認するスモークテスト。

前提: /tmp/test_font.ttf が存在すること。
     tests/conftest.py で自動生成する。

pytest で実行:
  cd /home/claude
  python -m pytest tests/test_pipeline_smoke.py -v
"""

import sys
import os
import io
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ── テスト用 TTF をその場で生成（外部ファイル依存なし）──────────────────
def _make_test_ttf() -> bytes:
    from python_backend.services.font_engine.generator.glyph_builder import GlyphBuilder
    from python_backend.services.font_engine.generator.font_assembler import FontAssembler, FontMetadata
    from python_backend.services.font_engine.generator.metrics_engine import FontMetrics

    fm = FontMetrics.preset_latin()
    asm = FontAssembler(
        metrics=fm,
        metadata=FontMetadata(family_name="PipelineTest", style_name="Regular"),
    )
    asm.add_glyph(GlyphBuilder.space())
    asm.add_glyph(GlyphBuilder.letter_O())
    asm.add_glyph(GlyphBuilder.letter_I())
    asm.add_glyph(GlyphBuilder.period())
    return asm.build_ttf()


TEST_TTF_BYTES: bytes = _make_test_ttf()
TEST_TTF_PATH = Path("/tmp/pipeline_test_font.ttf")
TEST_TTF_PATH.write_bytes(TEST_TTF_BYTES)

# ── imports ──────────────────────────────────────────────────────────────
from python_backend.services.font_engine.pipeline.font_loader import (
    FontLoader, LoadedFont, AxisInfo,
)
from python_backend.services.font_engine.pipeline.subset_exporter import (
    SubsetExporter, SubsetConfig, SubsetResult, UnicodeRange,
)
from python_backend.services.font_engine.pipeline.woff2_converter import (
    Woff2Converter, Woff2Result,
)
from python_backend.services.font_engine.pipeline.preview_renderer import (
    PreviewRenderer, PreviewConfig, PreviewResult,
)
from python_backend.services.font_engine.generator.glyph_builder import GlyphData
from python_backend.services.font_engine.generator.glyph_modifier import GlyphModifier


# ══════════════════════════════════════════════
# font_loader
# ══════════════════════════════════════════════

class TestFontLoader:

    def setup_method(self):
        self.loader = FontLoader()
        self.loaded = self.loader.load(TEST_TTF_PATH)

    # ── load ──────────────────────────────────
    def test_load_from_path(self):
        assert isinstance(self.loaded, LoadedFont)

    def test_load_from_bytes(self):
        loaded = self.loader.load_bytes(TEST_TTF_BYTES, name="test.ttf")
        assert isinstance(loaded, LoadedFont)

    def test_load_nonexistent_raises(self):
        try:
            self.loader.load("/nonexistent/path.ttf")
            assert False, "例外が発生すべき"
        except FileNotFoundError:
            pass

    def test_load_wrong_extension_raises(self):
        try:
            self.loader.load("/tmp/not_a_font.txt")
            assert False, "例外が発生すべき"
        except (FileNotFoundError, ValueError):
            pass

    # ── メタ情報 ───────────────────────────────
    def test_family_name(self):
        assert self.loaded.family_name == "PipelineTest"

    def test_style_name(self):
        assert self.loaded.style_name == "Regular"

    def test_upm(self):
        assert self.loaded.upm == 1000

    def test_glyph_count(self):
        # .notdef + space + O + I + period = 5
        assert self.loaded.glyph_count == 5

    def test_unicode_count(self):
        # space, O, I, period = 4
        assert self.loaded.unicode_count == 4

    def test_is_not_variable(self):
        assert self.loaded.is_variable is False

    def test_axes_empty_for_static(self):
        assert self.loaded.axes == []

    def test_has_cjk_false(self):
        assert self.loaded.has_cjk is False

    def test_full_name(self):
        assert "PipelineTest" in self.loaded.full_name

    # ── font_metrics 変換 ───────────────────────
    def test_font_metrics_upm(self):
        fm = self.loaded.font_metrics
        assert fm.upm == 1000

    def test_font_metrics_ascender(self):
        fm = self.loaded.font_metrics
        assert fm.ascender > 0

    def test_font_metrics_descender(self):
        fm = self.loaded.font_metrics
        assert fm.descender < 0

    # ── glyph 抽出 ─────────────────────────────
    def test_extract_glyph_returns_glyph_data(self):
        g = self.loader.extract_glyph(self.loaded, "O")
        assert isinstance(g, GlyphData)

    def test_extract_glyph_name(self):
        g = self.loader.extract_glyph(self.loaded, "O")
        assert g.name == "O"

    def test_extract_glyph_unicode(self):
        g = self.loader.extract_glyph(self.loaded, "O")
        assert g.unicode == 0x4F

    def test_extract_glyph_has_contours(self):
        g = self.loader.extract_glyph(self.loaded, "O")
        # O は外輪郭 + カウンターの 2 輪郭
        assert len(g.contours) == 2

    def test_extract_glyph_advance_width(self):
        g = self.loader.extract_glyph(self.loaded, "O")
        assert g.metrics.advance_width > 0

    def test_extract_missing_glyph_returns_none(self):
        g = self.loader.extract_glyph(self.loaded, "nonexistent_xyz")
        assert g is None

    # ── generator との接続テスト ──────────────────
    def test_extracted_glyph_to_modifier(self):
        """extract_glyph → GlyphModifier → build() のパイプが通るか。"""
        g = self.loader.extract_glyph(self.loaded, "O")
        assert g is not None
        result = GlyphModifier(g).scale_uniform(1.5).round_coordinates().build()
        assert result.metrics.advance_width == round(g.metrics.advance_width * 1.5)

    def test_extracted_glyph_translate(self):
        g = self.loader.extract_glyph(self.loaded, "I")
        assert g is not None
        orig_x = g.contours[0].points[0].x
        result = GlyphModifier(g).translate(100, 0).build()
        new_x = result.contours[0].points[0].x
        assert abs(new_x - (orig_x + 100)) < 1e-6

    # ── iter_glyphs ───────────────────────────
    def test_iter_glyphs_count(self):
        glyphs = list(self.loader.iter_glyphs(self.loaded))
        assert len(glyphs) == self.loaded.glyph_count

    def test_iter_glyphs_limit(self):
        glyphs = list(self.loader.iter_glyphs(self.loaded, limit=2))
        assert len(glyphs) == 2

    def test_iter_glyphs_type(self):
        for g in self.loader.iter_glyphs(self.loaded):
            assert isinstance(g, GlyphData)


# ══════════════════════════════════════════════
# subset_exporter
# ══════════════════════════════════════════════

class TestSubsetExporter:

    def setup_method(self):
        self.loader = FontLoader()
        self.loaded = self.loader.load(TEST_TTF_PATH)
        self.exporter = SubsetExporter()

    # ── SubsetConfig ──────────────────────────
    def test_config_from_text(self):
        cfg = SubsetConfig.from_text("ABC")
        assert 0x41 in cfg.all_unicodes()
        assert 0x42 in cfg.all_unicodes()
        assert 0x43 in cfg.all_unicodes()

    def test_config_unicode_set(self):
        cfg = SubsetConfig(unicodes={0x4F, 0x49})
        assert cfg.all_unicodes() == {0x4F, 0x49}

    def test_config_text_and_unicode_merge(self):
        cfg = SubsetConfig(unicodes={0x41}, text="B")
        unis = cfg.all_unicodes()
        assert 0x41 in unis
        assert 0x42 in unis

    def test_config_empty_raises(self):
        try:
            self.exporter.subset(self.loaded, SubsetConfig())
            assert False, "例外が発生すべき"
        except ValueError:
            pass

    def test_preset_landing_en(self):
        cfg = SubsetConfig.preset_landing_en()
        assert len(cfg.all_unicodes()) > 50

    def test_preset_landing_jp(self):
        cfg = SubsetConfig.preset_landing_jp()
        unis = cfg.all_unicodes()
        # ひらがながあるか
        assert 0x3041 in unis

    # ── UnicodeRange ─────────────────────────
    def test_unicode_range_ascii(self):
        assert 0x41 in UnicodeRange.ASCII  # 'A'
        assert 0x20 in UnicodeRange.ASCII  # space

    def test_unicode_range_hiragana(self):
        assert 0x3041 in UnicodeRange.HIRAGANA  # 'ぁ'

    def test_unicode_range_kana_union(self):
        assert len(UnicodeRange.KANA) == len(UnicodeRange.HIRAGANA | UnicodeRange.KATAKANA)

    # ── subset 実行 ───────────────────────────
    def test_subset_by_text_returns_result(self):
        result = self.exporter.subset_by_text(self.loaded, "O")
        assert isinstance(result, SubsetResult)

    def test_subset_reduces_glyph_count(self):
        # 'O' だけに絞るとグリフ数が減る
        result = self.exporter.subset_by_text(self.loaded, "O")
        assert result.subset_glyph_count < result.original_glyph_count

    def test_subset_original_count_correct(self):
        result = self.exporter.subset_by_text(self.loaded, "O")
        assert result.original_glyph_count == self.loaded.glyph_count

    def test_subset_to_bytes(self):
        result = self.exporter.subset_by_text(self.loaded, "O")
        b = result.to_bytes()
        assert isinstance(b, bytes)
        assert len(b) > 0

    def test_subset_reduction_ratio(self):
        result = self.exporter.subset_by_text(self.loaded, "O")
        assert 0.0 <= result.reduction_ratio <= 1.0

    def test_subset_result_is_valid_font(self):
        """サブセット結果が fontTools で再読み込みできるか。"""
        from fontTools.ttLib import TTFont
        result = self.exporter.subset_by_text(self.loaded, "O")
        font = TTFont(io.BytesIO(result.to_bytes()))
        assert "cmap" in font

    def test_subset_does_not_mutate_original(self):
        """サブセット化が元の LoadedFont を変更しないか。"""
        original_count = self.loaded.glyph_count
        self.exporter.subset_by_text(self.loaded, "O")
        assert self.loaded.glyph_count == original_count

    def test_subset_save(self, tmp_path=None):
        import tempfile
        result = self.exporter.subset_by_text(self.loaded, "O")
        with tempfile.TemporaryDirectory() as tmpdir:
            out = Path(tmpdir) / "subset.ttf"
            saved = self.exporter.save(result, out)
            assert saved.exists()
            assert saved.stat().st_size > 0

    def test_subset_and_save(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            out = Path(tmpdir) / "subset.ttf"
            result = self.exporter.subset_and_save(
                self.loaded, SubsetConfig.from_text("O"), out
            )
            assert Path(out).exists()
            assert isinstance(result, SubsetResult)


# ══════════════════════════════════════════════
# woff2_converter
# ══════════════════════════════════════════════

class TestWoff2Converter:

    def setup_method(self):
        self.loader = FontLoader()
        self.loaded = self.loader.load(TEST_TTF_PATH)
        self.converter = Woff2Converter()

    def test_convert_returns_result(self):
        result = self.converter.convert(self.loaded)
        assert isinstance(result, Woff2Result)

    def test_woff2_bytes_non_empty(self):
        result = self.converter.convert(self.loaded)
        assert len(result.woff2_bytes) > 0

    def test_woff2_magic_bytes(self):
        """WOFF2 ファイルは 'wOF2' マジックバイトで始まる。"""
        result = self.converter.convert(self.loaded)
        assert result.woff2_bytes[:4] == b"wOF2"

    def test_family_name_preserved(self):
        result = self.converter.convert(self.loaded)
        assert result.family_name == "PipelineTest"

    def test_style_name_preserved(self):
        result = self.converter.convert(self.loaded)
        assert result.style_name == "Regular"

    def test_weight_detection(self):
        result = self.converter.convert(self.loaded)
        assert result.weight == 400  # Regular = 400

    def test_font_style_normal(self):
        result = self.converter.convert(self.loaded)
        assert result.style == "normal"

    def test_reduction_ratio(self):
        result = self.converter.convert(self.loaded)
        assert 0.0 <= result.reduction_ratio <= 1.0

    def test_size_property(self):
        result = self.converter.convert(self.loaded)
        assert result.size == len(result.woff2_bytes)

    def test_to_base64(self):
        result = self.converter.convert(self.loaded)
        b64 = result.to_base64()
        assert isinstance(b64, str)
        assert len(b64) > 0
        # base64 文字列として有効か
        import base64
        decoded = base64.b64decode(b64)
        assert decoded[:4] == b"wOF2"

    def test_to_data_url(self):
        result = self.converter.convert(self.loaded)
        url = result.to_data_url()
        assert url.startswith("data:font/woff2;base64,")

    def test_font_face_css_url(self):
        result = self.converter.convert(self.loaded)
        css = result.to_font_face_css(src_type="url", url="./fonts/test.woff2")
        assert "@font-face" in css
        assert "font-family: 'PipelineTest'" in css
        assert "./fonts/test.woff2" in css
        assert "font-display: swap" in css

    def test_font_face_css_base64(self):
        result = self.converter.convert(self.loaded)
        css = result.to_font_face_css(src_type="base64")
        assert "data:font/woff2;base64," in css

    def test_font_face_css_invalid_type(self):
        result = self.converter.convert(self.loaded)
        try:
            result.to_font_face_css(src_type="invalid")
            assert False, "例外が発生すべき"
        except ValueError:
            pass

    def test_convert_bytes(self):
        result = self.converter.convert_bytes(
            TEST_TTF_BYTES, "ByteTest", "Bold", weight=700
        )
        assert result.family_name == "ByteTest"
        assert result.weight == 700
        assert result.woff2_bytes[:4] == b"wOF2"

    def test_convert_woff2_passthrough(self):
        """既に WOFF2 のデータはそのまま返す。"""
        original = self.converter.convert(self.loaded)
        result = self.converter.convert_bytes(
            original.woff2_bytes, "PassThrough"
        )
        assert result.woff2_bytes == original.woff2_bytes

    def test_save(self):
        import tempfile
        result = self.converter.convert(self.loaded)
        with tempfile.TemporaryDirectory() as tmpdir:
            out = Path(tmpdir) / "test.woff2"
            saved = result.save(out)
            assert saved.exists()
            assert saved.read_bytes()[:4] == b"wOF2"

    def test_convert_and_save(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            result = self.converter.convert_and_save(self.loaded, tmpdir)
            assert isinstance(result, Woff2Result)
            saved_files = list(Path(tmpdir).glob("*.woff2"))
            assert len(saved_files) == 1

    def test_generate_font_face_bundle(self):
        r1 = self.converter.convert_bytes(TEST_TTF_BYTES, "MyFont", "Regular", 400)
        r2 = self.converter.convert_bytes(TEST_TTF_BYTES, "MyFont", "Bold", 700)
        css = self.converter.generate_font_face_bundle([r1, r2])
        assert css.count("@font-face") == 2
        assert "400" in css
        assert "700" in css

    def test_weight_detection_bold(self):
        result = self.converter.convert_bytes(TEST_TTF_BYTES, "X", "Bold")
        assert result.weight == 700

    def test_weight_detection_light(self):
        result = self.converter.convert_bytes(TEST_TTF_BYTES, "X", "Light")
        assert result.weight == 300

    def test_weight_detection_black(self):
        result = self.converter.convert_bytes(TEST_TTF_BYTES, "X", "Black")
        assert result.weight == 900


# ══════════════════════════════════════════════
# preview_renderer
# ══════════════════════════════════════════════

class TestPreviewRenderer:

    def setup_method(self):
        self.loader = FontLoader()
        self.loaded = self.loader.load(TEST_TTF_PATH)
        self.renderer = PreviewRenderer()

    def test_render_sample_returns_result(self):
        result = self.renderer.render_sample(self.loaded)
        assert isinstance(result, PreviewResult)

    def test_render_sample_size(self):
        cfg = PreviewConfig(width=800, height=200)
        result = self.renderer.render_sample(self.loaded, cfg)
        assert result.size == (800, 200)

    def test_render_sample_custom_text(self):
        result = self.renderer.render_sample(self.loaded, text="O I .")
        assert result.size[0] > 0

    def test_render_sample_to_bytes(self):
        result = self.renderer.render_sample(self.loaded)
        b = result.to_bytes()
        assert isinstance(b, bytes)
        # PNG マジックバイト確認
        assert b[:8] == b"\x89PNG\r\n\x1a\n"

    def test_render_sample_compact_preset(self):
        result = self.renderer.render_sample(self.loaded, PreviewConfig.compact())
        assert result.size == (400, 100)

    def test_render_sample_large_preset(self):
        result = self.renderer.render_sample(self.loaded, PreviewConfig.large())
        assert result.size == (1200, 300)

    def test_render_sample_japanese_preset(self):
        # 日本語フォントなくても PNG が生成されること（文字化けは許容）
        cfg = PreviewConfig.japanese()
        result = self.renderer.render_sample(self.loaded, cfg)
        assert result.size[0] > 0

    def test_render_size_comparison(self):
        result = self.renderer.render_size_comparison(
            self.loaded, sizes=[24, 36, 48], text="O I"
        )
        assert isinstance(result, PreviewResult)
        assert result.size[1] > 0

    def test_render_size_comparison_height_grows(self):
        """サイズが増えるほど画像が高くなるか。"""
        r_few = self.renderer.render_size_comparison(self.loaded, sizes=[24, 36])
        r_many = self.renderer.render_size_comparison(self.loaded, sizes=[24, 36, 48, 64])
        assert r_many.size[1] > r_few.size[1]

    def test_render_glyph_grid(self):
        result = self.renderer.render_glyph_grid(self.loaded, columns=4)
        assert isinstance(result, PreviewResult)
        assert result.size[0] > 0

    def test_render_glyph_grid_column_width(self):
        """columns=8, cell_size=48 なら幅が 384px になるか。"""
        result = self.renderer.render_glyph_grid(
            self.loaded, columns=8, cell_size=48
        )
        assert result.size[0] == 8 * 48

    def test_render_weight_comparison_non_variable(self):
        """Variable Font でない場合はサンプルにフォールバックするか。"""
        result = self.renderer.render_weight_comparison(self.loaded)
        assert isinstance(result, PreviewResult)

    def test_preview_save(self):
        import tempfile
        result = self.renderer.render_sample(self.loaded)
        with tempfile.TemporaryDirectory() as tmpdir:
            out = Path(tmpdir) / "preview.png"
            saved = result.save(out)
            assert saved.exists()
            assert saved.stat().st_size > 0

    def test_preview_config_show_metrics(self):
        cfg = PreviewConfig(show_metrics=True, sample_text="O")
        result = self.renderer.render_sample(self.loaded, cfg)
        assert result.size == (cfg.width, cfg.height)


# ══════════════════════════════════════════════
# pipeline 統合: subset → woff2 → css
# ══════════════════════════════════════════════

class TestPipelineIntegration:
    """
    font_loader → subset → woff2 → css のフル連携テスト。
    実際の API リクエストのフローを模倣する。
    """

    def setup_method(self):
        self.loader = FontLoader()
        self.loaded = self.loader.load(TEST_TTF_PATH)

    def test_subset_then_convert_to_woff2(self):
        """サブセット化 → WOFF2 変換のパイプが通るか。"""
        exporter = SubsetExporter()
        converter = Woff2Converter()

        # サブセット
        subset_result = exporter.subset_by_text(self.loaded, "O I")
        assert subset_result.subset_glyph_count <= self.loaded.glyph_count

        # サブセット済み TTF を WOFF2 に変換
        subset_bytes = subset_result.to_bytes()
        woff2_result = converter.convert_bytes(
            subset_bytes,
            self.loaded.family_name,
            self.loaded.style_name,
        )
        assert woff2_result.woff2_bytes[:4] == b"wOF2"

    def test_load_subset_woff2_css_full_pipeline(self):
        """フルパイプライン: load → subset → woff2 → @font-face CSS。"""
        exporter = SubsetExporter()
        converter = Woff2Converter()

        subset = exporter.subset_by_text(self.loaded, "O")
        woff2 = converter.convert_bytes(
            subset.to_bytes(),
            self.loaded.family_name,
            self.loaded.style_name,
        )
        css = woff2.to_font_face_css(src_type="base64")

        # CSS が有効な @font-face になっているか
        assert "@font-face" in css
        assert "data:font/woff2;base64," in css
        assert "PipelineTest" in css

    def test_extract_modify_reassemble(self):
        """
        load → extract_glyph → GlyphModifier → FontAssembler → WOFF2
        generator との完全な往復パイプ。
        """
        from python_backend.services.font_engine.generator.font_assembler import (
            FontAssembler, FontMetadata,
        )

        # グリフを抽出して変形
        g_orig = self.loader.extract_glyph(self.loaded, "O")
        g_modified = GlyphModifier(g_orig).scale_uniform(0.8).round_coordinates().build()

        # 新しいフォントとして組み立て
        asm = FontAssembler(
            metrics=self.loaded.font_metrics,
            metadata=FontMetadata(family_name="ModifiedFont"),
        )
        asm.add_glyph(GlyphBuilder.space())
        asm.add_glyph(g_modified)
        ttf_bytes = asm.build_ttf()

        # WOFF2 に変換
        converter = Woff2Converter()
        woff2 = converter.convert_bytes(ttf_bytes, "ModifiedFont")
        assert woff2.woff2_bytes[:4] == b"wOF2"

    def test_preview_after_subset(self):
        """サブセット済みフォントのプレビューが生成できるか。"""
        exporter = SubsetExporter()
        renderer = PreviewRenderer()

        subset = exporter.subset_by_text(self.loaded, "O I")

        # サブセット済みバイトを一時ファイルに書いて読み直す
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".ttf", delete=False) as f:
            f.write(subset.to_bytes())
            tmp_path = f.name

        try:
            loaded_sub = self.loader.load(tmp_path)
            result = renderer.render_sample(loaded_sub, text="O I")
            assert result.size == (800, 200)
            assert len(result.to_bytes()) > 0
        finally:
            os.unlink(tmp_path)


# ── import for integration test ───────────────────────────────────────
from python_backend.services.font_engine.generator.glyph_builder import GlyphBuilder


# ══════════════════════════════════════════════
# エントリーポイント（直接実行用）
# ══════════════════════════════════════════════

def run_all():
    import traceback

    suites = [
        TestFontLoader,
        TestSubsetExporter,
        TestWoff2Converter,
        TestPreviewRenderer,
        TestPipelineIntegration,
    ]

    total = passed = failed = 0
    errors = []

    for suite_cls in suites:
        suite = suite_cls()
        methods = [m for m in dir(suite) if m.startswith("test_")]
        print(f"\n{'─'*55}")
        print(f"  {suite_cls.__name__} ({len(methods)} tests)")
        print(f"{'─'*55}")
        for method_name in methods:
            total += 1
            try:
                suite.setup_method()
                getattr(suite, method_name)()
                print(f"  ✅ {method_name}")
                passed += 1
            except Exception as e:
                print(f"  ❌ {method_name}: {e}")
                errors.append((suite_cls.__name__, method_name, traceback.format_exc()))
                failed += 1

    print(f"\n{'═'*55}")
    print(f"  結果: {passed}/{total} passed, {failed} failed")
    print(f"{'═'*55}")

    if errors:
        print("\n--- 失敗の詳細 ---")
        for cls_name, method, tb in errors:
            print(f"\n[{cls_name}.{method}]")
            print(tb)

    return failed == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)