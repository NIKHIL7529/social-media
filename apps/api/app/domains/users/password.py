from fastapi import HTTPException

from app.core.database import get_database
from app.core.security import hash_password, verify_password
from app.core.time import utc_now


async def update_password(current_password: str, new_password: str, current_user: dict) -> dict:
    if not verify_password(current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(new_password), "updatedAt": utc_now()}, "$inc": {"sessionVersion": 1}},
    )
    return {"status": 200, "message": "Password updated"}
