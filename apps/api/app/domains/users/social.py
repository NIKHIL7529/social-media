from fastapi import HTTPException

from app.core.database import get_database
from app.schemas.common import serialize_doc
from app.domains.users.constants import IDENTITY_COLLATION, PUBLIC_USER_PROJECTION
from app.domains.users.identity import identity_query


async def toggle_follow(target_user_name: str, current_user: dict) -> dict:
    db = get_database()
    target = await db.users.find_one(
        identity_query(target_user_name),
        {"name": 1},
        collation=IDENTITY_COLLATION,
    )
    if not target:
        raise HTTPException(status_code=404, detail="User Not Found")
    if target["_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    profile_name = current_user["name"]
    target_name = target["name"]
    removed = await db.users.update_one({"_id": target["_id"], "followers": profile_name}, {"$pull": {"followers": profile_name}})
    if removed.modified_count:
        following = False
    else:
        added = await db.users.update_one(
            {"_id": target["_id"], "followers": {"$ne": profile_name}},
            {"$addToSet": {"followers": profile_name}},
        )
        following = True
        if not added.modified_count:
            refreshed = await db.users.find_one({"_id": target["_id"]}, {"followers": 1})
            following = profile_name in (refreshed or {}).get("followers", [])

    current_update = {"$addToSet": {"followings": target_name}} if following else {"$pull": {"followings": target_name}}
    await db.users.update_one({"_id": current_user["_id"]}, current_update)

    updated = await db.users.find_one({"_id": target["_id"]}, PUBLIC_USER_PROJECTION)
    return {
        "status": 200,
        "message": "User followed" if following else "User unfollowed",
        "following": following,
        "user": serialize_doc(updated),
    }
