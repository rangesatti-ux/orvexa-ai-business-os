import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to inject or propagate a unique request ID for distributed tracing."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check for existing request ID header from upstream proxy / gateway
        request_id = request.headers.get("X-Request-ID")
        
        if not request_id:
            request_id = str(uuid.uuid4())

        # Attach to request state for access in route handlers and logging
        request.state.request_id = request_id

        response: Response = await call_next(request)

        # Attach request ID to outgoing response headers
        response.headers["X-Request-ID"] = request_id

        return response