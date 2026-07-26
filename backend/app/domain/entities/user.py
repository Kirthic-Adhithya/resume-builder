import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    id: uuid.UUID
    email: str
    hashed_password: str
    created_at: datetime

    def __post_init__(self) -> None:
        self.email = self.email.strip().lower()
