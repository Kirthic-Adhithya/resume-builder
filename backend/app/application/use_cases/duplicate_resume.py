import uuid
from datetime import UTC, datetime

from app.application.interfaces.repositories import ResumeRepository
from app.application.use_cases._shared import get_owned_resume
from app.domain.entities.resume import Resume


class DuplicateResume:
    def __init__(self, resume_repo: ResumeRepository) -> None:
        self._resume_repo = resume_repo

    async def execute(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> Resume:
        original = await get_owned_resume(self._resume_repo, user_id, resume_id)
        now = datetime.now(UTC)
        copy = Resume(
            id=uuid.uuid4(),
            user_id=user_id,
            title=f"{original.title} (copy)",
            content=original.content,
            created_at=now,
            updated_at=now,
        )
        await self._resume_repo.create(copy)
        return copy
