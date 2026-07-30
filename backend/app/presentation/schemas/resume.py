import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResumeCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    template: str = "blank"


class ResumeUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = None


class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime


class ResumeDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class ResumeListResponse(BaseModel):
    items: list[ResumeResponse]
    total: int
    page: int
    page_size: int


class ResumeVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime


class CompileRequest(BaseModel):
    # Optional: lets the Editor compile exactly what's in Monaco right now, without
    # waiting for an autosave round-trip to finish first. Omitted (or no body at all)
    # falls back to compiling the last-saved content — what /export/pdf always wants.
    content: str | None = None
