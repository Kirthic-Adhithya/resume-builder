"""Application entry point.

Uses the "app factory" pattern (`create_app()` instead of a bare module-level `app`) so
tests can spin up isolated instances with different settings, and so nothing runs at
import time except wiring — no side effects just from `import app.main`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.presentation.api.v1.router import api_router


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(settings.environment)

    app = FastAPI(
        title="Resume Builder API",
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router)

    return app


app = create_app()
