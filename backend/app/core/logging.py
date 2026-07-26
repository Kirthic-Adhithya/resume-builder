"""Logging configuration.

Deliberately using the standard library's logging module, not a third-party framework —
one less dependency, and it's enough until we have a real reason (structured log aggregation
in a hosted environment) to reach for something like structlog.
"""

import logging
import sys


def setup_logging(environment: str) -> None:
    level = logging.INFO if environment == "production" else logging.DEBUG
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        stream=sys.stdout,
    )
