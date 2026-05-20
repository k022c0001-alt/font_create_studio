from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from database.repositories.project_repo import ProjectRepository
from python_backend.schemas.project_schema import ProjectCreateRequest, ProjectResponse, ProjectUpdateRequest


router = APIRouter(prefix='/projects', tags=['projects'])
repo = ProjectRepository()


@router.get('', response_model=list[ProjectResponse])
async def list_projects() -> list[ProjectResponse]:
    return [ProjectResponse(**project) for project in repo.list_projects()]


@router.post('', response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreateRequest) -> ProjectResponse:
    project = repo.create_project(name=payload.name, image_path=payload.image_path or '')
    return ProjectResponse(**project)


@router.get('/{project_id}', response_model=ProjectResponse)
async def get_project(project_id: str) -> ProjectResponse:
    project = repo.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return ProjectResponse(**project)


@router.patch('/{project_id}', response_model=ProjectResponse)
async def update_project(project_id: str, payload: ProjectUpdateRequest) -> ProjectResponse:
    project = repo.update_project(project_id, name=payload.name, image_path=payload.image_path)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return ProjectResponse(**project)


@router.delete('/{project_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str) -> Response:
    deleted = repo.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Project not found')
    return Response(status_code=status.HTTP_204_NO_CONTENT)
