import uuid

from app.application.interfaces.repositories import ResumeRepository, ResumeVersionRepository
from app.application.use_cases._shared import get_owned_resume
from app.core.exceptions import NotFoundError


class DeleteResumeVersion:
    def __init__(
        self, resume_repo: ResumeRepository, version_repo: ResumeVersionRepository
    ) -> None:
        self._resume_repo = resume_repo
        self._version_repo = version_repo

    async def execute(
        self, user_id: uuid.UUID, resume_id: uuid.UUID, version_id: uuid.UUID
    ) -> None:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        version = await self._version_repo.get_by_id(version_id)
        if version is None or version.resume_id != resume.id:
            raise NotFoundError("Version not found")
        await self._version_repo.delete(version.id)
