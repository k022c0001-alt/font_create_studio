from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# python_backend/main.py を直接実行した場合の import パス調整
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from python_backend.api.routes_font_export import router as font_export_router
from python_backend.api.routes_font_generator import router as font_generator_router
from python_backend.api.routes_font_import import router as font_import_router


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
app.include_router(font_generator_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
