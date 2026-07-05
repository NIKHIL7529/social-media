from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import hash_password, serialize_auth_user, verify_password
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc
from app.services.cloudinary_service import upload_image


PUBLIC_USER_PROJECTION = {"password": 0, "email": 0}


def normalize_username(value: str) -> str:
    normalized = value.strip().lower()
    if not normalized.replace("_", "").replace(".", "").isalnum():
        raise ValueError("Username can contain letters, numbers, dots, and underscores")
    return normalized


async def list_users() -> dict:
    users = await get_database().users.find({}, PUBLIC_USER_PROJECTION).to_list(length=500)
    return {"status": 200, "user": serialize_doc(users)}


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
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="Username or email already exists") from exc

    user["_id"] = result.inserted_id
    return {"status": 200, "user": serialize_auth_user(user)}


async def authenticate_user(identifier: str, password: str) -> dict:
    normalized = identifier.strip().lower()
    user = await get_database().users.find_one(
        {"$or": [{"name": normalized}, {"username": normalized}, {"email": normalized}]}
    )
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect Credentials")
    return user


async def update_profile(payload: dict, current_user: dict) -> tuple[dict, bool]:
    db = get_database()
    previous_username = current_user.get("username") or current_user["name"]
    next_username = payload["username"]
    existing = await db.users.find_one(
        {
            "_id": {"$ne": current_user["_id"]},
            "$or": [{"name": next_username}, {"username": next_username}],
        }
    )
    if existing:
        raise HTTPException(status_code=400, detail="User with this username already exist. Try again !!!")

    image = await upload_image(payload.get("photo", ""), "images") if payload.get("photo") else current_user.get("photo", "")
    update = {
        "name": next_username,
        "username": next_username,
        "dob": payload["dob"],
        "gender": payload["gender"],
        "city": payload.get("city", ""),
        "country": payload.get("country", ""),
        "description": payload.get("description", ""),
        "photo": image,
        "updatedAt": utc_now(),
    }
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update})
    username_changed = previous_username != next_username
    if username_changed:
        await update_username_references(previous_username, next_username)

    user = await db.users.find_one({"_id": current_user["_id"]})
    return user, username_changed


async def update_username_references(previous_username: str, next_username: str) -> None:
    db = get_database()
    await db.users.update_many({"followers": previous_username}, {"$set": {"followers.$": next_username}})
    await db.users.update_many({"followings": previous_username}, {"$set": {"followings.$": next_username}})
    await db.messages.update_many({"users": previous_username}, {"$set": {"users.$": next_username}})
    await db.groups.update_many({"users": previous_username}, {"$set": {"users.$": next_username}})
    await db.chatmessages.update_many({"sender": previous_username}, {"$set": {"sender": next_username}})
    await db.comments.update_many({"sender": previous_username}, {"$set": {"sender": next_username}})
    await db.posts.update_many(
        {"comments.sender": previous_username},
        {"$set": {"comments.$[comment].sender": next_username}},
        array_filters=[{"comment.sender": previous_username}],
    )


async def update_password(current_password: str, new_password: str, current_user: dict) -> dict:
    if not verify_password(current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(new_password), "updatedAt": utc_now()}},
    )
    return {"status": 200, "message": "Password updated"}


async def search_users(search_term: str, current_user: dict | None) -> dict:
    query: dict = {
        "$or": [
            {"name": {"$regex": search_term, "$options": "i"}},
            {"username": {"$regex": search_term, "$options": "i"}},
        ]
    }
    if current_user:
        query = {"$and": [query, {"_id": {"$ne": current_user["_id"]}}]}
    users = await get_database().users.find(query, {"name": 1, "username": 1, "photo": 1}).to_list(length=50)
    return {"status": 200, "message": "User found", "search_users": serialize_doc(users)}


async def get_user_by_id(user_id_value: str | None) -> dict:
    user_id = object_id_or_400(user_id_value, "Invalid user id")
    found = await get_database().users.find_one({"_id": user_id}, PUBLIC_USER_PROJECTION)
    if not found:
        raise HTTPException(status_code=404, detail="User Not Found")
    return {"status": 200, "message": "User data", "user": serialize_doc(found)}


async def get_user_by_name(user_name: str) -> dict:
    found = await get_database().users.find_one(
        {"$or": [{"name": user_name}, {"username": user_name}]},
        PUBLIC_USER_PROJECTION,
    )
    if not found:
        raise HTTPException(status_code=404, detail="User Not Found")
    return {"status": 200, "message": "User data", "user": serialize_doc(found)}


async def toggle_follow(target_user_name: str, current_user: dict) -> dict:
    db = get_database()
    target = await db.users.find_one({"$or": [{"name": target_user_name}, {"username": target_user_name}]})
    if not target:
        raise HTTPException(status_code=404, detail="User Not Found")
    if target["_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    profile_name = current_user["name"]
    target_name = target["name"]
    is_following = profile_name in target.get("followers", [])
    if is_following:
        await db.users.update_one({"_id": target["_id"]}, {"$pull": {"followers": profile_name}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"followings": target_name}})
    else:
        await db.users.update_one({"_id": target["_id"]}, {"$addToSet": {"followers": profile_name}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"followings": target_name}})

    updated = await db.users.find_one({"_id": target["_id"]}, PUBLIC_USER_PROJECTION)
    return {
        "status": 200,
        "message": "User unfollowed" if is_following else "User followed",
        "following": not is_following,
        "user": serialize_doc(updated),
    }
