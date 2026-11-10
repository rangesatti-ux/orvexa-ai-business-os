from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to inject standard security headers into all HTTP responses."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent browsers from MIME-sniffing a response away from the declared content-type
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent the page from being displayed in a iframe (clickjacking protection)
        response.headers["X-Frame-Options"] = "DENY"

        # Control how much referrer information is included with requests
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Enable cross-site scripting (XSS) filtering built into browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Enforce secure (HTTP over SSL/TLS) connections for 1 year
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response