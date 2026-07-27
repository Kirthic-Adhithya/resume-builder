import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.application.interfaces.repositories import ResumeRepository
from app.application.use_cases.create_resume import CreateResume
from app.application.use_cases.delete_resume import DeleteResume
from app.application.use_cases.duplicate_resume import DuplicateResume
from app.application.use_cases.list_resumes import ListResumes
from app.application.use_cases.rename_resume import RenameResume
from app.domain.entities.resume import Resume
from app.domain.entities.user import User
from app.presentation.dependencies import get_current_user, get_resume_repository
from app.presentation.schemas.resume import (
    ResumeCreateRequest,
    ResumeListResponse,
    ResumeRenameRequest,
    ResumeResponse,
)

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Resume:
    return await CreateResume(resume_repo).execute(current_user.id, data.title)


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    search: str | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
) -> ResumeListResponse:
    items, total = await ListResumes(resume_repo).execute(current_user.id, search, page, page_size)
    return ResumeListResponse(
        items=[ResumeResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/{resume_id}", response_model=ResumeResponse)
async def rename_resume(
    resume_id: uuid.UUID,
    data: ResumeRenameRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Resume:
    return await RenameResume(resume_repo).execute(current_user.id, resume_id, data.title)


@router.post(
    "/{resume_id}/duplicate", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED
)
async def duplicate_resume(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Resume:
    return await DuplicateResume(resume_repo).execute(current_user.id, resume_id)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> None:
    await DeleteResume(resume_repo).execute(current_user.id, resume_id)
