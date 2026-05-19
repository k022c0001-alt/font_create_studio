from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from python_backend.core.config import DB_PATH


SCHEMA_PATH = Path(__file__).resolve().parents[2] / 'database' / '001_initial.sql'


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class DesignRepository:
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

    def create_project(self, name: str, image_path: str) -> dict:
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

    def create_analysis(self, project_id: str, source: str, analysis: dict) -> dict:
        analysis_id = str(uuid.uuid4())
        created_at = now_iso()
        with self._connect() as conn:
            conn.execute(
                'INSERT INTO analysis_history (id, project_id, source, analysis_json, created_at) VALUES (?, ?, ?, ?, ?)',
                (analysis_id, project_id, source, json.dumps(analysis, ensure_ascii=False), created_at),
            )
            conn.commit()
        return {'id': analysis_id, 'project_id': project_id, 'source': source, 'created_at': created_at}

    def get_analysis(self, analysis_id: str) -> dict | None:
        with self._connect() as conn:
            row = conn.execute('SELECT * FROM analysis_history WHERE id = ?', (analysis_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        record['analysis_json'] = json.loads(record['analysis_json'])
        return record

    def save_generated_code(self, analysis_id: str, jsx: str, css: str) -> None:
        with self._connect() as conn:
            conn.execute(
                'UPDATE analysis_history SET generated_jsx = ?, generated_css = ? WHERE id = ?',
                (jsx, css, analysis_id),
            )
            conn.commit()
