"""Chat endpoints for the AI Assistant — scoped per resume, since every piece of advice
is grounded in that resume's own content (see SendChatMessage's system prompt).

POST streams via Server-Sent Events rather than the browser's native EventSource API:
EventSource only supports GET and can't send an Authorization header, and this endpoint
needs both (it's a POST carrying the message body, and it's a protected route). The
frontend instead reads the streaming fetch() response body directly.
"""

import json
import uuid
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.application.interfaces.ai_provider import AIProvider
from app.application.interfaces.repositories import ChatMessageRepository, ResumeRepository
from app.application.use_cases.list_chat_messages import ListChatMessages
from app.application.use_cases.send_chat_message import SendChatMessage
from app.domain.entities.chat_message import ChatMessage
from app.domain.entities.user import User
from app.presentation.dependencies import (
    get_ai_provider,
    get_chat_message_repository,
    get_current_user,
    get_resume_repository,
)
from app.presentation.schemas.chat import ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/resumes/{resume_id}/chat", tags=["chat"])


@router.get("", response_model=list[ChatMessageResponse])
async def list_chat_messages(
    resume_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    chat_repo: Annotated[ChatMessageRepository, Depends(get_chat_message_repository)],
) -> list[ChatMessage]:
    return await ListChatMessages(resume_repo, chat_repo).execute(current_user.id, resume_id)


@router.post("")
async def send_chat_message(
    resume_id: uuid.UUID,
    data: ChatMessageRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    resume_repo: Annotated[ResumeRepository, Depends(get_resume_repository)],
    chat_repo: Annotated[ChatMessageRepository, Depends(get_chat_message_repository)],
    ai_provider: Annotated[AIProvider, Depends(get_ai_provider)],
) -> StreamingResponse:
    use_case = SendChatMessage(resume_repo, chat_repo, ai_provider)

    async def event_stream() -> AsyncIterator[str]:
        async for delta in use_case.execute(current_user.id, resume_id, data.message):
            yield f"data: {json.dumps({'delta': delta})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
