FROM python:3.12-slim

WORKDIR /app

# No build-essential needed: asyncpg and bcrypt both ship manylinux wheels for this
# base image, so pip never needs to compile anything.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
