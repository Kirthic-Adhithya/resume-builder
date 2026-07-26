"""Abstract interfaces (Python Protocols) that `infrastructure` implements.

Example: `application/interfaces/repositories.py` will define `UserRepository` as a
`typing.Protocol` with methods like `get_by_email`, `save`. `infrastructure/repositories/`
will provide `SqlAlchemyUserRepository`, injected via FastAPI's `Depends()` at request time.
Use cases in `application` type-hint against the Protocol, never the concrete class.
"""
