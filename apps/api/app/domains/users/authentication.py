from fastapi import HTTPException

from app.core.database import get_database
from app.core.security import verify_password


async def authenticate_user(identifier: str, password: str) -> dict:
    normalized = identifier.strip().lower()
    user = await get_database().users.find_one(
        {"$or": [{"name": normalized}, {"username": normalized}, {"email": normalized}]}
    )
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect Credentials")
    return user
