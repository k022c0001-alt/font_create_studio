"""History repository – SQLite access layer for chat and generation history."""
import sqlite3


class HistoryRepo:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def list_by_project(self, project_id: str) -> list[dict]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM history WHERE project_id = ? ORDER BY created_at ASC",
                (project_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def add(self, record: dict) -> dict:
        with self._conn() as conn:
            conn.execute(
                """INSERT INTO history (id, project_id, role, content, created_at)
                   VALUES (:id, :project_id, :role, :content, :created_at)""",
                record,
            )
        return record

    def delete_by_project(self, project_id: str) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM history WHERE project_id = ?", (project_id,))
