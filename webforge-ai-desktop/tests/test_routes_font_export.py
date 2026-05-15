import os
import sys
from typing import Literal

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from python_backend.main import app


client = TestClient(app)


def _base_payload(fmt: Literal["ttf", "woff2"] = "ttf") -> dict:
    return {
        "metadata": {"family_name": "ExportTest", "style_name": "Regular"},
        "format": fmt,
        "glyphs": [
            {
                "name": "A",
                "unicode": 65,
                "metrics": {"advance_width": 600, "left_side_bearing": 20},
                "contours": [
                    {
                        "points": [
                            {"x": 50, "y": 0, "on_curve": True},
                            {"x": 300, "y": 700, "on_curve": True},
                            {"x": 550, "y": 0, "on_curve": True},
                        ]
                    }
                ],
            }
        ],
    }


def test_export_ttf_binary():
    r = client.post("/api/fonts/export", json=_base_payload("ttf"))
    assert r.status_code == 200, r.text
    assert r.headers["content-type"] == "font/ttf"
    assert r.headers["content-disposition"] == 'attachment; filename="ExportTest-Regular.ttf"'
    assert r.content[:4] == b"\x00\x01\x00\x00"


def test_export_woff2_binary():
    r = client.post("/api/fonts/export", json=_base_payload("woff2"))
    assert r.status_code == 200, r.text
    assert r.headers["content-type"] == "font/woff2"
    assert r.content[:4] == b"wOF2"


def test_export_validate_ok():
    r = client.post("/api/fonts/export/validate", json=_base_payload("ttf"))
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True, "error": None}


def test_export_validate_returns_structured_error():
    payload = _base_payload("ttf")
    payload["glyphs"][0]["contours"][0]["points"] = [
        {"x": 10, "y": 10, "on_curve": False},
        {"x": 20, "y": 20, "on_curve": False},
        {"x": 30, "y": 30, "on_curve": False},
    ]
    r = client.post("/api/fonts/export/validate", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is False
    assert body["error"]["code"] == "invalid_contour"
    assert "glyphs[0].contours[0]" in body["error"]["location"]
