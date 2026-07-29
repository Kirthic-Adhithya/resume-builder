import uuid
from datetime import UTC, datetime

from app.application.interfaces.repositories import ResumeRepository, ResumeVersionRepository
from app.application.use_cases._shared import get_owned_resume
from app.domain.entities.resume import Resume

# Retention policy: keep every version from the last hour in full (an active editing
# session shouldn't lose granularity), but never prune below this many versions total —
# so a resume nobody has touched in months still keeps some history, not zero.
_VERSION_RETENTION_HOURS = 1
_MIN_VERSIONS_TO_KEEP = 5


class UpdateResume:
    """Handles both the Dashboard's rename (title only) and the Editor's autosave
    (content, sometimes title too) — both are just partial updates to the same resource.

    A version snapshot is recorded whenever content actually changes, so the Editor's
    version history has something to show. Title-only renames don't snapshot — there's
    nothing meaningful to version there. After each new snapshot, old ones outside the
    retention policy above get pruned — see ResumeVersionRepository.prune_old_versions.
    """

    def __init__(
        self, resume_repo: ResumeRepository, version_repo: ResumeVersionRepository
    ) -> None:
        self._resume_repo = resume_repo
        self._version_repo = version_repo

    async def execute(
        self,
        user_id: uuid.UUID,
        resume_id: uuid.UUID,
        title: str | None,
        content: str | None,
    ) -> Resume:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        content_changed = content is not None and content != resume.content

        if title is not None:
            resume.title = title
        if content is not None:
            resume.content = content
        resume.updated_at = datetime.now(UTC)

        await self._resume_repo.update(resume)

        if content_changed:
            await self._version_repo.create_snapshot(resume.id, resume.title, resume.content)
            await self._version_repo.prune_old_versions(
                resume.id, _VERSION_RETENTION_HOURS, _MIN_VERSIONS_TO_KEEP
            )

        return resume
