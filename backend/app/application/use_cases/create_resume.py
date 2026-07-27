import uuid
from datetime import UTC, datetime

from app.application.interfaces.repositories import ResumeRepository
from app.domain.entities.resume import Resume


class CreateResume:
    def __init__(self, resume_repo: ResumeRepository) -> None:
        self._resume_repo = resume_repo

    async def execute(self, user_id: uuid.UUID, title: str) -> Resume:
        now = datetime.now(UTC)
        resume = Resume(
            id=uuid.uuid4(),
            user_id=user_id,
            title=title,
            content="",
            created_at=now,
            updated_at=now,
        )
        await self._resume_repo.create(resume)
        return resume
