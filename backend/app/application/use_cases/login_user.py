from app.application.interfaces.repositories import UserRepository
from app.application.interfaces.security import PasswordHasher, TokenService
from app.core.exceptions import UnauthorizedError
from app.domain.entities.user import User


class LoginUser:
    def __init__(
        self,
        user_repo: UserRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
    ) -> None:
        self._user_repo = user_repo
        self._password_hasher = password_hasher
        self._token_service = token_service

    async def execute(self, email: str, password: str) -> tuple[User, str]:
        user = await self._user_repo.get_by_email(email)
        if user is None or not self._password_hasher.verify(password, user.hashed_password):
            raise UnauthorizedError("Incorrect email or password")

        token = self._token_service.create_access_token(user.id)
        return user, token
