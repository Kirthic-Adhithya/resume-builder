FROM python:3.12-slim

WORKDIR /app

# Runtime deps for Tectonic (LaTeX engine): fontconfig for font discovery, ca-certificates
# so it can fetch missing LaTeX packages from its bundle over HTTPS, curl to install it.
#
# Switched apt's mirror URLs from http:// to https://: on this network, plain HTTP to
# deb.debian.org was reliably timing out / stalling per-package (830+ seconds, still
# failing) while every HTTPS-based download in this project (npm, pip, docker pulls,
# the Tectonic installer below) worked fine — pointing at something on this network path
# throttling/blocking port 80 specifically, not an actual Debian mirror problem.
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/*.sources \
    && apt-get update && apt-get install -y --no-install-recommends \
        fontconfig \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Tectonic: self-contained LaTeX engine (~100MB vs several GB for full TeX Live), and
# safe to run on untrusted input by default — unlike pdflatex, it has no \write18
# shell-escape unless explicitly enabled, which we never do. See
# infrastructure/external/tectonic_compiler.py for how it's invoked.
#
# Pulled directly from GitHub Releases (musl static binary, no glibc-version coupling)
# rather than the project's own install-script host — that host's TLS handshake was
# reliably failing on this network ("unexpected eof"), while github.com was solid
# throughout this project's build, matching the same "some hosts are unreliable on this
# network, GitHub isn't" pattern as the apt-over-HTTPS fix above.
RUN curl -fsSL \
        https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.17.0/tectonic-0.17.0-x86_64-unknown-linux-musl.tar.gz \
        -o /tmp/tectonic.tar.gz \
    && tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin \
    && rm /tmp/tectonic.tar.gz

# Tectonic fetches its LaTeX format/font/package bundle from the network on first use
# (confirmed: ~250 files, several minutes) and caches it thereafter. Baking a warm-up
# compile into the image means that cost is paid once at build time, not by whichever
# user happens to trigger the first real compile. Uses the same packages as our "simple"
# template (domain/resume_templates.py) so those specifically are guaranteed cached.
RUN mkdir -p /tmp/warmup && cd /tmp/warmup \
    && printf '%s\n' \
        '\documentclass[11pt]{article}' \
        '\usepackage[margin=1in]{geometry}' \
        '\usepackage{enumitem}' \
        '\begin{document}' \
        'warmup' \
        '\end{document}' \
        > warmup.tex \
    && tectonic warmup.tex --outfmt pdf \
    && cd / && rm -rf /tmp/warmup

# No build-essential needed: asyncpg and bcrypt both ship manylinux wheels for this
# base image, so pip never needs to compile anything.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec-form JSON array) so ${PORT:-8000} and the && chain actually
# work — Render and most PaaS hosts inject PORT at runtime and expect the process to
# bind to it, with 8000 as a sane local-Docker-run fallback. No --reload here: that's
# dev-only file-watching, and local dev instead overrides this CMD via
# docker-compose.yaml's `command:` (bind-mounted source + --reload).
#
# `alembic upgrade head` runs on every container start, not just the first deploy —
# free-tier Render has no paid-only "pre-deploy command" step, so this is the
# free-tier-compatible way to guarantee migrations are applied before the app starts
# serving traffic. It's a no-op (one quick "what revision are we at" query) once
# already at head, so re-running it on every spin-up-from-idle is harmless.
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
