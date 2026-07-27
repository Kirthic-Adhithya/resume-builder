"""Aggregates every feature router under a single /api/v1 prefix.

As we build features, each gets its own module here (auth.py, resumes.py, ai.py, ...)
and is registered with `api_router.include_router(...)`. main.py only ever imports this
one `api_router` — it doesn't need to know how many feature routers exist underneath.
"""

from fastapi import APIRouter

from app.presentation.api.v1.auth import router as auth_router
from app.presentation.api.v1.health import router as health_router
from app.presentation.api.v1.resumes import router as resumes_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(resumes_router)
