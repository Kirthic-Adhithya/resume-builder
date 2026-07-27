"""FastAPI dependency providers.

This is the composition root: the one place in the whole codebase where a concrete
infrastructure class (SqlAlchemyUserRepository, JwtTokenService, ...) gets constructed
and handed to a route as an instance of the interface application/ defines. Routes never
construct these themselves — they only ever type-hint against the interface.
"""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.interfaces.repositories import ResumeRepository, UserRepository
from app.application.interfaces.security import PasswordHasher, TokenService
from app.application.use_cases.get_current_user import GetCurrentUser
from app.core.config import Settings, get_settings
from app.domain.entities.user import User
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.resume_repository import SqlAlchemyResumeRepository
from app.infrastructure.repositories.user_repository import SqlAlchemyUserRepository
from app.infrastructure.security.jwt_token_service import JwtTokenService
from app.infrastructure.security.passlib_hasher import PasslibPasswordHasher

_bearer_scheme = HTTPBearer()


def get_user_repository(db: Annotated[AsyncSession, Depends(get_db)]) -> UserRepository:
    return SqlAlchemyUserRepository(db)


def get_resume_repository(db: Annotated[AsyncSession, Depends(get_db)]) -> ResumeRepository:
    return SqlAlchemyResumeRepository(db)


def get_password_hasher() -> PasswordHasher:
    return PasslibPasswordHasher()


def get_token_service(settings: Annotated[Settings, Depends(get_settings)]) -> TokenService:
    return JwtTokenService(settings)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)],
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
    token_service: Annotated[TokenService, Depends(get_token_service)],
) -> User:
    return await GetCurrentUser(user_repo, token_service).execute(credentials.credentials)
