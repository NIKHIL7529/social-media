from fastapi import HTTPException

from app.core.database import get_database
from app.core.time import utc_now
from app.domains.media.cloudinary import delete_image, upload_image
from app.domains.users.username_references import update_username_references


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

    has_new_photo = bool(payload.get("photo"))
    image = await upload_image(payload.get("photo", ""), "images") if has_new_photo else current_user.get("photo", "")
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
    if has_new_photo:
        await delete_image(current_user.get("photo", ""))
    username_changed = previous_username != next_username
    if username_changed:
        await update_username_references(previous_username, next_username)

    user = await db.users.find_one({"_id": current_user["_id"]})
    return user, username_changed
