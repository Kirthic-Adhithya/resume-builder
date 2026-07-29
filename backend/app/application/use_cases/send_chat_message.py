import uuid
from collections.abc import AsyncIterator

from app.application.interfaces.ai_provider import AIProvider, ChatMessageParam
from app.application.interfaces.repositories import ChatMessageRepository, ResumeRepository
from app.application.use_cases._shared import get_owned_resume

_SYSTEM_PROMPT_TEMPLATE = """You are an expert resume-writing assistant. The user's current \
resume is written in LaTeX:

---
{content}
---

Help with: analyzing the resume for clarity and impact; comparing it against a job description \
the user shares and identifying missing keywords for ATS (Applicant Tracking System) matching; \
rewriting bullet points in STAR format (Situation, Task, Action, Result) where it fits; \
suggesting stronger action verbs; and suggesting ways to quantify achievements with measurable \
results.

Always explain *why* you're recommending a change, not just what to change. Be specific and \
concise."""


class SendChatMessage:
    """An async-generator use case — unlike every other use case so far, this doesn't return
    once; it yields response text as the model generates it, so the route can forward each
    piece to the browser immediately instead of waiting for the full reply.
    """

    def __init__(
        self,
        resume_repo: ResumeRepository,
        chat_repo: ChatMessageRepository,
        ai_provider: AIProvider,
    ) -> None:
        self._resume_repo = resume_repo
        self._chat_repo = chat_repo
        self._ai_provider = ai_provider

    async def execute(
        self, user_id: uuid.UUID, resume_id: uuid.UUID, user_text: str
    ) -> AsyncIterator[str]:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        history = await self._chat_repo.list_for_resume(resume.id)

        messages: list[ChatMessageParam] = [
            {"role": "system", "content": _SYSTEM_PROMPT_TEMPLATE.format(content=resume.content)}
        ]
        messages.extend({"role": message.role, "content": message.content} for message in history)
        messages.append({"role": "user", "content": user_text})

        await self._chat_repo.create(resume.id, "user", user_text)

        full_response = ""
        try:
            async for delta in self._ai_provider.stream_chat_completion(messages):
                full_response += delta
                yield delta
        finally:
            # Saved even on a dropped connection or provider error, so a cut-off reply
            # still shows up in history next time instead of silently vanishing.
            if full_response:
                await self._chat_repo.create(resume.id, "assistant", full_response)
