"""Application layer — use cases that orchestrate domain entities to fulfil a user goal.

Rules for this package:
- May import from `domain`.
- Must NOT import SQLAlchemy, FastAPI, or the OpenAI SDK directly. Instead it defines
  abstract interfaces (e.g. a `UserRepository` Protocol) that `infrastructure` implements.
  This is the Dependency Inversion Principle in action: application depends on an
  abstraction it owns, not on a concrete library.
- A "use case" here is one user-facing action: RegisterUser, AnalyzeResumeAgainstJobDescription,
  ExportResumeToPdf. Each is a class or function with a single `execute()` entry point,
  independently unit-testable with fake repositories — no database required.
"""
