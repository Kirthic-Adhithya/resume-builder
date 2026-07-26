import uuid
from typing import Protocol

from app.domain.entities.user import User


class UserRepository(Protocol):
    async def get_by_email(self, email: str) -> User | None: ...

    async def get_by_id(self, user_id: uuid.UUID) -> User | None: ...

    async def save(self, user: User) -> None: ...
