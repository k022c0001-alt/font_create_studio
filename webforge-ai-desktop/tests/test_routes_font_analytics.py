import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from python_backend.main import app


client = TestClient(app)


def test_metrics_analysis_returns_expected_shape():
    response = client.get("/api/fonts/test-font/metrics-analysis")

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["font_id"] == "test-font"
    assert body["recommendations"]["optimal_sizes"]["body"] == [14.0, 16.0]
    assert "heading" in body["recommendations"]["letter_spacing_map"]
    assert isinstance(body["available_weights"], list)


def test_recommend_typography_returns_css_and_tailwind_config():
    response = client.post(
        "/api/fonts/recommend-typography",
        json={"font_id": "font-001", "context": "body"},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["css_vars"]["--font-size-body"] == "16px"
    assert body["tailwind_config"]["meta"]["font_id"] == "font-001"


def test_font_analytics_endpoints_are_in_openapi():
    paths = app.openapi()["paths"]

    assert "/api/fonts/{font_id}/metrics-analysis" in paths
    assert "/api/fonts/recommend-typography" in paths
