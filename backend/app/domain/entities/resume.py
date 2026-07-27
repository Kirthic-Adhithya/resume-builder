import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Resume:
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
