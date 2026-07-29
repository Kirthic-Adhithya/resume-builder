from collections.abc import AsyncIterator
from typing import Protocol, TypedDict


class ChatMessageParam(TypedDict):
    role: str
    content: str


class AIProvider(Protocol):
    def stream_chat_completion(self, messages: list[ChatMessageParam]) -> AsyncIterator[str]:
        """Yields response text incrementally as the model generates it."""
        ...
