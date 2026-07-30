import uuid

from app.application.interfaces.compiler import LatexCompiler
from app.application.interfaces.repositories import ResumeRepository
from app.application.use_cases._shared import get_owned_resume


class CompileResume:
    def __init__(self, resume_repo: ResumeRepository, compiler: LatexCompiler) -> None:
        self._resume_repo = resume_repo
        self._compiler = compiler

    async def execute(
        self, user_id: uuid.UUID, resume_id: uuid.UUID, content_override: str | None = None
    ) -> bytes:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        # Ownership is still checked against the stored resume either way — only which
        # *content* gets compiled differs. Compiling the just-typed content directly
        # (rather than always the last-saved content) means the Editor doesn't have to
        # wait for an autosave round-trip to finish before it can even start compiling.
        content = content_override if content_override is not None else resume.content
        return await self._compiler.compile_to_pdf(content)
