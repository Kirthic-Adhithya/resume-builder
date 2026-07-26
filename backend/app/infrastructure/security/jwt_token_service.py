import uuid
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import Settings
from app.core.exceptions import UnauthorizedError


class JwtTokenService:
    def __init__(self, settings: Settings) -> None:
        self._secret_key = settings.jwt_secret_key
        self._algorithm = settings.jwt_algorithm
        self._expire_minutes = settings.access_token_expire_minutes

    def create_access_token(self, user_id: uuid.UUID) -> str:
        expire = datetime.now(UTC) + timedelta(minutes=self._expire_minutes)
        payload = {"sub": str(user_id), "exp": expire}
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_access_token(self, token: str) -> uuid.UUID:
        try:
            payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
        except jwt.PyJWTError as exc:
            raise UnauthorizedError("Invalid or expired token") from exc
        return uuid.UUID(payload["sub"])
