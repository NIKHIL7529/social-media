from secrets import token_urlsafe

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import auth_cookie_options

CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "x-csrf-token"
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
EXEMPT_PATHS = {"/api/user/login", "/api/user/signup"}


def new_csrf_token() -> str:
    return token_urlsafe(32)


def set_csrf_cookie(request: Request, response: Response, token: str | None = None) -> str:
    csrf_token = token or new_csrf_token()
    response.set_cookie(CSRF_COOKIE, csrf_token, httponly=False, **auth_cookie_options(request))
    return csrf_token


def delete_csrf_cookie(request: Request, response: Response) -> None:
    cookie_options = auth_cookie_options(request)
    response.delete_cookie(CSRF_COOKIE, path="/", secure=cookie_options["secure"], samesite=cookie_options["samesite"])


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method not in UNSAFE_METHODS or request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        if not request.cookies.get("token"):
            return await call_next(request)

        cookie_token = request.cookies.get(CSRF_COOKIE)
        header_token = request.headers.get(CSRF_HEADER)
        if not cookie_token or not header_token or cookie_token != header_token:
            return Response("CSRF validation failed", status_code=403)

        return await call_next(request)
