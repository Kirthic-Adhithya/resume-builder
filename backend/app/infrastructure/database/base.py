"""Declarative base for all SQLAlchemy ORM models.

Every ORM model (in infrastructure/database/models/) inherits from this Base. Alembic's
env.py points its autogenerate diffing at `Base.metadata`, which is how `alembic revision
--autogenerate` figures out what changed between your models and the actual database schema.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
