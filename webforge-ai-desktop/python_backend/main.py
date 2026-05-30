from __future__ import annotations

import asyncio
import sqlite3
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# python_backend/main.py を直接実行した場合の import パス調整
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from python_backend.api.routes_font_export import router as font_export_router
from python_backend.api.routes_font_analytics import (
    cache_manager,
    router as font_analytics_router,
)
from python_backend.api.routes_font_generator import router as font_generator_router
from python_backend.api.routes_font_import import router as font_import_router
from python_backend.core.font_cache import CacheCleanupScheduler

app = FastAPI(title="WebForge AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "null",
    ],
    allow_origin_regex=r"^app://.*$|^file://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(font_export_router, prefix="/api")
app.include_router(font_import_router, prefix="/api")
app.include_router(font_analytics_router, prefix="/api")
app.include_router(font_generator_router)

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "font_studio.db"
MIGRATIONS_DIR = BASE_DIR / "database" / "migrations"
CLEANUP_INTERVAL_SECONDS = 30 * 60


def _run_migrations() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            file_name TEXT PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
    for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
        already_applied = cur.execute(
            "SELECT 1 FROM schema_migrations WHERE file_name = ?",
            (sql_file.name,),
        ).fetchone()
        if already_applied:
            continue
        cur.executescript(sql_file.read_text(encoding="utf-8"))
        cur.execute(
            "INSERT INTO schema_migrations (file_name) VALUES (?)",
            (sql_file.name,),
        )
    conn.commit()
    conn.close()


@app.on_event("startup")
async def startup() -> None:
    _run_migrations()
    scheduler = CacheCleanupScheduler(cache_manager)

    async def _cleanup_loop() -> None:
        while True:
            await scheduler.cleanup_expired()
            await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)

    app.state.analytics_cleanup_task = asyncio.create_task(_cleanup_loop())


@app.on_event("shutdown")
async def shutdown() -> None:
    task = getattr(app.state, "analytics_cleanup_task", None)
    if task is None:
        return
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
