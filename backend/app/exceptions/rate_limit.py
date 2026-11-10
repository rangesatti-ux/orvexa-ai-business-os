import logging
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request

logger = logging.getLogger(__name__)


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Handle rate limit exceeded exceptions and return a standardized JSON response."""
    client_ip = request.client.host if request.client else "unknown"
    logger.warning(f"Rate limit exceeded for IP: {client_ip} on path: {request.url.path}")

    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "status_code": 429,
            "message": "Too many requests. Please try again later.",
        },
    )