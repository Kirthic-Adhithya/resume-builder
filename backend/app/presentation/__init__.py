"""Presentation layer — the HTTP boundary. FastAPI routers and Pydantic I/O schemas.

Rules for this package:
- Routers parse the request, call one `application` use case, and shape the response.
  No business logic lives here — if a router has an `if` statement deciding business
  rules, that logic belongs in `application` instead.
- Pydantic schemas here (request/response models) are distinct from domain entities.
  A domain `User` might carry a `hashed_password`; a `UserResponse` schema never does.
"""
