from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SiteGenerateRequest(BaseModel):
    project_id: str
    prompt: str


@router.post("/generate/site")
async def generate_site(body: SiteGenerateRequest):
    """Trigger AI-powered site generation."""
    # TODO: delegate to ai_site_builder service
    return {"status": "ok", "project_id": body.project_id}
