"""Domain-level exceptions and the FastAPI handler that turns them into HTTP responses.

Why this exists: without it, raising a "resume not found" error from deep inside a use case
means either importing FastAPI's HTTPException into the application/domain layers (violates
the dependency rule — inner layers must not know about the web framework) or letting a raw
Python exception bubble up as an unhandled 500. Instead, business code raises these plain
exceptions, and only presentation/main.py knows how to translate them into HTTP.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base class for all application-raised errors."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class AlreadyExistsError(AppError):
    status_code = status.HTTP_409_CONFLICT


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN


class CompilationError(AppError):
    """The LaTeX source itself failed to compile — a client-input problem, not a
    server error, hence 422 rather than 500."""

    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
