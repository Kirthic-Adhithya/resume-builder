import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.chat_message import ChatMessage, Role
from app.infrastructure.database.models.chat_message import ChatMessageModel


class SqlAlchemyChatMessageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, resume_id: uuid.UUID, role: Role, content: str) -> ChatMessage:
        model = ChatMessageModel(id=uuid.uuid4(), resume_id=resume_id, role=role, content=content)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_domain(model)

    async def list_for_resume(self, resume_id: uuid.UUID) -> list[ChatMessage]:
        result = await self._session.execute(
            select(ChatMessageModel)
            .where(ChatMessageModel.resume_id == resume_id)
            .order_by(ChatMessageModel.created_at.asc())
        )
        return [self._to_domain(model) for model in result.scalars().all()]

    @staticmethod
    def _to_domain(model: ChatMessageModel) -> ChatMessage:
        role: Role = "user" if model.role == "user" else "assistant"
        return ChatMessage(
            id=model.id,
            resume_id=model.resume_id,
            role=role,
            content=model.content,
            created_at=model.created_at,
        )
