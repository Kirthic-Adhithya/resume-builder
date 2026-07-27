from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.application.interfaces.repositories import UserRepository
from app.application.interfaces.security import PasswordHasher, TokenService
from app.application.use_cases.login_user import LoginUser
from app.application.use_cases.register_user import RegisterUser
from app.domain.entities.user import User
from app.presentation.dependencies import (
    get_current_user,
    get_password_hasher,
    get_token_service,
    get_user_repository,
)
from app.presentation.schemas.auth import (
    AccountAgeResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
    password_hasher: Annotated[PasswordHasher, Depends(get_password_hasher)],
) -> User:
    return await RegisterUser(user_repo, password_hasher).execute(data.email, data.password)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
    password_hasher: Annotated[PasswordHasher, Depends(get_password_hasher)],
    token_service: Annotated[TokenService, Depends(get_token_service)],
) -> TokenResponse:
    _, token = await LoginUser(user_repo, password_hasher, token_service).execute(
        data.email, data.password
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.get("/me/age", response_model=AccountAgeResponse)
async def get_account_age(
    current_user: Annotated[User, Depends(get_current_user)],
) -> AccountAgeResponse:
    elapsed = datetime.now(UTC) - current_user.created_at
    return AccountAgeResponse(days_since_registration=elapsed.days)
