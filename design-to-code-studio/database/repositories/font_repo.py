"""Font repository – SQLite access layer for font records."""
import sqlite3
from pathlib import Path


class FontRepo:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def list_by_project(self, project_id: str) -> list[dict]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM fonts WHERE project_id = ? ORDER BY created_at DESC",
                (project_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def get(self, font_id: str) -> dict | None:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM fonts WHERE id = ?", (font_id,)).fetchone()
        return dict(row) if row else None

    def create(self, record: dict) -> dict:
        with self._conn() as conn:
            conn.execute(
                """INSERT INTO fonts (id, project_id, family, file_path, format, is_variable, created_at)
                   VALUES (:id, :project_id, :family, :file_path, :format, :is_variable, :created_at)""",
                record,
            )
        return record

    def delete(self, font_id: str) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM fonts WHERE id = ?", (font_id,))
