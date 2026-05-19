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
    Image.new('RGB', (240, 160), color=(220, 230, 255)).save(buf, format='PNG')
    return buf.getvalue()


def test_projects_crud_and_upload_update_flow():
    create = client.post('/projects', json={'name': 'Landing Page'})
    assert create.status_code == 201, create.text
    project = create.json()
    assert project['name'] == 'Landing Page'
    assert project['image_path'] == ''

    listing = client.get('/projects')
    assert listing.status_code == 200, listing.text
    assert any(item['id'] == project['id'] for item in listing.json())

    updated = client.patch(f"/projects/{project['id']}", json={'name': 'Marketing Landing'})
    assert updated.status_code == 200, updated.text
    assert updated.json()['name'] == 'Marketing Landing'

    upload = client.post(
        '/design/upload',
        files={'file': ('marketing.png', build_png(), 'image/png')},
        data={'project_id': project['id']},
    )
    assert upload.status_code == 200, upload.text
    assert upload.json()['project_id'] == project['id']

    fetched = client.get(f"/projects/{project['id']}")
    assert fetched.status_code == 200, fetched.text
    assert fetched.json()['image_path'].endswith('.png')

    deleted = client.delete(f"/projects/{project['id']}")
    assert deleted.status_code == 204, deleted.text

    missing = client.get(f"/projects/{project['id']}")
    assert missing.status_code == 404, missing.text
