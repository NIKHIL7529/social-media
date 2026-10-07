from fastapi import HTTPException

from app.core.database import get_database
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc
from app.domains.users.constants import IDENTITY_COLLATION, PUBLIC_USER_PROJECTION
from app.domains.users.identity import identity_query


async def list_users() -> dict:
    users = await get_database().users.find({}, PUBLIC_USER_PROJECTION).to_list(length=500)
    return {"status": 200, "user": serialize_doc(users)}


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
        identity_query(user_name),
        PUBLIC_USER_PROJECTION,
        collation=IDENTITY_COLLATION,
    )
    if not found:
        raise HTTPException(status_code=404, detail="User Not Found")
    return {"status": 200, "message": "User data", "user": serialize_doc(found)}
