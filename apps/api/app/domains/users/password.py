from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from app.core.database import get_database
from app.core.security import hash_password, verify_password
from app.core.time import utc_now


async def update_password(current_password: str, new_password: str, current_user: dict) -> dict:
    if not await run_in_threadpool(verify_password, current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": await run_in_threadpool(hash_password, new_password), "updatedAt": utc_now()}},
    )
    return {"status": 200, "message": "Password updated"}
