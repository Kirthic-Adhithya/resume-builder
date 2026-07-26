# Resume Builder

An AI-powered, LaTeX-based resume builder — write your resume in LaTeX with a live
preview, get AI suggestions scored against a target job description (ATS keyword
matching, STAR-format bullet rewrites, action-verb improvements).

Built as both a production-quality application and a guided software-engineering
learning project.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query,
  React Hook Form + Zod, Monaco Editor, shadcn/ui
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, PostgreSQL,
  Pydantic v2, JWT auth, OpenAI SDK (swappable provider)
- **Architecture:** Clean Architecture (domain / application / infrastructure /
  presentation)

## Quick start

```bash
cp .env.example .env   # fill in JWT_SECRET_KEY and OPENAI_API_KEY
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/api/docs

## Project status

Phase 0 (Foundation) and Phase 1 (Auth — register/login/JWT/protected routes) complete.
