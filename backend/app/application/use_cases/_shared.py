"""Shared helper for every use case that operates on a single resume by ID.

Centralized specifically because this is a security check, not just deduplication:
returning NotFoundError (never ForbiddenError) for a resume that exists but belongs to
someone else means a user gets an identical response whether the ID doesn't exist at all
or just isn't theirs — this avoids leaking which resume IDs are real to someone probing.
"""

import uuid

from app.application.interfaces.repositories import ResumeRepository
from app.core.exceptions import NotFoundError
from app.domain.entities.resume import Resume


async def get_owned_resume(
    resume_repo: ResumeRepository, user_id: uuid.UUID, resume_id: uuid.UUID
) -> Resume:
    resume = await resume_repo.get_by_id(resume_id)
    if resume is None or resume.user_id != user_id:
        raise NotFoundError("Resume not found")
    return resume
