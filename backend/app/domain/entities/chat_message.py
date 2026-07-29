import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Literal

Role = Literal["user", "assistant"]


@dataclass
class ChatMessage:
    id: uuid.UUID
    resume_id: uuid.UUID
    role: Role
    content: str
    created_at: datetime
