import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.resume_version import ResumeVersion
from app.infrastructure.database.models.resume_version import ResumeVersionModel


class SqlAlchemyResumeVersionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_snapshot(
        self, resume_id: uuid.UUID, title: str, content: str
    ) -> ResumeVersion:
        model = ResumeVersionModel(
            id=uuid.uuid4(), resume_id=resume_id, title=title, content=content
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)

    async def list_for_resume(self, resume_id: uuid.UUID) -> list[ResumeVersion]:
        result = await self._session.execute(
            select(ResumeVersionModel)
            .where(ResumeVersionModel.resume_id == resume_id)
            .order_by(ResumeVersionModel.created_at.desc())
        )
        return [self._to_domain(model) for model in result.scalars().all()]

    async def get_by_id(self, version_id: uuid.UUID) -> ResumeVersion | None:
        result = await self._session.execute(
            select(ResumeVersionModel).where(ResumeVersionModel.id == version_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model is not None else None

    async def delete(self, version_id: uuid.UUID) -> None:
        model = await self._session.get(ResumeVersionModel, version_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    async def prune_old_versions(
        self, resume_id: uuid.UUID, keep_recent_hours: int, min_keep_count: int
    ) -> None:
        # Loaded in Python rather than a single DELETE ... WHERE, because "keep" here
        # depends on each row's rank among its siblings (first N), not just its own
        # column values — that's awkward to express as a plain WHERE clause, and a
        # resume's version count is small enough (tens to low hundreds) that loading
        # just id+created_at for all of them is cheap.
        result = await self._session.execute(
            select(ResumeVersionModel.id, ResumeVersionModel.created_at)
            .where(ResumeVersionModel.resume_id == resume_id)
            .order_by(ResumeVersionModel.created_at.desc())
        )
        rows = result.all()

        cutoff = datetime.now(UTC) - timedelta(hours=keep_recent_hours)
        prune_ids = [
            row.id for index, row in enumerate(rows) if index >= min_keep_count and row.created_at < cutoff
        ]

        if prune_ids:
            await self._session.execute(
                delete(ResumeVersionModel).where(ResumeVersionModel.id.in_(prune_ids))
            )
            await self._session.commit()

    @staticmethod
    def _to_domain(model: ResumeVersionModel) -> ResumeVersion:
        return ResumeVersion(
            id=model.id,
            resume_id=model.resume_id,
            title=model.title,
            content=model.content,
            created_at=model.created_at,
        )
