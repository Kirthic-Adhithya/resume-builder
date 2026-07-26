from app.application.interfaces.repositories import UserRepository
from app.application.interfaces.security import TokenService
from app.core.exceptions import UnauthorizedError
from app.domain.entities.user import User


class GetCurrentUser:
    def __init__(self, user_repo: UserRepository, token_service: TokenService) -> None:
        self._user_repo = user_repo
        self._token_service = token_service

    async def execute(self, token: str) -> User:
        user_id = self._token_service.decode_access_token(token)
        user = await self._user_repo.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("User no longer exists")
        return user
