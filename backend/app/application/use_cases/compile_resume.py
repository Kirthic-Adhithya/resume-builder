import uuid

from app.application.interfaces.compiler import LatexCompiler
from app.application.interfaces.repositories import ResumeRepository
from app.application.use_cases._shared import get_owned_resume


class CompileResume:
    def __init__(self, resume_repo: ResumeRepository, compiler: LatexCompiler) -> None:
        self._resume_repo = resume_repo
        self._compiler = compiler

    async def execute(self, user_id: uuid.UUID, resume_id: uuid.UUID) -> bytes:
        resume = await get_owned_resume(self._resume_repo, user_id, resume_id)
        return await self._compiler.compile_to_pdf(resume.content)
