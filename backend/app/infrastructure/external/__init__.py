"""Third-party API clients, wrapped behind an interface owned by `application`.

This is where the OpenAI SDK (and later, optionally, Anthropic) actually gets imported —
nowhere else in the codebase. `AIProviderClient` (added in the AI Assistant phase) will
implement an `application.interfaces.ai_provider.AIProvider` Protocol, so use cases call
`ai_provider.suggest_bullet_improvement(...)` without knowing or caring which vendor SDK
is underneath.
"""
