
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.logging_config import logger
from app.database.connection import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Orvexa AI Business OS...")

    # Create missing database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")

    yield

    logger.info("Stopping Orvexa AI Business OS...")
