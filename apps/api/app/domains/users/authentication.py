from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from app.core.database import get_database
from app.core.security import verify_password
from app.domains.users.constants import IDENTITY_COLLATION
from app.domains.users.identity import identity_query


async def authenticate_user(identifier: str, password: str) -> dict:
    user = await get_database().users.find_one(
        identity_query(identifier, email=identifier),
        collation=IDENTITY_COLLATION,
    )
    if not user or not await run_in_threadpool(verify_password, password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect Credentials")
    return user
