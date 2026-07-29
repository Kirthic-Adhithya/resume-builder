import uuid
from typing import Protocol

from app.domain.entities.chat_message import ChatMessage, Role
from app.domain.entities.resume import Resume
from app.domain.entities.resume_version import ResumeVersion
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


class ResumeVersionRepository(Protocol):
    async def create_snapshot(
        self, resume_id: uuid.UUID, title: str, content: str
    ) -> ResumeVersion: ...

    async def list_for_resume(self, resume_id: uuid.UUID) -> list[ResumeVersion]: ...

    async def get_by_id(self, version_id: uuid.UUID) -> ResumeVersion | None: ...

    async def delete(self, version_id: uuid.UUID) -> None: ...

    async def prune_old_versions(
        self, resume_id: uuid.UUID, keep_recent_hours: int, min_keep_count: int
    ) -> None: ...


class ChatMessageRepository(Protocol):
    async def create(self, resume_id: uuid.UUID, role: Role, content: str) -> ChatMessage: ...

    async def list_for_resume(self, resume_id: uuid.UUID) -> list[ChatMessage]: ...
