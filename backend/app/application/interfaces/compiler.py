from typing import Protocol


class LatexCompiler(Protocol):
    async def compile_to_pdf(self, source: str) -> bytes: ...
