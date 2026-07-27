import uuid

from app.application.interfaces.repositories import ResumeRepository
from app.domain.entities.resume import Resume


class ListResumes:
    def __init__(self, resume_repo: ResumeRepository) -> None:
        self._resume_repo = resume_repo

    async def execute(
        self, user_id: uuid.UUID, search: str | None, page: int, page_size: int
    ) -> tuple[list[Resume], int]:
        return await self._resume_repo.list_for_user(user_id, search, page, page_size)
