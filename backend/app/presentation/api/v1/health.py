"""Health check endpoint — used by docker-compose healthchecks and uptime monitoring.

Deliberately has no dependencies on the database yet. Once Auth/Postgres is wired up
(Phase 1), we'll extend this to also verify the DB connection, which is what lets an
orchestrator (docker-compose, k8s) tell the difference between "process is up" and
"process is up but can't reach its database."
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
