from __future__ import annotations

import io
import sys
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'design-to-code-studio'))

from python_backend.main import app


client = TestClient(app)


def build_png() -> bytes:
    buf = io.BytesIO()
    Image.new('RGB', (320, 200), color=(240, 240, 240)).save(buf, format='PNG')
    return buf.getvalue()


def test_design_upload_analyze_generate_flow():
    upload = client.post(
        '/design/upload',
        files={'file': ('screen.png', build_png(), 'image/png')},
    )
    assert upload.status_code == 200, upload.text
    project_id = upload.json()['project_id']

    analyze = client.post('/design/analyze', json={'project_id': project_id})
    assert analyze.status_code == 200, analyze.text
    assert len(analyze.json()['elements']) > 0

    generate = client.post(
        '/design/generate-jsx',
        json={'analysis_id': analyze.json()['analysis_id'], 'component_name': 'DemoScreen'},
    )
    assert generate.status_code == 200, generate.text
    body = generate.json()
    assert 'DemoScreen' in body['jsx']
    assert '.DemoScreen {' in body['css']


def test_design_generate_stream_response():
    upload = client.post(
        '/design/upload',
        files={'file': ('stream.png', build_png(), 'image/png')},
    )
    analyze = client.post('/design/analyze', json={'project_id': upload.json()['project_id']})

    stream = client.post(
        '/design/generate-jsx',
        json={'analysis_id': analyze.json()['analysis_id'], 'component_name': 'StreamView', 'stream': True},
    )
    assert stream.status_code == 200
    assert 'text/event-stream' in stream.headers['content-type']
    assert 'DONE' in stream.text
