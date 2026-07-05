from collections import defaultdict, deque
from time import monotonic

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS" or request.url.path == "/api/health":
            return await call_next(request)

        settings = get_settings()
        window = settings.rate_limit_window_seconds
        max_requests = settings.auth_rate_limit_max_requests if request.url.path in {"/api/user/login", "/api/user/signup"} else settings.rate_limit_max_requests
        key = f"{self._client_ip(request)}:{request.url.path}"
        now = monotonic()
        bucket = self._requests[key]
        while bucket and now - bucket[0] > window:
            bucket.popleft()
        if len(bucket) >= max_requests:
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(window)},
                content={"status": 429, "message": "Too many requests. Please try again shortly."},
            )
        bucket.append(now)
        return await call_next(request)

    @staticmethod
    def _client_ip(request) -> str:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",", 1)[0].strip()
        return request.client.host if request.client else "unknown"
