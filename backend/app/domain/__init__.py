"""Domain layer — the innermost circle. Business entities and rules only.

Rules for this package:
- No imports from FastAPI, SQLAlchemy, Pydantic, or any other framework.
- No knowledge of HTTP, JSON, or SQL.
- Entities here are plain Python (dataclasses), representing concepts like User or Resume
  purely in terms of the business rules that govern them (e.g. "a resume title cannot be
  empty"), independent of how they're stored or served.

This is the layer that would survive unchanged if we replaced FastAPI with Django, or
Postgres with MongoDB. Kept deliberately empty until Phase 1 (Auth) adds the first entity.
"""
