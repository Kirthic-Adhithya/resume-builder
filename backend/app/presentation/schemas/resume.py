import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResumeCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class ResumeRenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime


class ResumeListResponse(BaseModel):
    items: list[ResumeResponse]
    total: int
    page: int
    page_size: int
