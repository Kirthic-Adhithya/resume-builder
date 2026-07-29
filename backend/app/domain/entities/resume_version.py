import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ResumeVersion:
    id: uuid.UUID
    resume_id: uuid.UUID
    title: str
    content: str
    created_at: datetime
