"""Async SQLAlchemy engine and session factory, plus the FastAPI dependency that hands
a session to each request.

Why async: FastAPI's whole performance story is non-blocking I/O — while one request
is waiting on a database round-trip, the event loop serves other requests instead of
sitting idle in a thread. `asyncpg` (the driver) + SQLAlchemy's `AsyncSession` are what
make that possible for Postgres specifically.

Why a generator dependency: `get_db` yields a session and the `finally` block guarantees
it's closed even if the request raises — FastAPI treats a `yield`-ing dependency as a
context manager for the lifetime of the request.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, echo=not settings.is_production)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
