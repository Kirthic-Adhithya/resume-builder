import uuid

from app.application.interfaces.repositories import UserRepository
from app.application.interfaces.security import PasswordHasher
from app.core.exceptions import ForbiddenError, NotFoundError


class ChangePassword:
    def __init__(self, user_repo: UserRepository, password_hasher: PasswordHasher) -> None:
        self._user_repo = user_repo
        self._password_hasher = password_hasher

    async def execute(self, user_id: uuid.UUID, current_password: str, new_password: str) -> None:
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")

        if not self._password_hasher.verify(current_password, user.hashed_password):
            # Deliberately not UnauthorizedError (401): the caller's session token is
            # perfectly valid — it's the submitted current_password field that's wrong.
            # apiFetch on the frontend treats any 401 as "your session is dead, log out,"
            # which would otherwise wipe a perfectly good session over a typo'd password.
            raise ForbiddenError("Current password is incorrect")

        user.hashed_password = self._password_hasher.hash(new_password)
        await self._user_repo.save(user)
