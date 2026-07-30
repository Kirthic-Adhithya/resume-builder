import json
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.application.interfaces.compiler import LatexCompiler
from app.application.interfaces.repositories import ResumeRepository, ResumeVersionRepository
from app.application.use_cases.compile_resume import CompileResume
from app.application.use_cases.create_resume import CreateResume
from app.application.use_cases.delete_resume import DeleteResume
from app.application.use_cases.delete_resume_version import DeleteResumeVersion
from app.application.use_cases.duplicate_resume import DuplicateResume
from app.application.use_cases.get_resume import GetResume
from app.application.use_cases.list_resume_versions import ListResumeVersions
from app.application.use_cases.list_resumes import ListResumes
from app.application.use_cases.restore_resume_version import RestoreResumeVersion
from app.application.use_cases.update_resume import UpdateResume
from app.domain.entities.resume import Resume
from app.domain.entities.resume_version import ResumeVersion
from app.domain.entities.user import User
from app.presentation.dependencies import (
    get_current_user,
    get_latex_compiler,
    get_resume_repository,
    get_resume_version_repository,
)
from app.presentation.schemas.resume import (
    CompileRequest,
    ResumeCreateRequest,
    ResumeDetailResponse,
    ResumeListResponse,
    ResumeResponse,
    ResumeUpdateRequest,
    ResumeVersionResponse,
)

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Resume:
    return await CreateResume(resume_repo).execute(current_user.id, data.title, data.template)


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


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Resume:
    return await GetResume(resume_repo).execute(current_user.id, resume_id)


@router.patch("/{resume_id}", response_model=ResumeDetailResponse)
async def update_resume(
    resume_id: uuid.UUID,
    data: ResumeUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    version_repo: Annotated[ResumeVersionRepository, Depends(get_resume_version_repository)],
) -> Resume:
    return await UpdateResume(resume_repo, version_repo).execute(
        current_user.id, resume_id, data.title, data.content
    )


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


@router.post("/{resume_id}/compile")
async def compile_resume(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    compiler: Annotated[LatexCompiler, Depends(get_latex_compiler)],
    data: CompileRequest | None = None,
) -> Response:
    content_override = data.content if data is not None else None
    pdf_bytes = await CompileResume(resume_repo, compiler).execute(
        current_user.id, resume_id, content_override
    )
    return Response(content=pdf_bytes, media_type="application/pdf")


@router.get("/{resume_id}/export/pdf")
async def export_pdf(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    compiler: Annotated[LatexCompiler, Depends(get_latex_compiler)],
) -> Response:
    pdf_bytes = await CompileResume(resume_repo, compiler).execute(current_user.id, resume_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{resume_id}.pdf"'},
    )


@router.get("/{resume_id}/export/latex")
async def export_latex(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Response:
    resume = await GetResume(resume_repo).execute(current_user.id, resume_id)
    return Response(
        content=resume.content,
        media_type="text/x-tex",
        headers={"Content-Disposition": f'attachment; filename="{resume_id}.tex"'},
    )


@router.get("/{resume_id}/export/json")
async def export_json(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
) -> Response:
    resume = await GetResume(resume_repo).execute(current_user.id, resume_id)
    payload = {
        "id": str(resume.id),
        "title": resume.title,
        "content": resume.content,
        "created_at": resume.created_at.isoformat(),
        "updated_at": resume.updated_at.isoformat(),
    }
    return Response(
        content=json.dumps(payload, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{resume_id}.json"'},
    )


@router.get("/{resume_id}/versions", response_model=list[ResumeVersionResponse])
async def list_resume_versions(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    version_repo: Annotated[ResumeVersionRepository, Depends(get_resume_version_repository)],
) -> list[ResumeVersion]:
    return await ListResumeVersions(resume_repo, version_repo).execute(current_user.id, resume_id)


@router.post("/{resume_id}/versions/{version_id}/restore", response_model=ResumeDetailResponse)
async def restore_resume_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    version_repo: Annotated[ResumeVersionRepository, Depends(get_resume_version_repository)],
) -> Resume:
    return await RestoreResumeVersion(resume_repo, version_repo).execute(
        current_user.id, resume_id, version_id
    )


@router.delete("/{resume_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    version_repo: Annotated[ResumeVersionRepository, Depends(get_resume_version_repository)],
) -> None:
    await DeleteResumeVersion(resume_repo, version_repo).execute(
        current_user.id, resume_id, version_id
    )
