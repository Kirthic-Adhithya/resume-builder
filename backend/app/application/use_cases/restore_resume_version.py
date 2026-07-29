import uuid

from app.application.interfaces.repositories import ResumeRepository, ResumeVersionRepository
from app.application.use_cases._shared import get_owned_resume
from app.application.use_cases.update_resume import UpdateResume
from app.core.exceptions import NotFoundError
from app.domain.entities.resume import Resume


class RestoreResumeVersion:
    def __init__(
        self, resume_repo: ResumeRepository, version_repo: ResumeVersionRepository
    ) -> None:
        self._resume_repo = resume_repo
        self._version_repo = version_repo

    async def execute(
        self, user_id: uuid.UUID, resume_id: uuid.UUID, version_id: uuid.UUID
    ) -> Resume:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        version = await self._version_repo.get_by_id(version_id)
        if version is None or version.resume_id != resume.id:
            raise NotFoundError("Version not found")

        # Routed through UpdateResume rather than writing directly, so restoring also
        # creates a fresh version snapshot — a restore doesn't erase history, it adds to it.
        return await UpdateResume(self._resume_repo, self._version_repo).execute(
            user_id, resume_id, title=None, content=version.content
        )
