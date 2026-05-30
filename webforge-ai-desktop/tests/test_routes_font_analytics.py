import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from python_backend.main import app


client = TestClient(app)


def _generate_font_id() -> str:
    payload = {
        "metadata": {"family_name": "AnalyticsTest", "style_name": "Regular"},
        "glyphs": [
            {"name": ".space", "unicode": 32, "shape": "preset:space"},
            {"name": "O", "unicode": 79, "shape": "preset:O"},
            {"name": "I", "unicode": 73, "shape": "preset:I"},
        ],
        "output_format": "ttf",
    }
    response = client.post("/fonts/generate", json=payload)
    assert response.status_code == 200, response.text
    return response.json()["font_id"]


def test_metrics_analysis_returns_expected_shape():
    font_id = _generate_font_id()
    response = client.get(f"/api/fonts/{font_id}/metrics-analysis")

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["font_id"] == font_id
    assert "body" in body["recommendations"]["optimal_sizes"]
    assert "heading" in body["recommendations"]["letter_spacing_map"]
    assert "caption" in body["recommendations"]["line_height_map"]
    assert isinstance(body["has_cjk"], bool)
    assert isinstance(body["available_weights"], list)


def test_recommend_typography_returns_css_and_tailwind_config():
    font_id = _generate_font_id()
    response = client.post(
        "/api/fonts/recommend-typography",
        json={"font_id": font_id, "context": "body"},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert "--font-size-body" in body["css_vars"]
    assert body["tailwind_config"]["meta"]["font_id"] == font_id


def test_metrics_analysis_returns_404_when_font_not_found():
    response = client.get("/api/fonts/not-found/metrics-analysis")
    assert response.status_code == 404


def test_font_analytics_endpoints_are_in_openapi():
    paths = app.openapi()["paths"]

    assert "/api/fonts/{font_id}/metrics-analysis" in paths
    assert "/api/fonts/recommend-typography" in paths
