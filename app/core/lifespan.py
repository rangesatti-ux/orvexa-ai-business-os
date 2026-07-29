from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.logging_config import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Orvexa AI Business OS...")

    yield

    logger.info("Stopping Orvexa AI Business OS...")