from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import html

router = APIRouter()


@router.get("/preview/{project_id}", response_class=HTMLResponse)
async def preview_project(project_id: str):
    """Return the rendered HTML preview for a project."""
    # TODO: fetch generated HTML from ai_site_builder and return it
    safe_id = html.escape(project_id)
    return HTMLResponse(content=f"<html><body><p>Preview for {safe_id}</p></body></html>")
