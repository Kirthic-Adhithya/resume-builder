"""Compiles LaTeX source to PDF using Tectonic, run as a sandboxed subprocess.

Security model: we're compiling text a user typed, which is a known attack vector for
traditional LaTeX engines via \\write18 shell-escape (arbitrary shell command execution).
Tectonic has no shell-escape unless explicitly enabled with -Z shell-escape — we never
pass that flag, so the compiler cannot execute arbitrary commands regardless of what's
in the source. On top of that: each compile gets its own fresh temp directory (no shared
state between concurrent requests), and a hard timeout so a pathological input (e.g. an
infinite macro expansion) can't hang the server indefinitely.
"""

import asyncio
import shutil
import tempfile
from pathlib import Path

from app.core.exceptions import CompilationError

_COMPILE_TIMEOUT_SECONDS = 20


class TectonicCompiler:
    async def compile_to_pdf(self, source: str) -> bytes:
        workdir = Path(tempfile.mkdtemp(prefix="resume-compile-"))
        try:
            tex_path = workdir / "resume.tex"
            tex_path.write_text(source, encoding="utf-8")

            process = await asyncio.create_subprocess_exec(
                "tectonic",
                str(tex_path),
                "--outdir",
                str(workdir),
                "--outfmt",
                "pdf",
                cwd=str(workdir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                _, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=_COMPILE_TIMEOUT_SECONDS
                )
            except TimeoutError as exc:
                process.kill()
                await process.wait()
                raise CompilationError("Compilation timed out") from exc

            if process.returncode != 0:
                # Tectonic's stderr is verbose; the useful part (the actual LaTeX error)
                # is almost always at the end, so we truncate to keep the response usable.
                raise CompilationError(stderr.decode("utf-8", errors="replace")[-2000:])

            pdf_path = workdir / "resume.pdf"
            if not pdf_path.exists():
                raise CompilationError("Compilation did not produce a PDF")

            return pdf_path.read_bytes()
        finally:
            shutil.rmtree(workdir, ignore_errors=True)
