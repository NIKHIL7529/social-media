from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import hash_password, serialize_auth_user
from app.core.time import utc_now
from app.domains.media.cloudinary import delete_image, upload_image
from app.domains.users.constants import IDENTITY_COLLATION
from app.domains.users.identity import identity_query


async def create_user(payload: dict) -> dict:
    db = get_database()
    email = str(payload["email"])
    username = payload["username"]
    if await db.users.find_one(
        identity_query(username, email=email),
        {"_id": 1},
        collation=IDENTITY_COLLATION,
    ):
        raise HTTPException(status_code=400, detail="Username or email already exists")

    image = await upload_image(payload.get("photo", ""), "images") if payload.get("photo") else ""
    user = await build_user_document(payload, image)

    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError as exc:
        if image:
            await delete_image(image)
        raise HTTPException(status_code=400, detail="Username or email already exists") from exc

    user["_id"] = result.inserted_id
    return {"status": 200, "user": serialize_auth_user(user)}


async def build_user_document(payload: dict, photo: str = "") -> dict:
    """Build the same account fields for signup and seed data."""
    now = utc_now()
    return {
        "name": payload["username"],
        "username": payload["username"],
        "email": str(payload["email"]),
        "dob": payload["dob"],
        "gender": payload["gender"],
        "password": await run_in_threadpool(hash_password, payload["password"]),
        "city": payload.get("city", ""),
        "country": payload.get("country", ""),
        "description": payload.get("description", ""),
        "photo": photo,
        "followers": [],
        "followings": [],
        "saved": [],
        "liked": [],
        "createdAt": now,
        "updatedAt": now,
    }
