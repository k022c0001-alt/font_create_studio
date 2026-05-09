"""
test_routes_font_generator.py
──────────────────────────────
FastAPI ルーターのテスト。
TestClient を使ってHTTPリクエストをシミュレートする。

pytest で実行:
  cd /home/claude
  python -m pytest tests/test_routes_font_generator.py -v

直接実行:
  python tests/test_routes_font_generator.py
"""

import sys
import os
import base64
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from python_backend.main import app
from python_backend.core.font_cache import FontCache

client = TestClient(app)


# ══════════════════════════════════════════════
# ヘルスチェック
# ══════════════════════════════════════════════

class TestHealth:
    def test_health_ok(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ══════════════════════════════════════════════
# POST /fonts/generate
# ══════════════════════════════════════════════

class TestGenerateFont:

    BASE_PAYLOAD = {
        "metadata": {"family_name": "RouteTest", "style_name": "Regular"},
        "glyphs": [
            {"name": ".space", "unicode": 32, "shape": "preset:space"},
            {"name": "O",      "unicode": 79, "shape": "preset:O"},
            {"name": "I",      "unicode": 73, "shape": "preset:I"},
        ],
        "output_format": "woff2",
    }

    def test_generate_returns_200(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.status_code == 200, r.text

    def test_generate_response_shape(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        body = r.json()
        for key in ["font_id", "family_name", "glyph_count",
                    "output_format", "file_size_bytes", "font_face_css", "data_url"]:
            assert key in body, f"{key} がレスポンスにない"

    def test_generate_family_name(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.json()["family_name"] == "RouteTest"

    def test_generate_glyph_count(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.json()["glyph_count"] == 3

    def test_generate_output_format(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.json()["output_format"] == "woff2"

    def test_generate_font_id_is_uuid(self):
        import uuid
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        font_id = r.json()["font_id"]
        uuid.UUID(font_id)  # 例外が出なければ OK

    def test_generate_data_url_prefix(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.json()["data_url"].startswith("data:font/woff2;base64,")

    def test_generate_font_face_css_content(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        css = r.json()["font_face_css"]
        assert "@font-face" in css
        assert "RouteTest" in css

    def test_generate_file_size_positive(self):
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        assert r.json()["file_size_bytes"] > 0

    def test_generate_ttf_format(self):
        payload = {**self.BASE_PAYLOAD, "output_format": "ttf"}
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200
        assert r.json()["output_format"] == "ttf"

    def test_generate_custom_metrics(self):
        payload = {
            **self.BASE_PAYLOAD,
            "metrics": {
                "upm": 2048,
                "ascender": 1638,
                "descender": -410,
                "cap_height": 1434,
                "x_height": 1065,
                "line_gap": 0,
            },
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200

    def test_generate_rect_shape(self):
        payload = {
            "metadata": {"family_name": "RectFont"},
            "glyphs": [
                {"name": "A", "unicode": 65, "shape": "rect",
                 "advance_width": 600, "lsb": 40},
            ],
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200

    def test_generate_circle_shape(self):
        payload = {
            "metadata": {"family_name": "CircleFont"},
            "glyphs": [
                {"name": "O", "unicode": 79, "shape": "circle",
                 "advance_width": 680},
            ],
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200

    def test_generate_stroke_shape(self):
        payload = {
            "metadata": {"family_name": "StrokeFont"},
            "glyphs": [
                {"name": "dash", "unicode": 45, "shape": "stroke",
                 "advance_width": 400,
                 "stroke": {"weight": 60, "cap_style": "round", "join_style": "round"}},
            ],
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200

    def test_generate_unknown_preset_returns_422(self):
        payload = {
            "metadata": {"family_name": "Bad"},
            "glyphs": [
                {"name": "X", "unicode": 88, "shape": "preset:UNKNOWN"},
            ],
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 422

    def test_generate_empty_glyphs_returns_422(self):
        payload = {
            "metadata": {"family_name": "Bad"},
            "glyphs": [],
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 422

    def test_generate_invalid_descender_returns_422(self):
        payload = {
            **self.BASE_PAYLOAD,
            "metrics": {
                "upm": 1000, "ascender": 800, "descender": 200,  # 正の値はNG
                "cap_height": 700, "x_height": 520, "line_gap": 0,
            },
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 422

    def test_generate_font_id_cached(self):
        """生成した font_id でキャッシュに保存されているか。"""
        r = client.post("/fonts/generate", json=self.BASE_PAYLOAD)
        font_id = r.json()["font_id"]
        entry = FontCache.instance().get(font_id)
        assert entry is not None
        assert entry.family_name == "RouteTest"


# ══════════════════════════════════════════════
# POST /fonts/subset
# ══════════════════════════════════════════════

class TestSubsetFont:

    def _generate_font_id(self) -> str:
        payload = {
            "metadata": {"family_name": "SubsetBase"},
            "glyphs": [
                {"name": ".space", "unicode": 32,  "shape": "preset:space"},
                {"name": "O",      "unicode": 79,  "shape": "preset:O"},
                {"name": "I",      "unicode": 73,  "shape": "preset:I"},
                {"name": "period", "unicode": 46,  "shape": "preset:period"},
            ],
            "output_format": "ttf",
        }
        r = client.post("/fonts/generate", json=payload)
        assert r.status_code == 200
        return r.json()["font_id"]

    def test_subset_by_text_with_font_id(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "text": "O",
        })
        assert r.status_code == 200, r.text

    def test_subset_response_shape(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={"font_id": font_id, "text": "O"})
        body = r.json()
        for key in ["font_id", "original_glyph_count", "subset_glyph_count",
                    "reduction_percent", "font_face_css", "data_url"]:
            assert key in body

    def test_subset_glyph_count_reduced(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={"font_id": font_id, "text": "O"})
        body = r.json()
        assert body["subset_glyph_count"] <= body["original_glyph_count"]

    def test_subset_with_unicodes(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "unicodes": [79],  # 'O'
        })
        assert r.status_code == 200

    def test_subset_preset_landing_en(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "preset": "landing_en",
        })
        assert r.status_code == 200

    def test_subset_preset_landing_jp(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "preset": "landing_jp",
        })
        assert r.status_code == 200

    def test_subset_output_ttf(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "text": "O",
            "output_format": "ttf",
        })
        assert r.status_code == 200

    def test_subset_no_content_returns_422(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={"font_id": font_id})
        assert r.status_code == 422

    def test_subset_invalid_font_id_returns_404(self):
        r = client.post("/fonts/subset", json={
            "font_id": "00000000-0000-0000-0000-000000000000",
            "text": "O",
        })
        assert r.status_code == 404

    def test_subset_with_file_b64(self):
        """file_b64 で直接 TTF を渡す場合のテスト。"""
        # generate でキャッシュに保存した TTF を取り出して base64 化
        font_id = self._generate_font_id()
        entry = FontCache.instance().get(font_id)
        b64 = base64.b64encode(entry.font_bytes).decode()

        r = client.post("/fonts/subset", json={
            "file_b64": b64,
            "text": "O",
        })
        assert r.status_code == 200

    def test_subset_invalid_preset_returns_422(self):
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={
            "font_id": font_id,
            "preset": "invalid_preset",
        })
        assert r.status_code == 422

    def test_subset_result_is_new_font_id(self):
        """サブセット結果が新しい font_id でキャッシュされているか。"""
        font_id = self._generate_font_id()
        r = client.post("/fonts/subset", json={"font_id": font_id, "text": "O"})
        new_id = r.json()["font_id"]
        assert new_id != font_id
        assert FontCache.instance().get(new_id) is not None


# ══════════════════════════════════════════════
# POST /fonts/convert
# ══════════════════════════════════════════════

class TestConvertFont:

    def _get_ttf_b64(self) -> str:
        payload = {
            "metadata": {"family_name": "ConvertBase"},
            "glyphs": [
                {"name": ".space", "unicode": 32, "shape": "preset:space"},
                {"name": "O",      "unicode": 79, "shape": "preset:O"},
            ],
            "output_format": "ttf",
        }
        r = client.post("/fonts/generate", json=payload)
        font_id = r.json()["font_id"]
        entry = FontCache.instance().get(font_id)
        return base64.b64encode(entry.font_bytes).decode()

    def test_convert_returns_200(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={
            "file_b64": b64,
            "family_name": "Converted",
        })
        assert r.status_code == 200, r.text

    def test_convert_response_shape(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={"file_b64": b64, "family_name": "X"})
        body = r.json()
        for key in ["font_id", "family_name", "weight",
                    "original_size_bytes", "converted_size_bytes",
                    "reduction_percent", "font_face_css", "data_url"]:
            assert key in body

    def test_convert_data_url_is_woff2(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={"file_b64": b64, "family_name": "X"})
        assert r.json()["data_url"].startswith("data:font/woff2;base64,")

    def test_convert_with_explicit_weight(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={
            "file_b64": b64,
            "family_name": "X",
            "weight": 700,
        })
        assert r.json()["weight"] == 700

    def test_convert_auto_weight_from_style(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={
            "file_b64": b64,
            "family_name": "X",
            "style_name": "Bold",
            "weight": 0,
        })
        assert r.json()["weight"] == 700

    def test_convert_family_name_preserved(self):
        b64 = self._get_ttf_b64()
        r = client.post("/fonts/convert", json={
            "file_b64": b64,
            "family_name": "MyBrand",
        })
        assert r.json()["family_name"] == "MyBrand"

    def test_convert_no_input_returns_422(self):
        r = client.post("/fonts/convert", json={"family_name": "X"})
        assert r.status_code == 422

    def test_convert_invalid_b64_returns_422(self):
        r = client.post("/fonts/convert", json={
            "file_b64": "not-valid-base64!!!",
            "family_name": "X",
        })
        assert r.status_code == 422

    def test_convert_with_font_id(self):
        """font_id 経由での変換テスト。"""
        payload = {
            "metadata": {"family_name": "IdConvert"},
            "glyphs": [{"name": ".space", "unicode": 32, "shape": "preset:space"}],
            "output_format": "ttf",
        }
        gen_r = client.post("/fonts/generate", json=payload)
        font_id = gen_r.json()["font_id"]

        r = client.post("/fonts/convert", json={
            "font_id": font_id,
            "family_name": "IdConverted",
        })
        assert r.status_code == 200
        assert r.json()["family_name"] == "IdConverted"

    def test_convert_size_reduced(self):
        b64 = self._get_ttf_b64()
        original_size = len(base64.b64decode(b64))
        r = client.post("/fonts/convert", json={"file_b64": b64, "family_name": "X"})
        assert r.json()["converted_size_bytes"] < original_size


# ══════════════════════════════════════════════
# GET /fonts/preview/{id}
# ══════════════════════════════════════════════

class TestPreviewFont:

    def _generate_font_id(self) -> str:
        r = client.post("/fonts/generate", json={
            "metadata": {"family_name": "PreviewTest"},
            "glyphs": [
                {"name": ".space", "unicode": 32, "shape": "preset:space"},
                {"name": "O",      "unicode": 79, "shape": "preset:O"},
                {"name": "I",      "unicode": 73, "shape": "preset:I"},
            ],
        })
        assert r.status_code == 200
        return r.json()["font_id"]

    def test_preview_sample_returns_png(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}")
        assert r.status_code == 200
        assert r.headers["content-type"] == "image/png"

    def test_preview_png_magic_bytes(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}")
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_preview_type_grid(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?type=grid")
        assert r.status_code == 200
        assert r.headers["content-type"] == "image/png"

    def test_preview_type_sizes(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?type=sizes")
        assert r.status_code == 200

    def test_preview_type_weights(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?type=weights")
        assert r.status_code == 200

    def test_preview_custom_text(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?text=OI&width=400&height=100")
        assert r.status_code == 200

    def test_preview_custom_size(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?width=600&height=150&font_size=60")
        assert r.status_code == 200

    def test_preview_not_found_returns_404(self):
        r = client.get("/fonts/preview/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_preview_headers_contain_family(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}")
        assert "x-font-family" in r.headers

    def test_preview_columns_param(self):
        font_id = self._generate_font_id()
        r = client.get(f"/fonts/preview/{font_id}?type=grid&columns=8")
        assert r.status_code == 200


# ══════════════════════════════════════════════
# キャッシュ管理
# ══════════════════════════════════════════════

class TestCacheManagement:

    def test_cache_stats(self):
        r = client.get("/fonts/cache/stats")
        assert r.status_code == 200
        body = r.json()
        assert "entries" in body
        assert "total_bytes" in body

    def test_cache_delete(self):
        gen_r = client.post("/fonts/generate", json={
            "metadata": {"family_name": "DeleteMe"},
            "glyphs": [{"name": ".space", "unicode": 32, "shape": "preset:space"}],
        })
        font_id = gen_r.json()["font_id"]
        assert FontCache.instance().get(font_id) is not None

        r = client.delete(f"/fonts/cache/{font_id}")
        assert r.status_code == 200
        assert r.json()["deleted"] is True
        assert FontCache.instance().get(font_id) is None

    def test_cache_delete_nonexistent(self):
        r = client.delete("/fonts/cache/nonexistent-id")
        assert r.status_code == 200
        assert r.json()["deleted"] is False


# ══════════════════════════════════════════════
# エントリーポイント
# ══════════════════════════════════════════════

def run_all():
    import traceback

    suites = [
        TestHealth,
        TestGenerateFont,
        TestSubsetFont,
        TestConvertFont,
        TestPreviewFont,
        TestCacheManagement,
    ]

    total = passed = failed = 0
    errors = []

    for suite_cls in suites:
        methods = [m for m in dir(suite_cls) if m.startswith("test_")]
        print(f"\n{'─'*60}")
        print(f"  {suite_cls.__name__} ({len(methods)} tests)")
        print(f"{'─'*60}")
        for method_name in methods:
            total += 1
            suite = suite_cls()
            try:
                getattr(suite, method_name)()
                print(f"  ✅ {method_name}")
                passed += 1
            except Exception as e:
                print(f"  ❌ {method_name}: {e}")
                errors.append((suite_cls.__name__, method_name, traceback.format_exc()))
                failed += 1

    print(f"\n{'═'*60}")
    print(f"  結果: {passed}/{total} passed, {failed} failed")
    print(f"{'═'*60}")

    if errors:
        print("\n--- 失敗の詳細 ---")
        for cls_name, method, tb in errors:
            print(f"\n[{cls_name}.{method}]")
            print(tb)

    return failed == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)