import uuid
from datetime import UTC, datetime

from app.application.interfaces.repositories import UserRepository
from app.application.interfaces.security import PasswordHasher
from app.core.exceptions import AlreadyExistsError
from app.domain.entities.user import User


class RegisterUser:
    def __init__(self, user_repo: UserRepository, password_hasher: PasswordHasher) -> None:
        self._user_repo = user_repo
        self._password_hasher = password_hasher

    async def execute(self, email: str, password: str) -> User:
        if await self._user_repo.get_by_email(email) is not None:
            raise AlreadyExistsError("An account with this email already exists")

        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=self._password_hasher.hash(password),
            created_at=datetime.now(UTC),
        )
        await self._user_repo.save(user)
        return user
