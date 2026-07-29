import uuid

from app.application.interfaces.repositories import ChatMessageRepository, ResumeRepository
from app.application.use_cases._shared import get_owned_resume
from app.domain.entities.chat_message import ChatMessage


class ListChatMessages:
    def __init__(self, resume_repo: ResumeRepository, chat_repo: ChatMessageRepository) -> None:
        self._resume_repo = resume_repo
        self._chat_repo = chat_repo

    async def execute(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> list[ChatMessage]:
        await get_owned_resume(self._resume_repo, user_id, resume_id)
        return await self._chat_repo.list_for_resume(resume_id)
