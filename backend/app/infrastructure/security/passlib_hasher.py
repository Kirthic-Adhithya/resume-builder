from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasslibPasswordHasher:
    def hash(self, password: str) -> str:
        # passlib ships no type stubs, so CryptContext methods return Any — str()/bool()
        # here just make the already-correct runtime type explicit to mypy.
        return str(_pwd_context.hash(password))

    def verify(self, password: str, hashed_password: str) -> bool:
        return bool(_pwd_context.verify(password, hashed_password))
