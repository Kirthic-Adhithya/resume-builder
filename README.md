# Resume Builder

An AI-powered, LaTeX-based resume builder — write your resume in real LaTeX with a
live PDF preview, and chat with an AI assistant that reads your resume and suggests
concrete improvements as you write.

Built as both a production-quality application and a guided software-engineering
learning project, following Clean Architecture end to end.

## Features

- **Auth** — email/password registration and login, JWT-based sessions, protected routes
- **Dashboard** — searchable, paginated resume list with rename, duplicate, and delete
- **Template gallery** — pick from a dozen starter layouts when creating a resume
- **Editor** — Monaco-powered LaTeX editor with a live, resizable split-pane PDF preview
  that recompiles as you type
- **Version history** — every saved change is snapshotted, with a retention policy (last
  5 versions, or anything from the last hour) so history doesn't grow unbounded
- **AI assistant** — a streaming chat panel, scoped to the current resume, for rewrite
  suggestions, keyword matching, and STAR-format bullet points
- **Export** — download as PDF, raw LaTeX (`.tex`), or a JSON backup
- **Settings** — light/dark theme, change password

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack
  Query, React Hook Form + Zod, Monaco Editor, shadcn/ui (Radix primitives), Sonner
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, PostgreSQL,
  Pydantic v2, JWT auth (pyjwt), Groq (OpenAI-compatible SDK) for AI chat
- **LaTeX compilation:** Tectonic, run as a sandboxed subprocess per compile
- **Architecture:** Clean Architecture (domain / application / infrastructure /
  presentation), Repository Pattern via Python `Protocol`s, dependency injection via
  FastAPI `Depends()`
- **Infra:** Docker Compose (Postgres, FastAPI backend, Vite dev server)

## Quick start

```bash
cp .env.example .env   # fill in JWT_SECRET_KEY and GROQ_API_KEY (see below)
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/api/docs

### Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres, backend | |
| `JWT_SECRET_KEY` | backend | Generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `GROQ_API_KEY` | backend | Free tier, no credit card required — https://console.groq.com/keys |
| `CORS_ORIGINS` | backend | e.g. `http://localhost:5173` |
| `VITE_API_BASE_URL` | frontend | e.g. `http://localhost:8000` |

## Project structure

```
backend/
  app/
    domain/          # entities, repository Protocols — no framework imports
    application/      # use cases (one class per business operation)
    infrastructure/  # SQLAlchemy repositories, Tectonic compiler, Groq client
    presentation/     # FastAPI routes, Pydantic schemas
frontend/
  src/
    app/             # router, providers, shared layout
    features/        # auth, dashboard, editor, chat — each with its own api.ts
    components/ui/   # shadcn/ui primitives
    lib/             # api client, auth token storage, theme, template catalog
```

## Project status

All core phases complete: Auth, Dashboard, Editor (LaTeX + live compile + version
history), AI Assistant chat, Export, and Settings — plus a full UI redesign (design
system, template gallery, resizable editor panes, toast notifications).
