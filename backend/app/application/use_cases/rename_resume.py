import uuid
from datetime import UTC, datetime

from app.application.interfaces.repositories import ResumeRepository
from app.application.use_cases._shared import get_owned_resume
from app.domain.entities.resume import Resume


class RenameResume:
    def __init__(self, resume_repo: ResumeRepository) -> None:
        self._resume_repo = resume_repo

    async def execute(self, user_id: uuid.UUID, resume_id: uuid.UUID, new_title: str) -> Resume:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        resume.title = new_title
        resume.updated_at = datetime.now(UTC)
        await self._resume_repo.update(resume)
        return resume
