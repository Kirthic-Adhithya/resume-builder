"""Groq implementation of AIProvider.

Groq exposes an OpenAI-compatible API, so this reuses the `openai` package already in
requirements.txt — just pointed at Groq's base URL with a Groq key — instead of adding a
second SDK. `application` never imports `openai` directly or knows this detail; it only
ever sees the `AIProvider` Protocol. Swapping to a different provider later (Anthropic,
real OpenAI, anything) means changing only this file.
"""

from collections.abc import AsyncIterator
from typing import cast

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam

from app.application.interfaces.ai_provider import ChatMessageParam
from app.core.config import Settings

_GROQ_BASE_URL = "https://api.groq.com/openai/v1"


class GroqAIProvider:
    def __init__(self, settings: Settings) -> None:
        self._client = AsyncOpenAI(api_key=settings.groq_api_key, base_url=_GROQ_BASE_URL)
        self._model = settings.groq_model

    async def stream_chat_completion(self, messages: list[ChatMessageParam]) -> AsyncIterator[str]:
        # Our ChatMessageParam is intentionally a plain {role: str, content: str} — the SDK's
        # own type is a union of per-role TypedDicts with literal role values, which is more
        # precise than we need here. Casting (rather than `# type: ignore`) keeps mypy strict
        # everywhere else in this call, and it also fixes overload resolution below: with the
        # exact expected type visible, mypy correctly infers `stream=True` returns
        # AsyncStream[ChatCompletionChunk], not a Union that isn't async-iterable.
        stream = await self._client.chat.completions.create(
            model=self._model,
            messages=cast(list[ChatCompletionMessageParam], messages),
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
