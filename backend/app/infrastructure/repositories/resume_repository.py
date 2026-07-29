import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.resume import Resume
from app.infrastructure.database.models.resume import ResumeModel


class SqlAlchemyResumeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, resume: Resume) -> None:
        model = ResumeModel(
            id=resume.id,
            user_id=resume.user_id,
            title=resume.title,
            content=resume.content,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        resume.created_at = model.created_at
        resume.updated_at = model.updated_at

    async def get_by_id(self, resume_id: uuid.UUID) -> Resume | None:
        result = await self._session.execute(select(ResumeModel).where(ResumeModel.id == resume_id))
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model is not None else None

    async def list_for_user(
        self, user_id: uuid.UUID, search: str | None, page: int, page_size: int
    ) -> tuple[list[Resume], int]:
        base_query = select(ResumeModel).where(ResumeModel.user_id == user_id)
        count_query = (
            select(func.count()).select_from(ResumeModel).where(ResumeModel.user_id == user_id)
        )

        if search:
            pattern = f"%{search}%"
            base_query = base_query.where(ResumeModel.title.ilike(pattern))
            count_query = count_query.where(ResumeModel.title.ilike(pattern))

        total = (await self._session.execute(count_query)).scalar_one()

        offset = (page - 1) * page_size
        base_query = (
            base_query.order_by(ResumeModel.updated_at.desc()).offset(offset).limit(page_size)
        )
        rows = (await self._session.execute(base_query)).scalars().all()

        return [self._to_domain(model) for model in rows], total

    async def update(self, resume: Resume) -> None:
        model = await self._session.get(ResumeModel, resume.id)
        if model is None:
            return
        model.title = resume.title
        model.content = resume.content
        await self._session.commit()
        await self._session.refresh(model)
        resume.updated_at = model.updated_at

    async def delete(self, resume_id: uuid.UUID) -> None:
        model = await self._session.get(ResumeModel, resume_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.commit()

    @staticmethod
    def _to_domain(model: ResumeModel) -> Resume:
        return Resume(
            id=model.id,
            user_id=model.user_id,
            title=model.title,
            content=model.content,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
