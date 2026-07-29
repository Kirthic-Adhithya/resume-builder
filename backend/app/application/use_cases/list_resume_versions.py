import uuid

from app.application.interfaces.repositories import ResumeRepository, ResumeVersionRepository
from app.application.use_cases._shared import get_owned_resume
from app.domain.entities.resume_version import ResumeVersion


class ListResumeVersions:
    def __init__(
        self, resume_repo: ResumeRepository, version_repo: ResumeVersionRepository
    ) -> None:
        self._resume_repo = resume_repo
        self._version_repo = version_repo

    async def execute(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> list[ResumeVersion]:
        await get_owned_resume(self._resume_repo, user_id, resume_id)
        return await self._version_repo.list_for_resume(resume_id)
