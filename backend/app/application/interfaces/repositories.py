import uuid
from typing import Protocol

from app.domain.entities.resume import Resume
from app.domain.entities.user import User


class UserRepository(Protocol):
    async def get_by_email(self, email: str) -> User | None: ...

    async def get_by_id(self, user_id: uuid.UUID) -> User | None: ...

    async def save(self, user: User) -> None: ...


class ResumeRepository(Protocol):
    async def create(self, resume: Resume) -> None: ...

    async def get_by_id(self, resume_id: uuid.UUID) -> Resume | None: ...

    async def list_for_user(
        self, user_id: uuid.UUID, search: str | None, page: int, page_size: int
    ) -> tuple[list[Resume], int]: ...

    async def update(self, resume: Resume) -> None: ...

    async def delete(self, resume_id: uuid.UUID) -> None: ...
