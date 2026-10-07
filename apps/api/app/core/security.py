from datetime import datetime, timedelta, timezone
from typing import Annotated

from bson import ObjectId
import bcrypt
from fastapi import Cookie, Depends, HTTPException, Request, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.database import get_database
from app.schemas.common import serialize_doc

MAX_BCRYPT_BYTES = 72


def _bcrypt_bytes(password: str) -> bytes:
    encoded = password.encode("utf-8")
    if len(encoded) > MAX_BCRYPT_BYTES:
        raise ValueError(f"Password must be at most {MAX_BCRYPT_BYTES} UTF-8 bytes")
    return encoded


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_bcrypt_bytes(password), bcrypt.gensalt(rounds=10)).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_bcrypt_bytes(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: ObjectId, name: str) -> str:
    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=60)
    return jwt.encode(
        {"id": str(user_id), "name": name, "exp": expires_at},
        settings.secret_key,
        algorithm="HS256",
    )


async def get_current_user(token: Annotated[str | None, Cookie()] = None) -> dict:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
    )
    if not token:
        raise credentials_error

    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id or not ObjectId.is_valid(user_id):
            raise credentials_error
    except JWTError as exc:
        raise credentials_error from exc

    user = await get_database().users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise credentials_error
    return user


async def get_optional_user(token: Annotated[str | None, Cookie()] = None) -> dict | None:
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None


def serialize_auth_user(user: dict, include_email: bool = True) -> dict:
    blocked = {"password"}
    if not include_email:
        blocked.add("email")
    safe_user = {key: value for key, value in user.items() if key not in blocked}
    if "username" not in safe_user and safe_user.get("name"):
        safe_user["username"] = safe_user["name"]
    return serialize_doc(safe_user)


def auth_cookie_options(request: Request) -> dict:
    settings = get_settings()
    return {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": "none" if settings.cookie_secure else "lax",
        "path": "/",
        "max_age": 60 * 60 * 60,
    }
