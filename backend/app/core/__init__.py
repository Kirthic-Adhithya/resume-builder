"""Cross-cutting concerns shared by every layer: settings, logging, base exceptions.

Nothing in here talks to a database or an HTTP framework — it's pure Python configuration
that domain/application/infrastructure/presentation all depend on directly.
"""
