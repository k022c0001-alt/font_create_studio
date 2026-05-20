from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from python_backend.core.config import DB_PATH


SCHEMA_PATH = Path(__file__).resolve().parents[1] / '001_initial.sql'


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProjectRepository:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_schema(self) -> None:
        schema = SCHEMA_PATH.read_text(encoding='utf-8')
        with self._connect() as conn:
            conn.executescript(schema)
            conn.commit()

    def list_projects(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute('SELECT * FROM projects ORDER BY created_at DESC').fetchall()
        return [dict(row) for row in rows]

    def create_project(self, name: str, image_path: str = '') -> dict:
        project_id = str(uuid.uuid4())
        created_at = now_iso()
        with self._connect() as conn:
            conn.execute(
                'INSERT INTO projects (id, name, image_path, created_at) VALUES (?, ?, ?, ?)',
                (project_id, name, image_path, created_at),
            )
            conn.commit()
        return {'id': project_id, 'name': name, 'image_path': image_path, 'created_at': created_at}

    def get_project(self, project_id: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
        return dict(row) if row else None

    def update_project(self, project_id: str, *, name: str | None = None, image_path: str | None = None) -> dict | None:
        project = self.get_project(project_id)
        if not project:
            return None

        updated_name = name if name is not None else project['name']
        updated_image_path = image_path if image_path is not None else project['image_path']
        with self._connect() as conn:
            conn.execute(
                'UPDATE projects SET name = ?, image_path = ? WHERE id = ?',
                (updated_name, updated_image_path, project_id),
            )
            conn.commit()
        return self.get_project(project_id)

    def delete_project(self, project_id: str) -> bool:
        with self._connect() as conn:
            cursor = conn.execute('DELETE FROM analysis_history WHERE project_id = ?', (project_id,))
            del cursor
            result = conn.execute('DELETE FROM projects WHERE id = ?', (project_id,))
            conn.commit()
        return result.rowcount > 0
