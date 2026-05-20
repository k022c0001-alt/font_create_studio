from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from database.repositories.project_repo import ProjectRepository
from python_backend.core.config import ALLOWED_IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE, UPLOAD_DIR
from python_backend.core.repository import DesignRepository
from python_backend.schemas.design_schema import AnalyzeRequest, AnalyzeResponse, DetectedElement, GenerateJsxRequest, GenerateJsxResponse, UploadResponse
from python_backend.services.design_to_code.component_mapper import generate_jsx_and_css
from python_backend.services.design_to_code.image_analyzer import analyze_ui_image


router = APIRouter(prefix='/design', tags=['design'])
design_repo = DesignRepository()
project_repo = ProjectRepository()


def validate_upload(file: UploadFile, content: bytes) -> None:
    suffix = Path(file.filename or '').suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=422, detail='Unsupported image format')
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail='Image file is too large')


@router.post('/upload', response_model=UploadResponse)
async def upload_design_image(file: UploadFile = File(...), project_id: str | None = Form(default=None)) -> UploadResponse:
    content = await file.read()
    validate_upload(file, content)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')
    safe_name = ''.join(ch for ch in (file.filename or 'design.png') if ch.isalnum() or ch in {'-', '_', '.'})
    target = UPLOAD_DIR / f'{timestamp}_{safe_name}'
    target.write_bytes(content)

    if project_id:
        project = project_repo.update_project(project_id, image_path=str(target))
        if not project:
            raise HTTPException(status_code=404, detail='Project not found')
    else:
        project = project_repo.create_project(name=Path(file.filename or 'untitled').stem, image_path=str(target))

    return UploadResponse(project_id=project['id'], image_path=project['image_path'], created_at=project['created_at'])


@router.post('/analyze', response_model=AnalyzeResponse)
async def analyze_design(payload: AnalyzeRequest) -> AnalyzeResponse:
    project = project_repo.get_project(payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    if not project['image_path']:
        raise HTTPException(status_code=422, detail='Project does not have an uploaded image yet')

    result = analyze_ui_image(Path(project['image_path']), payload.prompt)
    analysis_data = {
        'elements': [item.model_dump() for item in result.elements],
        'layout_summary': result.layout_summary,
    }
    analysis = design_repo.create_analysis(payload.project_id, result.source, analysis_data)
    return AnalyzeResponse(
        analysis_id=analysis['id'],
        project_id=payload.project_id,
        elements=result.elements,
        layout_summary=result.layout_summary,
        source=result.source,
    )


@router.post('/generate-jsx', response_model=GenerateJsxResponse)
async def generate_jsx(payload: GenerateJsxRequest):
    analysis = design_repo.get_analysis(payload.analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail='Analysis not found')

    elements = [DetectedElement(**item) for item in analysis['analysis_json']['elements']]
    jsx, css = generate_jsx_and_css(payload.component_name, elements)
    design_repo.save_generated_code(payload.analysis_id, jsx, css)

    if not payload.stream:
        return GenerateJsxResponse(analysis_id=payload.analysis_id, jsx=jsx, css=css)

    def stream():
        yield f"data: {json.dumps({'type': 'jsx', 'chunk': jsx})}\n\n"
        yield f"data: {json.dumps({'type': 'css', 'chunk': css})}\n\n"
        yield 'data: [DONE]\n\n'

    return StreamingResponse(stream(), media_type='text/event-stream')
