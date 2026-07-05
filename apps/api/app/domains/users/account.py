from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import hash_password, serialize_auth_user
from app.core.time import utc_now
from app.domains.media.cloudinary import upload_image


async def create_user(payload: dict) -> dict:
    db = get_database()
    email = str(payload["email"]).lower()
    username = payload["username"]
    if await db.users.find_one({"$or": [{"name": username}, {"username": username}, {"email": email}]}):
        raise HTTPException(status_code=400, detail="Username or email already exists")

    image = await upload_image(payload.get("photo", ""), "images") if payload.get("photo") else ""
    now = utc_now()
    user = {
        "name": username,
        "username": username,
        "email": email,
        "dob": payload["dob"],
        "gender": payload["gender"],
        "password": hash_password(payload["password"]),
        "city": payload.get("city", ""),
        "country": payload.get("country", ""),
        "description": payload.get("description", ""),
        "photo": image,
        "followers": [],
        "followings": [],
        "saved": [],
        "liked": [],
        "sessionVersion": 1,
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="Username or email already exists") from exc

    user["_id"] = result.inserted_id
    return {"status": 200, "user": serialize_auth_user(user)}
