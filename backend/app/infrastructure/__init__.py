"""Infrastructure layer — the outermost circle. Concrete, swappable implementation details.

This is the only layer allowed to import SQLAlchemy, the OpenAI SDK, passlib, etc.
It implements the interfaces defined in `application.interfaces` and provides low-level
technical services: database sessions (`infrastructure/database`), repository
implementations (`infrastructure/repositories`), and external API clients
(`infrastructure/external`, e.g. the AI provider wrapper).

Swapping Postgres for another database, or OpenAI for Anthropic, means changing files
only in this layer.
"""
