"""Application settings, loaded once from environment variables / .env.

Using pydantic-settings instead of raw os.environ gives us validation at startup
(fail fast with a clear error if JWT_SECRET_KEY is missing) instead of a confusing
AttributeError three requests into production.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    database_url: str

    @field_validator("database_url")
    @classmethod
    def _use_asyncpg_driver(cls, value: str) -> str:
        # Managed Postgres providers (e.g. Render) hand out a bare `postgres://` or
        # `postgresql://` URL. SQLAlchemy's async engine requires an async-capable
        # driver in the scheme, and this project only installs asyncpg (no
        # psycopg2) — without this rewrite, create_async_engine() fails outright.
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix) and "+asyncpg" not in value:
                return "postgresql+asyncpg://" + value[len(prefix) :]
        return value

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached so Settings() — which reads the environment and .env — only runs once per process.

    FastAPI routes pull this via `Depends(get_settings)`, which also makes it trivial
    to override with test settings in pytest fixtures.
    """
    return Settings()
